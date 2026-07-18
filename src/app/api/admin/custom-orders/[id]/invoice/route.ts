import { NextResponse, after } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin, checkAdminCsrf } from "@/lib/security/auth";
import { getStripe } from "@/lib/payments/stripe";
import { sendCustomInvoiceEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Hosted invoices stay payable this many days. */
const INVOICE_DUE_DAYS = 7;

const schema = z.object({
  /** Agreed price in whole USD (master ↔ customer phone agreement). */
  amount: z.number().min(1).max(99_999),
  /** Optional line-item description override shown on the Stripe page. */
  description: z.string().trim().max(300).optional(),
});

/**
 * Issue a Stripe hosted invoice for a custom-order request.
 *
 * Flow: customer submits /custom-order → the master calls back and
 * agrees a price → the admin enters that price here → we create a
 * finalized Stripe invoice and email the customer a branded message
 * with the hosted payment link. The `invoice.paid` webhook flips the
 * request to CONVERTED.
 *
 * Re-issuing: if an unpaid invoice already exists it is voided first,
 * so at most one payable invoice is live per request.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!checkAdminCsrf(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripe = await getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "stripe_not_configured" },
      { status: 503 },
    );
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const req = await prisma.customOrderRequest.findUnique({ where: { id } });
  if (!req) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (req.invoicePaidAt) {
    return NextResponse.json({ error: "already_paid" }, { status: 409 });
  }

  const car = `${req.make} ${req.model} ${req.year}`.trim();
  const amountUsd = Math.round(parsed.data.amount * 100) / 100;
  const description =
    parsed.data.description ||
    `Custom EVA mat set — ${car}${req.matSet ? ` (${req.matSet})` : ""}`;

  try {
    // Void the previous unpaid invoice so two payable invoices for the
    // same request can't coexist (double-payment guard). This must be a
    // hard gate: if Stripe can't tell us the previous invoice's status,
    // re-issuing blindly could leave two payable invoices live.
    if (req.stripeInvoiceId) {
      const prev = await stripe.invoices.retrieve(req.stripeInvoiceId);
      if (prev.status === "paid") {
        // Customer paid moments ago and the `invoice.paid` webhook hasn't
        // landed yet — a second invoice here would be a double payment.
        // Backfill what the webhook would have written.
        await prisma.customOrderRequest.updateMany({
          where: { id: req.id, invoicePaidAt: null },
          data: { invoicePaidAt: new Date(), status: "CONVERTED" },
        });
        return NextResponse.json({ error: "already_paid" }, { status: 409 });
      }
      if (prev.status === "draft") {
        // Drafts can't be voided — Stripe requires deletion.
        await stripe.invoices.del(req.stripeInvoiceId);
      } else if (prev.status === "open") {
        await stripe.invoices.voidInvoice(req.stripeInvoiceId);
      }
    }

    // Reuse the Stripe customer by email — repeated invoices/orders for
    // the same person collapse into one customer record in the Dashboard.
    const existing = await stripe.customers.list({
      email: req.email,
      limit: 1,
    });
    const customer =
      existing.data[0] ??
      (await stripe.customers.create({
        email: req.email,
        name: req.name,
        phone: req.phone || undefined,
      }));

    // send_invoice + days_until_due gives a hosted page that stays
    // payable for a week — Checkout sessions cap at 24h, too short for
    // an emailed invoice. auto_advance=false: WE send the branded email,
    // Stripe's own invoice email stays off.
    const invoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: "send_invoice",
      days_until_due: INVOICE_DUE_DAYS,
      currency: "usd",
      auto_advance: false,
      description,
      metadata: { customOrderId: req.id },
    });

    await stripe.invoiceItems.create({
      customer: customer.id,
      invoice: invoice.id,
      amount: Math.round(amountUsd * 100),
      currency: "usd",
      description,
    });

    const finalized = await stripe.invoices.finalizeInvoice(invoice.id!);
    const invoiceUrl = finalized.hosted_invoice_url;
    if (!invoiceUrl) {
      throw new Error("Stripe did not return a hosted invoice URL");
    }

    const updated = await prisma.customOrderRequest.update({
      where: { id: req.id },
      data: {
        invoiceAmount: amountUsd,
        stripeInvoiceId: finalized.id,
        invoiceUrl,
        invoiceSentAt: new Date(),
        // Invoice out the door = the request is officially QUOTED
        // (NEW or already-CONTACTED — the master called first).
        status:
          req.status === "NEW" || req.status === "CONTACTED"
            ? "QUOTED"
            : req.status,
      },
    });

    // Branded email with the payment link — deferred so a Resend hiccup
    // can't fail the request after the invoice already exists. The
    // hosted URL is also shown in the admin UI as a fallback.
    after(() =>
      sendCustomInvoiceEmail({
        customerName: req.name,
        customerEmail: req.email,
        car,
        amountUsd,
        invoiceUrl,
        dueDays: INVOICE_DUE_DAYS,
        locale: req.locale,
      }).catch((err) =>
        console.error("[custom-invoice] email failed:", err),
      ),
    );

    return NextResponse.json({
      request: {
        id: updated.id,
        status: updated.status,
        invoiceAmount: Number(updated.invoiceAmount ?? 0),
        invoiceUrl: updated.invoiceUrl,
        invoiceSentAt: updated.invoiceSentAt?.toISOString() ?? null,
        invoicePaidAt: updated.invoicePaidAt?.toISOString() ?? null,
      },
    });
  } catch (err) {
    console.error("[custom-invoice] create failed:", err);
    return NextResponse.json({ error: "invoice_failed" }, { status: 502 });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { verifyOrderToken } from "@/lib/security/order-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Review photos live in Vercel Blob — accept only URLs pointing there so
// the public form can't be used to embed arbitrary third-party images.
const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

const Body = z.object({
  name: z.string().trim().min(2).max(80),
  carModel: z.string().trim().min(2).max(120),
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(10).max(3000),
  // Optional — used only for the thank-you promo code, never displayed.
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  photos: z
    .array(
      z
        .string()
        .url()
        .max(500)
        .refine(
          (u) => {
            try {
              return new URL(u).hostname.endsWith(BLOB_HOST_SUFFIX);
            } catch {
              return false;
            }
          },
          { message: "Photo must be an uploaded image" },
        ),
    )
    .max(3)
    .optional()
    .default([]),
  // Present when the customer followed the post-delivery email link —
  // proves a real purchase and flips the "verified buyer" badge.
  orderNumber: z.string().trim().max(40).optional().or(z.literal("")),
  orderToken: z.string().trim().max(128).optional().or(z.literal("")),
});

export async function POST(request: Request) {
  // 3 reviews per hour per IP — a real person leaves one.
  const ip = getClientIp(request);
  const rl = await rateLimit(`review:${ip}`, { windowMs: 60 * 60_000, max: 3 });
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many submissions. Try again later." },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 },
    );
  }

  const parsed = Body.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid input" },
      { status: 400 },
    );
  }
  const d = parsed.data;

  // Verified-buyer path: the emailed link carries the order's HMAC token.
  // An invalid token silently downgrades to a regular (unverified) review
  // rather than failing — the customer shouldn't be blocked by a stale
  // link when they're trying to say something nice.
  let verified = false;
  let orderId: string | null = null;
  if (d.orderNumber && d.orderToken) {
    try {
      const order = await prisma.order.findUnique({
        where: { orderNumber: d.orderNumber },
        select: { id: true },
      });
      if (order && verifyOrderToken(order.id, d.orderToken)) {
        verified = true;
        orderId = order.id;
        // One verified review per order — a second submission through the
        // same link stays a regular review so the badge can't be farmed.
        const existing = await prisma.review.findFirst({
          where: { orderId: order.id },
          select: { id: true },
        });
        if (existing) {
          verified = false;
          orderId = null;
        }
      }
    } catch (err) {
      console.error("[api/reviews] order lookup failed:", err);
    }
  }

  try {
    const review = await prisma.review.create({
      data: {
        customerName: d.name,
        carModel: d.carModel,
        rating: d.rating,
        text: d.text,
        photos: d.photos,
        email: d.email || null,
        verified,
        orderId,
        approved: false,
      },
      select: { id: true },
    });
    console.log(
      `[api/reviews] new review ${review.id} rating=${d.rating} verified=${verified} photos=${d.photos.length}`,
    );
    return NextResponse.json({ ok: true, id: review.id });
  } catch (err) {
    console.error("[api/reviews] create failed:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to save review" },
      { status: 500 },
    );
  }
}

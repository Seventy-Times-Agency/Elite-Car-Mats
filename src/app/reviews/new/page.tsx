import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { verifyOrderToken } from "@/lib/security/order-token";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";
import { ReviewForm } from "./ReviewForm";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  return { title: t("revs.formTitle"), robots: { index: false } };
}

/**
 * Public review form. When reached from the post-delivery email the URL
 * carries ?order=<number>&t=<hmac> — we verify server-side, pre-fill the
 * customer's name and car, and pass the pair through so the API can flag
 * the review "verified buyer". Reached bare (header/reviews page), it's
 * just an empty form.
 */
export default async function NewReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; t?: string }>;
}) {
  const sp = await searchParams;
  const orderNumber = (sp.order ?? "").slice(0, 40);
  const orderToken = (sp.t ?? "").slice(0, 128);

  let prefillName = "";
  let prefillCar = "";
  let verifiedLink = false;

  if (orderNumber && orderToken) {
    try {
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        select: {
          id: true,
          customerName: true,
          items: {
            take: 1,
            select: {
              year: true,
              product: {
                select: {
                  model: { select: { name: true, brand: { select: { name: true } } } },
                },
              },
            },
          },
        },
      });
      if (order && verifyOrderToken(order.id, orderToken)) {
        verifiedLink = true;
        prefillName = order.customerName;
        const it = order.items[0];
        if (it) {
          prefillCar = `${it.product.model.brand.name} ${it.product.model.name}${it.year ? ` ${it.year}` : ""}`;
        }
      }
    } catch (err) {
      console.error("[reviews/new] prefill failed:", err);
    }
  }

  return (
    <ReviewForm
      prefillName={prefillName}
      prefillCar={prefillCar}
      orderNumber={verifiedLink ? orderNumber : ""}
      orderToken={verifiedLink ? orderToken : ""}
      photosEnabled={Boolean(process.env.BLOB_READ_WRITE_TOKEN)}
    />
  );
}

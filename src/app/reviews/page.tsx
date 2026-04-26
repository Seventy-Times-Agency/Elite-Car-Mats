import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";

export const dynamic = "force-dynamic";
export const revalidate = 60;

interface PublicReview {
  id: string;
  customerName: string;
  carModel: string;
  text: string;
  rating: number;
  createdAt: string;
}

async function loadReviews(): Promise<PublicReview[]> {
  try {
    const rows = await prisma.review.findMany({
      where: { approved: true },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        customerName: true,
        carModel: true,
        text: true,
        rating: true,
        createdAt: true,
      },
    });
    return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
  } catch (err) {
    console.error("[reviews] load failed:", err);
    return [];
  }
}

function Stars({ value }: { value: number }) {
  const filled = Math.max(0, Math.min(5, value));
  return (
    <div className="flex gap-0.5" aria-label={`${filled}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={`w-3.5 h-3.5 ${i < filled ? "fill-gold" : "fill-border"}`}
          aria-hidden
        >
          <path d="M12 2l2.9 6.9 7.4.6-5.6 4.9 1.7 7.3L12 17.8l-6.4 3.9 1.7-7.3L1.7 9.5l7.4-.6L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default async function ReviewsPage() {
  const reviews = await loadReviews();
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);

  const avg =
    reviews.length === 0
      ? 0
      : reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <div className="py-16 lg:py-24 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="section-label">{t("revs.label")}</span>
          <h1 className="mt-4 text-3xl lg:text-4xl font-bold">
            {t("revs.title")}
          </h1>
          <p className="mt-3 text-text-dim text-base">{t("revs.subtitle")}</p>
          {reviews.length > 0 && (
            <div className="mt-6 inline-flex items-center gap-3 glass-card rounded-xl px-5 py-3">
              <Stars value={Math.round(avg)} />
              <span className="text-gold font-semibold text-sm">
                {avg.toFixed(1)}
              </span>
              <span className="text-text-faint text-xs">
                · {t("revs.basedOn", { n: String(reviews.length) })}
              </span>
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center">
            <h2 className="text-lg font-semibold mb-2">{t("revs.emptyTitle")}</h2>
            <p className="text-text-dim text-sm mb-6 max-w-md mx-auto">
              {t("revs.emptyBody")}
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-gold to-gold-light text-bg text-xs font-semibold tracking-wider uppercase px-5 py-2.5 rounded-lg shadow-[0_2px_12px_rgba(212,165,74,0.25)]"
            >
              {t("revs.emptyCta")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {reviews.map((r) => (
              <article
                key={r.id}
                className="glass-card rounded-2xl p-6 flex flex-col"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="text-text font-semibold text-sm">
                      {r.customerName}
                    </div>
                    <div className="text-text-faint text-[11px] mt-0.5">
                      {r.carModel}
                    </div>
                  </div>
                  <Stars value={r.rating} />
                </div>
                <p className="text-text-dim text-sm leading-relaxed flex-1 whitespace-pre-line">
                  {r.text}
                </p>
                <div className="mt-4 text-text-faint text-[10px] uppercase tracking-[0.15em]">
                  {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

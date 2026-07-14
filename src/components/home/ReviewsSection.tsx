import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";

/**
 * Home-page strip with the three latest approved reviews. Server
 * component — renders nothing at all until the first review is approved,
 * so the empty shop doesn't advertise an empty reviews page.
 */
export async function ReviewsSection() {
  let reviews: {
    id: string;
    customerName: string;
    carModel: string;
    text: string;
    rating: number;
    verified: boolean;
  }[] = [];
  let total = 0;
  let avg = 0;
  try {
    const [rows, agg] = await Promise.all([
      prisma.review.findMany({
        where: { approved: true },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          customerName: true,
          carModel: true,
          text: true,
          rating: true,
          verified: true,
        },
      }),
      prisma.review.aggregate({
        where: { approved: true },
        _count: { _all: true },
        _avg: { rating: true },
      }),
    ]);
    reviews = rows;
    total = agg._count._all;
    avg = agg._avg.rating ?? 0;
  } catch (err) {
    console.error("[home-reviews] load failed:", err);
    return null;
  }
  if (reviews.length === 0) return null;

  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);

  return (
    <section className="py-14 lg:py-20 relative">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-10 gap-6">
          <div>
            <span className="section-label">{t("revs.label")}</span>
            <h2 className="mt-4 text-3xl lg:text-4xl font-bold">
              {t("revs.homeTitle")}
            </h2>
            <div className="mt-3 flex items-center gap-2 text-sm text-text-dim">
              <span className="text-gold font-semibold">{avg.toFixed(1)}</span>
              <span className="text-gold" aria-hidden>
                {"★".repeat(Math.round(avg))}
              </span>
              <span className="text-text-faint text-xs">
                · {t("revs.basedOn", { n: String(total) })}
              </span>
            </div>
          </div>
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 text-gold hover:text-gold-light text-sm uppercase tracking-[0.15em] font-medium transition-colors shrink-0"
          >
            {t("revs.homeAll")}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reviews.map((r) => (
            <article key={r.id} className="glass-card rounded-2xl p-6 flex flex-col">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="text-text font-semibold text-sm truncate">
                    {r.customerName}
                  </div>
                  <div className="text-text-faint text-[11px] mt-0.5 truncate">
                    {r.carModel}
                  </div>
                </div>
                <span className="text-gold text-xs shrink-0" aria-label={`${r.rating}/5`}>
                  {"★".repeat(r.rating)}
                </span>
              </div>
              <p className="text-text-dim text-sm leading-relaxed line-clamp-4">
                {r.text}
              </p>
              {r.verified && (
                <div className="mt-3 text-[10px] uppercase tracking-wider text-gold/80">
                  ✓ {t("revs.verified")}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

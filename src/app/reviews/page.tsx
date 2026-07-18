import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";
import { jsonLdString } from "@/lib/seo/json-ld";

// force-dynamic and `revalidate` are mutually exclusive — the page is
// per-request anyway (locale cookie), so the stale revalidate is dropped.
export const dynamic = "force-dynamic";

interface PublicReview {
  id: string;
  customerName: string;
  carModel: string;
  text: string;
  rating: number;
  verified: boolean;
  photos: string[];
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
        verified: true,
        photos: true,
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

function VerifiedBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-gold/30 text-gold/90 bg-gold/5">
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path d="M12 1.5l2.8 2.1 3.5-.3 1 3.4 3 1.8-1.3 3.3 1.3 3.3-3 1.8-1 3.4-3.5-.3-2.8 2.1-2.8-2.1-3.5.3-1-3.4-3-1.8L3 11.8 1.7 8.5l3-1.8 1-3.4 3.5.3L12 1.5zm-1.2 13.6l5.4-5.4-1.4-1.4-4 4-1.8-1.8-1.4 1.4 3.2 3.2z" />
      </svg>
      {label}
    </span>
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
      {reviews.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdString({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Elite Car Mats",
              url: "https://elitecarmats.us",
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: Number(avg.toFixed(1)),
                reviewCount: reviews.length,
                bestRating: 5,
                worstRating: 1,
              },
            }),
          }}
        />
      )}
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
          <div className="mt-6">
            <Link
              href="/reviews/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-gold to-gold-light text-bg text-xs font-semibold tracking-[0.15em] uppercase px-6 py-3 rounded-lg shadow-[0_4px_20px_rgba(212,165,74,0.25)]"
            >
              {t("revs.writeCta")}
            </Link>
          </div>
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
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-text font-semibold text-sm">
                        {r.customerName}
                      </span>
                      {r.verified && <VerifiedBadge label={t("revs.verified")} />}
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
                {r.photos.length > 0 && (
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {r.photos.map((url, idx) => (
                      <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={t("revs.photoAlt", { name: r.customerName })}
                          loading="lazy"
                          className="w-20 h-20 rounded-lg object-cover border border-border/40 hover:border-gold/40 transition-colors"
                        />
                      </a>
                    ))}
                  </div>
                )}
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

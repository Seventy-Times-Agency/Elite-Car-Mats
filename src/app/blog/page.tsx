import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { listPublishedPosts } from "@/lib/blog";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";
import { localeAlternates } from "@/lib/seo/alternates";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  return {
    title: t("blog.metaTitle"),
    description: t("blog.metaDesc"),
    alternates: await localeAlternates("/blog"),
  };
}

function formatDate(iso: string | Date | null, locale: string): string {
  if (!iso) return "";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString(locale === "uk" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogIndexPage() {
  const { locale, dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  const posts = await listPublishedPosts(locale);

  return (
    <div className="py-14 lg:py-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 lg:mb-14">
          <span className="section-label">{t("blog.label")}</span>
          <h1 className="mt-4 text-3xl lg:text-4xl font-bold">
            {t("blog.heading")}
          </h1>
          <p className="mt-3 text-text-dim text-sm">{t("blog.intro")}</p>
        </div>

        {posts.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <p className="text-text-dim">{t("blog.empty")}</p>
            <Link
              href="/catalog"
              className="mt-5 inline-flex items-center text-gold text-sm hover:text-gold-light"
            >
              {t("blog.browseInstead")} →
            </Link>
          </div>
        ) : (
          <ul className="space-y-5">
            {posts.map((p) => (
              <li
                key={p.id}
                className="glass-card glow-hover rounded-xl overflow-hidden"
              >
                <Link
                  href={`/blog/${p.slug}`}
                  className="flex flex-col sm:flex-row gap-0 sm:gap-5"
                >
                  {p.coverImage && (
                    <div className="relative w-full sm:w-44 h-44 sm:h-auto shrink-0 bg-surface/40">
                      <Image
                        src={p.coverImage}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, 176px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 p-5 sm:py-5 sm:pr-5 sm:pl-0">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gold/70 font-semibold">
                      {formatDate(p.publishedAt, locale)}
                    </p>
                    <h2 className="mt-2 text-lg lg:text-xl font-bold leading-tight text-text">
                      {p.title}
                    </h2>
                    <p className="mt-2 text-text-dim text-sm leading-relaxed line-clamp-3">
                      {p.excerpt}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-gold text-xs font-semibold tracking-wider uppercase">
                      {t("blog.readMore")} →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

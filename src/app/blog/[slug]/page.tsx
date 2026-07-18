import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPublishedPost } from "@/lib/blog";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";
import { renderMarkdown } from "@/lib/markdown";
import { BreadcrumbJsonLd } from "@/components/seo/ProductJsonLd";
import { localeAlternates } from "@/lib/seo/alternates";

export const dynamic = "force-dynamic";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elitecarmats.us";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const { locale, dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  const post = await getPublishedPost(slug, locale);
  if (!post) return { title: t("blog.notFoundMeta") };

  return {
    title: post.title,
    description: post.excerpt,
    // hreflang alternates only when the post really exists in all three
    // locales (locale=null renders everywhere). A locale-bound post 404s
    // on the other two prefixes — advertising them as translations sends
    // crawlers to dead URLs.
    alternates: post.locale
      ? {
          canonical:
            post.locale === "en"
              ? `${SITE}/blog/${post.slug}`
              : `${SITE}/${post.locale}/blog/${post.slug}`,
        }
      : await localeAlternates(`/blog/${post.slug}`),
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : undefined,
      publishedTime: post.publishedAt?.toISOString(),
    },
  };
}

function formatDate(iso: Date | null, locale: string): string {
  if (!iso) return "";
  return iso.toLocaleDateString(
    locale === "uk" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  );
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const { locale, dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  const post = await getPublishedPost(slug, locale);
  if (!post) notFound();

  const html = renderMarkdown(post.content);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage ? [post.coverImage] : undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE}/blog/${post.slug}`,
    },
    author: { "@type": "Organization", name: "Elite Car Mats" },
    publisher: {
      "@type": "Organization",
      name: "Elite Car Mats",
      logo: {
        "@type": "ImageObject",
        url: `${SITE}/icon`,
      },
    },
  };

  return (
    <article className="py-10 lg:py-16 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: t("blog.label"), url: "/blog" },
          { name: post.title, url: `/blog/${post.slug}` },
        ]}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-xs text-text-dim mb-6">
          <Link href="/blog" className="hover:text-gold transition-colors">
            ← {t("blog.label")}
          </Link>
        </nav>

        <p className="text-[10px] uppercase tracking-[0.2em] text-gold/70 font-semibold">
          {formatDate(post.publishedAt, locale)}
        </p>
        <h1 className="mt-2 text-3xl lg:text-4xl font-bold leading-tight">
          {post.title}
        </h1>
        <p className="mt-4 text-lg text-text-dim leading-relaxed">
          {post.excerpt}
        </p>

        {post.coverImage && (
          <div className="mt-8 relative aspect-[16/9] rounded-xl overflow-hidden bg-surface/40">
            <Image
              src={post.coverImage}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div
          className="prose-content mt-10 text-[15px] leading-relaxed text-text"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <div className="mt-14 pt-8 border-t border-border/40 text-center">
          <p className="text-text-dim text-sm">{t("blog.ctaTagline")}</p>
          <Link
            href="/catalog"
            className="mt-4 inline-flex items-center gap-1.5 bg-gradient-to-r from-gold to-gold-light text-bg text-xs font-semibold tracking-[0.15em] uppercase px-5 py-2.5 rounded-lg shadow-[0_2px_14px_rgba(212,165,74,0.3)] hover:shadow-[0_4px_22px_rgba(212,165,74,0.45)] transition-all"
          >
            {t("blog.ctaButton")}
          </Link>
        </div>
      </div>
    </article>
  );
}

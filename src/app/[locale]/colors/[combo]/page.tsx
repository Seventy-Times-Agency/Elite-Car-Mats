import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  COLOR_COMBOS,
  colorComboFeedId,
  parseColorCombo,
  type ColorCombo,
} from "@/data/catalog/color-combos";
import { edgeColors } from "@/data/catalog/colors";
import { MAT_SETS_BY_PROFILE } from "@/data/catalog/mat-sets";
import { CarSelectorSection } from "@/components/home/CarSelectorSection";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT, type TFn } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";
import { localizeColor, localizeMatSet } from "@/i18n/labels";
import { localeAlternates } from "@/lib/seo/alternates";
import { ComboFromPrice, ComboViewContent } from "./ColorComboClient";

// Landing for the Facebook / Instagram shop cards (/api/feed-meta.xml):
// the shopper arrives with a colour pair and picks the car here. Pure
// code data, no database — prerendered for every combo × locale.
export const dynamicParams = false;

export function generateStaticParams() {
  return COLOR_COMBOS.map((c) => ({ combo: c.slug }));
}

interface Params {
  params: Promise<{ combo: string }>;
}

function colorVars(t: TFn, locale: Locale, combo: ColorCombo) {
  const eva = localizeColor(t, combo.eva.name);
  const edge = localizeColor(t, combo.edge.name);
  return {
    eva,
    edge,
    evaLc: eva.toLocaleLowerCase(locale),
    edgeLc: edge.toLocaleLowerCase(locale),
  };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { combo: slug } = await params;
  const combo = parseColorCombo(slug);
  if (!combo) return {};
  const { locale, dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  const vars = colorVars(t, locale, combo);
  const title = t("colors.metaTitle", vars);
  const description = t("colors.metaDesc", vars);
  return {
    title,
    description,
    alternates: await localeAlternates(`/colors/${combo.slug}`),
    openGraph: {
      type: "website",
      title,
      description,
      images: [{ url: `/mats/${combo.slug}.jpg`, width: 1400, height: 1400 }],
    },
  };
}

export default async function ColorComboPage({ params }: Params) {
  const { combo: slug } = await params;
  const combo = parseColorCombo(slug);
  if (!combo) notFound();

  const { locale, dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  const vars = colorVars(t, locale, combo);
  const heading = t("colors.heading", vars);
  const fullSet = MAT_SETS_BY_PROFILE.standard.find((s) => s.type === "full");

  return (
    <div className="pt-8 lg:pt-14">
      <ComboViewContent
        feedId={colorComboFeedId(combo.eva.id, combo.edge.id)}
        contentName={`${vars.eva} / ${vars.edge}`}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          <div className="glass-card rounded-2xl overflow-hidden aspect-square relative w-full max-w-[440px] mx-auto lg:max-w-none">
            <Image
              src={`/mats/${combo.slug}.jpg`}
              alt={t("prod.photoAlt", { color: vars.evaLc, edge: vars.edgeLc })}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="text-center lg:text-left">
            <h1 className="text-3xl lg:text-5xl font-bold tracking-tight">
              {heading}
            </h1>
            <p className="mt-3 text-text-dim text-sm lg:text-base">
              {t("colors.sub")}
            </p>
            <div className="mt-5 flex items-baseline justify-center lg:justify-start gap-3">
              <ComboFromPrice />
              {fullSet && (
                <span className="text-xs text-text-faint">
                  {localizeMatSet(t, fullSet.label)}
                </span>
              )}
            </div>
            <ul className="mt-5 space-y-2 text-sm text-text-dim inline-block text-left">
              {["colors.p1", "colors.p2", "colors.p3"].map((key) => (
                <li key={key} className="flex gap-3">
                  <span className="text-gold" aria-hidden>
                    ✓
                  </span>
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <CarSelectorSection
        colorPreset={{ eva: combo.eva.id, edge: combo.edge.id }}
      />

      <section className="pb-12 lg:pb-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="text-[10px] uppercase tracking-[0.2em] text-text-faint mb-3">
            {t("colors.otherTrims")}
          </div>
          <div className="flex flex-wrap justify-center gap-2.5">
            {edgeColors.map((e) => {
              const active = e.id === combo.edge.id;
              const name = localizeColor(t, e.name);
              return (
                <Link
                  key={e.id}
                  href={`/colors/${combo.eva.id}-${e.id}`}
                  aria-label={name}
                  aria-current={active ? "page" : undefined}
                  title={name}
                  className={`w-9 h-9 rounded-lg overflow-hidden transition-all ${
                    active
                      ? "ring-2 ring-gold ring-offset-2 ring-offset-bg"
                      : "ring-1 ring-border/60 hover:ring-gold/45"
                  }`}
                  style={{
                    backgroundColor: e.hex,
                    backgroundImage: `url(/swatches/edge-${e.id}.jpg)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

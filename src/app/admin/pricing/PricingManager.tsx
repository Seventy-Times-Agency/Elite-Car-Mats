"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n/I18nProvider";
import { localizeMatSet, localizeMatSetDesc } from "@/i18n/labels";
import { formatPrice } from "@/lib/pricing";

export interface PriceRowData {
  /** `${profile}:${matSet}` — also the price-override key. */
  id: string;
  icon: string;
  /** Mat sets carry the Russian catalog label/description (localised here). */
  setLabel?: string;
  setDesc?: string;
  /** Add-ons and accessories come already translated. */
  name?: string;
  price: { profile: string; matSet: string; value: number };
  /** Own shipping fee; absent = ships inside the set (add-ons). */
  shipping?: { key: string; value: number };
  availability?: { key: "badges" | "heelPad" | "organizer"; value: boolean };
  /** Complete set: price ids of its parts, to show the bundle saving. */
  bundleParts?: { cabin: string; cargo: string };
}

export interface PriceSection {
  id: string;
  title: string;
  note?: string;
  rows: PriceRowData[];
}

type Draft = { price: string; ship: string };

const money = (v: string): number | null => {
  const n = Number(v.replace(",", ".").trim());
  return v.trim() !== "" && Number.isFinite(n) && n >= 0 && n <= 99_999
    ? Math.round(n * 100) / 100
    : null;
};

async function saveOverride(profile: string, matSet: string, price: number | null) {
  const res = await fetch("/api/admin/pricing", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-csrf": "1" },
    body: JSON.stringify({ profile, matSet, price }),
  });
  return res.ok;
}

/**
 * Price list the way a shop owner thinks about it: product, price,
 * shipping — type a number, save. No "code default vs override": the
 * number shown is the number customers pay.
 */
export function PricingManager({
  sections,
  shipping,
}: {
  sections: PriceSection[];
  shipping: { fee: number; freeFrom: number };
}) {
  const t = useT();
  const router = useRouter();
  const [busy, start] = useTransition();
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allRows = useMemo(() => sections.flatMap((s) => s.rows), [sections]);

  const draftOf = (r: PriceRowData): Draft =>
    drafts[r.id] ?? {
      price: String(r.price.value),
      ship: r.shipping ? String(r.shipping.value) : "",
    };

  const livePrice = (id: string): number | null => {
    const row = allRows.find((r) => r.id === id);
    if (!row) return null;
    return money(draftOf(row).price) ?? row.price.value;
  };

  const isDirty = (r: PriceRowData) => {
    const d = drafts[r.id];
    if (!d) return false;
    return (
      money(d.price) !== r.price.value ||
      (r.shipping !== undefined && money(d.ship) !== r.shipping.value)
    );
  };

  const setField = (r: PriceRowData, field: keyof Draft, value: string) => {
    setSaved(null);
    setError(null);
    setDrafts((prev) => ({ ...prev, [r.id]: { ...draftOf(r), [field]: value } }));
  };

  const save = (r: PriceRowData) => {
    const d = draftOf(r);
    const price = money(d.price);
    const ship = r.shipping ? money(d.ship) : null;
    if (price === null || (r.shipping && ship === null)) {
      setError(t("admin.pricingErrInvalid"));
      return;
    }
    start(async () => {
      let ok = true;
      if (price !== r.price.value) {
        ok = await saveOverride(r.price.profile, r.price.matSet, price);
      }
      if (ok && r.shipping && ship !== r.shipping.value) {
        // Same as the store-wide fee → drop the product's own fee so it
        // keeps following the default when that changes.
        ok = await saveOverride("shipping", r.shipping.key, ship === shipping.fee ? null : ship);
      }
      if (!ok) {
        setError(t("admin.pricingErrSave"));
        return;
      }
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[r.id];
        return next;
      });
      setSaved(r.id);
      router.refresh();
    });
  };

  const toggle = (key: "badges" | "heelPad" | "organizer", value: boolean) =>
    start(async () => {
      await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      router.refresh();
    });

  return (
    <div className="space-y-8">
      <p className="text-xs text-text-dim leading-relaxed max-w-3xl">{t("admin.pricingIntro")}</p>

      {sections.map((section) => (
        <section key={section.id}>
          <div className="flex items-baseline justify-between gap-4 mb-2.5">
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-text-dim font-semibold">
              {section.title}
            </h2>
            <div className="hidden md:flex gap-3 text-[10px] uppercase tracking-[0.15em] text-text-faint pr-[124px]">
              <span className="w-28 text-right">{t("admin.pricingPrice")}</span>
              <span className="w-28 text-right">{t("admin.pricingShipping")}</span>
            </div>
          </div>
          <ul className="glass-card rounded-xl divide-y divide-border/30">
            {section.rows.map((r) => {
              const d = draftOf(r);
              const dirty = isDirty(r);
              const name = r.name ?? localizeMatSet(t, r.setLabel ?? "");
              const desc = r.setDesc ? localizeMatSetDesc(t, r.setDesc) : null;
              let bundle: string | null = null;
              if (r.bundleParts) {
                const cabin = livePrice(r.bundleParts.cabin);
                const cargo = livePrice(r.bundleParts.cargo);
                const self = money(d.price) ?? r.price.value;
                if (cabin !== null && cargo !== null) {
                  const parts = cabin + cargo;
                  bundle =
                    parts - self > 0
                      ? t("admin.bundleSaving", {
                          parts: formatPrice(parts),
                          saving: formatPrice(parts - self),
                        })
                      : t("admin.bundleNoSaving", { parts: formatPrice(parts) });
                }
              }
              return (
                <li
                  key={r.id}
                  className="px-4 py-3 flex flex-wrap md:flex-nowrap items-center gap-x-4 gap-y-3"
                >
                  <ProductIcon kind={r.icon} />
                  <div className="flex-1 min-w-[160px]">
                    <div className="text-sm text-text font-medium">{name}</div>
                    {desc && <div className="text-[11px] text-text-faint">{desc}</div>}
                    {bundle && <div className="text-[11px] text-gold/80 mt-0.5">{bundle}</div>}
                  </div>
                  <div className="flex items-end md:items-center gap-3 w-full md:w-auto">
                    <MoneyInput
                      label={t("admin.pricingPrice")}
                      value={d.price}
                      onChange={(v) => setField(r, "price", v)}
                      onEnter={() => dirty && save(r)}
                    />
                    {r.shipping ? (
                      <MoneyInput
                        label={t("admin.pricingShipping")}
                        value={d.ship}
                        onChange={(v) => setField(r, "ship", v)}
                        onEnter={() => dirty && save(r)}
                      />
                    ) : (
                      <span className="w-28 text-right text-[11px] text-text-faint pb-2 md:pb-0">
                        {t("admin.pricingShipInSet")}
                      </span>
                    )}
                    <div className="w-[112px] flex justify-end pb-1 md:pb-0">
                      {dirty ? (
                        <button
                          type="button"
                          onClick={() => save(r)}
                          disabled={busy}
                          className="bg-gradient-to-r from-gold to-gold-light text-bg text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-md disabled:opacity-50"
                        >
                          {t("admin.pricingBtnSave")}
                        </button>
                      ) : saved === r.id ? (
                        <span className="text-[11px] text-success">{t("admin.pricingSaved")}</span>
                      ) : r.availability ? (
                        <button
                          type="button"
                          onClick={() => toggle(r.availability!.key, !r.availability!.value)}
                          disabled={busy}
                          className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-md border transition-colors disabled:opacity-50 ${
                            r.availability.value
                              ? "border-success/40 text-success hover:border-success"
                              : "border-error/40 text-error hover:border-error"
                          }`}
                        >
                          {r.availability.value ? t("admin.availInStock") : t("admin.availOut")}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          {section.note && <p className="mt-2 text-[10px] text-text-faint">{section.note}</p>}
        </section>
      ))}

      <ShippingRules shipping={shipping} busy={busy} start={start} />

      {error && (
        <div className="text-error text-xs glass-card rounded-lg px-3 py-2 border-error/30">
          {error}
        </div>
      )}

      <p className="text-[10px] text-text-faint">
        {t("admin.pricingFeedH")}:{" "}
        <a href="/api/feed.xml" target="_blank" rel="noreferrer" className="text-gold/80 underline">
          /api/feed.xml
        </a>{" "}
        — {t("admin.pricingFeedP")}
      </p>
    </div>
  );
}

function ShippingRules({
  shipping,
  busy,
  start,
}: {
  shipping: { fee: number; freeFrom: number };
  busy: boolean;
  start: (fn: () => Promise<void>) => void;
}) {
  const t = useT();
  const router = useRouter();
  const [fee, setFee] = useState(String(shipping.fee));
  const [freeFrom, setFreeFrom] = useState(String(shipping.freeFrom));
  const [err, setErr] = useState<string | null>(null);
  const dirty = money(fee) !== shipping.fee || money(freeFrom) !== shipping.freeFrom;

  const save = () => {
    const f = money(fee);
    const ff = money(freeFrom);
    if (f === null || ff === null) {
      setErr(t("admin.pricingErrInvalid"));
      return;
    }
    start(async () => {
      const ok =
        (f === shipping.fee || (await saveOverride("shipping", "fee", f))) &&
        (ff === shipping.freeFrom || (await saveOverride("shipping", "freeFrom", ff)));
      setErr(ok ? null : t("admin.pricingErrSave"));
      if (ok) router.refresh();
    });
  };

  return (
    <section>
      <h2 className="text-[11px] uppercase tracking-[0.2em] text-text-dim font-semibold mb-2.5">
        {t("admin.shippingH")}
      </h2>
      <div className="glass-card rounded-xl px-4 py-4 flex flex-wrap items-end gap-4">
        <MoneyInput label={t("admin.shippingFee")} value={fee} onChange={setFee} onEnter={save} wide />
        <MoneyInput
          label={t("admin.shippingFreeFrom")}
          value={freeFrom}
          onChange={setFreeFrom}
          onEnter={save}
          wide
        />
        {dirty && (
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="bg-gradient-to-r from-gold to-gold-light text-bg text-[11px] font-semibold uppercase tracking-wider px-3 py-2 rounded-md disabled:opacity-50"
          >
            {t("admin.pricingBtnSave")}
          </button>
        )}
      </div>
      <p className="mt-2 text-[10px] text-text-faint leading-relaxed">{t("admin.shippingNote")}</p>
      {err && <p className="mt-1 text-[11px] text-error">{err}</p>}
    </section>
  );
}

function MoneyInput({
  label,
  value,
  onChange,
  onEnter,
  wide,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter: () => void;
  wide?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1 ${wide ? "w-44" : "w-28"}`}>
      <span
        className={`text-[10px] uppercase tracking-[0.15em] text-text-faint ${wide ? "" : "md:hidden"}`}
      >
        {label}
      </span>
      <span className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-faint text-sm">$</span>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onEnter()}
          aria-label={label}
          className="w-full glass-card rounded-md pl-6 pr-2.5 py-1.5 text-sm text-right tabular-nums text-text focus:border-gold/40 focus:outline-none"
        />
      </span>
    </label>
  );
}

/** Small line drawings so rows are recognisable at a glance. */
function ProductIcon({ kind }: { kind: string }) {
  const r = (x: number, y: number, w: number, h: number, k: number) => (
    <rect key={k} x={x} y={y} width={w} height={h} rx="1.5" />
  );
  const shapes: Record<string, React.ReactNode[]> = {
    front: [r(6, 8, 12, 16, 0), r(22, 8, 12, 16, 1)],
    full: [r(6, 5, 12, 13, 0), r(22, 5, 12, 13, 1), r(6, 22, 12, 11, 2), r(22, 22, 12, 11, 3)],
    cargo: [r(5, 10, 30, 20, 0)],
    "full-cargo": [
      r(4, 4, 10, 10, 0),
      r(16, 4, 10, 10, 1),
      r(4, 16, 10, 8, 2),
      r(16, 16, 10, 8, 3),
      r(28, 4, 8, 20, 4),
      r(4, 27, 32, 9, 5),
    ],
    thirdRow: [
      r(6, 4, 12, 9, 0),
      r(22, 4, 12, 9, 1),
      r(6, 16, 12, 9, 2),
      r(22, 16, 12, 9, 3),
      r(6, 28, 28, 8, 4),
    ],
    heelPad: [r(8, 6, 24, 28, 0), r(13, 22, 14, 8, 1)],
    organizer: [r(5, 14, 30, 18, 0), r(5, 9, 30, 5, 1), r(19, 14, 2, 18, 2)],
  };
  return (
    <span className="w-10 h-10 shrink-0 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
      <svg
        viewBox="0 0 40 40"
        className="w-7 h-7 text-gold"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden
      >
        {kind === "badge" ? (
          <>
            <circle cx="20" cy="20" r="11" />
            <path d="M16 20h8M20 16v8" />
          </>
        ) : (
          (shapes[kind] ?? shapes.full)
        )}
      </svg>
    </span>
  );
}

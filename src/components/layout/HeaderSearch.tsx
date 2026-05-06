"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { brands, mockModels } from "@/data/catalog";
import { useT } from "@/i18n/I18nProvider";
import { localizeBody } from "@/i18n/labels";

type Hit =
  | {
      kind: "brand";
      id: string;
      label: string;
      href: string;
      sub: string;
      score: number;
    }
  | {
      kind: "model";
      id: string;
      label: string;
      href: string;
      sub: string;
      score: number;
    };

const MAX_HITS = 8;

/**
 * Build a flat searchable index once per render. ~700 models total —
 * cheap enough to filter on every keystroke without debouncing,
 * given strings are short and we exit early once MAX_HITS are found.
 *
 * Score: lower is better. Prefix-match wins, then earlier substring
 * position; tied scores fall back to alphabetical.
 */
function searchCatalog(qRaw: string): Hit[] {
  const q = qRaw.trim().toLowerCase();
  if (q.length < 1) return [];
  const hits: Hit[] = [];

  for (const b of brands) {
    const name = b.name.toLowerCase();
    if (!name.includes(q)) continue;
    const idx = name.indexOf(q);
    hits.push({
      kind: "brand",
      id: b.id,
      label: b.name,
      sub: `${b.modelsCount}`,
      href: `/catalog/${b.slug}`,
      // Brands rank slightly above identical-position model hits.
      score: idx === 0 ? 0 : idx + 0.5,
    });
  }

  for (const m of mockModels) {
    const brand = brands.find((b) => b.id === m.brandId);
    if (!brand) continue;
    const composite = `${brand.name} ${m.name}`.toLowerCase();
    if (!composite.includes(q)) continue;
    const idx = composite.indexOf(q);
    hits.push({
      kind: "model",
      id: m.id,
      label: `${brand.name} ${m.name}`,
      sub: m.bodyType,
      href: `/catalog/${brand.slug}/${m.slug}`,
      score: idx === 0 ? 1 : idx + 1,
    });
  }

  hits.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    return a.label.localeCompare(b.label);
  });

  return hits.slice(0, MAX_HITS);
}

export function HeaderSearch() {
  const t = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hits = useMemo(() => searchCatalog(query), [query]);

  // Reset highlight when result list changes shape.
  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  // Click-outside / escape closes the panel.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Cmd+K / Ctrl+K opens & focuses.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        // Wait a tick for the input to mount in the panel.
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Lock body scroll while the panel is open on mobile so the
  // catalog doesn't keep scrolling behind the modal.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (hits.length === 0) {
      if (e.key === "Enter" && query.trim().length > 0) {
        // Fall back to the catalog page; the brand list there will
        // still filter on the typed query if the user keeps typing.
        router.push(`/catalog`);
        setOpen(false);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % hits.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + hits.length) % hits.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = hits[activeIdx] ?? hits[0];
      router.push(hit.href);
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          requestAnimationFrame(() => inputRef.current?.focus());
        }}
        aria-label={t("search.openAria")}
        className="text-text-dim hover:text-gold transition-colors p-1.5"
      >
        <svg
          className="w-[20px] h-[20px]"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t("search.dialogAria")}
          aria-modal="true"
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[min(15vh,80px)] px-3 sm:px-6 bg-black/60 backdrop-blur-sm"
        >
          <div
            className="w-full max-w-xl glass-card rounded-2xl border border-gold/15 shadow-[0_30px_80px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40">
              <svg
                className="w-4 h-4 text-text-faint shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={t("search.placeholder")}
                aria-label={t("search.inputAria")}
                className="flex-1 bg-transparent text-sm text-text placeholder:text-text-faint focus:outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-border/60 text-[10px] font-mono text-text-faint">
                Esc
              </kbd>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="sm:hidden text-text-faint hover:text-gold p-1"
                aria-label={t("search.closeAria")}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {query.trim().length === 0 ? (
                <div className="px-5 py-8 text-center text-text-faint text-xs">
                  {t("search.empty")}
                </div>
              ) : hits.length === 0 ? (
                <div className="px-5 py-6 text-center">
                  <p className="text-text-dim text-sm">
                    {t("search.noHits", { query: query.trim() })}
                  </p>
                  <Link
                    href={`/custom-order?model=${encodeURIComponent(query.trim())}`}
                    onClick={() => setOpen(false)}
                    className="mt-3 inline-flex items-center text-gold text-xs font-semibold uppercase tracking-wider hover:text-gold-light"
                  >
                    {t("search.requestCustom")} →
                  </Link>
                </div>
              ) : (
                <ul role="listbox" aria-label={t("search.resultsAria")}>
                  {hits.map((h, i) => (
                    <li key={`${h.kind}-${h.id}`}>
                      <Link
                        href={h.href}
                        onClick={() => {
                          setOpen(false);
                          setQuery("");
                        }}
                        onMouseEnter={() => setActiveIdx(i)}
                        role="option"
                        aria-selected={i === activeIdx}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm border-l-2 transition-colors ${
                          i === activeIdx
                            ? "bg-gold/8 border-gold"
                            : "border-transparent hover:bg-surface-hover"
                        }`}
                      >
                        <span
                          className={`text-[9px] uppercase tracking-[0.18em] font-bold w-14 shrink-0 ${
                            h.kind === "brand"
                              ? "text-gold/80"
                              : "text-text-faint"
                          }`}
                        >
                          {h.kind === "brand"
                            ? t("search.kindBrand")
                            : t("search.kindModel")}
                        </span>
                        <span className="flex-1 min-w-0 truncate text-text">
                          {h.label}
                        </span>
                        <span className="text-[10px] text-text-faint shrink-0">
                          {h.kind === "brand"
                            ? t("catalog.modelsCount", { n: Number(h.sub) })
                            : localizeBody(t, h.sub)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="px-4 py-2 border-t border-border/40 text-[10px] text-text-faint flex items-center justify-between gap-3">
              <span>{t("search.hint")}</span>
              <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-border/60 font-mono">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

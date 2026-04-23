"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { brands, mockModels } from "@/data/mock";
import { useT } from "@/i18n/I18nProvider";

interface Option {
  id: string;
  label: string;
}

function Combobox({
  label,
  step,
  value,
  display,
  placeholder,
  options,
  onChange,
  disabled,
  noResultsText,
}: {
  label: string;
  step: number;
  value: string;
  display: string;
  placeholder: string;
  options: Option[];
  onChange: (id: string) => void;
  disabled?: boolean;
  noResultsText: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hi, setHi] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  // Reset highlight when filter changes
  useEffect(() => {
    setHi(0);
  }, [query, open]);

  // Keep highlighted option visible while scrolling the list with keys
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-idx="${hi}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [hi, open]);

  const pick = useCallback(
    (id: string) => {
      onChange(id);
      setQuery("");
      setOpen(false);
      inputRef.current?.blur();
    },
    [onChange],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHi((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHi((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && open && filtered[hi]) {
      e.preventDefault();
      pick(filtered[hi].id);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setQuery("");
      inputRef.current?.blur();
    }
  };

  const activeBadge = !!value || open;
  const inputValue = open ? query : value ? display : "";

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => {
          if (disabled) return;
          setOpen(true);
          inputRef.current?.focus();
        }}
        className={`relative glass-card rounded-xl transition-all duration-200 ${
          disabled
            ? "opacity-40 cursor-not-allowed"
            : "cursor-text hover:border-gold/25"
        } ${
          open
            ? "!border-gold/50 shadow-[0_0_20px_rgba(212,165,74,0.14)]"
            : value
              ? "!border-gold/30"
              : ""
        }`}
      >
        <div className="flex items-center gap-2 px-3.5 pt-2.5">
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
              activeBadge
                ? "bg-gradient-to-br from-gold to-gold-dark text-bg shadow-[0_0_8px_rgba(212,165,74,0.3)]"
                : "bg-border text-text-faint"
            }`}
          >
            {step}
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-gold/80 font-semibold">
            {label}
          </span>
        </div>
        <div className="flex items-center px-3.5 pb-2.5 pt-1">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => !disabled && setOpen(true)}
            onKeyDown={onKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-[15px] font-medium text-text placeholder:text-text-faint focus:outline-none disabled:cursor-not-allowed min-w-0 truncate"
            autoComplete="off"
            spellCheck={false}
          />
          <svg
            className={`w-4 h-4 text-gold/60 shrink-0 ml-2 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {open && !disabled && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 rounded-xl p-[1px] bg-gradient-to-br from-gold/40 via-gold/15 to-gold/35 shadow-[0_16px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(212,165,74,0.08)]">
          <div
            ref={listRef}
            role="listbox"
            className="rounded-[11px] bg-gradient-to-b from-[#1a1a1a] to-[#0F0F0F] max-h-60 overflow-y-auto py-1.5"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(212,165,74,0.25) transparent",
            }}
          >
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-xs text-text-faint text-center">
                {noResultsText}
              </div>
            ) : (
              filtered.map((opt, i) => {
                const isSelected = value === opt.id;
                const isHi = i === hi;
                return (
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    data-idx={i}
                    key={opt.id}
                    onClick={() => pick(opt.id)}
                    onMouseEnter={() => setHi(i)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between gap-3 ${
                      isSelected
                        ? "text-gold bg-gold/10 font-medium"
                        : isHi
                          ? "text-text bg-surface-hover"
                          : "text-text-dim"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <svg
                        className="w-3.5 h-3.5 text-gold shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function CarSelectorSection() {
  const router = useRouter();
  const t = useT();
  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [yearId, setYearId] = useState("");

  const brand = brands.find((b) => b.id === brandId);
  const model = mockModels.find((m) => m.id === modelId);
  const models = useMemo(
    () => mockModels.filter((m) => m.brandId === brandId),
    [brandId],
  );
  const years = useMemo(
    () => (model ? [...model.years].sort((a, b) => b - a) : []),
    [model],
  );

  const onBrand = (id: string) => {
    setBrandId(id);
    setModelId("");
    setYearId("");
  };
  const onModel = (id: string) => {
    setModelId(id);
    setYearId("");
  };
  const ready = !!(brandId && modelId);

  const go = () => {
    if (brand && model)
      router.push(
        `/catalog/${brand.slug}/${model.slug}${yearId ? `?year=${yearId}` : ""}`,
      );
  };

  const noResults = t("cfg.noResults");

  return (
    <section id="configurator" className="py-10 lg:py-16 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="section-label">{t("cfg.label")}</span>
          <h2 className="mt-3 text-2xl lg:text-4xl font-bold tracking-tight">
            {t("cfg.titleA")}{" "}
            <span className="text-gold-gradient">{t("cfg.titleB")}</span>
          </h2>
          <p className="mt-2.5 text-text-dim text-sm max-w-md mx-auto">
            {t("cfg.subtitle")}
          </p>
        </div>

        <div className="max-w-3xl mx-auto relative">
          <div
            className="absolute -inset-3 bg-gradient-to-r from-gold/8 via-gold/4 to-gold/8 rounded-[26px] blur-2xl pointer-events-none"
            aria-hidden
          />

          <div className="relative rounded-[22px] p-[1.5px] bg-gradient-to-br from-gold/55 via-gold/15 to-gold/45 shadow-[0_10px_36px_rgba(0,0,0,0.4),0_0_24px_rgba(212,165,74,0.1)]">
            <div className="rounded-[21px] bg-gradient-to-b from-[#161616] to-[#0F0F0F] p-4 sm:p-5 lg:p-6 relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Combobox
                  label={t("cfg.make")}
                  step={1}
                  value={brandId}
                  display={brand?.name || ""}
                  placeholder={t("cfg.makePh")}
                  options={brands.map((b) => ({ id: b.id, label: b.name }))}
                  onChange={onBrand}
                  noResultsText={noResults}
                />
                <Combobox
                  label={t("cfg.model")}
                  step={2}
                  value={modelId}
                  display={model?.name || ""}
                  placeholder={t("cfg.modelPh")}
                  options={models.map((m) => ({ id: m.id, label: m.name }))}
                  onChange={onModel}
                  disabled={!brandId}
                  noResultsText={noResults}
                />
                <Combobox
                  label={t("cfg.year")}
                  step={3}
                  value={yearId}
                  display={yearId}
                  placeholder={t("cfg.yearPh")}
                  options={years.map((y) => ({
                    id: String(y),
                    label: String(y),
                  }))}
                  onChange={setYearId}
                  disabled={!modelId}
                  noResultsText={noResults}
                />
              </div>

              <button
                onClick={go}
                disabled={!ready}
                className={`w-full mt-5 py-3.5 rounded-xl text-xs lg:text-sm font-semibold tracking-[0.15em] uppercase transition-all duration-300 ${
                  ready
                    ? "bg-gradient-to-r from-gold to-gold-light text-bg shadow-[0_4px_20px_rgba(212,165,74,0.3)] hover:shadow-[0_6px_28px_rgba(212,165,74,0.45)] hover:from-gold-light hover:to-gold"
                    : "bg-surface border border-border text-text-faint cursor-not-allowed"
                }`}
              >
                {ready ? t("cfg.submit") : t("cfg.submitDisabled")}
              </button>

              <div className="mt-3 text-center text-[11px] text-text-faint">
                {t("cfg.customHint")}{" "}
                <a
                  href="/custom-order"
                  className="text-gold/85 hover:text-gold underline underline-offset-2 decoration-gold/30 hover:decoration-gold transition-colors"
                >
                  {t("cfg.customHintLink")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

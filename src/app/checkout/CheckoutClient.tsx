"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import {
  calculateItemUnitPrice,
  calculateOrderTotal,
  formatPrice,
} from "@/lib/pricing";
import { useT, useLocale } from "@/i18n/I18nProvider";
import { localizeMatSet, localizeColor } from "@/i18n/labels";
import { TrustBadges } from "@/components/common/TrustBadges";

// USPS-compatible postal abbreviations for the 50 states + DC. Used to
// constrain the shipping form to a real value (and let the browser
// autofill it via the `address-level1` autocomplete hint).
const US_STATES: ReadonlyArray<{ code: string; name: string }> = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

interface CreatedOrder {
  /** JSON fingerprint of the payload that created this order — a retry
   *  with the same cart/contacts reuses the order instead of creating a
   *  duplicate (and double-consuming the promo code). */
  fingerprint: string;
  id: string;
  orderNumber: string;
  orderToken: string;
}

export function CheckoutClient({ paymentEnabled }: { paymentEnabled: boolean }) {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const t = useT();
  const locale = useLocale();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    comment: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState<{
    code: string;
    discount: number;
    amount: number;
  } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoChecking, setPromoChecking] = useState(false);
  const createdOrderRef = useRef<CreatedOrder | null>(null);

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[e.target.name];
        return next;
      });
    }
  };

  const input =
    "w-full glass-card rounded-xl px-4 py-3.5 text-sm text-text placeholder:text-text-faint focus:border-gold/40 focus:outline-none focus:shadow-[0_0_0_1px_rgba(212,165,74,0.3)] transition-all";
  const inputError =
    "border-error/60 focus:border-error/80 focus:shadow-[0_0_0_1px_rgba(239,68,68,0.4)]";

  const subtotal = calculateOrderTotal(items);
  const discount = promoApplied?.amount ?? 0;
  const total = Math.max(0, subtotal - discount);

  const applyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoError(null);
    setPromoChecking(true);
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setPromoApplied({
          code: data.code,
          discount: data.discount,
          amount: data.amount,
        });
        setPromoInput("");
      } else {
        setPromoError(t(`co.promoErr.${data.error ?? "not_found"}`));
      }
    } catch {
      setPromoError(t("co.promoErr.network"));
    } finally {
      setPromoChecking(false);
    }
  };

  const removePromo = () => {
    setPromoApplied(null);
    setPromoError(null);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = t("co.errName");
    if (!/^[+()\-\s\d]{7,}$/.test(form.phone.trim())) e.phone = t("co.errPhone");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = t("co.errEmail");
    // With Stripe enabled the shipping address is collected on the
    // Checkout page (and overlaid onto the order by the webhook), so the
    // local address fields are hidden and not validated.
    if (!paymentEnabled && form.address.trim().length < 5)
      e.address = t("co.errAddress");
    if (form.zip && !/^[\d\s\-]*$/.test(form.zip)) e.zip = t("co.errZip");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        customer: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
        },
        shipping: {
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          zip: form.zip.trim(),
          comment: form.comment.trim(),
        },
        items: items.map((i) => ({
          modelId: i.modelId,
          brandName: i.brandName,
          modelName: i.modelName,
          year: i.year,
          matSet: i.matSet,
          colorId: i.color.id,
          edgeColorId: i.edgeColor.id,
          badgeId: i.badge?.id ?? null,
          heelPad: i.heelPad ?? false,
          quantity: i.quantity,
        })),
        promoCode: promoApplied?.code ?? null,
      };
      const fingerprint = JSON.stringify(payload);

      // If a previous attempt already created this exact order (e.g. the
      // Stripe redirect failed and the customer pressed the button again),
      // reuse it instead of creating a duplicate.
      let data: { id: string; orderNumber: string; orderToken: string };
      if (createdOrderRef.current?.fingerprint === fingerprint) {
        data = createdOrderRef.current;
      } else {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: fingerprint,
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || t("co.errOrderFail"));
        }
        data = await res.json();
        createdOrderRef.current = { fingerprint, ...data };
      }

      if (paymentEnabled && data.id && data.orderToken) {
        try {
          const payRes = await fetch("/api/checkout/stripe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: data.id,
              orderToken: data.orderToken,
              locale,
            }),
          });
          if (payRes.ok) {
            const payData = await payRes.json();
            if (payData?.url) {
              clearCart();
              window.location.assign(payData.url);
              return;
            }
          }
          // Any non-ok response falls through to the manual-confirm flow.
        } catch (payErr) {
          console.warn("[checkout:stripe-fallback]", payErr);
        }
      }

      clearCart();
      const tokenQs = data.orderToken
        ? `?t=${encodeURIComponent(data.orderToken)}`
        : "";
      router.push(`/order/${data.orderNumber}${tokenQs}`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("co.errSubmit"));
      setSubmitting(false);
    }
  };

  if (!items.length)
    return (
      <div className="py-28 text-center">
        <h1 className="text-xl font-bold">{t("cart.emptyTitle")}</h1>
        <Link href="/catalog" className="mt-3 inline-block text-gold text-sm">
          {t("cart.toCatalog")}
        </Link>
      </div>
    );

  return (
    <div className="py-12 lg:py-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-10">{t("co.title")}</h1>
        <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <span className="section-label text-[10px]">{t("co.contact")}</span>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder={t("co.name")}
                    aria-label={t("co.name")}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "co-err-name" : undefined}
                    autoComplete="name"
                    required
                    className={`${input} ${errors.name ? inputError : ""}`}
                  />
                  {errors.name && (
                    <p id="co-err-name" className="text-[11px] text-error mt-1.5">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={onChange}
                    placeholder={t("co.phone")}
                    aria-label={t("co.phone")}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? "co-err-phone" : undefined}
                    autoComplete="tel"
                    required
                    className={`${input} ${errors.phone ? inputError : ""}`}
                  />
                  {errors.phone && (
                    <p id="co-err-phone" className="text-[11px] text-error mt-1.5">
                      {errors.phone}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder={t("co.email")}
                    aria-label={t("co.email")}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "co-err-email" : undefined}
                    autoComplete="email"
                    required
                    className={`${input} ${errors.email ? inputError : ""}`}
                  />
                  {errors.email && (
                    <p id="co-err-email" className="text-[11px] text-error mt-1.5">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div>
              <span className="section-label text-[10px]">{t("co.shipping")}</span>
              <div className="mt-3 space-y-4">
                {paymentEnabled && (
                  <p className="text-xs text-text-dim glass-card rounded-xl px-4 py-3">
                    {t("co.shipAddressNote")}
                  </p>
                )}
                {!paymentEnabled && (
                <>
                <div>
                  <input
                    name="address"
                    value={form.address}
                    onChange={onChange}
                    placeholder={t("co.address")}
                    aria-label={t("co.address")}
                    aria-invalid={Boolean(errors.address)}
                    aria-describedby={errors.address ? "co-err-address" : undefined}
                    autoComplete="street-address"
                    required
                    className={`${input} ${errors.address ? inputError : ""}`}
                  />
                  {errors.address && (
                    <p
                      id="co-err-address"
                      className="text-[11px] text-error mt-1.5"
                    >
                      {errors.address}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    name="city"
                    value={form.city}
                    onChange={onChange}
                    placeholder={t("co.city")}
                    aria-label={t("co.city")}
                    autoComplete="address-level2"
                    className={input}
                  />
                  <div className="relative">
                    <select
                      name="state"
                      value={form.state}
                      onChange={onChange}
                      aria-label={t("co.state")}
                      autoComplete="address-level1"
                      className={`${input} appearance-none pr-9 cursor-pointer ${
                        form.state ? "text-text" : "text-text-faint"
                      }`}
                    >
                      <option value="" className="bg-bg text-text">
                        {t("co.state")}
                      </option>
                      {US_STATES.map((s) => (
                        <option
                          key={s.code}
                          value={s.code}
                          className="bg-bg text-text"
                        >
                          {s.code} — {s.name}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/70"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.2}
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
                  <div>
                    <input
                      name="zip"
                      value={form.zip}
                      onChange={onChange}
                      placeholder={t("co.zip")}
                      aria-label={t("co.zip")}
                      aria-invalid={Boolean(errors.zip)}
                      aria-describedby={errors.zip ? "co-err-zip" : undefined}
                      autoComplete="postal-code"
                      inputMode="numeric"
                      className={`${input} ${errors.zip ? inputError : ""}`}
                    />
                    {errors.zip && (
                      <p id="co-err-zip" className="text-[11px] text-error mt-1.5">
                        {errors.zip}
                      </p>
                    )}
                  </div>
                </div>
                </>
                )}
                <textarea
                  name="comment"
                  value={form.comment}
                  onChange={onChange}
                  placeholder={t("co.comments")}
                  aria-label={t("co.comments")}
                  rows={3}
                  className={input + " resize-none"}
                />
              </div>
            </div>
            {formError && (
              <div className="text-sm text-error glass-card rounded-xl px-4 py-3 border-error/30">
                {formError}
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-gold to-gold-light text-bg text-sm font-semibold tracking-wider uppercase py-4 rounded-xl shadow-[0_4px_24px_rgba(212,165,74,0.25)] hover:shadow-[0_6px_32px_rgba(212,165,74,0.35)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting
                ? paymentEnabled
                  ? t("co.payRedirecting")
                  : t("co.submitting")
                : paymentEnabled
                  ? t("co.payStripe")
                  : t("co.submit")}
            </button>
          </div>
          <div>
            <div className="glass-card rounded-xl p-6 sticky top-24">
              <span className="section-label text-[10px]">{t("co.yourOrder")}</span>
              <div className="mt-4 space-y-3">
                {items.map((i) => {
                  const unit = calculateItemUnitPrice(i);
                  return (
                    <div
                      key={i.id}
                      className="text-sm border-b border-border/30 pb-3 flex gap-3"
                    >
                      <div
                        className="w-10 h-10 rounded-md border border-border/60 shrink-0 relative overflow-hidden"
                        style={{ backgroundColor: i.color.hex }}
                        aria-hidden
                      >
                        <div
                          className="absolute inset-0 border-[2px] rounded-md"
                          style={{ borderColor: i.edgeColor.hex }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-2">
                          <div className="text-text font-medium text-[13px] truncate">
                            {i.brandName} {i.modelName}
                            {i.year ? <span className="text-text-faint font-normal"> · {i.year}</span> : null}
                          </div>
                          <div className="text-gold text-sm shrink-0">
                            {formatPrice(unit * i.quantity)}
                          </div>
                        </div>
                        <div className="text-text-faint text-[11px] mt-1">
                          {localizeMatSet(t, i.matSetLabel)} · ×{i.quantity}
                        </div>
                        <div className="text-text-dim text-[10px] mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1">
                            <span
                              className="w-2 h-2 rounded-sm"
                              style={{ backgroundColor: i.color.hex }}
                              aria-hidden
                            />
                            {localizeColor(t, i.color.name)}
                          </span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: i.edgeColor.hex }}
                              aria-hidden
                            />
                            {localizeColor(t, i.edgeColor.name)}
                          </span>
                          {i.badge && (
                            <>
                              <span>·</span>
                              <span className="text-gold/90">{i.badge.brandName}</span>
                            </>
                          )}
                          {i.heelPad && (
                            <>
                              <span>·</span>
                              <span className="text-gold/90">{t("cart.drawerHeelPadChip")}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 pt-4 border-t border-border/50 space-y-3">
                <div>
                  {promoApplied ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs">
                        <span className="text-gold font-mono">
                          {promoApplied.code}
                        </span>
                        <span className="text-text-dim ml-2">
                          −{promoApplied.discount}%
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removePromo}
                        className="text-[11px] text-text-faint hover:text-error uppercase tracking-wider"
                      >
                        {t("co.promoRemove")}
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) =>
                          setPromoInput(e.target.value.toUpperCase())
                        }
                        placeholder={t("co.promoPh")}
                        className="flex-1 glass-card rounded-lg px-3 py-2 text-xs font-mono focus:border-gold/40 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={applyPromo}
                        disabled={promoChecking || !promoInput.trim()}
                        className="text-xs font-semibold uppercase tracking-wider text-gold hover:text-gold-light px-3 disabled:opacity-40"
                      >
                        {promoChecking ? "..." : t("co.promoApply")}
                      </button>
                    </div>
                  )}
                  {promoError && (
                    <p className="text-[11px] text-error mt-1.5">{promoError}</p>
                  )}
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-text-dim">{t("co.subtotal")}</span>
                    <span className="text-text-dim">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-gold">{t("co.discount")}</span>
                    <span className="text-gold">−{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-2 border-t border-border/30">
                  <span className="text-text-dim text-xs uppercase tracking-wider">
                    {t("co.total")}
                  </span>
                  <span className="text-gold text-xl font-bold">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-text-faint mt-4">
                {t("co.confirmNote")}
              </p>
              <div className="mt-5 pt-4 border-t border-border/30">
                <TrustBadges />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

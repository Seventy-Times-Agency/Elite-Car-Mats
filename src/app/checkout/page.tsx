"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import {
  calculateItemUnitPrice,
  calculateOrderTotal,
  formatPrice,
} from "@/lib/pricing";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
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

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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

  const total = calculateOrderTotal(items);

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Please enter your name";
    if (!/^[+()\-\s\d]{7,}$/.test(form.phone.trim())) e.phone = "Invalid phone number";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Invalid email";
    if (form.address.trim().length < 5) e.address = "Please enter your address";
    if (form.zip && !/^[\d\s\-]*$/.test(form.zip)) e.zip = "Invalid ZIP code";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
            quantity: i.quantity,
          })),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to place order");
      }
      const data = await res.json();
      clearCart();
      router.push(`/order/${data.orderNumber}`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Submission error");
      setSubmitting(false);
    }
  };

  if (!items.length)
    return (
      <div className="py-28 text-center">
        <h1 className="text-xl font-bold">Your cart is empty</h1>
        <Link href="/catalog" className="mt-3 inline-block text-gold text-sm">
          Catalog
        </Link>
      </div>
    );

  return (
    <div className="py-12 lg:py-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-10">Checkout</h1>
        <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <span className="section-label text-[10px]">Contact</span>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="Name *"
                    className={`${input} ${errors.name ? inputError : ""}`}
                  />
                  {errors.name && (
                    <p className="text-[11px] text-error mt-1.5">{errors.name}</p>
                  )}
                </div>
                <div>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    placeholder="Phone *"
                    className={`${input} ${errors.phone ? inputError : ""}`}
                  />
                  {errors.phone && (
                    <p className="text-[11px] text-error mt-1.5">{errors.phone}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="Email *"
                    className={`${input} ${errors.email ? inputError : ""}`}
                  />
                  {errors.email && (
                    <p className="text-[11px] text-error mt-1.5">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>
            <div>
              <span className="section-label text-[10px]">Shipping</span>
              <div className="mt-3 space-y-4">
                <div>
                  <input
                    name="address"
                    value={form.address}
                    onChange={onChange}
                    placeholder="Address *"
                    className={`${input} ${errors.address ? inputError : ""}`}
                  />
                  {errors.address && (
                    <p className="text-[11px] text-error mt-1.5">{errors.address}</p>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <input
                    name="city"
                    value={form.city}
                    onChange={onChange}
                    placeholder="City"
                    className={input}
                  />
                  <input
                    name="state"
                    value={form.state}
                    onChange={onChange}
                    placeholder="State"
                    className={input}
                  />
                  <div>
                    <input
                      name="zip"
                      value={form.zip}
                      onChange={onChange}
                      placeholder="ZIP"
                      className={`${input} ${errors.zip ? inputError : ""}`}
                    />
                    {errors.zip && (
                      <p className="text-[11px] text-error mt-1.5">{errors.zip}</p>
                    )}
                  </div>
                </div>
                <textarea
                  name="comment"
                  value={form.comment}
                  onChange={onChange}
                  placeholder="Comments"
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
              {submitting ? "Placing order..." : "Place order"}
            </button>
          </div>
          <div>
            <div className="glass-card rounded-xl p-6 sticky top-24">
              <span className="section-label text-[10px]">Your order</span>
              <div className="mt-4 space-y-3">
                {items.map((i) => {
                  const unit = calculateItemUnitPrice(i);
                  return (
                    <div
                      key={i.id}
                      className="text-sm border-b border-border/30 pb-3 flex justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-text font-medium truncate">
                          {i.brandName} {i.modelName}
                        </div>
                        <div className="text-text-faint text-xs mt-0.5">
                          {i.matSetLabel} × {i.quantity}
                        </div>
                      </div>
                      <div className="text-gold text-sm shrink-0">
                        {formatPrice(unit * i.quantity)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between items-baseline mt-5 pt-4 border-t border-border/50">
                <span className="text-text-dim text-xs uppercase tracking-wider">
                  Total
                </span>
                <span className="text-gold text-xl font-bold">
                  {formatPrice(total)}
                </span>
              </div>
              <p className="text-[11px] text-text-faint mt-4">
                We&apos;ll contact you to confirm
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

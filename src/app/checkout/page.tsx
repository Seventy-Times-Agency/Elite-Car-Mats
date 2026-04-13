"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CheckoutPage() {
  const { items } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", city: "", state: "", zip: "", comment: "" });
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const input = "w-full border border-light-border px-4 py-3.5 text-sm text-text-primary placeholder:text-light-text/50 focus:border-gold focus:outline-none transition-colors bg-transparent";

  if (items.length === 0) {
    return (
      <div className="py-28 text-center">
        <h1 className="text-xl font-bold text-text-primary">Корзина пуста</h1>
        <Link href="/catalog" className="mt-3 inline-block text-gold text-sm">Каталог</Link>
      </div>
    );
  }

  return (
    <div className="py-12 lg:py-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-text-primary mb-10">Оформление заказа</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <span className="section-label text-light-text text-[10px]">Контакт</span>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input name="name" value={form.name} onChange={onChange} placeholder="Имя *" className={input} />
                <input name="phone" value={form.phone} onChange={onChange} placeholder="Телефон *" className={input} />
                <input name="email" value={form.email} onChange={onChange} placeholder="Email *" className={input + " sm:col-span-2"} />
              </div>
            </div>
            <div>
              <span className="section-label text-light-text text-[10px]">Доставка</span>
              <div className="mt-3 space-y-4">
                <input name="address" value={form.address} onChange={onChange} placeholder="Адрес *" className={input} />
                <div className="grid grid-cols-3 gap-4">
                  <input name="city" value={form.city} onChange={onChange} placeholder="Город" className={input} />
                  <input name="state" value={form.state} onChange={onChange} placeholder="Штат" className={input} />
                  <input name="zip" value={form.zip} onChange={onChange} placeholder="ZIP" className={input} />
                </div>
                <textarea name="comment" value={form.comment} onChange={onChange} placeholder="Комментарий" rows={3} className={input + " resize-none"} />
              </div>
            </div>
            <button className="w-full bg-dark hover:bg-gold text-light text-sm font-medium tracking-wider uppercase py-4 transition-all duration-300">
              Подтвердить заказ
            </button>
          </div>
          <div>
            <div className="border border-light-border p-6 sticky top-24">
              <span className="section-label text-light-text text-[10px]">Ваш заказ</span>
              <div className="mt-4 space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="text-sm border-b border-light-border/50 pb-3">
                    <div className="text-text-primary font-medium">{item.brandName} {item.modelName}</div>
                    <div className="text-light-text text-xs mt-0.5">{item.matSetLabel} &times; {item.quantity}</div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-light-text mt-4">Мы свяжемся для подтверждения</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

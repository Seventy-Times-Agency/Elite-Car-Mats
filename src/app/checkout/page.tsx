"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CheckoutPage() {
  const { items } = useCart();
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", address: "", city: "", state: "", zip: "", comment: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const inputClasses = "w-full border border-brand-gray-200 px-4 py-3 text-sm text-brand-text focus:border-brand-gold focus:outline-none transition-colors";

  if (items.length === 0) {
    return (
      <div className="py-24 text-center bg-white">
        <h1 className="text-xl font-bold text-brand-black">Корзина пуста</h1>
        <Link href="/catalog" className="mt-4 inline-block text-brand-gold text-sm">Перейти в каталог</Link>
      </div>
    );
  }

  return (
    <div className="py-12 lg:py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-brand-black mb-10">Оформление заказа</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            {/* Contact */}
            <div>
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-brand-gray-400 font-medium mb-4">Контактные данные</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Имя *" className={inputClasses} required />
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Телефон *" className={inputClasses} required />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email *" className={inputClasses + " sm:col-span-2"} required />
              </div>
            </div>

            {/* Address */}
            <div>
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-brand-gray-400 font-medium mb-4">Адрес доставки</h2>
              <div className="space-y-4">
                <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Адрес *" className={inputClasses} required />
                <div className="grid grid-cols-3 gap-4">
                  <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Город" className={inputClasses} />
                  <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="Штат" className={inputClasses} />
                  <input type="text" name="zip" value={formData.zip} onChange={handleChange} placeholder="ZIP" className={inputClasses} />
                </div>
                <textarea name="comment" value={formData.comment} onChange={handleChange} placeholder="Комментарий" rows={3} className={inputClasses + " resize-none"} />
              </div>
            </div>

            <button className="w-full bg-brand-black hover:bg-brand-gold text-white text-sm font-medium tracking-wide uppercase py-4 transition-colors">
              Подтвердить заказ
            </button>
          </div>

          {/* Summary */}
          <div>
            <div className="border border-brand-gray-200 p-6 sticky top-24">
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-brand-gray-400 font-medium mb-4">Ваш заказ</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="text-sm border-b border-brand-gray-100 pb-3">
                    <div className="text-brand-black font-medium">{item.brandName} {item.modelName}</div>
                    <div className="text-brand-gray-400 text-xs mt-0.5">{item.matSetLabel} &times; {item.quantity}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-brand-gray-200 text-sm text-brand-gray-400">
                Товаров: {items.reduce((s, i) => s + i.quantity, 0)}
              </div>
              <p className="text-[11px] text-brand-gray-400 mt-3">
                Мы свяжемся для подтверждения и уточнения стоимости
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

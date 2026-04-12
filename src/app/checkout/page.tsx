"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CheckoutPage() {
  const { items } = useCart();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    comment: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-brand-white">
          Корзина пуста
        </h1>
        <Link
          href="/catalog"
          className="mt-4 inline-block text-brand-gold hover:text-brand-gold-light transition-colors"
        >
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-brand-white mb-8">
          Оформление заказа
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-brand-dark-light border border-brand-gray/30 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-brand-white mb-4">
                Контактные данные
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-brand-text-muted mb-1">
                    Имя *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-brand-dark border border-brand-gray-light rounded-lg px-4 py-3 text-brand-text focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/50 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-brand-text-muted mb-1">
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-brand-dark border border-brand-gray-light rounded-lg px-4 py-3 text-brand-text focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/50 transition-colors"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-brand-text-muted mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-brand-dark border border-brand-gray-light rounded-lg px-4 py-3 text-brand-text focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/50 transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-brand-dark-light border border-brand-gray/30 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-brand-white mb-4">
                Адрес доставки
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-brand-text-muted mb-1">
                    Адрес *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full bg-brand-dark border border-brand-gray-light rounded-lg px-4 py-3 text-brand-text focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/50 transition-colors"
                    placeholder="Street address"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-brand-text-muted mb-1">
                      Город
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full bg-brand-dark border border-brand-gray-light rounded-lg px-4 py-3 text-brand-text focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-brand-text-muted mb-1">
                      Штат
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full bg-brand-dark border border-brand-gray-light rounded-lg px-4 py-3 text-brand-text focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-brand-text-muted mb-1">
                      ZIP
                    </label>
                    <input
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleChange}
                      className="w-full bg-brand-dark border border-brand-gray-light rounded-lg px-4 py-3 text-brand-text focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/50 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-brand-text-muted mb-1">
                    Комментарий к заказу
                  </label>
                  <textarea
                    name="comment"
                    value={formData.comment}
                    onChange={handleChange}
                    rows={3}
                    className="w-full bg-brand-dark border border-brand-gray-light rounded-lg px-4 py-3 text-brand-text focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/50 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            <button className="w-full bg-brand-gold hover:bg-brand-gold-light text-brand-black font-semibold py-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-brand-gold/20 text-base">
              Подтвердить заказ
            </button>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-brand-dark-light border border-brand-gray/30 rounded-xl p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-brand-white mb-4">
                Ваш заказ
              </h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm border-b border-brand-gray/20 pb-3"
                  >
                    <div className="text-brand-text-muted">
                      <div>
                        {item.brandName} {item.modelName}
                      </div>
                      <div className="text-xs">
                        {item.matSetLabel} &times; {item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-brand-gray/30">
                <div className="flex justify-between text-sm">
                  <span className="text-brand-text-muted">Товаров</span>
                  <span className="text-brand-text">
                    {items.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                </div>
                <p className="text-xs text-brand-text-muted mt-3">
                  Мы свяжемся с вами для подтверждения заказа и уточнения
                  стоимости
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { matSets } from "@/data/mock";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="max-w-md mx-auto">
          <svg
            className="w-24 h-24 text-brand-gray-light mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
          <h1 className="mt-6 text-2xl font-bold text-brand-white">
            Корзина пуста
          </h1>
          <p className="mt-2 text-brand-text-muted">
            Добавьте коврики из каталога
          </p>
          <Link
            href="/catalog"
            className="mt-6 inline-flex items-center px-6 py-3 bg-brand-gold hover:bg-brand-gold-light text-brand-black font-semibold rounded-lg transition-colors"
          >
            Перейти в каталог
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-brand-white">
            Корзина
          </h1>
          <button
            onClick={clearCart}
            className="text-brand-text-muted hover:text-brand-error text-sm transition-colors"
          >
            Очистить
          </button>
        </div>

        {/* Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-brand-dark-light border border-brand-gray/30 rounded-xl p-4 lg:p-6"
            >
              <div className="flex gap-4">
                {/* Color swatch */}
                <div
                  className="w-16 h-16 lg:w-20 lg:h-20 rounded-lg border border-brand-gray/50 shrink-0"
                  style={{ backgroundColor: item.color.hex }}
                />

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-brand-white font-semibold">
                    {item.brandName} {item.modelName}
                  </h3>
                  <p className="text-brand-text-muted text-sm mt-1">
                    {item.year} &middot; {item.matSetLabel}
                  </p>
                  <p className="text-brand-text-muted text-xs mt-1">
                    Цвет: {item.color.name} &middot; Окантовка:{" "}
                    {item.edgeColor.name}
                    {item.badge && ` · Шильдик ${item.badge.brandName}`}
                  </p>
                </div>

                {/* Quantity + Remove */}
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-brand-text-muted hover:text-brand-error transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 rounded border border-brand-gray/50 text-brand-text-muted hover:border-brand-gold/50 hover:text-brand-gold transition-colors disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="text-brand-text w-8 text-center text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      className="w-8 h-8 rounded border border-brand-gray/50 text-brand-text-muted hover:border-brand-gold/50 hover:text-brand-gold transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout */}
        <div className="mt-8 bg-brand-dark-light border border-brand-gray/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-brand-text-muted">
              Товаров: {items.reduce((s, i) => s + i.quantity, 0)}
            </span>
            <span className="text-brand-text-muted text-sm">
              Цены будут указаны при оформлении
            </span>
          </div>
          <Link
            href="/checkout"
            className="block w-full text-center bg-brand-gold hover:bg-brand-gold-light text-brand-black font-semibold py-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-brand-gold/20"
          >
            Оформить заказ
          </Link>
        </div>
      </div>
    </div>
  );
}

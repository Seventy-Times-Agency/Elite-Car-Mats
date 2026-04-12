"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="py-24 text-center bg-white">
        <div className="max-w-sm mx-auto">
          <div className="text-brand-gray-200 text-6xl mb-6">&#128722;</div>
          <h1 className="text-xl font-bold text-brand-black">Корзина пуста</h1>
          <p className="mt-2 text-brand-text-secondary text-sm">Добавьте коврики из каталога</p>
          <Link
            href="/catalog"
            className="mt-6 inline-flex items-center px-6 py-3 bg-brand-black hover:bg-brand-gold text-white text-sm font-medium tracking-wide uppercase transition-colors"
          >
            Перейти в каталог
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 lg:py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-bold text-brand-black">Корзина</h1>
          <button onClick={clearCart} className="text-brand-gray-400 hover:text-brand-error text-xs uppercase tracking-wide transition-colors">
            Очистить
          </button>
        </div>

        <div className="divide-y divide-brand-gray-200 border-t border-brand-gray-200">
          {items.map((item) => (
            <div key={item.id} className="py-6 flex gap-4">
              <div className="w-16 h-16 border border-brand-gray-200 shrink-0" style={{ backgroundColor: item.color.hex }} />
              <div className="flex-1 min-w-0">
                <h3 className="text-brand-black font-medium text-sm">{item.brandName} {item.modelName}</h3>
                <p className="text-brand-gray-400 text-xs mt-1">
                  {item.year} &middot; {item.matSetLabel} &middot; {item.color.name} &middot; Окантовка: {item.edgeColor.name}
                  {item.badge && ` · Шильдик ${item.badge.brandName}`}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}
                    className="w-7 h-7 border border-brand-gray-200 text-brand-gray-400 hover:border-brand-gold hover:text-brand-gold text-sm transition-colors disabled:opacity-30">-</button>
                  <span className="text-brand-black text-sm w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 border border-brand-gray-200 text-brand-gray-400 hover:border-brand-gold hover:text-brand-gold text-sm transition-colors">+</button>
                </div>
              </div>
              <button onClick={() => removeItem(item.id)} className="text-brand-gray-300 hover:text-brand-error transition-colors self-start">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-brand-gray-200">
          <div className="flex justify-between text-sm mb-6">
            <span className="text-brand-gray-400">Товаров: {items.reduce((s, i) => s + i.quantity, 0)}</span>
            <span className="text-brand-gray-400 text-xs">Цены уточняются при оформлении</span>
          </div>
          <Link href="/checkout" className="block w-full text-center bg-brand-black hover:bg-brand-gold text-white text-sm font-medium tracking-wide uppercase py-4 transition-colors">
            Оформить заказ
          </Link>
        </div>
      </div>
    </div>
  );
}

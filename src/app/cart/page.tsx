"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="py-28 text-center">
        <svg className="w-16 h-16 mx-auto text-dark-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        <h1 className="mt-6 text-xl font-bold text-text-primary">Корзина пуста</h1>
        <p className="mt-2 text-text-secondary text-sm">Добавьте коврики из каталога</p>
        <Link href="/catalog" className="mt-6 inline-block bg-gold hover:bg-gold-light text-dark px-6 py-3 text-sm font-medium tracking-wider uppercase transition-colors">Каталог</Link>
      </div>
    );
  }

  return (
    <div className="py-12 lg:py-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-bold text-text-primary">Корзина</h1>
          <button onClick={clearCart} className="text-text-muted hover:text-error text-xs tracking-wider uppercase transition-colors">Очистить</button>
        </div>
        <div className="border-t border-dark-border">
          {items.map((item) => (
            <div key={item.id} className="py-6 border-b border-dark-border flex gap-4">
              <div className="w-16 h-16 border border-dark-border rounded shrink-0" style={{ backgroundColor: item.color.hex }} />
              <div className="flex-1 min-w-0">
                <h3 className="text-text-primary font-medium text-sm">{item.brandName} {item.modelName}</h3>
                <p className="text-text-muted text-xs mt-1">{item.year} · {item.matSetLabel} · {item.color.name} · {item.edgeColor.name}{item.badge && ` · ${item.badge.brandName}`}</p>
                <div className="flex items-center gap-3 mt-3">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="w-7 h-7 border border-dark-border text-text-muted hover:border-gold hover:text-gold text-sm transition-colors disabled:opacity-30 rounded">-</button>
                  <span className="text-text-primary text-sm w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 border border-dark-border text-text-muted hover:border-gold hover:text-gold text-sm transition-colors rounded">+</button>
                </div>
              </div>
              <button onClick={() => removeItem(item.id)} className="text-dark-border hover:text-error transition-colors self-start">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-6 border-t border-dark-border">
          <Link href="/checkout" className="block w-full text-center bg-gold hover:bg-gold-light text-dark text-sm font-medium tracking-wider uppercase py-4 transition-colors rounded-lg">Оформить заказ</Link>
        </div>
      </div>
    </div>
  );
}

"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import {
  calculateItemUnitPrice,
  calculateOrderTotal,
  formatPrice,
} from "@/lib/pricing";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const total = calculateOrderTotal(items);

  if (items.length === 0) return (
    <div className="py-28 text-center">
      <div className="text-5xl mb-4 opacity-20">🛒</div>
      <h1 className="text-xl font-bold">Your cart is empty</h1>
      <p className="mt-2 text-text-dim text-sm">Add mats from the catalog</p>
      <Link href="/catalog" className="mt-6 inline-block bg-gradient-to-r from-gold to-gold-light text-bg px-6 py-3 text-sm font-semibold tracking-wider uppercase rounded-lg shadow-[0_4px_20px_rgba(212,165,74,0.25)]">Catalog</Link>
    </div>
  );

  return (
    <div className="py-12 lg:py-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-bold">Cart</h1>
          <button onClick={clearCart} className="text-text-faint hover:text-error text-xs tracking-wider uppercase transition-colors">Clear</button>
        </div>
        <div className="space-y-3">
          {items.map((item) => {
            const unit = calculateItemUnitPrice(item);
            return (
              <div key={item.id} className="glass-card rounded-xl p-5 flex gap-4">
                <div className="w-14 h-14 rounded-lg border border-border shrink-0" style={{ backgroundColor: item.color.hex }} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-3">
                    <h3 className="text-text font-medium text-sm">{item.brandName} {item.modelName}</h3>
                    <span className="text-gold text-sm font-semibold shrink-0">{formatPrice(unit * item.quantity)}</span>
                  </div>
                  <p className="text-text-faint text-xs mt-1">{item.year} · {item.matSetLabel} · {item.color.name} · {item.edgeColor.name}{item.badge ? ` · ${item.badge.brandName}` : ""}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <button onClick={() => updateQuantity(item.id, item.quantity-1)} disabled={item.quantity<=1} className="w-7 h-7 rounded border border-border text-text-dim hover:border-gold hover:text-gold text-sm transition-colors disabled:opacity-30">-</button>
                    <span className="text-text text-sm w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity+1)} className="w-7 h-7 rounded border border-border text-text-dim hover:border-gold hover:text-gold text-sm transition-colors">+</button>
                    <span className="text-text-faint text-[11px] ml-2">{formatPrice(unit)} / ea</span>
                  </div>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-border hover:text-error transition-colors self-start">✕</button>
              </div>
            );
          })}
        </div>
        <div className="mt-8 glass-card rounded-xl p-5 flex items-baseline justify-between">
          <span className="text-text-dim text-xs uppercase tracking-wider">Total</span>
          <span className="text-gold text-2xl font-bold">{formatPrice(total)}</span>
        </div>
        <div className="mt-4">
          <Link href="/checkout" className="block w-full text-center bg-gradient-to-r from-gold to-gold-light text-bg text-sm font-semibold tracking-wider uppercase py-4 rounded-xl transition-all duration-300 shadow-[0_4px_24px_rgba(212,165,74,0.25)]">Checkout</Link>
        </div>
      </div>
    </div>
  );
}

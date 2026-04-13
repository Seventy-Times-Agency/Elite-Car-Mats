import { mockReviews } from "@/data/mock";
import Link from "next/link";

function Stars({ n }: { n: number }) {
  return <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => (
    <svg key={i} className={`w-4 h-4 ${i < n ? "text-gold" : "text-border"}`} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ))}</div>;
}

export function ReviewsSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="section-label">Отзывы</span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-bold">Что говорят клиенты</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {mockReviews.map((r) => (
            <div key={r.id} className="glass-card glow-hover rounded-xl p-7 relative">
              <div className="absolute top-4 right-5 text-gold/10 text-5xl font-serif select-none">&ldquo;</div>
              <Stars n={r.rating} />
              <p className="mt-5 text-text-dim text-sm leading-relaxed">{r.text}</p>
              <div className="mt-6 pt-5 border-t border-border/50">
                <div className="text-text text-sm font-medium">{r.customerName}</div>
                <div className="text-text-faint text-xs mt-0.5">{r.carModel}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/reviews" className="section-label hover:text-gold-light transition-colors">Все отзывы →</Link>
        </div>
      </div>
    </section>
  );
}

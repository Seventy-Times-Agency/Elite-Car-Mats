import { mockReviews } from "@/data/mock";
import Link from "next/link";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < rating ? "text-gold" : "text-dark-border"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function ReviewsSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="section-label">Отзывы</span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-bold text-text-primary">Что говорят клиенты</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockReviews.map((r) => (
            <div key={r.id} className="border border-dark-border rounded-lg p-8 relative group hover:border-gold/20 transition-colors duration-300">
              <div className="absolute top-5 right-6 text-gold/10 text-5xl font-serif leading-none select-none">&ldquo;</div>
              <Stars rating={r.rating} />
              <p className="mt-5 text-text-secondary text-sm leading-relaxed">{r.text}</p>
              <div className="mt-6 pt-5 border-t border-dark-border">
                <div className="text-text-primary text-sm font-medium">{r.customerName}</div>
                <div className="text-text-muted text-xs mt-0.5">{r.carModel}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/reviews" className="section-label hover:text-gold-dark transition-colors">Все отзывы &rarr;</Link>
        </div>
      </div>
    </section>
  );
}

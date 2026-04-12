import { mockReviews } from "@/data/mock";
import Link from "next/link";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? "text-brand-gold" : "text-brand-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function ReviewsSection() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-brand-gold text-sm tracking-[0.3em] uppercase font-medium mb-3">
            Отзывы
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-brand-black">
            Что говорят клиенты
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mockReviews.map((review) => (
            <div
              key={review.id}
              className="border border-brand-gray-200 p-8 relative"
            >
              {/* Quote mark */}
              <div className="text-brand-gold/20 text-6xl font-serif absolute top-4 right-6 leading-none">
                &ldquo;
              </div>

              <StarRating rating={review.rating} />
              <p className="mt-5 text-brand-text-secondary text-sm leading-relaxed">
                {review.text}
              </p>
              <div className="mt-6 pt-5 border-t border-brand-gray-100">
                <div className="text-brand-black text-sm font-medium">
                  {review.customerName}
                </div>
                <div className="text-brand-gray-400 text-xs mt-0.5">
                  {review.carModel}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/reviews"
            className="text-brand-gold hover:text-brand-gold-dark transition-colors text-sm tracking-wide uppercase font-medium"
          >
            Все отзывы &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

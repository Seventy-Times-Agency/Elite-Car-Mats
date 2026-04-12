import { Metadata } from "next";
import { mockReviews } from "@/data/mock";

export const metadata: Metadata = {
  title: "Отзывы",
  description: "Отзывы клиентов Elite Car Mats",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < rating ? "text-brand-gold" : "text-brand-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <div className="py-12 lg:py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-brand-gold text-sm tracking-[0.3em] uppercase font-medium mb-3">Отзывы</p>
          <h1 className="text-3xl lg:text-4xl font-bold text-brand-black">Что говорят клиенты</h1>
        </div>

        {/* Rating */}
        <div className="text-center mb-12 pb-12 border-b border-brand-gray-200">
          <div className="text-4xl font-bold text-brand-black">5.0</div>
          <div className="flex justify-center mt-1"><StarRating rating={5} /></div>
          <p className="text-brand-gray-400 text-xs mt-2">{mockReviews.length} отзывов</p>
        </div>

        <div className="space-y-8">
          {mockReviews.map((review) => (
            <div key={review.id} className="pb-8 border-b border-brand-gray-100 last:border-0">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-brand-black text-sm font-medium">{review.customerName}</div>
                  <div className="text-brand-gray-400 text-xs">{review.carModel}</div>
                </div>
                <span className="text-brand-gray-300 text-xs">{new Date(review.createdAt).toLocaleDateString("ru-RU")}</span>
              </div>
              <StarRating rating={review.rating} />
              <p className="mt-3 text-brand-text-secondary text-sm leading-relaxed">{review.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

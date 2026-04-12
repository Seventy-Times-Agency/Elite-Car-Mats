import { Metadata } from "next";
import { mockReviews } from "@/data/mock";

export const metadata: Metadata = {
  title: "Отзывы",
  description: "Отзывы клиентов Elite Car Mats",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-brand-gold" : "text-brand-gray"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-brand-white">
            Отзывы <span className="text-gradient-gold">клиентов</span>
          </h1>
          <p className="mt-4 text-brand-text-muted text-lg">
            Что говорят наши покупатели о ковриках Elite Car Mats
          </p>
        </div>

        {/* Average rating */}
        <div className="bg-brand-dark-light border border-brand-gold/20 rounded-2xl p-8 text-center mb-12 border-glow-gold">
          <div className="text-5xl font-bold text-brand-gold">5.0</div>
          <div className="flex justify-center mt-2">
            <StarRating rating={5} />
          </div>
          <p className="text-brand-text-muted text-sm mt-2">
            На основе {mockReviews.length} отзывов
          </p>
        </div>

        {/* Reviews list */}
        <div className="space-y-6">
          {mockReviews.map((review) => (
            <div
              key={review.id}
              className="bg-brand-dark-light border border-brand-gray/30 rounded-xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center">
                    <span className="text-brand-gold font-semibold">
                      {review.customerName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-brand-text font-medium">
                      {review.customerName}
                    </div>
                    <div className="text-brand-text-muted text-sm">
                      {review.carModel}
                    </div>
                  </div>
                </div>
                <span className="text-brand-text-muted text-sm">
                  {new Date(review.createdAt).toLocaleDateString("ru-RU")}
                </span>
              </div>
              <div className="mt-3">
                <StarRating rating={review.rating} />
              </div>
              <p className="mt-3 text-brand-text text-sm leading-relaxed">
                {review.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

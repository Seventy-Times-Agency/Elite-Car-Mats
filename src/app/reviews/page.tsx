"use client";

import { motion } from "framer-motion";
import { mockReviews } from "@/data/mock";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < rating ? "text-gold" : "text-light-border"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <div className="py-16 lg:py-24 bg-light min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <span className="section-label">Отзывы</span>
          <h1 className="mt-4 text-3xl lg:text-4xl font-bold text-text-primary">Что говорят клиенты</h1>
        </motion.div>

        <div className="text-center mb-12 pb-12 border-b border-light-border">
          <div className="text-4xl font-bold text-text-primary">5.0</div>
          <div className="flex justify-center mt-1"><Stars rating={5} /></div>
          <p className="text-light-text text-xs mt-2">{mockReviews.length} отзывов</p>
        </div>

        <div className="space-y-0 divide-y divide-light-border">
          {mockReviews.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="py-8"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-text-primary text-sm font-medium">{r.customerName}</div>
                  <div className="text-light-text text-xs">{r.carModel}</div>
                </div>
                <span className="text-light-text/50 text-xs">{new Date(r.createdAt).toLocaleDateString("ru-RU")}</span>
              </div>
              <Stars rating={r.rating} />
              <p className="mt-3 text-text-secondary text-sm leading-relaxed">{r.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

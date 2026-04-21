"use client";
import { useState } from "react";

const faqs = [
  {
    q: "What are EVA mats and how are they better than ordinary ones?",
    a: "EVA (ethylene-vinyl acetate) is a closed-cell polymer used to make athletic footwear and orthopedic insoles. Unlike rubber mats, EVA doesn't absorb moisture, dust, or odors, doesn't crack from temperature swings (−40°F to 160°F), weighs 3–4× less, and lasts 5–7 years without losing its look. The honeycomb structure on top holds up to 1.5 liters of water, dirt, and snow — everything stays in the mat, not on your upholstery.",
  },
  {
    q: "How do I find mats for my car?",
    a: "Use the configurator at the top of the home page: pick your make, model, and year. Every mat is cut from an individual pattern for your VIN range — the fit is precise, with no gaps or pedal interference. If your model isn't listed, email info@elitecarmats.us and we'll cut a pattern within 3 business days.",
  },
  {
    q: "What sets do you offer and which should I choose?",
    a: "We make 4 options. \"Fronts\" — two mats for driver and passenger (basic protection, $59–79). \"Full Set\" — the full cabin: front + rear row (for sedans and hatchbacks, $119–149). \"Cargo\" — a separate mat for the cargo area ($49–69). \"Full Set + Cargo\" — maximum protection for the whole cabin and trunk ($149–189). For most customers, \"Full Set + Cargo\" is the sweet spot — especially if you have kids, a dog, or you take frequent road trips.",
  },
  {
    q: "What colors and edge options are available?",
    a: "Mat base: black or gray EVA (black is universal; gray looks great in light-colored interiors). Edge trim (raised perimeter): black, gray, gold, or red. Red and gold add an accent; black is classic. On request, we can add a metal brand badge with your car's logo on the driver's front mat.",
  },
  {
    q: "How do I care for the mats?",
    a: "Once every 1–2 weeks, shake them out and rinse with a hose or in the shower. For deeper cleaning, use warm water with mild soap and a soft brush. EVA handles water, auto chemistry, road salt, and de-icers. Dry away from direct heat (radiator, hair dryer, direct sun). Don't use abrasive cleaners — they damage the honeycomb structure.",
  },
  {
    q: "What's the warranty and what does it cover?",
    a: "2-year manufacturer warranty on all materials and stitching. If you find a manufacturing defect during the warranty period — a crack, stitch separation, edge deformation — we'll replace the mat or set free of charge. Normal wear (worn heel areas, heel scuffs) is not covered, but this is a natural process and takes 4–5 years of active use with EVA.",
  },
  {
    q: "How fast is shipping and how much does it cost?",
    a: "We ship within 48 hours of payment. Within the USA, USPS / UPS Ground — 3–7 business days, free on orders over $99. Express (2–3 days) — $19. Tracking link is emailed the moment the package leaves. We also ship to Canada and Mexico; the cost is calculated at checkout.",
  },
  {
    q: "Can I return or exchange my mats?",
    a: "Yes, within 30 days of delivery. Mats must be in original packaging, with no signs of use or odors. Refunds are processed within 5 business days of us receiving the return. If you picked the wrong set or color, we do a free exchange — you only cover the return shipping.",
  },
  {
    q: "Do the mats fit EVs (Tesla, Rivian, Lucid)?",
    a: "Yes — we have patterns for all popular EVs: Tesla Model 3/Y/S/X, Cybertruck, Rivian R1T/R1S, Lucid Air, Ford Mustang Mach-E, Hyundai Ioniq 5/6, Kia EV6/EV9, BMW iX, Mercedes EQS. EVs often have unusual floor geometry (flat, no tunnel) — our mats account for this.",
  },
  {
    q: "Do you make mats for pickups and commercial vehicles?",
    a: "Absolutely. Ford F-150, Ram 1500/2500/3500, Chevy Silverado, GMC Sierra, Toyota Tacoma/Tundra, Nissan Titan, Ram ProMaster, Ford Transit — all in the catalog. Crew Cab / Super Cab / Regular Cab use different patterns — pick your exact configuration on the model page.",
  },
];

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="py-14 lg:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="section-label">FAQ</span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-bold">Frequently Asked Questions</h2>
          <p className="mt-3 text-text-dim text-base max-w-xl mx-auto">
            Answers to what our customers ask most — from material to warranty to shipping.
          </p>
        </div>
        <div className="space-y-2.5">
          {faqs.map((f, i) => (
            <div key={i} className={`glass-card rounded-xl overflow-hidden transition-all duration-300 ${openIdx === i ? "border-gold/25 shadow-[0_4px_24px_rgba(212,165,74,0.08)]" : ""}`}>
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between p-5 lg:p-6 text-left group"
              >
                <span className={`text-text text-[15px] lg:text-base font-medium pr-6 transition-colors ${openIdx === i ? "text-gold" : "group-hover:text-gold"}`}>
                  {f.q}
                </span>
                <span className={`text-gold text-xl shrink-0 transition-transform duration-300 ${openIdx === i ? "rotate-45" : ""}`}>+</span>
              </button>
              <div className={`grid transition-all duration-300 ease-out ${openIdx === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                  <p className="text-text-dim text-sm lg:text-[15px] leading-relaxed px-5 pb-5 lg:px-6 lg:pb-6">{f.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center glass-card rounded-xl p-7 lg:p-8">
          <p className="text-text-dim text-sm">Didn&apos;t find your answer?</p>
          <p className="mt-2 text-text text-base">
            Email us — we reply within an hour during business hours.
          </p>
          <a
            href="mailto:info@elitecarmats.us"
            className="mt-5 inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-gold to-gold-light text-bg text-xs font-semibold tracking-[0.15em] uppercase shadow-[0_4px_20px_rgba(212,165,74,0.25)] hover:shadow-[0_6px_28px_rgba(212,165,74,0.4)] transition-all"
          >
            info@elitecarmats.us
          </a>
        </div>
      </div>
    </section>
  );
}

import type { ModelGuide } from "./types";

/** Compact and mid-size two-row crossovers and wagons. */
export const CROSSOVER_GUIDES: Record<string, ModelGuide> = {
  "toyota/rav4": {
    intro: [
      "The RAV4 started in 1996 as a small runabout sold with three or five doors. Thirty years later it is one of the best-selling vehicles in America, and for 2026 it became hybrid and plug-in hybrid only.",
      "The floor changes with every generation, and within one: 2006–2012 models could have a small third row, and the 2019–2025 cargo deck board sits at two heights.",
    ],
    generations: [
      { years: "2026+", name: "6th gen (XA60)", note: "Hybrid and plug-in hybrid only; the gas-only RAV4 was dropped." },
      { years: "2019–2025", name: "5th gen (XA50)", note: "New platform with a 105.9-inch wheelbase, 1.2 inches longer than before, for more rear legroom. The cargo deck board can sit high or low." },
      { years: "2013–2018", name: "4th gen (XA40)", note: "A top-hinged liftgate replaced the side-hinged rear door, the spare moved under the cargo floor, and the third row was dropped." },
      { years: "2006–2012", name: "3rd gen (XA30)", note: "North America got the long-wheelbase body, with an optional two-seat third row." },
      { years: "2001–2005", name: "2nd gen (XA20)", note: "Redesign; the US got the five-door body only." },
      { years: "1996–2000", name: "1st gen (XA10)", note: "Sold in the US as a three-door and a five-door." },
    ],
    tips: [
      "RAV4 Hybrid (from 2016) or RAV4 Prime plug-in (from 2021)? Write it in the trim field so we check the pattern for your powertrain.",
      "2006–2012 with the factory third row: turn on “My car has a third row of seats” with a full set.",
      "On 1996–2000 models, tell us whether you have the three-door or the five-door.",
    ],
    metaDescription:
      "Custom EVA floor mats for the Toyota RAV4, 1996–2026, cut for each generation including Hybrid and Prime. Hand-made in Rochester, NY, 30-day returns.",
  },

  "honda/cr-v": {
    intro: [
      "The CR-V has been sold in the US since 1997 and has always been a two-row, five-seat crossover here. Each redesign made it bigger: the current car is the largest CR-V yet.",
      "Early models hide a surprise under the cargo carpet: on 1997–2006 CR-Vs the cargo floor panel folds out into a picnic table. On the 2020 CR-V Hybrid, the battery pack sits under the cargo floor instead of a spare tire.",
    ],
    generations: [
      { years: "2023+", name: "6th gen", note: "The largest CR-V so far, with a 1.6-inch longer wheelbase and 2.7 inches more length." },
      { years: "2017–2022", name: "5th gen", note: "Redesign; the CR-V Hybrid joined for 2020." },
      { years: "2012–2016", name: "4th gen", note: "One-motion folding 60/40 rear seats and a cargo floor Honda lowered by 0.8 inch." },
      { years: "2007–2011", name: "3rd gen", note: "A rear liftgate replaced the side-opening door and the spare moved under the car, which changed the cargo floor." },
      { years: "2002–2006", name: "2nd gen", note: "Kept the side-opening rear door and the fold-out picnic table." },
      { years: "1997–2001", name: "1st gen", note: "The original CR-V, with the cargo floor panel that doubles as a picnic table." },
    ],
    tips: [
      "CR-V Hybrid (2020 on): mention it in the trim field; the hybrid's cargo area is smaller than the gas model's.",
      "Every US CR-V has two rows, so a full set covers the whole cabin.",
    ],
    metaDescription:
      "EVA floor mats for the Honda CR-V, 1997–2027, including the CR-V Hybrid. Cut per generation, sewn edge in 11 colors, 30-day returns.",
  },

  "chevrolet/equinox": {
    intro: [
      "The Equinox has been a five-seat, two-row crossover since 2005. The first two generations shared a long 112.5-inch wheelbase and a rear bench that slides eight inches, so the rear footwell changes length with the seat.",
      "The 2018 redesign made the Equinox noticeably smaller and fixed the rear seat in place. The Equinox EV, sold from 2024, is a separate electric vehicle with its own platform and its own page in our catalog.",
    ],
    generations: [
      { years: "2025+", name: "4th gen", note: "Redesign on a 107.5-inch wheelbase; a column-mounted shifter frees space in the center console." },
      { years: "2018–2024", name: "3rd gen", note: "About five inches shorter in wheelbase than before, and the rear seat no longer slides." },
      { years: "2010–2017", name: "2nd gen", note: "Redesign on the same 112.5-inch wheelbase, keeping the sliding rear bench." },
      { years: "2005–2009", name: "1st gen", note: "Launched with a rear bench that slides eight inches fore and aft." },
    ],
    tips: [
      "Driving an Equinox EV? Pick it from the Chevrolet catalog; it has a different floor from the gas Equinox.",
      "Every Equinox has two rows, so a full set covers the whole cabin.",
    ],
    metaDescription:
      "Chevrolet Equinox EVA floor mats for 2005–2027, cut for each generation from the sliding-bench years to the 2025 redesign. Made in Rochester, NY.",
  },

  "tesla/model-y": {
    intro: [
      "The Model Y is the best-selling electric vehicle in America. It is battery-electric only, so it has a flat floor with no transmission tunnel, plus a front trunk and a storage well under the rear cargo floor.",
      "Most Model Ys are five-seaters. A small two-seat third row has been optional on some versions, and Tesla refreshed the car's interior in 2025.",
    ],
    generations: [
      { years: "2025+", name: "Refresh", note: "Refreshed exterior and a new interior." },
      { years: "2020–2025", name: "Original", note: "US deliveries began in 2020; an optional two-seat third row was offered." },
    ],
    tips: [
      "Seven-seat Model Y: turn on “My car has a third row of seats” with a full set.",
      "Tell us whether your car is the original or the 2025 refresh; the interiors differ.",
      "The frunk and the under-floor well are separate from the main cargo area. A cargo set covers the main cargo floor.",
    ],
    metaDescription:
      "Tesla Model Y EVA floor mats for the flat EV floor: five- and seven-seat cars, original and 2025 refresh. Hand-cut, waterproof, 30-day returns.",
  },

  "nissan/rogue": {
    intro: [
      "The Rogue is Nissan's best seller in the US. Since 2014 it has used the Divide-N-Hide cargo system, movable floor panels that let the cargo floor sit at different heights.",
      "For a few years the Rogue could also be ordered with a third row: 2014–2017 S and SV gas models offered it through the Family Package.",
    ],
    generations: [
      { years: "2021–2026", name: "3rd gen (T33)", note: "Rear doors that open close to 90 degrees and a redesigned Divide-N-Hide cargo floor." },
      { years: "2014–2020", name: "2nd gen (T32)", note: "Larger redesign that added Divide-N-Hide and an optional third row on 2014–2017 gas models." },
      { years: "2008–2013", name: "1st gen (S35)", note: "The original Rogue; the same design continued as the Rogue Select for 2014–2015." },
    ],
    tips: [
      "2014–2017 with the Family Package third row: turn on “My car has a third row of seats” with a full set.",
      "Rogue Hybrid (2017–2019): its battery replaces the Divide-N-Hide cargo system, so mention the hybrid in the trim field.",
      "The Rogue Sport and Rogue Select have their own pages in our catalog.",
    ],
    metaDescription:
      "Nissan Rogue EVA floor mats, 2008–2027: five- and seven-seat 2014–2017 models, Hybrid, and the Divide-N-Hide cargo floor. 30-day returns.",
  },

  "hyundai/tucson": {
    intro: [
      "The Tucson has been a two-row, five-seat compact crossover since 2005. The current car is much bigger than the first ones: the US gets the long-wheelbase version, which is longer than the Tucson sold in Europe.",
      "The 2022 redesign also brought the first Tucson Hybrid and Plug-in Hybrid.",
    ],
    generations: [
      { years: "2022+", name: "4th gen (NX4)", note: "Long-wheelbase body in the US, with hybrid and plug-in hybrid versions; refreshed for 2025." },
      { years: "2016–2021", name: "3rd gen (TL)", note: "Redesign; from now on the name is Tucson worldwide." },
      { years: "2010–2015", name: "2nd gen (LM)", note: "Redesign; a hydrogen fuel-cell version was leased in Southern California." },
      { years: "2005–2009", name: "1st gen (JM)", note: "The first Tucson, positioned below the Santa Fe." },
    ],
    tips: [
      "Tucson Hybrid has its own page in our catalog. For the Plug-in Hybrid, mention it in the trim field.",
      "Every generation has two rows, so a full set covers the whole cabin.",
    ],
    metaDescription:
      "Hyundai Tucson EVA floor mats, 2005–2026, cut for each generation including the long-wheelbase 2022+ model. Hand-made in Rochester, NY.",
  },

  "kia/sportage": {
    intro: [
      "The Sportage arrived in the US in 1995, took a break for the 2003 and 2004 model years, and came back in 2005. The first generation was also sold as a four-seat two-door soft-top from 1998.",
      "The 2023 redesign turned it from one of the smallest compact SUVs into one of the largest: 7.1 inches longer, with a 3.4-inch longer wheelbase in North America.",
    ],
    generations: [
      { years: "2023+", name: "5th gen (NQ5)", note: "Long-wheelbase body in North America; hybrid and plug-in hybrid versions added." },
      { years: "2017–2022", name: "4th gen (QL)", note: "Redesign, refreshed for 2020." },
      { years: "2011–2016", name: "3rd gen (SL)", note: "Redesign." },
      { years: "2005–2010", name: "2nd gen", note: "The Sportage returned after two years off the US market." },
      { years: "1995–2002", name: "1st gen", note: "Four-door, plus a shorter two-door soft-top added for 1998." },
    ],
    tips: [
      "Sportage Hybrid is listed separately in our catalog; pick it if that's your car.",
      "1998–2002 two-door soft-top: tell us in the trim field, it has a shorter floor.",
    ],
    metaDescription:
      "Kia Sportage EVA floor mats for 1995–2027, from the original two-door to the long 2023+ model. Hand-cut per generation, 30-day returns.",
  },

  "mazda/cx-5": {
    intro: [
      "Mazda's best seller has been a two-row, five-seat crossover since 2013, and it has been gas-only in the US. The first two generations sit on nearly the same wheelbase, about 106 inches.",
      "The 2026 redesign is a big step: the wheelbase grows to 110.8 inches, so mats for 2017–2025 cars will not fit the new one.",
    ],
    generations: [
      { years: "2026+", name: "3rd gen", note: "Wheelbase stretched to 110.8 inches, mainly for rear-seat and cargo room." },
      { years: "2017–2025", name: "2nd gen (KF)", note: "Redesign on about the same wheelbase; a turbo engine arrived for 2019." },
      { years: "2013–2016", name: "1st gen (KE)", note: "The first CX-5, with a 40/20/40 split rear seat." },
    ],
    tips: [
      "Pick your exact year: 2016 and 2017 look similar from outside but are different generations.",
      "Every US CX-5 has two rows, so a full set covers the whole cabin.",
    ],
    metaDescription:
      "Mazda CX-5 EVA floor mats for 2013–2026, cut for the KE and KF generations. Waterproof honeycomb EVA, 11 edge colors, 30-day returns.",
  },

  "subaru/forester": {
    intro: [
      "The Forester has grown with almost every redesign since 1998. The biggest jump came for 2009, when the wheelbase grew 3.5 inches, so floor fit really does change from one generation to the next.",
      "It stayed gas-only in the US until the Forester Hybrid arrived partway through the 2025 model year.",
    ],
    generations: [
      { years: "2025+", name: "6th gen (SL)", note: "Redesign; the first Forester Hybrid joined during the 2025 model year." },
      { years: "2019–2024", name: "5th gen (SK)", note: "Subaru Global Platform with a slightly longer wheelbase; refreshed for 2022 with the Wilderness trim." },
      { years: "2014–2018", name: "4th gen (SJ)", note: "About an inch more wheelbase and more room inside." },
      { years: "2009–2013", name: "3rd gen (SH)", note: "Wheelbase grew 3.5 inches, making the cabin much larger." },
      { years: "2003–2008", name: "2nd gen (SG)", note: "Redesign on the same wheelbase." },
      { years: "1998–2002", name: "1st gen (SF)", note: "The original Forester." },
    ],
    tips: [
      "2025 Forester Hybrid: mention it in the trim field.",
      "A cargo set pairs well with Subaru owners' usual cargo: dogs, skis and muddy gear.",
    ],
    metaDescription:
      "Subaru Forester EVA floor mats, 1998–2026, cut for every generation from the SF to the 2025 SL and Hybrid. Hand-made, 30-day returns.",
  },

  "subaru/crosstrek": {
    intro: [
      "The Crosstrek began as the XV Crosstrek in 2013 and dropped the “XV” for 2016. It is a two-row, five-seat car in every generation.",
      "One version has a different cargo floor: on the 2019–2023 Crosstrek plug-in hybrid, the battery sits under a raised cargo floor, and cargo space drops from 20.8 to 15.9 cubic feet.",
    ],
    generations: [
      { years: "2024+", name: "3rd gen (GU)", note: "Redesign; a full hybrid was added for 2026." },
      { years: "2018–2023", name: "2nd gen (GT)", note: "Subaru Global Platform; a plug-in hybrid was offered 2019–2023." },
      { years: "2013–2017", name: "1st gen (GP)", note: "Sold as the XV Crosstrek until 2016; a mild hybrid was offered 2014–2016." },
    ],
    tips: [
      "Crosstrek Hybrid is listed separately in our catalog. For the 2019–2023 plug-in, pick that page so the cargo liner matches the raised floor.",
      "Every generation has two rows, so a full set covers the whole cabin.",
    ],
    metaDescription:
      "Subaru Crosstrek EVA floor mats for 2013–2026, including XV Crosstrek years. Cut per generation, waterproof, shipped from Rochester, NY.",
  },

  "subaru/outback": {
    intro: [
      "The Outback became its own model in the US for 1996, a raised Legacy wagon with body cladding. For 2000–2004 it was also sold as a sedan.",
      "It has always been a two-row, five-seat car. The 2026 redesign moved it to a taller, boxier SUV body with a cargo area two inches taller, so newer cargo liners differ from older ones.",
    ],
    generations: [
      { years: "2026+", name: "7th gen", note: "Upright SUV-style body; 34.6 cubic feet behind the rear seat." },
      { years: "2020–2025", name: "6th gen (BT)", note: "Subaru Global Platform; refreshed for 2023." },
      { years: "2015–2019", name: "5th gen (BS)", note: "Redesign." },
      { years: "2010–2014", name: "4th gen (BR)", note: "A much larger wagon inside than before." },
      { years: "2005–2009", name: "3rd gen (BP)", note: "Redesign." },
      { years: "2000–2004", name: "2nd gen", note: "Offered as a wagon and as a sedan." },
      { years: "1996–1999", name: "1st gen (BG)", note: "The first stand-alone Outback, raised with body cladding." },
    ],
    tips: [
      "2000–2004 Outback sedan: tell us in the trim field, the trunk is different from the wagon.",
      "Outback owners haul dogs and gear, so a full set with cargo protects the whole floor.",
    ],
    metaDescription:
      "Subaru Outback EVA floor mats, 1996–2026: wagon and 2000–2004 sedan, every generation. Hand-cut in Rochester, NY, 30-day returns.",
  },

  "chevrolet/trax": {
    intro: [
      "Two very different cars carry the Trax name. The 2015–2022 Trax is a small, tall crossover. The 2024 Trax is larger and lower, with a wheelbase about 5.7 inches longer.",
      "There is no 2023 model year: the redesigned 2024 went on sale in spring 2023. That gap is the line where floor mats stop being interchangeable.",
    ],
    generations: [
      { years: "2024+", name: "2nd gen", note: "Larger and lower, 106.3-inch wheelbase, front-wheel drive only." },
      { years: "2015–2022", name: "1st gen", note: "First US Trax, 100.6-inch wheelbase, with a fold-flat front passenger seat." },
    ],
    tips: [
      "Check your model year: a 2022 and a 2024 Trax need different patterns.",
      "Both generations have two rows, so a full set covers the whole cabin.",
    ],
    metaDescription:
      "Chevrolet Trax EVA floor mats for 2015–2022 and the larger 2024+ model, each cut to its own pattern. Hand-made, 30-day returns.",
  },

  "honda/hr-v": {
    intro: [
      "The HR-V came to the US for 2016. The first US generation was built on the Fit's platform, with the fuel tank under the front seats. That allowed the Magic Seat: the rear seat cushions flip up to leave the rear footwell floor open for tall items.",
      "The 2023 redesign moved it to the Civic's platform, 9.4 inches longer and 2.6 inches wider, and the Magic Seat was dropped.",
    ],
    generations: [
      { years: "2023+", name: "2nd US gen", note: "Civic-based, longer and wider, with a 1.7-inch longer wheelbase; no Magic Seat." },
      { years: "2016–2022", name: "1st US gen", note: "Fit-based, with the center fuel tank and flip-up Magic Seat." },
    ],
    tips: [
      "Every HR-V has two rows, so a full set covers the whole cabin.",
      "Pick your exact year: 2022 and 2023 are different cars underneath.",
    ],
    metaDescription:
      "Honda HR-V EVA floor mats, 2016–2027: the Magic Seat years and the larger 2023+ HR-V, each cut to its own pattern. 30-day returns.",
  },

  "ford/escape": {
    intro: [
      "The Escape was sold from 2001 and made history in 2005 as the first hybrid SUV sold in the US. Every generation has two rows and five seats.",
      "The last generation (2020–2026) has a rear seat that slides six inches, so the rear footwell and cargo floor change length with the seat position.",
    ],
    generations: [
      { years: "2020–2026", name: "4th gen", note: "Sliding second row; the hybrid returned and a plug-in hybrid arrived for 2021." },
      { years: "2013–2019", name: "3rd gen", note: "All-new design shared with the Ford Kuga, with a longer 105.9-inch wheelbase; no hybrid." },
      { years: "2008–2012", name: "2nd gen", note: "New body and interior on the same 103.1-inch wheelbase; the hybrid continued." },
      { years: "2001–2007", name: "1st gen", note: "The original Escape; the 2005 Escape Hybrid was America's first hybrid SUV." },
    ],
    tips: [
      "Escape Hybrid or Plug-in Hybrid: mention it in the trim field.",
      "2005–2012 Hybrid: the battery sits under the rear cargo floor, which matters for a cargo liner.",
    ],
    metaDescription:
      "Ford Escape EVA floor mats, 2001–2026, including Hybrid and Plug-in Hybrid years. Cut per generation, 11 edge colors, 30-day returns.",
  },
};

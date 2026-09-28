import type { ModelGuide } from "./types";

/** Sedans, hatchbacks and coupes. */
export const CAR_GUIDES: Record<string, ModelGuide> = {
  "toyota/camry": {
    intro: [
      "The Camry has been America's best-selling car for most of the last three decades. Over our catalog years it has been sold as a sedan, a wagon (through 1996) and, for 1994–1996, a coupe; later two-doors became the separate Camry Solara.",
      "Hybrids changed the trunk: on 2007–2017 Camry Hybrids the battery sits in the trunk, while from 2018 it moved under the rear seat. Since 2025 every Camry is a hybrid.",
    ],
    generations: [
      { years: "2025+", name: "9th gen (XV80)", note: "Hybrid-only, with optional all-wheel drive." },
      { years: "2018–2024", name: "8th gen (XV70)", note: "Hybrid battery moved under the rear seat; AWD returned for 2020 on four-cylinder cars." },
      { years: "2012–2017", name: "7th gen (XV50)", note: "Sedan with gas and hybrid versions." },
      { years: "2007–2011", name: "6th gen (XV40)", note: "First Camry Hybrid, with its battery in the trunk." },
      { years: "2002–2006", name: "5th gen (XV30)", note: "Larger sedan, and the first Camry with no wagon." },
      { years: "1997–2001", name: "4th gen (XV20)", note: "Sedan only in the US; two-doors moved to the Camry Solara." },
      { years: "1992–1996", name: "3rd gen (XV10)", note: "Wider body; sedan, wagon and, from 1994, a coupe. The wagon offered a small third row." },
      { years: "1990–1991", name: "2nd gen (V20)", note: "Sedan and wagon, with All-Trac AWD available." },
    ],
    tips: [
      "2007–2024 Camry Hybrid has its own page in our catalog; the trunk differs from the gas car in some years.",
      "Wagon or coupe: they have their own pages too.",
    ],
    metaDescription:
      "Toyota Camry EVA floor mats, 1990–2026: sedan in every generation, gas or hybrid, plus trunk liners. Hand-cut in Rochester, NY, 30-day returns.",
  },

  "honda/civic": {
    intro: [
      "The Civic has been sold as a hatchback, sedan, coupe and even a wagon over the years, and each body has its own floor and trunk. Since 2022 it is a sedan or a five-door hatchback only.",
      "The 2001 redesign gave the Civic a flat rear floor with no center tunnel, which Honda says added rear foot room.",
    ],
    generations: [
      { years: "2022+", name: "11th gen", note: "Sedan and hatchback, no coupe; Civic Hybrid returned for 2025." },
      { years: "2016–2021", name: "10th gen", note: "Sedan, coupe through 2020, and a five-door hatchback back in the US." },
      { years: "2012–2015", name: "9th gen", note: "Sedan and coupe; Hybrid sedan with a lithium-ion battery." },
      { years: "2006–2011", name: "8th gen", note: "Sedan and coupe in the US; Hybrid sedan continued." },
      { years: "2001–2005", name: "7th gen", note: "Flat rear floor with no center tunnel; first Civic Hybrid." },
      { years: "1996–2000", name: "6th gen", note: "Hatchback, sedan and coupe." },
      { years: "1992–1995", name: "5th gen", note: "Hatchback, sedan and a new coupe; the wagon was dropped." },
      { years: "1990–1991", name: "4th gen", note: "Hatchback, sedan and wagon." },
    ],
    tips: [
      "Sedan is the default here. Hatchback, coupe, wagon, Hybrid, Si and Type R each have their own page in our catalog.",
      "Trunk liners differ by body style, so double-check it before adding a cargo mat.",
    ],
    metaDescription:
      "Honda Civic sedan EVA floor mats, 1990–2026, cut for each generation. Hatchback, coupe, Si and Type R also in our catalog. 30-day returns.",
  },

  "toyota/corolla": {
    intro: [
      "The Corolla is one of the best-selling nameplates in history. In the US it has been a sedan through every generation, with a wagon until 1997 and a hatchback again since 2019.",
      "The 2020 Corolla Hybrid was the first hybrid Corolla sold in the US. From 2023 its smaller battery sits under the rear seat.",
    ],
    generations: [
      { years: "2019+", name: "12th gen (E210)", note: "Hatchback from 2019, sedan from 2020; first US Corolla Hybrid." },
      { years: "2014–2019", name: "11th gen (E170)", note: "Sedan." },
      { years: "2009–2013", name: "10th gen (E140)", note: "Sedan." },
      { years: "2003–2008", name: "9th gen (E130)", note: "Sedan." },
      { years: "1998–2002", name: "8th gen (E110)", note: "Four-door sedan only in North America." },
      { years: "1993–1997", name: "7th gen (E100)", note: "Larger sedan and wagon." },
      { years: "1990–1992", name: "6th gen (E90)", note: "Sedan, wagon and coupe, plus an All-Trac AWD wagon." },
    ],
    tips: [
      "2019 is a split year: the new hatchback and the old sedan were sold side by side. The hatchback, Hybrid and Corolla Cross have their own pages.",
      "Wagon owners: pick the Corolla Wagon page for the right cargo liner.",
    ],
    metaDescription:
      "Toyota Corolla EVA floor mats, 1990–2027, cut for every sedan generation. Hatchback, Hybrid and Cross also in our catalog. 30-day returns.",
  },

  "honda/accord": {
    intro: [
      "The Accord has been one of America's favorite mid-size cars since long before our catalog starts. From 1990 to 2017 it was sold as a sedan and a coupe, and as a US-built wagon from 1991 to 1997. Since 2018 it is a sedan only.",
      "The 2018 redesign shrank the hybrid battery and moved it out of the trunk to under the rear seat.",
    ],
    generations: [
      { years: "2023+", name: "11th gen", note: "Sedan; hybrid on Sport trims and above." },
      { years: "2018–2022", name: "10th gen", note: "Sedan only; hybrid battery moved under the rear seat." },
      { years: "2013–2017", name: "9th gen", note: "Sedan and coupe; Hybrid and a 2014-only Plug-in Hybrid." },
      { years: "2008–2012", name: "8th gen", note: "Sedan and coupe; no hybrid." },
      { years: "2003–2007", name: "7th gen", note: "Sedan and coupe; first Accord Hybrid for 2005." },
      { years: "1998–2002", name: "6th gen", note: "Sedan and coupe." },
      { years: "1994–1997", name: "5th gen", note: "Sedan, coupe and the last Accord wagon." },
      { years: "1990–1993", name: "4th gen", note: "Sedan and coupe; wagon added for 1991." },
    ],
    tips: [
      "Accord Coupe, Wagon and Hybrid have their own pages in our catalog.",
      "Before 2018 the hybrid battery sat in the trunk, so pick the Hybrid page for a trunk liner.",
    ],
    metaDescription:
      "Honda Accord EVA floor mats, 1990–2026: every sedan generation, cut to its own pattern. Coupe, Wagon and Hybrid pages too. 30-day returns.",
  },

  "tesla/model-3": {
    intro: [
      "The Model 3 is a five-seat electric sedan with its battery under the cabin floor, which gives it a low, flat floor. Besides the rear trunk it has a front trunk and a covered storage well under the rear trunk floor.",
      "Tesla updates the car continuously rather than by model year. The biggest change was the 2024 refresh, often called Highland, with a new exterior and interior.",
    ],
    generations: [
      { years: "2024+", name: "Refresh (Highland)", note: "Restyled exterior and interior." },
      { years: "2017–2023", name: "Original", note: "The 2021 model-year update added a new center console and a power trunk." },
    ],
    tips: [
      "Tell us whether your car is before or after the 2024 refresh; the interiors differ.",
      "A cargo set covers the main trunk floor; the front trunk and the under-floor well are separate.",
    ],
    metaDescription:
      "Tesla Model 3 EVA floor mats for the flat EV floor, 2017–2026, original and Highland refresh. Hand-cut, waterproof, 30-day returns.",
  },

  "hyundai/elantra": {
    intro: [
      "The Elantra came to the US for 1992 and has been Hyundai's core sedan ever since. It has grown steadily; the 2007–2010 car was already rated mid-size by the EPA for interior room.",
      "The current generation adds the Elantra Hybrid, whose battery sits under the rear seats, and the performance Elantra N.",
    ],
    generations: [
      { years: "2021+", name: "7th gen (CN7)", note: "Sedan with gas, Hybrid, N Line and Elantra N versions." },
      { years: "2017–2020", name: "6th gen (AD)", note: "Sedan." },
      { years: "2011–2016", name: "5th gen (MD)", note: "Sedan, plus a two-door Elantra Coupe for 2013–2014." },
      { years: "2007–2010", name: "4th gen (HD)", note: "Sedan, rated mid-size by the EPA." },
      { years: "2001–2006", name: "3rd gen (XD)", note: "Sedan, plus a five-door GT hatchback from 2002." },
      { years: "1996–2000", name: "2nd gen (J2)", note: "Sedan." },
      { years: "1992–1995", name: "1st gen (J1)", note: "Four-door sedan." },
    ],
    tips: [
      "Elantra Hybrid, Elantra N, Elantra GT and the Coupe have their own pages in our catalog.",
      "Every Elantra has two rows, so a full set covers the whole cabin.",
    ],
    metaDescription:
      "Hyundai Elantra EVA floor mats, 1992–2026, cut for every sedan generation. Hybrid, N and GT pages too. Hand-made, 30-day returns.",
  },

  "nissan/altima": {
    intro: [
      "The Altima replaced the Stanza for 1993 and has been a five-seat sedan ever since, with a two-door Altima Coupe along the way (2008–2013).",
      "The 2019 redesign made all-wheel drive available on the Altima for the first time.",
    ],
    generations: [
      { years: "2019+", name: "6th gen (L34)", note: "First Altima with available all-wheel drive." },
      { years: "2013–2018", name: "5th gen (L33)", note: "Sedan only once the coupe ended." },
      { years: "2007–2012", name: "4th gen (L32)", note: "Sedan, plus the Altima Coupe and the 2007–2011 Altima Hybrid." },
      { years: "2002–2006", name: "3rd gen (L31)", note: "Larger sedan." },
      { years: "1998–2001", name: "2nd gen (L30)", note: "Sedan." },
      { years: "1993–1997", name: "1st gen (U13)", note: "Compact sedan that replaced the Stanza." },
    ],
    tips: [
      "Altima Coupe and Altima Hybrid have their own pages in our catalog.",
      "AWD or FWD? Mention it in the trim field for 2019 and newer cars.",
    ],
    metaDescription:
      "Nissan Altima EVA floor mats, 1993–2026, cut for each sedan generation incl. 2019+ AWD. Coupe and Hybrid pages too. 30-day returns.",
  },
};

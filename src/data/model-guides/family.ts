import type { ModelGuide } from "./types";

/**
 * Three-row SUVs and minivans. SUV pages sell the third row as an add-on
 * toggle; minivan pages sell rows as sets — the tips follow that split.
 */

const THIRD_ROW_TIP =
  "Third row: turn on “My car has a third row of seats” with a full set.";
const SECOND_ROW_TIP =
  "Second-row bench or captain's chairs? Write it in the trim field; the second-row floor differs.";
const MINIVAN_ROWS_TIP =
  "Pick the rows you want: front + middle, all three rows, cargo only, or everything together.";

export const FAMILY_GUIDES: Record<string, ModelGuide> = {
  "jeep/grand-cherokee": {
    intro: [
      "For almost three decades the Grand Cherokee was a two-row, five-seat SUV. That changed with the 2021 Grand Cherokee L, the first Grand Cherokee with three rows, on a wheelbase five inches longer than the two-row model.",
      "The two-row Grand Cherokee followed for 2022, and so did the 4xe plug-in hybrid, which keeps the same cargo space as the gas model.",
    ],
    generations: [
      { years: "2022+", name: "5th gen (WL)", note: "Two-row model and 4xe plug-in hybrid; refreshed for 2026. The three-row L came first, for 2021." },
      { years: "2011–2021", name: "4th gen (WK2)", note: "Four-wheel independent suspension; also sold for 2022 as the Grand Cherokee WK." },
      { years: "2005–2010", name: "3rd gen (WK)", note: "Two-row redesign." },
      { years: "1999–2004", name: "2nd gen (WJ)", note: "Two-row redesign." },
      { years: "1993–1998", name: "1st gen (ZJ)", note: "The original Grand Cherokee." },
    ],
    tips: [
      "The three-row Grand Cherokee L and the 4xe have their own pages in our catalog.",
      "2022 was sold as both the new WL and the older WK: tell us which one you have.",
    ],
    metaDescription:
      "Jeep Grand Cherokee EVA floor mats, 1993–2025, cut for ZJ, WJ, WK, WK2 and WL. Grand Cherokee L and 4xe pages too. 30-day returns.",
  },

  "ford/explorer": {
    intro: [
      "The Explorer launched for 1991 as a body-on-frame SUV with three or five doors. The 2002 redesign brought its first available third row, and for 2011 it moved to unibody construction with three rows.",
      "The current generation sits on a rear-wheel-drive-based platform and seats seven with a second-row bench or six with captain's chairs.",
    ],
    generations: [
      { years: "2020+", name: "6th gen (U625)", note: "Rear-drive-based platform; bench or captain's chairs; refreshed for 2025." },
      { years: "2011–2019", name: "5th gen (U502)", note: "Switched to unibody; three rows." },
      { years: "2006–2010", name: "4th gen (U251)", note: "New, stiffer frame; the last body-on-frame Explorer." },
      { years: "2002–2005", name: "3rd gen (U152)", note: "Five-door only; first available third row." },
      { years: "1995–2001", name: "2nd gen", note: "Five-door, plus the three-door Explorer Sport." },
      { years: "1991–1994", name: "1st gen (UN46)", note: "Body-on-frame, three-door and five-door." },
    ],
    tips: [THIRD_ROW_TIP, SECOND_ROW_TIP, "1991–2003 three-door or Explorer Sport: tell us in the trim field."],
    metaDescription:
      "Ford Explorer EVA floor mats, 1991–2025: three-door, five-door and three-row models, bench or captain's chairs. Hand-cut, 30-day returns.",
  },

  "toyota/highlander": {
    intro: [
      "The Highlander arrived for 2001 as a five-seater. The optional third row came for 2004, and Toyota reshaped the floor behind the second row to make room for it; cars without the third row got a storage compartment there instead.",
      "Since 2008 the third row is standard. From 2014 you can have eight seats with a second-row bench or seven with captain's chairs.",
    ],
    generations: [
      { years: "2020–2026", name: "4th gen (XU70)", note: "Bench or captain's chairs; the V6 gave way to a 2.4L turbo for 2023." },
      { years: "2014–2019", name: "3rd gen (XU50)", note: "Up to eight seats with a second-row bench." },
      { years: "2008–2013", name: "2nd gen (XU40)", note: "Larger, with a standard third row and a removable second-row middle seat." },
      { years: "2001–2007", name: "1st gen (XU20)", note: "Five seats at launch; optional third row from 2004." },
    ],
    tips: [THIRD_ROW_TIP, SECOND_ROW_TIP, "Highlander Hybrid and the larger Grand Highlander have their own pages in our catalog."],
    metaDescription:
      "Toyota Highlander EVA floor mats, 2001–2025, with third-row mats and bench or captain's chair layouts. Hand-cut, 30-day returns.",
  },

  "toyota/grand-highlander": {
    intro: [
      "The Grand Highlander, new for 2024, is a separate, larger three-row SUV rather than a stretched Highlander. Its third row is roomy enough for adults.",
      "It comes as a gas 2.4L turbo, a hybrid and the Hybrid MAX, with eight seats and a second-row bench or seven with captain's chairs.",
    ],
    generations: [
      { years: "2024+", name: "1st gen", note: "Three rows standard; an LE trim was added for 2025." },
    ],
    tips: [THIRD_ROW_TIP, SECOND_ROW_TIP, "Grand Highlander Hybrid has its own page in our catalog."],
    metaDescription:
      "Toyota Grand Highlander EVA floor mats for 2024–2025, three rows with bench or captain's chairs. Hand-cut in Rochester, NY, 30-day returns.",
  },

  "honda/pilot": {
    intro: [
      "Every Pilot since 2003 has three rows. Most seat eight with a second-row bench; captain's chairs for seven arrived on the Elite for 2016.",
      "On 2023 and newer Touring and Elite models, the second-row middle seat can be removed and stored under the cargo floor.",
    ],
    generations: [
      { years: "2023+", name: "4th gen", note: "Larger, with a removable second-row middle seat on Touring and Elite; refreshed for 2026." },
      { years: "2016–2022", name: "3rd gen", note: "Captain's chairs on the Elite." },
      { years: "2009–2015", name: "2nd gen", note: "Redesign, eight seats." },
      { years: "2003–2008", name: "1st gen", note: "Eight seats in three rows with a flat rear load floor." },
    ],
    tips: [THIRD_ROW_TIP, SECOND_ROW_TIP],
    metaDescription:
      "Honda Pilot EVA floor mats, 2003–2025: all three rows, bench or captain's chairs, plus cargo. Hand-cut in Rochester, NY, 30-day returns.",
  },

  "kia/telluride": {
    intro: [
      "Built in West Point, Georgia, the Telluride arrived for 2020 as Kia's largest SUV. It has three rows as standard, with a second-row bench for eight or captain's chairs for seven.",
      "Kia skipped the 2026 model year: the 2025 Telluride was followed directly by the redesigned 2027 model.",
    ],
    generations: [
      { years: "2020–2025", name: "1st gen", note: "V6 only; refreshed for 2023." },
    ],
    tips: [THIRD_ROW_TIP, SECOND_ROW_TIP],
    metaDescription:
      "Kia Telluride EVA floor mats for 2020–2025: three rows, eight seats or seven with captain's chairs, plus cargo. 30-day returns.",
  },

  "hyundai/santa-fe": {
    intro: [
      "The Santa Fe has changed shape more than most SUVs. It has been two-row, optional three-row, sold in two lengths at once, two-row again, and since 2024 a boxy three-row SUV.",
      "For 2013–2018 Hyundai sold the short two-row Santa Fe Sport and the long three-row Santa Fe side by side, and they need different mats.",
    ],
    generations: [
      { years: "2024+", name: "5th gen (MX5)", note: "Boxy redesign with three rows standard." },
      { years: "2019–2023", name: "4th gen (TM)", note: "Two rows; Hybrid added for 2021 and Plug-in Hybrid for 2022." },
      { years: "2013–2018", name: "3rd gen (DM)", note: "Two-row Santa Fe Sport and long-wheelbase three-row Santa Fe." },
      { years: "2007–2012", name: "2nd gen (CM)", note: "Optional third row through 2009." },
      { years: "2001–2006", name: "1st gen (SM)", note: "Two-row mid-size SUV." },
    ],
    tips: [
      THIRD_ROW_TIP,
      "Santa Fe Sport, Santa Fe XL and Santa Fe Hybrid have their own pages in our catalog.",
    ],
    metaDescription:
      "Hyundai Santa Fe EVA floor mats, 2001–2025, two-row and three-row versions of every generation. Sport, XL and Hybrid too. 30-day returns.",
  },

  "hyundai/palisade": {
    intro: [
      "The Palisade replaced the three-row Santa Fe XL as Hyundai's largest SUV for 2020. Every US Palisade has three rows, with eight seats and a second-row bench or seven with captain's chairs.",
      "The second generation arrived for 2026 on a longer wheelbase and added the first Palisade Hybrid.",
    ],
    generations: [
      { years: "2026+", name: "2nd gen (LX3)", note: "Longer wheelbase; hybrid added." },
      { years: "2020–2025", name: "1st gen (LX2)", note: "V6 only; refreshed for 2023." },
    ],
    tips: [THIRD_ROW_TIP, SECOND_ROW_TIP],
    metaDescription:
      "Hyundai Palisade EVA floor mats for 2020–2025: all three rows, bench or captain's chairs, and cargo. Hand-cut, 30-day returns.",
  },

  "kia/sorento": {
    intro: [
      "The Sorento started as a body-on-frame compact SUV for 2003. After a gap with no 2010 model year, it returned for 2011 as a larger unibody SUV with an available third row.",
      "Since 2019 the third row is standard. The 2021 and newer Sorento seats seven with a bench or six with captain's chairs, and the Plug-in Hybrid comes with captain's chairs.",
    ],
    generations: [
      { years: "2021+", name: "4th gen (MQ4)", note: "Three rows; Hybrid and Plug-in Hybrid added; refreshed for 2024." },
      { years: "2016–2020", name: "3rd gen (UM)", note: "Third row standard on all trims from 2019." },
      { years: "2011–2015", name: "2nd gen (XM)", note: "Unibody, mid-size, with an available third row." },
      { years: "2003–2009", name: "1st gen (BL)", note: "Truck-style body-on-frame SUV." },
    ],
    tips: [THIRD_ROW_TIP, SECOND_ROW_TIP, "Sorento Hybrid has its own page in our catalog."],
    metaDescription:
      "Kia Sorento EVA floor mats, 2003–2025: five, six and seven seats, gas, Hybrid or Plug-in. Cut per generation, 30-day returns.",
  },

  "chevrolet/traverse": {
    intro: [
      "Every Traverse since 2009 has three rows, seating eight with a bench or seven with second-row captain's chairs.",
      "The 2024 redesign made captain's chairs standard on most trims and gave it one of the biggest cargo areas in its class, about 98 cubic feet with the seats folded.",
    ],
    generations: [
      { years: "2024+", name: "3rd gen", note: "Captain's chairs on most trims; a bench on the LS and optionally the LT." },
      { years: "2018–2023", name: "2nd gen", note: "Redesign; available power-folding third row. The 2024 Traverse Limited is this model." },
      { years: "2009–2017", name: "1st gen", note: "Eight seats standard, seven with captain's chairs; refreshed for 2013." },
    ],
    tips: [THIRD_ROW_TIP, SECOND_ROW_TIP, "2024 Traverse Limited: write “Limited” so we use the earlier generation."],
    metaDescription:
      "Chevrolet Traverse EVA floor mats, 2009–2025: three rows, bench or captain's chairs, plus a large cargo liner. 30-day returns.",
  },

  "toyota/sienna": {
    intro: [
      "The Sienna has been the only minivan in its class with all-wheel drive for much of its life. Since 2021 every Sienna is a hybrid, with optional AWD from a separate electric rear motor.",
      "On 2021 and newer vans the second-row seats can no longer be removed. The eight-seat bench and the seven-seat captain's chairs, which slide about 25 inches, sit on different floor rails.",
    ],
    generations: [
      { years: "2021+", name: "4th gen (XL40)", note: "Hybrid-only; long-sliding second row, not removable." },
      { years: "2011–2020", name: "3rd gen (XL30)", note: "Optional long-sliding second-row Lounge Seating; AWD continued." },
      { years: "2004–2010", name: "2nd gen (XL20)", note: "60/40 fold-flat third row; seven or eight seats; AWD available." },
      { years: "1998–2003", name: "1st gen (XL10)", note: "Removable second-row seats." },
    ],
    tips: [MINIVAN_ROWS_TIP, "Seven or eight seats? Write it in the trim field."],
    metaDescription:
      "Toyota Sienna EVA floor mats, 1998–2025: every row and the cargo area, seven or eight seats, hybrid and AWD. 30-day returns.",
  },

  "honda/odyssey": {
    intro: [
      "The first Odyssey (1995–1998) was a smaller van with four hinged doors. Since 1999 it has sliding doors and a third row that folds into a well in the floor.",
      "On 2018 and newer vans, the Magic Slide second-row seats on EX and above slide sideways and can be removed. They ride on floor tracks, which matters for mats in the middle row.",
    ],
    generations: [
      { years: "2018+", name: "5th gen", note: "Magic Slide second row; refreshed for 2021 and 2025." },
      { years: "2011–2017", name: "4th gen", note: "Redesign with a stowable 60/40 third row." },
      { years: "2005–2010", name: "3rd gen", note: "Magic Seat third row, an optional eighth seat, and an in-floor storage bin where the spare used to be." },
      { years: "1999–2004", name: "2nd gen", note: "Much larger, with dual sliding doors." },
      { years: "1995–1998", name: "1st gen", note: "Smaller van with four hinged doors." },
    ],
    tips: [MINIVAN_ROWS_TIP, "Seven or eight seats, and Magic Slide or not? Write it in the trim field."],
    metaDescription:
      "Honda Odyssey EVA floor mats, 1995–2025: all rows and cargo, seven or eight seats, Magic Slide second row. Hand-cut, 30-day returns.",
  },
};

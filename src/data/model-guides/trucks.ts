import type { ModelGuide } from "./types";

/**
 * Pickups and body-on-frame SUVs. Pickup pages sell a two-row cab set or
 * a front-row set (no bed liner), so the tips point people at the right
 * one for their cab and at the trim field for the cab name.
 */

const CAB_TIP_TWO_ROWS =
  "Crew, double or extended cab with a rear seat: pick the front + rear set. Regular cab: pick front row only.";
const CAB_TIP_NAME =
  "Write your exact cab name and whether you have a front bench or bucket seats with a console in the trim field; it changes the front floor.";

export const TRUCK_GUIDES: Record<string, ModelGuide> = {
  "ford/f-150": {
    intro: [
      "The F-Series has been America's best-selling vehicle for decades, and the F-150 is its heart. Over our catalog years it has been sold as a Regular Cab, a SuperCab and, since 2001, the SuperCrew, widely credited as the first half-ton pickup with four full-size doors.",
      "Cab style and front seating change the floor more than anything else. SuperCab and SuperCrew trucks come with either a 40/20/40 front bench or bucket seats with a console, depending on trim.",
    ],
    generations: [
      { years: "2021+", name: "14th gen", note: "New interior with available fold-flat Max Recline front seats and a fold-out console work surface; PowerBoost hybrid added." },
      { years: "2015–2020", name: "13th gen", note: "Aluminum-body redesign; Regular Cab, SuperCab and SuperCrew." },
      { years: "2009–2014", name: "12th gen", note: "New cab; the Regular Cab went back to two doors." },
      { years: "2004–2008", name: "11th gen", note: "All-new truck; every cab had four doors, including small rear-access doors on the Regular Cab." },
      { years: "1997–2004", name: "10th gen", note: "Ground-up redesign; SuperCab got a third door, then a fourth for 1999, and SuperCrew arrived in 2001. The 2004 F-150 Heritage is this truck." },
      { years: "1992–1996", name: "9th gen", note: "Restyled truck on the same basic cab; Regular Cab and SuperCab." },
      { years: "1990–1991", name: "8th gen", note: "Regular Cab and two-door SuperCab." },
    ],
    tips: [
      CAB_TIP_TWO_ROWS,
      CAB_TIP_NAME,
      "2004 is a split year: tell us whether you have the new truck or the F-150 Heritage. The Lightning EV and Raptor have their own pages.",
    ],
    metaDescription:
      "Ford F-150 EVA floor mats, 1990–2025: Regular Cab, SuperCab and SuperCrew, bench or buckets. Hand-cut in Rochester, NY, 30-day returns.",
  },

  "chevrolet/silverado": {
    intro: [
      "The Silverado 1500 replaced the C/K pickup for 1999. Its cab lineup has shifted over the years: the Extended Cab with small rear-hinged doors was replaced for 2014 by the Double Cab, whose rear doors are larger and open on their own.",
      "From the 2022 refresh, trucks with a front bench keep a column shifter while bucket-seat trucks get a console shifter, so front floors differ within the same year. A fully redesigned Silverado arrives for 2027.",
    ],
    generations: [
      { years: "2019–2026", name: "4th gen (T1XX)", note: "Regular, Double and Crew Cab; new interior with the 2022 refresh. The 2022 Silverado LTD kept the old interior." },
      { years: "2014–2018", name: "3rd gen (K2XX)", note: "Double Cab with front-hinged rear doors replaced the Extended Cab. The 2019 Silverado LD is this truck." },
      { years: "2007–2013", name: "2nd gen (GMT900)", note: "All-new truck and interior; Regular, Extended and Crew Cab." },
      { years: "1999–2006", name: "1st gen (GMT800)", note: "Regular and Extended Cab; the 1500 Crew Cab joined for 2004. The 2007 Silverado Classic is this truck." },
    ],
    tips: [
      CAB_TIP_TWO_ROWS,
      CAB_TIP_NAME,
      "Split years (2007 Classic, 2019 LD, 2022 LTD): write the exact name so we use the right generation.",
    ],
    metaDescription:
      "Chevy Silverado 1500 EVA floor mats, 1999–2025: Regular, Extended, Double and Crew Cab, including split-year Classic and LD trucks. 30-day returns.",
  },

  "ram/1500": {
    intro: [
      "The big-rig styled Dodge Ram of 1994 started the modern Ram 1500. Over the years it has been sold as a Regular Cab, Club Cab, Quad Cab, Crew Cab and even a Mega Cab, and Ram became its own brand for 2011.",
      "Many Crew Cab trucks have RamBins, storage wells in the rear floor with removable liners and drain plugs, so the rear floor is not flat.",
    ],
    generations: [
      { years: "2019+", name: "5th gen (DT)", note: "Larger all-new truck, Quad Cab or Crew Cab only; refreshed for 2025." },
      { years: "2009–2018", name: "4th gen (DS)", note: "New cab with a true Crew Cab added; sold on as the Ram 1500 Classic through 2024." },
      { years: "2002–2008", name: "3rd gen (DR)", note: "All-new truck; Regular and Quad Cab, plus a long Mega Cab from 2006." },
      { years: "1994–2001", name: "2nd gen (BR)", note: "Big-rig styling; Club Cab from 1995 and four-door Quad Cab from 1998." },
    ],
    tips: [
      CAB_TIP_TWO_ROWS,
      "Crew Cab with RamBins in the rear floor: mention it in the trim field.",
      "The Ram 1500 Classic (2019–2024) and TRX have their own pages in our catalog.",
    ],
    metaDescription:
      "Ram 1500 EVA floor mats, 1994–2025: Quad Cab, Crew Cab, Mega Cab and Regular Cab, with RamBin rear floors noted. Hand-cut, 30-day returns.",
  },

  "gmc/sierra": {
    intro: [
      "The Sierra 1500 is the Silverado's twin, with its own styling and interiors. It shares the same cab changes: the Extended Cab gave way to the Double Cab for 2014, and the 1500 Crew Cab arrived for 2004.",
      "For 2022 GMC sold two different Sierra 1500s side by side: the refreshed truck with a new interior and the carryover Sierra Limited. A redesigned Sierra arrives for 2027.",
    ],
    generations: [
      { years: "2019–2026", name: "T1XX", note: "Regular, Double and Crew Cab; new interior on every trim but the Pro for 2022." },
      { years: "2014–2018", name: "K2XX", note: "Double Cab replaced the Extended Cab. The 2019 Sierra Limited is this truck." },
      { years: "2007–2013", name: "GMT900", note: "All-new truck and interior; Regular, Extended and Crew Cab." },
      { years: "1999–2006", name: "GMT800", note: "Regular and Extended Cab; Crew Cab added for 2004. The 2007 Sierra Classic is this truck." },
    ],
    tips: [
      CAB_TIP_TWO_ROWS,
      CAB_TIP_NAME,
      "2019 and 2022 Sierra Limited: write “Limited” so we use the earlier generation. The Sierra EV has its own page.",
    ],
    metaDescription:
      "GMC Sierra 1500 EVA floor mats for 1999–2025, every cab and the Limited split years. Hand-cut in Rochester, NY, 11 edge colors, 30-day returns.",
  },

  "toyota/tacoma": {
    intro: [
      "The Tacoma started as a compact pickup in 1995 and grew to mid-size for 2005. It has been sold as a Regular Cab, Xtracab and Access Cab, and a four-door Double Cab.",
      "The 2024 Tacoma changed the lineup again: the two-door XtraCab has no rear seat at all, just lockable storage on the rear floor, and the i-FORCE MAX hybrid is Double Cab only.",
    ],
    generations: [
      { years: "2024+", name: "4th gen", note: "Two-seat XtraCab or four-door Double Cab; i-FORCE MAX hybrid added." },
      { years: "2016–2023", name: "3rd gen", note: "Redesign offered as Access Cab or Double Cab." },
      { years: "2005–2015", name: "2nd gen", note: "Grew to mid-size; Regular, Access and Double Cab (Regular Cab dropped for 2015)." },
      { years: "1995–2004", name: "1st gen", note: "Compact pickup; Regular Cab and Xtracab, with a four-door Double Cab added mid-run." },
    ],
    tips: [
      "Double Cab: pick the front + rear set. Regular Cab, and the two-seat 2024+ XtraCab: pick front row only.",
      "Access Cab or Xtracab with rear jump seats: tell us in the trim field.",
    ],
    metaDescription:
      "Toyota Tacoma EVA floor mats, 1995–2025: Regular, Xtracab, Access and Double Cab, including the 2024 XtraCab. Hand-cut, 30-day returns.",
  },

  "toyota/tundra": {
    intro: [
      "Toyota's full-size pickup arrived for 2000 and grew much larger with the 2007 redesign, which introduced the roomy CrewMax cab with reclining rear seats.",
      "On 2022 and newer trucks, gas Tundras have storage under the rear seat, while the i-FORCE MAX hybrid uses that space for its battery.",
    ],
    generations: [
      { years: "2022+", name: "3rd gen", note: "All-new truck; Double Cab and CrewMax only; i-FORCE MAX hybrid added." },
      { years: "2007–2021", name: "2nd gen", note: "Much larger truck; Double Cab with conventional rear doors and the new CrewMax; Regular Cab through 2017." },
      { years: "2000–2006", name: "1st gen", note: "Regular Cab and Access Cab; four-door Double Cab added for 2004." },
    ],
    tips: [
      CAB_TIP_TWO_ROWS,
      "Tell us whether it is a Double Cab or a CrewMax; they have different rear floors.",
    ],
    metaDescription:
      "Toyota Tundra EVA floor mats, 2000–2025: Regular, Access, Double Cab and CrewMax, gas or i-FORCE MAX hybrid. Hand-cut, 30-day returns.",
  },

  "ford/maverick": {
    intro: [
      "The Maverick is a compact unibody pickup, sold only as a four-door crew cab with five seats since it launched for 2022. It was refreshed for 2025 with a new front end, a larger touchscreen and the Lobo trim.",
      "Hybrid and gas trucks have slightly different rear floors: the hybrid battery sits under the passenger-side rear seat and takes part of the under-seat storage bin.",
    ],
    generations: [
      { years: "2022+", name: "1st gen", note: "Four-door crew cab only; refreshed for 2025, when the hybrid also became available with AWD." },
    ],
    tips: [
      "Every Maverick has two rows, so pick the front + rear set.",
      "Hybrid or 2.0L EcoBoost? Mention it in the trim field.",
    ],
    metaDescription:
      "Ford Maverick EVA floor mats for 2022–2025, hybrid or EcoBoost, cut for the four-door crew cab. Waterproof honeycomb EVA, 30-day returns.",
  },

  "ford/ranger": {
    intro: [
      "The Ranger was America's classic compact pickup until 2011. After an eight-year break it returned for 2019 as a mid-size truck.",
      "Old and new Rangers are completely different floors. The classic SuperCab had small rear jump seats, while every Ranger sold since 2024 is a four-door SuperCrew with a full rear bench.",
    ],
    generations: [
      { years: "2024+", name: "New generation", note: "All-new truck, SuperCrew only in North America; Ranger Raptor added." },
      { years: "2019–2023", name: "US return", note: "Mid-size Ranger, four-door SuperCab or SuperCrew." },
      { years: "1998–2011", name: "3rd gen", note: "New cab and longer SuperCab, with two rear-hinged rear doors from 1999." },
      { years: "1993–1997", name: "2nd gen", note: "Redesign; Regular Cab and two-door SuperCab." },
      { years: "1990–1992", name: "1st gen", note: "Regular Cab and SuperCab with rear jump seats." },
    ],
    tips: [
      "SuperCrew: pick the front + rear set. Regular Cab: pick front row only.",
      "Classic SuperCab with jump seats, or a 2019–2023 SuperCab: tell us in the trim field.",
      "The Ranger Raptor has its own page in our catalog.",
    ],
    metaDescription:
      "Ford Ranger EVA floor mats: classic 1990–2011 Regular Cab and SuperCab, and the mid-size 2019+ SuperCab and SuperCrew. 30-day returns.",
  },

  "chevrolet/colorado": {
    intro: [
      "The Colorado arrived for 2004 as a compact pickup, skipped the 2013 and 2014 model years, and came back for 2015 as a mid-size truck.",
      "Since the 2023 redesign it is sold only as a Crew Cab with one bed length, so every current Colorado shares one rear floor layout.",
    ],
    generations: [
      { years: "2023+", name: "3rd gen", note: "All-new truck, Crew Cab only." },
      { years: "2015–2022", name: "2nd gen", note: "Mid-size redesign; Extended Cab and Crew Cab." },
      { years: "2004–2012", name: "1st gen", note: "Compact pickup; Regular, four-door Extended and Crew Cab." },
    ],
    tips: [
      "Crew Cab: pick the front + rear set. Regular Cab: pick front row only.",
      "Extended Cab: tell us in the trim field.",
    ],
    metaDescription:
      "Chevrolet Colorado EVA floor mats for 2004–2012 and 2015–2025, Regular, Extended and Crew Cab. Hand-cut in Rochester, NY, 30-day returns.",
  },

  "chevrolet/tahoe": {
    intro: [
      "The Tahoe took over from the full-size Blazer for 1995 and has been a four-door-only SUV since 2000. Its third row went from a lift-out seat to a bolted-in fold-flat seat for 2015, and it is standard on the 2021 and newer model.",
      "The 2021 redesign moved to independent rear suspension, which lowered the rear load floor by about 5.3 inches. From 2021 the LS could be ordered with a front bench for nine seats, which removes the center console.",
    ],
    generations: [
      { years: "2021+", name: "T1XX", note: "Lower rear floor and about 10 inches more third-row legroom; refreshed for 2025 with a column shifter." },
      { years: "2015–2020", name: "K2XX", note: "Second and third rows fold flat; the third row is bolted in." },
      { years: "2007–2014", name: "GMT900", note: "Removable 50/50 third row; two-mode Tahoe Hybrid 2008–2013." },
      { years: "2000–2006", name: "GMT800", note: "Four-door only; optional lift-out third row." },
      { years: "1995–1999", name: "GMT400", note: "Two-door and four-door versions." },
    ],
    tips: [
      "Third row: turn on “My car has a third row of seats” with a full set.",
      "Front bench, or second-row captain's chairs instead of a bench? Write it in the trim field.",
    ],
    metaDescription:
      "Chevrolet Tahoe EVA floor mats, 1995–2025, with third-row mats and bench or captain's chair layouts. Hand-cut, 30-day returns.",
  },

  "ford/expedition": {
    intro: [
      "The Expedition has had three rows since 1997. The 2003 model introduced independent rear suspension, which lowered the rear floor about nine inches and allowed the industry's first power fold-flat third row.",
      "Before 2007 it could seat nine with a front bench; since then every Expedition has front bucket seats. The long version, the EL and later the Max, has its own page in our catalog.",
    ],
    generations: [
      { years: "2025+", name: "5th gen", note: "Redesign; eight seats with a second-row bench or seven with captain's chairs." },
      { years: "2018–2024", name: "4th gen", note: "Aluminum-body redesign; the long version became the Expedition Max." },
      { years: "2007–2017", name: "3rd gen", note: "Front bucket seats only; long-wheelbase Expedition EL added." },
      { years: "2003–2006", name: "2nd gen", note: "Lower rear floor and a third row that folds flat into it." },
      { years: "1997–2002", name: "1st gen", note: "Up to nine seats with a front bench." },
    ],
    tips: [
      "Third row: turn on “My car has a third row of seats” with a full set.",
      "Second-row captain's chairs or a front bench? Write it in the trim field.",
      "Expedition EL or Max: pick that page, the cargo area is longer.",
    ],
    metaDescription:
      "Ford Expedition EVA floor mats, 1997–2025: three rows, bench or captain's chairs, standard length. Hand-cut in Rochester, NY, 30-day returns.",
  },

  "jeep/wrangler": {
    intro: [
      "Every Wrangler has removable doors and a fold-down windshield, and its owners get the floor wetter than most. JK and JL models even have rubber drain plugs under small removable pieces of carpet.",
      "The two-door seats four. The four-door Wrangler Unlimited arrived with the JK for 2007 and seats five.",
    ],
    generations: [
      { years: "2018+", name: "JL", note: "Two-door and four-door; 4xe plug-in hybrid from 2021; new touchscreen for 2024." },
      { years: "2007–2018", name: "JK", note: "Larger redesign that introduced the four-door Unlimited." },
      { years: "1997–2006", name: "TJ", note: "Coil-spring redesign; no 1996 model year. Long-wheelbase Unlimited (LJ) for 2004–2006." },
      { years: "1990–1995", name: "YJ", note: "Two-door only, with rectangular headlights." },
    ],
    tips: [
      "2018 was sold as both JK and JL: tell us which one you have.",
      "The Wrangler Unlimited and the 4xe have their own pages in our catalog.",
    ],
    metaDescription:
      "Jeep Wrangler EVA floor mats for YJ, TJ, JK and JL, 1990–2025. Waterproof and made for open-top, doors-off driving. 30-day returns.",
  },

  "ford/bronco": {
    intro: [
      "The full-size Bronco ended in 1996, and the name came back for 2021 on a new body-on-frame SUV with removable doors and roof, as a two-door (four seats) or a four-door (five seats).",
      "Some 2021 and newer Broncos have rubberized washout floors with drain plugs, and on a Badlands, choosing leather seats switches the floor back to carpet.",
    ],
    generations: [
      { years: "2021+", name: "6th gen", note: "Two-door or four-door, removable doors and roof; Bronco Raptor added for 2022." },
      { years: "1992–1996", name: "5th gen", note: "The last full-size Bronco, two-door with a lift-off hardtop." },
      { years: "1990–1991", name: "4th gen", note: "Full-size two-door based on the F-Series, with a removable rear hardtop." },
    ],
    tips: [
      "Tell us two-door or four-door; the rear floors differ.",
      "Washout rubber floor or carpet? Mention it in the trim field. The Bronco Sport and Raptor have their own pages.",
    ],
    metaDescription:
      "Ford Bronco EVA floor mats for the 1990–1996 full-size Bronco and the 2021+ two- and four-door. Waterproof, hand-cut, 30-day returns.",
  },

  "toyota/4runner": {
    intro: [
      "The 4Runner has been four-door only since 1996, and it has offered an optional third row since 2003. On the 2025 redesign, the third row is available only on some gas versions, never with the hybrid.",
      "The 2010–2024 model offers a sliding cargo deck that pulls out of the tailgate opening and is rated for 440 pounds, so the cargo floor depends on how your truck is equipped.",
    ],
    generations: [
      { years: "2025+", name: "6th gen", note: "New platform, i-FORCE MAX hybrid, tumble-folding second row." },
      { years: "2010–2024", name: "5th gen", note: "Available fold-flat third row and sliding cargo deck." },
      { years: "2003–2009", name: "4th gen", note: "Redesign; optional third row introduced." },
      { years: "1996–2002", name: "3rd gen", note: "All-new, larger four-door-only SUV." },
      { years: "1990–1995", name: "2nd gen", note: "Four-door, plus a two-door sold in the US until 1992." },
    ],
    tips: [
      "Third row: turn on “My car has a third row of seats” with a full set.",
      "2010–2024 with the sliding cargo deck: mention it so the cargo liner matches.",
    ],
    metaDescription:
      "Toyota 4Runner EVA floor mats, 1990–2025: two and three rows, sliding cargo deck, hybrid. Hand-cut in Rochester, NY, 30-day returns.",
  },
};

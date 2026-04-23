import type { CarModel, MatSetType } from "@/types";

/**
 * How the vehicle's interior shapes the mat-set options we sell:
 *
 *  - `standard`  — regular sedan / SUV / crossover / hatch / minivan. All four
 *                  set types apply.
 *  - `twoSeater` — strict 2-seat cabin (roadsters, supercars, 2-seat coupes
 *                  with no usable rear row). No "full set" / "cargo" sets —
 *                  only Fronts.
 *  - `pickup`    — truck with open bed. Cabin sets work like standard; the
 *                  "cargo" option becomes a larger truck-bed liner instead.
 *  - `semi`      — Class 6-8 semi / box truck. Only front mats (cargo area is
 *                  a trailer / separate bed, not a car floor).
 */
export type VehicleConfigProfile = "standard" | "twoSeater" | "pickup" | "semi";

/**
 * Model IDs that have a strict 2-seat cabin (no usable rear seats).
 * Generally: roadsters, supercars, and 2-seat coupes. 2+2 coupes with tight
 * rear seats (911, Mustang, Challenger, Supra, GR86, etc.) stay `standard`.
 */
const STRICT_TWO_SEATER_IDS = new Set<string>([
  // Roadsters / convertibles with no rear row
  "mx-5",
  "z3",
  "z4",
  "boxster",
  "718-boxster",
  "sl",
  "slc",
  "slk",
  "allante",
  "dawn",
  "roadster-og",
  "roadster",
  "cascada",
  "sky",
  "solstice",
  "124-spider",
  "azure",
  "spyder",
  "grancabrio",

  // Strict 2-seat coupes / supercars
  "corvette",
  "viper",
  "s2000",
  "tt",
  "tts",
  "tt-rs",
  "r8",
  "amg-gt",
  "cayman",
  "718-cayman",
  "nsx",
  "mr2",
  "rx-7",
  "928",
  "944",
  "968",

  // Lamborghini
  "huracan",
  "aventador",
  "diablo",
  "revuelto",
  "murcielago",
  "gallardo",
  "countach",
  "temerario",
  "sian",

  // McLaren
  "720s",
  "570s",
  "600lt",
  "650s",
  "675lt",
  "mp4-12c",
  "750s",
  "gts",
  "senna",
  "speedtail",
  "w1",
  "artura",

  // Aston Martin / others
  "vantage",
  "dbs",
  "dbs-superleggera",
  "valkyrie",
]);

export function getVehicleProfile(model: CarModel): VehicleConfigProfile {
  // Commercial big-rigs and medium-duty box trucks: front cabin only
  if (model.category === "commercial") return "semi";
  if (model.bodyType === "Седельный тягач") return "semi";
  if (model.bodyType === "Грузовик") return "semi";

  // Pickups keep full-cabin options + a larger truck-bed liner
  if (model.bodyType === "Пикап") return "pickup";

  // Strict 2-seaters
  if (STRICT_TWO_SEATER_IDS.has(model.id)) return "twoSeater";

  return "standard";
}

export function getAvailableMatSets(
  profile: VehicleConfigProfile,
): MatSetType[] {
  switch (profile) {
    case "semi":
    case "twoSeater":
      return ["front"];
    case "pickup":
    case "standard":
    default:
      return ["front", "full", "cargo", "full-cargo"];
  }
}

export function getDefaultMatSet(profile: VehicleConfigProfile): MatSetType {
  return profile === "semi" || profile === "twoSeater"
    ? "front"
    : "full-cargo";
}

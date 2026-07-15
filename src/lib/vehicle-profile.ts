import type { CarModel, MatSetType } from "@/types";
import { mockModels } from "@/data/catalog/models";

/**
 * How the vehicle's interior shapes the mat-set options we sell:
 *
 *  - `standard`  — regular sedan / SUV / crossover / hatch with two rows
 *                  of seats + a trunk. Sells front-and-rear cabin sets,
 *                  trunk-only, and full kit (cabin + trunk).
 *  - `minivan`   — minivan with three rows of seats + a trunk. Adds a
 *                  middle-row dimension on top of the standard sets.
 *  - `twoSeater` — strict 2-seat cabin (roadsters, supercars, 2-seat coupes
 *                  with no usable rear row). No 3-row cabin set —
 *                  only "front row only" / cargo / both.
 *  - `pickup`    — truck with an open bed. Offers the crew-cab set (two
 *                  rows, 4 mats) and the regular-cab set (one row,
 *                  2 mats) — the customer picks their cab. No truck-bed
 *                  liner while the supplier doesn't make one.
 *  - `semi`      — Class 6-8 semi / box truck. Only one big front-cabin
 *                  set (cargo area is a trailer / separate bed, not a
 *                  car floor).
 */
export type VehicleConfigProfile =
  | "standard"
  | "minivan"
  | "twoSeater"
  | "pickup"
  | "semi";

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

  // Pre-existing 2-seaters that were missing the flag
  "crossfire",
  "gt",
  "smart-fortwo",
  "smart-fortwo-ed",

  // Catalog expansion wave 2 (Jul 2026)
  "12cilindri",
  "12cilindri-spider",
  "296-gtb",
  "296-gts",
  "296-speciale",
  "348",
  "348-spider",
  "360-challenge-stradale",
  "360-modena",
  "360-spider",
  "430-scuderia",
  "458-italia",
  "458-speciale",
  "458-spider",
  "488-gtb",
  "488-pista",
  "488-pista-spider",
  "488-spider",
  "512-tr",
  "550-barchetta",
  "550-maranello",
  "570gt",
  "575-superamerica",
  "575m-maranello",
  "599-gtb",
  "620r",
  "765lt",
  "812-competizione",
  "812-gts",
  "812-superfast",
  "8c-competizione",
  "daytona-sp3",
  "elan",
  "elise",
  "elva",
  "emira",
  "enzo",
  "esprit",
  "evija",
  "exige",
  "f12berlinetta",
  "f355",
  "f355-spider",
  "f40",
  "f430",
  "f430-spider",
  "f50",
  "f512-m",
  "f8-spider",
  "f8-tributo",
  "f80",
  "laferrari",
  "mc20-cielo",
  "mcpura",
  "p1",
  "plymouth-prowler",
  "sf90-spider",
  "sf90-stradale",
  "smart-fortwo-cabrio",
  "solstice-coupe",
  "ssr",
  "suzuki-x-90",
  "tc-maserati",
  "testarossa",
  "v8-vantage",
  "valhalla",

  // Top-brand completeness audit (Jul 2026)
  "z3-coupe",
  "sls-amg-roadster",
  "amg-gt-roadster",

  // Catalog expansion (Jul 2026)
  "cr-z",
  "r8-spyder",
  "tt-roadster",
  "z8",
  "slr-mclaren",
  "carrera-gt",
  "918-spyder",
  "prowler",
  "xlr",
  "4c",
  "spider",
]);

export function getVehicleProfile(model: CarModel): VehicleConfigProfile {
  // Commercial big-rigs and medium-duty box trucks: front cabin only
  if (model.category === "commercial") return "semi";
  if (model.bodyType === "Седельный тягач") return "semi";
  if (model.bodyType === "Грузовик") return "semi";

  // Pickups: two-row cabin, no truck-bed liner anymore
  if (model.bodyType === "Пикап") return "pickup";

  // Minivans: three rows of seats + trunk
  if (model.bodyType === "Минивэн") return "minivan";

  // Strict 2-seaters
  if (STRICT_TWO_SEATER_IDS.has(model.id)) return "twoSeater";

  return "standard";
}

export function getAvailableMatSets(
  profile: VehicleConfigProfile,
): MatSetType[] {
  switch (profile) {
    case "semi":
      return ["front"];
    case "pickup":
      // full = crew/double cab (2 rows), front = regular cab (1 row).
      return ["full", "front"];
    case "twoSeater":
      return ["front", "cargo", "full-cargo"];
    case "minivan":
      return ["front", "full", "cargo", "full-cargo"];
    case "standard":
    default:
      return ["full", "cargo", "full-cargo"];
  }
}

export function getDefaultMatSet(profile: VehicleConfigProfile): MatSetType {
  // Default = first item in MAT_SETS_BY_PROFILE[profile]. Mirrors the
  // configurator's first option so we don't open the page on the most
  // expensive set ($277 full-cargo) and scare entry-level buyers.
  switch (profile) {
    case "semi":
    case "twoSeater":
    case "minivan":
      return "front";
    case "pickup":
    case "standard":
    default:
      return "full";
  }
}

/**
 * Resolve a vehicle profile from a cart-item / order-item modelId.
 *
 * The cart stores `modelId` as `${brandSlug}-${modelSlug}` (matching the
 * id we seed into Prisma), but legacy carts may carry just the model slug.
 * We try both shapes; fall back to "standard" if nothing matches.
 */
let modelByIdCache: Map<string, CarModel> | null = null;
function getModelIndex(): Map<string, CarModel> {
  if (modelByIdCache) return modelByIdCache;
  const idx = new Map<string, CarModel>();
  for (const m of mockModels) {
    idx.set(`${m.brandId}-${m.slug}`, m);
    // Last-write-wins for plain slugs is fine — this lookup is a fallback
    // only and the canonical id is `${brandId}-${slug}`.
    idx.set(m.id, m);
  }
  modelByIdCache = idx;
  return idx;
}

export function findProfileByModelId(
  modelId: string | undefined | null,
): VehicleConfigProfile {
  if (!modelId) return "standard";
  const m = getModelIndex().get(modelId);
  return m ? getVehicleProfile(m) : "standard";
}

/**
 * Code-catalog model for a cart/order modelId, or null when unknown
 * (admin custom-catalog models live only in the DB). Callers that need
 * "is this REALLY a sedan or just the standard fallback" use this
 * instead of findProfileByModelId.
 */
export function findModelById(
  modelId: string | undefined | null,
): CarModel | null {
  if (!modelId) return null;
  return getModelIndex().get(modelId) ?? null;
}

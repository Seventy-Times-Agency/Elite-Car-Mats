import { z } from "zod";

const profileEnum = z.enum([
  "standard",
  "pickup",
  "twoSeater",
  "semi",
  "minivan",
]);

const matSetEnum = z.enum(["front", "full", "cargo", "full-cargo"]);

// null / undefined → delete the override and fall back to code default.
// Number → set / replace the override.
const priceField = z
  .number()
  .nonnegative()
  .max(99_999)
  .nullable()
  .optional();

export const priceOverrideUpsertSchema = z.union([
  z.object({
    profile: profileEnum,
    matSet: matSetEnum,
    price: priceField,
  }),
  // Add-on surcharges (brand plate / heel pad) live in the same table
  // under the pseudo-profile `addon` — see getBadgePrice/getHeelPadPrice.
  z.object({
    profile: z.literal("addon"),
    matSet: z.enum(["badge", "heelPad"]),
    price: priceField,
  }),
]);

export type PriceOverrideUpsertInput = z.infer<
  typeof priceOverrideUpsertSchema
>;

import { z } from "zod";
import { ACCESSORY_SLUGS } from "@/data/accessories";

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
    matSet: z.enum(["badge", "heelPad", "thirdRow"]),
    price: priceField,
  }),
  // Accessories (trunk organizer …): pseudo-profile `accessory`, the
  // "matSet" column carries the catalog slug — see getAccessoryPrice.
  z.object({
    profile: z.literal("accessory"),
    matSet: z.enum(ACCESSORY_SLUGS),
    price: priceField,
  }),
  // Shipping fee and free-shipping threshold — see getShippingSettings.
  z.object({
    profile: z.literal("shipping"),
    matSet: z.enum(["fee", "freeFrom"]),
    price: priceField,
  }),
]);

export type PriceOverrideUpsertInput = z.infer<
  typeof priceOverrideUpsertSchema
>;

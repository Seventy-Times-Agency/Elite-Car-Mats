import { z } from "zod";

const profileEnum = z.enum([
  "standard",
  "pickup",
  "twoSeater",
  "semi",
  "minivan",
]);

const matSetEnum = z.enum(["front", "full", "cargo", "full-cargo"]);

export const priceOverrideUpsertSchema = z.object({
  profile: profileEnum,
  matSet: matSetEnum,
  // null / undefined → delete the override and fall back to code default.
  // Number → set / replace the override.
  price: z
    .number()
    .nonnegative()
    .max(99_999)
    .nullable()
    .optional(),
});

export type PriceOverrideUpsertInput = z.infer<
  typeof priceOverrideUpsertSchema
>;

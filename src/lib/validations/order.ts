import { z } from "zod";
import { ACCESSORY_SLUGS } from "@/data/accessories";

const matSetEnum = z.enum(["front", "full", "cargo", "full-cargo"]);

export const orderItemSchema = z.object({
  // Absent on clients built before accessories existed — means a mat set.
  kind: z.literal("mat").optional(),
  modelId: z.string().min(1),
  brandName: z.string().min(1),
  modelName: z.string().min(1),
  // Upper bound tracks the calendar so next-model-year vehicles (dealers
  // sell them up to a year ahead) don't start failing validation in 2031.
  year: z.number().int().min(1990).max(new Date().getFullYear() + 2),
  matSet: matSetEnum,
  colorId: z.string().min(1),
  edgeColorId: z.string().min(1),
  badgeId: z.string().optional().nullable(),
  // Brand-logo plates count. Loose upper bound here — the billing path
  // clamps to the actual mat count of the chosen set via clampBadgeCount.
  badgeCount: z.number().int().min(1).max(20).optional().nullable(),
  heelPad: z.boolean().optional().default(false),
  thirdRow: z.boolean().optional().default(false),
  quantity: z.number().int().min(1).max(99),
});

/** Accessory line (trunk organizer …). Catalog-validated by the API. */
export const accessoryItemSchema = z.object({
  kind: z.literal("accessory"),
  accessorySlug: z.enum(ACCESSORY_SLUGS),
  variantId: z.string().min(1).max(40),
  quantity: z.number().int().min(1).max(99),
});

export const anyOrderItemSchema = z.union([orderItemSchema, accessoryItemSchema]);

export const createOrderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2, "Укажите имя").max(80),
    phone: z
      .string()
      .trim()
      .min(7, "Укажите телефон")
      .max(30)
      .regex(/^[+()\-\s\d]+$/, "Неверный формат телефона"),
    email: z.string().trim().email("Неверный email"),
  }),
  shipping: z.object({
    // Optional at the schema level: with Stripe enabled the address is
    // collected on the Checkout page and overlaid onto the order by the
    // webhook. /api/orders enforces a non-empty address when payments
    // are NOT configured (manual-confirm flow ships to this address).
    address: z.string().trim().max(200).optional().default(""),
    city: z.string().trim().max(80).optional().default(""),
    state: z.string().trim().max(40).optional().default(""),
    zip: z
      .string()
      .trim()
      .max(20)
      .regex(/^[\d\s\-]*$/, "Неверный ZIP")
      .optional()
      .default(""),
    comment: z.string().trim().max(1000).optional().default(""),
  }),
  items: z
    .array(anyOrderItemSchema)
    .min(1, "Корзина пуста")
    .max(50, "Слишком много позиций в заказе"),
  promoCode: z.string().trim().max(64).optional().nullable(),
  // Where the visit came from (utm / referrer / landing), see
  // lib/analytics/attribution.ts. Free-form here; the API sanitizes it.
  attribution: z.unknown().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type AccessoryItemInput = z.infer<typeof accessoryItemSchema>;
export type AnyOrderItemInput = z.infer<typeof anyOrderItemSchema>;

export function isAccessoryInput(i: AnyOrderItemInput): i is AccessoryItemInput {
  return i.kind === "accessory";
}

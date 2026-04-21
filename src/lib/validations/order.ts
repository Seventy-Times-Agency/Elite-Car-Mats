import { z } from "zod";

const matSetEnum = z.enum(["front", "full", "cargo", "full-cargo"]);

export const orderItemSchema = z.object({
  modelId: z.string().min(1),
  brandName: z.string().min(1),
  modelName: z.string().min(1),
  year: z.number().int().min(1990).max(2030),
  matSet: matSetEnum,
  colorId: z.string().min(1),
  edgeColorId: z.string().min(1),
  badgeId: z.string().optional().nullable(),
  quantity: z.number().int().min(1).max(99),
});

export const createOrderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2, "Please enter your name").max(80),
    phone: z
      .string()
      .trim()
      .min(7, "Please enter a phone number")
      .max(30)
      .regex(/^[+()\-\s\d]+$/, "Invalid phone format"),
    email: z.string().trim().email("Invalid email"),
  }),
  shipping: z.object({
    address: z.string().trim().min(5, "Please enter an address").max(200),
    city: z.string().trim().max(80).optional().default(""),
    state: z.string().trim().max(40).optional().default(""),
    zip: z
      .string()
      .trim()
      .max(20)
      .regex(/^[\d\s\-]*$/, "Invalid ZIP")
      .optional()
      .default(""),
    comment: z.string().trim().max(1000).optional().default(""),
  }),
  items: z.array(orderItemSchema).min(1, "Cart is empty"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;

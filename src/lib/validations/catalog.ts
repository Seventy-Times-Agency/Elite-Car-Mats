import { z } from "zod";

/** Kebab-case slug shape shared by catalog and blog-post validation. */
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const slug = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(SLUG_REGEX, "kebab-case lowercase only");

const categoryEnum = z.enum(["car", "suv", "minivan", "truck", "commercial"]);

export const brandCreateSchema = z.object({
  slug,
  name: z.string().trim().min(2).max(80),
  logo: z.string().trim().url().max(500).optional().nullable(),
  popularity: z.number().int().min(0).max(9999).optional().nullable(),
  categories: z.array(categoryEnum).optional().default([]),
});
export const brandUpdateSchema = brandCreateSchema.partial();

export const modelCreateSchema = z.object({
  brandId: z.string().min(1),
  slug,
  name: z.string().trim().min(1).max(80),
  bodyType: z.string().trim().min(1).max(80),
  category: categoryEnum,
  years: z
    .string()
    .trim()
    .min(4)
    .max(400)
    .regex(/^\d{4}(?:\s*,\s*\d{4})*$/, "comma-separated 4-digit years"),
});
export const modelUpdateSchema = modelCreateSchema.partial();

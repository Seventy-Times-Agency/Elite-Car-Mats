import { z } from "zod";
import { SLUG_REGEX } from "./catalog";

const localeEnum = z.enum(["ru", "en", "uk"]);

export const postCreateSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(SLUG_REGEX, "kebab-case lowercase only"),
  title: z.string().trim().min(2).max(200),
  excerpt: z.string().trim().min(10).max(400),
  content: z.string().trim().min(10).max(50_000),
  coverImage: z.string().trim().url().max(500).optional().nullable(),
  published: z.boolean().optional().default(false),
  locale: localeEnum.optional().nullable(),
});

export const postUpdateSchema = postCreateSchema.partial();

export type PostCreateInput = z.infer<typeof postCreateSchema>;
export type PostUpdateInput = z.infer<typeof postUpdateSchema>;

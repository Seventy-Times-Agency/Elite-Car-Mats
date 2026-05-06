import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const localeEnum = z.enum(["ru", "en", "uk"]);

export const postCreateSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(slugRegex, "kebab-case lowercase only"),
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

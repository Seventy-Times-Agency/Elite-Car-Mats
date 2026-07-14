// Shared row + form shapes for the admin catalog tabs. Living together
// in one file so adding a new column to either side stays a single
// edit: change the row interface here, both managers pick it up.

export interface BrandRow {
  id: string;
  slug: string;
  name: string;
  logo: string | null;
  popularity: number | null;
  categories: string[];
  modelsCount: number;
}

export interface ModelRow {
  id: string;
  brandId: string;
  brandName: string;
  slug: string;
  name: string;
  bodyType: string;
  category: string;
  years: string;
}

export const CATEGORIES = ["car", "suv", "minivan", "truck", "commercial"] as const;
export type Category = (typeof CATEGORIES)[number];

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

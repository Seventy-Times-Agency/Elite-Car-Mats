import "server-only";
import { brands as codeBrands, mockModels as codeModels } from "@/data/catalog";

/**
 * The admin model form's brand select carries either a CustomBrand cuid
 * or `code:<slug>` for one of the ~60 code-catalog brands. Resolves the
 * reference to the pair of CustomModel columns (exactly one set) or an
 * error the route relays as-is.
 */
export function resolveBrandRef(
  brandRef: string,
  modelSlug: string,
):
  | { brandId: string; codeBrandSlug: null }
  | { brandId: null; codeBrandSlug: string }
  | { error: string; status: number } {
  if (brandRef.startsWith("code:")) {
    const slug = brandRef.slice(5);
    const codeBrand = codeBrands.find((b) => b.slug === slug);
    if (!codeBrand) return { error: "brand_not_found", status: 404 };
    // Don't shadow an existing code model's URL within the same brand.
    if (
      codeModels.some((m) => m.brandId === codeBrand.id && m.slug === modelSlug)
    ) {
      return { error: "slug_exists", status: 409 };
    }
    return { brandId: null, codeBrandSlug: slug };
  }
  return { brandId: brandRef, codeBrandSlug: null };
}

/** Display name for a stored codeBrandSlug (admin lists). */
export function codeBrandName(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return codeBrands.find((b) => b.slug === slug)?.name ?? slug;
}

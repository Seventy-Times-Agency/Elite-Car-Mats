import "server-only";
import { prisma } from "@/lib/db/prisma";

/**
 * Operator-hidden code-catalog models. The code catalog stays the
 * source of truth; hiding a model just masks it from the public merge
 * (catalog pages, search, sitemap, Google feed) without touching the
 * code list or existing orders. Keys are the canonical
 * `${brandId}-${slug}` cart/model ids.
 *
 * Stored as one JSON array in the StoreSetting key/value table.
 * Reads fail OPEN (nothing hidden) — a DB blip must not blank the
 * whole catalog.
 */

const KEY = "catalog.hiddenModelIds";

export async function getHiddenModelIds(): Promise<Set<string>> {
  try {
    const row = await prisma.storeSetting.findUnique({
      where: { key: KEY },
      select: { value: true },
    });
    if (!row?.value) return new Set();
    const parsed: unknown = JSON.parse(row.value);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((v): v is string => typeof v === "string"));
  } catch (err) {
    console.warn("[catalog-visibility] read failed, nothing hidden:", err);
    return new Set();
  }
}

export async function setModelHidden(
  modelId: string,
  hidden: boolean,
): Promise<Set<string>> {
  const current = await getHiddenModelIds();
  if (hidden) current.add(modelId);
  else current.delete(modelId);
  const value = JSON.stringify(Array.from(current).sort());
  await prisma.storeSetting.upsert({
    where: { key: KEY },
    create: { key: KEY, value },
    update: { value },
  });
  return current;
}

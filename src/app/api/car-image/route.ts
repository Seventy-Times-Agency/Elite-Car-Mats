import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

interface WikiSummary {
  thumbnail?: { source: string; width: number; height: number };
  originalimage?: { source: string; width: number; height: number };
}

const cache = new Map<string, string | null>();

async function fetchWikipediaImage(make: string, model: string): Promise<string | null> {
  const cacheKey = `${make}|${model}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  const candidates = [
    `${make}_${model.replace(/ /g, "_")}`,
    `${make}_${model}`,
    `${make}_${model.replace(/-/g, "_")}`,
  ];

  for (const title of candidates) {
    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
        {
          headers: { "User-Agent": "EliteCarMats/1.0 (https://elitecarmats.us)" },
          next: { revalidate: 60 * 60 * 24 * 7 },
        }
      );

      if (!res.ok) continue;

      const data: WikiSummary = await res.json();

      if (data.thumbnail?.source) {
        const url = data.thumbnail.source.replace(/\/\d+px-/, "/800px-");
        cache.set(cacheKey, url);
        return url;
      }
      if (data.originalimage?.source) {
        cache.set(cacheKey, data.originalimage.source);
        return data.originalimage.source;
      }
    } catch {
      continue;
    }
  }

  cache.set(cacheKey, null);
  return null;
}

async function placeholderResponse(): Promise<NextResponse> {
  try {
    const filePath = path.join(process.cwd(), "public", "placeholder-car.svg");
    const file = await readFile(filePath);
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const make = searchParams.get("make");
  const model = searchParams.get("model");

  if (!make || !model) {
    return new NextResponse("Missing make or model", { status: 400 });
  }

  const imageUrl = await fetchWikipediaImage(make, model);

  if (!imageUrl) return placeholderResponse();

  try {
    const imageRes = await fetch(imageUrl, {
      headers: { "User-Agent": "EliteCarMats/1.0 (https://elitecarmats.us)" },
      next: { revalidate: 60 * 60 * 24 * 30 },
    });

    if (!imageRes.ok) return placeholderResponse();

    const buffer = await imageRes.arrayBuffer();
    const contentType = imageRes.headers.get("Content-Type") || "image/jpeg";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=2592000, s-maxage=2592000, immutable",
      },
    });
  } catch {
    return placeholderResponse();
  }
}

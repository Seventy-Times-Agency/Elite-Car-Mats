import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const revalidate = 2592000;

interface WikiSummary {
  thumbnail?: { source: string; width: number; height: number };
  originalimage?: { source: string; width: number; height: number };
}

interface WikiSearchPage {
  pageid: number;
  title: string;
  index: number;
  thumbnail?: { source: string; width: number; height: number };
  pageimage?: string;
}

interface WikiSearchResponse {
  query?: { pages?: Record<string, WikiSearchPage> };
}

const memory = new Map<string, string | null>();

const UA = "EliteCarMats/1.0 (https://elitecarmats.us; contact@elitecarmats.us)";

function upscaleWikimediaThumb(url: string, size = 800): string {
  return url.replace(/\/(\d{2,4})px-/, `/${size}px-`);
}

function titleCandidates(make: string, model: string): string[] {
  const m = model.trim();
  const mNoSpace = m.replace(/\s+/g, "_");
  const mNoHyphen = m.replace(/-/g, "_");
  const mNoDots = m.replace(/\./g, "");
  const mLower = m.toLowerCase();
  const mUpper = m.toUpperCase();
  const variations = new Set<string>([
    `${make}_${mNoSpace}`,
    `${make}_${m}`,
    `${make}_${mNoHyphen}`,
    `${make}_${mNoDots}`,
    `${make}_${mNoDots.replace(/\s+/g, "_")}`,
    `${make}_${mLower}`,
    `${make}_${mUpper}`,
    `${make}_${m.replace(/-/g, "")}`,
  ]);
  return Array.from(variations).filter(Boolean);
}

async function fetchSummaryImage(title: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}?redirect=true`,
      {
        headers: { "User-Agent": UA, "Accept": "application/json" },
        next: { revalidate: 60 * 60 * 24 * 7 },
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as WikiSummary;
    if (data.thumbnail?.source) return upscaleWikimediaThumb(data.thumbnail.source, 800);
    if (data.originalimage?.source) return data.originalimage.source;
    return null;
  } catch {
    return null;
  }
}

async function fetchSearchImage(make: string, model: string): Promise<string | null> {
  const query = `${make} ${model} car`;
  const url =
    `https://en.wikipedia.org/w/api.php` +
    `?action=query&format=json&origin=*` +
    `&prop=pageimages&piprop=thumbnail&pithumbsize=800` +
    `&generator=search&gsrlimit=3&gsrnamespace=0` +
    `&gsrsearch=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept": "application/json" },
      next: { revalidate: 60 * 60 * 24 * 7 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as WikiSearchResponse;
    const pages = data.query?.pages;
    if (!pages) return null;
    const sorted = Object.values(pages).sort((a, b) => a.index - b.index);
    for (const page of sorted) {
      if (page.thumbnail?.source) return upscaleWikimediaThumb(page.thumbnail.source, 800);
    }
    return null;
  } catch {
    return null;
  }
}

async function resolveCarImage(make: string, model: string): Promise<string | null> {
  const key = `${make}|${model}`;
  if (memory.has(key)) return memory.get(key)!;

  for (const title of titleCandidates(make, model)) {
    const img = await fetchSummaryImage(title);
    if (img) {
      memory.set(key, img);
      return img;
    }
  }

  const searchImg = await fetchSearchImage(make, model);
  memory.set(key, searchImg);
  return searchImg;
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

  const imageUrl = await resolveCarImage(make, model);
  if (!imageUrl) return placeholderResponse();

  try {
    const imageRes = await fetch(imageUrl, {
      headers: { "User-Agent": UA },
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

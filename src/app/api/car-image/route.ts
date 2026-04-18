import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

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

const UA = "EliteCarMats/1.0 (https://elitecarmats.us; contact@elitecarmats.us)";

const memory = new Map<string, string | null>();

function upscale(url: string, size = 800): string {
  return url.replace(/\/(\d{2,4})px-/, `/${size}px-`);
}

function titleCandidates(make: string, model: string): string[] {
  const m = model.trim();
  const variants = new Set<string>([
    `${make}_${m.replace(/\s+/g, "_")}`,
    `${make}_${m}`,
    `${make}_${m.replace(/-/g, "_")}`,
    `${make}_${m.replace(/\./g, "")}`,
    `${make}_${m.replace(/\s+/g, "_").replace(/\./g, "")}`,
  ]);
  return Array.from(variants);
}

async function fetchSummary(title: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}?redirect=true`,
      {
        headers: { "User-Agent": UA, "Accept": "application/json" },
        cache: "force-cache",
        next: { revalidate: 60 * 60 * 24 * 7 },
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as WikiSummary;
    if (data.thumbnail?.source) return upscale(data.thumbnail.source);
    if (data.originalimage?.source) return data.originalimage.source;
    return null;
  } catch {
    return null;
  }
}

async function fetchSearch(make: string, model: string): Promise<string | null> {
  const url =
    `https://en.wikipedia.org/w/api.php` +
    `?action=query&format=json&formatversion=2&origin=*` +
    `&prop=pageimages&piprop=thumbnail&pithumbsize=800` +
    `&generator=search&gsrlimit=3&gsrnamespace=0` +
    `&gsrsearch=${encodeURIComponent(`${make} ${model} car`)}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept": "application/json" },
      cache: "force-cache",
      next: { revalidate: 60 * 60 * 24 * 7 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as WikiSearchResponse;
    const pages = data.query?.pages;
    if (!pages) return null;
    const list = Object.values(pages).sort((a, b) => a.index - b.index);
    for (const p of list) if (p.thumbnail?.source) return upscale(p.thumbnail.source);
    return null;
  } catch {
    return null;
  }
}

async function resolveCarImage(make: string, model: string): Promise<string | null> {
  const key = `${make}|${model}`;
  if (memory.has(key)) return memory.get(key)!;
  for (const t of titleCandidates(make, model)) {
    const img = await fetchSummary(t);
    if (img) { memory.set(key, img); return img; }
  }
  const img = await fetchSearch(make, model);
  memory.set(key, img);
  return img;
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
  if (!make || !model) return new NextResponse("Missing make or model", { status: 400 });

  const imageUrl = await resolveCarImage(make, model);
  if (!imageUrl) return placeholderResponse();

  return NextResponse.redirect(imageUrl, {
    status: 302,
    headers: { "Cache-Control": "public, max-age=2592000, s-maxage=2592000" },
  });
}

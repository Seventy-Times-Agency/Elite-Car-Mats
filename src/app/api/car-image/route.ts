import { NextRequest, NextResponse } from "next/server";

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
  return Array.from(
    new Set([
      `${make}_${m.replace(/\s+/g, "_")}`,
      `${make}_${m}`,
      `${make}_${m.replace(/-/g, "_")}`,
      `${make}_${m.replace(/\./g, "")}`,
      `${make}_${m.replace(/\s+/g, "_").replace(/\./g, "")}`,
    ])
  );
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
    `?action=query&format=json&formatversion=2` +
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

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function minimalPlaceholder(make: string, model: string): NextResponse {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380"><rect width="600" height="380" fill="#1A1A1A"/><text x="300" y="195" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#A09888">${escapeXml(make)} ${escapeXml(model)}</text></svg>`;
  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const make = searchParams.get("make");
  const model = searchParams.get("model");
  if (!make || !model) return new NextResponse("Missing make or model", { status: 400 });

  const imageUrl = await resolveCarImage(make, model);
  if (!imageUrl) return minimalPlaceholder(make, model);

  return NextResponse.redirect(imageUrl, {
    status: 302,
    headers: { "Cache-Control": "public, max-age=2592000, s-maxage=2592000" },
  });
}

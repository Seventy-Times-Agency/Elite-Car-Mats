#!/usr/bin/env node
// Prebuild script: fetches a Wikipedia image URL for every model in src/data/mock.ts
// and writes src/data/car-images.json. Runs during `next build` so the deployed
// app has real photo URLs baked in — no runtime Wikipedia calls required.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MOCK_PATH = path.join(ROOT, "src/data/mock.ts");
const OUT_PATH = path.join(ROOT, "src/data/car-images.json");
const UA = "EliteCarMats/1.0 (https://elitecarmats.us; contact@elitecarmats.us)";
const CONCURRENCY = 6;
const REQUEST_TIMEOUT_MS = 8000;

function log(...args) { console.log("[car-images]", ...args); }

// Naive mockModels extractor — parses m("id", "brandId", "Brand", "Model", ...) lines
async function loadModels() {
  const src = await readFile(MOCK_PATH, "utf8");
  const re = /m\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,/g;
  const models = [];
  let match;
  while ((match = re.exec(src)) !== null) {
    const [, id, brandId, brandName, modelName] = match;
    models.push({ id, brandId, brandName, modelName });
  }
  return models;
}

function upscale(url, size = 800) {
  return url.replace(/\/(\d{2,4})px-/, `/${size}px-`);
}

function titleCandidates(make, model) {
  const m = model.trim();
  return Array.from(new Set([
    `${make}_${m.replace(/\s+/g, "_")}`,
    `${make}_${m}`,
    `${make}_${m.replace(/-/g, "_")}`,
    `${make}_${m.replace(/\./g, "")}`,
    `${make}_${m.replace(/\s+/g, "_").replace(/\./g, "")}`,
  ]));
}

async function fetchJson(url, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept": "application/json" },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function fetchSummary(title) {
  const data = await fetchJson(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}?redirect=true`
  );
  if (!data) return null;
  if (data.thumbnail?.source) return upscale(data.thumbnail.source);
  if (data.originalimage?.source) return data.originalimage.source;
  return null;
}

async function fetchSearch(make, model) {
  const url =
    `https://en.wikipedia.org/w/api.php` +
    `?action=query&format=json&formatversion=2` +
    `&prop=pageimages&piprop=thumbnail&pithumbsize=800` +
    `&generator=search&gsrlimit=3&gsrnamespace=0` +
    `&gsrsearch=${encodeURIComponent(`${make} ${model} car`)}`;
  const data = await fetchJson(url);
  if (!data?.query?.pages) return null;
  const list = Object.values(data.query.pages).sort((a, b) => a.index - b.index);
  for (const p of list) if (p.thumbnail?.source) return upscale(p.thumbnail.source);
  return null;
}

async function resolveOne(make, model) {
  for (const t of titleCandidates(make, model)) {
    const img = await fetchSummary(t);
    if (img) return img;
  }
  return await fetchSearch(make, model);
}

async function loadExisting() {
  if (!existsSync(OUT_PATH)) return {};
  try {
    const raw = await readFile(OUT_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function runPool(items, worker, concurrency) {
  const results = new Array(items.length);
  let next = 0;
  async function pull() {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, pull));
  return results;
}

async function main() {
  const models = await loadModels();
  log(`models: ${models.length}`);

  const existing = await loadExisting();
  const skipRefresh = process.env.SKIP_IMAGE_REFRESH === "1";

  let hits = 0, misses = 0, reused = 0;
  const out = { ...existing };

  await runPool(models, async (m) => {
    const key = `${m.brandId}/${m.id}`;
    if (skipRefresh && existing[key]) { reused++; return; }
    const url = await resolveOne(m.brandName, m.modelName);
    if (url) {
      out[key] = url;
      hits++;
    } else if (existing[key]) {
      reused++;
    } else {
      misses++;
    }
  }, CONCURRENCY);

  await mkdir(path.dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(out, null, 2) + "\n", "utf8");
  log(`wrote ${OUT_PATH} — hits: ${hits}, reused: ${reused}, misses: ${misses}`);
}

main().catch((err) => {
  console.error("[car-images] fatal:", err);
  // Never fail the build — runtime will fall back to /api/car-image
  process.exit(0);
});

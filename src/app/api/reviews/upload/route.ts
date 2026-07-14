import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { randomBytes } from "node:crypto";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Review-photo upload. Degrades gracefully: without a Blob store token
 *  the endpoint answers 503 and the form simply hides the photo field. */
const MAX_BYTES = 6 * 1024 * 1024; // 6 MB — plenty for a phone photo
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { ok: false, error: "Photo uploads are not configured" },
      { status: 503 },
    );
  }

  // 12 uploads per 10 minutes per IP — 3 photos × a few retries.
  const ip = getClientIp(request);
  const rl = await rateLimit(`review-upload:${ip}`, {
    windowMs: 10 * 60_000,
    max: 12,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many uploads. Try again later." },
      { status: 429 },
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  const ext = ALLOWED[contentType.split(";")[0].trim().toLowerCase()];
  if (!ext) {
    return NextResponse.json(
      { ok: false, error: "Only JPEG, PNG, WebP or HEIC images are accepted" },
      { status: 415 },
    );
  }

  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Image is too large (max 6 MB)" },
      { status: 413 },
    );
  }

  let body: ArrayBuffer;
  try {
    body = await request.arrayBuffer();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to read upload" },
      { status: 400 },
    );
  }
  if (body.byteLength === 0 || body.byteLength > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Image is too large (max 6 MB)" },
      { status: 413 },
    );
  }

  try {
    // Random name — never trust a client-supplied filename.
    const name = `reviews/${randomBytes(12).toString("hex")}.${ext}`;
    const blob = await put(name, body, {
      access: "public",
      contentType: contentType.split(";")[0].trim(),
    });
    return NextResponse.json({ ok: true, url: blob.url });
  } catch (err) {
    console.error("[api/reviews/upload] blob put failed:", err);
    return NextResponse.json(
      { ok: false, error: "Upload failed" },
      { status: 500 },
    );
  }
}

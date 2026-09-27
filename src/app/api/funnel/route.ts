import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { recordSteps, isFunnelStep, type FunnelStep } from "@/lib/analytics/funnel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Funnel beacon receiver. The client buffers the steps a visitor reaches
 * and sends them in one batch, so this is hit a couple of times per
 * session rather than per click.
 *
 * Always answers 204, even when it drops the payload. This endpoint is
 * called from `sendBeacon` during page unload — nobody reads the status,
 * and an error body would only add bytes to a request the browser is
 * racing against navigation.
 */

const bodySchema = z.object({
  steps: z.array(z.string().max(32)).min(1).max(16),
});

/**
 * Crawlers hit the catalog hard and never buy. Counting them would put a
 * few thousand phantom visits at the top of the funnel and make every
 * conversion rate below it look like a disaster.
 */
const BOT_UA =
  /bot|crawler|spider|crawling|slurp|bingpreview|facebookexternalhit|headlesschrome|phantomjs|puppeteer|playwright|lighthouse|pagespeed|gtmetrix|ahrefs|semrush|mj12|dotbot|petalbot|yandex|duckduck|applebot|amazonbot|gptbot|claudebot|ccbot|bytespider/i;

const noContent = () => new NextResponse(null, { status: 204 });

export async function POST(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOT_UA.test(ua)) return noContent();

  // Cheap ceiling so a single client can't inflate the numbers. A real
  // session sends two or three beacons; 30/min leaves plenty of room for
  // tab-switching without letting a script pump the counters.
  const ip = getClientIp(request);
  const { ok } = await rateLimit(`funnel:${ip}`, { windowMs: 60_000, max: 30 });
  if (!ok) return noContent();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return noContent();
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return noContent();

  const steps = parsed.data.steps.filter(isFunnelStep) as FunnelStep[];
  if (steps.length === 0) return noContent();

  try {
    await recordSteps(steps);
  } catch (err) {
    console.warn("[funnel] record failed:", err);
  }
  return noContent();
}

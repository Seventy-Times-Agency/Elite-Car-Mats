/**
 * Minimal Upstash REST pipeline shared by the funnel counters and the
 * problem journal. Returns null (never throws) when Redis is not
 * configured or unreachable — both features are diagnostics and must
 * never break a customer request.
 */
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redisEnabled = Boolean(url && token);

export async function redisPipeline(
  commands: (string | number)[][],
  tag: string,
): Promise<unknown[] | null> {
  if (!redisEnabled) return null;
  try {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands.map((c) => c.map(String))),
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`[${tag}] upstash non-OK:`, res.status);
      return null;
    }
    const data = (await res.json().catch(() => null)) as
      | Array<{ result?: unknown; error?: string }>
      | null;
    if (!Array.isArray(data)) return null;
    return data.map((d) => d?.result ?? null);
  } catch (err) {
    console.warn(`[${tag}] upstash request failed:`, err);
    return null;
  }
}

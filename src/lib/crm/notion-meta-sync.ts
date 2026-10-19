import "server-only";
import { sendMetaEvent, isMetaCapiConfigured } from "@/lib/analytics/meta-capi";
import { redisEnabled, redisPipeline } from "@/lib/redis-rest";

/**
 * Notion CRM → Meta Conversions API.
 *
 * Most sales close in Messenger/Instagram DMs and are logged by the
 * managers in the Notion CRM board, so Meta never sees them — it only
 * learns "a conversation started". This job reads the orders that reached
 * a paid status and reports each one once as a `Purchase` with
 * action_source "chat", the order amount and hashed contact data, so Meta
 * can attribute revenue to the ad that brought the buyer and build
 * purchaser audiences.
 *
 * Inert until NOTION_CRM_TOKEN + NOTION_CRM_DATA_SOURCE_ID (and the CAPI
 * pair) are set. Needs Redis for the "already sent" ledger — without it
 * the job refuses to run rather than risk double-counting revenue.
 */

const NOTION_VERSION = "2025-09-03";
const PAID_STATUSES = ["Заплачено", "Відправлено", "Архів"];
// Meta drops events older than 7 days; stay inside that with a margin.
const LOOKBACK_DAYS = 6;
const SENT_KEY = "crm:meta:sent";

type NotionProp = Record<string, unknown> & { type?: string };

function text(p: NotionProp | undefined): string {
  const parts = (p?.title ?? p?.rich_text) as { plain_text?: string }[] | undefined;
  return parts?.map((t) => t.plain_text ?? "").join("").trim() ?? "";
}

const STATE_CODES = new Set(
  "AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split(
    " ",
  ),
);

// Longest names first so "west virginia" wins over "virginia".
const STATE_NAMES: [string, string][] = (
  [
    ["alabama", "AL"], ["alaska", "AK"], ["arizona", "AZ"], ["arkansas", "AR"],
    ["california", "CA"], ["colorado", "CO"], ["connecticut", "CT"], ["delaware", "DE"],
    ["district of columbia", "DC"], ["florida", "FL"], ["georgia", "GA"], ["hawaii", "HI"],
    ["idaho", "ID"], ["illinois", "IL"], ["indiana", "IN"], ["iowa", "IA"],
    ["kansas", "KS"], ["kentucky", "KY"], ["louisiana", "LA"], ["maine", "ME"],
    ["maryland", "MD"], ["massachusetts", "MA"], ["michigan", "MI"], ["minnesota", "MN"],
    ["mississippi", "MS"], ["missouri", "MO"], ["montana", "MT"], ["nebraska", "NE"],
    ["nevada", "NV"], ["new hampshire", "NH"], ["new jersey", "NJ"], ["new mexico", "NM"],
    ["new york", "NY"], ["north carolina", "NC"], ["north dakota", "ND"], ["ohio", "OH"],
    ["oklahoma", "OK"], ["oregon", "OR"], ["pennsylvania", "PA"], ["rhode island", "RI"],
    ["south carolina", "SC"], ["south dakota", "SD"], ["tennessee", "TN"], ["texas", "TX"],
    ["utah", "UT"], ["vermont", "VT"], ["virginia", "VA"], ["washington", "WA"],
    ["west virginia", "WV"], ["wisconsin", "WI"], ["wyoming", "WY"],
  ] as [string, string][]
).sort((a, b) => b[0].length - a[0].length);

/**
 * Managers type addresses however they like: line breaks instead of
 * commas, "Fl" instead of "FL", the state spelled out, a trailing "USA".
 * Pull out whatever is reliable — the ZIP is the anchor, the state is the
 * token right before it, the city is the comma/line segment before that.
 * Anything that can't be read with confidence is left out rather than
 * guessed: Meta matches on the fields it gets, a wrong one only hurts.
 */
export function parseUsAddress(addr: string): {
  city?: string;
  state?: string;
  zip?: string;
} {
  const text = addr
    .replace(/\s*[\r\n]+\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[,\s]*(?:USA|U\.S\.A\.|US|United States)\.?$/i, "")
    .trim();

  const zipMatch = [...text.matchAll(/\b(\d{5})(?:-\d{4})?\b/g)].pop();
  if (!zipMatch || zipMatch.index === undefined) return {};

  let before = text.slice(0, zipMatch.index).replace(/[,\s]+$/, "");
  let state: string | undefined;

  const code = before.match(/(?:^|[,\s])([A-Za-z]{2})\.?$/);
  if (code && STATE_CODES.has(code[1].toUpperCase())) {
    state = code[1].toUpperCase();
    before = before.slice(0, before.length - code[0].length);
  } else {
    const lower = before.toLowerCase();
    for (const [name, abbr] of STATE_NAMES) {
      if (lower.endsWith(name) && /(^|[,\s])$/.test(lower.slice(0, lower.length - name.length))) {
        state = abbr;
        before = before.slice(0, before.length - name.length);
        break;
      }
    }
  }

  before = before.replace(/[,\s]+$/, "");
  let city: string | undefined;
  const lastComma = before.lastIndexOf(",");
  // Without a recognised state the segment before the ZIP is just as
  // likely an apartment or a street as a city.
  if (state && lastComma >= 0) {
    const segment = before.slice(lastComma + 1).trim();
    if (segment && !/\d/.test(segment)) city = segment;
  }

  return {
    ...(city ? { city } : {}),
    ...(state ? { state } : {}),
    zip: zipMatch[1],
  };
}

export interface CrmSale {
  pageId: string;
  name: string;
  valueUsd: number;
  paidAt: Date;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export function toSale(page: {
  id: string;
  created_time: string;
  properties: Record<string, NotionProp>;
}): CrmSale | null {
  const p = page.properties;
  const value = (p["Ціна $"]?.number as number | null) ?? 0;
  if (!value) return null;
  const date = (p["Date"]?.date as { start?: string } | null)?.start;
  return {
    pageId: page.id,
    name: text(p["Name"]),
    valueUsd: value,
    paidAt: new Date(date ?? page.created_time),
    email: (p["Email"]?.email as string | null) ?? undefined,
    phone: (p["Телефон"]?.phone_number as string | null) ?? undefined,
    ...parseUsAddress(text(p["Адреса"])),
  };
}

async function querySales(since: Date): Promise<CrmSale[]> {
  const token = process.env.NOTION_CRM_TOKEN ?? "";
  const source = process.env.NOTION_CRM_DATA_SOURCE_ID ?? "";
  const sales: CrmSale[] = [];
  let cursor: string | undefined;
  do {
    const res = await fetch(
      `https://api.notion.com/v1/data_sources/${source}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": NOTION_VERSION,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page_size: 100,
          start_cursor: cursor,
          filter: {
            and: [
              {
                or: PAID_STATUSES.map((s) => ({
                  property: "Status",
                  status: { equals: s },
                })),
              },
              {
                timestamp: "last_edited_time",
                last_edited_time: { on_or_after: since.toISOString() },
              },
            ],
          },
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      },
    );
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Notion ${res.status}: ${body.slice(0, 200)}`);
    }
    const data = (await res.json()) as {
      results: Parameters<typeof toSale>[0][];
      has_more: boolean;
      next_cursor: string | null;
    };
    for (const page of data.results) {
      const sale = toSale(page);
      if (sale) sales.push(sale);
    }
    cursor = data.has_more ? (data.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return sales;
}

export interface SyncResult {
  skipped?: string;
  found: number;
  sent: number;
  alreadySent: number;
  tooOld: number;
  failed: number;
}

export async function syncCrmSalesToMeta(): Promise<SyncResult> {
  const empty = { found: 0, sent: 0, alreadySent: 0, tooOld: 0, failed: 0 };
  if (!process.env.NOTION_CRM_TOKEN || !process.env.NOTION_CRM_DATA_SOURCE_ID)
    return { ...empty, skipped: "notion-not-configured" };
  if (!isMetaCapiConfigured()) return { ...empty, skipped: "capi-not-configured" };
  if (!redisEnabled) return { ...empty, skipped: "redis-not-configured" };

  const now = Date.now();
  const since = new Date(now - LOOKBACK_DAYS * 86_400_000);
  const sales = await querySales(since);
  const result: SyncResult = { ...empty, found: sales.length };

  for (const sale of sales) {
    // Cards are picked by last edit, so an old order that was merely
    // touched (e.g. moved to "Архів") shows up too. Meta rejects events
    // older than 7 days, and re-dating an old sale to "now" would credit
    // today's ads with it — skip those.
    const paidAt = sale.paidAt.getTime();
    if (Number.isNaN(paidAt) || now - paidAt > LOOKBACK_DAYS * 86_400_000) {
      result.tooOld++;
      continue;
    }
    const eventTime = Math.floor(Math.min(paidAt, now) / 1000);

    const member = await redisPipeline(
      [["SISMEMBER", SENT_KEY, sale.pageId]],
      "crm-meta",
    );
    if (!member) {
      result.failed++;
      continue;
    }
    if (member[0] === 1) {
      result.alreadySent++;
      continue;
    }

    const ok = await sendMetaEvent({
      eventName: "Purchase",
      eventId: `crm-${sale.pageId}`,
      actionSource: "chat",
      eventTime,
      logContext: `crm ${sale.pageId.slice(0, 8)}`,
      userData: {
        email: sale.email,
        phone: sale.phone,
        customerName: sale.name,
        city: sale.city,
        state: sale.state,
        zip: sale.zip,
      },
      customData: { currency: "USD", value: sale.valueUsd },
    });
    if (ok) {
      await redisPipeline([["SADD", SENT_KEY, sale.pageId]], "crm-meta");
      result.sent++;
    } else {
      result.failed++;
    }
  }
  return result;
}

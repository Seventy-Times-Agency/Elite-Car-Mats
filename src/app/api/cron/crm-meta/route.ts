import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { syncCrmSalesToMeta } from "@/lib/crm/notion-meta-sync";
import { reportProblem } from "@/lib/ops/journal";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`; without the
 *  secret configured the endpoint stays closed. */
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET ?? "";
  if (!secret) return false;
  const got = Buffer.from(req.headers.get("authorization") ?? "");
  const want = Buffer.from(`Bearer ${secret}`);
  return got.length === want.length && timingSafeEqual(got, want);
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const result = await syncCrmSalesToMeta();
    console.log("[crm-meta]", JSON.stringify(result));
    return NextResponse.json(result);
  } catch (err) {
    await reportProblem({ area: "capi", severity: "warning", error: err, context: "crm sync" });
    return NextResponse.json({ error: "sync failed" }, { status: 500 });
  }
}

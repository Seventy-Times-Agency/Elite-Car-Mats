import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/security/auth";
import { unsubscribeUrl } from "@/lib/security/unsubscribe-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvEscape(v: string): string {
  // Neutralise spreadsheet formula injection: a subscriber email like
  // `=HYPERLINK(...)` would execute when the export is opened in Excel /
  // Sheets. Prefixing with `'` makes the cell render as plain text.
  if (/^[=+\-@\t\r]/.test(v)) {
    v = `'${v}`;
  }
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subs = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  // unsubscribeUrl per row: CAN-SPAM requires a working opt-out in every
  // commercial email, so any campaign built from this export can merge
  // the column straight into its footer link.
  const rows = [
    ["email", "source", "createdAt", "unsubscribeUrl"],
    ...subs.map((s) => [
      s.email,
      s.source ?? "",
      s.createdAt.toISOString(),
      unsubscribeUrl(s.email),
    ]),
  ];
  const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin, checkAdminCsrf } from "@/lib/security/auth";
import {
  getAddonAvailability,
  setAddonAvailability,
} from "@/lib/availability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  badges: z.boolean().optional(),
  heelPad: z.boolean().optional(),
  organizer: z.boolean().optional(),
});

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getAddonAvailability());
}

export async function POST(request: Request) {
  if (!checkAdminCsrf(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  await setAddonAvailability(parsed.data);
  // The product page reads the cached twin — bust it so switching an
  // add-on off is visible on the storefront immediately.
  revalidateTag("availability", "default");
  return NextResponse.json(await getAddonAvailability());
}

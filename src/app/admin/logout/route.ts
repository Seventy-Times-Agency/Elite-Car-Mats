import { NextResponse } from "next/server";
import { signOutAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  await signOutAdmin();
  return NextResponse.redirect(new URL("/admin/login", request.url));
}

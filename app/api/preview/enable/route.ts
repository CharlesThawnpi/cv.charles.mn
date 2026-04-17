import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { readAdminSession } from "@/utils/adminSession";

export async function GET(request: Request) {
  const session = await readAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirect") || "/";

  const draft = await draftMode();
  draft.enable();

  return NextResponse.redirect(new URL(redirectTo, request.url));
}

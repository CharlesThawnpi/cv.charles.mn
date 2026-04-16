import { NextResponse } from "next/server";
import { clearAdminSession } from "@/utils/adminSession";

export async function POST() {
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}


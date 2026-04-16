import { NextResponse } from "next/server";
import { getAdminAuthStatus, readAdminSession } from "@/utils/adminSession";

export async function GET() {
  const session = await readAdminSession();
  const authStatus = getAdminAuthStatus();

  return NextResponse.json({
    authenticated: Boolean(session),
    email: session?.email ?? null,
    authConfigured: authStatus.configured,
  });
}


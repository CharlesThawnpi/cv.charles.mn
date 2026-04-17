import { NextResponse } from "next/server";
import { getAdminAuthStatus, readAdminSession } from "@/utils/adminSession";

export async function GET() {
  const session = await readAdminSession();
  const authStatus = getAdminAuthStatus();

  console.info("[admin/session] env presence", {
    ADMIN_EMAIL: Boolean(process.env.ADMIN_EMAIL?.trim()),
    ADMIN_PASSWORD: Boolean(process.env.ADMIN_PASSWORD),
    ADMIN_SESSION_SECRET: Boolean(process.env.ADMIN_SESSION_SECRET),
  });

  return NextResponse.json({
    authenticated: Boolean(session),
    email: session?.email ?? null,
    authConfigured: authStatus.configured,
  });
}

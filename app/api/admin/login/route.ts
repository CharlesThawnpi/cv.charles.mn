import { NextResponse } from "next/server";
import {
  createAdminSession,
  getAdminAuthStatus,
  validateAdminCredentials,
} from "@/utils/adminSession";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;

  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const authStatus = getAdminAuthStatus();

  if (!authStatus.configured) {
    return NextResponse.json(
      {
        error:
          "Admin authentication is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_SESSION_SECRET in your environment.",
      },
      { status: 503 }
    );
  }

  if (!validateAdminCredentials(body.email, body.password)) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  await createAdminSession(body.email);

  return NextResponse.json({ ok: true });
}


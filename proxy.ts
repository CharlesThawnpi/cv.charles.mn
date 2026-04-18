import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/utils/constants";

const ADMIN_DASHBOARD_PREFIX = "/admin/dashboard";
const ADMIN_API_PREFIX = "/api/admin";
const PUBLIC_ADMIN_APIS = new Set([
  "/api/admin/login",
  "/api/admin/session",
  "/api/admin/logout",
]);

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hasSession = Boolean(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);

  if (!hasSession && pathname.startsWith(ADMIN_DASHBOARD_PREFIX)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (!hasSession && pathname.startsWith(ADMIN_API_PREFIX) && !PUBLIC_ADMIN_APIS.has(pathname)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*", "/api/admin/:path*"],
};

import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_SESSION_COOKIE } from "@/utils/constants";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12;

const defaultAdminEmail = "admin@local.dev";
const adminEmail = process.env.ADMIN_EMAIL ?? defaultAdminEmail;
const adminPassword = process.env.ADMIN_PASSWORD ?? "";
const adminSessionSecret = process.env.ADMIN_SESSION_SECRET ?? "change-me-local-session-secret";

const toBase64Url = (value: string) => Buffer.from(value, "utf8").toString("base64url");
const fromBase64Url = (value: string) => Buffer.from(value, "base64url").toString("utf8");

const signPayload = (payload: string) => {
  return createHmac("sha256", adminSessionSecret).update(payload).digest("base64url");
};

const createToken = (email: string) => {
  const payload = toBase64Url(JSON.stringify({ email, exp: Date.now() + SESSION_DURATION_MS }));
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
};

const parseToken = (token: string): { email: string; exp: number } | null => {
  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payload);

  if (
    Buffer.byteLength(signature) !== Buffer.byteLength(expectedSignature) ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(fromBase64Url(payload)) as { email?: unknown; exp?: unknown };

    if (typeof parsed.email !== "string" || typeof parsed.exp !== "number") {
      return null;
    }

    return { email: parsed.email, exp: parsed.exp };
  } catch {
    return null;
  }
};

export const isAdminAuthConfigured = () => {
  return adminPassword.length > 0;
};

export const getAdminAuthStatus = () => {
  return {
    configured: isAdminAuthConfigured(),
    email: adminEmail,
  };
};

export const validateAdminCredentials = (email: string, password: string) => {
  if (!isAdminAuthConfigured()) {
    return false;
  }

  return email.trim().toLowerCase() === adminEmail.trim().toLowerCase() && password === adminPassword;
};

export const createAdminSession = async (email: string) => {
  const token = createToken(email);
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
};

export const clearAdminSession = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
};

export const readAdminSession = async (): Promise<{ email: string } | null> => {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!rawToken) {
    return null;
  }

  const parsed = parseToken(rawToken);

  if (!parsed || parsed.exp < Date.now()) {
    return null;
  }

  return { email: parsed.email };
};

export const requireAdminSession = async () => {
  const session = await readAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
};


import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_SESSION_COOKIE } from "@/utils/constants";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 12;

const defaultAdminEmail = "admin@local.dev";
const adminEmail = process.env.ADMIN_EMAIL ?? defaultAdminEmail;
const adminPassword = process.env.ADMIN_PASSWORD ?? "";
const adminSessionSecret = process.env.ADMIN_SESSION_SECRET ?? "change-me-local-session-secret";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

let signingKeyPromise: Promise<CryptoKey> | null = null;

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
};

const base64ToBytes = (value: string): Uint8Array => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
};

const toBase64Url = (value: string): string => {
  const base64 = bytesToBase64(textEncoder.encode(value));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const fromBase64Url = (value: string): string => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = `${normalized}${"=".repeat((4 - (normalized.length % 4 || 4)) % 4)}`;
  return textDecoder.decode(base64ToBytes(padded));
};

const bytesToBase64Url = (bytes: Uint8Array): string => {
  const base64 = bytesToBase64(bytes);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const getSigningKey = async (): Promise<CryptoKey> => {
  if (!signingKeyPromise) {
    signingKeyPromise = crypto.subtle.importKey(
      "raw",
      textEncoder.encode(adminSessionSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
  }

  return signingKeyPromise;
};

const signPayload = async (payload: string): Promise<string> => {
  const key = await getSigningKey();
  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(payload));
  return bytesToBase64Url(new Uint8Array(signature));
};

const isConstantTimeEqual = (left: string, right: string): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;

  for (let i = 0; i < left.length; i += 1) {
    diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }

  return diff === 0;
};

const createToken = async (email: string): Promise<string> => {
  const payload = toBase64Url(JSON.stringify({ email, exp: Date.now() + SESSION_DURATION_MS }));
  const signature = await signPayload(payload);
  return `${payload}.${signature}`;
};

const parseToken = async (token: string): Promise<{ email: string; exp: number } | null> => {
  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = await signPayload(payload);

  if (!isConstantTimeEqual(signature, expectedSignature)) {
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
  const token = await createToken(email);
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

  const parsed = await parseToken(rawToken);

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

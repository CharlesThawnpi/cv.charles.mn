import "server-only";

import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

const requiredFirebaseAdminEnvKeys = [
  "FIREBASE_ADMIN_PROJECT_ID",
  "FIREBASE_ADMIN_CLIENT_EMAIL",
  "FIREBASE_ADMIN_PRIVATE_KEY",
] as const;

const isLikelyPlaceholder = (value: string) => {
  const normalized = value.toLowerCase();
  return normalized.startsWith("your-") || normalized.startsWith("test-") || normalized.includes("example");
};

const getFirebaseAdminEnv = () => {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID?.trim() ?? "";
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim() ?? "";
  const rawPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "";
  const privateKey = rawPrivateKey.replace(/\\n/g, "\n");

  return {
    projectId,
    clientEmail,
    rawPrivateKey,
    privateKey,
  };
};

export const hasFirebaseAdminConfig = requiredFirebaseAdminEnvKeys.every((key) => {
  const value = process.env[key];
  return typeof value === "string" && value.length > 0 && !isLikelyPlaceholder(value);
});

export const getFirebaseAdminDebugInfo = () => {
  const { projectId, clientEmail, rawPrivateKey, privateKey } = getFirebaseAdminEnv();

  return {
    hasConfig: hasFirebaseAdminConfig,
    projectIdPresent: Boolean(projectId),
    clientEmailPresent: Boolean(clientEmail),
    privateKeyPresent: Boolean(rawPrivateKey),
    privateKeyHasEscapedNewlines: rawPrivateKey.includes("\\n"),
    privateKeyHasRealNewlines: privateKey.includes("\n"),
    privateKeyLooksPem:
      privateKey.includes("-----BEGIN PRIVATE KEY-----") &&
      privateKey.includes("-----END PRIVATE KEY-----"),
    projectId,
    clientEmailDomain: clientEmail.includes("@") ? clientEmail.split("@")[1] : null,
  };
};

let firebaseAdminApp: App | null = null;
let firestoreAdminDb: Firestore | null = null;
let firebaseAdminInitError: string | null = null;

if (hasFirebaseAdminConfig) {
  const { projectId, clientEmail, privateKey } = getFirebaseAdminEnv();

  try {
    firebaseAdminApp =
      getApps().length > 0
        ? getApp()
        : initializeApp({
            credential: cert({
              projectId,
              clientEmail,
              privateKey,
            }),
          });

    firestoreAdminDb = getFirestore(firebaseAdminApp);

    console.info("[firebaseAdmin] initialized", {
      projectId,
      clientEmailDomain: clientEmail.includes("@") ? clientEmail.split("@")[1] : null,
      privateKeyHasRealNewlines: privateKey.includes("\n"),
      privateKeyLooksPem:
        privateKey.includes("-----BEGIN PRIVATE KEY-----") &&
        privateKey.includes("-----END PRIVATE KEY-----"),
    });
  } catch (error) {
    firebaseAdminInitError = error instanceof Error ? error.message : "Unknown Firebase Admin initialization error";

    console.error("[firebaseAdmin] initialization failed", {
      ...getFirebaseAdminDebugInfo(),
      error: firebaseAdminInitError,
    });
  }
}

export { firebaseAdminApp, firestoreAdminDb, firebaseAdminInitError };

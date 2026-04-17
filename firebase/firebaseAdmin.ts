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
  const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");

  return {
    projectId,
    clientEmail,
    privateKey,
  };
};

export const hasFirebaseAdminConfig = requiredFirebaseAdminEnvKeys.every((key) => {
  const value = process.env[key];
  return typeof value === "string" && value.length > 0 && !isLikelyPlaceholder(value);
});

let firebaseAdminApp: App | null = null;
let firestoreAdminDb: Firestore | null = null;

if (hasFirebaseAdminConfig) {
  const { projectId, clientEmail, privateKey } = getFirebaseAdminEnv();

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
}

export { firebaseAdminApp, firestoreAdminDb };

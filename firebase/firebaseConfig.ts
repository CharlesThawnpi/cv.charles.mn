import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

const requiredFirebaseEnvKeys = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

const isLikelyPlaceholder = (value: string) => {
  const normalized = value.toLowerCase();
  return normalized.startsWith("your-") || normalized.startsWith("test-") || normalized.includes("example");
};

const firebaseEnv = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const hasFirebaseConfig = requiredFirebaseEnvKeys.every((key) => {
  const value = process.env[key];
  return typeof value === "string" && value.length > 0 && !isLikelyPlaceholder(value);
});

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;

if (hasFirebaseConfig) {
  firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseEnv);
  firestoreDb = getFirestore(firebaseApp);
}

export { firebaseApp, firestoreDb };


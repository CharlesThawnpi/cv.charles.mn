import "server-only";

import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  createSeededPortfolioRecord,
  normalizePortfolioContent,
  type PortfolioContent,
  type PortfolioRecord,
} from "@/config/contentModel";
import { firestoreDb, hasFirebaseConfig } from "@/firebase/firebaseConfig";

const PORTFOLIO_COLLECTION = "portfolio";
const PORTFOLIO_DOCUMENT = "content";

declare global {
  // eslint-disable-next-line no-var
  var __portfolioRecordFallback: PortfolioRecord | undefined;
}

const getFallbackRecord = (): PortfolioRecord => {
  if (!globalThis.__portfolioRecordFallback) {
    globalThis.__portfolioRecordFallback = createSeededPortfolioRecord();
  }

  return globalThis.__portfolioRecordFallback;
};

const setFallbackRecord = (record: PortfolioRecord) => {
  globalThis.__portfolioRecordFallback = record;
};

const normalizePortfolioRecord = (input: unknown): PortfolioRecord => {
  const fallback = createSeededPortfolioRecord();

  if (typeof input !== "object" || input === null) {
    return fallback;
  }

  const data = input as Record<string, unknown>;
  const updatedAt = typeof data.updatedAt === "string" ? data.updatedAt : fallback.updatedAt;
  const publishedAt =
    typeof data.publishedAt === "string" || data.publishedAt === null
      ? data.publishedAt
      : fallback.publishedAt;

  return {
    draft: normalizePortfolioContent(data.draft, fallback.draft),
    published: normalizePortfolioContent(data.published, fallback.published),
    updatedAt,
    publishedAt,
  };
};

const readFirestoreRecord = async (): Promise<PortfolioRecord | null> => {
  if (!hasFirebaseConfig || !firestoreDb) {
    return null;
  }

  const ref = doc(firestoreDb, PORTFOLIO_COLLECTION, PORTFOLIO_DOCUMENT);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return null;
  }

  return normalizePortfolioRecord(snapshot.data());
};

const writeFirestoreRecord = async (record: PortfolioRecord): Promise<void> => {
  if (!hasFirebaseConfig || !firestoreDb) {
    return;
  }

  const ref = doc(firestoreDb, PORTFOLIO_COLLECTION, PORTFOLIO_DOCUMENT);
  await setDoc(ref, record, { merge: false });
};

const getRecord = async (): Promise<{ record: PortfolioRecord; source: "firebase" | "local" }> => {
  if (hasFirebaseConfig && firestoreDb) {
    try {
      const firebaseRecord = await readFirestoreRecord();

      if (firebaseRecord) {
        return { record: firebaseRecord, source: "firebase" };
      }

      const initialRecord = createSeededPortfolioRecord();
      await writeFirestoreRecord(initialRecord);
      return { record: initialRecord, source: "firebase" };
    } catch (error) {
      console.warn("Failed to read Firebase content, using local fallback.", error);
    }
  }

  return { record: getFallbackRecord(), source: "local" };
};

const persistRecord = async (record: PortfolioRecord): Promise<"firebase" | "local"> => {
  if (hasFirebaseConfig && firestoreDb) {
    try {
      await writeFirestoreRecord(record);
      return "firebase";
    } catch (error) {
      console.warn("Failed to write Firebase content, using local fallback.", error);
    }
  }

  setFallbackRecord(record);
  return "local";
};

export interface PortfolioPublicResult {
  content: PortfolioContent;
  mode: "published" | "preview";
  source: "firebase" | "local";
}

export interface PortfolioAdminResult {
  record: PortfolioRecord;
  source: "firebase" | "local";
  firebaseConfigured: boolean;
}

export const getPublicPortfolioData = async (isPreview: boolean): Promise<PortfolioPublicResult> => {
  const { record, source } = await getRecord();

  return {
    content: isPreview ? record.draft : record.published,
    mode: isPreview ? "preview" : "published",
    source,
  };
};

export const getAdminPortfolioData = async (): Promise<PortfolioAdminResult> => {
  const { record, source } = await getRecord();

  return {
    record,
    source,
    firebaseConfigured: hasFirebaseConfig,
  };
};

export const saveDraftPortfolioData = async (
  input: unknown
): Promise<{ source: "firebase" | "local"; record: PortfolioRecord }> => {
  const { record } = await getRecord();

  const nextRecord: PortfolioRecord = {
    ...record,
    draft: normalizePortfolioContent(input, record.draft),
    updatedAt: new Date().toISOString(),
  };

  const source = await persistRecord(nextRecord);
  return { source, record: nextRecord };
};

export const publishPortfolioData = async (): Promise<{
  source: "firebase" | "local";
  record: PortfolioRecord;
}> => {
  const { record } = await getRecord();
  const now = new Date().toISOString();

  const nextRecord: PortfolioRecord = {
    ...record,
    published: structuredClone(record.draft),
    updatedAt: now,
    publishedAt: now,
  };

  const source = await persistRecord(nextRecord);
  return { source, record: nextRecord };
};


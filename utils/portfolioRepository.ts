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
const FIRESTORE_TIMEOUT_MS = 8000;

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

const getPortfolioDocumentPath = () => `${PORTFOLIO_COLLECTION}/${PORTFOLIO_DOCUMENT}`;

const withTimeout = async <T>(operation: Promise<T>, label: string): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      operation,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`${label} timed out after ${FIRESTORE_TIMEOUT_MS}ms`));
        }, FIRESTORE_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
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
  console.info("[portfolioRepository] reading Firestore record", {
    path: getPortfolioDocumentPath(),
  });
  const snapshot = await withTimeout(
    getDoc(ref),
    `Firestore read for ${getPortfolioDocumentPath()}`
  );

  if (!snapshot.exists()) {
    console.info("[portfolioRepository] Firestore record missing", {
      path: getPortfolioDocumentPath(),
    });
    return null;
  }

  return normalizePortfolioRecord(snapshot.data());
};

const writeFirestoreRecord = async (record: PortfolioRecord): Promise<void> => {
  if (!hasFirebaseConfig || !firestoreDb) {
    return;
  }

  const ref = doc(firestoreDb, PORTFOLIO_COLLECTION, PORTFOLIO_DOCUMENT);
  console.info("[portfolioRepository] writing Firestore record", {
    path: getPortfolioDocumentPath(),
    updatedAt: record.updatedAt,
    publishedAt: record.publishedAt,
  });
  await withTimeout(
    setDoc(ref, record, { merge: false }),
    `Firestore write for ${getPortfolioDocumentPath()}`
  );
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
  console.info("[portfolioRepository] saveDraftPortfolioData start", {
    firebaseConfigured: hasFirebaseConfig,
    path: getPortfolioDocumentPath(),
  });
  const { record } = await getRecord();

  const nextRecord: PortfolioRecord = {
    ...record,
    draft: normalizePortfolioContent(input, record.draft),
    updatedAt: new Date().toISOString(),
  };

  const source = await persistRecord(nextRecord);
  console.info("[portfolioRepository] saveDraftPortfolioData complete", {
    source,
    path: getPortfolioDocumentPath(),
    updatedAt: nextRecord.updatedAt,
  });
  return { source, record: nextRecord };
};

export const publishPortfolioData = async (): Promise<{
  source: "firebase" | "local";
  record: PortfolioRecord;
}> => {
  console.info("[portfolioRepository] publishPortfolioData start", {
    firebaseConfigured: hasFirebaseConfig,
    path: getPortfolioDocumentPath(),
  });
  const { record } = await getRecord();
  const now = new Date().toISOString();

  const nextRecord: PortfolioRecord = {
    ...record,
    published: structuredClone(record.draft),
    updatedAt: now,
    publishedAt: now,
  };

  const source = await persistRecord(nextRecord);
  console.info("[portfolioRepository] publishPortfolioData complete", {
    source,
    path: getPortfolioDocumentPath(),
    publishedAt: nextRecord.publishedAt,
  });
  return { source, record: nextRecord };
};


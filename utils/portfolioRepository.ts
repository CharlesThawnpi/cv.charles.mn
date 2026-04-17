import "server-only";

import {
  createSeededPortfolioRecord,
  normalizePortfolioContent,
  type PortfolioContent,
  type PortfolioRecord,
} from "@/config/contentModel";
import {
  firebaseAdminInitError,
  firestoreAdminDb,
  getFirebaseAdminDebugInfo,
  hasFirebaseAdminConfig,
} from "@/firebase/firebaseAdmin";

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

const readAdminFirestoreRecord = async (): Promise<PortfolioRecord | null> => {
  if (firebaseAdminInitError) {
    throw new Error(`Firebase Admin initialization failed: ${firebaseAdminInitError}`);
  }

  if (!hasFirebaseAdminConfig || !firestoreAdminDb) {
    return null;
  }

  const ref = firestoreAdminDb.collection(PORTFOLIO_COLLECTION).doc(PORTFOLIO_DOCUMENT);
  console.info("[portfolioRepository] reading Firestore Admin record", {
    path: getPortfolioDocumentPath(),
    ...getFirebaseAdminDebugInfo(),
  });

  const snapshot = await withTimeout(
    ref.get(),
    `Firestore Admin read for ${getPortfolioDocumentPath()}`
  );

  if (!snapshot.exists) {
    console.info("[portfolioRepository] Firestore Admin record missing", {
      path: getPortfolioDocumentPath(),
    });
    return null;
  }

  return normalizePortfolioRecord(snapshot.data());
};

const writeAdminFirestoreRecord = async (record: PortfolioRecord): Promise<void> => {
  if (firebaseAdminInitError) {
    throw new Error(`Firebase Admin initialization failed: ${firebaseAdminInitError}`);
  }

  if (!hasFirebaseAdminConfig || !firestoreAdminDb) {
    return;
  }

  const ref = firestoreAdminDb.collection(PORTFOLIO_COLLECTION).doc(PORTFOLIO_DOCUMENT);
  console.info("[portfolioRepository] writing Firestore Admin record", {
    path: getPortfolioDocumentPath(),
    updatedAt: record.updatedAt,
    publishedAt: record.publishedAt,
    ...getFirebaseAdminDebugInfo(),
  });

  await withTimeout(
    ref.set(record),
    `Firestore Admin write for ${getPortfolioDocumentPath()}`
  );
};

const getRecord = async (mode: "strict" | "fallback"): Promise<{
  record: PortfolioRecord;
  source: "firebase" | "local";
}> => {
  if (hasFirebaseAdminConfig && firestoreAdminDb) {
    try {
      const firebaseRecord = await readAdminFirestoreRecord();

      if (firebaseRecord) {
        return { record: firebaseRecord, source: "firebase" };
      }

      const initialRecord = createSeededPortfolioRecord();
      await writeAdminFirestoreRecord(initialRecord);
      return { record: initialRecord, source: "firebase" };
    } catch (error) {
      console.error("[portfolioRepository] Firestore Admin read failed", {
        path: getPortfolioDocumentPath(),
        error: error instanceof Error ? error.message : "Unknown error",
        ...getFirebaseAdminDebugInfo(),
      });

      if (mode === "strict") {
        throw error;
      }
    }
  }

  return { record: getFallbackRecord(), source: "local" };
};

const persistRecord = async (
  record: PortfolioRecord,
  mode: "strict" | "fallback"
): Promise<"firebase" | "local"> => {
  if (hasFirebaseAdminConfig && firestoreAdminDb) {
    try {
      await writeAdminFirestoreRecord(record);
      return "firebase";
    } catch (error) {
      console.error("[portfolioRepository] Firestore Admin write failed", {
        path: getPortfolioDocumentPath(),
        error: error instanceof Error ? error.message : "Unknown error",
        ...getFirebaseAdminDebugInfo(),
      });

      if (mode === "strict") {
        throw error;
      }
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
  const { record, source } = await getRecord("fallback");

  return {
    content: isPreview ? record.draft : record.published,
    mode: isPreview ? "preview" : "published",
    source,
  };
};

export const getAdminPortfolioData = async (): Promise<PortfolioAdminResult> => {
  const { record, source } = await getRecord("strict");

  return {
    record,
    source,
    firebaseConfigured: hasFirebaseAdminConfig,
  };
};

export const saveDraftPortfolioData = async (
  input: unknown
): Promise<{ source: "firebase" | "local"; record: PortfolioRecord }> => {
  console.info("[portfolioRepository] saveDraftPortfolioData start", {
    firebaseConfigured: hasFirebaseAdminConfig,
    path: getPortfolioDocumentPath(),
    ...getFirebaseAdminDebugInfo(),
  });
  const { record } = await getRecord("strict");

  const nextRecord: PortfolioRecord = {
    ...record,
    draft: normalizePortfolioContent(input, record.draft),
    updatedAt: new Date().toISOString(),
  };

  const source = await persistRecord(nextRecord, "strict");
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
    firebaseConfigured: hasFirebaseAdminConfig,
    path: getPortfolioDocumentPath(),
    ...getFirebaseAdminDebugInfo(),
  });
  const { record } = await getRecord("strict");
  const now = new Date().toISOString();

  const nextRecord: PortfolioRecord = {
    ...record,
    published: structuredClone(record.draft),
    updatedAt: now,
    publishedAt: now,
  };

  const source = await persistRecord(nextRecord, "strict");
  console.info("[portfolioRepository] publishPortfolioData complete", {
    source,
    path: getPortfolioDocumentPath(),
    publishedAt: nextRecord.publishedAt,
  });
  return { source, record: nextRecord };
};

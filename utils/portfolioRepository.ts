import "server-only";

import {
  createSeededPortfolioRecord,
  normalizePortfolioContent,
  type PortfolioContent,
  type PortfolioRecord,
} from "@/config/contentModel";
import {
  getPostgresDebugInfo,
  hasPostgresConfig,
  withPostgresClient,
  withPostgresTimeout,
} from "@/db/postgres";

const PORTFOLIO_TABLE = "portfolio_content";
const PORTFOLIO_RECORD_ID = "primary";

declare global {
  // eslint-disable-next-line no-var
  var __portfolioRecordFallback: PortfolioRecord | undefined;
  // eslint-disable-next-line no-var
  var __portfolioTableInitPromise: Promise<void> | undefined;
}

interface PortfolioRow {
  id: string;
  draft_json: unknown;
  published_json: unknown;
  created_at: Date | string;
  updated_at: Date | string;
  published_at: Date | string | null;
}

interface RepositoryRecord {
  record: PortfolioRecord;
  rawDraft: unknown;
  rawPublished: unknown;
}

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS portfolio_content (
    id TEXT PRIMARY KEY,
    draft_json JSONB NOT NULL,
    published_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ NULL
  );
`;

const getFallbackRecord = (): PortfolioRecord => {
  if (!globalThis.__portfolioRecordFallback) {
    globalThis.__portfolioRecordFallback = createSeededPortfolioRecord();
  }

  return globalThis.__portfolioRecordFallback;
};

const setFallbackRecord = (record: PortfolioRecord) => {
  globalThis.__portfolioRecordFallback = record;
};

const getPortfolioTablePath = () => PORTFOLIO_TABLE;

const asIsoString = (value: Date | string | null | undefined, fallback: string | null): string | null => {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return fallback;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

// Merge normalized schema data into the raw stored JSON so future schema additions
// backfill safely without dropping already-saved keys that newer/older code doesn't know about.
const mergeStoredContent = (base: unknown, next: unknown): unknown => {
  if (Array.isArray(next)) {
    return next;
  }

  if (isPlainObject(next)) {
    const baseObject = isPlainObject(base) ? base : {};
    const merged: Record<string, unknown> = { ...baseObject };

    for (const [key, value] of Object.entries(next)) {
      merged[key] = mergeStoredContent(baseObject[key], value);
    }

    return merged;
  }

  return next;
};

const normalizePortfolioRecord = (input: unknown): PortfolioRecord => {
  const fallback = createSeededPortfolioRecord();

  if (typeof input !== "object" || input === null) {
    return fallback;
  }

  const data = input as Record<string, unknown>;

  return {
    draft: normalizePortfolioContent(data.draft, fallback.draft),
    published: normalizePortfolioContent(data.published, fallback.published),
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : fallback.updatedAt,
    publishedAt:
      typeof data.publishedAt === "string" || data.publishedAt === null
        ? data.publishedAt
        : fallback.publishedAt,
  };
};

const mapPortfolioRow = (row: PortfolioRow): PortfolioRecord => {
  return normalizePortfolioRecord({
    draft: row.draft_json,
    published: row.published_json,
    updatedAt: asIsoString(row.updated_at, createSeededPortfolioRecord().updatedAt),
    publishedAt: asIsoString(row.published_at, null),
  });
};

const ensurePortfolioTable = async () => {
  if (globalThis.__portfolioTableInitPromise) {
    return globalThis.__portfolioTableInitPromise;
  }

  globalThis.__portfolioTableInitPromise = withPostgresClient(async (client) => {
    console.info("[portfolioRepository] ensuring PostgreSQL table", {
      table: getPortfolioTablePath(),
      ...getPostgresDebugInfo(),
    });

    await withPostgresTimeout(
      client.query(CREATE_TABLE_SQL),
      `Create table ${getPortfolioTablePath()}`
    );
  }, "Ensure portfolio table");

  try {
    await globalThis.__portfolioTableInitPromise;
  } catch (error) {
    globalThis.__portfolioTableInitPromise = undefined;
    throw error;
  }
};

const readPostgresRecord = async (): Promise<RepositoryRecord | null> => {
  await ensurePortfolioTable();

  return withPostgresClient(async (client) => {
    console.info("[portfolioRepository] reading PostgreSQL record", {
      table: getPortfolioTablePath(),
      id: PORTFOLIO_RECORD_ID,
      ...getPostgresDebugInfo(),
    });

    const result = await withPostgresTimeout(
      client.query<PortfolioRow>(
        `
          SELECT id, draft_json, published_json, created_at, updated_at, published_at
          FROM portfolio_content
          WHERE id = $1
          LIMIT 1
        `,
        [PORTFOLIO_RECORD_ID]
      ),
      `Read portfolio record from ${getPortfolioTablePath()}`
    );

    if (result.rows.length === 0) {
      console.info("[portfolioRepository] PostgreSQL record missing", {
        table: getPortfolioTablePath(),
        id: PORTFOLIO_RECORD_ID,
      });
      return null;
    }

    const row = result.rows[0];

    return {
      record: mapPortfolioRow(row),
      rawDraft: row.draft_json,
      rawPublished: row.published_json,
    };
  }, "Read portfolio record");
};

const insertSeedRecordIfMissing = async (): Promise<RepositoryRecord> => {
  await ensurePortfolioTable();

  const seed = createSeededPortfolioRecord();

  return withPostgresClient(async (client) => {
    console.info("[portfolioRepository] creating seeded PostgreSQL record", {
      table: getPortfolioTablePath(),
      id: PORTFOLIO_RECORD_ID,
    });

    await withPostgresTimeout(
      client.query(
        `
          INSERT INTO portfolio_content (
            id,
            draft_json,
            published_json,
            updated_at,
            published_at
          )
          VALUES ($1, $2::jsonb, $3::jsonb, $4::timestamptz, $5::timestamptz)
          ON CONFLICT (id) DO NOTHING
        `,
        [
          PORTFOLIO_RECORD_ID,
          JSON.stringify(seed.draft),
          JSON.stringify(seed.published),
          seed.updatedAt,
          seed.publishedAt,
        ]
      ),
      `Insert seed portfolio record into ${getPortfolioTablePath()}`
    );

    const result = await withPostgresTimeout(
      client.query<PortfolioRow>(
        `
          SELECT id, draft_json, published_json, created_at, updated_at, published_at
          FROM portfolio_content
          WHERE id = $1
          LIMIT 1
        `,
        [PORTFOLIO_RECORD_ID]
      ),
      `Read seeded portfolio record from ${getPortfolioTablePath()}`
    );

    if (result.rows.length === 0) {
      throw new Error("Failed to seed PostgreSQL portfolio content record.");
    }

    const row = result.rows[0];

    return {
      record: mapPortfolioRow(row),
      rawDraft: row.draft_json,
      rawPublished: row.published_json,
    };
  }, "Seed portfolio record");
};

const writePostgresRecord = async (record: PortfolioRecord): Promise<void> => {
  await ensurePortfolioTable();

  await withPostgresClient(async (client) => {
    console.info("[portfolioRepository] writing PostgreSQL record", {
      table: getPortfolioTablePath(),
      id: PORTFOLIO_RECORD_ID,
      updatedAt: record.updatedAt,
      publishedAt: record.publishedAt,
      ...getPostgresDebugInfo(),
    });

    await withPostgresTimeout(
      client.query(
        `
          INSERT INTO portfolio_content (
            id,
            draft_json,
            published_json,
            updated_at,
            published_at
          )
          VALUES ($1, $2::jsonb, $3::jsonb, $4::timestamptz, $5::timestamptz)
          ON CONFLICT (id)
          DO UPDATE SET
            draft_json = EXCLUDED.draft_json,
            published_json = EXCLUDED.published_json,
            updated_at = EXCLUDED.updated_at,
            published_at = EXCLUDED.published_at
        `,
        [
          PORTFOLIO_RECORD_ID,
          JSON.stringify(record.draft),
          JSON.stringify(record.published),
          record.updatedAt,
          record.publishedAt,
        ]
      ),
      `Write portfolio record to ${getPortfolioTablePath()}`
    );
  }, "Write portfolio record");
};

const getRecord = async (
  mode: "strict" | "fallback"
): Promise<{
  record: PortfolioRecord;
  rawDraft: unknown;
  rawPublished: unknown;
  source: "postgres" | "local";
}> => {
  if (hasPostgresConfig) {
    try {
      const postgresRecord = await readPostgresRecord();

      if (postgresRecord) {
        return {
          record: postgresRecord.record,
          rawDraft: postgresRecord.rawDraft,
          rawPublished: postgresRecord.rawPublished,
          source: "postgres",
        };
      }

      const seededRecord = await insertSeedRecordIfMissing();
      return {
        record: seededRecord.record,
        rawDraft: seededRecord.rawDraft,
        rawPublished: seededRecord.rawPublished,
        source: "postgres",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown PostgreSQL error";

      console.error("[portfolioRepository] PostgreSQL read failed", {
        table: getPortfolioTablePath(),
        id: PORTFOLIO_RECORD_ID,
        error: message,
        ...getPostgresDebugInfo(),
      });

      if (mode === "strict") {
        throw new Error(message);
      }
    }
  }

  const fallbackRecord = getFallbackRecord();

  return {
    record: fallbackRecord,
    rawDraft: fallbackRecord.draft,
    rawPublished: fallbackRecord.published,
    source: "local",
  };
};

const persistRecord = async (
  record: PortfolioRecord,
  mode: "strict" | "fallback"
): Promise<"postgres" | "local"> => {
  if (hasPostgresConfig) {
    try {
      await writePostgresRecord(record);
      return "postgres";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown PostgreSQL error";

      console.error("[portfolioRepository] PostgreSQL write failed", {
        table: getPortfolioTablePath(),
        id: PORTFOLIO_RECORD_ID,
        error: message,
        ...getPostgresDebugInfo(),
      });

      if (mode === "strict") {
        throw new Error(message);
      }
    }
  }

  setFallbackRecord(record);
  return "local";
};

export interface PortfolioPublicResult {
  content: PortfolioContent;
  mode: "published" | "preview";
  source: "postgres" | "local";
}

export interface PortfolioAdminResult {
  record: PortfolioRecord;
  source: "postgres" | "local";
  postgresConfigured: boolean;
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
    postgresConfigured: hasPostgresConfig,
  };
};

export const saveDraftPortfolioData = async (
  input: unknown
): Promise<{ source: "postgres" | "local"; record: PortfolioRecord }> => {
  console.info("[portfolioRepository] saveDraftPortfolioData start", {
    postgresConfigured: hasPostgresConfig,
    table: getPortfolioTablePath(),
    id: PORTFOLIO_RECORD_ID,
    ...getPostgresDebugInfo(),
  });

  const { record, rawDraft, rawPublished } = await getRecord("strict");
  const normalizedDraft = normalizePortfolioContent(input, record.draft);
  const mergedDraft = normalizePortfolioContent(
    mergeStoredContent(rawDraft, normalizedDraft),
    record.draft
  );

  const nextRecord: PortfolioRecord = {
    ...record,
    draft: mergedDraft,
    published: normalizePortfolioContent(
      mergeStoredContent(rawPublished, record.published),
      record.published
    ),
    updatedAt: new Date().toISOString(),
  };

  console.info("[portfolioRepository] saveDraftPortfolioData merge strategy", {
    preservesRawStoredKeys: true,
    addsSchemaDefaultsSafely: true,
  });

  const source = await persistRecord(nextRecord, "strict");
  console.info("[portfolioRepository] saveDraftPortfolioData complete", {
    source,
    table: getPortfolioTablePath(),
    id: PORTFOLIO_RECORD_ID,
    updatedAt: nextRecord.updatedAt,
  });
  return { source, record: nextRecord };
};

export const publishPortfolioData = async (): Promise<{
  source: "postgres" | "local";
  record: PortfolioRecord;
}> => {
  console.info("[portfolioRepository] publishPortfolioData start", {
    postgresConfigured: hasPostgresConfig,
    table: getPortfolioTablePath(),
    id: PORTFOLIO_RECORD_ID,
    ...getPostgresDebugInfo(),
  });

  const { record, rawPublished } = await getRecord("strict");
  const now = new Date().toISOString();
  const mergedPublished = normalizePortfolioContent(
    mergeStoredContent(rawPublished, record.draft),
    record.draft
  );

  const nextRecord: PortfolioRecord = {
    ...record,
    published: structuredClone(mergedPublished),
    updatedAt: now,
    publishedAt: now,
  };

  console.info("[portfolioRepository] publishPortfolioData merge strategy", {
    preservesRawStoredKeys: true,
    addsSchemaDefaultsSafely: true,
  });

  const source = await persistRecord(nextRecord, "strict");
  console.info("[portfolioRepository] publishPortfolioData complete", {
    source,
    table: getPortfolioTablePath(),
    id: PORTFOLIO_RECORD_ID,
    publishedAt: nextRecord.publishedAt,
  });
  return { source, record: nextRecord };
};

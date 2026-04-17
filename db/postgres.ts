import "server-only";

import { Pool, type PoolClient } from "pg";

const POSTGRES_TIMEOUT_MS = 8000;

const getPostgresConfig = () => {
  const databaseUrl =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    "";

  return {
    databaseUrl,
  };
};

export const hasPostgresConfig = Boolean(getPostgresConfig().databaseUrl);

export const getPostgresDebugInfo = () => {
  const { databaseUrl } = getPostgresConfig();

  return {
    configured: hasPostgresConfig,
    databaseUrlPresent: Boolean(databaseUrl),
    usingVercelPostgresUrl: Boolean(process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL),
  };
};

declare global {
  // eslint-disable-next-line no-var
  var __portfolioPgPool: Pool | undefined;
}

const createPool = () => {
  const { databaseUrl } = getPostgresConfig();

  return new Pool({
    connectionString: databaseUrl,
    max: 5,
    idleTimeoutMillis: 10000,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : undefined,
  });
};

export const postgresPool = hasPostgresConfig
  ? (globalThis.__portfolioPgPool ??= createPool())
  : null;

export const withPostgresTimeout = async <T>(operation: Promise<T>, label: string): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      operation,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`${label} timed out after ${POSTGRES_TIMEOUT_MS}ms`));
        }, POSTGRES_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
};

export const withPostgresClient = async <T>(
  callback: (client: PoolClient) => Promise<T>,
  label: string
): Promise<T> => {
  if (!postgresPool) {
    throw new Error("PostgreSQL is not configured. Set DATABASE_URL in the environment.");
  }

  const client = await withPostgresTimeout(postgresPool.connect(), `${label} connection`);

  try {
    return await callback(client);
  } finally {
    client.release();
  }
};

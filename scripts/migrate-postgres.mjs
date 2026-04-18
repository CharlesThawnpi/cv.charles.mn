import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import nextEnv from "@next/env";
import { Client } from "pg";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const databaseUrl =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL;

if (!databaseUrl) {
  console.error("Missing PostgreSQL connection string. Set POSTGRES_URL_NON_POOLING or DATABASE_URL.");
  process.exit(1);
}

const migrationPath = path.join(process.cwd(), "db", "migrations", "001_create_portfolio_content.sql");
const sql = await readFile(migrationPath, "utf8");

const client = new Client({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});

try {
  await client.connect();
  await client.query(sql);
  console.log("PostgreSQL migration applied successfully.");
} finally {
  await client.end();
}

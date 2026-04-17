CREATE TABLE IF NOT EXISTS portfolio_content (
  id TEXT PRIMARY KEY,
  draft_json JSONB NOT NULL,
  published_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ NULL
);

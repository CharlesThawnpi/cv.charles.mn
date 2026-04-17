# Charles Portfolio Platform

Next.js App Router portfolio with draft/publish workflow, protected admin editor, preview mode, printable CV, and PostgreSQL-backed content persistence for Vercel.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create your local env file:
   ```bash
   copy .env.example .env
   ```
3. Run the PostgreSQL migration:
   ```bash
   npm run db:migrate
   ```
4. Start the app:
   ```bash
   npm run dev
   ```
5. Verify the production build:
   ```bash
   npm run build
   ```

## Deployment Target

This project is prepared for standard Vercel deployment using the default Next.js build pipeline.

No Cloudflare Workers, OpenNext, Wrangler, or Firebase persistence layer is required for the active production path.

## GitHub Workflow

1. Make changes locally in VS Code.
2. Verify locally:
   ```bash
   npm run build
   ```
3. Commit and push to GitHub.
4. Let Vercel deploy from the connected branch.

## Required Environment Variables

### Required for admin auth

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

### Required for PostgreSQL persistence

- `DATABASE_URL` for local development or non-Vercel environments

### Vercel Postgres-provided environment variables

When you connect Vercel Postgres, Vercel will typically provide:

- `POSTGRES_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

The app uses `DATABASE_URL` first, then falls back to `POSTGRES_URL` / `POSTGRES_PRISMA_URL`.

### Deprecated Firebase variables

These are no longer used for active persistence:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

## Database Bootstrap

The durable content table is:

- `portfolio_content`

It stores one canonical row with:

- `id`
- `draft_json`
- `published_json`
- `created_at`
- `updated_at`
- `published_at`

Migration command:

```bash
npm run db:migrate
```

Initial content is auto-seeded on first read if no `portfolio_content` row exists yet.

## Vercel Setup

Use the default Next.js project settings in Vercel:

- Framework preset: `Next.js`
- Build command: `npm run build`
- Install command: `npm install`
- Output setting: leave default

Then:

1. Connect a Vercel Postgres database to the project.
2. Ensure the project has Postgres environment variables available.
3. Run the SQL migration using `npm run db:migrate` against the same database.
4. Redeploy.

## Important Routes

These routes are expected to work in the deployed app:

- `/`
- `/cv`
- `/admin/login`
- `/admin/dashboard`

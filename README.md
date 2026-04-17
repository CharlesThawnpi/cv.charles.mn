# Charles Portfolio Platform

Next.js App Router portfolio with draft/publish workflow, protected admin editor, preview mode, and printable CV.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create your local env file:
   ```bash
   copy .env.example .env
   ```
3. Start the app:
   ```bash
   npm run dev
   ```
4. Verify the production build:
   ```bash
   npm run build
   ```

## Deployment Target

This project is prepared for standard Vercel deployment using the default Next.js build pipeline.

No Cloudflare Workers, OpenNext, Wrangler, or custom deployment wrapper is required.

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

### Optional for Firebase persistence

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

For durable admin save/publish persistence on Vercel, set the `FIREBASE_ADMIN_*` variables from a Firebase service account.

If the Firebase Admin variables are omitted, admin persistence falls back to the local seeded/in-memory content flow.

## Vercel Setup

Use the default Next.js project settings in Vercel:

- Framework preset: `Next.js`
- Build command: `npm run build`
- Install command: `npm install`
- Output setting: leave default

Add the required environment variables in the Vercel project settings before deploying production.

For Firebase Admin on Vercel:

- `FIREBASE_ADMIN_PROJECT_ID`: your Firebase project ID
- `FIREBASE_ADMIN_CLIENT_EMAIL`: service account client email
- `FIREBASE_ADMIN_PRIVATE_KEY`: full private key string with `\n` line breaks preserved

## Important Routes

These routes are expected to work in the deployed app:

- `/`
- `/cv`
- `/admin/login`
- `/admin/dashboard`

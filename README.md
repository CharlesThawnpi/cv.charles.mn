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
3. Start dev server:
   ```bash
   npm run dev
   ```
4. Production build check:
   ```bash
   npm run build
   ```

## GitHub Workflow (VS Code -> GitHub -> Cloudflare)

1. Create/modify code locally in VS Code.
2. Validate locally:
   ```bash
   npm run build
   ```
3. Commit and push to GitHub.
4. Cloudflare Pages auto-deploys from the connected branch.

Typical daily commands:

```bash
git add .
git commit -m "Describe change"
git push
```

## Cloudflare Pages Deployment

This project uses dynamic Next.js features (`app` routes, API routes, auth cookies, preview mode).

Cloudflare's Next.js Pages docs currently route full-stack Next.js users toward the Workers guide, while Pages build settings still provide a Next.js preset using `@cloudflare/next-on-pages`.

For Pages deployment, use the Next.js preset values below.

### Pages Build Settings

- Framework preset: `Next.js`
- Build command: `npx @cloudflare/next-on-pages@1`
- Build output directory: `.vercel/output/static`
- Root directory: (leave blank unless you move this app into a monorepo)
- Node version: set `NODE_VERSION=22`

### Local Note About `build:pages`

A helper script exists:

```bash
npm run build:pages
```

On Windows shells without `bash`, `@cloudflare/next-on-pages` can fail locally even though Cloudflare's Linux build environment can run it.

## Environment Variables

### Required for local/admin auth

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

### Optional (enables Firebase persistence)

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### In Cloudflare Pages

Set these in **Workers & Pages -> <project> -> Settings -> Environment variables** for both:
- Production
- Preview

Recommended minimum:
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `NODE_VERSION=22`

Add Firebase variables only when you want remote persistence.

## Custom Domain (Later)

After first successful deployment:

1. Open **Workers & Pages -> your project -> Custom domains**.
2. Add your domain/subdomain.
3. Follow DNS instructions shown by Cloudflare.
4. Wait for SSL certificate issuance and verify routes.

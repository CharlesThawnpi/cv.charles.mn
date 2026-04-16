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

## GitHub Workflow

1. Make changes locally in VS Code.
2. Verify locally:
   ```bash
   npm run build
   ```
3. Commit and push to GitHub.
4. Redeploy from Cloudflare Workers/OpenNext.

Typical daily commands:

```bash
git add .
git commit -m "Describe change"
git push
```

## Cloudflare Deployment Model

This project should be deployed as **Cloudflare Workers with OpenNext**, not legacy Pages with `next-on-pages`.

The committed deployment files are:

- `wrangler.jsonc`
- `open-next.config.ts`

The worker name and self-reference service binding are both explicitly set to:

```txt
cv-charles-mn
```

That prevents OpenNext from inferring a sanitized name such as `cvcharlesmn`.

## Cloudflare Build and Deploy

Build the Worker bundle locally:

```bash
npm run cf:build
```

Preview locally with Wrangler:

```bash
npm run cf:preview
```

Deploy to Cloudflare:

```bash
npm run cf:deploy
```

If you deploy from the Cloudflare dashboard or CI, make sure it uses the committed `wrangler.jsonc` and `open-next.config.ts` files.

## Environment Variables

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

### In Cloudflare

Set the same runtime env vars in the Worker project before redeploying.

Minimum recommended:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

Add Firebase variables only when you want persistent remote content storage.

## Custom Domain

After the Worker deploy succeeds:

1. Open the Cloudflare Worker project.
2. Add your custom domain or route.
3. Follow the DNS prompts from Cloudflare.
4. Verify `/`, `/cv`, `/admin/login`, and `/admin/dashboard`.

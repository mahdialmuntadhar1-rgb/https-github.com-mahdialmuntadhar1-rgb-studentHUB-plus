# Rafid Outreach Deployment

The outreach backend is merged into the real `rafid-api` Worker. All routes live under `/api/outreach/*` and use the existing JWT `authMiddleware` plus `adminMiddleware`, except public unsubscribe and provider webhook routes.

## Local checks

```bash
npm run lint
npm run build
cd backend
npx tsc --noEmit
npx wrangler deploy --config ./wrangler.toml --dry-run --outdir .wrangler/outreach-check
```

## Apply D1 migration

Local:

```bash
cd backend
npx wrangler d1 execute rafid-db --config ./wrangler.toml --local --file=./migrations/0001_outreach.sql
```

Production:

```bash
cd backend
npx wrangler d1 execute rafid-db --config ./wrangler.toml --remote --file=./migrations/0001_outreach.sql
```

## Required Worker secrets

Keep `DRY_RUN=true` until import, preview, test email, unsubscribe, admin-only protection, and duplicate prevention are confirmed.

```bash
cd backend
npx wrangler secret put EMAIL_API_KEY --config ./wrangler.toml
npx wrangler secret put UNSUBSCRIBE_SECRET --config ./wrangler.toml
```

If you move `JWT_SECRET` out of `wrangler.toml`, set it as a secret too:

```bash
npx wrangler secret put JWT_SECRET --config ./wrangler.toml
```

## Non-secret Worker vars

These are already represented in `wrangler.toml`:

```toml
EMAIL_PROVIDER = "resend"
EMAIL_FROM_NAME = "Jamiaati"
EMAIL_FROM_ADDRESS = "outreach@example.com"
EMAIL_REPLY_TO = "hello@example.com"
PUBLIC_APP_URL = "https://https-github.mahdialmuntadhar1.workers.dev"
ADMIN_TEST_EMAIL = "admin@example.com"
DRY_RUN = "true"
TEST_MODE = "false"
BATCH_SIZE = "25"
DELAY_SECONDS = "30"
MAX_PER_DAY = "500"
```

## Deploy

Backend:

```bash
cd backend
npm run deploy
```

Frontend:

```bash
npm run build
npm run deploy
```

## First safe milestone

1. Keep `DRY_RUN=true`.
2. Import 10 university/institution contacts.
3. Confirm duplicate emails are counted and not duplicated.
4. Create a template using `{{institution_name}}`, `{{greeting}}`, and `{{unsubscribe_url}}`.
5. Preview personalized emails.
6. Send one test email to `ADMIN_TEST_EMAIL`.
7. Test one unsubscribe link.
8. Only then consider `DRY_RUN=false` with 3 controlled test contacts.

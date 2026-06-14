# StudentHUB-plus / Jamiaati

StudentHUB-plus is a React/Vite frontend with a local Express dev server and a Cloudflare Worker automation backend for Jamiaati student opportunities.

## Prerequisites

- Node.js 20+
- npm
- Cloudflare Wrangler for manual Cloudflare work: `npm install -g wrangler`
- A Cloudflare D1 database named `rafid-db`
- Optional R2 bucket named `rafid-uploads` before production uploads are enabled

## Local Run

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create local env from the template:

   ```bash
   cp .env.example .env
   ```

3. Keep dry-run flags enabled while developing:

   ```env
   VITE_API_URL=http://127.0.0.1:3000
   DRY_RUN_AUTOMATION=true
   DRY_RUN_EMAILS=true
   DRY_RUN=true
   ```

4. Run the full-stack local dev server:

   ```bash
   npm run dev
   ```

5. Open:

   ```text
   http://127.0.0.1:3000
   ```

## Build

```bash
npm run lint
npm run build
```

The build outputs the frontend and bundled local server to `dist/`.

## Promote an Admin User

Registration creates normal `student` users. Promote a backend-confirmed admin/staff user only through this utility or a direct D1 admin action.

Promote an existing local JSON user:

```bash
npm run admin:promote -- --email=admin@example.com --role=staff
```

Create a local JSON admin user only when explicitly needed for local dev:

```bash
npm run admin:promote -- --email=admin@example.com --role=admin --create --name="Jamiaati Admin" --password=replace-with-12-plus-chars
```

Generate safe production D1 promotion SQL for an existing registered user:

```bash
npm run admin:promote -- --email=admin@example.com --role=staff --sql > promote-admin.sql
wrangler d1 execute rafid-db --remote --file=./promote-admin.sql
```

Allowed utility roles are `staff` and `admin`. The script does not print password hashes or secrets. For production, register the user normally first, then promote the existing D1 row.

Admin verification checklist:

```bash
npm run lint
npm run build
npm run admin:promote -- --email=admin@example.com --role=staff
```

Then log in as that user locally and verify:

```bash
curl http://127.0.0.1:3000/api/opportunity-automation/stats
# expected without token: 401

curl -H "Authorization: Bearer $ADMIN_JWT" \
  http://127.0.0.1:3000/api/opportunity-automation/stats
# expected with backend-confirmed staff/admin token: 200
```

This does not deploy and does not send emails.

## Environment

Required or supported variables:

- `GEMINI_API_KEY`: Enables live Gemini AI responses and opportunity cleanup.
- `JWT_SECRET`: Production auth token signing secret. `AUTH_TOKEN_SECRET` is still supported for older setups.
- `RESEND_API_KEY`: Email provider key, only for future real email sending.
- `DRY_RUN_AUTOMATION=true`: Keeps automation actions safe.
- `DRY_RUN_EMAILS=true`: Keeps outreach/password reset email paths from sending real email.
- `DRY_RUN=true`: Global safety flag. Keep this enabled for local development and production staging.
- `VITE_API_URL`: Frontend backend API origin. Use `http://127.0.0.1:3000` for full local backend testing. Default in code is `https://rafid-api.mahdialmuntadhar1.workers.dev`.
- `R2_PUBLIC_BASE_URL`: Public base URL for durable R2 uploads after upload handling is configured.

Real email sending is disabled. Keep `DRY_RUN=true` and `DRY_RUN_EMAILS=true`; in dry-run mode the app writes outreach logs only and does not call the email provider API.

Before any future real-send approval, verify:

- Sender domain is verified with the provider.
- SPF, DKIM, and DMARC are configured and passing.
- Unsubscribe link and suppression handling are ready and tested.
- Test sends are limited to an internal test mailbox.
- Bulk sending remains disabled until reviewed separately.
- `DRY_RUN=false` and `DRY_RUN_EMAILS=false` are changed only with explicit production approval.

## Cloudflare Bindings

`wrangler.toml` is prepared for the backend Worker:

- Worker name: `rafid-api`
- Worker entry: `worker-scraper.ts`
- D1 binding variable: `DB`
- D1 database name: `rafid-db`
- R2 binding variable: `UPLOADS`
- R2 bucket name: `rafid-uploads`

Before deploying, replace the placeholder `database_id` in `wrangler.toml` with the real D1 database ID from Cloudflare.

## D1 Migrations

Create the database once if needed:

```bash
wrangler d1 create rafid-db
```

Apply the full schema manually:

```bash
wrangler d1 execute rafid-db --remote --file=./schema.sql
```

Apply incremental migrations manually when needed for existing databases:

```bash
wrangler d1 execute rafid-db --remote --file=./migrations/0001_auth_users.sql
wrangler d1 execute rafid-db --remote --file=./migrations/0002_opportunity_status_and_dedupe.sql
wrangler d1 execute rafid-db --remote --file=./migrations/0003_user_content_persistence.sql
wrangler d1 execute rafid-db --remote --file=./migrations/0004_outreach_dry_run_safety.sql
```

Run local migration checks without `--remote` only against a disposable local D1 database.

## Manual Backend Deploy

This repo must not auto-deploy. When ready, deploy manually:

```bash
wrangler deploy --config wrangler.toml
```

Set secrets manually:

```bash
wrangler secret put GEMINI_API_KEY
wrangler secret put JWT_SECRET
wrangler secret put RESEND_API_KEY
```

Keep these vars true until production approval:

```bash
wrangler secret put DRY_RUN_AUTOMATION
wrangler secret put DRY_RUN_EMAILS
```

The Worker currently supports the production-critical API surface:

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password` in DRY_RUN mode
- `GET /api/institutions`
- `GET /api/opportunities`
- `GET /api/highlights`
- `GET/PATCH /api/admin/portal-settings`
- `GET /api/opportunity-automation/status`
- `GET /api/opportunity-automation/stats`
- source list/create/enable/delete endpoints
- candidate list/edit/approve/reject/duplicate/expired endpoints
- `GET /api/opportunity-automation/logs`
- `POST /api/opportunity-automation/run-now`

Worker mode intentionally does not yet support single-source run or CSV import. Those routes return a clear `501` instead of silently doing the wrong thing.

## Manual Frontend Deploy

Build the frontend:

```bash
npm run build
```

For Cloudflare Pages, set:

```env
VITE_API_URL=https://rafid-api.mahdialmuntadhar1.workers.dev
```

Then deploy `dist/` manually through the Cloudflare dashboard or your chosen Pages workflow. Do not run deployment from automation unless explicitly approved.

## Smoke Tests

Local:

```bash
curl http://127.0.0.1:3000/api/health
curl "http://127.0.0.1:3000/api/institutions?limit=5"
curl "http://127.0.0.1:3000/api/opportunities?limit=5"
curl "http://127.0.0.1:3000/api/highlights?limit=5"
curl http://127.0.0.1:3000/api/admin/portal-settings
```

Remote backend after manual deploy:

```bash
curl https://rafid-api.mahdialmuntadhar1.workers.dev/api/health
curl "https://rafid-api.mahdialmuntadhar1.workers.dev/api/opportunities?limit=5"
```

Admin-only smoke tests should use a real admin JWT:

```bash
curl -H "Authorization: Bearer $ADMIN_JWT" \
  https://rafid-api.mahdialmuntadhar1.workers.dev/api/opportunity-automation/stats
```

## Safety Notes

- Scraped/imported opportunities must enter `pending_review`.
- Public feeds must show `approved` and non-expired opportunities only.
- Outreach and emails stay in DRY_RUN mode.
- No deployment should be performed automatically.

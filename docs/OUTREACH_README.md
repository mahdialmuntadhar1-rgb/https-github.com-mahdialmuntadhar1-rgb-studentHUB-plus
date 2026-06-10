# Admin Bulk University Email Outreach

This module adds admin-only email outreach for universities, institutes, language schools, and academic institutions. It is designed for legitimate academic/institutional communication only: every message is sent individually, every bulk email includes an unsubscribe link, and skipped statuses are enforced before sending.

## Files

- `migrations/0001_outreach.sql` creates the Cloudflare D1 tables and indexes.
- `backend/outreach-worker.ts` contains Worker routes, provider adapters, template rendering, CSV import, queue producer, queue consumer, webhook handling, and unsubscribe handling.
- `src/pages/AdminOutreachPage.tsx` adds the React admin UI at `/admin/outreach`.
- `src/lib/api.ts` contains the frontend API client functions.

## Required Worker bindings and environment

Configure these in Cloudflare, not in frontend code:

```toml
[[d1_databases]]
binding = "DB"
database_name = "rafid-db"
database_id = "..."

[[queues.producers]]
binding = "OUTREACH_QUEUE"
queue = "outreach-email"

[[queues.consumers]]
queue = "outreach-email"
max_batch_size = 1
```

Secrets/vars:

```bash
ADMIN_API_TOKEN=strong-admin-token
EMAIL_PROVIDER=resend
EMAIL_API_KEY=provider-api-key
EMAIL_FROM_NAME=Jamiaati
EMAIL_FROM_ADDRESS=outreach@your-domain.example
EMAIL_REPLY_TO=hello@your-domain.example
PUBLIC_APP_URL=https://your-app.example
UNSUBSCRIBE_SECRET=long-random-secret
ADMIN_TEST_EMAIL=admin@your-domain.example
DRY_RUN=true
TEST_MODE=false
BATCH_SIZE=25
DELAY_SECONDS=30
MAX_PER_DAY=500
```

`EMAIL_PROVIDER` currently supports production-ready Resend, SendGrid, and Brevo adapters. Mailgun and SES are intentionally guarded placeholders until their provider-specific domain/signing config is added.

## Email provider setup

1. Create and verify a sending domain with your provider.
2. Add SPF, DKIM, and DMARC DNS records exactly as the provider instructs.
3. Set `EMAIL_FROM_ADDRESS` to an address on the verified domain.
4. Set `EMAIL_REPLY_TO` to a monitored inbox.
5. Keep `DRY_RUN=true` until imports, previews, test email, pause/resume, retry, and unsubscribe behavior are verified.

## CSV import

Required column: `email`.

Optional columns:

```csv
institution_name,contact_name,phone,department,governorate,institution_type,language,source,notes
```

Emails are normalized to lowercase, invalid emails are rejected, and existing emails are not duplicated. Existing contacts only receive missing-field updates.

## Sending flow

1. Go to `/admin/outreach`.
2. Paste a valid admin token.
3. Import contacts.
4. Create a template with placeholders such as `{{institution_name}}`, `{{contact_name}}`, `{{governorate}}`, and `{{unsubscribe_url}}`.
5. Create a campaign and select filters.
6. Preview the first 10 personalized emails.
7. Send a test email to `ADMIN_TEST_EMAIL`.
8. Confirm the compliance statement.
9. Start the campaign.

The Worker queues a batch instead of sending all messages in one request. Each batch sends one email per recipient, respects `BATCH_SIZE`, `DELAY_SECONDS`, and `MAX_PER_DAY`, and skips unsubscribed, bounced, invalid, and duplicate contacts.

## Acceptance checks

- Import a 10-row CSV and confirm duplicate emails are counted.
- Create a template using `{{institution_name}}` in the subject and `{{greeting}}` in the body.
- Preview personalized emails before sending.
- Use `send-test` and confirm only `ADMIN_TEST_EMAIL` receives a message.
- Run with `DRY_RUN=true` and confirm provider calls are skipped.
- Run with 3 test contacts after switching `DRY_RUN=false`.
- Pause, resume, and retry failed recipients from the campaign detail UI.
- Open an unsubscribe URL and confirm that contact becomes `unsubscribed`.
- Verify a non-admin request to any `/api/outreach/*` admin route returns `403`.

## Compliance notes

Do not use this module for scraped, irrelevant, or purchased contact lists. Do not rotate sender accounts, bypass provider limits, or remove unsubscribe links. Bulk WhatsApp messaging is intentionally outside this module.

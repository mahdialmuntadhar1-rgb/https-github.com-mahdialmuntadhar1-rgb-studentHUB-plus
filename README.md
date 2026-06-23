# Jamiaati / StudentHUB Plus

Arabic-first student opportunities platform for Iraqi students. Features jobs, scholarships, campus life, and social networking.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, Lucide Icons
- **Backend**: Cloudflare Workers (Hono framework)
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (images)
- **Auth**: Custom JWT implementation
- **Deployment**: Cloudflare Pages (SPA) + Cloudflare Workers (API)

## Local Development

**Prerequisites:**
- Node.js 18+
- npm or yarn

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create environment file:
   ```bash
   cp .env.example .env
   ```

3. Configure environment variables (see `.env.example` for required secrets)

4. Run local development server:
   ```bash
   npm run dev
   ```

5. Visit `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start local development server (Express + Vite)
- `npm run build` - Build for production
- `npm run lint` - Run TypeScript type checking
- `npm run worker:dev` - Start Cloudflare Worker locally
- `npm run worker:deploy` - Deploy Cloudflare Worker to production

## Cloudflare Deployment

### Prerequisites

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Authenticate with Cloudflare:
   ```bash
   wrangler login
   ```

### Required Secrets

Set these secrets for the API Worker (`wrangler.api.toml`):

```bash
wrangler secret put JWT_SECRET --config wrangler.api.toml
wrangler secret put MESSAGE_ENCRYPTION_KEY --config wrangler.api.toml
```

Optional (for password reset emails):
```bash
wrangler secret put RESEND_API_KEY --config wrangler.api.toml
wrangler secret put PASSWORD_RESET_FROM_EMAIL --config wrangler.api.toml
```

### Database Setup

1. Create D1 database:
   ```bash
   wrangler d1 create rafid-db --config wrangler.api.toml
   ```

2. Update `wrangler.api.toml` with the returned database_id

3. Run migrations in order:
   ```bash
   wrangler d1 execute rafid-db --remote --file=./schema.sql --config wrangler.api.toml
   wrangler d1 execute rafid-db --remote --file=./migrations/0001_hero_images.sql --config wrangler.api.toml
   wrangler d1 execute rafid-db --remote --file=./migrations/0002_grant_hero_admin.sql --config wrangler.api.toml
   wrangler d1 execute rafid-db --remote --file=./migrations/0014_privacy_consent_encrypted_messages_20260620_130431.sql --config wrangler.api.toml
   wrangler d1 execute rafid-db --remote --file=./migrations/0015_privacy_phase1_resume_20260620_130706.sql --config wrangler.api.toml
   wrangler d1 execute rafid-db --remote --file=./migrations/0016_report_block_moderation_20260620_131508.sql --config wrangler.api.toml
   wrangler d1 execute rafid-db --remote --file=./migrations/0017_api_rate_limits_20260620_133847.sql --config wrangler.api.toml
   wrangler d1 execute rafid-db --remote --file=./migrations/0018_phase4a_api_rate_limits_20260620_135332.sql --config wrangler.api.toml
   wrangler d1 execute rafid-db --remote --file=./migrations/0019_repair_api_rate_limits_columns_20260620_135752.sql --config wrangler.api.toml
   wrangler d1 execute rafid-db --remote --file=./migrations/0020_core_social_tables_20260623.sql --config wrangler.api.toml
   ```

4. Create R2 bucket:
   ```bash
   wrangler r2 bucket create rafid-uploads --config wrangler.api.toml
   ```

### Deploy API Worker

```bash
npm run worker:deploy
```

### Deploy Frontend

1. Build frontend:
   ```bash
   npm run build
   ```

2. Deploy to Cloudflare Pages (via Wrangler):
   ```bash
   wrangler pages deploy ./dist --project-name=https-github
   ```

Or connect your GitHub repo to Cloudflare Pages for automatic deployments.

## Important Notes

⚠️ **DO NOT WIPE PRODUCTION D1** - Never run destructive commands on production database

⚠️ **BACKUP BEFORE MIGRATIONS** - Always backup D1 before running new migrations

⚠️ **TEST LOCALLY FIRST** - Verify all changes work locally before deploying

## Features

- **Opportunities**: Jobs, scholarships, internships, training, events
- **Campus Life**: Social feed with posts, comments, likes
- **Messaging**: Encrypted private messages between users
- **Admin Panel**: Hero image management, user moderation
- **Multi-language**: Arabic, Kurdish Sorani, English
- **Governorate Filtering**: Filter opportunities by Iraqi governorates
- **Rate Limiting**: D1-backed API rate limiting for security

## Admin Access

The admin email is: `mahdialmuntadhar1@gmail.com`

Admin access is granted via the migration `0002_grant_hero_admin.sql`.

## Support

For issues or questions, contact the development team.

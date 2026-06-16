# Jamiaati / StudentHUB Plus

A production-ready university social platform for Iraqi students, featuring social feeds, opportunities, messaging, and AI academic mentorship.

**Frontend:** https://https-github.mahdialmuntadhar1.workers.dev  
**Backend API:** https://rafid-api.mahdialmuntadhar1.workers.dev  
**Admin Email:** safaribosafar@gmail.com

## Features

- 🔐 **Production Authentication** - JWT-based auth with register, login, forgot-password
- 📱 **Social Feed** - Posts, comments, likes, saves with multi-language support
- 👥 **Friend System** - Friend requests and connections
- 💬 **Messaging** - Real-time messaging with thread support
- 🎓 **Opportunities** - Admin-reviewed job, scholarship, and training listings
- 🏛️ **Institutions** - Iraqi universities and institutions directory
- 🤖 **AI Mentor** - Gemini-powered academic advisor (optional)
- 🌍 **Multi-language** - Arabic, Kurdish Sorani, and English support
- ☁️ **Cloudflare Deployment** - D1 database + R2 storage

## Architecture

### Backend (Cloudflare Worker)
- **Runtime:** Cloudflare Workers with Hono framework
- **Database:** Cloudflare D1 (SQLite)
- **Storage:** Cloudflare R2 (S3-compatible)
- **Auth:** JWT tokens with SHA-256 password hashing

### Frontend
- **Framework:** React 19 with Vite
- **Styling:** TailwindCSS
- **Animations:** Motion (Framer Motion)
- **Icons:** Lucide React

## Quick Start

### Prerequisites
- Node.js 18+
- Cloudflare account (for deployment)
- Wrangler CLI

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Run frontend (Vite):**
   ```bash
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

4. **Run backend (Express for local dev):**
   ```bash
   # In a separate terminal
   node server.ts
   # Backend runs on http://localhost:3000
   ```

## Cloudflare Worker Deployment

### 1. Install Wrangler CLI
```bash
npm install -g wrangler
```

### 2. Login to Cloudflare
```bash
wrangler login
```

### 3. Create D1 Database
```bash
wrangler d1 create rafid-db
# Copy the database_id and update wrangler.toml
```

### 4. Create R2 Bucket
```bash
wrangler r2 bucket create rafid-uploads
```

### 5. Set Secrets
```bash
wrangler secret put JWT_SECRET
# Generate a strong random string

wrangler secret put RESEND_API_KEY
# Get from https://resend.com/api-keys

wrangler secret put PASSWORD_RESET_FROM_EMAIL
# Must be verified in Resend dashboard
```

### 6. Run Database Migrations
```bash
npm run db:migrate
```

### 7. Deploy Worker
```bash
npm run worker:deploy
```

### 8. Deploy Frontend
```bash
npm run build
# Upload dist/ folder to your hosting provider
# Or use Cloudflare Pages, Netlify, Vercel, etc.
```

## Database Schema

The D1 schema includes:
- **Users & Auth** - users, password_reset_tokens
- **Social Feed** - posts, post_images, post_likes, post_saves, comments
- **Friend System** - friend_requests, friendships
- **Messaging** - message_requests, message_threads, message_thread_members, messages
- **Moderation** - content_reports, user_blocks
- **Opportunities** - opportunity_sources, opportunity_candidates, opportunity_run_logs
- **Institutions** - institutions
- **Audit Logs** - admin_audit_logs

See `schema.sql` for the complete schema.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Social Feed
- `GET /api/posts/feed` - Get feed with pagination
- `POST /api/posts` - Create post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/save` - Save/unsave post
- `POST /api/posts/:id/comments` - Add comment
- `DELETE /api/comments/:id` - Delete comment

### Friend Requests
- `GET /api/friend-requests` - Get friend requests
- `POST /api/friend-requests` - Send friend request
- `POST /api/friend-requests/:id/accept` - Accept request
- `POST /api/friend-requests/:id/decline` - Decline request
- `POST /api/friend-requests/:id/cancel` - Cancel request

### Messaging
- `GET /api/message-requests` - Get message requests
- `POST /api/message-requests` - Send message request
- `POST /api/message-requests/:threadId/accept` - Accept request
- `POST /api/message-requests/:threadId/decline` - Decline request
- `GET /api/messages/threads` - Get message threads
- `GET /api/messages/threads/:threadId/messages` - Get thread messages
- `POST /api/messages/threads/:threadId/messages` - Send message

### Institutions
- `GET /api/institutions` - Get institutions with filters

### Uploads
- `POST /api/upload/image` - Upload image to R2

### Opportunities
- `GET /api/opportunities` - Get approved opportunities

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `PATCH /api/admin/users/:id/role` - Update user role (admin only)

## Admin Setup

The admin user (safaribosafar@gmail.com) is created in the database but needs a password set:

1. Use the forgot-password flow to set the initial password
2. Or update directly via database:
   ```sql
   UPDATE users SET password_hash = '<hashed_password>' WHERE email = 'safaribosafar@gmail.com';
   ```

## Environment Variables

### Required for Worker (set via wrangler secret)
- `JWT_SECRET` - Secret key for JWT signing
- `RESEND_API_KEY` - Resend API key for emails
- `PASSWORD_RESET_FROM_EMAIL` - Sender email for password resets

### Optional
- `GEMINI_API_KEY` - For AI academic mentor feature

### Local Development (.env)
- `APP_URL` - App URL (http://localhost:3000)
- `VITE_BACKEND_URL` - Backend API URL
- `GEMINI_API_KEY` - For AI features

## Scripts

- `npm run dev` - Start frontend dev server
- `npm run build` - Build frontend for production
- `npm run start` - Preview production build
- `npm run lint` - Type check with TypeScript
- `npm run worker:dev` - Start Cloudflare Worker locally
- `npm run worker:deploy` - Deploy Worker to Cloudflare
- `npm run db:migrate` - Run database migrations
- `npm run db:local` - Run migrations on local D1

## Security Notes

- All passwords are hashed with SHA-256 before storage
- JWT tokens expire after 7 days
- Admin endpoints require admin/staff role verification
- R2 uploads are validated for file type and size (max 5MB)
- SQL injection protection via parameterized queries
- CORS enabled for cross-origin requests

## License

Proprietary - All rights reserved

## Support

For issues or questions, contact: safaribosafar@gmail.com

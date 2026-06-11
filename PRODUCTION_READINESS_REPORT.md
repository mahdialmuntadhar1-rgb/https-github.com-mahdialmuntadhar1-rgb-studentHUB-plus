# Production Readiness Report

## Production Architecture

- Frontend: React/Vite app.
- Official frontend: `https://idiot.mahdialmuntadhar1.workers.dev/`.
- Official backend API: `https://rafid-api.mahdialmuntadhar1.workers.dev`.
- Production frontend API base: `import.meta.env.VITE_API_URL || 'https://rafid-api.mahdialmuntadhar1.workers.dev'`.
- `database.json` is local/dev data only and must not be used as production storage.
- `server.ts` is a local/dev Express server and D1 emulator. Production data must come from the official Cloudflare backend.
- `worker-scraper.ts` is the Cloudflare Worker scraper source for D1-backed automation.

## Fixed

- Fresh visitors are logged out unless a real token exists.
- App load validates the stored token with `/api/auth/me`.
- Login, register, forgot password, logout, and session reads now use the official backend API helpers.
- Fake AuthModal `setTimeout` login/register/reset success was removed.
- Default production profile no longer displays `Zara Al-Iraqi` for guests.
- Frontend staff/admin role switching is not used for admin access.
- Admin dashboard requires a backend-authenticated `admin` or `super_admin` role.
- Admin API requests go through the shared API helper so `Authorization: Bearer <token>` is attached.
- Feed posts now load from the official backend `/api/posts`.
- New posts, post comments, and post likes use the official backend-supported post endpoints.
- Public opportunity feed uses the official backend `/api/opportunities`.
- Local/dev `/api/opportunities` returns only approved, non-expired opportunities.
- Local/dev admin routes require `Authorization: Bearer <ADMIN_JWT_SECRET>`.
- Express scraper no longer generates fake fallback opportunities.
- Worker scraper no longer inserts fake fallback opportunities and logs `no items found`.

## Live Backend Verification - 2026-06-11

- `GET /api/health`: works; returned `{"status":"ok","service":"rafid-api"}`.
- `POST /api/auth/register`: works with safe test data; returned a real token and student user.
- `POST /api/auth/login`: works with safe test data; returned a real token and user object.
- `GET /api/auth/me`: works with `Authorization: Bearer <token>` and returns the authenticated user.
- `GET /api/auth/me` without a token: correctly returns `401 Unauthorized`.
- `POST /api/auth/forgot-password`: works; returns a clear localized recovery-message response.
- `GET /api/posts`: works and returns backend posts.
- `POST /api/posts`: works for authenticated users when required fields are provided.
- `POST /api/posts/:id/comments`: works for authenticated users.
- `POST /api/posts/:id/like`: works for authenticated users.
- `POST /api/posts/:id/save`, `/api/saves`, `/api/applications`, and `/api/profile`: not found in the official backend during verification.
- `GET /api/admin/opportunities`: returned `404 Not Found` on the official backend, so the current frontend admin automation must depend on the deployed backend's actual admin/automation route set.

## Local Verification - 2026-06-11

- `npm install`: passed; dependencies were already up to date.
- `npm run lint`: passed via `tsc --noEmit`.
- `npm run build`: passed.
- Build warnings: Vite reported a chunk larger than 500 kB after minification, and Node reported a `module.register()` deprecation warning from the build toolchain. Neither warning blocked the production build.

## Still Incomplete / Manual Setup

- Configure backend JWT/admin secrets in Cloudflare. `ADMIN_JWT_SECRET` is only for the local/dev Express server.
- Saves, applications, RSVP/join UI state, polls, and profile updates are still local-only unless official backend endpoints are added.
- `database.json` remains in the repo for local/dev only and should not be part of production data workflows.
- Confirm the deployed admin automation endpoints expected by `src/lib/api.ts` exist in `rafid-api`; direct legacy `/api/admin/opportunities` probing returned `404`.

## LocalStorage Use

- Allowed UI preferences: `jamiaati_language`, `jamiaati_theme`.
- Auth/session: `jamiaati_token`, `jamiaati_user` follow the current app pattern and are validated by `/api/auth/me`.
- Local-only interactions remain only where official backend endpoints were not found: saves, RSVP/join/apply UI state, polls, story seen/custom state, and profile gamification.

## Manual QA Checklist After Deployment

- [ ] Visit homepage.
- [ ] Arabic language switch.
- [ ] Kurdish Sorani language switch.
- [ ] English language switch.
- [ ] Register.
- [ ] Login.
- [ ] Refresh page after login.
- [ ] Logout.
- [ ] Forgot password.
- [ ] Admin login.
- [ ] Admin dashboard access as admin.
- [ ] Admin dashboard blocked as normal user.
- [ ] Opportunities page.
- [ ] Empty-state if no opportunities.
- [ ] Mobile layout.
- [ ] Public URL loads correctly.

## Readiness Estimate

Production readiness is about 86%.

Main blockers are confirming the deployed admin automation route set and adding official backend endpoints for saves, applications, profile edits, RSVP/join state, and polls.

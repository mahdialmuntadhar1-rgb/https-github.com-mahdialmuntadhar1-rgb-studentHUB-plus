# Jamiaati / myuniversity Deployment Checklist

## Commands

Local build:

```powershell
npm run build
```

Local dev:

```powershell
npm run dev
```

Cloudflare Pages deploy:

```powershell
npx wrangler pages deploy dist --project-name studenthub-mixed-frontend
```

Backend health check:

```powershell
Invoke-RestMethod -Uri "https://rafid-api.mahdialmuntadhar1.workers.dev/api/health"
```

## URLs

Live frontend:

https://studenthub-mixed-frontend.pages.dev

Preview frontend:

https://eec2c6bd.studenthub-mixed-frontend.pages.dev

Backend:

https://rafid-api.mahdialmuntadhar1.workers.dev

## Manual Test Pass

- Open the homepage and confirm there is no login wall.
- Confirm the favicon appears and `/favicon.svg` loads.
- Browse Campus Today, Life, Ask, Future, and Profile tabs as a guest.
- Confirm Future keeps mock opportunities if `/api/opportunities` is empty.
- Confirm feed keeps working if `/api/posts` is empty or unavailable.
- Click like, save, comment, apply, or post as a guest and confirm the login prompt appears.
- In the deployed static site, ask the AI Advisor and confirm it fails gracefully if `/api/ask-ai` is unavailable.
- In local dev, confirm `/api/ask-ai` still works through the Express server.

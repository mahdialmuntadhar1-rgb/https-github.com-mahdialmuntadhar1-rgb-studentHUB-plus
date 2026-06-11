# جامعتي | Jamiaati Student Hub

Jamiaati is a mobile-first Iraqi student hub for universities, institutes, student life, opportunities, training, and scholarships.

## Production Targets

- Live frontend: https://idiot.mahdialmuntadhar1.workers.dev/
- Official backend API: https://rafid-api.mahdialmuntadhar1.workers.dev
- Public opportunities endpoint: `GET https://rafid-api.mahdialmuntadhar1.workers.dev/api/opportunities`

## App Structure

- Frontend entry: `src/main.tsx`
- Main app shell: `src/App.tsx`
- API client: `src/lib/api.ts`
- Local Express development/server bundle: `server.ts`
- Worker scraper source: `worker-scraper.ts`

This repository is a mixed frontend plus local Node/Express helper build. The public production data source must be the official `rafid-api` Worker, not mock files.

## Commands

- Install: `npm install`
- Local dev: `npm run dev`
- Frontend/server build: `npm run build`
- Type/lint check: `npm run lint`
- Start bundled server: `npm run start`

## Deployment Notes

The current build command is:

```bash
npm run build
```

That command creates Vite static assets and also bundles `server.ts` into `dist/server.cjs`. The live frontend is a Cloudflare Workers URL; confirm deployment configuration before publishing because this repo does not include a `wrangler.toml`.

## Environment Variables

- `GEMINI_API_KEY`: optional AI assistant key for local/server AI responses.
- `APP_URL`: public app URL when the server needs self-referential links.

Production opportunities, institutions, admin automation, and public data must come from `https://rafid-api.mahdialmuntadhar1.workers.dev`. Mock files are only for local UI structure and must not be treated as production data.

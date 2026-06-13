<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/deae2ed9-a6b5-4abd-a9bb-8da43c92c619

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Production readiness notes

- Apply SQL files in `migrations/` to the production database before launch.
- Set `AUTH_TOKEN_SECRET` to a long random secret in production.
- Keep `DRY_RUN=true` for email/outreach until unsubscribe handling and explicit send approval are complete.
- Leave `VITE_API_URL` empty when the frontend and backend are served from the same origin.
- Configure durable image storage (`R2_PUBLIC_BASE_URL` and upload handling) before enabling production image uploads.

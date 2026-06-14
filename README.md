<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

Deployment targets are documented in [DEPLOYMENT_TARGETS.md](./DEPLOYMENT_TARGETS.md). Never deploy the frontend to a deprecated Worker; the official frontend Worker is `https-github`.

View your app in AI Studio: https://ai.studio/apps/696eac0c-5925-40cf-ad1d-5e17b6f284ac

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

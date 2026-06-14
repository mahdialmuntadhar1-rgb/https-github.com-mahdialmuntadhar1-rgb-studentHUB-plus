# Deployment Targets

Official frontend Worker:

- Worker name: `https-github`
- URL: `https://https-github.mahdialmuntadhar1.workers.dev/`
- Build output: `dist`
- API base: `https://rafid-api.mahdialmuntadhar1.workers.dev`

Official backend Worker:

- Worker name: `rafid-api`
- URL: `https://rafid-api.mahdialmuntadhar1.workers.dev`

Cloudflare resources:

- D1: `rafid-db`
- R2: `rafid-uploads`
- Queue: `outreach-email`

Deprecated frontend target:

- `studenthub-plus`
- Do not deploy the frontend to this Worker.
- If any deploy command, workflow, or generated config points to `studenthub-plus`, stop and fix it before deploying.

Official frontend deploy command:

```powershell
npm run deploy:official
```

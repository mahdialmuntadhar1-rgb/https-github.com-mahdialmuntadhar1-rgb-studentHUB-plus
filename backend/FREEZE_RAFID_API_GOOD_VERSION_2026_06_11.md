# Rafid API Good Version Freeze

Date: 2026-06-11
Worker: rafid-api
URL: https://rafid-api.mahdialmuntadhar1.workers.dev
Cloudflare Version ID: 9fb1bf7e-37c4-4d0a-82bf-25a8ec0267ec
D1 Database: rafid-db
R2 Bucket: rafid-uploads

Confirmed after deploy:
- /api/health = ok / rafid-api
- opportunity_candidates rejected = 50
- pending_review = 0
- approved_public = 0
- TypeScript passed before deploy
- Crawler quality patch deployed
- No full automation test run yet

Important:
- Do not run full automation yet.
- First crawler test should be one source only.
- Keep candidates pending_review until admin approval.
- Do not approve bad/generic/mojibake candidates.
- Do not touch Shaku Maku/business project.

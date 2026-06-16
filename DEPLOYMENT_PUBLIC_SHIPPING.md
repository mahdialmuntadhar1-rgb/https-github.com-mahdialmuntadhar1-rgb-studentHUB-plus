# Public Shipping Deployment Notes

## Required checks

Run:

```powershell
cd "C:\\Users\\HB LAPTOP STORE\\Documents\\https-github.com-mahdialmuntadhar1-rgb-studentHUB-plus"
npm run lint
npm run build
npm run smoke:public
```

## Production API

Frontend uses:

- VITE_BACKEND_URL if provided
- fallback: https://rafid-api.mahdialmuntadhar1.workers.dev

## Safety rules

- No destructive migrations.
- Public feed must expose approved non-expired records only.
- Pending, pending_review, rejected, and expired records must not appear in the default public feed.
- No public mock login token generation.
- No forced demo feed fallback.

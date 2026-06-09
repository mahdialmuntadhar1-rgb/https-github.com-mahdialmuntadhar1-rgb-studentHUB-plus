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

## Auth Test

- Register: open the app, click an interaction such as Like, choose `إنشاء حساب`, enter a unique email, name, and password, then confirm the modal shows `تم إنشاء الحساب بنجاح`.
- Login: log out, click an interaction, choose `تسجيل الدخول`, enter the same email/password, then confirm the modal shows `تم تسجيل الدخول بنجاح`.
- Logout: when logged in, use the small `متصل` indicator logout button and confirm interaction clicks show the login-required modal again.
- Invalid password: try the same email with a wrong password and confirm the modal shows `البريد الإلكتروني أو كلمة المرور غير صحيحة`.
- Token check: open browser DevTools Console and run `localStorage.getItem("rafid_auth_token")`; it should return a token after login/register and `null` after logout.
- Invalid token check: manually replace `rafid_auth_token` with a bad value, refresh, and confirm the app silently clears it while public browsing remains open.

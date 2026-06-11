# Backend Architecture Decision

Official frontend:

https://idiot.mahdialmuntadhar1.workers.dev/

Expected backend API:

https://rafid-api.mahdialmuntadhar1.workers.dev

Frontend should use:

VITE_API_URL=https://rafid-api.mahdialmuntadhar1.workers.dev

server.ts appears to be local/prototype unless deployment evidence confirms otherwise.

Manual checks:

1. Confirm /api/health on rafid-api.
2. Confirm /api/opportunities returns approved only.
3. Confirm admin endpoints reject unauthenticated requests.
4. Confirm opportunity automation endpoints require Bearer token.
5. Confirm frontend uses VITE_API_URL.

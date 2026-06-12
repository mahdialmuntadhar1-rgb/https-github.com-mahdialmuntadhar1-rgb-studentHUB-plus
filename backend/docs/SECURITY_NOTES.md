# Backend Security Notes

## Secrets

Do not commit real secrets to git or store them in `wrangler.toml`.

`JWT_SECRET` must be configured as a Cloudflare Worker secret:

```powershell
npx wrangler secret put JWT_SECRET --config ./wrangler.toml
```

Rotate `JWT_SECRET` after any exposure. Existing admin sessions will need to log in again after rotation.

## Public Search

Public search endpoints must return approved, public-safe fields only.

Do not use `SELECT *` in public search responses. Public responses must not expose:

- `status`
- `rejection_reason`
- `raw_text`
- `metadata`
- admin notes
- internal logs
- tokens or secrets
- private emails
- moderation-only fields

If a table does not have a stable public status contract, exclude it from public search until it does.

# Archived production-unsafe migrations

These migration files are historical/local-only migrations.

Do not move these files back into `/migrations`.

Do not apply these files to the remote D1 database `rafid-db`.

Reason:
The production remote D1 schema already existed before these files were added locally.
Wrangler will try to apply every unapplied file in `/migrations`, and these old migrations can conflict with the real production schema.

Production D1 migration baseline currently includes:
- 0001_auth_users.sql
- 0008_mvp_social_compat.sql

The production social schema uses:
- profiles, not users
- posts.author_id, not posts.user_id
- comments.author_id, not comments.user_id
- follows.followee_id, not follows.following_id
- content_reports, not post_reports

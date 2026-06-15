-- migrations/0008_mvp_social_compat.sql
-- Production-safe compatibility migration for the existing remote D1 social schema.
--
-- IMPORTANT:
-- - Do not run migrations/0007_mvp_social.sql against production.
-- - This migration does not recreate or overwrite existing tables.
-- - Remote D1 inspection confirmed the canonical social schema uses:
--   profiles, posts.author_id, comments.author_id, follows.followee_id, content_reports.
-- - SQLite/D1 cannot ADD COLUMN with non-constant defaults like CURRENT_TIMESTAMP,
--   so updated_at is added without DEFAULT and existing rows are backfilled below.

ALTER TABLE posts ADD COLUMN updated_at DATETIME;
ALTER TABLE posts ADD COLUMN deleted_at DATETIME;
ALTER TABLE posts ADD COLUMN visibility TEXT DEFAULT 'public';

UPDATE posts
SET updated_at = COALESCE(created_at, datetime('now'))
WHERE updated_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_updated_at ON posts(updated_at);
CREATE INDEX IF NOT EXISTS idx_posts_deleted_at ON posts(deleted_at);
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON posts(visibility);
CREATE INDEX IF NOT EXISTS idx_posts_author_created_at ON posts(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_public_feed ON posts(status, visibility, deleted_at, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_followee_id ON follows(followee_id);

CREATE INDEX IF NOT EXISTS idx_content_reports_target ON content_reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status);
CREATE INDEX IF NOT EXISTS idx_content_reports_reporter ON content_reports(reporter_user_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_reported_user ON content_reports(reported_user_id);

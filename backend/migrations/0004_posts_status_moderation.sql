ALTER TABLE posts ADD COLUMN status TEXT NOT NULL DEFAULT 'pending_review';

CREATE INDEX IF NOT EXISTS idx_posts_status_created_at
ON posts(status, created_at);

-- D1 Schema Migration File: 0002_add_roles_and_permissions.sql
-- Run this migration in your Cloudflare D1 database:
-- wrangler d1 execute <database_name> --file=migration_chunk2.sql

-- 1. Create user_permissions table for explicit granular upload privileges
CREATE TABLE IF NOT EXISTS user_permissions (
  user_id TEXT PRIMARY KEY,
  can_upload INTEGER NOT NULL DEFAULT 1 -- Boolean representation: 1 = true, 0 = false
);

-- Index user_id for high performance joins
CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions (user_id);


-- 2. Ensure role column exists in users table (SQLite ALTER TABLE command)
-- Note: In existing D1 databases where the 'role' column was not created originally, 
-- this SQL completes the user record definition.
-- ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';


-- 3. Core Posts table (for completeness when demonstrating DELETE /api/posts/:id handler)
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,          -- UUID or integer string representation
  author_id TEXT NOT NULL,      -- Associated user ID
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_posts_author ON posts (author_id);

-- Jamiaati public MVP social tables.
-- Idempotent and non-destructive: only creates missing tables, indexes, and columns.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'student'
    CHECK (role IN ('student', 'graduate', 'teacher', 'staff', 'institution', 'admin', 'super_admin')),
  passwordHash TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT DEFAULT 'post',
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  titleEN TEXT,
  titleAR TEXT,
  titleKU TEXT,
  contentEN TEXT,
  contentAR TEXT,
  contentKU TEXT,
  anonymous INTEGER DEFAULT 0,
  authorName TEXT,
  authorRole TEXT,
  imageUrl TEXT,
  visibility TEXT NOT NULL DEFAULT 'public'
    CHECK (visibility IN ('public', 'followers', 'private')),
  status TEXT DEFAULT 'approved'
    CHECK (status IN ('approved', 'pending_review', 'rejected')),
  governorateId TEXT DEFAULT 'all',
  universityId TEXT DEFAULT 'all',
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_posts_feed ON posts(deleted_at, visibility, createdAt);
CREATE INDEX IF NOT EXISTS idx_posts_status_created ON posts(status, createdAt);
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(userId);

CREATE TABLE IF NOT EXISTS likes (
  itemId TEXT NOT NULL,
  userId TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (itemId, userId),
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  itemId TEXT NOT NULL,
  userId TEXT NOT NULL,
  authorName TEXT,
  authorRole TEXT,
  authorAvatar TEXT,
  content TEXT NOT NULL,
  date TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_comments_item ON comments(itemId);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(userId);

CREATE TABLE IF NOT EXISTS follows (
  follower_id TEXT NOT NULL,
  following_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id),
  FOREIGN KEY (follower_id) REFERENCES users(id),
  FOREIGN KEY (following_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

CREATE TABLE IF NOT EXISTS post_images (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  r2_key TEXT,
  content_type TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id)
);

CREATE INDEX IF NOT EXISTS idx_post_images_post ON post_images(post_id);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL,
  post_id TEXT,
  comment_id TEXT,
  reported_user_id TEXT,
  reason TEXT NOT NULL
    CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'fake_account', 'other')),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'reviewed', 'dismissed', 'actioned')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_id) REFERENCES users(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reports_unique_post_reporter
  ON reports(reporter_id, post_id)
  WHERE post_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_reports_unique_comment_reporter
  ON reports(reporter_id, comment_id)
  WHERE comment_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS blocks (
  blocker_id TEXT NOT NULL,
  blocked_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id),
  FOREIGN KEY (blocker_id) REFERENCES users(id),
  FOREIGN KEY (blocked_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON blocks(blocked_id);

-- Expected after earlier production migrations. These ALTER statements evolve
-- existing MVP tables from 0003; do not run this migration twice manually.
ALTER TABLE posts ADD COLUMN visibility TEXT NOT NULL DEFAULT 'public';
ALTER TABLE posts ADD COLUMN deleted_at TEXT;
ALTER TABLE comments ADD COLUMN deleted_at TEXT;

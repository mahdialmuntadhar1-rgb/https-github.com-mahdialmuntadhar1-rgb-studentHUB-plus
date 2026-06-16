-- MVP compatibility migration for Jamiaati / StudentHUB-plus
-- Safe purpose:
-- 1. Add Stories support.
-- 2. Add curated opportunity fields.
-- 3. Add moderation-friendly comment soft delete.
-- 4. Add useful indexes.
--
-- IMPORTANT:
-- This migration does NOT drop tables.
-- This migration does NOT overwrite existing data.
-- This migration does NOT recreate existing social tables.

-- =========================
-- Stories
-- =========================

CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL,
  text TEXT,
  media_url TEXT,
  media_type TEXT DEFAULT 'text',
  background TEXT,
  visibility TEXT DEFAULT 'public',
  status TEXT DEFAULT 'active',
  views_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  deleted_at DATETIME
);

CREATE TABLE IF NOT EXISTS story_views (
  story_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (story_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_stories_author_id ON stories(author_id);
CREATE INDEX IF NOT EXISTS idx_stories_status_expires ON stories(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_story_views_user_id ON story_views(user_id);

-- =========================
-- Opportunities compatibility
-- Existing table already has:
-- id, title, type, institution_name, institution_logo,
-- governorate, deadline, tags, created_at, city
-- =========================

ALTER TABLE opportunities ADD COLUMN description TEXT;
ALTER TABLE opportunities ADD COLUMN title_ar TEXT;
ALTER TABLE opportunities ADD COLUMN title_ku TEXT;
ALTER TABLE opportunities ADD COLUMN title_en TEXT;
ALTER TABLE opportunities ADD COLUMN description_ar TEXT;
ALTER TABLE opportunities ADD COLUMN description_ku TEXT;
ALTER TABLE opportunities ADD COLUMN description_en TEXT;
ALTER TABLE opportunities ADD COLUMN source_url TEXT;
ALTER TABLE opportunities ADD COLUMN image_url TEXT;
ALTER TABLE opportunities ADD COLUMN status TEXT DEFAULT 'approved';
ALTER TABLE opportunities ADD COLUMN updated_at DATETIME;
ALTER TABLE opportunities ADD COLUMN created_by TEXT;

CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(type);
CREATE INDEX IF NOT EXISTS idx_opportunities_governorate ON opportunities(governorate);
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON opportunities(deadline);

-- =========================
-- Comments moderation compatibility
-- =========================

ALTER TABLE comments ADD COLUMN deleted_at DATETIME;

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);

-- =========================
-- Social indexes for existing tables
-- =========================

CREATE INDEX IF NOT EXISTS idx_social_connection_requests_requester ON social_connection_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_social_connection_requests_recipient ON social_connection_requests(recipient_id);
CREATE INDEX IF NOT EXISTS idx_social_connection_requests_status ON social_connection_requests(status);

CREATE INDEX IF NOT EXISTS idx_social_message_threads_requester ON social_message_threads(requester_id);
CREATE INDEX IF NOT EXISTS idx_social_message_threads_recipient ON social_message_threads(recipient_id);
CREATE INDEX IF NOT EXISTS idx_social_message_threads_status ON social_message_threads(status);

CREATE INDEX IF NOT EXISTS idx_social_messages_thread_id ON social_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_social_messages_sender_id ON social_messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON user_blocks(blocker_user_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON user_blocks(blocked_user_id);

CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status);
CREATE INDEX IF NOT EXISTS idx_content_reports_target ON content_reports(target_type, target_id);

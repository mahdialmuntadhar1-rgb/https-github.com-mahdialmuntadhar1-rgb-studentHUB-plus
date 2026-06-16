-- Migration 0009: Create post_saves table for compatibility
-- This table is missing from the remote database but needed by the application

CREATE TABLE IF NOT EXISTS post_saves (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_saves_post ON post_saves(post_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_user ON post_saves(user_id);

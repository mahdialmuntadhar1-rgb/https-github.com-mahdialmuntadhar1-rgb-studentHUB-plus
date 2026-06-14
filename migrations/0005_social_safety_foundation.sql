-- CHUNK 5B - Social Safety Foundation
-- Safe migration only. Do not run against remote D1 without explicit approval.

CREATE TABLE IF NOT EXISTS user_blocks (
  id TEXT PRIMARY KEY,
  blocker_user_id TEXT NOT NULL,
  blocked_user_id TEXT NOT NULL,
  reason TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(blocker_user_id, blocked_user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker
  ON user_blocks(blocker_user_id);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked
  ON user_blocks(blocked_user_id);

CREATE TABLE IF NOT EXISTS content_reports (
  id TEXT PRIMARY KEY,
  reporter_user_id TEXT,
  reported_user_id TEXT,
  target_type TEXT NOT NULL CHECK(target_type IN ('post', 'user', 'comment')),
  target_id TEXT,
  reason TEXT NOT NULL CHECK(reason IN ('spam', 'harassment', 'hate_or_abuse', 'misinformation', 'unsafe_content', 'impersonation', 'other')),
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'reviewed', 'dismissed', 'action_taken')),
  admin_notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_content_reports_status
  ON content_reports(status);

CREATE INDEX IF NOT EXISTS idx_content_reports_target
  ON content_reports(target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_content_reports_reported_user
  ON content_reports(reported_user_id);

CREATE TABLE IF NOT EXISTS abuse_audit_logs (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  metadata TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_abuse_audit_logs_actor
  ON abuse_audit_logs(actor_user_id);

CREATE INDEX IF NOT EXISTS idx_abuse_audit_logs_target
  ON abuse_audit_logs(target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_abuse_audit_logs_created_at
  ON abuse_audit_logs(created_at);

CREATE TABLE IF NOT EXISTS profile_visibility_settings (
  user_id TEXT PRIMARY KEY,
  profile_visibility TEXT NOT NULL DEFAULT 'public'
    CHECK(profile_visibility IN ('public', 'university_only', 'private')),
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- migrations/0009_social_requests_messages.sql
-- Safe MVP social-finalization migration.
-- Uses social_ table prefixes to avoid conflicts with any existing production table names.

CREATE TABLE IF NOT EXISTS social_connection_requests (
  id TEXT PRIMARY KEY,
  requester_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_social_connection_requests_requester ON social_connection_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_social_connection_requests_recipient ON social_connection_requests(recipient_id);
CREATE INDEX IF NOT EXISTS idx_social_connection_requests_status ON social_connection_requests(status);
CREATE INDEX IF NOT EXISTS idx_social_connection_requests_pair ON social_connection_requests(requester_id, recipient_id);

CREATE TABLE IF NOT EXISTS social_message_threads (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'direct',
  status TEXT NOT NULL DEFAULT 'requested',
  requester_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  last_message_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_social_message_threads_requester ON social_message_threads(requester_id);
CREATE INDEX IF NOT EXISTS idx_social_message_threads_recipient ON social_message_threads(recipient_id);
CREATE INDEX IF NOT EXISTS idx_social_message_threads_status ON social_message_threads(status);
CREATE INDEX IF NOT EXISTS idx_social_message_threads_last_message ON social_message_threads(last_message_at);

CREATE TABLE IF NOT EXISTS social_message_thread_members (
  thread_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'active',
  last_read_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (thread_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_social_message_thread_members_user ON social_message_thread_members(user_id);
CREATE INDEX IF NOT EXISTS idx_social_message_thread_members_thread ON social_message_thread_members(thread_id);

CREATE TABLE IF NOT EXISTS social_messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_social_messages_thread_created ON social_messages(thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_social_messages_sender ON social_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_social_messages_deleted ON social_messages(deleted_at);

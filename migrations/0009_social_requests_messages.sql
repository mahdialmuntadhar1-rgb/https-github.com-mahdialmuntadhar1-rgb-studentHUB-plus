-- migrations/0009_social_requests_messages.sql
-- Safe MVP social-finalization migration.
-- Adds friend requests and message requests/basic messaging.
-- Does not recreate or overwrite existing production tables.

CREATE TABLE IF NOT EXISTS connection_requests (
  id TEXT PRIMARY KEY,
  requester_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_connection_requests_requester ON connection_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_recipient ON connection_requests(recipient_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_status ON connection_requests(status);
CREATE INDEX IF NOT EXISTS idx_connection_requests_pair ON connection_requests(requester_id, recipient_id);

CREATE TABLE IF NOT EXISTS message_threads (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'direct',
  status TEXT NOT NULL DEFAULT 'requested',
  requester_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  last_message_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_message_threads_requester ON message_threads(requester_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_recipient ON message_threads(recipient_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_status ON message_threads(status);
CREATE INDEX IF NOT EXISTS idx_message_threads_last_message ON message_threads(last_message_at);

CREATE TABLE IF NOT EXISTS message_thread_members (
  thread_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'active',
  last_read_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (thread_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_message_thread_members_user ON message_thread_members(user_id);
CREATE INDEX IF NOT EXISTS idx_message_thread_members_thread ON message_thread_members(thread_id);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_messages_thread_created ON messages(thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_deleted ON messages(deleted_at);

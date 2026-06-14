-- Outreach safety tables: unsubscribe suppression and dry-run audit logs.
-- This migration does not enable real email sending.

CREATE TABLE IF NOT EXISTS email_unsubscribes (
  email TEXT PRIMARY KEY,
  unsubscribed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  source TEXT,
  campaign TEXT
);

CREATE TABLE IF NOT EXISTS outreach_logs (
  id TEXT PRIMARY KEY,
  mode TEXT NOT NULL DEFAULT 'DRY_RUN',
  would_send_to TEXT,
  template_id TEXT,
  campaign_id TEXT,
  source TEXT,
  suppressed INTEGER DEFAULT 0,
  timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_outreach_logs_timestamp ON outreach_logs(timestamp);

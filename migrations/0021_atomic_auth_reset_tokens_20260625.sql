-- Atomic auth reset-token hardening.
-- Non-destructive: adds metadata columns only; no rows are deleted.

ALTER TABLE password_resets ADD COLUMN used_at TEXT;

CREATE INDEX IF NOT EXISTS idx_password_resets_token_expires ON password_resets(token, expires_at);
CREATE INDEX IF NOT EXISTS idx_password_resets_used_at ON password_resets(used_at);

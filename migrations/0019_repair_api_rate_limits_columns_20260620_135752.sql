-- Repair migration for existing api_rate_limits table.
-- Existing beta table used old columns: key, bucket, ip_hash.
-- Phase 4A middleware expects: id, rate_key, route_group.
-- These ALTER statements were applied manually with duplicate-column handling.

ALTER TABLE api_rate_limits ADD COLUMN id TEXT;
ALTER TABLE api_rate_limits ADD COLUMN rate_key TEXT;
ALTER TABLE api_rate_limits ADD COLUMN route_group TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_api_rate_limits_rate_key_window
ON api_rate_limits(rate_key, window_start);

CREATE INDEX IF NOT EXISTS idx_api_rate_limits_route_group_new
ON api_rate_limits(route_group);

CREATE INDEX IF NOT EXISTS idx_api_rate_limits_updated_at_new
ON api_rate_limits(updated_at);

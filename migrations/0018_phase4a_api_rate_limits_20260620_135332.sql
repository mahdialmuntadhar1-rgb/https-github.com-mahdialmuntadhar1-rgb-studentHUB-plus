CREATE TABLE IF NOT EXISTS api_rate_limits (
  id TEXT PRIMARY KEY,
  rate_key TEXT NOT NULL,
  route_group TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_api_rate_limits_key_window
ON api_rate_limits(rate_key, window_start);

CREATE INDEX IF NOT EXISTS idx_api_rate_limits_route_group
ON api_rate_limits(route_group);

CREATE INDEX IF NOT EXISTS idx_api_rate_limits_updated_at
ON api_rate_limits(updated_at);

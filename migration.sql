-- D1 Schema Migration File: 0001_create_logs_and_resets.sql
-- Run this migration in your Cloudflare D1 database: 
-- npx wrangler d1 migrations create <database_name> create_logs_and_resets
-- or execute it directly: wrangler d1 execute <database_name> --file=migration.sql

-- 1. Create logs Table for structured Winston-style system logging
CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level TEXT NOT NULL,          -- 'info', 'warn', 'error'
  message TEXT NOT NULL,        -- High-level human readable description
  metadata TEXT NOT NULL,       -- JSON stringified context payload
  timestamp TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) -- Standard ISO-8601 string representation
);

-- Index level and timestamp for highly efficient admin operations and filtering
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs (level);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs (timestamp DESC);


-- 2. Create password_resets Table for transactional password security
CREATE TABLE IF NOT EXISTS password_resets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,     -- ISO-8601 standard string
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Index token and expires_at for efficient retrieval and token validity checks
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets (token);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires ON password_resets (expires_at);


-- 3. Core Users Table mock template (for referential integrity / reference)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,          -- UUID string
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', -- 'user', 'admin'
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Index email for login query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

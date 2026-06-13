-- Jamiaati production migration: authentication users and reset audit records.
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'student'
    CHECK (role IN ('student', 'graduate', 'teacher', 'staff', 'institution', 'admin', 'super_admin')),
  passwordHash TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS passwordResets (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  email TEXT NOT NULL,
  tokenHash TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'DRY_RUN',
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  usedAt TEXT,
  FOREIGN KEY (userId) REFERENCES users(id)
);


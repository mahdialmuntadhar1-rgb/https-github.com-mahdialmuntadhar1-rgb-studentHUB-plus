-- Rafid (StudentHUB-plus) D1 Schema
-- Run with: wrangler d1 execute rafid-db --file=./schema.sql
-- Remote:   wrangler d1 execute rafid-db --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  governorate TEXT,
  institution TEXT,
  institution_id TEXT,
  stage TEXT,
  interests TEXT DEFAULT '[]',
  bio TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  governorate TEXT NOT NULL,
  institution TEXT NOT NULL,
  institution_id TEXT NOT NULL DEFAULT 'manual',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_verified INTEGER DEFAULT 0,
  metadata TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post_likes (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS opportunities (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  institution_name TEXT NOT NULL,
  institution_logo TEXT,
  governorate TEXT,
  deadline TEXT,
  tags TEXT DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

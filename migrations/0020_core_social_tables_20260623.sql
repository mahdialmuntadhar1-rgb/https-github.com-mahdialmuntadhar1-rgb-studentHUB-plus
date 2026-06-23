-- Core social tables for Jamiaati / StudentHUB Plus
-- These tables are required by worker.ts but were missing from schema.sql

-- User profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  username TEXT,
  governorate TEXT DEFAULT 'all',
  institution TEXT,
  institution_id TEXT,
  stage TEXT,
  interests TEXT,
  bio TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student',
  is_verified INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(LOWER(TRIM(email)));
CREATE INDEX IF NOT EXISTS idx_profiles_governorate ON profiles(governorate);
CREATE INDEX IF NOT EXISTS idx_profiles_institution ON profiles(institution_id);

-- Posts table (social feed)
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL,
  type TEXT DEFAULT 'post',
  title TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  governorate TEXT DEFAULT 'all',
  institution TEXT,
  institution_id TEXT,
  metadata TEXT,
  status TEXT DEFAULT 'active',
  visibility TEXT DEFAULT 'public',
  likes_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT,
  FOREIGN KEY (author_id) REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_governorate ON posts(governorate);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT,
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (author_id) REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);

-- Post likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id),
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (user_id) REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON post_likes(user_id);

-- Post saves table
CREATE TABLE IF NOT EXISTS post_saves (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id),
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (user_id) REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_post_saves_post ON post_saves(post_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_user ON post_saves(user_id);

-- Social connection requests (friend requests)
CREATE TABLE IF NOT EXISTS social_connection_requests (
  id TEXT PRIMARY KEY,
  requester_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(requester_id, recipient_id),
  FOREIGN KEY (requester_id) REFERENCES profiles(id),
  FOREIGN KEY (recipient_id) REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_social_requests_requester ON social_connection_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_social_requests_recipient ON social_connection_requests(recipient_id);
CREATE INDEX IF NOT EXISTS idx_social_requests_status ON social_connection_requests(status);

-- Social message threads
CREATE TABLE IF NOT EXISTS social_message_threads (
  id TEXT PRIMARY KEY,
  type TEXT DEFAULT 'direct',
  status TEXT DEFAULT 'requested',
  requester_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  last_message_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (requester_id) REFERENCES profiles(id),
  FOREIGN KEY (recipient_id) REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_message_threads_requester ON social_message_threads(requester_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_recipient ON social_message_threads(recipient_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_status ON social_message_threads(status);

-- Social message thread members
CREATE TABLE IF NOT EXISTS social_message_thread_members (
  thread_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  status TEXT DEFAULT 'active',
  last_read_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (thread_id, user_id),
  FOREIGN KEY (thread_id) REFERENCES social_message_threads(id),
  FOREIGN KEY (user_id) REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_thread_members_thread ON social_message_thread_members(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_members_user ON social_message_thread_members(user_id);

-- Social messages (encrypted)
CREATE TABLE IF NOT EXISTS social_messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  body TEXT,
  body_ciphertext TEXT,
  body_iv TEXT,
  body_key_version TEXT,
  encryption_status TEXT DEFAULT 'encrypted',
  status TEXT DEFAULT 'sent',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT,
  FOREIGN KEY (thread_id) REFERENCES social_message_threads(id),
  FOREIGN KEY (sender_id) REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_social_messages_thread ON social_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_social_messages_sender ON social_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_social_messages_created ON social_messages(created_at);

-- Password resets
CREATE TABLE IF NOT EXISTS password_resets (
  email TEXT NOT NULL,
  token TEXT NOT NULL PRIMARY KEY,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires ON password_resets(expires_at);

-- Institutions (universities)
CREATE TABLE IF NOT EXISTS institutions (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT,
  name_ku TEXT,
  governorate TEXT,
  city TEXT,
  type TEXT,
  active INTEGER DEFAULT 1,
  is_seed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_institutions_governorate ON institutions(governorate);
CREATE INDEX IF NOT EXISTS idx_institutions_active ON institutions(active);

-- Highlight items
CREATE TABLE IF NOT EXISTS highlight_items (
  id TEXT PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_ar TEXT,
  title_ku TEXT,
  content_en TEXT,
  content_ar TEXT,
  content_ku TEXT,
  image_url TEXT,
  category TEXT,
  governorate TEXT DEFAULT 'all',
  university_id TEXT DEFAULT 'all',
  status TEXT DEFAULT 'approved',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_highlight_status ON highlight_items(status);
CREATE INDEX IF NOT EXISTS idx_highlight_governorate ON highlight_items(governorate);
CREATE INDEX IF NOT EXISTS idx_highlight_university ON highlight_items(university_id);

-- Jamiaati production migration: user posts, comments, engagement, and profile persistence.
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT DEFAULT 'post',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  titleEN TEXT,
  titleAR TEXT,
  titleKU TEXT,
  contentEN TEXT,
  contentAR TEXT,
  contentKU TEXT,
  anonymous INTEGER DEFAULT 0,
  authorName TEXT,
  authorRole TEXT,
  imageUrl TEXT,
  status TEXT DEFAULT 'approved'
    CHECK (status IN ('approved', 'pending_review', 'rejected')),
  governorateId TEXT DEFAULT 'all',
  universityId TEXT DEFAULT 'all',
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_posts_status_created ON posts(status, createdAt);
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(userId);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  itemId TEXT NOT NULL,
  userId TEXT NOT NULL,
  authorName TEXT,
  authorRole TEXT,
  authorAvatar TEXT,
  content TEXT NOT NULL,
  date TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_comments_item ON comments(itemId);

CREATE TABLE IF NOT EXISTS likes (
  itemId TEXT NOT NULL,
  userId TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (itemId, userId),
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS saved_items (
  itemId TEXT NOT NULL,
  userId TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (itemId, userId),
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS applications (
  itemId TEXT NOT NULL,
  userId TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (itemId, userId),
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS user_profiles (
  userId TEXT PRIMARY KEY,
  avatar TEXT,
  universityId TEXT,
  governorateId TEXT,
  bioEN TEXT,
  bioAR TEXT,
  bioKU TEXT,
  majorEN TEXT,
  majorAR TEXT,
  majorKU TEXT,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);


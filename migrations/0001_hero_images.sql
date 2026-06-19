CREATE TABLE IF NOT EXISTS hero_images (
  id TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  r2_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  alt_text TEXT NOT NULL DEFAULT 'StudentHUB homepage hero image',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hero_images_active_order
  ON hero_images (is_active, sort_order, created_at);

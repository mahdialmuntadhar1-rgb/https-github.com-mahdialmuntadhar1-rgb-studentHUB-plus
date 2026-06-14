-- Jamiaati / StudentHUB-plus opportunity automation schema for Cloudflare D1.
-- Safe to re-run: all tables use IF NOT EXISTS and seed rows use INSERT OR IGNORE.

CREATE TABLE IF NOT EXISTS opportunity_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  university TEXT,
  governorate TEXT,
  city TEXT,
  active INTEGER DEFAULT 1,
  enabled INTEGER DEFAULT 1,
  last_checked TEXT,
  error_status TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS opportunity_candidates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  titleEN TEXT,
  titleAR TEXT,
  titleKU TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'job',
    'scholarship',
    'event',
    'news',
    'announcement',
    'internship',
    'training',
    'fellowship',
    'competition',
    'registration',
    'exam',
    'deadline'
  )),
  university TEXT,
  organization TEXT,
  governorate TEXT,
  governorateId TEXT DEFAULT 'all',
  city TEXT,
  country TEXT DEFAULT 'Iraq',
  source_website TEXT,
  source_url TEXT NOT NULL,
  original_source_url TEXT,
  application_link TEXT,
  summary TEXT,
  contentEN TEXT,
  contentAR TEXT,
  contentKU TEXT,
  deadline TEXT,
  published_date TEXT,
  language TEXT,
  status TEXT DEFAULT 'pending_review' CHECK (status IN (
    'pending_review',
    'pending',
    'approved',
    'rejected',
    'duplicate',
    'expired'
  )),
  raw_extracted_text TEXT,
  confidence_score REAL DEFAULT 0,
  duplicate_key TEXT,
  rejection_reason TEXT,
  duplicate_seen_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS opportunity_raw_items (
  id TEXT PRIMARY KEY,
  source_id TEXT,
  source_name TEXT,
  source_url TEXT,
  raw_text TEXT,
  extracted_at TEXT DEFAULT CURRENT_TIMESTAMP,
  error TEXT
);

CREATE TABLE IF NOT EXISTS opportunity_run_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  source_id TEXT,
  source_name TEXT,
  items_found INTEGER DEFAULT 0,
  items_new INTEGER DEFAULT 0,
  items_duplicate INTEGER DEFAULT 0,
  errors TEXT
);

CREATE TABLE IF NOT EXISTS admin_users (
  email TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'staff',
  permissions TEXT,
  is_main_admin INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_by TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_opportunity_candidates_status ON opportunity_candidates(status);
CREATE INDEX IF NOT EXISTS idx_opportunity_candidates_category ON opportunity_candidates(category);
CREATE INDEX IF NOT EXISTS idx_opportunity_candidates_governorate ON opportunity_candidates(governorateId);
CREATE INDEX IF NOT EXISTS idx_opportunity_candidates_city ON opportunity_candidates(city);
CREATE INDEX IF NOT EXISTS idx_opportunity_candidates_university ON opportunity_candidates(university);
CREATE UNIQUE INDEX IF NOT EXISTS idx_opportunity_candidates_duplicate_key ON opportunity_candidates(duplicate_key);

-- Backward-compatible table names used by earlier local builds.
CREATE TABLE IF NOT EXISTS sources AS SELECT * FROM opportunity_sources WHERE 0;
CREATE TABLE IF NOT EXISTS opportunities AS SELECT * FROM opportunity_candidates WHERE 0;
CREATE TABLE IF NOT EXISTS scraper_logs AS SELECT * FROM opportunity_run_logs WHERE 0;

INSERT OR IGNORE INTO opportunity_sources (id, name, url, type, university, governorate, city, active, enabled) VALUES
('uobaghdad-news', 'University of Baghdad News', 'https://uobaghdad.edu.iq/', 'news', 'University of Baghdad', 'Baghdad', 'Baghdad', 1, 1),
('uotechnology-announcements', 'University of Technology Announcements', 'https://uotechnology.edu.iq/', 'announcement', 'University of Technology', 'Baghdad', 'Baghdad', 1, 1),
('mustansiriyah-news', 'Mustansiriyah University News', 'https://uomustansiriyah.edu.iq/', 'news', 'Mustansiriyah University', 'Baghdad', 'Baghdad', 1, 1),
('basrah-news', 'University of Basrah News', 'https://uobasrah.edu.iq/', 'news', 'University of Basrah', 'Basra', 'Basra', 1, 1),
('mosul-news', 'University of Mosul News', 'https://uomosul.edu.iq/', 'news', 'University of Mosul', 'Nineveh', 'Mosul', 1, 1),
('kufa-news', 'University of Kufa News', 'https://uokufa.edu.iq/', 'news', 'University of Kufa', 'Najaf', 'Najaf', 1, 1),
('karbala-news', 'University of Karbala News', 'https://uokerbala.edu.iq/', 'news', 'University of Karbala', 'Karbala', 'Karbala', 1, 1),
('duhok-news', 'University of Duhok News', 'https://uod.ac/', 'news', 'University of Duhok', 'Duhok', 'Duhok', 1, 1),
('sulaimani-news', 'University of Sulaimani News', 'https://univsul.edu.iq/', 'news', 'University of Sulaimani', 'Sulaymaniyah', 'Sulaymaniyah', 1, 1),
('koya-news', 'Koya University News', 'https://koyauniversity.org/', 'news', 'Koya University', 'Erbil', 'Koya', 1, 1),
('mohesr-iraq', 'Iraqi Ministry of Higher Education', 'https://mohesr.gov.iq/', 'announcement', '', '', '', 1, 1),
('mhe-krg', 'KRG Ministry of Higher Education', 'https://mhe.gov.krd/', 'scholarship', '', 'Erbil', 'Erbil', 1, 1),
('daad-iraq', 'DAAD Iraq', 'https://www.daad-iraq.org/en/', 'scholarship', '', '', '', 1, 1),
('un-jobs-iraq', 'United Nations Iraq Jobs', 'https://iraq.un.org/en/jobs', 'job', '', '', '', 1, 1),
('asiacell-careers', 'Asiacell Careers', 'https://www.asiacell.com/en/about-us/careers', 'job', '', 'Sulaymaniyah', 'Sulaymaniyah', 1, 1),
('five-one-labs', 'Five One Labs Programs', 'https://fiveonelabs.org/', 'training', '', 'Sulaymaniyah', 'Sulaymaniyah', 1, 1);

INSERT OR IGNORE INTO admin_users (email, role, permissions, is_main_admin) VALUES
('safaribosafar@gmail.com', 'staff', '["hero:write","posts:manage","uploads:manage"]', 1);

INSERT OR IGNORE INTO app_config (key, value_json, updated_by) VALUES
('hero', '{"imageUrl":"https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600","titleEN":"","titleAR":"","titleKU":"","subtitleEN":"","subtitleAR":"","subtitleKU":""}', 'safaribosafar@gmail.com');

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
SELECT id, name, url, type, enabled, last_checked, error_status FROM opportunity_sources;

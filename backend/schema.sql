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
  city TEXT,
  deadline TEXT,
  tags TEXT DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS institutions (
  id TEXT PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_ku TEXT,
  name_en TEXT,
  governorate TEXT NOT NULL,
  city TEXT,
  type TEXT NOT NULL,
  website TEXT,
  active INTEGER DEFAULT 1,
  is_seed INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_institutions_governorate ON institutions(governorate);
CREATE INDEX IF NOT EXISTS idx_institutions_website ON institutions(website);
CREATE INDEX IF NOT EXISTS idx_institutions_name_en ON institutions(name_en);

CREATE TABLE IF NOT EXISTS highlight_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('event', 'job', 'internship', 'scholarship', 'student_club')),
  governorate_scope TEXT,
  university_scope TEXT,
  source_type TEXT NOT NULL DEFAULT 'web',
  enabled INTEGER NOT NULL DEFAULT 1,
  trusted_source INTEGER NOT NULL DEFAULT 0,
  auto_publish INTEGER NOT NULL DEFAULT 0,
  scraping_priority INTEGER NOT NULL DEFAULT 50,
  last_checked_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS highlight_items (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('event', 'job', 'internship', 'scholarship', 'student_club')),
  title TEXT NOT NULL,
  organization TEXT,
  governorate TEXT,
  city TEXT,
  university_id TEXT,
  source_name TEXT,
  source_url TEXT,
  apply_url TEXT,
  event_date TEXT,
  deadline TEXT,
  summary TEXT,
  full_description_optional TEXT,
  image_url TEXT,
  language TEXT,
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'duplicate', 'expired')),
  duplicate_key TEXT UNIQUE,
  confidence_score INTEGER NOT NULL DEFAULT 50,
  raw_text TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS highlight_import_logs (
  id TEXT PRIMARY KEY,
  source_id TEXT,
  category TEXT,
  started_at DATETIME NOT NULL,
  finished_at DATETIME,
  status TEXT NOT NULL,
  items_found INTEGER NOT NULL DEFAULT 0,
  items_added INTEGER NOT NULL DEFAULT 0,
  duplicates_found INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  FOREIGN KEY (source_id) REFERENCES highlight_sources(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_highlight_items_public
  ON highlight_items(status, category, governorate, deadline, event_date);

CREATE INDEX IF NOT EXISTS idx_highlight_sources_enabled
  ON highlight_sources(enabled, scraping_priority);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_rooms (
  id TEXT PRIMARY KEY,
  user1_id TEXT NOT NULL,
  user2_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user1_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (user2_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_resets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  token TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_permissions (
  user_id TEXT PRIMARY KEY,
  can_upload INTEGER DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS outreach_contacts (
  id TEXT PRIMARY KEY,
  institution_name TEXT,
  contact_name TEXT,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  department TEXT,
  governorate TEXT,
  institution_type TEXT,
  language TEXT,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced', 'invalid', 'duplicate')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_outreach_contacts_status ON outreach_contacts(status);
CREATE INDEX IF NOT EXISTS idx_outreach_contacts_governorate ON outreach_contacts(governorate);
CREATE INDEX IF NOT EXISTS idx_outreach_contacts_type ON outreach_contacts(institution_type);
CREATE INDEX IF NOT EXISTS idx_outreach_contacts_language ON outreach_contacts(language);

CREATE TABLE IF NOT EXISTS outreach_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject_template TEXT NOT NULL,
  html_template TEXT NOT NULL,
  text_template TEXT NOT NULL,
  language TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS outreach_campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  template_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'paused', 'completed', 'failed')),
  segment_filter_json TEXT,
  total_recipients INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  bounced_count INTEGER NOT NULL DEFAULT 0,
  unsubscribed_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  started_at TEXT,
  completed_at TEXT,
  FOREIGN KEY (template_id) REFERENCES outreach_templates(id)
);

CREATE INDEX IF NOT EXISTS idx_outreach_campaigns_status ON outreach_campaigns(status);

CREATE TABLE IF NOT EXISTS outreach_campaign_recipients (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  email TEXT NOT NULL,
  personalized_subject TEXT NOT NULL,
  personalized_html TEXT NOT NULL,
  personalized_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'queued', 'sent', 'failed', 'bounced', 'skipped', 'unsubscribed')),
  provider_message_id TEXT,
  error_message TEXT,
  sent_at TEXT,
  opened_at TEXT,
  clicked_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES outreach_campaigns(id),
  FOREIGN KEY (contact_id) REFERENCES outreach_contacts(id),
  UNIQUE (campaign_id, email)
);

CREATE INDEX IF NOT EXISTS idx_outreach_recipients_campaign ON outreach_campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_outreach_recipients_status ON outreach_campaign_recipients(status);
CREATE INDEX IF NOT EXISTS idx_outreach_recipients_email ON outreach_campaign_recipients(email);

CREATE TABLE IF NOT EXISTS outreach_unsubscribes (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  contact_id TEXT,
  reason TEXT,
  token_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contact_id) REFERENCES outreach_contacts(id)
);

CREATE INDEX IF NOT EXISTS idx_outreach_unsubscribes_email ON outreach_unsubscribes(email);
CREATE INDEX IF NOT EXISTS idx_outreach_unsubscribes_token ON outreach_unsubscribes(token_hash);

-- ─── OPPORTUNITY AUTOMATION TABLES ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS opportunity_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('website', 'rss', 'api', 'manual_csv', 'university', 'ngo', 'un_agency', 'embassy', 'scholarship_portal', 'job_board', 'external', 'manual_or_limited')),
  category_scope TEXT NOT NULL CHECK (category_scope IN ('jobs', 'scholarships', 'internships', 'trainings', 'events', 'volunteering', 'fellowships', 'competitions', 'announcements', 'registration', 'exams', 'mixed')),
  country_scope TEXT,
  governorate_scope TEXT,
  language TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  crawl_frequency_hours INTEGER NOT NULL DEFAULT 24,
  last_checked_at DATETIME,
  last_success_at DATETIME,
  last_error TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_opportunity_sources_active ON opportunity_sources(is_active, crawl_frequency_hours);
CREATE INDEX IF NOT EXISTS idx_opportunity_sources_scope ON opportunity_sources(governorate_scope, category_scope);

CREATE TABLE IF NOT EXISTS opportunity_candidates (
  id TEXT PRIMARY KEY,
  source_id TEXT,
  title TEXT NOT NULL,
  organization TEXT,
  category TEXT NOT NULL CHECK (category IN ('job', 'internship', 'scholarship', 'training', 'event', 'volunteering', 'fellowship', 'competition', 'announcement', 'exam', 'registration')),
  description TEXT,
  summary TEXT,
  eligibility TEXT,
  deadline TEXT,
  published_date TEXT,
  apply_url TEXT,
  source_url TEXT,
  image_url TEXT,
  country TEXT,
  governorate TEXT,
  city TEXT,
  language TEXT,
  salary_or_funding TEXT,
  confidence_score INTEGER NOT NULL DEFAULT 50,
  duplicate_key TEXT,
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'duplicate', 'expired')),
  rejection_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (source_id) REFERENCES opportunity_sources(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_opportunity_candidates_status ON opportunity_candidates(status, category, governorate, deadline);
CREATE INDEX IF NOT EXISTS idx_opportunity_candidates_duplicate ON opportunity_candidates(duplicate_key);
CREATE INDEX IF NOT EXISTS idx_opportunity_candidates_source ON opportunity_candidates(source_id);

CREATE TABLE IF NOT EXISTS opportunity_raw_items (
  id TEXT PRIMARY KEY,
  source_id TEXT,
  raw_title TEXT,
  raw_text TEXT,
  raw_html TEXT,
  raw_url TEXT,
  raw_date TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (source_id) REFERENCES opportunity_sources(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_opportunity_raw_items_source ON opportunity_raw_items(source_id);

CREATE TABLE IF NOT EXISTS opportunity_run_logs (
  id TEXT PRIMARY KEY,
  started_at DATETIME NOT NULL,
  finished_at DATETIME,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'partial_success', 'failed')),
  sources_checked INTEGER NOT NULL DEFAULT 0,
  items_found INTEGER NOT NULL DEFAULT 0,
  items_inserted INTEGER NOT NULL DEFAULT 0,
  duplicates_found INTEGER NOT NULL DEFAULT 0,
  errors_json TEXT
);

CREATE INDEX IF NOT EXISTS idx_opportunity_run_logs_status ON opportunity_run_logs(status, started_at);

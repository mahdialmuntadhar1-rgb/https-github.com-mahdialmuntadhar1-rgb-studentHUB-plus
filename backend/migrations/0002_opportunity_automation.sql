-- Opportunity Automation Engine Migration
-- Run with: wrangler d1 execute rafid-db --local --file=./migrations/0002_opportunity_automation.sql
-- Remote:   wrangler d1 execute rafid-db --remote --file=./migrations/0002_opportunity_automation.sql

-- Opportunity Sources Table
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

-- Opportunity Candidates Table
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

-- Opportunity Raw Items Table
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

-- Opportunity Run Logs Table
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

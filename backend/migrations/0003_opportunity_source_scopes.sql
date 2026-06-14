-- Expand opportunity_sources.category_scope to include registration and exams.
-- Required before seeding non-job registration/exam automation sources on an
-- existing D1 database that was created with the 0002 CHECK constraint.

PRAGMA foreign_keys=off;

CREATE TABLE IF NOT EXISTS opportunity_sources_new (
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

INSERT OR IGNORE INTO opportunity_sources_new (
  id, name, url, source_type, category_scope, country_scope, governorate_scope,
  language, is_active, crawl_frequency_hours, last_checked_at, last_success_at,
  last_error, notes, created_at, updated_at
)
SELECT
  id, name, url, source_type, category_scope, country_scope, governorate_scope,
  language, is_active, crawl_frequency_hours, last_checked_at, last_success_at,
  last_error, notes, created_at, updated_at
FROM opportunity_sources;

DROP TABLE opportunity_sources;
ALTER TABLE opportunity_sources_new RENAME TO opportunity_sources;

CREATE INDEX IF NOT EXISTS idx_opportunity_sources_active ON opportunity_sources(is_active, crawl_frequency_hours);
CREATE INDEX IF NOT EXISTS idx_opportunity_sources_scope ON opportunity_sources(governorate_scope, category_scope);

PRAGMA foreign_keys=on;

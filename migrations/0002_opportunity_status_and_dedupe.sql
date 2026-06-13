-- Jamiaati production migration: opportunity moderation status model and dedupe indexes.
CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  enabled INTEGER DEFAULT 1,
  last_checked TEXT,
  error_status TEXT
);

CREATE TABLE IF NOT EXISTS opportunities (
  id TEXT PRIMARY KEY,
  titleEN TEXT NOT NULL,
  titleAR TEXT NOT NULL,
  titleKU TEXT NOT NULL,
  contentEN TEXT NOT NULL,
  contentAR TEXT NOT NULL,
  contentKU TEXT NOT NULL,
  organization TEXT NOT NULL,
  category TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Iraq',
  governorateId TEXT DEFAULT 'all',
  deadline TEXT,
  application_link TEXT NOT NULL,
  original_source_url TEXT NOT NULL,
  published_date TEXT,
  imageUrl TEXT,
  status TEXT DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'approved', 'rejected', 'duplicate', 'expired')),
  rejectionReason TEXT,
  duplicateOf TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  approvedAt TEXT,
  approvedBy TEXT,
  rejectedAt TEXT,
  expiredAt TEXT,
  workplaceType TEXT DEFAULT 'On-site',
  whoCanApply TEXT,
  salary TEXT,
  location TEXT,
  savedCount INTEGER DEFAULT 0,
  universityAppliedCount INTEGER DEFAULT 0,
  companyVerified INTEGER DEFAULT 0
);

UPDATE opportunities SET status = 'pending_review' WHERE status IS NULL OR status = 'pending';
UPDATE opportunities SET status = 'duplicate' WHERE status = 'duplicates';

CREATE UNIQUE INDEX IF NOT EXISTS idx_opportunities_source_url_unique
  ON opportunities(original_source_url);
CREATE INDEX IF NOT EXISTS idx_opportunities_title_org
  ON opportunities(titleEN, organization);
CREATE INDEX IF NOT EXISTS idx_opportunities_title_deadline_category
  ON opportunities(titleEN, deadline, category);
CREATE INDEX IF NOT EXISTS idx_opportunities_status
  ON opportunities(status);

CREATE TABLE IF NOT EXISTS scraper_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  source_id TEXT,
  source_name TEXT,
  items_found INTEGER DEFAULT 0,
  items_new INTEGER DEFAULT 0,
  items_duplicate INTEGER DEFAULT 0,
  errors TEXT
);


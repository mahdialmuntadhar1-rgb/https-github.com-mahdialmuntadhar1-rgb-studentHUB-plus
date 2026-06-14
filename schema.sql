-- Cloudflare D1 Table Schema for Iraq Student Opportunities Automation
-- This file defines the tables used for storing sources, scraped opportunities, and scraping activity logs in D1.

-- 1. Sources Website Table
CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL, -- 'jobs' | 'scholarships' | 'trainings' | 'events' | 'competitions'
  enabled INTEGER DEFAULT 1, -- 0 = disabled, 1 = enabled
  last_checked TEXT,
  error_status TEXT
);

-- 2. Opportunities Schema
CREATE TABLE IF NOT EXISTS opportunities (
  id TEXT PRIMARY KEY,
  titleEN TEXT NOT NULL,
  titleAR TEXT NOT NULL,
  titleKU TEXT NOT NULL,
  contentEN TEXT NOT NULL,
  contentAR TEXT NOT NULL,
  contentKU TEXT NOT NULL,
  organization TEXT NOT NULL,
  category TEXT NOT NULL, -- 'job' | 'internship' | 'scholarship' | 'training' | 'event' | 'volunteering' | 'fellowship' | 'competition' | 'announcement'
  country TEXT NOT NULL DEFAULT 'Iraq',
  governorateId TEXT DEFAULT 'all', -- 'baghdad', 'sulaymaniyah', 'nineveh', 'all', etc.
  deadline TEXT, -- ISO string or legible date
  application_link TEXT NOT NULL,
  original_source_url TEXT NOT NULL,
  published_date TEXT,
  imageUrl TEXT,
  status TEXT DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'duplicate', 'expired')),
  rejectionReason TEXT,
  duplicateOf TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  workplaceType TEXT DEFAULT 'On-site', -- 'On-site' | 'Remote' | 'Hybrid'
  whoCanApply TEXT,
  salary TEXT,
  location TEXT,
  savedCount INTEGER DEFAULT 0,
  universityAppliedCount INTEGER DEFAULT 0,
  companyVerified INTEGER DEFAULT 0 -- 0 = false, 1 = true
);

CREATE INDEX IF NOT EXISTS idx_opportunities_source_url ON opportunities(original_source_url);
CREATE INDEX IF NOT EXISTS idx_opportunities_title_org ON opportunities(titleEN, organization);
CREATE INDEX IF NOT EXISTS idx_opportunities_title_deadline_category ON opportunities(titleEN, deadline, category);
CREATE UNIQUE INDEX IF NOT EXISTS idx_opportunities_unique_source_url ON opportunities(original_source_url);
CREATE UNIQUE INDEX IF NOT EXISTS idx_opportunities_unique_title_org_deadline ON opportunities(titleEN, organization, deadline);

-- 2b. Raw scraped/imported item storage before moderation.
-- Raw rows are kept for auditability; normalized opportunities still enter pending_review only.
CREATE TABLE IF NOT EXISTS raw_scraped_items (
  id TEXT PRIMARY KEY,
  source_id TEXT,
  source_name TEXT,
  raw_title TEXT,
  raw_url TEXT,
  raw_snippet TEXT,
  scraped_at TEXT NOT NULL,
  last_seen_at TEXT,
  opportunity_id TEXT,
  review_status TEXT DEFAULT 'pending_review' CHECK (review_status IN ('pending_review', 'approved', 'rejected', 'duplicate', 'expired')),
  UNIQUE(source_id, raw_url)
);

CREATE INDEX IF NOT EXISTS idx_raw_scraped_items_opportunity ON raw_scraped_items(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_raw_scraped_items_status ON raw_scraped_items(review_status);

-- 3. Portal settings for public homepage customization.
-- GET is public-readable for the homepage; writes must be protected by admin auth.
CREATE TABLE IF NOT EXISTS portal_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  hero_image TEXT NOT NULL,
  hero_title_en TEXT NOT NULL,
  hero_title_ar TEXT NOT NULL,
  hero_title_ku TEXT NOT NULL,
  hero_description_en TEXT NOT NULL,
  hero_description_ar TEXT NOT NULL,
  hero_description_ku TEXT NOT NULL,
  hero_tag_en TEXT NOT NULL,
  hero_tag_ar TEXT NOT NULL,
  hero_tag_ku TEXT NOT NULL,
  default_stories_json TEXT NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_by TEXT
);

-- 4. Scraper Logs Schema
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

-- 5. User-generated content and engagement persistence
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT DEFAULT 'post',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  anonymous INTEGER DEFAULT 0,
  imageUrl TEXT,
  status TEXT DEFAULT 'approved', -- approved | pending_review | rejected
  governorateId TEXT DEFAULT 'all',
  universityId TEXT DEFAULT 'all',
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  itemId TEXT NOT NULL,
  userId TEXT NOT NULL,
  content TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS likes (
  itemId TEXT NOT NULL,
  userId TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (itemId, userId)
);

CREATE TABLE IF NOT EXISTS saved_items (
  itemId TEXT NOT NULL,
  userId TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (itemId, userId)
);

CREATE TABLE IF NOT EXISTS applications (
  itemId TEXT NOT NULL,
  userId TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (itemId, userId)
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
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Insert Initial Default Sources for Iraqi Students
INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status) VALUES
('asiacell-careers', 'Asiacell Careers Office', 'https://www.asiacell.com/en/about-us/careers', 'jobs', 1, NULL, NULL),
('un-jobs-iraq', 'United Nations Iraq Portal', 'https://iraq.un.org/en/jobs', 'jobs', 1, NULL, NULL),
('daad-iraq', 'DAAD German Scholarships Iraq', 'https://www.daad-iraq.org/en/', 'scholarships', 1, NULL, NULL),
('mhe-kurdish', 'MHESR Kurdistan Scholarships', 'https://mhe.gov.krd/', 'scholarships', 1, NULL, NULL),
('five-one-labs', 'Five One Labs Incubator & Training', 'https://fiveonelabs.org/', 'trainings', 1, NULL, NULL),
('mohesr-iraq-scholarships', 'Iraqi MoHESR Scholarships', 'https://mohesr.gov.iq/ar/category/scholarships/', 'scholarships', 1, NULL, NULL),
('iraq-internships-hub', 'Iraq Internships & Cooperational Training Hub', 'https://www.iraqinternships.com/listings', 'internships', 1, NULL, NULL),
('reiraq-tech-academy', 'ReIraq Tech Training Academy', 'https://www.reiraqtech.org/trainings', 'trainings', 1, NULL, NULL),
('iraq-tech-calendar', 'Iraq Tech & Startup Ecosystem Calendar', 'https://iraqstartupcalendar.org/events', 'events', 1, NULL, NULL),
('ircs-volunteering', 'Iraqi Red Crescent Society Volunteering', 'https://ircs.org.iq/volunteering', 'volunteering', 1, NULL, NULL),
('ruwwad-iraq-fellowships', 'Ruwwad Al-Iraq Fellowship Program', 'https://ruwwad-iraq.net/fellowship', 'fellowships', 1, NULL, NULL),
('iraqicpc-competition', 'Iraq National Collegiate Programming Contest', 'https://iraqicpc.org/competition', 'competitions', 1, NULL, NULL),
('uobaghdad-student-bulletin', 'University of Baghdad Student Affairs Bulletin', 'https://uobaghdad.edu.iq/news/student-announcements', 'announcements', 1, NULL, NULL),
('dirasat-gate-registration', 'Central Admissions Registration Portal Iraq', 'https://www.dirasat-gate.org/registration', 'registration', 1, NULL, NULL),
('moedu-exam-timetables', 'Ministry of Education Exam Timetables', 'https://moedu.gov.iq/exams', 'exams', 1, NULL, NULL),
('iraqiyouth-hub-listings', 'Iraqi Youth Hub Mixed Announcements', 'https://iraqiyouthhub.org/listings', 'mixed', 1, NULL, NULL);

CREATE TABLE highlight_items_new (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (
    category IN (
      'news',
      'event',
      'announcement',
      'exam',
      'registration',
      'student_club',
      'activity',
      'job',
      'internship',
      'scholarship'
    )
  ),
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
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (
    status IN ('pending_review', 'approved', 'rejected', 'duplicate', 'expired')
  ),
  duplicate_key TEXT UNIQUE,
  confidence_score INTEGER NOT NULL DEFAULT 50,
  raw_text TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO highlight_items_new (
  id,
  category,
  title,
  organization,
  governorate,
  city,
  university_id,
  source_name,
  source_url,
  apply_url,
  event_date,
  deadline,
  summary,
  full_description_optional,
  image_url,
  language,
  status,
  duplicate_key,
  confidence_score,
  raw_text,
  created_at,
  updated_at
)
SELECT
  id,
  category,
  title,
  organization,
  governorate,
  city,
  university_id,
  source_name,
  source_url,
  apply_url,
  event_date,
  deadline,
  summary,
  full_description_optional,
  image_url,
  language,
  status,
  duplicate_key,
  confidence_score,
  raw_text,
  created_at,
  updated_at
FROM highlight_items;

DROP TABLE highlight_items;

ALTER TABLE highlight_items_new RENAME TO highlight_items;

CREATE INDEX idx_highlight_items_public
  ON highlight_items(status, category, governorate, deadline, event_date);

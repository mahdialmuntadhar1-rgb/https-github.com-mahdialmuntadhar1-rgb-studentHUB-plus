-- Cloudflare D1 Table Schema for Jamiaati / StudentHUB Plus
-- Production-ready schema for university social app with opportunities, social feed, messaging, and auth

-- ============================================================================
-- 1. USERS & AUTHENTICATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE,
  role TEXT DEFAULT 'student', -- 'student' | 'graduate' | 'teacher' | 'staff' | 'admin'
  university_id TEXT,
  governorate_id TEXT DEFAULT 'all',
  bio_en TEXT,
  bio_ar TEXT,
  bio_ku TEXT,
  major_en TEXT,
  major_ar TEXT,
  major_ku TEXT,
  avatar_url TEXT,
  email_verified INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_login_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_university ON users(university_id);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_password_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_tokens_user ON password_reset_tokens(user_id);

-- ============================================================================
-- 2. SOCIAL FEED - POSTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL,
  type TEXT DEFAULT 'post', -- 'post' | 'video' | 'photo' | 'story' | 'poll' | 'anonymous_question' | 'announcement'
  
  -- Localized content
  title_en TEXT,
  title_ar TEXT,
  title_ku TEXT,
  content_en TEXT NOT NULL,
  content_ar TEXT,
  content_ku TEXT,
  
  -- Original language support
  original_language TEXT, -- 'en' | 'ar' | 'ku'
  title_original TEXT,
  body_original TEXT,
  
  -- Metadata
  university_id TEXT DEFAULT 'all',
  governorate_id TEXT DEFAULT 'all',
  image_url TEXT,
  video_url TEXT,
  video_thumbnail TEXT,
  
  -- Engagement
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'active', -- 'active' | 'deleted' | 'hidden'
  is_anonymous INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT,
  
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_university ON posts(university_id);
CREATE INDEX IF NOT EXISTS idx_posts_governorate ON posts(governorate_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);

-- Post images (for multiple images per post)
CREATE TABLE IF NOT EXISTS post_images (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_key TEXT NOT NULL, -- R2 key
  order_index INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_post_images_post ON post_images(post_id);

-- Post likes
CREATE TABLE IF NOT EXISTS post_likes (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON post_likes(user_id);

-- Post saves/bookmarks
CREATE TABLE IF NOT EXISTS post_saves (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_post_saves_post ON post_saves(post_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_user ON post_saves(user_id);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  content TEXT NOT NULL,
  
  -- Localized content
  content_en TEXT,
  content_ar TEXT,
  content_ku TEXT,
  original_language TEXT,
  content_original TEXT,
  
  likes_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT,
  
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at DESC);

-- ============================================================================
-- 3. FRIEND REQUESTS & SOCIAL CONNECTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS friend_requests (
  id TEXT PRIMARY KEY,
  requester_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending' | 'accepted' | 'declined' | 'cancelled'
  message TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(requester_id, recipient_id),
  FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_friend_requests_requester ON friend_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_recipient ON friend_requests(recipient_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);

-- Accepted friendships (for quick lookup)
CREATE TABLE IF NOT EXISTS friendships (
  id TEXT PRIMARY KEY,
  user_id_1 TEXT NOT NULL,
  user_id_2 TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id_1, user_id_2),
  FOREIGN KEY (user_id_1) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id_2) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_friendships_user1 ON friendships(user_id_1);
CREATE INDEX IF NOT EXISTS idx_friendships_user2 ON friendships(user_id_2);

-- ============================================================================
-- 4. MESSAGING SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS message_requests (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending' | 'accepted' | 'declined'
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_message_requests_sender ON message_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_message_requests_recipient ON message_requests(recipient_id);
CREATE INDEX IF NOT EXISTS idx_message_requests_status ON message_requests(status);

CREATE TABLE IF NOT EXISTS message_threads (
  id TEXT PRIMARY KEY,
  type TEXT DEFAULT 'direct', -- 'direct' | 'group'
  status TEXT DEFAULT 'active',
  requester_id TEXT,
  recipient_id TEXT,
  last_message_at TEXT,
  last_message_preview TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_message_threads_requester ON message_threads(requester_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_recipient ON message_threads(recipient_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_last_message ON message_threads(last_message_at DESC);

CREATE TABLE IF NOT EXISTS message_thread_members (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(thread_id, user_id),
  FOREIGN KEY (thread_id) REFERENCES message_threads(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_thread_members_thread ON message_thread_members(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_members_user ON message_thread_members(user_id);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'sent', -- 'sent' | 'delivered' | 'read'
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT,
  FOREIGN KEY (thread_id) REFERENCES message_threads(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- ============================================================================
-- 5. CONTENT MODERATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_reports (
  id TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'post' | 'comment' | 'message' | 'user'
  content_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  reviewed_by TEXT,
  reviewed_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_reports_content ON content_reports(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON content_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON content_reports(reporter_id);

CREATE TABLE IF NOT EXISTS user_blocks (
  id TEXT PRIMARY KEY,
  blocker_id TEXT NOT NULL,
  blocked_id TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(blocker_id, blocked_id),
  FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON user_blocks(blocked_id);

-- ============================================================================
-- 6. OPPORTUNITIES & AUTOMATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS opportunity_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL, -- 'jobs' | 'scholarships' | 'trainings' | 'events' | 'competitions'
  enabled INTEGER DEFAULT 1,
  last_checked TEXT,
  error_status TEXT
);

CREATE TABLE IF NOT EXISTS opportunity_candidates (
  id TEXT PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  title_ku TEXT NOT NULL,
  content_en TEXT NOT NULL,
  content_ar TEXT NOT NULL,
  content_ku TEXT NOT NULL,
  organization TEXT NOT NULL,
  category TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Iraq',
  governorate_id TEXT DEFAULT 'all',
  deadline TEXT,
  application_link TEXT NOT NULL,
  original_source_url TEXT NOT NULL,
  published_date TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'pending_review', -- 'pending_review' | 'approved' | 'rejected' | 'expired' | 'duplicate'
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  workplace_type TEXT DEFAULT 'On-site',
  who_can_apply TEXT,
  salary TEXT,
  location TEXT,
  saved_count INTEGER DEFAULT 0,
  university_applied_count INTEGER DEFAULT 0,
  company_verified INTEGER DEFAULT 0,
  source_id TEXT,
  original_language TEXT,
  title_original TEXT,
  content_original TEXT,
  FOREIGN KEY (source_id) REFERENCES opportunity_sources(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_candidates_status ON opportunity_candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_category ON opportunity_candidates(category);
CREATE INDEX IF NOT EXISTS idx_candidates_governorate ON opportunity_candidates(governorate_id);
CREATE INDEX IF NOT EXISTS idx_candidates_deadline ON opportunity_candidates(deadline);
CREATE INDEX IF NOT EXISTS idx_candidates_source ON opportunity_candidates(source_id);

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

CREATE INDEX IF NOT EXISTS idx_run_logs_timestamp ON opportunity_run_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_run_logs_source ON opportunity_run_logs(source_id);

-- ============================================================================
-- 7. INSTITUTIONS & UNIVERSITIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS institutions (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_ku TEXT NOT NULL,
  governorate_id TEXT NOT NULL,
  type TEXT DEFAULT 'university', -- 'university' | 'institute' | 'college'
  logo_url TEXT,
  website_url TEXT,
  verified INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_institutions_governorate ON institutions(governorate_id);
CREATE INDEX IF NOT EXISTS idx_institutions_type ON institutions(type);

-- ============================================================================
-- 8. ADMIN AUDIT LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT, -- 'user' | 'post' | 'opportunity' | 'source' | 'comment'
  target_id TEXT,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON admin_audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON admin_audit_logs(created_at DESC);

-- ============================================================================
-- 9. INITIAL DATA
-- ============================================================================

-- Insert Initial Default Sources for Iraqi Students
INSERT OR IGNORE INTO opportunity_sources (id, name, url, type, enabled, last_checked, error_status) VALUES
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

-- Insert admin user (safaribosafar@gmail.com) - password will be set via first login or admin setup
INSERT OR IGNORE INTO users (id, email, password_hash, full_name, role, email_verified) VALUES
('admin-001', 'safaribosafar@gmail.com', '', 'Admin User', 'admin', 1);

-- Insert sample Iraqi institutions
INSERT OR IGNORE INTO institutions (id, name_en, name_ar, name_ku, governorate_id, type, verified) VALUES
('uni-baghdad', 'University of Baghdad', 'جامعة بغداد', 'زانکۆی بەغدا', 'baghdad', 'university', 1),
('uni-mustansiriyah', 'Al-Mustansiriya University', 'الجامعة المستنصرية', 'زانکۆی مستنصری', 'baghdad', 'university', 1),
('uni-basra', 'University of Basra', 'جامعة البصرة', 'زانکۆی بەسرە', 'basra', 'university', 1),
('uni-mosul', 'University of Mosul', 'جامعة الموصل', 'زانکۆی مووسڵ', 'nineveh', 'university', 1),
('uni-sulaymaniyah', 'University of Sulaymaniyah', 'جامعة السليمانية', 'زانکۆی سلێمانی', 'sulaymaniyah', 'university', 1),
('uni-erbil', 'University of Erbil', 'جامعة أربيل', 'زانکۆی ھەولێر', 'erbil', 'university', 1),
('uni-kufa', 'University of Kufa', 'جامعة الكوفة', 'زانکۆی کوفە', 'najaf', 'university', 1),
('uni-babylon', 'University of Babylon', 'جامعة بابل', 'زانکۆی بابل', 'babil', 'university', 1),
('uni-diyala', 'University of Diyala', 'جامعة ديالى', 'زانکۆی دیالە', 'diyala', 'university', 1),
('uni-kirkuk', 'University of Kirkuk', 'جامعة كركوك', 'زانکۆی کەرکووک', 'kirkuk', 'university', 1);


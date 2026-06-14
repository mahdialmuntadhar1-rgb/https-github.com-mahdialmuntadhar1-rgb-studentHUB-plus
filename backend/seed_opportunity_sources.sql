-- Seed data for opportunity_sources table
-- Run with: wrangler d1 execute rafid-db --local --file=./seed_opportunity_sources.sql
-- Remote:   wrangler d1 execute rafid-db --remote --file=./seed_opportunity_sources.sql

-- Helper function to normalize URLs (add https:// if missing)
-- This is handled by the application logic, but URLs are pre-normalized here

-- All Iraq Sources
INSERT OR IGNORE INTO opportunity_sources (id, name, url, source_type, category_scope, country_scope, governorate_scope, language, is_active, crawl_frequency_hours) VALUES
('source-001', 'Al-Rased Iraqi Jobs', 'https://rasediraqi.com', 'job_board', 'jobs', 'Iraq', 'All Iraq', 'ar', 1, 24),
('source-002', 'Arkadu Iraq', 'https://arkadu-iq.org', 'job_board', 'jobs', 'Iraq', 'All Iraq', 'ar', 1, 24),
('source-003', 'Taaeen', 'https://taeen.iq', 'job_board', 'jobs', 'Iraq', 'All Iraq', 'ar', 1, 24),
('source-004', 'HonJob', 'https://honjob.com', 'job_board', 'jobs', 'Iraq', 'All Iraq', 'ar', 1, 24),
('source-005', 'AkoJobs', 'https://akojobs.com', 'job_board', 'jobs', 'Iraq', 'All Iraq', 'ar', 1, 24),
('source-006', 'OpenSooq Jobs', 'https://iq.opensooq.com/jobs', 'job_board', 'jobs', 'Iraq', 'All Iraq', 'ar', 1, 24),
('source-007', 'Bayt Iraq', 'https://bayt.com', 'job_board', 'jobs', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-008', 'LinkedIn Iraq Jobs', 'https://linkedin.com/jobs', 'external', 'jobs', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-009', 'Tanqeeb Iraq', 'https://iraq.tanqeeb.com', 'job_board', 'jobs', 'Iraq', 'All Iraq', 'ar', 1, 24),
('source-010', 'NaukriGulf Iraq', 'https://naukrigulf.com', 'job_board', 'jobs', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-011', 'GulfTalent Iraq', 'https://gulftalent.com', 'job_board', 'jobs', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-012', 'CareerIraq', 'https://careeriraq.com', 'job_board', 'jobs', 'Iraq', 'All Iraq', 'ar', 1, 24),
('source-013', 'Works Jobs IQ', 'https://works-jobsiq.com', 'job_board', 'jobs', 'Iraq', 'All Iraq', 'ar', 1, 24),
('source-014', 'Nabu Analytics Jobs', 'https://jobs.nabu-analytics.com', 'job_board', 'jobs', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-015', 'NGOs Jobs & Bids', 'https://ngosjobs-bids.com', 'ngo', 'jobs', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-016', 'ReliefWeb Iraq Jobs', 'https://reliefweb.int', 'ngo', 'jobs', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-017', 'UN Iraq Jobs', 'https://iraq.un.org', 'un_agency', 'jobs', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-018', 'UNjobs Iraq', 'https://unjobs.org', 'un_agency', 'jobs', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-019', 'Impactpool Iraq', 'https://impactpool.org', 'un_agency', 'jobs', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-020', 'UN Talent Iraq', 'https://untalent.org', 'un_agency', 'jobs', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-021', 'DevelopmentAid Iraq', 'https://developmentaid.org', 'ngo', 'jobs', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-022', 'Vacancies in Iraq', 'https://vacanciesiniraq.com', 'ngo', 'jobs', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-023', 'GIZ Iraq Careers', 'https://giz.de', 'ngo', 'jobs', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-024', 'SEED Kurdistan Careers', 'https://seedkurdistan.org', 'ngo', 'jobs', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-025', 'Barzani Charity Foundation Careers', 'https://bcf.krd', 'ngo', 'jobs', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-026', 'Rigzone Iraq', 'https://rigzone.com', 'job_board', 'jobs', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-027', 'Energy Jobline Iraq', 'https://energyjobline.com', 'job_board', 'jobs', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-028', 'Energy JobSearch Iraq', 'https://energyjobsearch.com', 'job_board', 'jobs', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-029', 'NES Fircroft Iraq', 'https://nesfircroft.com', 'job_board', 'jobs', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-030', 'WRS Iraq', 'https://wrs.com', 'job_board', 'jobs', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-031', 'Airswift Iraq', 'https://airswift.com', 'job_board', 'jobs', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-032', 'Earthlink Careers', 'https://earthlink.iq', 'website', 'jobs', 'Iraq', 'All Iraq', 'ar', 1, 24),
('source-033', 'Asiacell Careers', 'https://asiacell.com', 'website', 'jobs', 'Iraq', 'All Iraq', 'ar', 1, 24),
('source-034', 'Korek Careers', 'https://careers.korektel.com', 'website', 'jobs', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-035', 'Zain Careers', 'https://careers.zain.com', 'website', 'jobs', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-036', 'ZainCash Careers', 'https://apply.workable.com/zaincash-1', 'website', 'jobs', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-037', 'Toyota Iraq Careers', 'https://toyota.iq', 'website', 'jobs', 'Iraq', 'All Iraq', 'ar', 1, 24),
('source-038', 'National Bank of Iraq Careers', 'https://nbi.iq', 'website', 'jobs', 'Iraq', 'All Iraq', 'ar', 1, 24),
('source-039', 'Arab Bank Iraq Careers', 'https://arabbankiraq.com', 'website', 'jobs', 'Iraq', 'All Iraq', 'ar', 1, 24),
('source-040', 'Commercial Islamic Bank of Iraq Careers', 'https://cibiq.com.iq', 'website', 'jobs', 'Iraq', 'All Iraq', 'ar', 1, 24),
('source-041', 'Credit Bank of Iraq Careers', 'https://creditbankofiraq.com.iq', 'website', 'jobs', 'Iraq', 'All Iraq', 'ar', 1, 24),
('source-042', 'QNB Iraq Careers', 'https://mbi.iq', 'website', 'jobs', 'Iraq', 'All Iraq', 'ar', 1, 24);

-- Baghdad Sources
INSERT OR IGNORE INTO opportunity_sources (id, name, url, source_type, category_scope, country_scope, governorate_scope, language, is_active, crawl_frequency_hours) VALUES
('source-100', 'Al-Rased Iraqi Jobs (Baghdad)', 'https://rasediraqi.com', 'job_board', 'jobs', 'Iraq', 'Baghdad', 'ar', 1, 24),
('source-101', 'Arkadu Iraq (Baghdad)', 'https://arkadu-iq.org', 'job_board', 'jobs', 'Iraq', 'Baghdad', 'ar', 1, 24),
('source-102', 'Taaeen (Baghdad)', 'https://taeen.iq', 'job_board', 'jobs', 'Iraq', 'Baghdad', 'ar', 1, 24),
('source-103', 'LinkedIn Iraq Jobs (Baghdad)', 'https://linkedin.com/jobs', 'external', 'jobs', 'Iraq', 'Baghdad', 'en', 1, 24),
('source-104', 'Bayt Iraq (Baghdad)', 'https://bayt.com', 'job_board', 'jobs', 'Iraq', 'Baghdad', 'en', 1, 24),
('source-105', 'NGOs Jobs & Bids (Baghdad)', 'https://ngosjobs-bids.com', 'ngo', 'jobs', 'Iraq', 'Baghdad', 'en', 1, 24),
('source-106', 'UN Iraq Jobs (Baghdad)', 'https://iraq.un.org', 'un_agency', 'jobs', 'Iraq', 'Baghdad', 'en', 1, 24),
('source-107', 'Zain Careers (Baghdad)', 'https://careers.zain.com', 'website', 'jobs', 'Iraq', 'Baghdad', 'en', 1, 24),
('source-108', 'Earthlink Careers (Baghdad)', 'https://earthlink.iq', 'website', 'jobs', 'Iraq', 'Baghdad', 'ar', 1, 24);

-- Basra Sources
INSERT OR IGNORE INTO opportunity_sources (id, name, url, source_type, category_scope, country_scope, governorate_scope, language, is_active, crawl_frequency_hours) VALUES
('source-200', 'Rigzone Iraq (Basra)', 'https://rigzone.com', 'job_board', 'jobs', 'Iraq', 'Basra', 'en', 1, 24),
('source-201', 'Energy Jobline Iraq (Basra)', 'https://energyjobline.com', 'job_board', 'jobs', 'Iraq', 'Basra', 'en', 1, 24),
('source-202', 'Energy JobSearch Iraq (Basra)', 'https://energyjobsearch.com', 'job_board', 'jobs', 'Iraq', 'Basra', 'en', 1, 24),
('source-203', 'NES Fircroft Iraq (Basra)', 'https://nesfircroft.com', 'job_board', 'jobs', 'Iraq', 'Basra', 'en', 1, 24),
('source-204', 'Airswift Iraq (Basra)', 'https://airswift.com', 'job_board', 'jobs', 'Iraq', 'Basra', 'en', 1, 24),
('source-205', 'LinkedIn Iraq Jobs (Basra)', 'https://linkedin.com/jobs', 'external', 'jobs', 'Iraq', 'Basra', 'en', 1, 24),
('source-206', 'Bayt Iraq (Basra)', 'https://bayt.com', 'job_board', 'jobs', 'Iraq', 'Basra', 'en', 1, 24);

-- Erbil Sources
INSERT OR IGNORE INTO opportunity_sources (id, name, url, source_type, category_scope, country_scope, governorate_scope, language, is_active, crawl_frequency_hours) VALUES
('source-300', 'JOBS.KRD', 'https://jobs.krd', 'job_board', 'jobs', 'Iraq', 'Erbil', 'en', 1, 24),
('source-301', 'KRG Hali Kar', 'https://kar.molsa.gov.krd', 'website', 'jobs', 'Iraq', 'Erbil', 'ku', 1, 24),
('source-302', 'All Kurdistan Jobs', 'https://t.me/allkurdistanjobs', 'external', 'jobs', 'Iraq', 'Erbil', 'ku', 1, 24),
('source-303', 'Korek Careers (Erbil)', 'https://careers.korektel.com', 'website', 'jobs', 'Iraq', 'Erbil', 'en', 1, 24),
('source-304', 'SEED Kurdistan Careers (Erbil)', 'https://seedkurdistan.org', 'ngo', 'jobs', 'Iraq', 'Erbil', 'en', 1, 24),
('source-305', 'UNjobs Iraq (Erbil)', 'https://unjobs.org', 'un_agency', 'jobs', 'Iraq', 'Erbil', 'en', 1, 24);

-- Sulaymaniyah Sources
INSERT OR IGNORE INTO opportunity_sources (id, name, url, source_type, category_scope, country_scope, governorate_scope, language, is_active, crawl_frequency_hours) VALUES
('source-400', 'JOBS.KRD (Sulaymaniyah)', 'https://jobs.krd', 'job_board', 'jobs', 'Iraq', 'Sulaymaniyah', 'en', 1, 24),
('source-401', 'KRG Hali Kar (Sulaymaniyah)', 'https://kar.molsa.gov.krd', 'website', 'jobs', 'Iraq', 'Sulaymaniyah', 'ku', 1, 24),
('source-402', 'All Kurdistan Jobs (Sulaymaniyah)', 'https://t.me/allkurdistanjobs', 'external', 'jobs', 'Iraq', 'Sulaymaniyah', 'ku', 1, 24),
('source-403', 'SEED Kurdistan Careers (Sulaymaniyah)', 'https://seedkurdistan.org', 'ngo', 'jobs', 'Iraq', 'Sulaymaniyah', 'en', 1, 24),
('source-404', 'LinkedIn Iraq Jobs (Sulaymaniyah)', 'https://linkedin.com/jobs', 'external', 'jobs', 'Iraq', 'Sulaymaniyah', 'en', 1, 24);

-- Duhok Sources
INSERT OR IGNORE INTO opportunity_sources (id, name, url, source_type, category_scope, country_scope, governorate_scope, language, is_active, crawl_frequency_hours) VALUES
('source-500', 'JOBS.KRD (Duhok)', 'https://jobs.krd', 'job_board', 'jobs', 'Iraq', 'Duhok', 'en', 1, 24),
('source-501', 'KRG Hali Kar (Duhok)', 'https://kar.molsa.gov.krd', 'website', 'jobs', 'Iraq', 'Duhok', 'ku', 1, 24),
('source-502', 'All Kurdistan Jobs (Duhok)', 'https://t.me/allkurdistanjobs', 'external', 'jobs', 'Iraq', 'Duhok', 'ku', 1, 24),
('source-503', 'Korek Careers (Duhok)', 'https://careers.korektel.com', 'website', 'jobs', 'Iraq', 'Duhok', 'en', 1, 24);

-- Halabja Sources
INSERT OR IGNORE INTO opportunity_sources (id, name, url, source_type, category_scope, country_scope, governorate_scope, language, is_active, crawl_frequency_hours) VALUES
('source-600', 'JOBS.KRD (Halabja)', 'https://jobs.krd', 'job_board', 'jobs', 'Iraq', 'Halabja', 'en', 1, 24),
('source-601', 'KRG Hali Kar (Halabja)', 'https://kar.molsa.gov.krd', 'website', 'jobs', 'Iraq', 'Halabja', 'ku', 1, 24);

-- Nineveh Sources
INSERT OR IGNORE INTO opportunity_sources (id, name, url, source_type, category_scope, country_scope, governorate_scope, language, is_active, crawl_frequency_hours) VALUES
('source-700', 'NGOs Jobs & Bids (Nineveh)', 'https://ngosjobs-bids.com', 'ngo', 'jobs', 'Iraq', 'Nineveh', 'en', 1, 24),
('source-701', 'ReliefWeb Iraq Jobs (Nineveh)', 'https://reliefweb.int', 'ngo', 'jobs', 'Iraq', 'Nineveh', 'en', 1, 24),
('source-702', 'Arkadu Iraq (Nineveh)', 'https://arkadu-iq.org', 'job_board', 'jobs', 'Iraq', 'Nineveh', 'ar', 1, 24),
('source-703', 'LinkedIn Iraq Jobs (Nineveh)', 'https://linkedin.com/jobs', 'external', 'jobs', 'Iraq', 'Nineveh', 'en', 1, 24);

-- Kirkuk Sources
INSERT OR IGNORE INTO opportunity_sources (id, name, url, source_type, category_scope, country_scope, governorate_scope, language, is_active, crawl_frequency_hours) VALUES
('source-800', 'Arkadu Iraq (Kirkuk)', 'https://arkadu-iq.org', 'job_board', 'jobs', 'Iraq', 'Kirkuk', 'ar', 1, 24),
('source-801', 'Al-Rased Iraqi Jobs (Kirkuk)', 'https://rasediraqi.com', 'job_board', 'jobs', 'Iraq', 'Kirkuk', 'ar', 1, 24),
('source-802', 'LinkedIn Iraq Jobs (Kirkuk)', 'https://linkedin.com/jobs', 'external', 'jobs', 'Iraq', 'Kirkuk', 'en', 1, 24);

-- Anbar Sources
INSERT OR IGNORE INTO opportunity_sources (id, name, url, source_type, category_scope, country_scope, governorate_scope, language, is_active, crawl_frequency_hours) VALUES
('source-900', 'Arkadu Iraq (Anbar)', 'https://arkadu-iq.org', 'job_board', 'jobs', 'Iraq', 'Anbar', 'ar', 1, 24),
('source-901', 'Al-Rased Iraqi Jobs (Anbar)', 'https://rasediraqi.com', 'job_board', 'jobs', 'Iraq', 'Anbar', 'ar', 1, 24),
('source-902', 'NGOs Jobs & Bids (Anbar)', 'https://ngosjobs-bids.com', 'ngo', 'jobs', 'Iraq', 'Anbar', 'en', 1, 24);

-- Salahaddin Sources
INSERT OR IGNORE INTO opportunity_sources (id, name, url, source_type, category_scope, country_scope, governorate_scope, language, is_active, crawl_frequency_hours) VALUES
('source-1000', 'Arkadu Iraq (Salahaddin)', 'https://arkadu-iq.org', 'job_board', 'jobs', 'Iraq', 'Salahaddin', 'ar', 1, 24),
('source-1001', 'Al-Rased Iraqi Jobs (Salahaddin)', 'https://rasediraqi.com', 'job_board', 'jobs', 'Iraq', 'Salahaddin', 'ar', 1, 24);

-- Diyala Sources
INSERT OR IGNORE INTO opportunity_sources (id, name, url, source_type, category_scope, country_scope, governorate_scope, language, is_active, crawl_frequency_hours) VALUES
('source-1100', 'Arkadu Iraq (Diyala)', 'https://arkadu-iq.org', 'job_board', 'jobs', 'Iraq', 'Diyala', 'ar', 1, 24),
('source-1101', 'Al-Rased Iraqi Jobs (Diyala)', 'https://rasediraqi.com', 'job_board', 'jobs', 'Iraq', 'Diyala', 'ar', 1, 24);

-- Babil Sources
INSERT OR IGNORE INTO opportunity_sources (id, name, url, source_type, category_scope, country_scope, governorate_scope, language, is_active, crawl_frequency_hours) VALUES
('source-1200', 'Arkadu Iraq (Babil)', 'https://arkadu-iq.org', 'job_board', 'jobs', 'Iraq', 'Babil', 'ar', 1, 24),
('source-1201', 'Al-Rased Iraqi Jobs (Babil)', 'https://rasediraqi.com', 'job_board', 'jobs', 'Iraq', 'Babil', 'ar', 1, 24);

-- Karbala Sources
INSERT OR IGNORE INTO opportunity_sources (id, name, url, source_type, category_scope, country_scope, governorate_scope, language, is_active, crawl_frequency_hours) VALUES
('source-1300', 'Arkadu Iraq (Karbala)', 'https://arkadu-iq.org', 'job_board', 'jobs', 'Iraq', 'Karbala', 'ar', 1, 24),
('source-1301', 'Al-Rased Iraqi Jobs (Karbala)', 'https://rasediraqi.com', 'job_board', 'jobs', 'Iraq', 'Karbala', 'ar', 1, 24);

-- Najaf Sources
INSERT OR IGNORE INTO opportunity_sources (id, name, url, source_type, category_scope, country_scope, governorate_scope, language, is_active, crawl_frequency_hours) VALUES
('source-1400', 'Arkadu Iraq (Najaf)', 'https://arkadu-iq.org', 'job_board', 'jobs', 'Iraq', 'Najaf', 'ar', 1, 24),
('source-1401', 'Al-Rased Iraqi Jobs (Najaf)', 'https://rasediraqi.com', 'job_board', 'jobs', 'Iraq', 'Najaf', 'ar', 1, 24);

-- Qadisiyah Sources
INSERT OR IGNORE INTO opportunity_sources (id, name, url, source_type, category_scope, country_scope, governorate_scope, language, is_active, crawl_frequency_hours) VALUES
('source-1500', 'Arkadu Iraq (Qadisiyah)', 'https://arkadu-iq.org', 'job_board', 'jobs', 'Iraq', 'Qadisiyah', 'ar', 1, 24),
('source-1501', 'Al-Rased Iraqi Jobs (Qadisiyah)', 'https://rasediraqi.com', 'job_board', 'jobs', 'Iraq', 'Qadisiyah', 'ar', 1, 24);

-- Wasit Sources
INSERT OR IGNORE INTO opportunity_sources (id, name, url, source_type, category_scope, country_scope, governorate_scope, language, is_active, crawl_frequency_hours) VALUES
('source-1600', 'Arkadu Iraq (Wasit)', 'https://arkadu-iq.org', 'job_board', 'jobs', 'Iraq', 'Wasit', 'ar', 1, 24),
('source-1601', 'Al-Rased Iraqi Jobs (Wasit)', 'https://rasediraqi.com', 'job_board', 'jobs', 'Iraq', 'Wasit', 'ar', 1, 24);

-- Dhi Qar Sources
INSERT OR IGNORE INTO opportunity_sources (id, name, url, source_type, category_scope, country_scope, governorate_scope, language, is_active, crawl_frequency_hours) VALUES
('source-1700', 'Arkadu Iraq (Dhi Qar)', 'https://arkadu-iq.org', 'job_board', 'jobs', 'Iraq', 'Dhi Qar', 'ar', 1, 24),
('source-1701', 'Al-Rased Iraqi Jobs (Dhi Qar)', 'https://rasediraqi.com', 'job_board', 'jobs', 'Iraq', 'Dhi Qar', 'ar', 1, 24),
('source-1702', 'NGOs Jobs & Bids (Dhi Qar)', 'https://ngosjobs-bids.com', 'ngo', 'jobs', 'Iraq', 'Dhi Qar', 'en', 1, 24);

-- Maysan Sources
INSERT OR IGNORE INTO opportunity_sources (id, name, url, source_type, category_scope, country_scope, governorate_scope, language, is_active, crawl_frequency_hours) VALUES
('source-1800', 'NGOs Jobs & Bids (Maysan)', 'https://ngosjobs-bids.com', 'ngo', 'jobs', 'Iraq', 'Maysan', 'en', 1, 24),
('source-1801', 'Arkadu Iraq (Maysan)', 'https://arkadu-iq.org', 'job_board', 'jobs', 'Iraq', 'Maysan', 'ar', 1, 24);

-- Muthanna Sources
INSERT OR IGNORE INTO opportunity_sources (id, name, url, source_type, category_scope, country_scope, governorate_scope, language, is_active, crawl_frequency_hours) VALUES
('source-1900', 'Arkadu Iraq (Muthanna)', 'https://arkadu-iq.org', 'job_board', 'jobs', 'Iraq', 'Muthanna', 'ar', 1, 24),
('source-1901', 'Al-Rased Iraqi Jobs (Muthanna)', 'https://rasediraqi.com', 'job_board', 'jobs', 'Iraq', 'Muthanna', 'ar', 1, 24);

-- Additional preserved job sources to keep the seeded job-source baseline at 108
INSERT OR IGNORE INTO opportunity_sources (id, name, url, source_type, category_scope, country_scope, governorate_scope, language, is_active, crawl_frequency_hours) VALUES
('source-2000', 'ReliefWeb Iraq Jobs', 'https://reliefweb.int/jobs?advanced-search=%28PC242%29', 'external', 'jobs', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-2001', 'Impactpool Iraq Jobs', 'https://www.impactpool.org/search?countries=Iraq', 'external', 'jobs', 'Iraq', 'All Iraq', 'en', 1, 24);

-- Non-job opportunity automation sources. These are collected as candidates only
-- and remain hidden from the public app until admin approval.
INSERT OR IGNORE INTO opportunity_sources (id, name, url, source_type, category_scope, country_scope, governorate_scope, language, is_active, crawl_frequency_hours) VALUES
('source-3000', 'Scholarships for Development', 'https://www.scholars4dev.com/category/country/iraq-scholarships/', 'scholarship_portal', 'scholarships', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-3001', 'UN Careers Internships Iraq', 'https://careers.un.org/lbw/home.aspx?viewtype=SJ&vacancy=internship', 'un_agency', 'internships', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-3002', 'Coursera Refugee Learning Programs', 'https://www.coursera.org/courseraforrefugees', 'external', 'trainings', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-3003', 'UN Iraq Events', 'https://iraq.un.org/en/latest/events', 'un_agency', 'events', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-3004', 'UN Volunteers Iraq', 'https://www.unv.org/become-volunteer', 'un_agency', 'volunteering', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-3005', 'IIE Fellowships', 'https://www.iie.org/programs/', 'external', 'fellowships', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-3006', 'Devpost Student Competitions', 'https://devpost.com/hackathons', 'external', 'competitions', 'Iraq', 'All Iraq', 'en', 1, 24),
('source-3007', 'Ministry of Higher Education Announcements', 'https://mohesr.gov.iq', 'website', 'announcements', 'Iraq', 'All Iraq', 'ar', 1, 24),
('source-3008', 'Iraqi University Admissions and Registration', 'https://mohesr.gov.iq', 'website', 'registration', 'Iraq', 'All Iraq', 'ar', 1, 24),
('source-3009', 'Iraqi Exams and Results Announcements', 'https://mohesr.gov.iq', 'website', 'exams', 'Iraq', 'All Iraq', 'ar', 1, 24),
('source-3010', 'Iraq Academic Mixed Opportunities', 'https://mohesr.gov.iq', 'website', 'mixed', 'Iraq', 'All Iraq', 'ar', 1, 24);

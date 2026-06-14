-- Jamiaati content population seed

-- Generated at 2026-06-14T11:10:07.601Z



BEGIN TRANSACTION;

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('un-iraq-jobs-official', 'United Nations Iraq Jobs', 'https://iraq.un.org/en/jobs', 'jobs', 1, NULL, NULL);

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('undp-iraq-jobs', 'UNDP Iraq Jobs', 'https://jobs.undp.org', 'jobs', 1, NULL, NULL);

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('reliefweb-iraq-jobs', 'ReliefWeb Iraq Jobs', 'https://reliefweb.int/jobs?advanced-search=%28C104%29', 'jobs', 1, NULL, NULL);

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('ncci-iraq-jobs', 'NCCI Iraq Jobs', 'https://ncciraqjobs.com', 'jobs', 1, NULL, NULL);

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('iom-iraq-careers', 'IOM Iraq Careers', 'https://iraq.iom.int/careers', 'jobs', 1, NULL, NULL);

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('zain-iraq-careers', 'Zain Iraq Careers', 'https://iq.zain.com/en/careers', 'jobs', 1, NULL, NULL);

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('asiacell-careers-official', 'Asiacell Careers', 'https://www.asiacell.com/en/about-us/careers', 'jobs', 1, NULL, NULL);

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('korek-careers', 'Korek Telecom Careers', 'https://www.korektel.com', 'jobs', 1, NULL, NULL);

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('bayt-iraq-jobs', 'Bayt Iraq Jobs', 'https://www.bayt.com/en/iraq/jobs/', 'jobs', 1, NULL, NULL);

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('linkedin-iraq-jobs', 'LinkedIn Iraq Jobs', 'https://www.linkedin.com/jobs/search/?location=Iraq', 'jobs', 1, NULL, NULL);

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('daad-iraq-scholarship-database', 'DAAD Iraq Scholarship Database', 'https://www.daad-iraq.org/en/find-funding/scholarship-database/', 'scholarships', 1, NULL, NULL);

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('chevening-iraq', 'Chevening Iraq Scholarships', 'https://www.chevening.org/scholarships/iraq/', 'scholarships', 1, NULL, NULL);

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('erasmus-mundus-catalogue', 'Erasmus Mundus Joint Masters Catalogue', 'https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en', 'scholarships', 1, NULL, NULL);

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('turkiye-scholarships', 'TÃ¼rkiye Scholarships', 'https://www.turkiyeburslari.gov.tr', 'scholarships', 1, NULL, NULL);

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('mext-japan-iraq', 'MEXT Japan Scholarships Iraq', 'https://www.iraq.emb-japan.go.jp', 'scholarships', 1, NULL, NULL);

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('campus-france-iraq-scholarships', 'Campus France Iraq Scholarships', 'https://www.iraq.campusfrance.org', 'scholarships', 1, NULL, NULL);

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('fulbright-iraq', 'Fulbright Iraq', 'https://iq.usembassy.gov/education-culture/exchange-programs/', 'scholarships', 1, NULL, NULL);

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('study-in-canada-scholarships', 'Study in Canada Scholarships', 'https://www.educanada.ca/scholarships-bourses/index.aspx', 'scholarships', 1, NULL, NULL);

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('opportunity-desk', 'Opportunity Desk', 'https://opportunitydesk.org', 'scholarships', 1, NULL, NULL);

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('for9a-scholarships', 'For9a Scholarships', 'https://www.for9a.com', 'scholarships', 1, NULL, NULL);

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('university-of-baghdad-news', 'University of Baghdad News', 'https://uobaghdad.edu.iq', 'announcements', 1, NULL, NULL);

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('mustansiriyah-university-news', 'Al-Mustansiriya University News', 'https://uomustansiriyah.edu.iq', 'announcements', 1, NULL, NULL);

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('university-of-sulaimani-news', 'University of Sulaimani News', 'https://univsul.edu.iq', 'announcements', 1, NULL, NULL);

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('salahaddin-university-news', 'Salahaddin University News', 'https://su.edu.krd', 'announcements', 1, NULL, NULL);

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('university-of-mosul-news', 'University of Mosul News', 'https://uomosul.edu.iq', 'announcements', 1, NULL, NULL);

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('university-of-basrah-news', 'University of Basrah News', 'https://uobasrah.edu.iq', 'announcements', 1, NULL, NULL);

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('koya-university-news', 'Koya University News', 'https://koyauniversity.org', 'announcements', 1, NULL, NULL);

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('auis-news', 'American University of Iraq Sulaimani News', 'https://auis.edu.krd', 'announcements', 1, NULL, NULL);

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('the-station-iraq-events', 'The Station Iraq Events', 'https://the-station.iq', 'events', 1, NULL, NULL);

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('five-one-labs-events', 'Five One Labs Events and Programs', 'https://fiveonelabs.org', 'events', 1, NULL, NULL);

INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('kapita-iraq-events', 'KAPITA Iraq Events', 'https://kapita.iq', 'events', 1, NULL, NULL);

INSERT OR IGNORE INTO opportunities (
  id,
  titleEN,
  titleAR,
  titleKU,
  contentEN,
  contentAR,
  contentKU,
  organization,
  category,
  country,
  governorateId,
  deadline,
  application_link,
  original_source_url,
  published_date,
  imageUrl,
  status,
  created_at,
  workplaceType,
  whoCanApply,
  salary,
  location,
  savedCount,
  universityAppliedCount,
  companyVerified
)
VALUES (
  'seed-scholarship-daad-iraq',
  'DAAD Scholarship Database for Iraqi Students',
  'Ù‚Ø§Ø¹Ø¯Ø© Ø¨ÙŠØ§Ù†Ø§Øª Ù…Ù†Ø­ DAAD Ù„Ù„Ø·Ù„Ø§Ø¨ Ø§Ù„Ø¹Ø±Ø§Ù‚ÙŠÙŠÙ†',
  'Ø¨Ù†Ú©Û•ÛŒ Ø²Ø§Ù†ÛŒØ§Ø±ÛŒ Ø¨ÙˆØ±Ø³Û•Ú©Ø§Ù†ÛŒ DAAD Ø¨Û† Ù‚ÙˆØªØ§Ø¨ÛŒØ§Ù†ÛŒ Ø¹ÛŽØ±Ø§Ù‚',
  'A trusted scholarship database for Iraqi students, graduates, researchers, and academics looking for study and research funding in Germany. Check the official DAAD page for the exact current deadline and requirements.',
  'Ù‚Ø§Ø¹Ø¯Ø© Ù…ÙˆØ«ÙˆÙ‚Ø© Ù„Ù„Ù…Ù†Ø­ Ø§Ù„Ø¯Ø±Ø§Ø³ÙŠØ© Ù„Ù„Ø·Ù„Ø§Ø¨ ÙˆØ§Ù„Ø®Ø±ÙŠØ¬ÙŠÙ† ÙˆØ§Ù„Ø¨Ø§Ø­Ø«ÙŠÙ† ÙˆØ§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠÙŠÙ† Ø§Ù„Ø¹Ø±Ø§Ù‚ÙŠÙŠÙ† Ø§Ù„Ø±Ø§ØºØ¨ÙŠÙ† Ø¨Ø§Ù„Ø¯Ø±Ø§Ø³Ø© Ø£Ùˆ Ø§Ù„Ø¨Ø­Ø« ÙÙŠ Ø£Ù„Ù…Ø§Ù†ÙŠØ§. ÙŠØ±Ø¬Ù‰ Ù…Ø±Ø§Ø¬Ø¹Ø© ØµÙØ­Ø© DAAD Ø§Ù„Ø±Ø³Ù…ÙŠØ© Ù„Ù…Ø¹Ø±ÙØ© Ø¢Ø®Ø± Ù…ÙˆØ¹Ø¯ ÙˆØ´Ø±ÙˆØ· Ø§Ù„ØªÙ‚Ø¯ÙŠÙ… Ø§Ù„Ø­Ø§Ù„ÙŠØ©.',
  'Ø¨Ù†Ú©Û•ÛŒÛ•Ú©ÛŒ Ø¨Ø§ÙˆÛ•Ú•Ù¾ÛŽÚ©Ø±Ø§Ùˆ Ø¨Û† Ø¨ÙˆØ±Ø³Û•Ú©Ø§Ù†ÛŒ Ù‚ÙˆØªØ§Ø¨ÛŒØ§Ù†ØŒ Ø¯Û•Ø±Ú†ÙˆÙˆØ§Ù†ØŒ ØªÙˆÛŽÚ˜Û•Ø±Ø§Ù† Ùˆ Ø¦Û•Ú©Ø§Ø¯ÛŒÙ…ÛŒÛŒÛ• Ø¹ÛŽØ±Ø§Ù‚ÛŒÛŒÛ•Ú©Ø§Ù† Ø¨Û† Ø®ÙˆÛŽÙ†Ø¯Ù† Ùˆ ØªÙˆÛŽÚ˜ÛŒÙ†Û•ÙˆÛ• Ù„Û• Ø¦Û•ÚµÙ…Ø§Ù†ÛŒØ§. ØªÚ©Ø§ÛŒÛ• Ù¾Û•Ú•Û•ÛŒ ÙÛ•Ø±Ù…ÛŒ DAAD Ø¨Ø¨ÛŒÙ†Û• Ø¨Û† Ø¯ÙˆØ§ ÙˆØ§Ø¯Û• Ùˆ Ù…Û•Ø±Ø¬Û•Ú©Ø§Ù†.',
  'DAAD Iraq',
  'scholarship',
  'Germany',
  'all',
  'Check official website',
  'https://www.daad-iraq.org/en/find-funding/scholarship-database/',
  'https://www.daad-iraq.org/en/find-funding/scholarship-database/',
  '2026-06-14T11:10:07.601Z',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=900',
  'pending_review',
  '2026-06-14T11:10:07.601Z',
  'Study abroad',
  'Iraqi students, graduates, researchers, and academics',
  '',
  'Germany',
  0,
  0,
  1
);

INSERT OR IGNORE INTO opportunities (
  id,
  titleEN,
  titleAR,
  titleKU,
  contentEN,
  contentAR,
  contentKU,
  organization,
  category,
  country,
  governorateId,
  deadline,
  application_link,
  original_source_url,
  published_date,
  imageUrl,
  status,
  created_at,
  workplaceType,
  whoCanApply,
  salary,
  location,
  savedCount,
  universityAppliedCount,
  companyVerified
)
VALUES (
  'seed-scholarship-chevening-iraq',
  'Chevening Scholarships for Iraq',
  'Ù…Ù†Ø­ ØªØ´ÙŠÙÙ†ÙŠÙ†Øº Ù„Ù„Ø¹Ø±Ø§Ù‚',
  'Ø¨ÙˆØ±Ø³ÛŒ Chevening Ø¨Û† Ø¹ÛŽØ±Ø§Ù‚',
  'A major UK scholarship route for future leaders from Iraq to study a one-year master''s degree. Applicants should always check the official Chevening Iraq page for the current cycle dates and eligibility details.',
  'Ù…Ø³Ø§Ø± Ù…Ù‡Ù… Ù„Ù„Ù…Ù†Ø­ Ø§Ù„Ø¨Ø±ÙŠØ·Ø§Ù†ÙŠØ© Ù„Ù‚Ø§Ø¯Ø© Ø§Ù„Ù…Ø³ØªÙ‚Ø¨Ù„ Ù…Ù† Ø§Ù„Ø¹Ø±Ø§Ù‚ Ù„Ø¯Ø±Ø§Ø³Ø© Ø§Ù„Ù…Ø§Ø¬Ø³ØªÙŠØ± Ù„Ù…Ø¯Ø© Ø³Ù†Ø© ÙˆØ§Ø­Ø¯Ø©. ÙŠØ¬Ø¨ Ø¯Ø§Ø¦Ù…Ø§Ù‹ Ù…Ø±Ø§Ø¬Ø¹Ø© ØµÙØ­Ø© ØªØ´ÙŠÙÙ†ÙŠÙ†Øº Ø§Ù„Ø±Ø³Ù…ÙŠØ© Ù„Ù„Ø¹Ø±Ø§Ù‚ Ù„Ù…Ø¹Ø±ÙØ© Ù…ÙˆØ§Ø¹ÙŠØ¯ Ø§Ù„Ø¯ÙˆØ±Ø© Ø§Ù„Ø­Ø§Ù„ÙŠØ© ÙˆØ´Ø±ÙˆØ· Ø§Ù„Ø£Ù‡Ù„ÙŠØ©.',
  'Ú•ÛŽÚ¯Ø§ÛŒÛ•Ú©ÛŒ Ú¯Ø±Ù†Ú¯ÛŒ Ø¨ÙˆØ±Ø³ÛŒ Ø¨Û•Ø±ÛŒØªØ§Ù†ÛŒØ§Ø³Øª Ø¨Û† Ú•Ø§Ø¨Û•Ø±Ø§Ù†ÛŒ Ø¯Ø§Ù‡Ø§ØªÙˆÙˆÛŒ Ø¹ÛŽØ±Ø§Ù‚ Ø¨Û† Ø®ÙˆÛŽÙ†Ø¯Ù†ÛŒ Ù…Ø§Ø³ØªÛ•Ø± Ø¨Û† Ù…Ø§ÙˆÛ•ÛŒ Ø³Ø§ÚµÛŽÚ©. Ù‡Û•Ù…ÛŒØ´Û• Ù¾Û•Ú•Û•ÛŒ ÙÛ•Ø±Ù…ÛŒ Chevening Iraq Ø¨Ù¾Ø´Ú©Ù†Û• Ø¨Û† ÙˆØ§Ø¯Û• Ùˆ Ù…Û•Ø±Ø¬Û• Ù†ÙˆÛŽÛŒÛ•Ú©Ø§Ù†.',
  'Chevening',
  'scholarship',
  'United Kingdom',
  'all',
  'Check official website',
  'https://www.chevening.org/scholarships/iraq/',
  'https://www.chevening.org/scholarships/iraq/',
  '2026-06-14T11:10:07.601Z',
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=900',
  'pending_review',
  '2026-06-14T11:10:07.601Z',
  'Study abroad',
  'Eligible Iraqi applicants for master''s study',
  '',
  'United Kingdom',
  0,
  0,
  1
);

INSERT OR IGNORE INTO opportunities (
  id,
  titleEN,
  titleAR,
  titleKU,
  contentEN,
  contentAR,
  contentKU,
  organization,
  category,
  country,
  governorateId,
  deadline,
  application_link,
  original_source_url,
  published_date,
  imageUrl,
  status,
  created_at,
  workplaceType,
  whoCanApply,
  salary,
  location,
  savedCount,
  universityAppliedCount,
  companyVerified
)
VALUES (
  'seed-scholarship-erasmus-mundus',
  'Erasmus Mundus Joint Masters Scholarships',
  'Ù…Ù†Ø­ Ø¥ÙŠØ±Ø§Ø³Ù…ÙˆØ³ Ù…ÙˆÙ†Ø¯ÙˆØ³ Ù„Ù„Ù…Ø§Ø¬Ø³ØªÙŠØ± Ø§Ù„Ù…Ø´ØªØ±Ùƒ',
  'Ø¨ÙˆØ±Ø³ÛŒ Erasmus Mundus Ø¨Û† Ù…Ø§Ø³ØªÛ•Ø±ÛŒ Ù‡Ø§ÙˆØ¨Û•Ø´',
  'A popular European scholarship path for international students, including Iraqi applicants, through selected joint master''s programs. Students should browse the official catalogue and check each program''s deadline.',
  'Ù…Ø³Ø§Ø± Ø£ÙˆØ±ÙˆØ¨ÙŠ Ù…Ø´Ù‡ÙˆØ± Ù„Ù„Ù…Ù†Ø­ Ù„Ù„Ø·Ù„Ø§Ø¨ Ø§Ù„Ø¯ÙˆÙ„ÙŠÙŠÙ†ØŒ ÙˆÙ…Ù† Ø¶Ù…Ù†Ù‡Ù… Ø§Ù„Ù…ØªÙ‚Ø¯Ù…ÙˆÙ† Ù…Ù† Ø§Ù„Ø¹Ø±Ø§Ù‚ØŒ Ø¹Ø¨Ø± Ø¨Ø±Ø§Ù…Ø¬ Ù…Ø§Ø¬Ø³ØªÙŠØ± Ù…Ø´ØªØ±ÙƒØ© Ù…Ø®ØªØ§Ø±Ø©. ÙŠØ¬Ø¨ ØªØµÙØ­ Ø§Ù„ÙÙ‡Ø±Ø³ Ø§Ù„Ø±Ø³Ù…ÙŠ ÙˆÙ…Ø±Ø§Ø¬Ø¹Ø© Ù…ÙˆØ¹Ø¯ ÙƒÙ„ Ø¨Ø±Ù†Ø§Ù…Ø¬.',
  'Ú•ÛŽÚ¯Ø§ÛŒÛ•Ú©ÛŒ Ù†Ø§Ø³Ø±Ø§ÙˆÛŒ Ø¦Û•ÙˆØ±ÙˆÙˆÙ¾ÛŒÛŒÛ• Ø¨Û† Ø®ÙˆÛŽÙ†Ø¯Ú©Ø§Ø±Ø§Ù†ÛŒ Ù†ÛŽÙˆØ¯Û•ÙˆÚµÛ•ØªÛŒØŒ Ø¨Û• Ù‚ÙˆØªØ§Ø¨ÛŒØ§Ù†ÛŒ Ø¹ÛŽØ±Ø§Ù‚ÛŒØ´Û•ÙˆÛ•ØŒ Ù„Û• Ú•ÛŽÚ¯Û•ÛŒ Ø¨Û•Ø±Ù†Ø§Ù…Û•Ú©Ø§Ù†ÛŒ Ù…Ø§Ø³ØªÛ•Ø±ÛŒ Ù‡Ø§ÙˆØ¨Û•Ø´. Ù‚ÙˆØªØ§Ø¨ÛŒ Ø¯Û•Ø¨ÛŽØª Ú©Ø§ØªÛ•Ù„Û†Ú¯ÛŒ ÙÛ•Ø±Ù…ÛŒ Ø¨Ø¨ÛŒÙ†ÛŽØª Ùˆ Ø¯ÙˆØ§ ÙˆØ§Ø¯Û•ÛŒ Ù‡Û•Ø± Ø¨Û•Ø±Ù†Ø§Ù…Û•ÛŒÛ•Ú© Ø¨Ù¾Ø´Ú©Ù†ÛŽØª.',
  'European Union',
  'scholarship',
  'Europe',
  'all',
  'Depends on selected program',
  'https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en',
  'https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en',
  '2026-06-14T11:10:07.601Z',
  'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=900',
  'pending_review',
  '2026-06-14T11:10:07.601Z',
  'Study abroad',
  'International students applying to eligible joint master''s programs',
  '',
  'Europe',
  0,
  0,
  1
);

INSERT OR IGNORE INTO opportunities (
  id,
  titleEN,
  titleAR,
  titleKU,
  contentEN,
  contentAR,
  contentKU,
  organization,
  category,
  country,
  governorateId,
  deadline,
  application_link,
  original_source_url,
  published_date,
  imageUrl,
  status,
  created_at,
  workplaceType,
  whoCanApply,
  salary,
  location,
  savedCount,
  universityAppliedCount,
  companyVerified
)
VALUES (
  'seed-scholarship-turkiye',
  'TÃ¼rkiye Scholarships',
  'Ù…Ù†Ø­ ØªØ±ÙƒÙŠØ§',
  'Ø¨ÙˆØ±Ø³ÛŒ ØªÙˆØ±Ú©ÛŒØ§',
  'Government-funded scholarships for international students at multiple study levels. Iraqi students should check the official portal for the current application cycle, programs, and eligibility.',
  'Ù…Ù†Ø­ Ù…Ù…ÙˆÙ„Ø© Ù…Ù† Ø§Ù„Ø­ÙƒÙˆÙ…Ø© Ø§Ù„ØªØ±ÙƒÙŠØ© Ù„Ù„Ø·Ù„Ø§Ø¨ Ø§Ù„Ø¯ÙˆÙ„ÙŠÙŠÙ† ÙÙŠ Ø¹Ø¯Ø© Ù…Ø³ØªÙˆÙŠØ§Øª Ø¯Ø±Ø§Ø³ÙŠØ©. Ø¹Ù„Ù‰ Ø§Ù„Ø·Ù„Ø§Ø¨ Ø§Ù„Ø¹Ø±Ø§Ù‚ÙŠÙŠÙ† Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„Ø±Ø³Ù…ÙŠØ© Ù„Ù…Ø¹Ø±ÙØ© Ø¯ÙˆØ±Ø© Ø§Ù„ØªÙ‚Ø¯ÙŠÙ… Ø§Ù„Ø­Ø§Ù„ÙŠØ© ÙˆØ§Ù„Ø¨Ø±Ø§Ù…Ø¬ ÙˆØ§Ù„Ø´Ø±ÙˆØ·.',
  'Ø¨ÙˆØ±Ø³ÛŒÛŒÛ•Ú©ÛŒ Ø­Ú©ÙˆÙ…ÛŒ ØªÙˆØ±Ú©ÛŒØ§ÛŒÛ• Ø¨Û† Ø®ÙˆÛŽÙ†Ø¯Ú©Ø§Ø±Ø§Ù†ÛŒ Ù†ÛŽÙˆØ¯Û•ÙˆÚµÛ•ØªÛŒ Ù„Û• Ú†Û•Ù†Ø¯ Ø¦Ø§Ø³ØªÛŽÚ©ÛŒ Ø®ÙˆÛŽÙ†Ø¯Ù†. Ù‚ÙˆØªØ§Ø¨ÛŒØ§Ù†ÛŒ Ø¹ÛŽØ±Ø§Ù‚ Ù¾ÛŽÙˆÛŒØ³ØªÛ• Ù¾Û†Ø±ØªØ§ÚµÛŒ ÙÛ•Ø±Ù…ÛŒ Ø¨Ø¨ÛŒÙ†Ù† Ø¨Û† Ø®ÙˆÙ„ÛŒ Ù†ÙˆÛŽÛŒ Ù¾ÛŽØ´Ú©Û•Ø´Ú©Ø±Ø¯Ù† Ùˆ Ø¨Û•Ø±Ù†Ø§Ù…Û• Ùˆ Ù…Û•Ø±Ø¬Û•Ú©Ø§Ù†.',
  'TÃ¼rkiye Scholarships',
  'scholarship',
  'Turkey',
  'all',
  'Check official website',
  'https://www.turkiyeburslari.gov.tr',
  'https://www.turkiyeburslari.gov.tr',
  '2026-06-14T11:10:07.601Z',
  'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&q=80&w=900',
  'pending_review',
  '2026-06-14T11:10:07.601Z',
  'Study abroad',
  'International students, including Iraqi applicants',
  '',
  'Turkey',
  0,
  0,
  1
);

INSERT OR IGNORE INTO opportunities (
  id,
  titleEN,
  titleAR,
  titleKU,
  contentEN,
  contentAR,
  contentKU,
  organization,
  category,
  country,
  governorateId,
  deadline,
  application_link,
  original_source_url,
  published_date,
  imageUrl,
  status,
  created_at,
  workplaceType,
  whoCanApply,
  salary,
  location,
  savedCount,
  universityAppliedCount,
  companyVerified
)
VALUES (
  'seed-scholarship-campus-france-iraq',
  'Campus France Iraq Scholarships and Study Routes',
  'Ù…Ù†Ø­ ÙˆÙ…Ø³Ø§Ø±Ø§Øª Ø§Ù„Ø¯Ø±Ø§Ø³Ø© Ø¹Ø¨Ø± ÙƒØ§Ù…Ø¨ÙˆØ³ ÙØ±Ø§Ù†Ø³ Ø§Ù„Ø¹Ø±Ø§Ù‚',
  'Ø¨ÙˆØ±Ø³ Ùˆ Ú•ÛŽÚ¯Ø§Ú©Ø§Ù†ÛŒ Ø®ÙˆÛŽÙ†Ø¯Ù† Ù„Û• Ú•ÛŽÚ¯Û•ÛŒ Campus France Iraq',
  'A useful route for Iraqi students exploring study in France, scholarship information, and admission guidance. Students should check the official Campus France Iraq site for updated calls.',
  'Ù…Ø³Ø§Ø± Ù…ÙÙŠØ¯ Ù„Ù„Ø·Ù„Ø§Ø¨ Ø§Ù„Ø¹Ø±Ø§Ù‚ÙŠÙŠÙ† Ø§Ù„Ø±Ø§ØºØ¨ÙŠÙ† Ø¨Ø§Ù„Ø¯Ø±Ø§Ø³Ø© ÙÙŠ ÙØ±Ù†Ø³Ø§ØŒ ÙˆÙ…Ø¹Ø±ÙØ© Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ù…Ù†Ø­ ÙˆØ§Ù„Ø¥Ø±Ø´Ø§Ø¯Ø§Øª. ÙŠØ¬Ø¨ Ù…Ø±Ø§Ø¬Ø¹Ø© Ù…ÙˆÙ‚Ø¹ ÙƒØ§Ù…Ø¨ÙˆØ³ ÙØ±Ø§Ù†Ø³ Ø§Ù„Ø¹Ø±Ø§Ù‚ Ø§Ù„Ø±Ø³Ù…ÙŠ Ù„Ù…Ø¹Ø±ÙØ© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø©.',
  'Ú•ÛŽÚ¯Ø§ÛŒÛ•Ú©ÛŒ Ø¨Ø§Ø´Û• Ø¨Û† Ù‚ÙˆØªØ§Ø¨ÛŒØ§Ù†ÛŒ Ø¹ÛŽØ±Ø§Ù‚ Ú©Û• Ø¯Û•ØªÛ•ÙˆÛŽØª Ù„Û• ÙÛ•Ø±Û•Ù†Ø³Ø§ Ø¨Ø®ÙˆÛŽÙ†Ù† Ùˆ Ø²Ø§Ù†ÛŒØ§Ø±ÛŒÛŒ Ø¨ÙˆØ±Ø³ Ùˆ ÙˆÛ•Ø±Ú¯Ø±ØªÙ† ÙˆÛ•Ø±Ø¨Ú¯Ø±Ù†. ØªÚ©Ø§ÛŒÛ• Ù…Ø§ÚµÙ¾Û•Ú•ÛŒ ÙÛ•Ø±Ù…ÛŒ Campus France Iraq Ø¨Ø¨ÛŒÙ†Ù† Ø¨Û† Ø¨Ø§Ù†Ú¯Û•ÙˆØ§Ø²Û• Ù†ÙˆÛŽÛŒÛ•Ú©Ø§Ù†.',
  'Campus France Iraq',
  'scholarship',
  'France',
  'all',
  'Check official website',
  'https://www.iraq.campusfrance.org',
  'https://www.iraq.campusfrance.org',
  '2026-06-14T11:10:07.601Z',
  'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=900',
  'pending_review',
  '2026-06-14T11:10:07.601Z',
  'Study abroad',
  'Iraqi students interested in France study routes',
  '',
  'France',
  0,
  0,
  1
);

INSERT OR IGNORE INTO opportunities (
  id,
  titleEN,
  titleAR,
  titleKU,
  contentEN,
  contentAR,
  contentKU,
  organization,
  category,
  country,
  governorateId,
  deadline,
  application_link,
  original_source_url,
  published_date,
  imageUrl,
  status,
  created_at,
  workplaceType,
  whoCanApply,
  salary,
  location,
  savedCount,
  universityAppliedCount,
  companyVerified
)
VALUES (
  'seed-social-campus-welcome-english',
  'Welcome to the Campus Life Wall',
  'Ø£Ù‡Ù„Ø§Ù‹ Ø¨Ùƒ ÙÙŠ Ø³Ø§Ø­Ø© Ø§Ù„Ø­ÙŠØ§Ø© Ø§Ù„Ø¬Ø§Ù…Ø¹ÙŠØ©',
  'Ø¨Û•Ø®ÛŽØ±Ø¨ÛŽÛŒØª Ø¨Û† Ø¯ÛŒÙˆØ§Ø±ÛŒ Ú˜ÛŒØ§Ù†ÛŒ Ø²Ø§Ù†Ú©Û†',
  'This is a starter social post until students begin posting their real campus questions, photos, study groups, and daily university updates. The goal is to keep the app warm without pretending this is official news.',
  'Ù‡Ø°Ø§ Ù…Ù†Ø´ÙˆØ± Ø§Ø¬ØªÙ…Ø§Ø¹ÙŠ ØªØ¬Ø±ÙŠØ¨ÙŠ Ø¥Ù„Ù‰ Ø£Ù† ÙŠØ¨Ø¯Ø£ Ø§Ù„Ø·Ù„Ø§Ø¨ Ø¨Ù†Ø´Ø± Ø£Ø³Ø¦Ù„ØªÙ‡Ù… ÙˆØµÙˆØ±Ù‡Ù… ÙˆÙ…Ø¬Ù…ÙˆØ¹Ø§Øª Ø§Ù„Ø¯Ø±Ø§Ø³Ø© ÙˆØªØ­Ø¯ÙŠØ«Ø§ØªÙ‡Ù… Ø§Ù„ÙŠÙˆÙ…ÙŠØ©. Ø§Ù„Ù‡Ø¯Ù Ù‡Ùˆ Ø¬Ø¹Ù„ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚ Ø­ÙŠÙ‘Ø§Ù‹ Ø¯ÙˆÙ† Ø§Ø¯Ø¹Ø§Ø¡ Ø£Ù†Ù‡ Ø®Ø¨Ø± Ø±Ø³Ù…ÙŠ.',
  'Ø¦Û•Ù…Û• Ù¾Û†Ø³ØªÛŽÚ©ÛŒ Ú©Û†Ù…Û•ÚµØ§ÛŒÛ•ØªÛŒ Ø³Û•Ø±Û•ØªØ§ÛŒÛŒÛ• ØªØ§ Ù‚ÙˆØªØ§Ø¨ÛŒØ§Ù† Ø¯Û•Ø³Øª Ø¨Ú©Û•Ù† Ø¨Û• Ø¨ÚµØ§ÙˆÚ©Ø±Ø¯Ù†Û•ÙˆÛ•ÛŒ Ù¾Ø±Ø³ÛŒØ§Ø±ØŒ ÙˆÛŽÙ†Û•ØŒ Ú¯Ø±ÙˆÙ¾ÛŒ Ø®ÙˆÛŽÙ†Ø¯Ù† Ùˆ Ù†ÙˆÛŽÚ©Ø§Ø±ÛŒÛŒÛ•Ú©Ø§Ù†ÛŒ Ø²Ø§Ù†Ú©Û†. Ø¦Ø§Ù…Ø§Ù†Ø¬ Ø¦Û•ÙˆÛ•ÛŒÛ• Ø¦Û•Ù¾Û•Ú©Û• Ø²ÛŒÙ†Ø¯ÙˆÙˆ Ø¨ÛŽØª Ø¨Û•Ø¨ÛŽ Ø¦Û•ÙˆÛ•ÛŒ ÙˆÛ•Ú© Ù‡Û•ÙˆØ§ÚµÛŒ ÙÛ•Ø±Ù…ÛŒ Ù¾ÛŒØ´Ø§Ù† Ø¨Ø¯Ø±ÛŽØª.',
  'Jamiaati Campus Life',
  'activity',
  'Iraq',
  'all',
  '',
  'https://https-github-com-mahdialmuntadhar1-rgb-studenthub-plus.pages.dev',
  'internal-demo-campus-life',
  '2026-06-14T11:10:07.601Z',
  'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&q=80&w=900',
  'pending_review',
  '2026-06-14T11:10:07.601Z',
  'Campus Life',
  'Students, graduates, teachers, and staff',
  '',
  'All Iraq',
  0,
  0,
  1
);

INSERT OR IGNORE INTO opportunities (
  id,
  titleEN,
  titleAR,
  titleKU,
  contentEN,
  contentAR,
  contentKU,
  organization,
  category,
  country,
  governorateId,
  deadline,
  application_link,
  original_source_url,
  published_date,
  imageUrl,
  status,
  created_at,
  workplaceType,
  whoCanApply,
  salary,
  location,
  savedCount,
  universityAppliedCount,
  companyVerified
)
VALUES (
  'seed-social-study-group-demo',
  'Looking for study partners this week?',
  'Ù‡Ù„ ØªØ¨Ø­Ø« Ø¹Ù† Ø²Ù…Ù„Ø§Ø¡ Ù„Ù„Ø¯Ø±Ø§Ø³Ø© Ù‡Ø°Ø§ Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ØŸ',
  'Ø¦Û•Ù… Ù‡Û•ÙØªÛ•ÛŒÛ• Ù‡Ø§ÙˆÚ•ÛŽÛŒ Ø®ÙˆÛŽÙ†Ø¯Ù† Ø¯Û•Ú¯Û•Ú•ÛŽÛŒØªØŸ',
  'A sample campus-life post encouraging students to create study groups, ask questions, and share helpful notes. This can be replaced by real user posts once the app grows.',
  'Ù…Ù†Ø´ÙˆØ± ØªØ¬Ø±ÙŠØ¨ÙŠ Ù…Ù† Ø§Ù„Ø­ÙŠØ§Ø© Ø§Ù„Ø¬Ø§Ù…Ø¹ÙŠØ© ÙŠØ´Ø¬Ø¹ Ø§Ù„Ø·Ù„Ø§Ø¨ Ø¹Ù„Ù‰ Ø¥Ù†Ø´Ø§Ø¡ Ù…Ø¬Ù…ÙˆØ¹Ø§Øª Ø¯Ø±Ø§Ø³Ø© ÙˆØ·Ø±Ø­ Ø§Ù„Ø£Ø³Ø¦Ù„Ø© ÙˆÙ…Ø´Ø§Ø±ÙƒØ© Ø§Ù„Ù…Ù„Ø§Ø²Ù… Ø§Ù„Ù…ÙÙŠØ¯Ø©. ÙŠÙ…ÙƒÙ† Ø§Ø³ØªØ¨Ø¯Ø§Ù„Ù‡ Ø¨Ù…Ù†Ø´ÙˆØ±Ø§Øª Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ù„Ø§Ø­Ù‚Ø§Ù‹.',
  'Ù¾Û†Ø³ØªÛŽÚ©ÛŒ Ù†Ù…ÙˆÙˆÙ†Û•ÛŒÛŒÛ• Ø¨Û† Ú˜ÛŒØ§Ù†ÛŒ Ø²Ø§Ù†Ú©Û† Ú©Û• Ù‚ÙˆØªØ§Ø¨ÛŒØ§Ù† Ù‡Ø§Ù†Ø¯Û•Ø¯Ø§Øª Ú¯Ø±ÙˆÙ¾ÛŒ Ø®ÙˆÛŽÙ†Ø¯Ù† Ø¯Ø±ÙˆØ³Øª Ø¨Ú©Û•Ù†ØŒ Ù¾Ø±Ø³ÛŒØ§Ø± Ø¨Ú©Û•Ù† Ùˆ ØªÛŽØ¨ÛŒÙ†ÛŒÛŒÛ• Ø¨Û•Ø³ÙˆÙˆØ¯Û•Ú©Ø§Ù† Ù‡Ø§ÙˆØ¨Û•Ø´ Ø¨Ú©Û•Ù†. Ø¯ÙˆØ§ØªØ± Ø¯Û•ØªÙˆØ§Ù†Ø±ÛŽØª Ø¨Û• Ù¾Û†Ø³ØªÛŒ Ú•Ø§Ø³ØªÛ•Ù‚ÛŒÙ†Û•ÛŒ Ø¨Û•Ú©Ø§Ø±Ù‡ÛŽÙ†Û•Ø±Ø§Ù† Ø¨Ú¯Û†Ú•Ø¯Ø±ÛŽØª.',
  'Jamiaati Campus Life',
  'student_club',
  'Iraq',
  'all',
  '',
  'https://https-github-com-mahdialmuntadhar1-rgb-studenthub-plus.pages.dev',
  'internal-demo-study-group',
  '2026-06-14T11:10:07.601Z',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=900',
  'pending_review',
  '2026-06-14T11:10:07.601Z',
  'Campus Life',
  'Students',
  '',
  'All Iraq',
  0,
  0,
  1
);

COMMIT;


-- Phase 3 approved dry-run insertion.
-- Inserts reviewed real-source items as pending_review only.
-- Guarded with duplicate_key/source_url/apply_url/title+organization NOT EXISTS checks.
-- source_id is NULL because dry-run source labels are not guaranteed FK rows.

INSERT INTO opportunity_candidates (
  id, source_id, title, organization, category, description, summary, eligibility, deadline, published_date, apply_url, source_url, image_url, country, governorate, city, language, salary_or_funding, confidence_score, duplicate_key, status, rejection_reason, created_at, updated_at
)
SELECT
  'phase3-mohesr-study-in-iraq-2026', NULL, 'التعليم تطلق النسخة الرابعة من برنامج ادرس في العراق لاستقطاب الطلبة الدوليين', 'Iraq Ministry of Higher Education and Scientific Research', 'scholarship',
  'Official announcement for the fourth Study in Iraq programme for 2026/2027. The source states postgraduate applications are available until July 2026 and undergraduate applications until September 2026; admin should confirm exact closing days before approval.', 'Official announcement for the fourth Study in Iraq programme for 2026/2027. The source states postgraduate applications are available until July 2026 and undergraduate applications until September 2026; admin should confirm exact closing days before approval.', NULL, '2026-07-31', '2026-05-04',
  'https://studyiniraq.scrd-gate.gov.iq/', 'https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B7%D9%84%D9%82-%D8%A7%D9%84%D9%86%D8%B3%D8%AE%D8%A9-%D8%A7%D9%84%D8%B1%D8%A7%D8%A8%D8%B9%D8%A9-%D9%85%D9%86-%D8%A8%D8%B1%D9%86%D8%A7%D9%85%D8%AC-%D8%A7%D8%AF%D8%B1%D8%B3-%D9%81%D9%8A-%D8%A7%D9%84%D8%B9%D8%B1%D8%A7%D9%82-%D9%84%D8%A7%D8%B3%D8%AA%D9%82%D8%B7%D8%A7%D8%A8-%D8%A7%D9%84%D8%B7%D9%84%D8%A8%D8%A9-%D8%A7%D9%84%D8%AF%D9%88%D9%84%D9%8A%D9%8A%D9%86-2026-05-04-12', NULL, 'Iraq', NULL, NULL,
  'ar', NULL, 88, 'fe1ad2b33b63d24262f2d6f606c6fc45baff0bbf809762ba66c32eeb8a37ad06', 'pending_review', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase3-mohesr-study-in-iraq-2026' OR duplicate_key = 'fe1ad2b33b63d24262f2d6f606c6fc45baff0bbf809762ba66c32eeb8a37ad06' OR source_url = 'https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B7%D9%84%D9%82-%D8%A7%D9%84%D9%86%D8%B3%D8%AE%D8%A9-%D8%A7%D9%84%D8%B1%D8%A7%D8%A8%D8%B9%D8%A9-%D9%85%D9%86-%D8%A8%D8%B1%D9%86%D8%A7%D9%85%D8%AC-%D8%A7%D8%AF%D8%B1%D8%B3-%D9%81%D9%8A-%D8%A7%D9%84%D8%B9%D8%B1%D8%A7%D9%82-%D9%84%D8%A7%D8%B3%D8%AA%D9%82%D8%B7%D8%A7%D8%A8-%D8%A7%D9%84%D8%B7%D9%84%D8%A8%D8%A9-%D8%A7%D9%84%D8%AF%D9%88%D9%84%D9%8A%D9%8A%D9%86-2026-05-04-12' OR apply_url = 'https://studyiniraq.scrd-gate.gov.iq/' OR (title = 'التعليم تطلق النسخة الرابعة من برنامج ادرس في العراق لاستقطاب الطلبة الدوليين' AND organization = 'Iraq Ministry of Higher Education and Scientific Research'))
  AND NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase3-mohesr-study-in-iraq-2026' OR duplicate_key = 'fe1ad2b33b63d24262f2d6f606c6fc45baff0bbf809762ba66c32eeb8a37ad06' OR source_url = 'https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B7%D9%84%D9%82-%D8%A7%D9%84%D9%86%D8%B3%D8%AE%D8%A9-%D8%A7%D9%84%D8%B1%D8%A7%D8%A8%D8%B9%D8%A9-%D9%85%D9%86-%D8%A8%D8%B1%D9%86%D8%A7%D9%85%D8%AC-%D8%A7%D8%AF%D8%B1%D8%B3-%D9%81%D9%8A-%D8%A7%D9%84%D8%B9%D8%B1%D8%A7%D9%82-%D9%84%D8%A7%D8%B3%D8%AA%D9%82%D8%B7%D8%A7%D8%A8-%D8%A7%D9%84%D8%B7%D9%84%D8%A8%D8%A9-%D8%A7%D9%84%D8%AF%D9%88%D9%84%D9%8A%D9%8A%D9%86-2026-05-04-12' OR apply_url = 'https://studyiniraq.scrd-gate.gov.iq/' OR (title = 'التعليم تطلق النسخة الرابعة من برنامج ادرس في العراق لاستقطاب الطلبة الدوليين' AND organization = 'Iraq Ministry of Higher Education and Scientific Research'));

INSERT INTO opportunity_candidates (
  id, source_id, title, organization, category, description, summary, eligibility, deadline, published_date, apply_url, source_url, image_url, country, governorate, city, language, salary_or_funding, confidence_score, duplicate_key, status, rejection_reason, created_at, updated_at
)
SELECT
  'phase3-mohesr-india-sobhit-2026', NULL, 'منح دراسية هندية من Sobhit Institute of Engineering & Technology للعام الدراسي 2026-2027', 'Iraq Ministry of Higher Education and Scientific Research', 'scholarship',
  'Official ministry announcement for Indian scholarships. The page states Sobhit Institute of Engineering & Technology applications close on 2026-08-02.', 'Official ministry announcement for Indian scholarships. The page states Sobhit Institute of Engineering & Technology applications close on 2026-08-02.', NULL, '2026-08-02', '2026-04-09',
  'https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B9%D9%84%D9%86-%D8%AA%D9%88%D9%81%D8%B1-%D9%85%D9%86%D8%AD-%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A%D8%A9-%D9%87%D9%86%D8%AF%D9%8A%D8%A9-%D9%85%D8%AE%D8%B5%D8%B5%D8%A9-%D9%84%D9%84%D8%A3%D9%88%D9%84%D9%8A%D8%A9-%D9%88%D8%A7%D9%84%D8%B9%D9%84%D9%8A%D8%A7-2026-04-09-09', 'https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B9%D9%84%D9%86-%D8%AA%D9%88%D9%81%D8%B1-%D9%85%D9%86%D8%AD-%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A%D8%A9-%D9%87%D9%86%D8%AF%D9%8A%D8%A9-%D9%85%D8%AE%D8%B5%D8%B5%D8%A9-%D9%84%D9%84%D8%A3%D9%88%D9%84%D9%8A%D8%A9-%D9%88%D8%A7%D9%84%D8%B9%D9%84%D9%8A%D8%A7-2026-04-09-09', NULL, 'Iraq', NULL, NULL,
  'ar', NULL, 90, 'c7acbdedf05b4a71efa6cbabe0ca2d6017e428286787f7c6c597a99f8559041e', 'pending_review', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase3-mohesr-india-sobhit-2026' OR duplicate_key = 'c7acbdedf05b4a71efa6cbabe0ca2d6017e428286787f7c6c597a99f8559041e' OR source_url = 'https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B9%D9%84%D9%86-%D8%AA%D9%88%D9%81%D8%B1-%D9%85%D9%86%D8%AD-%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A%D8%A9-%D9%87%D9%86%D8%AF%D9%8A%D8%A9-%D9%85%D8%AE%D8%B5%D8%B5%D8%A9-%D9%84%D9%84%D8%A3%D9%88%D9%84%D9%8A%D8%A9-%D9%88%D8%A7%D9%84%D8%B9%D9%84%D9%8A%D8%A7-2026-04-09-09' OR apply_url = 'https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B9%D9%84%D9%86-%D8%AA%D9%88%D9%81%D8%B1-%D9%85%D9%86%D8%AD-%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A%D8%A9-%D9%87%D9%86%D8%AF%D9%8A%D8%A9-%D9%85%D8%AE%D8%B5%D8%B5%D8%A9-%D9%84%D9%84%D8%A3%D9%88%D9%84%D9%8A%D8%A9-%D9%88%D8%A7%D9%84%D8%B9%D9%84%D9%8A%D8%A7-2026-04-09-09' OR (title = 'منح دراسية هندية من Sobhit Institute of Engineering & Technology للعام الدراسي 2026-2027' AND organization = 'Iraq Ministry of Higher Education and Scientific Research'))
  AND NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase3-mohesr-india-sobhit-2026' OR duplicate_key = 'c7acbdedf05b4a71efa6cbabe0ca2d6017e428286787f7c6c597a99f8559041e' OR source_url = 'https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B9%D9%84%D9%86-%D8%AA%D9%88%D9%81%D8%B1-%D9%85%D9%86%D8%AD-%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A%D8%A9-%D9%87%D9%86%D8%AF%D9%8A%D8%A9-%D9%85%D8%AE%D8%B5%D8%B5%D8%A9-%D9%84%D9%84%D8%A3%D9%88%D9%84%D9%8A%D8%A9-%D9%88%D8%A7%D9%84%D8%B9%D9%84%D9%8A%D8%A7-2026-04-09-09' OR apply_url = 'https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B9%D9%84%D9%86-%D8%AA%D9%88%D9%81%D8%B1-%D9%85%D9%86%D8%AD-%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A%D8%A9-%D9%87%D9%86%D8%AF%D9%8A%D8%A9-%D9%85%D8%AE%D8%B5%D8%B5%D8%A9-%D9%84%D9%84%D8%A3%D9%88%D9%84%D9%8A%D8%A9-%D9%88%D8%A7%D9%84%D8%B9%D9%84%D9%8A%D8%A7-2026-04-09-09' OR (title = 'منح دراسية هندية من Sobhit Institute of Engineering & Technology للعام الدراسي 2026-2027' AND organization = 'Iraq Ministry of Higher Education and Scientific Research'));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase3-univsul-16243', 'news', 'University President Recognises Women’s Leadership Development Programme Trainers', 'University of Sulaimani',
  'Sulaymaniyah', 'Sulaymaniyah', NULL, 'University of Sulaimani',
  'https://univsul.edu.iq/en/news/2026/06/11/16243/', NULL, NULL, NULL,
  'Official University of Sulaimani news item about recognition of Women’s Leadership Development Programme trainers. Published date from dry-run/source: 2026-06-11.', 'Official university news page with visible published date and non-generic title.', NULL, 'en',
  'pending_review', '8247f02163999feca4a7bb193617f67af67de37422251019f7ec516127abfdc5', 90,
  'Phase 3 dry-run item. Published date: 2026-06-11. Admin verification needed: no.',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase3-univsul-16243' OR duplicate_key = '8247f02163999feca4a7bb193617f67af67de37422251019f7ec516127abfdc5' OR source_url = 'https://univsul.edu.iq/en/news/2026/06/11/16243/' OR ((title = 'University President Recognises Women’s Leadership Development Programme Trainers' AND organization = 'University of Sulaimani')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase3-univsul-16243' OR duplicate_key = '8247f02163999feca4a7bb193617f67af67de37422251019f7ec516127abfdc5' OR source_url = 'https://univsul.edu.iq/en/news/2026/06/11/16243/' OR ((title = 'University President Recognises Women’s Leadership Development Programme Trainers' AND organization = 'University of Sulaimani')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase3-univsul-16198', 'activity', 'University of Sulaimani President Honours Women’s Handball Team', 'University of Sulaimani',
  'Sulaymaniyah', 'Sulaymaniyah', NULL, 'University of Sulaimani',
  'https://univsul.edu.iq/en/news/2026/06/11/16198/', NULL, NULL, NULL,
  'Official University of Sulaimani campus activity item about recognition of the women’s handball team. Published date from dry-run/source: 2026-06-11.', 'Official university page; student/campus activity; visible published date.', NULL, 'en',
  'pending_review', 'b84e2644085d4e6a81ca2739909718ea62865659e4f033aa7f147380a66f8b29', 88,
  'Phase 3 dry-run item. Published date: 2026-06-11. Admin verification needed: no.',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase3-univsul-16198' OR duplicate_key = 'b84e2644085d4e6a81ca2739909718ea62865659e4f033aa7f147380a66f8b29' OR source_url = 'https://univsul.edu.iq/en/news/2026/06/11/16198/' OR ((title = 'University of Sulaimani President Honours Women’s Handball Team' AND organization = 'University of Sulaimani')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase3-univsul-16198' OR duplicate_key = 'b84e2644085d4e6a81ca2739909718ea62865659e4f033aa7f147380a66f8b29' OR source_url = 'https://univsul.edu.iq/en/news/2026/06/11/16198/' OR ((title = 'University of Sulaimani President Honours Women’s Handball Team' AND organization = 'University of Sulaimani')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase3-univsul-16112', 'exam', 'University Vice Presidents Visit Examination Halls Across Campuses', 'University of Sulaimani',
  'Sulaymaniyah', 'Sulaymaniyah', NULL, 'University of Sulaimani',
  'https://univsul.edu.iq/en/news/2026/06/06/16112/', NULL, NULL, NULL,
  'Official University of Sulaimani exam update about vice presidents visiting examination halls during second-semester final examinations. Published date from dry-run/source: 2026-06-06.', 'Official university exam/campus update; visible published date; not an event requiring future attendance.', NULL, 'en',
  'pending_review', '7682a72d9352635d2451d423e15105de67ff24bf289963c9e1b93b6e6cd36221', 86,
  'Phase 3 dry-run item. Published date: 2026-06-06. Admin verification needed: no.',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase3-univsul-16112' OR duplicate_key = '7682a72d9352635d2451d423e15105de67ff24bf289963c9e1b93b6e6cd36221' OR source_url = 'https://univsul.edu.iq/en/news/2026/06/06/16112/' OR ((title = 'University Vice Presidents Visit Examination Halls Across Campuses' AND organization = 'University of Sulaimani')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase3-univsul-16112' OR duplicate_key = '7682a72d9352635d2451d423e15105de67ff24bf289963c9e1b93b6e6cd36221' OR source_url = 'https://univsul.edu.iq/en/news/2026/06/06/16112/' OR ((title = 'University Vice Presidents Visit Examination Halls Across Campuses' AND organization = 'University of Sulaimani')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase3-uot-air-defense-2026-06-07', 'news', 'University of Technology and Iraqi Air Defense Command Sign Cooperation Framework', 'University of Technology - Iraq',
  'Baghdad', 'Baghdad', NULL, 'University of Technology - Iraq',
  'https://uotechnology.edu.iq/en/news2026-06-07-6/', NULL, NULL, NULL,
  'Official University of Technology - Iraq news item about signing a cooperation framework with the Iraqi Air Defense Command. Published date from dry-run/source: 2026-06-07.', 'Official university news page with visible 2026-06-07 date.', NULL, 'en',
  'pending_review', 'd06fe7aa0268a89175b06595dd39d41c0a8268e1953b70138b6ec2e8a7cd83c4', 84,
  'Phase 3 dry-run item. Published date: 2026-06-07. Admin verification needed: no.',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase3-uot-air-defense-2026-06-07' OR duplicate_key = 'd06fe7aa0268a89175b06595dd39d41c0a8268e1953b70138b6ec2e8a7cd83c4' OR source_url = 'https://uotechnology.edu.iq/en/news2026-06-07-6/' OR ((title = 'University of Technology and Iraqi Air Defense Command Sign Cooperation Framework' AND organization = 'University of Technology - Iraq')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase3-uot-air-defense-2026-06-07' OR duplicate_key = 'd06fe7aa0268a89175b06595dd39d41c0a8268e1953b70138b6ec2e8a7cd83c4' OR source_url = 'https://uotechnology.edu.iq/en/news2026-06-07-6/' OR ((title = 'University of Technology and Iraqi Air Defense Command Sign Cooperation Framework' AND organization = 'University of Technology - Iraq')));

INSERT INTO opportunity_candidates (
  id, source_id, title, organization, category, description, summary, eligibility, deadline, published_date, apply_url, source_url, image_url, country, governorate, city, language, salary_or_funding, confidence_score, duplicate_key, status, rejection_reason, created_at, updated_at
)
SELECT
  'phase3-unfpa-34768', NULL, 'International Consultant: Development of In-Depth Analysis Census Results, Erbil, Iraq', 'UNFPA - United Nations Population Fund', 'job',
  'Official UNFPA Oracle careers posting for an international consultant role in Erbil, Iraq. Source metadata shows Apply Before 2026-06-16. Deadline is soon; admin should verify immediately before approval.', 'Official UNFPA Oracle careers posting for an international consultant role in Erbil, Iraq. Source metadata shows Apply Before 2026-06-16.', NULL, '2026-06-16', '2026-06-10',
  'https://estm.fa.em2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2003/job/34768', 'https://estm.fa.em2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2003/job/34768', NULL, 'Iraq', 'Erbil', 'Erbil',
  'en', NULL, 88, 'b3102a5ddb1ea3884ca12a081a648ba55bd99096d1f1bd6fc097f21667c6784a', 'pending_review', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase3-unfpa-34768' OR duplicate_key = 'b3102a5ddb1ea3884ca12a081a648ba55bd99096d1f1bd6fc097f21667c6784a' OR source_url = 'https://estm.fa.em2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2003/job/34768' OR apply_url = 'https://estm.fa.em2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2003/job/34768' OR (title = 'International Consultant: Development of In-Depth Analysis Census Results, Erbil, Iraq' AND organization = 'UNFPA - United Nations Population Fund'))
  AND NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase3-unfpa-34768' OR duplicate_key = 'b3102a5ddb1ea3884ca12a081a648ba55bd99096d1f1bd6fc097f21667c6784a' OR source_url = 'https://estm.fa.em2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2003/job/34768' OR apply_url = 'https://estm.fa.em2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2003/job/34768' OR (title = 'International Consultant: Development of In-Depth Analysis Census Results, Erbil, Iraq' AND organization = 'UNFPA - United Nations Population Fund'));

-- Phase 1 approved dry-run insertion.
-- Inserts reviewed real-source items as pending_review only.
-- Guarded with duplicate_key/source_url/apply_url NOT EXISTS checks.

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id,
  source_name, source_url, apply_url, event_date, deadline, summary,
  full_description_optional, image_url, language, status, duplicate_key,
  confidence_score, raw_text
)
SELECT
  'phase1-uobaghdad-49471', 'news', 'أسماء المرشحين للإجازات الدراسية في جامعة بغداد للعام ٢٠٢٦-٢٠٢٧',
  'University of Baghdad', 'Baghdad', 'Baghdad', 'uobaghdad',
  'University of Baghdad', 'https://uobaghdad.edu.iq/?p=49471', NULL, NULL, NULL,
  'أسماء المرشحين للإجازات الدراسية في جامعة بغداد للعام ٢٠٢٦-٢٠٢٧',
  'Official University of Baghdad post. Collected by Jamiaati Phase 1 dry run; admin review required before publication.',
  NULL, 'ar', 'pending_review',
  'd94215148100c6e459dda83f8bd5115ed8fcdd9683800d97127707f430878674',
  88, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM highlight_items
  WHERE duplicate_key = 'd94215148100c6e459dda83f8bd5115ed8fcdd9683800d97127707f430878674'
     OR source_url = 'https://uobaghdad.edu.iq/?p=49471'
     OR apply_url = 'https://uobaghdad.edu.iq/?p=49471'
) AND NOT EXISTS (
  SELECT 1 FROM opportunity_candidates
  WHERE duplicate_key = 'd94215148100c6e459dda83f8bd5115ed8fcdd9683800d97127707f430878674'
     OR source_url = 'https://uobaghdad.edu.iq/?p=49471'
     OR apply_url = 'https://uobaghdad.edu.iq/?p=49471'
);

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id,
  source_name, source_url, apply_url, event_date, deadline, summary,
  full_description_optional, image_url, language, status, duplicate_key,
  confidence_score, raw_text
)
SELECT
  'phase1-uobaghdad-49164', 'news', 'خطة الاجازات الدراسية للعام الدراسي ٢٠٢٦-٢٠٢٧',
  'University of Baghdad', 'Baghdad', 'Baghdad', 'uobaghdad',
  'University of Baghdad', 'https://uobaghdad.edu.iq/?p=49164', NULL, NULL, NULL,
  'خطة الاجازات الدراسية للعام الدراسي ٢٠٢٦-٢٠٢٧',
  'Official University of Baghdad post. Collected by Jamiaati Phase 1 dry run; admin review required before publication.',
  NULL, 'ar', 'pending_review',
  'eee6dd2ae4df22a31d7851f2525b7d0c7ab40ebcb23055958055d1d1c1d20134',
  88, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM highlight_items
  WHERE duplicate_key = 'eee6dd2ae4df22a31d7851f2525b7d0c7ab40ebcb23055958055d1d1c1d20134'
     OR source_url = 'https://uobaghdad.edu.iq/?p=49164'
     OR apply_url = 'https://uobaghdad.edu.iq/?p=49164'
) AND NOT EXISTS (
  SELECT 1 FROM opportunity_candidates
  WHERE duplicate_key = 'eee6dd2ae4df22a31d7851f2525b7d0c7ab40ebcb23055958055d1d1c1d20134'
     OR source_url = 'https://uobaghdad.edu.iq/?p=49164'
     OR apply_url = 'https://uobaghdad.edu.iq/?p=49164'
);

INSERT INTO opportunity_candidates (
  id, source_id, title, organization, category, description, summary, eligibility,
  deadline, published_date, apply_url, source_url, image_url, country,
  governorate, city, language, salary_or_funding, confidence_score,
  duplicate_key, status, rejection_reason
)
SELECT
  'phase1-daad-57742121', NULL, 'Research Grants in Germany', 'DAAD Iraq', 'scholarship',
  'The research grant offers the opportunity to realise a research project in Germany. During a doctorate funding is available for 2 to 12 months, and in the early postdoc phase for 2 to 6 months.',
  'DAAD Iraq scholarship option for Iraq-origin applicants. Admin review required before publication.',
  NULL, '2026-08-31', NULL,
  'https://www.daad-iraq.org/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=88&origin=88&pg=1&tab=&intention=&detail_to_show=57742121',
  'https://www.daad-iraq.org/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=88&origin=88&pg=1&tab=&intention=&detail_to_show=57742121',
  NULL, 'Iraq', NULL, NULL, 'en', NULL, 92,
  '78570484515ecdac4f54c40fa9ddd184f5cf5815279a35edad35886e176f9dcc',
  'pending_review', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM opportunity_candidates
  WHERE duplicate_key = '78570484515ecdac4f54c40fa9ddd184f5cf5815279a35edad35886e176f9dcc'
     OR source_url = 'https://www.daad-iraq.org/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=88&origin=88&pg=1&tab=&intention=&detail_to_show=57742121'
     OR apply_url = 'https://www.daad-iraq.org/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=88&origin=88&pg=1&tab=&intention=&detail_to_show=57742121'
) AND NOT EXISTS (
  SELECT 1 FROM highlight_items
  WHERE duplicate_key = '78570484515ecdac4f54c40fa9ddd184f5cf5815279a35edad35886e176f9dcc'
     OR source_url = 'https://www.daad-iraq.org/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=88&origin=88&pg=1&tab=&intention=&detail_to_show=57742121'
     OR apply_url = 'https://www.daad-iraq.org/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=88&origin=88&pg=1&tab=&intention=&detail_to_show=57742121'
);

INSERT INTO opportunity_candidates (
  id, source_id, title, organization, category, description, summary, eligibility,
  deadline, published_date, apply_url, source_url, image_url, country,
  governorate, city, language, salary_or_funding, confidence_score,
  duplicate_key, status, rejection_reason
)
SELECT
  'phase1-daad-50110016', NULL, 'Study Visits for Academics - Artists and Architects', 'DAAD Iraq', 'scholarship',
  'DAAD grants for university teachers and artists which enable them to continue their education with a study visit to Germany and intensify artistic cooperations with German host institutions.',
  'DAAD Iraq scholarship option for Iraq-origin applicants. Admin review required before publication.',
  NULL, '2026-08-31', NULL,
  'https://www.daad-iraq.org/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=88&origin=88&pg=1&tab=&intention=&detail_to_show=50110016',
  'https://www.daad-iraq.org/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=88&origin=88&pg=1&tab=&intention=&detail_to_show=50110016',
  NULL, 'Iraq', NULL, NULL, 'en', NULL, 92,
  '08da400b19c1cbe06b56718389ec7a965759170ec0a7aebc2a722b5d6769bc01',
  'pending_review', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM opportunity_candidates
  WHERE duplicate_key = '08da400b19c1cbe06b56718389ec7a965759170ec0a7aebc2a722b5d6769bc01'
     OR source_url = 'https://www.daad-iraq.org/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=88&origin=88&pg=1&tab=&intention=&detail_to_show=50110016'
     OR apply_url = 'https://www.daad-iraq.org/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=88&origin=88&pg=1&tab=&intention=&detail_to_show=50110016'
) AND NOT EXISTS (
  SELECT 1 FROM highlight_items
  WHERE duplicate_key = '08da400b19c1cbe06b56718389ec7a965759170ec0a7aebc2a722b5d6769bc01'
     OR source_url = 'https://www.daad-iraq.org/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=88&origin=88&pg=1&tab=&intention=&detail_to_show=50110016'
     OR apply_url = 'https://www.daad-iraq.org/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=88&origin=88&pg=1&tab=&intention=&detail_to_show=50110016'
);

INSERT INTO opportunity_candidates (
  id, source_id, title, organization, category, description, summary, eligibility,
  deadline, published_date, apply_url, source_url, image_url, country,
  governorate, city, language, salary_or_funding, confidence_score,
  duplicate_key, status, rejection_reason
)
SELECT
  'phase1-unjobs-1781188321428', NULL,
  'Shock Responsive & Adaptive Social Protection (SRASP) Coordinator, Shock Responsive & Adaptive Social Protection (SRASP) Coordinator, Baghdad, Iraq',
  'WFP - World Food Programme', 'job',
  'Vacancy listed for Iraq by WFP - World Food Programme. Deadline is unknown in the listing extract; admin must verify deadline and details before approval.',
  'Vacancy listed for Iraq by WFP - World Food Programme. Admin must verify deadline before approval.',
  NULL, NULL, NULL,
  'https://unjobs.org/vacancies/1781188321428',
  'https://unjobs.org/vacancies/1781188321428',
  NULL, 'Iraq', 'Baghdad', 'Baghdad', 'en', NULL, 82,
  '7d750d085e36aa13d448fa1cb458c3705aaf76efb6fb9391f42fe63f5da6eee7',
  'pending_review', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM opportunity_candidates
  WHERE duplicate_key = '7d750d085e36aa13d448fa1cb458c3705aaf76efb6fb9391f42fe63f5da6eee7'
     OR source_url = 'https://unjobs.org/vacancies/1781188321428'
     OR apply_url = 'https://unjobs.org/vacancies/1781188321428'
) AND NOT EXISTS (
  SELECT 1 FROM highlight_items
  WHERE duplicate_key = '7d750d085e36aa13d448fa1cb458c3705aaf76efb6fb9391f42fe63f5da6eee7'
     OR source_url = 'https://unjobs.org/vacancies/1781188321428'
     OR apply_url = 'https://unjobs.org/vacancies/1781188321428'
);

INSERT INTO opportunity_candidates (
  id, source_id, title, organization, category, description, summary, eligibility,
  deadline, published_date, apply_url, source_url, image_url, country,
  governorate, city, language, salary_or_funding, confidence_score,
  duplicate_key, status, rejection_reason
)
SELECT
  'phase1-unjobs-1781163781899', NULL, 'Country Director, Iraq, Erbil, Iraq',
  'Save the Children', 'job',
  'Vacancy listed for Iraq by Save the Children. Deadline is unknown in the listing extract; admin must verify deadline and details before approval.',
  'Vacancy listed for Iraq by Save the Children. Admin must verify deadline before approval.',
  NULL, NULL, NULL,
  'https://unjobs.org/vacancies/1781163781899',
  'https://unjobs.org/vacancies/1781163781899',
  NULL, 'Iraq', 'Erbil', 'Erbil', 'en', NULL, 82,
  '037a557e6ab85a73b3c5a79c74d0bec36536c9459eff525223e247a1ee786a9f',
  'pending_review', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM opportunity_candidates
  WHERE duplicate_key = '037a557e6ab85a73b3c5a79c74d0bec36536c9459eff525223e247a1ee786a9f'
     OR source_url = 'https://unjobs.org/vacancies/1781163781899'
     OR apply_url = 'https://unjobs.org/vacancies/1781163781899'
) AND NOT EXISTS (
  SELECT 1 FROM highlight_items
  WHERE duplicate_key = '037a557e6ab85a73b3c5a79c74d0bec36536c9459eff525223e247a1ee786a9f'
     OR source_url = 'https://unjobs.org/vacancies/1781163781899'
     OR apply_url = 'https://unjobs.org/vacancies/1781163781899'
);

INSERT INTO opportunity_candidates (
  id, source_id, title, organization, category, description, summary, eligibility,
  deadline, published_date, apply_url, source_url, image_url, country,
  governorate, city, language, salary_or_funding, confidence_score,
  duplicate_key, status, rejection_reason
)
SELECT
  'phase1-unjobs-1781165064495', NULL,
  'International Consultant: Development of In-Depth Analysis Census Results, Erbil, Iraq, Erbil, Iraq',
  'UNFPA - United Nations Population Fund', 'job',
  'Vacancy listed for Iraq by UNFPA - United Nations Population Fund. Deadline is unknown in the listing extract; admin must verify deadline and details before approval.',
  'Vacancy listed for Iraq by UNFPA - United Nations Population Fund. Admin must verify deadline before approval.',
  NULL, NULL, NULL,
  'https://unjobs.org/vacancies/1781165064495',
  'https://unjobs.org/vacancies/1781165064495',
  NULL, 'Iraq', 'Erbil', 'Erbil', 'en', NULL, 82,
  '94b11efb83db0b13e89416853b193b502885a297c501ca1904f67b0f1a5d1e2d',
  'pending_review', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM opportunity_candidates
  WHERE duplicate_key = '94b11efb83db0b13e89416853b193b502885a297c501ca1904f67b0f1a5d1e2d'
     OR source_url = 'https://unjobs.org/vacancies/1781165064495'
     OR apply_url = 'https://unjobs.org/vacancies/1781165064495'
) AND NOT EXISTS (
  SELECT 1 FROM highlight_items
  WHERE duplicate_key = '94b11efb83db0b13e89416853b193b502885a297c501ca1904f67b0f1a5d1e2d'
     OR source_url = 'https://unjobs.org/vacancies/1781165064495'
     OR apply_url = 'https://unjobs.org/vacancies/1781165064495'
);

INSERT INTO opportunity_candidates (
  id, source_id, title, organization, category, description, summary, eligibility,
  deadline, published_date, apply_url, source_url, image_url, country,
  governorate, city, language, salary_or_funding, confidence_score,
  duplicate_key, status, rejection_reason
)
SELECT
  'phase1-unjobs-1781111792993', NULL,
  'Call for an External Collaborator to support project implementation and monitoring in Dohuk., Iraq',
  'ILO - International Labour Organization', 'job',
  'Vacancy listed for Iraq by ILO - International Labour Organization. Deadline is unknown in the listing extract; admin must verify deadline and details before approval.',
  'Vacancy listed for Iraq by ILO - International Labour Organization. Admin must verify deadline before approval.',
  NULL, NULL, NULL,
  'https://unjobs.org/vacancies/1781111792993',
  'https://unjobs.org/vacancies/1781111792993',
  NULL, 'Iraq', 'Duhok', 'Duhok', 'en', NULL, 82,
  '6210680eeff04549e43fc7dfe329526b2fd56db3889c2b771ce62f5433e2129a',
  'pending_review', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM opportunity_candidates
  WHERE duplicate_key = '6210680eeff04549e43fc7dfe329526b2fd56db3889c2b771ce62f5433e2129a'
     OR source_url = 'https://unjobs.org/vacancies/1781111792993'
     OR apply_url = 'https://unjobs.org/vacancies/1781111792993'
) AND NOT EXISTS (
  SELECT 1 FROM highlight_items
  WHERE duplicate_key = '6210680eeff04549e43fc7dfe329526b2fd56db3889c2b771ce62f5433e2129a'
     OR source_url = 'https://unjobs.org/vacancies/1781111792993'
     OR apply_url = 'https://unjobs.org/vacancies/1781111792993'
);

INSERT INTO opportunity_candidates (
  id, source_id, title, organization, category, description, summary, eligibility,
  deadline, published_date, apply_url, source_url, image_url, country,
  governorate, city, language, salary_or_funding, confidence_score,
  duplicate_key, status, rejection_reason
)
SELECT
  'phase1-unjobs-1781111809577', NULL,
  'Call for an External Collaborator to support project implementation and monitoring in Ninawa., Iraq',
  'ILO - International Labour Organization', 'job',
  'Vacancy listed for Iraq by ILO - International Labour Organization. Deadline is unknown in the listing extract; admin must verify deadline and details before approval.',
  'Vacancy listed for Iraq by ILO - International Labour Organization. Admin must verify deadline before approval.',
  NULL, NULL, NULL,
  'https://unjobs.org/vacancies/1781111809577',
  'https://unjobs.org/vacancies/1781111809577',
  NULL, 'Iraq', 'Nineveh', NULL, 'en', NULL, 82,
  '49cebb35ca5a96254fca9805265d92a471671bcc807f17bd2ef5193a5d4cceb5',
  'pending_review', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM opportunity_candidates
  WHERE duplicate_key = '49cebb35ca5a96254fca9805265d92a471671bcc807f17bd2ef5193a5d4cceb5'
     OR source_url = 'https://unjobs.org/vacancies/1781111809577'
     OR apply_url = 'https://unjobs.org/vacancies/1781111809577'
) AND NOT EXISTS (
  SELECT 1 FROM highlight_items
  WHERE duplicate_key = '49cebb35ca5a96254fca9805265d92a471671bcc807f17bd2ef5193a5d4cceb5'
     OR source_url = 'https://unjobs.org/vacancies/1781111809577'
     OR apply_url = 'https://unjobs.org/vacancies/1781111809577'
);

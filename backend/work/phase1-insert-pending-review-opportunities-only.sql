INSERT INTO opportunity_candidates (
  id, title, organization, category, description, summary, eligibility,
  deadline, published_date, apply_url, source_url, image_url, country,
  governorate, city, language, salary_or_funding, confidence_score,
  duplicate_key, status, rejection_reason, created_at, updated_at
)
SELECT
  'phase1-daad-57742121',
  'Research Grants in Germany',
  'DAAD Iraq',
  'scholarship',
  'DAAD scholarship database entry for research grants in Germany. Real DAAD source retained for admin review before publication.',
  'DAAD scholarship opportunity from the official DAAD Iraq scholarship database. Deadline listed as 2026-08-31.',
  NULL,
  '2026-08-31',
  NULL,
  'https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/?detail=57742121',
  'https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/?detail=57742121',
  NULL,
  'Iraq',
  NULL,
  NULL,
  'en',
  NULL,
  92,
  'daad:scholarship:57742121',
  'pending_review',
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM opportunity_candidates
  WHERE duplicate_key = 'daad:scholarship:57742121'
     OR source_url = 'https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/?detail=57742121'
     OR apply_url = 'https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/?detail=57742121'
);

INSERT INTO opportunity_candidates (
  id, title, organization, category, description, summary, eligibility,
  deadline, published_date, apply_url, source_url, image_url, country,
  governorate, city, language, salary_or_funding, confidence_score,
  duplicate_key, status, rejection_reason, created_at, updated_at
)
SELECT
  'phase1-daad-50110016',
  'Study Visits for Academics - Artists and Architects',
  'DAAD Iraq',
  'scholarship',
  'DAAD scholarship database entry for study visits for academics, artists, and architects. Real DAAD source retained for admin review before publication.',
  'DAAD scholarship opportunity from the official DAAD Iraq scholarship database. Deadline listed as 2026-08-31.',
  NULL,
  '2026-08-31',
  NULL,
  'https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/?detail=50110016',
  'https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/?detail=50110016',
  NULL,
  'Iraq',
  NULL,
  NULL,
  'en',
  NULL,
  92,
  'daad:scholarship:50110016',
  'pending_review',
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM opportunity_candidates
  WHERE duplicate_key = 'daad:scholarship:50110016'
     OR source_url = 'https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/?detail=50110016'
     OR apply_url = 'https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/?detail=50110016'
);

INSERT INTO opportunity_candidates (
  id, title, organization, category, description, summary, eligibility,
  deadline, published_date, apply_url, source_url, image_url, country,
  governorate, city, language, salary_or_funding, confidence_score,
  duplicate_key, status, rejection_reason, created_at, updated_at
)
SELECT
  'phase1-unjobs-1781188321428',
  'Shock Responsive & Adaptive Social Protection (SRASP) Coordinator, Shock Responsive & Adaptive Social Protection (SRASP) Coordinator, Baghdad, Iraq',
  'WFP',
  'job',
  'UNjobs Iraq vacancy. Deadline was not available in the dry-run item; admin must verify the deadline and active status before approval.',
  'Real UNjobs Iraq job listing in Baghdad. Deadline unknown; admin must verify deadline before approval.',
  NULL,
  NULL,
  NULL,
  'https://unjobs.org/vacancies/1781188321428',
  'https://unjobs.org/vacancies/1781188321428',
  NULL,
  'Iraq',
  'Baghdad',
  'Baghdad',
  'en',
  NULL,
  82,
  'unjobs:1781188321428',
  'pending_review',
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM opportunity_candidates
  WHERE duplicate_key = 'unjobs:1781188321428'
     OR source_url = 'https://unjobs.org/vacancies/1781188321428'
     OR apply_url = 'https://unjobs.org/vacancies/1781188321428'
);

INSERT INTO opportunity_candidates (
  id, title, organization, category, description, summary, eligibility,
  deadline, published_date, apply_url, source_url, image_url, country,
  governorate, city, language, salary_or_funding, confidence_score,
  duplicate_key, status, rejection_reason, created_at, updated_at
)
SELECT
  'phase1-unjobs-1781163781899',
  'Country Director, Iraq, Erbil, Iraq',
  'Save the Children',
  'job',
  'UNjobs Iraq vacancy. Deadline was not available in the dry-run item; admin must verify the deadline and active status before approval.',
  'Real UNjobs Iraq job listing in Erbil. Deadline unknown; admin must verify deadline before approval.',
  NULL,
  NULL,
  NULL,
  'https://unjobs.org/vacancies/1781163781899',
  'https://unjobs.org/vacancies/1781163781899',
  NULL,
  'Iraq',
  'Erbil',
  'Erbil',
  'en',
  NULL,
  82,
  'unjobs:1781163781899',
  'pending_review',
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM opportunity_candidates
  WHERE duplicate_key = 'unjobs:1781163781899'
     OR source_url = 'https://unjobs.org/vacancies/1781163781899'
     OR apply_url = 'https://unjobs.org/vacancies/1781163781899'
);

INSERT INTO opportunity_candidates (
  id, title, organization, category, description, summary, eligibility,
  deadline, published_date, apply_url, source_url, image_url, country,
  governorate, city, language, salary_or_funding, confidence_score,
  duplicate_key, status, rejection_reason, created_at, updated_at
)
SELECT
  'phase1-unjobs-1781165064495',
  'International Consultant: Development of In-Depth Analysis Census Results, Erbil, Iraq, Erbil, Iraq',
  'UNFPA',
  'job',
  'UNjobs Iraq vacancy. Deadline was not available in the dry-run item; admin must verify the deadline and active status before approval.',
  'Real UNjobs Iraq job listing in Erbil. Deadline unknown; admin must verify deadline before approval.',
  NULL,
  NULL,
  NULL,
  'https://unjobs.org/vacancies/1781165064495',
  'https://unjobs.org/vacancies/1781165064495',
  NULL,
  'Iraq',
  'Erbil',
  'Erbil',
  'en',
  NULL,
  82,
  'unjobs:1781165064495',
  'pending_review',
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM opportunity_candidates
  WHERE duplicate_key = 'unjobs:1781165064495'
     OR source_url = 'https://unjobs.org/vacancies/1781165064495'
     OR apply_url = 'https://unjobs.org/vacancies/1781165064495'
);

INSERT INTO opportunity_candidates (
  id, title, organization, category, description, summary, eligibility,
  deadline, published_date, apply_url, source_url, image_url, country,
  governorate, city, language, salary_or_funding, confidence_score,
  duplicate_key, status, rejection_reason, created_at, updated_at
)
SELECT
  'phase1-unjobs-1781111792993',
  'Call for an External Collaborator to support project implementation and monitoring in Dohuk., Iraq',
  'ILO',
  'job',
  'UNjobs Iraq vacancy. Deadline was not available in the dry-run item; admin must verify the deadline and active status before approval.',
  'Real UNjobs Iraq job listing in Duhok. Deadline unknown; admin must verify deadline before approval.',
  NULL,
  NULL,
  NULL,
  'https://unjobs.org/vacancies/1781111792993',
  'https://unjobs.org/vacancies/1781111792993',
  NULL,
  'Iraq',
  'Duhok',
  'Duhok',
  'en',
  NULL,
  82,
  'unjobs:1781111792993',
  'pending_review',
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM opportunity_candidates
  WHERE duplicate_key = 'unjobs:1781111792993'
     OR source_url = 'https://unjobs.org/vacancies/1781111792993'
     OR apply_url = 'https://unjobs.org/vacancies/1781111792993'
);

INSERT INTO opportunity_candidates (
  id, title, organization, category, description, summary, eligibility,
  deadline, published_date, apply_url, source_url, image_url, country,
  governorate, city, language, salary_or_funding, confidence_score,
  duplicate_key, status, rejection_reason, created_at, updated_at
)
SELECT
  'phase1-unjobs-1781111809577',
  'Call for an External Collaborator to support project implementation and monitoring in Ninawa., Iraq',
  'ILO',
  'job',
  'UNjobs Iraq vacancy. Deadline was not available in the dry-run item; admin must verify the deadline and active status before approval.',
  'Real UNjobs Iraq job listing in Nineveh. Deadline unknown; admin must verify deadline before approval.',
  NULL,
  NULL,
  NULL,
  'https://unjobs.org/vacancies/1781111809577',
  'https://unjobs.org/vacancies/1781111809577',
  NULL,
  'Iraq',
  'Nineveh',
  NULL,
  'en',
  NULL,
  82,
  'unjobs:1781111809577',
  'pending_review',
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM opportunity_candidates
  WHERE duplicate_key = 'unjobs:1781111809577'
     OR source_url = 'https://unjobs.org/vacancies/1781111809577'
     OR apply_url = 'https://unjobs.org/vacancies/1781111809577'
);

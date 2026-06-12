INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id,
  source_name, source_url, apply_url, event_date, deadline, summary,
  full_description_optional, image_url, language, status, duplicate_key,
  confidence_score, raw_text
)
SELECT
  'phase1-uobaghdad-49471',
  'news',
  'أسماء المرشحين للإجازات الدراسية في جامعة بغداد للعام ٢٠٢٦-٢٠٢٧',
  'University of Baghdad',
  'Baghdad',
  'Baghdad',
  'uobaghdad',
  'University of Baghdad',
  'https://uobaghdad.edu.iq/?p=49471',
  NULL,
  NULL,
  NULL,
  'أسماء المرشحين للإجازات الدراسية في جامعة بغداد للعام ٢٠٢٦-٢٠٢٧',
  'Official University of Baghdad post. Collected by Jamiaati Phase 1 dry run; admin review required before publication.',
  NULL,
  'ar',
  'pending_review',
  'd94215148100c6e459dda83f8bd5115ed8fcdd9683800d97127707f430878674',
  88,
  NULL
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
  'phase1-uobaghdad-49164',
  'news',
  'خطة الاجازات الدراسية للعام الدراسي ٢٠٢٦-٢٠٢٧',
  'University of Baghdad',
  'Baghdad',
  'Baghdad',
  'uobaghdad',
  'University of Baghdad',
  'https://uobaghdad.edu.iq/?p=49164',
  NULL,
  NULL,
  NULL,
  'خطة الاجازات الدراسية للعام الدراسي ٢٠٢٦-٢٠٢٧',
  'Official University of Baghdad post. Collected by Jamiaati Phase 1 dry run; admin review required before publication.',
  NULL,
  'ar',
  'pending_review',
  'eee6dd2ae4df22a31d7851f2525b7d0c7ab40ebcb23055958055d1d1c1d20134',
  88,
  NULL
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

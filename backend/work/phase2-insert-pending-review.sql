INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id,
  source_name, source_url, apply_url, event_date, deadline, summary,
  full_description_optional, image_url, language, status, duplicate_key,
  confidence_score, raw_text
)
SELECT
  'phase2-uobasrah-782', 'exam', 'سير الامتحانات النهائية في كلية الطب البيطري',
  'University of Basrah', 'Basra', 'Basra', NULL,
  'University of Basrah', 'https://uobasrah.edu.iq/event/782', NULL, NULL, NULL,
  'رئيس جامعة البصرة يتفقد سير الامتحانات النهائية في كلية الطب البي',
  'Official University of Basrah page collected in Phase 2 dry run; admin review required before publication.',
  NULL, 'ar', 'pending_review',
  '4846728b5b6f4291a7da55c7129009ea722417d05d31a4ba6527dce0a7333393',
  84, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM highlight_items
  WHERE duplicate_key = '4846728b5b6f4291a7da55c7129009ea722417d05d31a4ba6527dce0a7333393'
     OR source_url = 'https://uobasrah.edu.iq/event/782'
     OR (lower(title) = lower('سير الامتحانات النهائية في كلية الطب البيطري') AND lower(COALESCE(organization, '')) = lower('University of Basrah'))
) AND NOT EXISTS (
  SELECT 1 FROM opportunity_candidates
  WHERE duplicate_key = '4846728b5b6f4291a7da55c7129009ea722417d05d31a4ba6527dce0a7333393'
     OR source_url = 'https://uobasrah.edu.iq/event/782'
     OR apply_url = 'https://uobasrah.edu.iq/event/782'
     OR (lower(title) = lower('سير الامتحانات النهائية في كلية الطب البيطري') AND lower(COALESCE(organization, '')) = lower('University of Basrah'))
);

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id,
  source_name, source_url, apply_url, event_date, deadline, summary,
  full_description_optional, image_url, language, status, duplicate_key,
  confidence_score, raw_text
)
SELECT
  'phase2-uobasrah-777', 'event', 'ندوة علمية بعنوان: أساسيات ومهارات تطبيقات برنامج Microsoft Office في العمل الوظيفي',
  'University of Basrah', 'Basra', 'Basra', NULL,
  'University of Basrah', 'https://uobasrah.edu.iq/event/777', NULL, NULL, NULL,
  'برعاية السيد رئيس جامعة البصرة الأستاذ الدكتور مهند جواد الأسدي',
  'Official University of Basrah page collected in Phase 2 dry run; admin review required before publication.',
  NULL, 'ar', 'pending_review',
  'e0c18daf9edf7acaf803909dbf50dd67dfceb4293cc63f9eee3f31cc41f3b21c',
  84, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM highlight_items
  WHERE duplicate_key = 'e0c18daf9edf7acaf803909dbf50dd67dfceb4293cc63f9eee3f31cc41f3b21c'
     OR source_url = 'https://uobasrah.edu.iq/event/777'
     OR (lower(title) = lower('ندوة علمية بعنوان: أساسيات ومهارات تطبيقات برنامج Microsoft Office في العمل الوظيفي') AND lower(COALESCE(organization, '')) = lower('University of Basrah'))
) AND NOT EXISTS (
  SELECT 1 FROM opportunity_candidates
  WHERE duplicate_key = 'e0c18daf9edf7acaf803909dbf50dd67dfceb4293cc63f9eee3f31cc41f3b21c'
     OR source_url = 'https://uobasrah.edu.iq/event/777'
     OR apply_url = 'https://uobasrah.edu.iq/event/777'
     OR (lower(title) = lower('ندوة علمية بعنوان: أساسيات ومهارات تطبيقات برنامج Microsoft Office في العمل الوظيفي') AND lower(COALESCE(organization, '')) = lower('University of Basrah'))
);

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id,
  source_name, source_url, apply_url, event_date, deadline, summary,
  full_description_optional, image_url, language, status, duplicate_key,
  confidence_score, raw_text
)
SELECT
  'phase2-uobasrah-776', 'event', 'ندوة علمية بعنوان: مدخل إلى الذكاء الاصطناعي: الشبكات العصبية والتعلم الآلي',
  'University of Basrah', 'Basra', 'Basra', NULL,
  'University of Basrah', 'https://uobasrah.edu.iq/event/776', NULL, NULL, NULL,
  'برعاية السيد رئيس جامعة البصرة الأستاذ الدكتور مهند جواد الأسدي',
  'Official University of Basrah page collected in Phase 2 dry run; admin review required before publication.',
  NULL, 'ar', 'pending_review',
  '1ccc029d5fc1adca08de438d300b3b30eec3eb059fcdb3788aca0652070aea1e',
  84, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM highlight_items
  WHERE duplicate_key = '1ccc029d5fc1adca08de438d300b3b30eec3eb059fcdb3788aca0652070aea1e'
     OR source_url = 'https://uobasrah.edu.iq/event/776'
     OR (lower(title) = lower('ندوة علمية بعنوان: مدخل إلى الذكاء الاصطناعي: الشبكات العصبية والتعلم الآلي') AND lower(COALESCE(organization, '')) = lower('University of Basrah'))
) AND NOT EXISTS (
  SELECT 1 FROM opportunity_candidates
  WHERE duplicate_key = '1ccc029d5fc1adca08de438d300b3b30eec3eb059fcdb3788aca0652070aea1e'
     OR source_url = 'https://uobasrah.edu.iq/event/776'
     OR apply_url = 'https://uobasrah.edu.iq/event/776'
     OR (lower(title) = lower('ندوة علمية بعنوان: مدخل إلى الذكاء الاصطناعي: الشبكات العصبية والتعلم الآلي') AND lower(COALESCE(organization, '')) = lower('University of Basrah'))
);

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id,
  source_name, source_url, apply_url, event_date, deadline, summary,
  full_description_optional, image_url, language, status, duplicate_key,
  confidence_score, raw_text
)
SELECT
  'phase2-uobasrah-779', 'event', 'ورشة عمل تخصصية بعنوان "التعليم الفعال باستخدام الذكاء الاصطناعي".',
  'University of Basrah', 'Basra', 'Basra', NULL,
  'University of Basrah', 'https://uobasrah.edu.iq/event/779', NULL, NULL, NULL,
  'أقام مركز تكنولوجيا المعلومات والاتصالات، وبالتعاون مع مركز التطو',
  'Official University of Basrah page collected in Phase 2 dry run; admin review required before publication.',
  NULL, 'ar', 'pending_review',
  '387ac2ed11756a29a21bac6ddee4d27c9e515e0ff857c5f838a4df558a54824a',
  84, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM highlight_items
  WHERE duplicate_key = '387ac2ed11756a29a21bac6ddee4d27c9e515e0ff857c5f838a4df558a54824a'
     OR source_url = 'https://uobasrah.edu.iq/event/779'
     OR (lower(title) = lower('ورشة عمل تخصصية بعنوان "التعليم الفعال باستخدام الذكاء الاصطناعي".') AND lower(COALESCE(organization, '')) = lower('University of Basrah'))
) AND NOT EXISTS (
  SELECT 1 FROM opportunity_candidates
  WHERE duplicate_key = '387ac2ed11756a29a21bac6ddee4d27c9e515e0ff857c5f838a4df558a54824a'
     OR source_url = 'https://uobasrah.edu.iq/event/779'
     OR apply_url = 'https://uobasrah.edu.iq/event/779'
     OR (lower(title) = lower('ورشة عمل تخصصية بعنوان "التعليم الفعال باستخدام الذكاء الاصطناعي".') AND lower(COALESCE(organization, '')) = lower('University of Basrah'))
);

INSERT INTO opportunity_candidates (
  id, source_id, title, organization, category, description, summary, eligibility,
  deadline, published_date, apply_url, source_url, image_url, country,
  governorate, city, language, salary_or_funding, confidence_score,
  duplicate_key, status, rejection_reason
)
SELECT
  'phase2-daad-57135739', NULL, 'Doctoral Programmes in Germany', 'DAAD Iraq', 'scholarship',
  'DAAD grants for young scientists and academics wishing to improve their academic qualifications with a doctoral degree in Germany. Deadline unknown; admin must verify deadline before approval.',
  'DAAD Iraq scholarship listing. Deadline unknown; admin must verify deadline before approval.',
  NULL, NULL, NULL,
  'https://www.daad-iraq.org/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=88&origin=88&pg=1&tab=&intention=&detail_to_show=57135739',
  'https://www.daad-iraq.org/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=88&origin=88&pg=1&tab=&intention=&detail_to_show=57135739',
  NULL, 'Iraq', NULL, NULL, 'en', NULL, 78,
  'f6a4b128dc941c0913d317e329d2e18427c49774ca4d44baef5360c39951b7ec',
  'pending_review', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM opportunity_candidates
  WHERE duplicate_key = 'f6a4b128dc941c0913d317e329d2e18427c49774ca4d44baef5360c39951b7ec'
     OR source_url = 'https://www.daad-iraq.org/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=88&origin=88&pg=1&tab=&intention=&detail_to_show=57135739'
     OR apply_url = 'https://www.daad-iraq.org/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=88&origin=88&pg=1&tab=&intention=&detail_to_show=57135739'
     OR (lower(title) = lower('Doctoral Programmes in Germany') AND lower(COALESCE(organization, '')) = lower('DAAD Iraq'))
) AND NOT EXISTS (
  SELECT 1 FROM highlight_items
  WHERE duplicate_key = 'f6a4b128dc941c0913d317e329d2e18427c49774ca4d44baef5360c39951b7ec'
     OR source_url = 'https://www.daad-iraq.org/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=88&origin=88&pg=1&tab=&intention=&detail_to_show=57135739'
     OR apply_url = 'https://www.daad-iraq.org/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=88&origin=88&pg=1&tab=&intention=&detail_to_show=57135739'
     OR (lower(title) = lower('Doctoral Programmes in Germany') AND lower(COALESCE(organization, '')) = lower('DAAD Iraq'))
);

INSERT INTO opportunity_candidates (
  id, source_id, title, organization, category, description, summary, eligibility,
  deadline, published_date, apply_url, source_url, image_url, country,
  governorate, city, language, salary_or_funding, confidence_score,
  duplicate_key, status, rejection_reason
)
SELECT
  'phase2-daad-50035295', NULL, 'University Summer Courses offered in Germany for Foreign Students and Graduates', 'DAAD Iraq', 'scholarship',
  'DAAD scholarships for students taking Bachelor''s and Master''s degree courses in all subjects wishing to improve their German proficiency and cultural knowledge of the country. Deadline unknown; admin must verify deadline before approval.',
  'DAAD Iraq scholarship listing. Deadline unknown; admin must verify deadline before approval.',
  NULL, NULL, NULL,
  'https://www.daad-iraq.org/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=88&origin=88&pg=1&tab=&intention=&detail_to_show=50035295',
  'https://www.daad-iraq.org/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=88&origin=88&pg=1&tab=&intention=&detail_to_show=50035295',
  NULL, 'Iraq', NULL, NULL, 'en', NULL, 78,
  '38a9554e9a83ddd86d36ba72650472956d46b4fd11329e9236d0e94a7c0283a5',
  'pending_review', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM opportunity_candidates
  WHERE duplicate_key = '38a9554e9a83ddd86d36ba72650472956d46b4fd11329e9236d0e94a7c0283a5'
     OR source_url = 'https://www.daad-iraq.org/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=88&origin=88&pg=1&tab=&intention=&detail_to_show=50035295'
     OR apply_url = 'https://www.daad-iraq.org/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=88&origin=88&pg=1&tab=&intention=&detail_to_show=50035295'
     OR (lower(title) = lower('University Summer Courses offered in Germany for Foreign Students and Graduates') AND lower(COALESCE(organization, '')) = lower('DAAD Iraq'))
) AND NOT EXISTS (
  SELECT 1 FROM highlight_items
  WHERE duplicate_key = '38a9554e9a83ddd86d36ba72650472956d46b4fd11329e9236d0e94a7c0283a5'
     OR source_url = 'https://www.daad-iraq.org/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=88&origin=88&pg=1&tab=&intention=&detail_to_show=50035295'
     OR apply_url = 'https://www.daad-iraq.org/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=88&origin=88&pg=1&tab=&intention=&detail_to_show=50035295'
     OR (lower(title) = lower('University Summer Courses offered in Germany for Foreign Students and Graduates') AND lower(COALESCE(organization, '')) = lower('DAAD Iraq'))
);

INSERT INTO opportunity_candidates (
  id, source_id, title, organization, category, description, summary, eligibility,
  deadline, published_date, apply_url, source_url, image_url, country,
  governorate, city, language, salary_or_funding, confidence_score,
  duplicate_key, status, rejection_reason
)
SELECT
  'phase2-unjobs-1781248320232', NULL, 'Admin Project Associate - (MG), Baghdad, Iraq', 'IOM - International Organization for Migration', 'job',
  'Vacancy listed for Iraq by IOM - International Organization for Migration. Deadline unknown; admin must verify deadline before approval.',
  'Vacancy listed for Iraq by IOM - International Organization for Migration. Admin must verify deadline before approval.',
  NULL, NULL, NULL,
  'https://unjobs.org/vacancies/1781248320232',
  'https://unjobs.org/vacancies/1781248320232',
  NULL, 'Iraq', 'Baghdad', 'Baghdad', 'en', NULL, 82,
  '108404e474b0a317312f5df9086fc77c74857953acc38ccc41afdcd3b2a58c0a',
  'pending_review', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM opportunity_candidates
  WHERE duplicate_key = '108404e474b0a317312f5df9086fc77c74857953acc38ccc41afdcd3b2a58c0a'
     OR source_url = 'https://unjobs.org/vacancies/1781248320232'
     OR apply_url = 'https://unjobs.org/vacancies/1781248320232'
     OR (lower(title) = lower('Admin Project Associate - (MG), Baghdad, Iraq') AND lower(COALESCE(organization, '')) = lower('IOM - International Organization for Migration'))
) AND NOT EXISTS (
  SELECT 1 FROM highlight_items
  WHERE duplicate_key = '108404e474b0a317312f5df9086fc77c74857953acc38ccc41afdcd3b2a58c0a'
     OR source_url = 'https://unjobs.org/vacancies/1781248320232'
     OR apply_url = 'https://unjobs.org/vacancies/1781248320232'
     OR (lower(title) = lower('Admin Project Associate - (MG), Baghdad, Iraq') AND lower(COALESCE(organization, '')) = lower('IOM - International Organization for Migration'))
);

INSERT INTO opportunity_candidates (
  id, source_id, title, organization, category, description, summary, eligibility,
  deadline, published_date, apply_url, source_url, image_url, country,
  governorate, city, language, salary_or_funding, confidence_score,
  duplicate_key, status, rejection_reason
)
SELECT
  'phase2-unjobs-1781248440018', NULL, 'Senior Project Associate (MG), Baghdad, Iraq', 'IOM - International Organization for Migration', 'job',
  'Vacancy listed for Iraq by IOM - International Organization for Migration. Deadline unknown; admin must verify deadline before approval.',
  'Vacancy listed for Iraq by IOM - International Organization for Migration. Admin must verify deadline before approval.',
  NULL, NULL, NULL,
  'https://unjobs.org/vacancies/1781248440018',
  'https://unjobs.org/vacancies/1781248440018',
  NULL, 'Iraq', 'Baghdad', 'Baghdad', 'en', NULL, 82,
  'c3e2ea82da3e11a27cc80e1a9a788f895b6b70093525b6fb33619c264ad89c04',
  'pending_review', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM opportunity_candidates
  WHERE duplicate_key = 'c3e2ea82da3e11a27cc80e1a9a788f895b6b70093525b6fb33619c264ad89c04'
     OR source_url = 'https://unjobs.org/vacancies/1781248440018'
     OR apply_url = 'https://unjobs.org/vacancies/1781248440018'
     OR (lower(title) = lower('Senior Project Associate (MG), Baghdad, Iraq') AND lower(COALESCE(organization, '')) = lower('IOM - International Organization for Migration'))
) AND NOT EXISTS (
  SELECT 1 FROM highlight_items
  WHERE duplicate_key = 'c3e2ea82da3e11a27cc80e1a9a788f895b6b70093525b6fb33619c264ad89c04'
     OR source_url = 'https://unjobs.org/vacancies/1781248440018'
     OR apply_url = 'https://unjobs.org/vacancies/1781248440018'
     OR (lower(title) = lower('Senior Project Associate (MG), Baghdad, Iraq') AND lower(COALESCE(organization, '')) = lower('IOM - International Organization for Migration'))
);

INSERT INTO opportunity_candidates (
  id, source_id, title, organization, category, description, summary, eligibility,
  deadline, published_date, apply_url, source_url, image_url, country,
  governorate, city, language, salary_or_funding, confidence_score,
  duplicate_key, status, rejection_reason
)
SELECT
  'phase2-unjobs-1781248453040', NULL, 'Senior Admin Project Associate - Protection, Erbil, Iraq', 'IOM - International Organization for Migration', 'job',
  'Vacancy listed for Iraq by IOM - International Organization for Migration. Deadline unknown; admin must verify deadline before approval.',
  'Vacancy listed for Iraq by IOM - International Organization for Migration. Admin must verify deadline before approval.',
  NULL, NULL, NULL,
  'https://unjobs.org/vacancies/1781248453040',
  'https://unjobs.org/vacancies/1781248453040',
  NULL, 'Iraq', 'Erbil', 'Erbil', 'en', NULL, 82,
  '63b830cf5d1fbb45a3e363b0487459b08b17457b9ee8dc96c9a0d9af100edd0b',
  'pending_review', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM opportunity_candidates
  WHERE duplicate_key = '63b830cf5d1fbb45a3e363b0487459b08b17457b9ee8dc96c9a0d9af100edd0b'
     OR source_url = 'https://unjobs.org/vacancies/1781248453040'
     OR apply_url = 'https://unjobs.org/vacancies/1781248453040'
     OR (lower(title) = lower('Senior Admin Project Associate - Protection, Erbil, Iraq') AND lower(COALESCE(organization, '')) = lower('IOM - International Organization for Migration'))
) AND NOT EXISTS (
  SELECT 1 FROM highlight_items
  WHERE duplicate_key = '63b830cf5d1fbb45a3e363b0487459b08b17457b9ee8dc96c9a0d9af100edd0b'
     OR source_url = 'https://unjobs.org/vacancies/1781248453040'
     OR apply_url = 'https://unjobs.org/vacancies/1781248453040'
     OR (lower(title) = lower('Senior Admin Project Associate - Protection, Erbil, Iraq') AND lower(COALESCE(organization, '')) = lower('IOM - International Organization for Migration'))
);

INSERT INTO opportunity_candidates (
  id, source_id, title, organization, category, description, summary, eligibility,
  deadline, published_date, apply_url, source_url, image_url, country,
  governorate, city, language, salary_or_funding, confidence_score,
  duplicate_key, status, rejection_reason
)
SELECT
  'phase2-unjobs-1781248466478', NULL, 'Senior Project Associate (MG), Erbil, Iraq', 'IOM - International Organization for Migration', 'job',
  'Vacancy listed for Iraq by IOM - International Organization for Migration. Deadline unknown; admin must verify deadline before approval.',
  'Vacancy listed for Iraq by IOM - International Organization for Migration. Admin must verify deadline before approval.',
  NULL, NULL, NULL,
  'https://unjobs.org/vacancies/1781248466478',
  'https://unjobs.org/vacancies/1781248466478',
  NULL, 'Iraq', 'Erbil', 'Erbil', 'en', NULL, 82,
  'd9df4507419222f0b241c07d4980aedfacdeddd1ad28a8523d41644296147fec',
  'pending_review', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM opportunity_candidates
  WHERE duplicate_key = 'd9df4507419222f0b241c07d4980aedfacdeddd1ad28a8523d41644296147fec'
     OR source_url = 'https://unjobs.org/vacancies/1781248466478'
     OR apply_url = 'https://unjobs.org/vacancies/1781248466478'
     OR (lower(title) = lower('Senior Project Associate (MG), Erbil, Iraq') AND lower(COALESCE(organization, '')) = lower('IOM - International Organization for Migration'))
) AND NOT EXISTS (
  SELECT 1 FROM highlight_items
  WHERE duplicate_key = 'd9df4507419222f0b241c07d4980aedfacdeddd1ad28a8523d41644296147fec'
     OR source_url = 'https://unjobs.org/vacancies/1781248466478'
     OR apply_url = 'https://unjobs.org/vacancies/1781248466478'
     OR (lower(title) = lower('Senior Project Associate (MG), Erbil, Iraq') AND lower(COALESCE(organization, '')) = lower('IOM - International Organization for Migration'))
);

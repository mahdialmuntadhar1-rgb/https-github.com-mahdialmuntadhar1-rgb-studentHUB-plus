SELECT 'highlight_items' AS table_name, id, title, organization, category, status, source_url, apply_url, duplicate_key
FROM highlight_items
WHERE duplicate_key IN (
  '4846728b5b6f4291a7da55c7129009ea722417d05d31a4ba6527dce0a7333393',
  'e0c18daf9edf7acaf803909dbf50dd67dfceb4293cc63f9eee3f31cc41f3b21c',
  '1ccc029d5fc1adca08de438d300b3b30eec3eb059fcdb3788aca0652070aea1e',
  '387ac2ed11756a29a21bac6ddee4d27c9e515e0ff857c5f838a4df558a54824a'
)
OR source_url IN (
  'https://uobasrah.edu.iq/event/782',
  'https://uobasrah.edu.iq/event/777',
  'https://uobasrah.edu.iq/event/776',
  'https://uobasrah.edu.iq/event/779'
)
OR (lower(title) = lower('سير الامتحانات النهائية في كلية الطب البيطري') AND lower(COALESCE(organization, '')) = lower('University of Basrah'))
OR (lower(title) = lower('ندوة علمية بعنوان: أساسيات ومهارات تطبيقات برنامج Microsoft Office في العمل الوظيفي') AND lower(COALESCE(organization, '')) = lower('University of Basrah'))
OR (lower(title) = lower('ندوة علمية بعنوان: مدخل إلى الذكاء الاصطناعي: الشبكات العصبية والتعلم الآلي') AND lower(COALESCE(organization, '')) = lower('University of Basrah'))
OR (lower(title) = lower('ورشة عمل تخصصية بعنوان "التعليم الفعال باستخدام الذكاء الاصطناعي".') AND lower(COALESCE(organization, '')) = lower('University of Basrah'))
UNION ALL
SELECT 'opportunity_candidates', id, title, organization, category, status, source_url, apply_url, duplicate_key
FROM opportunity_candidates
WHERE duplicate_key IN (
  'f6a4b128dc941c0913d317e329d2e18427c49774ca4d44baef5360c39951b7ec',
  '38a9554e9a83ddd86d36ba72650472956d46b4fd11329e9236d0e94a7c0283a5',
  '108404e474b0a317312f5df9086fc77c74857953acc38ccc41afdcd3b2a58c0a',
  'c3e2ea82da3e11a27cc80e1a9a788f895b6b70093525b6fb33619c264ad89c04',
  '63b830cf5d1fbb45a3e363b0487459b08b17457b9ee8dc96c9a0d9af100edd0b',
  'd9df4507419222f0b241c07d4980aedfacdeddd1ad28a8523d41644296147fec'
)
OR source_url IN (
  'https://www.daad-iraq.org/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=88&origin=88&pg=1&tab=&intention=&detail_to_show=57135739',
  'https://www.daad-iraq.org/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=88&origin=88&pg=1&tab=&intention=&detail_to_show=50035295',
  'https://unjobs.org/vacancies/1781248320232',
  'https://unjobs.org/vacancies/1781248440018',
  'https://unjobs.org/vacancies/1781248453040',
  'https://unjobs.org/vacancies/1781248466478'
)
OR apply_url IN (
  'https://www.daad-iraq.org/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=88&origin=88&pg=1&tab=&intention=&detail_to_show=57135739',
  'https://www.daad-iraq.org/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=88&origin=88&pg=1&tab=&intention=&detail_to_show=50035295',
  'https://unjobs.org/vacancies/1781248320232',
  'https://unjobs.org/vacancies/1781248440018',
  'https://unjobs.org/vacancies/1781248453040',
  'https://unjobs.org/vacancies/1781248466478'
)
OR (lower(title) = lower('Doctoral Programmes in Germany') AND lower(COALESCE(organization, '')) = lower('DAAD Iraq'))
OR (lower(title) = lower('University Summer Courses offered in Germany for Foreign Students and Graduates') AND lower(COALESCE(organization, '')) = lower('DAAD Iraq'))
OR (lower(title) = lower('Admin Project Associate - (MG), Baghdad, Iraq') AND lower(COALESCE(organization, '')) = lower('IOM - International Organization for Migration'))
OR (lower(title) = lower('Senior Project Associate (MG), Baghdad, Iraq') AND lower(COALESCE(organization, '')) = lower('IOM - International Organization for Migration'))
OR (lower(title) = lower('Senior Admin Project Associate - Protection, Erbil, Iraq') AND lower(COALESCE(organization, '')) = lower('IOM - International Organization for Migration'))
OR (lower(title) = lower('Senior Project Associate (MG), Erbil, Iraq') AND lower(COALESCE(organization, '')) = lower('IOM - International Organization for Migration'));

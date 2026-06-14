-- Phase 4 expanded insertion. Approved for insertion as pending_review only.
-- Generated from work/phase4-expanded-dry-run-report.json.
-- Guarded against duplicate id, duplicate_key, source_url/apply_url, and same title + organization.

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-uomosul-88661', 'news', 'مجلس جامعة الموصل يناقش مشروع المدينة الطبية الجامعية ودعم البحث العلمي', 'University of Mosul',
  'Nineveh', 'Mosul', NULL, 'University of Mosul',
  'https://uomosul.edu.iq/00-415/', NULL, NULL, NULL,
  'ناقش مجلس جامعة الموصل، خلال جلسته التاسعة عشرة للعام الدراسي 2025–2026 برئاسة الأستاذ الدكتور وحيد محمود الإبراهيمي رئيس الجامعة، عدداً من الملفات الاستراتيجية الهادفة إلى تعزيز البيئة الأكاديمية وتطوير الخدمات الجامعية. وتضمنت الجلسة بحث مشروع المدينة الطبية الجامعية وسبل تفعيل خدماتها، وآليات دعم البحث العلمي والتطوير الأكاديمي، فضلاً عن تجديد عضويات مجالس إدارة المكاتب الاستشارية في الجامعة، وتمديد خدمات عدد من التدريسيين، إلى جانب مناقشة عدد من الفقرات الإدارية والعلمية الأخرى. وأكد المجلس  Published date from source: 2026-06-11.', 'Official University of Mosul dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', '88e0dafe1ae062359a31a6f6f951a903785aa13b73be84b068b78fc5050cc637', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-11. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-uomosul-88661' OR duplicate_key = '88e0dafe1ae062359a31a6f6f951a903785aa13b73be84b068b78fc5050cc637' OR source_url = 'https://uomosul.edu.iq/00-415/' OR ((title = 'مجلس جامعة الموصل يناقش مشروع المدينة الطبية الجامعية ودعم البحث العلمي' AND organization = 'University of Mosul')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-uomosul-88661' OR duplicate_key = '88e0dafe1ae062359a31a6f6f951a903785aa13b73be84b068b78fc5050cc637' OR source_url = 'https://uomosul.edu.iq/00-415/' OR ((title = 'مجلس جامعة الموصل يناقش مشروع المدينة الطبية الجامعية ودعم البحث العلمي' AND organization = 'University of Mosul')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-uomosul-88657', 'news', 'دعوة لنخب جامعة الموصل للمشاركة في مؤتمر الإبداع الفكري', 'University of Mosul',
  'Nineveh', 'Mosul', NULL, 'University of Mosul',
  'https://uomosul.edu.iq/00-414/', NULL, NULL, NULL,
  'وُجّهت دعوة رسمية إلى تدريسيي وباحثي ونخب جامعة الموصل للمشاركة الفاعلة في مؤتمر علمي موسع يُعنى بالإبداع الفكري، وذلك بهدف تسليط الضوء على النتاجات الفكرية المتميزة وتعزيز التعاون الأكاديمي والثقافي. وجاءت الدعوة خلال لقاء جمع وفد جامعة الموصل بوفد مشترك ضم ممثلين عن أمانة مسجد الكوفة المعظم وممثلية العتبة الحسينية المقدسة في محافظة نينوى، حيث أكد الجانبان أهمية دعم الأنشطة العلمية والثقافية وتوسيع آفاق التعاون المشترك. ويهدف المؤتمر إلى استقطاب الكفاءات الأكاديمية والبحثية للمساهمة في إثراء مح Published date from source: 2026-06-10.', 'Official University of Mosul dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', 'c628381557bb59f3aebf71012e1a1448bc12e0f34217a18c23c029871955e81b', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-10. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-uomosul-88657' OR duplicate_key = 'c628381557bb59f3aebf71012e1a1448bc12e0f34217a18c23c029871955e81b' OR source_url = 'https://uomosul.edu.iq/00-414/' OR ((title = 'دعوة لنخب جامعة الموصل للمشاركة في مؤتمر الإبداع الفكري' AND organization = 'University of Mosul')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-uomosul-88657' OR duplicate_key = 'c628381557bb59f3aebf71012e1a1448bc12e0f34217a18c23c029871955e81b' OR source_url = 'https://uomosul.edu.iq/00-414/' OR ((title = 'دعوة لنخب جامعة الموصل للمشاركة في مؤتمر الإبداع الفكري' AND organization = 'University of Mosul')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-uomosul-88654', 'registration', 'خطوة رائدة نحو التميز.. بكالوريوس الحقوق في جامعة الموصل يحصد الاعتماد البرامجي المشروط', 'University of Mosul',
  'Nineveh', 'Mosul', NULL, 'University of Mosul',
  'https://uomosul.edu.iq/00-413/', NULL, NULL, NULL,
  'في إنجاز أكاديمي يضاف إلى سجلها الحافل، نجحت كلية الحقوق في جامعة الموصل بنيل الاعتماد البرامجي المشروط لبرنامج البكالوريوس، محققة بذلك قفزة استراتيجية في مسيرتها التعليمية. ومعززة مكانة الجامعة كمنارة معرفية تسعى لتقديم تعليم قانوني رصين يواكب التطورات الحديثة ويلبي تطلعات المجتمع. ويأتي هذا النجاح تعبيراً عن الحرص الكبير والدعم اللامحدود من قبل رئاسة جامعة الموصل وعمادة كلية الحقوق، وإصرارهما المشترك على الارتقاء بالواقع الأكاديمي وتطبيق أعلى معايير الجودة والاعتمادية. وبما يعكس تضافر جهود الك Published date from source: 2026-06-10.', 'Official University of Mosul dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', '948530d265ee8c98fce57be8a0342a53629c1233a954dcd4575ee8535a534b8d', 84, 'Phase 4 expanded dry-run item. Published date: 2026-06-10. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-uomosul-88654' OR duplicate_key = '948530d265ee8c98fce57be8a0342a53629c1233a954dcd4575ee8535a534b8d' OR source_url = 'https://uomosul.edu.iq/00-413/' OR ((title = 'خطوة رائدة نحو التميز.. بكالوريوس الحقوق في جامعة الموصل يحصد الاعتماد البرامجي المشروط' AND organization = 'University of Mosul')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-uomosul-88654' OR duplicate_key = '948530d265ee8c98fce57be8a0342a53629c1233a954dcd4575ee8535a534b8d' OR source_url = 'https://uomosul.edu.iq/00-413/' OR ((title = 'خطوة رائدة نحو التميز.. بكالوريوس الحقوق في جامعة الموصل يحصد الاعتماد البرامجي المشروط' AND organization = 'University of Mosul')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-uomosul-88651', 'activity', 'إنجاز أكاديمي رائد لجامعة الموصل', 'University of Mosul',
  'Nineveh', 'Mosul', NULL, 'University of Mosul',
  'https://uomosul.edu.iq/00-412/', NULL, NULL, NULL,
  'في خطوة تعكس التميز الأكاديمي والالتزام بمعايير الجودة، حقق قسم البرمجيات في كلية علوم الحاسوب والرياضيات بجامعة الموصل إنجازًا متميزًا بحصوله على الاعتماد البرامجي، ليكون أول قسم برمجيات ينال هذا الاعتماد على مستوى الجامعات العراقية التابعة لمجلس كليات العلوم. ويجسد هذا الإنجاز حرص رئاسة الجامعة ممثلةً بالأستاذ الدكتور وحيد محمود الإبراهيمي، وعمادة الكلية ممثلةً بالأستاذ الدكتورة ضحى بشير، على تطوير البرامج الأكاديمية وفق معايير الجودة والاعتماد، بما يواكب التطورات التكنولوجية الحديثة ويعزز كفا Published date from source: 2026-06-10.', 'Official University of Mosul dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', '23191cbe0d20d0daac4e0298bd7d836e24585feda809e36d03ad480989435616', 84, 'Phase 4 expanded dry-run item. Published date: 2026-06-10. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-uomosul-88651' OR duplicate_key = '23191cbe0d20d0daac4e0298bd7d836e24585feda809e36d03ad480989435616' OR source_url = 'https://uomosul.edu.iq/00-412/' OR ((title = 'إنجاز أكاديمي رائد لجامعة الموصل' AND organization = 'University of Mosul')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-uomosul-88651' OR duplicate_key = '23191cbe0d20d0daac4e0298bd7d836e24585feda809e36d03ad480989435616' OR source_url = 'https://uomosul.edu.iq/00-412/' OR ((title = 'إنجاز أكاديمي رائد لجامعة الموصل' AND organization = 'University of Mosul')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-uomosul-88645', 'activity', 'رئيس جامعة الموصل يبحث إطلاق حملة تشجير واسعة لتعزيز المساحات الخضراء', 'University of Mosul',
  'Nineveh', 'Mosul', NULL, 'University of Mosul',
  'https://uomosul.edu.iq/00-411/', NULL, NULL, NULL,
  'بحث رئيس جامعة الموصل وحيد محمود الإبراهيمي آليات إطلاق حملة تشجير واسعة داخل الحرم الجامعي بالتعاون مع مؤسسة ڕاوەنگە، بهدف استدامة وتوسيع المساحات الخضراء في الجامعة. وأكد الجانبان أهمية تعزيز البيئة الجامعية من خلال زيادة الرقعة الخضراء، بما يسهم في تحسين المشهد الجمالي للحرم الجامعي ودعم الجهود الرامية إلى تحقيق الاستدامة البيئية، فضلاً عن توفير بيئة تعليمية وصحية ملائمة للطلبة ومنتسبي الجامعة. Published date from source: 2026-06-10.', 'Official University of Mosul dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', '360f0fda6ecec533ec62e4fb1c6a3bd669065d4806126393b6a5a978995fce68', 84, 'Phase 4 expanded dry-run item. Published date: 2026-06-10. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-uomosul-88645' OR duplicate_key = '360f0fda6ecec533ec62e4fb1c6a3bd669065d4806126393b6a5a978995fce68' OR source_url = 'https://uomosul.edu.iq/00-411/' OR ((title = 'رئيس جامعة الموصل يبحث إطلاق حملة تشجير واسعة لتعزيز المساحات الخضراء' AND organization = 'University of Mosul')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-uomosul-88645' OR duplicate_key = '360f0fda6ecec533ec62e4fb1c6a3bd669065d4806126393b6a5a978995fce68' OR source_url = 'https://uomosul.edu.iq/00-411/' OR ((title = 'رئيس جامعة الموصل يبحث إطلاق حملة تشجير واسعة لتعزيز المساحات الخضراء' AND organization = 'University of Mosul')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-uomosul-88639', 'news', 'رئيس جامعة الموصل يواصل لقاءاته الأسبوعية مع المنتسبين', 'University of Mosul',
  'Nineveh', 'Mosul', NULL, 'University of Mosul',
  'https://uomosul.edu.iq/00-410/', NULL, NULL, NULL,
  'استقبل رئيس جامعة الموصل وحيد محمود الإبراهيمي، اليوم، عدداً من منتسبي الجامعة ضمن برنامجه الأسبوعي المخصص للاستماع إلى مطالبهم ومتابعة احتياجاتهم الوظيفية والإدارية. وجرت المقابلات بحضور ممثل شعبة شؤون المواطنين، حيث وجّه سيادته الجهات المعنية بدراسة الطلبات المقدمة والعمل على معالجة المعوقات وتذليل العقبات وفق الأطر القانونية والتعليمات النافذة، بما يسهم في تعزيز بيئة العمل وخدمة منتسبي الجامعة. Published date from source: 2026-06-10.', 'Official University of Mosul dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', 'f66616165a3aa2f7fc09ddd91b08c9b08e4906b91cd535eeae64f11ed8381062', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-10. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-uomosul-88639' OR duplicate_key = 'f66616165a3aa2f7fc09ddd91b08c9b08e4906b91cd535eeae64f11ed8381062' OR source_url = 'https://uomosul.edu.iq/00-410/' OR ((title = 'رئيس جامعة الموصل يواصل لقاءاته الأسبوعية مع المنتسبين' AND organization = 'University of Mosul')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-uomosul-88639' OR duplicate_key = 'f66616165a3aa2f7fc09ddd91b08c9b08e4906b91cd535eeae64f11ed8381062' OR source_url = 'https://uomosul.edu.iq/00-410/' OR ((title = 'رئيس جامعة الموصل يواصل لقاءاته الأسبوعية مع المنتسبين' AND organization = 'University of Mosul')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-uomosul-88636', 'news', 'خلال اجتماع المجلس الاستشاري الصناعي المركزي في جامعة الانبار.. وكيل وزارة التعليم يؤكد أهمية تعزيز التكامل بين المؤسسات الأكاديمية والقطاعات الإنتاجية وتوجيه الطاقات البحثية نحو معالجة التحديات التنموية', 'University of Mosul',
  'Nineveh', 'Mosul', NULL, 'University of Mosul',
  'https://uomosul.edu.iq/%d8%ae%d9%84%d8%a7%d9%84-%d8%a7%d8%ac%d8%aa%d9%85%d8%a7%d8%b9-%d8%a7%d9%84%d9%85%d8%ac%d9%84%d8%b3-%d8%a7%d9%84%d8%a7%d8%b3%d8%aa%d8%b4%d8%a7%d8%b1%d9%8a-%d8%a7%d9%84%d8%b5%d9%86%d8%a7%d8%b9%d9%8a/', NULL, NULL, NULL,
  'أكد وكيل وزارة التعليم العالي والبحث العلمي لشؤون البحث العلمي الأستاذ الدكتور حيدر عبد ضهد أهمية تعزيز التكامل بين المؤسسات الأكاديمية والقطاعات الإنتاجية وتوجيه الطاقات البحثية نحو معالجة التحديات التنموية وتلبية احتياجات سوق العمل. وأضاف خلال حضوره اجتماع المجلس الاستشاري الصناعي المركزي في جامعة الانبار أن الهدف الأساسي يتمثل في تحويل الجامعات العراقية من جامعات الجيل الأول والثاني إلى جامعات الجيل الرابع وصولاً إلى الجيل الخامس مستقبلا من خلال تبني انموذج التعليم الصناعي والذكي الذي يواكب ا Published date from source: 2026-06-10.', 'Official University of Mosul dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', '1c99b90dae49da427fb583f3f441fbf9f680e1065dae9a6d6f5c663216c02387', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-10. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-uomosul-88636' OR duplicate_key = '1c99b90dae49da427fb583f3f441fbf9f680e1065dae9a6d6f5c663216c02387' OR source_url = 'https://uomosul.edu.iq/%d8%ae%d9%84%d8%a7%d9%84-%d8%a7%d8%ac%d8%aa%d9%85%d8%a7%d8%b9-%d8%a7%d9%84%d9%85%d8%ac%d9%84%d8%b3-%d8%a7%d9%84%d8%a7%d8%b3%d8%aa%d8%b4%d8%a7%d8%b1%d9%8a-%d8%a7%d9%84%d8%b5%d9%86%d8%a7%d8%b9%d9%8a/' OR ((title = 'خلال اجتماع المجلس الاستشاري الصناعي المركزي في جامعة الانبار.. وكيل وزارة التعليم يؤكد أهمية تعزيز التكامل بين المؤسسات الأكاديمية والقطاعات الإنتاجية وتوجيه الطاقات البحثية نحو معالجة التحديات التنموية' AND organization = 'University of Mosul')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-uomosul-88636' OR duplicate_key = '1c99b90dae49da427fb583f3f441fbf9f680e1065dae9a6d6f5c663216c02387' OR source_url = 'https://uomosul.edu.iq/%d8%ae%d9%84%d8%a7%d9%84-%d8%a7%d8%ac%d8%aa%d9%85%d8%a7%d8%b9-%d8%a7%d9%84%d9%85%d8%ac%d9%84%d8%b3-%d8%a7%d9%84%d8%a7%d8%b3%d8%aa%d8%b4%d8%a7%d8%b1%d9%8a-%d8%a7%d9%84%d8%b5%d9%86%d8%a7%d8%b9%d9%8a/' OR ((title = 'خلال اجتماع المجلس الاستشاري الصناعي المركزي في جامعة الانبار.. وكيل وزارة التعليم يؤكد أهمية تعزيز التكامل بين المؤسسات الأكاديمية والقطاعات الإنتاجية وتوجيه الطاقات البحثية نحو معالجة التحديات التنموية' AND organization = 'University of Mosul')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-uomosul-88633', 'registration', 'تنويه', 'University of Mosul',
  'Nineveh', 'Mosul', NULL, 'University of Mosul',
  'https://uomosul.edu.iq/%d8%aa%d9%86%d9%88%d9%8a%d9%87-27/', NULL, NULL, NULL,
  'تنوه وزارة التعليم العالي والبحث العلمي إلى إيقاف التقديم إلى المنظومة الإلكترونية لدائرة البعثات والعلاقات الثقافية ابتداءً من يوم الأربعاء الموافق 2026/6/10 ولغاية يوم السبت الموافق 2026/6/20وذلك لأغراض الصيانة وتحديث البيانات. دائرة الإعلام والاتصال الحكومي وزارة التعليم العالي والبحث العلمي 9 حزيران 2026 Published date from source: 2026-06-10.', 'Official University of Mosul dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', '672c87913d4428d4cf7b07fdceb218e235efe16b31ec7de21593c0e849846bc7', 84, 'Phase 4 expanded dry-run item. Published date: 2026-06-10. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-uomosul-88633' OR duplicate_key = '672c87913d4428d4cf7b07fdceb218e235efe16b31ec7de21593c0e849846bc7' OR source_url = 'https://uomosul.edu.iq/%d8%aa%d9%86%d9%88%d9%8a%d9%87-27/' OR ((title = 'تنويه' AND organization = 'University of Mosul')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-uomosul-88633' OR duplicate_key = '672c87913d4428d4cf7b07fdceb218e235efe16b31ec7de21593c0e849846bc7' OR source_url = 'https://uomosul.edu.iq/%d8%aa%d9%86%d9%88%d9%8a%d9%87-27/' OR ((title = 'تنويه' AND organization = 'University of Mosul')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-uomosul-88627', 'registration', 'التعليم: تمديد التقديم للدراسات العليا داخل العراق للعام الدراسي 2027/2026', 'University of Mosul',
  'Nineveh', 'Mosul', NULL, 'University of Mosul',
  'https://uomosul.edu.iq/%d8%a7%d9%84%d8%aa%d8%b9%d9%84%d9%8a%d9%85-%d8%aa%d9%85%d8%af%d9%8a%d8%af-%d8%a7%d9%84%d8%aa%d9%82%d8%af%d9%8a%d9%85-%d9%84%d9%84%d8%af%d8%b1%d8%a7%d8%b3%d8%a7%d8%aa-%d8%a7%d9%84%d8%b9%d9%84%d9%8a/', NULL, NULL, NULL,
  'تعلن وزارة التعليم العالي والبحث العلمي، تمديد فترة التقديم إلى الدراسات العليا داخل العراق للعام الدراسي 2027/2026، ليكون آخر موعد للتقديم يوم الاحد الموافق 2026/6/21، وتغيير تاريخ انتهاء التدقيق ليكون يوم الخميس الموافق 2026/6/25. وتدعو وزارة التعليم الراغبين بالتقديم الى استثمار التمديد لاستكمال متطلبات التقديم ضمن التوقيتات المحددة. دائرة الإعلام والاتصال الحكومي وزارة التعليم العالي والبحث العلمي 8 حزيران 2026 Published date from source: 2026-06-10.', 'Official University of Mosul dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', '3a6ed087585ca36ffe256ca37239b9ba9ff189597e9bba304df6d443addd8e4a', 84, 'Phase 4 expanded dry-run item. Published date: 2026-06-10. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-uomosul-88627' OR duplicate_key = '3a6ed087585ca36ffe256ca37239b9ba9ff189597e9bba304df6d443addd8e4a' OR source_url = 'https://uomosul.edu.iq/%d8%a7%d9%84%d8%aa%d8%b9%d9%84%d9%8a%d9%85-%d8%aa%d9%85%d8%af%d9%8a%d8%af-%d8%a7%d9%84%d8%aa%d9%82%d8%af%d9%8a%d9%85-%d9%84%d9%84%d8%af%d8%b1%d8%a7%d8%b3%d8%a7%d8%aa-%d8%a7%d9%84%d8%b9%d9%84%d9%8a/' OR ((title = 'التعليم: تمديد التقديم للدراسات العليا داخل العراق للعام الدراسي 2027/2026' AND organization = 'University of Mosul')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-uomosul-88627' OR duplicate_key = '3a6ed087585ca36ffe256ca37239b9ba9ff189597e9bba304df6d443addd8e4a' OR source_url = 'https://uomosul.edu.iq/%d8%a7%d9%84%d8%aa%d8%b9%d9%84%d9%8a%d9%85-%d8%aa%d9%85%d8%af%d9%8a%d8%af-%d8%a7%d9%84%d8%aa%d9%82%d8%af%d9%8a%d9%85-%d9%84%d9%84%d8%af%d8%b1%d8%a7%d8%b3%d8%a7%d8%aa-%d8%a7%d9%84%d8%b9%d9%84%d9%8a/' OR ((title = 'التعليم: تمديد التقديم للدراسات العليا داخل العراق للعام الدراسي 2027/2026' AND organization = 'University of Mosul')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-uomosul-88624', 'registration', 'بخطواتٍ واثقة نحو المستقبل صادقنا اليوم على استحداث "نوادي هندسة الذكاء الاصطناعي" في جامعاتنا بعد استحداث عشر كلياتٍ للذكاء الاصطناعي، وهي ركيزة جديدة لتمكين شبابنا في صياغة الغد الرقمي.', 'University of Mosul',
  'Nineveh', 'Mosul', NULL, 'University of Mosul',
  'https://uomosul.edu.iq/%d8%a8%d8%ae%d8%b7%d9%88%d8%a7%d8%aa%d9%8d-%d9%88%d8%a7%d8%ab%d9%82%d8%a9-%d9%86%d8%ad%d9%88-%d8%a7%d9%84%d9%85%d8%b3%d8%aa%d9%82%d8%a8%d9%84-%d8%b5%d8%a7%d8%af%d9%82%d9%86%d8%a7-%d8%a7%d9%84%d9%8a/', NULL, NULL, NULL,
  'مبارك لجامعات: كربلاء وبابل والتقنية الجنوبية والفارابي وكلية الحسين "ع" الجامعة، وبانتظار اكتمال المتطلبات في جامعات ذي قار وسومر والشطرة والعين لتلتحق بالركب. كل التقدير لجامعتي بغداد والتكنولوجية على ريادتهما وتقديم النموذج الأكاديمي الملهم. ان بناء الكفاءات الرقمية الوطنية هو استثمارنا الأسمى لتعزيز مكانة العراق في خارطة الاقتصاد المعرفي العالمي. الدكتور عبد الحسين الموسوي وزير التعليم العالي والبحث العلمي وكالةً 8 حزيران 2026 #الذكاء_الاصطناعي #التحول_الرقمي #التعليم_العالي #وزارة_التعليم_ا Published date from source: 2026-06-10.', 'Official University of Mosul dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', '8ec9291ff627fffef12c29332819f23565988c92094760b03210496d31f2ae53', 84, 'Phase 4 expanded dry-run item. Published date: 2026-06-10. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-uomosul-88624' OR duplicate_key = '8ec9291ff627fffef12c29332819f23565988c92094760b03210496d31f2ae53' OR source_url = 'https://uomosul.edu.iq/%d8%a8%d8%ae%d8%b7%d9%88%d8%a7%d8%aa%d9%8d-%d9%88%d8%a7%d8%ab%d9%82%d8%a9-%d9%86%d8%ad%d9%88-%d8%a7%d9%84%d9%85%d8%b3%d8%aa%d9%82%d8%a8%d9%84-%d8%b5%d8%a7%d8%af%d9%82%d9%86%d8%a7-%d8%a7%d9%84%d9%8a/' OR ((title = 'بخطواتٍ واثقة نحو المستقبل صادقنا اليوم على استحداث "نوادي هندسة الذكاء الاصطناعي" في جامعاتنا بعد استحداث عشر كلياتٍ للذكاء الاصطناعي، وهي ركيزة جديدة لتمكين شبابنا في صياغة الغد الرقمي.' AND organization = 'University of Mosul')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-uomosul-88624' OR duplicate_key = '8ec9291ff627fffef12c29332819f23565988c92094760b03210496d31f2ae53' OR source_url = 'https://uomosul.edu.iq/%d8%a8%d8%ae%d8%b7%d9%88%d8%a7%d8%aa%d9%8d-%d9%88%d8%a7%d8%ab%d9%82%d8%a9-%d9%86%d8%ad%d9%88-%d8%a7%d9%84%d9%85%d8%b3%d8%aa%d9%82%d8%a8%d9%84-%d8%b5%d8%a7%d8%af%d9%82%d9%86%d8%a7-%d8%a7%d9%84%d9%8a/' OR ((title = 'بخطواتٍ واثقة نحو المستقبل صادقنا اليوم على استحداث "نوادي هندسة الذكاء الاصطناعي" في جامعاتنا بعد استحداث عشر كلياتٍ للذكاء الاصطناعي، وهي ركيزة جديدة لتمكين شبابنا في صياغة الغد الرقمي.' AND organization = 'University of Mosul')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-epu-62928', 'news', 'سەرۆکی زانکۆ بەشداریی لە یادی رۆژی نیشتمانی رووسیا دەکات', 'Erbil Polytechnic University',
  'Erbil', 'Erbil', NULL, 'Erbil Polytechnic University',
  'https://epu.edu.iq/ku/2026/06/12/%d8%b3%db%95%d8%b1%db%86%da%a9%db%8c-%d8%b2%d8%a7%d9%86%da%a9%db%86-%d8%a8%db%95%d8%b4%d8%af%d8%a7%d8%b1%db%8c%db%8c-%d9%84%db%95-%db%8c%d8%a7%d8%af%db%8c-%d8%b1%db%86%da%98%db%8c-%d9%86%db%8c%d8%b4/', NULL, NULL, NULL,
  'لەسەر بانگهێشتی فەرمی کۆنسوڵخانەی گشتیی رووسیای فیدڕاڵ لە هەرێمی کوردستان، شاندێکی زانکۆمان بە سەرۆکایەتی سەرۆکی زانکۆ پ.د.ئیدریس محەمەدتاهیر هەرکی و ... Continue reading سەرۆکی زانکۆ بەشداریی لە یادی رۆژی نیشتمانی رووسیا دەکات Published date from source: 2026-06-12.', 'Official Erbil Polytechnic University dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', '2459491ba8bcd66bb92b8b06f4ae0a8c4eb8e78d6a803736526fce9a2762ea1c', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-12. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-epu-62928' OR duplicate_key = '2459491ba8bcd66bb92b8b06f4ae0a8c4eb8e78d6a803736526fce9a2762ea1c' OR source_url = 'https://epu.edu.iq/ku/2026/06/12/%d8%b3%db%95%d8%b1%db%86%da%a9%db%8c-%d8%b2%d8%a7%d9%86%da%a9%db%86-%d8%a8%db%95%d8%b4%d8%af%d8%a7%d8%b1%db%8c%db%8c-%d9%84%db%95-%db%8c%d8%a7%d8%af%db%8c-%d8%b1%db%86%da%98%db%8c-%d9%86%db%8c%d8%b4/' OR ((title = 'سەرۆکی زانکۆ بەشداریی لە یادی رۆژی نیشتمانی رووسیا دەکات' AND organization = 'Erbil Polytechnic University')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-epu-62928' OR duplicate_key = '2459491ba8bcd66bb92b8b06f4ae0a8c4eb8e78d6a803736526fce9a2762ea1c' OR source_url = 'https://epu.edu.iq/ku/2026/06/12/%d8%b3%db%95%d8%b1%db%86%da%a9%db%8c-%d8%b2%d8%a7%d9%86%da%a9%db%86-%d8%a8%db%95%d8%b4%d8%af%d8%a7%d8%b1%db%8c%db%8c-%d9%84%db%95-%db%8c%d8%a7%d8%af%db%8c-%d8%b1%db%86%da%98%db%8c-%d9%86%db%8c%d8%b4/' OR ((title = 'سەرۆکی زانکۆ بەشداریی لە یادی رۆژی نیشتمانی رووسیا دەکات' AND organization = 'Erbil Polytechnic University')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-epu-62909', 'news', 'سەرۆکی زانکۆ پڕۆژەکانی کەمپی دوو بەسەردەکاتەوە', 'Erbil Polytechnic University',
  'Erbil', 'Erbil', NULL, 'Erbil Polytechnic University',
  'https://epu.edu.iq/ku/2026/06/11/%d8%b3%db%95%d8%b1%db%86%da%a9%db%8c-%d8%b2%d8%a7%d9%86%da%a9%db%86-%d9%be%da%95%db%86%da%98%db%95%da%a9%d8%a7%d9%86%db%8c-%da%a9%db%95%d9%85%d9%be%db%8c-%d8%af%d9%88%d9%88-%d8%a8%db%95%d8%b3%db%95/', NULL, NULL, NULL,
  'بە مەبەستی لە نزیکەوە ئاگاداربوون و بەداواداچوونی راستەوخۆ بۆ چۆنییەتی بەڕێوەچوونی پڕۆژەکانی زانکۆمان، پ.د.ئیدریس محەمەدتاهیر هەرکی سەرۆکی زانکۆی پۆلیتەکنیکی هەولێر ... Continue reading سەرۆکی زانکۆ پڕۆژەکانی کەمپی دوو بەسەردەکاتەوە Published date from source: 2026-06-11.', 'Official Erbil Polytechnic University dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', 'd67990486fd5a5aff57d5778b861e25f36a0c251d185e01a3ceb349acd28303d', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-11. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-epu-62909' OR duplicate_key = 'd67990486fd5a5aff57d5778b861e25f36a0c251d185e01a3ceb349acd28303d' OR source_url = 'https://epu.edu.iq/ku/2026/06/11/%d8%b3%db%95%d8%b1%db%86%da%a9%db%8c-%d8%b2%d8%a7%d9%86%da%a9%db%86-%d9%be%da%95%db%86%da%98%db%95%da%a9%d8%a7%d9%86%db%8c-%da%a9%db%95%d9%85%d9%be%db%8c-%d8%af%d9%88%d9%88-%d8%a8%db%95%d8%b3%db%95/' OR ((title = 'سەرۆکی زانکۆ پڕۆژەکانی کەمپی دوو بەسەردەکاتەوە' AND organization = 'Erbil Polytechnic University')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-epu-62909' OR duplicate_key = 'd67990486fd5a5aff57d5778b861e25f36a0c251d185e01a3ceb349acd28303d' OR source_url = 'https://epu.edu.iq/ku/2026/06/11/%d8%b3%db%95%d8%b1%db%86%da%a9%db%8c-%d8%b2%d8%a7%d9%86%da%a9%db%86-%d9%be%da%95%db%86%da%98%db%95%da%a9%d8%a7%d9%86%db%8c-%da%a9%db%95%d9%85%d9%be%db%8c-%d8%af%d9%88%d9%88-%d8%a8%db%95%d8%b3%db%95/' OR ((title = 'سەرۆکی زانکۆ پڕۆژەکانی کەمپی دوو بەسەردەکاتەوە' AND organization = 'Erbil Polytechnic University')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-epu-62901', 'news', 'سەرۆکی زانکۆ سەردانی کۆلیژی تەکنیکی کارگێری دەکات و بەشداریی لە تاوتوێکردنی ماستەرنامەیەک دەکات', 'Erbil Polytechnic University',
  'Erbil', 'Erbil', NULL, 'Erbil Polytechnic University',
  'https://epu.edu.iq/ku/2026/06/11/%d8%b3%db%95%d8%b1%db%86%da%a9%db%8c-%d8%b2%d8%a7%d9%86%da%a9%db%86-%d8%b3%db%95%d8%b1%d8%af%d8%a7%d9%86%db%8c-%da%a9%db%86%d9%84%db%8c%da%98%db%8c-%d8%aa%db%95%da%a9%d9%86%db%8c%da%a9%db%8c-%da%a9/', NULL, NULL, NULL,
  'پ.د.ئیدریس محمد تاهیر هەرکی، سەرۆکی زانکۆی پۆلیتەکنیکی هەولێر سەردانی کۆلیژی تەکنیکی کارگێری کرد و لەلایەن پ.ی.د.محسن شریف صالح راگری جکۆلێژی ... Continue reading سەرۆکی زانکۆ سەردانی کۆلیژی تەکنیکی کارگێری دەکات و بەشداریی لە تاوتوێکردنی ماستەرنامەیەک دەکات Published date from source: 2026-06-11.', 'Official Erbil Polytechnic University dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', 'ecaf7d9520b21e321a74196e79fed714bc062f9ca38c864b27cd839d80c9d4fd', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-11. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-epu-62901' OR duplicate_key = 'ecaf7d9520b21e321a74196e79fed714bc062f9ca38c864b27cd839d80c9d4fd' OR source_url = 'https://epu.edu.iq/ku/2026/06/11/%d8%b3%db%95%d8%b1%db%86%da%a9%db%8c-%d8%b2%d8%a7%d9%86%da%a9%db%86-%d8%b3%db%95%d8%b1%d8%af%d8%a7%d9%86%db%8c-%da%a9%db%86%d9%84%db%8c%da%98%db%8c-%d8%aa%db%95%da%a9%d9%86%db%8c%da%a9%db%8c-%da%a9/' OR ((title = 'سەرۆکی زانکۆ سەردانی کۆلیژی تەکنیکی کارگێری دەکات و بەشداریی لە تاوتوێکردنی ماستەرنامەیەک دەکات' AND organization = 'Erbil Polytechnic University')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-epu-62901' OR duplicate_key = 'ecaf7d9520b21e321a74196e79fed714bc062f9ca38c864b27cd839d80c9d4fd' OR source_url = 'https://epu.edu.iq/ku/2026/06/11/%d8%b3%db%95%d8%b1%db%86%da%a9%db%8c-%d8%b2%d8%a7%d9%86%da%a9%db%86-%d8%b3%db%95%d8%b1%d8%af%d8%a7%d9%86%db%8c-%da%a9%db%86%d9%84%db%8c%da%98%db%8c-%d8%aa%db%95%da%a9%d9%86%db%8c%da%a9%db%8c-%da%a9/' OR ((title = 'سەرۆکی زانکۆ سەردانی کۆلیژی تەکنیکی کارگێری دەکات و بەشداریی لە تاوتوێکردنی ماستەرنامەیەک دەکات' AND organization = 'Erbil Polytechnic University')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-epu-62890', 'news', 'سەرۆکی زانکۆ سەردانی کۆلێژی تەکنیکی سۆران دەکات', 'Erbil Polytechnic University',
  'Erbil', 'Erbil', NULL, 'Erbil Polytechnic University',
  'https://epu.edu.iq/ku/2026/06/10/%d8%b3%db%95%d8%b1%db%86%da%a9%db%8c-%d8%b2%d8%a7%d9%86%da%a9%db%86-%d8%b3%db%95%d8%b1%d8%af%d8%a7%d9%86%db%8c-%da%a9%db%86%d9%84%db%8e%da%98%db%8c-%d8%aa%db%95%da%a9%d9%86%db%8c%da%a9%db%8c-%d8%b3-3/', NULL, NULL, NULL,
  'ئەمڕۆ چوارشەممە، ٢٠٢٦/٦/١۰، لەپێناو بەرزکردنەوەی ئاستی زانستی و پشتیوانیکردنی پڕۆژە خزمەتگوزارییەکان، پ.د. ئیدریس محەمەدتاهیر هەرکی سەرۆکی زانکۆی پۆلیتەکنیکی هەولێر، بەسەرکردنەوەیەکی ... Continue reading سەرۆکی زانکۆ سەردانی کۆلێژی تەکنیکی سۆران دەکات Published date from source: 2026-06-10.', 'Official Erbil Polytechnic University dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', '6388a7fb5a9e5992114fcea8da1bb989eb21ebe41d553c489b110c0c74f64bd4', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-10. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-epu-62890' OR duplicate_key = '6388a7fb5a9e5992114fcea8da1bb989eb21ebe41d553c489b110c0c74f64bd4' OR source_url = 'https://epu.edu.iq/ku/2026/06/10/%d8%b3%db%95%d8%b1%db%86%da%a9%db%8c-%d8%b2%d8%a7%d9%86%da%a9%db%86-%d8%b3%db%95%d8%b1%d8%af%d8%a7%d9%86%db%8c-%da%a9%db%86%d9%84%db%8e%da%98%db%8c-%d8%aa%db%95%da%a9%d9%86%db%8c%da%a9%db%8c-%d8%b3-3/' OR ((title = 'سەرۆکی زانکۆ سەردانی کۆلێژی تەکنیکی سۆران دەکات' AND organization = 'Erbil Polytechnic University')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-epu-62890' OR duplicate_key = '6388a7fb5a9e5992114fcea8da1bb989eb21ebe41d553c489b110c0c74f64bd4' OR source_url = 'https://epu.edu.iq/ku/2026/06/10/%d8%b3%db%95%d8%b1%db%86%da%a9%db%8c-%d8%b2%d8%a7%d9%86%da%a9%db%86-%d8%b3%db%95%d8%b1%d8%af%d8%a7%d9%86%db%8c-%da%a9%db%86%d9%84%db%8e%da%98%db%8c-%d8%aa%db%95%da%a9%d9%86%db%8c%da%a9%db%8c-%d8%b3-3/' OR ((title = 'سەرۆکی زانکۆ سەردانی کۆلێژی تەکنیکی سۆران دەکات' AND organization = 'Erbil Polytechnic University')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-epu-62856', 'news', 'سەرۆکی زانکۆ سەردانی پەیمانگەی تەکنیکی مێرگەسۆر دەکات', 'Erbil Polytechnic University',
  'Erbil', 'Erbil', NULL, 'Erbil Polytechnic University',
  'https://epu.edu.iq/ku/2026/06/10/%d8%b3%db%95%d8%b1%db%86%da%a9%db%8c-%d8%b2%d8%a7%d9%86%da%a9%db%86-%d8%b3%db%95%d8%b1%d8%af%d8%a7%d9%86%db%8c-%d9%be%db%95%db%8c%d9%85%d8%a7%d9%86%da%af%db%95%db%8c-%d8%aa%db%95%da%a9%d9%86%db%8c/', NULL, NULL, NULL,
  'ڕۆژی چوارشەممە 10ـی حوزەیرانی 2026 پ.د.ئیدریس محەمەدتاهیر هەرکی سەرۆکی زانکۆی پۆلیتەکنیکی هەولێر سەردانی پەیمانگەی تەکنیکی مێرگەسۆری کرد و لەلایەن پ.ی.د ... Continue reading سەرۆکی زانکۆ سەردانی پەیمانگەی تەکنیکی مێرگەسۆر دەکات Published date from source: 2026-06-10.', 'Official Erbil Polytechnic University dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', 'd901be0491ba49ff80aa9370813410531be385a6c6bf98f1fb452b9ec8e962c8', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-10. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-epu-62856' OR duplicate_key = 'd901be0491ba49ff80aa9370813410531be385a6c6bf98f1fb452b9ec8e962c8' OR source_url = 'https://epu.edu.iq/ku/2026/06/10/%d8%b3%db%95%d8%b1%db%86%da%a9%db%8c-%d8%b2%d8%a7%d9%86%da%a9%db%86-%d8%b3%db%95%d8%b1%d8%af%d8%a7%d9%86%db%8c-%d9%be%db%95%db%8c%d9%85%d8%a7%d9%86%da%af%db%95%db%8c-%d8%aa%db%95%da%a9%d9%86%db%8c/' OR ((title = 'سەرۆکی زانکۆ سەردانی پەیمانگەی تەکنیکی مێرگەسۆر دەکات' AND organization = 'Erbil Polytechnic University')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-epu-62856' OR duplicate_key = 'd901be0491ba49ff80aa9370813410531be385a6c6bf98f1fb452b9ec8e962c8' OR source_url = 'https://epu.edu.iq/ku/2026/06/10/%d8%b3%db%95%d8%b1%db%86%da%a9%db%8c-%d8%b2%d8%a7%d9%86%da%a9%db%86-%d8%b3%db%95%d8%b1%d8%af%d8%a7%d9%86%db%8c-%d9%be%db%95%db%8c%d9%85%d8%a7%d9%86%da%af%db%95%db%8c-%d8%aa%db%95%da%a9%d9%86%db%8c/' OR ((title = 'سەرۆکی زانکۆ سەردانی پەیمانگەی تەکنیکی مێرگەسۆر دەکات' AND organization = 'Erbil Polytechnic University')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-epu-62836', 'news', 'A handover ceremony for the prosthetic hand and supportive devices was held between Erbil Polytechnic University and the International Committee of the Red Cross.', 'Erbil Polytechnic University',
  'Erbil', 'Erbil', NULL, 'Erbil Polytechnic University',
  'https://epu.edu.iq/2026/06/10/a-handover-ceremony-for-the-prosthetic-hand-and-supportive-devices-was-held-between-erbil-polytechnic-university-and-the-international-committee-of-the-red-cross/', NULL, NULL, NULL,
  'Professor Dr. Edrees Mohammed Tahir Herki, Rector of Erbil Polytechnic University, welcomed a delegation from the International Committee of the ... Continue reading A handover ceremony for the prosthetic hand and supportive devices was held between Erbil Polytechnic University and the International Committee of the Red Cross. Published date from source: 2026-06-10.', 'Official Erbil Polytechnic University dated 2026 post with a specific non-generic title.', NULL, 'en',
  'pending_review', 'f866a08f3374c302da063d80e29201b47786f86975ef977e121650d7e60af5cc', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-10. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-epu-62836' OR duplicate_key = 'f866a08f3374c302da063d80e29201b47786f86975ef977e121650d7e60af5cc' OR source_url = 'https://epu.edu.iq/2026/06/10/a-handover-ceremony-for-the-prosthetic-hand-and-supportive-devices-was-held-between-erbil-polytechnic-university-and-the-international-committee-of-the-red-cross/' OR ((title = 'A handover ceremony for the prosthetic hand and supportive devices was held between Erbil Polytechnic University and the International Committee of the Red Cross.' AND organization = 'Erbil Polytechnic University')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-epu-62836' OR duplicate_key = 'f866a08f3374c302da063d80e29201b47786f86975ef977e121650d7e60af5cc' OR source_url = 'https://epu.edu.iq/2026/06/10/a-handover-ceremony-for-the-prosthetic-hand-and-supportive-devices-was-held-between-erbil-polytechnic-university-and-the-international-committee-of-the-red-cross/' OR ((title = 'A handover ceremony for the prosthetic hand and supportive devices was held between Erbil Polytechnic University and the International Committee of the Red Cross.' AND organization = 'Erbil Polytechnic University')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-epu-62823', 'news', 'زانکۆی پۆلیتەکنیکی ھەولێر بە ھەماھەنگی دەزگای خێرخوازی بارزانی خولێکی ڕاھێنان بۆ مامۆستایان و بەرپرسی تەندروستی و سەلامەتی کۆلێژ و پەیمانگەکان دەکاتەوە', 'Erbil Polytechnic University',
  'Erbil', 'Erbil', NULL, 'Erbil Polytechnic University',
  'https://epu.edu.iq/ku/2026/06/09/%d8%b2%d8%a7%d9%86%da%a9%db%86%db%8c-%d9%be%db%86%d9%84%db%8c%d8%aa%db%95%da%a9%d9%86%db%8c%da%a9%db%8c-%da%be%db%95%d9%88%d9%84%db%8e%d8%b1-%d8%a8%db%95-%da%be%db%95%d9%85%d8%a7%da%be%db%95%d9%86/', NULL, NULL, NULL,
  'سەرۆکایەتی زانکۆی پۆلیتەکنیکی ھەولێر بە ھەماھەنگی دەزگای خێرخوازی بارزانی خولێکی ڕاھێنان بۆ مامۆستایان و بەرپرسانی تەندروستی و سەلامەتی کۆلێژ و ... Continue reading زانکۆی پۆلیتەکنیکی ھەولێر بە ھەماھەنگی دەزگای خێرخوازی بارزانی خولێکی ڕاھێنان بۆ مامۆستایان و بەرپرسی تەندروستی و سەلامەتی کۆلێژ و پەیمانگەکان دەکاتەوە Published date from source: 2026-06-09.', 'Official Erbil Polytechnic University dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', 'e3ac86fbe7a577a4dfe0aec0653c8094cdafb4c1753fea8c44cb4a4901aeeb5e', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-09. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-epu-62823' OR duplicate_key = 'e3ac86fbe7a577a4dfe0aec0653c8094cdafb4c1753fea8c44cb4a4901aeeb5e' OR source_url = 'https://epu.edu.iq/ku/2026/06/09/%d8%b2%d8%a7%d9%86%da%a9%db%86%db%8c-%d9%be%db%86%d9%84%db%8c%d8%aa%db%95%da%a9%d9%86%db%8c%da%a9%db%8c-%da%be%db%95%d9%88%d9%84%db%8e%d8%b1-%d8%a8%db%95-%da%be%db%95%d9%85%d8%a7%da%be%db%95%d9%86/' OR ((title = 'زانکۆی پۆلیتەکنیکی ھەولێر بە ھەماھەنگی دەزگای خێرخوازی بارزانی خولێکی ڕاھێنان بۆ مامۆستایان و بەرپرسی تەندروستی و سەلامەتی کۆلێژ و پەیمانگەکان دەکاتەوە' AND organization = 'Erbil Polytechnic University')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-epu-62823' OR duplicate_key = 'e3ac86fbe7a577a4dfe0aec0653c8094cdafb4c1753fea8c44cb4a4901aeeb5e' OR source_url = 'https://epu.edu.iq/ku/2026/06/09/%d8%b2%d8%a7%d9%86%da%a9%db%86%db%8c-%d9%be%db%86%d9%84%db%8c%d8%aa%db%95%da%a9%d9%86%db%8c%da%a9%db%8c-%da%be%db%95%d9%88%d9%84%db%8e%d8%b1-%d8%a8%db%95-%da%be%db%95%d9%85%d8%a7%da%be%db%95%d9%86/' OR ((title = 'زانکۆی پۆلیتەکنیکی ھەولێر بە ھەماھەنگی دەزگای خێرخوازی بارزانی خولێکی ڕاھێنان بۆ مامۆستایان و بەرپرسی تەندروستی و سەلامەتی کۆلێژ و پەیمانگەکان دەکاتەوە' AND organization = 'Erbil Polytechnic University')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-epu-62789', 'activity', 'A lecturer from our university participated as an ITEC program ambassador in a Data Analysis training course in India.', 'Erbil Polytechnic University',
  'Erbil', 'Erbil', NULL, 'Erbil Polytechnic University',
  'https://epu.edu.iq/2026/06/09/a-lecturer-from-our-university-participated-as-an-itec-program-ambassador-in-a-data-analysis-training-course-in-india/', NULL, NULL, NULL,
  'Lecturer Raybin Star Osman, a lecturer at the Technical Health and Medical College of our university, participated in a training ... Continue reading A lecturer from our university participated as an ITEC program ambassador in a Data Analysis training course in India. Published date from source: 2026-06-09.', 'Official Erbil Polytechnic University dated 2026 post with a specific non-generic title.', NULL, 'en',
  'pending_review', '0fa63deb88ed9ff64e0cf14018ff7a6c0f70cb0d4649f60fa847e70dc5fbf638', 84, 'Phase 4 expanded dry-run item. Published date: 2026-06-09. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-epu-62789' OR duplicate_key = '0fa63deb88ed9ff64e0cf14018ff7a6c0f70cb0d4649f60fa847e70dc5fbf638' OR source_url = 'https://epu.edu.iq/2026/06/09/a-lecturer-from-our-university-participated-as-an-itec-program-ambassador-in-a-data-analysis-training-course-in-india/' OR ((title = 'A lecturer from our university participated as an ITEC program ambassador in a Data Analysis training course in India.' AND organization = 'Erbil Polytechnic University')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-epu-62789' OR duplicate_key = '0fa63deb88ed9ff64e0cf14018ff7a6c0f70cb0d4649f60fa847e70dc5fbf638' OR source_url = 'https://epu.edu.iq/2026/06/09/a-lecturer-from-our-university-participated-as-an-itec-program-ambassador-in-a-data-analysis-training-course-in-india/' OR ((title = 'A lecturer from our university participated as an ITEC program ambassador in a Data Analysis training course in India.' AND organization = 'Erbil Polytechnic University')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-epu-62786', 'news', 'رێوڕەسمی ڕادەستکردنی بەشی پەلی دەستکرد و پاڵپشتەکان لەنێوان زانکۆی پۆلیتەکنیکی هەولێر و کۆمیتەی نێونەتەوەیی خاچی سوور بەڕێوەچوو', 'Erbil Polytechnic University',
  'Erbil', 'Erbil', NULL, 'Erbil Polytechnic University',
  'https://epu.edu.iq/ku/2026/06/08/%d8%b1%db%8e%d9%88%da%95%db%95%d8%b3%d9%85%db%8c-%da%95%d8%a7%d8%af%db%95%d8%b3%d8%aa%da%a9%d8%b1%d8%af%d9%86%db%8c-%d8%a8%db%95%d8%b4%db%8c-%d9%be%db%95%d9%84%db%8c-%d8%af%db%95%d8%b3%d8%aa%da%a9/', NULL, NULL, NULL,
  'خاچی سوور بەڕێوەچوو پ.د.ئیدریس محەمەدتاهیر هەرکی سەرۆکی زانکۆی پۆلیتەکنیکی هەولێر پێشوازیی لە شاندێکی کۆمیتەی نێونەتەوەیی خاچی سوور ICRC بە سەرۆکایەتی ... Continue reading رێوڕەسمی ڕادەستکردنی بەشی پەلی دەستکرد و پاڵپشتەکان لەنێوان زانکۆی پۆلیتەکنیکی هەولێر و کۆمیتەی نێونەتەوەیی خاچی سوور بەڕێوەچوو Published date from source: 2026-06-08.', 'Official Erbil Polytechnic University dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', '8053c5f71c8551dc2934cfdf4532c8238b74a7534bc47d76751c12d90e23a57d', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-08. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-epu-62786' OR duplicate_key = '8053c5f71c8551dc2934cfdf4532c8238b74a7534bc47d76751c12d90e23a57d' OR source_url = 'https://epu.edu.iq/ku/2026/06/08/%d8%b1%db%8e%d9%88%da%95%db%95%d8%b3%d9%85%db%8c-%da%95%d8%a7%d8%af%db%95%d8%b3%d8%aa%da%a9%d8%b1%d8%af%d9%86%db%8c-%d8%a8%db%95%d8%b4%db%8c-%d9%be%db%95%d9%84%db%8c-%d8%af%db%95%d8%b3%d8%aa%da%a9/' OR ((title = 'رێوڕەسمی ڕادەستکردنی بەشی پەلی دەستکرد و پاڵپشتەکان لەنێوان زانکۆی پۆلیتەکنیکی هەولێر و کۆمیتەی نێونەتەوەیی خاچی سوور بەڕێوەچوو' AND organization = 'Erbil Polytechnic University')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-epu-62786' OR duplicate_key = '8053c5f71c8551dc2934cfdf4532c8238b74a7534bc47d76751c12d90e23a57d' OR source_url = 'https://epu.edu.iq/ku/2026/06/08/%d8%b1%db%8e%d9%88%da%95%db%95%d8%b3%d9%85%db%8c-%da%95%d8%a7%d8%af%db%95%d8%b3%d8%aa%da%a9%d8%b1%d8%af%d9%86%db%8c-%d8%a8%db%95%d8%b4%db%8c-%d9%be%db%95%d9%84%db%8c-%d8%af%db%95%d8%b3%d8%aa%da%a9/' OR ((title = 'رێوڕەسمی ڕادەستکردنی بەشی پەلی دەستکرد و پاڵپشتەکان لەنێوان زانکۆی پۆلیتەکنیکی هەولێر و کۆمیتەی نێونەتەوەیی خاچی سوور بەڕێوەچوو' AND organization = 'Erbil Polytechnic University')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-epu-62766', 'news', 'سەرۆکی زانکۆ هۆڵەکانی تاقیکردنەوەی کۆتایی خولی زمانی ئینگلیزی بەسەردەکاتەوە', 'Erbil Polytechnic University',
  'Erbil', 'Erbil', NULL, 'Erbil Polytechnic University',
  'https://epu.edu.iq/ku/2026/06/08/%d8%b3%db%95%d8%b1%db%86%da%a9%db%8c-%d8%b2%d8%a7%d9%86%da%a9%db%86-%d9%87%db%86%da%b5%db%95%da%a9%d8%a7%d9%86%db%8c-%d8%aa%d8%a7%d9%82%db%8c%da%a9%d8%b1%d8%af%d9%86%db%95%d9%88%db%95%db%8c-%da%a9-4/', NULL, NULL, NULL,
  'پ.د.ئیدریس محەمەدتاهیر هەرکی سەرۆکی زانکۆی پۆلیتەکنیکی هەولێر بەمەبەستی لە نزیکەوە ئاگاداربوون لە چۆنییەتی بەڕێوەچوونی تاقیکردنەوەکانی کۆتایی خولی زمانی ئینگلیزی لە ... Continue reading سەرۆکی زانکۆ هۆڵەکانی تاقیکردنەوەی کۆتایی خولی زمانی ئینگلیزی بەسەردەکاتەوە Published date from source: 2026-06-08.', 'Official Erbil Polytechnic University dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', '6789cad6159e0efb442755ffc0f541b3376a3f0ec43c1b464dd00f4d732e5f36', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-08. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-epu-62766' OR duplicate_key = '6789cad6159e0efb442755ffc0f541b3376a3f0ec43c1b464dd00f4d732e5f36' OR source_url = 'https://epu.edu.iq/ku/2026/06/08/%d8%b3%db%95%d8%b1%db%86%da%a9%db%8c-%d8%b2%d8%a7%d9%86%da%a9%db%86-%d9%87%db%86%da%b5%db%95%da%a9%d8%a7%d9%86%db%8c-%d8%aa%d8%a7%d9%82%db%8c%da%a9%d8%b1%d8%af%d9%86%db%95%d9%88%db%95%db%8c-%da%a9-4/' OR ((title = 'سەرۆکی زانکۆ هۆڵەکانی تاقیکردنەوەی کۆتایی خولی زمانی ئینگلیزی بەسەردەکاتەوە' AND organization = 'Erbil Polytechnic University')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-epu-62766' OR duplicate_key = '6789cad6159e0efb442755ffc0f541b3376a3f0ec43c1b464dd00f4d732e5f36' OR source_url = 'https://epu.edu.iq/ku/2026/06/08/%d8%b3%db%95%d8%b1%db%86%da%a9%db%8c-%d8%b2%d8%a7%d9%86%da%a9%db%86-%d9%87%db%86%da%b5%db%95%da%a9%d8%a7%d9%86%db%8c-%d8%aa%d8%a7%d9%82%db%8c%da%a9%d8%b1%d8%af%d9%86%db%95%d9%88%db%95%db%8c-%da%a9-4/' OR ((title = 'سەرۆکی زانکۆ هۆڵەکانی تاقیکردنەوەی کۆتایی خولی زمانی ئینگلیزی بەسەردەکاتەوە' AND organization = 'Erbil Polytechnic University')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-karbala-50183', 'news', 'رسالة ماجستير في جامعة كربلاء تناقش فاعلية الذكاء العاطفي في تحصيل النصوص الأدبية', 'University of Karbala',
  'Karbala', 'Karbala', NULL, 'University of Karbala',
  'https://uokerbala.edu.iq/archives/50183', NULL, NULL, NULL,
  'ناقشت رسالة ماجستير في كلية التربية للعلوم الإنسانية بجامعة كربلاء "فاعلية سيناريوهات تعليمية قائمة على الذكاء العاطفي في تحصيل طالبات الصف الخامس العلمي للنصوص الأدبية في مادة اللغة العربية"، للباحثة سماح جاسم حميدي حربي الجنابي. هدفت الدراسة إلى التعرّف إلى فاعلية سيناريوهات تعليمية قائمة على الذكاء العاطفي في تحصيل طالبات الصف الخامس العلمي للنصوص [...] Published date from source: 2026-06-11.', 'Official University of Karbala dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', '3c2f60c8e98fe70376a54d2ca77ad249b39440939011ec0208d74a689ff468b7', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-11. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-karbala-50183' OR duplicate_key = '3c2f60c8e98fe70376a54d2ca77ad249b39440939011ec0208d74a689ff468b7' OR source_url = 'https://uokerbala.edu.iq/archives/50183' OR ((title = 'رسالة ماجستير في جامعة كربلاء تناقش فاعلية الذكاء العاطفي في تحصيل النصوص الأدبية' AND organization = 'University of Karbala')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-karbala-50183' OR duplicate_key = '3c2f60c8e98fe70376a54d2ca77ad249b39440939011ec0208d74a689ff468b7' OR source_url = 'https://uokerbala.edu.iq/archives/50183' OR ((title = 'رسالة ماجستير في جامعة كربلاء تناقش فاعلية الذكاء العاطفي في تحصيل النصوص الأدبية' AND organization = 'University of Karbala')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-karbala-50173', 'registration', 'جامعة كربلاء تستعرض مشاريع طلبتها استعدادا للمنافسة في بطولة NURAI 2026', 'University of Karbala',
  'Karbala', 'Karbala', NULL, 'University of Karbala',
  'https://uokerbala.edu.iq/archives/50173', NULL, NULL, NULL,
  'باشرت جامعة كربلاء باجراء مقابلة وتقييم الفرق المشاركة في البطولة الوطنية الجامعية للروبوتات وتطبيقات الذكاء الاصطناعي (NURAI 2026)، وذلك ضمن استعداداتها المتواصلة للمشاركة في هذا المحفل العلمي الوطني، بحضور مساعد رئيس الجامعة للشؤون العلمية الدكتور حيدر محمد عمران ومنسقي البطولة، فضلا عن ممثلي اللجنة الوزارية المشرفة عليها. وتضمنت المقابلات تقديم الفرق المشاركة عروضا تفصيلية [...] Published date from source: 2026-06-11.', 'Official University of Karbala dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', '4d7ab1f692322ae65a45663e543f90f53789e289c6522ecfa50e584bea5a49f0', 84, 'Phase 4 expanded dry-run item. Published date: 2026-06-11. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-karbala-50173' OR duplicate_key = '4d7ab1f692322ae65a45663e543f90f53789e289c6522ecfa50e584bea5a49f0' OR source_url = 'https://uokerbala.edu.iq/archives/50173' OR ((title = 'جامعة كربلاء تستعرض مشاريع طلبتها استعدادا للمنافسة في بطولة NURAI 2026' AND organization = 'University of Karbala')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-karbala-50173' OR duplicate_key = '4d7ab1f692322ae65a45663e543f90f53789e289c6522ecfa50e584bea5a49f0' OR source_url = 'https://uokerbala.edu.iq/archives/50173' OR ((title = 'جامعة كربلاء تستعرض مشاريع طلبتها استعدادا للمنافسة في بطولة NURAI 2026' AND organization = 'University of Karbala')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-karbala-50169', 'news', 'رئيس الجامعة يستقبل باحثا من جامعة فاخننكن الهولندية', 'University of Karbala',
  'Karbala', 'Karbala', NULL, 'University of Karbala',
  'https://uokerbala.edu.iq/archives/50169', NULL, NULL, NULL,
  'استقبل رئيس جامعة كربلاء الأستاذ الدكتور صباح واجد علي، الباحث والتدريسي من جامعة فاخننكن الهولندية الدكتور كرار نجاح مهدي، لبحث آفاق التعاون العلمي المشترك وتعزيز برامج بناء القدرات بين المؤسستين الأكاديميتين. وجرى خلال اللقاء، الذي حضره عميد كلية الزراعة الدكتور علي عبد الحسين، مناقشة سبل تطوير التعاون العلمي والبحثي في المجالات الزراعية، والاستفادة من الخبرات [...] Published date from source: 2026-06-11.', 'Official University of Karbala dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', 'ee50737abc2aa1359126a6ff6d7ea5deaae3a537e9b770741818c9692a3d9d8d', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-11. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-karbala-50169' OR duplicate_key = 'ee50737abc2aa1359126a6ff6d7ea5deaae3a537e9b770741818c9692a3d9d8d' OR source_url = 'https://uokerbala.edu.iq/archives/50169' OR ((title = 'رئيس الجامعة يستقبل باحثا من جامعة فاخننكن الهولندية' AND organization = 'University of Karbala')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-karbala-50169' OR duplicate_key = 'ee50737abc2aa1359126a6ff6d7ea5deaae3a537e9b770741818c9692a3d9d8d' OR source_url = 'https://uokerbala.edu.iq/archives/50169' OR ((title = 'رئيس الجامعة يستقبل باحثا من جامعة فاخننكن الهولندية' AND organization = 'University of Karbala')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-karbala-50167', 'news', 'أطروحة دكتوراه في جامعة كربلاء تناقش المباحث النحوية في تفسير منية الطالبين', 'University of Karbala',
  'Karbala', 'Karbala', NULL, 'University of Karbala',
  'https://uokerbala.edu.iq/archives/50167', NULL, NULL, NULL,
  'ناقشت أطروحة دكتوراه في كلية العلوم الإسلامية بجامعة كربلاء "المباحث النحوية في (منية الطالبين في تفسير القرآن المبين) للشيخ جعفر السبحاني – السور السبع الطوال اختيارًا"، تقدم بها الطالب سعد عبد السادة العصامي. هدفت الأطروحة إلى دراسة المباحث النحوية في تفسير منية الطالبين دراسةً تحليليةً نحويةً تُسهم في إثراء المكتبة العربية، وتكشف عن الأثر الواضح [...] Published date from source: 2026-06-10.', 'Official University of Karbala dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', 'fab06293a9667a0302fb7ea76647383593ec5ee8dc4ad72dd51156e4d26b8c47', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-10. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-karbala-50167' OR duplicate_key = 'fab06293a9667a0302fb7ea76647383593ec5ee8dc4ad72dd51156e4d26b8c47' OR source_url = 'https://uokerbala.edu.iq/archives/50167' OR ((title = 'أطروحة دكتوراه في جامعة كربلاء تناقش المباحث النحوية في تفسير منية الطالبين' AND organization = 'University of Karbala')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-karbala-50167' OR duplicate_key = 'fab06293a9667a0302fb7ea76647383593ec5ee8dc4ad72dd51156e4d26b8c47' OR source_url = 'https://uokerbala.edu.iq/archives/50167' OR ((title = 'أطروحة دكتوراه في جامعة كربلاء تناقش المباحث النحوية في تفسير منية الطالبين' AND organization = 'University of Karbala')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-karbala-50165', 'news', 'أطروحة دكتوراه في جامعة كربلاء تناقش التلويح الحواري وأثره في نهج البلاغة', 'University of Karbala',
  'Karbala', 'Karbala', NULL, 'University of Karbala',
  'https://uokerbala.edu.iq/archives/50165', NULL, NULL, NULL,
  'ناقشت أطروحة دكتوراه في كلية العلوم الإسلامية بجامعة كربلاء "التلويح الحواري وأثره في نهج البلاغة"، للطالب نور هاشم محمد صادق. تكمن أهمية الأطروحة في ما تحمله من مكاسب علمية رصينة، فضلًا عن إسهامها في إحياء تراث آل محمد (عليهم السلام)، وإبراز ما انطوى عليه خطاب أمير المؤمنين الإمام علي بن أبي طالب (عليه السلام) من [...] Published date from source: 2026-06-10.', 'Official University of Karbala dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', 'dc7d1cb96f7bca278788d4b86221dfbb223101b5082a01dd8a7cd8e63ea0056b', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-10. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-karbala-50165' OR duplicate_key = 'dc7d1cb96f7bca278788d4b86221dfbb223101b5082a01dd8a7cd8e63ea0056b' OR source_url = 'https://uokerbala.edu.iq/archives/50165' OR ((title = 'أطروحة دكتوراه في جامعة كربلاء تناقش التلويح الحواري وأثره في نهج البلاغة' AND organization = 'University of Karbala')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-karbala-50165' OR duplicate_key = 'dc7d1cb96f7bca278788d4b86221dfbb223101b5082a01dd8a7cd8e63ea0056b' OR source_url = 'https://uokerbala.edu.iq/archives/50165' OR ((title = 'أطروحة دكتوراه في جامعة كربلاء تناقش التلويح الحواري وأثره في نهج البلاغة' AND organization = 'University of Karbala')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-karbala-50163', 'news', 'متفوقة على نظيراتها في الجامعات العراقية&#8230;زراعة كربلاء تنال الاعتماد البرامجي الكامل', 'University of Karbala',
  'Karbala', 'Karbala', NULL, 'University of Karbala',
  'https://uokerbala.edu.iq/archives/50163', NULL, NULL, NULL,
  'حصلت كلية الزراعة بجامعة كربلاء على الاعتماد البرامجي الكامل لجميع اقسامها، في إنجاز أكاديمي يعكس التزام الكلية بتطبيق معايير الجودة والاعتماد الأكاديمي وتطوير برامجها التعليمية وفق المعايير الوطنية المعتمدة. وجاء منح الاعتماد البرامجي بعد استيفاء الكلية المتطلبات والمعايير الخاصة بجودة البرامج الأكاديمية، والتي شملت المناهج الدراسية، وكفاءة أعضاء الهيئة التدريسية، والبنية التحتية التعليمية، ومخرجات التعلم، [...] Published date from source: 2026-06-10.', 'Official University of Karbala dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', '42313541fe999472a97159ae6131f511dc611ccff7540475dbcad87717a74cda', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-10. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-karbala-50163' OR duplicate_key = '42313541fe999472a97159ae6131f511dc611ccff7540475dbcad87717a74cda' OR source_url = 'https://uokerbala.edu.iq/archives/50163' OR ((title = 'متفوقة على نظيراتها في الجامعات العراقية&#8230;زراعة كربلاء تنال الاعتماد البرامجي الكامل' AND organization = 'University of Karbala')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-karbala-50163' OR duplicate_key = '42313541fe999472a97159ae6131f511dc611ccff7540475dbcad87717a74cda' OR source_url = 'https://uokerbala.edu.iq/archives/50163' OR ((title = 'متفوقة على نظيراتها في الجامعات العراقية&#8230;زراعة كربلاء تنال الاعتماد البرامجي الكامل' AND organization = 'University of Karbala')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-karbala-50152', 'news', 'رئيس جامعة كربلاء يكرّم معاون عميد كلية الهندسة في جامعة وارث الأنبياء تقديراً لجهوده العلمية ودعمه التعاون الأكاديمي', 'University of Karbala',
  'Karbala', 'Karbala', NULL, 'University of Karbala',
  'https://uokerbala.edu.iq/archives/50152', NULL, NULL, NULL,
  'كرّم رئيس جامعة كربلاء الأستاذ الدكتور صباح واجد علي، معاون عميد كلية الهندسة في جامعة وارث الأنبياء الدكتور حسن طالب هاشم، تثميناً لجهوده العلمية المتميزة وإسهاماته الفاعلة في تعزيز التعاون الأكاديمي بين الجامعتين. وأكد رئيس الجامعة خلال التكريم أهمية توطيد الشراكات العلمية بين المؤسسات الأكاديمية بما يسهم في الارتقاء بمستوى التعليم العالي وتحقيق التكامل في [...] Published date from source: 2026-06-10.', 'Official University of Karbala dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', '96762c0868146637a17a22939039d6aa5caacd547386c225099c1f78aa80f211', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-10. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-karbala-50152' OR duplicate_key = '96762c0868146637a17a22939039d6aa5caacd547386c225099c1f78aa80f211' OR source_url = 'https://uokerbala.edu.iq/archives/50152' OR ((title = 'رئيس جامعة كربلاء يكرّم معاون عميد كلية الهندسة في جامعة وارث الأنبياء تقديراً لجهوده العلمية ودعمه التعاون الأكاديمي' AND organization = 'University of Karbala')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-karbala-50152' OR duplicate_key = '96762c0868146637a17a22939039d6aa5caacd547386c225099c1f78aa80f211' OR source_url = 'https://uokerbala.edu.iq/archives/50152' OR ((title = 'رئيس جامعة كربلاء يكرّم معاون عميد كلية الهندسة في جامعة وارث الأنبياء تقديراً لجهوده العلمية ودعمه التعاون الأكاديمي' AND organization = 'University of Karbala')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-karbala-50148', 'news', 'الجامعة تحصد المرتبة العاشرة في التصنيف التجريبي للجامعات المحلية للعام 2025', 'University of Karbala',
  'Karbala', 'Karbala', NULL, 'University of Karbala',
  'https://uokerbala.edu.iq/archives/50148', NULL, NULL, NULL,
  'حققت جامعة كربلاء المرتبة العاشرة ضمن التصنيف التجريبي للجامعات الحكومية الخاص بمدى تحقق الهدف الاستراتيجي للتعليم العالي الذي اقرته الاستراتيجية الوطنية للتربية والتعليم (2022-2031). وشارك في التصنيف (33) جامعة حكومية، إذ حققت الجامعة المرتبة العاشرة بنسبة (62%). واستند التصنيف الذي صدر عن جهاز الإشراف والتقويم العلمي في وزارة التعليم العالي والبحث العلمي إلى خمسة معايير [...] Published date from source: 2026-06-10.', 'Official University of Karbala dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', '6a30e8115fecec2a54d44ae5aa1def53398404666bd494057309ad9373aac89b', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-10. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-karbala-50148' OR duplicate_key = '6a30e8115fecec2a54d44ae5aa1def53398404666bd494057309ad9373aac89b' OR source_url = 'https://uokerbala.edu.iq/archives/50148' OR ((title = 'الجامعة تحصد المرتبة العاشرة في التصنيف التجريبي للجامعات المحلية للعام 2025' AND organization = 'University of Karbala')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-karbala-50148' OR duplicate_key = '6a30e8115fecec2a54d44ae5aa1def53398404666bd494057309ad9373aac89b' OR source_url = 'https://uokerbala.edu.iq/archives/50148' OR ((title = 'الجامعة تحصد المرتبة العاشرة في التصنيف التجريبي للجامعات المحلية للعام 2025' AND organization = 'University of Karbala')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-karbala-50146', 'news', 'دراسة علمية في جامعة كربلاء تبحث أثر المتغيرات الجينية في فعالية علاج السكري', 'University of Karbala',
  'Karbala', 'Karbala', NULL, 'University of Karbala',
  'https://uokerbala.edu.iq/archives/50146', NULL, NULL, NULL,
  'بحثت رسالة ماجستير في كلية الصيدلة بجامعة كربلاء تأثير التعددات الشكلية الجينية لجين CYP2C9 في فعالية دواء Glibenclamide لدى المرضى العراقيين المصابين بداء السكري من النوع الثاني. الدراسة التي قدمتها الباحثة (فاطمة رضا شريف عبود) سعت لتقييم أثر عدد من المتغيرات الجينية في إستجابة المرضى للعلاج ومدى انعكاسها على السيطرة على مستويات السكر والآثار [...] Published date from source: 2026-06-10.', 'Official University of Karbala dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', '8ce60d31d27191b483220fc180d597b1602405f8632745d7f04c93c370429fa6', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-10. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-karbala-50146' OR duplicate_key = '8ce60d31d27191b483220fc180d597b1602405f8632745d7f04c93c370429fa6' OR source_url = 'https://uokerbala.edu.iq/archives/50146' OR ((title = 'دراسة علمية في جامعة كربلاء تبحث أثر المتغيرات الجينية في فعالية علاج السكري' AND organization = 'University of Karbala')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-karbala-50146' OR duplicate_key = '8ce60d31d27191b483220fc180d597b1602405f8632745d7f04c93c370429fa6' OR source_url = 'https://uokerbala.edu.iq/archives/50146' OR ((title = 'دراسة علمية في جامعة كربلاء تبحث أثر المتغيرات الجينية في فعالية علاج السكري' AND organization = 'University of Karbala')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-karbala-50142', 'news', 'رسالة ماجستير في جامعة كربلاء تناقش أثر استراتيجية الدليل الاستباقي في تدريس مادة اللغة العربية', 'University of Karbala',
  'Karbala', 'Karbala', NULL, 'University of Karbala',
  'https://uokerbala.edu.iq/archives/50142', NULL, NULL, NULL,
  'ناقشت رسالة ماجستير في كلية التربية للعلوم الإنسانية بجامعة كربلاء "أثر استراتيجية الدليل الاستباقي في تحصيل طلاب الصف الأول المتوسط في قواعد اللغة العربية" ، للطالب سعد مالك رباط. هدفت الرسالة إلى التعرف على أثر اعتماد استراتيجية الدليل الاستباقي في تحسين مستوى تحصيل طلاب الصف الأول المتوسط في مادة قواعد اللغة العربية، عبر توظيف أساليب [...] Published date from source: 2026-06-10.', 'Official University of Karbala dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', '43bf99215d5ec237493523484685cf419c09ffd7f301c99a11e0e15b720ee7e3', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-10. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-karbala-50142' OR duplicate_key = '43bf99215d5ec237493523484685cf419c09ffd7f301c99a11e0e15b720ee7e3' OR source_url = 'https://uokerbala.edu.iq/archives/50142' OR ((title = 'رسالة ماجستير في جامعة كربلاء تناقش أثر استراتيجية الدليل الاستباقي في تدريس مادة اللغة العربية' AND organization = 'University of Karbala')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-karbala-50142' OR duplicate_key = '43bf99215d5ec237493523484685cf419c09ffd7f301c99a11e0e15b720ee7e3' OR source_url = 'https://uokerbala.edu.iq/archives/50142' OR ((title = 'رسالة ماجستير في جامعة كربلاء تناقش أثر استراتيجية الدليل الاستباقي في تدريس مادة اللغة العربية' AND organization = 'University of Karbala')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-diyala-89657', 'news', '﴿وَلَا تَحْسَبَنَّ الَّذِينَ قُتِلُوا فِي سَبِيلِ اللَّهِ أَمْوَاتًا ۚ بَلْ أَحْيَاءٌ عِندَ رَبِّهِمْ يُرْزَقُونَ﴾', 'University of Diyala',
  'Diyala', 'Baqubah', NULL, 'University of Diyala',
  'https://uodiyala.edu.iq/89657/', NULL, NULL, NULL,
  'تستذكر جامعة ديالى متمثلة برئيسها الأستاذ الدكتور تحسين حسين مبارك بكل ألمٍ وأسًى الذكرى الأليمة لمجزرة سبايكر التي ارتكبتها قوى الإرهاب والظلام في الثاني عشر من حزيران عام 2014، وراح ضحيتها المئات من أبناء العراق الأبرار الذين سطروا بدمائهم الزكية ... Published date from source: 2026-06-12.', 'Official University of Diyala dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', '20c168769c2326b27133d1a584987616c3f5babc3830ec4ce39edd8c77bba717', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-12. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-diyala-89657' OR duplicate_key = '20c168769c2326b27133d1a584987616c3f5babc3830ec4ce39edd8c77bba717' OR source_url = 'https://uodiyala.edu.iq/89657/' OR ((title = '﴿وَلَا تَحْسَبَنَّ الَّذِينَ قُتِلُوا فِي سَبِيلِ اللَّهِ أَمْوَاتًا ۚ بَلْ أَحْيَاءٌ عِندَ رَبِّهِمْ يُرْزَقُونَ﴾' AND organization = 'University of Diyala')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-diyala-89657' OR duplicate_key = '20c168769c2326b27133d1a584987616c3f5babc3830ec4ce39edd8c77bba717' OR source_url = 'https://uodiyala.edu.iq/89657/' OR ((title = '﴿وَلَا تَحْسَبَنَّ الَّذِينَ قُتِلُوا فِي سَبِيلِ اللَّهِ أَمْوَاتًا ۚ بَلْ أَحْيَاءٌ عِندَ رَبِّهِمْ يُرْزَقُونَ﴾' AND organization = 'University of Diyala')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-diyala-89654', 'news', 'احموا اللعب ، احموا الطفولة .. استثماراً في بناء أجيال المستقبل', 'University of Diyala',
  'Diyala', 'Baqubah', NULL, 'University of Diyala',
  'https://uodiyala.edu.iq/89654/', NULL, NULL, NULL,
  'تزامناً مع الحادي عشر من حزيران/يونيو، وتأكيداً على الدور الريادي للمؤسسات الأكاديمية في دعم الحقوق الإنسانية والتربوية، تُشارك جامعة ديالى العالم احتفاءه بـ "اليوم الدولي للعب"، والذي يأتي هذا العام تحت شعار "احموا اللعب، احموا الطفولة". إن جامعة ديالى، من ... Published date from source: 2026-06-11.', 'Official University of Diyala dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', '9d43bfa725eb9589a26c78b2d837a968e3ee88b3d6ffa9cdacd984d948056d8d', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-11. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-diyala-89654' OR duplicate_key = '9d43bfa725eb9589a26c78b2d837a968e3ee88b3d6ffa9cdacd984d948056d8d' OR source_url = 'https://uodiyala.edu.iq/89654/' OR ((title = 'احموا اللعب ، احموا الطفولة .. استثماراً في بناء أجيال المستقبل' AND organization = 'University of Diyala')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-diyala-89654' OR duplicate_key = '9d43bfa725eb9589a26c78b2d837a968e3ee88b3d6ffa9cdacd984d948056d8d' OR source_url = 'https://uodiyala.edu.iq/89654/' OR ((title = 'احموا اللعب ، احموا الطفولة .. استثماراً في بناء أجيال المستقبل' AND organization = 'University of Diyala')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-diyala-89649', 'news', 'اطروحة دكتوراه في اساسية ديالى تناقش التفكير المهني والخيال العلمي وعلاقتهما بالكفاءة المهنية لدى مدرسي مادة التاريخ للمرحلة الاعدادية', 'University of Diyala',
  'Diyala', 'Baqubah', NULL, 'University of Diyala',
  'https://uodiyala.edu.iq/89649/', NULL, NULL, NULL,
  'ناقشت كلية التربية الاساسية بجامعة ديالى اطروحة الدكتوراه الموسومة بـ (التفكير المهني والخيال العلمي وعلاقتهما بالكفاءة المهنية لدى مدرسي مادة التاريخ للمرحلة الاعدادية في محافظة ديالى)، للباحث صالح خوام محمد . هدفت الدراسة الى التعرف على التفكير المهني لدى مدرسي ... Published date from source: 2026-06-11.', 'Official University of Diyala dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', '1590a9b71cf0463579e7efa7aaac68d4b15955d32f0be4420569717c350636d3', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-11. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-diyala-89649' OR duplicate_key = '1590a9b71cf0463579e7efa7aaac68d4b15955d32f0be4420569717c350636d3' OR source_url = 'https://uodiyala.edu.iq/89649/' OR ((title = 'اطروحة دكتوراه في اساسية ديالى تناقش التفكير المهني والخيال العلمي وعلاقتهما بالكفاءة المهنية لدى مدرسي مادة التاريخ للمرحلة الاعدادية' AND organization = 'University of Diyala')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-diyala-89649' OR duplicate_key = '1590a9b71cf0463579e7efa7aaac68d4b15955d32f0be4420569717c350636d3' OR source_url = 'https://uodiyala.edu.iq/89649/' OR ((title = 'اطروحة دكتوراه في اساسية ديالى تناقش التفكير المهني والخيال العلمي وعلاقتهما بالكفاءة المهنية لدى مدرسي مادة التاريخ للمرحلة الاعدادية' AND organization = 'University of Diyala')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-diyala-89644', 'news', 'رسالة ماجستير في كلية الزراعة تناقش تأثير مواعيد الزراعة الربيعية والمكافحة الكيميائية في نمو وحاصل الذرة الصفراء', 'University of Diyala',
  'Diyala', 'Baqubah', NULL, 'University of Diyala',
  'https://uodiyala.edu.iq/89644/', NULL, NULL, NULL,
  'ناقشت كلية الزراعة بجامعة ديالى رسالة الماجستير الموسومة بـ (تأثير مواعيد الزراعة الربيعّية والمكافحة الكيميائية في نمو وحاصل الذرة الصفراء. وتوصلت الدراسة التي قدمها الطالب عبد السلام عبد الرزاق هاشم، الى استنتاجات عدة منها : وجود اختلافات واضحة بين مواعيد ... Published date from source: 2026-06-11.', 'Official University of Diyala dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', '0e7d7b81807a5fa6d2aeee83fdc0d8839f5efec544c70d2cc9efc3096b36723d', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-11. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-diyala-89644' OR duplicate_key = '0e7d7b81807a5fa6d2aeee83fdc0d8839f5efec544c70d2cc9efc3096b36723d' OR source_url = 'https://uodiyala.edu.iq/89644/' OR ((title = 'رسالة ماجستير في كلية الزراعة تناقش تأثير مواعيد الزراعة الربيعية والمكافحة الكيميائية في نمو وحاصل الذرة الصفراء' AND organization = 'University of Diyala')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-diyala-89644' OR duplicate_key = '0e7d7b81807a5fa6d2aeee83fdc0d8839f5efec544c70d2cc9efc3096b36723d' OR source_url = 'https://uodiyala.edu.iq/89644/' OR ((title = 'رسالة ماجستير في كلية الزراعة تناقش تأثير مواعيد الزراعة الربيعية والمكافحة الكيميائية في نمو وحاصل الذرة الصفراء' AND organization = 'University of Diyala')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-diyala-89639', 'news', 'رسالة ماجستير في كلية القانون والعلوم السياسية تناقش جريمة تلوث مجاري المياه واثرها في الصحة', 'University of Diyala',
  'Diyala', 'Baqubah', NULL, 'University of Diyala',
  'https://uodiyala.edu.iq/89639/', NULL, NULL, NULL,
  'ناقشت كلية القانون والعلوم السياسية بجامعة ديالى رسالة الماجستير الموسومة بـ (جريمة تلويث مجاري المياه واثرها في الصحة) للطالبة مــــروة نعمــــان غـــــلام. هدفت الدراسة إلى تأصيل المفهومين اللغوي والاصطلاحي لجريمة تلويث مجاري المياه واثرها على الصحة ، وتسليط الضوء على ... Published date from source: 2026-06-11.', 'Official University of Diyala dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', '0c66cc616b2dab6c2e070bce68129b50699298d2aa538611005030ddb4596c4d', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-11. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-diyala-89639' OR duplicate_key = '0c66cc616b2dab6c2e070bce68129b50699298d2aa538611005030ddb4596c4d' OR source_url = 'https://uodiyala.edu.iq/89639/' OR ((title = 'رسالة ماجستير في كلية القانون والعلوم السياسية تناقش جريمة تلوث مجاري المياه واثرها في الصحة' AND organization = 'University of Diyala')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-diyala-89639' OR duplicate_key = '0c66cc616b2dab6c2e070bce68129b50699298d2aa538611005030ddb4596c4d' OR source_url = 'https://uodiyala.edu.iq/89639/' OR ((title = 'رسالة ماجستير في كلية القانون والعلوم السياسية تناقش جريمة تلوث مجاري المياه واثرها في الصحة' AND organization = 'University of Diyala')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-diyala-89634', 'news', 'رسالة ماجستير في كلية الهندسة تناقش أداء مجموعة الركائز اللولبية تحت تأثير حمل الرفع المائل في التربة الرملية', 'University of Diyala',
  'Diyala', 'Baqubah', NULL, 'University of Diyala',
  'https://uodiyala.edu.iq/89634/', NULL, NULL, NULL,
  'ناقشت رسالة ماجستير في كلية الهندسة بجامعة ديالى، أداء مجموعة الركائز اللولبية تحت تأثير حمل الرفع المائل في التربة الرملية. تهدف الرسالة التي قدمتها الطالبة صفا عدنان قيس إلى دراسة سلوك وأداء مجموعات الركائز اللولبية المستخدمة في التطبيقات الهندسية المختلفة ... Published date from source: 2026-06-11.', 'Official University of Diyala dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', 'e1c00721459232251c77710c7f84e94b46865836511ba214b38c05ff9babe982', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-11. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-diyala-89634' OR duplicate_key = 'e1c00721459232251c77710c7f84e94b46865836511ba214b38c05ff9babe982' OR source_url = 'https://uodiyala.edu.iq/89634/' OR ((title = 'رسالة ماجستير في كلية الهندسة تناقش أداء مجموعة الركائز اللولبية تحت تأثير حمل الرفع المائل في التربة الرملية' AND organization = 'University of Diyala')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-diyala-89634' OR duplicate_key = 'e1c00721459232251c77710c7f84e94b46865836511ba214b38c05ff9babe982' OR source_url = 'https://uodiyala.edu.iq/89634/' OR ((title = 'رسالة ماجستير في كلية الهندسة تناقش أداء مجموعة الركائز اللولبية تحت تأثير حمل الرفع المائل في التربة الرملية' AND organization = 'University of Diyala')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-diyala-89629', 'news', 'كليـة التربيـة للعلــوم الصرفـة تقيـم الملتقى العلمـي العاشــر لبحــوث التخـرج', 'University of Diyala',
  'Diyala', 'Baqubah', NULL, 'University of Diyala',
  'https://uodiyala.edu.iq/89629/', NULL, NULL, NULL,
  'برعاية السيد رئيس جامعة ديالى الأستاذ الدكتور تحسين حسين مبارك، وإشراف السيد عميد كلية التربية للعلوم الصرفة الأستاذ الدكتور علي جعفر سليم، نظّمت الكلية ملتقاها العلمي العاشر لبحوث التخرج تحت شعار (بحوث طلابية من أجل مستقبل مستدام)، بمشاركة واسعة من ... Published date from source: 2026-06-11.', 'Official University of Diyala dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', '15cba5a1f90662823340d3ef60d59b338d98926d4adee2a20fa8c41e303608b2', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-11. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-diyala-89629' OR duplicate_key = '15cba5a1f90662823340d3ef60d59b338d98926d4adee2a20fa8c41e303608b2' OR source_url = 'https://uodiyala.edu.iq/89629/' OR ((title = 'كليـة التربيـة للعلــوم الصرفـة تقيـم الملتقى العلمـي العاشــر لبحــوث التخـرج' AND organization = 'University of Diyala')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-diyala-89629' OR duplicate_key = '15cba5a1f90662823340d3ef60d59b338d98926d4adee2a20fa8c41e303608b2' OR source_url = 'https://uodiyala.edu.iq/89629/' OR ((title = 'كليـة التربيـة للعلــوم الصرفـة تقيـم الملتقى العلمـي العاشــر لبحــوث التخـرج' AND organization = 'University of Diyala')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-diyala-89626', 'news', 'مجلة ديالى للبحوث الإنسانية في كلية التربية للعلوم الإنسانية تنجز إصدار العدد (108)', 'University of Diyala',
  'Diyala', 'Baqubah', NULL, 'University of Diyala',
  'https://uodiyala.edu.iq/89626/', NULL, NULL, NULL,
  'أنجزت هيئة تحرير مجلة ديالى للبحوث الإنسانية في كلية التربية للعلوم الإنسانية بجامعة ديالى إصدار العدد (108) من المجلة، متضمناً (60) بحثاً علمياً محكماً في مختلف التخصصات الإنسانية، بما يسهم في دعم حركة البحث العلمي ونشر النتاجات الأكاديمية الرصينة. وتوزع ... Published date from source: 2026-06-11.', 'Official University of Diyala dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', 'cd3d547e12520e8e0c3c75c2099b50f17c1b5d2411a037120090166ed1cc8b6c', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-11. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-diyala-89626' OR duplicate_key = 'cd3d547e12520e8e0c3c75c2099b50f17c1b5d2411a037120090166ed1cc8b6c' OR source_url = 'https://uodiyala.edu.iq/89626/' OR ((title = 'مجلة ديالى للبحوث الإنسانية في كلية التربية للعلوم الإنسانية تنجز إصدار العدد (108)' AND organization = 'University of Diyala')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-diyala-89626' OR duplicate_key = 'cd3d547e12520e8e0c3c75c2099b50f17c1b5d2411a037120090166ed1cc8b6c' OR source_url = 'https://uodiyala.edu.iq/89626/' OR ((title = 'مجلة ديالى للبحوث الإنسانية في كلية التربية للعلوم الإنسانية تنجز إصدار العدد (108)' AND organization = 'University of Diyala')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-diyala-89619', 'news', 'جامعة ديالى تمضي نحو التوسع الأكاديمي النوعي .. لجنة وزارية تقيّم استحداث كلية وتخصصات حديثة تواكب متطلبات المستقبل', 'University of Diyala',
  'Diyala', 'Baqubah', NULL, 'University of Diyala',
  'https://uodiyala.edu.iq/89619/', NULL, NULL, NULL,
  'استقبل السيد رئيس جامعة ديالى الأستاذ الدكتور تحسين حسين مبارك، اليوم الأربعاء الموافق 10 حزيران 2026 لجنةً وزاريةً متخصصة مكلفة بدراسة ملفات استحداث كلية جديدة وعدد من الأقسام العلمية، في خطوة تعكس توجه الجامعة الاستراتيجي نحو تطوير منظومتها الأكاديمية واستحداث ... Published date from source: 2026-06-10.', 'Official University of Diyala dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', '10d4ad63d34fe1f4458a1b14d360474c584a22f6e2d223bb1151b6539798757c', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-10. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-diyala-89619' OR duplicate_key = '10d4ad63d34fe1f4458a1b14d360474c584a22f6e2d223bb1151b6539798757c' OR source_url = 'https://uodiyala.edu.iq/89619/' OR ((title = 'جامعة ديالى تمضي نحو التوسع الأكاديمي النوعي .. لجنة وزارية تقيّم استحداث كلية وتخصصات حديثة تواكب متطلبات المستقبل' AND organization = 'University of Diyala')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-diyala-89619' OR duplicate_key = '10d4ad63d34fe1f4458a1b14d360474c584a22f6e2d223bb1151b6539798757c' OR source_url = 'https://uodiyala.edu.iq/89619/' OR ((title = 'جامعة ديالى تمضي نحو التوسع الأكاديمي النوعي .. لجنة وزارية تقيّم استحداث كلية وتخصصات حديثة تواكب متطلبات المستقبل' AND organization = 'University of Diyala')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-diyala-89614', 'news', 'جامعة ديالى تسهم في ترصين المشاريع الخدمية بمحاضرة تخصصية حول استدامة المنشآت وتقليل كلف الصيانة', 'University of Diyala',
  'Diyala', 'Baqubah', NULL, 'University of Diyala',
  'https://uodiyala.edu.iq/89614/', NULL, NULL, NULL,
  'في إطار تعزيز دورها العلمي والاستشاري وخدمة مؤسسات الدولة، ألقى السيد مساعد رئيس جامعة ديالى للشؤون العلمية الأستاذ الدكتور عامر محمد إبراهيم محاضرة تخصصية في ديوان محافظة ديالى، استهدفت مهندسي الدوائر الخدمية وعدداً من الملاكات الهندسية والفنية، بعنوان (تأثير المواصفات ... Published date from source: 2026-06-10.', 'Official University of Diyala dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', 'aeb8bda7f7c219b92f2e9497b0b92890488d574c05d103536cf0c68f814616d9', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-10. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-diyala-89614' OR duplicate_key = 'aeb8bda7f7c219b92f2e9497b0b92890488d574c05d103536cf0c68f814616d9' OR source_url = 'https://uodiyala.edu.iq/89614/' OR ((title = 'جامعة ديالى تسهم في ترصين المشاريع الخدمية بمحاضرة تخصصية حول استدامة المنشآت وتقليل كلف الصيانة' AND organization = 'University of Diyala')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-diyala-89614' OR duplicate_key = 'aeb8bda7f7c219b92f2e9497b0b92890488d574c05d103536cf0c68f814616d9' OR source_url = 'https://uodiyala.edu.iq/89614/' OR ((title = 'جامعة ديالى تسهم في ترصين المشاريع الخدمية بمحاضرة تخصصية حول استدامة المنشآت وتقليل كلف الصيانة' AND organization = 'University of Diyala')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-ntu-316386', 'news', 'مركز الحاسبة الإلكترونية في الجامعة التقنية الشمالية يقيم دورة "التمكين الرقمي"', 'Northern Technical University',
  'Nineveh', 'Mosul', NULL, 'Northern Technical University',
  'https://ntu.edu.iq/ar/the-electronic-computing-center-at-the-northern-technical-university-is-holding-a-digital-empowerment-course/', NULL, NULL, NULL,
  'مركز الحاسبة الإلكترونية في الجامعة التقنية الشمالية يقيم دورة "التمكين الرقمي" انسجاماً مع توجيهات السيدة رئيس الجامعة التقنية الشمالية الأستاذة الدكتورة علياء عباس علي العطار المحترمة، […] Published date from source: 2026-06-12.', 'Official Northern Technical University dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', '9a3e88fb85be9b2ca03ac161550a91b6f147581cb9b18cb41ae0fe9319902dd9', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-12. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-ntu-316386' OR duplicate_key = '9a3e88fb85be9b2ca03ac161550a91b6f147581cb9b18cb41ae0fe9319902dd9' OR source_url = 'https://ntu.edu.iq/ar/the-electronic-computing-center-at-the-northern-technical-university-is-holding-a-digital-empowerment-course/' OR ((title = 'مركز الحاسبة الإلكترونية في الجامعة التقنية الشمالية يقيم دورة "التمكين الرقمي"' AND organization = 'Northern Technical University')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-ntu-316386' OR duplicate_key = '9a3e88fb85be9b2ca03ac161550a91b6f147581cb9b18cb41ae0fe9319902dd9' OR source_url = 'https://ntu.edu.iq/ar/the-electronic-computing-center-at-the-northern-technical-university-is-holding-a-digital-empowerment-course/' OR ((title = 'مركز الحاسبة الإلكترونية في الجامعة التقنية الشمالية يقيم دورة "التمكين الرقمي"' AND organization = 'Northern Technical University')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-ntu-316378', 'news', 'الجامعة تجري مرحلة التقييم للمشاريع المشاركة في البطولة الجامعية للروبوتات والذكاء الاصطناعي NURAI 2026', 'Northern Technical University',
  'Nineveh', 'Mosul', NULL, 'Northern Technical University',
  'https://ntu.edu.iq/ar/the-nurai-2026-university-robotics-and-artificial-intelligence-championship/', NULL, NULL, NULL,
  'الجامعة التقنية الشمالية تجري مرحلة التقييم الاولي للمشاريع المشاركة في البطولة الوطنية الجامعية للروبوتات والذكاء الاصطناعي NURAI 2026 بإشراف مباشر من قبل السيدة رئيس الجامعة […] Published date from source: 2026-06-11.', 'Official Northern Technical University dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', '1c2687dc1162f2db42f11cc771b55c0c2ff35013cad2910637f64aed89046dcd', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-11. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-ntu-316378' OR duplicate_key = '1c2687dc1162f2db42f11cc771b55c0c2ff35013cad2910637f64aed89046dcd' OR source_url = 'https://ntu.edu.iq/ar/the-nurai-2026-university-robotics-and-artificial-intelligence-championship/' OR ((title = 'الجامعة تجري مرحلة التقييم للمشاريع المشاركة في البطولة الجامعية للروبوتات والذكاء الاصطناعي NURAI 2026' AND organization = 'Northern Technical University')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-ntu-316378' OR duplicate_key = '1c2687dc1162f2db42f11cc771b55c0c2ff35013cad2910637f64aed89046dcd' OR source_url = 'https://ntu.edu.iq/ar/the-nurai-2026-university-robotics-and-artificial-intelligence-championship/' OR ((title = 'الجامعة تجري مرحلة التقييم للمشاريع المشاركة في البطولة الجامعية للروبوتات والذكاء الاصطناعي NURAI 2026' AND organization = 'Northern Technical University')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-ntu-316317', 'news', 'University President Receives Members of the Ministerial Committee for the Establishment of Specialized Departments at the Technical Engineering College of Computer Science and Artificial Intelligence', 'Northern Technical University',
  'Nineveh', 'Mosul', NULL, 'Northern Technical University',
  'https://ntu.edu.iq/university-president-receives-members-of-the-ministerial-committee-for-the-establishment-of-specialized-departments-at-the-technical-engineering-college-of-computer-science-and-artificial-intelligence/', NULL, NULL, NULL,
  'University President Receives Members of the Ministerial Committee for the Establishment of Specialized Departments at the Technical Engineering College of Computer Science and Artificial Intelligence The […] Published date from source: 2026-06-11.', 'Official Northern Technical University dated 2026 post with a specific non-generic title.', NULL, 'en',
  'pending_review', '5f7489eeff8530d2da9008b9333f4125a512726c1b094327a8144292a4ac6d50', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-11. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-ntu-316317' OR duplicate_key = '5f7489eeff8530d2da9008b9333f4125a512726c1b094327a8144292a4ac6d50' OR source_url = 'https://ntu.edu.iq/university-president-receives-members-of-the-ministerial-committee-for-the-establishment-of-specialized-departments-at-the-technical-engineering-college-of-computer-science-and-artificial-intelligence/' OR ((title = 'University President Receives Members of the Ministerial Committee for the Establishment of Specialized Departments at the Technical Engineering College of Computer Science and Artificial Intelligence' AND organization = 'Northern Technical University')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-ntu-316317' OR duplicate_key = '5f7489eeff8530d2da9008b9333f4125a512726c1b094327a8144292a4ac6d50' OR source_url = 'https://ntu.edu.iq/university-president-receives-members-of-the-ministerial-committee-for-the-establishment-of-specialized-departments-at-the-technical-engineering-college-of-computer-science-and-artificial-intelligence/' OR ((title = 'University President Receives Members of the Ministerial Committee for the Establishment of Specialized Departments at the Technical Engineering College of Computer Science and Artificial Intelligence' AND organization = 'Northern Technical University')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-ntu-316315', 'activity', 'Northern Technical University Participates in the Ministerial Workshop on Activating Science and Technology Parks in Iraqi Universities.', 'Northern Technical University',
  'Nineveh', 'Mosul', NULL, 'Northern Technical University',
  'https://ntu.edu.iq/northern-technical-university-participates-in-the-ministerial-workshop-on-activating-science-and-technology-parks-in-iraqi-universities/', NULL, NULL, NULL,
  'Northern Technical University Participates in the Ministerial Workshop on Activating Science and Technology Parks in Iraqi Universities Under the direction of the President of Northern Technical […] Published date from source: 2026-06-11.', 'Official Northern Technical University dated 2026 post with a specific non-generic title.', NULL, 'en',
  'pending_review', '6eb2d089c032b067aa4e1ad7aa393f4fbad352cd6052cfa38192a16d0db5835e', 84, 'Phase 4 expanded dry-run item. Published date: 2026-06-11. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-ntu-316315' OR duplicate_key = '6eb2d089c032b067aa4e1ad7aa393f4fbad352cd6052cfa38192a16d0db5835e' OR source_url = 'https://ntu.edu.iq/northern-technical-university-participates-in-the-ministerial-workshop-on-activating-science-and-technology-parks-in-iraqi-universities/' OR ((title = 'Northern Technical University Participates in the Ministerial Workshop on Activating Science and Technology Parks in Iraqi Universities.' AND organization = 'Northern Technical University')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-ntu-316315' OR duplicate_key = '6eb2d089c032b067aa4e1ad7aa393f4fbad352cd6052cfa38192a16d0db5835e' OR source_url = 'https://ntu.edu.iq/northern-technical-university-participates-in-the-ministerial-workshop-on-activating-science-and-technology-parks-in-iraqi-universities/' OR ((title = 'Northern Technical University Participates in the Ministerial Workshop on Activating Science and Technology Parks in Iraqi Universities.' AND organization = 'Northern Technical University')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-ntu-316313', 'exam', 'University Committee Inspects Examination Process at Nineveh Technical Administrative Institute.', 'Northern Technical University',
  'Nineveh', 'Mosul', NULL, 'Northern Technical University',
  'https://ntu.edu.iq/university-committee-inspects-examination-process-at-nineveh-technical-administrative-institute/', NULL, NULL, NULL,
  'University Committee Inspects Examination Process at Nineveh Technical Administrative Institute . A committee from Northern Technical University, headed by the Vice President for Administrative Affairs, conducted […] Published date from source: 2026-06-11.', 'Official Northern Technical University dated 2026 post with a specific non-generic title.', NULL, 'en',
  'pending_review', '9edad279c1f10abd5d9c2f912627f27f05eb3d8515c1653be5627de03a1545a1', 84, 'Phase 4 expanded dry-run item. Published date: 2026-06-11. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-ntu-316313' OR duplicate_key = '9edad279c1f10abd5d9c2f912627f27f05eb3d8515c1653be5627de03a1545a1' OR source_url = 'https://ntu.edu.iq/university-committee-inspects-examination-process-at-nineveh-technical-administrative-institute/' OR ((title = 'University Committee Inspects Examination Process at Nineveh Technical Administrative Institute.' AND organization = 'Northern Technical University')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-ntu-316313' OR duplicate_key = '9edad279c1f10abd5d9c2f912627f27f05eb3d8515c1653be5627de03a1545a1' OR source_url = 'https://ntu.edu.iq/university-committee-inspects-examination-process-at-nineveh-technical-administrative-institute/' OR ((title = 'University Committee Inspects Examination Process at Nineveh Technical Administrative Institute.' AND organization = 'Northern Technical University')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-ntu-316311', 'registration', 'University''s Department of Graduate Studies Announces the Opening of Applications for Postgraduate Programs at the Higher Institute of Health Technologies and Artificial Intelligence.', 'Northern Technical University',
  'Nineveh', 'Mosul', NULL, 'Northern Technical University',
  'https://ntu.edu.iq/universitys-department-of-graduate-studies-announces-the-opening-of-applications-for-postgraduate-programs-at-the-higher-institute-of-health-technologies-and-artificial-intelligence/', NULL, NULL, NULL,
  'University''s Department of Graduate Studies Announces the Opening of Applications for Postgraduate Programs at the Higher Institute of Health Technologies and Artificial Intelligence. Published date from source: 2026-06-11.', 'Official Northern Technical University dated 2026 post with a specific non-generic title.', NULL, 'en',
  'pending_review', 'fdade4a8cac0c2dea12c880294685c934a308cad08951e97271582a177be2187', 84, 'Phase 4 expanded dry-run item. Published date: 2026-06-11. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-ntu-316311' OR duplicate_key = 'fdade4a8cac0c2dea12c880294685c934a308cad08951e97271582a177be2187' OR source_url = 'https://ntu.edu.iq/universitys-department-of-graduate-studies-announces-the-opening-of-applications-for-postgraduate-programs-at-the-higher-institute-of-health-technologies-and-artificial-intelligence/' OR ((title = 'University''s Department of Graduate Studies Announces the Opening of Applications for Postgraduate Programs at the Higher Institute of Health Technologies and Artificial Intelligence.' AND organization = 'Northern Technical University')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-ntu-316311' OR duplicate_key = 'fdade4a8cac0c2dea12c880294685c934a308cad08951e97271582a177be2187' OR source_url = 'https://ntu.edu.iq/universitys-department-of-graduate-studies-announces-the-opening-of-applications-for-postgraduate-programs-at-the-higher-institute-of-health-technologies-and-artificial-intelligence/' OR ((title = 'University''s Department of Graduate Studies Announces the Opening of Applications for Postgraduate Programs at the Higher Institute of Health Technologies and Artificial Intelligence.' AND organization = 'Northern Technical University')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-ntu-316309', 'news', 'President of Northern Technical University Receives Ministerial Committee for the Establishment of Rare Scientific Departments at Kirkuk Polytechnic College.', 'Northern Technical University',
  'Nineveh', 'Mosul', NULL, 'Northern Technical University',
  'https://ntu.edu.iq/president-of-northern-technical-university-receives-ministerial-committee-for-the-establishment-of-rare-scientific-departments-at-kirkuk-polytechnic-college/', NULL, NULL, NULL,
  'President of Northern Technical University Receives Ministerial Committee for the Establishment of Rare Scientific Departments at Kirkuk Polytechnic College. The President of Northern Technical University, […] Published date from source: 2026-06-11.', 'Official Northern Technical University dated 2026 post with a specific non-generic title.', NULL, 'en',
  'pending_review', 'f8d2d18068a92800890cc9d15d0e6af568e75c444053eb98dad61cb580452a8c', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-11. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-ntu-316309' OR duplicate_key = 'f8d2d18068a92800890cc9d15d0e6af568e75c444053eb98dad61cb580452a8c' OR source_url = 'https://ntu.edu.iq/president-of-northern-technical-university-receives-ministerial-committee-for-the-establishment-of-rare-scientific-departments-at-kirkuk-polytechnic-college/' OR ((title = 'President of Northern Technical University Receives Ministerial Committee for the Establishment of Rare Scientific Departments at Kirkuk Polytechnic College.' AND organization = 'Northern Technical University')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-ntu-316309' OR duplicate_key = 'f8d2d18068a92800890cc9d15d0e6af568e75c444053eb98dad61cb580452a8c' OR source_url = 'https://ntu.edu.iq/president-of-northern-technical-university-receives-ministerial-committee-for-the-establishment-of-rare-scientific-departments-at-kirkuk-polytechnic-college/' OR ((title = 'President of Northern Technical University Receives Ministerial Committee for the Establishment of Rare Scientific Departments at Kirkuk Polytechnic College.' AND organization = 'Northern Technical University')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-ntu-316307', 'news', 'President of Northern Technical University Receives Ministerial Committee Assigned to Study the Establishment of Rare Scientific Departments at Kirkuk Technical Medical Institute.', 'Northern Technical University',
  'Nineveh', 'Mosul', NULL, 'Northern Technical University',
  'https://ntu.edu.iq/president-of-northern-technical-university-receives-ministerial-committee-assigned-to-study-the-establishment-of-rare-scientific-departments-at-kirkuk-technical-medical-institute/', NULL, NULL, NULL,
  'President of Northern Technical University Receives Ministerial Committee Assigned to Study the Establishment of Rare Scientific Departments at Kirkuk Technical Medical Institute. The President of […] Published date from source: 2026-06-11.', 'Official Northern Technical University dated 2026 post with a specific non-generic title.', NULL, 'en',
  'pending_review', '2bc1efee8a91de3d9c0a633b50c24911b73c4baa7438c7b09ae0ab30471ef9db', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-11. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-ntu-316307' OR duplicate_key = '2bc1efee8a91de3d9c0a633b50c24911b73c4baa7438c7b09ae0ab30471ef9db' OR source_url = 'https://ntu.edu.iq/president-of-northern-technical-university-receives-ministerial-committee-assigned-to-study-the-establishment-of-rare-scientific-departments-at-kirkuk-technical-medical-institute/' OR ((title = 'President of Northern Technical University Receives Ministerial Committee Assigned to Study the Establishment of Rare Scientific Departments at Kirkuk Technical Medical Institute.' AND organization = 'Northern Technical University')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-ntu-316307' OR duplicate_key = '2bc1efee8a91de3d9c0a633b50c24911b73c4baa7438c7b09ae0ab30471ef9db' OR source_url = 'https://ntu.edu.iq/president-of-northern-technical-university-receives-ministerial-committee-assigned-to-study-the-establishment-of-rare-scientific-departments-at-kirkuk-technical-medical-institute/' OR ((title = 'President of Northern Technical University Receives Ministerial Committee Assigned to Study the Establishment of Rare Scientific Departments at Kirkuk Technical Medical Institute.' AND organization = 'Northern Technical University')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-ntu-316304', 'news', 'وزارة التعليم العالي والبحث العلمي تمنح رئيس الجامعة التقنية الشمالية كتاب شكر وتقدير.', 'Northern Technical University',
  'Nineveh', 'Mosul', NULL, 'Northern Technical University',
  'https://ntu.edu.iq/ar/the-ministry-of-higher-education-and-scientific-research-awards-the-president-of-the-northern-technical-university-a-letter-of-thanks-and-appreciation/', NULL, NULL, NULL,
  'وزارة التعليم العالي والبحث العلمي تمنح السيدة رئيس الجامعة التقنية الشمالية كتاب شكر وتقدير . في إنجاز علمي جديد يضاف إلى سجل النجاحات المتواصلة، منحت وزارة […] Published date from source: 2026-06-11.', 'Official Northern Technical University dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', '8ae8cd3517368f59cff32a5deb9ae89d3fb01708ee0573aef5b58a16f1eef7a9', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-11. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-ntu-316304' OR duplicate_key = '8ae8cd3517368f59cff32a5deb9ae89d3fb01708ee0573aef5b58a16f1eef7a9' OR source_url = 'https://ntu.edu.iq/ar/the-ministry-of-higher-education-and-scientific-research-awards-the-president-of-the-northern-technical-university-a-letter-of-thanks-and-appreciation/' OR ((title = 'وزارة التعليم العالي والبحث العلمي تمنح رئيس الجامعة التقنية الشمالية كتاب شكر وتقدير.' AND organization = 'Northern Technical University')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-ntu-316304' OR duplicate_key = '8ae8cd3517368f59cff32a5deb9ae89d3fb01708ee0573aef5b58a16f1eef7a9' OR source_url = 'https://ntu.edu.iq/ar/the-ministry-of-higher-education-and-scientific-research-awards-the-president-of-the-northern-technical-university-a-letter-of-thanks-and-appreciation/' OR ((title = 'وزارة التعليم العالي والبحث العلمي تمنح رئيس الجامعة التقنية الشمالية كتاب شكر وتقدير.' AND organization = 'Northern Technical University')));

INSERT INTO highlight_items (
  id, category, title, organization, governorate, city, university_id, source_name, source_url, apply_url, event_date, deadline, summary, full_description_optional, image_url, language, status, duplicate_key, confidence_score, raw_text, created_at, updated_at
)
SELECT
  'phase4-ntu-316297', 'news', 'رئيس الجامعة التقنية الشمالية ورئيس جامعة الفلوجة يجريان جولة في أروقة الجامعة.', 'Northern Technical University',
  'Nineveh', 'Mosul', NULL, 'Northern Technical University',
  'https://ntu.edu.iq/ar/the-president-of-the-northern-technical-university-and-the-president-of-fallujah-university-tour-the-universitys-corridors/', NULL, NULL, NULL,
  'السيدة رئيس الجامعة التقنية الشمالية ورئيس جامعة الفلوجة يجريان جولة في أروقة الجامعة. أجرت السيدة رئيس الجامعة التقنية الشمالية الأستاذة الدكتورة علياء عباس علي العطار برفقة […] Published date from source: 2026-06-11.', 'Official Northern Technical University dated 2026 post with a specific non-generic title.', NULL, 'ar',
  'pending_review', '19998144eb3eff8b9a9f85d197ced25073175f5334ca2d10658066fa72c0c397', 86, 'Phase 4 expanded dry-run item. Published date: 2026-06-11. Admin verification needed: no.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-ntu-316297' OR duplicate_key = '19998144eb3eff8b9a9f85d197ced25073175f5334ca2d10658066fa72c0c397' OR source_url = 'https://ntu.edu.iq/ar/the-president-of-the-northern-technical-university-and-the-president-of-fallujah-university-tour-the-universitys-corridors/' OR ((title = 'رئيس الجامعة التقنية الشمالية ورئيس جامعة الفلوجة يجريان جولة في أروقة الجامعة.' AND organization = 'Northern Technical University')))
  AND NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-ntu-316297' OR duplicate_key = '19998144eb3eff8b9a9f85d197ced25073175f5334ca2d10658066fa72c0c397' OR source_url = 'https://ntu.edu.iq/ar/the-president-of-the-northern-technical-university-and-the-president-of-fallujah-university-tour-the-universitys-corridors/' OR ((title = 'رئيس الجامعة التقنية الشمالية ورئيس جامعة الفلوجة يجريان جولة في أروقة الجامعة.' AND organization = 'Northern Technical University')));

INSERT INTO opportunity_candidates (
  id, source_id, title, organization, category, description, summary, eligibility, deadline, published_date, apply_url, source_url, image_url, country, governorate, city, language, salary_or_funding, confidence_score, duplicate_key, status, rejection_reason, created_at, updated_at
)
SELECT
  'phase4-mohesr-india-300-2026', NULL, 'التعليم تعلن توفر 300 منحة دراسية هندية لغير الموظفين', 'Iraq Ministry of Higher Education and Scientific Research', 'scholarship',
  'Official ministry announcement for 300 Indian scholarships for undergraduate, master, and doctoral programmes. The source states the deadline is 2026/10/31.', 'Official ministry announcement for 300 Indian scholarships for undergraduate, master, and doctoral programmes. The source states the deadline is 2026/10/31.', NULL, '2026-10-31', '2026-04-08',
  'https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B9%D9%84%D9%86-%D8%AA%D9%88%D9%81%D8%B1-300-%D9%85%D9%86%D8%AD%D8%A9-%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A%D8%A9-%D9%87%D9%86%D8%AF%D9%8A%D8%A9-%D9%84%D8%BA%D9%8A%D8%B1-%D8%A7%D9%84%D9%85%D9%88%D8%B8%D9%81%D9%8A%D9%86-2026-04-08-12', 'https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B9%D9%84%D9%86-%D8%AA%D9%88%D9%81%D8%B1-300-%D9%85%D9%86%D8%AD%D8%A9-%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A%D8%A9-%D9%87%D9%86%D8%AF%D9%8A%D8%A9-%D9%84%D8%BA%D9%8A%D8%B1-%D8%A7%D9%84%D9%85%D9%88%D8%B8%D9%81%D9%8A%D9%86-2026-04-08-12', NULL, 'Iraq', NULL, NULL,
  'ar', NULL, 91, '2614d51934cced273b1d950029bffb595fa366c319323559910f674c6a48e184', 'pending_review', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-mohesr-india-300-2026' OR duplicate_key = '2614d51934cced273b1d950029bffb595fa366c319323559910f674c6a48e184' OR source_url = 'https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B9%D9%84%D9%86-%D8%AA%D9%88%D9%81%D8%B1-300-%D9%85%D9%86%D8%AD%D8%A9-%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A%D8%A9-%D9%87%D9%86%D8%AF%D9%8A%D8%A9-%D9%84%D8%BA%D9%8A%D8%B1-%D8%A7%D9%84%D9%85%D9%88%D8%B8%D9%81%D9%8A%D9%86-2026-04-08-12' OR apply_url = 'https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B9%D9%84%D9%86-%D8%AA%D9%88%D9%81%D8%B1-300-%D9%85%D9%86%D8%AD%D8%A9-%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A%D8%A9-%D9%87%D9%86%D8%AF%D9%8A%D8%A9-%D9%84%D8%BA%D9%8A%D8%B1-%D8%A7%D9%84%D9%85%D9%88%D8%B8%D9%81%D9%8A%D9%86-2026-04-08-12' OR (title = 'التعليم تعلن توفر 300 منحة دراسية هندية لغير الموظفين' AND organization = 'Iraq Ministry of Higher Education and Scientific Research'))
  AND NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-mohesr-india-300-2026' OR duplicate_key = '2614d51934cced273b1d950029bffb595fa366c319323559910f674c6a48e184' OR source_url = 'https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B9%D9%84%D9%86-%D8%AA%D9%88%D9%81%D8%B1-300-%D9%85%D9%86%D8%AD%D8%A9-%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A%D8%A9-%D9%87%D9%86%D8%AF%D9%8A%D8%A9-%D9%84%D8%BA%D9%8A%D8%B1-%D8%A7%D9%84%D9%85%D9%88%D8%B8%D9%81%D9%8A%D9%86-2026-04-08-12' OR apply_url = 'https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B9%D9%84%D9%86-%D8%AA%D9%88%D9%81%D8%B1-300-%D9%85%D9%86%D8%AD%D8%A9-%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A%D8%A9-%D9%87%D9%86%D8%AF%D9%8A%D8%A9-%D9%84%D8%BA%D9%8A%D8%B1-%D8%A7%D9%84%D9%85%D9%88%D8%B8%D9%81%D9%8A%D9%86-2026-04-08-12' OR (title = 'التعليم تعلن توفر 300 منحة دراسية هندية لغير الموظفين' AND organization = 'Iraq Ministry of Higher Education and Scientific Research'));

INSERT INTO opportunity_candidates (
  id, source_id, title, organization, category, description, summary, eligibility, deadline, published_date, apply_url, source_url, image_url, country, governorate, city, language, salary_or_funding, confidence_score, duplicate_key, status, rejection_reason, created_at, updated_at
)
SELECT
  'phase4-mohesr-turkish-2026', NULL, 'التعليم تعلن توفر منح دراسية تركية', 'Iraq Ministry of Higher Education and Scientific Research', 'scholarship',
  'Official ministry announcement for Turkish scholarships; source text states the application deadline is 2026/7/1.', 'Official ministry announcement for Turkish scholarships; source text states the application deadline is 2026/7/1.', NULL, '2026-07-01', '2025-06-12',
  'https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B9%D9%84%D9%86-%D8%AA%D9%88%D9%81%D8%B1-%D9%85%D9%86%D8%AD-%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A%D8%A9-%D8%AA%D8%B1%D9%83%D9%8A%D8%A9-2025-06-12-14', 'https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B9%D9%84%D9%86-%D8%AA%D9%88%D9%81%D8%B1-%D9%85%D9%86%D8%AD-%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A%D8%A9-%D8%AA%D8%B1%D9%83%D9%8A%D8%A9-2025-06-12-14', NULL, 'Iraq', NULL, NULL,
  'ar', NULL, 86, 'e1d84125a6cc02e6da8a9d4333068324c0d54a7745e3948d78ef3f395b299830', 'pending_review', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM opportunity_candidates WHERE id = 'phase4-mohesr-turkish-2026' OR duplicate_key = 'e1d84125a6cc02e6da8a9d4333068324c0d54a7745e3948d78ef3f395b299830' OR source_url = 'https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B9%D9%84%D9%86-%D8%AA%D9%88%D9%81%D8%B1-%D9%85%D9%86%D8%AD-%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A%D8%A9-%D8%AA%D8%B1%D9%83%D9%8A%D8%A9-2025-06-12-14' OR apply_url = 'https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B9%D9%84%D9%86-%D8%AA%D9%88%D9%81%D8%B1-%D9%85%D9%86%D8%AD-%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A%D8%A9-%D8%AA%D8%B1%D9%83%D9%8A%D8%A9-2025-06-12-14' OR (title = 'التعليم تعلن توفر منح دراسية تركية' AND organization = 'Iraq Ministry of Higher Education and Scientific Research'))
  AND NOT EXISTS (SELECT 1 FROM highlight_items WHERE id = 'phase4-mohesr-turkish-2026' OR duplicate_key = 'e1d84125a6cc02e6da8a9d4333068324c0d54a7745e3948d78ef3f395b299830' OR source_url = 'https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B9%D9%84%D9%86-%D8%AA%D9%88%D9%81%D8%B1-%D9%85%D9%86%D8%AD-%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A%D8%A9-%D8%AA%D8%B1%D9%83%D9%8A%D8%A9-2025-06-12-14' OR apply_url = 'https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B9%D9%84%D9%86-%D8%AA%D9%88%D9%81%D8%B1-%D9%85%D9%86%D8%AD-%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A%D8%A9-%D8%AA%D8%B1%D9%83%D9%8A%D8%A9-2025-06-12-14' OR (title = 'التعليم تعلن توفر منح دراسية تركية' AND organization = 'Iraq Ministry of Higher Education and Scientific Research'));

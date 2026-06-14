-- Jamiaati content population seed

-- Generated at 2026-06-14T11:09:33.994Z



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
VALUES ('turkiye-scholarships', 'Türkiye Scholarships', 'https://www.turkiyeburslari.gov.tr', 'scholarships', 1, NULL, NULL);

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
  'قاعدة بيانات منح DAAD للطلاب العراقيين',
  'بنکەی زانیاری بورسەکانی DAAD بۆ قوتابیانی عێراق',
  'A trusted scholarship database for Iraqi students, graduates, researchers, and academics looking for study and research funding in Germany. Check the official DAAD page for the exact current deadline and requirements.',
  'قاعدة موثوقة للمنح الدراسية للطلاب والخريجين والباحثين والأكاديميين العراقيين الراغبين بالدراسة أو البحث في ألمانيا. يرجى مراجعة صفحة DAAD الرسمية لمعرفة آخر موعد وشروط التقديم الحالية.',
  'بنکەیەکی باوەڕپێکراو بۆ بورسەکانی قوتابیان، دەرچووان، توێژەران و ئەکادیمییە عێراقییەکان بۆ خوێندن و توێژینەوە لە ئەڵمانیا. تکایە پەڕەی فەرمی DAAD ببینە بۆ دوا وادە و مەرجەکان.',
  'DAAD Iraq',
  'scholarship',
  'Germany',
  'all',
  'Check official website',
  'https://www.daad-iraq.org/en/find-funding/scholarship-database/',
  'https://www.daad-iraq.org/en/find-funding/scholarship-database/',
  '2026-06-14T11:09:33.994Z',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=900',
  'pending_review',
  '2026-06-14T11:09:33.994Z',
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
  'منح تشيفنينغ للعراق',
  'بورسی Chevening بۆ عێراق',
  'A major UK scholarship route for future leaders from Iraq to study a one-year master''s degree. Applicants should always check the official Chevening Iraq page for the current cycle dates and eligibility details.',
  'مسار مهم للمنح البريطانية لقادة المستقبل من العراق لدراسة الماجستير لمدة سنة واحدة. يجب دائماً مراجعة صفحة تشيفنينغ الرسمية للعراق لمعرفة مواعيد الدورة الحالية وشروط الأهلية.',
  'ڕێگایەکی گرنگی بورسی بەریتانیاست بۆ ڕابەرانی داهاتووی عێراق بۆ خوێندنی ماستەر بۆ ماوەی ساڵێک. هەمیشە پەڕەی فەرمی Chevening Iraq بپشکنە بۆ وادە و مەرجە نوێیەکان.',
  'Chevening',
  'scholarship',
  'United Kingdom',
  'all',
  'Check official website',
  'https://www.chevening.org/scholarships/iraq/',
  'https://www.chevening.org/scholarships/iraq/',
  '2026-06-14T11:09:33.994Z',
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=900',
  'pending_review',
  '2026-06-14T11:09:33.994Z',
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
  'منح إيراسموس موندوس للماجستير المشترك',
  'بورسی Erasmus Mundus بۆ ماستەری هاوبەش',
  'A popular European scholarship path for international students, including Iraqi applicants, through selected joint master''s programs. Students should browse the official catalogue and check each program''s deadline.',
  'مسار أوروبي مشهور للمنح للطلاب الدوليين، ومن ضمنهم المتقدمون من العراق، عبر برامج ماجستير مشتركة مختارة. يجب تصفح الفهرس الرسمي ومراجعة موعد كل برنامج.',
  'ڕێگایەکی ناسراوی ئەورووپییە بۆ خوێندکارانی نێودەوڵەتی، بە قوتابیانی عێراقیشەوە، لە ڕێگەی بەرنامەکانی ماستەری هاوبەش. قوتابی دەبێت کاتەلۆگی فەرمی ببینێت و دوا وادەی هەر بەرنامەیەک بپشکنێت.',
  'European Union',
  'scholarship',
  'Europe',
  'all',
  'Depends on selected program',
  'https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en',
  'https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en',
  '2026-06-14T11:09:33.994Z',
  'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=900',
  'pending_review',
  '2026-06-14T11:09:33.994Z',
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
  'Türkiye Scholarships',
  'منح تركيا',
  'بورسی تورکیا',
  'Government-funded scholarships for international students at multiple study levels. Iraqi students should check the official portal for the current application cycle, programs, and eligibility.',
  'منح ممولة من الحكومة التركية للطلاب الدوليين في عدة مستويات دراسية. على الطلاب العراقيين مراجعة البوابة الرسمية لمعرفة دورة التقديم الحالية والبرامج والشروط.',
  'بورسییەکی حکومی تورکیایە بۆ خوێندکارانی نێودەوڵەتی لە چەند ئاستێکی خوێندن. قوتابیانی عێراق پێویستە پۆرتاڵی فەرمی ببینن بۆ خولی نوێی پێشکەشکردن و بەرنامە و مەرجەکان.',
  'Türkiye Scholarships',
  'scholarship',
  'Turkey',
  'all',
  'Check official website',
  'https://www.turkiyeburslari.gov.tr',
  'https://www.turkiyeburslari.gov.tr',
  '2026-06-14T11:09:33.994Z',
  'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&q=80&w=900',
  'pending_review',
  '2026-06-14T11:09:33.994Z',
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
  'منح ومسارات الدراسة عبر كامبوس فرانس العراق',
  'بورس و ڕێگاکانی خوێندن لە ڕێگەی Campus France Iraq',
  'A useful route for Iraqi students exploring study in France, scholarship information, and admission guidance. Students should check the official Campus France Iraq site for updated calls.',
  'مسار مفيد للطلاب العراقيين الراغبين بالدراسة في فرنسا، ومعرفة معلومات المنح والإرشادات. يجب مراجعة موقع كامبوس فرانس العراق الرسمي لمعرفة الإعلانات الجديدة.',
  'ڕێگایەکی باشە بۆ قوتابیانی عێراق کە دەتەوێت لە فەرەنسا بخوێنن و زانیاریی بورس و وەرگرتن وەربگرن. تکایە ماڵپەڕی فەرمی Campus France Iraq ببینن بۆ بانگەوازە نوێیەکان.',
  'Campus France Iraq',
  'scholarship',
  'France',
  'all',
  'Check official website',
  'https://www.iraq.campusfrance.org',
  'https://www.iraq.campusfrance.org',
  '2026-06-14T11:09:33.994Z',
  'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=900',
  'pending_review',
  '2026-06-14T11:09:33.994Z',
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
  'أهلاً بك في ساحة الحياة الجامعية',
  'بەخێربێیت بۆ دیواری ژیانی زانکۆ',
  'This is a starter social post until students begin posting their real campus questions, photos, study groups, and daily university updates. The goal is to keep the app warm without pretending this is official news.',
  'هذا منشور اجتماعي تجريبي إلى أن يبدأ الطلاب بنشر أسئلتهم وصورهم ومجموعات الدراسة وتحديثاتهم اليومية. الهدف هو جعل التطبيق حيّاً دون ادعاء أنه خبر رسمي.',
  'ئەمە پۆستێکی کۆمەڵایەتی سەرەتاییە تا قوتابیان دەست بکەن بە بڵاوکردنەوەی پرسیار، وێنە، گروپی خوێندن و نوێکارییەکانی زانکۆ. ئامانج ئەوەیە ئەپەکە زیندوو بێت بەبێ ئەوەی وەک هەواڵی فەرمی پیشان بدرێت.',
  'Jamiaati Campus Life',
  'activity',
  'Iraq',
  'all',
  '',
  'https://https-github-com-mahdialmuntadhar1-rgb-studenthub-plus.pages.dev',
  'internal-demo-campus-life',
  '2026-06-14T11:09:33.994Z',
  'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&q=80&w=900',
  'pending_review',
  '2026-06-14T11:09:33.994Z',
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
  'هل تبحث عن زملاء للدراسة هذا الأسبوع؟',
  'ئەم هەفتەیە هاوڕێی خوێندن دەگەڕێیت؟',
  'A sample campus-life post encouraging students to create study groups, ask questions, and share helpful notes. This can be replaced by real user posts once the app grows.',
  'منشور تجريبي من الحياة الجامعية يشجع الطلاب على إنشاء مجموعات دراسة وطرح الأسئلة ومشاركة الملازم المفيدة. يمكن استبداله بمنشورات المستخدمين لاحقاً.',
  'پۆستێکی نموونەییە بۆ ژیانی زانکۆ کە قوتابیان هاندەدات گروپی خوێندن دروست بکەن، پرسیار بکەن و تێبینییە بەسوودەکان هاوبەش بکەن. دواتر دەتوانرێت بە پۆستی ڕاستەقینەی بەکارهێنەران بگۆڕدرێت.',
  'Jamiaati Campus Life',
  'student_club',
  'Iraq',
  'all',
  '',
  'https://https-github-com-mahdialmuntadhar1-rgb-studenthub-plus.pages.dev',
  'internal-demo-study-group',
  '2026-06-14T11:09:33.994Z',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=900',
  'pending_review',
  '2026-06-14T11:09:33.994Z',
  'Campus Life',
  'Students',
  '',
  'All Iraq',
  0,
  0,
  1
);

COMMIT;


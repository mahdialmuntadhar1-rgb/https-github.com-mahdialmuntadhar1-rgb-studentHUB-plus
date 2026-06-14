# Public Beta Data Checkpoint - 2026-06-12

Mode: documentation/checkpoint only. No D1 mutation, no deploy, no scraper run, no schema change.

## Production URLs

- Backend production: https://rafid-api.mahdialmuntadhar1.workers.dev
- Frontend production: https://idiot.mahdialmuntadhar1.workers.dev

## Current Public Counts

Verified against remote D1 and public API on 2026-06-12.

| Table / API | Approved public | Pending review | Rejected |
|---|---:|---:|---:|
| highlight_items | 29 | 26 | 5 |
| opportunity_candidates | 6 | 12 | 95 |
| Total | 35 | 38 | 100 |

Public API verification:

- `GET /api/highlights?limit=100` returned 29 rows.
- `GET /api/opportunities?limit=100` returned 6 rows.
- Demo public rows found: 0.
- Public API did not expose `status`, `rejection_reason`, or `raw_text`.
- Pending and rejected rows remain hidden from public endpoints.

## Approved Phase Rows

### Phase 1 approved highlights

- `phase1-uobaghdad-49164` - news - خطة الاجازات الدراسية للعام الدراسي ٢٠٢٦-٢٠٢٧
- `phase1-uobaghdad-49471` - news - أسماء المرشحين للإجازات الدراسية في جامعة بغداد للعام ٢٠٢٦-٢٠٢٧

### Phase 1 approved opportunities

- `phase1-daad-50110016` - scholarship - Study Visits for Academics - Artists and Architects - deadline `2026-08-31`
- `phase1-daad-57742121` - scholarship - Research Grants in Germany - deadline `2026-08-31`

### Phase 3 approved highlights

- `phase3-univsul-16112` - exam - University Vice Presidents Visit Examination Halls Across Campuses
- `phase3-univsul-16198` - activity - University of Sulaimani President Honours Women’s Handball Team
- `phase3-univsul-16243` - news - University President Recognises Women’s Leadership Development Programme Trainers
- `phase3-uot-air-defense-2026-06-07` - news - University of Technology and Iraqi Air Defense Command Sign Cooperation Framework

### Phase 3 approved opportunities

- `phase3-mohesr-india-sobhit-2026` - scholarship - منح دراسية هندية من Sobhit Institute of Engineering & Technology للعام الدراسي 2026-2027 - deadline `2026-08-02`
- `phase3-unfpa-34768` - job - International Consultant: Development of In-Depth Analysis Census Results, Erbil, Iraq - deadline `2026-06-16`

### Phase 4 approved highlights

- `phase4-diyala-89614` - news - جامعة ديالى تسهم في ترصين المشاريع الخدمية بمحاضرة تخصصية حول استدامة المنشآت وتقليل كلف الصيانة
- `phase4-diyala-89619` - news - جامعة ديالى تمضي نحو التوسع الأكاديمي النوعي .. لجنة وزارية تقيّم استحداث كلية وتخصصات حديثة تواكب متطلبات المستقبل
- `phase4-diyala-89629` - news - كليـة التربيـة للعلــوم الصرفـة تقيـم الملتقى العلمـي العاشــر لبحــوث التخـرج
- `phase4-diyala-89654` - news - احموا اللعب ، احموا الطفولة .. استثماراً في بناء أجيال المستقبل
- `phase4-epu-62766` - news - سەرۆکی زانکۆ هۆڵەکانی تاقیکردنەوەی کۆتایی خولی زمانی ئینگلیزی بەسەردەکاتەوە
- `phase4-epu-62789` - activity - A lecturer from our university participated as an ITEC program ambassador in a Data Analysis training course in India.
- `phase4-epu-62823` - news - زانکۆی پۆلیتەکنیکی ھەولێر بە ھەماھەنگی دەزگای خێرخوازی بارزانی خولێکی ڕاھێنان بۆ مامۆستایان و بەرپرسی تەندروستی و سەلامەتی کۆلێژ و پەیمانگەکان دەکاتەوە
- `phase4-epu-62836` - news - A handover ceremony for the prosthetic hand and supportive devices was held between Erbil Polytechnic University and the International Committee of the Red Cross.
- `phase4-epu-62901` - news - سەرۆکی زانکۆ سەردانی کۆلیژی تەکنیکی کارگێری دەکات و بەشداریی لە تاوتوێکردنی ماستەرنامەیەک دەکات
- `phase4-karbala-50148` - news - الجامعة تحصد المرتبة العاشرة في التصنيف التجريبي للجامعات المحلية للعام 2025
- `phase4-karbala-50163` - news - متفوقة على نظيراتها في الجامعات العراقية&#8230;زراعة كربلاء تنال الاعتماد البرامجي الكامل
- `phase4-karbala-50173` - registration - جامعة كربلاء تستعرض مشاريع طلبتها استعدادا للمنافسة في بطولة NURAI 2026
- `phase4-ntu-316311` - registration - University's Department of Graduate Studies Announces the Opening of Applications for Postgraduate Programs at the Higher Institute of Health Technologies and Artificial Intelligence.
- `phase4-ntu-316313` - exam - University Committee Inspects Examination Process at Nineveh Technical Administrative Institute.
- `phase4-ntu-316315` - activity - Northern Technical University Participates in the Ministerial Workshop on Activating Science and Technology Parks in Iraqi Universities.
- `phase4-ntu-316378` - news - الجامعة تجري مرحلة التقييم للمشاريع المشاركة في البطولة الجامعية للروبوتات والذكاء الاصطناعي NURAI 2026
- `phase4-ntu-316386` - news - مركز الحاسبة الإلكترونية في الجامعة التقنية الشمالية يقيم دورة "التمكين الرقمي"
- `phase4-uomosul-88627` - registration - التعليم: تمديد التقديم للدراسات العليا داخل العراق للعام الدراسي 2027/2026
- `phase4-uomosul-88633` - registration - تنويه
- `phase4-uomosul-88645` - activity - رئيس جامعة الموصل يبحث إطلاق حملة تشجير واسعة لتعزيز المساحات الخضراء
- `phase4-uomosul-88651` - activity - إنجاز أكاديمي رائد لجامعة الموصل
- `phase4-uomosul-88657` - news - دعوة لنخب جامعة الموصل للمشاركة في مؤتمر الإبداع الفكري
- `phase4-uomosul-88661` - news - مجلس جامعة الموصل يناقش مشروع المدينة الطبية الجامعية ودعم البحث العلمي

### Phase 4 approved opportunities

- `phase4-mohesr-india-300-2026` - scholarship - التعليم تعلن توفر 300 منحة دراسية هندية لغير الموظفين - deadline `2026-10-31`
- `phase4-mohesr-turkish-2026` - scholarship - التعليم تعلن توفر منح دراسية تركية - deadline `2026-07-01`

## Deadline-Sensitive Approved Opportunities

| id | category | title | deadline | risk level as of 2026-06-12 | source_url |
|---|---|---|---|---|---|
| `phase3-unfpa-34768` | job | International Consultant: Development of In-Depth Analysis Census Results, Erbil, Iraq | 2026-06-16 | urgent, expires soon | https://estm.fa.em2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2003/job/34768 |
| `phase4-mohesr-turkish-2026` | scholarship | التعليم تعلن توفر منح دراسية تركية | 2026-07-01 | near-term | https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B9%D9%84%D9%86-%D8%AA%D9%88%D9%81%D8%B1-%D9%85%D9%86%D8%AD-%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A%D8%A9-%D8%AA%D8%B1%D9%83%D9%8A%D8%A9-2025-06-12-14 |
| `phase3-mohesr-india-sobhit-2026` | scholarship | منح دراسية هندية من Sobhit Institute of Engineering & Technology للعام الدراسي 2026-2027 | 2026-08-02 | medium-term | https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B9%D9%84%D9%86-%D8%AA%D9%88%D9%81%D8%B1-%D9%85%D9%86%D8%AD-%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A%D8%A9-%D9%87%D9%86%D8%AF%D9%8A%D8%A9-%D9%85%D8%AE%D8%B5%D8%B5%D8%A9-%D9%84%D9%84%D8%A3%D9%88%D9%84%D9%8A%D8%A9-%D9%88%D8%A7%D9%84%D8%B9%D9%84%D9%8A%D8%A7-2026-04-09-09 |
| `phase1-daad-50110016` | scholarship | Study Visits for Academics - Artists and Architects | 2026-08-31 | medium-term | https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/?detail=50110016 |
| `phase1-daad-57742121` | scholarship | Research Grants in Germany | 2026-08-31 | medium-term | https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/?detail=57742121 |
| `phase4-mohesr-india-300-2026` | scholarship | التعليم تعلن توفر 300 منحة دراسية هندية لغير الموظفين | 2026-10-31 | later | https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B9%D9%84%D9%86-%D8%AA%D9%88%D9%81%D8%B1-300-%D9%85%D9%86%D8%AD%D8%A9-%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A%D8%A9-%D9%87%D9%86%D8%AF%D9%8A%D8%A9-%D9%84%D8%BA%D9%8A%D8%B1-%D8%A7%D9%84%D9%85%D9%88%D8%B8%D9%81%D9%8A%D9%86-2026-04-08-12 |

## Expiry Monitoring Plan

### Detection

Run a scheduled backend check over approved `opportunity_candidates` where `deadline IS NOT NULL`.

Recommended query shape:

```sql
SELECT id, title, category, deadline, source_url, status
FROM opportunity_candidates
WHERE status = 'approved'
  AND deadline IS NOT NULL
ORDER BY deadline ASC;
```

Classify each approved opportunity:

- `active`: deadline is today or future.
- `expires_soon`: deadline is within 7 days.
- `expired`: deadline is before the current date.
- `needs_manual_check`: deadline is missing or malformed, or source currently disagrees with stored date.

For jobs, be stricter than scholarships:

- If a job deadline has passed, it should be hidden immediately.
- If the official source page is inaccessible or the closing date disappears, flag for admin review rather than auto-approve/keep public indefinitely.

### Public hiding behavior

Recommended safest behavior:

1. Do not delete expired approved rows.
2. Add backend logic so public `/api/opportunities` excludes approved rows with `deadline < current date`.
3. Separately, admin tooling can mark them `expired` or `rejected` after review.

If a status change is preferred later, use `status = 'expired'` where the existing table and admin routes already support it for opportunity candidates. This should be done only after explicit approval.

### Frequency

- Run daily at 03:00 Asia/Baghdad for normal monitoring.
- Run an extra manual check immediately before public launches or content pushes.
- For rows within 7 days of deadline, include them in a daily admin alert.

### Admin report

The expiry report should show:

- Total approved deadline-based opportunities.
- Expired approved opportunities.
- Opportunities expiring within 7 days.
- Rows with missing/malformed deadlines.
- Source URL and apply URL.
- Recommended action: keep public, hide from public, mark expired, or manual verify.

Priority alert as of this checkpoint:

- `phase3-unfpa-34768` expires on `2026-06-16`, so it should be checked daily and hidden/expired after `2026-06-16` unless the official source extends the deadline.

## Confirmations

- Demo public rows are removed: public API demo count is 0.
- Public endpoints show approved rows only.
- Pending review rows remain hidden.
- Rejected rows remain hidden.
- Public endpoints do not expose `status`, `rejection_reason`, or `raw_text`.
- No D1 mutation was performed for this checkpoint.
- No frontend deployment was performed.
- No backend deployment was performed.
- No scraper was run.
- No schema change was performed.

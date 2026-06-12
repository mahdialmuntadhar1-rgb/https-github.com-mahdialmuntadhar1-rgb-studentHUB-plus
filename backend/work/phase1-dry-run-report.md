# Jamiaati Phase 1 Population Dry Run

Run mode: dry-run only
Collected at: 2026-06-12T09:13:52.653Z

No D1 insert was performed. No approval/publication was performed. No frontend was touched.

## Selected 3 Sources

1. University of Baghdad
   - URL: https://uobaghdad.edu.iq/?lang=en
   - Category: highlights, news, announcements
   - Trust: official University of Baghdad website
   - Expected data: university news and announcements
   - Source type: official

2. DAAD Iraq Scholarship Database
   - URL: https://www.daad-iraq.org/en/find-funding/scholarship-database/
   - Category: scholarship
   - Trust: official DAAD Iraq funding database for Iraq-origin applicants
   - Expected data: scholarship options
   - Source type: official

3. UNjobs Vacancies in Iraq
   - URL: https://unjobs.org/duty_stations/iraq
   - Category: job/internship
   - Trust: reputable UN/international-organization job aggregator with Iraq duty-station listings
   - Expected data: Iraq job and consultant vacancy listings
   - Source type: reputable aggregator

## Pages Scanned

- https://uobaghdad.edu.iq/?lang=en
- https://uobaghdad.edu.iq/?p=49471
- https://uobaghdad.edu.iq/?p=49164
- https://uobaghdad.edu.iq/?p=48906
- https://www.daad-iraq.org/en/find-funding/scholarship-database/
- https://unjobs.org/duty_stations/iraq

## Counts

- Sources scanned: 3
- Items found: 10
- Rejected expired: 0
- Rejected duplicate: 1
- Rejected generic: 0
- Rejected no URL: 0
- Rejected unclear/unrelated: 0
- Pending_review would insert after duplicate check: 9

Duplicate read-check result:
- `https://uobaghdad.edu.iq/?p=48906` already exists in `opportunity_candidates` with status `rejected`, so it is excluded from proposed insert.

## Sample Items That Would Insert

1. أسماء المرشحين للإجازات الدراسية في جامعة بغداد للعام ٢٠٢٦-٢٠٢٧
   - Table: `highlight_items`
   - Category: `news`
   - Organization/university: University of Baghdad
   - Governorate/city: Baghdad / Baghdad
   - Source URL: https://uobaghdad.edu.iq/?p=49471
   - Confidence: 88
   - Why passed: official University of Baghdad post with specific title and stable source URL.

2. خطة الاجازات الدراسية للعام الدراسي ٢٠٢٦-٢٠٢٧
   - Table: `highlight_items`
   - Category: `news`
   - Organization/university: University of Baghdad
   - Governorate/city: Baghdad / Baghdad
   - Source URL: https://uobaghdad.edu.iq/?p=49164
   - Confidence: 88
   - Why passed: official University of Baghdad post with specific title and stable source URL.

3. Research Grants in Germany
   - Table: `opportunity_candidates`
   - Type: `scholarship`
   - Organization: DAAD Iraq
   - Governorate/city: null / null
   - Deadline: 2026-08-31
   - Source URL: https://www.daad-iraq.org/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=88&origin=88&pg=1&tab=&intention=&detail_to_show=57742121
   - Apply URL: same as source URL
   - Confidence: 92
   - Why passed: official DAAD Iraq scholarship listing for Iraq-origin applicants with item detail URL.

4. Study Visits for Academics - Artists and Architects
   - Table: `opportunity_candidates`
   - Type: `scholarship`
   - Organization: DAAD Iraq
   - Governorate/city: null / null
   - Deadline: 2026-08-31
   - Source URL: https://www.daad-iraq.org/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=88&origin=88&pg=1&tab=&intention=&detail_to_show=50110016
   - Apply URL: same as source URL
   - Confidence: 92
   - Why passed: official DAAD Iraq scholarship listing for Iraq-origin applicants with item detail URL.

5. Shock Responsive & Adaptive Social Protection (SRASP) Coordinator, Baghdad, Iraq
   - Table: `opportunity_candidates`
   - Type: `job`
   - Organization: WFP - World Food Programme
   - Governorate/city: Baghdad / Baghdad
   - Deadline: unknown, requires admin verification before approval
   - Source URL: https://unjobs.org/vacancies/1781188321428
   - Apply URL: same as source URL
   - Confidence: 82
   - Why passed: specific Iraq vacancy from UNjobs with real item URL.

6. Country Director, Iraq, Erbil, Iraq
   - Table: `opportunity_candidates`
   - Type: `job`
   - Organization: Save the Children
   - Governorate/city: Erbil / Erbil
   - Deadline: unknown, requires admin verification before approval
   - Source URL: https://unjobs.org/vacancies/1781163781899
   - Apply URL: same as source URL
   - Confidence: 82
   - Why passed: specific Iraq vacancy from UNjobs with real item URL.

7. International Consultant: Development of In-Depth Analysis Census Results, Erbil, Iraq
   - Table: `opportunity_candidates`
   - Type: `job`
   - Organization: UNFPA - United Nations Population Fund
   - Governorate/city: Erbil / Erbil
   - Deadline: unknown, requires admin verification before approval
   - Source URL: https://unjobs.org/vacancies/1781165064495
   - Apply URL: same as source URL
   - Confidence: 82
   - Why passed: specific Iraq vacancy from UNjobs with real item URL.

8. Call for an External Collaborator to support project implementation and monitoring in Dohuk., Iraq
   - Table: `opportunity_candidates`
   - Type: `job`
   - Organization: ILO - International Labour Organization
   - Governorate/city: Duhok / Duhok
   - Deadline: unknown, requires admin verification before approval
   - Source URL: https://unjobs.org/vacancies/1781111792993
   - Apply URL: same as source URL
   - Confidence: 82
   - Why passed: specific Iraq vacancy from UNjobs with real item URL.

9. Call for an External Collaborator to support project implementation and monitoring in Ninawa., Iraq
   - Table: `opportunity_candidates`
   - Type: `job`
   - Organization: ILO - International Labour Organization
   - Governorate/city: Nineveh / null
   - Deadline: unknown, requires admin verification before approval
   - Source URL: https://unjobs.org/vacancies/1781111809577
   - Apply URL: same as source URL
   - Confidence: 82
   - Why passed: specific Iraq vacancy from UNjobs with real item URL.

## Confirmation

- No fake or invented content.
- No expired item accepted in this dry-run.
- No D1 insert performed.
- No item approved or auto-published.
- No broad scraper or all-source automation run.
- No frontend touched or deployed.
- Demo data and existing data were not removed.

Approval is required before any D1 insertion.

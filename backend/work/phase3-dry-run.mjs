import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const currentDate = '2026-06-12';
const collectedAt = new Date().toISOString();

const selectedSources = [
  {
    id: 'mohesr-study-in-iraq',
    name: 'Iraq Ministry of Higher Education - Study in Iraq launch',
    url: 'https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B7%D9%84%D9%82-%D8%A7%D9%84%D9%86%D8%B3%D8%AE%D8%A9-%D8%A7%D9%84%D8%B1%D8%A7%D8%A8%D8%B9%D8%A9-%D9%85%D9%86-%D8%A8%D8%B1%D9%86%D8%A7%D9%85%D8%AC-%D8%A7%D8%AF%D8%B1%D8%B3-%D9%81%D9%8A-%D8%A7%D9%84%D8%B9%D8%B1%D8%A7%D9%82-%D9%84%D8%A7%D8%B3%D8%AA%D9%82%D8%B7%D8%A7%D8%A8-%D8%A7%D9%84%D8%B7%D9%84%D8%A8%D8%A9-%D8%A7%D9%84%D8%AF%D9%88%D9%84%D9%8A%D9%8A%D9%86-2026-05-04-12',
    category: 'scholarship',
    trustedBecause: 'Official Iraqi Ministry of Higher Education and Scientific Research news page.',
    expectedDataType: 'Study in Iraq scholarship/registration announcement',
    visibleDates: 'Published 2026-05-04; postgraduate until July 2026 and undergraduate until September 2026 stated on page.',
    officialStatus: 'official',
  },
  {
    id: 'mohesr-india-scholarships',
    name: 'Iraq Ministry of Higher Education - Indian scholarships',
    url: 'https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B9%D9%84%D9%86-%D8%AA%D9%88%D9%81%D8%B1-%D9%85%D9%86%D8%AD-%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A%D8%A9-%D9%87%D9%86%D8%AF%D9%8A%D8%A9-%D9%85%D8%AE%D8%B5%D8%B5%D8%A9-%D9%84%D9%84%D8%A3%D9%88%D9%84%D9%8A%D8%A9-%D9%88%D8%A7%D9%84%D8%B9%D9%84%D9%8A%D8%A7-2026-04-09-09',
    category: 'scholarship',
    trustedBecause: 'Official Iraqi Ministry of Higher Education and Scientific Research scholarship announcement.',
    expectedDataType: 'External scholarship announcement for Iraqi students',
    visibleDates: 'Published 2026-04-09; deadlines 2026-04-30 and 2026-08-02 stated in page snippet/source text.',
    officialStatus: 'official',
  },
  {
    id: 'univsul-news',
    name: 'University of Sulaimani news',
    url: 'https://univsul.edu.iq/en/news/2026/06/11/16243/',
    category: 'news',
    trustedBecause: 'Official University of Sulaimani news page.',
    expectedDataType: 'Campus news/activity',
    visibleDates: 'Published 2026-06-11; article text references 2026-06-10.',
    officialStatus: 'official',
  },
  {
    id: 'univsul-sport',
    name: 'University of Sulaimani student activity news',
    url: 'https://univsul.edu.iq/en/news/2026/06/11/16198/',
    category: 'activity',
    trustedBecause: 'Official University of Sulaimani news page.',
    expectedDataType: 'Student/campus activity',
    visibleDates: 'Published 2026-06-11; article text references 2026-06-10.',
    officialStatus: 'official',
  },
  {
    id: 'univsul-exam',
    name: 'University of Sulaimani examination news',
    url: 'https://univsul.edu.iq/en/news/2026/06/06/16112/',
    category: 'exam',
    trustedBecause: 'Official University of Sulaimani news page.',
    expectedDataType: 'Exam/campus update',
    visibleDates: 'Published 2026-06-06; article text references 2026-06-03.',
    officialStatus: 'official',
  },
  {
    id: 'epu-news',
    name: 'Erbil Polytechnic University news',
    url: 'https://epu.edu.iq/',
    category: 'news',
    trustedBecause: 'Official Erbil Polytechnic University website.',
    expectedDataType: 'Campus news/activity',
    visibleDates: 'Homepage/news listing shows June 2026 posted dates.',
    officialStatus: 'official',
  },
  {
    id: 'uot-news',
    name: 'University of Technology - Iraq news',
    url: 'https://uotechnology.edu.iq/en/news2026-06-07-6/',
    category: 'news',
    trustedBecause: 'Official University of Technology - Iraq news page.',
    expectedDataType: 'Campus news/announcement',
    visibleDates: 'Search/source page identifies Sunday, 2026-06-07.',
    officialStatus: 'official',
  },
  {
    id: 'uot-registration',
    name: 'University of Technology - Health Sciences application notice',
    url: 'https://hs.uotechnology.edu.iq/en/2026-5-10/',
    category: 'registration',
    trustedBecause: 'Official University of Technology - Iraq college page.',
    expectedDataType: 'Application/registration notice',
    visibleDates: 'Application period 2026-05-10 to 2026-06-11; expired as of 2026-06-12.',
    officialStatus: 'official',
  },
  {
    id: 'unfpa-oracle',
    name: 'UNFPA Oracle Careers',
    url: 'https://estm.fa.em2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2003/job/34768',
    category: 'job',
    trustedBecause: 'Official Oracle-hosted UNFPA candidate experience page.',
    expectedDataType: 'Iraq job/consultancy',
    visibleDates: 'Search/source metadata shows posting 2026-06-10 and Apply Before 2026-06-16.',
    officialStatus: 'official',
  },
  {
    id: 'iom-oracle',
    name: 'IOM Oracle Careers',
    url: 'https://fa-evlj-saasfaprod1.fa.ocs.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX/job/21346',
    category: 'job',
    trustedBecause: 'Official Oracle-hosted IOM candidate experience page.',
    expectedDataType: 'Iraq job',
    visibleDates: 'Static page accessible but deadline not visible in fetched page; kept for source quality review.',
    officialStatus: 'official',
  },
];

const candidates = [
  {
    id: 'phase3-mohesr-study-in-iraq-2026',
    sourceId: 'mohesr-study-in-iraq',
    target_table: 'opportunity_candidates',
    title: 'التعليم تطلق النسخة الرابعة من برنامج ادرس في العراق لاستقطاب الطلبة الدوليين',
    category: 'scholarship',
    organization: 'Iraq Ministry of Higher Education and Scientific Research',
    governorate: null,
    city: null,
    country: 'Iraq',
    source_url: selectedSources[0].url,
    apply_url: 'https://studyiniraq.scrd-gate.gov.iq/',
    deadline: '2026-07-31',
    published_date: '2026-05-04',
    summary: 'Official announcement for the fourth Study in Iraq programme for 2026/2027. The source states postgraduate applications are available until July 2026 and undergraduate applications until September 2026; admin should confirm exact closing days before approval.',
    original_language: 'ar',
    confidence_score: 88,
    why_passed: 'Official ministry page; real programme; future application windows; official application portal available.',
    admin_verification_needed: 'yes - month-level deadlines need exact closing day confirmation.',
    status_note: 'active/future application window',
  },
  {
    id: 'phase3-mohesr-india-sobhit-2026',
    sourceId: 'mohesr-india-scholarships',
    target_table: 'opportunity_candidates',
    title: 'منح دراسية هندية من Sobhit Institute of Engineering & Technology للعام الدراسي 2026-2027',
    category: 'scholarship',
    organization: 'Iraq Ministry of Higher Education and Scientific Research',
    governorate: null,
    city: null,
    country: 'Iraq',
    source_url: selectedSources[1].url,
    apply_url: selectedSources[1].url,
    deadline: '2026-08-02',
    published_date: '2026-04-09',
    summary: 'Official ministry announcement for Indian scholarships. The page states Sobhit Institute of Engineering & Technology applications close on 2026-08-02.',
    original_language: 'ar',
    confidence_score: 90,
    why_passed: 'Official ministry scholarship page with a clear future deadline.',
    admin_verification_needed: 'no',
    status_note: 'active/future deadline',
  },
  {
    id: 'phase3-univsul-16243',
    sourceId: 'univsul-news',
    target_table: 'highlight_items',
    title: 'University President Recognises Women’s Leadership Development Programme Trainers',
    category: 'news',
    organization: 'University of Sulaimani',
    governorate: 'Sulaymaniyah',
    city: 'Sulaymaniyah',
    source_url: selectedSources[2].url,
    apply_url: null,
    event_date: null,
    published_date: '2026-06-11',
    summary: 'Official University of Sulaimani news item about recognition of Women’s Leadership Development Programme trainers.',
    original_language: 'en',
    confidence_score: 90,
    why_passed: 'Official university news page with visible published date and non-generic title.',
    admin_verification_needed: 'no',
    status_note: 'current news',
  },
  {
    id: 'phase3-univsul-16198',
    sourceId: 'univsul-sport',
    target_table: 'highlight_items',
    title: 'University of Sulaimani President Honours Women’s Handball Team',
    category: 'activity',
    organization: 'University of Sulaimani',
    governorate: 'Sulaymaniyah',
    city: 'Sulaymaniyah',
    source_url: selectedSources[3].url,
    apply_url: null,
    event_date: null,
    published_date: '2026-06-11',
    summary: 'Official University of Sulaimani campus activity item about recognition of the women’s handball team.',
    original_language: 'en',
    confidence_score: 88,
    why_passed: 'Official university page; student/campus activity; visible published date.',
    admin_verification_needed: 'no',
    status_note: 'current activity/news',
  },
  {
    id: 'phase3-univsul-16112',
    sourceId: 'univsul-exam',
    target_table: 'highlight_items',
    title: 'University Vice Presidents Visit Examination Halls Across Campuses',
    category: 'exam',
    organization: 'University of Sulaimani',
    governorate: 'Sulaymaniyah',
    city: 'Sulaymaniyah',
    source_url: selectedSources[4].url,
    apply_url: null,
    event_date: null,
    published_date: '2026-06-06',
    summary: 'Official University of Sulaimani exam update about vice presidents visiting examination halls during second-semester final examinations.',
    original_language: 'en',
    confidence_score: 86,
    why_passed: 'Official university exam/campus update; visible published date; not an event requiring future attendance.',
    admin_verification_needed: 'no',
    status_note: 'current exam update',
  },
  {
    id: 'phase3-uot-air-defense-2026-06-07',
    sourceId: 'uot-news',
    target_table: 'highlight_items',
    title: 'University of Technology and Iraqi Air Defense Command Sign Cooperation Framework',
    category: 'news',
    organization: 'University of Technology - Iraq',
    governorate: 'Baghdad',
    city: 'Baghdad',
    source_url: selectedSources[6].url,
    apply_url: null,
    event_date: null,
    published_date: '2026-06-07',
    summary: 'Official University of Technology - Iraq news item about signing a cooperation framework with the Iraqi Air Defense Command.',
    original_language: 'en',
    confidence_score: 84,
    why_passed: 'Official university news page with visible 2026-06-07 date.',
    admin_verification_needed: 'no',
    status_note: 'current news',
  },
  {
    id: 'phase3-unfpa-34768',
    sourceId: 'unfpa-oracle',
    target_table: 'opportunity_candidates',
    title: 'International Consultant: Development of In-Depth Analysis Census Results, Erbil, Iraq',
    category: 'job',
    organization: 'UNFPA - United Nations Population Fund',
    governorate: 'Erbil',
    city: 'Erbil',
    country: 'Iraq',
    source_url: selectedSources[8].url,
    apply_url: selectedSources[8].url,
    deadline: '2026-06-16',
    published_date: '2026-06-10',
    summary: 'Official UNFPA Oracle careers posting for an international consultant role in Erbil, Iraq. Source metadata shows Apply Before 2026-06-16.',
    original_language: 'en',
    confidence_score: 88,
    why_passed: 'Official Oracle-hosted UNFPA careers page with clear future Apply Before date.',
    admin_verification_needed: 'no',
    status_note: 'active/future deadline',
  },
];

const rejectedSeeds = [
  {
    title: 'The University of Technology announces the start of applications for evening studies',
    source: 'University of Technology - Health Sciences application notice',
    source_url: selectedSources[7].url,
    reason: 'expired',
    detail: 'Application period ended 2026-06-11, which is before current date 2026-06-12.',
  },
  {
    title: 'Christ University, Lavasa Campus, Pune India scholarships',
    source: 'Iraq Ministry of Higher Education - Indian scholarships',
    source_url: selectedSources[1].url,
    reason: 'expired',
    detail: 'Deadline stated as 2026-04-30, which is before current date 2026-06-12.',
  },
  {
    title: 'National Finance Officer (IP Compliance)',
    source: 'IOM Oracle Careers',
    source_url: selectedSources[9].url,
    reason: 'unclear',
    detail: 'Official source page is accessible, but fetched static page does not expose a real closing date; not proposed for insertion.',
  },
];

function cleanText(value = '') {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function duplicateKey(parts) {
  return createHash('sha256')
    .update(parts.filter(Boolean).join('|').toLowerCase())
    .digest('hex');
}

async function fetchPage(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'user-agent': 'JamiaatiPhase3DryRun/1.0 (+manual-review; limited-10-source-run)',
        accept: 'text/html,application/xhtml+xml',
      },
    });
    const html = await res.text();
    return {
      ok: res.ok,
      status: res.status,
      title: cleanText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || ''),
      text: cleanText(html).slice(0, 2500),
      length: html.length,
    };
  } catch (error) {
    return { ok: false, status: 0, title: '', text: error.message, length: 0 };
  }
}

function runD1DuplicateCheck(items) {
  const urls = [...new Set(items.flatMap((item) => [item.source_url, item.apply_url]).filter(Boolean))];
  const keys = [...new Set(items.map((item) => item.duplicate_key).filter(Boolean))];
  const titles = [...new Set(items.map((item) => item.title.replaceAll("'", "''")))];
  const organizations = [...new Set(items.map((item) => item.organization?.replaceAll("'", "''")).filter(Boolean))];
  const inList = (values) => values.map((v) => `'${String(v).replaceAll("'", "''")}'`).join(',');
  const sql = `
SELECT 'highlight_items' AS table_name, id, title, organization, category, status, source_url, apply_url, duplicate_key
FROM highlight_items
WHERE duplicate_key IN (${inList(keys)}) OR source_url IN (${inList(urls)}) OR apply_url IN (${inList(urls)}) OR (title IN (${inList(titles)}) AND organization IN (${inList(organizations)}))
UNION ALL
SELECT 'opportunity_candidates' AS table_name, id, title, organization, category, status, source_url, apply_url, duplicate_key
FROM opportunity_candidates
WHERE duplicate_key IN (${inList(keys)}) OR source_url IN (${inList(urls)}) OR apply_url IN (${inList(urls)}) OR (title IN (${inList(titles)}) AND organization IN (${inList(organizations)}));
`;
  const command = `npx wrangler d1 execute rafid-db --config ./wrangler.toml --remote --json --command ${JSON.stringify(sql)}`;
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    const parsed = JSON.parse(output);
    return parsed?.[0]?.results || [];
  } catch (error) {
    return [{ duplicate_check_error: error.message }];
  }
}

function isDuplicate(item, rows) {
  return rows.find((row) => {
    if (row.duplicate_check_error) return false;
    return row.duplicate_key === item.duplicate_key
      || row.source_url === item.source_url
      || (item.apply_url && row.apply_url === item.apply_url)
      || (row.title === item.title && row.organization === item.organization);
  });
}

const fetchedSources = [];
for (const source of selectedSources) {
  fetchedSources.push({ ...source, fetch: await fetchPage(source.url) });
}

const fetchedCandidates = [];
for (const item of candidates) {
  const fetch = await fetchPage(item.source_url);
  const keyParts = [item.target_table, item.category, item.title, item.organization, item.source_url, item.deadline || item.published_date || item.event_date];
  fetchedCandidates.push({
    ...item,
    collected_at: collectedAt,
    status: 'pending_review',
    duplicate_key: duplicateKey(keyParts),
    source_accessible: fetch.ok,
    source_http_status: fetch.status,
    source_page_title: fetch.title,
  });
}

const duplicateRows = runD1DuplicateCheck(fetchedCandidates);
const proposed = [];
const rejectedDuplicate = [];

for (const item of fetchedCandidates) {
  const match = isDuplicate(item, duplicateRows);
  if (match) {
    rejectedDuplicate.push({
      ...item,
      reason: 'duplicate',
      duplicate_target: `${match.table_name}:${match.id}:${match.status}`,
    });
  } else {
    proposed.push({ ...item, duplicate_status: 'unique' });
  }
}

const rejected = [
  ...rejectedSeeds,
  ...rejectedDuplicate.map((item) => ({
    title: item.title,
    source: item.organization,
    source_url: item.source_url,
    reason: 'duplicate',
    detail: `Already exists as ${item.duplicate_target}`,
    duplicate_target: item.duplicate_target,
  })),
];

const counts = {
  selected_sources: selectedSources.length,
  pages_scanned: fetchedSources.length + candidates.length,
  items_found: candidates.length + rejectedSeeds.length,
  rejected_expired: rejected.filter((r) => r.reason === 'expired').length,
  rejected_duplicate: rejected.filter((r) => r.reason === 'duplicate').length,
  rejected_generic: 0,
  rejected_no_url: 0,
  rejected_unclear_or_unrelated: rejected.filter((r) => r.reason === 'unclear').length,
  proposed_pending_review_inserts: proposed.length,
};

const report = {
  mode: 'dry-run-only',
  current_date: currentDate,
  collected_at: collectedAt,
  selected_sources: fetchedSources,
  counts,
  proposed_pending_review_inserts: proposed,
  rejected_items: rejected,
  duplicate_check_rows: duplicateRows,
  safety: {
    d1_writes: false,
    approvals: false,
    frontend_deploy: false,
    broad_scraper: false,
    schema_change: false,
  },
};

writeFileSync('work/phase3-dry-run-report.json', JSON.stringify(report, null, 2), 'utf8');

const sourceRows = fetchedSources.map((s) =>
  `| ${s.name} | ${s.url} | ${s.category} | ${s.trustedBecause} | ${s.expectedDataType} | ${s.visibleDates} | ${s.officialStatus} | ${s.fetch.ok ? `yes (${s.fetch.status})` : `no (${s.fetch.status})`} |`
).join('\n');

const proposedRows = proposed.slice(0, 25).map((item) =>
  `| ${item.title} | ${item.category} | ${item.target_table} | ${item.organization} | ${(item.governorate || 'null')} / ${(item.city || 'null')} | ${item.deadline || item.event_date || item.published_date || 'null'} | ${item.source_url} | ${item.apply_url || 'null'} | ${item.confidence_score} | ${item.why_passed} | ${item.duplicate_status} | ${item.status_note} | ${item.admin_verification_needed} |`
).join('\n');

const rejectedRows = rejected.map((item) =>
  `| ${item.title} | ${item.source} | ${item.source_url} | ${item.reason} | ${item.detail} | ${item.duplicate_target || 'null'} |`
).join('\n');

const markdown = `# Phase 3 Dry-Run Report

Mode: DRY-RUN ONLY. No D1 writes. No approvals. No frontend deploy. No broad scraper.

Current date used for expiry checks: ${currentDate}
Collected at: ${collectedAt}

## Selected 10 Sources

| Source name | Source URL | Category | Why trusted | Expected data type | Visible dates/deadlines | Official/reputable status | Accessible |
|---|---|---|---|---|---|---|---|
${sourceRows}

## Counts

- selected sources: ${counts.selected_sources}
- pages scanned: ${counts.pages_scanned}
- items found: ${counts.items_found}
- rejected expired: ${counts.rejected_expired}
- rejected duplicate: ${counts.rejected_duplicate}
- rejected generic: ${counts.rejected_generic}
- rejected no URL: ${counts.rejected_no_url}
- rejected unclear/unrelated: ${counts.rejected_unclear_or_unrelated}
- proposed pending_review inserts: ${counts.proposed_pending_review_inserts}

## Proposed pending_review Items (max 25)

| title | category/type | target table | organization/university | governorate/city | deadline/event_date/published_date | source_url | apply_url | confidence_score | why it passed | duplicate status | active/expired status | admin verification needed |
|---|---|---|---|---|---|---|---|---:|---|---|---|---|
${proposedRows || '| none | | | | | | | | | | | | |'}

## Rejected Items

| title | source | source_url | reason rejected | detail | duplicate target |
|---|---|---|---|---|---|
${rejectedRows || '| none | | | | | |'}

## Safety Notes

- No D1 insert/update/delete was performed.
- No item was approved or published.
- No frontend deployment was performed.
- No scraper broad run was performed; this was a limited 10-source dry run.
- No schema change was performed.
- All proposed rows must be inserted later, if approved, with status = pending_review only.
`;

writeFileSync('work/phase3-dry-run-report.md', markdown, 'utf8');
console.log(JSON.stringify(counts, null, 2));

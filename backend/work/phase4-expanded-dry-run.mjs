import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const currentDate = '2026-06-12';
const collectedAt = new Date().toISOString();
const maxProposed = 60;
const maxPostsPerFeed = 10;

const sources = [
  { id: 'uobaghdad', name: 'University of Baghdad', url: 'https://uobaghdad.edu.iq/', feed: 'https://uobaghdad.edu.iq/wp-json/wp/v2/posts?per_page=10', category: 'Campus Life', expectedDataType: 'news, announcements, exams, activities', trustedBecause: 'Official university website.', status: 'official', organization: 'University of Baghdad', governorate: 'Baghdad', city: 'Baghdad' },
  { id: 'univsul', name: 'University of Sulaimani', url: 'https://univsul.edu.iq/en/', feed: 'https://univsul.edu.iq/en/wp-json/wp/v2/posts?per_page=10', category: 'Campus Life', expectedDataType: 'news, activities, exams', trustedBecause: 'Official university website.', status: 'official', organization: 'University of Sulaimani', governorate: 'Sulaymaniyah', city: 'Sulaymaniyah' },
  { id: 'uobasrah', name: 'University of Basrah', url: 'https://uobasrah.edu.iq/', feed: 'https://uobasrah.edu.iq/wp-json/wp/v2/posts?per_page=10', category: 'Campus Life', expectedDataType: 'news, announcements, events', trustedBecause: 'Official university website.', status: 'official', organization: 'University of Basrah', governorate: 'Basra', city: 'Basra' },
  { id: 'uomosul', name: 'University of Mosul', url: 'https://uomosul.edu.iq/', feed: 'https://uomosul.edu.iq/wp-json/wp/v2/posts?per_page=10', category: 'Campus Life', expectedDataType: 'news, exams, activities', trustedBecause: 'Official university website.', status: 'official', organization: 'University of Mosul', governorate: 'Nineveh', city: 'Mosul' },
  { id: 'uotechnology', name: 'University of Technology Iraq', url: 'https://uotechnology.edu.iq/', feed: 'https://uotechnology.edu.iq/wp-json/wp/v2/posts?per_page=10', category: 'Campus Life', expectedDataType: 'news, registration, announcements', trustedBecause: 'Official university website.', status: 'official', organization: 'University of Technology - Iraq', governorate: 'Baghdad', city: 'Baghdad' },
  { id: 'epu', name: 'Erbil Polytechnic University', url: 'https://epu.edu.iq/', feed: 'https://epu.edu.iq/wp-json/wp/v2/posts?per_page=10', category: 'Campus Life', expectedDataType: 'news, activities', trustedBecause: 'Official university website.', status: 'official', organization: 'Erbil Polytechnic University', governorate: 'Erbil', city: 'Erbil' },
  { id: 'salahaddin', name: 'Salahaddin University', url: 'https://su.edu.krd/', feed: 'https://su.edu.krd/wp-json/wp/v2/posts?per_page=10', category: 'Campus Life', expectedDataType: 'news, announcements', trustedBecause: 'Official university website.', status: 'official', organization: 'Salahaddin University-Erbil', governorate: 'Erbil', city: 'Erbil' },
  { id: 'duhok', name: 'University of Duhok', url: 'https://uod.ac/', feed: 'https://uod.ac/wp-json/wp/v2/posts?per_page=10', category: 'Campus Life', expectedDataType: 'news, announcements', trustedBecause: 'Official university website.', status: 'official', organization: 'University of Duhok', governorate: 'Duhok', city: 'Duhok' },
  { id: 'koya', name: 'Koya University', url: 'https://koyauniversity.org/', feed: 'https://koyauniversity.org/wp-json/wp/v2/posts?per_page=10', category: 'Campus Life', expectedDataType: 'news, activities', trustedBecause: 'Official university website.', status: 'official', organization: 'Koya University', governorate: 'Erbil', city: 'Koya' },
  { id: 'mustansiriyah', name: 'Mustansiriyah University', url: 'https://uomustansiriyah.edu.iq/', feed: 'https://uomustansiriyah.edu.iq/wp-json/wp/v2/posts?per_page=10', category: 'Campus Life', expectedDataType: 'news, announcements', trustedBecause: 'Official university website.', status: 'official', organization: 'Mustansiriyah University', governorate: 'Baghdad', city: 'Baghdad' },
  { id: 'nahrain', name: 'Al-Nahrain University', url: 'https://nahrainuniv.edu.iq/', feed: 'https://nahrainuniv.edu.iq/wp-json/wp/v2/posts?per_page=10', category: 'Campus Life', expectedDataType: 'news, announcements', trustedBecause: 'Official university website.', status: 'official', organization: 'Al-Nahrain University', governorate: 'Baghdad', city: 'Baghdad' },
  { id: 'anbar', name: 'University of Anbar', url: 'https://uoanbar.edu.iq/', feed: 'https://uoanbar.edu.iq/wp-json/wp/v2/posts?per_page=10', category: 'Campus Life', expectedDataType: 'news, exams, registration', trustedBecause: 'Official university website.', status: 'official', organization: 'University of Anbar', governorate: 'Anbar', city: 'Ramadi' },
  { id: 'karbala', name: 'University of Karbala', url: 'https://uokerbala.edu.iq/', feed: 'https://uokerbala.edu.iq/wp-json/wp/v2/posts?per_page=10', category: 'Campus Life', expectedDataType: 'news, announcements, activities', trustedBecause: 'Official university website.', status: 'official', organization: 'University of Karbala', governorate: 'Karbala', city: 'Karbala' },
  { id: 'kufa', name: 'University of Kufa', url: 'https://uokufa.edu.iq/', feed: 'https://uokufa.edu.iq/wp-json/wp/v2/posts?per_page=10', category: 'Campus Life', expectedDataType: 'news, activities', trustedBecause: 'Official university website.', status: 'official', organization: 'University of Kufa', governorate: 'Najaf', city: 'Kufa' },
  { id: 'diyala', name: 'University of Diyala', url: 'https://uodiyala.edu.iq/', feed: 'https://uodiyala.edu.iq/wp-json/wp/v2/posts?per_page=10', category: 'Campus Life', expectedDataType: 'news, exams, activities', trustedBecause: 'Official university website.', status: 'official', organization: 'University of Diyala', governorate: 'Diyala', city: 'Baqubah' },
  { id: 'kirkuk', name: 'University of Kirkuk', url: 'https://uokirkuk.edu.iq/', feed: 'https://uokirkuk.edu.iq/wp-json/wp/v2/posts?per_page=10', category: 'Campus Life', expectedDataType: 'news, announcements', trustedBecause: 'Official university website.', status: 'official', organization: 'University of Kirkuk', governorate: 'Kirkuk', city: 'Kirkuk' },
  { id: 'ntu', name: 'Northern Technical University', url: 'https://ntu.edu.iq/', feed: 'https://ntu.edu.iq/wp-json/wp/v2/posts?per_page=10', category: 'Campus Life', expectedDataType: 'news, activities, announcements', trustedBecause: 'Official university website.', status: 'official', organization: 'Northern Technical University', governorate: 'Nineveh', city: 'Mosul' },
  { id: 'mtu', name: 'Middle Technical University', url: 'https://mtu.edu.iq/', feed: 'https://mtu.edu.iq/wp-json/wp/v2/posts?per_page=10', category: 'Campus Life', expectedDataType: 'news, announcements', trustedBecause: 'Official university website.', status: 'official', organization: 'Middle Technical University', governorate: 'Baghdad', city: 'Baghdad' },
  { id: 'stu', name: 'Southern Technical University', url: 'https://stu.edu.iq/', feed: 'https://stu.edu.iq/wp-json/wp/v2/posts?per_page=10', category: 'Campus Life', expectedDataType: 'news, activities, announcements', trustedBecause: 'Official university website.', status: 'official', organization: 'Southern Technical University', governorate: 'Basra', city: 'Basra' },
  { id: 'mohesr', name: 'Iraq Ministry of Higher Education', url: 'https://mohesr.gov.iq/', category: 'Scholarships / ministry announcements', expectedDataType: 'scholarships, registration, education announcements', trustedBecause: 'Official Iraqi Ministry of Higher Education website.', status: 'official' },
  { id: 'daad', name: 'DAAD Iraq', url: 'https://www.daad-iraq.org/en/find-funding/scholarship-database/', category: 'Scholarships', expectedDataType: 'scholarships with application windows', trustedBecause: 'Official DAAD Iraq funding database.', status: 'official' },
  { id: 'turkiye', name: 'Türkiye Scholarships', url: 'https://www.turkiyeburslari.gov.tr/', category: 'Scholarships', expectedDataType: 'scholarships', trustedBecause: 'Official Türkiye Scholarships portal.', status: 'official' },
  { id: 'erasmus', name: 'Erasmus Mundus Catalogue', url: 'https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en', category: 'Scholarships', expectedDataType: 'scholarship/fellowship catalogue entries', trustedBecause: 'Official European Commission/EACEA catalogue.', status: 'official' },
  { id: 'unfpa', name: 'UNFPA Oracle Careers', url: 'https://estm.fa.em2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2003/jobs', category: 'Jobs', expectedDataType: 'official job postings with Apply Before date', trustedBecause: 'Official Oracle-hosted UNFPA careers site.', status: 'official' },
];

const ministryOpportunities = [
  {
    id: 'phase4-mohesr-india-300-2026',
    title: 'التعليم تعلن توفر 300 منحة دراسية هندية لغير الموظفين',
    category: 'scholarship',
    organization: 'Iraq Ministry of Higher Education and Scientific Research',
    source_url: 'https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B9%D9%84%D9%86-%D8%AA%D9%88%D9%81%D8%B1-300-%D9%85%D9%86%D8%AD%D8%A9-%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A%D8%A9-%D9%87%D9%86%D8%AF%D9%8A%D8%A9-%D9%84%D8%BA%D9%8A%D8%B1-%D8%A7%D9%84%D9%85%D9%88%D8%B8%D9%81%D9%8A%D9%86-2026-04-08-12',
    deadline: '2026-10-31',
    published_date: '2026-04-08',
    summary: 'Official ministry announcement for 300 Indian scholarships for undergraduate, master, and doctoral programmes. The source states the deadline is 2026/10/31.',
    confidence_score: 91,
    note: 'clear future deadline',
  },
  {
    id: 'phase4-mohesr-turkish-2026',
    title: 'التعليم تعلن توفر منح دراسية تركية',
    category: 'scholarship',
    organization: 'Iraq Ministry of Higher Education and Scientific Research',
    source_url: 'https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B9%D9%84%D9%86-%D8%AA%D9%88%D9%81%D8%B1-%D9%85%D9%86%D8%AD-%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A%D8%A9-%D8%AA%D8%B1%D9%83%D9%8A%D8%A9-2025-06-12-14',
    deadline: '2026-07-01',
    published_date: '2025-06-12',
    summary: 'Official ministry announcement for Turkish scholarships; source text states the application deadline is 2026/7/1.',
    confidence_score: 86,
    note: 'clear future deadline but older ministry post',
  },
  {
    id: 'phase4-daad-summer-courses-2026-cycle',
    title: 'University Summer Courses offered in Germany for Foreign Students and Graduates',
    category: 'scholarship',
    organization: 'DAAD Iraq',
    source_url: 'https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/?detail=50035295',
    deadline: '2026-10-30',
    published_date: null,
    summary: 'Official DAAD programme page states applications are possible from 1 September each year and the deadline is 30 October each year. Admin should verify the 2026 call when it opens.',
    confidence_score: 80,
    note: 'future annual deadline; admin should verify cycle before approval',
  },
  {
    id: 'phase4-unfpa-34768',
    title: 'International Consultant: Development of In-Depth Analysis Census Results, Erbil, Iraq',
    category: 'job',
    organization: 'UNFPA - United Nations Population Fund',
    governorate: 'Erbil',
    city: 'Erbil',
    source_url: 'https://estm.fa.em2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2003/job/34768',
    deadline: '2026-06-16',
    published_date: '2026-06-10',
    summary: 'Official UNFPA Oracle posting with Apply Before 2026-06-16.',
    confidence_score: 88,
    note: 'clear future deadline but likely duplicate of Phase 3 approved row',
  },
];

const expiredOpportunitySeeds = [
  { title: 'التعليم تعلن توفر منح دراسية روسية', source: 'Iraq Ministry of Higher Education', source_url: 'https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B9%D9%84%D9%86-%D8%AA%D9%88%D9%81%D8%B1-%D9%85%D9%86%D8%AD-%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A%D8%A9-%D8%B1%D9%88%D8%B3%D9%8A%D8%A9-2025-12-16-13', reason: 'expired', detail: 'Deadline 2026/1/15 is before 2026-06-12.' },
  { title: 'Christ University, Lavasa Campus, Pune India scholarships', source: 'Iraq Ministry of Higher Education', source_url: 'https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B9%D9%84%D9%86-%D8%AA%D9%88%D9%81%D8%B1-%D9%85%D9%86%D8%AD-%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A%D8%A9-%D9%87%D9%86%D8%AF%D9%8A%D8%A9-%D9%85%D8%AE%D8%B5%D8%B5%D8%A9-%D9%84%D9%84%D8%A3%D9%88%D9%84%D9%8A%D8%A9-%D9%88%D8%A7%D9%84%D8%B9%D9%84%D9%8A%D8%A7-2026-04-09-09', reason: 'expired', detail: 'Deadline 2026/4/30 is before 2026-06-12.' },
  { title: 'التعليم تعلن توفر منح دراسية من سلطنة بروناي دار السلام', source: 'Iraq Ministry of Higher Education', source_url: 'https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85-%D8%AA%D8%B9%D9%84%D9%86-%D8%AA%D9%88%D9%81%D8%B1-%D9%85%D9%86%D8%AD-%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A%D8%A9-%D9%85%D9%86-%D8%B3%D9%84%D8%B7%D9%86%D8%A9-%D8%A8%D8%B1%D9%88%D9%86%D8%A7%D9%8A-%D8%AF%D8%A7%D8%B1-%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85-2026-02-10-22', reason: 'expired', detail: 'Deadline 2026/2/15 is before 2026-06-12.' },
  { title: 'التعليم تعلن توفر منح دراسية هندية لغير الموظفين', source: 'Iraq Ministry of Higher Education', source_url: 'https://mohesr.gov.iq/ar/post/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%86-%D8%AA%D9%88%D9%81%D8%B1-%D9%85%D9%86%D8%AD-%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A%D8%A9-%D9%87%D9%86%D8%AF%D9%8A%D8%A9-%D9%84%D8%BA%D9%8A%D8%B1-%D8%A7%D9%84%D9%85%D9%88%D8%B8%D9%81%D9%8A%D9%86-2026-01-21-10', reason: 'expired', detail: 'Deadline 2026/5/15 is before 2026-06-12.' },
];

const genericTitles = new Set(['news', 'all events', 'university activities', 'home', 'archive', 'archives', 'calendar', 'contact', 'contact us', 'read more', 'click here', 'more news', 'university sport events', 'university art events']);

function decodeEntities(value = '') {
  return String(value)
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8211;/g, '-')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&hellip;/g, '...');
}

function cleanHtml(value = '') {
  return decodeEntities(value).replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function duplicateKey(parts) {
  return createHash('sha256').update(parts.filter(Boolean).join('|').toLowerCase()).digest('hex');
}

function classify(title, summary) {
  const s = `${title} ${summary}`.toLowerCase();
  if (/exam|examination|امتحان|امتحانات|تقويمي|نهائية/.test(s)) return 'exam';
  if (/registration|admission|apply|application|قبول|تقديم|استمارة|دراسات عليا/.test(s)) return 'registration';
  if (/announce|announcement|تنويه|تعلن|اعلان|إعلان/.test(s)) return 'announcement';
  if (/student|club|team|sport|handball|activity|workshop|training|طلبة|فريق|رياض|نشاط|ورشة|ندوة/.test(s)) return 'activity';
  return 'news';
}

async function fetchJson(url) {
  try {
    const res = await fetch(url, { headers: { 'user-agent': 'JamiaatiPhase4DryRun/1.0 (+manual-review; limited-source-run)', accept: 'application/json,text/html;q=0.8' } });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch {}
    return { ok: res.ok && Array.isArray(json), status: res.status, json, length: text.length, note: Array.isArray(json) ? 'json posts' : cleanHtml(text).slice(0, 80) };
  } catch (error) {
    return { ok: false, status: 0, json: null, length: 0, note: error.message };
  }
}

function runExistingRows() {
  const sql = "SELECT 'highlight_items' AS table_name, id, title, organization, category, status, source_url, apply_url, duplicate_key FROM highlight_items UNION ALL SELECT 'opportunity_candidates' AS table_name, id, title, organization, category, status, source_url, apply_url, duplicate_key FROM opportunity_candidates;";
  const out = execSync(`npx wrangler d1 execute rafid-db --config ./wrangler.toml --remote --json --command ${JSON.stringify(sql)}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const parsed = JSON.parse(out);
  return parsed?.[0]?.results || [];
}

function duplicateMatch(item, existing) {
  return existing.find((row) =>
    row.duplicate_key === item.duplicate_key ||
    row.source_url === item.source_url ||
    (item.apply_url && row.apply_url === item.apply_url) ||
    (row.title === item.title && row.organization === item.organization)
  );
}

const sourceReports = [];
const foundItems = [];
const rejected = [...expiredOpportunitySeeds];

for (const source of sources.filter((s) => s.feed)) {
  const result = await fetchJson(source.feed);
  sourceReports.push({ ...source, accessible: result.ok, http_status: result.status, scan_note: result.note, items_seen: Array.isArray(result.json) ? result.json.length : 0 });
  if (!result.ok) continue;
  for (const post of result.json.slice(0, maxPostsPerFeed)) {
    const title = cleanHtml(post.title?.rendered || post.title || '');
    const summary = cleanHtml(post.excerpt?.rendered || post.content?.rendered || '').slice(0, 500);
    const sourceUrl = post.link || post.guid?.rendered;
    const published = String(post.date || '').slice(0, 10);
    if (!title || genericTitles.has(title.toLowerCase())) {
      rejected.push({ title: title || '(empty)', source: source.name, source_url: sourceUrl || source.feed, reason: 'generic', detail: 'Generic or empty title.' });
      continue;
    }
    if (!sourceUrl) {
      rejected.push({ title, source: source.name, source_url: null, reason: 'no_url', detail: 'No stable source URL found.' });
      continue;
    }
    if (!published.startsWith('2026')) {
      rejected.push({ title, source: source.name, source_url: sourceUrl, reason: 'unclear_or_unrelated', detail: `Published date is not a 2026 date: ${published || 'unknown'}.` });
      continue;
    }
    const category = classify(title, summary);
    foundItems.push({
      id: `phase4-${source.id}-${post.id || createHash('sha1').update(sourceUrl).digest('hex').slice(0, 8)}`,
      target_table: 'highlight_items',
      title,
      category,
      organization: source.organization,
      governorate: source.governorate,
      city: source.city,
      source_url: sourceUrl,
      apply_url: null,
      deadline: null,
      event_date: null,
      published_date: published,
      summary: summary || `Official ${source.name} item published on ${published}.`,
      original_language: /[\u0600-\u06FF]/.test(title + summary) ? 'ar' : 'en',
      collected_at: collectedAt,
      confidence_score: category === 'news' ? 86 : 84,
      why_passed: `Official ${source.name} dated 2026 post with a specific non-generic title.`,
      active_status: category === 'event' ? 'event date not used; treated as campus update pending review' : 'recent 2026 official campus item',
      admin_verification_needed: category === 'event' ? 'yes' : 'no',
    });
  }
}

for (const source of sources.filter((s) => !s.feed)) {
  sourceReports.push({ ...source, accessible: true, http_status: 'not-scanned-as-feed', scan_note: 'Selected as controlled opportunity source; specific known pages evaluated.', items_seen: 0 });
}

for (const opp of ministryOpportunities) {
  const expired = opp.deadline && opp.deadline < currentDate;
  if (expired) {
    rejected.push({ title: opp.title, source: opp.organization, source_url: opp.source_url, reason: 'expired', detail: `Deadline ${opp.deadline} is before ${currentDate}.` });
    continue;
  }
  foundItems.push({
    ...opp,
    target_table: 'opportunity_candidates',
    governorate: opp.governorate || null,
    city: opp.city || null,
    country: 'Iraq',
    apply_url: opp.source_url,
    original_language: /[\u0600-\u06FF]/.test(opp.title + opp.summary) ? 'ar' : 'en',
    collected_at: collectedAt,
    why_passed: `Official/reputable source with ${opp.deadline ? `future deadline ${opp.deadline}` : 'reviewable application window'}.`,
    active_status: opp.deadline ? 'active/future deadline' : 'deadline unknown; pending only',
    admin_verification_needed: opp.note?.includes('verify') ? 'yes' : 'no',
  });
}

for (const item of foundItems) {
  item.duplicate_key = duplicateKey([item.target_table, item.category, item.title, item.organization, item.source_url, item.deadline || item.published_date || item.event_date]);
  item.status = 'pending_review';
}

let existing = [];
try {
  existing = runExistingRows();
} catch (error) {
  rejected.push({ title: 'duplicate check', source: 'remote D1', source_url: null, reason: 'unclear_or_unrelated', detail: `Duplicate check failed: ${error.message}` });
}

const proposed = [];
for (const item of foundItems) {
  const match = duplicateMatch(item, existing);
  if (match) {
    rejected.push({ title: item.title, source: item.organization, source_url: item.source_url, reason: 'duplicate', detail: 'Already exists in remote D1.', duplicate_target: `${match.table_name}:${match.id}:${match.status}` });
  } else if (proposed.length < maxProposed) {
    proposed.push({ ...item, duplicate_status: 'unique' });
  }
}

const countsByCategory = {};
for (const item of proposed) countsByCategory[item.category] = (countsByCategory[item.category] || 0) + 1;
const counts = {
  selected_sources: sources.length,
  pages_scanned: sourceReports.filter((s) => s.feed).length + ministryOpportunities.length + expiredOpportunitySeeds.length,
  items_found: foundItems.length + rejected.length,
  rejected_expired: rejected.filter((r) => r.reason === 'expired').length,
  rejected_duplicate: rejected.filter((r) => r.reason === 'duplicate').length,
  rejected_generic: rejected.filter((r) => r.reason === 'generic').length,
  rejected_no_url: rejected.filter((r) => r.reason === 'no_url').length,
  rejected_unclear_or_unrelated: rejected.filter((r) => r.reason === 'unclear_or_unrelated').length,
  proposed_pending_review_inserts: proposed.length,
  proposed_by_category: countsByCategory,
};

const report = { mode: 'dry-run-only', current_date: currentDate, collected_at: collectedAt, selected_sources: sourceReports, counts, proposed_pending_review_inserts: proposed, rejected_items: rejected, safety: { d1_writes: false, approvals: false, frontend_deploy: false, broad_scraper: false, schema_change: false } };
writeFileSync('work/phase4-expanded-dry-run-report.json', JSON.stringify(report, null, 2), 'utf8');

const mdSourceRows = sourceReports.map((s) => `| ${s.name} | ${s.url} | ${s.category} | ${s.trustedBecause} | ${s.expectedDataType} | ${s.feed ? 'WP/API dated posts where accessible' : 'specific official opportunity pages'} | ${s.status} | ${s.accessible ? 'yes' : 'no'} (${s.http_status}) | ${s.items_seen} |`).join('\n');
const mdCategoryRows = Object.entries(countsByCategory).sort().map(([cat, count]) => `| ${cat} | ${count} |`).join('\n');
const mdProposedRows = proposed.slice(0, 60).map((i) => `| ${i.title} | ${i.category} | ${i.target_table} | ${i.organization} | ${i.governorate || 'null'} / ${i.city || 'null'} | ${i.deadline || i.event_date || i.published_date || 'null'} | ${i.source_url} | ${i.apply_url || 'null'} | ${i.confidence_score} | ${i.why_passed} | ${i.duplicate_status} | ${i.active_status} | ${i.admin_verification_needed} |`).join('\n');
const mdRejectedRows = rejected.map((r) => `| ${r.title} | ${r.source} | ${r.source_url || 'null'} | ${r.reason} | ${r.detail} | ${r.duplicate_target || 'null'} |`).join('\n');

const markdown = `# Phase 4 Expanded Dry-Run Report

Mode: DRY-RUN ONLY. No D1 writes. No approvals. No frontend deploy. No broad scraper.

Current date used for expiry checks: ${currentDate}
Collected at: ${collectedAt}

## Selected Sources

| Source name | Source URL | Category | Why trusted | Expected data type | Visible dates/deadlines | Official/reputable status | Accessible | Items seen |
|---|---|---|---|---|---|---|---|---:|
${mdSourceRows}

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

## Proposed Item Count by Category

| category/type | count |
|---|---:|
${mdCategoryRows || '| none | 0 |'}

## Proposed pending_review Items (max 60)

| title | category/type | target table | organization/university | governorate/city | deadline/event_date/published_date | source_url | apply_url | confidence_score | why it passed | duplicate status | active/expired status | admin verification needed |
|---|---|---|---|---|---|---|---|---:|---|---|---|---|
${mdProposedRows || '| none | | | | | | | | | | | | |'}

## Rejected Items

| title | source | source_url | reason rejected | detail | duplicate target |
|---|---|---|---|---|---|
${mdRejectedRows || '| none | | | | | |'}

## Safety Notes

- No D1 insert/update/delete was performed.
- No item was approved or published.
- No frontend deployment was performed.
- No scraper broad run was performed; this was a controlled ${sources.length}-source dry run.
- No schema change was performed.
- Newly collected items, if later approved for insertion, must be inserted with status = pending_review only.
`;

writeFileSync('work/phase4-expanded-dry-run-report.md', markdown, 'utf8');
console.log(JSON.stringify(counts, null, 2));

import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';

const now = new Date().toISOString();

const sources = [
  {
    name: 'University of Baghdad',
    url: 'https://uobaghdad.edu.iq/?lang=en',
    category: 'highlight/news/announcement',
    trustedBecause: 'Official University of Baghdad website.',
    official: true,
    expectedDataType: 'University news and announcements',
  },
  {
    name: 'DAAD Iraq Scholarship Database',
    url: 'https://www.daad-iraq.org/en/find-funding/scholarship-database/',
    category: 'scholarship',
    trustedBecause: 'Official DAAD Iraq funding database for Iraq-origin applicants.',
    official: true,
    expectedDataType: 'Scholarship options',
  },
  {
    name: 'UNjobs Vacancies in Iraq',
    url: 'https://unjobs.org/duty_stations/iraq',
    category: 'job/internship',
    trustedBecause: 'Reputable UN/international-organization jobs aggregator with Iraq duty-station listings.',
    official: false,
    expectedDataType: 'Iraq job and consultant vacancy listings',
  },
];

const genericTitles = new Set([
  'all events',
  'university activities',
  'news',
  'home',
  'archive',
  'archives',
  'calendar',
  'contact',
  'contact us',
  'read more',
  'click here',
  'more news',
  'university sport events',
  'university art events',
]);

function cleanHtml(value = '') {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#x2F;/g, '/')
    .replace(/&#x3A;/g, ':')
    .replace(/&#x20;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function absoluteUrl(base, href) {
  return new URL(href.replace(/&amp;/g, '&'), base).toString();
}

function duplicateKey(parts) {
  return createHash('sha256')
    .update(parts.filter(Boolean).join('|').toLowerCase().replace(/\s+/g, ' ').trim())
    .digest('hex');
}

function inferLocation(text) {
  const lower = text.toLowerCase();
  if (lower.includes('baghdad')) return { governorate: 'Baghdad', city: 'Baghdad' };
  if (lower.includes('erbil')) return { governorate: 'Erbil', city: 'Erbil' };
  if (lower.includes('basra') || lower.includes('basrah')) return { governorate: 'Basra', city: 'Basra' };
  if (lower.includes('dohuk') || lower.includes('duhok')) return { governorate: 'Duhok', city: 'Duhok' };
  if (lower.includes('ninawa') || lower.includes('nineveh') || lower.includes('mosul')) return { governorate: 'Nineveh', city: null };
  if (lower.includes('sinjar')) return { governorate: 'Nineveh', city: 'Sinjar' };
  return { governorate: null, city: null };
}

function rejectReason(item) {
  if (!item.title) return 'no title';
  if (genericTitles.has(item.title.toLowerCase().trim())) return 'generic';
  if (!item.source_url) return 'no URL';
  if (item.deadline) {
    const deadline = new Date(item.deadline);
    if (!Number.isNaN(deadline.valueOf()) && deadline < new Date()) return 'expired';
  }
  if (item.event_date) {
    const eventDate = new Date(item.event_date);
    if (!Number.isNaN(eventDate.valueOf()) && eventDate < new Date()) return 'expired';
  }
  return null;
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'user-agent': 'JamiaatiPhase1DryRun/1.0' },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.text();
}

async function collectUobaghdad() {
  const source = sources[0];
  const homepage = await fetchText(source.url);
  const postUrls = [...homepage.matchAll(/href="(https:\/\/uobaghdad\.edu\.iq\/\?p=\d+)"/g)]
    .map((m) => m[1])
    .filter((url, idx, arr) => arr.indexOf(url) === idx)
    .slice(0, 3);

  const items = [];
  for (const url of postUrls) {
    const html = await fetchText(url);
    const h1 = cleanHtml((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '');
    const title = h1 || cleanHtml((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '');
    const metaDesc = cleanHtml((html.match(/<meta name="description" content="([^"]+)"/i) || [])[1] || '');
    const category = /إعلان|اعلان|announcement/i.test(title) ? 'announcement' : 'news';
    const loc = { governorate: 'Baghdad', city: 'Baghdad' };
    const key = duplicateKey([title, url, 'University of Baghdad']);
    items.push({
      table: 'highlight_items',
      title,
      category,
      organization: 'University of Baghdad',
      university: 'University of Baghdad',
      ...loc,
      source_url: url,
      apply_url: null,
      deadline: null,
      event_date: null,
      summary: metaDesc || title,
      original_language: /[\u0600-\u06FF]/.test(title) ? 'ar' : 'en',
      collected_at: now,
      confidence_score: 88,
      duplicate_key: key,
      status: 'pending_review',
      why_passed: 'Official University of Baghdad post with specific title and stable source URL.',
    });
  }
  return { source, pagesScanned: [source.url, ...postUrls], items };
}

function parseDaadDate(raw) {
  const match = raw.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (!match) return null;
  return `${match[3]}-${match[2]}-${match[1]}`;
}

async function collectDaad() {
  const source = sources[1];
  const html = await fetchText(source.url);
  const blocks = [...html.matchAll(/<li class="c-scholarship-list__item">([\s\S]*?)<\/li>\s*<li class="c-scholarship-list__item">/g)]
    .map((m) => m[1])
    .slice(0, 3);
  const items = [];
  for (const block of blocks) {
    const linkMatch = block.match(/<a class="text-anthracite[^"]*" href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!linkMatch) continue;
    const sourceUrl = absoluteUrl(source.url, linkMatch[1]);
    const title = cleanHtml(linkMatch[2]);
    const summary = cleanHtml((block.match(/<p class="u-mb-small u-size-teaser is-ltr">([\s\S]*?)<\/p>/i) || [])[1] || '');
    const deadlineRaw = cleanHtml((block.match(/Application deadline:[\s\S]*?<dd>([\s\S]*?)<\/dd>/i) || [])[1] || '');
    const deadline = parseDaadDate(deadlineRaw);
    const key = duplicateKey([title, sourceUrl, 'DAAD Iraq', deadline]);
    items.push({
      table: 'opportunity_candidates',
      title,
      category: 'scholarship',
      type: 'scholarship',
      organization: 'DAAD Iraq',
      university: null,
      governorate: null,
      city: null,
      source_url: sourceUrl,
      apply_url: sourceUrl,
      deadline,
      deadline_unknown: !deadline,
      event_date: null,
      summary,
      original_language: 'en',
      collected_at: now,
      confidence_score: deadline ? 92 : 78,
      duplicate_key: key,
      status: 'pending_review',
      why_passed: 'Official DAAD Iraq scholarship listing for Iraq-origin applicants with item detail URL.',
    });
  }
  return { source, pagesScanned: [source.url], items };
}

async function collectUnjobs() {
  const source = sources[2];
  const html = await fetchText(source.url);
  const blocks = [...html.matchAll(/<div[^>]*class="job"[^>]*>([\s\S]*?)<\/div>/g)]
    .map((m) => m[1])
    .filter((block) => /class="jtitle"/.test(block))
    .slice(0, 5);
  const items = [];
  for (const block of blocks) {
    const linkMatch = block.match(/<a[^>]*class="jtitle"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!linkMatch) continue;
    const sourceUrl = absoluteUrl(source.url, linkMatch[1]);
    const title = cleanHtml(linkMatch[2]);
    const after = block.split('</a>')[1] || '';
    const organization = cleanHtml(after.split('<br>')[1] || '').replace(/^Updated:.*/, '').trim();
    const loc = inferLocation(title);
    const isInternship = /\binternship\b|\bintern\b/i.test(title);
    const key = duplicateKey([title, sourceUrl, organization]);
    items.push({
      table: 'opportunity_candidates',
      title,
      category: isInternship ? 'internship' : 'job',
      type: isInternship ? 'internship' : 'job',
      organization,
      university: null,
      ...loc,
      source_url: sourceUrl,
      apply_url: sourceUrl,
      deadline: null,
      deadline_unknown: true,
      event_date: null,
      summary: `Vacancy listed for Iraq by ${organization}. Admin should verify application deadline and details before approval.`,
      original_language: 'en',
      collected_at: now,
      confidence_score: loc.governorate ? 82 : 74,
      duplicate_key: key,
      status: 'pending_review',
      why_passed: 'Specific Iraq vacancy from UNjobs with real item URL; deadline requires admin verification.',
    });
  }
  return { source, pagesScanned: [source.url], items };
}

const collectors = [collectUobaghdad, collectDaad, collectUnjobs];
const results = [];
for (const collect of collectors) {
  results.push(await collect());
}

const flat = results.flatMap((result) => result.items);
const accepted = [];
const rejected = [];
for (const item of flat) {
  const reason = rejectReason(item);
  if (reason) rejected.push({ reason, item });
  else accepted.push(item);
}

const report = {
  mode: 'dry-run',
  collected_at: now,
  sources,
  pages_scanned: results.flatMap((result) => result.pagesScanned),
  counts: {
    sources_scanned: sources.length,
    items_found: flat.length,
    rejected_expired: rejected.filter((r) => r.reason === 'expired').length,
    rejected_duplicate: 0,
    rejected_generic: rejected.filter((r) => r.reason === 'generic').length,
    rejected_no_url: rejected.filter((r) => r.reason === 'no URL').length,
    rejected_unclear_unrelated: rejected.filter((r) => ['no title'].includes(r.reason)).length,
    pending_review_would_insert_before_duplicate_check: accepted.length,
  },
  sample_items: accepted.slice(0, 10),
  rejected,
};

writeFileSync('work/phase1-dry-run-report.json', JSON.stringify(report, null, 2), 'utf8');
console.log(JSON.stringify(report, null, 2));

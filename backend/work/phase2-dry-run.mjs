import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const now = new Date().toISOString();
const maxItemsPerCampusSource = 4;
const maxItemsPerOpportunitySource = 4;

const sources = [
  {
    id: 'uobaghdad',
    name: 'University of Baghdad',
    url: 'https://uobaghdad.edu.iq/?lang=en',
    category: 'Campus Life',
    expectedDataType: 'news, announcements, registration, exams, activities',
    trustedBecause: 'Official University of Baghdad website.',
    officialStatus: 'official',
    table: 'highlight_items',
    organization: 'University of Baghdad',
    governorate: 'Baghdad',
    city: 'Baghdad',
  },
  {
    id: 'univsul',
    name: 'University of Sulaymaniyah',
    url: 'https://univsul.edu.iq/en/',
    category: 'Campus Life',
    expectedDataType: 'news, announcements, events, activities',
    trustedBecause: 'Official University of Sulaymaniyah website.',
    officialStatus: 'official',
    table: 'highlight_items',
    organization: 'University of Sulaymaniyah',
    governorate: 'Sulaymaniyah',
    city: 'Sulaymaniyah',
  },
  {
    id: 'epu',
    name: 'Erbil Polytechnic University',
    url: 'https://epu.edu.iq/',
    category: 'Campus Life',
    expectedDataType: 'news, announcements, events, activities',
    trustedBecause: 'Official Erbil Polytechnic University website.',
    officialStatus: 'official',
    table: 'highlight_items',
    organization: 'Erbil Polytechnic University',
    governorate: 'Erbil',
    city: 'Erbil',
  },
  {
    id: 'uobasrah',
    name: 'University of Basrah',
    url: 'https://uobasrah.edu.iq/',
    category: 'Campus Life',
    expectedDataType: 'news, announcements, events, activities',
    trustedBecause: 'Official University of Basrah website.',
    officialStatus: 'official',
    table: 'highlight_items',
    organization: 'University of Basrah',
    governorate: 'Basra',
    city: 'Basra',
  },
  {
    id: 'uomosul',
    name: 'University of Mosul',
    url: 'https://uomosul.edu.iq/',
    category: 'Campus Life',
    expectedDataType: 'news, announcements, exams, registration, activities',
    trustedBecause: 'Official University of Mosul website.',
    officialStatus: 'official',
    table: 'highlight_items',
    organization: 'University of Mosul',
    governorate: 'Nineveh',
    city: 'Mosul',
  },
  {
    id: 'uotechnology',
    name: 'University of Technology Iraq',
    url: 'https://uotechnology.edu.iq/',
    category: 'Campus Life',
    expectedDataType: 'news, announcements, events, activities',
    trustedBecause: 'Official University of Technology Iraq website.',
    officialStatus: 'official',
    table: 'highlight_items',
    organization: 'University of Technology Iraq',
    governorate: 'Baghdad',
    city: 'Baghdad',
  },
  {
    id: 'daad',
    name: 'DAAD Iraq',
    url: 'https://www.daad-iraq.org/en/find-funding/scholarship-database/',
    category: 'Scholarship / Opportunity',
    expectedDataType: 'scholarship',
    trustedBecause: 'Official DAAD Iraq scholarship database.',
    officialStatus: 'official',
    table: 'opportunity_candidates',
    organization: 'DAAD Iraq',
    governorate: null,
    city: null,
  },
  {
    id: 'turkiye',
    name: 'Türkiye Scholarships',
    url: 'https://www.turkiyeburslari.gov.tr/',
    category: 'Scholarship / Opportunity',
    expectedDataType: 'scholarship',
    trustedBecause: 'Official Türkiye Scholarships portal.',
    officialStatus: 'official',
    table: 'opportunity_candidates',
    organization: 'Türkiye Scholarships',
    governorate: null,
    city: null,
  },
  {
    id: 'erasmus',
    name: 'Erasmus Mundus Catalogue',
    url: 'https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en',
    category: 'Scholarship / Opportunity',
    expectedDataType: 'scholarship/fellowship catalogue entries',
    trustedBecause: 'Official European Commission/EACEA Erasmus Mundus catalogue.',
    officialStatus: 'official',
    table: 'opportunity_candidates',
    organization: 'Erasmus Mundus / EACEA',
    governorate: null,
    city: null,
  },
  {
    id: 'unjobs',
    name: 'UNjobs Iraq',
    url: 'https://unjobs.org/duty_stations/iraq',
    category: 'Jobs / Internships',
    expectedDataType: 'Iraq job and consultant vacancy listings',
    trustedBecause: 'Reputable UN and international-organization job listing aggregator with Iraq duty-station pages.',
    officialStatus: 'reputable aggregator',
    table: 'opportunity_candidates',
    organization: null,
    governorate: null,
    city: null,
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
  'history',
  'about',
  'about us',
  'history of epu - erbil polytechnic university',
  'skip to main content',
  'media & promotion',
  'why türkiye scholarships?',
  'why t&#xfc;rkiye scholarships?',
  'türkiye scholarships',
  't&#xfc;rkiye scholarships',
  'türkçe',
  't&#xfc;rk&#xe7;e',
  'university board - erbil polytechnic university',
  'university president speech - erbil polytechnic university',
  'الرؤية والرسالة والاهداف',
  'كلمة رئيس الجامعة | جامعة البصرة',
  'الهيكل التنظيمي للجامعة | جامعة البصرة',
  'مجلس جامعة البصرة | جامعة البصرة',
  'الانظمة الالكترونية',
  'كلمة السيد رئيس الجامعة',
  'رئيس الجامعة ومساعديه',
  'criteria & scholarship programs',
  'application in 5 steps',
  'evaluation and selection process',
  "fresher's guide",
  'discover more',
  'scams and frauds',
  'vision statement - erbil polytechnic university',
  'mission statement - erbil polytechnic university',
  'facts and figures - erbil polytechnic university',
  'strategic plan - erbil polytechnic university',
  'scholarship procedures',
  'education in türkiye',
  'education in t&#xfc;rkiye',
  'learning turkish',
  'art & culture',
  'intra-africa scholarships',
  'نبذة عن الجامعة',
  'الأجهزة العلمية | جامعة البصرة',
  '| جامعة البصرة',
  'useful links',
  'student stories',
  'thesis scanning',
  'application/login',
  'news & announcements',
  'frequently asked questions',
  'الأخبار',
]);

function decodeEntities(value = '') {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8211;/g, '-')
    .replace(/&#8217;/g, "'")
    .replace(/&#8230;/g, '...')
    .replace(/&#x2F;/g, '/')
    .replace(/&#x3A;/g, ':')
    .replace(/&#x20;/g, ' ');
}

function cleanHtml(value = '') {
  return decodeEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function absoluteUrl(base, href) {
  try {
    return new URL(decodeEntities(href), base).toString();
  } catch {
    return null;
  }
}

function duplicateKey(parts) {
  return createHash('sha256')
    .update(parts.filter(Boolean).join('|').toLowerCase().replace(/\s+/g, ' ').trim())
    .digest('hex');
}

function sql(value) {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'JamiaatiPhase2DryRun/1.0 (+manual-review; limited-10-source-run)',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

function inferHighlightCategory(title) {
  const lower = title.toLowerCase();
  if (/exam|result|نتائج|امتحان|تاقیکردنەوە/.test(lower)) return 'exam';
  if (/registration|admission|قبول|تسجيل|ناونووسین/.test(lower)) return 'registration';
  if (/announcement|اعلان|إعلان|notice|ڕاگەیاندن/.test(lower)) return 'announcement';
  if (/event|conference|workshop|seminar|activity|festival|symposium|فعالية|نشاط|ورشة|ندوة|چالاکی/.test(lower)) return 'event';
  if (/club|student club|society|نادي|يانە|یانه/.test(lower)) return 'student_club';
  return 'news';
}

function inferLocation(text, fallback) {
  const lower = text.toLowerCase();
  if (lower.includes('baghdad')) return { governorate: 'Baghdad', city: 'Baghdad' };
  if (lower.includes('sulaymaniyah') || lower.includes('sulaimani')) return { governorate: 'Sulaymaniyah', city: 'Sulaymaniyah' };
  if (lower.includes('erbil')) return { governorate: 'Erbil', city: 'Erbil' };
  if (lower.includes('basra') || lower.includes('basrah')) return { governorate: 'Basra', city: 'Basra' };
  if (lower.includes('mosul')) return { governorate: 'Nineveh', city: 'Mosul' };
  if (lower.includes('nineveh') || lower.includes('ninawa')) return { governorate: 'Nineveh', city: null };
  if (lower.includes('dohuk') || lower.includes('duhok')) return { governorate: 'Duhok', city: 'Duhok' };
  return { governorate: fallback.governorate, city: fallback.city };
}

function isGenericTitle(title) {
  const normalized = title.toLowerCase().replace(/\s+/g, ' ').trim();
  return genericTitles.has(normalized)
    || /^history of\b/i.test(normalized)
    || /\b(president|chancellor|vice president|board|council|scientific affairs|administration and financial affairs)\b/i.test(normalized)
    || /\b(directorate|managerial staff|storage and statistics|media release|information technology|alumni|scientists|videos|deans)\b/i.test(normalized)
    || /\b(vision statement|mission statement|facts and figures|strategic plan|scientific instruments|centers)\b/i.test(normalized)
    || /\b(college|offices|strategy|useful links|student stories|thesis scanning|application\/login)\b/i.test(normalized)
    || /\b(news & announcements|frequently asked questions|faq)\b/i.test(normalized)
    || /\b(criteria|application in 5 steps|evaluation and selection|fresher|discover more|scams and frauds)\b/i.test(normalized)
    || /\b(scholarship procedures|education in|learning turkish|art & culture|intra-africa)\b/i.test(normalized)
    || /^(bg|nl|pt|de|fr|es|it|pl|ro|el|cs|da|et|fi|hr|hu|lt|lv|mt|sk|sl|sv)\s/i.test(normalized)
    || /^(كلمة|رئيس الجامعة|مجلس|الهيكل|الرؤية|الانظمة|ابرز خريجين|علماء|استكشف|برنامج عمل|جامعة الموصل - اهلا|نبذة|الأجهزة العلمية|الأخبار|\| جامعة البصرة)/i.test(normalized)
    || /^about\b/i.test(normalized)
    || /\b(contact|archive|calendar)\b/i.test(normalized);
}

function titleFromPage(html) {
  const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1];
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return cleanHtml(og || h1 || title || '');
}

function summaryFromPage(html, fallbackTitle) {
  const meta = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]
    || html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1];
  const cleaned = cleanHtml(meta || '');
  return cleaned && cleaned.length > 20 ? cleaned.slice(0, 500) : fallbackTitle;
}

function extractLinks(html, baseUrl, hostAllowRegex) {
  const seen = new Set();
  const links = [];
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const url = absoluteUrl(baseUrl, match[1]);
    if (!url || seen.has(url)) continue;
    if (hostAllowRegex && !hostAllowRegex.test(url)) continue;
    const title = cleanHtml(match[2]);
    seen.add(url);
    links.push({ url, title });
  }
  return links;
}

function looksLikeArticleLink(link, source) {
  const title = link.title || '';
  if (!title || title.length < 12 || title.length > 220) return false;
  if (isGenericTitle(title)) return false;
  const url = link.url.toLowerCase();
  if (/\/(about|history|president|speech|administration|colleges?|departments?|directorates?|contact|calendar)(\/|$)/i.test(url)) return false;
  if (source.id === 'uobaghdad') return /uobaghdad\.edu\.iq\/\?p=\d+/.test(url);
  if (source.id === 'univsul') return /univsul\.edu\.iq\/en\/.+/.test(url) && /(news|event|announcement|activity|workshop|conference)/i.test(url);
  if (source.id === 'epu') return /epu\.edu\.iq\/.+/.test(url) && /(news|event|announcement|activity|workshop|conference)/i.test(url);
  if (source.id === 'uobasrah') return /uobasrah\.edu\.iq\/.+/.test(url) && /(news|event|announcement|activity|workshop|conference)/i.test(url);
  if (source.id === 'uomosul') return /uomosul\.edu\.iq\/.+/.test(url) && /(news|event|announcement|activity|workshop|conference|%d8%a7%d8%ae%d8%a8%d8%a7%d8%b1)/i.test(url);
  if (source.id === 'uotechnology') return /uotechnology\.edu\.iq\/.+/.test(url) && /(news|event|announcement|activity|workshop|conference)/i.test(url);
  return false;
}

async function collectCampus(source) {
  const pagesScanned = [source.url];
  const rejected = [];
  const items = [];
  let homepage = '';
  try {
    homepage = await fetchText(source.url);
  } catch (err) {
    rejected.push({ source: source.name, reason: 'source inaccessible', title: source.name, source_url: source.url, detail: err.message });
    return { source, pagesScanned, items, rejected };
  }

  const host = new URL(source.url).hostname.replace(/^www\./, '').replace(/\./g, '\\.');
  const links = extractLinks(homepage, source.url, new RegExp(host, 'i'))
    .filter((link) => looksLikeArticleLink(link, source))
    .slice(0, maxItemsPerCampusSource + 4);

  for (const link of links) {
    if (items.length >= maxItemsPerCampusSource) break;
    let html = '';
    try {
      html = await fetchText(link.url);
      pagesScanned.push(link.url);
    } catch (err) {
      rejected.push({ source: source.name, reason: 'page inaccessible', title: link.title, source_url: link.url, detail: err.message });
      continue;
    }

    const title = titleFromPage(html) || link.title;
    const category = inferHighlightCategory(title);
    const location = inferLocation(`${title} ${source.organization}`, source);
    const item = {
      title,
      category,
      type: category,
      target_table: 'highlight_items',
      organization: source.organization,
      university: source.organization,
      governorate: location.governorate,
      city: location.city,
      source_url: link.url,
      apply_url: null,
      deadline: null,
      event_date: null,
      summary: summaryFromPage(html, title),
      original_language: /[\u0600-\u06FF]/.test(title) ? 'ar' : 'en',
      collected_at: now,
      confidence_score: 84,
      duplicate_key: duplicateKey([title, link.url, source.organization]),
      status: 'pending_review',
      why_passed: `Official ${source.name} page with a specific non-generic title and stable source URL.`,
      active_status: 'active/not deadline-based',
    };
    items.push(item);
  }

  return { source, pagesScanned, items, rejected };
}

function parseDaadDate(raw) {
  const match = raw.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (!match) return null;
  return `${match[3]}-${match[2]}-${match[1]}`;
}

async function collectDaad(source) {
  const pagesScanned = [source.url];
  const rejected = [];
  const items = [];
  let html = '';
  try {
    html = await fetchText(source.url);
  } catch (err) {
    rejected.push({ source: source.name, reason: 'source inaccessible', title: source.name, source_url: source.url, detail: err.message });
    return { source, pagesScanned, items, rejected };
  }
  const blocks = [...html.matchAll(/<li class="c-scholarship-list__item">([\s\S]*?)(?=<li class="c-scholarship-list__item">|<\/ul>)/g)]
    .map((m) => m[1])
    .slice(0, maxItemsPerOpportunitySource);
  for (const block of blocks) {
    const linkMatch = block.match(/<a class="text-anthracite[^"]*" href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!linkMatch) continue;
    const sourceUrl = absoluteUrl(source.url, linkMatch[1]);
    const title = cleanHtml(linkMatch[2]);
    const summary = cleanHtml((block.match(/<p class="u-mb-small u-size-teaser is-ltr">([\s\S]*?)<\/p>/i) || [])[1] || title);
    const deadlineRaw = cleanHtml((block.match(/Application deadline:[\s\S]*?<dd>([\s\S]*?)<\/dd>/i) || [])[1] || '');
    const deadline = parseDaadDate(deadlineRaw);
    items.push({
      title,
      category: 'scholarship',
      type: 'scholarship',
      target_table: 'opportunity_candidates',
      organization: source.organization,
      university: null,
      governorate: null,
      city: null,
      source_url: sourceUrl,
      apply_url: sourceUrl,
      deadline,
      event_date: null,
      summary,
      original_language: 'en',
      collected_at: now,
      confidence_score: deadline ? 92 : 78,
      duplicate_key: duplicateKey([title, sourceUrl, source.organization, deadline]),
      status: 'pending_review',
      why_passed: 'Official DAAD Iraq scholarship listing with detail URL.',
      active_status: deadline ? 'active if deadline is future' : 'deadline unknown; admin must verify before approval',
    });
  }
  return { source, pagesScanned, items, rejected };
}

async function collectSimpleOpportunitySource(source, category) {
  const pagesScanned = [source.url];
  const rejected = [];
  const items = [];
  let html = '';
  try {
    html = await fetchText(source.url);
  } catch (err) {
    rejected.push({ source: source.name, reason: 'source inaccessible', title: source.name, source_url: source.url, detail: err.message });
    return { source, pagesScanned, items, rejected };
  }
  const host = new URL(source.url).hostname.replace(/^www\./, '').replace(/\./g, '\\.');
  const links = extractLinks(html, source.url, new RegExp(host, 'i'))
    .filter((link) => link.title && link.title.length >= 12 && !isGenericTitle(link.title))
    .filter((link) => !/(\/about|\/media|\/news|\/faq|change-culture|#main-content|catalogue_[a-z]{2}$|useful-links|student-story|thesissearch|tbbs\.turkiyeburslari)/i.test(link.url))
    .filter((link) => /(scholar|application|programme|program|catalogue|master|apply|başvuru|burs)/i.test(`${link.title} ${link.url}`))
    .slice(0, maxItemsPerOpportunitySource);

  for (const link of links) {
    items.push({
      title: link.title,
      category,
      type: category,
      target_table: 'opportunity_candidates',
      organization: source.organization,
      university: null,
      governorate: null,
      city: null,
      source_url: link.url,
      apply_url: link.url,
      deadline: null,
      event_date: null,
      summary: `${link.title}. Admin must verify deadline, eligibility, and application details before approval.`,
      original_language: /[\u0600-\u06FF]/.test(link.title) ? 'ar' : 'en',
      collected_at: now,
      confidence_score: 72,
      duplicate_key: duplicateKey([link.title, link.url, source.organization]),
      status: 'pending_review',
      why_passed: `${source.name} official/reputable source link with specific scholarship/programme wording; deadline requires admin verification.`,
      active_status: 'deadline unknown; admin must verify before approval',
    });
  }
  return { source, pagesScanned, items, rejected };
}

async function collectUnjobs(source) {
  const pagesScanned = [source.url];
  const rejected = [];
  const items = [];
  let html = '';
  try {
    html = await fetchText(source.url);
  } catch (err) {
    rejected.push({ source: source.name, reason: 'source inaccessible', title: source.name, source_url: source.url, detail: err.message });
    return { source, pagesScanned, items, rejected };
  }
  const blocks = [...html.matchAll(/<div[^>]*class="job"[^>]*>([\s\S]*?)<\/div>/g)]
    .map((m) => m[1])
    .filter((block) => /class="jtitle"/.test(block))
    .slice(0, maxItemsPerOpportunitySource);
  for (const block of blocks) {
    const linkMatch = block.match(/<a[^>]*class="jtitle"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!linkMatch) continue;
    const sourceUrl = absoluteUrl(source.url, linkMatch[1]);
    const title = cleanHtml(linkMatch[2]);
    const after = block.split('</a>')[1] || '';
    const organization = cleanHtml(after.split('<br>')[1] || '').replace(/^Updated:.*/, '').trim() || 'UN / International Organization';
    const isInternship = /\binternship\b|\bintern\b/i.test(title);
    const location = inferLocation(title, source);
    items.push({
      title,
      category: isInternship ? 'internship' : 'job',
      type: isInternship ? 'internship' : 'job',
      target_table: 'opportunity_candidates',
      organization,
      university: null,
      governorate: location.governorate,
      city: location.city,
      source_url: sourceUrl,
      apply_url: sourceUrl,
      deadline: null,
      event_date: null,
      summary: `Vacancy listed for Iraq by ${organization}. Admin must verify deadline before approval.`,
      original_language: 'en',
      collected_at: now,
      confidence_score: location.governorate ? 82 : 74,
      duplicate_key: duplicateKey([title, sourceUrl, organization]),
      status: 'pending_review',
      why_passed: 'Specific Iraq vacancy from UNjobs with real item URL; deadline requires admin verification.',
      active_status: 'deadline unknown; admin must verify before approval',
    });
  }
  return { source, pagesScanned, items, rejected };
}

function rejectReason(item) {
  if (!item.title) return 'unclear/unrelated';
  if (isGenericTitle(item.title)) return 'generic';
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

function runD1Query(command) {
  const compactCommand = command.replace(/\s+/g, ' ').trim();
  const output = execSync(
    `npx wrangler d1 execute rafid-db --config ./wrangler.toml --remote --command ${JSON.stringify(compactCommand)}`,
    { cwd: process.cwd(), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );
  const start = output.search(/\[\s*\{/);
  if (start === -1) return [];
  const parsed = JSON.parse(output.slice(start));
  return parsed[0]?.results || [];
}

function mdTable(rows, columns) {
  const escape = (value) => String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
  return [
    `| ${columns.map((c) => c.label).join(' | ')} |`,
    `| ${columns.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${columns.map((c) => escape(row[c.key])).join(' | ')} |`),
  ].join('\n');
}

const collectors = [];
for (const source of sources) {
  if (source.table === 'highlight_items') collectors.push(() => collectCampus(source));
  else if (source.id === 'daad') collectors.push(() => collectDaad(source));
  else if (source.id === 'turkiye') collectors.push(() => collectSimpleOpportunitySource(source, 'scholarship'));
  else if (source.id === 'erasmus') collectors.push(() => collectSimpleOpportunitySource(source, 'scholarship'));
  else if (source.id === 'unjobs') collectors.push(() => collectUnjobs(source));
}

const results = [];
for (const collect of collectors) {
  results.push(await collect());
}

const found = results.flatMap((result) => result.items.map((item) => ({ ...item, source_name: result.source.name })));
const rejected = results.flatMap((result) => result.rejected || []);
const acceptedBeforeDupes = [];
for (const item of found) {
  const reason = rejectReason(item);
  if (reason) rejected.push({ source: item.source_name, reason, title: item.title, source_url: item.source_url });
  else acceptedBeforeDupes.push(item);
}

const accepted = [];
const existingRows = runD1Query(`
  SELECT 'highlight_items' AS table_name, id, title, organization, category, status, source_url, apply_url, duplicate_key
  FROM highlight_items
  UNION ALL
  SELECT 'opportunity_candidates' AS table_name, id, title, organization, category, status, source_url, apply_url, duplicate_key
  FROM opportunity_candidates;
`);
const normalizeComparable = (value) => String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
for (const item of acceptedBeforeDupes) {
  const duplicateRows = existingRows.filter((row) => (
    (item.duplicate_key && row.duplicate_key === item.duplicate_key)
    || (item.source_url && row.source_url === item.source_url)
    || (item.apply_url && row.apply_url === item.apply_url)
    || (
      normalizeComparable(row.title) === normalizeComparable(item.title)
      && normalizeComparable(row.organization) === normalizeComparable(item.organization)
    )
  ));
  if (duplicateRows.length > 0) {
    rejected.push({
      source: item.source_name,
      reason: 'duplicate',
      title: item.title,
      source_url: item.source_url,
      duplicate_matches: duplicateRows.map((row) => `${row.table_name}:${row.id}:${row.status}`).join('; '),
    });
  } else {
    accepted.push({ ...item, duplicate_status: 'unique' });
  }
}

const counts = {
  sources_scanned: sources.length,
  pages_scanned: results.reduce((count, result) => count + result.pagesScanned.length, 0),
  items_found: found.length,
  rejected_expired: rejected.filter((row) => row.reason === 'expired').length,
  rejected_duplicate: rejected.filter((row) => row.reason === 'duplicate').length,
  rejected_generic: rejected.filter((row) => row.reason === 'generic').length,
  rejected_no_url: rejected.filter((row) => row.reason === 'no URL').length,
  rejected_unclear_unrelated: rejected.filter((row) => ['unclear/unrelated', 'source inaccessible', 'page inaccessible'].includes(row.reason)).length,
  pending_review_would_insert: accepted.length,
};

const report = {
  mode: 'dry-run-only',
  collected_at: now,
  sources,
  pages_scanned: results.flatMap((result) => result.pagesScanned),
  counts,
  pending_review_would_insert: accepted,
  rejected,
};

writeFileSync('work/phase2-dry-run-report.json', JSON.stringify(report, null, 2), 'utf8');

const sourceRows = sources.map((source) => ({
  name: source.name,
  url: source.url,
  category: source.category,
  trusted: source.trustedBecause,
  expected: source.expectedDataType,
  status: source.officialStatus,
}));

const proposedRows = accepted.slice(0, 25).map((item) => ({
  title: item.title,
  type: item.category,
  table: item.target_table,
  org: item.organization,
  location: `${item.governorate || 'null'} / ${item.city || 'null'}`,
  date: item.deadline || item.event_date || 'null',
  source_url: item.source_url,
  apply_url: item.apply_url || 'null',
  confidence: item.confidence_score,
  passed: item.why_passed,
  duplicate: item.duplicate_status,
  active: item.active_status,
}));

const rejectedRows = rejected.map((item) => ({
  source: item.source,
  reason: item.reason,
  title: item.title,
  source_url: item.source_url,
  detail: item.duplicate_matches || item.detail || '',
}));

const markdown = `# Phase 2 Dry-Run Report

Collected at: ${now}

Mode: DRY-RUN ONLY. No D1 writes. No approvals. No frontend deploy. No scraper broad run.

## Selected 10 Sources

${mdTable(sourceRows, [
  { key: 'name', label: 'Source' },
  { key: 'url', label: 'URL' },
  { key: 'category', label: 'Category' },
  { key: 'expected', label: 'Expected data type' },
  { key: 'trusted', label: 'Why trusted' },
  { key: 'status', label: 'Official/reputable status' },
])}

## Counts

- Sources scanned: ${counts.sources_scanned}
- Pages scanned: ${counts.pages_scanned}
- Items found: ${counts.items_found}
- Rejected expired: ${counts.rejected_expired}
- Rejected duplicate: ${counts.rejected_duplicate}
- Rejected generic: ${counts.rejected_generic}
- Rejected no URL: ${counts.rejected_no_url}
- Rejected unclear/unrelated/inaccessible: ${counts.rejected_unclear_unrelated}
- pending_review would insert: ${counts.pending_review_would_insert}

## Pages Scanned

${results.map((result) => `### ${result.source.name}\n${result.pagesScanned.map((url) => `- ${url}`).join('\n')}`).join('\n\n')}

## Proposed pending_review Items (max 25)

${proposedRows.length ? mdTable(proposedRows, [
  { key: 'title', label: 'Title' },
  { key: 'type', label: 'Category/type' },
  { key: 'table', label: 'Target table' },
  { key: 'org', label: 'Organization/university' },
  { key: 'location', label: 'Governorate/city' },
  { key: 'date', label: 'Deadline/event_date' },
  { key: 'source_url', label: 'source_url' },
  { key: 'apply_url', label: 'apply_url' },
  { key: 'confidence', label: 'confidence_score' },
  { key: 'passed', label: 'Why it passed' },
  { key: 'duplicate', label: 'Duplicate status' },
  { key: 'active', label: 'Active/expired status' },
]) : 'No unique items proposed for insertion.'}

## Rejections

${rejectedRows.length ? mdTable(rejectedRows, [
  { key: 'source', label: 'Source' },
  { key: 'reason', label: 'Reason' },
  { key: 'title', label: 'Title' },
  { key: 'source_url', label: 'source_url' },
  { key: 'detail', label: 'Detail' },
]) : 'No rejected items.'}

## Safety Confirmations

- D1 write performed: no
- Items approved: no
- Frontend touched/deployed: no
- Demo data restored: no
- Broad scraper/all 300+ sources run: no
- New items, if later approved by user for insertion, must be inserted as status = pending_review only.
`;

writeFileSync('work/phase2-dry-run-report.md', markdown, 'utf8');
console.log(markdown);

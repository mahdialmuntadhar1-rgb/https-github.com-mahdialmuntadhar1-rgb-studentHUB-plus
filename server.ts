import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DB_FILE = path.join(process.cwd(), "database.json");
const BACKEND_URL = "https://rafid-api.mahdialmuntadhar1.workers.dev";
const MAIN_ADMIN_EMAIL = "safaribosafar@gmail.com";
const DEFAULT_HERO_CONFIG = {
  imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600",
  titleEN: "",
  titleAR: "",
  titleKU: "",
  subtitleEN: "",
  subtitleAR: "",
  subtitleKU: "",
  updated_at: null as string | null
};

type DbState = {
  sources: any[];
  opportunities: any[];
  rawItems: any[];
  logs: any[];
  config: {
    hero: typeof DEFAULT_HERO_CONFIG;
  };
  adminUsers: any[];
  status: {
    status: string;
    last_run_timestamp: string | null;
    frequency_hours: number;
    is_active: boolean;
  };
};

const allowedCategories = new Set([
  "job",
  "scholarship",
  "event",
  "news",
  "announcement",
  "internship",
  "training",
  "fellowship",
  "competition",
  "registration",
  "exam",
  "deadline"
]);

const governorates = [
  { id: "baghdad", name: "Baghdad", keys: ["baghdad", "بغداد"] },
  { id: "basra", name: "Basra", keys: ["basra", "البصرة", "بصرة"] },
  { id: "nineveh", name: "Nineveh", keys: ["nineveh", "mosul", "نينوى", "الموصل"] },
  { id: "erbil", name: "Erbil", keys: ["erbil", "hawler", "اربيل", "أربيل", "هەولێر"] },
  { id: "sulaymaniyah", name: "Sulaymaniyah", keys: ["sulaymaniyah", "slemani", "السليمانية", "سلێمانی"] },
  { id: "duhok", name: "Duhok", keys: ["duhok", "dohuk", "دهوك", "دهۆک"] },
  { id: "kirkuk", name: "Kirkuk", keys: ["kirkuk", "كركوك", "کەرکووک"] },
  { id: "najaf", name: "Najaf", keys: ["najaf", "النجف"] },
  { id: "karbala", name: "Karbala", keys: ["karbala", "كربلاء"] },
  { id: "babil", name: "Babil", keys: ["babil", "babylon", "بابل"] },
  { id: "diyala", name: "Diyala", keys: ["diyala", "ديالى"] },
  { id: "anbar", name: "Anbar", keys: ["anbar", "الانبار", "الأنبار"] },
  { id: "wasit", name: "Wasit", keys: ["wasit", "واسط"] },
  { id: "maysan", name: "Maysan", keys: ["maysan", "ميسان"] },
  { id: "dhiqar", name: "Dhi Qar", keys: ["dhi qar", "dhiqar", "ذي قار"] },
  { id: "muthanna", name: "Muthanna", keys: ["muthanna", "المثنى"] },
  { id: "qadisiyah", name: "Qadisiyah", keys: ["qadisiyah", "diwaniyah", "القادسية", "الديوانية"] },
  { id: "salahaddin", name: "Salahaddin", keys: ["salahaddin", "salah al-din", "صلاح الدين"] },
  { id: "halabja", name: "Halabja", keys: ["halabja", "حلبجة", "هەڵەبجە"] }
];

const seedSources = [
  { id: "uobaghdad-news", name: "University of Baghdad News", url: "https://uobaghdad.edu.iq/", type: "news", university: "University of Baghdad", governorate: "Baghdad", city: "Baghdad" },
  { id: "uotechnology-announcements", name: "University of Technology Announcements", url: "https://uotechnology.edu.iq/", type: "announcement", university: "University of Technology", governorate: "Baghdad", city: "Baghdad" },
  { id: "mustansiriyah-news", name: "Mustansiriyah University News", url: "https://uomustansiriyah.edu.iq/", type: "news", university: "Mustansiriyah University", governorate: "Baghdad", city: "Baghdad" },
  { id: "basrah-news", name: "University of Basrah News", url: "https://uobasrah.edu.iq/", type: "news", university: "University of Basrah", governorate: "Basra", city: "Basra" },
  { id: "mosul-news", name: "University of Mosul News", url: "https://uomosul.edu.iq/", type: "news", university: "University of Mosul", governorate: "Nineveh", city: "Mosul" },
  { id: "kufa-news", name: "University of Kufa News", url: "https://uokufa.edu.iq/", type: "news", university: "University of Kufa", governorate: "Najaf", city: "Najaf" },
  { id: "karbala-news", name: "University of Karbala News", url: "https://uokerbala.edu.iq/", type: "news", university: "University of Karbala", governorate: "Karbala", city: "Karbala" },
  { id: "duhok-news", name: "University of Duhok News", url: "https://uod.ac/", type: "news", university: "University of Duhok", governorate: "Duhok", city: "Duhok" },
  { id: "sulaimani-news", name: "University of Sulaimani News", url: "https://univsul.edu.iq/", type: "news", university: "University of Sulaimani", governorate: "Sulaymaniyah", city: "Sulaymaniyah" },
  { id: "koya-news", name: "Koya University News", url: "https://koyauniversity.org/", type: "news", university: "Koya University", governorate: "Erbil", city: "Koya" },
  { id: "mohesr-iraq", name: "Iraqi Ministry of Higher Education", url: "https://mohesr.gov.iq/", type: "announcement", university: "", governorate: "", city: "" },
  { id: "mhe-krg", name: "KRG Ministry of Higher Education", url: "https://mhe.gov.krd/", type: "scholarship", university: "", governorate: "Erbil", city: "Erbil" },
  { id: "daad-iraq", name: "DAAD Iraq", url: "https://www.daad-iraq.org/en/", type: "scholarship", university: "", governorate: "", city: "" },
  { id: "un-jobs-iraq", name: "United Nations Iraq Jobs", url: "https://iraq.un.org/en/jobs", type: "job", university: "", governorate: "", city: "" },
  { id: "asiacell-careers", name: "Asiacell Careers", url: "https://www.asiacell.com/en/about-us/careers", type: "job", university: "", governorate: "Sulaymaniyah", city: "Sulaymaniyah" },
  { id: "five-one-labs", name: "Five One Labs Programs", url: "https://fiveonelabs.org/", type: "training", university: "", governorate: "Sulaymaniyah", city: "Sulaymaniyah" }
];

app.disable("x-powered-by");
app.use(express.json({ limit: "2mb" }));

const rateHits = new Map<string, { count: number; resetAt: number }>();
app.use("/api/", (req, res, next) => {
  const key = req.ip || "local";
  const now = Date.now();
  const current = rateHits.get(key) || { count: 0, resetAt: now + 15 * 60 * 1000 };
  if (current.resetAt < now) {
    current.count = 0;
    current.resetAt = now + 15 * 60 * 1000;
  }
  current.count += 1;
  rateHits.set(key, current);
  if (current.count > 240) {
    res.status(429).json({ error: "Too many requests" });
    return;
  }
  next();
});

function emptyDb(): DbState {
  return {
    sources: [],
    opportunities: [],
    rawItems: [],
    logs: [],
    config: {
      hero: { ...DEFAULT_HERO_CONFIG }
    },
    adminUsers: [
      {
        email: MAIN_ADMIN_EMAIL,
        role: "staff",
        permissions: ["hero:write", "posts:manage", "uploads:manage"],
        is_main_admin: true
      }
    ],
    status: {
      status: "idle",
      last_run_timestamp: null,
      frequency_hours: 6,
      is_active: true
    }
  };
}

function readDB(): DbState {
  try {
    const parsed = fs.existsSync(DB_FILE) ? JSON.parse(fs.readFileSync(DB_FILE, "utf-8")) : emptyDb();
    return normalizeDb(parsed);
  } catch (err) {
    console.error("Error reading database.json:", err);
    return normalizeDb(emptyDb());
  }
}

function writeDB(data: DbState) {
  fs.writeFileSync(DB_FILE, JSON.stringify(normalizeDb(data), null, 2), "utf-8");
}

function normalizeDb(input: any): DbState {
  const db: DbState = {
    ...emptyDb(),
    ...input,
    sources: Array.isArray(input?.sources) ? input.sources : [],
    opportunities: Array.isArray(input?.opportunities) ? input.opportunities : [],
    rawItems: Array.isArray(input?.rawItems) ? input.rawItems : Array.isArray(input?.opportunity_raw_items) ? input.opportunity_raw_items : [],
    logs: Array.isArray(input?.logs) ? input.logs : Array.isArray(input?.scraper_logs) ? input.scraper_logs : [],
    config: {
      hero: { ...DEFAULT_HERO_CONFIG, ...(input?.config?.hero || input?.app_config?.hero || {}) }
    },
    adminUsers: Array.isArray(input?.adminUsers) ? input.adminUsers : []
  };

  if (!db.adminUsers.some((user: any) => String(user.email || "").toLowerCase() === MAIN_ADMIN_EMAIL)) {
    db.adminUsers.push({
      email: MAIN_ADMIN_EMAIL,
      role: "staff",
      permissions: ["hero:write", "posts:manage", "uploads:manage"],
      is_main_admin: true
    });
  }

  for (const seed of seedSources) {
    if (!db.sources.some((source: any) => source.id === seed.id || source.url === seed.url)) {
      db.sources.push({ ...seed, enabled: true, active: true, last_checked: null, error_status: null });
    }
  }

  db.sources = db.sources.map((source: any) => ({
    ...source,
    enabled: source.enabled !== false && source.enabled !== 0,
    active: source.active !== false && source.enabled !== false && source.enabled !== 0,
    type: normalizeCategory(source.type || source.category_scope || "news")
  }));

  db.opportunities = db.opportunities.map((item: any) => normalizeOpportunity(item, false));
  return db;
}

function isMainAdminEmail(email: any) {
  return String(email || "").trim().toLowerCase() === MAIN_ADMIN_EMAIL;
}

function requireMainAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const email = req.header("x-admin-email") || req.body?.email || req.query.email;
  if (!isMainAdminEmail(email)) {
    res.status(403).json({ error: "Main admin access required." });
    return;
  }
  next();
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72);
}

function sanitizeText(value: any) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function detectLanguage(text: string) {
  if (/[\u0600-\u06ff]/.test(text)) {
    return /[ەڵێۆڕڤگکژچپ]/.test(text) ? "ku" : "ar";
  }
  return "en";
}

function normalizeCategory(value: string) {
  const text = String(value || "").toLowerCase();
  if (text.includes("scholar")) return "scholarship";
  if (text.includes("intern")) return "internship";
  if (text.includes("train") || text.includes("course") || text.includes("workshop")) return "training";
  if (text.includes("fellow")) return "fellowship";
  if (text.includes("compet") || text.includes("contest") || text.includes("hackathon")) return "competition";
  if (text.includes("register") || text.includes("admission")) return "registration";
  if (text.includes("exam") || text.includes("test")) return "exam";
  if (text.includes("event") || text.includes("calendar")) return "event";
  if (text.includes("announce") || text.includes("notice")) return "announcement";
  if (text.includes("deadline")) return "deadline";
  if (text.includes("job") || text.includes("career") || text.includes("vacancy")) return "job";
  if (text.includes("news")) return "news";
  return allowedCategories.has(text) ? text : "announcement";
}

function classifyCategory(text: string, sourceType = "") {
  const merged = `${sourceType} ${text}`.toLowerCase();
  if (/intern|تدريب عملي|مەشق/.test(merged)) return "internship";
  if (/scholar|منحة|بعثة|daad|بورس|بۆرس/.test(merged)) return "scholarship";
  if (/job|career|vacancy|recruit|وظيفة|تعيين/.test(merged)) return "job";
  if (/training|course|workshop|bootcamp|دورة|ورشة|ڕاهێنان/.test(merged)) return "training";
  if (/fellowship|زمالة/.test(merged)) return "fellowship";
  if (/competition|contest|hackathon|مسابقة|بطولة|کێبڕکێ/.test(merged)) return "competition";
  if (/registration|admission|قبول|تسجيل/.test(merged)) return "registration";
  if (/exam|امتحان|اختبار|تاقیکردنەوە/.test(merged)) return "exam";
  if (/deadline|موعد|مۆڵەت/.test(merged)) return "deadline";
  if (/event|conference|ندوة|مؤتمر|فعالية/.test(merged)) return "event";
  if (/news|خبر|اخبار/.test(merged)) return "news";
  return normalizeCategory(sourceType || "announcement");
}

function normalizeGovernorate(value: string, fallbackText = "") {
  const raw = `${value || ""} ${fallbackText || ""}`.toLowerCase();
  for (const gov of governorates) {
    if (gov.keys.some(key => raw.includes(key.toLowerCase()))) return gov.name;
  }
  return value && value !== "all" ? value : "";
}

function governorateId(value: string) {
  const name = normalizeGovernorate(value);
  const found = governorates.find(g => g.name.toLowerCase() === name.toLowerCase() || g.id === String(value).toLowerCase());
  return found?.id || (value === "all" ? "all" : "");
}

function extractDate(text: string) {
  const iso = text.match(/\b(20\d{2})[-/.](0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01])\b/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  const dmy = text.match(/\b(0?[1-9]|[12]\d|3[01])[-/.](0?[1-9]|1[0-2])[-/.](20\d{2})\b/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  return "";
}

function isExpired(item: any) {
  if (["news", "announcement"].includes(item.category)) return false;
  if (!item.deadline) return false;
  const parsed = new Date(item.deadline);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.getTime() < Date.now() - 24 * 60 * 60 * 1000;
}

function duplicateKey(item: any) {
  return [
    sanitizeText(item.title || item.titleEN).toLowerCase(),
    String(item.source_url || item.sourceUrl || item.original_source_url || item.application_link || "").toLowerCase(),
    String(item.deadline || item.event_date || item.published_date || ""),
    sanitizeText(item.university || item.organization || "").toLowerCase()
  ].join("|");
}

function normalizeOpportunity(input: any, isNew = true) {
  const sourceUrl = input.source_url || input.sourceUrl || input.original_source_url || input.application_link || "";
  const title = sanitizeText(input.title || input.titleEN || input.title_en || "Untitled opportunity");
  const summary = sanitizeText(input.summary || input.contentEN || input.description || input.raw_text || "");
  const rawText = sanitizeText(input.raw_extracted_text || input.raw_text || `${title} ${summary}`);
  const category = normalizeCategory(input.category || classifyCategory(`${title} ${summary}`, input.type));
  const govName = normalizeGovernorate(input.governorate || input.governorate_name || input.governorateId, `${title} ${summary}`);
  const govId = governorateId(govName || input.governorateId || "all") || "all";
  const language = input.language || detectLanguage(`${title} ${summary}`);
  const sourceWebsite = input.source_website || input.sourceWebsite || safeHost(sourceUrl);
  const publishedDate = input.published_date || input.publishedDate || "";
  const deadline = input.deadline || input.event_date || input.date || extractDate(`${title} ${summary}`);
  const status = input.status || (isNew ? "pending_review" : "pending_review");
  const org = input.university || input.organization || input.institution_name || input.company || sourceWebsite || "Official source";

  return {
    ...input,
    id: input.id || `opp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    titleEN: input.titleEN || input.title_en || title,
    titleAR: input.titleAR || input.title_ar || title,
    titleKU: input.titleKU || input.title_ku || title,
    summary,
    contentEN: input.contentEN || input.description_en || summary || `Official item from ${org}.`,
    contentAR: input.contentAR || input.description_ar || summary || `عنصر رسمي من ${org}.`,
    contentKU: input.contentKU || input.description_ku || summary || `بابەتی فەرمی لە ${org}.`,
    category,
    university: input.university || input.institution_name || "",
    organization: org,
    governorate: govName,
    governorateId: govId,
    city: input.city || "",
    country: input.country || "Iraq",
    source_website: sourceWebsite,
    source_url: sourceUrl,
    sourceUrl,
    original_source_url: sourceUrl,
    application_link: input.application_link || sourceUrl,
    deadline,
    published_date: publishedDate,
    language,
    status,
    raw_extracted_text: rawText,
    confidence_score: Number(input.confidence_score ?? input.confidence ?? confidenceFor(input)),
    duplicate_key: input.duplicate_key || duplicateKey({ ...input, title, source_url: sourceUrl, deadline, university: input.university || org }),
    created_at: input.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    location: input.location || [input.city, govName].filter(Boolean).join(", ") || (govId === "all" ? "All Iraq" : "Unknown governorate"),
    workplaceType: input.workplaceType || "On-site",
    whoCanApply: input.whoCanApply || "Review the original official source for eligibility.",
    salary: input.salary || "",
    imageUrl: input.imageUrl || input.image_url || "",
    savedCount: Number(input.savedCount || input.saved_count || 0),
    universityAppliedCount: Number(input.universityAppliedCount || input.applied_count || 0),
    companyVerified: input.companyVerified ?? true
  };
}

function confidenceFor(item: any) {
  let score = 0.45;
  if (item.source_url || item.original_source_url) score += 0.2;
  if (item.summary || item.contentEN || item.raw_text) score += 0.1;
  if (item.deadline || item.published_date) score += 0.1;
  if (item.university || item.governorate || item.city) score += 0.1;
  return Math.min(0.95, Number(score.toFixed(2)));
}

function isLowValueTitle(text: string) {
  const normalized = sanitizeText(text).toLowerCase();
  const blockedExact = new Set([
    "home",
    "news",
    "events",
    "announcements",
    "careers",
    "contact us",
    "read more",
    "المركز الخبري",
    "الأخبار",
    "الاخبار",
    "الإعلانات",
    "اعلانات",
    "اقرأ المزيد"
  ]);
  if (blockedExact.has(normalized)) return true;
  if (normalized.length < 12) return true;
  return /^(more|view|all|archive|الرئيسية|الكليات|عن الجامعة|الجامعة)$/.test(normalized);
}

function safeHost(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}

function paginate(items: any[], page = 1, limit = 20) {
  const total = items.length;
  const start = (Math.max(1, page) - 1) * limit;
  return { data: items.slice(start, start + limit), total, page, limit };
}

function filterOpportunities(items: any[], query: any) {
  let result = [...items];
  const q = String(query.q || query.search || "").toLowerCase().trim();
  if (query.status) result = result.filter(item => item.status === query.status);
  if (query.category && query.category !== "all") result = result.filter(item => item.category === normalizeCategory(query.category));
  if (query.governorate && query.governorate !== "all") {
    const wanted = governorateId(query.governorate) || String(query.governorate).toLowerCase();
    result = result.filter(item => item.governorateId === wanted || item.governorate?.toLowerCase() === String(query.governorate).toLowerCase());
  }
  if (query.city) result = result.filter(item => String(item.city || "").toLowerCase().includes(String(query.city).toLowerCase()));
  if (query.university) result = result.filter(item => String(item.university || item.organization || "").toLowerCase().includes(String(query.university).toLowerCase()));
  if (query.deadline && query.deadline !== "all") {
    const now = new Date();
    result = result.filter(item => {
      if (!item.deadline) return false;
      const date = new Date(item.deadline);
      if (Number.isNaN(date.getTime())) return false;
      const diffDays = Math.ceil((date.getTime() - now.getTime()) / 86400000);
      if (query.deadline === "week") return diffDays >= 0 && diffDays <= 7;
      if (query.deadline === "month") return diffDays >= 0 && diffDays <= 30;
      return item.deadline === query.deadline;
    });
  }
  if (q) {
    result = result.filter(item => [
      item.title,
      item.titleEN,
      item.titleAR,
      item.titleKU,
      item.summary,
      item.contentEN,
      item.contentAR,
      item.contentKU,
      item.university,
      item.organization,
      item.city,
      item.governorate
    ].some(value => String(value || "").toLowerCase().includes(q)));
  }
  return result.sort((a, b) => String(b.published_date || b.created_at || "").localeCompare(String(a.published_date || a.created_at || "")));
}

async function fetchSource(source: any) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(source.url, {
      headers: {
        "User-Agent": "Jamiaati-StudentHUB-OpportunityBot/1.0 (+official-source-indexing; polite timeout)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8",
        "Accept-Language": "ar,en;q=0.8,ku;q=0.7"
      },
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

function extractItemsFromHtml(html: string, source: any) {
  const cleanHtml = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ");
  const candidates: any[] = [];
  const anchorRegex = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const keywords = /(job|career|vacanc|scholar|grant|fellow|intern|training|course|workshop|event|conference|competition|contest|registration|admission|exam|deadline|news|announcement|notice|وظيفة|تعيين|منحة|زمالة|تدريب|دورة|ورشة|فعالية|مؤتمر|مسابقة|قبول|تسجيل|امتحان|اعلان|إعلان|خبر)/i;
  let match: RegExpExecArray | null;
  const seen = new Set<string>();

  while ((match = anchorRegex.exec(cleanHtml)) && candidates.length < 20) {
    const href = match[1];
    const text = sanitizeText(match[2]);
    if (text.length < 12 || text.length > 240) continue;
    if (isLowValueTitle(text)) continue;
    const url = resolveUrl(href, source.url);
    const combined = `${text} ${url}`;
    if (!keywords.test(combined)) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    const category = classifyCategory(combined, source.type);
    const rawText = text;
    candidates.push(normalizeOpportunity({
      title: text,
      category,
      university: source.university || "",
      governorate: source.governorate || normalizeGovernorate("", rawText),
      city: source.city || "",
      source_website: safeHost(url),
      source_url: url,
      summary: `Official ${category} item found on ${source.name}. Open the source URL to verify details.`,
      deadline: category === "news" || category === "announcement" ? "" : extractDate(rawText),
      published_date: extractDate(rawText),
      language: detectLanguage(rawText),
      status: "pending_review",
      raw_extracted_text: rawText,
      confidence_score: 0.72
    }));
  }

  return candidates;
}

function resolveUrl(href: string, baseUrl: string) {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return baseUrl;
  }
}

function addCandidate(db: DbState, item: any) {
  const normalized = normalizeOpportunity(item);
  if (isExpired(normalized)) return { inserted: false, duplicate: false, expired: true, item: normalized };
  const existing = db.opportunities.find(opp => opp.duplicate_key === normalized.duplicate_key);
  if (existing) {
    existing.duplicate_seen_at = new Date().toISOString();
    return { inserted: false, duplicate: true, expired: false, item: existing };
  }
  db.opportunities.unshift(normalized);
  return { inserted: true, duplicate: false, expired: false, item: normalized };
}

async function runScraper(sourceId?: string) {
  const db = readDB();
  const runAt = new Date().toISOString();
  const sources = db.sources.filter(source => (source.enabled || source.active) && (!sourceId || source.id === sourceId));
  const stats = { trigger: sourceId ? "single_source" : "manual_admin", time: runAt, sourcesChecked: 0, itemsFound: 0, itemsNew: 0, itemsDuplicate: 0, expiredIgnored: 0, errors: [] as string[] };
  db.status = { ...db.status, status: "scraping", last_run_timestamp: runAt };

  for (const source of sources) {
    let sourceFound = 0;
    let sourceNew = 0;
    let sourceDup = 0;
    try {
      stats.sourcesChecked += 1;
      const html = await fetchSource(source);
      const items = extractItemsFromHtml(html, source);
      sourceFound = items.length;
      stats.itemsFound += items.length;

      for (const item of items) {
        db.rawItems.unshift({
          id: `raw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          source_id: source.id,
          source_name: source.name,
          source_url: item.source_url,
          raw_text: item.raw_extracted_text,
          extracted_at: runAt
        });
        const result = addCandidate(db, item);
        if (result.inserted) {
          sourceNew += 1;
          stats.itemsNew += 1;
        } else if (result.duplicate) {
          sourceDup += 1;
          stats.itemsDuplicate += 1;
        } else if (result.expired) {
          stats.expiredIgnored += 1;
        }
      }
      source.last_checked = runAt;
      source.error_status = null;
    } catch (err: any) {
      const message = `${source.name}: ${err.message || err}`;
      stats.errors.push(message);
      source.last_checked = runAt;
      source.error_status = err.message || String(err);
    }

    db.logs.unshift({
      id: `log-${Date.now()}-${source.id}`,
      timestamp: runAt,
      source_id: source.id,
      source_name: source.name,
      items_found: sourceFound,
      items_new: sourceNew,
      items_duplicate: sourceDup,
      errors: source.error_status || null
    });
    await new Promise(resolve => setTimeout(resolve, 350));
  }

  db.status = { ...db.status, status: "idle", last_run_timestamp: runAt };
  writeDB(db);
  return stats;
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];
    if (char === "\"" && quoted && next === "\"") {
      cell += "\"";
      i++;
    } else if (char === "\"") {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i++;
      row.push(cell);
      if (row.some(value => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell);
  if (row.some(value => value.trim())) rows.push(row);
  if (rows.length === 0) return [];
  const headers = rows[0].map(header => header.trim().toLowerCase());
  return rows.slice(1).map(values => Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() || ""])));
}

async function readCsvPayload(req: express.Request) {
  if (typeof req.body?.csv === "string") return req.body.csv;
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf-8");
  const match = raw.match(/\r?\n\r?\n([\s\S]*?)\r?\n--/);
  return match ? match[1].trim() : raw.trim();
}

let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "MOCK_KEY" });
  }
  return aiClient;
}

app.get("/health", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));
app.get("/api/health", (_req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

app.get("/api/admin/me", (req, res) => {
  const email = req.query.email || req.header("x-admin-email");
  const isMainAdmin = isMainAdminEmail(email);
  res.json({
    email: String(email || ""),
    role: isMainAdmin ? "staff" : "student",
    is_admin: isMainAdmin,
    permissions: isMainAdmin ? ["hero:write", "posts:manage", "uploads:manage"] : []
  });
});

app.get("/api/config/hero", (_req, res) => {
  const db = readDB();
  res.json(db.config.hero);
});

app.post("/api/admin/config/hero", requireMainAdmin, (req, res) => {
  const db = readDB();
  const current = db.config.hero || { ...DEFAULT_HERO_CONFIG };
  const next = {
    ...current,
    imageUrl: typeof req.body?.imageUrl === "string" && req.body.imageUrl.trim() ? req.body.imageUrl.trim() : current.imageUrl,
    titleEN: typeof req.body?.titleEN === "string" ? req.body.titleEN : current.titleEN,
    titleAR: typeof req.body?.titleAR === "string" ? req.body.titleAR : current.titleAR,
    titleKU: typeof req.body?.titleKU === "string" ? req.body.titleKU : current.titleKU,
    subtitleEN: typeof req.body?.subtitleEN === "string" ? req.body.subtitleEN : current.subtitleEN,
    subtitleAR: typeof req.body?.subtitleAR === "string" ? req.body.subtitleAR : current.subtitleAR,
    subtitleKU: typeof req.body?.subtitleKU === "string" ? req.body.subtitleKU : current.subtitleKU,
    updated_at: new Date().toISOString()
  };
  db.config.hero = next;
  writeDB(db);
  res.json({ success: true, hero: next });
});

app.post("/api/admin/upload", requireMainAdmin, (req, res) => {
  const { fileName, mimeType, dataUrl } = req.body || {};
  if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
    res.status(400).json({ error: "Only image data URLs are accepted." });
    return;
  }
  const safeMime = String(mimeType || "").toLowerCase();
  if (safeMime && !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(safeMime)) {
    res.status(400).json({ error: "Unsupported image type." });
    return;
  }
  const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,([\s\S]+)$/i);
  if (!match) {
    res.status(400).json({ error: "Invalid image payload." });
    return;
  }
  const bytes = Buffer.from(match[2], "base64");
  if (bytes.length > 3 * 1024 * 1024) {
    res.status(400).json({ error: "Image is too large. Maximum size is 3MB." });
    return;
  }
  const ext = match[1].split("/")[1].replace("jpeg", "jpg");
  const cleanName = slug(String(fileName || "hero-image").replace(/\.[^.]+$/, "")) || "hero-image";
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  fs.mkdirSync(uploadDir, { recursive: true });
  const storedName = `${Date.now()}-${cleanName}.${ext}`;
  const target = path.join(uploadDir, storedName);
  fs.writeFileSync(target, bytes);
  res.json({
    success: true,
    url: `/uploads/${storedName}`,
    storage: "local-public-uploads",
    note: "Use the Cloudflare R2 upload binding in production if exposed by the deployed backend."
  });
});

app.get("/api/opportunities", (req, res) => {
  const db = readDB();
  const approved = db.opportunities.filter(item => item.status === "approved" && !isExpired(item));
  res.json(filterOpportunities(approved, req.query));
});

app.get("/api/admin/opportunities", (req, res) => {
  const db = readDB();
  res.json(filterOpportunities(db.opportunities, req.query));
});

app.post("/api/admin/opportunities/action", (req, res) => {
  const { id, action, reason } = req.body || {};
  const db = readDB();
  const item = db.opportunities.find(opp => opp.id === id);
  if (!item) return res.status(404).json({ error: "Opportunity not found." });
  if (action === "approve") item.status = "approved";
  else if (action === "reject") {
    item.status = "rejected";
    item.rejection_reason = reason || item.rejection_reason || "";
  } else if (action === "expire") item.status = "expired";
  else if (action === "duplicate") item.status = "duplicate";
  else if (action === "delete") db.opportunities = db.opportunities.filter(opp => opp.id !== id);
  else return res.status(400).json({ error: "Invalid action." });
  writeDB(db);
  res.json({ success: true, item });
});

app.post("/api/admin/opportunities/edit", (req, res) => {
  const db = readDB();
  const item = db.opportunities.find(opp => opp.id === req.body?.id);
  if (!item) return res.status(404).json({ error: "Opportunity not found." });
  Object.assign(item, normalizeOpportunity({ ...item, ...req.body }, false));
  writeDB(db);
  res.json({ success: true, item });
});

app.get("/api/admin/sources", (req, res) => {
  const db = readDB();
  const search = String(req.query.search || "").toLowerCase();
  const sources = search ? db.sources.filter(source => `${source.name} ${source.url}`.toLowerCase().includes(search)) : db.sources;
  res.json(sources);
});

app.post("/api/admin/sources", (req, res) => {
  const db = readDB();
  const source = req.body || {};
  if (!source.name || !source.url) return res.status(400).json({ error: "name and url are required." });
  const id = source.id || `source-${slug(source.name) || Date.now()}`;
  const data = { ...source, id, type: normalizeCategory(source.type || "news"), enabled: source.enabled ?? source.active ?? true, active: source.active ?? source.enabled ?? true };
  const index = db.sources.findIndex(item => item.id === id || item.url === source.url);
  if (index >= 0) db.sources[index] = { ...db.sources[index], ...data };
  else db.sources.push({ ...data, last_checked: null, error_status: null });
  writeDB(db);
  res.json({ success: true, source: data });
});

app.delete("/api/admin/sources", (req, res) => {
  const id = req.body?.id || req.query.id;
  const db = readDB();
  const before = db.sources.length;
  db.sources = db.sources.filter(source => source.id !== id);
  writeDB(db);
  res.json({ success: before !== db.sources.length });
});

app.post("/api/admin/scraper/run", async (_req, res) => {
  try {
    res.json({ success: true, stats: await runScraper() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/admin/logs", (_req, res) => {
  const db = readDB();
  res.json(db.logs);
});

app.get("/api/opportunity-automation/status", (_req, res) => {
  const db = readDB();
  res.json(db.status);
});

app.get("/api/opportunity-automation/stats", (_req, res) => {
  const db = readDB();
  res.json({
    total_scraped: db.opportunities.length,
    duplicates_blocked: db.opportunities.filter(item => item.status === "duplicate" || item.duplicate_seen_at).length,
    pending_review: db.opportunities.filter(item => item.status === "pending_review" || item.status === "pending").length,
    approved: db.opportunities.filter(item => item.status === "approved").length,
    rejected: db.opportunities.filter(item => item.status === "rejected").length,
    expired: db.opportunities.filter(item => item.status === "expired").length,
    sources: db.sources.length,
    raw_items: db.rawItems.length
  });
});

app.get("/api/opportunity-automation/sources", (req, res) => {
  const db = readDB();
  const search = String(req.query.search || "").toLowerCase();
  const filtered = db.sources.filter(source => !search || `${source.name} ${source.url} ${source.type}`.toLowerCase().includes(search));
  res.json(paginate(filtered, Number(req.query.page || 1), Number(req.query.limit || 20)));
});

app.post("/api/opportunity-automation/sources", (req, res) => {
  req.url = "/api/admin/sources";
  app._router.handle(req, res, () => undefined);
});

app.patch("/api/opportunity-automation/sources/:id", (req, res) => {
  const db = readDB();
  const source = db.sources.find(item => item.id === req.params.id);
  if (!source) return res.status(404).json({ error: "Source not found." });
  Object.assign(source, req.body, {
    enabled: req.body.enabled ?? req.body.active ?? source.enabled,
    active: req.body.active ?? req.body.enabled ?? source.active
  });
  writeDB(db);
  res.json({ success: true, source });
});

app.delete("/api/opportunity-automation/sources/:id", (req, res) => {
  const db = readDB();
  db.sources = db.sources.filter(source => source.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

app.post("/api/opportunity-automation/run-now", async (_req, res) => {
  res.json({ success: true, stats: await runScraper() });
});

app.post("/api/opportunity-automation/run-source/:id", async (req, res) => {
  res.json({ success: true, stats: await runScraper(req.params.id) });
});

app.get("/api/opportunity-automation/candidates", (req, res) => {
  const db = readDB();
  const status = req.query.status ? String(req.query.status) : undefined;
  const filtered = filterOpportunities(db.opportunities, { ...req.query, status });
  res.json(paginate(filtered, Number(req.query.page || 1), Number(req.query.limit || 20)));
});

app.get("/api/opportunity-automation/candidates/:id", (req, res) => {
  const item = readDB().opportunities.find(opp => opp.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Candidate not found." });
  res.json(item);
});

app.patch("/api/opportunity-automation/candidates/:id", (req, res) => {
  const db = readDB();
  const item = db.opportunities.find(opp => opp.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Candidate not found." });
  Object.assign(item, normalizeOpportunity({ ...item, ...req.body }, false));
  writeDB(db);
  res.json({ success: true, item });
});

app.post("/api/opportunity-automation/candidates/:id/approve", (req, res) => updateCandidateStatus(req.params.id, "approved", req.body?.reason, res));
app.post("/api/opportunity-automation/candidates/:id/reject", (req, res) => updateCandidateStatus(req.params.id, "rejected", req.body?.reason, res));
app.post("/api/opportunity-automation/candidates/:id/mark-duplicate", (req, res) => updateCandidateStatus(req.params.id, "duplicate", req.body?.reason, res));
app.post("/api/opportunity-automation/candidates/:id/mark-expired", (req, res) => updateCandidateStatus(req.params.id, "expired", req.body?.reason, res));

app.delete("/api/opportunity-automation/candidates/:id", (req, res) => {
  const db = readDB();
  const before = db.opportunities.length;
  db.opportunities = db.opportunities.filter(opp => opp.id !== req.params.id);
  writeDB(db);
  res.json({ success: before !== db.opportunities.length });
});

function updateCandidateStatus(id: string, status: string, reason: string | undefined, res: express.Response) {
  const db = readDB();
  const item = db.opportunities.find(opp => opp.id === id);
  if (!item) return res.status(404).json({ error: "Candidate not found." });
  item.status = status;
  if (reason) item.rejection_reason = reason;
  item.updated_at = new Date().toISOString();
  writeDB(db);
  res.json({ success: true, item });
}

app.post("/api/opportunity-automation/import-csv", async (req, res) => {
  try {
    const csv = await readCsvPayload(req);
    const rows = parseCsv(csv);
    const db = readDB();
    const stats = { imported: 0, duplicates: 0, expiredIgnored: 0, errors: [] as string[] };
    for (const row of rows) {
      try {
        const result = addCandidate(db, {
          title: row.title,
          category: row.category,
          university: row.university,
          governorate: row.governorate,
          city: row.city,
          source_url: row.source_url,
          summary: row.summary,
          deadline: row.deadline,
          published_date: row.published_date,
          language: row.language,
          status: row.status || "pending_review",
          raw_extracted_text: row.summary || row.title,
          confidence_score: 0.85
        });
        if (result.inserted) stats.imported += 1;
        else if (result.duplicate) stats.duplicates += 1;
        else if (result.expired) stats.expiredIgnored += 1;
      } catch (err: any) {
        stats.errors.push(err.message);
      }
    }
    db.logs.unshift({
      id: `log-csv-${Date.now()}`,
      timestamp: new Date().toISOString(),
      source_id: "manual_csv",
      source_name: "Manual CSV import",
      items_found: rows.length,
      items_new: stats.imported,
      items_duplicate: stats.duplicates,
      errors: stats.errors.join("; ") || null
    });
    writeDB(db);
    res.json({ success: true, ...stats });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get("/api/opportunity-automation/logs", (req, res) => {
  const db = readDB();
  res.json(paginate(db.logs, Number(req.query.page || 1), Number(req.query.limit || 20)));
});

app.post("/api/ask-ai", async (req, res) => {
  const { query, lang = "en" } = req.body || {};
  if (!query) return res.status(400).json({ error: "query is required." });
  if (!process.env.GEMINI_API_KEY) {
    res.json({
      model: "Local Advisor",
      text: lang === "ar"
        ? `أهلاً بك في جامعتي. سؤالك: "${query}". راجع إعلانات الجامعة الرسمية والفرص المعتمدة في قسم مستقبلك، وإذا كان الموضوع إداريًا فتواصل مع شؤون الطلبة في كليتك.`
        : lang === "ku"
        ? `سڵاو. پرسیارەکەت: "${query}". ئاگادارییە فەرمییەکانی زانکۆ و بەشی داهاتووت ببینە، و بۆ بابەتی کارگێڕی پەیوەندی بە کاروباری خوێندکارانەوە بکە.`
        : `Hello. Your question was: "${query}". Check official university notices and approved opportunities in Your Future, and contact student affairs for administrative cases.`
    });
    return;
  }
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: [{ role: "user", parts: [{ text: query }] }],
    config: { temperature: 0.4 }
  });
  res.json({ text: response.text || "", model: "gemini-3.5-flash" });
});

app.all("/api/outreach*", async (req, res) => {
  try {
    const targetUrl = `${BACKEND_URL}${req.originalUrl}`;
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (key.toLowerCase() !== "host") headers[key] = value as string;
    }
    const method = req.method;
    const body = ["POST", "PUT", "PATCH", "DELETE"].includes(method) ? JSON.stringify(req.body || {}) : undefined;
    const response = await fetch(targetUrl, { method, headers, body });
    const contentType = response.headers.get("content-type") || "";
    res.status(response.status);
    if (contentType.includes("application/json")) res.json(await response.json());
    else res.send(await response.text());
  } catch (err: any) {
    res.status(502).json({ success: false, error: `Outreach backend is unavailable: ${err.message}` });
  }
});

async function initServer() {
  writeDB(readDB());
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[OK] StudentHUB-plus server active on http://0.0.0.0:${PORT}`);
  });
}

initServer().catch(error => {
  console.error("Failed to start server:", error);
  process.exitCode = 1;
});

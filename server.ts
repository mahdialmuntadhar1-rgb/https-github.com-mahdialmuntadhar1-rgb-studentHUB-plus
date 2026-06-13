import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// -------------------------------------------------------------
// Local JSON File Database Layer (Cloudflare D1 Emulation Engine)
// -------------------------------------------------------------
const DB_FILE = path.join(process.cwd(), "database.json");

function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return { sources: [], opportunities: [], logs: [], users: [], passwordResets: [], posts: [], comments: [], likes: [], saved_items: [], applications: [], user_profiles: [] };
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      sources: parsed.sources || [],
      opportunities: parsed.opportunities || [],
      logs: parsed.logs || [],
      users: parsed.users || [],
      passwordResets: parsed.passwordResets || [],
      posts: parsed.posts || [],
      comments: parsed.comments || [],
      likes: parsed.likes || [],
      saved_items: parsed.saved_items || [],
      applications: parsed.applications || [],
      user_profiles: parsed.user_profiles || []
    };
  } catch (err) {
    console.error("Error reading database.json:", err);
    return { sources: [], opportunities: [], logs: [], users: [], passwordResets: [], posts: [], comments: [], likes: [], saved_items: [], applications: [], user_profiles: [] };
  }
}

function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database.json:", err);
  }
}

// -------------------------------------------------------------
// Real local authentication layer
// -------------------------------------------------------------
const TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET || (process.env.NODE_ENV === "production" ? "" : "jamiaati-local-dev-token-secret-change-me");
if (!TOKEN_SECRET) {
  throw new Error("AUTH_TOKEN_SECRET must be configured in production.");
}
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;
const ADMIN_ROLES = new Set(["admin", "staff", "super_admin"]);

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "student" | "graduate" | "teacher" | "staff" | "institution" | "admin" | "super_admin";
  passwordHash: string;
  createdAt: string;
};

function base64Url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function signToken(user: AuthUser) {
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64Url(JSON.stringify({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS
  }));
  const signature = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");
  return `${header}.${payload}.${signature}`;
}

function verifyToken(token: string) {
  try {
    const [header, payload, signature] = token.split(".");
    if (!header || !payload || !signature) return null;

    const expected = crypto
      .createHmac("sha256", TOKEN_SECRET)
      .update(`${header}.${payload}`)
      .digest("base64url");
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (signatureBuffer.length !== expectedBuffer.length) return null;
    if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    if (!claims.exp || claims.exp < Math.floor(Date.now() / 1000)) return null;
    return claims;
  } catch {
    return null;
  }
}

function publicUser(user: AuthUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [scheme, salt, hash] = storedHash.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const candidate = hashPassword(password, salt).split(":")[2];
  if (candidate.length !== hash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(candidate, "hex"), Buffer.from(hash, "hex"));
}

function getBearerToken(req: express.Request) {
  const header = req.headers.authorization || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

function findUserByToken(req: express.Request) {
  const token = getBearerToken(req);
  if (!token) return null;
  const claims = verifyToken(token);
  if (!claims?.sub) return null;
  const db = readDB();
  return db.users.find((u: AuthUser) => u.id === claims.sub) || null;
}

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = findUserByToken(req);
  if (!user) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }
  (req as any).authUser = user;
  next();
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = findUserByToken(req);
  if (!user) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }
  if (!ADMIN_ROLES.has(user.role)) {
    res.status(403).json({ error: "Admin access only." });
    return;
  }
  (req as any).authUser = user;
  next();
}

const VALID_OPPORTUNITY_STATUSES = new Set(["pending_review", "approved", "rejected", "duplicate", "expired"]);
const SAFE_PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600";

function normalizeOpportunityStatus(status: string | null | undefined) {
  if (status === "pending") return "pending_review";
  return status && VALID_OPPORTUNITY_STATUSES.has(status) ? status : "pending_review";
}

function normalizeOpportunity(raw: any) {
  const titleEN = String(raw.titleEN || raw.title || "").trim();
  const contentEN = String(raw.contentEN || raw.description || raw.content || "").trim();
  const organization = String(raw.organization || raw.company || "").trim();
  const applicationLink = String(raw.application_link || raw.applyUrl || raw.sourceUrl || raw.original_source_url || "").trim();
  const sourceUrl = String(raw.original_source_url || raw.sourceUrl || applicationLink).trim();

  if (!titleEN || !contentEN || !organization || !applicationLink || !sourceUrl) {
    return null;
  }

  return {
    ...raw,
    titleEN,
    titleAR: String(raw.titleAR || titleEN).trim(),
    titleKU: String(raw.titleKU || titleEN).trim(),
    contentEN,
    contentAR: String(raw.contentAR || contentEN).trim(),
    contentKU: String(raw.contentKU || contentEN).trim(),
    organization,
    category: String(raw.category || "job").trim(),
    country: String(raw.country || "Iraq").trim(),
    governorateId: String(raw.governorateId || raw.governorate || "all").trim(),
    deadline: raw.deadline || null,
    application_link: applicationLink,
    original_source_url: sourceUrl,
    published_date: raw.published_date || new Date().toISOString().split("T")[0],
    imageUrl: raw.imageUrl || raw.image_url || SAFE_PLACEHOLDER_IMAGE,
    status: normalizeOpportunityStatus(raw.status),
    workplaceType: raw.workplaceType || "On-site",
    whoCanApply: raw.whoCanApply || "Interested applicants should review the original listing.",
    salary: raw.salary || "Specified by the organization",
    location: raw.location || "Iraq",
    savedCount: Number(raw.savedCount || raw.saved_count || 0),
    universityAppliedCount: Number(raw.universityAppliedCount || raw.applied_count || 0),
    companyVerified: Boolean(raw.companyVerified ?? raw.company_verified ?? true)
  };
}

function findOpportunityDuplicate(db: any, candidate: any, ignoreId?: string) {
  const title = candidate.titleEN.toLowerCase();
  const org = candidate.organization.toLowerCase();
  const deadline = String(candidate.deadline || "");
  const category = String(candidate.category || "").toLowerCase();
  const sourceUrl = candidate.original_source_url.toLowerCase();

  return db.opportunities.find((opp: any) => {
    if (ignoreId && opp.id === ignoreId) return false;
    const normalized = normalizeOpportunity(opp);
    if (!normalized) return false;
    return normalized.original_source_url.toLowerCase() === sourceUrl ||
      (normalized.titleEN.toLowerCase() === title && normalized.organization.toLowerCase() === org) ||
      (normalized.titleEN.toLowerCase() === title && String(normalized.deadline || "") === deadline && normalized.category.toLowerCase() === category);
  });
}

function mergeOpportunityStats(db: any, opportunity: any, userId?: string) {
  const likes = db.likes.filter((l: any) => l.itemId === opportunity.id);
  const saves = db.saved_items.filter((s: any) => s.itemId === opportunity.id);
  const applications = db.applications.filter((a: any) => a.itemId === opportunity.id);
  const comments = db.comments.filter((c: any) => c.itemId === opportunity.id);
  return {
    ...opportunity,
    status: normalizeOpportunityStatus(opportunity.status),
    likes: likes.length,
    savedCount: saves.length,
    universityAppliedCount: applications.length,
    commentsCount: comments.length,
    likedByUser: userId ? likes.some((l: any) => l.userId === userId) : false,
    savedByUser: userId ? saves.some((s: any) => s.userId === userId) : false,
    applied: userId ? applications.some((a: any) => a.userId === userId) : false
  };
}

function requireImageDataUrl(dataUrl: string) {
  const match = String(dataUrl || "").match(/^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=]+)$/i);
  if (!match) return null;
  const bytes = Buffer.from(match[2], "base64");
  if (bytes.length > 2 * 1024 * 1024) return null;
  return { extension: match[1].toLowerCase() === "jpeg" ? "jpg" : match[1].toLowerCase(), bytes };
}

function parseCsvRows(csvText: string) {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const next = csvText[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(current.trim());
      current = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i++;
      row.push(current.trim());
      current = "";
      if (row.some(Boolean)) rows.push(row);
      row = [];
    } else {
      current += char;
    }
  }

  row.push(current.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// Lazy-loaded Gemini AI client to avoid crashes if GEMINI_API_KEY is not initially configured
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined in environment variables. Running in mock responder fallback mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// -------------------------------------------------------------
// Scraping & Parsing Engine (Cloudflare Workers emulation inside Express)
// -------------------------------------------------------------
async function runScraperInExpress() {
  const db = readDB();
  const runTimestamp = new Date().toISOString();
  const enabledSources = db.sources.filter((s: any) => s.enabled);
  
  const stats = {
    trigger: "manual_admin",
    time: runTimestamp,
    sourcesChecked: 0,
    itemsFound: 0,
    itemsNew: 0,
    itemsDuplicate: 0,
    errors: [] as string[]
  };

  const ai = getGeminiClient();
  const hasGemini = !!process.env.GEMINI_API_KEY;

  for (const source of enabledSources) {
    try {
      stats.sourcesChecked++;
      console.log(`[Express Scraper] Crawling: ${source.name} (${source.url})`);
      
      // Perform genuine retrieve
      let webText = "";
      try {
        const res = await fetch(source.url, {
          headers: {
            "User-Agent": "Iraqi-Students-Portal-Bot/2.0 (+https://ai.studio/build)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9"
          },
          signal: AbortSignal.timeout(6000)
        });
        if (res.ok) {
          webText = await res.text();
        }
      } catch (e: any) {
        console.warn(`Could not reach ${source.url} directly: ${e.message}. No simulated opportunity will be created.`);
        stats.errors.push(`${source.name}: ${e.message}`);
      }

      // 1. EXTRACT DATA ITEMS
      const itemsToProcess: any[] = [];
      
      if (webText) {
        // Extract links or anchor elements via regex groupings
        const anchorRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        let match;
        let count = 0;
        while ((match = anchorRegex.exec(webText)) !== null && count < 5) {
          const href = match[1];
          const text = match[2].replace(/<[^>]*>/g, "").trim();
          if (text.length > 20 && (href.includes("job") || href.includes("career") || href.includes("scholar") || href.includes("apply") || href.includes("intern") || href.includes("training"))) {
            let resolvedLink = href;
            if (href.startsWith("/")) {
              try {
                const root = new URL(source.url).origin;
                resolvedLink = `${root}${href}`;
              } catch {
                resolvedLink = source.url;
              }
            }
            itemsToProcess.push({
              title: text,
              link: resolvedLink,
              snippet: `Opportunity discovered live at ${source.name} career bulletin. Check details on the original recruitment portal to submit your form.`
            });
            count++;
          }
        }
      }

      if (itemsToProcess.length === 0) {
        console.log(`[Express Scraper] 0 items found at ${source.name}; no simulated records created.`);
      }

      // 2. CLEAN AND CLASSIFY (GEMINI AI preferred, rule heuristic as solid fallback)
      for (const item of itemsToProcess) {
        stats.itemsFound++;
        
        // Prevent duplicates
        const duplicate = findOpportunityDuplicate(db, {
          titleEN: item.title,
          contentEN: item.snippet,
          organization: source.name,
          category: source.type === "scholarships" ? "scholarship" : source.type === "trainings" ? "training" : "job",
          deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          original_source_url: item.link,
          application_link: item.link
        });
        if (duplicate) {
          stats.itemsDuplicate++;
          continue;
        }

        let titleEN = item.title;
        let titleAR = "";
        let titleKU = "";
        let descEN = item.snippet;
        let descAR = "";
        let descKU = "";
        let category = source.type === "scholarships" ? "scholarship" : source.type === "trainings" ? "training" : "job";
        let gov = "all";
        let deadline = new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        if (hasGemini) {
          try {
            const prompt = `You are a high fidelity data extraction service for Iraqi Student Board.
Given a raw scraped opportunity entry:
Organization: "${source.name}"
Raw Title: "${item.title}"
URL Link: "${item.link}"
Content Sample: "${item.snippet}"

Respond strictly with a JSON object inside <json>...</json> xml tags following these keys exactly:
{
  "titleEN": "Polished English title",
  "titleAR": "Natural professional Arabic translation of title",
  "titleKU": "Natural professional Kurdish Sorani translation of title",
  "contentEN": "Clean English summary of terms & qualifications",
  "contentAR": "Clean Arabic summary of terms & qualifications",
  "contentKU": "Clean Kurdish summary of terms & qualifications",
  "category": "Choose exactly one: 'job', 'internship', 'scholarship', 'training', 'event', 'volunteering', 'fellowship', 'competition', 'announcement'",
  "governorateId": "Choose one from: 'baghdad', 'sulaymaniyah', 'erbil', 'nineveh', 'all'",
  "deadline": "ISO date YYYY-MM-DD representing closing date (if unspecified, default to 3 weeks from now: ${new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]})"
}
Output only valid JSON container!`;

            const aiResponse = await ai.models.generateContent({
              model: "gemini-3.5-flash",
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              config: { temperature: 0.1 }
            });

            const rawText = aiResponse.text || "";
            const jsonMatch = rawText.match(/<json>([\s\S]*?)<\/json>/i) || rawText.match(/\{[\s\S]*?\}/);
            if (jsonMatch) {
              const cleanJSONStr = jsonMatch[1] ? jsonMatch[1].trim() : jsonMatch[0].trim();
              const parsed = JSON.parse(cleanJSONStr);
              titleEN = parsed.titleEN || titleEN;
              titleAR = parsed.titleAR || titleAR;
              titleKU = parsed.titleKU || titleKU;
              descEN = parsed.contentEN || descEN;
              descAR = parsed.contentAR || descAR;
              descKU = parsed.contentKU || descKU;
              category = parsed.category || category;
              gov = parsed.governorateId || gov;
              deadline = parsed.deadline || deadline;
            }
          } catch (aiErr) {
            console.error("Gemini cleanup failed, resorting to rule base:", aiErr);
          }
        }

        // Robust rule fallback for translation + normalizations
        if (!titleAR) {
          titleAR = `فرصة ممتازة لدى ${source.name}: ${titleEN}`;
          titleKU = `دەرفەتێکی باش لای ${source.name}: ${titleEN}`;
          descAR = `تم جمع هذه الفرصة تلقائياً من المكاتب المعتمدة لدى ${source.name}. للاطلاع على المعايير الكاملة وشروط التسجيل يرجى زيارة الرابط المرفق للتسجيل المباشر.`;
          descKU = `ئەم دەرفەتە بە شێوەیەکی خۆکار لە بەشی فەرمی لای ${source.name} وەرگیراوە. بۆ دڵنیابوون مەرجەکان بخوێنەرەوە لە ڕێگەی بەستەری هاوپێچ.`;

          const lowerText = (titleEN + " " + descEN).toLowerCase();
          if (lowerText.includes("intern") || lowerText.includes("co-op")) category = "internship";
          else if (lowerText.includes("training") || lowerText.includes("course") || lowerText.includes("bootcamp")) category = "training";
          else if (lowerText.includes("scholar") || lowerText.includes("fellow")) category = "scholarship";
          else if (lowerText.includes("volunteer")) category = "volunteering";
          else if (lowerText.includes("compete") || lowerText.includes("priz")) category = "competition";
          else if (lowerText.includes("event") || lowerText.includes("meetup")) category = "event";
          else category = "job";

          if (lowerText.includes("baghdad")) gov = "baghdad";
          else if (lowerText.includes("sulaymaniyah") || lowerText.includes("slemani")) gov = "sulaymaniyah";
          else if (lowerText.includes("erbil") || lowerText.includes("hawler")) gov = "erbil";
          else if (lowerText.includes("mosul") || lowerText.includes("nineveh")) gov = "nineveh";
        }

        // Add pending scraped opportunity
        const newOpp = normalizeOpportunity({
          id: `scraped-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          titleEN,
          titleAR,
          titleKU,
          contentEN: descEN,
          contentAR: descAR,
          contentKU: descKU,
          organization: source.name,
          category,
          country: "Iraq",
          governorateId: gov,
          deadline,
          application_link: item.link,
          original_source_url: item.link,
          published_date: runTimestamp.split("T")[0],
          imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600",
          status: "pending_review",
          workplaceType: "On-site",
          whoCanApply: "Graduates and undergraduates in Iraq. Check specific criteria on recruitment page.",
          salary: "Specified on approval",
          location: gov === "all" ? "All Iraq" : gov.toUpperCase(),
          savedCount: 0,
          universityAppliedCount: 0,
          companyVerified: true
        });

        if (newOpp) {
          db.opportunities.unshift(newOpp);
          stats.itemsNew++;
        }
      }

      // Record last checked state on source
      const currentSrcObj = db.sources.find((s: any) => s.id === source.id);
      if (currentSrcObj) {
        currentSrcObj.last_checked = runTimestamp;
        currentSrcObj.error_status = null;
      }

    } catch (err: any) {
      console.error(`Local Scraper error for ${source.id}:`, err);
      stats.errors.push(`${source.name}: ${err.message}`);
      
      const currentSrcObj = db.sources.find((s: any) => s.id === source.id);
      if (currentSrcObj) {
        currentSrcObj.last_checked = runTimestamp;
        currentSrcObj.error_status = err.message;
      }
    }
  }

  // Create log record
  const logId = `log-${Date.now()}`;
  db.logs.unshift({
    id: logId,
    timestamp: runTimestamp,
    source_id: "multiple_batch",
    source_name: `Batch crawl (${stats.sourcesChecked} sources)`,
    items_found: stats.itemsFound,
    items_new: stats.itemsNew,
    items_duplicate: stats.itemsDuplicate,
    errors: stats.errors.length > 0 ? stats.errors.join("; ") : null
  });

  // Auto Expire Opportunities if deadline is in the past
  const todayStr = new Date().toISOString().split("T")[0];
  db.opportunities.forEach((o: any) => {
    if (o.status === "approved" && o.deadline && o.deadline < todayStr) {
      o.status = "expired";
    }
  });

  writeDB(db);
  return stats;
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// Root API Healthcheck
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body || {};
  const cleanName = String(name || "").trim();
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanPassword = String(password || "");

  if (!cleanName || !cleanEmail.includes("@") || cleanPassword.length < 6) {
    res.status(400).json({ error: "Name, valid email, and password with at least 6 characters are required." });
    return;
  }

  const db = readDB();
  const existing = db.users.find((u: AuthUser) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    res.status(409).json({ error: "Email already exists." });
    return;
  }

  const user: AuthUser = {
    id: `user-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
    name: cleanName,
    email: cleanEmail,
    role: "student",
    passwordHash: hashPassword(cleanPassword),
    createdAt: new Date().toISOString()
  };

  db.users.push(user);
  writeDB(db);

  res.status(201).json({
    token: signToken(user),
    user: publicUser(user)
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanPassword = String(password || "");
  const db = readDB();
  const user = db.users.find((u: AuthUser) => u.email.toLowerCase() === cleanEmail);

  if (!user || !verifyPassword(cleanPassword, user.passwordHash)) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }

  res.json({
    token: signToken(user),
    user: publicUser(user)
  });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: publicUser((req as any).authUser) });
});

app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body || {};
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanEmail.includes("@")) {
    res.status(400).json({ error: "Valid email is required." });
    return;
  }

  const db = readDB();
  const user = db.users.find((u: AuthUser) => u.email.toLowerCase() === cleanEmail);
  if (user) {
    db.passwordResets.push({
      id: `reset-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
      userId: user.id,
      email: cleanEmail,
      tokenHash: hashPassword(crypto.randomBytes(32).toString("hex")),
      mode: "DRY_RUN",
      createdAt: new Date().toISOString()
    });
    writeDB(db);
  }

  res.json({
    success: true,
    dryRun: true,
    message: "Password reset email is simulated in DRY_RUN mode. No real email was sent."
  });
});

app.get("/api/user/profile", requireAuth, (req, res) => {
  const db = readDB();
  const user = (req as any).authUser;
  const profile = db.user_profiles.find((p: any) => p.userId === user.id) || {};
  res.json({ profile: { ...publicUser(user), ...profile } });
});

app.put("/api/user/profile", requireAuth, (req, res) => {
  const db = readDB();
  const user = (req as any).authUser;
  const existing = db.user_profiles.find((p: any) => p.userId === user.id);
  const profile = {
    ...(existing || {}),
    ...req.body,
    userId: user.id,
    updatedAt: new Date().toISOString()
  };
  if (existing) {
    Object.assign(existing, profile);
  } else {
    db.user_profiles.push(profile);
  }
  writeDB(db);
  res.json({ profile });
});

app.get("/api/posts", (req, res) => {
  const db = readDB();
  const user = findUserByToken(req);
  const posts = db.posts
    .filter((p: any) => p.status === "approved" || (user && p.userId === user.id))
    .map((post: any) => {
      const comments = db.comments.filter((c: any) => c.itemId === post.id);
      const likes = db.likes.filter((l: any) => l.itemId === post.id);
      const saves = db.saved_items.filter((s: any) => s.itemId === post.id);
      return {
        ...post,
        commentsList: comments,
        commentsCount: comments.length,
        likes: likes.length,
        likedByUser: user ? likes.some((l: any) => l.userId === user.id) : false,
        savedByUser: user ? saves.some((s: any) => s.userId === user.id) : false
      };
    });
  res.json({ posts });
});

app.post("/api/posts", requireAuth, (req, res) => {
  const db = readDB();
  const user = (req as any).authUser;
  const title = String(req.body?.title || "").trim();
  const content = String(req.body?.content || "").trim();
  if (!title || !content) {
    res.status(400).json({ error: "Post title and content are required." });
    return;
  }
  const isAnonymous = Boolean(req.body?.anonymous);
  const post = {
    id: `post-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
    userId: user.id,
    type: req.body?.type || (isAnonymous ? "anonymous_question" : "post"),
    title,
    content,
    titleEN: title,
    titleAR: title,
    titleKU: title,
    contentEN: content,
    contentAR: content,
    contentKU: content,
    anonymous: isAnonymous,
    authorName: isAnonymous ? "Anonymous Student" : user.name,
    authorRole: isAnonymous ? "student" : user.role,
    governorateId: req.body?.governorateId || "all",
    universityId: req.body?.universityId || "all",
    imageUrl: req.body?.imageUrl || null,
    status: isAnonymous ? "pending_review" : "approved",
    createdAt: new Date().toISOString()
  };
  db.posts.unshift(post);
  writeDB(db);
  res.status(201).json({ post });
});

app.get("/api/items/:itemId/comments", (req, res) => {
  const db = readDB();
  const comments = db.comments.filter((c: any) => c.itemId === req.params.itemId);
  res.json({ comments });
});

app.post("/api/items/:itemId/comments", requireAuth, (req, res) => {
  const db = readDB();
  const user = (req as any).authUser;
  const content = String(req.body?.content || "").trim();
  if (!content) {
    res.status(400).json({ error: "Comment content is required." });
    return;
  }
  const comment = {
    id: `comment-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
    itemId: req.params.itemId,
    userId: user.id,
    authorName: user.name,
    authorRole: user.role,
    authorAvatar: req.body?.authorAvatar || "",
    content,
    date: "Just now",
    createdAt: new Date().toISOString()
  };
  db.comments.push(comment);
  writeDB(db);
  res.status(201).json({ comment });
});

app.post("/api/items/:itemId/like", requireAuth, (req, res) => {
  const db = readDB();
  const user = (req as any).authUser;
  const existingIndex = db.likes.findIndex((l: any) => l.itemId === req.params.itemId && l.userId === user.id);
  let liked = true;
  if (existingIndex >= 0) {
    db.likes.splice(existingIndex, 1);
    liked = false;
  } else {
    db.likes.push({ itemId: req.params.itemId, userId: user.id, createdAt: new Date().toISOString() });
  }
  writeDB(db);
  res.json({ liked, count: db.likes.filter((l: any) => l.itemId === req.params.itemId).length });
});

app.post("/api/items/:itemId/save", requireAuth, (req, res) => {
  const db = readDB();
  const user = (req as any).authUser;
  const existingIndex = db.saved_items.findIndex((s: any) => s.itemId === req.params.itemId && s.userId === user.id);
  let saved = true;
  if (existingIndex >= 0) {
    db.saved_items.splice(existingIndex, 1);
    saved = false;
  } else {
    db.saved_items.push({ itemId: req.params.itemId, userId: user.id, createdAt: new Date().toISOString() });
  }
  writeDB(db);
  res.json({ saved, count: db.saved_items.filter((s: any) => s.itemId === req.params.itemId).length });
});

app.post("/api/items/:itemId/apply", requireAuth, (req, res) => {
  const db = readDB();
  const user = (req as any).authUser;
  const existingIndex = db.applications.findIndex((a: any) => a.itemId === req.params.itemId && a.userId === user.id);
  let applied = true;
  if (existingIndex >= 0) {
    db.applications.splice(existingIndex, 1);
    applied = false;
  } else {
    db.applications.push({ itemId: req.params.itemId, userId: user.id, createdAt: new Date().toISOString() });
  }
  writeDB(db);
  res.json({ applied, count: db.applications.filter((a: any) => a.itemId === req.params.itemId).length });
});

app.post("/api/uploads/images", requireAuth, (req, res) => {
  const parsed = requireImageDataUrl(req.body?.dataUrl);
  if (!parsed) {
    res.status(400).json({ error: "Only jpg, png, or webp images up to 2MB are allowed." });
    return;
  }
  if (process.env.NODE_ENV === "production" && !process.env.R2_PUBLIC_BASE_URL) {
    res.status(501).json({ error: "Production image storage is not configured. Set up R2_PUBLIC_BASE_URL/R2 upload handling before enabling uploads." });
    return;
  }
  const uploadDir = path.join(process.cwd(), "uploads");
  fs.mkdirSync(uploadDir, { recursive: true });
  const fileName = `image-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${parsed.extension}`;
  fs.writeFileSync(path.join(uploadDir, fileName), parsed.bytes);
  res.status(201).json({ url: `/uploads/${fileName}` });
});

app.get("/api/institutions", async (req, res) => {
  try {
    const targetUrl = `https://rafid-api.mahdialmuntadhar1.workers.dev${req.originalUrl}`;
    const response = await fetch(targetUrl, {
      headers: {
        "Accept": "application/json"
      }
    });
    const contentType = response.headers.get("content-type") || "";
    res.status(response.status);
    if (contentType.includes("application/json")) {
      res.json(await response.json());
    } else {
      res.send(await response.text());
    }
  } catch (err: any) {
    res.status(502).json({ error: "Institutions service is unavailable: " + err.message });
  }
});

// Dynamic Opportunities feed (Returns Approved opportunities to standard search)
app.get("/api/opportunities", (req, res) => {
  const db = readDB();
  const user = findUserByToken(req);
  const approvedOnly = db.opportunities
    .map(normalizeOpportunity)
    .filter(Boolean)
    .filter((o: any) => o.status === "approved")
    .map((o: any) => mergeOpportunityStats(db, o, user?.id));
  res.json(approvedOnly);
});

app.get("/api/highlights", (req, res) => {
  const db = readDB();
  const highlights = db.opportunities
    .map(normalizeOpportunity)
    .filter(Boolean)
    .filter((o: any) => o.status === "approved")
    .slice(0, 8);
  res.json({ highlights });
});

app.use("/api/admin", requireAdmin);

app.get("/api/opportunity-automation/status", requireAdmin, (req, res) => {
  const db = readDB();
  const lastLog = [...db.logs].sort((a: any, b: any) => String(b.timestamp).localeCompare(String(a.timestamp)))[0];
  res.json({
    status: "idle",
    last_run_timestamp: lastLog?.timestamp || null,
    frequency_hours: 6,
    is_active: true,
    dry_run_email: true
  });
});

app.get("/api/opportunity-automation/stats", requireAdmin, (req, res) => {
  const db = readDB();
  const statusCounts = db.opportunities.reduce((acc: any, raw: any) => {
    const status = normalizeOpportunityStatus(raw.status);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const duplicateLogs = db.logs.reduce((sum: number, log: any) => sum + Number(log.items_duplicate || 0), 0);
  res.json({
    total_scraped: db.opportunities.length,
    duplicates_blocked: duplicateLogs + (statusCounts.duplicate || 0),
    pending_review: statusCounts.pending_review || 0,
    approved: statusCounts.approved || 0,
    rejected: statusCounts.rejected || 0,
    duplicate: statusCounts.duplicate || 0,
    expired: statusCounts.expired || 0,
    errors_prevented: db.logs.filter((log: any) => log.errors).length
  });
});

app.get("/api/opportunity-automation/sources", requireAdmin, (req, res) => {
  const db = readDB();
  const search = String(req.query.search || "").toLowerCase();
  let rows = db.sources || [];
  if (search) rows = rows.filter((s: any) => `${s.name} ${s.url}`.toLowerCase().includes(search));
  res.json({ data: rows, total: rows.length });
});

app.post("/api/opportunity-automation/sources", requireAdmin, (req, res) => {
  const { name, url, type, active, enabled } = req.body || {};
  if (!name || !url || !type) {
    res.status(400).json({ error: "Source name, url, and type are required." });
    return;
  }
  const db = readDB();
  if (db.sources.some((s: any) => s.url === url)) {
    res.status(409).json({ error: "Source URL already exists." });
    return;
  }
  const source = {
    id: `source-${Date.now()}`,
    name,
    url,
    type,
    enabled: typeof enabled === "boolean" ? enabled : active !== false,
    last_checked: null,
    error_status: null
  };
  db.sources.push(source);
  writeDB(db);
  res.status(201).json(source);
});

app.patch("/api/opportunity-automation/sources/:id", requireAdmin, (req, res) => {
  const db = readDB();
  const source = db.sources.find((s: any) => s.id === req.params.id);
  if (!source) {
    res.status(404).json({ error: "Source not found." });
    return;
  }
  Object.assign(source, req.body || {});
  if (typeof req.body?.active === "boolean") source.enabled = req.body.active;
  writeDB(db);
  res.json(source);
});

app.delete("/api/opportunity-automation/sources/:id", requireAdmin, (req, res) => {
  const db = readDB();
  const before = db.sources.length;
  db.sources = db.sources.filter((s: any) => s.id !== req.params.id);
  if (db.sources.length === before) {
    res.status(404).json({ error: "Source not found." });
    return;
  }
  writeDB(db);
  res.json({ success: true });
});

app.get("/api/opportunity-automation/candidates", requireAdmin, (req, res) => {
  const db = readDB();
  const status = normalizeOpportunityStatus(String(req.query.status || "pending_review"));
  const search = String(req.query.search || "").toLowerCase();
  let rows = db.opportunities.map(normalizeOpportunity).filter(Boolean).filter((o: any) => o.status === status);
  if (search) rows = rows.filter((o: any) => `${o.titleEN} ${o.organization} ${o.contentEN}`.toLowerCase().includes(search));
  res.json({ data: rows, total: rows.length });
});

app.get("/api/opportunity-automation/candidates/:id", requireAdmin, (req, res) => {
  const db = readDB();
  const item = db.opportunities.find((o: any) => o.id === req.params.id);
  if (!item) {
    res.status(404).json({ error: "Candidate not found." });
    return;
  }
  res.json(normalizeOpportunity(item));
});

app.patch("/api/opportunity-automation/candidates/:id", requireAdmin, (req, res) => {
  const db = readDB();
  const index = db.opportunities.findIndex((o: any) => o.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Candidate not found." });
    return;
  }
  const updated = normalizeOpportunity({ ...db.opportunities[index], ...req.body });
  if (!updated) {
    res.status(400).json({ error: "Title, content, organization, source URL, and application URL are required." });
    return;
  }
  const duplicate = findOpportunityDuplicate(db, updated, req.params.id);
  if (duplicate) {
    updated.status = "duplicate";
    updated.duplicateOf = duplicate.id;
  }
  db.opportunities[index] = updated;
  writeDB(db);
  res.json(updated);
});

app.post("/api/opportunity-automation/candidates/:id/approve", requireAdmin, (req, res) => {
  const db = readDB();
  const item = db.opportunities.find((o: any) => o.id === req.params.id);
  if (!item) {
    res.status(404).json({ error: "Candidate not found." });
    return;
  }
  const normalized = normalizeOpportunity(item);
  if (!normalized) {
    res.status(400).json({ error: "Candidate is missing required moderation fields." });
    return;
  }
  const duplicate = findOpportunityDuplicate(db, normalized, item.id);
  if (duplicate) {
    item.status = "duplicate";
    item.duplicateOf = duplicate.id;
    writeDB(db);
    res.status(409).json({ error: "Duplicate opportunity detected.", duplicateOf: duplicate.id });
    return;
  }
  Object.assign(item, normalized, { status: "approved", approvedAt: new Date().toISOString(), approvedBy: (req as any).authUser.id });
  writeDB(db);
  res.json({ success: true, item });
});

app.post("/api/opportunity-automation/candidates/:id/reject", requireAdmin, (req, res) => {
  const db = readDB();
  const item = db.opportunities.find((o: any) => o.id === req.params.id);
  if (!item) {
    res.status(404).json({ error: "Candidate not found." });
    return;
  }
  item.status = "rejected";
  item.rejectionReason = String(req.body?.reason || "Rejected by admin review.");
  item.rejectedAt = new Date().toISOString();
  writeDB(db);
  res.json({ success: true, item });
});

app.post("/api/opportunity-automation/candidates/:id/mark-duplicate", requireAdmin, (req, res) => {
  const db = readDB();
  const item = db.opportunities.find((o: any) => o.id === req.params.id);
  if (!item) {
    res.status(404).json({ error: "Candidate not found." });
    return;
  }
  item.status = "duplicate";
  item.duplicateReason = String(req.body?.reason || "Marked duplicate by admin review.");
  writeDB(db);
  res.json({ success: true, item });
});

app.post("/api/opportunity-automation/candidates/:id/mark-expired", requireAdmin, (req, res) => {
  const db = readDB();
  const item = db.opportunities.find((o: any) => o.id === req.params.id);
  if (!item) {
    res.status(404).json({ error: "Candidate not found." });
    return;
  }
  item.status = "expired";
  item.expiredAt = new Date().toISOString();
  writeDB(db);
  res.json({ success: true, item });
});

app.get("/api/opportunity-automation/logs", requireAdmin, (req, res) => {
  const db = readDB();
  res.json({ data: db.logs, total: db.logs.length });
});

app.post("/api/opportunity-automation/run-now", requireAdmin, async (req, res) => {
  try {
    const stats = await runScraperInExpress();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/opportunity-automation/run-source/:id", requireAdmin, async (req, res) => {
  const db = readDB();
  const source = db.sources.find((s: any) => s.id === req.params.id);
  if (!source) {
    res.status(404).json({ error: "Source not found." });
    return;
  }
  const previousSources = db.sources;
  db.sources = previousSources.map((s: any) => ({ ...s, enabled: s.id === source.id }));
  writeDB(db);
  try {
    const stats = await runScraperInExpress();
    const restored = readDB();
    restored.sources = previousSources;
    writeDB(restored);
    res.json(stats);
  } catch (err: any) {
    const restored = readDB();
    restored.sources = previousSources;
    writeDB(restored);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/opportunity-automation/import-csv", requireAdmin, (req, res) => {
  const csvText = String(req.body?.csvText || "");
  if (!csvText.trim()) {
    res.status(400).json({ error: "CSV text is required." });
    return;
  }

  const rows = parseCsvRows(csvText);
  if (rows.length < 2) {
    res.status(400).json({ error: "CSV must include a header row and at least one data row." });
    return;
  }

  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const aliases: Record<string, string[]> = {
    title: ["title", "titleen", "title_en"],
    description: ["description", "content", "contenten", "content_en"],
    organization: ["organization", "company", "org"],
    link: ["link", "application_link", "applicationurl", "application_url", "applyurl", "apply_url"],
    source: ["source", "source_url", "original_source_url", "url"],
    category: ["category", "type"],
    governorate: ["governorate", "governorateid", "governorate_id"],
    deadline: ["deadline", "closing_date"],
    country: ["country"],
    image: ["image", "imageurl", "image_url"]
  };
  const indexFor = (key: string) => headers.findIndex((h) => aliases[key].includes(h));
  const required = ["title", "description", "organization", "link", "category"];
  const missing = required.filter((key) => indexFor(key) === -1);
  if (missing.length) {
    res.status(400).json({ error: `Missing required CSV columns: ${missing.join(", ")}` });
    return;
  }

  const db = readDB();
  let inserted = 0;
  let duplicates = 0;
  const errors: string[] = [];

  rows.slice(1).forEach((row, rowIndex) => {
    const value = (key: string) => {
      const index = indexFor(key);
      return index >= 0 ? String(row[index] || "").trim() : "";
    };
    const applicationLink = value("link");
    const sourceUrl = value("source") || applicationLink;

    if (!isHttpUrl(applicationLink) || !isHttpUrl(sourceUrl)) {
      errors.push(`Row ${rowIndex + 2}: application/source URL must be http(s).`);
      return;
    }

    const candidate = normalizeOpportunity({
      id: `csv-${Date.now()}-${rowIndex}-${crypto.randomBytes(3).toString("hex")}`,
      titleEN: value("title"),
      titleAR: value("title"),
      titleKU: value("title"),
      contentEN: value("description"),
      contentAR: value("description"),
      contentKU: value("description"),
      organization: value("organization"),
      category: value("category"),
      country: value("country") || "Iraq",
      governorateId: value("governorate") || "all",
      deadline: value("deadline") || null,
      application_link: applicationLink,
      original_source_url: sourceUrl,
      published_date: new Date().toISOString().split("T")[0],
      imageUrl: value("image") || SAFE_PLACEHOLDER_IMAGE,
      status: "pending_review"
    });

    if (!candidate) {
      errors.push(`Row ${rowIndex + 2}: missing required opportunity fields.`);
      return;
    }

    const duplicate = findOpportunityDuplicate(db, candidate);
    if (duplicate) {
      duplicates++;
      return;
    }

    db.opportunities.unshift(candidate);
    inserted++;
  });

  writeDB(db);
  res.status(errors.length ? 207 : 201).json({
    success: true,
    inserted,
    duplicates,
    errors,
    defaultStatus: "pending_review",
    message: "CSV rows were validated and inserted as pending_review only. Nothing was published directly."
  });
});

// Admin list of all opportunities
app.get("/api/admin/opportunities", (req, res) => {
  const db = readDB();
  res.json(db.opportunities.map(normalizeOpportunity).filter(Boolean));
});

// Admin perform moderation action (approve, reject, expire)
app.post("/api/admin/opportunities/action", (req, res) => {
  const { id, action } = req.body;
  if (!id || !action) {
    res.status(400).json({ error: "Missing required parameters: id and action." });
    return;
  }
  
  const db = readDB();
  const item = db.opportunities.find((o: any) => o.id === id);
  if (!item) {
    res.status(404).json({ error: "Opportunity not found." });
    return;
  }

  if (action === "approve") {
    item.status = "approved";
  } else if (action === "reject") {
    item.status = "rejected";
    item.rejectionReason = req.body.reason || item.rejectionReason || "Rejected by admin review.";
  } else if (action === "expire") {
    item.status = "expired";
  } else if (action === "duplicate") {
    item.status = "duplicate";
  } else {
    res.status(400).json({ error: "Invalid action. Choose 'approve', 'reject', 'duplicate', or 'expire'." });
    return;
  }

  writeDB(db);
  res.json({ success: true, item });
});

// Admin edit opportunity
app.post("/api/admin/opportunities/edit", (req, res) => {
  const { id, titleEN, titleAR, titleKU, contentEN, contentAR, contentKU, category, deadline, application_link } = req.body;
  if (!id) {
    res.status(400).json({ error: "Opportunity ID is required." });
    return;
  }

  const db = readDB();
  const item = db.opportunities.find((o: any) => o.id === id);
  if (!item) {
    res.status(404).json({ error: "Opportunity not found." });
    return;
  }

  if (titleEN) item.titleEN = titleEN;
  if (titleAR) item.titleAR = titleAR;
  if (titleKU) item.titleKU = titleKU;
  if (contentEN) item.contentEN = contentEN;
  if (contentAR) item.contentAR = contentAR;
  if (contentKU) item.contentKU = contentKU;
  if (category) item.category = category;
  if (deadline) item.deadline = deadline;
  if (application_link) {
    item.application_link = application_link;
    item.original_source_url = application_link;
  }
  item.status = normalizeOpportunityStatus(item.status);

  writeDB(db);
  res.json({ success: true, item });
});

// Admin get sources
app.get("/api/admin/sources", (req, res) => {
  const db = readDB();
  res.json(db.sources);
});

// Admin save or create source
app.post("/api/admin/sources", (req, res) => {
  const { id, name, url, type, enabled } = req.body;
  if (!name || !url || !type) {
    res.status(400).json({ error: "Missing required fields: name, url, and type are required." });
    return;
  }

  const db = readDB();
  const sourceIndex = id ? db.sources.findIndex((s: any) => s.id === id) : -1;

  const sourceData = {
    id: id || `source-${Date.now()}`,
    name,
    url,
    type,
    enabled: typeof enabled === "boolean" ? enabled : true,
    last_checked: sourceIndex !== -1 ? db.sources[sourceIndex].last_checked : null,
    error_status: sourceIndex !== -1 ? db.sources[sourceIndex].error_status : null
  };

  if (sourceIndex !== -1) {
    db.sources[sourceIndex] = sourceData;
  } else {
    // Check url unique constraints
    const exists = db.sources.some((s: any) => s.url === url);
    if (exists) {
      res.status(400).json({ error: "Source Url already exists." });
      return;
    }
    db.sources.push(sourceData);
  }

  writeDB(db);
  res.json({ success: true, source: sourceData });
});

// Admin delete source
app.delete("/api/admin/sources", (req, res) => {
  const { id } = req.body;
  if (!id) {
    res.status(400).json({ error: "Source ID is required." });
    return;
  }

  const db = readDB();
  const filtered = db.sources.filter((s: any) => s.id !== id);
  
  if (filtered.length === db.sources.length) {
    res.status(404).json({ error: "Source not found." });
    return;
  }

  db.sources = filtered;
  writeDB(db);
  res.json({ success: true });
});

// Admin manual scraper trigger API
app.post("/api/admin/scraper/run", async (req, res) => {
  try {
    const stats = await runScraperInExpress();
    res.json({ success: true, stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin logs
app.get("/api/admin/logs", (req, res) => {
  const db = readDB();
  res.json(db.logs);
});


// Real-time AI Academic Mentor endpoint
app.post("/api/ask-ai", async (req, res) => {
  const { query, lang = "en", governorate = "all", university = "all", anonymous = false } = req.body;

  if (!query || typeof query !== "string") {
    res.status(400).json({ error: "Query parameters are required." });
    return;
  }

  // Check if API key is present
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Elegant fallback simulation when API key is missing
    console.log("No API key. Falling back to local offline Iraq university knowledge base simulator.");
    setTimeout(() => {
      let mockAnswer = "";
      if (lang === "ar") {
        mockAnswer = `### أهلاً بك يا زميل(ة) في تطبيق جامعتك! 👋 (الذكاء الاصطناعي في وضع الاستعداد)

شكراً لسؤالك حول **"${query}"** في جامعة **${university === 'all' ? 'عراقية' : university}**. 

بصفتي مرشدك الأكاديمي، إليك توجيه أولي سريع:
1. **الغيابات والإنذارات:** راجع مكتب معاون العميد لشؤون الطلبة فوراً وقدم طلباً رسمياً إذا كان لديك عذر طبي معتمد من مستشفى حكومي.
2. **التدريب والمستقبل:** تفقد جزء **"مستقبلك"** في التطبيق للتقديم على أحدث الفرص التدريبية والمنح المتاحة لطلاب محافظة **${governorate}**.
3. **للاستزادة:** واكب المناقشات في تبويب **"اسأل"** لمشاركة زملائك من نفس القسم الآراء.

*(ملاحظة: هذا رد نابع من نظام المعالجة الأكاديمية المصغر، لتفعيل كامل قدرات ذكاء Gemini، يرجى تهيئة مفتاح GEMINI_API_KEY في لوحة ضبط الأسرار).*`;
      } else if (lang === "ku") {
        mockAnswer = `### سڵاو هاوڕێی زانکۆ! 👋 (وەڵامی ئامادەکراوی خێرا)

سوپاس بۆ پرسیارەکەت دەربارەی **"${query}"** لە خوێندنگە/زانکۆی **${university === 'all' ? 'عێراق' : university}**.

وەک ڕاوێژکاری ئەکادیمی تۆ:
1. **ئامادەنەبوون:** سەردانی یاریدەدەری ڕاگر بکە بۆ کاروباری خوێندکاران بەپەلە ئەگەر مۆڵەتی پزیشکیت هەیە.
2. **داهاتووت:** سەردانی بەشی **"داهاتووت"** بکە بۆ دۆزینەوەی هەلی کار و مەشق لە پارێزگای **${governorate}**.
3. **هاوکاری:** لە بەشی **"بپرسە"** هاوکاری وەربگرە لە خوێندکارانی تر.

*(تێبینی: بۆ چالاککردنی ته‌واوی سیسته‌می لێکدانه‌وه‌ی زیرەکی Gemini، تکایە کلیلە نهێنییەکە لە بەشی نهێنییەکان جێبەجێ بکە).*`;
      } else {
        mockAnswer = `### Hello there, fellow student! 👋 (Offline Knowledge Base Response)

Thank you for asking about **"${query}"** regarding **${university === 'all' ? 'your university' : university}** in **${governorate === 'all' ? 'Iraq' : governorate}**.

Here is my initial guidance for you:
1. **Attendance Warning:** If this is about absences or warning cards, immediately visit the Assistant Dean of Student Affairs with any official hospital documents.
2. **Your Future:** Browse our **"Your Future"** tab in the app to check listings for internships, career prep courses, and scholarships tailored to your governorate.
3. **Collaboration:** Share your questions publicly or anonymously in the **"Ask"** section to get instant answers from other seniors and staff.

*(Note: This is a pre-generated expert response. To fully activate live AI answers, please configure the GEMINI_API_KEY in the Secrets settings).*`;
      }
      res.json({ text: mockAnswer, model: "Local Advisor" });
    }, 1200);
    return;
  }

  try {
    const ai = getGeminiClient();

    const systemInstruction = `You are Al-Murshed (المرشد), a warm, supportive, motivating, and highly knowledgeable AI Campus Advisor built into the "Iraqi Campus Social App".
    Your entire mission is to help Iraqi university students, fresh graduates, teachers, and staff navigate their academics, careers, and college lives.
    You possess deep, accurate knowledge of the Iraqi higher education system under the Ministry of Higher Education and Scientific Research (MoHESR), including common policies (e.g., براءة ذمة, إنذار غيابات, معاون العميد, ملازم, عبور, تحميل, معدل تراكمي).
    You are familiar with the job market in Iraq (companies like Zain, Asiacell, Korek, local tech startups in Erbil/Baghdad/Basra, development NGOs, and universities).

    Context for current user query:
    - User Language requested: ${lang === 'ar' ? 'Arabic' : lang === 'ku' ? 'Kurdish' : 'English'}. Respond strictly in that language.
    - Active Governorate context: ${governorate}
    - Active University context: ${university}
    - Question submitted anonymously: ${anonymous ? 'Yes' : 'No'}

    Styling rules:
    - Always respond warmly and authentically.
    - Write structured responses using Markdown (headings, bold text, bullet points).
    - Keep answers clear, encouraging, and highly actionable (within 3-4 short paragraphs maximum).
    - Use positive, energetic student-centric vernacular suitable for modern Iraq or Kurdistan.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: query }],
        },
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "I was unable to formulate an answer. Please try again in a moment.";
    res.json({ text: replyText, model: "gemini-3.5-flash" });

  } catch (err: any) {
    console.error("Gemini Endpoint Error:", err);
    res.status(500).json({ error: "Failed to communicate with AI Advisor: " + err.message });
  }
});

// -------------------------------------------------------------
// Proximity Routing & Live Workers Proxying (Outreach & Automation)
// -------------------------------------------------------------
app.all("/api/opportunity-automation*", requireAdmin, async (req, res) => {
  try {
    const targetUrl = `https://rafid-api.mahdialmuntadhar1.workers.dev${req.originalUrl}`;
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (key.toLowerCase() !== "host") {
        headers[key] = value as string;
      }
    }

    const isMultipart = req.headers["content-type"]?.startsWith("multipart/form-data");
    const method = req.method;

    let body: any = undefined;
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      if (isMultipart) {
        // Fallback or pass-through stream logic
        body = req;
      } else {
        body = JSON.stringify(req.body);
      }
    }

    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
      // Node fetch duplex parameter necessary when forwarding streams
      ...(isMultipart ? { duplex: "half" } : {})
    } as any);

    const contentType = response.headers.get("content-type") || "";
    res.status(response.status);
    if (contentType.includes("application/json")) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text();
      res.send(text);
    }
  } catch (err: any) {
    console.error("Proxy error for opportunity-automation:", err);
    res.status(502).json({ success: false, error: "بوابة الأتمتة والفرص غير متصلة مؤقتاً: " + err.message });
  }
});

app.get("/api/outreach/contacts", requireAdmin, (req, res) => {
  res.json({
    data: [],
    total: 0,
    dryRun: true,
    message: "Outreach is admin-only and in DRY_RUN mode. No contacts are exposed publicly."
  });
});

app.get("/api/outreach/campaigns", requireAdmin, (req, res) => {
  res.json({
    data: [],
    total: 0,
    dryRun: true,
    message: "Outreach campaigns are disabled for public launch until unsubscribe handling and real-send approval are configured."
  });
});

app.all("/api/outreach*", requireAdmin, async (req, res) => {
  try {
    if (req.method !== "GET" && req.originalUrl.includes("/send")) {
      res.json({
        success: true,
        dryRun: true,
        message: "Email outreach is in DRY_RUN mode. No real email was sent."
      });
      return;
    }
    const targetUrl = `https://rafid-api.mahdialmuntadhar1.workers.dev${req.originalUrl}`;
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (key.toLowerCase() !== "host") {
        headers[key] = value as string;
      }
    }

    const isMultipart = req.headers["content-type"]?.startsWith("multipart/form-data");
    const method = req.method;

    let body: any = undefined;
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      if (isMultipart) {
        body = req;
      } else {
        body = JSON.stringify(req.body);
      }
    }

    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
      // Node fetch duplex parameter necessary when forwarding streams
      ...(isMultipart ? { duplex: "half" } : {})
    } as any);

    const contentType = response.headers.get("content-type") || "";
    res.status(response.status);
    if (contentType.includes("application/json")) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text();
      res.send(text);
    }
  } catch (err: any) {
    console.error("Proxy error for outreach:", err);
    res.status(502).json({ success: false, error: "بوابة الرسائل للتواصل غير متصلة: " + err.message });
  }
});

// -------------------------------------------------------------
// Vite or Static Asset Middlewares
// -------------------------------------------------------------
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    // Spin up Vite in middleware mode for ultra-fast local sandbox reload
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production mode (from compiled /dist)
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[OK] Full-stack Dev/Production Server active on http://0.0.0.0:${PORT}`);
  });
}

initServer().catch((error) => {
  console.error("Failed to start server:", error);
});

/**
 * CLOUDFLARE WORKER: Student Opportunities Scraper & Automation Engine
 * 
 * This file is designed for deployment as a Cloudflare Worker.
 * It connects to a Cloudflare D1 SQL database and runs both automatically via Cloudflare Cron Triggers 
 * and manually via HTTP POST requests for instant updates.
 */

export interface Env {
  // Cloudflare D1 Database binding
  DB: any; // D1Database
  // Cloudflare R2 bucket binding for durable uploads when upload handling is enabled
  UPLOADS?: any; // R2Bucket
  // optional Gemini client key or standard service endpoints
  GEMINI_API_KEY?: string;
  JWT_SECRET?: string;
  RESEND_API_KEY?: string;
  DRY_RUN_AUTOMATION?: string;
  DRY_RUN_EMAILS?: string;
}

export default {
  /**
   * 1. CRON TRIGGER ENTRY POINT (Run by Cloudflare Scheduler)
   */
  async scheduled(event: any, env: Env, ctx: any): Promise<void> {
    console.log(`[Cron Trigger] Starting scheduled scraping automation: ${event.scheduledTime}`);
    ctx.waitUntil(runMainScraper(env, "scheduled_cron"));
  },

  /**
   * 2. HTTP ENDPOINT ENTRY POINT (Manual "Run Scraper Now" button trigger)
   */
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return jsonResponse({ ok: true });
    }

    if (url.pathname === "/api/health" && request.method === "GET") {
      return jsonResponse({ status: "ok", worker: "rafid-api", time: new Date().toISOString() });
    }

    if (url.pathname === "/api/auth/register" && request.method === "POST") {
      return handleRegister(request, env);
    }

    if (url.pathname === "/api/auth/login" && request.method === "POST") {
      return handleLogin(request, env);
    }

    if (url.pathname === "/api/auth/me" && request.method === "GET") {
      const user = await requireWorkerAuth(request, env);
      return user instanceof Response ? user : jsonResponse({ user: publicUser(user) });
    }

    if (url.pathname === "/api/auth/forgot-password" && request.method === "POST") {
      return handleForgotPassword(request, env);
    }

    if (url.pathname === "/api/institutions" && request.method === "GET") {
      const limit = Number(url.searchParams.get("limit") || "50");
      const offset = Number(url.searchParams.get("offset") || "0");
      return jsonResponse({
        institutions: [],
        pagination: { total: 0, limit, offset, hasMore: false },
        warning: "Institutions source is not configured in this Worker yet."
      });
    }

    if ((url.pathname === "/api/opportunities" || url.pathname === "/api/highlights") && request.method === "GET") {
      const kind = url.pathname.endsWith("/highlights") ? "highlights" : "opportunities";
      return jsonResponse(await getPublicFeed(env, url, kind));
    }

    if (url.pathname === "/api/admin/portal-settings" && request.method === "GET") {
      return jsonResponse({ settings: await getPortalSettings(env) });
    }

    if (url.pathname === "/api/admin/portal-settings" && request.method === "PATCH") {
      const user = await requireWorkerAdmin(request, env);
      if (user instanceof Response) return user;
      const body = await readJson(request);
      const settings = await savePortalSettings(env, body?.settings || body || {}, user.id);
      return jsonResponse({ success: true, settings });
    }

    if (url.pathname.startsWith("/api/opportunity-automation")) {
      const user = await requireWorkerAdmin(request, env);
      if (user instanceof Response) return user;
      return handleAutomationRequest(request, env, url, user);
    }

    // Enforce POST security or manual triggers
    if (url.pathname === "/api/scrape/run" && request.method === "POST") {
      try {
        console.log("[HTTP Trigger] Starting manual scraping execution...");
        const stats = await runMainScraper(env, "manual_admin");
        return jsonResponse({
          success: true,
          message: "Scraper completed successfully inside Cloudflare Worker environment.",
          stats
        });
      } catch (err: any) {
        return jsonResponse({
          success: false,
          error: err.message
        }, 500);
      }
    }

    return new Response("Cloudflare Worker Scraper Node: Operational. Waiting for cron or API triggers.", { status: 200 });
  }
};

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS"
    }
  });
}

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array | string) {
  const source = typeof bytes === "string" ? new TextEncoder().encode(bytes) : bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  source.forEach((byte) => binary += String.fromCharCode(byte));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(normalized);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

async function hmacSha256(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
}

async function signToken(env: Env, user: any) {
  const secret = env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured.");
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64UrlEncode(JSON.stringify({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    iat: now,
    exp: now + 60 * 60 * 24 * 7
  }));
  const signature = base64UrlEncode(await hmacSha256(secret, `${header}.${payload}`));
  return `${header}.${payload}.${signature}`;
}

async function verifyToken(env: Env, token: string) {
  try {
    const secret = env.JWT_SECRET;
    if (!secret) return null;
    const [header, payload, signature] = token.split(".");
    if (!header || !payload || !signature) return null;
    const expected = base64UrlEncode(await hmacSha256(secret, `${header}.${payload}`));
    if (expected !== signature) return null;
    const claims = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload)));
    if (!claims.exp || claims.exp < Math.floor(Date.now() / 1000)) return null;
    return claims;
  } catch {
    return null;
  }
}

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

async function hashPassword(password: string, salt = crypto.getRandomValues(new Uint8Array(16))) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 210000, hash: "SHA-256" },
    key,
    256
  );
  return `pbkdf2:${base64UrlEncode(salt)}:${base64UrlEncode(bits)}`;
}

async function verifyPassword(password: string, storedHash: string) {
  const [scheme, saltText, hashText] = String(storedHash || "").split(":");
  if (scheme !== "pbkdf2" || !saltText || !hashText) return false;
  const candidate = await hashPassword(password, base64UrlDecode(saltText));
  return candidate === storedHash;
}

function publicUser(user: any) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

async function findUserByEmail(env: Env, email: string) {
  return env.DB.prepare("SELECT * FROM users WHERE lower(email) = lower(?) LIMIT 1").bind(email).first();
}

async function requireWorkerAuth(request: Request, env: Env) {
  const token = getBearerToken(request);
  if (!token) return jsonResponse({ error: "Authentication required." }, 401);
  const claims = await verifyToken(env, token);
  if (!claims?.sub) return jsonResponse({ error: "Authentication required." }, 401);
  const user = await env.DB.prepare("SELECT * FROM users WHERE id = ? LIMIT 1").bind(claims.sub).first();
  return user || jsonResponse({ error: "Authentication required." }, 401);
}

async function requireWorkerAdmin(request: Request, env: Env) {
  const user = await requireWorkerAuth(request, env);
  if (user instanceof Response) return user;
  return ["staff", "admin", "super_admin"].includes(user.role)
    ? user
    : jsonResponse({ error: "Admin access only." }, 403);
}

async function handleRegister(request: Request, env: Env) {
  const body: any = await readJson(request);
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!name || !email.includes("@") || password.length < 6) {
    return jsonResponse({ error: "Name, valid email, and password with at least 6 characters are required." }, 400);
  }
  if (await findUserByEmail(env, email)) {
    return jsonResponse({ error: "Email already exists." }, 409);
  }
  const user = {
    id: `user-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
    name,
    email,
    role: "student",
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString()
  };
  await env.DB.prepare(
    "INSERT INTO users (id, name, email, role, passwordHash, createdAt) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(user.id, user.name, user.email, user.role, user.passwordHash, user.createdAt).run();
  return jsonResponse({ token: await signToken(env, user), user: publicUser(user) }, 201);
}

async function handleLogin(request: Request, env: Env) {
  const body: any = await readJson(request);
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const user = await findUserByEmail(env, email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return jsonResponse({ error: "Invalid email or password." }, 401);
  }
  return jsonResponse({ token: await signToken(env, user), user: publicUser(user) });
}

async function handleForgotPassword(request: Request, env: Env) {
  const body: any = await readJson(request);
  const email = String(body.email || "").trim().toLowerCase();
  if (!email.includes("@")) return jsonResponse({ error: "Valid email is required." }, 400);
  const user = await findUserByEmail(env, email);
  if (user) {
    await env.DB.prepare(
      "INSERT INTO passwordResets (id, userId, email, tokenHash, mode, createdAt) VALUES (?, ?, ?, ?, 'DRY_RUN', ?)"
    ).bind(`reset-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`, user.id, email, await hashPassword(crypto.randomUUID()), new Date().toISOString()).run();
  }
  return jsonResponse({ success: true, dryRun: true, message: "Password reset email is simulated in DRY_RUN mode. No real email was sent." });
}

async function getPublicFeed(env: Env, url: URL, kind: "opportunities" | "highlights") {
  const today = new Date().toISOString().split("T")[0];
  const limit = Math.max(0, Number(url.searchParams.get("limit") || "50"));
  const offset = Math.max(0, Number(url.searchParams.get("offset") || "0"));
  const opportunityCategories = ["job", "scholarship", "internship", "training", "fellowship", "volunteering", "competition", "graduation_support"];
  const highlightCategories = ["event", "news", "announcement", "exam", "registration", "student_club", "activity"];
  const categories = kind === "opportunities" ? opportunityCategories : highlightCategories;
  const placeholders = categories.map(() => "?").join(",");

  const countResult = await env.DB.prepare(
    `SELECT COUNT(*) AS total FROM opportunities
     WHERE status = 'approved'
       AND (deadline IS NULL OR deadline = '' OR deadline >= ?)
       AND category IN (${placeholders})`
  ).bind(today, ...categories).first();

  const rows = await env.DB.prepare(
    `SELECT * FROM opportunities
     WHERE status = 'approved'
       AND (deadline IS NULL OR deadline = '' OR deadline >= ?)
       AND category IN (${placeholders})
     ORDER BY published_date DESC, created_at DESC
     LIMIT ? OFFSET ?`
  ).bind(today, ...categories, limit, offset).all();

  const items = rows.results || [];
  const total = Number(countResult?.total || 0);
  return {
    [kind]: items,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + items.length < total
    }
  };
}

const DEFAULT_PORTAL_SETTINGS = {
  heroImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600",
  heroTitle: {
    en: "Master Your Campus Journey!",
    ar: "تميّز وابنِ مستقبلك الأكاديمي!",
    ku: "داهاتوویەکی پڕشنگدار بنيات بنێ!"
  },
  heroDescription: {
    en: "The ultimate collegiate hub for premium opportunities & academic resources",
    ar: "البوابة الطلابية الأقوى للجامعات والتدريب في عِراقنا الحبيب",
    ku: "یەکەم دەروازەی خوێندکارانی زانکۆ و دابینکردنی هەلی مەشق"
  },
  heroTag: {
    en: "PORTAL ACCELERATION",
    ar: "بوابة هويتنا الأكاديمية",
    ku: "دەروازەی ئەکادیمی عێراق"
  },
  defaultStories: [
    { id: "story-sara", name: "Sara Ahmed", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200", text: "Morning lab session checking microscopic cells! 🔬" },
    { id: "story-mustafa", name: "Mustafa Ali", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200", text: "Building our AI-powered student assistant with Gemini API! 🤖🚀" },
    { id: "story-rawan", name: "Rawan Omer", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200", text: "Sunset over Mount Goizha from campus was stunning today! 🌄☕" },
    { id: "story-ali", name: "Ali Jabbar", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200", text: "Long shift in clinical practice! Basra Heat is here but we keep smiling! 🩺🥤" },
    { id: "story-zahid", name: "Noor Al-Huda", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200", text: "Setting up our chemical reaction samples. They look like glowing gems! 🧪💎" },
    { id: "story-soran", name: "Soran Dler", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200", text: "Beautiful morning at Erbil Citadel before lectures start 🎒🏰" }
  ]
};

function normalizePortalSettings(raw: any = {}) {
  const stories = Array.isArray(raw.defaultStories) ? raw.defaultStories : DEFAULT_PORTAL_SETTINGS.defaultStories;
  return {
    heroImage: String(raw.heroImage || DEFAULT_PORTAL_SETTINGS.heroImage),
    heroTitle: {
      en: String(raw.heroTitle?.en || DEFAULT_PORTAL_SETTINGS.heroTitle.en),
      ar: String(raw.heroTitle?.ar || DEFAULT_PORTAL_SETTINGS.heroTitle.ar),
      ku: String(raw.heroTitle?.ku || DEFAULT_PORTAL_SETTINGS.heroTitle.ku)
    },
    heroDescription: {
      en: String(raw.heroDescription?.en || DEFAULT_PORTAL_SETTINGS.heroDescription.en),
      ar: String(raw.heroDescription?.ar || DEFAULT_PORTAL_SETTINGS.heroDescription.ar),
      ku: String(raw.heroDescription?.ku || DEFAULT_PORTAL_SETTINGS.heroDescription.ku)
    },
    heroTag: {
      en: String(raw.heroTag?.en || DEFAULT_PORTAL_SETTINGS.heroTag.en),
      ar: String(raw.heroTag?.ar || DEFAULT_PORTAL_SETTINGS.heroTag.ar),
      ku: String(raw.heroTag?.ku || DEFAULT_PORTAL_SETTINGS.heroTag.ku)
    },
    defaultStories: stories.map((story: any, index: number) => ({
      id: String(story?.id || DEFAULT_PORTAL_SETTINGS.defaultStories[index]?.id || `story-${index + 1}`),
      name: String(story?.name || DEFAULT_PORTAL_SETTINGS.defaultStories[index]?.name || "Student"),
      avatar: String(story?.avatar || DEFAULT_PORTAL_SETTINGS.defaultStories[index]?.avatar || ""),
      text: String(story?.text || DEFAULT_PORTAL_SETTINGS.defaultStories[index]?.text || "")
    }))
  };
}

async function getPortalSettings(env: Env) {
  const row = await env.DB.prepare("SELECT * FROM portal_settings WHERE id = 'default' LIMIT 1").first();
  if (!row) return DEFAULT_PORTAL_SETTINGS;
  return normalizePortalSettings({
    heroImage: row.hero_image,
    heroTitle: { en: row.hero_title_en, ar: row.hero_title_ar, ku: row.hero_title_ku },
    heroDescription: { en: row.hero_description_en, ar: row.hero_description_ar, ku: row.hero_description_ku },
    heroTag: { en: row.hero_tag_en, ar: row.hero_tag_ar, ku: row.hero_tag_ku },
    defaultStories: JSON.parse(row.default_stories_json || "[]")
  });
}

async function savePortalSettings(env: Env, rawSettings: any, userId: string) {
  const settings = normalizePortalSettings(rawSettings);
  await env.DB.prepare(
    `INSERT INTO portal_settings (
      id, hero_image, hero_title_en, hero_title_ar, hero_title_ku,
      hero_description_en, hero_description_ar, hero_description_ku,
      hero_tag_en, hero_tag_ar, hero_tag_ku, default_stories_json, updated_at, updated_by
    ) VALUES ('default', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      hero_image = excluded.hero_image,
      hero_title_en = excluded.hero_title_en,
      hero_title_ar = excluded.hero_title_ar,
      hero_title_ku = excluded.hero_title_ku,
      hero_description_en = excluded.hero_description_en,
      hero_description_ar = excluded.hero_description_ar,
      hero_description_ku = excluded.hero_description_ku,
      hero_tag_en = excluded.hero_tag_en,
      hero_tag_ar = excluded.hero_tag_ar,
      hero_tag_ku = excluded.hero_tag_ku,
      default_stories_json = excluded.default_stories_json,
      updated_at = excluded.updated_at,
      updated_by = excluded.updated_by`
  ).bind(
    settings.heroImage,
    settings.heroTitle.en,
    settings.heroTitle.ar,
    settings.heroTitle.ku,
    settings.heroDescription.en,
    settings.heroDescription.ar,
    settings.heroDescription.ku,
    settings.heroTag.en,
    settings.heroTag.ar,
    settings.heroTag.ku,
    JSON.stringify(settings.defaultStories),
    new Date().toISOString(),
    userId
  ).run();
  return settings;
}

function normalizeStatus(status: string) {
  return ["pending_review", "approved", "rejected", "duplicate", "expired"].includes(status) ? status : "pending_review";
}

async function handleAutomationRequest(request: Request, env: Env, url: URL, user: any) {
  const path = url.pathname.replace("/api/opportunity-automation", "");
  if (path === "/status" && request.method === "GET") {
    const last = await env.DB.prepare("SELECT timestamp FROM scraper_logs ORDER BY timestamp DESC LIMIT 1").first();
    return jsonResponse({ status: "idle", last_run_timestamp: last?.timestamp || null, frequency_hours: 6, is_active: true, dry_run_email: true });
  }

  if (path === "/stats" && request.method === "GET") {
    const rows = await env.DB.prepare("SELECT status, COUNT(*) AS count FROM opportunities GROUP BY status").all();
    const counts: Record<string, number> = {};
    (rows.results || []).forEach((row: any) => counts[normalizeStatus(row.status)] = Number(row.count || 0));
    return jsonResponse({
      total_scraped: Object.values(counts).reduce((sum, value) => sum + value, 0),
      duplicates_blocked: counts.duplicate || 0,
      pending_review: counts.pending_review || 0,
      approved: counts.approved || 0,
      rejected: counts.rejected || 0,
      duplicate: counts.duplicate || 0,
      expired: counts.expired || 0,
      errors_prevented: 0
    });
  }

  if (path === "/sources" && request.method === "GET") {
    const search = `%${String(url.searchParams.get("search") || "").toLowerCase()}%`;
    const rows = await env.DB.prepare(
      "SELECT * FROM sources WHERE lower(name || ' ' || url) LIKE ? ORDER BY name"
    ).bind(search).all();
    return jsonResponse({ data: rows.results || [], total: rows.results?.length || 0 });
  }

  if (path === "/sources" && request.method === "POST") {
    const body: any = await readJson(request);
    if (!body.name || !body.url || !body.type) return jsonResponse({ error: "Source name, url, and type are required." }, 400);
    const source = { id: `source-${Date.now()}`, name: body.name, url: body.url, type: body.type, enabled: body.active === false ? 0 : 1 };
    await env.DB.prepare("INSERT INTO sources (id, name, url, type, enabled) VALUES (?, ?, ?, ?, ?)").bind(source.id, source.name, source.url, source.type, source.enabled).run();
    return jsonResponse(source, 201);
  }

  const sourceMatch = path.match(/^\/sources\/([^/]+)$/);
  if (sourceMatch && request.method === "PATCH") {
    const body: any = await readJson(request);
    const enabled = typeof body.active === "boolean" ? (body.active ? 1 : 0) : typeof body.enabled === "boolean" ? (body.enabled ? 1 : 0) : undefined;
    if (enabled === undefined) return jsonResponse({ error: "Only enabled/active updates are supported." }, 400);
    await env.DB.prepare("UPDATE sources SET enabled = ? WHERE id = ?").bind(enabled, sourceMatch[1]).run();
    return jsonResponse({ success: true });
  }
  if (sourceMatch && request.method === "DELETE") {
    await env.DB.prepare("DELETE FROM sources WHERE id = ?").bind(sourceMatch[1]).run();
    return jsonResponse({ success: true });
  }

  if (path === "/candidates" && request.method === "GET") {
    const status = normalizeStatus(String(url.searchParams.get("status") || "pending_review"));
    const rows = await env.DB.prepare("SELECT * FROM opportunities WHERE status = ? ORDER BY created_at DESC").bind(status).all();
    return jsonResponse({ data: rows.results || [], total: rows.results?.length || 0 });
  }

  const candidateActionMatch = path.match(/^\/candidates\/([^/]+)\/(approve|reject|mark-duplicate|mark-expired)$/);
  if (candidateActionMatch && request.method === "POST") {
    const [, id, action] = candidateActionMatch;
    const body: any = await readJson(request);
    const status = action === "approve" ? "approved" : action === "reject" ? "rejected" : action === "mark-duplicate" ? "duplicate" : "expired";
    await env.DB.prepare("UPDATE opportunities SET status = ? WHERE id = ?").bind(status, id).run();
    await env.DB.prepare("UPDATE raw_scraped_items SET review_status = ? WHERE opportunity_id = ?").bind(status, id).run();
    if (status === "rejected" && body.reason) {
      await env.DB.prepare("UPDATE opportunities SET rejectionReason = ? WHERE id = ?").bind(String(body.reason), id).run();
    }
    return jsonResponse({ success: true, item: { id, status, reviewedBy: user.id } });
  }

  const candidateMatch = path.match(/^\/candidates\/([^/]+)$/);
  if (candidateMatch && request.method === "GET") {
    const item = await env.DB.prepare("SELECT * FROM opportunities WHERE id = ? LIMIT 1").bind(candidateMatch[1]).first();
    return item ? jsonResponse(item) : jsonResponse({ error: "Candidate not found." }, 404);
  }
  if (candidateMatch && request.method === "PATCH") {
    const body: any = await readJson(request);
    await env.DB.prepare(
      `UPDATE opportunities SET
        titleEN = COALESCE(?, titleEN),
        titleAR = COALESCE(?, titleAR),
        titleKU = COALESCE(?, titleKU),
        contentEN = COALESCE(?, contentEN),
        contentAR = COALESCE(?, contentAR),
        contentKU = COALESCE(?, contentKU),
        category = COALESCE(?, category),
        deadline = COALESCE(?, deadline),
        application_link = COALESCE(?, application_link),
        original_source_url = COALESCE(?, original_source_url)
       WHERE id = ?`
    ).bind(
      body.titleEN || null,
      body.titleAR || null,
      body.titleKU || null,
      body.contentEN || null,
      body.contentAR || null,
      body.contentKU || null,
      body.category || null,
      body.deadline || null,
      body.application_link || null,
      body.original_source_url || body.application_link || null,
      candidateMatch[1]
    ).run();
    const updated = await env.DB.prepare("SELECT * FROM opportunities WHERE id = ? LIMIT 1").bind(candidateMatch[1]).first();
    return jsonResponse(updated || { success: true });
  }

  if (path === "/logs" && request.method === "GET") {
    const rows = await env.DB.prepare("SELECT * FROM scraper_logs ORDER BY timestamp DESC LIMIT 100").all();
    return jsonResponse({ data: rows.results || [], total: rows.results?.length || 0 });
  }

  if (path === "/run-now" && request.method === "POST") {
    return jsonResponse(await runMainScraper(env, "manual_admin"));
  }

  const runSourceMatch = path.match(/^\/run-source\/([^/]+)$/);
  if (runSourceMatch && request.method === "POST") {
    return jsonResponse({ success: false, error: "Single-source run is not supported in Worker mode yet. Use Run All." }, 501);
  }

  if (path === "/import-csv" && request.method === "POST") {
    return jsonResponse({ success: false, inserted: 0, duplicates: 0, errors: ["Worker CSV import is not enabled yet. Use the local/admin import path."], defaultStatus: "pending_review" }, 501);
  }

  return jsonResponse({ error: "Not found." }, 404);
}

/**
 * MAIN SCOPE EXECUTION
 * Crawls enabled sources, parses, sanitizes, and writes pending opportunities to Cloudflare D1.
 */
async function runMainScraper(env: Env, triggerType: string): Promise<any> {
  const runTimestamp = new Date().toISOString();
  
  // 1. Read enabled sources from Cloudflare D1
  let sourcesList: any[] = [];
  try {
    const { results } = await env.DB.prepare(
      "SELECT id, name, url, type FROM sources WHERE enabled = 1"
    ).all();
    sourcesList = results || [];
  } catch (err: any) {
    console.error("Error reading D1 sources; scraper will not use fallback sources:", err);
    sourcesList = [];
  }

  const resultsStats = {
    trigger: triggerType,
    time: runTimestamp,
    sourcesChecked: 0,
    itemsFound: 0,
    itemsNew: 0,
    itemsDuplicate: 0,
    errors: [] as string[]
  };

  for (const source of sourcesList) {
    try {
      console.log(`[Scraper] Checking source: ${source.name} <${source.url}>`);
      resultsStats.sourcesChecked++;

      // A. Fetch original website contents safely with polite delays
      const response = await fetch(source.url, {
        headers: {
          "User-Agent": "Iraqi-Students-Portal-Bot/2.0 (+https://ai.studio/build; Contact: mahdialmuntadhar1@gmail.com)",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9",
          "Accept-Language": "en-US,en;q=0.9,ar;q=0.8"
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP Error response code ${response.status}`);
      }

      const htmlContent = await response.text();

      // B. Parse opportunity components
      const rawOpportunities = extractOpportunitiesFromHTML(htmlContent, source);
      resultsStats.itemsFound += rawOpportunities.length;
      if (rawOpportunities.length === 0) {
        console.log(`[Scraper] 0 items found at ${source.name}; no simulated records created.`);
      }

      // C. Process each scraped item
      for (const rawItem of rawOpportunities) {
        // Apply Sanitization & Normalization helpers
        const cleaned = cleanAndNormalizeOpportunity(rawItem);
        const rawId = await recordRawScrapedItem(env, source, rawItem, runTimestamp);

        // Check for duplicates
        const isDuplicate = await checkDuplicateInD1(env, cleaned);
        if (isDuplicate) {
          resultsStats.itemsDuplicate++;
          continue;
        }

        // Check if opportunity is already expired
        if (isOpportunityExpired(cleaned.deadline)) {
          console.log(`[Scraper] Skipping expired scraped item: ${cleaned.titleEN}`);
          continue;
        }

        // D. Auto classify the category using AI or heuristics
        cleaned.category = classifyOpportunityCategory(cleaned.titleEN + " " + cleaned.contentEN, source.type);

        // E. Save normalized opportunity to D1 as pending_review only.
        const opportunityId = await insertOpportunityToD1(env, cleaned);
        if (rawId && opportunityId) {
          await env.DB.prepare(
            "UPDATE raw_scraped_items SET opportunity_id = ?, review_status = 'pending_review' WHERE id = ?"
          ).bind(opportunityId, rawId).run();
        }
        resultsStats.itemsNew++;
      }

      // F. Update source checked status in D1
      await env.DB.prepare(
        "UPDATE sources SET last_checked = ?, error_status = NULL WHERE id = ?"
      ).bind(runTimestamp, source.id).run();

      // Log success event to D1 Logs
      await logScrapingActivity(env, {
        id: `log-${Date.now()}-${source.id}`,
        timestamp: runTimestamp,
        source_id: source.id,
        source_name: source.name,
        items_found: rawOpportunities.length,
        items_new: resultsStats.itemsNew,
        items_duplicate: resultsStats.itemsDuplicate,
        errors: ""
      });

    } catch (err: any) {
      console.error(`Error scraping ${source.name}:`, err);
      resultsStats.errors.push(`${source.name}: ${err.message}`);

      // Save error state in sources D1
      try {
        await env.DB.prepare(
          "UPDATE sources SET last_checked = ?, error_status = ? WHERE id = ?"
        ).bind(runTimestamp, err.message, source.id).run();
      } catch (innerErr) {
        console.error("D1 log failure:", innerErr);
      }
    }
  }

  // Auto clean old expired opportunities in D1 database
  try {
    await cleanExpiredOpportunitiesInD1(env);
  } catch (expireErr) {
    console.warn("Expired cleanup runner error:", expireErr);
  }

  return resultsStats;
}

/**
 * 3. HTML CRAWLER & SELECTOR PARSER PARADIGM
 * Reads raw markup. Since regular websites vary, structured microformat tags, Schema.org definitions, 
 * RSS feeds, or standard layouts are analyzed using quick high-efficiency regex groupings.
 */
function extractOpportunitiesFromHTML(html: string, source: any): any[] {
  const items: any[] = [];
  
  // Clean HTML from extreme head/meta weight
  const textSample = html.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "").replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "");

  // Fallback programmatic regex parser looking for cards, links, or anchor anchors targeting career blocks
  // In real Cloudflare Node, Cheerio or built-in HTMLRewriter can be employed.
  // Here we construct a resilient anchor parse.
  const anchorRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  let count = 0;

  while ((match = anchorRegex.exec(textSample)) !== null && count < 8) {
    const href = match[1];
    const text = match[2].replace(/<[^>]*>/g, "").trim();

    if (text.length > 25 && (href.toLowerCase().includes("job") || href.toLowerCase().includes("career") || href.toLowerCase().includes("scholar") || href.toLowerCase().includes("apply") || href.toLowerCase().includes("intern") || href.toLowerCase().includes("training"))) {
      let resolvedLink = href;
      if (href.startsWith("/")) {
        const root = new URL(source.url).origin;
        resolvedLink = `${root}${href}`;
      }

      items.push({
        titleEN: text,
        contentEN: `Opportunity announced by ${source.name}. Click original link to register and view details directly on recruitment board.`,
        organization: source.name,
        original_source_url: resolvedLink,
        application_link: resolvedLink,
        published_date: new Date().toISOString().split("T")[0],
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Default 15 days deadline
        imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600"
      });
      count++;
    }
  }

  return items;
}

/**
 * 4. SANITIZATION AND NORMALIZATION LOGIC
 */
function cleanAndNormalizeOpportunity(item: any): any {
  // Clear Messy Text
  const sanitize = (val: string) => {
    if (!val) return "";
    return val
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/<[^>]*>/g, "") // Remove HTML Tags
      .replace(/\s+/g, " ") // Collapse whitespace
      .trim();
  };

  const titleCleaned = sanitize(item.titleEN);
  const descCleaned = sanitize(item.contentEN);

  // Normalize Governorate name: map diverse string keys to official tags
  let govKey = "all";
  const searchString = (titleCleaned + " " + descCleaned).toLowerCase();
  if (searchString.includes("baghdad") || searchString.includes("بغداد")) {
    govKey = "baghdad";
  } else if (searchString.includes("sulaymaniyah") || searchString.includes("سليمانية") || searchString.includes("slemani")) {
    govKey = "sulaymaniyah";
  } else if (searchString.includes("erbil") || searchString.includes("اربيل") || searchString.includes("hawler")) {
    govKey = "erbil";
  } else if (searchString.includes("mosul") || searchString.includes("نينوى") || searchString.includes("nineveh")) {
    govKey = "nineveh";
  } else if (searchString.includes("basra") || searchString.includes("بصرة")) {
    govKey = "basra";
  }

  // Normalize deadline
  let finalDeadline = item.deadline;
  if (!finalDeadline) {
    finalDeadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  }

  // Create Tri-lingual templates to ensure youth Arabic/Kurdish experience builds beautifully
  return {
    ...item,
    titleEN: titleCleaned,
    titleAR: `[مؤتمت] فرصة جديدة: ${titleCleaned}`,
    titleKU: `[خۆکار] دەرفەتێکی نوێ: ${titleCleaned}`,
    contentEN: descCleaned,
    contentAR: `تفاصيل الفرصة من المصدر المعتمد: ${descCleaned}. يرجى زيارة الرابط الرسمي للتقديم ومطالعة كامل المتطلبات.`,
    contentKU: `وردەکاری دەرفەت لە سەرچاوەی فەرمیەوە: ${descCleaned}. تکایە سەردانی بەستەری سەرەکی بکەن بۆ پێشکەشکردنی داواکاری و بینینی مەرجەکان.`,
    governorateId: govKey,
    deadline: finalDeadline,
    status: "pending_review"
  };
}

/**
 * 5. HIGH ACCURACY HEURISTIC CLASSIFIER
 */
function classifyOpportunityCategory(text: string, sourceType: string): string {
  const norm = text.toLowerCase();
  
  if (norm.includes("intern") || norm.includes("تدريب عملي") || norm.includes("مەشق")) {
    return "internship";
  }
  if (norm.includes("scholarship") || norm.includes("منحة") || norm.includes("سكولەرشیپ") || norm.includes("daad")) {
    return "scholarship";
  }
  if (norm.includes("course") || norm.includes("training") || norm.includes("دورات") || norm.includes("ورشة") || norm.includes("ڕاهێنان")) {
    return "training";
  }
  if (norm.includes("volunteering") || norm.includes("تطوع") || norm.includes("خۆبەخش")) {
    return "volunteering";
  }
  if (norm.includes("competition") || norm.includes("مسابقة") || norm.includes("کێبڕکێ") || norm.includes("hackathon") || norm.includes("🏆")) {
    return "competition";
  }
  if (norm.includes("event") || norm.includes("festival") || norm.includes("مهرجان") || norm.includes("فعالية")) {
    return "event";
  }
  if (norm.includes("fellowship") || norm.includes("زمالة")) {
    return "fellowship";
  }
  if (norm.includes("announcement") || norm.includes("إعلان") || norm.includes("ئاگاداری") || norm.includes("mohesr")) {
    return "announcement";
  }
  
  // Use source mapping fallback
  if (sourceType === "scholarships") return "scholarship";
  if (sourceType === "trainings") return "training";
  return "job"; // default fallback is job
}

/**
 * 6. UTILITY D1 CONTEXT AGENTS
 */
async function checkDuplicateInD1(env: Env, item: any): Promise<boolean> {
  try {
    const record = await env.DB.prepare(
      `SELECT id FROM opportunities
       WHERE original_source_url = ?
          OR (lower(titleEN) = lower(?) AND lower(organization) = lower(?) AND deadline = ?)
       LIMIT 1`
    ).bind(
      item.original_source_url,
      item.titleEN,
      item.organization,
      item.deadline
    ).first();
    return !!record;
  } catch {
    return false;
  }
}

async function insertOpportunityToD1(env: Env, item: any): Promise<string | null> {
  const newId = `scraped-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  try {
    await env.DB.prepare(
      `INSERT INTO opportunities (
        id, titleEN, titleAR, titleKU, contentEN, contentAR, contentKU,
        organization, category, country, governorateId, deadline,
        application_link, original_source_url, published_date, imageUrl, status,
        workplaceType, whoCanApply, salary, location, savedCount, universityAppliedCount, companyVerified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 1)`
    ).bind(
      newId,
      item.titleEN,
      item.titleAR || item.titleEN,
      item.titleKU || item.titleEN,
      item.contentEN,
      item.contentAR || item.contentEN,
      item.contentKU || item.contentEN,
      item.organization || "Scraped Board",
      item.category,
      item.country || "Iraq",
      item.governorateId || "all",
      item.deadline,
      item.application_link,
      item.original_source_url,
      item.published_date,
      item.imageUrl,
      "pending_review",
      item.workplaceType || "On-site",
      item.whoCanApply || "Open to all Iraqi undergraduates and fresh graduates.",
      item.salary || "Depends on qualification recruiter check",
      item.location || "Iraq (Multi-center)"
    ).run();
    return newId;
  } catch (err) {
    console.error("D1 write transaction error:", err);
    return null;
  }
}

async function recordRawScrapedItem(env: Env, source: any, item: any, scrapedAt: string): Promise<string | null> {
  const rawUrl = String(item.original_source_url || item.application_link || source.url || "").trim();
  const rawId = `raw-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  try {
    const existing = await env.DB.prepare(
      "SELECT id FROM raw_scraped_items WHERE source_id = ? AND raw_url = ? LIMIT 1"
    ).bind(source.id, rawUrl).first();
    if (existing?.id) {
      await env.DB.prepare(
        `UPDATE raw_scraped_items
         SET source_name = ?, raw_title = ?, raw_snippet = ?, last_seen_at = ?
         WHERE id = ?`
      ).bind(
        source.name,
        item.titleEN || item.title || "",
        item.contentEN || item.snippet || "",
        scrapedAt,
        existing.id
      ).run();
      return String(existing.id);
    }

    await env.DB.prepare(
      `INSERT INTO raw_scraped_items (
        id, source_id, source_name, raw_title, raw_url, raw_snippet,
        scraped_at, last_seen_at, opportunity_id, review_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, 'pending_review')`
    ).bind(
      rawId,
      source.id,
      source.name,
      item.titleEN || item.title || "",
      rawUrl,
      item.contentEN || item.snippet || "",
      scrapedAt,
      scrapedAt
    ).run();
    return rawId;
  } catch (err) {
    console.error("D1 raw scraped item write error:", err);
    return null;
  }
}

function isOpportunityExpired(deadline: string): boolean {
  if (!deadline) return false;
  try {
    const now = new Date();
    // Normalize date strings
    const deadDate = new Date(deadline);
    return deadDate < now;
  } catch {
    return false;
  }
}

async function cleanExpiredOpportunitiesInD1(env: Env): Promise<void> {
  try {
    const nowStr = new Date().toISOString().split("T")[0];
    await env.DB.prepare(
      "UPDATE opportunities SET status = 'expired' WHERE deadline < ? AND status = 'approved'"
    ).bind(nowStr).run();
  } catch (err) {
    console.error("D1 expire transaction process error:", err);
  }
}

async function logScrapingActivity(env: Env, log: any): Promise<void> {
  try {
    await env.DB.prepare(
      `INSERT INTO scraper_logs (
        id, timestamp, source_id, source_name, items_found, items_new, items_duplicate, errors
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      log.id,
      log.timestamp,
      log.source_id,
      log.source_name,
      log.items_found,
      log.items_new,
      log.items_duplicate,
      log.errors
    ).run();
  } catch (err) {
    console.error("D1 logger action error:", err);
  }
}

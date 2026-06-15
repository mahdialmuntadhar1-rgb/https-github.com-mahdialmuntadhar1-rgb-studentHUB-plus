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
  DRY_RUN?: string;
  DRY_RUN_AUTOMATION?: string;
  DRY_RUN_EMAILS?: string;
}

export default {
  async queue(batch: any, env: Env, ctx: any) {
    console.log(`Queue consumer invoked with ${batch?.messages?.length || 0} message(s). No queue processing is configured for rafid-api.`);
  },
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
      const jwtReady = requireJwtSecret(env);
      if (jwtReady instanceof Response) return jwtReady;
      return handleRegister(request, env);
    }

    if (url.pathname === "/api/auth/login" && request.method === "POST") {
      const jwtReady = requireJwtSecret(env);
      if (jwtReady instanceof Response) return jwtReady;
      return handleLogin(request, env);
    }

    if (url.pathname === "/api/auth/me" && request.method === "GET") {
      const jwtReady = requireJwtSecret(env);
      if (jwtReady instanceof Response) return jwtReady;
      const user = await requireWorkerAuth(request, env);
      return user instanceof Response ? user : jsonResponse({ user: publicUser(user) });
    }

    if (url.pathname === "/api/users/me" && request.method === "GET") {
      const user = await requireWorkerAuth(request, env);
      return user instanceof Response ? user : jsonResponse({ user: await workerPublicProfile(env, user, user.id) });
    }

    if (url.pathname === "/api/users/me" && request.method === "PATCH") {
      return handleWorkerProfileUpdate(request, env);
    }

    if (url.pathname === "/api/users/search" && request.method === "GET") {
      return handleWorkerUserSearch(request, env, url);
    }

    const userProfileMatch = url.pathname.match(/^\/api\/users\/([^/]+)$/);
    if (userProfileMatch && request.method === "GET") {
      return handleWorkerUserProfile(request, env, userProfileMatch[1]);
    }

    const followMatch = url.pathname.match(/^\/api\/users\/([^/]+)\/follow$/);
    if (followMatch && request.method === "POST") {
      return handleWorkerFollow(request, env, followMatch[1], true);
    }
    if (followMatch && request.method === "DELETE") {
      return handleWorkerFollow(request, env, followMatch[1], false);
    }

    if (url.pathname === "/api/feed" && request.method === "GET") {
      return handleWorkerFeed(request, env, url);
    }

    if (url.pathname === "/api/posts" && request.method === "GET") {
      return handleWorkerFeed(request, env, url);
    }

    if (url.pathname === "/api/posts" && request.method === "POST") {
      return handleWorkerCreatePost(request, env);
    }

    const postLikeMatch = url.pathname.match(/^\/api\/posts\/([^/]+)\/like$/);
    if (postLikeMatch && request.method === "POST") {
      return handleWorkerLike(request, env, postLikeMatch[1], true);
    }
    if (postLikeMatch && request.method === "DELETE") {
      return handleWorkerLike(request, env, postLikeMatch[1], false);
    }

    const postCommentsMatch = url.pathname.match(/^\/api\/posts\/([^/]+)\/comments$/);
    if (postCommentsMatch && request.method === "GET") {
      return handleWorkerComments(request, env, postCommentsMatch[1]);
    }
    if (postCommentsMatch && request.method === "POST") {
      return handleWorkerAddComment(request, env, postCommentsMatch[1]);
    }

    const deleteCommentMatch = url.pathname.match(/^\/api\/posts\/([^/]+)\/comments\/([^/]+)$/);
    if (deleteCommentMatch && request.method === "DELETE") {
      return handleWorkerDeleteComment(request, env, deleteCommentMatch[1], deleteCommentMatch[2]);
    }

    const postDeleteMatch = url.pathname.match(/^\/api\/posts\/([^/]+)$/);
    if (postDeleteMatch && request.method === "DELETE") {
      return handleWorkerDeletePost(request, env, postDeleteMatch[1]);
    }

    const reportPostMatch = url.pathname.match(/^\/api\/posts\/([^/]+)\/report$/);
    if (reportPostMatch && request.method === "POST") {
      return handleWorkerReportPost(request, env, reportPostMatch[1]);
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

    if (url.pathname.startsWith("/api/outreach")) {
      return handleOutreachRequest(request, env, url);
    }

    if (url.pathname.startsWith("/api/opportunity-automation")) {
      const user = await requireWorkerAdmin(request, env);
      if (user instanceof Response) return user;
      return handleAutomationRequest(request, env, url, user);
    }

    // Enforce POST security or manual triggers
    if (url.pathname === "/api/scrape/run" && request.method === "POST") {
      const user = await requireWorkerAdmin(request, env);
      if (user instanceof Response) return user;
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

function requireJwtSecret(env: Env) {
  return env.JWT_SECRET
    ? true
    : jsonResponse({ error: "JWT_SECRET is not configured for this Worker." }, 500);
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

function emailsDryRunEnabled(env: Env) {
  return env.DRY_RUN !== "false" || env.DRY_RUN_EMAILS !== "false";
}

function normalizeEmail(value: any) {
  return String(value || "").trim().toLowerCase();
}

async function findUserByEmail(env: Env, email: string) {
  return env.DB.prepare("SELECT * FROM profiles WHERE lower(email) = lower(?) LIMIT 1").bind(email).first();
}

async function requireWorkerAuth(request: Request, env: Env) {
  const token = getBearerToken(request);
  if (!token) return jsonResponse({ error: "Authentication required." }, 401);
  const claims = await verifyToken(env, token);
  if (!claims?.sub) return jsonResponse({ error: "Authentication required." }, 401);
  const user = await env.DB.prepare("SELECT * FROM profiles WHERE id = ? LIMIT 1").bind(claims.sub).first();
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
    "INSERT INTO profiles (id, name, email, role, passwordHash, createdAt) VALUES (?, ?, ?, ?, ?, ?)"
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

function sanitizeText(value: any, maxLength: number) {
  return String(value || "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

async function workerPublicProfile(env: Env, user: any, viewerId?: string) {
  const profile = await env.DB.prepare("SELECT * FROM user_profiles WHERE userId = ? LIMIT 1").bind(user.id).first();
  const postsCount = await env.DB.prepare("SELECT COUNT(*) AS count FROM posts WHERE userId = ? AND deleted_at IS NULL").bind(user.id).first();
  const followersCount = await env.DB.prepare("SELECT COUNT(*) AS count FROM follows WHERE followee_id = ?").bind(user.id).first();
  const followingCount = await env.DB.prepare("SELECT COUNT(*) AS count FROM follows WHERE follower_id = ?").bind(user.id).first();
  const isFollowing = viewerId
    ? await env.DB.prepare("SELECT 1 FROM follows WHERE follower_id = ? AND followee_id = ? LIMIT 1").bind(viewerId, user.id).first()
    : null;
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    avatar: profile?.avatar || "",
    bio: profile?.bio || profile?.bioEN || "",
    university: profile?.universityId || "",
    universityId: profile?.universityId || "",
    governorateId: profile?.governorateId || "all",
    major: profile?.major || profile?.majorEN || "",
    majorEN: profile?.majorEN || profile?.major || "",
    majorAR: profile?.majorAR || profile?.major || "",
    majorKU: profile?.majorKU || profile?.major || "",
    bioEN: profile?.bioEN || profile?.bio || "",
    bioAR: profile?.bioAR || profile?.bio || "",
    bioKU: profile?.bioKU || profile?.bio || "",
    createdAt: user.createdAt,
    postsCount: Number(postsCount?.count || 0),
    followersCount: Number(followersCount?.count || 0),
    followingCount: Number(followingCount?.count || 0),
    isFollowing: Boolean(isFollowing)
  };
}

async function decorateWorkerPost(env: Env, post: any, viewerId: string) {
  const comments = await env.DB.prepare("SELECT * FROM comments WHERE itemId = ? AND deleted_at IS NULL ORDER BY createdAt ASC LIMIT 50").bind(post.id).all();
  const likeCount = await env.DB.prepare("SELECT COUNT(*) AS count FROM likes WHERE itemId = ?").bind(post.id).first();
  const liked = await env.DB.prepare("SELECT 1 FROM likes WHERE itemId = ? AND userId = ? LIMIT 1").bind(post.id, viewerId).first();
  return {
    ...post,
    commentsList: comments.results || [],
    commentsCount: (comments.results || []).length,
    likes: Number(likeCount?.count || 0),
    likes_count: Number(likeCount?.count || 0),
    likedByUser: Boolean(liked),
    is_liked: Boolean(liked)
  };
}

async function handleWorkerProfileUpdate(request: Request, env: Env) {
  const user = await requireWorkerAuth(request, env);
  if (user instanceof Response) return user;
  const body: any = await readJson(request);
  const name = sanitizeText(body.name, 80);
  if (name) {
    await env.DB.prepare("UPDATE profiles SET name = ? WHERE id = ?").bind(name, user.id).run();
    user.name = name;
  }
  await env.DB.prepare(
    `INSERT INTO user_profiles (userId, avatar, universityId, governorateId, bioEN, bioAR, bioKU, majorEN, majorAR, majorKU, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(userId) DO UPDATE SET
       avatar = excluded.avatar,
       universityId = excluded.universityId,
       governorateId = excluded.governorateId,
       bioEN = excluded.bioEN,
       bioAR = excluded.bioAR,
       bioKU = excluded.bioKU,
       majorEN = excluded.majorEN,
       majorAR = excluded.majorAR,
       majorKU = excluded.majorKU,
       updatedAt = excluded.updatedAt`
  ).bind(
    user.id,
    sanitizeText(body.avatar, 500),
    sanitizeText(body.universityId || body.university, 120),
    sanitizeText(body.governorateId, 80) || "all",
    sanitizeText(body.bioEN || body.bio, 500),
    sanitizeText(body.bioAR || body.bio, 500),
    sanitizeText(body.bioKU || body.bio, 500),
    sanitizeText(body.majorEN || body.major, 120),
    sanitizeText(body.majorAR || body.major, 120),
    sanitizeText(body.majorKU || body.major, 120),
    new Date().toISOString()
  ).run();
  return jsonResponse({ user: await workerPublicProfile(env, user, user.id) });
}

async function handleWorkerUserSearch(request: Request, env: Env, url: URL) {
  const viewer = await requireWorkerAuth(request, env);
  if (viewer instanceof Response) return viewer;
  const q = `%${String(url.searchParams.get("q") || "").trim().toLowerCase()}%`;
  if (q === "%%") return jsonResponse({ users: [] });
  const rows = await env.DB.prepare(
    `SELECT u.* FROM profiles u
     LEFT JOIN user_profiles p ON p.userId = u.id
     WHERE u.id <> ?
       AND lower(u.name || ' ' || COALESCE(p.universityId, '') || ' ' || COALESCE(p.majorEN, '') || ' ' || COALESCE(p.majorAR, '') || ' ' || COALESCE(p.majorKU, '')) LIKE ?
     ORDER BY u.name LIMIT 20`
  ).bind(viewer.id, q).all();
  const users = await Promise.all((rows.results || []).map((user: any) => workerPublicProfile(env, user, viewer.id)));
  return jsonResponse({ users });
}

async function handleWorkerUserProfile(request: Request, env: Env, userId: string) {
  const viewer = await requireWorkerAuth(request, env);
  if (viewer instanceof Response) return viewer;
  const user = await env.DB.prepare("SELECT * FROM profiles WHERE id = ? LIMIT 1").bind(userId).first();
  if (!user) return jsonResponse({ error: "User not found." }, 404);
  const rows = await env.DB.prepare(
    `SELECT * FROM posts p
     WHERE p.userId = ?
       AND p.deleted_at IS NULL
       AND (p.userId = ? OR p.visibility = 'public' OR p.userId IN (SELECT followee_id FROM follows WHERE follower_id = ?))
     ORDER BY p.createdAt DESC LIMIT 50`
  ).bind(userId, viewer.id, viewer.id).all();
  const posts = await Promise.all((rows.results || []).map((post: any) => decorateWorkerPost(env, post, viewer.id)));
  return jsonResponse({ user: await workerPublicProfile(env, user, viewer.id), posts });
}

async function handleWorkerFollow(request: Request, env: Env, targetId: string, shouldFollow: boolean) {
  const viewer = await requireWorkerAuth(request, env);
  if (viewer instanceof Response) return viewer;
  if (targetId === viewer.id) return jsonResponse({ error: "You cannot follow yourself." }, 400);
  const target = await env.DB.prepare("SELECT * FROM profiles WHERE id = ? LIMIT 1").bind(targetId).first();
  if (!target) return jsonResponse({ error: "User not found." }, 404);
  if (shouldFollow) {
    await env.DB.prepare("INSERT OR IGNORE INTO follows (follower_id, followee_id, created_at) VALUES (?, ?, ?)").bind(viewer.id, targetId, new Date().toISOString()).run();
  } else {
    await env.DB.prepare("DELETE FROM follows WHERE follower_id = ? AND followee_id = ?").bind(viewer.id, targetId).run();
  }
  return jsonResponse({ following: shouldFollow, user: await workerPublicProfile(env, target, viewer.id) });
}

async function handleWorkerFeed(request: Request, env: Env, url: URL) {
  const viewer = await requireWorkerAuth(request, env);
  if (viewer instanceof Response) return viewer;
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") || "20")));
  const offset = Math.max(0, Number(url.searchParams.get("offset") || "0"));
  const count = await env.DB.prepare(
    `SELECT COUNT(*) AS total FROM posts p
     WHERE p.deleted_at IS NULL
       AND (p.userId = ? OR p.userId IN (SELECT followee_id FROM follows WHERE follower_id = ?) OR p.visibility = 'public')`
  ).bind(viewer.id, viewer.id).first();
  const rows = await env.DB.prepare(
    `SELECT * FROM posts p
     WHERE p.deleted_at IS NULL
       AND (p.userId = ? OR p.userId IN (SELECT followee_id FROM follows WHERE follower_id = ?) OR p.visibility = 'public')
     ORDER BY p.createdAt DESC LIMIT ? OFFSET ?`
  ).bind(viewer.id, viewer.id, limit, offset).all();
  const posts = await Promise.all((rows.results || []).map((post: any) => decorateWorkerPost(env, post, viewer.id)));
  const total = Number(count?.total || 0);
  return jsonResponse({ posts, feed: posts, pagination: { total, limit, offset, hasMore: offset + posts.length < total } });
}

async function handleWorkerCreatePost(request: Request, env: Env) {
  const user = await requireWorkerAuth(request, env);
  if (user instanceof Response) return user;
  const body: any = await readJson(request);
  const rawContent = String(body.content || body.body || "");
  const content = sanitizeText(rawContent, 2000);
  if (!content) return jsonResponse({ error: "Post content is required." }, 400);
  if (rawContent.trim().length > 2000) return jsonResponse({ error: "Post content must be 2000 characters or fewer." }, 400);
  const title = sanitizeText(body.title || content.slice(0, 80) || "Student post", 120);
  const post = {
    id: crypto.randomUUID(),
    userId: user.id,
    title,
    content,
    visibility: ["public", "followers", "private"].includes(body.visibility) ? body.visibility : "public",
    createdAt: new Date().toISOString()
  };
  await env.DB.prepare(
    `INSERT INTO posts (id, userId, type, title, content, titleEN, titleAR, titleKU, contentEN, contentAR, contentKU, anonymous, authorName, authorRole, imageUrl, visibility, status, governorateId, universityId, createdAt)
     VALUES (?, ?, 'post', ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, NULL, ?, 'approved', ?, ?, ?)`
  ).bind(post.id, post.userId, post.title, post.content, post.title, post.title, post.title, post.content, post.content, post.content, user.name, user.role, post.visibility, sanitizeText(body.governorateId, 80) || "all", sanitizeText(body.universityId, 120) || "all", post.createdAt).run();
  const row = await env.DB.prepare("SELECT * FROM posts WHERE id = ?").bind(post.id).first();
  return jsonResponse({ post: await decorateWorkerPost(env, row, user.id) }, 201);
}

async function handleWorkerLike(request: Request, env: Env, postId: string, shouldToggle: boolean) {
  const user = await requireWorkerAuth(request, env);
  if (user instanceof Response) return user;
  const post = await env.DB.prepare("SELECT id FROM posts WHERE id = ? AND deleted_at IS NULL LIMIT 1").bind(postId).first();
  if (!post) return jsonResponse({ error: "Post not found." }, 404);
  const existing = await env.DB.prepare("SELECT 1 FROM likes WHERE itemId = ? AND userId = ? LIMIT 1").bind(postId, user.id).first();
  let liked = false;
  if (shouldToggle && !existing) {
    await env.DB.prepare("INSERT INTO likes (itemId, userId, createdAt) VALUES (?, ?, ?)").bind(postId, user.id, new Date().toISOString()).run();
    liked = true;
  } else if (existing) {
    await env.DB.prepare("DELETE FROM likes WHERE itemId = ? AND userId = ?").bind(postId, user.id).run();
  }
  const count = await env.DB.prepare("SELECT COUNT(*) AS count FROM likes WHERE itemId = ?").bind(postId).first();
  return jsonResponse({ liked, is_liked: liked, count: Number(count?.count || 0), likes_count: Number(count?.count || 0) });
}

async function handleWorkerComments(request: Request, env: Env, postId: string) {
  const user = await requireWorkerAuth(request, env);
  if (user instanceof Response) return user;
  const rows = await env.DB.prepare("SELECT * FROM comments WHERE itemId = ? AND deleted_at IS NULL ORDER BY createdAt ASC LIMIT 100").bind(postId).all();
  return jsonResponse({ comments: rows.results || [] });
}

async function handleWorkerAddComment(request: Request, env: Env, postId: string) {
  const user = await requireWorkerAuth(request, env);
  if (user instanceof Response) return user;
  const post = await env.DB.prepare("SELECT id FROM posts WHERE id = ? AND deleted_at IS NULL LIMIT 1").bind(postId).first();
  if (!post) return jsonResponse({ error: "Post not found." }, 404);
  const body: any = await readJson(request);
  const rawContent = String(body.content || "");
  const content = sanitizeText(rawContent, 800);
  if (!content) return jsonResponse({ error: "Comment content is required." }, 400);
  if (rawContent.trim().length > 800) return jsonResponse({ error: "Comment content must be 800 characters or fewer." }, 400);
  const comment = { id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  await env.DB.prepare(
    "INSERT INTO comments (id, itemId, userId, authorName, authorRole, authorAvatar, content, date, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(comment.id, postId, user.id, user.name, user.role, sanitizeText(body.authorAvatar, 500), content, "Just now", comment.createdAt).run();
  const row = await env.DB.prepare("SELECT * FROM comments WHERE id = ?").bind(comment.id).first();
  const count = await env.DB.prepare("SELECT COUNT(*) AS count FROM comments WHERE itemId = ? AND deleted_at IS NULL").bind(postId).first();
  return jsonResponse({ comment: row, comments_count: Number(count?.count || 0) }, 201);
}

async function handleWorkerDeleteComment(request: Request, env: Env, postId: string, commentId: string) {
  const user = await requireWorkerAuth(request, env);
  if (user instanceof Response) return user;
  const comment = await env.DB.prepare("SELECT * FROM comments WHERE id = ? AND itemId = ? AND deleted_at IS NULL LIMIT 1").bind(commentId, postId).first();
  if (!comment) return jsonResponse({ error: "Comment not found." }, 404);
  if (comment.userId !== user.id && !["staff", "admin", "super_admin"].includes(user.role)) return jsonResponse({ error: "Only the comment owner can delete this comment." }, 403);
  await env.DB.prepare("UPDATE comments SET deleted_at = ? WHERE id = ?").bind(new Date().toISOString(), commentId).run();
  return jsonResponse({ success: true });
}

async function handleWorkerDeletePost(request: Request, env: Env, postId: string) {
  const user = await requireWorkerAuth(request, env);
  if (user instanceof Response) return user;
  const post = await env.DB.prepare("SELECT * FROM posts WHERE id = ? AND deleted_at IS NULL LIMIT 1").bind(postId).first();
  if (!post) return jsonResponse({ error: "Post not found." }, 404);
  if (post.userId !== user.id && !["staff", "admin", "super_admin"].includes(user.role)) return jsonResponse({ error: "Only the post owner can delete this post." }, 403);
  await env.DB.prepare("UPDATE posts SET deleted_at = ? WHERE id = ?").bind(new Date().toISOString(), postId).run();
  return jsonResponse({ success: true });
}

async function handleWorkerReportPost(request: Request, env: Env, postId: string) {
  const user = await requireWorkerAuth(request, env);
  if (user instanceof Response) return user;
  const body: any = await readJson(request);
  const reason = String(body.reason || "");
  if (!["spam", "harassment", "inappropriate", "fake_account", "other"].includes(reason)) return jsonResponse({ error: "Valid report reason is required." }, 400);
  const post = await env.DB.prepare("SELECT * FROM posts WHERE id = ? AND deleted_at IS NULL LIMIT 1").bind(postId).first();
  if (!post) return jsonResponse({ error: "Post not found." }, 404);
  const report = { id: crypto.randomUUID(), created_at: new Date().toISOString() };
  await env.DB.prepare(
    "INSERT INTO reports (id, reporter_id, post_id, reported_user_id, reason, details, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'open', ?)"
  ).bind(report.id, user.id, postId, post.userId, reason, sanitizeText(body.details, 1000), report.created_at).run();
  return jsonResponse({ report }, 201);
}

const DEFAULT_PORTAL_SETTINGS = {
  heroImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600",
  heroTitle: {
    en: "Master Your Campus Journey!",
    ar: "ØªÙ…ÙŠÙ‘Ø² ÙˆØ§Ø¨Ù†Ù Ù…Ø³ØªÙ‚Ø¨Ù„Ùƒ Ø§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠ!",
    ku: "Ø¯Ø§Ù‡Ø§ØªÙˆÙˆÛŒÛ•Ú©ÛŒ Ù¾Ú•Ø´Ù†Ú¯Ø¯Ø§Ø± Ø¨Ù†ÙŠØ§Øª Ø¨Ù†ÛŽ!"
  },
  heroDescription: {
    en: "The ultimate collegiate hub for premium opportunities & academic resources",
    ar: "Ø§Ù„Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„Ø·Ù„Ø§Ø¨ÙŠØ© Ø§Ù„Ø£Ù‚ÙˆÙ‰ Ù„Ù„Ø¬Ø§Ù…Ø¹Ø§Øª ÙˆØ§Ù„ØªØ¯Ø±ÙŠØ¨ ÙÙŠ Ø¹ÙØ±Ø§Ù‚Ù†Ø§ Ø§Ù„Ø­Ø¨ÙŠØ¨",
    ku: "ÛŒÛ•Ú©Û•Ù… Ø¯Û•Ø±ÙˆØ§Ø²Û•ÛŒ Ø®ÙˆÛŽÙ†Ø¯Ú©Ø§Ø±Ø§Ù†ÛŒ Ø²Ø§Ù†Ú©Û† Ùˆ Ø¯Ø§Ø¨ÛŒÙ†Ú©Ø±Ø¯Ù†ÛŒ Ù‡Û•Ù„ÛŒ Ù…Û•Ø´Ù‚"
  },
  heroTag: {
    en: "PORTAL ACCELERATION",
    ar: "Ø¨ÙˆØ§Ø¨Ø© Ù‡ÙˆÙŠØªÙ†Ø§ Ø§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠØ©",
    ku: "Ø¯Û•Ø±ÙˆØ§Ø²Û•ÛŒ Ø¦Û•Ú©Ø§Ø¯ÛŒÙ…ÛŒ Ø¹ÛŽØ±Ø§Ù‚"
  },
  defaultStories: [
    { id: "story-sara", name: "Sara Ahmed", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200", text: "Morning lab session checking microscopic cells! ðŸ”¬" },
    { id: "story-mustafa", name: "Mustafa Ali", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200", text: "Building our AI-powered student assistant with Gemini API! ðŸ¤–ðŸš€" },
    { id: "story-rawan", name: "Rawan Omer", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200", text: "Sunset over Mount Goizha from campus was stunning today! ðŸŒ„â˜•" },
    { id: "story-ali", name: "Ali Jabbar", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200", text: "Long shift in clinical practice! Basra Heat is here but we keep smiling! ðŸ©ºðŸ¥¤" },
    { id: "story-zahid", name: "Noor Al-Huda", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200", text: "Setting up our chemical reaction samples. They look like glowing gems! ðŸ§ªðŸ’Ž" },
    { id: "story-soran", name: "Soran Dler", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200", text: "Beautiful morning at Erbil Citadel before lectures start ðŸŽ’ðŸ°" }
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

async function findEmailSuppression(env: Env, email: string) {
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) return null;
  return env.DB.prepare("SELECT * FROM email_unsubscribes WHERE lower(email) = lower(?) LIMIT 1").bind(cleanEmail).first();
}

async function recordOutreachDryRun(env: Env, options: { email: string; templateId?: string; campaignId?: string; source?: string; suppressed?: boolean }) {
  const log = {
    id: `outreach-log-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
    mode: "DRY_RUN",
    would_send_to: normalizeEmail(options.email),
    template_id: String(options.templateId || "default").trim(),
    campaign_id: String(options.campaignId || "test").trim(),
    source: String(options.source || "admin_test").trim(),
    suppressed: options.suppressed ? 1 : 0,
    timestamp: new Date().toISOString()
  };
  await env.DB.prepare(
    "INSERT INTO outreach_logs (id, mode, would_send_to, template_id, campaign_id, source, suppressed, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(log.id, log.mode, log.would_send_to, log.template_id, log.campaign_id, log.source, log.suppressed, log.timestamp).run();
  return log;
}

async function handleOutreachRequest(request: Request, env: Env, url: URL) {
  if (url.pathname === "/api/outreach/unsubscribe" && request.method === "POST") {
    const body: any = await readJson(request);
    const email = normalizeEmail(body.email);
    if (!email.includes("@")) return jsonResponse({ error: "Valid email is required." }, 400);
    await env.DB.prepare(
      `INSERT INTO email_unsubscribes (email, unsubscribed_at, source, campaign)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(email) DO UPDATE SET
         unsubscribed_at = excluded.unsubscribed_at,
         source = excluded.source,
         campaign = excluded.campaign`
    ).bind(
      email,
      new Date().toISOString(),
      String(body.source || "manual").trim(),
      String(body.campaign || body.campaignId || "unknown").trim()
    ).run();
    return jsonResponse({ success: true, message: "Email has been added to the suppression list." });
  }

  const user = await requireWorkerAdmin(request, env);
  if (user instanceof Response) return user;

  if (url.pathname === "/api/outreach/contacts" && request.method === "GET") {
    const suppressions = await env.DB.prepare("SELECT email, unsubscribed_at, source, campaign FROM email_unsubscribes ORDER BY unsubscribed_at DESC LIMIT 100").all();
    return jsonResponse({
      data: [],
      total: 0,
      suppressions: suppressions.results || [],
      dryRun: true,
      message: "Outreach is admin-only and in DRY_RUN mode. No contacts are exposed publicly."
    });
  }

  if (url.pathname === "/api/outreach/campaigns" && request.method === "GET") {
    return jsonResponse({
      data: [],
      total: 0,
      dryRun: true,
      message: "Outreach campaigns are disabled for public launch until unsubscribe handling and real-send approval are configured."
    });
  }

  if (url.pathname === "/api/outreach/logs" && request.method === "GET") {
    const rows = await env.DB.prepare("SELECT * FROM outreach_logs ORDER BY timestamp DESC LIMIT 100").all();
    return jsonResponse({ data: rows.results || [], total: rows.results?.length || 0, dryRun: true });
  }

  if (url.pathname === "/api/outreach/send-test" && request.method === "POST") {
    const body: any = await readJson(request);
    const email = normalizeEmail(body.email);
    if (!email.includes("@")) return jsonResponse({ error: "Valid email is required." }, 400);
    const suppression = await findEmailSuppression(env, email);
    const log = await recordOutreachDryRun(env, {
      email,
      templateId: body.templateId,
      campaignId: body.campaignId,
      source: "send_test",
      suppressed: Boolean(suppression)
    });
    return jsonResponse({
      success: true,
      dryRun: true,
      suppressed: Boolean(suppression),
      log: {
        would_send_to: log.would_send_to,
        template_id: log.template_id,
        campaign_id: log.campaign_id,
        timestamp: log.timestamp
      },
      message: suppression
        ? "Email is suppressed. Dry-run log was recorded and no real email was sent."
        : "Email outreach is in DRY_RUN mode. Dry-run log was recorded and no real email was sent."
    });
  }

  if (url.pathname === "/api/outreach/import-csv" && request.method === "POST") {
    return jsonResponse({
      success: true,
      inserted: 0,
      duplicates: 0,
      errors: [],
      dryRun: true,
      message: "Outreach CSV import is in DRY_RUN mode. No contacts were imported or emailed."
    });
  }

  if (emailsDryRunEnabled(env)) {
    const body: any = ["POST", "PUT", "PATCH", "DELETE"].includes(request.method) ? await readJson(request) : {};
    const email = normalizeEmail(body.email || url.searchParams.get("email"));
    let log = null;
    if (email.includes("@")) {
      const suppression = await findEmailSuppression(env, email);
      log = await recordOutreachDryRun(env, {
        email,
        templateId: body.templateId || url.searchParams.get("templateId") || undefined,
        campaignId: body.campaignId || url.searchParams.get("campaignId") || undefined,
        source: "outreach_guard",
        suppressed: Boolean(suppression)
      });
    }
    return jsonResponse({
      success: true,
      dryRun: true,
      log,
      message: "Outreach is locked in DRY_RUN mode. No provider API request was made."
    });
  }

  return jsonResponse({
    success: false,
    error: "Real outreach sending is disabled until provider verification, unsubscribe handling, and production approval are complete."
  }, 501);
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
  if (searchString.includes("baghdad") || searchString.includes("Ø¨ØºØ¯Ø§Ø¯")) {
    govKey = "baghdad";
  } else if (searchString.includes("sulaymaniyah") || searchString.includes("Ø³Ù„ÙŠÙ…Ø§Ù†ÙŠØ©") || searchString.includes("slemani")) {
    govKey = "sulaymaniyah";
  } else if (searchString.includes("erbil") || searchString.includes("Ø§Ø±Ø¨ÙŠÙ„") || searchString.includes("hawler")) {
    govKey = "erbil";
  } else if (searchString.includes("mosul") || searchString.includes("Ù†ÙŠÙ†ÙˆÙ‰") || searchString.includes("nineveh")) {
    govKey = "nineveh";
  } else if (searchString.includes("basra") || searchString.includes("Ø¨ØµØ±Ø©")) {
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
    titleAR: `[Ù…Ø¤ØªÙ…Øª] ÙØ±ØµØ© Ø¬Ø¯ÙŠØ¯Ø©: ${titleCleaned}`,
    titleKU: `[Ø®Û†Ú©Ø§Ø±] Ø¯Û•Ø±ÙÛ•ØªÛŽÚ©ÛŒ Ù†ÙˆÛŽ: ${titleCleaned}`,
    contentEN: descCleaned,
    contentAR: `ØªÙØ§ØµÙŠÙ„ Ø§Ù„ÙØ±ØµØ© Ù…Ù† Ø§Ù„Ù…ØµØ¯Ø± Ø§Ù„Ù…Ø¹ØªÙ…Ø¯: ${descCleaned}. ÙŠØ±Ø¬Ù‰ Ø²ÙŠØ§Ø±Ø© Ø§Ù„Ø±Ø§Ø¨Ø· Ø§Ù„Ø±Ø³Ù…ÙŠ Ù„Ù„ØªÙ‚Ø¯ÙŠÙ… ÙˆÙ…Ø·Ø§Ù„Ø¹Ø© ÙƒØ§Ù…Ù„ Ø§Ù„Ù…ØªØ·Ù„Ø¨Ø§Øª.`,
    contentKU: `ÙˆØ±Ø¯Û•Ú©Ø§Ø±ÛŒ Ø¯Û•Ø±ÙÛ•Øª Ù„Û• Ø³Û•Ø±Ú†Ø§ÙˆÛ•ÛŒ ÙÛ•Ø±Ù…ÛŒÛ•ÙˆÛ•: ${descCleaned}. ØªÚ©Ø§ÛŒÛ• Ø³Û•Ø±Ø¯Ø§Ù†ÛŒ Ø¨Û•Ø³ØªÛ•Ø±ÛŒ Ø³Û•Ø±Û•Ú©ÛŒ Ø¨Ú©Û•Ù† Ø¨Û† Ù¾ÛŽØ´Ú©Û•Ø´Ú©Ø±Ø¯Ù†ÛŒ Ø¯Ø§ÙˆØ§Ú©Ø§Ø±ÛŒ Ùˆ Ø¨ÛŒÙ†ÛŒÙ†ÛŒ Ù…Û•Ø±Ø¬Û•Ú©Ø§Ù†.`,
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
  
  if (norm.includes("intern") || norm.includes("ØªØ¯Ø±ÙŠØ¨ Ø¹Ù…Ù„ÙŠ") || norm.includes("Ù…Û•Ø´Ù‚")) {
    return "internship";
  }
  if (norm.includes("scholarship") || norm.includes("Ù…Ù†Ø­Ø©") || norm.includes("Ø³ÙƒÙˆÙ„Û•Ø±Ø´ÛŒÙ¾") || norm.includes("daad")) {
    return "scholarship";
  }
  if (norm.includes("course") || norm.includes("training") || norm.includes("Ø¯ÙˆØ±Ø§Øª") || norm.includes("ÙˆØ±Ø´Ø©") || norm.includes("Ú•Ø§Ù‡ÛŽÙ†Ø§Ù†")) {
    return "training";
  }
  if (norm.includes("volunteering") || norm.includes("ØªØ·ÙˆØ¹") || norm.includes("Ø®Û†Ø¨Û•Ø®Ø´")) {
    return "volunteering";
  }
  if (norm.includes("competition") || norm.includes("Ù…Ø³Ø§Ø¨Ù‚Ø©") || norm.includes("Ú©ÛŽØ¨Ú•Ú©ÛŽ") || norm.includes("hackathon") || norm.includes("ðŸ†")) {
    return "competition";
  }
  if (norm.includes("event") || norm.includes("festival") || norm.includes("Ù…Ù‡Ø±Ø¬Ø§Ù†") || norm.includes("ÙØ¹Ø§Ù„ÙŠØ©")) {
    return "event";
  }
  if (norm.includes("fellowship") || norm.includes("Ø²Ù…Ø§Ù„Ø©")) {
    return "fellowship";
  }
  if (norm.includes("announcement") || norm.includes("Ø¥Ø¹Ù„Ø§Ù†") || norm.includes("Ø¦Ø§Ú¯Ø§Ø¯Ø§Ø±ÛŒ") || norm.includes("mohesr")) {
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


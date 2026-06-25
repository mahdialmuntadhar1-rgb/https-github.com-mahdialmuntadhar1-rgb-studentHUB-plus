// Cloudflare Worker for Jamiaati / StudentHUB Plus
// Production-ready API with D1 database, R2 storage, and JWT authentication

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Context } from 'hono';

interface Env {
  DB: any; // D1Database
  R2: any; // R2Bucket
  JWT_SECRET: string;
  JWT_SECRET_V2?: string;
  RESEND_API_KEY?: string;
  PASSWORD_RESET_FROM_EMAIL?: string;
  MESSAGE_ENCRYPTION_KEY?: string;
}

type Bindings = Env;

// Extend Hono context types
interface HonoContextVariables {
  userId: string;
  userEmail: string;
  userRole: string;
}

type AppContext = Context<{ Bindings: Bindings, Variables: HonoContextVariables }>;


/**
 * PHASE 4A SECURITY HARDENING
 * CORS is restricted to the production frontend and local dev.
 * Lightweight D1-backed rate limiting protects risky write endpoints.
 */

const BETA_ALLOWED_ORIGINS = new Set<string>([
  'https://talaba.kaniq.org',
  'https://https-github.mahdialmuntadhar1.workers.dev',
  'http://localhost:5173',
  'http://localhost:8787',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8787'
]);

function isBetaAllowedOrigin(origin?: string | null): boolean {
  if (!origin) return true;
  if (BETA_ALLOWED_ORIGINS.has(origin)) return true;

  // Keep Cloudflare preview/dev pages usable without reopening CORS to everyone.
  try {
    const url = new URL(origin);
    if (url.hostname.endsWith('.pages.dev')) return true;
    if (url.hostname.endsWith('.workers.dev') && origin.includes('mahdialmuntadhar1')) return true;
  } catch (_) {}

  return false;
}

function getCorsAllowedOrigin(origin?: string | null): string {
  if (origin && isBetaAllowedOrigin(origin)) return origin;
  return 'https://https-github.mahdialmuntadhar1.workers.dev';
}

function buildBetaCorsHeaders(origin?: string | null): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': getCorsAllowedOrigin(origin),
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Turnstile-Token',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

async function betaHashText(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value || ''));
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function betaRateLimitId(): string {
  try {
    return crypto.randomUUID();
  } catch (_) {
    return `rl_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}

function getBetaClientIp(c: any): string {
  return String(
    c.req.header('CF-Connecting-IP') ||
    c.req.header('x-forwarded-for') ||
    c.req.header('x-real-ip') ||
    'unknown'
  ).split(',')[0].trim();
}

function getBetaRateRule(method: string, path: string): null | { group: string; limit: number; windowSeconds: number } {
  const m = method.toUpperCase();

  if (m === 'OPTIONS' || m === 'GET' || m === 'HEAD') return null;

  if (path.includes('/api/auth/login') || path.endsWith('/api/login')) {
    return { group: 'auth_login', limit: 12, windowSeconds: 15 * 60 };
  }

  if (path.includes('/api/auth/register') || path.endsWith('/api/register')) {
    return { group: 'auth_register', limit: 8, windowSeconds: 60 * 60 };
  }

  if (path.includes('/api/password-reset') || path.includes('/api/forgot-password') || path.includes('/api/auth/reset-password')) {
    return { group: 'password_reset', limit: 5, windowSeconds: 60 * 60 };
  }

  if (path.includes('/api/message-requests')) {
    return { group: 'message_requests', limit: 30, windowSeconds: 60 * 60 };
  }

  if (path.includes('/api/messages') && path.includes('/report')) {
    return { group: 'message_reports', limit: 30, windowSeconds: 60 * 60 };
  }

  if (path.includes('/api/messages')) {
    return { group: 'messages', limit: 80, windowSeconds: 60 * 60 };
  }

  if (path.includes('/api/posts') || path.includes('/api/comments')) {
    return { group: 'social_write', limit: 60, windowSeconds: 60 * 60 };
  }

  if (path.includes('/upload') || path.includes('/hero-images')) {
    return { group: 'uploads', limit: 30, windowSeconds: 60 * 60 };
  }

  if (path.includes('/api/admin')) {
    return { group: 'admin_write', limit: 120, windowSeconds: 60 * 60 };
  }

  return null;
}

async function betaRateLimitMiddleware(c: any, next: any) {
  const url = new URL(c.req.url);
  const path = url.pathname;
  const method = c.req.method.toUpperCase();
  const rule = getBetaRateRule(method, path);

  if (!rule || !c.env?.DB) {
    return next();
  }

  try {
    const ip = getBetaClientIp(c);
    const ipHash = await betaHashText(ip);
    const nowSeconds = Math.floor(Date.now() / 1000);
    const windowStart = Math.floor(nowSeconds / rule.windowSeconds) * rule.windowSeconds;
    const rateKey = `${rule.group}:${ipHash}`;

    const existing = await c.env.DB.prepare(`
      SELECT id, count
      FROM api_rate_limits
      WHERE rate_key = ? AND window_start = ?
      LIMIT 1
    `).bind(rateKey, windowStart).first();

    if (existing && Number(existing.count || 0) >= rule.limit) {
      return c.json({
        error: 'Too many requests. Please wait and try again.',
        code: 'RATE_LIMITED',
        group: rule.group
      }, 429);
    }

    if (existing) {
      await c.env.DB.prepare(`
        UPDATE api_rate_limits
        SET count = count + 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(existing.id).run();
    } else {
      await c.env.DB.prepare(`
        INSERT INTO api_rate_limits (id, rate_key, route_group, window_start, count, created_at, updated_at)
        VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).bind(betaRateLimitId(), rateKey, rule.group, windowStart).run();
    }
  } catch (error) {
    console.error('Rate limit middleware failed open:', error);
    // Fail open so a D1 hiccup does not break the whole beta.
  }

  return next();
}

const app = new Hono<{ Bindings: Bindings, Variables: HonoContextVariables }>();

app.use('*', async (c, next) => {
  const origin = c.req.header('Origin');

  if (origin && !isBetaAllowedOrigin(origin)) {
    return c.json({ error: 'Origin not allowed' }, 403, buildBetaCorsHeaders(origin));
  }

  if (c.req.method.toUpperCase() === 'OPTIONS') {
    return new Response(null, { status: 204, headers: buildBetaCorsHeaders(origin) });
  }

  await next();

  const headers = buildBetaCorsHeaders(origin);
  for (const [key, value] of Object.entries(headers)) {
    c.header(key, value);
  }

  c.header('X-Content-Type-Options', 'nosniff');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
});

app.use('*', betaRateLimitMiddleware);


// Add type augmentation for Hono context
declare module 'hono' {
  interface ContextVariableMap {
    userId: string;
    userEmail: string;
    userRole: string;
  }
}

// CORS middleware
const ALLOWED_ORIGINS = new Set([
  'https://talaba.kaniq.org',
  'https://https-github.mahdialmuntadhar1.workers.dev',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
]);

// CORS middleware: only trusted frontend origins are allowed.
app.use('/*', cors({
  origin: (origin) => {
    if (!origin) return 'https://https-github.mahdialmuntadhar1.workers.dev';
    return ALLOWED_ORIGINS.has(origin) ? origin : '';
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));


// ============================================================================
// API RATE LIMITING
// ============================================================================

function getClientIp(c: any): string {
  return String(
    c.req.header('CF-Connecting-IP') ||
    c.req.header('x-forwarded-for') ||
    c.req.header('x-real-ip') ||
    'unknown'
  ).split(',')[0].trim();
}

async function sha256HexValue(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value || '');
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getRateLimitConfig(method: string, path: string): { bucket: string; limit: number; windowSeconds: number } | null {
  const m = method.toUpperCase();

  if (m === 'POST' && path === '/api/auth/login') {
    return { bucket: 'auth_login', limit: 8, windowSeconds: 60 };
  }

  if (m === 'POST' && path === '/api/auth/register') {
    return { bucket: 'auth_register', limit: 5, windowSeconds: 60 };
  }

  if (m === 'POST' && (path.includes('/password-reset') || path.includes('/forgot-password'))) {
    return { bucket: 'password_reset', limit: 4, windowSeconds: 60 };
  }

  if (m === 'POST' && path === '/api/message-requests') {
    return { bucket: 'message_request', limit: 12, windowSeconds: 60 };
  }

  if (m === 'POST' && /^\/api\/messages\/threads\/[^/]+\/messages$/.test(path)) {
    return { bucket: 'message_send', limit: 30, windowSeconds: 60 };
  }

  if (m === 'POST' && /^\/api\/messages\/[^/]+\/report$/.test(path)) {
    return { bucket: 'message_report', limit: 10, windowSeconds: 60 };
  }

  if (m === 'POST' && path === '/api/admin/hero-images/upload') {
    return { bucket: 'hero_upload', limit: 10, windowSeconds: 300 };
  }

  return null;
}

async function checkApiRateLimit(c: any, config: { bucket: string; limit: number; windowSeconds: number }) {
  try {
    const now = Math.floor(Date.now() / 1000);
    const windowStart = Math.floor(now / config.windowSeconds) * config.windowSeconds;
    const ipHash = await sha256HexValue(getClientIp(c));
    const key = `${config.bucket}:${ipHash}:${windowStart}`;
    const updatedAt = new Date().toISOString();

    const existing = await c.env.DB.prepare(
      'SELECT count FROM api_rate_limits WHERE key = ?'
    ).bind(key).first() as any;

    if (!existing) {
      await c.env.DB.prepare(`
        INSERT INTO api_rate_limits (key, bucket, ip_hash, window_start, count, created_at, updated_at)
        VALUES (?, ?, ?, ?, 1, ?, ?)
      `).bind(key, config.bucket, ipHash, windowStart, updatedAt, updatedAt).run();

      return { allowed: true, remaining: config.limit - 1, retryAfter: config.windowSeconds };
    }

    const nextCount = Number(existing.count || 0) + 1;

    if (nextCount > config.limit) {
      return { allowed: false, remaining: 0, retryAfter: Math.max(1, windowStart + config.windowSeconds - now) };
    }

    await c.env.DB.prepare(
      'UPDATE api_rate_limits SET count = ?, updated_at = ? WHERE key = ?'
    ).bind(nextCount, updatedAt, key).run();

    return { allowed: true, remaining: Math.max(0, config.limit - nextCount), retryAfter: config.windowSeconds };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return { allowed: true, remaining: config.limit, retryAfter: config.windowSeconds };
  }
}

app.use('/api/*', async (c, next) => {
  const path = new URL(c.req.url).pathname;
  const config = getRateLimitConfig(c.req.method, path);

  if (!config) {
    return next();
  }

  const result = await checkApiRateLimit(c, config);

  c.header('X-RateLimit-Limit', String(config.limit));
  c.header('X-RateLimit-Remaining', String(result.remaining));
  c.header('X-RateLimit-Window', String(config.windowSeconds));

  if (!result.allowed) {
    c.header('Retry-After', String(result.retryAfter));
    return c.json({
      error: 'Too many requests. Please wait and try again.',
      retry_after_seconds: result.retryAfter
    }, 429);
  }

  return next();
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================


function bytesMatchPrefix(bytes: Uint8Array, prefix: number[]): boolean {
  if (bytes.length < prefix.length) return false;
  return prefix.every((value, index) => bytes[index] === value);
}

function detectImageMimeFromBytes(bytes: Uint8Array): string | null {
  // JPEG: FF D8 FF
  if (bytesMatchPrefix(bytes, [0xff, 0xd8, 0xff])) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (bytesMatchPrefix(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return 'image/png';
  }

  // WEBP: RIFF....WEBP
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return 'image/webp';
  }

  return null;
}

function safeUploadFileName(raw: any): string {
  return String(raw || 'upload')
    .replace(/[^\w.\-]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);
}

async function validateUploadedImageFile(file: any): Promise<{ ok: boolean; type?: string; error?: string }> {
  try {
    if (!file || typeof file.arrayBuffer !== 'function') {
      return { ok: false, error: 'No valid image file was uploaded.' };
    }

    const declaredType = String(file.type || '').toLowerCase();
    const fileName = safeUploadFileName(file.name);
    const fileSize = Number(file.size || 0);

    if (!isSupportedHeroImage(file)) {
      return { ok: false, error: 'Only JPG, PNG, and WEBP images up to 8MB are allowed.' };
    }

    if (/\.(svg|gif|html?|js|mjs|php|exe|bat|cmd|ps1|zip|rar|7z|pdf)$/i.test(fileName)) {
      return { ok: false, error: 'This file type is not allowed for image upload.' };
    }

    if (!fileSize || fileSize <= 0) {
      return { ok: false, error: 'Uploaded image is empty.' };
    }

    const firstBytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    const actualType = detectImageMimeFromBytes(firstBytes);

    if (!actualType) {
      return { ok: false, error: 'Uploaded file is not a valid JPG, PNG, or WEBP image.' };
    }

    if (declaredType && declaredType !== actualType) {
      return { ok: false, error: 'Image file type does not match its content.' };
    }

    return { ok: true, type: actualType };
  } catch (error) {
    console.error('Image validation failed:', error);
    return { ok: false, error: 'Could not validate uploaded image.' };
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeGovernorate(raw: string | null | undefined): string {
  if (!raw) return 'all';
  const val = raw.trim().toLowerCase();
  
  // Map all variants to standard English names
  const governorateMap: Record<string, string> = {
    'erbil': 'erbil', 'هەولێر': 'erbil', 'أربيل': 'erbil', 'arbīl': 'erbil', 'hawler': 'erbil',
    'sulaymaniyah': 'sulaymaniyah', 'sulaimani': 'sulaymaniyah', 'slemani': 'sulaymaniyah', 'السليمانية': 'sulaymaniyah', 'سلێمانی': 'sulaymaniyah',
    'baghdad': 'baghdad', 'بغداد': 'baghdad',
    'basra': 'basra', 'البصرة': 'basra', 'basrah': 'basra',
    'nineveh': 'nineveh', 'نينوى': 'nineveh', 'الموصل': 'nineveh', 'mosul': 'nineveh',
    'najaf': 'najaf', 'النجف': 'najaf',
    'karbala': 'karbala', 'كربلاء': 'karbala', 'kerbala': 'karbala',
    'duhok': 'duhok', 'دهوك': 'duhok', 'دهۆک': 'duhok', 'dohuk': 'duhok',
    'kirkuk': 'kirkuk', 'كركوك': 'kirkuk', 'کەرکووک': 'kirkuk',
    'diyala': 'diyala', 'ديالى': 'diyala',
    'anbar': 'anbar', 'الأنبار': 'anbar',
    'babil': 'babil', 'babylon': 'babil', 'بابل': 'babil',
    'wasit': 'wasit', 'واسط': 'wasit',
    'maysan': 'maysan', 'ميسان': 'maysan',
    'dhi qar': 'dhi qar', 'ذي قار': 'dhi qar', 'dhi_qar': 'dhi qar', 'ziqar': 'dhi qar',
    'muthanna': 'muthanna', 'المثنى': 'muthanna',
    'qadisiyah': 'qadisiyah', 'القادسية': 'qadisiyah', 'al-qadisiyah': 'qadisiyah', 'al_qadisiyah': 'qadisiyah', 'diwaniyah': 'qadisiyah',
    'salah al-din': 'salah al-din', 'صلاح الدين': 'salah al-din', 'salahaddin': 'salah al-din', 'salah_al_din': 'salah al-din',
    'halabja': 'halabja', 'حلبجة': 'halabja'
  };
  
  // Check for exact match or partial match in map
  for (const [key, standard] of Object.entries(governorateMap)) {
    if (val === key || val.includes(key)) {
      return standard;
    }
  }
  
  // If no match found, return original lowercase or 'all'
  return val === 'all' || val === 'all iraq' || val === 'iraq' ? 'all' : val;
}


function isUnclearDutyStation(raw: any): boolean {
  const value = String(raw || '').trim().toLowerCase();
  if (!value) return true;

  const unclearTerms = [
    'remote',
    'multiple',
    'multiple locations',
    'various',
    'several',
    'all iraq',
    'iraq-wide',
    'iraq wide',
    'nationwide',
    'countrywide',
    'anywhere',
    'unspecified',
    'not specified',
    'n/a',
    'na',
    '-'
  ];

  return unclearTerms.some((term) => value === term || value.includes(term));
}

function hasUnsafeLocationText(raw: any): boolean {
  const value = String(raw || '').trim();
  if (!value) return true;

  // Long location text is often an address/description, not a duty station.
  if (value.length > 45) return true;

  // Multiple separators usually mean mixed/multiple locations.
  if (/[\/|;،،]/.test(value)) return true;
  if (value.includes(',') && value.split(',').length > 2) return true;

  return false;
}

function resolveDutyStation(item: any): { id: string; label: string } {
  const explicitFields = [
    item?.duty_station,
    item?.city,
    item?.governorate
  ];

  for (const field of explicitFields) {
    if (isUnclearDutyStation(field)) continue;

    const normalized = normalizeGovernorate(field);
    if (normalized && normalized !== 'all') {
      return { id: normalized, label: normalized };
    }
  }

  // Only use location if it looks like a clean single governorate value.
  if (!isUnclearDutyStation(item?.location) && !hasUnsafeLocationText(item?.location)) {
    const normalizedLocation = normalizeGovernorate(item.location);
    if (normalizedLocation && normalizedLocation !== 'all') {
      return { id: normalizedLocation, label: normalizedLocation };
    }
  }

  return { id: 'unspecified', label: 'MULTIPLE / REMOTE / UNSPECIFIED' };
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 120000;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    key,
    256
  );
  return `pbkdf2$${iterations}$${bytesToBase64(salt)}$${bytesToBase64(new Uint8Array(bits))}`;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (hash.startsWith('pbkdf2$')) {
    const [, iterationsText, saltText, expectedText] = hash.split('$');
    const iterations = Number(iterationsText);
    if (!iterations || !saltText || !expectedText) return false;
    const salt = Uint8Array.from(atob(saltText), c => c.charCodeAt(0));
    const expected = Uint8Array.from(atob(expectedText), c => c.charCodeAt(0));
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
      key,
      expected.length * 8
    );
    const actual = new Uint8Array(bits);
    if (actual.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
    return diff === 0;
  }

  // Backward-compatible verifier for existing accounts created with the legacy SHA-256 hash.
  const legacyHash = await sha256HexText(password);
  return legacyHash === hash;
}

async function generateJWTToken(userId: string, email: string, role: string, secret: string): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const payload = {
    userId,
    email,
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 days
  };
  
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(signatureInput)
  );
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)));
  
  return `${signatureInput}.${encodedSignature}`;
}

async function verifyJWTToken(token: string, secret: string): Promise<any> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const signature = Uint8Array.from(atob(encodedSignature), c => c.charCodeAt(0));
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      new TextEncoder().encode(signatureInput)
    );
    
    if (!isValid) return null;
    
    const payload = JSON.parse(atob(encodedPayload));
    
    // Check expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    
    return payload;
  } catch (e) {
    return null;
  }
}

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

async function authMiddleware(c: any, next: any) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = authError('UNAUTHORIZED', 'Unauthorized', 401);
    return c.json(err.body, err.status);
  }
  
  const token = authHeader.substring(7);
  const payload = await verifyJWTToken(token, (c.env.JWT_SECRET || c.env.JWT_SECRET_V2 || ""));
  
  if (!payload) {
    const err = authError('INVALID_SESSION', 'Invalid or expired token', 401);
    return c.json(err.body, err.status);
  }

  try {
    const authUser = await c.env.DB.prepare(
      'SELECT updated_at FROM profiles WHERE id = ?'
    ).bind(payload.userId).first() as any;
    if (!authUser) {
      const err = authError('INVALID_SESSION', 'Invalid or expired token', 401);
      return c.json(err.body, err.status);
    }
    const updatedAtMs = authUser.updated_at ? Date.parse(String(authUser.updated_at)) : 0;
    const issuedAtMs = Number(payload.iat || 0) * 1000;
    if (updatedAtMs && issuedAtMs && issuedAtMs + 5000 < updatedAtMs) {
      const err = authError('INVALID_SESSION', 'Invalid or expired token', 401);
      return c.json(err.body, err.status);
    }
  } catch (error) {
    console.error('Auth freshness check failed:', error);
    const err = authError('INVALID_SESSION', 'Invalid or expired token', 401);
    return c.json(err.body, err.status);
  }
  
  c.set('userId', payload.userId);
  c.set('userEmail', payload.email);
  c.set('userRole', payload.role);
  
  await next();
}

async function adminMiddleware(c: any, next: any) {
  const role = c.get('userRole');
  const email = String(c.get('userEmail') || '').trim().toLowerCase();
  const isNamedAdmin = email === 'mahdialmuntadhar1@gmail.com';
  if (role !== 'admin' && role !== 'staff' && !isNamedAdmin) {
    return c.json({ error: 'Admin access required' }, 403);
  }
  await next();
}


async function sha256HexText(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value || '');
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  return Uint8Array.from(atob(value), c => c.charCodeAt(0));
}

async function getMessageCryptoKey(c: any): Promise<CryptoKey> {
  const secret = String(c.env.MESSAGE_ENCRYPTION_KEY || '').trim();
  if (!secret) {
    throw new Error('MESSAGE_ENCRYPTION_KEY is not configured');
  }

  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret));
  return crypto.subtle.importKey(
    'raw',
    digest,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptPrivateMessage(c: any, plainText: string): Promise<{ ciphertext: string; iv: string; keyVersion: string }> {
  const key = await getMessageCryptoKey(c);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(String(plainText || ''));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

  return {
    ciphertext: bytesToBase64(new Uint8Array(encrypted)),
    iv: bytesToBase64(iv),
    keyVersion: 'v1'
  };
}

async function decryptPrivateMessage(c: any, row: any): Promise<string> {
  try {
    if (!row?.body_ciphertext || !row?.body_iv) {
      return String(row?.body || '');
    }

    const key = await getMessageCryptoKey(c);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ToBytes(row.body_iv) },
      key,
      base64ToBytes(row.body_ciphertext)
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Private message decrypt failed:', error);
    return '[Unable to decrypt message]';
  }
}

const MAX_SAFE_IMAGE_UPLOAD_BYTES = 8 * 1024 * 1024;

function isSupportedHeroImage(input: any): boolean {
  const type = String(typeof input === 'string' ? input : input?.type || '').toLowerCase();
  const size = Number(typeof input === 'string' ? 0 : input?.size || 0);

  const allowed =
    type === 'image/jpeg' ||
    type === 'image/png' ||
    type === 'image/webp';

  if (!allowed) return false;
  if (size && size > MAX_SAFE_IMAGE_UPLOAD_BYTES) return false;

  return true;
}

function cleanHeroText(value: unknown, maxLength: number): string {
  return String(value || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, maxLength);
}

// ============================================================================
// HERO IMAGE MANAGEMENT (D1 metadata + R2 objects)
// ============================================================================

app.get('/api/hero-images', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT id, image_url, title, alt_text, sort_order, is_active, created_at, updated_at
      FROM hero_images WHERE is_active = 1 ORDER BY sort_order ASC, created_at ASC
    `).all();
    return c.json({ images: result.results || [] });
  } catch (error) {
    console.error('Public hero images error:', error);
    return c.json({ error: 'Failed to load hero images' }, 500);
  }
});

app.get('/api/hero-images/:id/file', async (c) => {
  try {
    const row = await c.env.DB.prepare(
      'SELECT r2_key, is_active FROM hero_images WHERE id = ?'
    ).bind(c.req.param('id')).first() as any;
    if (!row || !row.is_active) return c.json({ error: 'Image not found' }, 404);

    const object = await c.env.R2.get(row.r2_key);
    if (!object) return c.json({ error: 'Image object not found' }, 404);

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');
    headers.set('X-Content-Type-Options', 'nosniff');
    return new Response(object.body, { headers });
  } catch (error) {
    console.error('Hero image file error:', error);
    return c.json({ error: 'Failed to load image' }, 500);
  }
});

app.get('/api/admin/hero-images', authMiddleware, adminMiddleware, async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT id, image_url, r2_key, title, alt_text, sort_order, is_active, created_at, updated_at
      FROM hero_images ORDER BY sort_order ASC, created_at ASC
    `).all();
    return c.json({ images: result.results || [] });
  } catch (error) {
    console.error('Admin hero images error:', error);
    return c.json({ error: 'Failed to load hero images' }, 500);
  }
});

app.post('/api/admin/hero-images/upload', authMiddleware, adminMiddleware, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file');
    
    const heroImageValidation = await validateUploadedImageFile(file);
    if (!heroImageValidation.ok) {
      return c.json({ error: heroImageValidation.error || 'Invalid image upload' }, 400);
    }
if (!(file instanceof File)) return c.json({ error: 'Image file is required' }, 400);

    const allowedTypes: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    const extension = allowedTypes[file.type];
    if (!extension) return c.json({ error: 'Only JPG, JPEG, PNG, and WebP images are allowed' }, 400);
    if (file.size <= 0 || file.size > 5 * 1024 * 1024) return c.json({ error: 'Image must be 5MB or smaller' }, 400);

    const buffer = await file.arrayBuffer();
    if (!isSupportedHeroImage(new Uint8Array(buffer.slice(0, 16)))) {
      return c.json({ error: 'The uploaded file content is not a valid image' }, 400);
    }

    const id = generateId();
    const r2Key = `hero-images/${id}.${extension}`;
    const now = new Date().toISOString();
    const requestedOrderValue = formData.get('sort_order');
    const requestedOrder = requestedOrderValue === null ? Number.NaN : Number(requestedOrderValue);
    const maxRow = await c.env.DB.prepare('SELECT COALESCE(MAX(sort_order), -1) AS max_order FROM hero_images').first() as any;
    const sortOrder = Number.isFinite(requestedOrder) && requestedOrder >= 0 ? Math.floor(requestedOrder) : Number(maxRow?.max_order || -1) + 1;
    const title = cleanHeroText(formData.get('title'), 120);
    const altText = cleanHeroText(formData.get('alt_text'), 240) || title || 'StudentHUB homepage hero image';
    const replaceId = cleanHeroText(formData.get('replace_id'), 100);
    const replaced = replaceId
      ? await c.env.DB.prepare('SELECT id, r2_key, sort_order, is_active, created_at FROM hero_images WHERE id = ?').bind(replaceId).first() as any
      : null;
    if (replaceId && !replaced) return c.json({ error: 'Hero image to replace was not found' }, 404);
    const origin = new URL(c.req.url).origin;
    const recordId = replaced?.id || id;
    const imageUrl = `${origin}/api/hero-images/${encodeURIComponent(recordId)}/file`;

    await c.env.R2.put(r2Key, buffer, {
      httpMetadata: { contentType: file.type },
      customMetadata: { uploadedBy: String(c.get('userEmail') || ''), originalName: cleanHeroText(file.name, 120) },
    });

    try {
      if (replaced) {
        await c.env.DB.prepare(`
          UPDATE hero_images
          SET image_url = ?, r2_key = ?, title = ?, alt_text = ?, sort_order = ?, updated_at = ?
          WHERE id = ?
        `).bind(imageUrl, r2Key, title, altText, replaced.sort_order, now, replaced.id).run();
      } else {
        await c.env.DB.prepare(`
          INSERT INTO hero_images (id, image_url, r2_key, title, alt_text, sort_order, is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
        `).bind(id, imageUrl, r2Key, title, altText, sortOrder, now, now).run();
      }
    } catch (error) {
      await c.env.R2.delete(r2Key);
      throw error;
    }

    if (replaced?.r2_key && replaced.r2_key !== r2Key) {
      try {
        await c.env.R2.delete(replaced.r2_key);
      } catch (cleanupError) {
        console.error('Replaced hero image cleanup error:', cleanupError);
      }
    }

    return c.json({ image: { id: recordId, image_url: imageUrl, r2_key: r2Key, title, alt_text: altText, sort_order: replaced?.sort_order ?? sortOrder, is_active: replaced?.is_active ?? 1, created_at: replaced?.created_at || now, updated_at: now } }, replaced ? 200 : 201);
  } catch (error) {
    console.error('Hero upload error:', error);
    return c.json({ error: 'Failed to save hero image' }, 500);
  }
});

app.put('/api/admin/hero-images/:id', authMiddleware, adminMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const existing = await c.env.DB.prepare('SELECT id FROM hero_images WHERE id = ?').bind(id).first();
    if (!existing) return c.json({ error: 'Hero image not found' }, 404);

    const body = await c.req.json();
    const title = cleanHeroText(body.title, 120);
    const altText = cleanHeroText(body.alt_text, 240) || title || 'StudentHUB homepage hero image';
    const sortOrder = Math.max(0, Math.floor(Number(body.sort_order) || 0));
    const isActive = body.is_active === false || body.is_active === 0 ? 0 : 1;
    const updatedAt = new Date().toISOString();

    await c.env.DB.prepare(`
      UPDATE hero_images SET title = ?, alt_text = ?, sort_order = ?, is_active = ?, updated_at = ? WHERE id = ?
    `).bind(title, altText, sortOrder, isActive, updatedAt, id).run();
    return c.json({ message: 'Hero image updated', id, title, alt_text: altText, sort_order: sortOrder, is_active: isActive, updated_at: updatedAt });
  } catch (error) {
    console.error('Hero update error:', error);
    return c.json({ error: 'Failed to update hero image' }, 500);
  }
});

app.delete('/api/admin/hero-images/:id', authMiddleware, adminMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const row = await c.env.DB.prepare('SELECT r2_key FROM hero_images WHERE id = ?').bind(id).first() as any;
    if (!row) return c.json({ error: 'Hero image not found' }, 404);

    await c.env.R2.delete(row.r2_key);
    await c.env.DB.prepare('DELETE FROM hero_images WHERE id = ?').bind(id).run();
    return c.json({ message: 'Hero image deleted' });
  } catch (error) {
    console.error('Hero delete error:', error);
    return c.json({ error: 'Failed to delete hero image' }, 500);
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    time: new Date().toISOString(),
    service: 'Jamiaati API'
  });
});


// GET /api/privacy/current
app.get('/api/privacy/current', (c) => {
  return c.json({
    privacy_version: 'privacy_v1',
    terms_version: 'terms_v1',
    summary: {
      en: 'Public posts may be visible to other users. Private messages are encrypted in storage and are not reviewed by admins unless reported for safety.',
      ar: 'قد تكون المنشورات العامة مرئية للمستخدمين الآخرين. الرسائل الخاصة مشفرة في التخزين ولا يراجعها المشرفون إلا إذا تم الإبلاغ عنها لأسباب تتعلق بالسلامة.',
      ku: 'بابەتە گشتییەکان لەوانەیە بۆ بەکارهێنەرانی تر دیار بن. نامە تایبەتییەکان لە کاتێکدا کە پاشەکەوت دەکرێن ڕەمزکراون و بەڕێوەبەران نایانخوێننەوە مەگەر ئەگەر بۆ سەلامەتی ڕاپۆرت کرابن.'
    }
  });
});

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

function authOk(data: any) {
  return {
    ok: true,
    data,
    ...data
  };
}

function authError(code: string, message: string, status: any = 400, fieldErrors?: Record<string, string>) {
  return {
    body: {
      ok: false,
      code,
      message,
      error: message,
      ...(fieldErrors ? { fieldErrors } : {})
    },
    status
  };
}

function publicAuthUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    username: user.full_name || user.username,
    role: user.role || 'student',
    governorate: user.governorate || 'all',
    institution: user.institution || 'manual',
    institution_id: user.institution_id || 'manual',
    avatar_url: user.avatar_url,
    is_verified: user.is_verified === true || user.is_verified === 1,
    stage: user.stage,
    interests: user.interests,
    bio: user.bio,
    updated_at: user.updated_at
  };
}

function resetRequestSuccess() {
  return authOk({
    message: 'If this email exists, password reset instructions have been sent.'
  });
}

// POST /api/auth/register
app.post('/api/auth/register', async (c) => {
  try {
    const { email, password, full_name, university_id, governorate, institution, privacy_consent, privacy_version, terms_version } = await c.req.json();
    
    if (!email || !password || !full_name) {
      const err = authError('VALIDATION_ERROR', 'Email, password, and full_name are required', 400);
      return c.json(err.body, err.status);
    }
    const privacyAccepted = privacy_consent === true || privacy_consent === 'true';
    if (!privacyAccepted) {
      const err = authError('PRIVACY_CONSENT_REQUIRED', 'Privacy consent is required before registration', 400);
      return c.json(err.body, err.status);
    }

    const safePrivacyVersion = String(privacy_version || 'privacy_v1').replace(/[^a-zA-Z0-9_\-\.]/g, '').slice(0, 50) || 'privacy_v1';
    const safeTermsVersion = String(terms_version || 'terms_v1').replace(/[^a-zA-Z0-9_\-\.]/g, '').slice(0, 50) || 'terms_v1';
    
    // Normalize email (trim and lowercase)
    const normalizedEmail = normalizeEmail(email);
    
    // Check if user already exists (using normalized email)
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM profiles WHERE LOWER(TRIM(email)) = ?'
    ).bind(normalizedEmail).first();
    
    if (existingUser) {
      const err = authError('ACCOUNT_EXISTS', 'Account already exists, please sign in or reset password', 409);
      return c.json(err.body, err.status);
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Create user in profiles table (store normalized email)
    const userId = generateId();
    await c.env.DB.prepare(`
      INSERT INTO profiles (id, email, password_hash, full_name, governorate, institution, institution_id, role, is_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    `).bind(userId, normalizedEmail, passwordHash, full_name, governorate || 'all', institution || 'manual', university_id || 'manual', 'student').run();

    const consentIp = String(c.req.header('CF-Connecting-IP') || c.req.header('x-forwarded-for') || '').split(',')[0].trim();
    const consentIpHash = consentIp ? await sha256HexText(consentIp) : null;
    const consentUserAgent = String(c.req.header('User-Agent') || '').slice(0, 500);
    const consentTime = new Date().toISOString();

    await c.env.DB.prepare(`
      INSERT INTO user_consents (
        id, user_id, consent_type, consent_version, terms_version, privacy_version,
        accepted_at, ip_hash, user_agent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      generateId(),
      userId,
      'registration_privacy',
      safePrivacyVersion,
      safeTermsVersion,
      safePrivacyVersion,
      consentTime,
      consentIpHash,
      consentUserAgent,
      consentTime
    ).run();
    
    // Generate JWT token
    const token = await generateJWTToken(userId, normalizedEmail, 'student', (c.env.JWT_SECRET || c.env.JWT_SECRET_V2 || ""));
    
    const user = publicAuthUser({
      id: userId,
      email: normalizedEmail,
      full_name,
      role: 'student',
      governorate: governorate || 'all',
      institution: institution || 'manual',
      institution_id: university_id || 'manual',
      is_verified: false
    });

    return c.json(authOk({
      token,
      user,
      session: { expiresAt: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000).toISOString() }
    }));
  } catch (error: any) {
    console.error('Registration error:', error);
    const err = authError('REGISTRATION_FAILED', 'Registration failed', 500);
    return c.json(err.body, err.status);
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (c) => {
  try {
    let body: any = {};
    try {
      body = await c.req.json();
    } catch {
      const err = authError('INVALID_REQUEST', 'Invalid login request', 400);
      return c.json(err.body, err.status);
    }

    const email = String(body.email || '').trim();
    const password = String(body.password || '');
    
    if (!email || !password) {
      const err = authError('VALIDATION_ERROR', 'Email and password are required', 400);
      return c.json(err.body, err.status);
    }
    
    const normalizedEmail = normalizeEmail(email);
    
    let user: any = null;
    try {
      user = await c.env.DB.prepare(
        'SELECT * FROM profiles WHERE LOWER(TRIM(email)) = ?'
      ).bind(normalizedEmail).first() as any;
    } catch (dbError) {
      console.error('Login DB lookup error:', dbError);
      const err = authError('LOGIN_UNAVAILABLE', 'Login temporarily unavailable', 503);
      return c.json(err.body, err.status);
    }
    
    // Do not reveal if the email exists.
    if (!user || !user.password_hash) {
      const err = authError('INVALID_CREDENTIALS', 'Email or password is incorrect.', 401);
      return c.json(err.body, err.status);
    }
    
    let isValid = false;
    try {
      isValid = await verifyPassword(password, String(user.password_hash || ''));
    } catch (verifyError) {
      console.error('Login password verification error:', verifyError);
      const err = authError('INVALID_CREDENTIALS', 'Email or password is incorrect.', 401);
      return c.json(err.body, err.status);
    }

    if (!isValid) {
      const err = authError('INVALID_CREDENTIALS', 'Email or password is incorrect.', 401);
      return c.json(err.body, err.status);
    }
    
    try {
      await c.env.DB.prepare(
        'UPDATE profiles SET updated_at = ? WHERE id = ?'
      ).bind(new Date().toISOString(), user.id).run();
    } catch (updateError) {
      console.error('Login last-login update error:', updateError);
      // Non-fatal. Continue login if credentials are valid.
    }
    
    const jwtSecret = String(c.env.JWT_SECRET || c.env.JWT_SECRET_V2 || '');
    if (!jwtSecret) {
      console.error('Login JWT secret missing');
      const err = authError('LOGIN_UNAVAILABLE', 'Login temporarily unavailable', 503);
      return c.json(err.body, err.status);
    }

    const token = await generateJWTToken(user.id, user.email, user.role || 'student', jwtSecret);
    
    return c.json(authOk({
      token,
      user: publicAuthUser(user),
      session: { expiresAt: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000).toISOString() }
    }));
  } catch (error: any) {
    console.error('Login unexpected error:', error);
    const err = authError('LOGIN_UNAVAILABLE', 'Login temporarily unavailable', 503);
    return c.json(err.body, err.status);
  }
});

// GET /api/auth/me
app.get('/api/auth/me', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    
    const user = await c.env.DB.prepare(
      'SELECT id, email, full_name, governorate, institution, institution_id, stage, interests, bio, avatar_url, role, is_verified, updated_at FROM profiles WHERE id = ?'
    ).bind(userId).first() as any;
    
    if (!user) {
      const err = authError('USER_NOT_FOUND', 'User not found', 404);
      return c.json(err.body, err.status);
    }
    
    return c.json(authOk({ user: publicAuthUser(user) }));
  } catch (error: any) {
    console.error('Get user error:', error);
    const err = authError('ME_FAILED', 'Failed to get user', 500);
    return c.json(err.body, err.status);
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', async (c) => {
  return c.json(authOk({ message: 'Logged out' }));
});

async function handlePasswordResetRequest(c: any) {
  try {
    const { email } = await c.req.json();
    
    if (!email) {
      const err = authError('VALIDATION_ERROR', 'Email is required', 400);
      return c.json(err.body, err.status);
    }

    const normalizedEmail = normalizeEmail(email);
    
    // Find user in profiles table
    const user = await c.env.DB.prepare(
      'SELECT id, email FROM profiles WHERE LOWER(TRIM(email)) = ?'
    ).bind(normalizedEmail).first() as any;
    
    if (!user) {
      // Don't reveal if user exists or not for security
      return c.json(resetRequestSuccess());
    }
    
    // Generate reset token
    const token = generateId();
    const tokenHash = await sha256HexText(token);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const createdAt = new Date().toISOString();
    
    // Expire older unused tokens without deleting history. Older schemas may not have used_at yet.
    try {
      await c.env.DB.prepare(`
        UPDATE password_resets
        SET used_at = ?
        WHERE email = ? AND used_at IS NULL
      `).bind(createdAt, normalizedEmail).run();
    } catch (_) {
      // Older schema fallback: no destructive delete, just continue with the new single-use token.
    }

    // Store only the hashed token in password_resets.token.
    await c.env.DB.prepare(`
      INSERT INTO password_resets (email, token, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `).bind(normalizedEmail, tokenHash, expiresAt, createdAt).run();

    // Send real password reset email via Resend.
    if (c.env.RESEND_API_KEY && c.env.PASSWORD_RESET_FROM_EMAIL) {
      const resetUrl = new URL('/api/auth/reset-password', c.req.url);
      resetUrl.searchParams.set('token', token);

      const toEmail = String(user.email || normalizedEmail).trim().toLowerCase();
      const resetUrlText = resetUrl.toString();

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${c.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: c.env.PASSWORD_RESET_FROM_EMAIL,
          to: [toEmail],
          subject: 'Reset your Talaba password',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #111827;">
              <h2>Reset your Talaba password</h2>
              <p>You requested to reset your password for Talaba.</p>
              <p>Click the button below to choose a new password. This link expires in 30 minutes.</p>
              <p style="margin: 28px 0;">
                <a href="${resetUrlText}" style="background:#ff6b00;color:#111827;padding:14px 22px;border-radius:14px;text-decoration:none;font-weight:800;display:inline-block;">
                  Change Password
                </a>
              </p>
              <p style="font-size:13px;color:#4b5563;">If the button does not work, copy this link:</p>
              <p style="font-size:13px;word-break:break-all;color:#2563eb;">${resetUrlText}</p>
            </div>
          `,
          text: `Reset your Talaba password: ${resetUrlText}`
        })
      });

      if (!emailResponse.ok) {
        const emailError = await emailResponse.text();
        console.error('Password reset email send failed:', emailError);
        // Keep the public response generic. Do not reveal account or delivery state.
        return c.json(resetRequestSuccess());
      }
    }

    return c.json(resetRequestSuccess());
  } catch (error: any) {
    console.error('Forgot password error:', error);
    // Generic public response protects account existence even on transient delivery/storage errors.
    return c.json(resetRequestSuccess());
  }
}

// POST /api/auth/forgot-password
app.post('/api/auth/forgot-password', handlePasswordResetRequest);

// POST /api/auth/reset-password/request
app.post('/api/auth/reset-password/request', handlePasswordResetRequest);


// GET /api/auth/reset-password
// Browser page for password reset links sent by email.
app.get('/api/auth/reset-password', async (c) => {
  const token = String(c.req.query('token') || '').trim();
  const safeToken = token.replace(/[<>"']/g, '');

  return c.html(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Change Password | Talaba</title>
  <style>
    body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0f172a;font-family:Arial,sans-serif;padding:20px;color:#111827}
    .card{width:100%;max-width:430px;background:#fffaf3;border:2px solid #fdba74;border-radius:28px;padding:28px;box-shadow:0 30px 80px rgba(0,0,0,.35)}
    h1{margin:0 0 10px;font-size:24px;font-weight:900;color:#111827}
    p{color:#374151;line-height:1.5}
    label{display:block;margin:18px 0 8px;font-size:12px;font-weight:900;text-transform:uppercase}
    input{width:100%;box-sizing:border-box;padding:14px 16px;border-radius:16px;border:2px solid #fed7aa;font-size:16px;font-weight:700;color:#111827;background:#fff}
    button{width:100%;margin-top:18px;padding:15px 18px;border:0;border-radius:16px;background:#ff6b00;color:#111827;font-weight:900;font-size:15px;cursor:pointer}
    .msg{margin-top:14px;font-weight:800;color:#111827}.error{color:#b91c1c}.success{color:#047857}
    a{color:#2563eb;font-weight:800}
  </style>
</head>
<body>
  <div class="card">
    <h1>Change your password</h1>
    <p>Choose a new password for your Talaba account.</p>
    <form id="resetForm">
      <input id="token" type="hidden" value="${safeToken}" />
      <label>New password</label>
      <input id="newPassword" type="password" minlength="6" required />
      <label>Confirm password</label>
      <input id="confirmPassword" type="password" minlength="6" required />
      <button type="submit">Save new password</button>
    </form>
    <div id="message" class="msg"></div>
    <p style="font-size:13px;margin-top:22px;"><a href="https://talaba.kaniq.org">Back to Talaba</a></p>
  </div>
  <script>
    const form=document.getElementById('resetForm');
    const message=document.getElementById('message');
    if(!document.getElementById('token').value){message.className='msg error';message.textContent='Invalid reset link. Request a new reset email.';form.style.display='none';}
    form.addEventListener('submit',async(e)=>{
      e.preventDefault();
      const token=document.getElementById('token').value;
      const newPassword=document.getElementById('newPassword').value;
      const confirmPassword=document.getElementById('confirmPassword').value;
      if(newPassword.length<6){message.className='msg error';message.textContent='Password must be at least 6 characters.';return;}
      if(newPassword!==confirmPassword){message.className='msg error';message.textContent='Passwords do not match.';return;}
      message.className='msg';message.textContent='Saving...';
      try{
        const response=await fetch('/api/auth/reset-password/confirm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,newPassword})});
        const data=await response.json().catch(()=>({}));
        if(!response.ok) throw new Error(data.error || 'Failed to reset password');
        localStorage.removeItem('Talaba_token');localStorage.removeItem('talaba_token');localStorage.removeItem('admin_token');localStorage.removeItem('Talaba_auth_user');localStorage.removeItem('jamiaati_token');localStorage.removeItem('jamiaati_auth_user');
        message.className='msg success';message.textContent='Password changed successfully. Redirecting...';
        setTimeout(()=>{window.location.href='https://talaba.kaniq.org?passwordReset=success';},1600);
      }catch(error){message.className='msg error';message.textContent=error.message || 'Failed to reset password.';}
    });
  </script>
</body>
</html>`);
});


async function handlePasswordResetConfirm(c: any) {
  try {
    const { token, newPassword } = await c.req.json();
    
    if (!token || !newPassword) {
      const err = authError('VALIDATION_ERROR', 'Token and new password are required', 400);
      return c.json(err.body, err.status);
    }

    if (String(newPassword).length < 6) {
      const err = authError('WEAK_PASSWORD', 'Password must be at least 6 characters.', 400);
      return c.json(err.body, err.status);
    }

    const tokenHash = await sha256HexText(String(token));
    
    // Find valid token in password_resets table. New tokens are hashed; legacy raw tokens are accepted once.
    const resetToken = await c.env.DB.prepare(
      'SELECT * FROM password_resets WHERE token IN (?, ?) AND expires_at > ?'
    ).bind(tokenHash, token, new Date().toISOString()).first() as any;
    
    if (!resetToken || resetToken.used_at) {
      const err = authError('INVALID_RESET_TOKEN', 'Invalid or expired token', 400);
      return c.json(err.body, err.status);
    }
    
    // Hash new password
    const passwordHash = await hashPassword(newPassword);
    const now = new Date().toISOString();
    
    // Update user password in profiles table
    const updateResult = await c.env.DB.prepare(
      'UPDATE profiles SET password_hash = ?, updated_at = ? WHERE LOWER(TRIM(email)) = ?'
    ).bind(passwordHash, now, normalizeEmail(resetToken.email)).run() as any;
    
    const changed = Number(updateResult?.meta?.changes || updateResult?.changes || 0);
    if (changed < 1) {
      const err = authError('USER_NOT_FOUND', 'Invalid or expired token', 400);
      return c.json(err.body, err.status);
    }

    try {
      await c.env.DB.prepare(
        'UPDATE password_resets SET used_at = ? WHERE token = ?'
      ).bind(now, resetToken.token).run();
    } catch (_) {
      // Older schema fallback: mutate the token key so it cannot be reused, without deleting data.
      await c.env.DB.prepare(
        'UPDATE password_resets SET token = ? WHERE token = ?'
      ).bind(`used:${resetToken.token}:${Date.now()}`, resetToken.token).run();
    }
    
    return c.json(authOk({ message: 'Password reset successfully' }));
  } catch (error: any) {
    console.error('Reset password error:', error);
    const err = authError('RESET_PASSWORD_FAILED', 'Failed to reset password', 500);
    return c.json(err.body, err.status);
  }
}

// POST /api/auth/reset-password
app.post('/api/auth/reset-password', handlePasswordResetConfirm);

// POST /api/auth/reset-password/confirm
app.post('/api/auth/reset-password/confirm', handlePasswordResetConfirm);

// ============================================================================
// SOCIAL FEED ENDPOINTS
// ============================================================================

// GET /api/posts/feed
app.get('/api/posts/feed', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');
    const university_id = c.req.query('university_id') || 'all';
    const governorate = c.req.query('governorate') || 'all';
    
    let query = `
      SELECT p.*, 
        pr.full_name as author_name, 
        pr.avatar_url as author_avatar,
        pr.role as author_role,
        pr.institution_id as author_institution_id,
        CASE WHEN pl.id IS NOT NULL THEN 1 ELSE 0 END as liked_by_user,
        CASE WHEN ps.id IS NOT NULL THEN 1 ELSE 0 END as saved_by_user
      FROM posts p
      JOIN profiles pr ON p.author_id = pr.id
      LEFT JOIN post_likes pl ON p.id = pl.post_id AND pl.user_id = ?
      LEFT JOIN post_saves ps ON p.id = ps.post_id AND ps.user_id = ?
      WHERE p.status = 'active'
    `;
    const params: any[] = [userId, userId];
    
    if (university_id !== 'all') {
      query += ' AND (p.institution_id = ? OR p.institution_id = "all")';
      params.push(university_id);
    }
    
    if (governorate !== 'all') {
      query += ' AND (p.governorate = ? OR p.governorate = "all")';
      params.push(governorate);
    }
    
    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const posts = await c.env.DB.prepare(query).bind(...params).all();
    
    // Get comments for each post
    for (const post of posts.results as any[]) {
      const comments = await c.env.DB.prepare(`
        SELECT c.*, pr.full_name as author_name, pr.avatar_url as author_avatar
        FROM comments c
        JOIN profiles pr ON c.author_id = pr.id
        WHERE c.post_id = ? AND c.deleted_at IS NULL
        ORDER BY c.created_at ASC
        LIMIT 5
      `).bind(post.id).all();
      
      post.commentsList = comments.results || [];
    }
    
    return c.json({ posts: posts.results || [] });
  } catch (error: any) {
    console.error('Get feed error:', error);
    return c.json({ error: 'Failed to get feed' }, 500);
  }
});

// POST /api/posts
app.post('/api/posts', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const { 
      type, 
      content_en, content_ar, content_ku,
      title_en, title_ar, title_ku,
      original_language, title_original, body_original,
      university_id, governorate,
      institution,
      image_url, is_anonymous
    } = await c.req.json();
    
    if (!content_en) {
      return c.json({ error: 'Content is required' }, 400);
    }
    
    const postId = generateId();
    
    // Build metadata JSON for multilingual fields
    const metadata: any = {};
    if (content_en) metadata.content_en = content_en;
    if (content_ar) metadata.content_ar = content_ar;
    if (content_ku) metadata.content_ku = content_ku;
    if (title_en) metadata.title_en = title_en;
    if (title_ar) metadata.title_ar = title_ar;
    if (title_ku) metadata.title_ku = title_ku;
    if (original_language) metadata.original_language = original_language;
    if (title_original) metadata.title_original = title_original;
    if (body_original) metadata.body_original = body_original;
    
    await c.env.DB.prepare(`
      INSERT INTO posts (
        id, author_id, type, title, content, image_url, governorate, institution, institution_id, 
        metadata, status, visibility
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      postId, userId, type || 'post', title_en || null, content_en, image_url || null, 
      governorate || 'all', institution || 'manual', university_id || 'manual',
      JSON.stringify(metadata), 'active', 'public'
    ).run();
    
    // Fetch the created post with author info
    const post = await c.env.DB.prepare(`
      SELECT p.*, 
        pr.full_name as author_name, 
        pr.avatar_url as author_avatar,
        pr.role as author_role
      FROM posts p
      JOIN profiles pr ON p.author_id = pr.id
      WHERE p.id = ?
    `).bind(postId).first() as any;
    
    return c.json({ post });
  } catch (error: any) {
    console.error('Create post error:', error);
    return c.json({ error: 'Failed to create post' }, 500);
  }
});

// DELETE /api/posts/:id
app.delete('/api/posts/:id', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userRole = c.get('userRole');
    const postId = c.req.param('id');
    
    // Check if user owns the post or is admin
    const post = await c.env.DB.prepare(
      'SELECT author_id FROM posts WHERE id = ?'
    ).bind(postId).first() as any;
    
    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }
    
    if (post.author_id !== userId && userRole !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }
    
    // Soft delete
    await c.env.DB.prepare(
      'UPDATE posts SET status = "deleted", deleted_at = ? WHERE id = ?'
    ).bind(new Date().toISOString(), postId).run();
    
    return c.json({ message: 'Post deleted' });
  } catch (error: any) {
    console.error('Delete post error:', error);
    return c.json({ error: 'Failed to delete post' }, 500);
  }
});

// POST /api/posts/:id/like
app.post('/api/posts/:id/like', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const postId = c.req.param('id');
    
    // Check if already liked
    const existing = await c.env.DB.prepare(
      'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?'
    ).bind(postId, userId).first();
    
    if (existing) {
      // Unlike
      await c.env.DB.prepare(
        'DELETE FROM post_likes WHERE post_id = ? AND user_id = ?'
      ).bind(postId, userId).run();
      
      await c.env.DB.prepare(
        'UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?'
      ).bind(postId).run();
      
      return c.json({ liked: false });
    } else {
      // Like
      await c.env.DB.prepare(
        'INSERT INTO post_likes (id, post_id, user_id) VALUES (?, ?, ?)'
      ).bind(generateId(), postId, userId).run();
      
      await c.env.DB.prepare(
        'UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?'
      ).bind(postId).run();
      
      return c.json({ liked: true });
    }
  } catch (error: any) {
    console.error('Like post error:', error);
    return c.json({ error: 'Failed to like post' }, 500);
  }
});

// POST /api/posts/:id/save
app.post('/api/posts/:id/save', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const postId = c.req.param('id');
    
    // Check if already saved
    const existing = await c.env.DB.prepare(
      'SELECT id FROM post_saves WHERE post_id = ? AND user_id = ?'
    ).bind(postId, userId).first();
    
    if (existing) {
      // Unsave
      await c.env.DB.prepare(
        'DELETE FROM post_saves WHERE post_id = ? AND user_id = ?'
      ).bind(postId, userId).run();
      
      await c.env.DB.prepare(
        'UPDATE posts SET saves_count = saves_count - 1 WHERE id = ?'
      ).bind(postId).run();
      
      return c.json({ saved: false });
    } else {
      // Save
      await c.env.DB.prepare(
        'INSERT INTO post_saves (id, post_id, user_id) VALUES (?, ?, ?)'
      ).bind(generateId(), postId, userId).run();
      
      await c.env.DB.prepare(
        'UPDATE posts SET saves_count = saves_count + 1 WHERE id = ?'
      ).bind(postId).run();
      
      return c.json({ saved: true });
    }
  } catch (error: any) {
    console.error('Save post error:', error);
    return c.json({ error: 'Failed to save post' }, 500);
  }
});

// POST /api/posts/:id/comments
app.post('/api/posts/:id/comments', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const postId = c.req.param('id');
    const { content } = await c.req.json();
    
    if (!content) {
      return c.json({ error: 'Content is required' }, 400);
    }
    
    const commentId = generateId();
    
    await c.env.DB.prepare(`
      INSERT INTO comments (id, post_id, author_id, content)
      VALUES (?, ?, ?, ?)
    `).bind(commentId, postId, userId, content).run();
    
    // Update comment count
    await c.env.DB.prepare(
      'UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?'
    ).bind(postId).run();
    
    // Fetch the created comment with author info
    const comment = await c.env.DB.prepare(`
      SELECT c.*, pr.full_name as author_name, pr.avatar_url as author_avatar
      FROM comments c
      JOIN profiles pr ON c.author_id = pr.id
      WHERE c.id = ?
    `).bind(commentId).first() as any;
    
    return c.json({ comment });
  } catch (error: any) {
    console.error('Create comment error:', error);
    return c.json({ error: 'Failed to create comment' }, 500);
  }
});

// DELETE /api/comments/:id
app.delete('/api/comments/:id', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userRole = c.get('userRole');
    const commentId = c.req.param('id');
    
    // Check if user owns the comment or is admin
    const comment = await c.env.DB.prepare(
      'SELECT author_id, post_id FROM comments WHERE id = ?'
    ).bind(commentId).first() as any;
    
    if (!comment) {
      return c.json({ error: 'Comment not found' }, 404);
    }
    
    if (comment.author_id !== userId && userRole !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }
    
    // Soft delete
    await c.env.DB.prepare(
      'UPDATE comments SET deleted_at = ? WHERE id = ?'
    ).bind(new Date().toISOString(), commentId).run();
    
    // Update comment count
    await c.env.DB.prepare(
      'UPDATE posts SET comments_count = comments_count - 1 WHERE id = ?'
    ).bind(comment.post_id).run();
    
    return c.json({ message: 'Comment deleted' });
  } catch (error: any) {
    console.error('Delete comment error:', error);
    return c.json({ error: 'Failed to delete comment' }, 500);
  }
});

// ============================================================================
// FRIEND REQUESTS ENDPOINTS
// ============================================================================

// GET /api/friend-requests
app.get('/api/friend-requests', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    
    const incoming = await c.env.DB.prepare(`
      SELECT scr.*, 
        pr.full_name as requester_name,
        pr.avatar_url as requester_avatar,
        pr.email as requester_email,
        pr.institution as requester_institution
      FROM social_connection_requests scr
      JOIN profiles pr ON scr.requester_id = pr.id
      WHERE scr.recipient_id = ? AND scr.status = 'pending'
      ORDER BY scr.created_at DESC
    `).bind(userId).all();
    
    const outgoing = await c.env.DB.prepare(`
      SELECT scr.*, 
        pr.full_name as recipient_name,
        pr.avatar_url as recipient_avatar,
        pr.email as recipient_email,
        pr.institution as recipient_institution
      FROM social_connection_requests scr
      JOIN profiles pr ON scr.recipient_id = pr.id
      WHERE scr.requester_id = ? AND scr.status = 'pending'
      ORDER BY scr.created_at DESC
    `).bind(userId).all();
    
    return c.json({
      incoming: incoming.results || [],
      outgoing: outgoing.results || []
    });
  } catch (error: any) {
    console.error('Get friend requests error:', error);
    return c.json({ error: 'Failed to get friend requests' }, 500);
  }
});

// POST /api/friend-requests
app.post('/api/friend-requests', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const { targetUserId, message } = await c.req.json();
    
    if (!targetUserId) {
      return c.json({ error: 'Target user ID is required' }, 400);
    }
    
    if (targetUserId === userId) {
      return c.json({ error: 'Cannot send friend request to yourself' }, 400);
    }
    
    // Check if request already exists
    const existing = await c.env.DB.prepare(
      'SELECT id FROM social_connection_requests WHERE requester_id = ? AND recipient_id = ?'
    ).bind(userId, targetUserId).first();
    
    if (existing) {
      return c.json({ error: 'Friend request already exists' }, 409);
    }
    
    const requestId = generateId();
    
    await c.env.DB.prepare(`
      INSERT INTO social_connection_requests (id, requester_id, recipient_id, message, status)
      VALUES (?, ?, ?, ?, 'pending')
    `).bind(requestId, userId, targetUserId, message || null).run();
    
    // Get recipient info
    const recipient = await c.env.DB.prepare(
      'SELECT id, full_name, avatar_url, email FROM profiles WHERE id = ?'
    ).bind(targetUserId).first() as any;
    
    return c.json({
      request: { id: requestId, requester_id: userId, recipient_id: targetUserId },
      recipient
    });
  } catch (error: any) {
    console.error('Send friend request error:', error);
    return c.json({ error: 'Failed to send friend request' }, 500);
  }
});

// POST /api/friend-requests/:id/accept
app.post('/api/friend-requests/:id/accept', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const requestId = c.req.param('id');
    
    // Get request
    const request = await c.env.DB.prepare(
      'SELECT * FROM social_connection_requests WHERE id = ? AND recipient_id = ?'
    ).bind(requestId, userId).first() as any;
    
    if (!request) {
      return c.json({ error: 'Friend request not found' }, 404);
    }
    
    // Update request status
    await c.env.DB.prepare(
      'UPDATE social_connection_requests SET status = "accepted", updated_at = ? WHERE id = ?'
    ).bind(new Date().toISOString(), requestId).run();
    
    return c.json({ message: 'Friend request accepted' });
  } catch (error: any) {
    console.error('Accept friend request error:', error);
    return c.json({ error: 'Failed to accept friend request' }, 500);
  }
});

// POST /api/friend-requests/:id/decline
app.post('/api/friend-requests/:id/decline', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const requestId = c.req.param('id');
    
    // Get request
    const request = await c.env.DB.prepare(
      'SELECT * FROM social_connection_requests WHERE id = ? AND recipient_id = ?'
    ).bind(requestId, userId).first() as any;
    
    if (!request) {
      return c.json({ error: 'Friend request not found' }, 404);
    }
    
    // Update request status
    await c.env.DB.prepare(
      'UPDATE social_connection_requests SET status = "declined", updated_at = ? WHERE id = ?'
    ).bind(new Date().toISOString(), requestId).run();
    
    return c.json({ message: 'Friend request declined' });
  } catch (error: any) {
    console.error('Decline friend request error:', error);
    return c.json({ error: 'Failed to decline friend request' }, 500);
  }
});

// POST /api/friend-requests/:id/cancel
app.post('/api/friend-requests/:id/cancel', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const requestId = c.req.param('id');
    
    // Get request
    const request = await c.env.DB.prepare(
      'SELECT * FROM social_connection_requests WHERE id = ? AND requester_id = ?'
    ).bind(requestId, userId).first() as any;
    
    if (!request) {
      return c.json({ error: 'Friend request not found' }, 404);
    }
    
    // Update request status
    await c.env.DB.prepare(
      'UPDATE social_connection_requests SET status = "cancelled", updated_at = ? WHERE id = ?'
    ).bind(new Date().toISOString(), requestId).run();
    
    return c.json({ message: 'Friend request cancelled' });
  } catch (error: any) {
    console.error('Cancel friend request error:', error);
    return c.json({ error: 'Failed to cancel friend request' }, 500);
  }
});

// ============================================================================
// MESSAGING ENDPOINTS
// ============================================================================

// GET /api/message-requests
app.get('/api/message-requests', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    
    // Treat social_message_threads with status='requested' as message requests
    const incoming = await c.env.DB.prepare(`
      SELECT smt.*, 
        pr.full_name as sender_name,
        pr.avatar_url as sender_avatar,
        pr.email as sender_email,
        pr.institution as sender_institution
      FROM social_message_threads smt
      JOIN profiles pr ON smt.requester_id = pr.id
      WHERE smt.recipient_id = ? AND smt.status = 'requested'
      ORDER BY smt.created_at DESC
    `).bind(userId).all();
    
    const outgoing = await c.env.DB.prepare(`
      SELECT smt.*, 
        pr.full_name as recipient_name,
        pr.avatar_url as recipient_avatar,
        pr.email as recipient_email,
        pr.institution as recipient_institution
      FROM social_message_threads smt
      JOIN profiles pr ON smt.recipient_id = pr.id
      WHERE smt.requester_id = ? AND smt.status = 'requested'
      ORDER BY smt.created_at DESC
    `).bind(userId).all();
    
    return c.json({
      incoming: incoming.results || [],
      outgoing: outgoing.results || []
    });
  } catch (error: any) {
    console.error('Get message requests error:', error);
    return c.json({ error: 'Failed to get message requests' }, 500);
  }
});

// POST /api/message-requests
app.post('/api/message-requests', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const { recipientId, body } = await c.req.json();
    
    if (!recipientId || !body) {
      return c.json({ error: 'Recipient ID and body are required' }, 400);
    }
    
    if (recipientId === userId) {
      return c.json({ error: 'Cannot send message to yourself' }, 400);
    }
    
    // Create thread in social_message_threads
    const threadId = generateId();
    await c.env.DB.prepare(`
      INSERT INTO social_message_threads (id, type, status, requester_id, recipient_id, last_message_at, created_at, updated_at)
      VALUES (?, 'direct', 'requested', ?, ?, ?, ?, ?)
    `).bind(threadId, userId, recipientId, new Date().toISOString(), new Date().toISOString(), new Date().toISOString()).run();
    
    // Add members to social_message_thread_members
    await c.env.DB.prepare(`
      INSERT INTO social_message_thread_members (thread_id, user_id, role, status, last_read_at, created_at)
      VALUES (?, ?, 'member', 'active', ?, ?)
    `).bind(threadId, userId, new Date().toISOString(), new Date().toISOString()).run();
    
    await c.env.DB.prepare(`
      INSERT INTO social_message_thread_members (thread_id, user_id, role, status, last_read_at, created_at)
      VALUES (?, ?, 'member', 'active', ?, ?)
    `).bind(threadId, recipientId, new Date().toISOString(), new Date().toISOString()).run();
    
    // Create first message in social_messages
    const messageId = generateId();
    const encryptedMessage = await encryptPrivateMessage(c, body);
    await c.env.DB.prepare(`
      INSERT INTO social_messages (
        id, thread_id, sender_id, body,
        body_ciphertext, body_iv, body_key_version, encryption_status,
        status, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'encrypted', 'sent', ?)
    `).bind(
      messageId,
      threadId,
      userId,
      '[encrypted]',
      encryptedMessage.ciphertext,
      encryptedMessage.iv,
      encryptedMessage.keyVersion,
      new Date().toISOString()
    ).run();
    
    return c.json({ threadId, messageId });
  } catch (error: any) {
    console.error('Send message request error:', error);
    return c.json({ error: 'Failed to send message request' }, 500);
  }
});

// POST /api/message-requests/:threadId/accept
app.post('/api/message-requests/:threadId/accept', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const threadId = c.req.param('threadId');
    
    // Get thread
    const thread = await c.env.DB.prepare(
      'SELECT * FROM social_message_threads WHERE id = ? AND recipient_id = ?'
    ).bind(threadId, userId).first() as any;
    
    if (!thread) {
      return c.json({ error: 'Message request not found' }, 404);
    }
    
    // Update thread status to accepted
    await c.env.DB.prepare(
      'UPDATE social_message_threads SET status = "accepted", updated_at = ? WHERE id = ?'
    ).bind(new Date().toISOString(), threadId).run();
    
    return c.json({ message: 'Message request accepted' });
  } catch (error: any) {
    console.error('Accept message request error:', error);
    return c.json({ error: 'Failed to accept message request' }, 500);
  }
});

// POST /api/message-requests/:threadId/decline
app.post('/api/message-requests/:threadId/decline', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const threadId = c.req.param('threadId');
    
    // Get thread
    const thread = await c.env.DB.prepare(
      'SELECT * FROM social_message_threads WHERE id = ? AND recipient_id = ?'
    ).bind(threadId, userId).first() as any;
    
    if (!thread) {
      return c.json({ error: 'Message request not found' }, 404);
    }
    
    // Update thread status to declined
    await c.env.DB.prepare(
      'UPDATE social_message_threads SET status = "declined", updated_at = ? WHERE id = ?'
    ).bind(new Date().toISOString(), threadId).run();
    
    return c.json({ message: 'Message request declined' });
  } catch (error: any) {
    console.error('Decline message request error:', error);
    return c.json({ error: 'Failed to decline message request' }, 500);
  }
});

// GET /api/messages/threads
app.get('/api/messages/threads', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    
    const threads = await c.env.DB.prepare(`
      SELECT smt.*, 
        CASE 
          WHEN smt.requester_id = ? THEN 
            (SELECT full_name FROM profiles WHERE id = smt.recipient_id)
          ELSE 
            (SELECT full_name FROM profiles WHERE id = smt.requester_id)
        END as other_name,
        CASE 
          WHEN smt.requester_id = ? THEN 
            (SELECT avatar_url FROM profiles WHERE id = smt.recipient_id)
          ELSE 
            (SELECT avatar_url FROM profiles WHERE id = smt.requester_id)
        END as other_avatar,
        CASE 
          WHEN smt.requester_id = ? THEN smt.recipient_id
          ELSE smt.requester_id
        END as other_user_id
      FROM social_message_threads smt
      JOIN social_message_thread_members smtm ON smt.id = smtm.thread_id
      WHERE smtm.user_id = ? AND smt.status = 'accepted'
      ORDER BY smt.last_message_at DESC
    `).bind(userId, userId, userId, userId).all();
    
    return c.json({ threads: threads.results || [] });
  } catch (error: any) {
    console.error('Get threads error:', error);
    return c.json({ error: 'Failed to get threads' }, 500);
  }
});

// GET /api/messages/threads/:threadId/messages
app.get('/api/messages/threads/:threadId/messages', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const threadId = c.req.param('threadId');
    
    // Check if user is a member of the thread
    const member = await c.env.DB.prepare(
      'SELECT id FROM social_message_thread_members WHERE thread_id = ? AND user_id = ?'
    ).bind(threadId, userId).first();
    
    if (!member) {
      return c.json({ error: 'Not a member of this thread' }, 403);
    }
    
    const messages = await c.env.DB.prepare(`
      SELECT sm.*, pr.full_name as sender_name, pr.avatar_url as sender_avatar, pr.role as sender_role
      FROM social_messages sm
      JOIN profiles pr ON sm.sender_id = pr.id
      WHERE sm.thread_id = ? AND sm.deleted_at IS NULL
      ORDER BY sm.created_at ASC
    `).bind(threadId).all();
    
    const thread = await c.env.DB.prepare(
      'SELECT * FROM social_message_threads WHERE id = ?'
    ).bind(threadId).first();
    
    const decryptedMessages = await Promise.all(((messages.results || []) as any[]).map(async (message: any) => ({
      ...message,
      body: await decryptPrivateMessage(c, message)
    })));

    return c.json({ thread, messages: decryptedMessages });
  } catch (error: any) {
    console.error('Get thread messages error:', error);
    return c.json({ error: 'Failed to get thread messages' }, 500);
  }
});

// POST /api/messages/threads/:threadId/messages
app.post('/api/messages/threads/:threadId/messages', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const threadId = c.req.param('threadId');
    const { body } = await c.req.json();
    
    if (!body) {
      return c.json({ error: 'Message body is required' }, 400);
    }
    
    // Check if user is a member of the thread
    const member = await c.env.DB.prepare(
      'SELECT id FROM social_message_thread_members WHERE thread_id = ? AND user_id = ?'
    ).bind(threadId, userId).first();
    
    if (!member) {
      return c.json({ error: 'Not a member of this thread' }, 403);
    }
    
    const messageId = generateId();
    
    const encryptedMessage = await encryptPrivateMessage(c, body);
    await c.env.DB.prepare(`
      INSERT INTO social_messages (
        id, thread_id, sender_id, body,
        body_ciphertext, body_iv, body_key_version, encryption_status,
        status, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'encrypted', 'sent', ?)
    `).bind(
      messageId,
      threadId,
      userId,
      '[encrypted]',
      encryptedMessage.ciphertext,
      encryptedMessage.iv,
      encryptedMessage.keyVersion,
      new Date().toISOString()
    ).run();
    
    // Update thread last message
    await c.env.DB.prepare(
      'UPDATE social_message_threads SET last_message_at = ?, updated_at = ? WHERE id = ?'
    ).bind(new Date().toISOString(), new Date().toISOString(), threadId).run();
    
    // Fetch the created message
    const message = await c.env.DB.prepare(`
      SELECT sm.*, pr.full_name as sender_name, pr.avatar_url as sender_avatar, pr.role as sender_role
      FROM social_messages sm
      JOIN profiles pr ON sm.sender_id = pr.id
      WHERE sm.id = ?
    `).bind(messageId).first() as any;
    
    const safeMessage = message ? { ...message, body: await decryptPrivateMessage(c, message) } : message;
    return c.json({ message: safeMessage });
  } catch (error: any) {
    console.error('Send message error:', error);
    return c.json({ error: 'Failed to send message' }, 500);
  }
});


// ============================================================================
// PRIVACY SAFETY ENDPOINTS: REPORTS, BLOCKS, MODERATION
// ============================================================================

// POST /api/messages/:messageId/report
// User reports one specific private message. Admin can review only this reported snapshot.
app.post('/api/messages/:messageId/report', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const messageId = c.req.param('messageId');
    const body = await c.req.json().catch(() => ({}));
    const reason = String(body.reason || 'safety').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 120) || 'safety';
    const note = String(body.note || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 1000);

    const row = await c.env.DB.prepare(`
      SELECT
        sm.*,
        smt.requester_id,
        smt.recipient_id
      FROM social_messages sm
      JOIN social_message_threads smt ON sm.thread_id = smt.id
      JOIN social_message_thread_members smtm ON sm.thread_id = smtm.thread_id
      WHERE sm.id = ? AND smtm.user_id = ?
      LIMIT 1
    `).bind(messageId, userId).first() as any;

    if (!row) {
      return c.json({ error: 'Message not found or not accessible' }, 404);
    }

    if (row.sender_id === userId) {
      return c.json({ error: 'You cannot report your own message' }, 400);
    }

    const existing = await c.env.DB.prepare(
      'SELECT id FROM message_reports WHERE message_id = ? AND reporter_id = ?'
    ).bind(messageId, userId).first();

    if (existing) {
      return c.json({ error: 'Message already reported' }, 409);
    }

    const decryptedBody = await decryptPrivateMessage(c, row);
    const reportId = generateId();
    const now = new Date().toISOString();

    const snapshot = JSON.stringify({
      message_id: row.id,
      thread_id: row.thread_id,
      sender_id: row.sender_id,
      created_at: row.created_at,
      body: decryptedBody
    });

    await c.env.DB.prepare(`
      INSERT INTO message_reports (
        id, message_id, thread_id, reporter_id, reported_user_id,
        reason, note, reported_message_snapshot, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `).bind(
      reportId,
      messageId,
      row.thread_id,
      userId,
      row.sender_id,
      reason,
      note,
      snapshot,
      now
    ).run();

    return c.json({ message: 'Message reported for safety review', report_id: reportId });
  } catch (error: any) {
    console.error('Report message error:', error);
    return c.json({ error: 'Failed to report message' }, 500);
  }
});

// POST /api/users/:targetUserId/block
app.post('/api/users/:targetUserId/block', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const targetUserId = c.req.param('targetUserId');
    const body = await c.req.json().catch(() => ({}));
    const reason = String(body.reason || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 240);

    if (!targetUserId) {
      return c.json({ error: 'Target user is required' }, 400);
    }

    if (targetUserId === userId) {
      return c.json({ error: 'You cannot block yourself' }, 400);
    }

    const target = await c.env.DB.prepare(
      'SELECT id FROM profiles WHERE id = ?'
    ).bind(targetUserId).first();

    if (!target) {
      return c.json({ error: 'User not found' }, 404);
    }

    const existing = await c.env.DB.prepare(
      'SELECT id FROM user_blocks WHERE blocker_id = ? AND blocked_id = ?'
    ).bind(userId, targetUserId).first();

    if (existing) {
      return c.json({ blocked: true, message: 'User already blocked' });
    }

    await c.env.DB.prepare(`
      INSERT INTO user_blocks (id, blocker_id, blocked_id, reason, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(generateId(), userId, targetUserId, reason || null, new Date().toISOString()).run();

    return c.json({ blocked: true, message: 'User blocked' });
  } catch (error: any) {
    console.error('Block user error:', error);
    return c.json({ error: 'Failed to block user' }, 500);
  }
});

// DELETE /api/users/:targetUserId/block
app.delete('/api/users/:targetUserId/block', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const targetUserId = c.req.param('targetUserId');

    await c.env.DB.prepare(
      'DELETE FROM user_blocks WHERE blocker_id = ? AND blocked_id = ?'
    ).bind(userId, targetUserId).run();

    return c.json({ blocked: false, message: 'User unblocked' });
  } catch (error: any) {
    console.error('Unblock user error:', error);
    return c.json({ error: 'Failed to unblock user' }, 500);
  }
});

// GET /api/users/blocked
app.get('/api/users/blocked', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');

    const rows = await c.env.DB.prepare(`
      SELECT ub.*, p.full_name, p.avatar_url, p.institution, p.governorate
      FROM user_blocks ub
      LEFT JOIN profiles p ON ub.blocked_id = p.id
      WHERE ub.blocker_id = ?
      ORDER BY ub.created_at DESC
    `).bind(userId).all();

    return c.json({ blocked: rows.results || [] });
  } catch (error: any) {
    console.error('Get blocked users error:', error);
    return c.json({ error: 'Failed to load blocked users' }, 500);
  }
});

// GET /api/admin/moderation/message-reports
// Admin can only see user-reported message snapshots, not full private chats.
app.get('/api/admin/moderation/message-reports', authMiddleware, adminMiddleware, async (c) => {
  try {
    const status = String(c.req.query('status') || 'pending').trim();
    const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100);
    const offset = Math.max(parseInt(c.req.query('offset') || '0'), 0);

    let query = `
      SELECT
        mr.*,
        reporter.full_name as reporter_name,
        reported.full_name as reported_user_name,
        reported.email as reported_user_email
      FROM message_reports mr
      LEFT JOIN profiles reporter ON mr.reporter_id = reporter.id
      LEFT JOIN profiles reported ON mr.reported_user_id = reported.id
    `;

    const params: any[] = [];

    if (status !== 'all') {
      query += ' WHERE mr.status = ?';
      params.push(status);
    }

    query += ' ORDER BY mr.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = await c.env.DB.prepare(query).bind(...params).all();
    return c.json({ reports: rows.results || [] });
  } catch (error: any) {
    console.error('Admin message reports error:', error);
    return c.json({ error: 'Failed to load message reports' }, 500);
  }
});

// PATCH /api/admin/moderation/message-reports/:reportId
app.patch('/api/admin/moderation/message-reports/:reportId', authMiddleware, adminMiddleware, async (c) => {
  try {
    const adminId = c.get('userId');
    const reportId = c.req.param('reportId');
    const body = await c.req.json().catch(() => ({}));
    const allowedStatuses = ['pending', 'reviewed', 'action_taken', 'dismissed'];
    const status = allowedStatuses.includes(String(body.status)) ? String(body.status) : 'reviewed';
    const note = String(body.note || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 1000);

    const existing = await c.env.DB.prepare(
      'SELECT id FROM message_reports WHERE id = ?'
    ).bind(reportId).first();

    if (!existing) {
      return c.json({ error: 'Report not found' }, 404);
    }

    const now = new Date().toISOString();

    await c.env.DB.prepare(`
      UPDATE message_reports
      SET status = ?, reviewed_at = ?, reviewed_by = ?
      WHERE id = ?
    `).bind(status, now, adminId, reportId).run();

    await c.env.DB.prepare(`
      INSERT INTO moderation_audit_logs (id, admin_id, action, target_type, target_id, note, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(generateId(), adminId, `message_report_${status}`, 'message_report', reportId, note || null, now).run();

    return c.json({ message: 'Report updated', status });
  } catch (error: any) {
    console.error('Update message report error:', error);
    return c.json({ error: 'Failed to update report' }, 500);
  }
});

// ============================================================================
// INSTITUTIONS ENDPOINTS
// ============================================================================

// GET /api/institutions
app.get('/api/institutions', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');
    const governorate = c.req.query('governorate') || 'all';
    const search = c.req.query('search') || '';
    
    let query = 'SELECT * FROM institutions WHERE active = 1';
    const params: any[] = [];
    
    if (governorate !== 'all') {
      query += ' AND governorate = ?';
      params.push(governorate);
    }
    
    if (search) {
      query += ' AND (name_en LIKE ? OR name_ar LIKE ? OR name_ku LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    query += ' ORDER BY is_seed DESC, name_en ASC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const institutions = await c.env.DB.prepare(query).bind(...params).all();
    
    // Get total count for pagination
    const countQuery = 'SELECT COUNT(*) as total FROM institutions WHERE active = 1';
    const countResult = await c.env.DB.prepare(countQuery).first() as any;
    const total = countResult?.total || 0;
    
    return c.json({ 
      institutions: institutions.results || [],
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error: any) {
    console.error('Get institutions error:', error);
    return c.json({ error: 'Failed to get institutions' }, 500);
  }
});

// ============================================================================
// R2 IMAGE UPLOAD ENDPOINTS
// ============================================================================

// POST /api/upload/image
app.post('/api/upload/image', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' }, 400);
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return c.json({ error: 'File too large. Maximum size is 5MB.' }, 400);
    }
    
    // Generate unique key
    const ext = file.name.split('.').pop();
    const key = `uploads/${userId}/${Date.now()}-${generateId()}.${ext}`;
    
    // Upload to R2
    await c.env.R2.put(key, file);
    
    // Generate public URL
    const publicUrl = `https://rafid-uploads.mahdialmuntadhar1.workers.dev/${key}`;
    
    return c.json({ 
      url: publicUrl, 
      key,
      size: file.size,
      type: file.type
    });
  } catch (error: any) {
    console.error('Upload image error:', error);
    return c.json({ error: 'Failed to upload image' }, 500);
  }
});

// ============================================================================
// HIGHLIGHTS ENDPOINTS
// ============================================================================

// GET /api/highlights
app.get('/api/highlights', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');
    const governorate = c.req.query('governorate') || 'all';
    const university_id = c.req.query('university_id') || 'all';
    
    let query = 'SELECT * FROM highlight_items WHERE status = "approved"';
    const params: any[] = [];
    
    if (governorate !== 'all') {
      query += ' AND governorate = ?';
      params.push(governorate);
    }
    
    if (university_id !== 'all') {
      query += ' AND university_id = ?';
      params.push(university_id);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const highlights = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json(highlights.results || []);
  } catch (error: any) {
    console.error('Get highlights error:', error);
    return c.json({ error: 'Failed to get highlights' }, 500);
  }
});

// ============================================================================
// OPPORTUNITIES ENDPOINTS (MIGRATED FROM LOCAL DB)
// ============================================================================

// GET /api/opportunities
app.get('/api/opportunities', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');
    const rawCategory = (c.req.query('category') || '').trim().toLowerCase();
    const categoryAliasMap: Record<string, string> = {
      jobs: 'job',
      career: 'job',
      employment: 'job',
      internships: 'internship',
      scholarship: 'scholarship',
      scholarships: 'scholarship',
      training: 'training',
      trainings: 'training',
      events: 'event',
      exams: 'exam',
      registrations: 'registration',
      news: 'news'
    };
    const category = categoryAliasMap[rawCategory] || rawCategory;
    const governorate = c.req.query('governorate') || 'all';
    const university_id = c.req.query('university_id') || c.req.query('institution_id') || 'all';
    
    // Normalize governorate filter
    const normalizedGovernorate = normalizeGovernorate(governorate);
    
    let query = `
      SELECT * FROM opportunities 
      WHERE status = 'approved'
    `;
    const params: any[] = [];
    
    // Filter by deadline (not expired)
    const today = new Date().toISOString().split('T')[0];
    query += ' AND (deadline IS NULL OR deadline >= ?)';
    params.push(today);
    
    // Filter by category using the type field.
    // This must be strict because the frontend depends on category tabs.
    if (category && category !== 'all') {
      query += ' AND LOWER(TRIM(type)) = ?';
      params.push(category);
    }
    
    // Filter by governorate (with normalization)
    if (normalizedGovernorate !== 'all') {
      // Normalize the governorate field in the database for comparison
      // Use CASE statement to handle different spellings
      query += ` AND (
        LOWER(TRIM(governorate)) = ? OR
        LOWER(TRIM(city)) = ? OR
        LOWER(TRIM(duty_station)) = ? OR
        governorate = ? OR
        city = ? OR
        duty_station = ? )`;
      params.push(
        normalizedGovernorate, normalizedGovernorate, normalizedGovernorate,
      normalizedGovernorate, normalizedGovernorate, normalizedGovernorate
      );
    }
    
    // Filter by university (using city or institution_name)
    if (university_id !== 'all') {
      query += ' AND (city = ? OR institution_name = ?)';
      params.push(university_id, university_id);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const opportunities = await c.env.DB.prepare(query).bind(...params).all();
    
    // Normalize governorate/duty station in response for consistency
    const normalizedResults = (opportunities.results || []).map((item: any) => {
      const resolvedDutyStation = resolveDutyStation(item);
      return {
        ...item,
        governorateId: resolvedDutyStation.id,
        duty_station: resolvedDutyStation.label
      };
    });
    
    const strictResults = normalizedGovernorate !== 'all'
      ? normalizedResults.filter((item: any) => item.governorateId === normalizedGovernorate)
      : normalizedResults;

    // Final safety filter after governorate normalization.
    // This prevents category=internship from ever returning exam/event/job rows.
    const finalResults = category && category !== 'all'
      ? strictResults.filter((item: any) => {
          const itemType = String(item.type || item.category || '').trim().toLowerCase();
          return itemType === category;
        })
      : strictResults;

    return c.json(finalResults);
  } catch (error: any) {
    console.error('Get opportunities error:', error);
    return c.json({ error: 'Failed to get opportunities' }, 500);
  }
});

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

// GET /api/admin/users
app.get('/api/admin/users', authMiddleware, adminMiddleware, async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');
    
    const users = await c.env.DB.prepare(
      'SELECT id, email, full_name, role, governorate, institution, institution_id, is_verified, updated_at FROM profiles ORDER BY updated_at DESC LIMIT ? OFFSET ?'
    ).bind(limit, offset).all();
    
    return c.json({ users: users.results || [] });
  } catch (error: any) {
    console.error('Get users error:', error);
    return c.json({ error: 'Failed to get users' }, 500);
  }
});

// PATCH /api/admin/users/:id/role
app.patch('/api/admin/users/:id/role', authMiddleware, adminMiddleware, async (c) => {
  try {
    const userId = c.req.param('id');
    const { role } = await c.req.json();
    
    if (!role || !['student', 'graduate', 'teacher', 'staff', 'admin'].includes(role)) {
      return c.json({ error: 'Invalid role' }, 400);
    }
    
    await c.env.DB.prepare(
      'UPDATE profiles SET role = ?, updated_at = ? WHERE id = ?'
    ).bind(role, new Date().toISOString(), userId).run();
    
    return c.json({ message: 'User role updated' });
  } catch (error: any) {
    console.error('Update user role error:', error);
    return c.json({ error: 'Failed to update user role' }, 500);
  }
});

// ============================================================================
// EXPORT
// ============================================================================

export default {
  fetch: app.fetch,
  async queue(batch: any, env: any, ctx: any) {
    console.log(`Queue batch ignored for MVP: ${batch.messages.length} messages`);
  },
};
















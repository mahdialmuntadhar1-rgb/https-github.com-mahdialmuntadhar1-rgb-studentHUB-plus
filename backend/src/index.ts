import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  DB: D1Database;
  BUCKET: R2Bucket;
  JWT_SECRET: string;
  R2_PUBLIC_URL: string;
  OUTREACH_QUEUE?: Queue<OutreachQueueMessage>;
  EMAIL_PROVIDER?: string;
  EMAIL_API_KEY?: string;
  EMAIL_FROM_NAME?: string;
  EMAIL_FROM_ADDRESS?: string;
  EMAIL_REPLY_TO?: string;
  PUBLIC_APP_URL?: string;
  UNSUBSCRIBE_SECRET?: string;
  ADMIN_TEST_EMAIL?: string;
  DRY_RUN?: string;
  TEST_MODE?: string;
  BATCH_SIZE?: string;
  DELAY_SECONDS?: string;
  MAX_PER_DAY?: string;
  DRY_RUN_AUTOMATION?: string;
};

type Variables = {
  userId: string;
};

type OutreachQueueMessage = {
  campaignId: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// â”€â”€â”€ CORS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// â”€â”€â”€ JWT HELPERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function signJWT(payload: Record<string, unknown>, secret: string): Promise<string> {
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const sigInput = `${header}.${body}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(sigInput));
  const encodedSig = bytesToBase64Url(new Uint8Array(sig));

  return `${sigInput}.${encodedSig}`;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlEncode(value: string): string {
  return bytesToBase64Url(new TextEncoder().encode(value));
}

function base64UrlDecode(value: string): string {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function verifyJWT(
  token: string,
  secret: string
): Promise<Record<string, unknown> | null> {
  try {
    if (!secret) return null;
    const [header, body, sig] = token.split('.');
    if (!header || !body || !sig) return null;

    const sigInput = `${header}.${body}`;
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const sigBytes = Uint8Array.from(
      atob(sig.replace(/-/g, '+').replace(/_/g, '/')),
      (c) => c.charCodeAt(0)
    );
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      new TextEncoder().encode(sigInput)
    );
    if (!valid) return null;

    return JSON.parse(base64UrlDecode(body));
  } catch {
    return null;
  }
}

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function hashResetToken(token: string): Promise<string> {
  return hashPassword(token);
}

function createResetToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
}

// â”€â”€â”€ AUTH MIDDLEWARE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const token = authHeader.slice(7);
  const payload = await verifyJWT(token, c.env.JWT_SECRET);
  if (!payload) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
  c.set('userId', payload.userId as string);
  await next();
};

// â”€â”€â”€ ADMIN MIDDLEWARE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const adminMiddleware = async (c: any, next: any) => {
  const userId = c.get('userId');
  const user = await c.env.DB.prepare('SELECT role FROM profiles WHERE id = ?')
    .bind(userId)
    .first() as any;

  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return c.json({ error: 'Forbidden: Admin access required' }, 403);
  }

  c.set('userRole', user.role);
  await next();
};

// â”€â”€â”€ RATE LIMITING MIDDLEWARE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const rateLimitMiddleware = async (c: any, next: any) => {
  const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
  const limit = 100; // requests per minute
  const windowMs = 60 * 1000; // 1 minute

  try {
    const now = new Date().toISOString();
    
    // Get current rate limit record
    const record = await c.env.DB.prepare('SELECT * FROM rate_limits WHERE ip_address = ?')
      .bind(ip)
      .first() as any;

    if (!record) {
      // First request from this IP
      await c.env.DB.prepare('INSERT INTO rate_limits (ip_address, request_count, window_start) VALUES (?, 1, ?)')
        .bind(ip, now)
        .run();
      await next();
      return;
    }

    const windowStart = new Date(record.window_start);
    const windowElapsed = Date.now() - windowStart.getTime();

    if (windowElapsed > windowMs) {
      // Window expired, reset
      await c.env.DB.prepare('UPDATE rate_limits SET request_count = 1, window_start = ? WHERE ip_address = ?')
        .bind(now, ip)
        .run();
      await next();
      return;
    }

    if (record.request_count >= limit) {
      return c.json({ error: 'Too many requests, please try again later' }, 429);
    }

    // Increment count
    await c.env.DB.prepare('UPDATE rate_limits SET request_count = request_count + 1 WHERE ip_address = ?')
      .bind(ip)
      .run();

    await next();
  } catch (err) {
    console.error('Rate limit error:', err);
    // On error, allow request through
    await next();
  }
};

// â”€â”€â”€ AUTH ROUTES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

app.post('/api/auth/register', rateLimitMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const fullName = String(body.full_name || body.name || body.fullName || body.displayName || '').trim();

    if (!email || !password || !fullName) {
      return c.json({ error: 'Ø§Ù„Ø§Ø³Ù… ÙˆØ§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ ÙˆÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ù…Ø·Ù„ÙˆØ¨Ø©' }, 400);
    }

    const existing = await c.env.DB.prepare('SELECT id FROM profiles WHERE lower(email) = lower(?)')
      .bind(email)
      .first();
    if (existing) {
      return c.json({ error: 'Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ù…Ø³ØªØ®Ø¯Ù… Ù…Ø³Ø¨Ù‚Ø§Ù‹' }, 409);
    }

    const id = crypto.randomUUID();
    const passwordHash = await hashPassword(password);
    const verificationToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    await c.env.DB.prepare(
      `INSERT INTO profiles
        (id, email, password_hash, full_name, role, verification_token, verification_expires_at)
       VALUES (?, ?, ?, ?, 'student', ?, ?)`
    )
      .bind(id, email, passwordHash, fullName, verificationToken, expiresAt)
      .run();

    const token = await signJWT({ userId: id, email }, c.env.JWT_SECRET);
    const user = { id, email, full_name: fullName, role: 'student' };
    
    // In production, send email with verification link
    // For now, return the token for development
    return c.json({ success: true, token, user }, 201);
  } catch (e: any) {
    console.error('Auth register error:', e?.message || e);
    if (e.message?.includes('UNIQUE')) {
      return c.json({ error: 'Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ù…Ø³ØªØ®Ø¯Ù… Ù…Ø³Ø¨Ù‚Ø§Ù‹' }, 409);
    }
    return c.json({ error: 'ÙØ´Ù„ Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø­Ø³Ø§Ø¨ØŒ Ø­Ø§ÙˆÙ„ Ù…Ø¬Ø¯Ø¯Ø§Ù‹' }, 500);
  }
});

app.post('/api/auth/login', rateLimitMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!email || !password) {
      return c.json({ error: 'Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ ÙˆÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ù…Ø·Ù„ÙˆØ¨Ø§Ù†' }, 400);
    }

    const passwordHash = await hashPassword(password);
    const user = await c.env.DB.prepare(
      `SELECT id, email, full_name, governorate, institution, institution_id,
              stage, interests, bio, avatar_url, role
       FROM profiles WHERE lower(email) = lower(?) AND password_hash = ?`
    )
      .bind(email, passwordHash)
      .first() as any;

    if (!user) {
      return c.json({ error: 'Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø£Ùˆ ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± ØºÙŠØ± ØµØ­ÙŠØ­Ø©' }, 401);
    }

    const token = await signJWT({ userId: user.id, email: user.email }, c.env.JWT_SECRET);
    return c.json({ success: true, token, user });
  } catch (e: any) {
    console.error('Auth login error:', e?.message || e);
    return c.json({ error: 'ÙØ´Ù„ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ØŒ Ø­Ø§ÙˆÙ„ Ù„Ø§Ø­Ù‚Ø§Ù‹' }, 500);
  }
});

app.get('/api/auth/me', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const user = await c.env.DB.prepare(
      `SELECT id, email, full_name, governorate, institution, institution_id,
              stage, interests, bio, avatar_url, role, is_verified
       FROM profiles WHERE id = ?`
    )
      .bind(userId)
      .first();

    if (!user) return c.json({ error: 'User not found' }, 404);
    return c.json({ success: true, user });
  } catch (e: any) {
    console.error('Auth me error:', e?.message || e);
    return c.json({ error: 'ÙØ´Ù„ Ø¬Ù„Ø¨ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…' }, 500);
  }
});

app.post('/api/auth/send-verification-email', rateLimitMiddleware, async (c) => {
  const { email } = await c.req.json();
  if (!email) {
    return c.json({ error: 'Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ù…Ø·Ù„ÙˆØ¨' }, 400);
  }

  // Mock: Log to console instead of sending real email
  console.log(`[EMAIL SERVICE] Verification email would be sent to: ${email}`);
  console.log(`[EMAIL SERVICE] Verification link: https://rafid.mahdialmuntadhar1.workers.dev/verify?email=${encodeURIComponent(email)}&token=mock-token`);

  return c.json({ message: 'ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø±Ø§Ø¨Ø· Ø§Ù„ØªØ­Ù‚Ù‚ Ø¥Ù„Ù‰ Ø¨Ø±ÙŠØ¯Ùƒ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ' });
});

app.post('/api/auth/forgot-password', rateLimitMiddleware, async (c) => {
  const genericMessage = 'Ø¥Ø°Ø§ ÙƒØ§Ù† Ø§Ù„Ø¨Ø±ÙŠØ¯ Ù…ÙˆØ¬ÙˆØ¯Ø§Ù‹ØŒ Ø³ÙŠØªÙ… Ø¥Ø±Ø³Ø§Ù„ ØªØ¹Ù„ÙŠÙ…Ø§Øª Ø§Ù„Ø§Ø³ØªØ¹Ø§Ø¯Ø© Ø¹Ù†Ø¯ ØªÙØ¹ÙŠÙ„ Ø®Ø¯Ù…Ø© Ø§Ù„Ø¨Ø±ÙŠØ¯.';

  try {
    const body = await c.req.json().catch(() => ({}));
    const email = String(body.email || '').trim().toLowerCase();

    if (!email || !email.includes('@')) {
      return c.json({ success: true, message: genericMessage });
    }

    const user = await c.env.DB.prepare('SELECT id, email FROM profiles WHERE lower(email) = lower(?)')
      .bind(email)
      .first() as any;

    if (user) {
      const resetToken = createResetToken();
      const tokenHash = await hashResetToken(resetToken);
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

      await c.env.DB.prepare('DELETE FROM password_resets WHERE lower(email) = lower(?)')
        .bind(email)
        .run();

      await c.env.DB.prepare(
        'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)'
      )
        .bind(email, tokenHash, expiresAt)
        .run();

      // TODO: Send resetToken via a configured transactional email provider.
      console.log('Password reset requested for existing account; email provider is not configured yet.');
    }

    return c.json({ success: true, message: genericMessage });
  } catch (e: any) {
    console.error('Forgot password error:', e?.message || e);
    return c.json({ success: true, message: genericMessage });
  }
});

app.post('/api/auth/reset-password', rateLimitMiddleware, async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const token = String(body.token || body.code || body.tokenOrCode || '').trim();
    const newPassword = String(body.password || body.new_password || body.newPassword || '').trim();

    if (!token || !newPassword) {
      return c.json({ error: 'Ø§Ù„Ø±Ù…Ø² ÙˆÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø© Ù…Ø·Ù„ÙˆØ¨Ø§Ù†' }, 400);
    }

    if (newPassword.length < 8) {
      return c.json({ error: 'ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± ÙŠØ¬Ø¨ Ø£Ù† ØªÙƒÙˆÙ† 8 Ø£Ø­Ø±Ù Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„' }, 400);
    }

    const tokenHash = await hashResetToken(token);
    const reset = await c.env.DB.prepare(
      'SELECT email FROM password_resets WHERE token = ? AND expires_at > ?'
    )
      .bind(tokenHash, new Date().toISOString())
      .first() as any;

    if (!reset) {
      return c.json({ error: 'Ø±Ù…Ø² Ø¥Ø¹Ø§Ø¯Ø© ØªØ¹ÙŠÙŠÙ† ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± ØºÙŠØ± ØµØ§Ù„Ø­ Ø£Ùˆ Ù…Ù†ØªÙ‡ÙŠ Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ©' }, 400);
    }

    const passwordHash = await hashPassword(newPassword);
    await c.env.DB.batch([
      c.env.DB.prepare('UPDATE profiles SET password_hash = ? WHERE lower(email) = lower(?)')
        .bind(passwordHash, reset.email),
      c.env.DB.prepare('DELETE FROM password_resets WHERE token = ?')
        .bind(tokenHash)
    ]);

    return c.json({ success: true, message: 'ØªÙ… ØªØ­Ø¯ÙŠØ« ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ø¨Ù†Ø¬Ø§Ø­' });
  } catch (e: any) {
    console.error('Reset password error:', e?.message || e);
    return c.json({ error: 'Ø§Ù„Ø®Ø¯Ù…Ø© ØºÙŠØ± Ù…ØªØ§Ø­Ø© Ø­Ø§Ù„ÙŠØ§Ù‹ØŒ Ø­Ø§ÙˆÙ„ Ù„Ø§Ø­Ù‚Ø§Ù‹' }, 500);
  }
});

app.post('/api/auth/verify-email', async (c) => {
  const { token } = await c.req.json();
  if (!token) {
    return c.json({ error: 'Ø±Ù…Ø² Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ø·Ù„ÙˆØ¨' }, 400);
  }

  const user = await c.env.DB.prepare(
    'SELECT id FROM profiles WHERE verification_token = ? AND verification_expires_at > CURRENT_TIMESTAMP'
  )
    .bind(token)
    .first();

  if (!user) {
    return c.json({ error: 'Ø±Ù…Ø² Ø§Ù„ØªØ­Ù‚Ù‚ ØºÙŠØ± ØµØ§Ù„Ø­ Ø£Ùˆ Ù…Ù†ØªÙ‡ÙŠ Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ©' }, 400);
  }

  await c.env.DB.prepare(
    'UPDATE profiles SET is_verified = 1, verification_token = NULL, verification_expires_at = NULL WHERE id = ?'
  )
    .bind(user.id)
    .run();

  return c.json({ message: 'ØªÙ… Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø¨Ù†Ø¬Ø§Ø­' });
});

// â”€â”€â”€ PROFILE ROUTES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

app.put('/api/profile', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const { full_name, governorate, institution, institution_id, stage, interests, bio } =
    await c.req.json();

  await c.env.DB.prepare(
    `UPDATE profiles SET
       full_name      = COALESCE(?, full_name),
       governorate    = COALESCE(?, governorate),
       institution    = COALESCE(?, institution),
       institution_id = COALESCE(?, institution_id),
       stage          = COALESCE(?, stage),
       interests      = COALESCE(?, interests),
       bio            = COALESCE(?, bio),
       updated_at     = CURRENT_TIMESTAMP
     WHERE id = ?`
  )
    .bind(
      full_name || null,
      governorate || null,
      institution || null,
      institution_id || null,
      stage || null,
      interests != null ? JSON.stringify(interests) : null,
      bio || null,
      userId
    )
    .run();

  const user = await c.env.DB.prepare(
    `SELECT id, email, full_name, governorate, institution, institution_id,
            stage, interests, bio, avatar_url, role
     FROM profiles WHERE id = ?`
  )
    .bind(userId)
    .first();

  return c.json(user);
});

// â”€â”€â”€ POSTS ROUTES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

app.get('/api/posts', rateLimitMiddleware, async (c) => {
  const governorate = c.req.query('governorate');
  const institution = c.req.query('institution');
  const type = c.req.query('type');
  const following = c.req.query('following') === 'true';
  const page = Math.max(parseInt(c.req.query('page') || '1'), 1);
  const limit = Math.min(parseInt(c.req.query('limit') || '10'), 100);
  const offset = (page - 1) * limit;

  // Extract userId from Authorization header for following filter
  let userId: string | null = null;
  const authHeader = c.req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const payload = await verifyJWT(token, c.env.JWT_SECRET);
    userId = payload?.sub as string || null;
  }

  let query = `
    SELECT p.*,
           pr.full_name    AS author_full_name,
           pr.avatar_url   AS author_avatar_url
    FROM posts p
    LEFT JOIN profiles pr ON p.author_id = pr.id
  `;
  const params: (string | number)[] = [];

  if (following) {
    if (!userId) {
      return c.json({ error: 'Authentication required for following feed' }, 401);
    }
    query += `
      INNER JOIN follows f ON p.author_id = f.followee_id
      WHERE f.follower_id = ?
    `;
    params.push(userId);
  } else {
    query += ' WHERE 1=1';
  }

  if (governorate) {
    query += ' AND p.governorate = ?';
    params.push(governorate);
  }
  if (institution) {
    query += ' AND p.institution = ?';
    params.push(institution);
  }
  if (type) {
    query += ' AND p.type = ?';
    params.push(type);
  }

  // Get total count
  const countQuery = query.replace('SELECT p.*, pr.full_name AS author_full_name, pr.avatar_url AS author_avatar_url', 'SELECT COUNT(*) as count');
  const countStmt = c.env.DB.prepare(countQuery);
  const countResult = await (params.length > 0 ? countStmt.bind(...params) : countStmt).first<{ count: number }>();
  const total = countResult?.count || 0;

  // Get paginated results
  query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const stmt = c.env.DB.prepare(query);
  const result = await (params.length > 0 ? stmt.bind(...params) : stmt).all();

  return c.json({
    posts: result.results,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total
    }
  });
});

app.get('/api/profile/:userId/posts', async (c) => {
  const userId = c.req.param('userId');
  const page = Math.max(parseInt(c.req.query('page') || '1'), 1);
  const limit = Math.min(parseInt(c.req.query('limit') || '10'), 100);
  const offset = (page - 1) * limit;

  const query = `
    SELECT p.*,
           pr.full_name    AS author_full_name,
           pr.avatar_url   AS author_avatar_url
    FROM posts p
    LEFT JOIN profiles pr ON p.author_id = pr.id
    WHERE p.author_id = ?
    ORDER BY p.created_at DESC LIMIT ? OFFSET ?
  `;

  // Get total count
  const countQuery = `SELECT COUNT(*) as count FROM posts WHERE author_id = ?`;
  const countResult = await c.env.DB.prepare(countQuery)
    .bind(userId)
    .first<{ count: number }>();
  const total = countResult?.count || 0;

  // Get paginated results
  const stmt = c.env.DB.prepare(query);
  const result = await stmt.bind(userId, limit, offset).all();

  return c.json({
    posts: result.results,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total
    }
  });
});

app.post('/api/posts', authMiddleware, rateLimitMiddleware, async (c) => {
  const userId = c.get('userId');
  const { type, content, title, image_url, governorate, institution, institution_id, is_verified, metadata } =
    await c.req.json();

  if (!content || !type || !governorate || !institution) {
    return c.json({ error: 'Ù†ÙˆØ¹ Ø§Ù„Ù…Ù†Ø´ÙˆØ± ÙˆØ§Ù„Ù…Ø­ØªÙˆÙ‰ ÙˆØ§Ù„Ù…Ø­Ø§ÙØ¸Ø© ÙˆØ§Ù„Ù…Ø¤Ø³Ø³Ø© Ù…Ø·Ù„ÙˆØ¨Ø©' }, 400);
  }

  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    `INSERT INTO posts
       (id, author_id, type, content, title, image_url, governorate, institution, institution_id, is_verified, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      userId,
      type,
      content,
      title || null,
      image_url || null,
      governorate,
      institution,
      institution_id || 'manual',
      is_verified ? 1 : 0,
      metadata ? JSON.stringify(metadata) : '{}'
    )
    .run();

  const post = await c.env.DB.prepare(
    `SELECT p.*, pr.full_name AS author_full_name, pr.avatar_url AS author_avatar_url
     FROM posts p LEFT JOIN profiles pr ON p.author_id = pr.id WHERE p.id = ?`
  )
    .bind(id)
    .first();

  return c.json(post, 201);
});

app.post('/api/posts/:id/like', authMiddleware, rateLimitMiddleware, async (c) => {
  const postId = c.req.param('id');
  const userId = c.get('userId');

  const existing = await c.env.DB.prepare(
    'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?'
  )
    .bind(postId, userId)
    .first();

  if (existing) {
    await c.env.DB.prepare('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?')
      .bind(postId, userId)
      .run();
    await c.env.DB.prepare(
      'UPDATE posts SET likes_count = MAX(0, likes_count - 1) WHERE id = ?'
    )
      .bind(postId)
      .run();
  } else {
    const likeId = crypto.randomUUID();
    await c.env.DB.prepare(
      'INSERT INTO post_likes (id, post_id, user_id) VALUES (?, ?, ?)'
    )
      .bind(likeId, postId, userId)
      .run();
    await c.env.DB.prepare('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?')
      .bind(postId)
      .run();
  }

  const post = await c.env.DB.prepare('SELECT likes_count FROM posts WHERE id = ?')
    .bind(postId)
    .first();

  return c.json({ liked: !existing, likes_count: (post as any)?.likes_count ?? 0 });
});

app.put('/api/posts/:id', authMiddleware, rateLimitMiddleware, async (c) => {
  const postId = c.req.param('id');
  const userId = c.get('userId');
  const { title, content, image_url } = await c.req.json();

  // Verify ownership
  const post = await c.env.DB.prepare('SELECT author_id FROM posts WHERE id = ?')
    .bind(postId)
    .first<{ author_id: string }>();

  if (!post) {
    return c.json({ error: 'Ø§Ù„Ù…Ù†Ø´ÙˆØ± ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯' }, 404);
  }

  if (post.author_id !== userId) {
    return c.json({ error: 'ØºÙŠØ± Ù…ØµØ±Ø­ Ù„Ùƒ Ø¨ØªØ¹Ø¯ÙŠÙ„ Ù‡Ø°Ø§ Ø§Ù„Ù…Ù†Ø´ÙˆØ±' }, 403);
  }

  // Build update query dynamically
  const updates: string[] = [];
  const params: any[] = [];

  if (title !== undefined) {
    updates.push('title = ?');
    params.push(title);
  }
  if (content !== undefined) {
    updates.push('content = ?');
    params.push(content);
  }
  if (image_url !== undefined) {
    updates.push('image_url = ?');
    params.push(image_url);
  }

  if (updates.length === 0) {
    return c.json({ error: 'Ù„Ù… ÙŠØªÙ… ØªÙˆÙÙŠØ± Ø£ÙŠ Ø­Ù‚ÙˆÙ„ Ù„Ù„ØªØ­Ø¯ÙŠØ«' }, 400);
  }

  params.push(postId);
  const query = `UPDATE posts SET ${updates.join(', ')} WHERE id = ?`;

  await c.env.DB.prepare(query).bind(...params).run();

  const updatedPost = await c.env.DB.prepare(
    `SELECT p.*, pr.full_name AS author_full_name, pr.avatar_url AS author_avatar_url
     FROM posts p LEFT JOIN profiles pr ON p.author_id = pr.id WHERE p.id = ?`
  )
    .bind(postId)
    .first();

  return c.json(updatedPost);
});

app.delete('/api/posts/:id', authMiddleware, rateLimitMiddleware, async (c) => {
  const postId = c.req.param('id');
  const userId = c.get('userId');

  // Verify ownership
  const post = await c.env.DB.prepare('SELECT author_id FROM posts WHERE id = ?')
    .bind(postId)
    .first<{ author_id: string }>();

  if (!post) {
    return c.json({ error: 'Ø§Ù„Ù…Ù†Ø´ÙˆØ± ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯' }, 404);
  }

  if (post.author_id !== userId) {
    return c.json({ error: 'ØºÙŠØ± Ù…ØµØ±Ø­ Ù„Ùƒ Ø¨Ø­Ø°Ù Ù‡Ø°Ø§ Ø§Ù„Ù…Ù†Ø´ÙˆØ±' }, 403);
  }

  // Cascade delete: likes, comments, then post
  await c.env.DB.prepare('DELETE FROM post_likes WHERE post_id = ?')
    .bind(postId)
    .run();

  await c.env.DB.prepare('DELETE FROM comments WHERE post_id = ?')
    .bind(postId)
    .run();

  await c.env.DB.prepare('DELETE FROM posts WHERE id = ?')
    .bind(postId)
    .run();

  return c.json({ message: 'ØªÙ… Ø­Ø°Ù Ø§Ù„Ù…Ù†Ø´ÙˆØ± Ø¨Ù†Ø¬Ø§Ø­' });
});

// â”€â”€â”€ COMMENTS ROUTES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

app.get('/api/posts/:id/comments', async (c) => {
  const postId = c.req.param('id');
  const comments = await c.env.DB.prepare(
    `SELECT c.*, pr.full_name AS author_name, pr.avatar_url AS author_avatar
     FROM comments c LEFT JOIN profiles pr ON c.author_id = pr.id
     WHERE c.post_id = ? ORDER BY c.created_at DESC LIMIT 50`
  )
    .bind(postId)
    .all();
  return c.json(comments.results);
});

app.post('/api/posts/:id/comments', authMiddleware, async (c) => {
  const postId = c.req.param('id');
  const userId = c.get('userId');
  const { content } = await c.req.json();

  if (!content?.trim()) {
    return c.json({ error: 'Ù…Ø­ØªÙˆÙ‰ Ø§Ù„ØªØ¹Ù„ÙŠÙ‚ Ù…Ø·Ù„ÙˆØ¨' }, 400);
  }

  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    `INSERT INTO comments (id, post_id, author_id, content) VALUES (?, ?, ?, ?)`
  )
    .bind(id, postId, userId, content.trim())
    .run();

  await c.env.DB.prepare('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?')
    .bind(postId)
    .run();

  const comment = await c.env.DB.prepare(
    `SELECT c.*, pr.full_name AS author_name, pr.avatar_url AS author_avatar
     FROM comments c LEFT JOIN profiles pr ON c.author_id = pr.id WHERE c.id = ?`
  )
    .bind(id)
    .first();

  return c.json(comment, 201);
});

app.put('/api/comments/:id', authMiddleware, async (c) => {
  const commentId = c.req.param('id');
  const userId = c.get('userId');
  const { content } = await c.req.json();

  // Verify ownership
  const comment = await c.env.DB.prepare('SELECT author_id, post_id FROM comments WHERE id = ?')
    .bind(commentId)
    .first<{ author_id: string; post_id: string }>();

  if (!comment) {
    return c.json({ error: 'Ø§Ù„ØªØ¹Ù„ÙŠÙ‚ ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯' }, 404);
  }

  if (comment.author_id !== userId) {
    return c.json({ error: 'ØºÙŠØ± Ù…ØµØ±Ø­ Ù„Ùƒ Ø¨ØªØ¹Ø¯ÙŠÙ„ Ù‡Ø°Ø§ Ø§Ù„ØªØ¹Ù„ÙŠÙ‚' }, 403);
  }

  if (!content?.trim()) {
    return c.json({ error: 'Ù…Ø­ØªÙˆÙ‰ Ø§Ù„ØªØ¹Ù„ÙŠÙ‚ Ù…Ø·Ù„ÙˆØ¨' }, 400);
  }

  await c.env.DB.prepare('UPDATE comments SET content = ? WHERE id = ?')
    .bind(content.trim(), commentId)
    .run();

  const updatedComment = await c.env.DB.prepare(
    `SELECT c.*, pr.full_name AS author_name, pr.avatar_url AS author_avatar
     FROM comments c LEFT JOIN profiles pr ON c.author_id = pr.id WHERE c.id = ?`
  )
    .bind(commentId)
    .first();

  return c.json(updatedComment);
});

app.delete('/api/comments/:id', authMiddleware, async (c) => {
  const commentId = c.req.param('id');
  const userId = c.get('userId');

  // Verify ownership
  const comment = await c.env.DB.prepare('SELECT author_id, post_id FROM comments WHERE id = ?')
    .bind(commentId)
    .first<{ author_id: string; post_id: string }>();

  if (!comment) {
    return c.json({ error: 'Ø§Ù„ØªØ¹Ù„ÙŠÙ‚ ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯' }, 404);
  }

  if (comment.author_id !== userId) {
    return c.json({ error: 'ØºÙŠØ± Ù…ØµØ±Ø­ Ù„Ùƒ Ø¨Ø­Ø°Ù Ù‡Ø°Ø§ Ø§Ù„ØªØ¹Ù„ÙŠÙ‚' }, 403);
  }

  await c.env.DB.prepare('DELETE FROM comments WHERE id = ?')
    .bind(commentId)
    .run();

  await c.env.DB.prepare('UPDATE posts SET comments_count = MAX(0, comments_count - 1) WHERE id = ?')
    .bind(comment.post_id)
    .run();

  return c.json({ message: 'ØªÙ… Ø­Ø°Ù Ø§Ù„ØªØ¹Ù„ÙŠÙ‚ Ø¨Ù†Ø¬Ø§Ø­' });
});

// â”€â”€â”€ FOLLOW ROUTES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

app.post('/api/follow/:userId', authMiddleware, async (c) => {
  const followerId = c.get('userId');
  const followeeId = c.req.param('userId');

  if (followerId === followeeId) {
    return c.json({ error: 'Ù„Ø§ ÙŠÙ…ÙƒÙ† Ù…ØªØ§Ø¨Ø¹Ø© Ù†ÙØ³Ùƒ' }, 400);
  }

  // Check if followee exists
  const followee = await c.env.DB.prepare('SELECT id FROM profiles WHERE id = ?')
    .bind(followeeId)
    .first();

  if (!followee) {
    return c.json({ error: 'Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯' }, 404);
  }

  // Check if already following
  const existing = await c.env.DB.prepare(
    'SELECT id FROM follows WHERE follower_id = ? AND followee_id = ?'
  )
    .bind(followerId, followeeId)
    .first();

  if (existing) {
    return c.json({ error: 'Ø£Ù†Øª ØªØªØ§Ø¨Ø¹ Ù‡Ø°Ø§ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø¨Ø§Ù„ÙØ¹Ù„' }, 400);
  }

  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    'INSERT INTO follows (id, follower_id, followee_id) VALUES (?, ?, ?)'
  )
    .bind(id, followerId, followeeId)
    .run();

  return c.json({ message: 'ØªÙ…Øª Ø§Ù„Ù…ØªØ§Ø¨Ø¹Ø© Ø¨Ù†Ø¬Ø§Ø­', following: true }, 201);
});

app.delete('/api/follow/:userId', authMiddleware, async (c) => {
  const followerId = c.get('userId');
  const followeeId = c.req.param('userId');

  const result = await c.env.DB.prepare(
    'DELETE FROM follows WHERE follower_id = ? AND followee_id = ?'
  )
    .bind(followerId, followeeId)
    .run();

  if (result.meta.changes === 0) {
    return c.json({ error: 'Ø£Ù†Øª Ù„Ø§ ØªØªØ§Ø¨Ø¹ Ù‡Ø°Ø§ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…' }, 400);
  }

  return c.json({ message: 'ØªÙ… Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ù…ØªØ§Ø¨Ø¹Ø© Ø¨Ù†Ø¬Ø§Ø­', following: false });
});

// â”€â”€â”€ HIGHLIGHTS AUTOMATION SYSTEM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const HIGHLIGHT_CATEGORIES = ['event', 'job', 'internship', 'scholarship', 'student_club'] as const;
type HighlightCategory = typeof HIGHLIGHT_CATEGORIES[number];

const GOVERNORATE_ALIASES: Record<string, string[]> = {
  Baghdad: ['baghdad', 'Ø¨ØºØ¯Ø§Ø¯'],
  Basra: ['basra', 'basrah', 'Ø§Ù„Ø¨ØµØ±Ø©', 'Ø¨ØµØ±Ø©'],
  Erbil: ['erbil', 'arbil', 'hawler', 'Ø£Ø±Ø¨ÙŠÙ„', 'Ø§Ø±Ø¨ÙŠÙ„', 'Ù‡Û•ÙˆÙ„ÛŽØ±'],
  Sulaymaniyah: ['sulaymaniyah', 'sulaimani', 'slemani', 'Ø§Ù„Ø³Ù„ÙŠÙ…Ø§Ù†ÙŠØ©', 'Ø³Ù„ÛŽÙ…Ø§Ù†ÛŒ'],
  Duhok: ['duhok', 'dohuk', 'Ø¯Ù‡ÙˆÙƒ', 'Ø¯Ù‡Û†Ùƒ'],
  Halabja: ['halabja', 'Ø­Ù„Ø¨Ø¬Ø©', 'Ù‡Û•ÚµÛ•Ø¨Ø¬Û•'],
  Nineveh: ['nineveh', 'mosul', 'Ù†ÙŠÙ†ÙˆÙ‰', 'Ù†ÙŠÙ†ÙˆÙŠ', 'Ø§Ù„Ù…ÙˆØµÙ„'],
  Kirkuk: ['kirkuk', 'ÙƒØ±ÙƒÙˆÙƒ', 'Ú©Û•Ø±Ú©ÙˆÙˆÚ©'],
  Anbar: ['anbar', 'Ø§Ù„Ø£Ù†Ø¨Ø§Ø±', 'Ø§Ù„Ø§Ù†Ø¨Ø§Ø±'],
  Salahaddin: ['salahaddin', 'salah al-din', 'salahaldeen', 'ØµÙ„Ø§Ø­ Ø§Ù„Ø¯ÙŠÙ†'],
  Diyala: ['diyala', 'Ø¯ÙŠØ§Ù„Ù‰', 'Ø¯ÙŠØ§Ù„ÙŠ'],
  Babil: ['babil', 'babylon', 'Ø¨Ø§Ø¨Ù„'],
  Karbala: ['karbala', 'ÙƒØ±Ø¨Ù„Ø§Ø¡', 'Ú©Ø±Ø¨Ù„Ø§'],
  Najaf: ['najaf', 'Ø§Ù„Ù†Ø¬Ù', 'Ù†Ø¬Ù'],
  Qadisiyah: ['qadisiyah', 'diwaniyah', 'Ø§Ù„Ù‚Ø§Ø¯Ø³ÙŠØ©', 'Ø§Ù„Ø¯ÙŠÙˆØ§Ù†ÙŠØ©'],
  Wasit: ['wasit', 'ÙˆØ§Ø³Ø·'],
  'Dhi Qar': ['dhi qar', 'dhiqar', 'thi qar', 'Ø°ÙŠ Ù‚Ø§Ø±', 'Ø°ÙŠÙ‚Ø§Ø±'],
  Maysan: ['maysan', 'Ù…ÙŠØ³Ø§Ù†'],
  Muthanna: ['muthanna', 'Ø§Ù„Ù…Ø«Ù†Ù‰', 'Ù…Ø«Ù†Ù‰'],
};

function normalizeGovernorate(input?: string | null): string | null {
  if (!input) return null;
  const lowered = input.toLowerCase();
  for (const [canonical, aliases] of Object.entries(GOVERNORATE_ALIASES)) {
    if (aliases.some((alias) => lowered.includes(alias.toLowerCase()))) {
      return canonical;
    }
  }
  return null;
}

function normalizeSpace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function stripHtml(html: string): string {
  return normalizeSpace(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
  );
}

function detectLanguage(text: string): string {
  if (/[\u0600-\u06ff]/.test(text)) return 'ar';
  return 'en';
}

function classifyHighlight(text: string, fallback: HighlightCategory): HighlightCategory {
  const lower = text.toLowerCase();
  if (/(scholarship|grant|Ù…Ù†Ø­Ø©|Ø²Ù…Ø§Ù„Ø©|Ø¨ÙˆØ±Ø³ÛŒÙ‡)/.test(lower)) return 'scholarship';
  if (/(internship|ØªØ¯Ø±ÙŠØ¨|ØªØ¯Ø±ÙŠØ¨ ØµÙŠÙÙŠ|Ú•Ø§Ù‡ÛŽÙ†Ø§Ù†)/.test(lower)) return 'internship';
  if (/(job|career|vacancy|ÙˆØ¸ÙŠÙØ©|ÙØ±ØµØ© Ø¹Ù…Ù„|Ú©Ø§Ø±)/.test(lower)) return 'job';
  if (/(club|Ù†Ø§Ø¯ÙŠ|ÙØ±ÙŠÙ‚ Ø·Ù„Ø§Ø¨ÙŠ|ÛŒØ§Ù†Û•)/.test(lower)) return 'student_club';
  if (/(event|workshop|conference|seminar|ÙØ¹Ø§Ù„ÙŠØ©|ÙˆØ±Ø´Ø©|Ù…Ø¤ØªÙ…Ø±|Ù†Ø¯ÙˆØ©)/.test(lower)) return 'event';
  return fallback;
}

function parseDateCandidate(text: string): string | null {
  const iso = text.match(/\b(20[2-9][0-9])[-/.](0?[1-9]|1[0-2])[-/.](0?[1-9]|[12][0-9]|3[01])\b/);
  if (iso) {
    const [, y, m, d] = iso;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const dmy = text.match(/\b(0?[1-9]|[12][0-9]|3[01])[-/.](0?[1-9]|1[0-2])[-/.](20[2-9][0-9])\b/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return null;
}

function absoluteUrl(baseUrl: string, href?: string | null): string | null {
  if (!href) return null;
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

function makeDuplicateKey(item: {
  category: string;
  title: string;
  organization?: string | null;
  governorate?: string | null;
  deadline?: string | null;
  event_date?: string | null;
}): string {
  return [item.category, item.title, item.organization || '', item.governorate || '', item.deadline || item.event_date || '']
    .map((part) => normalizeSpace(String(part).toLowerCase()).replace(/[^\p{L}\p{N}]+/gu, '-'))
    .join('|');
}

async function detectUniversityId(db: D1Database, text: string): Promise<string | null> {
  const institutions = await db.prepare(
    `SELECT institution_id, institution
     FROM profiles
     WHERE institution IS NOT NULL AND institution != ''
     GROUP BY institution_id, institution
     LIMIT 300`
  ).all();

  const lower = text.toLowerCase();
  for (const row of institutions.results as any[]) {
    const name = String(row.institution || '').toLowerCase();
    if (name && lower.includes(name)) return row.institution_id || row.institution;
  }
  return null;
}

function extractHighlightCandidates(source: any, html: string): any[] {
  if (source.category === 'student_club') return [];

  const text = stripHtml(html);
  const title =
    stripHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '') ||
    normalizeSpace(text.slice(0, 90));
  const summary = normalizeSpace(text.slice(0, 280));
  const sourceUrl = source.source_url;
  const applyMatch = html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>(?:\s|.){0,80}?(apply|register|Ù‚Ø¯Ù…|Ø³Ø¬Ù„|Ø§Ù„ØªÙ‚Ø¯ÙŠÙ…|Ø§Ù„ØªØ³Ø¬ÙŠÙ„)(?:\s|.){0,80}?<\/a>/i);
  const firstLink = html.match(/<a[^>]+href=["']([^"']+)["']/i);
  const applyUrl = absoluteUrl(sourceUrl, applyMatch?.[1] || firstLink?.[1]) || sourceUrl;
  const date = parseDateCandidate(text);
  const category = classifyHighlight(`${title} ${summary}`, source.category);
  const governorate = normalizeGovernorate(`${source.governorate_scope || ''} ${text}`);

  if (!title || title.length < 5) return [];

  return [{
    category,
    title: title.slice(0, 180),
    organization: source.name,
    governorate: governorate || source.governorate_scope || null,
    city: null,
    source_name: source.name,
    source_url: sourceUrl,
    apply_url: applyUrl,
    event_date: category === 'event' ? date : null,
    deadline: category !== 'event' ? date : null,
    summary,
    full_description_optional: null,
    image_url: null,
    language: detectLanguage(text),
    confidence_score: governorate ? 76 : 58,
    raw_text: text.slice(0, 1500),
  }];
}

async function expireOldHighlights(db: D1Database) {
  const today = new Date().toISOString().slice(0, 10);
  await db.prepare(
    `UPDATE highlight_items
     SET status = 'expired', updated_at = CURRENT_TIMESTAMP
     WHERE status IN ('pending_review', 'approved')
       AND (
         (deadline IS NOT NULL AND deadline < ?)
         OR (event_date IS NOT NULL AND event_date < ?)
       )`
  ).bind(today, today).run();
}

async function runHighlightsImport(db: D1Database): Promise<{ sourcesChecked: number; itemsAdded: number; duplicatesFound: number }> {
  await expireOldHighlights(db);

  const sources = await db.prepare(
    `SELECT * FROM highlight_sources
     WHERE enabled = 1
     ORDER BY scraping_priority DESC, created_at ASC`
  ).all();

  let itemsAdded = 0;
  let duplicatesFound = 0;

  for (const source of sources.results as any[]) {
    const startedAt = new Date().toISOString();
    const logId = crypto.randomUUID();
    let itemsFound = 0;
    let addedForSource = 0;
    let dupesForSource = 0;
    let status = 'success';
    let errorMessage: string | null = null;

    try {
      const res = await fetch(source.source_url, {
        headers: {
          'User-Agent': 'RafidHighlightsBot/1.0 (+student opportunities aggregator)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ar,ku,en;q=0.8',
        },
      });
      if (!res.ok) throw new Error(`Source returned HTTP ${res.status}`);

      const html = await res.text();
      const candidates = extractHighlightCandidates(source, html);
      itemsFound = candidates.length;

      for (const item of candidates) {
        const universityId = await detectUniversityId(db, `${item.title} ${item.summary} ${source.university_scope || ''}`);
        const duplicateKey = makeDuplicateKey(item);
        const duplicate = await db.prepare('SELECT id FROM highlight_items WHERE duplicate_key = ?')
          .bind(duplicateKey)
          .first();

        if (duplicate) {
          dupesForSource++;
          duplicatesFound++;
          continue;
        }

        const insertStatus = source.auto_publish && source.trusted_source ? 'approved' : 'pending_review';
        await db.prepare(
          `INSERT INTO highlight_items (
            id, category, title, organization, governorate, city, university_id,
            source_name, source_url, apply_url, event_date, deadline, summary,
            full_description_optional, image_url, language, status, duplicate_key,
            confidence_score, raw_text
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          crypto.randomUUID(),
          item.category,
          item.title,
          item.organization,
          item.governorate,
          item.city,
          universityId,
          item.source_name,
          item.source_url,
          item.apply_url,
          item.event_date,
          item.deadline,
          item.summary,
          item.full_description_optional,
          item.image_url,
          item.language,
          insertStatus,
          duplicateKey,
          item.confidence_score,
          item.raw_text
        ).run();
        addedForSource++;
        itemsAdded++;
      }
    } catch (err: any) {
      status = 'error';
      errorMessage = err?.message || String(err);
    }

    await db.prepare(
      `INSERT INTO highlight_import_logs
       (id, source_id, category, started_at, finished_at, status, items_found, items_added, duplicates_found, error_message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      logId,
      source.id,
      source.category,
      startedAt,
      new Date().toISOString(),
      status,
      itemsFound,
      addedForSource,
      dupesForSource,
      errorMessage
    ).run();

    await db.prepare('UPDATE highlight_sources SET last_checked_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(source.id)
      .run();
  }

  return { sourcesChecked: sources.results.length, itemsAdded, duplicatesFound };
}

function bindOptional(value: unknown): string | number | null {
  if (value === undefined || value === '') return null;
  if (typeof value === 'boolean') return value ? 1 : 0;
  return value as string | number | null;
}

app.get('/api/highlights', async (c) => {
  await expireOldHighlights(c.env.DB);

  const category = c.req.query('category');
  const governorate = c.req.query('governorate');
  const universityId = c.req.query('university_id');
  const source = c.req.query('source');

  let query =
    `SELECT id, category, title, organization, governorate, city, university_id,
            source_name, source_url, apply_url, event_date, deadline, summary,
            image_url, language, created_at
     FROM highlight_items
     WHERE status = 'approved'
       AND (deadline IS NULL OR deadline >= date('now'))
       AND (event_date IS NULL OR event_date >= date('now'))`;
  const params: string[] = [];

  if (category && HIGHLIGHT_CATEGORIES.includes(category as HighlightCategory)) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (governorate) {
    query += ' AND governorate = ?';
    params.push(normalizeGovernorate(governorate) || governorate);
  }
  if (universityId) {
    query += ' AND university_id = ?';
    params.push(universityId);
  }
  if (source) {
    query += ' AND source_name = ?';
    params.push(source);
  }

  query += ' ORDER BY COALESCE(event_date, deadline, created_at) ASC LIMIT 100';
  const stmt = c.env.DB.prepare(query);
  const result = await (params.length ? stmt.bind(...params) : stmt).all();
  return c.json(result.results);
});

app.get('/api/highlights/:id', async (c) => {
  await expireOldHighlights(c.env.DB);
  const item = await c.env.DB.prepare(
    `SELECT id, category, title, organization, governorate, city, university_id,
            source_name, source_url, apply_url, event_date, deadline, summary,
            image_url, language, created_at
     FROM highlight_items
     WHERE id = ? AND status = 'approved'
       AND (deadline IS NULL OR deadline >= date('now'))
       AND (event_date IS NULL OR event_date >= date('now'))`
  ).bind(c.req.param('id')).first();

  if (!item) return c.json({ error: 'Highlight not found' }, 404);
  return c.json(item);
});

app.get('/api/admin/highlights/pending', authMiddleware, adminMiddleware, async (c) => {
  const result = await c.env.DB.prepare(
    `SELECT * FROM highlight_items
     WHERE status = 'pending_review'
     ORDER BY created_at DESC
     LIMIT 200`
  ).all();
  return c.json(result.results);
});

app.get('/api/admin/highlights', authMiddleware, adminMiddleware, async (c) => {
  const status = c.req.query('status');
  const category = c.req.query('category');
  const governorate = c.req.query('governorate');
  const universityId = c.req.query('university_id');
  let query = 'SELECT * FROM highlight_items WHERE 1=1';
  const params: string[] = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (governorate) {
    query += ' AND governorate = ?';
    params.push(normalizeGovernorate(governorate) || governorate);
  }
  if (universityId) {
    query += ' AND university_id = ?';
    params.push(universityId);
  }

  query += ' ORDER BY created_at DESC LIMIT 200';
  const stmt = c.env.DB.prepare(query);
  const result = await (params.length ? stmt.bind(...params) : stmt).all();
  return c.json(result.results);
});

app.post('/api/admin/highlights', authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.json();
  if (!body.title || !HIGHLIGHT_CATEGORIES.includes(body.category)) {
    return c.json({ error: 'Valid category and title are required' }, 400);
  }

  const item = {
    category: body.category,
    title: String(body.title).trim(),
    organization: bindOptional(body.organization),
    governorate: normalizeGovernorate(body.governorate) || bindOptional(body.governorate),
    deadline: bindOptional(body.deadline),
    event_date: bindOptional(body.event_date),
  };
  const duplicateKey = body.duplicate_key || makeDuplicateKey(item as any);

  await c.env.DB.prepare(
    `INSERT INTO highlight_items (
      id, category, title, organization, governorate, city, university_id,
      source_name, source_url, apply_url, event_date, deadline, summary,
      full_description_optional, image_url, language, status, duplicate_key,
      confidence_score, raw_text
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    crypto.randomUUID(),
    item.category,
    item.title,
    item.organization,
    item.governorate,
    bindOptional(body.city),
    bindOptional(body.university_id),
    bindOptional(body.source_name) || 'Manual admin',
    bindOptional(body.source_url),
    bindOptional(body.apply_url),
    item.event_date,
    item.deadline,
    bindOptional(body.summary),
    bindOptional(body.full_description_optional),
    bindOptional(body.image_url),
    bindOptional(body.language) || detectLanguage(`${item.title} ${body.summary || ''}`),
    body.status || 'pending_review',
    duplicateKey,
    Number(body.confidence_score || 95),
    bindOptional(body.raw_text)
  ).run();

  return c.json({ success: true }, 201);
});

app.post('/api/admin/highlights/:id/approve', authMiddleware, adminMiddleware, async (c) => {
  await c.env.DB.prepare("UPDATE highlight_items SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(c.req.param('id')).run();
  return c.json({ success: true });
});

app.post('/api/admin/highlights/:id/reject', authMiddleware, adminMiddleware, async (c) => {
  await c.env.DB.prepare("UPDATE highlight_items SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(c.req.param('id')).run();
  return c.json({ success: true });
});

app.post('/api/admin/highlights/:id/mark-duplicate', authMiddleware, adminMiddleware, async (c) => {
  await c.env.DB.prepare("UPDATE highlight_items SET status = 'duplicate', updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(c.req.param('id')).run();
  return c.json({ success: true });
});

app.post('/api/admin/highlights/:id/edit', authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.json();
  const current = await c.env.DB.prepare('SELECT * FROM highlight_items WHERE id = ?').bind(c.req.param('id')).first() as any;
  if (!current) return c.json({ error: 'Highlight not found' }, 404);

  const next = { ...current, ...body };
  next.governorate = normalizeGovernorate(next.governorate) || next.governorate;
  next.duplicate_key = makeDuplicateKey(next);

  await c.env.DB.prepare(
    `UPDATE highlight_items
     SET category = ?, title = ?, organization = ?, governorate = ?, city = ?,
         university_id = ?, source_name = ?, source_url = ?, apply_url = ?,
         event_date = ?, deadline = ?, summary = ?, full_description_optional = ?,
         image_url = ?, language = ?, status = ?, duplicate_key = ?,
         confidence_score = ?, raw_text = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(
    next.category,
    next.title,
    bindOptional(next.organization),
    bindOptional(next.governorate),
    bindOptional(next.city),
    bindOptional(next.university_id),
    bindOptional(next.source_name),
    bindOptional(next.source_url),
    bindOptional(next.apply_url),
    bindOptional(next.event_date),
    bindOptional(next.deadline),
    bindOptional(next.summary),
    bindOptional(next.full_description_optional),
    bindOptional(next.image_url),
    bindOptional(next.language),
    next.status,
    next.duplicate_key,
    Number(next.confidence_score || 50),
    bindOptional(next.raw_text),
    c.req.param('id')
  ).run();

  return c.json({ success: true });
});

app.get('/api/admin/highlight-sources', authMiddleware, adminMiddleware, async (c) => {
  const result = await c.env.DB.prepare('SELECT * FROM highlight_sources ORDER BY enabled DESC, scraping_priority DESC, created_at DESC').all();
  return c.json(result.results);
});

app.post('/api/admin/highlight-sources', authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.json();
  if (!body.name || !body.source_url || !HIGHLIGHT_CATEGORIES.includes(body.category)) {
    return c.json({ error: 'Source name, URL, and category are required' }, 400);
  }

  await c.env.DB.prepare(
    `INSERT INTO highlight_sources (
      id, name, source_url, category, governorate_scope, university_scope, source_type,
      enabled, trusted_source, auto_publish, scraping_priority
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    crypto.randomUUID(),
    body.name,
    body.source_url,
    body.category,
    bindOptional(normalizeGovernorate(body.governorate_scope) || body.governorate_scope),
    bindOptional(body.university_scope),
    body.source_type || 'web',
    body.enabled === false ? 0 : 1,
    body.trusted_source ? 1 : 0,
    body.auto_publish ? 1 : 0,
    Number(body.scraping_priority || 50)
  ).run();

  return c.json({ success: true }, 201);
});

app.post('/api/admin/highlight-sources/:id/toggle', authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const enabled = body.enabled === false || body.enabled === 0 ? 0 : 1;

  await c.env.DB.prepare(
    'UPDATE highlight_sources SET enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).bind(enabled, c.req.param('id')).run();

  return c.json({ success: true, enabled: Boolean(enabled) });
});

app.post('/api/admin/highlight-import/run', authMiddleware, adminMiddleware, async (c) => {
  const result = await runHighlightsImport(c.env.DB);
  return c.json({ success: true, ...result });
});

// â”€â”€â”€ OPPORTUNITIES ROUTES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

app.get('/api/opportunities', async (c) => {
  const type = c.req.query('type');
  const institution = c.req.query('institution');
  const city = c.req.query('city');

  let query = `
    SELECT
      id,
      title,
      category AS type,
      organization AS institution_name,
      image_url AS institution_logo,
      governorate,
      city,
      deadline,
      summary,
      description,
      eligibility,
      published_date,
      apply_url,
      source_url,
      country,
      language,
      salary_or_funding,
      created_at,
      updated_at
    FROM opportunity_candidates
    WHERE status = 'approved'
  `;
  const params: string[] = [];

  if (type) {
    query += ' AND category = ?';
    params.push(type);
  }
  if (institution) {
    query += ' AND organization = ?';
    params.push(institution);
  }
  if (city) {
    query += ' AND city = ?';
    params.push(city);
  }

  query += ' ORDER BY updated_at DESC, created_at DESC LIMIT 50';

  const stmt = c.env.DB.prepare(query);
  const result = await (params.length > 0 ? stmt.bind(...params) : stmt).all();
  return c.json(result.results);
});

app.post('/api/opportunities', authMiddleware, async (c) => {
  const { title, type, institution_name, institution_logo, governorate, city, deadline, tags } =
    await c.req.json();

  if (!title || !type || !institution_name) {
    return c.json({ error: 'Ø§Ù„Ø¹Ù†ÙˆØ§Ù† ÙˆØ§Ù„Ù†ÙˆØ¹ ÙˆØ§Ø³Ù… Ø§Ù„Ù…Ø¤Ø³Ø³Ø© Ù…Ø·Ù„ÙˆØ¨Ø©' }, 400);
  }

  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    `INSERT INTO opportunities (id, title, type, institution_name, institution_logo, governorate, city, deadline, tags)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      title,
      type,
      institution_name,
      institution_logo || null,
      governorate || null,
      city || null,
      deadline || null,
      tags ? JSON.stringify(tags) : '[]'
    )
    .run();

  const opp = await c.env.DB.prepare('SELECT * FROM opportunities WHERE id = ?')
    .bind(id)
    .first();
  return c.json(opp, 201);
});

// â”€â”€â”€ SEARCH ROUTE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

app.get('/api/search', rateLimitMiddleware, async (c) => {
  const query = c.req.query('q');
  if (!query || query.length < 2) {
    return c.json({ error: 'ÙƒÙ„Ù…Ø© Ø§Ù„Ø¨Ø­Ø« Ù…Ø·Ù„ÙˆØ¨Ø© (Ø­Ø±ÙÙŠÙ† Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„)' }, 400);
  }

  const searchTerm = `%${query}%`;
  const results: any = {
    posts: [],
    institutions: [],
    opportunities: []
  };

  // Search posts (title and content)
  const posts = await c.env.DB.prepare(
    `SELECT p.*, pr.full_name AS author_full_name, pr.avatar_url AS author_avatar_url
     FROM posts p
     LEFT JOIN profiles pr ON p.author_id = pr.id
     WHERE p.title LIKE ? OR p.content LIKE ?
     ORDER BY p.created_at DESC LIMIT 20`
  )
    .bind(searchTerm, searchTerm)
    .all();
  results.posts = posts.results;

  // Search institutions (from profiles)
  const institutions = await c.env.DB.prepare(
    `SELECT DISTINCT institution, governorate, COUNT(*) as student_count
     FROM profiles
     WHERE institution LIKE ?
     GROUP BY institution, governorate
     LIMIT 10`
  )
    .bind(searchTerm)
    .all();
  results.institutions = institutions.results;

  // Search opportunities (title)
  const opportunities = await c.env.DB.prepare(
    `SELECT * FROM opportunities
     WHERE title LIKE ? OR institution_name LIKE ?
     ORDER BY created_at DESC LIMIT 20`
  )
    .bind(searchTerm, searchTerm)
    .all();
  results.opportunities = opportunities.results;

  return c.json(results);
});

// â”€â”€â”€ ADMIN ROUTES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

app.get('/api/admin/stats', authMiddleware, adminMiddleware, async (c) => {
  const userRole = (c as any).get('userRole');
  
  // Get total users
  const usersResult = await c.env.DB.prepare('SELECT COUNT(*) as count FROM profiles')
    .first<{ count: number }>();
  const totalUsers = usersResult?.count || 0;

  // Get total posts
  const postsResult = await c.env.DB.prepare('SELECT COUNT(*) as count FROM posts')
    .first<{ count: number }>();
  const totalPosts = postsResult?.count || 0;

  // Get total comments
  const commentsResult = await c.env.DB.prepare('SELECT COUNT(*) as count FROM comments')
    .first<{ count: number }>();
  const totalComments = commentsResult?.count || 0;

  // Get total opportunities
  const opportunitiesResult = await c.env.DB.prepare('SELECT COUNT(*) as count FROM opportunities')
    .first<{ count: number }>();
  const totalOpportunities = opportunitiesResult?.count || 0;

  // Get users by role
  const studentsResult = await c.env.DB.prepare("SELECT COUNT(*) as count FROM profiles WHERE role = 'student'")
    .first<{ count: number }>();
  const adminsResult = await c.env.DB.prepare("SELECT COUNT(*) as count FROM profiles WHERE role = 'admin'")
    .first<{ count: number }>();
  const moderatorsResult = await c.env.DB.prepare("SELECT COUNT(*) as count FROM profiles WHERE role = 'moderator'")
    .first<{ count: number }>();

  return c.json({
    totalUsers,
    totalPosts,
    totalComments,
    totalOpportunities,
    usersByRole: {
      students: studentsResult?.count || 0,
      admins: adminsResult?.count || 0,
      moderators: moderatorsResult?.count || 0
    }
  });
});

app.delete('/api/admin/posts/:id', authMiddleware, adminMiddleware, async (c) => {
  const postId = c.req.param('id');
  const userRole = (c as any).get('userRole');

  // Only admins can delete any post, moderators can only delete posts from non-admins
  if (userRole === 'moderator') {
    const post = await c.env.DB.prepare('SELECT author_id FROM posts WHERE id = ?')
      .bind(postId)
      .first<{ author_id: string }>();
    
    if (!post) {
      return c.json({ error: 'Ø§Ù„Ù…Ù†Ø´ÙˆØ± ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯' }, 404);
    }

    const author = await c.env.DB.prepare('SELECT role FROM profiles WHERE id = ?')
      .bind(post.author_id)
      .first<{ role: string }>();

    if (author?.role === 'admin') {
      return c.json({ error: 'Moderators cannot delete admin posts' }, 403);
    }
  }

  // Cascade delete: likes, comments, then post
  await c.env.DB.prepare('DELETE FROM post_likes WHERE post_id = ?')
    .bind(postId)
    .run();

  await c.env.DB.prepare('DELETE FROM comments WHERE post_id = ?')
    .bind(postId)
    .run();

  await c.env.DB.prepare('DELETE FROM posts WHERE id = ?')
    .bind(postId)
    .run();

  return c.json({ message: 'ØªÙ… Ø­Ø°Ù Ø§Ù„Ù…Ù†Ø´ÙˆØ± Ø¨Ù†Ø¬Ø§Ø­' });
});

app.put('/api/admin/users/:id/role', authMiddleware, adminMiddleware, async (c) => {
  const targetUserId = c.req.param('id');
  const currentUserId = c.get('userId');
  const currentUserRole = (c as any).get('userRole');
  const { role } = await c.req.json();

  if (!role || !['student', 'moderator', 'admin'].includes(role)) {
    return c.json({ error: 'Invalid role. Must be student, moderator, or admin' }, 400);
  }

  // Moderators cannot change roles
  if (currentUserRole === 'moderator') {
    return c.json({ error: 'Moderators cannot change user roles' }, 403);
  }

  // Admins cannot change their own role
  if (targetUserId === currentUserId) {
    return c.json({ error: 'Cannot change your own role' }, 400);
  }

  // Check if target user exists
  const targetUser = await c.env.DB.prepare('SELECT id, role FROM profiles WHERE id = ?')
    .bind(targetUserId)
    .first<{ id: string; role: string }>();

  if (!targetUser) {
    return c.json({ error: 'Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯' }, 404);
  }

  // Update role
  await c.env.DB.prepare('UPDATE profiles SET role = ? WHERE id = ?')
    .bind(role, targetUserId)
    .run();

  return c.json({ message: 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¯ÙˆØ± Ø¨Ù†Ø¬Ø§Ø­', newRole: role });
});

// â”€â”€â”€ CHAT ROUTES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

app.get('/api/chat/rooms', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const rooms = await c.env.DB.prepare(
    `SELECT cr.*, 
            CASE 
              WHEN cr.user1_id = ? THEN u2.full_name
              ELSE u1.full_name
            END as other_user_name,
            CASE 
              WHEN cr.user1_id = ? THEN u2.avatar_url
              ELSE u1.avatar_url
            END as other_user_avatar,
            (SELECT content FROM messages WHERE room_id = cr.id ORDER BY created_at DESC LIMIT 1) as last_message,
            (SELECT created_at FROM messages WHERE room_id = cr.id ORDER BY created_at DESC LIMIT 1) as last_message_time
     FROM chat_rooms cr
     LEFT JOIN profiles u1 ON cr.user1_id = u1.id
     LEFT JOIN profiles u2 ON cr.user2_id = u2.id
     WHERE cr.user1_id = ? OR cr.user2_id = ?
     ORDER BY last_message_time DESC`
  )
    .bind(userId, userId, userId, userId)
    .all();
  return c.json(rooms.results);
});

app.post('/api/chat/rooms', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const { other_user_id } = await c.req.json();

  if (!other_user_id) {
    return c.json({ error: 'Ù…Ø¹Ø±Ù Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø§Ù„Ø¢Ø®Ø± Ù…Ø·Ù„ÙˆØ¨' }, 400);
  }

  // Check if room already exists
  const existing = await c.env.DB.prepare(
    'SELECT * FROM chat_rooms WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)'
  )
    .bind(userId, other_user_id, other_user_id, userId)
    .first();

  if (existing) {
    return c.json(existing);
  }

  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    'INSERT INTO chat_rooms (id, user1_id, user2_id) VALUES (?, ?, ?)'
  )
    .bind(id, userId, other_user_id)
    .run();

  const room = await c.env.DB.prepare('SELECT * FROM chat_rooms WHERE id = ?')
    .bind(id)
    .first();
  return c.json(room, 201);
});

app.get('/api/chat/rooms/:roomId/messages', authMiddleware, async (c) => {
  const roomId = c.req.param('roomId');
  const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100);

  const messages = await c.env.DB.prepare(
    `SELECT m.*, p.full_name as sender_name, p.avatar_url as sender_avatar
     FROM messages m
     LEFT JOIN profiles p ON m.sender_id = p.id
     WHERE m.room_id = ?
     ORDER BY m.created_at ASC
     LIMIT ?`
  )
    .bind(roomId, limit)
    .all();
  return c.json(messages.results);
});

app.post('/api/chat/rooms/:roomId/messages', authMiddleware, async (c) => {
  const roomId = c.req.param('roomId');
  const userId = c.get('userId');
  const { content } = await c.req.json();

  if (!content?.trim()) {
    return c.json({ error: 'Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ø±Ø³Ø§Ù„Ø© Ù…Ø·Ù„ÙˆØ¨' }, 400);
  }

  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    'INSERT INTO messages (id, room_id, sender_id, content) VALUES (?, ?, ?, ?)'
  )
    .bind(id, roomId, userId, content.trim())
    .run();

  const message = await c.env.DB.prepare(
    `SELECT m.*, p.full_name as sender_name, p.avatar_url as sender_avatar
     FROM messages m
     LEFT JOIN profiles p ON m.sender_id = p.id
     WHERE m.id = ?`
  )
    .bind(id)
    .first();
  return c.json(message, 201);
});

// â”€â”€â”€ UPLOAD (R2) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

app.post('/api/upload', authMiddleware, async (c) => {
  if (!c.env.BUCKET) {
    return c.json({ error: 'Image upload is not configured yet. Enable R2 in Cloudflare Dashboard.' }, 503);
  }

  const formData = await c.req.formData();
  const file = formData.get('file');

  if (!file || typeof file === 'string') return c.json({ error: 'Ù„Ù… ÙŠØªÙ… Ø¥Ø±ÙØ§Ù‚ Ù…Ù„Ù' }, 400);

  const fileObj = file as File;
  const ext = fileObj.name.split('.').pop() || 'jpg';
  const key = `uploads/${crypto.randomUUID()}.${ext}`;

  await c.env.BUCKET.put(key, await fileObj.arrayBuffer(), {
    httpMetadata: { contentType: fileObj.type },
  });

  const url = `${c.env.R2_PUBLIC_URL}/${key}`;
  return c.json({ url });
});

// â”€â”€â”€ GOVERNORATES & INSTITUTIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

app.get('/api/governorates', async (c) => {
  const governorates = await c.env.DB.prepare(
    'SELECT DISTINCT governorate FROM profiles WHERE governorate IS NOT NULL ORDER BY governorate'
  ).all();
  return c.json(governorates.results.map((r: any) => r.governorate));
});

app.get('/api/institutions', async (c) => {
  const governorate = c.req.query('governorate');
  const q = c.req.query('q')?.trim();
  const limit = Math.min(Math.max(parseInt(c.req.query('limit') || '50'), 1), 200);
  const offset = Math.max(parseInt(c.req.query('offset') || '0'), 0);
  let query = 'SELECT id, name_ar, name_ku, name_en, governorate, city, type, website, active FROM institutions WHERE active = 1';
  let countQuery = 'SELECT COUNT(*) as total FROM institutions WHERE active = 1';
  const params: any[] = [];
  const countParams: any[] = [];

  if (governorate) {
    const normalizedGovernorate = normalizeGovernorate(governorate) || governorate;
    query += ' AND governorate = ?';
    countQuery += ' AND governorate = ?';
    params.push(normalizedGovernorate);
    countParams.push(normalizedGovernorate);
  }

  if (q) {
    const search = `%${q}%`;
    query += ' AND (name_ar LIKE ? OR name_ku LIKE ? OR name_en LIKE ? OR website LIKE ?)';
    countQuery += ' AND (name_ar LIKE ? OR name_ku LIKE ? OR name_en LIKE ? OR website LIKE ?)';
    params.push(search, search, search, search);
    countParams.push(search, search, search, search);
  }

  query += ' ORDER BY governorate, COALESCE(name_ar, name_en), name_en LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const institutions = await c.env.DB.prepare(query).bind(...params).all();
  const countResult = await c.env.DB.prepare(countQuery).bind(...countParams).first() as any;
  const total = countResult?.total || 0;

  return c.json({
    institutions: institutions.results,
    pagination: {
      limit,
      offset,
      total,
      hasMore: offset + limit < total,
    },
  });
});

// â”€â”€â”€ OUTREACH EMAIL ADMIN MODULE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const OUTREACH_PLACEHOLDERS = [
  'institution_name',
  'contact_name',
  'email',
  'department',
  'governorate',
  'institution_type',
  'language',
  'unsubscribe_url',
] as const;

type OutreachContact = {
  id: string;
  institution_name?: string | null;
  contact_name?: string | null;
  email: string;
  phone?: string | null;
  department?: string | null;
  governorate?: string | null;
  institution_type?: string | null;
  language?: string | null;
  source?: string | null;
  status: string;
  notes?: string | null;
};

type OutreachTemplate = {
  id: string;
  name: string;
  subject_template: string;
  html_template: string;
  text_template: string;
  language?: string | null;
};

type OutreachCampaign = {
  id: string;
  name: string;
  template_id: string;
  status: string;
  segment_filter_json?: string | null;
};

type EmailProvider = {
  sendEmail(to: string, subject: string, html: string, text: string, metadata: Record<string, string>): Promise<{ messageId?: string }>;
  validateConfig(): void;
  handleWebhook(payload: any): Promise<{ email?: string; messageId?: string; event?: string }>;
};

function outreachId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replaceAll('-', '')}`;
}

function truthy(value?: string): boolean {
  return value === 'true' || value === '1' || value === 'yes';
}

function normalizeOutreachEmail(value: unknown): string {
  return String(value || '').trim().toLowerCase();
}

function validOutreachEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function escapeOutreachHtml(input: unknown): string {
  return String(input ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char] || char));
}

function sanitizeOutreachHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

function parseOutreachCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && quoted && next === '"') {
      field += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(field.trim());
      field = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  const headers = (rows.shift() || []).map((h) => h.trim().toLowerCase());
  return rows.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] || ''])));
}

async function outreachSha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function makeOutreachUnsubscribeToken(env: Bindings, contactId: string, email: string): Promise<string> {
  const payload = `${contactId}:${email}:${env.UNSUBSCRIBE_SECRET || 'missing-secret'}`;
  return `${contactId}.${await outreachSha256(payload)}`;
}

function outreachGreeting(contact: OutreachContact): string {
  if (contact.contact_name) return `Dear ${contact.contact_name},`;
  if (contact.institution_name) return `Dear ${contact.institution_name} Team,`;
  return 'Dear University Team,';
}

function renderOutreachTemplate(template: string, contact: OutreachContact, unsubscribeUrl: string): string {
  const values: Record<string, string> = {
    institution_name: contact.institution_name || '',
    contact_name: contact.contact_name || '',
    email: contact.email,
    department: contact.department || '',
    governorate: contact.governorate || '',
    institution_type: contact.institution_type || '',
    language: contact.language || '',
    unsubscribe_url: unsubscribeUrl,
  };
  let output = template.replace(/\{\{greeting\}\}/g, outreachGreeting(contact));
  for (const key of OUTREACH_PLACEHOLDERS) {
    output = output.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), values[key]);
  }
  return output;
}

function appendOutreachFooter(html: string, text: string, unsubscribeUrl: string, env: Bindings) {
  const org = escapeOutreachHtml(env.EMAIL_FROM_NAME || 'Jamiaati');
  const replyTo = escapeOutreachHtml(env.EMAIL_REPLY_TO || env.EMAIL_FROM_ADDRESS || '');
  return {
    html: `${html}<hr><p style="font-size:12px;color:#64748b">Sent by ${org}. Reply to ${replyTo}. <a href="${escapeOutreachHtml(unsubscribeUrl)}">Unsubscribe</a>.</p>`,
    text: `${text}\n\n--\nSent by ${env.EMAIL_FROM_NAME || 'Jamiaati'}. Reply to ${env.EMAIL_REPLY_TO || env.EMAIL_FROM_ADDRESS || ''}.\nUnsubscribe: ${unsubscribeUrl}`,
  };
}

async function personalizeOutreach(env: Bindings, template: OutreachTemplate, contact: OutreachContact) {
  const token = await makeOutreachUnsubscribeToken(env, contact.id, contact.email);
  const unsubscribeUrl = `${env.PUBLIC_APP_URL || ''}/api/outreach/unsubscribe?token=${encodeURIComponent(token)}`;
  const subject = renderOutreachTemplate(template.subject_template, contact, unsubscribeUrl);
  const html = renderOutreachTemplate(template.html_template, contact, unsubscribeUrl);
  const text = renderOutreachTemplate(template.text_template, contact, unsubscribeUrl);
  const withFooter = appendOutreachFooter(html, text, unsubscribeUrl, env);
  return { contact, subject, html: withFooter.html, text: withFooter.text };
}

function outreachSegmentWhere(filters: Record<string, string | undefined> = {}) {
  const clauses = ["status = 'active'"];
  const params: string[] = [];
  for (const field of ['governorate', 'institution_type', 'language'] as const) {
    if (filters[field]) {
      clauses.push(`${field} = ?`);
      params.push(String(filters[field]));
    }
  }
  return { sql: clauses.join(' AND '), params };
}

abstract class OutreachJsonProvider implements EmailProvider {
  constructor(protected env: Bindings) {}
  validateConfig(): void {
    if (truthy(this.env.DRY_RUN)) return;
    if (!this.env.EMAIL_PROVIDER || !this.env.EMAIL_API_KEY || !this.env.EMAIL_FROM_ADDRESS) {
      throw new Error('EMAIL_PROVIDER, EMAIL_API_KEY, and EMAIL_FROM_ADDRESS are required when DRY_RUN=false.');
    }
  }
  protected from() {
    return `${this.env.EMAIL_FROM_NAME || 'Jamiaati'} <${this.env.EMAIL_FROM_ADDRESS}>`;
  }
  abstract sendEmail(to: string, subject: string, html: string, text: string, metadata: Record<string, string>): Promise<{ messageId?: string }>;
  async handleWebhook(payload: any) {
    return {
      email: payload?.email || payload?.recipient || payload?.data?.email,
      messageId: payload?.message_id || payload?.sg_message_id || payload?.data?.id,
      event: payload?.event || payload?.type,
    };
  }
}

class OutreachResendProvider extends OutreachJsonProvider {
  async sendEmail(to: string, subject: string, html: string, text: string, metadata: Record<string, string>) {
    this.validateConfig();
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.env.EMAIL_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: this.from(), to, subject, html, text, reply_to: this.env.EMAIL_REPLY_TO, tags: Object.entries(metadata).map(([name, value]) => ({ name, value })) }),
    });
    const body: any = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body?.message || 'Resend send failed');
    return { messageId: body.id };
  }
}

class OutreachSendGridProvider extends OutreachJsonProvider {
  async sendEmail(to: string, subject: string, html: string, text: string, metadata: Record<string, string>) {
    this.validateConfig();
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.env.EMAIL_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }], custom_args: metadata }],
        from: { email: this.env.EMAIL_FROM_ADDRESS, name: this.env.EMAIL_FROM_NAME || 'Jamiaati' },
        reply_to: this.env.EMAIL_REPLY_TO ? { email: this.env.EMAIL_REPLY_TO } : undefined,
        subject,
        content: [{ type: 'text/plain', value: text }, { type: 'text/html', value: html }],
      }),
    });
    if (!response.ok) throw new Error(await response.text());
    return { messageId: response.headers.get('x-message-id') || undefined };
  }
}

class OutreachBrevoProvider extends OutreachJsonProvider {
  async sendEmail(to: string, subject: string, html: string, text: string, metadata: Record<string, string>) {
    this.validateConfig();
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': this.env.EMAIL_API_KEY || '', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: { email: this.env.EMAIL_FROM_ADDRESS, name: this.env.EMAIL_FROM_NAME || 'Jamiaati' },
        to: [{ email: to }],
        replyTo: this.env.EMAIL_REPLY_TO ? { email: this.env.EMAIL_REPLY_TO } : undefined,
        subject,
        htmlContent: html,
        textContent: text,
        tags: Object.values(metadata),
      }),
    });
    const body: any = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body?.message || 'Brevo send failed');
    return { messageId: body.messageId };
  }
}

function getOutreachProvider(env: Bindings): EmailProvider {
  const provider = (env.EMAIL_PROVIDER || 'resend').toLowerCase();
  if (provider === 'sendgrid') return new OutreachSendGridProvider(env);
  if (provider === 'brevo') return new OutreachBrevoProvider(env);
  return new OutreachResendProvider(env);
}

async function ensureOutreachRecipients(env: Bindings, campaignId: string) {
  const campaign = await env.DB.prepare('SELECT * FROM outreach_campaigns WHERE id = ?').bind(campaignId).first() as OutreachCampaign | null;
  if (!campaign) throw new Error('Campaign not found.');
  const template = await env.DB.prepare('SELECT * FROM outreach_templates WHERE id = ?').bind(campaign.template_id).first() as OutreachTemplate | null;
  if (!template) throw new Error('Template not found.');
  const filters = JSON.parse(campaign.segment_filter_json || '{}');
  const where = outreachSegmentWhere(filters);
  const contacts = await env.DB.prepare(`SELECT * FROM outreach_contacts WHERE ${where.sql}`).bind(...where.params).all();
  let total = 0;
  for (const contact of contacts.results as OutreachContact[]) {
    if (contact.status !== 'active' || !validOutreachEmail(contact.email)) continue;
    const rendered = await personalizeOutreach(env, template, contact);
    await env.DB.prepare(`
      INSERT OR IGNORE INTO outreach_campaign_recipients (id, campaign_id, contact_id, email, personalized_subject, personalized_html, personalized_text)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(outreachId('recipient'), campaignId, contact.id, contact.email, rendered.subject, rendered.html, rendered.text).run();
    total += 1;
  }
  await env.DB.prepare('UPDATE outreach_campaigns SET total_recipients = ? WHERE id = ?').bind(total, campaignId).run();
}

async function refreshOutreachCampaignCounts(env: Bindings, campaignId: string) {
  const rows = await env.DB.prepare('SELECT status, COUNT(*) as count FROM outreach_campaign_recipients WHERE campaign_id = ? GROUP BY status').bind(campaignId).all();
  const counts = Object.fromEntries((rows.results as any[]).map((row) => [row.status, row.count]));
  await env.DB.prepare(`
    UPDATE outreach_campaigns SET sent_count = ?, failed_count = ?, bounced_count = ?, unsubscribed_count = ? WHERE id = ?
  `).bind(counts.sent || 0, counts.failed || 0, counts.bounced || 0, counts.unsubscribed || 0, campaignId).run();
}

async function processOutreachCampaignBatch(env: Bindings, campaignId: string) {
  const campaign = await env.DB.prepare('SELECT * FROM outreach_campaigns WHERE id = ?').bind(campaignId).first() as OutreachCampaign | null;
  if (!campaign || campaign.status !== 'sending') return;
  const maxPerDay = Number(env.MAX_PER_DAY || 500);
  const today = new Date().toISOString().slice(0, 10);
  const sentToday = await env.DB.prepare("SELECT COUNT(*) as count FROM outreach_campaign_recipients WHERE status = 'sent' AND sent_at >= ?").bind(`${today}T00:00:00.000Z`).first() as any;
  if ((sentToday?.count || 0) >= maxPerDay) return;
  const batchSize = Math.min(Number(env.BATCH_SIZE || 25), maxPerDay - (sentToday?.count || 0));
  const recipients = await env.DB.prepare(`
    SELECT * FROM outreach_campaign_recipients
    WHERE campaign_id = ? AND status IN ('pending', 'queued', 'failed')
    ORDER BY created_at ASC
    LIMIT ?
  `).bind(campaignId, batchSize).all();
  if (!recipients.results.length) {
    await refreshOutreachCampaignCounts(env, campaignId);
    await env.DB.prepare("UPDATE outreach_campaigns SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?").bind(campaignId).run();
    return;
  }
  const provider = getOutreachProvider(env);
  for (const recipient of recipients.results as any[]) {
    const contact = await env.DB.prepare('SELECT * FROM outreach_contacts WHERE id = ?').bind(recipient.contact_id).first() as OutreachContact | null;
    if (!contact || contact.status !== 'active') {
      await env.DB.prepare("UPDATE outreach_campaign_recipients SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(contact?.status === 'unsubscribed' ? 'unsubscribed' : 'skipped', recipient.id).run();
      continue;
    }
    const to = truthy(env.TEST_MODE) ? env.ADMIN_TEST_EMAIL : recipient.email;
    if (!to || !validOutreachEmail(to)) {
      await env.DB.prepare("UPDATE outreach_campaign_recipients SET status = 'failed', error_message = 'Invalid recipient or ADMIN_TEST_EMAIL', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(recipient.id).run();
      continue;
    }
    try {
      if (truthy(env.DRY_RUN)) {
        await env.DB.prepare("UPDATE outreach_campaign_recipients SET status = 'sent', provider_message_id = 'dry-run', sent_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(recipient.id).run();
      } else {
        const result = await provider.sendEmail(to, recipient.personalized_subject, recipient.personalized_html, recipient.personalized_text, { campaignId, recipientId: recipient.id, contactId: recipient.contact_id });
        await env.DB.prepare("UPDATE outreach_campaign_recipients SET status = 'sent', provider_message_id = ?, sent_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(result.messageId || null, recipient.id).run();
      }
    } catch (error: any) {
      await env.DB.prepare("UPDATE outreach_campaign_recipients SET status = 'failed', error_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(String(error?.message || error), recipient.id).run();
    }
  }
  await refreshOutreachCampaignCounts(env, campaignId);
  if (env.OUTREACH_QUEUE) await env.OUTREACH_QUEUE.send({ campaignId }, { delaySeconds: Number(env.DELAY_SECONDS || 30) });
}

async function enqueueOutreachCampaign(c: any, campaignId: string) {
  await ensureOutreachRecipients(c.env, campaignId);
  await c.env.DB.prepare("UPDATE outreach_campaigns SET status = 'sending', started_at = COALESCE(started_at, CURRENT_TIMESTAMP) WHERE id = ?").bind(campaignId).run();
  if (c.env.OUTREACH_QUEUE) {
    await c.env.OUTREACH_QUEUE.send({ campaignId }, { delaySeconds: Number(c.env.DELAY_SECONDS || 30) });
  } else {
    c.executionCtx.waitUntil(processOutreachCampaignBatch(c.env, campaignId));
  }
  return c.json({ success: true });
}

app.get('/api/outreach/unsubscribe', async (c) => {
  const token = c.req.query('token') || '';
  const [contactId, digest] = token.split('.');
  if (!contactId || !digest) return c.html('<h1>Invalid unsubscribe token.</h1>', 400);
  const contact = await c.env.DB.prepare('SELECT * FROM outreach_contacts WHERE id = ?').bind(contactId).first() as OutreachContact | null;
  if (!contact) return c.html('<h1>Contact not found.</h1>', 404);
  const expected = await makeOutreachUnsubscribeToken(c.env, contact.id, contact.email);
  if (expected !== token) return c.html('<h1>Invalid unsubscribe token.</h1>', 400);
  await c.env.DB.prepare("UPDATE outreach_contacts SET status = 'unsubscribed', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(contact.id).run();
  await c.env.DB.prepare("UPDATE outreach_campaign_recipients SET status = 'unsubscribed', updated_at = CURRENT_TIMESTAMP WHERE contact_id = ? AND status IN ('pending', 'queued', 'failed')").bind(contact.id).run();
  await c.env.DB.prepare('INSERT INTO outreach_unsubscribes (id, email, contact_id, reason, token_hash) VALUES (?, ?, ?, ?, ?)')
    .bind(outreachId('unsubscribe'), contact.email, contact.id, 'self-service', await outreachSha256(`unsubscribe:${token}`)).run();
  return c.html('<h1>You are unsubscribed</h1><p>You will not receive future outreach emails from this system.</p>');
});

app.post('/api/outreach/webhooks/email-provider', async (c) => {
  const provider = getOutreachProvider(c.env);
  const event = await provider.handleWebhook(await c.req.json().catch(() => ({})));
  if (event.messageId) {
    if (event.event && /bounce/i.test(event.event)) {
      await c.env.DB.prepare("UPDATE outreach_campaign_recipients SET status = 'bounced', updated_at = CURRENT_TIMESTAMP WHERE provider_message_id = ?").bind(event.messageId).run();
      if (event.email) await c.env.DB.prepare("UPDATE outreach_contacts SET status = 'bounced', updated_at = CURRENT_TIMESTAMP WHERE email = ?").bind(normalizeOutreachEmail(event.email)).run();
    } else if (event.event && /open/i.test(event.event)) {
      await c.env.DB.prepare('UPDATE outreach_campaign_recipients SET opened_at = CURRENT_TIMESTAMP WHERE provider_message_id = ?').bind(event.messageId).run();
    } else if (event.event && /click/i.test(event.event)) {
      await c.env.DB.prepare('UPDATE outreach_campaign_recipients SET clicked_at = CURRENT_TIMESTAMP WHERE provider_message_id = ?').bind(event.messageId).run();
    }
  }
  return c.json({ success: true });
});

app.get('/api/outreach/dashboard', authMiddleware, adminMiddleware, async (c) => {
  const contacts = await c.env.DB.prepare('SELECT status, COUNT(*) as count FROM outreach_contacts GROUP BY status').all();
  const recentCampaigns = await c.env.DB.prepare('SELECT * FROM outreach_campaigns ORDER BY created_at DESC LIMIT 10').all();
  return c.json({
    contacts: contacts.results,
    recentCampaigns: recentCampaigns.results,
    config: {
      dryRun: truthy(c.env.DRY_RUN),
      providerConfigured: Boolean(c.env.EMAIL_PROVIDER && (truthy(c.env.DRY_RUN) || c.env.EMAIL_API_KEY) && c.env.EMAIL_FROM_ADDRESS),
      dnsVerifiedManually: false,
    },
  });
});

app.post('/api/outreach/contacts/import', authMiddleware, adminMiddleware, async (c) => {
  const size = Number(c.req.header('content-length') || 0);
  if (size > 1024 * 1024) return c.json({ error: 'CSV is too large. Limit is 1 MB.' }, 413);
  const rows = parseOutreachCsv(await c.req.text());
  if (!rows.length || !('email' in rows[0])) return c.json({ error: 'CSV must include an email column.' }, 400);
  const summary = { totalRows: rows.length, imported: 0, updated: 0, duplicates: 0, invalidEmails: 0 };
  const allowed = ['institution_name', 'contact_name', 'phone', 'department', 'governorate', 'institution_type', 'language', 'source', 'notes'];
  for (const row of rows) {
    const email = normalizeOutreachEmail(row.email);
    if (!validOutreachEmail(email)) {
      summary.invalidEmails += 1;
      continue;
    }
    const existing = await c.env.DB.prepare('SELECT * FROM outreach_contacts WHERE email = ?').bind(email).first() as OutreachContact | null;
    if (existing) {
      summary.duplicates += 1;
      const next: Record<string, string> = {};
      for (const field of allowed) {
        if (!(existing as any)[field] && row[field]) next[field] = row[field].trim();
      }
      if (Object.keys(next).length) {
        const sets = Object.keys(next).map((field) => `${field} = ?`).join(', ');
        await c.env.DB.prepare(`UPDATE outreach_contacts SET ${sets}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
          .bind(...Object.values(next), existing.id).run();
        summary.updated += 1;
      }
      continue;
    }
    await c.env.DB.prepare(`
      INSERT INTO outreach_contacts (id, email, institution_name, contact_name, phone, department, governorate, institution_type, language, source, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `).bind(outreachId('contact'), email, ...allowed.map((field) => row[field]?.trim() || null)).run();
    summary.imported += 1;
  }
  return c.json(summary);
});

app.get('/api/outreach/contacts', authMiddleware, adminMiddleware, async (c) => {
  const search = `%${c.req.query('search') || ''}%`;
  const clauses = ['(email LIKE ? OR institution_name LIKE ? OR contact_name LIKE ?)'];
  const params = [search, search, search];
  for (const field of ['status', 'governorate', 'institution_type', 'language']) {
    const value = c.req.query(field);
    if (value) {
      clauses.push(`${field} = ?`);
      params.push(value);
    }
  }
  const rows = await c.env.DB.prepare(`SELECT * FROM outreach_contacts WHERE ${clauses.join(' AND ')} ORDER BY created_at DESC LIMIT 500`).bind(...params).all();
  return c.json(rows.results);
});

app.get('/api/outreach/contacts/export', authMiddleware, adminMiddleware, async (c) => {
  const rows = await c.env.DB.prepare('SELECT * FROM outreach_contacts ORDER BY created_at DESC').all();
  return c.text(toOutreachCsv(rows.results as any[]), 200, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="outreach-contacts.csv"' });
});

app.patch('/api/outreach/contacts/:id', authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.json();
  const allowed = ['institution_name', 'contact_name', 'phone', 'department', 'governorate', 'institution_type', 'language', 'source', 'status', 'notes'];
  const patch = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
  if (!Object.keys(patch).length) return c.json({ error: 'No valid fields.' }, 400);
  const sets = Object.keys(patch).map((field) => `${field} = ?`).join(', ');
  await c.env.DB.prepare(`UPDATE outreach_contacts SET ${sets}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(...Object.values(patch) as any[], c.req.param('id')).run();
  return c.json({ success: true });
});

app.get('/api/outreach/templates', authMiddleware, adminMiddleware, async (c) => {
  const rows = await c.env.DB.prepare('SELECT * FROM outreach_templates ORDER BY created_at DESC').all();
  return c.json(rows.results);
});

app.post('/api/outreach/templates', authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.json();
  if (!body.name || !body.subject_template || !body.html_template || !body.text_template) return c.json({ error: 'Template name, subject, HTML, and text are required.' }, 400);
  await c.env.DB.prepare(`
    INSERT INTO outreach_templates (id, name, subject_template, html_template, text_template, language, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(outreachId('template'), body.name, body.subject_template, sanitizeOutreachHtml(body.html_template), body.text_template, body.language || null, c.get('userId')).run();
  return c.json({ success: true });
});

app.patch('/api/outreach/templates/:id', authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.json();
  const allowed = ['name', 'subject_template', 'html_template', 'text_template', 'language'];
  const patch = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
  if ((patch as any).html_template) (patch as any).html_template = sanitizeOutreachHtml(String((patch as any).html_template));
  if (!Object.keys(patch).length) return c.json({ error: 'No valid fields.' }, 400);
  const sets = Object.keys(patch).map((field) => `${field} = ?`).join(', ');
  await c.env.DB.prepare(`UPDATE outreach_templates SET ${sets}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(...Object.values(patch) as any[], c.req.param('id')).run();
  return c.json({ success: true });
});

app.get('/api/outreach/campaigns', authMiddleware, adminMiddleware, async (c) => {
  const rows = await c.env.DB.prepare('SELECT * FROM outreach_campaigns ORDER BY created_at DESC LIMIT 100').all();
  return c.json(rows.results);
});

app.post('/api/outreach/campaigns', authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.json();
  if (!body.name || !body.template_id) return c.json({ error: 'Campaign name and template_id are required.' }, 400);
  const campaignId = outreachId('campaign');
  const filters = body.segment_filter_json || {};
  const where = outreachSegmentWhere(filters);
  const count = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM outreach_contacts WHERE ${where.sql}`).bind(...where.params).first() as any;
  await c.env.DB.prepare(`
    INSERT INTO outreach_campaigns (id, name, template_id, segment_filter_json, total_recipients)
    VALUES (?, ?, ?, ?, ?)
  `).bind(campaignId, body.name, body.template_id, JSON.stringify(filters), count?.count || 0).run();
  return c.json({ id: campaignId, success: true });
});

app.get('/api/outreach/campaigns/:id', authMiddleware, adminMiddleware, async (c) => {
  const campaign = await c.env.DB.prepare('SELECT * FROM outreach_campaigns WHERE id = ?').bind(c.req.param('id')).first();
  if (!campaign) return c.json({ error: 'Campaign not found.' }, 404);
  const recipients = await c.env.DB.prepare('SELECT * FROM outreach_campaign_recipients WHERE campaign_id = ? ORDER BY created_at DESC LIMIT 1000').bind(c.req.param('id')).all();
  return c.json({ campaign, recipients: recipients.results });
});

app.post('/api/outreach/campaigns/:id/preview', authMiddleware, adminMiddleware, async (c) => {
  const campaign = await c.env.DB.prepare('SELECT * FROM outreach_campaigns WHERE id = ?').bind(c.req.param('id')).first() as OutreachCampaign | null;
  if (!campaign) return c.json({ error: 'Campaign not found.' }, 404);
  const template = await c.env.DB.prepare('SELECT * FROM outreach_templates WHERE id = ?').bind(campaign.template_id).first() as OutreachTemplate | null;
  if (!template) return c.json({ error: 'Template not found.' }, 404);
  const where = outreachSegmentWhere(JSON.parse(campaign.segment_filter_json || '{}'));
  const contacts = await c.env.DB.prepare(`SELECT * FROM outreach_contacts WHERE ${where.sql} LIMIT 10`).bind(...where.params).all();
  const samples = await Promise.all((contacts.results as OutreachContact[]).map((contact) => personalizeOutreach(c.env, template, contact)));
  return c.json({ placeholders: OUTREACH_PLACEHOLDERS, samples });
});

app.post('/api/outreach/campaigns/:id/send-test', authMiddleware, adminMiddleware, async (c) => {
  if (!c.env.ADMIN_TEST_EMAIL || !validOutreachEmail(c.env.ADMIN_TEST_EMAIL)) return c.json({ error: 'ADMIN_TEST_EMAIL is required for test sends.' }, 400);
  const campaign = await c.env.DB.prepare('SELECT * FROM outreach_campaigns WHERE id = ?').bind(c.req.param('id')).first() as OutreachCampaign | null;
  if (!campaign) return c.json({ error: 'Campaign not found.' }, 404);
  const template = await c.env.DB.prepare('SELECT * FROM outreach_templates WHERE id = ?').bind(campaign.template_id).first() as OutreachTemplate | null;
  if (!template) return c.json({ error: 'Template not found.' }, 404);
  const where = outreachSegmentWhere(JSON.parse(campaign.segment_filter_json || '{}'));
  const row = await c.env.DB.prepare(`SELECT * FROM outreach_contacts WHERE ${where.sql} LIMIT 1`).bind(...where.params).first() as OutreachContact | null;
  if (!row) return c.json({ error: 'No eligible sample recipient.' }, 400);
  const sample = await personalizeOutreach(c.env, template, row);
  if (truthy(c.env.DRY_RUN)) return c.json({ success: true, dryRun: true, to: c.env.ADMIN_TEST_EMAIL, subject: sample.subject });
  const result = await getOutreachProvider(c.env).sendEmail(c.env.ADMIN_TEST_EMAIL, `[TEST] ${sample.subject}`, sample.html, sample.text, { campaignId: campaign.id, test: 'true' });
  return c.json({ success: true, providerMessageId: result.messageId });
});

app.post('/api/outreach/campaigns/:id/start', authMiddleware, adminMiddleware, async (c) => enqueueOutreachCampaign(c, c.req.param('id')));
app.post('/api/outreach/campaigns/:id/resume', authMiddleware, adminMiddleware, async (c) => enqueueOutreachCampaign(c, c.req.param('id')));
app.post('/api/outreach/campaigns/:id/retry-failed', authMiddleware, adminMiddleware, async (c) => {
  await c.env.DB.prepare("UPDATE outreach_campaign_recipients SET status = 'pending', error_message = NULL WHERE campaign_id = ? AND status = 'failed'").bind(c.req.param('id')).run();
  return enqueueOutreachCampaign(c, c.req.param('id'));
});
app.post('/api/outreach/campaigns/:id/pause', authMiddleware, adminMiddleware, async (c) => {
  await c.env.DB.prepare("UPDATE outreach_campaigns SET status = 'paused' WHERE id = ?").bind(c.req.param('id')).run();
  return c.json({ success: true });
});
app.post('/api/outreach/campaigns/:id/stop', authMiddleware, adminMiddleware, async (c) => {
  await c.env.DB.prepare("UPDATE outreach_campaigns SET status = 'failed', completed_at = CURRENT_TIMESTAMP WHERE id = ?").bind(c.req.param('id')).run();
  return c.json({ success: true });
});
app.get('/api/outreach/campaigns/:id/export', authMiddleware, adminMiddleware, async (c) => {
  const rows = await c.env.DB.prepare('SELECT * FROM outreach_campaign_recipients WHERE campaign_id = ? ORDER BY created_at DESC').bind(c.req.param('id')).all();
  return c.text(toOutreachCsv(rows.results as any[]), 200, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="outreach-campaign-report.csv"' });
});

function toOutreachCsv(rows: any[]): string {
  const headers = Object.keys(rows[0] || { id: '', email: '', status: '' });
  return [headers.join(','), ...rows.map((row) => headers.map((header) => `"${String(row[header] ?? '').replaceAll('"', '""')}"`).join(','))].join('\n');
}

// â”€â”€â”€ OPPORTUNITY AUTOMATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Helper functions for opportunity automation
function normalizeWhitespace(text: string): string {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

function normalizeText(text: string): string {
  if (!text) return '';
  return normalizeWhitespace(stripHtml(text));
}

function normalizeUrl(url: string): string {
  if (!url) return '';
  url = url.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  return url;
}

async function generateDuplicateKey(title: string, organization: string, deadline: string, sourceUrl: string): Promise<string> {
  const normalized = `${normalizeText(title)}|${normalizeText(organization)}|${deadline || ''}|${normalizeUrl(sourceUrl)}`.toLowerCase();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(hash);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hashDuplicateKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(hash);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function classifyOpportunity(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();

  const keywords: Record<string, string[]> = {
    job: ['job', 'jobs', 'vacancy', 'vacancies', 'hiring', 'career', 'careers', 'position', 'positions', 'وظيفة', 'وظائف', 'تعيين', 'تعيينات', 'فرصة عمل', 'فرص عمل'],
    scholarship: ['scholarship', 'scholarships', 'grant', 'funding', 'منحة', 'منح', 'زمالة'],
    fellowship: ['fellowship', 'fellowships', 'زمالة', 'زمالات'],
    internship: ['internship', 'internships', 'تدريب عملي', 'تدريب صيفي'],
    training: ['training', 'course', 'workshop', 'دورة', 'تدريب', 'ورشة'],
    event: ['event', 'events', 'conference', 'seminar', 'مؤتمر', 'ندوة', 'فعالية'],
    volunteering: ['volunteer', 'volunteering', 'تطوع', 'متطوع'],
    competition: ['competition', 'contest', 'مسابقة', 'تنافس'],
    exam: ['exam', 'exams', 'امتحان', 'امتحانات', 'اختبار'],
    registration: ['registration', 'admission', 'deadline', 'تسجيل', 'قبول', 'استمارة']
  };

  for (const [category, words] of Object.entries(keywords)) {
    for (const word of words) {
      if (text.includes(word.toLowerCase())) return category;
    }
  }

  return 'announcement';
}

function normalizeSourceCategoryScope(scope: string | null | undefined): string {
  switch ((scope || '').toLowerCase()) {
    case 'jobs':
      return 'job';
    case 'scholarships':
      return 'scholarship';
    case 'internships':
      return 'internship';
    case 'trainings':
      return 'training';
    case 'events':
      return 'event';
    case 'fellowships':
      return 'fellowship';
    case 'competitions':
      return 'competition';
    case 'announcements':
      return 'announcement';
    case 'exams':
      return 'exam';
    case 'volunteering':
    case 'registration':
      return (scope || '').toLowerCase();
    default:
      return '';
  }
}

function isExpired(deadline: string): boolean {
  if (!deadline) return false;
  try {
    const deadlineDate = new Date(deadline);
    return deadlineDate < new Date();
  } catch {
    return false;
  }
}

type InstitutionSourceRow = {
  id: string;
  name_ar?: string | null;
  name_ku?: string | null;
  name_en?: string | null;
  governorate?: string | null;
  city?: string | null;
  type?: string | null;
  website: string;
};

type AutomationSourceRow = {
  id: string;
  name: string;
  url: string;
  source_type: string;
  category_scope: string;
  country_scope?: string | null;
  governorate_scope?: string | null;
  language?: string | null;
  notes?: string | null;
};

type ScrapedOpportunityItem = {
  title: string;
  description: string;
  sourceUrl: string;
  category: string;
  confidenceScore: number;
};

type ScrapeRejectReason = 'generic_url' | 'restricted' | 'mojibake' | 'weak_content' | 'not_specific';

type ScrapedOpportunityResult = {
  item: ScrapedOpportunityItem | null;
  reason?: ScrapeRejectReason;
};

type ScrapeOpportunitySourceResult = {
  checked: number;
  found: number;
  inserted: number;
  wouldInsert: number;
  duplicates: number;
  rejectedByFilter: number;
  restrictedRejected: number;
  genericUrlRejected: number;
  mojibakeRejected: number;
  error?: string;
};

const OPPORTUNITY_KEYWORDS = [
  'job', 'jobs', 'vacancy', 'vacancies', 'hiring', 'career', 'careers', 'position', 'positions',
  'apply', 'application', 'deadline', 'scholarship', 'scholarships', 'grant', 'fellowship',
  'internship', 'training', 'course', 'workshop', 'event', 'conference', 'seminar',
  'competition', 'contest', 'volunteer', 'registration', 'admission',
  'وظيفة', 'وظائف', 'تعيين', 'تعيينات', 'فرصة عمل', 'فرص عمل', 'منحة', 'منح', 'زمالة',
  'تدريب', 'دورة', 'ورشة', 'فعالية', 'مؤتمر', 'ندوة', 'مسابقة', 'تطوع', 'تسجيل', 'قبول', 'استمارة', 'موعد'
];

const LINK_DISCOVERY_KEYWORDS = [
  'jobs', 'careers', 'vacancies', 'opportunities', 'scholarships', 'fellowships',
  'internships', 'training', 'events', 'announcements', 'admissions', 'registration',
  'وظائف', 'تعيينات', 'فرص', 'منح', 'تدريب', 'دورات', 'اعلانات', 'إعلانات', 'قبول', 'تسجيل'
];

const GENERIC_PATH_SEGMENTS = [
  '', '/', 'home', 'index', 'news', 'events', 'announcements', 'announcement',
  'scholarships', 'admissions', 'registration', 'login', 'register', 'login-register',
  'register-candidate', 'candidate', 'employer', 'about', 'contact', 'category',
  'archive', 'web_archive.php'
];

const BLOCKED_OPPORTUNITY_PATH_PATTERNS = [
  /\/job-location(?:\/|$)/i,
  /\/jobs-location(?:\/|$)/i,
  /\/job-category(?:\/|$)/i,
  /\/jobs-category(?:\/|$)/i,
  /\/category(?:\/|$)/i,
  /\/tag(?:\/|$)/i,
  /\/search(?:\/|$)/i,
  /\/page(?:\/|$)/i,
  /\/author(?:\/|$)/i,
  /\/blog(?:\/|$)/i,
  /\/article(?:\/|$)/i,
  /\/news(?:\/|$)/i,
  /\/login(?:\/|$)/i,
  /\/register(?:\/|$)/i,
  /\/account(?:\/|$)/i,
  /\/dashboard(?:\/|$)/i,
  /\/post-job(?:\/|$)/i,
  /\/submit(?:\/|$)/i,
  /\/employer(?:\/|$)/i,
  /\/company(?:\/|$)/i,
  /\/companies(?:\/|$)/i,
  /\/candidate(?:\/|$)/i,
  /\/profile(?:\/|$)/i
];

const BLOCKED_OPPORTUNITY_INDEX_PATHS = new Set([
  '/job', '/jobs', '/opportunities', '/careers'
]);

function sourceNameForInstitution(institution: InstitutionSourceRow): string {
  return normalizeWhitespace(institution.name_en || institution.name_ar || institution.name_ku || institution.website);
}

function normalizeComparableUrl(url: string): string {
  return normalizeUrl(url).replace(/\/+$/, '').toLowerCase();
}

function normalizeCrawlerText(text: string): string {
  return normalizeText(text || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasMojibake(text: string): boolean {
  const normalized = text || '';
  if (/[╪┘Γ�ØÙ█âêû]/.test(normalized)) return true;
  const corruptedMatches = normalized.match(/[╪┘Γ�ØÙ█âêû]/g) || [];
  const boxDrawingMatches = normalized.match(/[\u2500-\u257f]/g) || [];
  return corruptedMatches.length >= 3 || boxDrawingMatches.length >= 3;
}

function stripHtmlForScraping(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<header\b[^>]*>[\s\S]*?<\/header>/gi, ' ');
}

function hasOpportunitySignal(text: string): boolean {
  const lower = text.toLowerCase();
  return OPPORTUNITY_KEYWORDS.some((keyword) => lower.includes(keyword.toLowerCase()));
}

function hasDateOrDeadlineSignal(text: string): boolean {
  const lower = text.toLowerCase();
  return /\b20[2-9][0-9][-\/.][01]?[0-9][-\/.][0-3]?[0-9]\b/.test(lower)
    || /\b[0-3]?[0-9][-\/.][01]?[0-9][-\/.]20[2-9][0-9]\b/.test(lower)
    || lower.includes('deadline')
    || lower.includes('closing date')
    || lower.includes('last date')
    || lower.includes('آخر موعد')
    || lower.includes('اخر موعد')
    || lower.includes('الموعد النهائي')
    || lower.includes('ينتهي')
    || lower.includes('يغلق');
}

function sourceLooksLikeHonJob(source?: AutomationSourceRow): boolean {
  const haystack = `${source?.name || ''} ${source?.url || ''}`.toLowerCase();
  return haystack.includes('honjob.com') || haystack.includes('honjob');
}

function isHonJobSpecificPublicJobUrl(url: string): boolean {
  try {
    const parsed = new URL(normalizeUrl(url));
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    const segments = parsed.pathname.split('/').filter(Boolean);
    return host === 'honjob.com' && segments.length === 2 && segments[0].toLowerCase() === 'job' && segments[1].trim().length > 0;
  } catch {
    return false;
  }
}

function isBlockedOpportunityUrl(url: string, source?: AutomationSourceRow): boolean {
  try {
    const parsed = new URL(normalizeUrl(url));
    const path = parsed.pathname.replace(/\/+$/, '').toLowerCase();
    const search = parsed.search.toLowerCase();
    const lastSegment = path.split('/').filter(Boolean).pop() || '';

    if (!path || path === '/') return true;
    if (BLOCKED_OPPORTUNITY_INDEX_PATHS.has(path)) return true;
    if (BLOCKED_OPPORTUNITY_PATH_PATTERNS.some((pattern) => pattern.test(`${path}/`))) return true;
    if (GENERIC_PATH_SEGMENTS.includes(lastSegment)) return true;
    if (path.includes('login') || path.includes('register-candidate')) return true;
    if (path.includes('wp-login') || path.includes('admin')) return true;
    if (search.includes('login') || search.includes('register') || search.includes('s=')) return true;
    if (sourceLooksLikeHonJob(source) && !isHonJobSpecificPublicJobUrl(url)) return true;

    return false;
  } catch {
    return true;
  }
}

function isGenericOrUnsafeUrl(url: string): boolean {
  return isBlockedOpportunityUrl(url);
}

function isLikelyDetailOpportunityUrl(url: string, category?: string, source?: AutomationSourceRow): boolean {
  try {
    const parsed = new URL(normalizeUrl(url));
    const path = parsed.pathname.toLowerCase();
    const segments = path.split('/').filter(Boolean);

    if (isBlockedOpportunityUrl(url, source)) return false;
    if (sourceLooksLikeHonJob(source)) return isHonJobSpecificPublicJobUrl(url);
    if (category === 'job' && !/job|vacanc|career|position|فرصة|وظيفة|تعيين/.test(path)) return false;

    return segments.length >= 2 && /\/\d{4}\/|\/20[2-9][0-9]|id=|p=|node\/|news20|_news|job|vacanc|career|scholar|training|course|event|admission|registration|اعلان|وظيفة|منحة|تدريب|قبول|تسجيل/.test(path + parsed.search.toLowerCase());
  } catch {
    return false;
  }
}

function isLikelySpecificOpportunityUrl(url: string): boolean {
  return isLikelyDetailOpportunityUrl(url);
}

function isRestrictedOrLoginRequiredText(text: string): boolean {
  const normalized = normalizeCrawlerText(text).toLowerCase();
  if (!normalized) return false;

  const hardRestrictedPatterns = [
    /this page is restricted for registered users only/i,
    /please login to view this page/i,
    /login to view this page/i,
    /registered users only/i,
    /login\s*\/\s*register/i,
    /الدخول\s*\/\s*التسجيل/,
    /تسجيل الدخول/,
    /يرجى تسجيل الدخول/,
    /الرجاء تسجيل الدخول/,
    /يجب تسجيل الدخول/,
    /هذه الصفحة مقيدة/,
    /هذه الصفحة للمستخدمين المسجلين/,
    /نشر الوظيفة\s+الدخول\s*\/\s*التسجيل/,
    /\bdashboard\b/i,
    /\bmy account\b/i,
    /لوحة القياس/,
    /لوحة التحكم/
  ];
  if (hardRestrictedPatterns.some((pattern) => pattern.test(text))) return true;

  const loginSignals = ['login', 'register', 'sign in', 'my account', 'dashboard', 'تسجيل الدخول', 'التسجيل', 'الدخول'];
  const opportunitySignals = OPPORTUNITY_KEYWORDS.filter((keyword) => normalized.includes(keyword.toLowerCase())).length;
  const loginSignalCount = loginSignals.filter((signal) => normalized.includes(signal.toLowerCase())).length;
  const shortText = normalized.length < 900;

  return loginSignalCount >= 3 && (shortText || opportunitySignals <= 1);
}

function hasUsefulOpportunityBody(text: string): boolean {
  const normalized = normalizeCrawlerText(text);
  if (normalized.length < 220) return false;
  if (isRestrictedOrLoginRequiredText(normalized)) return false;

  const lower = normalized.toLowerCase();
  const navSignals = ['home', 'menu', 'login', 'register', 'dashboard', 'privacy policy', 'terms', 'copyright', 'الرئيسية', 'القائمة', 'تسجيل الدخول'];
  const navSignalCount = navSignals.filter((signal) => lower.includes(signal.toLowerCase())).length;
  if (navSignalCount >= 5 && normalized.length < 1200) return false;

  return hasOpportunitySignal(normalized);
}

function hasMeaningfulOpportunitySignals(url: string, title: string, text: string, source?: AutomationSourceRow): boolean {
  const normalized = normalizeCrawlerText(`${title} ${text}`);
  const lower = normalized.toLowerCase();
  let signals = 0;

  if (source?.name && !['unknown', 'source'].includes(source.name.toLowerCase())) signals++;
  if (source?.governorate_scope || /\b(baghdad|basra|erbil|najaf|karbala|mosul|duhok|sulaymaniyah|iraq)\b|بغداد|البصرة|اربيل|أربيل|النجف|كربلاء|الموصل|دهوك|السليمانية/.test(lower)) signals++;
  if (hasDateOrDeadlineSignal(normalized)) signals++;
  if (/\b(salary|paid|funding|stipend|grant)\b|راتب|أجر|تمويل|منحة|مكافأة/.test(lower)) signals++;
  if (/\b(apply|application|submit|send cv|email|form|apply now)\b|قدم|التقديم|استمارة|ارسل|إرسال|البريد/.test(lower) || /https?:\/\/|mailto:/.test(text)) signals++;
  if (normalized.length >= 700) signals++;
  if (/\b(company|organization|employer|department|university|institute|ngo)\b|شركة|منظمة|جهة|جامعة|مؤسسة|قسم/.test(lower)) signals++;
  if (isLikelyDetailOpportunityUrl(url, classifyOpportunity(title, text), source) && hasOpportunitySignal(`${title} ${text}`)) signals++;

  return signals >= 2;
}

function shouldRejectScrapedPage(input: { url: string; title: string; text: string; category: string; source?: AutomationSourceRow }): ScrapeRejectReason | null {
  if (isBlockedOpportunityUrl(input.url, input.source)) return 'generic_url';
  if (!input.title || input.title.length < 8) return 'weak_content';
  if (hasMojibake(`${input.title} ${input.text}`)) return 'mojibake';
  if (isRestrictedOrLoginRequiredText(input.text)) return 'restricted';
  if (!isLikelyDetailOpportunityUrl(input.url, input.category, input.source) && !hasDateOrDeadlineSignal(input.text)) return 'not_specific';
  if (!hasUsefulOpportunityBody(input.text)) return 'weak_content';
  if (!hasMeaningfulOpportunitySignals(input.url, input.title, input.text, input.source)) return 'weak_content';
  return null;
}

function resolvePublicUrl(baseUrl: string, href: string): string | null {
  try {
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      return null;
    }
    const base = new URL(normalizeUrl(baseUrl));
    const resolved = new URL(href, base);
    if (!['http:', 'https:'].includes(resolved.protocol)) return null;
    if (resolved.hostname.replace(/^www\./, '') !== base.hostname.replace(/^www\./, '')) return null;
    resolved.hash = '';
    return resolved.toString();
  } catch {
    return null;
  }
}

function pageLooksRelevant(url: string, text: string): boolean {
  const haystack = `${url} ${text}`.toLowerCase();
  return LINK_DISCOVERY_KEYWORDS.some((keyword) => haystack.includes(keyword.toLowerCase()));
}

function extractTitleFromHtml(html: string): string {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  if (h1) return normalizeText(h1).slice(0, 180);
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return normalizeText(title || '').slice(0, 180);
}

function extractRelevantLinks(baseUrl: string, html: string, source?: AutomationSourceRow): string[] {
  const links = new Set<string>();
  const anchorRegex = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = anchorRegex.exec(html)) !== null) {
    const href = match[1];
    const label = normalizeText(match[2]);
    const resolved = resolvePublicUrl(baseUrl, href);
    if (!resolved) continue;
    if (isBlockedOpportunityUrl(resolved, source)) continue;
    if (!pageLooksRelevant(resolved, label)) continue;

    links.add(resolved);
    if (links.size >= 20) break;
  }

  return Array.from(links);
}

async function fetchPublicPage(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RafidOpportunityAutomation/1.0; +https://rafid-api.mahdialmuntadhar1.workers.dev)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ar,en;q=0.9,ku;q=0.8'
      },
      redirect: 'follow',
      signal: controller.signal
    });

    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || !contentType.toLowerCase().includes('text/html')) return null;

    const text = await response.text();
    if (hasMojibake(text.slice(0, 2000))) return null;

    return text.slice(0, 500000);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function extractOpportunityItem(url: string, html: string, source?: AutomationSourceRow): ScrapedOpportunityResult {
  if (isBlockedOpportunityUrl(url, source)) return { item: null, reason: 'generic_url' };

  const cleanedHtml = stripHtmlForScraping(html);
  const text = normalizeCrawlerText(cleanedHtml).slice(0, 4000);
  const title = normalizeCrawlerText(extractTitleFromHtml(cleanedHtml));
  const category = classifyOpportunity(title, text);
  const rejectReason = shouldRejectScrapedPage({ url, title, text, category, source });

  if (rejectReason) return { item: null, reason: rejectReason };

  const dated = hasDateOrDeadlineSignal(text);
  const confidenceScore = dated ? 85 : 75;

  return {
    item: {
      title,
      description: text,
      sourceUrl: url,
      category,
      confidenceScore
    }
  };
}

async function syncInstitutionOpportunitySources(db: D1Database): Promise<{ created: number; updated: number; totalInstitutions: number }> {
  const institutions = await db.prepare(`
    SELECT id, name_ar, name_ku, name_en, governorate, city, type, website
    FROM institutions
    WHERE website IS NOT NULL AND website != ''
  `).all<InstitutionSourceRow>();

  let created = 0;
  let updated = 0;

  for (const institution of institutions.results || []) {
    const website = normalizeUrl(institution.website || '');
    if (!website) continue;

    const normalizedWebsite = normalizeComparableUrl(website);
    const notes = `linked institution id: ${institution.id}`;
    const name = sourceNameForInstitution(institution);
    const existing = await db.prepare(`
      SELECT id, name, url, notes
      FROM opportunity_sources
      WHERE notes = ? OR lower(rtrim(url, '/')) = ?
      LIMIT 1
    `).bind(notes, normalizedWebsite).first<{ id: string }>();

    if (existing) {
      await db.prepare(`
        UPDATE opportunity_sources
        SET name = ?, url = ?, source_type = 'university', category_scope = 'mixed',
            country_scope = 'Iraq', governorate_scope = ?, notes = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(name, website, institution.governorate || null, notes, existing.id).run();
      updated++;
    } else {
      await db.prepare(`
        INSERT INTO opportunity_sources (
          id, name, url, source_type, category_scope, country_scope,
          governorate_scope, language, crawl_frequency_hours, notes
        )
        VALUES (?, ?, ?, 'university', 'mixed', 'Iraq', ?, 'ar', 24, ?)
      `).bind(crypto.randomUUID(), name, website, institution.governorate || null, notes).run();
      created++;
    }
  }

  return { created, updated, totalInstitutions: institutions.results?.length || 0 };
}

async function insertScrapedCandidate(db: D1Database, source: AutomationSourceRow, item: ScrapedOpportunityItem): Promise<'inserted' | 'duplicate'> {
  const duplicateKey = await generateDuplicateKey(item.title, source.name, '', item.sourceUrl);
  const existing = await db.prepare('SELECT id FROM opportunity_candidates WHERE duplicate_key = ? LIMIT 1').bind(duplicateKey).first();
  if (existing) return 'duplicate';

  const scopedCategory = normalizeSourceCategoryScope(source.category_scope);
  const category = scopedCategory || item.category;

  await db.prepare(`
    INSERT INTO opportunity_candidates (
      id, source_id, title, organization, category, description, summary, eligibility,
      deadline, published_date, apply_url, source_url, image_url, country, governorate,
      city, language, salary_or_funding, confidence_score, duplicate_key, status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_review')
  `).bind(
    crypto.randomUUID(),
    source.id,
    item.title,
    source.name,
    category,
    item.description,
    item.description.slice(0, 350),
    '',
    null,
    null,
    item.sourceUrl,
    item.sourceUrl,
    '',
    source.country_scope || 'Iraq',
    source.governorate_scope || null,
    null,
    source.language || 'ar',
    '',
    item.confidenceScore,
    duplicateKey
  ).run();

  return 'inserted';
}

async function isDuplicateScrapedCandidate(db: D1Database, source: AutomationSourceRow, item: ScrapedOpportunityItem): Promise<boolean> {
  const duplicateKey = await generateDuplicateKey(item.title, source.name, '', item.sourceUrl);
  const existing = await db.prepare('SELECT id FROM opportunity_candidates WHERE duplicate_key = ? LIMIT 1').bind(duplicateKey).first();
  return !!existing;
}

function incrementRejectCounter(result: ScrapeOpportunitySourceResult, reason?: ScrapeRejectReason) {
  result.rejectedByFilter++;
  if (reason === 'restricted') result.restrictedRejected++;
  else if (reason === 'generic_url' || reason === 'not_specific') result.genericUrlRejected++;
  else if (reason === 'mojibake') result.mojibakeRejected++;
}

async function scrapeOpportunitySource(db: D1Database, source: AutomationSourceRow, dryRun: boolean, maxInserts = Number.POSITIVE_INFINITY): Promise<ScrapeOpportunitySourceResult> {
  const result: ScrapeOpportunitySourceResult = {
    checked: 0,
    found: 0,
    inserted: 0,
    wouldInsert: 0,
    duplicates: 0,
    rejectedByFilter: 0,
    restrictedRejected: 0,
    genericUrlRejected: 0,
    mojibakeRejected: 0
  };
  const homepageUrl = normalizeUrl(source.url);
  const homepage = await fetchPublicPage(homepageUrl);

  if (!homepage) {
    await db.prepare('UPDATE opportunity_sources SET last_checked_at = CURRENT_TIMESTAMP, last_error = ? WHERE id = ?').bind('Could not fetch usable public HTML page', source.id).run();
    return { ...result, checked: 1, error: 'Could not fetch usable public HTML page' };
  }

  const urls = extractRelevantLinks(homepageUrl, homepage, source).slice(0, 20);
  const seen = new Set<string>();

  for (const url of urls) {
    const comparable = normalizeComparableUrl(url);
    if (seen.has(comparable)) continue;
    seen.add(comparable);
    result.checked++;

    if (isBlockedOpportunityUrl(url, source)) {
      incrementRejectCounter(result, 'generic_url');
      continue;
    }

    const html = await fetchPublicPage(url);
    if (!html) continue;

    const extracted = extractOpportunityItem(url, html, source);
    if (!extracted.item) {
      incrementRejectCounter(result, extracted.reason);
      continue;
    }

    result.found++;

    if (await isDuplicateScrapedCandidate(db, source, extracted.item)) {
      result.duplicates++;
      continue;
    }

    if (dryRun) {
      result.wouldInsert++;
      continue;
    }

    if (result.inserted >= maxInserts) break;

    const insertResult = await insertScrapedCandidate(db, source, extracted.item);
    if (insertResult === 'inserted') result.inserted++;
    else result.duplicates++;

    if (result.inserted >= maxInserts) break;
  }

  await db.prepare(`
    UPDATE opportunity_sources
    SET last_checked_at = CURRENT_TIMESTAMP,
        last_success_at = CURRENT_TIMESTAMP,
        last_error = NULL
    WHERE id = ?
  `).bind(source.id).run();

  return result;
}

// GET /api/opportunity-automation/status
app.get('/api/opportunity-automation/status', authMiddleware, adminMiddleware, async (c) => {
  const sources = await c.env.DB.prepare('SELECT COUNT(*) as total, SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active FROM opportunity_sources').first() as any;
  const candidates = await c.env.DB.prepare('SELECT COUNT(*) as total, SUM(CASE WHEN status = "pending_review" THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved FROM opportunity_candidates').first() as any;
  const lastRun = await c.env.DB.prepare('SELECT * FROM opportunity_run_logs ORDER BY started_at DESC LIMIT 1').first() as any;
  
  return c.json({
    sources: sources || { total: 0, active: 0 },
    candidates: candidates || { total: 0, pending: 0, approved: 0 },
    lastRun: lastRun || null,
    dryRun: truthy(c.env.DRY_RUN_AUTOMATION)
  });
});

// GET /api/opportunity-automation/sources
app.get('/api/opportunity-automation/sources', authMiddleware, adminMiddleware, async (c) => {
  const governorate = c.req.query('governorate');
  const category = c.req.query('category');
  const activeOnly = c.req.query('active') === 'true';
  
  let query = 'SELECT * FROM opportunity_sources WHERE 1=1';
  const params: any[] = [];
  
  if (governorate) {
    query += ' AND governorate_scope = ?';
    params.push(governorate);
  }
  if (category) {
    query += ' AND category_scope = ?';
    params.push(category);
  }
  if (activeOnly) {
    query += ' AND is_active = 1';
  }
  
  query += ' ORDER BY created_at DESC';
  
  const sources = await c.env.DB.prepare(query).bind(...params).all();
  return c.json(sources.results);
});

// POST /api/opportunity-automation/sources
app.post('/api/opportunity-automation/sources', authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.json();
  const { name, url, source_type, category_scope, country_scope, governorate_scope, language, crawl_frequency_hours, notes } = body;
  
  if (!name || !url || !source_type || !category_scope) {
    return c.json({ error: 'name, url, source_type, and category_scope are required' }, 400);
  }
  
  const id = crypto.randomUUID();
  const normalizedUrl = normalizeUrl(url);
  
  await c.env.DB.prepare(`
    INSERT INTO opportunity_sources (id, name, url, source_type, category_scope, country_scope, governorate_scope, language, crawl_frequency_hours, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, name, normalizedUrl, source_type, category_scope, country_scope || null, governorate_scope || null, language || null, crawl_frequency_hours || 24, notes || null).run();
  
  return c.json({ id, success: true }, 201);
});

// PATCH /api/opportunity-automation/sources/:id
app.patch('/api/opportunity-automation/sources/:id', authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.json();
  const sourceId = c.req.param('id');
  
  const allowed = ['name', 'url', 'source_type', 'category_scope', 'country_scope', 'governorate_scope', 'language', 'is_active', 'crawl_frequency_hours', 'notes', 'last_error'];
  const updates: string[] = [];
  const params: any[] = [];
  
  for (const field of allowed) {
    if (body[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(body[field]);
    }
  }
  
  if (updates.length === 0) {
    return c.json({ error: 'No valid fields to update' }, 400);
  }
  
  if (body.url) {
    const idx = updates.indexOf('url = ?');
    if (idx !== -1) {
      params[idx] = normalizeUrl(body.url);
    }
  }
  
  params.push(sourceId);
  await c.env.DB.prepare(`UPDATE opportunity_sources SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(...params).run();
  
  return c.json({ success: true });
});

// DELETE /api/opportunity-automation/sources/:id
app.delete('/api/opportunity-automation/sources/:id', authMiddleware, adminMiddleware, async (c) => {
  const sourceId = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM opportunity_sources WHERE id = ?').bind(sourceId).run();
  return c.json({ success: true });
});

// POST /api/opportunity-automation/import-csv
app.post('/api/opportunity-automation/import-csv', authMiddleware, adminMiddleware, async (c) => {
  const size = Number(c.req.header('content-length') || 0);
  if (size > 5 * 1024 * 1024) {
    return c.json({ error: 'CSV is too large. Limit is 5 MB.' }, 413);
  }
  
  const csvText = await c.req.text();
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    return c.json({ error: 'CSV must have at least a header and one data row' }, 400);
  }
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
  const requiredColumns = ['title', 'category'];
  const missing = requiredColumns.filter(col => !headers.includes(col));
  if (missing.length > 0) {
    return c.json({ error: `Missing required columns: ${missing.join(', ')}` }, 400);
  }
  
  const summary = { total: 0, imported: 0, duplicates: 0, expired: 0, errors: 0 };
  const errors: string[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    summary.total++;
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => row[h] = values[idx] || '');
    
    try {
      const title = row.title;
      const organization = row.organization || '';
      const category = row.category || classifyOpportunity(title, row.description || '');
      const description = row.description || '';
      const summary_text = row.summary || '';
      const eligibility = row.eligibility || '';
      const deadline = row.deadline || null;
      const published_date = row.published_date || null;
      const apply_url = row.apply_url || '';
      const source_url = row.source_url || '';
      const image_url = row.image_url || '';
      const country = row.country || 'Iraq';
      const governorate = normalizeGovernorate(row.governorate || '');
      const city = row.city || '';
      const language = row.language || '';
      const salary_or_funding = row.salary_or_funding || '';
      const source_name = row.source_name?.trim() || 'Manual Import';
      const sourceRecordUrl = source_url || apply_url ? normalizeUrl(source_url || apply_url) : 'manual_csv';
      
      // Check if expired
      if (deadline && isExpired(deadline)) {
        summary.expired++;
        continue;
      }
      
      // Find or create source
      let sourceId = await c.env.DB.prepare('SELECT id FROM opportunity_sources WHERE name = ? LIMIT 1').bind(source_name).first() as any;
      if (!sourceId) {
        const newSourceId = crypto.randomUUID();
        await c.env.DB.prepare(`
          INSERT INTO opportunity_sources (id, name, url, source_type, category_scope, country_scope, governorate_scope, language)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(newSourceId, source_name, sourceRecordUrl, 'manual_csv', 'mixed', country, governorate || null, language || null).run();
        sourceId = { id: newSourceId };
      }
      
      // Generate duplicate key
      const duplicateKey = await hashDuplicateKey(`${title}|${organization}|${deadline || ''}|${source_url}`);
      
      // Check for duplicates
      const existing = await c.env.DB.prepare('SELECT id FROM opportunity_candidates WHERE duplicate_key = ?').bind(duplicateKey).first();
      if (existing) {
        summary.duplicates++;
        continue;
      }
      
      const candidateId = crypto.randomUUID();
      await c.env.DB.prepare(`
        INSERT INTO opportunity_candidates (id, source_id, title, organization, category, description, summary, eligibility, deadline, published_date, apply_url, source_url, image_url, country, governorate, city, language, salary_or_funding, duplicate_key, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_review')
      `).bind(candidateId, sourceId.id, title, organization, category, description, summary_text, eligibility, deadline, published_date, apply_url, source_url, image_url, country, governorate, city, language, salary_or_funding, duplicateKey).run();
      
      summary.imported++;
    } catch (e: any) {
      summary.errors++;
      errors.push(`Row ${i + 1}: ${e.message}`);
    }
  }
  
  return c.json({ summary, errors: errors.slice(0, 10) });
});

// GET /api/opportunity-automation/candidates
app.get('/api/opportunity-automation/candidates', authMiddleware, adminMiddleware, async (c) => {
  const status = c.req.query('status') || 'pending_review';
  const category = c.req.query('category');
  const governorate = c.req.query('governorate');
  const page = Math.max(parseInt(c.req.query('page') || '1'), 1);
  const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100);
  const offset = (page - 1) * limit;
  
  let query = 'SELECT * FROM opportunity_candidates WHERE status = ?';
  const params: any[] = [status];
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (governorate) {
    query += ' AND governorate = ?';
    params.push(governorate);
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  const candidates = await c.env.DB.prepare(query).bind(...params).all();
  const countResult = await c.env.DB.prepare('SELECT COUNT(*) as count FROM opportunity_candidates WHERE status = ?').bind(status).first() as any;
  
  return c.json({
    candidates: candidates.results,
    pagination: {
      page,
      limit,
      total: countResult?.count || 0,
      totalPages: Math.ceil((countResult?.count || 0) / limit)
    }
  });
});

// GET /api/opportunity-automation/candidates/:id
app.get('/api/opportunity-automation/candidates/:id', authMiddleware, adminMiddleware, async (c) => {
  const candidate = await c.env.DB.prepare('SELECT * FROM opportunity_candidates WHERE id = ?').bind(c.req.param('id')).first();
  if (!candidate) {
    return c.json({ error: 'Candidate not found' }, 404);
  }
  return c.json(candidate);
});

// PATCH /api/opportunity-automation/candidates/:id
app.patch('/api/opportunity-automation/candidates/:id', authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.json();
  const candidateId = c.req.param('id');
  
  const allowed = ['title', 'organization', 'category', 'description', 'summary', 'eligibility', 'deadline', 'published_date', 'apply_url', 'source_url', 'image_url', 'country', 'governorate', 'city', 'language', 'salary_or_funding', 'confidence_score'];
  const updates: string[] = [];
  const params: any[] = [];
  
  for (const field of allowed) {
    if (body[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(body[field]);
    }
  }
  
  if (updates.length === 0) {
    return c.json({ error: 'No valid fields to update' }, 400);
  }
  
  params.push(candidateId);
  await c.env.DB.prepare(`UPDATE opportunity_candidates SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(...params).run();
  
  return c.json({ success: true });
});

// POST /api/opportunity-automation/candidates/:id/approve
app.post('/api/opportunity-automation/candidates/:id/approve', authMiddleware, adminMiddleware, async (c) => {
  const candidateId = c.req.param('id');
  
  const candidate = await c.env.DB.prepare('SELECT * FROM opportunity_candidates WHERE id = ?').bind(candidateId).first() as any;
  if (!candidate) {
    return c.json({ error: 'Candidate not found' }, 404);
  }
  
  // Update candidate status
  await c.env.DB.prepare("UPDATE opportunity_candidates SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(candidateId).run();
  
  return c.json({ success: true, published: true });
});

// POST /api/opportunity-automation/candidates/:id/reject
app.post('/api/opportunity-automation/candidates/:id/reject', authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.json();
  const candidateId = c.req.param('id');
  const reason = body.reason || 'Rejected by admin';
  
  await c.env.DB.prepare("UPDATE opportunity_candidates SET status = 'rejected', rejection_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(reason, candidateId).run();
  
  return c.json({ success: true });
});

// POST /api/opportunity-automation/candidates/:id/mark-duplicate
app.post('/api/opportunity-automation/candidates/:id/mark-duplicate', authMiddleware, adminMiddleware, async (c) => {
  const candidateId = c.req.param('id');
  
  await c.env.DB.prepare("UPDATE opportunity_candidates SET status = 'duplicate', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(candidateId).run();
  
  return c.json({ success: true });
});

// POST /api/opportunity-automation/candidates/:id/mark-expired
app.post('/api/opportunity-automation/candidates/:id/mark-expired', authMiddleware, adminMiddleware, async (c) => {
  const candidateId = c.req.param('id');
  
  await c.env.DB.prepare("UPDATE opportunity_candidates SET status = 'expired', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(candidateId).run();
  
  return c.json({ success: true });
});

// POST /api/opportunity-automation/run-now
app.post('/api/opportunity-automation/run-now', authMiddleware, adminMiddleware, async (c) => {
  const dryRun = truthy(c.env.DRY_RUN_AUTOMATION);
  const logId = crypto.randomUUID();
  const startedAt = new Date().toISOString();
  
  await c.env.DB.prepare(`
    INSERT INTO opportunity_run_logs (id, started_at, status, sources_checked, items_found, items_inserted, duplicates_found)
    VALUES (?, ?, 'running', 0, 0, 0, 0)
  `).bind(logId, startedAt).run();
  
  try {
    const sourceSync = await syncInstitutionOpportunitySources(c.env.DB);
    const sources = await c.env.DB.prepare(`
      SELECT *
      FROM opportunity_sources
      WHERE is_active = 1
      ORDER BY last_checked_at IS NOT NULL, last_checked_at ASC, created_at ASC
    `).all<AutomationSourceRow>();
    let sourcesChecked = 0;
    let itemsFound = 0;
    let itemsInserted = 0;
    let wouldInsert = 0;
    let duplicatesFound = 0;
    let rejectedByFilter = 0;
    let restrictedRejected = 0;
    let genericUrlRejected = 0;
    let mojibakeRejected = 0;
    const errors: { sourceId: string; url: string; error: string }[] = [];
    const sourceLogs: {
      sourceId: string;
      sourceName: string;
      url: string;
      category_scope: string;
      dryRun: boolean;
      checked: number;
      found: number;
      inserted: number;
      wouldInsert: number;
      candidate_count: number;
      duplicate_count: number;
      rejectedByFilter: number;
      restrictedRejected: number;
      genericUrlRejected: number;
      mojibakeRejected: number;
      error: string | null;
    }[] = [];
    
    for (const source of sources.results || []) {
      const result = await scrapeOpportunitySource(c.env.DB, source, dryRun);
      sourcesChecked++;
      itemsFound += result.found;
      itemsInserted += result.inserted;
      wouldInsert += result.wouldInsert;
      duplicatesFound += result.duplicates;
      rejectedByFilter += result.rejectedByFilter;
      restrictedRejected += result.restrictedRejected;
      genericUrlRejected += result.genericUrlRejected;
      mojibakeRejected += result.mojibakeRejected;
      if (result.error) errors.push({ sourceId: source.id, url: source.url, error: result.error });
      sourceLogs.push({
        sourceId: source.id,
        sourceName: source.name,
        url: source.url,
        category_scope: source.category_scope,
        dryRun,
        checked: result.checked,
        found: result.found,
        inserted: result.inserted,
        wouldInsert: result.wouldInsert,
        candidate_count: result.inserted,
        duplicate_count: result.duplicates,
        rejectedByFilter: result.rejectedByFilter,
        restrictedRejected: result.restrictedRejected,
        genericUrlRejected: result.genericUrlRejected,
        mojibakeRejected: result.mojibakeRejected,
        error: result.error || null
      });
    }

    const finalStatus = errors.length ? 'partial_success' : 'success';
    
    await c.env.DB.prepare(`
      UPDATE opportunity_run_logs 
      SET finished_at = CURRENT_TIMESTAMP, status = ?, sources_checked = ?, items_found = ?, items_inserted = ?, duplicates_found = ?, errors_json = ?
      WHERE id = ?
    `).bind(
      finalStatus,
      sourcesChecked,
      itemsFound,
      itemsInserted,
      duplicatesFound,
      JSON.stringify({
        dryRun,
        inserted: itemsInserted,
        wouldInsert,
        duplicates: duplicatesFound,
        rejectedByFilter,
        restrictedRejected,
        genericUrlRejected,
        mojibakeRejected,
        sources: sourceLogs,
        errors: errors.slice(0, 25)
      }),
      logId
    ).run();
    
    return c.json({
      success: true,
      logId,
      sourceSync,
      sourcesChecked,
      itemsFound,
      itemsInserted,
      inserted: itemsInserted,
      wouldInsert,
      duplicatesFound,
      rejectedByFilter,
      restrictedRejected,
      genericUrlRejected,
      mojibakeRejected,
      dryRun,
      published: false,
      status: finalStatus
    });
  } catch (e: any) {
    await c.env.DB.prepare(`
      UPDATE opportunity_run_logs 
      SET finished_at = CURRENT_TIMESTAMP, status = 'failed', errors_json = ?
      WHERE id = ?
    `).bind(JSON.stringify({ error: e.message }), logId).run();
    
    return c.json({ error: 'Automation run failed', message: e.message }, 500);
  }
});

// POST /api/opportunity-automation/run-source/:id
app.post('/api/opportunity-automation/run-source/:id', authMiddleware, adminMiddleware, async (c) => {
  const sourceId = c.req.param('id');
  const dryRun = truthy(c.env.DRY_RUN_AUTOMATION);
  
  const source = await c.env.DB.prepare('SELECT * FROM opportunity_sources WHERE id = ?').bind(sourceId).first<AutomationSourceRow>();
  if (!source) {
    return c.json({ error: 'Source not found' }, 404);
  }
  
  const logId = crypto.randomUUID();
  const startedAt = new Date().toISOString();
  await c.env.DB.prepare(`
    INSERT INTO opportunity_run_logs (id, started_at, status, sources_checked, items_found, items_inserted, duplicates_found)
    VALUES (?, ?, 'running', 1, 0, 0, 0)
  `).bind(logId, startedAt).run();

  const result = await scrapeOpportunitySource(c.env.DB, source, dryRun);
  const sourceLog = {
    sourceId: source.id,
    sourceName: source.name,
    url: source.url,
    category_scope: source.category_scope,
    dryRun,
    checked: result.checked,
    found: result.found,
    inserted: result.inserted,
    wouldInsert: result.wouldInsert,
    candidate_count: result.inserted,
    duplicate_count: result.duplicates,
    rejectedByFilter: result.rejectedByFilter,
    restrictedRejected: result.restrictedRejected,
    genericUrlRejected: result.genericUrlRejected,
    mojibakeRejected: result.mojibakeRejected,
    error: result.error || null
  };
  await c.env.DB.prepare(`
    UPDATE opportunity_run_logs
    SET finished_at = CURRENT_TIMESTAMP, status = ?, sources_checked = 1,
        items_found = ?, items_inserted = ?, duplicates_found = ?, errors_json = ?
    WHERE id = ?
  `).bind(
    result.error ? 'failed' : 'success',
    result.found,
    result.inserted,
    result.duplicates,
    JSON.stringify({
      dryRun,
      sourceId: source.id,
      sourceName: source.name,
      checked: result.checked,
      found: result.found,
      inserted: result.inserted,
      wouldInsert: result.wouldInsert,
      duplicates: result.duplicates,
      rejectedByFilter: result.rejectedByFilter,
      restrictedRejected: result.restrictedRejected,
      genericUrlRejected: result.genericUrlRejected,
      mojibakeRejected: result.mojibakeRejected,
      sources: [sourceLog],
      errors: result.error ? [{ sourceId: source.id, url: source.url, error: result.error }] : []
    }),
    logId
  ).run();
  
  return c.json({
    success: !result.error,
    logId,
    sourceId,
    dryRun,
    published: false,
    ...result,
    message: result.error || 'Source run completed'
  }, result.error ? 502 : 200);
});

// POST /api/opportunity-automation/run-source/:sourceId/insert-pending
app.post('/api/opportunity-automation/run-source/:sourceId/insert-pending', authMiddleware, adminMiddleware, async (c) => {
  const sourceId = c.req.param('sourceId');
  const body = await c.req.json().catch(() => ({}));

  if (body.confirm !== 'INSERT_PENDING_ONLY') {
    return c.json({ error: 'Confirmation required', requiredConfirm: 'INSERT_PENDING_ONLY' }, 400);
  }

  const source = await c.env.DB.prepare('SELECT * FROM opportunity_sources WHERE id = ?').bind(sourceId).first<AutomationSourceRow>();
  if (!source) {
    return c.json({ error: 'Source not found' }, 404);
  }

  const logId = crypto.randomUUID();
  const startedAt = new Date().toISOString();
  await c.env.DB.prepare(`
    INSERT INTO opportunity_run_logs (id, started_at, status, sources_checked, items_found, items_inserted, duplicates_found)
    VALUES (?, ?, 'running', 1, 0, 0, 0)
  `).bind(logId, startedAt).run();

  const result = await scrapeOpportunitySource(c.env.DB, source, false, 25);
  const sourceLog = {
    sourceId: source.id,
    sourceName: source.name,
    url: source.url,
    category_scope: source.category_scope,
    dryRun: false,
    manualInsertPending: true,
    approvedAutomatically: false,
    published: false,
    checked: result.checked,
    found: result.found,
    inserted: result.inserted,
    duplicates: result.duplicates,
    rejectedByFilter: result.rejectedByFilter,
    restrictedRejected: result.restrictedRejected,
    genericUrlRejected: result.genericUrlRejected,
    mojibakeRejected: result.mojibakeRejected,
    error: result.error || null
  };

  await c.env.DB.prepare(`
    UPDATE opportunity_run_logs
    SET finished_at = CURRENT_TIMESTAMP, status = ?, sources_checked = 1,
        items_found = ?, items_inserted = ?, duplicates_found = ?, errors_json = ?
    WHERE id = ?
  `).bind(
    result.error ? 'failed' : 'success',
    result.found,
    result.inserted,
    result.duplicates,
    JSON.stringify({
      manualInsertPending: true,
      approvedAutomatically: false,
      published: false,
      dryRun: false,
      maxInsertedPerRequest: 25,
      sourceId: source.id,
      sourceName: source.name,
      checked: result.checked,
      found: result.found,
      inserted: result.inserted,
      duplicates: result.duplicates,
      rejectedByFilter: result.rejectedByFilter,
      restrictedRejected: result.restrictedRejected,
      genericUrlRejected: result.genericUrlRejected,
      mojibakeRejected: result.mojibakeRejected,
      sources: [sourceLog],
      errors: result.error ? [{ sourceId: source.id, url: source.url, error: result.error }] : []
    }),
    logId
  ).run();

  return c.json({
    success: !result.error,
    logId,
    sourceId: source.id,
    sourceName: source.name,
    dryRun: false,
    manualInsertPending: true,
    approvedAutomatically: false,
    published: false,
    checked: result.checked,
    found: result.found,
    inserted: result.inserted,
    duplicates: result.duplicates,
    rejectedByFilter: result.rejectedByFilter,
    restrictedRejected: result.restrictedRejected,
    genericUrlRejected: result.genericUrlRejected,
    mojibakeRejected: result.mojibakeRejected,
    message: result.error || 'Manual pending insertion completed'
  }, result.error ? 502 : 200);
});

// GET /api/opportunity-automation/logs
app.get('/api/opportunity-automation/logs', authMiddleware, adminMiddleware, async (c) => {
  const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100);
  const logs = await c.env.DB.prepare('SELECT * FROM opportunity_run_logs ORDER BY started_at DESC LIMIT ?').bind(limit).all();
  return c.json(logs.results);
});

// GET /api/opportunity-automation/stats
app.get('/api/opportunity-automation/stats', authMiddleware, adminMiddleware, async (c) => {
  const byStatus = await c.env.DB.prepare('SELECT status, COUNT(*) as count FROM opportunity_candidates GROUP BY status').all();
  const byCategory = await c.env.DB.prepare('SELECT category, COUNT(*) as count FROM opportunity_candidates GROUP BY category').all();
  const byGovernorate = await c.env.DB.prepare('SELECT governorate, COUNT(*) as count FROM opportunity_candidates WHERE governorate IS NOT NULL GROUP BY governorate').all();
  const sourceStats = await c.env.DB.prepare('SELECT source_type, COUNT(*) as count FROM opportunity_sources GROUP BY source_type').all();
  
  return c.json({
    byStatus: byStatus.results,
    byCategory: byCategory.results,
    byGovernorate: byGovernorate.results,
    sourceStats: sourceStats.results
  });
});

// â”€â”€â”€ HEALTH â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

app.get('/api/health', (c) => c.json({ status: 'ok', service: 'rafid-api' }));

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, env: Bindings, _ctx: ExecutionContext) {
    await runHighlightsImport(env.DB);
  },
  async queue(batch: MessageBatch<OutreachQueueMessage>, env: Bindings) {
    for (const message of batch.messages) {
      await processOutreachCampaignBatch(env, message.body.campaignId);
      message.ack();
    }
  },
};

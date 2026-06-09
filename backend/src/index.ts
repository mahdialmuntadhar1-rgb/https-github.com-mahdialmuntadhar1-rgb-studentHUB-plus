import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  DB: D1Database;
  BUCKET: R2Bucket;
  JWT_SECRET: string;
  R2_PUBLIC_URL: string;
};

type Variables = {
  userId: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ─── CORS ──────────────────────────────────────────────────────────────────

app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── JWT HELPERS ────────────────────────────────────────────────────────────

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

// ─── AUTH MIDDLEWARE ─────────────────────────────────────────────────────────

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

// ─── ADMIN MIDDLEWARE ─────────────────────────────────────────────────────────

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

// ─── RATE LIMITING MIDDLEWARE ─────────────────────────────────────────────────

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

// ─── AUTH ROUTES ─────────────────────────────────────────────────────────────

app.post('/api/auth/register', rateLimitMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const fullName = String(body.full_name || body.name || body.fullName || body.displayName || '').trim();

    if (!email || !password || !fullName) {
      return c.json({ error: 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة' }, 400);
    }

    const existing = await c.env.DB.prepare('SELECT id FROM profiles WHERE lower(email) = lower(?)')
      .bind(email)
      .first();
    if (existing) {
      return c.json({ error: 'البريد الإلكتروني مستخدم مسبقاً' }, 409);
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
      return c.json({ error: 'البريد الإلكتروني مستخدم مسبقاً' }, 409);
    }
    return c.json({ error: 'فشل إنشاء الحساب، حاول مجدداً' }, 500);
  }
});

app.post('/api/auth/login', rateLimitMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!email || !password) {
      return c.json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' }, 400);
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
      return c.json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, 401);
    }

    const token = await signJWT({ userId: user.id, email: user.email }, c.env.JWT_SECRET);
    return c.json({ success: true, token, user });
  } catch (e: any) {
    console.error('Auth login error:', e?.message || e);
    return c.json({ error: 'فشل تسجيل الدخول، حاول لاحقاً' }, 500);
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
    return c.json({ error: 'فشل جلب بيانات المستخدم' }, 500);
  }
});

app.post('/api/auth/send-verification-email', rateLimitMiddleware, async (c) => {
  const { email } = await c.req.json();
  if (!email) {
    return c.json({ error: 'البريد الإلكتروني مطلوب' }, 400);
  }

  // Mock: Log to console instead of sending real email
  console.log(`[EMAIL SERVICE] Verification email would be sent to: ${email}`);
  console.log(`[EMAIL SERVICE] Verification link: https://rafid.mahdialmuntadhar1.workers.dev/verify?email=${encodeURIComponent(email)}&token=mock-token`);

  return c.json({ message: 'تم إرسال رابط التحقق إلى بريدك الإلكتروني' });
});

app.post('/api/auth/reset-password', rateLimitMiddleware, async (c) => {
  const { email, token, new_password } = await c.req.json();
  
  if (!email || !token || !new_password) {
    return c.json({ error: 'البريد الإلكتروني والرمز وكلمة المرور الجديدة مطلوبة' }, 400);
  }

  // Check if reset token exists and is valid
  const reset = await c.env.DB.prepare(
    'SELECT * FROM password_resets WHERE email = ? AND token = ? AND expires_at > ?'
  )
    .bind(email, token, new Date().toISOString())
    .first() as any;

  if (!reset) {
    return c.json({ error: 'رمز إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية' }, 400);
  }

  // Update password
  const passwordHash = await hashPassword(new_password);
  await c.env.DB.prepare('UPDATE profiles SET password_hash = ? WHERE email = ?')
    .bind(passwordHash, email)
    .run();

  // Delete used reset token
  await c.env.DB.prepare('DELETE FROM password_resets WHERE email = ? AND token = ?')
    .bind(email, token)
    .run();

  return c.json({ message: 'تم تحديث كلمة المرور بنجاح' });
});

app.post('/api/auth/verify-email', async (c) => {
  const { token } = await c.req.json();
  if (!token) {
    return c.json({ error: 'رمز التحقق مطلوب' }, 400);
  }

  const user = await c.env.DB.prepare(
    'SELECT id FROM profiles WHERE verification_token = ? AND verification_expires_at > CURRENT_TIMESTAMP'
  )
    .bind(token)
    .first();

  if (!user) {
    return c.json({ error: 'رمز التحقق غير صالح أو منتهي الصلاحية' }, 400);
  }

  await c.env.DB.prepare(
    'UPDATE profiles SET is_verified = 1, verification_token = NULL, verification_expires_at = NULL WHERE id = ?'
  )
    .bind(user.id)
    .run();

  return c.json({ message: 'تم التحقق من البريد الإلكتروني بنجاح' });
});

// ─── PROFILE ROUTES ──────────────────────────────────────────────────────────

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

// ─── POSTS ROUTES ────────────────────────────────────────────────────────────

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
    return c.json({ error: 'نوع المنشور والمحتوى والمحافظة والمؤسسة مطلوبة' }, 400);
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
    return c.json({ error: 'المنشور غير موجود' }, 404);
  }

  if (post.author_id !== userId) {
    return c.json({ error: 'غير مصرح لك بتعديل هذا المنشور' }, 403);
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
    return c.json({ error: 'لم يتم توفير أي حقول للتحديث' }, 400);
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
    return c.json({ error: 'المنشور غير موجود' }, 404);
  }

  if (post.author_id !== userId) {
    return c.json({ error: 'غير مصرح لك بحذف هذا المنشور' }, 403);
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

  return c.json({ message: 'تم حذف المنشور بنجاح' });
});

// ─── COMMENTS ROUTES ─────────────────────────────────────────────────────────

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
    return c.json({ error: 'محتوى التعليق مطلوب' }, 400);
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
    return c.json({ error: 'التعليق غير موجود' }, 404);
  }

  if (comment.author_id !== userId) {
    return c.json({ error: 'غير مصرح لك بتعديل هذا التعليق' }, 403);
  }

  if (!content?.trim()) {
    return c.json({ error: 'محتوى التعليق مطلوب' }, 400);
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
    return c.json({ error: 'التعليق غير موجود' }, 404);
  }

  if (comment.author_id !== userId) {
    return c.json({ error: 'غير مصرح لك بحذف هذا التعليق' }, 403);
  }

  await c.env.DB.prepare('DELETE FROM comments WHERE id = ?')
    .bind(commentId)
    .run();

  await c.env.DB.prepare('UPDATE posts SET comments_count = MAX(0, comments_count - 1) WHERE id = ?')
    .bind(comment.post_id)
    .run();

  return c.json({ message: 'تم حذف التعليق بنجاح' });
});

// ─── FOLLOW ROUTES ─────────────────────────────────────────────────────────

app.post('/api/follow/:userId', authMiddleware, async (c) => {
  const followerId = c.get('userId');
  const followeeId = c.req.param('userId');

  if (followerId === followeeId) {
    return c.json({ error: 'لا يمكن متابعة نفسك' }, 400);
  }

  // Check if followee exists
  const followee = await c.env.DB.prepare('SELECT id FROM profiles WHERE id = ?')
    .bind(followeeId)
    .first();

  if (!followee) {
    return c.json({ error: 'المستخدم غير موجود' }, 404);
  }

  // Check if already following
  const existing = await c.env.DB.prepare(
    'SELECT id FROM follows WHERE follower_id = ? AND followee_id = ?'
  )
    .bind(followerId, followeeId)
    .first();

  if (existing) {
    return c.json({ error: 'أنت تتابع هذا المستخدم بالفعل' }, 400);
  }

  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    'INSERT INTO follows (id, follower_id, followee_id) VALUES (?, ?, ?)'
  )
    .bind(id, followerId, followeeId)
    .run();

  return c.json({ message: 'تمت المتابعة بنجاح', following: true }, 201);
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
    return c.json({ error: 'أنت لا تتابع هذا المستخدم' }, 400);
  }

  return c.json({ message: 'تم إلغاء المتابعة بنجاح', following: false });
});

// ─── OPPORTUNITIES ROUTES ────────────────────────────────────────────────────

app.get('/api/opportunities', async (c) => {
  const type = c.req.query('type');
  const institution = c.req.query('institution');
  const city = c.req.query('city');

  let query = 'SELECT * FROM opportunities WHERE 1=1';
  const params: string[] = [];

  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }
  if (institution) {
    query += ' AND institution_name = ?';
    params.push(institution);
  }
  if (city) {
    query += ' AND city = ?';
    params.push(city);
  }

  query += ' ORDER BY created_at DESC LIMIT 50';

  const stmt = c.env.DB.prepare(query);
  const result = await (params.length > 0 ? stmt.bind(...params) : stmt).all();
  return c.json(result.results);
});

app.post('/api/opportunities', authMiddleware, async (c) => {
  const { title, type, institution_name, institution_logo, governorate, city, deadline, tags } =
    await c.req.json();

  if (!title || !type || !institution_name) {
    return c.json({ error: 'العنوان والنوع واسم المؤسسة مطلوبة' }, 400);
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

// ─── SEARCH ROUTE ─────────────────────────────────────────────────────────────

app.get('/api/search', rateLimitMiddleware, async (c) => {
  const query = c.req.query('q');
  if (!query || query.length < 2) {
    return c.json({ error: 'كلمة البحث مطلوبة (حرفين على الأقل)' }, 400);
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

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

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
      return c.json({ error: 'المنشور غير موجود' }, 404);
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

  return c.json({ message: 'تم حذف المنشور بنجاح' });
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
    return c.json({ error: 'المستخدم غير موجود' }, 404);
  }

  // Update role
  await c.env.DB.prepare('UPDATE profiles SET role = ? WHERE id = ?')
    .bind(role, targetUserId)
    .run();

  return c.json({ message: 'تم تحديث الدور بنجاح', newRole: role });
});

// ─── CHAT ROUTES ───────────────────────────────────────────────────────────────

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
    return c.json({ error: 'معرف المستخدم الآخر مطلوب' }, 400);
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
    return c.json({ error: 'محتوى الرسالة مطلوب' }, 400);
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

// ─── UPLOAD (R2) ─────────────────────────────────────────────────────────────

app.post('/api/upload', authMiddleware, async (c) => {
  if (!c.env.BUCKET) {
    return c.json({ error: 'Image upload is not configured yet. Enable R2 in Cloudflare Dashboard.' }, 503);
  }

  const formData = await c.req.formData();
  const file = formData.get('file');

  if (!file || typeof file === 'string') return c.json({ error: 'لم يتم إرفاق ملف' }, 400);

  const fileObj = file as File;
  const ext = fileObj.name.split('.').pop() || 'jpg';
  const key = `uploads/${crypto.randomUUID()}.${ext}`;

  await c.env.BUCKET.put(key, await fileObj.arrayBuffer(), {
    httpMetadata: { contentType: fileObj.type },
  });

  const url = `${c.env.R2_PUBLIC_URL}/${key}`;
  return c.json({ url });
});

// ─── GOVERNORATES & INSTITUTIONS ─────────────────────────────────────────────

app.get('/api/governorates', async (c) => {
  const governorates = await c.env.DB.prepare(
    'SELECT DISTINCT governorate FROM profiles WHERE governorate IS NOT NULL ORDER BY governorate'
  ).all();
  return c.json(governorates.results.map((r: any) => r.governorate));
});

app.get('/api/institutions', async (c) => {
  const governorate = c.req.query('governorate');
  let query = 'SELECT DISTINCT institution FROM profiles WHERE institution IS NOT NULL';
  const params: any[] = [];

  if (governorate) {
    query += ' AND (governorate = ? OR ? IS NULL)';
    params.push(governorate, governorate);
  }

  query += ' ORDER BY institution';

  const stmt = c.env.DB.prepare(query);
  const institutions = await (params.length > 0 ? stmt.bind(...params) : stmt).all();
  return c.json(institutions.results.map((r: any) => r.institution));
});

// ─── HEALTH ───────────────────────────────────────────────────────────────────

app.get('/api/health', (c) => c.json({ status: 'ok', service: 'rafid-api' }));

export default app;

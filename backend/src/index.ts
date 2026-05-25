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
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  const body = btoa(JSON.stringify(payload))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  const sigInput = `${header}.${body}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(sigInput));
  const encodedSig = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${sigInput}.${encodedSig}`;
}

async function verifyJWT(
  token: string,
  secret: string
): Promise<Record<string, unknown> | null> {
  try {
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

    return JSON.parse(atob(body.replace(/-/g, '+').replace(/_/g, '/')));
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

// ─── AUTH ROUTES ─────────────────────────────────────────────────────────────

app.post('/api/auth/register', async (c) => {
  const { email, password, full_name } = await c.req.json();
  if (!email || !password || !full_name) {
    return c.json({ error: 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة' }, 400);
  }

  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  try {
    await c.env.DB.prepare(
      'INSERT INTO profiles (id, email, password_hash, full_name) VALUES (?, ?, ?, ?)'
    )
      .bind(id, email, passwordHash, full_name)
      .run();

    const token = await signJWT({ userId: id, email }, c.env.JWT_SECRET);
    const user = { id, email, full_name, role: 'student', institution: null };
    return c.json({ token, user }, 201);
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) {
      return c.json({ error: 'البريد الإلكتروني مستخدم مسبقاً' }, 409);
    }
    return c.json({ error: 'فشل إنشاء الحساب، حاول مجدداً' }, 500);
  }
});

app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password) {
    return c.json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' }, 400);
  }

  const passwordHash = await hashPassword(password);
  const user = await c.env.DB.prepare(
    `SELECT id, email, full_name, governorate, institution, institution_id,
            stage, interests, bio, avatar_url, role
     FROM profiles WHERE email = ? AND password_hash = ?`
  )
    .bind(email, passwordHash)
    .first();

  if (!user) {
    return c.json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, 401);
  }

  const token = await signJWT({ userId: user.id, email: user.email }, c.env.JWT_SECRET);
  return c.json({ token, user });
});

app.get('/api/auth/me', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const user = await c.env.DB.prepare(
    `SELECT id, email, full_name, governorate, institution, institution_id,
            stage, interests, bio, avatar_url, role
     FROM profiles WHERE id = ?`
  )
    .bind(userId)
    .first();

  if (!user) return c.json({ error: 'User not found' }, 404);
  return c.json(user);
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

app.get('/api/posts', async (c) => {
  const governorate = c.req.query('governorate');
  const institution = c.req.query('institution');

  let query = `
    SELECT p.*,
           pr.full_name    AS author_full_name,
           pr.avatar_url   AS author_avatar_url
    FROM posts p
    LEFT JOIN profiles pr ON p.author_id = pr.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];

  if (governorate) {
    query += ' AND p.governorate = ?';
    params.push(governorate);
  }
  if (institution) {
    query += ' AND p.institution = ?';
    params.push(institution);
  }

  query += ' ORDER BY p.created_at DESC LIMIT 50';

  const stmt = c.env.DB.prepare(query);
  const result = await (params.length > 0 ? stmt.bind(...params) : stmt).all();
  return c.json(result.results);
});

app.post('/api/posts', authMiddleware, async (c) => {
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

app.post('/api/posts/:id/like', authMiddleware, async (c) => {
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

// ─── OPPORTUNITIES ROUTES ────────────────────────────────────────────────────

app.get('/api/opportunities', async (c) => {
  const type = c.req.query('type');

  let query = 'SELECT * FROM opportunities WHERE 1=1';
  const params: string[] = [];

  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }

  query += ' ORDER BY created_at DESC LIMIT 50';

  const stmt = c.env.DB.prepare(query);
  const result = await (params.length > 0 ? stmt.bind(...params) : stmt).all();
  return c.json(result.results);
});

app.post('/api/opportunities', authMiddleware, async (c) => {
  const { title, type, institution_name, institution_logo, governorate, deadline, tags } =
    await c.req.json();

  if (!title || !type || !institution_name) {
    return c.json({ error: 'العنوان والنوع واسم المؤسسة مطلوبة' }, 400);
  }

  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    `INSERT INTO opportunities (id, title, type, institution_name, institution_logo, governorate, deadline, tags)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      title,
      type,
      institution_name,
      institution_logo || null,
      governorate || null,
      deadline || null,
      tags ? JSON.stringify(tags) : '[]'
    )
    .run();

  const opp = await c.env.DB.prepare('SELECT * FROM opportunities WHERE id = ?')
    .bind(id)
    .first();
  return c.json(opp, 201);
});

// ─── UPLOAD (R2) ─────────────────────────────────────────────────────────────

app.post('/api/upload', authMiddleware, async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File;

  if (!file) return c.json({ error: 'لم يتم إرفاق ملف' }, 400);

  const ext = file.name.split('.').pop() || 'jpg';
  const key = `uploads/${crypto.randomUUID()}.${ext}`;

  await c.env.BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  const url = `${c.env.R2_PUBLIC_URL}/${key}`;
  return c.json({ url });
});

// ─── HEALTH ───────────────────────────────────────────────────────────────────

app.get('/api/health', (c) => c.json({ status: 'ok', service: 'rafid-api' }));

export default app;

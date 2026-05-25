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
  const page = Math.max(parseInt(c.req.query('page') || '1'), 1);
  const limit = Math.min(parseInt(c.req.query('limit') || '10'), 100);
  const offset = (page - 1) * limit;

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

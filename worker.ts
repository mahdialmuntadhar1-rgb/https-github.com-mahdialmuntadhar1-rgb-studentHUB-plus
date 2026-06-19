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
}

type Bindings = Env;

// Extend Hono context types
interface HonoContextVariables {
  userId: string;
  userEmail: string;
  userRole: string;
}

type AppContext = Context<{ Bindings: Bindings, Variables: HonoContextVariables }>;

const app = new Hono<{ Bindings: Bindings, Variables: HonoContextVariables }>();

// Add type augmentation for Hono context
declare module 'hono' {
  interface ContextVariableMap {
    userId: string;
    userEmail: string;
    userRole: string;
  }
}

// CORS middleware
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
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
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const token = authHeader.substring(7);
  const payload = await verifyJWTToken(token, (c.env.JWT_SECRET || c.env.JWT_SECRET_V2 || ""));
  
  if (!payload) {
    return c.json({ error: 'Invalid or expired token' }, 401);
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

function isSupportedHeroImage(bytes: Uint8Array, type: string): boolean {
  if (type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === 'image/png') return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (type === 'image/webp') {
    return String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  }
  return false;
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
    if (!isSupportedHeroImage(new Uint8Array(buffer.slice(0, 16)), file.type)) {
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

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

// POST /api/auth/register
app.post('/api/auth/register', async (c) => {
  try {
    const { email, password, full_name, university_id, governorate, institution } = await c.req.json();
    
    if (!email || !password || !full_name) {
      return c.json({ error: 'Email, password, and full_name are required' }, 400);
    }
    
    // Check if user already exists
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM profiles WHERE email = ?'
    ).bind(email).first();
    
    if (existingUser) {
      return c.json({ error: 'User with this email already exists' }, 409);
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Create user in profiles table
    const userId = generateId();
    await c.env.DB.prepare(`
      INSERT INTO profiles (id, email, password_hash, full_name, governorate, institution, institution_id, role, is_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    `).bind(userId, email, passwordHash, full_name, governorate || 'all', institution || 'manual', university_id || 'manual', 'student').run();
    
    // Generate JWT token
    const token = await generateJWTToken(userId, email, 'student', (c.env.JWT_SECRET || c.env.JWT_SECRET_V2 || ""));
    
    return c.json({
      token,
      user: {
        id: userId,
        email,
        full_name,
        username: full_name,
        role: 'student',
        governorate: governorate || 'all',
        institution: institution || 'manual',
        institution_id: university_id || 'manual',
        is_verified: false
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }
    
    // Find user in profiles table
    const user = await c.env.DB.prepare(
      'SELECT * FROM profiles WHERE email = ?'
    ).bind(email).first() as any;
    
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    // Check if password is set (admin user might have empty password initially)
    if (!user.password_hash) {
      return c.json({ error: 'Password not set. Please contact admin.' }, 401);
    }
    
    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    // Update last login
    await c.env.DB.prepare(
      'UPDATE profiles SET updated_at = ? WHERE id = ?'
    ).bind(new Date().toISOString(), user.id).run();
    
    // Generate JWT token
    const token = await generateJWTToken(user.id, user.email, user.role, (c.env.JWT_SECRET || c.env.JWT_SECRET_V2 || ""));
    
    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        username: user.full_name,
        role: user.role,
        governorate: user.governorate,
        institution: user.institution,
        institution_id: user.institution_id,
        avatar_url: user.avatar_url,
        is_verified: user.is_verified === 1
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
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
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      username: user.full_name,
      role: user.role,
      governorate: user.governorate,
      institution: user.institution,
      institution_id: user.institution_id,
      bio: user.bio,
      avatar_url: user.avatar_url,
      is_verified: user.is_verified === 1,
      stage: user.stage,
      interests: user.interests,
      updated_at: user.updated_at
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    return c.json({ error: 'Failed to get user' }, 500);
  }
});

// POST /api/auth/forgot-password
app.post('/api/auth/forgot-password', async (c) => {
  try {
    const { email } = await c.req.json();
    
    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }
    
    // Find user in profiles table
    const user = await c.env.DB.prepare(
      'SELECT id, email FROM profiles WHERE email = ?'
    ).bind(email).first() as any;
    
    if (!user) {
      // Don't reveal if user exists or not for security
      return c.json({ message: 'If the email exists, a reset link will be sent' });
    }
    
    // Generate reset token
    const token = generateId();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
    
    // Store reset token in password_resets table
    await c.env.DB.prepare(`
      INSERT INTO password_resets (email, token, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `).bind(email, token, expiresAt, new Date().toISOString()).run();
    
    // In production, send email via RESEND_API_KEY
    // For now, return the token for dev/testing (NOT SECURE for production)
    if (c.env.RESEND_API_KEY && c.env.PASSWORD_RESET_FROM_EMAIL) {
      // TODO: Implement actual email sending
      return c.json({ message: 'Reset email sent' });
    } else {
      // Dev mode: return token (NOT for production)
      return c.json({ 
        message: 'Reset token generated (dev mode)',
        resetToken: token,
        expiresAt,
        note: 'In production, this would be sent via email'
      });
    }
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return c.json({ error: 'Failed to process request' }, 500);
  }
});

// POST /api/auth/reset-password
app.post('/api/auth/reset-password', async (c) => {
  try {
    const { token, newPassword } = await c.req.json();
    
    if (!token || !newPassword) {
      return c.json({ error: 'Token and new password are required' }, 400);
    }
    
    // Find valid token in password_resets table
    const resetToken = await c.env.DB.prepare(
      'SELECT * FROM password_resets WHERE token = ? AND expires_at > ?'
    ).bind(token, new Date().toISOString()).first() as any;
    
    if (!resetToken) {
      return c.json({ error: 'Invalid or expired token' }, 400);
    }
    
    // Hash new password
    const passwordHash = await hashPassword(newPassword);
    
    // Update user password in profiles table
    await c.env.DB.prepare(
      'UPDATE profiles SET password_hash = ?, updated_at = ? WHERE email = ?'
    ).bind(passwordHash, new Date().toISOString(), resetToken.email).run();
    
    // Delete the reset token
    await c.env.DB.prepare(
      'DELETE FROM password_resets WHERE token = ?'
    ).bind(token).run();
    
    return c.json({ message: 'Password reset successfully' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return c.json({ error: 'Failed to reset password' }, 500);
  }
});

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
    await c.env.DB.prepare(`
      INSERT INTO social_messages (id, thread_id, sender_id, body, status, created_at)
      VALUES (?, ?, ?, ?, 'sent', ?)
    `).bind(messageId, threadId, userId, body, new Date().toISOString()).run();
    
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
    
    return c.json({ thread, messages: messages.results || [] });
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
    
    await c.env.DB.prepare(`
      INSERT INTO social_messages (id, thread_id, sender_id, body, status, created_at)
      VALUES (?, ?, ?, ?, 'sent', ?)
    `).bind(messageId, threadId, userId, body, new Date().toISOString()).run();
    
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
    
    return c.json({ message });
  } catch (error: any) {
    console.error('Send message error:', error);
    return c.json({ error: 'Failed to send message' }, 500);
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
    const category = c.req.query('category') || '';
    const governorate = c.req.query('governorate') || 'all';
    const university_id = c.req.query('university_id') || c.req.query('institution_id') || 'all';
    
    let query = `
      SELECT * FROM opportunities 
      WHERE status = 'approved'
    `;
    const params: any[] = [];
    
    // Filter by deadline (not expired)
    const today = new Date().toISOString().split('T')[0];
    query += ' AND (deadline IS NULL OR deadline >= ?)';
    params.push(today);
    
    // Filter by category (using type field)
    if (category) {
      query += ' AND type = ?';
      params.push(category);
    }
    
    // Filter by governorate
    if (governorate !== 'all') {
      query += ' AND governorate = ?';
      params.push(governorate);
    }
    
    // Filter by university (using city or institution_name)
    if (university_id !== 'all') {
      query += ' AND (city = ? OR institution_name = ?)';
      params.push(university_id, university_id);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const opportunities = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json(opportunities.results || []);
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

import { Hono } from 'hono';
import { jwt, sign, verify } from 'hono/jwt';
import bcrypt from 'bcryptjs';

// Define environment bindings and variables for Cloudflare Worker & D1
type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  ENVIRONMENT: 'development' | 'production';
  RESEND_API_KEY?: string; // or Mailgun/Sendgrid variables
  APP_URL: string;
};

type Variables = {
  userId: string;
  userRole: string;
  canUpload: boolean;
  requestTime: number;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ==========================================
// 1. STRUCTURED LOGGING UTILITY & MIDDLEWARE
// ==========================================

// Structured Logger helper
async function logToDB(
  db: D1Database,
  level: 'info' | 'warn' | 'error',
  message: string,
  metadata: Record<string, any>
) {
  const timestamp = new Date().toISOString();
  const consolePayload = {
    timestamp,
    level: level.toUpperCase(),
    message,
    metadata,
  };

  // Structured console log
  console.log(JSON.stringify(consolePayload));

  // Write log to SQLite (D1)
  try {
    await db
      .prepare(
        'INSERT INTO logs (level, message, metadata, timestamp) VALUES (?, ?, ?, ?)'
      )
      .bind(level, message, JSON.stringify(metadata), timestamp)
      .run();
  } catch (err: any) {
    console.error('Failed to write log to D1 database:', err.message);
  }
}

// Global logger middleware for structural request/response metrics
app.use('*', async (c, next) => {
  const startTime = performance.now();
  c.set('requestTime', startTime);

  await next();

  const duration = (performance.now() - startTime).toFixed(2);
  const status = c.res.status;
  const method = c.req.method;
  const path = c.req.path;

  // Log all request completions to logs table & console
  await logToDB(c.env.DB, 'info', `${method} ${path} completed with status ${status}`, {
    method,
    path,
    status,
    durationMs: parseFloat(duration),
    ip: c.req.header('cf-connecting-ip') || 'unknown',
    userAgent: c.req.header('user-agent') || 'unknown',
  });
});

// Global Error Handler with full Error/Exception logs & stack trace reporting
app.onError(async (err, c) => {
  const duration = c.get('requestTime') ? (performance.now() - c.get('requestTime')).toFixed(2) : '0';
  
  const errorMetadata = {
    path: c.req.path,
    method: c.req.method,
    message: err.message,
    stack: err.stack,
    durationMs: parseFloat(duration),
  };

  // Record structural system error log in D1
  await logToDB(c.env.DB, 'error', `Unhandle server exception: ${err.message}`, errorMetadata);

  return c.json(
    {
      error: 'Internal Server Error',
      message: c.env.ENVIRONMENT === 'development' ? err.message : 'An unexpected error occurred.',
    },
    500
  );
});

// ==========================================
// 2. JWT VALIDATION AND MIDDLEWARE
// ==========================================

// Middleware helper to inject user context for protected endpoints
async function requireAuth(c: any, next: any) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized', message: 'Missing token' }, 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = await verify(token, c.env.JWT_SECRET);
    c.set('userId', payload.id);
    c.set('userRole', payload.role || 'user');

    // Decode or fallback can_upload permission status
    let canUpload = true;
    if (payload.canUpload !== undefined) {
      canUpload = !!payload.canUpload;
    } else {
      try {
        const permissionRecord = await c.env.DB.prepare(
          'SELECT can_upload FROM user_permissions WHERE user_id = ?'
        )
        .bind(payload.id)
        .first<{ can_upload: number }>();
        
        if (permissionRecord) {
          canUpload = permissionRecord.can_upload === 1;
        }
      } catch (err) {
        // Fallback to active permission if table/record not setup yet
        canUpload = true;
      }
    }

    c.set('canUpload', canUpload);
    await next();
  } catch (err) {
    return c.json({ error: 'Unauthorized', message: 'Invalid or expired JWT token' }, 401);
  }
}

// Admin-only Access verification
async function requireAdmin(c: any, next: any) {
  // Extract custom parameters injected by requireAuth
  const userRole = c.get('userRole');
  if (userRole !== 'admin') {
    await logToDB(c.env.DB, 'warn', 'Forbidden access attempt', {
      userId: c.get('userId'),
      path: c.req.path,
      action: 'view_admin_logs',
    });
    return c.json({ error: 'Forbidden', message: 'Administrator privileges are required' }, 403);
  }
  await next();
}

// ==========================================
// 3. AUTHENTICATION & PASSWORD RESET FLOWS
// ==========================================

// Forgot password - Request reset token
app.post('/api/auth/forgot-password', async (c) => {
  const { email } = await c.req.json();

  if (!email || !email.includes('@')) {
    return c.json({ error: 'Bad Request', message: 'Please provide a valid email address.' }, 400);
  }

  try {
    // 1. Verify user exists in SQLite (D1)
    const user = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();

    if (!user) {
      // Security best practice: do not expose whether users exist. 
      // Log internally but return uniform success.
      await logToDB(c.env.DB, 'info', 'Forgot password requested for non-existent email', { email });
      return c.json({ message: 'If the email matches an active account, a reset link will be sent.' });
    }

    // 2. Generate cryptographically secure random token (using standard web crypto)
    const tokenBuffer = new Uint8Array(32);
    crypto.getRandomValues(tokenBuffer);
    const token = Array.from(tokenBuffer).map(b => b.toString(16).padStart(2, '0')).join('');

    // Token expires in exactly 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // 3. Store the reset request in password_resets table
    await c.env.DB.prepare(
      'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)'
    )
    .bind(email, token, expiresAt)
    .run();

    const resetUrl = `${c.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    // 4. Handle development vs. production reset delivery
    if (c.env.ENVIRONMENT === 'development' || !c.env.RESEND_API_KEY) {
      // In development, log the URL to system logs
      await logToDB(c.env.DB, 'info', 'Password reset generated (DEVELOPMENT LOG)', {
        email,
        token,
        resetUrl,
      });
    } else {
      // In production, integrate standard transactional email system (e.g. Resend, Mailgun)
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${c.env.RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: 'Rafid Security <security@rafid-students.com>',
            to: [email],
            subject: 'استعادة كلمة المرور - رافد',
            html: `<p>مرحباً،</p><p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك على منصة رافد. اضغط على الرابط أدناه لإكمال العملية:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>الرابط صالح لمدة ساعة واحدة فقط.</p>`
          })
        });

        if (!response.ok) {
          throw new Error('Failed to deliver transactional SMTP/HTTPS email via service API.');
        }
        await logToDB(c.env.DB, 'info', 'Password reset email delivered successfully', { email });
      } catch (emailErr: any) {
        await logToDB(c.env.DB, 'error', `Failed to send recovery email: ${emailErr.message}`, { email });
      }
    }

    return c.json({ message: 'If the email matches an active account, a reset link will be sent.' });
  } catch (err: any) {
    throw err; // Captured by app.onError
  }
});

// Reset Password - Verify token and hash new password securely
app.post('/api/auth/reset-password', async (c) => {
  const { token, newPassword } = await c.req.json();

  if (!token || !newPassword || newPassword.length < 8) {
    return c.json({ error: 'Bad Request', message: 'Valid token and minimum 8-character password required' }, 400);
  }

  try {
    // 1. Fetch valid, unexpired reset token from database
    const now = new Date().toISOString();
    const resetRequest = await c.env.DB.prepare(
      'SELECT email, expires_at FROM password_resets WHERE token = ? AND expires_at > ?'
    )
    .bind(token, now)
    .first<{ email: string; expires_at: string }>();

    if (!resetRequest) {
      await logToDB(c.env.DB, 'warn', 'Invalid or expired password reset token usage attempt', { token });
      return c.json({ error: 'Unauthorized', message: 'This reset token is invalid or has expired.' }, 400);
    }

    // 2. Hash the new password securely using bcryptjs
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // 3. Update the password hash on the user record in unified transactional statements
    await c.env.DB.batch([
      // Update password
      c.env.DB.prepare('UPDATE users SET password_hash = ? WHERE email = ?').bind(passwordHash, resetRequest.email),
      // Invalidate token so it cannot be reused
      c.env.DB.prepare('DELETE FROM password_resets WHERE token = ?').bind(token)
    ]);

    await logToDB(c.env.DB, 'info', 'Password reset completed successfully', { email: resetRequest.email });

    return c.json({ status: 'success', message: 'Your password has been successfully reset. You can now log in.' });
  } catch (err: any) {
    throw err;
  }
});

// ==========================================
// 4. PROTECTED ADMIN ROUTE & LOG RETRIEVAl
// ==========================================

// Retrieve system logs in structured format (Only Admin Users allowed)
app.get('/api/admin/logs', requireAuth, requireAdmin, async (c) => {
  const levelFilter = c.req.query('level');
  const limit = Math.min(parseInt(c.req.query('limit') || '100'), 500);

  try {
    let logsQuery = 'SELECT id, level, message, metadata, timestamp FROM logs';
    const params: string[] = [];

    if (levelFilter) {
      logsQuery += ' WHERE level = ?';
      params.push(levelFilter.toLowerCase());
    }

    logsQuery += ' ORDER BY timestamp DESC LIMIT ?';

    const stmt = c.env.DB.prepare(logsQuery);
    // Bind parameters dynamically
    const { results } = await (params.length > 0 ? stmt.bind(...params, limit) : stmt.bind(limit)).all();

    // Dynamically parse SQLite JSON strings for clean JSON schema output representation
    const parsedLogs = (results || []).map(row => ({
      ...row,
      metadata: row.metadata ? JSON.parse(row.metadata as string) : {},
    }));

    return c.json({
      status: 'success',
      count: parsedLogs.length,
      logs: parsedLogs,
    });
  } catch (err: any) {
    throw err;
  }
});

// ==========================================
// 5. ROLE & GRANULAR PERMISSION ENDPOINTS
// ==========================================

// Change user role (Admin authorization required)
app.put('/api/admin/users/:id/role', requireAuth, requireAdmin, async (c) => {
  const targetUserId = c.req.param('id');
  const { role } = await c.req.json();

  if (role !== 'user' && role !== 'admin') {
    return c.json({ error: 'Bad Request', message: "Role must be 'user' or 'admin'" }, 400);
  }

  try {
    // 1. Verify existence of the user in database
    const user = await c.env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(targetUserId).first();
    if (!user) {
      return c.json({ error: 'Not Found', message: 'The specified user was not found' }, 404);
    }

    // 2. Perform transactional dynamic role update
    await c.env.DB.prepare('UPDATE users SET role = ? WHERE id = ?').bind(role, targetUserId).run();

    await logToDB(c.env.DB, 'info', `User role updated securely`, {
      adminUserId: c.get('userId'),
      targetUserId,
      newRole: role,
    });

    return c.json({
      status: 'success',
      message: `User role has been successfully changed to ${role}`,
    });
  } catch (err: any) {
    throw err;
  }
});

// Delete any post (Post owner OR Admin privilege validation)
app.delete('/api/posts/:id', requireAuth, async (c) => {
  const postId = c.req.param('id');
  const sessionUserId = c.get('userId');
  const sessionUserRole = c.get('userRole');

  try {
    // 1. Fetch target post to check authorship
    const post = await c.env.DB.prepare('SELECT id, author_id FROM posts WHERE id = ?')
      .bind(postId)
      .first<{ id: string; author_id: string }>();

    if (!post) {
      return c.json({ error: 'Not Found', message: 'The specified post does not exist' }, 404);
    }

    // 2. Perform delete privilege validation (Owner or Admin role required)
    if (post.author_id !== sessionUserId && sessionUserRole !== 'admin') {
      await logToDB(c.env.DB, 'warn', 'Forbidden post deletion attempt rejected', {
        attemptedBy: sessionUserId,
        postOwner: post.author_id,
        postId,
      });
      return c.json({ error: 'Forbidden', message: 'You columns/permissions prevent you from deleting other users content.' }, 403);
    }

    // 3. Delete post in D1
    await c.env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(postId).run();

    await logToDB(c.env.DB, 'info', `Post deletion confirmed`, {
      deletedBy: sessionUserId,
      actorRole: sessionUserRole,
      postId,
    });

    return c.json({
      status: 'success',
      message: 'The post has been deleted successfully.',
    });
  } catch (err: any) {
    throw err;
  }
});

// Grant or revoke user can_upload permission status
app.put('/api/admin/users/:id/permissions', requireAuth, requireAdmin, async (c) => {
  const targetUserId = c.req.param('id');
  const body = await c.req.json();
  const canUpload = body.canUpload !== undefined ? !!body.canUpload : true;

  try {
    // 1. Confirm user existence mapping
    const user = await c.env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(targetUserId).first();
    if (!user) {
      return c.json({ error: 'Not Found', message: 'The specified user was not found' }, 404);
    }

    // 2. Store update directly in the granular permission tracking schema
    const configValue = canUpload ? 1 : 0;
    await c.env.DB.prepare(
      'INSERT OR REPLACE INTO user_permissions (user_id, can_upload) VALUES (?, ?)'
    )
    .bind(targetUserId, configValue)
    .run();

    await logToDB(c.env.DB, 'info', `Granular permissions modified by Admin`, {
      adminUserId: c.get('userId'),
      targetUserId,
      canUploadConfigured: canUpload,
    });

    return c.json({
      status: 'success',
      message: `Successfully updated user upload permission to ${canUpload}`,
      permissions: { canUpload },
    });
  } catch (err: any) {
    throw err;
  }
});

// List all managed platform users in paginated grid (Admin privilege required)
app.get('/api/admin/users', requireAuth, requireAdmin, async (c) => {
  const page = Math.max(parseInt(c.req.query('page') || '1'), 1);
  const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100);
  const offset = (page - 1) * limit;

  try {
    // 1. Retrieve total counts
    const countResult = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>();
    const totalUsers = countResult?.count || 0;

    // 2. Query paginated rows utilizing LEFT JOIN to include user_permissions rows cleanly
    const { results } = await c.env.DB.prepare(`
      SELECT u.id, u.email, u.role, u.created_at, COALESCE(p.can_upload, 1) as can_upload
      FROM users u
      LEFT JOIN user_permissions p ON u.id = p.user_id
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `)
    .bind(limit, offset)
    .all();

    const formattedUsers = (results || []).map(row => ({
      id: row.id,
      email: row.email,
      role: row.role,
      created_at: row.created_at,
      permissions: {
        canUpload: row.can_upload === 1,
      },
    }));

    return c.json({
      status: 'success',
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
      },
      users: formattedUsers,
    });
  } catch (err: any) {
    throw err;
  }
});

// Image Upload Endpoint (Demonstrating checking can_upload status)
app.post('/api/upload', requireAuth, async (c) => {
  const canUpload = c.get('canUpload');

  if (!canUpload) {
    await logToDB(c.env.DB, 'warn', 'Restricted upload activity block', {
      userId: c.get('userId'),
    });
    return c.json({
      error: 'Forbidden',
      message: 'Your file and asset upload privileges have been suspended.',
    }, 403);
  }

  return c.json({
    status: 'success',
    url: 'https://images.rafid-students.com/uploads/sample-uploaded-file.png',
  });
});

export default app;

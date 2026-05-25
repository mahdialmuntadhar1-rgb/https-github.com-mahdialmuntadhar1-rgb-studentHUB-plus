// Cloudflare Worker API Client for Rafid Platform

const API_BASE = (import.meta as any).env.VITE_API_URL || 'https://rafid-api.mahdialmuntadhar1.workers.dev';

// ─── Token storage ────────────────────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem('rafid_token');
}

export function getStoredUser(): RafidUser | null {
  try {
    const raw = localStorage.getItem('rafid_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeAuth(token: string, user: RafidUser) {
  localStorage.setItem('rafid_token', token);
  localStorage.setItem('rafid_user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('rafid_token');
  localStorage.removeItem('rafid_user');
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RafidUser {
  id: string;
  email: string;
  full_name: string | null;
  governorate: string | null;
  institution: string | null;
  institution_id: string | null;
  stage: string | null;
  interests: string | string[] | null;
  bio: string | null;
  avatar_url: string | null;
  role: string;
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `خطأ ${res.status}`;
    try {
      const err = await res.json();
      msg = (err as any).error || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<{ token: string; user: RafidUser }> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse<{ token: string; user: RafidUser }>(res);
  storeAuth(data.token, data.user);
  return data;
}

export async function register(payload: {
  email: string;
  password: string;
  full_name: string;
}): Promise<{ token: string; user: RafidUser }> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<{ token: string; user: RafidUser }>(res);
  storeAuth(data.token, data.user);
  return data;
}

export async function getMe(): Promise<RafidUser> {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { ...authHeaders() },
  });
  return handleResponse<RafidUser>(res);
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function updateProfile(payload: {
  full_name?: string;
  governorate?: string;
  institution?: string;
  institution_id?: string;
  stage?: string;
  interests?: string[];
  bio?: string;
}): Promise<RafidUser> {
  const res = await fetch(`${API_BASE}/api/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<RafidUser>(res);
  localStorage.setItem('rafid_user', JSON.stringify(data));
  return data;
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export async function getPosts(filters?: {
  governorate?: string;
  institution?: string;
  page?: number;
  limit?: number;
}): Promise<any[]> {
  const params = new URLSearchParams();
  if (filters?.governorate) params.set('governorate', filters.governorate);
  if (filters?.institution) params.set('institution', filters.institution);
  if (filters?.page !== undefined) params.set('page', String(filters.page));
  if (filters?.limit !== undefined) params.set('limit', String(filters.limit));

  const url = `${API_BASE}/api/posts${params.toString() ? '?' + params.toString() : ''}`;
  const res = await fetch(url);
  return handleResponse<any[]>(res);
}

export async function createPost(payload: {
  type: string;
  content: string;
  title?: string;
  image_url?: string;
  governorate: string;
  institution: string;
  institution_id?: string;
  is_verified?: boolean;
  metadata?: Record<string, unknown>;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse<any>(res);
}

export async function likePost(postId: string): Promise<{ liked: boolean; likes_count: number }> {
  const res = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
    method: 'POST',
    headers: { ...authHeaders() },
  });
  return handleResponse<{ liked: boolean; likes_count: number }>(res);
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export async function getComments(postId: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/posts/${postId}/comments`);
  return handleResponse<any[]>(res);
}

export async function addComment(postId: string, content: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ content }),
  });
  return handleResponse<any>(res);
}

// ─── Opportunities ────────────────────────────────────────────────────────────

export async function getOpportunities(type?: string): Promise<any[]> {
  const url = type
    ? `${API_BASE}/api/opportunities?type=${encodeURIComponent(type)}`
    : `${API_BASE}/api/opportunities`;
  const res = await fetch(url);
  return handleResponse<any[]>(res);
}

export async function createOpportunity(payload: {
  title: string;
  type: string;
  institution_name: string;
  institution_logo?: string;
  governorate?: string;
  deadline?: string;
  tags?: string[];
}): Promise<any> {
  const res = await fetch(`${API_BASE}/api/opportunities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse<any>(res);
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export async function uploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: formData,
  });
  return handleResponse<{ url: string }>(res);
}

// ─── Admin Panel simulation types ─────────────────────────────────────────────

// Paginated response wrapper
export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  nextCursor?: string;
}

// Type definitions matching database schema
export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
  permissions: {
    canUpload: boolean;
  };
}

export interface SystemLog {
  id: number;
  level: 'info' | 'warn' | 'error';
  message: string;
  metadata: Record<string, any>;
  timestamp: string;
}

// In-Memory/LocalStorage storage keys for simulation
const USERS_STORAGE_KEY = 'rafid_simulated_users';
const LOGS_STORAGE_KEY = 'rafid_simulated_logs';
const RESETS_STORAGE_KEY = 'rafid_simulated_resets';

// Core mock/seed dataset for beautiful visuals
const SEED_USERS: AdminUser[] = [
  { id: 'u1', email: 'safaribosafar@gmail.com', role: 'admin', created_at: new Date('2026-05-25T10:00:00Z').toISOString(), permissions: { canUpload: true } },
  { id: 'u2', email: 'ahmed.iraqi@uobaghdad.edu.iq', role: 'user', created_at: new Date('2026-05-24T12:00:00Z').toISOString(), permissions: { canUpload: true } },
  { id: 'u3', email: 'zahra.karbala@uofk.edu.iq', role: 'user', created_at: new Date('2026-05-23T15:30:00Z').toISOString(), permissions: { canUpload: false } },
  { id: 'u4', email: 'mustafa.basra@uobasrah.edu.iq', role: 'user', created_at: new Date('2026-05-22T08:15:00Z').toISOString(), permissions: { canUpload: true } },
  { id: 'u5', email: 'fatima.mosul@uomosul.edu.iq', role: 'user', created_at: new Date('2026-05-21T18:45:00Z').toISOString(), permissions: { canUpload: true } },
  { id: 'u6', email: 'ali.hassan@uob.edu.iq', role: 'user', created_at: new Date('2026-05-20T11:20:00Z').toISOString(), permissions: { canUpload: true } },
  { id: 'u7', email: 'hassan.ali@uob.edu.iq', role: 'user', created_at: new Date('2026-05-19T14:10:00Z').toISOString(), permissions: { canUpload: false } },
  { id: 'u8', email: 'noor.hassan@uob.edu.iq', role: 'user', created_at: new Date('2026-05-18T09:05:00Z').toISOString(), permissions: { canUpload: true } },
  { id: 'u9', email: 'huda.hussein@uob.edu.iq', role: 'user', created_at: new Date('2026-05-17T16:50:00Z').toISOString(), permissions: { canUpload: true } },
  { id: 'u10', email: 'abbas.kamal@uob.edu.iq', role: 'user', created_at: new Date('2026-05-16T13:30:00Z').toISOString(), permissions: { canUpload: true } },
  { id: 'u11', email: 'hussein.ali@uob.edu.iq', role: 'user', created_at: new Date('2026-05-15T10:15:00Z').toISOString(), permissions: { canUpload: true } },
];

const SEED_LOGS: SystemLog[] = [
  { id: 101, level: 'info', message: 'GET /api/admin/users completed with status 200', metadata: { method: 'GET', path: '/api/admin/users', status: 200, durationMs: 12.3, ip: '192.168.1.1' }, timestamp: new Date('2026-05-25T11:05:00Z').toISOString() },
  { id: 102, level: 'info', message: 'Password reset completed successfully', metadata: { email: 'ahmed.iraqi@uobaghdad.edu.iq' }, timestamp: new Date('2026-05-25T10:45:00Z').toISOString() },
  { id: 103, level: 'warn', message: 'Forbidden access attempt', metadata: { userId: 'u3', path: '/api/admin/logs', action: 'view_admin_logs' }, timestamp: new Date('2026-05-25T10:30:00Z').toISOString() },
  { id: 104, level: 'error', message: 'Unhandle server exception: D1 table users not initialized', metadata: { path: '/api/auth/login', method: 'POST', message: 'D1 table users not initialized', stack: 'Error: D1 table users not found\n    at worker.ts:150:12' }, timestamp: new Date('2026-05-25T09:15:00Z').toISOString() },
  { id: 105, level: 'info', message: 'POST /api/auth/forgot-password completed with status 200', metadata: { method: 'POST', path: '/api/auth/forgot-password', status: 200, durationMs: 45.1, ip: '192.168.1.5' }, timestamp: new Date('2026-05-25T08:30:00Z').toISOString() },
];

function initializeSimulation() {
  if (!localStorage.getItem(USERS_STORAGE_KEY)) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(SEED_USERS));
  }
  if (!localStorage.getItem(LOGS_STORAGE_KEY)) {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(SEED_LOGS));
  }
  if (!localStorage.getItem(RESETS_STORAGE_KEY)) {
    localStorage.setItem(RESETS_STORAGE_KEY, JSON.stringify([]));
  }
}

// Ensure simulation environment is seeded
initializeSimulation();

function writeSimulatedLog(level: 'info' | 'warn' | 'error', message: string, metadata: Record<string, any>) {
  const currentLogs: SystemLog[] = JSON.parse(localStorage.getItem(LOGS_STORAGE_KEY) || '[]');
  const newLog: SystemLog = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    level,
    message,
    metadata,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify([newLog, ...currentLogs]));
}

// Exported API helper routes
export const ApiClient = {
  // Check if API actually exists as worker
  isRealWorker: async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 1500);
      const res = await fetch('/api/health', { signal: controller.signal });
      clearTimeout(id);
      return res.ok;
    } catch {
      return false;
    }
  },

  // 1. Password Reset Flow
  forgotPassword: async (email: string): Promise<{ message: string; resetUrl?: string }> => {
    const isReal = await ApiClient.isRealWorker();
    if (isReal) {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Forgot password failed');
      }
      return res.json();
    } else {
      // Simulation mode
      const users: AdminUser[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
      const user = users.find(u => u.email === email);
      
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      
      const resets = JSON.parse(localStorage.getItem(RESETS_STORAGE_KEY) || '[]');
      resets.push({ email, token, expiresAt });
      localStorage.setItem(RESETS_STORAGE_KEY, JSON.stringify(resets));

      const resetUrl = `${window.location.origin}/reset-password?token=${token}`;
      
      // Write system log
      writeSimulatedLog('info', 'Password reset generated (DEVELOPMENT LOG)', {
        email,
        token,
        resetUrl,
      });

      return {
        message: 'If the email matches an active account, a reset link will be sent.',
        resetUrl, // Exposing specifically for development display
      };
    }
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const isReal = await ApiClient.isRealWorker();
    if (isReal) {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Password reset failed');
      }
      return res.json();
    } else {
      // Simulation mode
      const resets = JSON.parse(localStorage.getItem(RESETS_STORAGE_KEY) || '[]');
      const resetReq = resets.find((r: any) => r.token === token && new Date(r.expiresAt) > new Date());

      if (!resetReq) {
        writeSimulatedLog('warn', 'Invalid or expired password reset token usage attempt', { token });
        throw new Error('This reset token is invalid or has expired.');
      }

      // Find user and change password
      const users: AdminUser[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
      const userIndex = users.findIndex(u => u.email === resetReq.email);
      if (userIndex !== -1) {
        // Password hashed successfully simulated
        writeSimulatedLog('info', 'Password reset completed successfully', { email: resetReq.email });
      }

      // Remove token
      const remainingResets = resets.filter((r: any) => r.token !== token);
      localStorage.setItem(RESETS_STORAGE_KEY, JSON.stringify(remainingResets));

      return {
        message: 'Your password has been successfully reset. You can now log in.',
      };
    }
  },

  // 2. Admin Logs (Chunk 1) / cursor-based pagination
  getLogs: async (cursor?: string, limit = 5): Promise<PaginatedResponse<SystemLog>> => {
    const isReal = await ApiClient.isRealWorker();
    if (isReal) {
      const url = `/api/admin/logs?limit=${limit}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch system logs');
      return res.json();
    } else {
      // Simulating cursor pagination with standard array slice
      const allLogs: SystemLog[] = JSON.parse(localStorage.getItem(LOGS_STORAGE_KEY) || '[]');
      const startIndex = cursor ? parseInt(cursor, 10) : 0;
      const paginatedLogs = allLogs.slice(startIndex, startIndex + limit);
      const hasMore = startIndex + limit < allLogs.length;
      
      return {
        data: paginatedLogs,
        hasMore,
        nextCursor: hasMore ? String(startIndex + limit) : undefined,
      };
    }
  },

  // 3. Admin User List Pagination (Chunk 2 & 3)
  getUsers: async (cursor?: string, limit = 5): Promise<PaginatedResponse<AdminUser>> => {
    const isReal = await ApiClient.isRealWorker();
    if (isReal) {
      const url = `/api/admin/users?limit=${limit}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch users list');
      return res.json();
    } else {
      // Simulate cursor based pagination for admin users list
      const allUsers: AdminUser[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
      const startIndex = cursor ? parseInt(cursor, 10) : 0;
      const paginatedUsers = allUsers.slice(startIndex, startIndex + limit);
      const hasMore = startIndex + limit < allUsers.length;

      return {
        data: paginatedUsers,
        hasMore,
        nextCursor: hasMore ? String(startIndex + limit) : undefined,
      };
    }
  },

  // Update user role
  updateUserRole: async (userId: string, role: 'admin' | 'user'): Promise<void> => {
    const isReal = await ApiClient.isRealWorker();
    if (isReal) {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error('Failed to update user role');
    } else {
      const users: AdminUser[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
      const user = users.find(u => u.id === userId);
      if (user) {
        user.role = role;
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        writeSimulatedLog('info', 'User role updated securely', {
          adminUserId: 'u1',
          targetUserId: userId,
          newRole: role,
        });
      }
    }
  },

  // Update upload permission
  updateUploadPermission: async (userId: string, canUpload: boolean): Promise<void> => {
    const isReal = await ApiClient.isRealWorker();
    if (isReal) {
      const res = await fetch(`/api/admin/users/${userId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canUpload }),
      });
      if (!res.ok) throw new Error('Failed to update upload permission');
    } else {
      const users: AdminUser[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
      const user = users.find(u => u.id === userId);
      if (user) {
        user.permissions.canUpload = canUpload;
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        writeSimulatedLog('info', 'Granular permissions modified by Admin', {
          adminUserId: 'u1',
          targetUserId: userId,
          canUploadConfigured: canUpload,
        });
      }
    }
  },

  // Delete a user
  deleteUser: async (userId: string): Promise<void> => {
    const isReal = await ApiClient.isRealWorker();
    if (isReal) {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete user');
    } else {
      const users: AdminUser[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
      const filtered = users.filter(u => u.id !== userId);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filtered));
      writeSimulatedLog('warn', 'User account permanently deleted by Admin', {
        adminUserId: 'u1',
        deletedUserId: userId,
      });
    }
  },
};

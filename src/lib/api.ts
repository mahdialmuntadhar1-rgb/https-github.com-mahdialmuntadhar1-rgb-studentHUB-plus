// Cloudflare Worker API Client for Rafid Platform

export const API_BASE = (import.meta as any).env.VITE_API_URL || 'https://rafid-api.mahdialmuntadhar1.workers.dev';

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

export interface AcademicInstitution {
  id: string;
  name_ar: string;
  name_ku?: string | null;
  name_en?: string | null;
  governorate: string;
  city?: string | null;
  type: string;
  website?: string | null;
  active?: number;
}

export interface InstitutionsResponse {
  institutions: AcademicInstitution[];
  pagination: { limit: number; offset: number; total: number; hasMore: boolean };
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
    if (res.status === 401) msg = 'Admin login required';
    if (res.status === 403) msg = 'Admin access only';
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

export async function verifyEmail(token: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/api/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  return handleResponse<{ message: string }>(res);
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

export async function getInstitutions(filters?: {
  governorate?: string;
  q?: string;
  limit?: number;
  offset?: number;
}): Promise<InstitutionsResponse> {
  const params = new URLSearchParams();
  if (filters?.governorate) params.set('governorate', filters.governorate);
  if (filters?.q) params.set('q', filters.q);
  if (filters?.limit !== undefined) params.set('limit', String(filters.limit));
  if (filters?.offset !== undefined) params.set('offset', String(filters.offset));

  const res = await fetch(`${API_BASE}/api/institutions${params.toString() ? `?${params.toString()}` : ''}`);
  return handleResponse<InstitutionsResponse>(res);
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export async function getPosts(filters?: {
  governorate?: string;
  institution?: string;
  page?: number;
  limit?: number;
}): Promise<{ posts: any[]; pagination: { page: number; limit: number; total: number; totalPages: number; hasMore: boolean } }> {
  const params = new URLSearchParams();
  if (filters?.governorate) params.set('governorate', filters.governorate);
  if (filters?.institution) params.set('institution', filters.institution);
  if (filters?.page !== undefined) params.set('page', String(filters.page));
  if (filters?.limit !== undefined) params.set('limit', String(filters.limit));

  const url = `${API_BASE}/api/posts${params.toString() ? '?' + params.toString() : ''}`;
  const res = await fetch(url);
  return handleResponse<{ posts: any[]; pagination: any }>(res);
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

// ─── Chat ─────────────────────────────────────────────────────────────────────

export async function getChatRooms(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/chat/rooms`, {
    headers: { ...authHeaders() },
  });
  return handleResponse<any[]>(res);
}

export async function createChatRoom(otherUserId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/chat/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ other_user_id: otherUserId }),
  });
  return handleResponse<any>(res);
}

export async function getChatMessages(roomId: string, limit = 50): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/chat/rooms/${roomId}/messages?limit=${limit}`, {
    headers: { ...authHeaders() },
  });
  return handleResponse<any[]>(res);
}

export async function sendChatMessage(roomId: string, content: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/chat/rooms/${roomId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ content }),
  });
  return handleResponse<any>(res);
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

export type HighlightCategory = 'event' | 'job' | 'internship' | 'scholarship' | 'student_club';
export type HighlightStatus = 'pending_review' | 'approved' | 'rejected' | 'duplicate' | 'expired';

export interface HighlightItem {
  id: string;
  category: HighlightCategory;
  title: string;
  organization?: string | null;
  governorate?: string | null;
  city?: string | null;
  university_id?: string | null;
  source_name?: string | null;
  source_url?: string | null;
  apply_url?: string | null;
  event_date?: string | null;
  deadline?: string | null;
  summary?: string | null;
  full_description_optional?: string | null;
  image_url?: string | null;
  language?: string | null;
  status?: HighlightStatus;
  duplicate_key?: string | null;
  confidence_score?: number;
  raw_text?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface HighlightSource {
  id: string;
  name: string;
  source_url: string;
  category: HighlightCategory;
  governorate_scope?: string | null;
  university_scope?: string | null;
  source_type: string;
  enabled: number | boolean;
  trusted_source: number | boolean;
  auto_publish: number | boolean;
  scraping_priority: number;
  last_checked_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export async function getHighlights(filters?: {
  category?: HighlightCategory | '';
  governorate?: string;
  university_id?: string;
  source?: string;
}): Promise<HighlightItem[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.governorate) params.set('governorate', filters.governorate);
  if (filters?.university_id) params.set('university_id', filters.university_id);
  if (filters?.source) params.set('source', filters.source);

  const res = await fetch(`${API_BASE}/api/highlights${params.toString() ? '?' + params.toString() : ''}`);
  return handleResponse<HighlightItem[]>(res);
}

export async function getAdminHighlights(filters?: {
  status?: HighlightStatus | '';
  category?: HighlightCategory | '';
  governorate?: string;
  university_id?: string;
}): Promise<HighlightItem[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.category) params.set('category', filters.category);
  if (filters?.governorate) params.set('governorate', filters.governorate);
  if (filters?.university_id) params.set('university_id', filters.university_id);

  const res = await fetch(`${API_BASE}/api/admin/highlights${params.toString() ? '?' + params.toString() : ''}`, {
    headers: { ...authHeaders() },
  });
  return handleResponse<HighlightItem[]>(res);
}

export async function createAdminHighlight(payload: Partial<HighlightItem> & { title: string; category: HighlightCategory }): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/highlights`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  await handleResponse<{ success: boolean }>(res);
}

export async function updateAdminHighlight(id: string, payload: Partial<HighlightItem>): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/highlights/${id}/edit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  await handleResponse<{ success: boolean }>(res);
}

export async function setHighlightStatus(id: string, action: 'approve' | 'reject' | 'mark-duplicate'): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/highlights/${id}/${action}`, {
    method: 'POST',
    headers: { ...authHeaders() },
  });
  await handleResponse<{ success: boolean }>(res);
}

export async function getHighlightSources(): Promise<HighlightSource[]> {
  const res = await fetch(`${API_BASE}/api/admin/highlight-sources`, {
    headers: { ...authHeaders() },
  });
  return handleResponse<HighlightSource[]>(res);
}

export async function createHighlightSource(payload: Partial<HighlightSource> & {
  name: string;
  source_url: string;
  category: HighlightCategory;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/highlight-sources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  await handleResponse<{ success: boolean }>(res);
}

export async function setHighlightSourceEnabled(id: string, enabled: boolean): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/highlight-sources/${id}/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ enabled }),
  });
  await handleResponse<{ success: boolean; enabled: boolean }>(res);
}

export async function runHighlightImport(): Promise<{ success: boolean; sourcesChecked: number; itemsAdded: number; duplicatesFound: number }> {
  const res = await fetch(`${API_BASE}/api/admin/highlight-import/run`, {
    method: 'POST',
    headers: { ...authHeaders() },
  });
  return handleResponse<{ success: boolean; sourcesChecked: number; itemsAdded: number; duplicatesFound: number }>(res);
}

// In-Memory/LocalStorage storage keys for simulation
const USERS_STORAGE_KEY = 'rafid_simulated_users';
const LOGS_STORAGE_KEY = 'rafid_simulated_logs';
const RESETS_STORAGE_KEY = 'rafid_simulated_resets';

// Core mock/seed dataset for local-only visuals. Real admin permissions come from backend auth.
const SEED_USERS: AdminUser[] = [
  { id: 'u1', email: 'demo.student@jamiaati.local', role: 'user', created_at: new Date('2026-05-25T10:00:00Z').toISOString(), permissions: { canUpload: false } },
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

export type OutreachContactStatus = 'active' | 'unsubscribed' | 'bounced' | 'invalid' | 'duplicate';
export type OutreachCampaignStatus = 'draft' | 'scheduled' | 'sending' | 'paused' | 'completed' | 'failed';
export type OutreachRecipientStatus = 'pending' | 'queued' | 'sent' | 'failed' | 'bounced' | 'skipped' | 'unsubscribed';

export interface OutreachContact {
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
  status: OutreachContactStatus;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface OutreachTemplate {
  id: string;
  name: string;
  subject_template: string;
  html_template: string;
  text_template: string;
  language?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface OutreachCampaign {
  id: string;
  name: string;
  template_id: string;
  status: OutreachCampaignStatus;
  segment_filter_json?: string | null;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  bounced_count: number;
  unsubscribed_count: number;
  created_at?: string;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface OutreachRecipient {
  id: string;
  campaign_id: string;
  contact_id: string;
  email: string;
  personalized_subject: string;
  personalized_html: string;
  personalized_text: string;
  status: OutreachRecipientStatus;
  provider_message_id?: string | null;
  error_message?: string | null;
  sent_at?: string | null;
  opened_at?: string | null;
  clicked_at?: string | null;
}

export interface OutreachImportSummary {
  totalRows: number;
  imported: number;
  updated: number;
  duplicates: number;
  invalidEmails: number;
}

export async function getOutreachDashboard() {
  const response = await fetch(`${API_BASE}/api/outreach/dashboard`, { headers: { ...authHeaders() } });
  return handleResponse<{
    contacts: { status: OutreachContactStatus; count: number }[];
    recentCampaigns: OutreachCampaign[];
    config: { dryRun: boolean; providerConfigured: boolean; dnsVerifiedManually: boolean };
  }>(response);
}

export async function importOutreachContacts(csv: string) {
  const response = await fetch(`${API_BASE}/api/outreach/contacts/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/csv', ...authHeaders() },
    body: csv,
  });
  return handleResponse<OutreachImportSummary>(response);
}

export async function getOutreachContacts(filters?: Record<string, string>) {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const response = await fetch(`${API_BASE}/api/outreach/contacts${params.toString() ? `?${params}` : ''}`, { headers: { ...authHeaders() } });
  return handleResponse<OutreachContact[]>(response);
}

export async function patchOutreachContact(id: string, payload: Partial<OutreachContact>) {
  const response = await fetch(`${API_BASE}/api/outreach/contacts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ success: boolean }>(response);
}

export async function getOutreachTemplates() {
  const response = await fetch(`${API_BASE}/api/outreach/templates`, { headers: { ...authHeaders() } });
  return handleResponse<OutreachTemplate[]>(response);
}

export async function createOutreachTemplate(payload: Omit<OutreachTemplate, 'id'>) {
  const response = await fetch(`${API_BASE}/api/outreach/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ success: boolean }>(response);
}

export async function patchOutreachTemplate(id: string, payload: Partial<OutreachTemplate>) {
  const response = await fetch(`${API_BASE}/api/outreach/templates/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ success: boolean }>(response);
}

export async function getOutreachCampaigns() {
  const response = await fetch(`${API_BASE}/api/outreach/campaigns`, { headers: { ...authHeaders() } });
  return handleResponse<OutreachCampaign[]>(response);
}

export async function createOutreachCampaign(payload: { name: string; template_id: string; segment_filter_json?: Record<string, string> }) {
  const response = await fetch(`${API_BASE}/api/outreach/campaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ id: string; success: boolean }>(response);
}

export async function getOutreachCampaign(id: string) {
  const response = await fetch(`${API_BASE}/api/outreach/campaigns/${id}`, { headers: { ...authHeaders() } });
  return handleResponse<{ campaign: OutreachCampaign; recipients: OutreachRecipient[] }>(response);
}

export async function previewOutreachCampaign(id: string) {
  const response = await fetch(`${API_BASE}/api/outreach/campaigns/${id}/preview`, {
    method: 'POST',
    headers: { ...authHeaders() },
  });
  return handleResponse<{ placeholders: string[]; samples: { subject: string; html: string; text: string; contact: OutreachContact }[] }>(response);
}

export async function outreachCampaignAction(id: string, action: 'send-test' | 'start' | 'pause' | 'resume' | 'retry-failed' | 'stop') {
  const response = await fetch(`${API_BASE}/api/outreach/campaigns/${id}/${action}`, {
    method: 'POST',
    headers: { ...authHeaders() },
  });
  return handleResponse<{ success: boolean; dryRun?: boolean; providerMessageId?: string }>(response);
}

export function outreachExportUrl(kind: 'contacts' | 'campaign', id?: string) {
  const path = kind === 'contacts' ? '/api/outreach/contacts/export' : `/api/outreach/campaigns/${id}/export`;
  return `${API_BASE}${path}`;
}

export type AutomationStatus = 'pending_review' | 'approved' | 'rejected' | 'duplicate' | 'expired';

export interface OpportunityAutomationSource {
  id: string;
  name: string;
  url: string;
  source_type: string;
  category_scope: string;
  country_scope?: string | null;
  governorate_scope?: string | null;
  language?: string | null;
  is_active: number | boolean;
  crawl_frequency_hours: number;
  last_checked_at?: string | null;
  last_success_at?: string | null;
  last_error?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface OpportunityCandidate {
  id: string;
  source_id?: string | null;
  title: string;
  organization?: string | null;
  category: string;
  description?: string | null;
  summary?: string | null;
  eligibility?: string | null;
  deadline?: string | null;
  published_date?: string | null;
  apply_url?: string | null;
  source_url?: string | null;
  image_url?: string | null;
  country?: string | null;
  governorate?: string | null;
  city?: string | null;
  language?: string | null;
  salary_or_funding?: string | null;
  confidence_score?: number;
  duplicate_key?: string | null;
  status: AutomationStatus;
  rejection_reason?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface OpportunityRunLog {
  id: string;
  started_at: string;
  finished_at?: string | null;
  status: string;
  sources_checked: number;
  items_found: number;
  items_inserted: number;
  duplicates_found: number;
  errors_json?: string | null;
}

export interface AutomationStatusResponse {
  sources: { total: number; active: number };
  candidates: { total: number; pending: number | null; approved: number | null };
  lastRun: OpportunityRunLog | null;
  dryRun: boolean;
}

export interface AutomationCandidatesResponse {
  candidates: OpportunityCandidate[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface AutomationImportResult {
  summary: { total: number; imported: number; duplicates: number; expired: number; errors: number };
  errors: string[];
}

function buildQuery(params?: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  });
  return search.toString();
}

function arrayFromResponse<T>(data: unknown, keys: string[]): T[] {
  if (Array.isArray(data)) return data as T[];
  if (!data || typeof data !== 'object') return [];
  for (const key of keys) {
    const value = (data as Record<string, unknown>)[key];
    if (Array.isArray(value)) return value as T[];
  }
  return [];
}

function normalizeCandidatesResponse(data: unknown, fallbackPage = 1, fallbackLimit = 20): AutomationCandidatesResponse {
  const candidates = arrayFromResponse<OpportunityCandidate>(data, ['candidates', 'items', 'data', 'results']);
  const rawPagination = data && typeof data === 'object' ? (data as any).pagination : null;
  return {
    candidates,
    pagination: {
      page: Number(rawPagination?.page || fallbackPage),
      limit: Number(rawPagination?.limit || fallbackLimit),
      total: Number(rawPagination?.total || candidates.length),
      totalPages: Number(rawPagination?.totalPages || Math.max(1, Math.ceil(candidates.length / fallbackLimit))),
    },
  };
}

export const opportunityAutomation = {
  getStatus: async () => {
    const res = await fetch(`${API_BASE}/api/opportunity-automation/status`, { headers: { ...authHeaders() } });
    return handleResponse<AutomationStatusResponse>(res);
  },
  getStats: async () => {
    const res = await fetch(`${API_BASE}/api/opportunity-automation/stats`, { headers: { ...authHeaders() } });
    return handleResponse<{
      byStatus: { status: AutomationStatus; count: number }[];
      byCategory: { category: string; count: number }[];
      byGovernorate: { governorate: string; count: number }[];
      sourceStats: { source_type: string; count: number }[];
    }>(res);
  },
  getSources: async (params?: Record<string, string | number | boolean>) => {
    const query = buildQuery(params);
    const res = await fetch(`${API_BASE}/api/opportunity-automation/sources${query ? `?${query}` : ''}`, { headers: { ...authHeaders() } });
    const data = await handleResponse<unknown>(res);
    return arrayFromResponse<OpportunityAutomationSource>(data, ['sources', 'items', 'data', 'results']);
  },
  createSource: async (data: Partial<OpportunityAutomationSource> & { name: string; url: string; source_type: string; category_scope: string }) => {
    const res = await fetch(`${API_BASE}/api/opportunity-automation/sources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ id: string; success: boolean }>(res);
  },
  updateSource: async (id: string, data: Partial<OpportunityAutomationSource>) => {
    const res = await fetch(`${API_BASE}/api/opportunity-automation/sources/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean }>(res);
  },
  deleteSource: async (id: string) => {
    const res = await fetch(`${API_BASE}/api/opportunity-automation/sources/${id}`, { method: 'DELETE', headers: { ...authHeaders() } });
    return handleResponse<{ success: boolean }>(res);
  },
  runNow: async () => {
    const res = await fetch(`${API_BASE}/api/opportunity-automation/run-now`, { method: 'POST', headers: { ...authHeaders() } });
    return handleResponse<{ success: boolean; dryRun: boolean }>(res);
  },
  runSource: async (id: string) => {
    const res = await fetch(`${API_BASE}/api/opportunity-automation/run-source/${id}`, { method: 'POST', headers: { ...authHeaders() } });
    return handleResponse<{ success: boolean; sourceId: string; dryRun: boolean; message?: string }>(res);
  },
  importCsv: async (file: File | string) => {
    const body = typeof file === 'string' ? file : await file.text();
    const res = await fetch(`${API_BASE}/api/opportunity-automation/import-csv`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/csv', ...authHeaders() },
      body,
    });
    return handleResponse<AutomationImportResult>(res);
  },
  getCandidates: async (params?: Record<string, string | number | boolean>) => {
    const query = buildQuery(params);
    const res = await fetch(`${API_BASE}/api/opportunity-automation/candidates${query ? `?${query}` : ''}`, { headers: { ...authHeaders() } });
    const data = await handleResponse<unknown>(res);
    return normalizeCandidatesResponse(data, Number(params?.page || 1), Number(params?.limit || 20));
  },
  getCandidate: async (id: string) => {
    const res = await fetch(`${API_BASE}/api/opportunity-automation/candidates/${id}`, { headers: { ...authHeaders() } });
    return handleResponse<OpportunityCandidate>(res);
  },
  updateCandidate: async (id: string, data: Partial<OpportunityCandidate>) => {
    const res = await fetch(`${API_BASE}/api/opportunity-automation/candidates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean }>(res);
  },
  approveCandidate: async (id: string) => {
    const res = await fetch(`${API_BASE}/api/opportunity-automation/candidates/${id}/approve`, { method: 'POST', headers: { ...authHeaders() } });
    return handleResponse<{ success: boolean; dryRun: boolean; published: boolean }>(res);
  },
  rejectCandidate: async (id: string, reason?: string) => {
    const res = await fetch(`${API_BASE}/api/opportunity-automation/candidates/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ reason }),
    });
    return handleResponse<{ success: boolean }>(res);
  },
  markDuplicate: async (id: string) => {
    const res = await fetch(`${API_BASE}/api/opportunity-automation/candidates/${id}/mark-duplicate`, { method: 'POST', headers: { ...authHeaders() } });
    return handleResponse<{ success: boolean }>(res);
  },
  markExpired: async (id: string) => {
    const res = await fetch(`${API_BASE}/api/opportunity-automation/candidates/${id}/mark-expired`, { method: 'POST', headers: { ...authHeaders() } });
    return handleResponse<{ success: boolean }>(res);
  },
  getLogs: async (params?: Record<string, string | number | boolean>) => {
    const query = buildQuery(params);
    const res = await fetch(`${API_BASE}/api/opportunity-automation/logs${query ? `?${query}` : ''}`, { headers: { ...authHeaders() } });
    const data = await handleResponse<unknown>(res);
    return arrayFromResponse<OpportunityRunLog>(data, ['logs', 'items', 'data', 'results']);
  },
};

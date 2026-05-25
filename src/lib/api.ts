const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:8787';

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
}): Promise<any[]> {
  const params = new URLSearchParams();
  if (filters?.governorate) params.set('governorate', filters.governorate);
  if (filters?.institution) params.set('institution', filters.institution);

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

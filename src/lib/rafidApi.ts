const API_BASE = "https://rafid-api.mahdialmuntadhar1.workers.dev";
const TOKEN_KEY = "rafid_auth_token";

type ApiResult<T> = T | null;
export type AuthResult = {
  ok: boolean;
  token: string | null;
  user: Record<string, unknown> | null;
  raw: any;
  status?: number;
  message?: string;
};

async function requestJson<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: T | null }> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const data = await response.json().catch(() => null);
    return { ok: response.ok, status: response.status, data: data as T | null };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

async function safeFetch<T>(
  path: string,
  options: RequestInit = {},
  fallback: T | null = null
): Promise<ApiResult<T>> {
  const response = await requestJson<T>(path, options);
  return response.ok && response.data !== null ? response.data : fallback;
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function logout() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Browsing should keep working even if storage is unavailable.
  }
}

function extractToken(data: any): string | undefined {
  return data?.token
    || data?.access_token
    || data?.accessToken
    || data?.data?.token
    || data?.data?.access_token
    || data?.data?.accessToken
    || data?.session?.token
    || data?.session?.access_token;
}

function persistToken(data: any) {
  const token = extractToken(data);
  if (token) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // Keep the response usable even if localStorage is blocked.
    }
  }
  return token;
}

function authMessage(data: any, fallback: string) {
  return data?.message || data?.error || data?.errors?.[0]?.message || fallback;
}

function extractUser(data: any): Record<string, unknown> | null {
  return data?.user
    || data?.data?.user
    || data?.profile
    || data?.data?.profile
    || null;
}

function friendlyAuthMessage(status: number, data: any, fallback: string) {
  if (status === 401) return "البريد الإلكتروني أو كلمة المرور غير صحيحة";
  if (status === 0 || status >= 500) return "الخدمة غير متاحة حالياً، حاول لاحقاً";
  return authMessage(data, fallback);
}

function authResult(ok: boolean, status: number, data: any, fallback: string, successMessage: string): AuthResult {
  if (!ok) {
    return {
      ok: false,
      token: null,
      user: null,
      raw: data,
      status,
      message: friendlyAuthMessage(status, data, fallback)
    };
  }

  const token = persistToken(data);
  if (!token) {
    return {
      ok: false,
      token: null,
      user: extractUser(data),
      raw: data,
      status,
      message: "حدث خطأ، حاول مرة أخرى"
    };
  }

  return {
    ok: true,
    token,
    user: extractUser(data),
    raw: data,
    status,
    message: successMessage
  };
}

export async function getHealth() {
  return safeFetch("/api/health", {}, null);
}

export async function getPosts() {
  const data = await safeFetch<any>("/api/posts", {}, []);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.posts)) return data.posts;
  return [];
}

export async function getOpportunities() {
  const data = await safeFetch<any>("/api/opportunities", {}, []);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.opportunities)) return data.opportunities;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

export async function login(email: string, password: string) {
  const response = await requestJson<any>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }
  );
  return authResult(response.ok, response.status, response.data, "حدث خطأ، حاول مرة أخرى", "تم تسجيل الدخول بنجاح");
}

export async function register(data: Record<string, unknown>) {
  const response = await requestJson<any>(
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  return authResult(response.ok, response.status, response.data, "حدث خطأ، حاول مرة أخرى", "تم إنشاء الحساب بنجاح");
}

export async function getMe(token: string) {
  return safeFetch(
    "/api/auth/me",
    {
      headers: authHeaders(token),
    },
    null
  );
}

export async function createPost(token: string, data: Record<string, unknown>) {
  return safeFetch(
    "/api/posts",
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    },
    null
  );
}

export async function likePost(token: string, postId: string) {
  return safeFetch(
    `/api/posts/${postId}/like`,
    {
      method: "POST",
      headers: authHeaders(token),
    },
    null
  );
}

export async function getComments(postId: string) {
  const data = await safeFetch<any>(`/api/posts/${postId}/comments`, {}, []);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.comments)) return data.comments;
  return [];
}

export async function createComment(token: string, postId: string, content: string) {
  return safeFetch(
    `/api/posts/${postId}/comments`,
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ content }),
    },
    null
  );
}

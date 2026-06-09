const API_BASE = "https://rafid-api.mahdialmuntadhar1.workers.dev";
const TOKEN_KEY = "rafid_auth_token";

type ApiResult<T> = T | null;

async function safeFetch<T>(
  path: string,
  options: RequestInit = {},
  fallback: T | null = null
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      return fallback;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.warn(`rafidApi: ${path} unavailable`, error);
    return fallback;
  }
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

function persistToken(data: any) {
  const token = data?.token || data?.access_token || data?.accessToken;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
  return data;
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
  const data = await safeFetch<any>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
    null
  );
  return data ? persistToken(data) : null;
}

export async function register(data: Record<string, unknown>) {
  const response = await safeFetch<any>(
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    null
  );
  return response ? persistToken(response) : null;
}

export async function getMe(token: string) {
  return safeFetch(
    "/api/me",
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

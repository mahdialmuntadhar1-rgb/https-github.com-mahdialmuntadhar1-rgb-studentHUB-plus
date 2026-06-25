const AUTH_STORAGE_KEYS = [
  'jamiaati_token',
  'admin_token',
  'jamiaati_auth_user',
  'jamiaati_user_email',
  'jamiaati_logged_in'
];

const AUTH_RELOAD_GUARD_KEY = 'jamiaati_auth_reload_once_v1';
const AUTH_EVENT_EXPIRED = 'jamiaati_auth_expired';
const AUTH_EVENT_CLEARED = 'jamiaati_auth_cleared';

function getStoredToken(): string {
  try {
    return localStorage.getItem('jamiaati_token') || localStorage.getItem('admin_token') || '';
  } catch {
    return '';
  }
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  return atob(padded);
}

function readJwtPayload(token: string): any | null {
  try {
    const parts = String(token || '').split('.');
    if (parts.length !== 3 || !parts[1]) return null;
    return JSON.parse(decodeBase64Url(parts[1]));
  } catch {
    return null;
  }
}

function tokenIsExpiredOrInvalid(token: string): boolean {
  if (!token) return false;
  if (token.startsWith('mock_token_')) return true;

  const payload = readJwtPayload(token);
  if (!payload) return true;

  const exp = Number(payload.exp || 0);
  if (!Number.isFinite(exp) || exp <= 0) return true;

  // Clear slightly early so the UI never starts with a token that is about to expire.
  return exp <= Math.floor(Date.now() / 1000) + 30;
}

export function clearAuthSession(reason = 'expired') {
  try {
    for (const key of AUTH_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }

    // Make the rest of the app instantly understand that this browser is logged out.
    localStorage.setItem('jamiaati_logged_in', 'false');
    window.dispatchEvent(new CustomEvent(AUTH_EVENT_CLEARED, { detail: { reason } }));
    window.dispatchEvent(new CustomEvent(AUTH_EVENT_EXPIRED, { detail: { reason } }));
  } catch {
    // Ignore storage errors. The app can still continue as guest.
  }
}

function isAuthEndpointThatMayReturnExpected401(pathname: string): boolean {
  return (
    pathname === '/api/auth/login' ||
    pathname === '/api/auth/register' ||
    pathname === '/api/auth/forgot-password' ||
    pathname === '/api/auth/reset-password' ||
    pathname === '/api/privacy/current'
  );
}

function isProtectedApi401(input: RequestInfo | URL): boolean {
  try {
    const rawUrl = input instanceof Request ? input.url : String(input);
    const url = new URL(rawUrl, window.location.origin);
    const pathname = url.pathname;

    if (!pathname.startsWith('/api/')) return false;
    if (isAuthEndpointThatMayReturnExpected401(pathname)) return false;

    return true;
  } catch {
    return false;
  }
}

function reloadOnceAfterAuthClear() {
  try {
    if (sessionStorage.getItem(AUTH_RELOAD_GUARD_KEY) === '1') return;
    sessionStorage.setItem(AUTH_RELOAD_GUARD_KEY, '1');
    window.setTimeout(() => window.location.reload(), 80);
  } catch {
    window.location.reload();
  }
}

export function installAuthSessionGuard() {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;

  const token = getStoredToken();
  if (tokenIsExpiredOrInvalid(token)) {
    clearAuthSession('expired_on_boot');
    try {
      sessionStorage.removeItem(AUTH_RELOAD_GUARD_KEY);
    } catch {}
    return;
  }

  // A successful fresh page load means the previous one-time reload guard can be reset.
  try {
    sessionStorage.removeItem(AUTH_RELOAD_GUARD_KEY);
  } catch {}

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (...args: Parameters<typeof fetch>): Promise<Response> => {
    const response = await originalFetch(...args);

    if (response.status === 401 && getStoredToken() && isProtectedApi401(args[0])) {
      clearAuthSession('server_401');
      reloadOnceAfterAuthClear();
    }

    return response;
  };
}

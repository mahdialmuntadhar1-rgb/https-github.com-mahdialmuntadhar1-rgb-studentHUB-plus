const TALABA_API_BASE = 'https://rafid-api.mahdialmuntadhar1.workers.dev';

declare global {
  interface Window {
    __TALABA_API_BASE__?: string;
    __TALABA_FETCH_PATCHED__?: boolean;
  }
}

window.__TALABA_API_BASE__ = TALABA_API_BASE;

function getStoredAuthToken(): string {
  return (
    localStorage.getItem('rafid_token') ||
    localStorage.getItem('talaba_token') ||
    localStorage.getItem('jamiaati_token') ||
    localStorage.getItem('admin_token') ||
    localStorage.getItem('auth_token') ||
    ''
  );
}

function normalizeTalabaApiUrl(input: RequestInfo | URL): RequestInfo | URL {
  const raw =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;

  try {
    const url = new URL(raw, window.location.origin);
    const isApiPath = url.pathname.startsWith('/api/');

    const isFrontendApi =
      (url.hostname === 'talaba.kaniq.org' || url.hostname === 'jamiati.kaniq.org') &&
      isApiPath;

    const isOldWorkerApi =
      url.hostname.endsWith('.mahdialmuntadhar1.workers.dev') &&
      url.hostname !== 'rafid-api.mahdialmuntadhar1.workers.dev' &&
      isApiPath;

    const isLocalApi =
      (url.hostname === 'localhost' || url.hostname === '127.0.0.1') &&
      isApiPath;

    if (isApiPath && (isFrontendApi || isOldWorkerApi || isLocalApi || raw.startsWith('/api/'))) {
      return TALABA_API_BASE + url.pathname + url.search;
    }
  } catch {
    if (typeof raw === 'string' && raw.startsWith('/api/')) {
      return TALABA_API_BASE + raw;
    }
  }

  return input;
}

if (!window.__TALABA_FETCH_PATCHED__) {
  window.__TALABA_FETCH_PATCHED__ = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const normalizedInput = normalizeTalabaApiUrl(input);

    const urlText =
      typeof normalizedInput === 'string'
        ? normalizedInput
        : normalizedInput instanceof URL
          ? normalizedInput.toString()
          : normalizedInput.url;

    const nextInit: RequestInit = { ...(init || {}) };

    if (urlText.startsWith(TALABA_API_BASE)) {
      const headers = new Headers(nextInit.headers || {});
      headers.set('Accept', 'application/json');

      const token = getStoredAuthToken();
      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', 'Bearer ' + token);
      }

      nextInit.headers = headers;
      nextInit.mode = 'cors';
    }

    return originalFetch(normalizedInput as any, nextInit);
  };

  console.info('[Talaba] API router active:', TALABA_API_BASE);
}

export {};

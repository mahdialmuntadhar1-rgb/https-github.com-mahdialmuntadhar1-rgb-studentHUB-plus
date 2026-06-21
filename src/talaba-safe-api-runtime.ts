const TALABA_API_BASE =
  typeof window !== 'undefined'
    ? window.location.origin
    : 'https://talaba.kaniq.org';

declare global {
  interface Window {
    __TALABA_SAFE_API_PATCHED__?: boolean;
  }
}

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

function rewriteApiUrl(input: RequestInfo | URL): RequestInfo | URL {
  const raw =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;

  try {
    const url = new URL(raw, window.location.origin);

    if (!url.pathname.startsWith('/api/')) {
      return input;
    }

    const knownApiHost =
      url.hostname === 'talaba.kaniq.org' ||
      url.hostname === 'jamiati.kaniq.org' ||
      url.hostname === 'rafid-api.mahdialmuntadhar1.workers.dev' ||
      url.hostname === 'https-github.mahdialmuntadhar1.workers.dev' ||
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1';

    if (knownApiHost || raw.startsWith('/api/')) {
      return TALABA_API_BASE + url.pathname + url.search;
    }
  } catch {
    if (typeof raw === 'string' && raw.startsWith('/api/')) {
      return TALABA_API_BASE + raw;
    }
  }

  return input;
}

if (!window.__TALABA_SAFE_API_PATCHED__) {
  window.__TALABA_SAFE_API_PATCHED__ = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const nextInput = rewriteApiUrl(input);

    const urlText =
      typeof nextInput === 'string'
        ? nextInput
        : nextInput instanceof URL
          ? nextInput.toString()
          : nextInput.url;

    const nextInit: RequestInit = { ...(init || {}) };

    if (urlText.startsWith(TALABA_API_BASE + '/api/')) {
      const headers = new Headers(nextInit.headers || {});
      headers.set('Accept', 'application/json');

      const token = getStoredAuthToken();
      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', 'Bearer ' + token);
      }

      nextInit.headers = headers;
      nextInit.mode = 'cors';
    }

    return originalFetch(nextInput as any, nextInit);
  };

  console.info('[Talaba] safe same-origin API patch active');
}

export {};

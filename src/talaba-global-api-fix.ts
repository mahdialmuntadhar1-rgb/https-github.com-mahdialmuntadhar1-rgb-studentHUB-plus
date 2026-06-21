const TALABA_API_BASE = 'https://rafid-api.mahdialmuntadhar1.workers.dev';

function getTalabaToken(): string {
  const keys = [
    'rafid_token',
    'jamiaati_token',
    'admin_token',
    'talaba_token',
    'auth_token',
    'token',
  ];

  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (value && value.length > 20) return value;
  }

  return '';
}

function shouldRouteToBackend(url: string): boolean {
  return (
    url.startsWith('/api/') ||
    url.includes('/api/hero') ||
    url.includes('/api/admin/hero') ||
    url.includes('/api/upload') ||
    url.includes('/api/uploads') ||
    url.includes('/api/opportunities') ||
    url.includes('/api/auth')
  );
}

function makeAbsoluteBackendUrl(url: string): string {
  if (url.startsWith('/api/')) return `${TALABA_API_BASE}${url}`;
  return url;
}

function patchGlobalFetch() {
  const w = window as any;
  if (w.__talabaGlobalApiFixInstalled) return;
  w.__talabaGlobalApiFixInstalled = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const rawUrl =
        typeof input === 'string'
          ? input
          : input instanceof URL
          ? input.toString()
          : input.url;

      if (!shouldRouteToBackend(rawUrl)) {
        return originalFetch(input, init);
      }

      const finalInput =
        typeof input === 'string'
          ? makeAbsoluteBackendUrl(input)
          : input instanceof URL
          ? makeAbsoluteBackendUrl(input.toString())
          : input;

      const headers = new Headers(init?.headers || {});

      headers.set('Accept', headers.get('Accept') || 'application/json');
      headers.set('X-Talaba-Client', 'web');

      const token = getTalabaToken();

      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return originalFetch(finalInput, {
        ...init,
        mode: 'cors',
        credentials: 'omit',
        headers,
      });
    } catch {
      return originalFetch(input, init);
    }
  };
}

patchGlobalFetch();

export {};

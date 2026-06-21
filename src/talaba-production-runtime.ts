
const TALABA_API_BASE =
  typeof window !== 'undefined'
    ? window.location.origin
    : 'https://talaba.kaniq.org';

declare global {
  interface Window {
    __TALABA_API_BASE__?: string;
    __TALABA_FETCH_PATCHED__?: boolean;
    __talabaFocusedOpportunityCategory?: string;
    __talabaFocusedOpportunityUntil?: number;
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

function normalizeCategory(raw: any): string {
  const text = String(raw || '').toLowerCase();

  if (
    text === 'job' ||
    text === 'jobs' ||
    text.includes('job') ||
    text.includes('work') ||
    text.includes('career') ||
    text.includes('employment') ||
    text.includes('فرص العمل') ||
    text.includes('وظائف') ||
    text.includes('کار') ||
    text.includes('دەرفەتی کار')
  ) {
    return 'job';
  }

  if (
    text === 'scholarship' ||
    text === 'scholarships' ||
    text.includes('scholarship') ||
    text.includes('grant') ||
    text.includes('funding') ||
    text.includes('منح') ||
    text.includes('بورسی') ||
    text.includes('خوێندن')
  ) {
    return 'scholarship';
  }

  if (text.includes('training') || text.includes('تدريب')) return 'training';
  if (text.includes('internship') || text.includes('تدريب عملي')) return 'internship';
  if (text.includes('event') || text.includes('activity') || text.includes('activities') || text.includes('فعاليات') || text.includes('نشاط')) return 'event';
  if (text.includes('exam') || text.includes('امتحان') || text.includes('تاقیکردنەوە')) return 'exam';

  return '';
}

function captureOpportunityCategoryFromClick(event: Event) {
  const target = event.target as HTMLElement | null;
  const clickable = target?.closest('button,a,[role="button"],[data-category],[data-tab]') as HTMLElement | null;
  if (!clickable) return;

  const text = [
    clickable.getAttribute('data-category'),
    clickable.getAttribute('data-tab'),
    clickable.getAttribute('aria-label'),
    clickable.textContent
  ].filter(Boolean).join(' ');

  const category = normalizeCategory(text);

  if (category === 'job' || category === 'scholarship') {
    window.__talabaFocusedOpportunityCategory = category;
    window.__talabaFocusedOpportunityUntil = Date.now() + 45000;
    console.info('[Talaba] focused opportunity category:', category);
  }
}

document.addEventListener('click', captureOpportunityCategoryFromClick, true);

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

    const isKnownApiHost =
      url.hostname === 'talaba.kaniq.org' ||
      url.hostname === 'jamiati.kaniq.org' ||
      url.hostname === 'rafid-api.mahdialmuntadhar1.workers.dev' ||
      url.hostname === 'https-github.mahdialmuntadhar1.workers.dev' ||
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1';

    if (isApiPath && (isKnownApiHost || raw.startsWith('/api/'))) {
      const next = new URL(TALABA_API_BASE + url.pathname + url.search);

      if (next.pathname === '/api/opportunities') {
        const focusedCategory = window.__talabaFocusedOpportunityCategory || '';
        const focusedUntil = window.__talabaFocusedOpportunityUntil || 0;

        if (!next.searchParams.get('category') && focusedCategory && Date.now() < focusedUntil) {
          next.searchParams.set('category', focusedCategory);
        }

        const normalized = normalizeCategory(next.searchParams.get('category'));

        if (normalized === 'job' || normalized === 'scholarship') {
          next.searchParams.set('category', normalized);
        }
      }

      return next.toString();
    }
  } catch {
    if (typeof raw === 'string' && raw.startsWith('/api/')) {
      return TALABA_API_BASE + raw;
    }
  }

  return input;
}

function filterOpportunityPayload(payload: any, category: string) {
  if (category !== 'job' && category !== 'scholarship') return payload;

  const filterList = (list: any[]) =>
    list.filter(item => normalizeCategory(item?.category || item?.type) === category);

  if (Array.isArray(payload)) return filterList(payload);

  if (payload && Array.isArray(payload.items)) {
    return { ...payload, items: filterList(payload.items) };
  }

  if (payload && Array.isArray(payload.opportunities)) {
    return { ...payload, opportunities: filterList(payload.opportunities) };
  }

  if (payload && Array.isArray(payload.data)) {
    return { ...payload, data: filterList(payload.data) };
  }

  return payload;
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

    const response = await originalFetch(normalizedInput as any, nextInit);

    try {
      const url = new URL(urlText);
      if (url.pathname === '/api/opportunities') {
        const category = normalizeCategory(url.searchParams.get('category'));
        if (category === 'job' || category === 'scholarship') {
          const clone = response.clone();
          const payload = await clone.json();
          const filtered = filterOpportunityPayload(payload, category);

          return new Response(JSON.stringify(filtered), {
            status: response.status,
            statusText: response.statusText,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }
      }
    } catch {}

    return response;
  };

  console.info('[Talaba] V7B strict category router active:', TALABA_API_BASE);
}

export {};

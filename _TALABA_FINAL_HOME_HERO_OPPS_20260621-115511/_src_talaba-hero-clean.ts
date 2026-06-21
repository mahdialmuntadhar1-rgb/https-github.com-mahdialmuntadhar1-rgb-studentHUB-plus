const TALABA_API_BASE = 'https://rafid-api.mahdialmuntadhar1.workers.dev';

function getStoredToken(): string {
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

function injectHeroCleanStyles() {
  if (document.getElementById('talaba-hero-clean-style')) return;

  const style = document.createElement('style');
  style.id = 'talaba-hero-clean-style';
  style.textContent = `
    .hero-overlay,
    .heroText,
    .hero-text,
    .hero-copy,
    .hero-content,
    .hero-title,
    .hero-subtitle,
    .hero-caption,
    .hero-gradient,
    .hero-shade,
    .hero-dark,
    [class*="hero-overlay"],
    [class*="HeroOverlay"],
    [class*="heroText"],
    [class*="HeroText"],
    [class*="hero-content"],
    [class*="HeroContent"],
    [class*="hero-copy"],
    [class*="HeroCopy"],
    [class*="hero-title"],
    [class*="HeroTitle"],
    [class*="hero-subtitle"],
    [class*="HeroSubtitle"],
    [class*="hero-caption"],
    [class*="HeroCaption"],
    [class*="hero-gradient"],
    [class*="HeroGradient"],
    [class*="hero-shade"],
    [class*="HeroShade"] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }

    [class*="hero"]::before,
    [class*="hero"]::after,
    [class*="Hero"]::before,
    [class*="Hero"]::after {
      background: transparent !important;
      opacity: 0 !important;
      display: none !important;
    }

    [class*="hero"],
    [class*="Hero"] {
      text-shadow: none !important;
    }

    [class*="hero"] img,
    [class*="Hero"] img {
      opacity: 1 !important;
      filter: none !important;
    }
  `;

  document.head.appendChild(style);
}

function patchHeroFetch() {
  const anyWindow = window as any;

  if (anyWindow.__talabaHeroFetchPatched) return;
  anyWindow.__talabaHeroFetchPatched = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const rawUrl = typeof input === 'string'
        ? input
        : input instanceof URL
        ? input.toString()
        : input.url;

      const isHeroOrUpload =
        rawUrl.includes('/api/hero') ||
        rawUrl.includes('/api/admin/hero') ||
        rawUrl.includes('/api/upload') ||
        rawUrl.includes('/api/uploads');

      if (!isHeroOrUpload) {
        return originalFetch(input, init);
      }

      let finalInput: RequestInfo | URL = input;

      if (typeof input === 'string' && input.startsWith('/api/')) {
        finalInput = `${TALABA_API_BASE}${input}`;
      }

      const headers = new Headers(init?.headers || {});
      const token = getStoredToken();

      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      headers.set('X-Talaba-Client', 'hero-upload');

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

function cleanExistingHeroText() {
  const heroLike = Array.from(document.querySelectorAll('section, header, div')).filter((el) => {
    const cls = String((el as HTMLElement).className || '').toLowerCase();
    const id = String((el as HTMLElement).id || '').toLowerCase();
    return cls.includes('hero') || id.includes('hero');
  });

  for (const hero of heroLike) {
    const inner = Array.from(hero.querySelectorAll('h1, h2, h3, p, span')).filter((el) => {
      const text = (el.textContent || '').trim();
      return text.length > 8 && !el.closest('button') && !el.closest('label');
    });

    for (const el of inner) {
      const html = el as HTMLElement;
      html.style.setProperty('display', 'none', 'important');
      html.style.setProperty('visibility', 'hidden', 'important');
      html.style.setProperty('opacity', '0', 'important');
    }
  }
}

function bootHeroClean() {
  injectHeroCleanStyles();
  patchHeroFetch();
  cleanExistingHeroText();

  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts++;
    cleanExistingHeroText();

    if (attempts > 20) {
      window.clearInterval(timer);
    }
  }, 500);

  const observer = new MutationObserver(() => cleanExistingHeroText());
  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootHeroClean);
} else {
  bootHeroClean();
}

export {};

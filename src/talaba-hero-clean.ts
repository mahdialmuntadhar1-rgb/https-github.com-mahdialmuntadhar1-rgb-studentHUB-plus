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

    [class*="hero"] img,
    [class*="Hero"] img {
      opacity: 1 !important;
      filter: none !important;
    }
  `;

  document.head.appendChild(style);
}

function cleanHeroTextNodes() {
  const heroLike = Array.from(document.querySelectorAll('section, header, div')).filter((el) => {
    const h = el as HTMLElement;
    const cls = String(h.className || '').toLowerCase();
    const id = String(h.id || '').toLowerCase();
    return cls.includes('hero') || id.includes('hero');
  });

  for (const hero of heroLike) {
    const textNodes = Array.from(hero.querySelectorAll('h1, h2, h3, h4, p, span')).filter((el) => {
      const text = (el.textContent || '').trim();
      if (!text || text.length < 8) return false;
      if (el.closest('button')) return false;
      if (el.closest('label')) return false;
      if (el.closest('select')) return false;
      return true;
    });

    for (const el of textNodes) {
      const h = el as HTMLElement;
      h.style.setProperty('display', 'none', 'important');
      h.style.setProperty('visibility', 'hidden', 'important');
      h.style.setProperty('opacity', '0', 'important');
    }
  }
}

function bootHeroClean() {
  injectHeroCleanStyles();
  cleanHeroTextNodes();

  let count = 0;
  const timer = window.setInterval(() => {
    count++;
    cleanHeroTextNodes();

    if (count > 20) window.clearInterval(timer);
  }, 500);

  const observer = new MutationObserver(() => cleanHeroTextNodes());
  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootHeroClean);
} else {
  bootHeroClean();
}

export {};

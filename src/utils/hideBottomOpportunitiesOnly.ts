const BOTTOM_OPPORTUNITIES_ONLY_BUILD = '20260620_143757';

function clean(value: unknown): string {
  return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function visible(el: HTMLElement | null): boolean {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  const style = window.getComputedStyle(el);
  return rect.width > 4 && rect.height > 4 && style.display !== 'none' && style.visibility !== 'hidden';
}

function textOf(el: Element | null): string {
  return clean(el?.textContent || '');
}

function isBottomArea(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  return rect.top > window.innerHeight * 0.62 && rect.bottom <= window.innerHeight + 60;
}

function isBottomOpportunityText(el: HTMLElement): boolean {
  const text = textOf(el);

  const exact =
    text === 'opportunities' ||
    text === 'opportunity' ||
    text === 'فرص' ||
    text === 'الفرص' ||
    text === 'دەرفەت' ||
    text === 'دەرفەتەکان';

  const compactOpportunity =
    text.includes('opportunities') &&
    !text.includes('campus life') &&
    text.length < 80;

  return exact || compactOpportunity;
}

function findBottomNavItem(el: HTMLElement): HTMLElement {
  let current: HTMLElement | null = el;

  for (let i = 0; i < 9 && current; i++) {
    const rect = current.getBoundingClientRect();

    const looksLikeBottomItem =
      isBottomArea(current) &&
      rect.width >= 38 &&
      rect.width <= Math.max(180, window.innerWidth * 0.36) &&
      rect.height >= 28 &&
      rect.height <= 130;

    if (looksLikeBottomItem) return current;

    current = current.parentElement;
  }

  return el;
}

function hideElement(el: HTMLElement | null) {
  if (!el) return;

  el.style.setProperty('display', 'none', 'important');
  el.style.setProperty('visibility', 'hidden', 'important');
  el.style.setProperty('pointer-events', 'none', 'important');
  el.style.setProperty('width', '0px', 'important');
  el.style.setProperty('min-width', '0px', 'important');
  el.style.setProperty('max-width', '0px', 'important');
  el.style.setProperty('overflow', 'hidden', 'important');
  el.setAttribute('aria-hidden', 'true');
  el.setAttribute('data-bottom-opportunities-hidden', BOTTOM_OPPORTUNITIES_ONLY_BUILD);
}

function removeOldExperimentalOverlays() {
  const oldIds = [
    'real-police-siren-switcher',
    'police-switcher-overlay-final',
    'force-police-switcher-css',
    'brute-police-switcher-css',
    'real-police-siren-style',
    'police-switcher-overlay-style',
    'police-sticky-tabs-style'
  ];

  for (const id of oldIds) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }
}

function isBottomSearchUniversityText(el: HTMLElement): boolean {
  const text = (el.textContent || '').toLowerCase().trim();
  return (
    text.includes('search university') ||
    text.includes('find university') ||
    text.includes('بحث جامعة') ||
    text.includes('البحث عن جامعة') ||
    text.includes('گەڕان بۆ زانکۆ')
  );
}
function hideBottomOpportunitiesOnly() {
  const all = Array.from(document.querySelectorAll('*')) as HTMLElement[];

  for (const el of all) {
    if (!visible(el)) continue;
    if (!isBottomArea(el)) continue;
    if (!isBottomOpportunityText(el) && !isBottomSearchUniversityText(el)) continue;

    const item = findBottomNavItem(el);
    hideElement(item);
  }
}

function blockBottomOpportunityClicks(event: Event) {
  const target = event.target as HTMLElement | null;
  if (!target) return;

  let current: HTMLElement | null = target;

  for (let i = 0; i < 8 && current; i++) {
    if (visible(current) && isBottomArea(current) && isBottomOpportunityText(current)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return;
    }

    current = current.parentElement;
  }
}

function apply() {
  if (!document.body) return;

  removeOldExperimentalOverlays();
  hideBottomOpportunitiesOnly();
}

export function installHideBottomOpportunitiesOnly() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  apply();

  document.addEventListener('click', blockBottomOpportunityClicks, true);
  document.addEventListener('touchstart', blockBottomOpportunityClicks, true);

  const observer = new MutationObserver(() => {
    window.requestAnimationFrame(apply);
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true
  });

  window.addEventListener('load', apply);
  window.addEventListener('resize', apply);
  window.addEventListener('scroll', apply, { passive: true });

  setTimeout(apply, 100);
  setTimeout(apply, 400);
  setTimeout(apply, 900);
  setTimeout(apply, 1800);
  setInterval(apply, 700);
}


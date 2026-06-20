/**
 * Public beta cleanup:
 * Completely removes/hides the linked Opportunities page from the visible UI.
 *
 * What it does:
 * - Hides bottom-nav Opportunities item even if it is a div/span instead of button/link.
 * - Clears saved active tab values that point to Opportunities.
 * - Redirects URL routes/query/hash that point to Opportunities.
 * - If the Opportunities page still renders job cards, it clicks Home automatically.
 * - Hides job-opportunity cards/shortcut opportunity strips left from that page.
 *
 * It does NOT delete opportunity/job records from D1.
 */

const OPPORTUNITY_TEXT = [
  'opportunities',
  'opportunity',
  'job opportunity',
  'فرص',
  'الفرص',
  'فرصة',
  'دەرفەت',
  'دەرفەتەکان',
  'هەل',
  'هەلی'
];

const JOB_PAGE_TEXT = [
  'job opportunity',
  'apply',
  'requirements',
  'source:',
  'iraq jobs scout',
  'all future',
  'search jobs',
  'internship',
  'training'
];

function normalizeText(value: string | null | undefined): string {
  return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function textOf(el: Element | null): string {
  return normalizeText(el?.textContent || '');
}

function hasAny(text: string, words: string[]): boolean {
  return words.some(word => text.includes(word.toLowerCase()));
}

function hideElement(el: Element | null) {
  if (!el) return;
  const node = el as HTMLElement;
  node.style.setProperty('display', 'none', 'important');
  node.style.setProperty('visibility', 'hidden', 'important');
  node.style.setProperty('opacity', '0', 'important');
  node.style.setProperty('pointer-events', 'none', 'important');
  node.style.setProperty('width', '0px', 'important');
  node.style.setProperty('min-width', '0px', 'important');
  node.style.setProperty('max-width', '0px', 'important');
  node.style.setProperty('overflow', 'hidden', 'important');
  node.setAttribute('aria-hidden', 'true');
  node.setAttribute('data-opportunities-removed', 'true');
}

function isVisible(el: Element): boolean {
  const node = el as HTMLElement;
  const rect = node.getBoundingClientRect?.();
  if (!rect) return false;
  const style = window.getComputedStyle(node);
  return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
}

function isNearBottom(el: Element): boolean {
  const rect = (el as HTMLElement).getBoundingClientRect?.();
  if (!rect) return false;
  return rect.top > window.innerHeight * 0.62 && rect.bottom <= window.innerHeight + 40;
}

function findBottomNavItemContainer(el: Element): Element {
  let current: Element | null = el;

  for (let i = 0; i < 8 && current; i++) {
    const rect = (current as HTMLElement).getBoundingClientRect?.();
    if (rect) {
      const nearBottom = rect.top > window.innerHeight * 0.58;
      const itemSized =
        rect.width > 35 &&
        rect.width < Math.max(170, window.innerWidth * 0.35) &&
        rect.height > 25 &&
        rect.height < 130;

      if (nearBottom && itemSized) return current;
    }

    current = current.parentElement;
  }

  return el;
}

function hideBottomOpportunitiesTab() {
  const all = Array.from(document.querySelectorAll('*'));

  for (const el of all) {
    if (!isVisible(el)) continue;

    const text = textOf(el);
    if (!text) continue;

    const exactOpportunityLabel =
      text === 'opportunities' ||
      text === 'opportunity' ||
      text === 'فرص' ||
      text === 'الفرص' ||
      text === 'دەرفەت' ||
      text === 'دەرفەتەکان';

    const attrText = normalizeText(
      Array.from(el.attributes || [])
        .map(a => `${a.name}=${a.value}`)
        .join(' ')
    );

    const attrLooksOpportunity =
      attrText.includes('opportunit') ||
      attrText.includes('briefcase');

    if (isNearBottom(el) && (exactOpportunityLabel || attrLooksOpportunity)) {
      hideElement(findBottomNavItemContainer(el));
    }
  }
}

function clearSavedOpportunityState() {
  try {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      const value = normalizeText(localStorage.getItem(key));

      if (
        normalizeText(key).includes('opportunit') ||
        value === 'opportunities' ||
        value === 'opportunity' ||
        value.includes('"opportunities"') ||
        value.includes('active') && value.includes('opportunit')
      ) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch {}
}

function redirectOpportunityUrl() {
  const urlText = normalizeText(
    `${window.location.pathname} ${window.location.hash} ${window.location.search}`
  );

  if (
    urlText.includes('/opportunities') ||
    urlText.includes('#/opportunities') ||
    urlText.includes('tab=opportunities') ||
    urlText.includes('page=opportunities') ||
    urlText.includes('active=opportunities')
  ) {
    try {
      window.history.replaceState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } catch {
      window.location.href = '/';
    }
  }
}

function clickHomeIfOpportunityPageVisible() {
  const bodyText = textOf(document.body);

  const looksLikeOpportunityPage =
    bodyText.includes('job opportunity') &&
    bodyText.includes('apply') &&
    (
      bodyText.includes('requirements') ||
      bodyText.includes('source:') ||
      bodyText.includes('iraq jobs scout')
    );

  if (!looksLikeOpportunityPage) return;

  const all = Array.from(document.querySelectorAll('*'));

  const homeCandidate = all.find(el => {
    const text = textOf(el);
    if (!text) return false;
    const isHome =
      text === 'home' ||
      text === 'الرئيسية' ||
      text === 'سەرەکی';

    return isHome && isNearBottom(el) && isVisible(el);
  });

  if (homeCandidate) {
    const container = findBottomNavItemContainer(homeCandidate);
    try {
      (container as HTMLElement).click();
    } catch {}
  }
}

function findCardContainer(el: Element): Element {
  let current: Element | null = el;

  for (let i = 0; i < 10 && current; i++) {
    const rect = (current as HTMLElement).getBoundingClientRect?.();
    const text = textOf(current);

    if (rect) {
      const cardSized =
        rect.width > window.innerWidth * 0.55 &&
        rect.width < window.innerWidth * 1.05 &&
        rect.height > 120 &&
        rect.height < window.innerHeight * 0.95;

      const hasCardClass =
        normalizeText((current as HTMLElement).className || '').includes('card') ||
        normalizeText((current as HTMLElement).className || '').includes('rounded') ||
        current.tagName.toLowerCase() === 'article';

      if (cardSized && (hasCardClass || text.includes('job opportunity'))) {
        return current;
      }
    }

    current = current.parentElement;
  }

  return el;
}

function hideOpportunityCardsAndShortcutPagePieces() {
  const all = Array.from(document.querySelectorAll('*'));

  for (const el of all) {
    if (!isVisible(el)) continue;

    const text = textOf(el);
    if (!text) continue;

    const isJobCardLabel =
      text === 'job opportunity' ||
      text.includes('job opportunity');

    if (isJobCardLabel) {
      hideElement(findCardContainer(el));
      continue;
    }

    const rect = (el as HTMLElement).getBoundingClientRect?.();
    if (!rect) continue;

    const isTopShortcut =
      rect.top >= 0 &&
      rect.top < window.innerHeight * 0.65 &&
      rect.height < 260 &&
      hasAny(text, JOB_PAGE_TEXT) &&
      (
        text.includes('search jobs') ||
        text.includes('all future') ||
        text.includes('campus today') ||
        text.includes('internship') ||
        text.includes('apply')
      );

    if (isTopShortcut) {
      hideElement(el);
    }
  }
}

function addHardCssOnce() {
  if (document.getElementById('remove-opportunities-hard-css')) return;

  const style = document.createElement('style');
  style.id = 'remove-opportunities-hard-css';
  style.textContent = `
    [data-page="opportunities"],
    [data-tab="opportunities"],
    [data-active-tab="opportunities"],
    [href*="opportunit"],
    [aria-label*="Opportunit"],
    [title*="Opportunit"] {
      display: none !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }
  `;
  document.head.appendChild(style);
}

function cleanup() {
  addHardCssOnce();
  clearSavedOpportunityState();
  redirectOpportunityUrl();
  hideBottomOpportunitiesTab();
  hideOpportunityCardsAndShortcutPagePieces();
  clickHomeIfOpportunityPageVisible();
  hideBottomOpportunitiesTab();
  hideOpportunityCardsAndShortcutPagePieces();
}

export function installRemoveOpportunitiesUI() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  cleanup();

  const observer = new MutationObserver(() => {
    window.requestAnimationFrame(cleanup);
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true
  });

  window.addEventListener('hashchange', cleanup);
  window.addEventListener('popstate', cleanup);
  window.addEventListener('resize', cleanup);
  window.addEventListener('load', cleanup);

  setTimeout(cleanup, 100);
  setTimeout(cleanup, 500);
  setTimeout(cleanup, 1200);
  setTimeout(cleanup, 2500);
  setInterval(cleanup, 1000);
}

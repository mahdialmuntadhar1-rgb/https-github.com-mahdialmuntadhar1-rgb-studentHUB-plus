/**
 * Temporary public-beta UI cleanup:
 * - Hides/removes the bottom "Opportunities" nav page.
 * - Hides/removes opportunity shortcut cards/shortcut strips.
 * - Redirects direct /opportunities or #/opportunities access back to Home.
 *
 * This does NOT delete opportunity/job data.
 */

const OPPORTUNITY_WORDS = [
  'opportunities',
  'opportunity',
  'فرص',
  'الفرص',
  'فرصة',
  'هەلی',
  'هەلەکان',
  'دەرفەت',
  'دەرفەتەکان'
];

const SHORTCUT_WORDS = [
  'all future',
  'future',
  'shortcut',
  'shortcuts',
  'campus today',
  'exam cybersecurity',
  'frontend internship',
  'explore general opportunities',
  'all future',
  'فرص المستقبل',
  'كل الفرص',
  'هەموو دەرفەتەکان'
];

function textOf(el: Element | null): string {
  return (el?.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function hasAny(text: string, words: string[]): boolean {
  return words.some(word => text.includes(word.toLowerCase()));
}

function isBottomNavElement(el: Element): boolean {
  const rect = (el as HTMLElement).getBoundingClientRect?.();
  if (!rect) return false;

  const nearBottom = rect.top > window.innerHeight * 0.68;
  const smallEnough = rect.height < 140;
  return nearBottom && smallEnough;
}

function hideElement(el: Element | null) {
  if (!el) return;
  const node = el as HTMLElement;
  node.style.setProperty('display', 'none', 'important');
  node.style.setProperty('visibility', 'hidden', 'important');
  node.style.setProperty('pointer-events', 'none', 'important');
  node.setAttribute('aria-hidden', 'true');
  node.setAttribute('data-removed-opportunities-ui', 'true');
}

function findClickableContainer(el: Element): Element {
  return (
    el.closest('a') ||
    el.closest('button') ||
    el.closest('[role="button"]') ||
    el.closest('[role="tab"]') ||
    el.closest('li') ||
    el
  );
}

function hideBottomOpportunitiesTab() {
  const candidates = Array.from(
    document.querySelectorAll('a, button, [role="button"], [role="tab"], nav *')
  );

  for (const el of candidates) {
    const text = textOf(el);
    if (!text) continue;

    const onlyLooksLikeOpportunity =
      hasAny(text, OPPORTUNITY_WORDS) &&
      text.length < 80;

    if (onlyLooksLikeOpportunity && isBottomNavElement(el)) {
      hideElement(findClickableContainer(el));
    }

    const href = (el as HTMLAnchorElement).href || '';
    const data = Array.from(el.attributes || [])
      .map(a => `${a.name}=${a.value}`)
      .join(' ')
      .toLowerCase();

    if (
      isBottomNavElement(el) &&
      (
        href.toLowerCase().includes('opportunit') ||
        data.includes('opportunit')
      )
    ) {
      hideElement(findClickableContainer(el));
    }
  }
}

function hideOpportunityShortcutSections() {
  const candidates = Array.from(
    document.querySelectorAll('section, div, article, ul, nav')
  );

  for (const el of candidates) {
    const text = textOf(el);
    if (!text) continue;

    const rect = (el as HTMLElement).getBoundingClientRect?.();
    if (!rect) continue;

    const isTopShortcutArea =
      rect.top >= 0 &&
      rect.top < window.innerHeight * 0.62 &&
      rect.height < 360;

    const looksLikeShortcutArea =
      hasAny(text, SHORTCUT_WORDS) &&
      (
        text.includes('apply') ||
        text.includes('deadline') ||
        text.includes('explore') ||
        text.includes('future') ||
        text.includes('campus today') ||
        text.includes('فرص') ||
        text.includes('دەرفەت')
      );

    if (isTopShortcutArea && looksLikeShortcutArea) {
      hideElement(el);
    }
  }

  // Extra cleanup for small shortcut chips/cards.
  const smallItems = Array.from(
    document.querySelectorAll('a, button, article, [class*="card"], [class*="shortcut"], [class*="chip"]')
  );

  for (const el of smallItems) {
    const text = textOf(el);
    if (!text) continue;

    const rect = (el as HTMLElement).getBoundingClientRect?.();
    if (!rect) continue;

    const isSmallTopItem =
      rect.top >= 0 &&
      rect.top < window.innerHeight * 0.62 &&
      rect.height < 180 &&
      rect.width < window.innerWidth * 0.98;

    if (isSmallTopItem && hasAny(text, SHORTCUT_WORDS)) {
      hideElement(findClickableContainer(el));
    }
  }
}

function redirectOpportunityRoute() {
  const value = `${window.location.pathname} ${window.location.hash} ${window.location.search}`.toLowerCase();

  if (
    value.includes('/opportunities') ||
    value.includes('#/opportunities') ||
    value.includes('tab=opportunities') ||
    value.includes('page=opportunities')
  ) {
    try {
      window.history.replaceState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch {
      window.location.href = '/';
    }
  }
}

function runCleanup() {
  redirectOpportunityRoute();
  hideBottomOpportunitiesTab();
  hideOpportunityShortcutSections();
}

export function installRemoveOpportunitiesUI() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  runCleanup();

  const observer = new MutationObserver(() => {
    window.requestAnimationFrame(runCleanup);
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true
  });

  window.addEventListener('hashchange', runCleanup);
  window.addEventListener('popstate', runCleanup);
  window.addEventListener('resize', runCleanup);

  setInterval(runCleanup, 1200);
}

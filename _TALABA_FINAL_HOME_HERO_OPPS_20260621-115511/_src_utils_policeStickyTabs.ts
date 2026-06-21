/**
 * Sticky red/blue neon "police light" enhancer
 * for the Opportunities / Campus Life switcher.
 */

function normalizeText(value: string | null | undefined): string {
  return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function isVisible(el: Element): boolean {
  const node = el as HTMLElement;
  const rect = node.getBoundingClientRect?.();
  if (!rect) return false;
  const style = window.getComputedStyle(node);
  return rect.width > 40 && rect.height > 20 && style.display !== 'none' && style.visibility !== 'hidden';
}

function findSwitcherContainer(): HTMLElement | null {
  const all = Array.from(document.querySelectorAll('div, section, nav, article')) as HTMLElement[];

  let best: HTMLElement | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const el of all) {
    if (!isVisible(el)) continue;

    const text = normalizeText(el.textContent);
    if (!text.includes('opportunities') || !text.includes('campus life')) continue;

    const rect = el.getBoundingClientRect();
    if (rect.width < 220 || rect.height < 40 || rect.height > 180) continue;
    if (rect.top > window.innerHeight * 0.65) continue;

    const score = rect.width * rect.height;
    if (score < bestScore) {
      best = el;
      bestScore = score;
    }
  }

  return best;
}

function findTab(container: HTMLElement, needle: string): HTMLElement | null {
  const all = Array.from(container.querySelectorAll('*')) as HTMLElement[];

  for (const el of all) {
    const text = normalizeText(el.textContent);
    if (text === needle || text.includes(needle)) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 40 && rect.height > 16) {
        return el;
      }
    }
  }

  return null;
}

function closestTabLike(el: HTMLElement | null): HTMLElement | null {
  if (!el) return null;

  let current: HTMLElement | null = el;
  for (let i = 0; i < 6 && current; i++) {
    const rect = current.getBoundingClientRect();
    if (rect.width > 80 && rect.height > 24 && rect.height < 90) {
      return current;
    }
    current = current.parentElement;
  }

  return el;
}

function ensureStyles() {
  if (document.getElementById('police-sticky-tabs-style')) return;

  const style = document.createElement('style');
  style.id = 'police-sticky-tabs-style';
  style.textContent = `
    @keyframes policeBarGlow {
      0% {
        box-shadow:
          0 0 8px rgba(255, 40, 40, 0.45),
          0 0 18px rgba(72, 130, 255, 0.30),
          inset 0 0 12px rgba(255,255,255,0.18);
      }
      25% {
        box-shadow:
          0 0 24px rgba(255, 40, 40, 0.95),
          0 0 8px rgba(72, 130, 255, 0.15),
          inset 0 0 12px rgba(255,255,255,0.18);
      }
      50% {
        box-shadow:
          0 0 10px rgba(255, 40, 40, 0.30),
          0 0 26px rgba(72, 130, 255, 0.95),
          inset 0 0 12px rgba(255,255,255,0.18);
      }
      75% {
        box-shadow:
          0 0 18px rgba(255, 40, 40, 0.75),
          0 0 22px rgba(72, 130, 255, 0.75),
          inset 0 0 12px rgba(255,255,255,0.18);
      }
      100% {
        box-shadow:
          0 0 8px rgba(255, 40, 40, 0.45),
          0 0 18px rgba(72, 130, 255, 0.30),
          inset 0 0 12px rgba(255,255,255,0.18);
      }
    }

    @keyframes policeRedFlash {
      0%, 100% {
        box-shadow:
          0 0 8px rgba(255, 60, 60, 0.40),
          0 0 16px rgba(255, 60, 60, 0.30);
        filter: brightness(1);
      }
      50% {
        box-shadow:
          0 0 18px rgba(255, 30, 30, 0.95),
          0 0 34px rgba(255, 30, 30, 0.75);
        filter: brightness(1.12);
      }
    }

    @keyframes policeBlueFlash {
      0%, 100% {
        box-shadow:
          0 0 8px rgba(60, 120, 255, 0.40),
          0 0 16px rgba(60, 120, 255, 0.30);
        filter: brightness(1);
      }
      50% {
        box-shadow:
          0 0 18px rgba(35, 110, 255, 0.95),
          0 0 34px rgba(35, 110, 255, 0.75);
        filter: brightness(1.12);
      }
    }

    .police-switcher-bar {
      position: relative !important;
      z-index: 90 !important;
      border-radius: 28px !important;
      padding: 8px !important;
      background:
        linear-gradient(90deg,
          rgba(255, 60, 60, 0.16) 0%,
          rgba(255,255,255,0.72) 18%,
          rgba(255,255,255,0.74) 48%,
          rgba(70, 130, 255, 0.16) 100%) !important;
      border: 1px solid rgba(255,255,255,0.60) !important;
      backdrop-filter: blur(14px) saturate(150%) !important;
      -webkit-backdrop-filter: blur(14px) saturate(150%) !important;
      animation: policeBarGlow 1.6s infinite ease-in-out !important;
    }

    .police-switcher-fixed {
      position: fixed !important;
      top: 76px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      margin: 0 !important;
      z-index: 9999 !important;
    }

    .police-switcher-tab-red,
    .police-switcher-tab-blue {
      border-radius: 22px !important;
      transition: transform 0.22s ease, box-shadow 0.22s ease, filter 0.22s ease !important;
      will-change: transform, box-shadow, filter !important;
    }

    .police-switcher-tab-red {
      background:
        linear-gradient(135deg,
          rgba(255,255,255,0.90),
          rgba(255,245,245,0.95)) !important;
      color: #a11313 !important;
      border: 1px solid rgba(255, 75, 75, 0.38) !important;
      animation: policeRedFlash 1.25s infinite ease-in-out !important;
    }

    .police-switcher-tab-blue {
      background:
        linear-gradient(135deg,
          #7c2cff 0%,
          #3e4dff 48%,
          #1c85ff 100%) !important;
      color: #ffffff !important;
      border: 1px solid rgba(110, 160, 255, 0.60) !important;
      animation: policeBlueFlash 1.25s infinite ease-in-out !important;
    }

    .police-switcher-tab-red:hover,
    .police-switcher-tab-blue:hover {
      transform: translateY(-1px) scale(1.01) !important;
    }

    .police-switcher-tab-red *,
    .police-switcher-tab-blue * {
      color: inherit !important;
      text-shadow: 0 0 6px rgba(255,255,255,0.14) !important;
    }

    .police-switcher-placeholder {
      display: block;
      width: 100%;
      height: 0;
    }

    @media (max-width: 640px) {
      .police-switcher-fixed {
        top: 68px !important;
      }

      .police-switcher-bar {
        border-radius: 24px !important;
        padding: 6px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

let cleanupTimer: number | null = null;

function applyPoliceTabs() {
  ensureStyles();

  const container = findSwitcherContainer();
  if (!container) return;

  container.classList.add('police-switcher-bar');

  const opp = closestTabLike(findTab(container, 'opportunities'));
  const campus = closestTabLike(findTab(container, 'campus life'));

  if (opp) {
    opp.classList.add('police-switcher-tab-red');
  }

  if (campus) {
    campus.classList.add('police-switcher-tab-blue');
  }

  let placeholder = container.previousElementSibling as HTMLElement | null;
  if (!placeholder || !placeholder.classList.contains('police-switcher-placeholder')) {
    placeholder = document.createElement('div');
    placeholder.className = 'police-switcher-placeholder';
    container.parentElement?.insertBefore(placeholder, container);
  }

  function updateSticky() {
    const rect = placeholder!.getBoundingClientRect();
    const width = Math.min(container.offsetWidth || 0, window.innerWidth - 20);
    const shouldStick = rect.top <= 76;

    if (shouldStick) {
      placeholder!.style.height = `${container.offsetHeight}px`;
      container.classList.add('police-switcher-fixed');
      container.style.width = `${width}px`;
      container.style.maxWidth = `${width}px`;
    } else {
      placeholder!.style.height = `0px`;
      container.classList.remove('police-switcher-fixed');
      container.style.width = '';
      container.style.maxWidth = '';
    }
  }

  updateSticky();

  if (cleanupTimer) {
    window.clearTimeout(cleanupTimer);
  }

  cleanupTimer = window.setTimeout(updateSticky, 60);

  window.addEventListener('scroll', updateSticky, { passive: true });
  window.addEventListener('resize', updateSticky);
}

export function installPoliceStickyTabs() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  applyPoliceTabs();

  const observer = new MutationObserver(() => {
    window.requestAnimationFrame(applyPoliceTabs);
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true
  });

  window.addEventListener('load', applyPoliceTabs);
  setTimeout(applyPoliceTabs, 200);
  setTimeout(applyPoliceTabs, 900);
  setTimeout(applyPoliceTabs, 1800);
}

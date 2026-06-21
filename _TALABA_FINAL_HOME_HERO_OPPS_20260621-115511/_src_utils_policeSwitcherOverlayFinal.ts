/**
 * FINAL visible sticky police-light overlay switcher.
 * This creates a new floating switcher, so it does not depend on the original component class names.
 */

function cleanText(value: unknown): string {
  return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function isVisible(el: HTMLElement | null): boolean {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  const style = window.getComputedStyle(el);
  return rect.width > 5 && rect.height > 5 && style.display !== 'none' && style.visibility !== 'hidden';
}

function textOf(el: Element | null): string {
  return cleanText(el?.textContent || '');
}

function findTextElement(label: 'opportunities' | 'campus life'): HTMLElement | null {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

  let node = walker.nextNode();
  while (node) {
    const text = cleanText(node.textContent);
    if (text.includes(label)) {
      const parent = node.parentElement as HTMLElement | null;
      if (isVisible(parent)) return parent;
    }
    node = walker.nextNode();
  }

  return null;
}

function findClickableFor(label: 'opportunities' | 'campus life'): HTMLElement | null {
  const textEl = findTextElement(label);
  if (!textEl) return null;

  let current: HTMLElement | null = textEl;

  for (let i = 0; i < 9 && current; i++) {
    const rect = current.getBoundingClientRect();
    const text = textOf(current);

    const looksClickable =
      current.tagName === 'BUTTON' ||
      current.tagName === 'A' ||
      current.getAttribute('role') === 'button' ||
      current.onclick ||
      current.className;

    const goodSize =
      rect.width > 70 &&
      rect.height > 24 &&
      rect.height < 130;

    if (looksClickable && goodSize && text.includes(label)) {
      return current;
    }

    current = current.parentElement;
  }

  return textEl;
}

function commonAncestor(a: HTMLElement, b: HTMLElement): HTMLElement | null {
  const parents = new Set<HTMLElement>();
  let cur: HTMLElement | null = a;

  while (cur && cur !== document.body && cur !== document.documentElement) {
    parents.add(cur);
    cur = cur.parentElement;
  }

  cur = b;
  while (cur && cur !== document.body && cur !== document.documentElement) {
    if (parents.has(cur)) return cur;
    cur = cur.parentElement;
  }

  return null;
}

function findOriginalSwitcher(): HTMLElement | null {
  const opp = findTextElement('opportunities');
  const campus = findTextElement('campus life');

  if (!opp || !campus) return null;

  let base = commonAncestor(opp, campus);
  if (!base) return null;

  let best: HTMLElement | null = base;
  let current: HTMLElement | null = base;

  for (let i = 0; i < 8 && current; i++) {
    const rect = current.getBoundingClientRect();
    const text = textOf(current);

    if (
      text.includes('opportunities') &&
      text.includes('campus life') &&
      rect.width > 220 &&
      rect.height >= 38 &&
      rect.height <= 200 &&
      rect.top < window.innerHeight * 0.75
    ) {
      best = current;
    }

    current = current.parentElement;
  }

  return best;
}

function hideOriginalSwitcher() {
  const original = findOriginalSwitcher();
  const overlay = document.getElementById('police-switcher-overlay-final');

  if (!original || original === overlay || original.contains(overlay)) return;

  original.setAttribute('data-hidden-by-police-overlay', 'true');
  original.style.setProperty('display', 'none', 'important');
  original.style.setProperty('visibility', 'hidden', 'important');
  original.style.setProperty('height', '0px', 'important');
  original.style.setProperty('margin', '0px', 'important');
  original.style.setProperty('padding', '0px', 'important');
  original.style.setProperty('overflow', 'hidden', 'important');
}

function ensureStyle() {
  if (document.getElementById('police-switcher-overlay-style')) return;

  const style = document.createElement('style');
  style.id = 'police-switcher-overlay-style';
  style.textContent = `
    @keyframes policeOverlayShell {
      0%, 100% {
        box-shadow:
          0 0 16px rgba(255, 0, 55, .65),
          0 0 28px rgba(0, 95, 255, .55),
          inset 0 0 20px rgba(255,255,255,.35);
      }
      25% {
        box-shadow:
          0 0 36px rgba(255, 0, 55, 1),
          0 0 12px rgba(0, 95, 255, .25),
          inset 0 0 20px rgba(255,255,255,.35);
      }
      50% {
        box-shadow:
          0 0 12px rgba(255, 0, 55, .25),
          0 0 40px rgba(0, 95, 255, 1),
          inset 0 0 20px rgba(255,255,255,.35);
      }
      75% {
        box-shadow:
          0 0 34px rgba(255, 0, 55, .95),
          0 0 36px rgba(0, 95, 255, .95),
          inset 0 0 20px rgba(255,255,255,.35);
      }
    }

    @keyframes policeOverlayRed {
      0%, 100% {
        filter: brightness(1);
        box-shadow: 0 0 12px rgba(255,0,55,.65), 0 0 28px rgba(255,0,55,.45);
      }
      50% {
        filter: brightness(1.3);
        box-shadow: 0 0 26px rgba(255,0,55,1), 0 0 54px rgba(255,0,55,.95);
      }
    }

    @keyframes policeOverlayBlue {
      0%, 100% {
        filter: brightness(1);
        box-shadow: 0 0 12px rgba(0,95,255,.65), 0 0 28px rgba(0,95,255,.45);
      }
      50% {
        filter: brightness(1.3);
        box-shadow: 0 0 26px rgba(0,95,255,1), 0 0 54px rgba(0,95,255,.95);
      }
    }

    #police-switcher-overlay-final {
      position: fixed !important;
      top: 78px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      width: min(650px, calc(100vw - 24px)) !important;
      z-index: 2147483000 !important;
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 9px !important;
      padding: 8px !important;
      border-radius: 32px !important;
      background:
        linear-gradient(90deg,
          rgba(255,0,55,.22),
          rgba(255,255,255,.88) 45%,
          rgba(0,95,255,.26)) !important;
      border: 1px solid rgba(255,255,255,.78) !important;
      backdrop-filter: blur(18px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(18px) saturate(180%) !important;
      animation: policeOverlayShell 1.15s infinite ease-in-out !important;
      pointer-events: auto !important;
    }

    #police-switcher-overlay-final button {
      min-height: 54px !important;
      border: 1px solid rgba(255,255,255,.65) !important;
      border-radius: 24px !important;
      color: #ffffff !important;
      font-weight: 950 !important;
      font-size: 17px !important;
      letter-spacing: -0.02em !important;
      text-shadow: 0 0 9px rgba(255,255,255,.65) !important;
      cursor: pointer !important;
      pointer-events: auto !important;
    }

    #police-switcher-overlay-final .police-red-btn {
      background: linear-gradient(135deg, #ff003b 0%, #ff2452 48%, #ff7385 100%) !important;
      animation: policeOverlayRed .85s infinite ease-in-out !important;
    }

    #police-switcher-overlay-final .police-blue-btn {
      background: linear-gradient(135deg, #004cff 0%, #1757ff 44%, #7b2cff 100%) !important;
      animation: policeOverlayBlue .85s infinite ease-in-out !important;
    }

    #police-switcher-overlay-final button:active {
      transform: scale(.97) !important;
    }

    body {
      scroll-padding-top: 150px !important;
    }

    @media (max-width: 640px) {
      #police-switcher-overlay-final {
        top: 72px !important;
        width: calc(100vw - 20px) !important;
        border-radius: 26px !important;
        padding: 7px !important;
      }

      #police-switcher-overlay-final button {
        min-height: 50px !important;
        font-size: 14px !important;
        border-radius: 20px !important;
      }
    }
  `;

  document.head.appendChild(style);
}

function createOverlay() {
  if (document.getElementById('police-switcher-overlay-final')) return;

  const wrap = document.createElement('div');
  wrap.id = 'police-switcher-overlay-final';

  const opp = document.createElement('button');
  opp.type = 'button';
  opp.className = 'police-red-btn';
  opp.innerHTML = '🚨 Opportunities';

  const campus = document.createElement('button');
  campus.type = 'button';
  campus.className = 'police-blue-btn';
  campus.innerHTML = '🚓 Campus Life';

  opp.addEventListener('click', () => {
    const target = findClickableFor('opportunities');
    target?.click();
  });

  campus.addEventListener('click', () => {
    const target = findClickableFor('campus life');
    target?.click();
  });

  wrap.appendChild(opp);
  wrap.appendChild(campus);

  document.body.appendChild(wrap);
}

function shouldShowOverlay(): boolean {
  const body = textOf(document.body);
  return body.includes('opportunities') && body.includes('campus life');
}

function apply() {
  if (!document.body) return;

  ensureStyle();

  if (shouldShowOverlay()) {
    createOverlay();
    hideOriginalSwitcher();
  }
}

export function installPoliceSwitcherOverlayFinal() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  apply();

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
  setTimeout(apply, 350);
  setTimeout(apply, 900);
  setTimeout(apply, 1800);
  setTimeout(apply, 3000);
  setInterval(apply, 700);
}

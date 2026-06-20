/**
 * REAL police-siren sticky switcher.
 * Build stamp: 20260620_142830
 *
 * This creates a new fixed overlay switcher.
 * It does not depend on the original tab styling.
 */

const POLICE_SIREN_BUILD_STAMP = '20260620_142830';

type TargetPair = {
  opportunities: HTMLElement | null;
  campusLife: HTMLElement | null;
  container: HTMLElement | null;
};

let lastTargets: TargetPair = {
  opportunities: null,
  campusLife: null,
  container: null
};

function cleanText(value: unknown): string {
  return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function isVisible(el: HTMLElement | null): boolean {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  const style = window.getComputedStyle(el);
  return rect.width > 4 && rect.height > 4 && style.display !== 'none' && style.visibility !== 'hidden';
}

function getText(el: Element | null): string {
  return cleanText(el?.textContent || '');
}

function findLabelElement(label: 'opportunities' | 'campus life'): HTMLElement | null {
  if (!document.body) return null;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node) {
    const text = cleanText(node.textContent);
    if (text.includes(label)) {
      const parent = node.parentElement as HTMLElement | null;
      if (isVisible(parent) && !parent?.closest('#real-police-siren-switcher')) {
        return parent;
      }
    }
    node = walker.nextNode();
  }

  return null;
}

function climbToClickableBox(el: HTMLElement | null, label: 'opportunities' | 'campus life'): HTMLElement | null {
  if (!el) return null;

  let current: HTMLElement | null = el;

  for (let i = 0; i < 10 && current; i++) {
    const rect = current.getBoundingClientRect();
    const text = getText(current);

    const goodSize =
      rect.width >= 85 &&
      rect.height >= 26 &&
      rect.height <= 120;

    const looksLikeTab =
      text.includes(label) &&
      goodSize &&
      current.id !== 'real-police-siren-switcher';

    if (looksLikeTab) return current;

    current = current.parentElement;
  }

  return el;
}

function commonAncestor(a: HTMLElement, b: HTMLElement): HTMLElement | null {
  const parents = new Set<HTMLElement>();

  let current: HTMLElement | null = a;
  while (current && current !== document.body && current !== document.documentElement) {
    parents.add(current);
    current = current.parentElement;
  }

  current = b;
  while (current && current !== document.body && current !== document.documentElement) {
    if (parents.has(current)) return current;
    current = current.parentElement;
  }

  return null;
}

function findOriginalContainer(opp: HTMLElement, campus: HTMLElement): HTMLElement | null {
  let base = commonAncestor(opp, campus);
  if (!base) return null;

  let best: HTMLElement | null = base;
  let current: HTMLElement | null = base;

  for (let i = 0; i < 10 && current; i++) {
    const rect = current.getBoundingClientRect();
    const text = getText(current);

    const good =
      text.includes('opportunities') &&
      text.includes('campus life') &&
      rect.width > 240 &&
      rect.height >= 42 &&
      rect.height <= 230 &&
      rect.width <= window.innerWidth * 1.08 &&
      !current.closest('#real-police-siren-switcher');

    if (good) best = current;

    current = current.parentElement;
  }

  return best;
}

function findTargets(): TargetPair {
  const oppLabel = findLabelElement('opportunities');
  const campusLabel = findLabelElement('campus life');

  const opp = climbToClickableBox(oppLabel, 'opportunities');
  const campus = climbToClickableBox(campusLabel, 'campus life');

  let container: HTMLElement | null = null;

  if (opp && campus) {
    container = findOriginalContainer(opp, campus);
  }

  if (opp || campus || container) {
    lastTargets = {
      opportunities: opp || lastTargets.opportunities,
      campusLife: campus || lastTargets.campusLife,
      container: container || lastTargets.container
    };
  }

  return lastTargets;
}

function ensureStyle() {
  if (document.getElementById('real-police-siren-style')) return;

  const style = document.createElement('style');
  style.id = 'real-police-siren-style';
  style.textContent = 
    @keyframes policeShellFight {
      0% {
        box-shadow:
          -18px 0 34px rgba(255, 0, 48, .95),
          18px 0 18px rgba(0, 102, 255, .28),
          inset 0 0 18px rgba(255,255,255,.32);
        background-position: 0% 50%;
      }
      50% {
        box-shadow:
          -18px 0 18px rgba(255, 0, 48, .25),
          18px 0 38px rgba(0, 102, 255, 1),
          inset 0 0 18px rgba(255,255,255,.32);
        background-position: 100% 50%;
      }
      100% {
        box-shadow:
          -18px 0 34px rgba(255, 0, 48, .95),
          18px 0 18px rgba(0, 102, 255, .28),
          inset 0 0 18px rgba(255,255,255,.32);
        background-position: 0% 50%;
      }
    }

    @keyframes redPoliceFight {
      0%, 100% {
        filter: brightness(1.35);
        box-shadow:
          0 0 20px rgba(255, 0, 50, 1),
          0 0 46px rgba(255, 0, 50, .85);
        transform: scale(1.015);
      }
      50% {
        filter: brightness(.72);
        box-shadow:
          0 0 6px rgba(255, 0, 50, .25),
          0 0 12px rgba(255, 0, 50, .20);
        transform: scale(.985);
      }
    }

    @keyframes bluePoliceFight {
      0%, 100% {
        filter: brightness(.72);
        box-shadow:
          0 0 6px rgba(0, 95, 255, .25),
          0 0 12px rgba(0, 95, 255, .20);
        transform: scale(.985);
      }
      50% {
        filter: brightness(1.35);
        box-shadow:
          0 0 20px rgba(0, 95, 255, 1),
          0 0 46px rgba(0, 95, 255, .9);
        transform: scale(1.015);
      }
    }

    #real-police-siren-switcher {
      position: fixed !important;
      top: 82px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      width: min(660px, calc(100vw - 24px)) !important;
      z-index: 2147483000 !important;
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 10px !important;
      padding: 9px !important;
      border-radius: 34px !important;
      background:
        linear-gradient(90deg,
          rgba(255,0,50,.26),
          rgba(255,255,255,.92) 45%,
          rgba(0,95,255,.28)) !important;
      background-size: 220% 220% !important;
      border: 1px solid rgba(255,255,255,.82) !important;
      backdrop-filter: blur(18px) saturate(185%) !important;
      -webkit-backdrop-filter: blur(18px) saturate(185%) !important;
      animation: policeShellFight .82s infinite ease-in-out !important;
      pointer-events: auto !important;
    }

    #real-police-siren-switcher::before,
    #real-police-siren-switcher::after {
      content: "";
      position: absolute;
      top: 50%;
      width: 72px;
      height: 72px;
      border-radius: 999px;
      transform: translateY(-50%);
      filter: blur(20px);
      opacity: .72;
      pointer-events: none;
    }

    #real-police-siren-switcher::before {
      left: -22px;
      background: rgba(255, 0, 48, .95);
      animation: redPoliceFight .82s infinite ease-in-out !important;
    }

    #real-police-siren-switcher::after {
      right: -22px;
      background: rgba(0, 95, 255, .95);
      animation: bluePoliceFight .82s infinite ease-in-out !important;
    }

    #real-police-siren-switcher button {
      position: relative !important;
      z-index: 2 !important;
      min-height: 56px !important;
      border-radius: 26px !important;
      border: 1px solid rgba(255,255,255,.70) !important;
      color: #ffffff !important;
      font-weight: 950 !important;
      font-size: 17px !important;
      letter-spacing: -.02em !important;
      text-shadow:
        0 0 8px rgba(255,255,255,.72),
        0 1px 2px rgba(0,0,0,.30) !important;
      cursor: pointer !important;
      pointer-events: auto !important;
    }

    #real-police-siren-switcher .red-side {
      background: linear-gradient(135deg, #ff0035 0%, #ff174d 48%, #ff6e80 100%) !important;
      animation: redPoliceFight .82s infinite ease-in-out !important;
    }

    #real-police-siren-switcher .blue-side {
      background: linear-gradient(135deg, #004cff 0%, #1268ff 46%, #7b2cff 100%) !important;
      animation: bluePoliceFight .82s infinite ease-in-out !important;
    }

    #real-police-siren-switcher button:active {
      transform: scale(.96) !important;
    }

    [data-hidden-original-switcher="true"] {
      display: none !important;
      visibility: hidden !important;
      height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
    }

    @media (max-width: 640px) {
      #real-police-siren-switcher {
        top: 74px !important;
        width: calc(100vw - 18px) !important;
        border-radius: 28px !important;
        padding: 7px !important;
        gap: 7px !important;
      }

      #real-police-siren-switcher button {
        min-height: 50px !important;
        font-size: 14px !important;
        border-radius: 21px !important;
      }
    }
  ;

  document.head.appendChild(style);
}

function createOverlay() {
  if (document.getElementById('real-police-siren-switcher')) return;

  const wrap = document.createElement('div');
  wrap.id = 'real-police-siren-switcher';
  wrap.setAttribute('data-build-stamp', POLICE_SIREN_BUILD_STAMP);

  const opp = document.createElement('button');
  opp.type = 'button';
  opp.className = 'red-side';
  opp.textContent = '🚨 Opportunities';

  const campus = document.createElement('button');
  campus.type = 'button';
  campus.className = 'blue-side';
  campus.textContent = '🚓 Campus Life';

  opp.addEventListener('click', () => {
    const targets = findTargets();
    targets.opportunities?.click();
  });

  campus.addEventListener('click', () => {
    const targets = findTargets();
    targets.campusLife?.click();
  });

  wrap.appendChild(opp);
  wrap.appendChild(campus);
  document.body.appendChild(wrap);
}

function hideOriginal() {
  const targets = findTargets();

  if (!targets.container) return;
  if (targets.container.id === 'real-police-siren-switcher') return;
  if (targets.container.closest('#real-police-siren-switcher')) return;

  targets.container.setAttribute('data-hidden-original-switcher', 'true');
}

function apply() {
  if (!document.body) return;

  ensureStyle();

  const bodyText = getText(document.body);
  const shouldShow =
    bodyText.includes('opportunities') &&
    bodyText.includes('campus life');

  if (!shouldShow) return;

  findTargets();
  createOverlay();
  hideOriginal();
}

export function installRealPoliceSirenSwitcher() {
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
  setTimeout(apply, 800);
  setTimeout(apply, 1600);
  setTimeout(apply, 2800);
  setInterval(apply, 650);
}

/**
 * Force police-light sticky style for the Opportunities / Campus Life switcher.
 * This does not depend on class names. It searches real visible text nodes.
 */

function norm(v: unknown): string {
  return String(v || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function visible(el: HTMLElement | null): boolean {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  const s = window.getComputedStyle(el);
  return r.width > 5 && r.height > 5 && s.display !== 'none' && s.visibility !== 'hidden';
}

function findTextElement(needle: string): HTMLElement | null {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const text = norm(node.textContent);
        if (!text) return NodeFilter.FILTER_REJECT;
        if (text === needle || text.includes(needle)) return NodeFilter.FILTER_ACCEPT;
        return NodeFilter.FILTER_REJECT;
      }
    }
  );

  let node = walker.nextNode();
  while (node) {
    const parent = node.parentElement as HTMLElement | null;
    if (visible(parent)) return parent;
    node = walker.nextNode();
  }

  return null;
}

function ancestorChain(el: HTMLElement | null): HTMLElement[] {
  const list: HTMLElement[] = [];
  let cur = el;
  while (cur && cur !== document.body && cur !== document.documentElement) {
    list.push(cur);
    cur = cur.parentElement;
  }
  return list;
}

function lowestCommonAncestor(a: HTMLElement, b: HTMLElement): HTMLElement | null {
  const aa = ancestorChain(a);
  const bb = new Set(ancestorChain(b));
  for (const item of aa) {
    if (bb.has(item)) return item;
  }
  return null;
}

function chooseSwitcherContainer(opp: HTMLElement, campus: HTMLElement): HTMLElement | null {
  let base = lowestCommonAncestor(opp, campus);
  if (!base) return null;

  let best: HTMLElement | null = base;
  let cur: HTMLElement | null = base;

  for (let i = 0; i < 7 && cur; i++) {
    const r = cur.getBoundingClientRect();
    const text = norm(cur.textContent);
    const looksRight =
      text.includes('opportunities') &&
      text.includes('campus life') &&
      r.width > 220 &&
      r.height >= 40 &&
      r.height <= 180 &&
      r.top < window.innerHeight * 0.75;

    if (looksRight) best = cur;
    cur = cur.parentElement;
  }

  return best;
}

function chooseTabBox(el: HTMLElement): HTMLElement {
  let cur: HTMLElement | null = el;

  for (let i = 0; i < 7 && cur; i++) {
    const r = cur.getBoundingClientRect();
    if (r.width > 90 && r.height > 28 && r.height < 100) return cur;
    cur = cur.parentElement;
  }

  return el;
}

function setImportant(el: HTMLElement, prop: string, value: string) {
  el.style.setProperty(prop, value, 'important');
}

function ensureCss() {
  if (document.getElementById('force-police-switcher-css')) return;

  const style = document.createElement('style');
  style.id = 'force-police-switcher-css';
  style.textContent = `
    @keyframes forcePoliceShell {
      0%, 100% {
        box-shadow:
          0 0 10px rgba(255, 0, 44, .55),
          0 0 24px rgba(0, 100, 255, .45),
          inset 0 0 18px rgba(255,255,255,.35);
      }
      25% {
        box-shadow:
          0 0 28px rgba(255, 0, 44, 1),
          0 0 12px rgba(0, 100, 255, .25),
          inset 0 0 18px rgba(255,255,255,.35);
      }
      50% {
        box-shadow:
          0 0 12px rgba(255, 0, 44, .25),
          0 0 32px rgba(0, 100, 255, 1),
          inset 0 0 18px rgba(255,255,255,.35);
      }
      75% {
        box-shadow:
          0 0 26px rgba(255, 0, 44, .85),
          0 0 30px rgba(0, 100, 255, .85),
          inset 0 0 18px rgba(255,255,255,.35);
      }
    }

    @keyframes forceRedLight {
      0%, 100% {
        filter: brightness(1);
        box-shadow: 0 0 10px rgba(255,0,45,.45), 0 0 20px rgba(255,0,45,.35);
      }
      50% {
        filter: brightness(1.25);
        box-shadow: 0 0 22px rgba(255,0,45,1), 0 0 42px rgba(255,0,45,.85);
      }
    }

    @keyframes forceBlueLight {
      0%, 100% {
        filter: brightness(1);
        box-shadow: 0 0 10px rgba(0,90,255,.45), 0 0 20px rgba(0,90,255,.35);
      }
      50% {
        filter: brightness(1.25);
        box-shadow: 0 0 22px rgba(0,90,255,1), 0 0 42px rgba(0,90,255,.85);
      }
    }

    .force-police-switcher-shell {
      animation: forcePoliceShell 1.2s infinite ease-in-out !important;
    }

    .force-police-red-tab {
      animation: forceRedLight .95s infinite ease-in-out !important;
    }

    .force-police-blue-tab {
      animation: forceBlueLight .95s infinite ease-in-out !important;
    }
  `;
  document.head.appendChild(style);
}

let placeholder: HTMLElement | null = null;
let lastContainer: HTMLElement | null = null;

function apply() {
  if (!document.body) return;
  ensureCss();

  const oppText = findTextElement('opportunities');
  const campusText = findTextElement('campus life');

  if (!oppText || !campusText) return;

  const container = chooseSwitcherContainer(oppText, campusText);
  if (!container || !visible(container)) return;

  const oppTab = chooseTabBox(oppText);
  const campusTab = chooseTabBox(campusText);

  lastContainer = container;

  container.classList.add('force-police-switcher-shell');
  oppTab.classList.add('force-police-red-tab');
  campusTab.classList.add('force-police-blue-tab');

  setImportant(container, 'position', 'sticky');
  setImportant(container, 'top', '72px');
  setImportant(container, 'z-index', '99999');
  setImportant(container, 'border-radius', '30px');
  setImportant(container, 'padding', '8px');
  setImportant(container, 'background', 'linear-gradient(90deg, rgba(255,0,45,.18), rgba(255,255,255,.86) 42%, rgba(0,90,255,.22))');
  setImportant(container, 'border', '1px solid rgba(255,255,255,.72)');
  setImportant(container, 'backdrop-filter', 'blur(16px) saturate(170%)');
  setImportant(container, '-webkit-backdrop-filter', 'blur(16px) saturate(170%)');

  setImportant(oppTab, 'background', 'linear-gradient(135deg, #ff0045, #ff4b67)');
  setImportant(oppTab, 'color', '#ffffff');
  setImportant(oppTab, 'border-radius', '22px');
  setImportant(oppTab, 'border', '1px solid rgba(255,255,255,.55)');
  setImportant(oppTab, 'text-shadow', '0 0 8px rgba(255,255,255,.55)');

  setImportant(campusTab, 'background', 'linear-gradient(135deg, #004bff, #7b2cff)');
  setImportant(campusTab, 'color', '#ffffff');
  setImportant(campusTab, 'border-radius', '22px');
  setImportant(campusTab, 'border', '1px solid rgba(255,255,255,.55)');
  setImportant(campusTab, 'text-shadow', '0 0 8px rgba(255,255,255,.55)');

  for (const child of Array.from(oppTab.querySelectorAll('*')) as HTMLElement[]) {
    setImportant(child, 'color', '#ffffff');
  }

  for (const child of Array.from(campusTab.querySelectorAll('*')) as HTMLElement[]) {
    setImportant(child, 'color', '#ffffff');
  }

  // Fallback: when sticky fails because a parent has transform/overflow, switch to fixed after scrolling.
  const originalTop = container.getBoundingClientRect().top + window.scrollY;

  function updateFixedFallback() {
    if (!lastContainer) return;

    if (window.scrollY > originalTop - 75) {
      if (!placeholder) {
        placeholder = document.createElement('div');
        placeholder.setAttribute('data-force-police-placeholder', 'true');
        lastContainer.parentElement?.insertBefore(placeholder, lastContainer);
      }

      placeholder.style.height = `${lastContainer.offsetHeight}px`;

      setImportant(lastContainer, 'position', 'fixed');
      setImportant(lastContainer, 'top', '72px');
      setImportant(lastContainer, 'left', '50%');
      setImportant(lastContainer, 'transform', 'translateX(-50%)');
      setImportant(lastContainer, 'width', `${Math.min(window.innerWidth - 22, 650)}px`);
      setImportant(lastContainer, 'max-width', 'calc(100vw - 22px)');
      setImportant(lastContainer, 'z-index', '999999');
    } else {
      if (placeholder) placeholder.style.height = '0px';
      setImportant(lastContainer, 'position', 'sticky');
      setImportant(lastContainer, 'top', '72px');
      lastContainer.style.removeProperty('left');
      lastContainer.style.removeProperty('transform');
      lastContainer.style.removeProperty('width');
      lastContainer.style.removeProperty('max-width');
    }
  }

  window.removeEventListener('scroll', updateFixedFallback);
  window.addEventListener('scroll', updateFixedFallback, { passive: true });
  updateFixedFallback();
}

export function installForcePoliceSwitcher() {
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

  setTimeout(apply, 100);
  setTimeout(apply, 400);
  setTimeout(apply, 900);
  setTimeout(apply, 1600);
  setInterval(apply, 900);
}

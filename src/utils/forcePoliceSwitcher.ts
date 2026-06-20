/**
 * BRUTE FORCE police-light sticky style for the real Opportunities / Campus Life switcher.
 * It styles every visible compact element that contains both labels.
 */

function n(v: unknown): string {
  return String(v || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function visible(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect();
  const s = window.getComputedStyle(el);
  return r.width > 20 && r.height > 15 && s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0';
}

function important(el: HTMLElement, prop: string, value: string) {
  el.style.setProperty(prop, value, 'important');
}

function ensureCss() {
  if (document.getElementById('brute-police-switcher-css')) return;

  const style = document.createElement('style');
  style.id = 'brute-police-switcher-css';
  style.textContent = `
    @keyframes brutePoliceShell {
      0%, 100% {
        box-shadow:
          0 0 12px rgba(255, 0, 55, .65),
          0 0 22px rgba(0, 90, 255, .45),
          inset 0 0 18px rgba(255,255,255,.42);
      }
      25% {
        box-shadow:
          0 0 34px rgba(255, 0, 55, 1),
          0 0 10px rgba(0, 90, 255, .25),
          inset 0 0 18px rgba(255,255,255,.42);
      }
      50% {
        box-shadow:
          0 0 10px rgba(255, 0, 55, .25),
          0 0 36px rgba(0, 90, 255, 1),
          inset 0 0 18px rgba(255,255,255,.42);
      }
      75% {
        box-shadow:
          0 0 28px rgba(255, 0, 55, .9),
          0 0 32px rgba(0, 90, 255, .9),
          inset 0 0 18px rgba(255,255,255,.42);
      }
    }

    @keyframes bruteRedFlash {
      0%, 100% {
        filter: brightness(1);
        box-shadow: 0 0 12px rgba(255,0,55,.55), 0 0 22px rgba(255,0,55,.38);
      }
      50% {
        filter: brightness(1.28);
        box-shadow: 0 0 26px rgba(255,0,55,1), 0 0 48px rgba(255,0,55,.9);
      }
    }

    @keyframes bruteBlueFlash {
      0%, 100% {
        filter: brightness(1);
        box-shadow: 0 0 12px rgba(0,90,255,.55), 0 0 22px rgba(0,90,255,.38);
      }
      50% {
        filter: brightness(1.28);
        box-shadow: 0 0 26px rgba(0,90,255,1), 0 0 48px rgba(0,90,255,.9);
      }
    }

    .brute-police-shell {
      animation: brutePoliceShell 1.15s infinite ease-in-out !important;
    }

    .brute-police-red {
      animation: bruteRedFlash .85s infinite ease-in-out !important;
    }

    .brute-police-blue {
      animation: bruteBlueFlash .85s infinite ease-in-out !important;
    }
  `;
  document.head.appendChild(style);
}

function isSwitcherCandidate(el: HTMLElement): boolean {
  if (!visible(el)) return false;

  const text = n(el.textContent);
  if (!text.includes('opportunities') || !text.includes('campus life')) return false;

  const r = el.getBoundingClientRect();

  if (r.width < 220) return false;
  if (r.height < 38 || r.height > 190) return false;

  // Avoid the whole app/body.
  if (el === document.body || el === document.documentElement) return false;
  if (r.width > window.innerWidth * 1.05) return false;

  return true;
}

function findTabInside(container: HTMLElement, word: string): HTMLElement | null {
  const all = Array.from(container.querySelectorAll('*')) as HTMLElement[];

  let best: HTMLElement | null = null;
  let bestArea = Number.POSITIVE_INFINITY;

  for (const el of all) {
    if (!visible(el)) continue;

    const text = n(el.textContent);
    if (!text.includes(word)) continue;

    const r = el.getBoundingClientRect();
    if (r.width < 70 || r.height < 20 || r.height > 100) continue;

    const area = r.width * r.height;
    if (area < bestArea) {
      best = el;
      bestArea = area;
    }
  }

  return best;
}

function climbToButtonBox(el: HTMLElement | null): HTMLElement | null {
  if (!el) return null;

  let cur: HTMLElement | null = el;

  for (let i = 0; i < 8 && cur; i++) {
    const r = cur.getBoundingClientRect();
    const text = n(cur.textContent);

    const good =
      r.width >= 90 &&
      r.height >= 28 &&
      r.height <= 100 &&
      (text.includes('opportunities') || text.includes('campus life'));

    if (good) return cur;

    cur = cur.parentElement;
  }

  return el;
}

function styleContainer(container: HTMLElement) {
  container.classList.add('brute-police-shell');
  container.setAttribute('data-brute-police-switcher', 'true');

  important(container, 'position', 'sticky');
  important(container, 'top', '72px');
  important(container, 'z-index', '999999');
  important(container, 'border-radius', '32px');
  important(container, 'padding', '8px');
  important(container, 'background', 'linear-gradient(90deg, rgba(255,0,55,.20), rgba(255,255,255,.88) 45%, rgba(0,90,255,.24))');
  important(container, 'border', '1px solid rgba(255,255,255,.78)');
  important(container, 'backdrop-filter', 'blur(18px) saturate(180%)');
  important(container, '-webkit-backdrop-filter', 'blur(18px) saturate(180%)');

  const opp = climbToButtonBox(findTabInside(container, 'opportunities'));
  const campus = climbToButtonBox(findTabInside(container, 'campus life'));

  if (opp) {
    opp.classList.add('brute-police-red');
    important(opp, 'background', 'linear-gradient(135deg, #ff003b 0%, #ff2c54 48%, #ff6a7c 100%)');
    important(opp, 'color', '#ffffff');
    important(opp, 'border-radius', '24px');
    important(opp, 'border', '1px solid rgba(255,255,255,.65)');
    important(opp, 'text-shadow', '0 0 8px rgba(255,255,255,.65)');
  }

  if (campus) {
    campus.classList.add('brute-police-blue');
    important(campus, 'background', 'linear-gradient(135deg, #004cff 0%, #2047ff 45%, #7b2cff 100%)');
    important(campus, 'color', '#ffffff');
    important(campus, 'border-radius', '24px');
    important(campus, 'border', '1px solid rgba(255,255,255,.65)');
    important(campus, 'text-shadow', '0 0 8px rgba(255,255,255,.65)');
  }

  for (const child of Array.from(container.querySelectorAll('*')) as HTMLElement[]) {
    const text = n(child.textContent);
    if (text.includes('opportunities') || text.includes('campus life')) {
      important(child, 'font-weight', '900');
    }
  }
}

function applyFixedFallback(container: HTMLElement) {
  const originalTop = container.getBoundingClientRect().top + window.scrollY;
  let placeholder = container.previousElementSibling as HTMLElement | null;

  if (!placeholder || placeholder.getAttribute('data-police-placeholder') !== 'true') {
    placeholder = document.createElement('div');
    placeholder.setAttribute('data-police-placeholder', 'true');
    container.parentElement?.insertBefore(placeholder, container);
  }

  function update() {
    if (window.scrollY > originalTop - 80) {
      placeholder!.style.height = `${container.offsetHeight}px`;

      important(container, 'position', 'fixed');
      important(container, 'top', '70px');
      important(container, 'left', '50%');
      important(container, 'transform', 'translateX(-50%)');
      important(container, 'width', `${Math.min(window.innerWidth - 22, 680)}px`);
      important(container, 'max-width', 'calc(100vw - 22px)');
      important(container, 'z-index', '999999');
    } else {
      placeholder!.style.height = '0px';

      important(container, 'position', 'sticky');
      important(container, 'top', '72px');
      container.style.removeProperty('left');
      container.style.removeProperty('transform');
      container.style.removeProperty('width');
      container.style.removeProperty('max-width');
    }
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
}

const styled = new WeakSet<HTMLElement>();

function apply() {
  if (!document.body) return;
  ensureCss();

  const all = Array.from(document.querySelectorAll('div, section, nav, article')) as HTMLElement[];
  const candidates = all.filter(isSwitcherCandidate);

  for (const container of candidates) {
    styleContainer(container);

    if (!styled.has(container)) {
      styled.add(container);
      applyFixedFallback(container);
    }
  }
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
  setTimeout(apply, 350);
  setTimeout(apply, 800);
  setTimeout(apply, 1500);
  setTimeout(apply, 3000);
  setInterval(apply, 600);
}

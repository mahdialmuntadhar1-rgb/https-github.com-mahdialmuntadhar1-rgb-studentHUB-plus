/**
 * Emergency click-unfreeze guard.
 * Fixes common production issue where invisible fixed overlays block all clicks.
 */

function isInteractive(el: Element | null): boolean {
  if (!el) return false;

  const interactiveSelector =
    'button,a,input,select,textarea,label,summary,[role="button"],[role="link"],[onclick],[tabindex]:not([tabindex="-1"])';

  return !!el.closest(interactiveSelector);
}

function isSafeToDisable(el: HTMLElement): boolean {
  if (!el) return false;

  const tag = el.tagName.toLowerCase();
  if (["html", "body", "main", "section", "article", "nav", "header", "footer"].includes(tag)) {
    return false;
  }

  if (el.id === "root") return false;
  if (isInteractive(el)) return false;

  const style = window.getComputedStyle(el);
  const rect = el.getBoundingClientRect();

  const vw = window.innerWidth || document.documentElement.clientWidth;
  const vh = window.innerHeight || document.documentElement.clientHeight;

  const coversMostScreen =
    rect.width >= vw * 0.75 &&
    rect.height >= vh * 0.75 &&
    rect.left <= vw * 0.15 &&
    rect.top <= vh * 0.15;

  const positioned =
    style.position === "fixed" ||
    style.position === "absolute" ||
    style.position === "sticky";

  const z = Number.parseInt(style.zIndex || "0", 10);
  const highLayer = Number.isFinite(z) && z >= 20;

  const invisibleOrEmpty =
    style.opacity === "0" ||
    style.visibility === "hidden" ||
    style.pointerEvents === "auto";

  const hasUsefulText = (el.textContent || "").trim().length > 20;
  const hasInteractiveChild = !!el.querySelector(
    'button,a,input,select,textarea,label,summary,[role="button"],[role="link"],[onclick],[tabindex]:not([tabindex="-1"])'
  );

  return positioned && coversMostScreen && highLayer && invisibleOrEmpty && !hasInteractiveChild && !hasUsefulText;
}

function unblockClicks() {
  if (typeof window === "undefined") return;

  document.documentElement.style.pointerEvents = "auto";
  document.body.style.pointerEvents = "auto";

  const root = document.getElementById("root");
  if (root) {
    root.style.pointerEvents = "auto";
  }

  const points: Array<[number, number]> = [
    [window.innerWidth / 2, window.innerHeight / 2],
    [window.innerWidth / 2, 80],
    [window.innerWidth / 2, window.innerHeight - 80],
    [40, window.innerHeight / 2],
    [window.innerWidth - 40, window.innerHeight / 2]
  ];

  for (const [x, y] of points) {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    if (!el) continue;

    let current: HTMLElement | null = el;

    while (current && current !== document.body && current !== document.documentElement) {
      if (isSafeToDisable(current)) {
        current.style.pointerEvents = "none";
        current.setAttribute("data-click-unblocked", "true");
        console.warn("[click-unfreeze] Disabled blocking layer:", current);
        break;
      }

      current = current.parentElement;
    }
  }
}

function installClickUnfreezeGuard() {
  if (typeof window === "undefined") return;

  const style = document.createElement("style");
  style.setAttribute("data-click-unfreeze-style", "true");
  style.textContent = `
    html, body, #root {
      pointer-events: auto !important;
      min-height: 100%;
      touch-action: manipulation;
    }

    button,
    a,
    input,
    select,
    textarea,
    label,
    summary,
    [role="button"],
    [role="link"],
    [onclick],
    [tabindex]:not([tabindex="-1"]) {
      pointer-events: auto !important;
      cursor: pointer;
    }

    [data-click-unblocked="true"] {
      pointer-events: none !important;
    }
  `;

  if (!document.querySelector("[data-click-unfreeze-style='true']")) {
    document.head.appendChild(style);
  }

  unblockClicks();

  window.addEventListener("load", unblockClicks);
  window.addEventListener("resize", unblockClicks);
  window.addEventListener("scroll", unblockClicks, { passive: true });
  document.addEventListener("click", unblockClicks, true);
  document.addEventListener("touchstart", unblockClicks, true);

  setInterval(unblockClicks, 700);
}

installClickUnfreezeGuard();

export {};

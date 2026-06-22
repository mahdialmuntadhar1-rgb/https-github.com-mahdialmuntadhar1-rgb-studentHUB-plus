/* ============================================================
   ATOMIC HARD UNFREEZE RUNTIME
   Finds invisible/fullscreen blockers, disables pointer-events,
   and re-sends the click to the real element underneath.
   ============================================================ */

(function atomicHardUnfreeze() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const interactiveSelector = [
    "button",
    "a[href]",
    "input",
    "select",
    "textarea",
    "label",
    "summary",
    "[role='button']",
    "[role='tab']",
    "[role='link']",
    "[role='menuitem']",
    "[tabindex]",
    ".cursor-pointer",
    ".clickable",
    "[data-clickable='true']"
  ].join(",");

  const safeSelector = [
    "[role='dialog']",
    ".modal",
    ".drawer",
    ".sheet",
    ".toast",
    ".toaster",
    "[data-radix-popper-content-wrapper]",
    "[data-radix-dialog-content]",
    "[data-radix-alert-dialog-content]"
  ].join(",");

  function forceRootClickable() {
    try {
      document.documentElement.style.pointerEvents = "auto";
      document.body.style.pointerEvents = "auto";
      document.body.style.touchAction = "manipulation";

      const root = document.getElementById("root");
      if (root) {
        root.style.pointerEvents = "auto";
        root.style.touchAction = "manipulation";
      }
    } catch {}
  }

  function isProbablyBlocker(el: Element): boolean {
    try {
      if (!(el instanceof HTMLElement)) return false;
      if (el.matches(interactiveSelector)) return false;
      if (el.closest(safeSelector)) return false;

      const cs = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();

      const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

      const coversMostScreen =
        rect.width >= vw * 0.75 &&
        rect.height >= vh * 0.55 &&
        rect.left <= vw * 0.15 &&
        rect.top <= vh * 0.25;

      const isLayer =
        cs.position === "fixed" ||
        cs.position === "absolute" ||
        cs.position === "sticky";

      const z = Number.parseInt(cs.zIndex || "0", 10);
      const highZ = Number.isFinite(z) ? z >= 10 : false;

      const invisibleOrDecorative =
        cs.opacity === "0" ||
        cs.visibility === "hidden" ||
        el.getAttribute("aria-hidden") === "true" ||
        /overlay|glow|blur|blob|orb|decor|particle|confetti|light|background|hero/i.test(el.className.toString());

      return isLayer && coversMostScreen && (highZ || invisibleOrDecorative);
    } catch {
      return false;
    }
  }

  function sweepBlockers() {
    forceRootClickable();

    try {
      const all = Array.from(document.body.querySelectorAll("*"));
      let fixed = 0;

      for (const el of all) {
        if (!(el instanceof HTMLElement)) continue;

        if (isProbablyBlocker(el)) {
          el.dataset.atomicBlockerFixed = "true";
          el.style.pointerEvents = "none";
          fixed++;
        }
      }

      if (fixed > 0) {
        console.warn("[ATOMIC HARD UNFREEZE] Disabled probable click blockers:", fixed);
      }
    } catch {}
  }

  function rescueClick(ev: MouseEvent | PointerEvent | TouchEvent) {
    try {
      forceRootClickable();

      let x = 0;
      let y = 0;

      if ("clientX" in ev && "clientY" in ev) {
        x = ev.clientX;
        y = ev.clientY;
      } else if ("touches" in ev && ev.touches && ev.touches.length > 0) {
        x = ev.touches[0].clientX;
        y = ev.touches[0].clientY;
      } else {
        return;
      }

      const stack = document.elementsFromPoint(x, y);
      if (!stack || stack.length === 0) return;

      const realTarget = stack.find((el) => el instanceof HTMLElement && el.matches(interactiveSelector)) as HTMLElement | undefined;
      const top = stack[0];

      if (top && top instanceof HTMLElement && isProbablyBlocker(top)) {
        top.dataset.atomicBlockerFixed = "true";
        top.style.pointerEvents = "none";
        console.warn("[ATOMIC HARD UNFREEZE] Click blocker removed:", top);

        if (realTarget && typeof realTarget.click === "function") {
          setTimeout(() => realTarget.click(), 0);
        }
      }
    } catch {}
  }

  window.addEventListener("load", sweepBlockers, true);
  window.addEventListener("resize", sweepBlockers, true);
  window.addEventListener("scroll", sweepBlockers, true);
  document.addEventListener("pointerdown", rescueClick, true);
  document.addEventListener("click", rescueClick, true);
  document.addEventListener("touchstart", rescueClick, true);

  setInterval(sweepBlockers, 1200);
  setTimeout(sweepBlockers, 250);
  setTimeout(sweepBlockers, 1000);
  setTimeout(sweepBlockers, 2500);
})();

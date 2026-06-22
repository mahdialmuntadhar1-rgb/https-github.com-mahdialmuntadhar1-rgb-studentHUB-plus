function textOf(el: Element | null): string {
  return (el?.textContent || '').replace(/\s+/g, ' ').trim();
}

function isAuthModalVisible(): boolean {
  const emailInput = document.querySelector('[role="dialog"] input[type="email"], #auth-modal input[type="email"], input[type="email"]');
  if (!emailInput) return false;

  const bodyText = textOf(document.body).toLowerCase();

  return (
    bodyText.includes('login') ||
    bodyText.includes('reset password') ||
    bodyText.includes('back to login') ||
    bodyText.includes('academic email') ||
    bodyText.includes('تسجيل الدخول') ||
    bodyText.includes('دخول')
  );
}

function hideInstallDuringAuth(): void {
  if (!isAuthModalVisible()) return;

  const candidates = Array.from(document.querySelectorAll('[id*="install" i], [class*="install" i], [aria-label*="install" i], button, a'));

  for (const raw of candidates) {
    if (!(raw instanceof HTMLElement)) continue;

    const label = `${textOf(raw)} ${raw.id || ''} ${raw.className || ''} ${raw.getAttribute('aria-label') || ''}`.toLowerCase();

    if (label.includes('install') || label.includes('دابەزاندن') || label.includes('تنصيب') || label.includes('تثبيت')) {
      raw.style.display = 'none';
      raw.style.visibility = 'hidden';
      raw.style.pointerEvents = 'none';
      raw.setAttribute('aria-hidden', 'true');
    }
  }
}

function fixAuthButtonText(): void {
  if (!isAuthModalVisible()) return;

  const buttons = Array.from(document.querySelectorAll('button'));

  for (const raw of buttons) {
    if (!(raw instanceof HTMLElement)) continue;

    const label = textOf(raw).toLowerCase();

    if (
      label.includes('login') ||
      label.includes('log in') ||
      label.includes('reset password') ||
      label.includes('sign in') ||
      label.includes('create account') ||
      label.includes('تسجيل') ||
      label.includes('دخول')
    ) {
      raw.style.color = '#ffffff';
      raw.style.opacity = '1';
      raw.style.visibility = 'visible';
      raw.style.textShadow = 'none';

      raw.querySelectorAll('*').forEach(child => {
        if (child instanceof HTMLElement || child instanceof SVGElement) {
          (child as HTMLElement).style.color = '#ffffff';
          (child as HTMLElement).style.opacity = '1';
        }
      });
    }
  }
}

function cleanAuthBrandText(): void {
  if (!isAuthModalVisible()) return;

  const nodes = Array.from(document.querySelectorAll('p, span, small, div'));

  for (const raw of nodes) {
    if (!(raw instanceof HTMLElement)) continue;

    const txt = textOf(raw);

    if (txt === 'TALABA PORTAL • طلبة' || txt === 'TALABA PORTAL') {
      raw.textContent = 'Talaba';
      raw.style.color = '#111827';
      raw.style.fontWeight = '900';
      raw.style.direction = 'ltr';
    }
  }
}

function runTalabaAuthGuard(): void {
  try {
    hideInstallDuringAuth();
    fixAuthButtonText();
    cleanAuthBrandText();
  } catch (error) {
    console.warn('[Talaba auth guard] skipped safely', error);
  }
}

if (typeof window !== 'undefined') {
  if (!(window as any).__TALABA_AUTH_GUARD_ACTIVE__) {
    (window as any).__TALABA_AUTH_GUARD_ACTIVE__ = true;

    const start = () => {
      runTalabaAuthGuard();
      setTimeout(runTalabaAuthGuard, 300);
      setTimeout(runTalabaAuthGuard, 1000);
      setTimeout(runTalabaAuthGuard, 2500);

      const observer = new MutationObserver(() => runTalabaAuthGuard());
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        characterData: true
      });

      setInterval(runTalabaAuthGuard, 1500);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start);
    } else {
      start();
    }
  }
}

export {};

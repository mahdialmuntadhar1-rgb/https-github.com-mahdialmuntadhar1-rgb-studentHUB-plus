type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installBox: HTMLDivElement | null = null;

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.startsWith('android-app://');
}

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function createInstallStyles() {
  if (document.getElementById('jamiaati-pwa-install-style')) return;

  const style = document.createElement('style');
  style.id = 'jamiaati-pwa-install-style';
  style.textContent = `
    .jamiaati-pwa-install {
      position: fixed;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 2147483000;
      pointer-events: none;
      font-family: "Noto Sans Arabic", "Segoe UI", Tahoma, Arial, sans-serif;
    }

    .jamiaati-pwa-install__card {
      pointer-events: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      min-width: 108px;
      height: 43px;
      padding: 6px 10px;
      border-radius: 13px;
      color: white;
      background:
        radial-gradient(circle at 20% 15%, rgba(255,255,255,.42), transparent 26%),
        linear-gradient(135deg, #6d28d9 0%, #2563eb 55%, #0ea5e9 100%);
      border: 1px solid rgba(255,255,255,.50);
      box-shadow:
        0 0 0 1px rgba(255,255,255,.20) inset,
        0 0 18px rgba(124,58,237,.65),
        0 0 32px rgba(14,165,233,.55),
        0 12px 30px rgba(37,99,235,.30);
      backdrop-filter: blur(14px);
      animation: jamiaatiPwaPulse 1.65s ease-in-out infinite;
      cursor: pointer;
    }

    .jamiaati-pwa-install__icon {
      width: 24px;
      height: 24px;
      min-width: 24px;
      border-radius: 8px;
      display: grid;
      place-items: center;
      background: rgba(255,255,255,.16);
      font-size: 14px;
      box-shadow: 0 0 0 1px rgba(255,255,255,.20) inset;
    }

    .jamiaati-pwa-install__title {
      font-size: 13px;
      font-weight: 1000;
      letter-spacing: 0;
      white-space: nowrap;
      line-height: 1;
    }

    .jamiaati-pwa-install__close {
      position: absolute;
      top: -9px;
      right: -9px;
      width: 22px;
      height: 22px;
      min-width: 22px;
      border: 0;
      border-radius: 999px;
      background: rgba(16, 10, 40, .74);
      color: white;
      font-size: 15px;
      line-height: 1;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,.20);
    }

    @keyframes jamiaatiPwaPulse {
      0%, 100% {
        transform: translateY(0) scale(1);
        box-shadow:
          0 0 0 1px rgba(255,255,255,.20) inset,
          0 0 14px rgba(124,58,237,.62),
          0 0 26px rgba(14,165,233,.48),
          0 12px 30px rgba(37,99,235,.28);
      }
      50% {
        transform: translateY(-2px) scale(1.025);
        box-shadow:
          0 0 0 1px rgba(255,255,255,.28) inset,
          0 0 24px rgba(124,58,237,.86),
          0 0 44px rgba(14,165,233,.72),
          0 16px 36px rgba(37,99,235,.34);
      }
    }
  `;
  document.head.appendChild(style);
}

function removeInstallButton() {
  installBox?.remove();
  installBox = null;
}

function renderInstallButton() {
  // Important: show button only when real browser install prompt is ready.
  // This avoids confusing menu/help messages.
  if (isStandalone() || isIOS() || !deferredPrompt) {
    removeInstallButton();
    return;
  }

  createInstallStyles();

  if (installBox) return;

  installBox = document.createElement('div');
  installBox.className = 'jamiaati-pwa-install';
  installBox.setAttribute('role', 'button');
  installBox.setAttribute('aria-label', 'دابەزاندنی Jamiaati');

  installBox.innerHTML = `
    <div class="jamiaati-pwa-install__card">
      <div class="jamiaati-pwa-install__icon">📲</div>
      <div class="jamiaati-pwa-install__title">دابەزاندن</div>
      <button class="jamiaati-pwa-install__close" type="button" aria-label="داخستن">×</button>
    </div>
  `;

  const card = installBox.querySelector('.jamiaati-pwa-install__card') as HTMLDivElement;
  const closeBtn = installBox.querySelector('.jamiaati-pwa-install__close') as HTMLButtonElement;

  card.addEventListener('click', async () => {
    if (!deferredPrompt) {
      removeInstallButton();
      return;
    }

    const promptEvent = deferredPrompt;
    deferredPrompt = null;

    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;

    if (choice.outcome === 'accepted') {
      removeInstallButton();
    } else {
      setTimeout(() => {
        deferredPrompt = promptEvent;
        renderInstallButton();
      }, 1800);
    }
  });

  closeBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    removeInstallButton();
    setTimeout(renderInstallButton, 1000 * 60 * 20);
  });

  document.body.appendChild(installBox);
}

export async function registerJamiaatiPwa() {
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await registration.update().catch(() => undefined);
    }
  } catch (error) {
    console.warn('Jamiaati PWA service worker registration failed:', error);
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    renderInstallButton();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    removeInstallButton();
  });

  setTimeout(renderInstallButton, 1200);
  setTimeout(renderInstallButton, 4000);
  setTimeout(renderInstallButton, 8000);
}

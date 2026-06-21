type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installBox: HTMLDivElement | null = null;

const APP_URL = 'https://talaba.kaniq.org/?source=pwa-install';

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.startsWith('android-app://');
}

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isAndroid(): boolean {
  return /android/i.test(window.navigator.userAgent);
}

function isInAppBrowser(): boolean {
  const ua = window.navigator.userAgent;
  return /FBAN|FBAV|Instagram|TikTok|Line|Twitter|Snapchat|WhatsApp|Messenger|Telegram/i.test(ua);
}

function createInstallStyles() {
  if (document.getElementById('Talaba-pwa-install-style')) return;

  const style = document.createElement('style');
  style.id = 'Talaba-pwa-install-style';
  style.textContent = `
    .Talaba-pwa-install {
      position: fixed;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 2147483000;
      pointer-events: none;
      font-family: "Noto Sans Arabic", "Segoe UI", Tahoma, Arial, sans-serif;
    }

    .Talaba-pwa-install__card {
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
      animation: TalabaPwaPulse 1.65s ease-in-out infinite;
      cursor: pointer;
    }

    .Talaba-pwa-install__icon {
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

    .Talaba-pwa-install__title {
      font-size: 13px;
      font-weight: 1000;
      letter-spacing: 0;
      white-space: nowrap;
      line-height: 1;
    }

    .Talaba-pwa-install__close {
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

    .Talaba-pwa-install__overlay {
      position: fixed;
      inset: 0;
      z-index: 2147483100;
      display: grid;
      place-items: center;
      background: rgba(16, 10, 40, .55);
      padding: 18px;
      font-family: "Noto Sans Arabic", "Segoe UI", Tahoma, Arial, sans-serif;
    }

    .Talaba-pwa-install__panel {
      width: min(390px, 100%);
      background: white;
      color: #20103f;
      border-radius: 26px;
      padding: 22px;
      box-shadow: 0 26px 90px rgba(22, 10, 70, .42);
      text-align: center;
      direction: rtl;
    }

    .Talaba-pwa-install__panel h3 {
      margin: 0 0 10px;
      font-size: 24px;
      font-weight: 1000;
    }

    .Talaba-pwa-install__panel p {
      margin: 0 0 14px;
      color: #5c5271;
      font-size: 16px;
      line-height: 1.7;
      font-weight: 850;
    }

    .Talaba-pwa-install__actions {
      display: grid;
      gap: 10px;
      margin-top: 18px;
    }

    .Talaba-pwa-install__actions button {
      border: 0;
      border-radius: 16px;
      padding: 14px 12px;
      font-weight: 1000;
      cursor: pointer;
      font-size: 16px;
      font-family: inherit;
    }

    .Talaba-pwa-install__primary {
      background: #5b2fd6;
      color: white;
    }

    .Talaba-pwa-install__secondary {
      background: #f0eafd;
      color: #4420b8;
    }

    .Talaba-pwa-install__ghost {
      background: #f6f2ff;
      color: #4b3b70;
    }

    @keyframes TalabaPwaPulse {
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

async function copyAppLink() {
  try {
    await navigator.clipboard.writeText(APP_URL);
  } catch {
    const input = document.createElement('input');
    input.value = APP_URL;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    input.remove();
  }
}

function openInChrome() {
  if (isAndroid()) {
    const clean = APP_URL.replace(/^https?:\/\//, '');
    window.location.href = `intent://${clean}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(APP_URL)};end`;
    return;
  }

  window.location.href = APP_URL;
}

function showBrowserFallback() {
  if (document.querySelector('.Talaba-pwa-install__overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'Talaba-pwa-install__overlay';

  const title = isIOS() ? 'لە Safari بکەرەوە' : 'لە Chrome بکەرەوە';
  const message = isIOS()
    ? 'بۆ Install، ئەم لینکە لە Safari بکەرەوە. پاشان ئەپەکە زیاد بکە بۆ سەرەکی مۆبایل.'
    : 'بۆ Installی ڕاستەوخۆ، ئەم لینکە لە Chrome یان Edge بکەرەوە. ئەم وێبگەڕە ئێستا Installی ڕاستەوخۆی نەکردووەتەوە.';

  overlay.innerHTML = `
    <div class="Talaba-pwa-install__panel" role="dialog" aria-modal="true">
      <h3>${title}</h3>
      <p>${message}</p>
      <div class="Talaba-pwa-install__actions">
        ${isAndroid() ? '<button class="Talaba-pwa-install__primary" type="button" data-open-chrome>کردنەوە لە Chrome</button>' : ''}
        <button class="Talaba-pwa-install__secondary" type="button" data-copy-link>کۆپی کردنی لینک</button>
        <button class="Talaba-pwa-install__ghost" type="button" data-close-guide>داخستن</button>
      </div>
    </div>
  `;

  overlay.addEventListener('click', async (event) => {
    const target = event.target as HTMLElement;

    if (target === overlay || target.hasAttribute('data-close-guide')) {
      overlay.remove();
      return;
    }

    if (target.hasAttribute('data-open-chrome')) {
      openInChrome();
      return;
    }

    if (target.hasAttribute('data-copy-link')) {
      await copyAppLink();
      target.textContent = 'لینک کۆپی کرا';
    }
  });

  document.body.appendChild(overlay);
}

function renderInstallButton() {
  if (isStandalone()) {
    removeInstallButton();
    return;
  }

  createInstallStyles();

  if (installBox) return;

  installBox = document.createElement('div');
  installBox.className = 'Talaba-pwa-install';
  installBox.setAttribute('role', 'button');
  installBox.setAttribute('aria-label', 'Installی Talaba');

  installBox.innerHTML = `
    <div class="Talaba-pwa-install__card">
      <div class="Talaba-pwa-install__icon">📲</div>
      <div class="Talaba-pwa-install__title">Install</div>
      <button class="Talaba-pwa-install__close" type="button" aria-label="داخستن">×</button>
    </div>
  `;

  const card = installBox.querySelector('.Talaba-pwa-install__card') as HTMLDivElement;
  const closeBtn = installBox.querySelector('.Talaba-pwa-install__close') as HTMLButtonElement;

  card.addEventListener('click', async () => {
    // Priority 1: real native PWA install prompt.
    if (deferredPrompt && !isIOS() && !isInAppBrowser()) {
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

      return;
    }

    // Priority 2: browser is not ready / unsupported, so guide to supported browser.
    showBrowserFallback();
  });

  closeBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    removeInstallButton();
    setTimeout(renderInstallButton, 1000 * 60 * 20);
  });

  document.body.appendChild(installBox);
}

export async function registerTalabaPwa() {
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await registration.update().catch(() => undefined);
    }
  } catch (error) {
    console.warn('Talaba PWA service worker registration failed:', error);
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

  // Keep the button visible. If native prompt is ready, it installs.
  // If not, it guides to Chrome/Safari.
  setTimeout(renderInstallButton, 900);
  setTimeout(renderInstallButton, 3000);
  setTimeout(renderInstallButton, 7000);
}



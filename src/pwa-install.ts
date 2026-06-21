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
      min-width: 118px;
      max-width: 132px;
      height: 46px;
      padding: 7px 11px;
      border-radius: 14px;
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
    }

    .jamiaati-pwa-install__icon {
      width: 27px;
      height: 27px;
      min-width: 27px;
      border-radius: 9px;
      display: grid;
      place-items: center;
      background: rgba(255,255,255,.16);
      font-size: 16px;
      box-shadow: 0 0 0 1px rgba(255,255,255,.20) inset;
    }

    .jamiaati-pwa-install__text {
      flex: initial;
      min-width: 0;
      line-height: 1;
    }

    .jamiaati-pwa-install__title {
      font-size: 14px;
      font-weight: 1000;
      letter-spacing: 0;
      white-space: nowrap;
      line-height: 1;
    }

    .jamiaati-pwa-install__subtitle {
      display: none !important;
    }

    .jamiaati-pwa-install__button {
      display: none !important;
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

    .jamiaati-pwa-install__ios {
      position: fixed;
      inset: 0;
      z-index: 2147483100;
      display: grid;
      place-items: center;
      background: rgba(16, 10, 40, .52);
      padding: 18px;
      font-family: "Noto Sans Arabic", "Segoe UI", Tahoma, Arial, sans-serif;
    }

    .jamiaati-pwa-install__ios-card {
      width: min(380px, 100%);
      background: white;
      color: #20103f;
      border-radius: 26px;
      padding: 20px;
      box-shadow: 0 26px 90px rgba(22, 10, 70, .42);
      text-align: center;
      direction: rtl;
    }

    .jamiaati-pwa-install__ios-card h3 {
      margin: 0 0 8px;
      font-size: 22px;
      font-weight: 1000;
    }

    .jamiaati-pwa-install__ios-card p {
      margin: 0 0 14px;
      color: #5c5271;
      font-size: 15px;
      line-height: 1.7;
      font-weight: 800;
    }

    .jamiaati-pwa-install__ios-card ol {
      margin: 0;
      padding-inline-start: 22px;
      text-align: right;
      font-size: 15px;
      line-height: 2;
      font-weight: 900;
    }

    .jamiaati-pwa-install__ios-actions {
      display: flex;
      gap: 10px;
      margin-top: 18px;
    }

    .jamiaati-pwa-install__ios-actions button {
      flex: 1;
      border: 0;
      border-radius: 16px;
      padding: 13px 12px;
      font-weight: 1000;
      cursor: pointer;
      font-size: 15px;
    }

    .jamiaati-pwa-install__primary {
      background: #5b2fd6;
      color: white;
    }

    .jamiaati-pwa-install__secondary {
      background: #f0eafd;
      color: #4420b8;
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

    @media (max-width: 430px) {
      .jamiaati-pwa-install {
        left: 8px;
        top: 52%;
      }

      .jamiaati-pwa-install__card {
        min-width: 108px;
        max-width: 118px;
        height: 43px;
        border-radius: 13px;
        padding: 6px 9px;
      }

      .jamiaati-pwa-install__icon {
        width: 24px;
        height: 24px;
        min-width: 24px;
        font-size: 14px;
      }

      .jamiaati-pwa-install__title {
        font-size: 13px;
      }
    }
  `;
  document.head.appendChild(style);
}

function showInstallHelp() {
  if (document.querySelector('.jamiaati-pwa-install__ios')) return;

  const overlay = document.createElement('div');
  overlay.className = 'jamiaati-pwa-install__ios';
  overlay.innerHTML = `
    <div class="jamiaati-pwa-install__ios-card" role="dialog" aria-modal="true">
      <h3>دابەزاندنی Jamiaati</h3>
      <p>ئەگەر پەنجەرەی دابەزاندن خۆکارانە دەرنەکەوت، لە مێنیوی وێبگەڕەکەت Add to Home screen / Install app هەڵبژێرە.</p>
      <ol>
        <li>مێنیو <strong>⋮</strong> بکەرەوە</li>
        <li><strong>Install app</strong> یان <strong>Add to Home screen</strong> هەڵبژێرە</li>
        <li><strong>Add</strong> بکە</li>
      </ol>
      <div class="jamiaati-pwa-install__ios-actions">
        <button class="jamiaati-pwa-install__secondary" type="button" data-close-ios>داخستن</button>
        <button class="jamiaati-pwa-install__primary" type="button" data-close-ios>تێگەیشتم</button>
      </div>
    </div>
  `;

  overlay.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target === overlay || target.hasAttribute('data-close-ios')) {
      overlay.remove();
    }
  });

  document.body.appendChild(overlay);
}

function renderInstallButton() {
  if (isStandalone()) {
    installBox?.remove();
    installBox = null;
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
      <div class="jamiaati-pwa-install__text">
        <div class="jamiaati-pwa-install__title">دابەزاندن</div>
        <div class="jamiaati-pwa-install__subtitle">Jamiaati</div>
      </div>
      <button class="jamiaati-pwa-install__button" type="button">دابەزاندن</button>
      <button class="jamiaati-pwa-install__close" type="button" aria-label="داخستن">×</button>
    </div>
  `;

  const card = installBox.querySelector('.jamiaati-pwa-install__card') as HTMLDivElement;
  const closeBtn = installBox.querySelector('.jamiaati-pwa-install__close') as HTMLButtonElement;

  card.addEventListener('click', async () => {
    if (deferredPrompt && !isIOS()) {
      const promptEvent = deferredPrompt;
      deferredPrompt = null;

      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;

      if (choice.outcome === 'accepted') {
        installBox?.remove();
        installBox = null;
      } else {
        setTimeout(renderInstallButton, 1800);
      }

      return;
    }

    showInstallHelp();
  });

  closeBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    installBox?.remove();
    installBox = null;
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
    installBox?.remove();
    installBox = null;
    deferredPrompt = null;
  });

  setTimeout(renderInstallButton, 900);
  setTimeout(renderInstallButton, 3000);
  setTimeout(renderInstallButton, 6000);
}

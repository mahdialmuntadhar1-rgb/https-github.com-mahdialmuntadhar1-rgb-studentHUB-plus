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

function shouldShowInstallButton(): boolean {
  if (isStandalone()) return false;
  return true;
}

function createInstallStyles() {
  if (document.getElementById('jamiaati-pwa-install-style')) return;

  const style = document.createElement('style');
  style.id = 'jamiaati-pwa-install-style';
  style.textContent = `
    .jamiaati-pwa-install {
      position: fixed;
      left: 14px;
      right: 14px;
      bottom: calc(86px + env(safe-area-inset-bottom));
      z-index: 2147483000;
      display: flex;
      justify-content: center;
      pointer-events: none;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
    }

    .jamiaati-pwa-install__card {
      width: min(460px, 100%);
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 24px;
      background:
        radial-gradient(circle at 15% 10%, rgba(255,255,255,.40), transparent 28%),
        linear-gradient(135deg, rgba(91,47,214,.98), rgba(21,132,214,.98));
      box-shadow: 0 18px 55px rgba(49, 25, 130, .36), 0 0 0 1px rgba(255,255,255,.22) inset;
      color: white;
      border: 1px solid rgba(255,255,255,.22);
      backdrop-filter: blur(18px);
      animation: jamiaatiPwaFloat 2.4s ease-in-out infinite;
    }

    .jamiaati-pwa-install__icon {
      width: 46px;
      height: 46px;
      min-width: 46px;
      border-radius: 16px;
      background: rgba(255,255,255,.18);
      display: grid;
      place-items: center;
      font-size: 24px;
      box-shadow: 0 0 0 1px rgba(255,255,255,.20) inset;
    }

    .jamiaati-pwa-install__text {
      flex: 1;
      min-width: 0;
      line-height: 1.18;
    }

    .jamiaati-pwa-install__title {
      font-size: 14px;
      font-weight: 1000;
      letter-spacing: .01em;
      margin-bottom: 2px;
    }

    .jamiaati-pwa-install__subtitle {
      font-size: 11px;
      font-weight: 800;
      opacity: .90;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .jamiaati-pwa-install__button {
      border: 0;
      border-radius: 999px;
      background: white;
      color: #4420b8;
      font-weight: 1000;
      padding: 11px 14px;
      font-size: 12px;
      box-shadow: 0 10px 24px rgba(0,0,0,.18);
      cursor: pointer;
      white-space: nowrap;
    }

    .jamiaati-pwa-install__close {
      border: 0;
      width: 30px;
      height: 30px;
      min-width: 30px;
      border-radius: 999px;
      background: rgba(255,255,255,.16);
      color: white;
      font-size: 18px;
      line-height: 1;
      cursor: pointer;
    }

    .jamiaati-pwa-install__ios {
      position: fixed;
      inset: 0;
      z-index: 2147483100;
      display: grid;
      place-items: end center;
      background: rgba(16, 10, 40, .52);
      padding: 18px;
      padding-bottom: calc(18px + env(safe-area-inset-bottom));
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
    }

    .jamiaati-pwa-install__ios-card {
      width: min(440px, 100%);
      background: white;
      color: #20103f;
      border-radius: 28px;
      padding: 20px;
      box-shadow: 0 26px 90px rgba(22, 10, 70, .42);
    }

    .jamiaati-pwa-install__ios-card h3 {
      margin: 0 0 8px;
      font-size: 20px;
      font-weight: 1000;
    }

    .jamiaati-pwa-install__ios-card p {
      margin: 0 0 14px;
      color: #5c5271;
      font-size: 14px;
      line-height: 1.6;
      font-weight: 700;
    }

    .jamiaati-pwa-install__ios-card ol {
      margin: 0;
      padding-inline-start: 20px;
      font-size: 14px;
      line-height: 1.9;
      font-weight: 800;
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
    }

    .jamiaati-pwa-install__primary {
      background: #5b2fd6;
      color: white;
    }

    .jamiaati-pwa-install__secondary {
      background: #f0eafd;
      color: #4420b8;
    }

    @keyframes jamiaatiPwaFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }

    @media (min-width: 760px) {
      .jamiaati-pwa-install {
        left: auto;
        right: 24px;
        bottom: 24px;
        width: 390px;
      }
    }

    @media (max-width: 390px) {
      .jamiaati-pwa-install__subtitle {
        display: none;
      }

      .jamiaati-pwa-install__button {
        padding-inline: 12px;
      }
    }
  `;
  document.head.appendChild(style);
}

function showAndroidInstallHelp() {
  if (document.querySelector('.jamiaati-pwa-install__ios')) return;

  const overlay = document.createElement('div');
  overlay.className = 'jamiaati-pwa-install__ios';
  overlay.innerHTML = `
    <div class="jamiaati-pwa-install__ios-card" role="dialog" aria-modal="true">
      <h3>Install Jamiaati</h3>
      <p>The app is ready, but your browser has not opened the automatic install popup yet.</p>
      <ol>
        <li>Tap the browser menu <strong>⋮</strong></li>
        <li>Choose <strong>Install app</strong> or <strong>Add to Home screen</strong></li>
        <li>If it does not appear, refresh once and wait 5 seconds</li>
      </ol>
      <div class="jamiaati-pwa-install__ios-actions">
        <button class="jamiaati-pwa-install__secondary" type="button" data-close-ios>Close</button>
        <button class="jamiaati-pwa-install__primary" type="button" data-close-ios>I understand</button>
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

function showIOSInstructions() {
  if (document.querySelector('.jamiaati-pwa-install__ios')) return;

  const overlay = document.createElement('div');
  overlay.className = 'jamiaati-pwa-install__ios';
  overlay.innerHTML = `
    <div class="jamiaati-pwa-install__ios-card" role="dialog" aria-modal="true">
      <h3>Install Jamiaati on iPhone</h3>
      <p>iPhone does not show an automatic install popup. Add it manually from Safari.</p>
      <ol>
        <li>Tap the Share button <strong>⬆️</strong></li>
        <li>Choose <strong>Add to Home Screen</strong></li>
        <li>Tap <strong>Add</strong></li>
      </ol>
      <div class="jamiaati-pwa-install__ios-actions">
        <button class="jamiaati-pwa-install__secondary" type="button" data-close-ios>Close</button>
        <button class="jamiaati-pwa-install__primary" type="button" data-close-ios>I understand</button>
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
  if (!shouldShowInstallButton()) {
    installBox?.remove();
    installBox = null;
    return;
  }

  createInstallStyles();

  if (installBox) return;

  installBox = document.createElement('div');
  installBox.className = 'jamiaati-pwa-install';
  installBox.setAttribute('role', 'region');
  installBox.setAttribute('aria-label', 'Install Jamiaati app');

  const installText = isIOS() ? 'How to install' : (deferredPrompt ? 'Install' : 'Guide');
  const subtitle = isIOS()
    ? 'Add to Home Screen from Safari'
    : (deferredPrompt ? 'Fast access from your home screen' : 'Tap for install steps');

  installBox.innerHTML = `
    <div class="jamiaati-pwa-install__card">
      <div class="jamiaati-pwa-install__icon">📲</div>
      <div class="jamiaati-pwa-install__text">
        <div class="jamiaati-pwa-install__title">Install Jamiaati</div>
        <div class="jamiaati-pwa-install__subtitle">${subtitle}</div>
      </div>
      <button class="jamiaati-pwa-install__button" type="button">${installText}</button>
      <button class="jamiaati-pwa-install__close" type="button" aria-label="Hide install button">×</button>
    </div>
  `;

  const installBtn = installBox.querySelector('.jamiaati-pwa-install__button') as HTMLButtonElement;
  const closeBtn = installBox.querySelector('.jamiaati-pwa-install__close') as HTMLButtonElement;

  installBtn.addEventListener('click', async () => {
    if (isIOS()) {
      showIOSInstructions();
      return;
    }

    if (!deferredPrompt) {
      alert('Install is being prepared. In Chrome/Edge, open the browser menu and choose “Install app” if the popup is not ready yet.');
      return;
    }

    const promptEvent = deferredPrompt;
    deferredPrompt = null;

    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;

    if (choice.outcome === 'accepted') {
      installBox?.remove();
      installBox = null;
    } else {
      setTimeout(renderInstallButton, 1500);
    }
  });

  closeBtn.addEventListener('click', () => {
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

  setTimeout(renderInstallButton, 1200);
  setTimeout(renderInstallButton, 5000);
}


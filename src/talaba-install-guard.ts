
declare global {
  interface Window {
    __talabaDeferredInstallPrompt?: any;
  }
}

window.addEventListener('beforeinstallprompt', (event: any) => {
  event.preventDefault();
  window.__talabaDeferredInstallPrompt = event;
  console.info('[Talaba] install prompt captured');
});

function looksInstall(text: string): boolean {
  const t = text.toLowerCase();
  return t.includes('install') || t.includes('pwa') || t.includes('Install') || t.includes('Install');
}

document.addEventListener('click', async event => {
  const target = event.target as HTMLElement | null;
  const clickable = target?.closest('button,a,[role="button"]') as HTMLElement | null;

  if (!clickable) return;

  const text = (clickable.textContent || '').trim();

  if (!looksInstall(text)) return;

  event.preventDefault();
  event.stopPropagation();

  const promptEvent = window.__talabaDeferredInstallPrompt;

  if (promptEvent) {
    try {
      await promptEvent.prompt();
      await promptEvent.userChoice.catch(() => null);
      window.__talabaDeferredInstallPrompt = null;
      return;
    } catch {}
  }

  try {
    await navigator.clipboard.writeText(window.location.origin);
  } catch {}

  alert('Install is not available in this browser yet. Open this site in Chrome/Edge, then use the browser menu and choose Install app or Add to Home screen. The link has been copied.');
}, true);

export {};

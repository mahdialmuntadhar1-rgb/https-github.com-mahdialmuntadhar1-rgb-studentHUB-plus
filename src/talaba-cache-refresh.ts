export function runTalabaCacheRefresh() {
  const key = 'talaba_cache_refresh_20260621-095057';

  try {
    const alreadyDone = localStorage.getItem(key) === 'done';
    const hasOldBrand =
      document.body.innerText.includes('JAMIAATI') ||
      document.body.innerText.includes('Jamiaati') ||
      document.body.innerText.includes('جامعتي');

    if (alreadyDone && !hasOldBrand) return;

    localStorage.setItem(key, 'done');

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations()
        .then(registrations => Promise.all(registrations.map(reg => reg.update().catch(() => undefined))))
        .catch(() => undefined);
    }

    if ('caches' in window) {
      caches.keys()
        .then(keys => Promise.all(keys.filter(k => /jamiaati|old|vite|talaba/i.test(k)).map(k => caches.delete(k))))
        .catch(() => undefined);
    }

    window.addEventListener('load', () => {
      window.setTimeout(() => {
        const stillOld =
          document.body.innerText.includes('JAMIAATI') ||
          document.body.innerText.includes('Jamiaati') ||
          document.body.innerText.includes('جامعتي');

        if (stillOld) {
          window.location.replace(window.location.pathname + window.location.search + '#talaba-refresh-' + Date.now());
        }
      }, 1200);
    });
  } catch {
    // Never block the app.
  }
}

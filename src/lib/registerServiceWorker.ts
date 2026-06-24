const SERVICE_WORKER_URL = '/service-worker.js';

const canRegisterServiceWorker = () =>
  typeof window !== 'undefined' &&
  typeof navigator !== 'undefined' &&
  'serviceWorker' in navigator &&
  (window.location.protocol === 'https:' || window.location.hostname === 'localhost');

export function registerServiceWorker() {
  if (!canRegisterServiceWorker()) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(SERVICE_WORKER_URL)
      .catch((error) => {
        console.info('[Talaba] Service worker registration skipped:', error);
      });
  });
}

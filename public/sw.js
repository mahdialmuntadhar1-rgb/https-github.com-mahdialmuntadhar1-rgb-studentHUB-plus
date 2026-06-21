const TALABA_CACHE_VERSION = 'talaba-final-20260621-095057';
const STATIC_CACHE = TALABA_CACHE_VERSION + '-static';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
      .then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'TALABA_CACHE_REFRESHED',
            version: TALABA_CACHE_VERSION
          });
        });
      })
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (
    request.mode === 'navigate' ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname === '/' ||
    url.pathname === '/index.html' ||
    url.pathname === '/manifest.webmanifest'
  ) {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then(response => response)
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

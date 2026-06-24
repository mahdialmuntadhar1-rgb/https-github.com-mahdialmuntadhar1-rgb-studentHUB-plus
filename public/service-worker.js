const CACHE_VERSION = 'talaba-cache-refresh-20260624-v4';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (
    url.href.includes('rafid-api.mahdialmuntadhar1.workers.dev') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('/api/')
  ) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }

  event.respondWith(
    fetch(request, { cache: 'no-store' }).catch(() => caches.match(request))
  );
});

const STATIC_CACHE = 'talaba-static-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png'
];

const isSameOrigin = (url) => url.origin === self.location.origin;

const isApiRequest = (url) =>
  url.pathname.startsWith('/api') ||
  url.pathname.startsWith('/auth') ||
  url.pathname.startsWith('/social') ||
  url.pathname.includes('/api/');

const isStaticAsset = (request, url) => {
  if (!isSameOrigin(url) || isApiRequest(url)) return false;
  if (['style', 'script', 'worker', 'font', 'image', 'manifest'].includes(request.destination)) return true;
  return /\.(?:js|css|png|jpg|jpeg|webp|svg|ico|woff2?|ttf|json|webmanifest)$/i.test(url.pathname);
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('talaba-') && key !== STATIC_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (!isSameOrigin(url)) return;

  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put('/', copy)).catch(() => undefined);
          }
          return response;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  if (isStaticAsset(request, url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            if (response && response.ok) {
              const copy = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined);
            }
            return response;
          })
          .catch(() => cached);

        return cached || network;
      })
    );
  }
});

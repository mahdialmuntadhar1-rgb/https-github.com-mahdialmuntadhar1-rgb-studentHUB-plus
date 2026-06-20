/*
  Jamiaati MVP service-worker kill switch.
  Purpose: remove old cached builds that caused blank screens on laptop/mobile.
  This SW unregisters itself and clears caches.
*/

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      } catch (error) {
        console.warn("Cache cleanup failed:", error);
      }

      try {
        await self.clients.claim();
      } catch (error) {
        console.warn("Client claim failed:", error);
      }

      try {
        await self.registration.unregister();
      } catch (error) {
        console.warn("Service worker unregister failed:", error);
      }
    })()
  );
});

self.addEventListener("fetch", () => {
  // No interception. Network/browser handles all requests.
});

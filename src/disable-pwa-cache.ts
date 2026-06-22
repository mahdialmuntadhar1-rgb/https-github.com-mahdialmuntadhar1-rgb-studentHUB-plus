/*
  Lightweight PWA/cache recovery.
  This does NOT scan the DOM.
  It only removes old service workers/caches when ?fresh= or ?reset=1 is used.
*/

(function () {
  try {
    var params = new URLSearchParams(window.location.search);
    var shouldReset = params.has('fresh') || params.get('reset') === '1';

    if (!shouldReset) return;

    var key = 'talaba_cache_reset_v2';
    var alreadyReset = sessionStorage.getItem(key) === '1';

    Promise.resolve()
      .then(function () {
        if ('serviceWorker' in navigator) {
          return navigator.serviceWorker.getRegistrations()
            .then(function (regs) {
              return Promise.all(regs.map(function (reg) {
                return reg.unregister().catch(function () {});
              }));
            })
            .catch(function () {});
        }
      })
      .then(function () {
        if ('caches' in window) {
          return caches.keys()
            .then(function (keys) {
              return Promise.all(keys.map(function (name) {
                return caches.delete(name).catch(function () {});
              }));
            })
            .catch(function () {});
        }
      })
      .then(function () {
        if (!alreadyReset) {
          sessionStorage.setItem(key, '1');
          var cleanUrl = window.location.origin + window.location.pathname + '?reset=done-' + Date.now();
          window.location.replace(cleanUrl);
        }
      })
      .catch(function () {});
  } catch (error) {
    console.warn('Cache recovery skipped:', error);
  }
})();

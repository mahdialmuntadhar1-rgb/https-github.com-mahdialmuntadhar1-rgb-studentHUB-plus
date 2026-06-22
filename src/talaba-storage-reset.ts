/**
 * Talaba launch safety reset.
 * Runs before React renders.
 * Removes old heavy/corrupted local browser data that can freeze the app.
 */
try {
  const badKeys = [
    'Talaba_feed_v2',
    'Talaba_feed_v2_backup',
    'Talaba_custom_feed_backup',
    'Talaba_pending_chat_recipient_id',
    'Talaba_pending_chat_recipient_name',
    'jamiaati_pending_chat_recipient_id',
    'jamiaati_pending_chat_recipient_name'
  ];

  for (const key of badKeys) {
    try { localStorage.removeItem(key); } catch {}
    try { sessionStorage.removeItem(key); } catch {}
  }

  try {
    localStorage.setItem('Talaba_storage_reset_20260622', 'done');
  } catch {}

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
      .then(registrations => {
        registrations.forEach(reg => reg.unregister().catch(() => {}));
      })
      .catch(() => {});
  }

  if ('caches' in window) {
    caches.keys()
      .then(keys => {
        keys
          .filter(key => /talaba|jamiaati|rafid|vite|workbox|https-github/i.test(key))
          .forEach(key => caches.delete(key).catch(() => {}));
      })
      .catch(() => {});
  }
} catch {}

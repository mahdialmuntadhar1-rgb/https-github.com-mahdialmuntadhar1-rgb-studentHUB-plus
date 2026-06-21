function showTalabaCrashScreen(message: string) {
  try {
    const existing = document.getElementById('talaba-crash-screen');
    if (existing) return;

    const box = document.createElement('div');
    box.id = 'talaba-crash-screen';
    box.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      background: linear-gradient(135deg, #1e1b4b, #4c1d95);
      color: white;
      font-family: Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      text-align: center;
      direction: rtl;
    `;

    box.innerHTML = `
      <div style="max-width:680px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-radius:24px;padding:24px;box-shadow:0 24px 60px rgba(0,0,0,.35)">
        <h1 style="font-size:26px;margin:0 0 12px">Talaba is loading problem detected</h1>
        <p style="font-size:17px;line-height:1.7;margin:0 0 14px">
          الصفحة لم تفتح بشكل صحيح. تم كشف خطأ بدلاً من شاشة بيضاء.
        </p>
        <p style="font-size:15px;line-height:1.7;margin:0 0 18px;opacity:.9">
          پەڕەکە بە دروستی نەکرایەوە. هەڵەکە دۆزرایەوە لە جیاتی سپی بوونی شاشە.
        </p>
        <pre style="white-space:pre-wrap;text-align:left;direction:ltr;background:rgba(0,0,0,.35);border-radius:14px;padding:12px;font-size:12px;max-height:220px;overflow:auto">${message}</pre>
        <button id="talaba-retry-btn" style="margin-top:16px;border:0;border-radius:999px;background:#fff;color:#4c1d95;font-weight:900;padding:12px 18px;cursor:pointer">
          Reload / إعادة التحميل / دووبارە کردنەوە
        </button>
      </div>
    `;

    document.body.appendChild(box);

    document.getElementById('talaba-retry-btn')?.addEventListener('click', () => {
      window.location.href = window.location.origin + '/?fresh=manual-reload-' + Date.now();
    });
  } catch {}
}

window.addEventListener('error', (event) => {
  showTalabaCrashScreen(String(event.message || event.error || 'Unknown JavaScript error'));
});

window.addEventListener('unhandledrejection', (event) => {
  showTalabaCrashScreen(String(event.reason?.message || event.reason || 'Unhandled promise rejection'));
});

async function clearTalabaCachesOnce() {
  try {
    const key = 'talaba-cache-reset-20260621-v2';

    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, 'done');

    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }

    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map((name) => caches.delete(name)));
    }

    const url = new URL(window.location.href);
    if (!url.searchParams.has('cache_reset_done')) {
      url.searchParams.set('cache_reset_done', Date.now().toString());
      window.location.replace(url.toString());
    }
  } catch {}
}

function detectEmptyRoot() {
  setTimeout(() => {
    try {
      const root = document.getElementById('root');
      const text = (root?.textContent || '').trim();

      if (root && text.length < 5 && !document.getElementById('talaba-crash-screen')) {
        showTalabaCrashScreen('React root stayed empty after loading. This usually means a JavaScript crash or stale browser/PWA cache.');
      }
    } catch {}
  }, 3500);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    clearTalabaCachesOnce();
    detectEmptyRoot();
  });
} else {
  clearTalabaCachesOnce();
  detectEmptyRoot();
}

export {};

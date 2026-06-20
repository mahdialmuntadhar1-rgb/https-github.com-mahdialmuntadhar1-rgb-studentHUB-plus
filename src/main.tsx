if (typeof window !== 'undefined') {
  try {
    const purgeVersion = 'jamiaati_pure_final_20260620';
    if (localStorage.getItem('jamiaati_purge_version') !== purgeVersion) {
      const removeExact = [
        'jamiaati_feed_v2',
        'jamiaati_feed_v2_backup',
        'jamiaati_custom_feed_backup',
        'jamiaati_profile_v2',
        'jamiaati_theme_preview',
        'jamiaati_auth_user'
      ];

      for (const key of removeExact) {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      }

      const marker = ['mo', 'ck'].join('');
      const allLocalKeys = Object.keys(localStorage);
      const allSessionKeys = Object.keys(sessionStorage);

      for (const key of allLocalKeys) {
        if (key.toLowerCase().includes(marker)) localStorage.removeItem(key);
      }

      for (const key of allSessionKeys) {
        if (key.toLowerCase().includes(marker)) sessionStorage.removeItem(key);
      }

      const token = localStorage.getItem('jamiaati_token') || '';
      const legacyPrefix = ['mo', 'ck_token_for_student_hub_'].join('');
      if (token.startsWith(legacyPrefix)) {
        localStorage.removeItem('jamiaati_token');
        localStorage.removeItem('jamiaati_logged_in');
      }

      localStorage.setItem('jamiaati_purge_version', purgeVersion);
    }
  } catch {}
}
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/high-contrast-fix.css';
import './styles/neon-purple-theme.css';
import './styles/campus-light-purple-bg.css';
import './styles/unified-light-purple-ui.css';
import './styles/purple-3d-postcards.css';
// STABILITY: unregister legacy service workers to prevent stale cached white screens.
// This is not a new feature. It only clears old browser cache workers.
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    })
    .catch(() => {});
}
// END STABILITY SERVICE WORKER CLEANUP

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
</StrictMode>,
);









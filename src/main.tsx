import { installHideBottomOpportunitiesOnly } from './utils/hideBottomOpportunitiesOnly';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/high-contrast-fix.css';
import './styles/neon-purple-theme.css';
import './styles/campus-light-purple-bg.css';
import './styles/unified-light-purple-ui.css';
import './styles/purple-3d-postcards.css';
import PWAInstallButton from './components/PWAInstallButton';


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
    <PWAInstallButton />
  </StrictMode>,
);










if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("Service worker registration failed:", error);
    });
  });
}

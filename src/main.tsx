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






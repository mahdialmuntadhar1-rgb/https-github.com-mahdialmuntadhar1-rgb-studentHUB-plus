import { StrictMode, Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import './index.css';
import './styles/high-contrast-fix.css';
import './styles/neon-purple-theme.css';
import './styles/campus-light-purple-bg.css';
import './styles/unified-light-purple-ui.css';
import './styles/purple-3d-postcards.css';
import './styles/mobile-cards-fix.css';
import './styles/talaba-final-mobile.css';
import { registerTalabaPwa } from './pwa-install';
import { startMobileUiEnhancements } from './mobile-ui-helpers';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
  details: string;
};

function showBootError(title: string, detail: string) {
  const root = document.getElementById('root');
  if (!root) return;

  root.innerHTML = `
    <div style="min-height:100vh;display:grid;place-items:center;background:#fff1f2;color:#7f1d1d;font-family:Arial,sans-serif;padding:22px;">
      <div style="max-width:680px;border:1px solid #fecdd3;background:white;border-radius:22px;padding:22px;box-shadow:0 18px 60px rgba(127,29,29,.18);">
        <div style="font-size:24px;font-weight:900;margin-bottom:10px;">${title}</div>
        <div style="font-size:15px;line-height:1.55;white-space:pre-wrap;">${detail}</div>
        <div style="margin-top:16px;font-size:13px;opacity:.75;">
          Take a screenshot and send it to ChatGPT. This screen replaces the old white blank page.
        </div>
      </div>
    </div>
  `;
}

window.addEventListener('error', (event) => {
  const message = event.error?.stack || event.message || 'Unknown JavaScript error';
  showBootError('Talaba runtime error', message);
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const message = reason instanceof Error ? reason.stack || reason.message : String(reason);
  showBootError('Talaba loading error', message);
});

class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null, details: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      error,
      details: error.stack || error.message || String(error),
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({
      error,
      details: `${error.stack || error.message || String(error)}\n\nComponent stack:\n${info.componentStack}`,
    });
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#fff1f2',
          color: '#7f1d1d',
          fontFamily: 'Arial, sans-serif',
          padding: 22,
        }}>
          <div style={{
            maxWidth: 760,
            border: '1px solid #fecdd3',
            background: 'white',
            borderRadius: 22,
            padding: 22,
            boxShadow: '0 18px 60px rgba(127,29,29,.18)',
          }}>
            <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>
              Talaba app error
            </div>
            <div style={{ fontSize: 15, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
              {this.state.details}
            </div>
            <div style={{ marginTop: 16, fontSize: 13, opacity: 0.75 }}>
              Take a screenshot and send it to ChatGPT. This replaces the old white blank screen.
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

async function removeLegacyServiceWorkersAndCaches() {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
  } catch {}

  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch {}
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  showBootError('Talaba startup error', 'Root element #root was not found in index.html.');
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </StrictMode>,
  );

  void registerTalabaPwa();
  startMobileUiEnhancements();
}






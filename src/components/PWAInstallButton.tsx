import { useEffect, useMemo, useState } from "react";
import "../styles/pwa-install-button.css";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

function isIosDevice() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent.toLowerCase();
  const platform = window.navigator.platform?.toLowerCase() || "";
  const maxTouchPoints = window.navigator.maxTouchPoints || 0;

  return (
    /iphone|ipad|ipod/.test(ua) ||
    (platform.includes("mac") && maxTouchPoints > 1)
  );
}

function isAndroidDevice() {
  if (typeof window === "undefined") return false;
  return /android/.test(window.navigator.userAgent.toLowerCase());
}

function isStandaloneMode() {
  if (typeof window === "undefined") return false;

  const displayStandalone = window.matchMedia?.("(display-mode: standalone)")?.matches;
  const displayFullscreen = window.matchMedia?.("(display-mode: fullscreen)")?.matches;
  const iosStandalone = Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

  return Boolean(displayStandalone || displayFullscreen || iosStandalone);
}

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    return sessionStorage.getItem("jamiaati_pwa_button_collapsed") === "1";
  });

  const deviceKind = useMemo(() => {
    if (isIosDevice()) return "ios";
    if (isAndroidDevice()) return "android";
    return "desktop";
  }, []);

  useEffect(() => {
    const installedFlag = localStorage.getItem("jamiaati_pwa_installed") === "1";

    if (installedFlag || isStandaloneMode()) {
      localStorage.setItem("jamiaati_pwa_installed", "1");
      setVisible(false);
      return;
    }

    setVisible(true);

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const onAppInstalled = () => {
      localStorage.setItem("jamiaati_pwa_installed", "1");
      setDeferredPrompt(null);
      setModalOpen(false);
      setVisible(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    const mediaQuery = window.matchMedia?.("(display-mode: standalone)");
    const onDisplayModeChange = () => {
      if (isStandaloneMode()) {
        localStorage.setItem("jamiaati_pwa_installed", "1");
        setVisible(false);
      }
    };

    mediaQuery?.addEventListener?.("change", onDisplayModeChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
      mediaQuery?.removeEventListener?.("change", onDisplayModeChange);
    };
  }, []);

  async function handleInstallClick() {
    if (isStandaloneMode()) {
      localStorage.setItem("jamiaati_pwa_installed", "1");
      setVisible(false);
      return;
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;

        if (choice.outcome === "accepted") {
          localStorage.setItem("jamiaati_pwa_installed", "1");
          setVisible(false);
        }

        setDeferredPrompt(null);
      } catch {
        setModalOpen(true);
      }

      return;
    }

    setModalOpen(true);
  }

  function toggleCollapsed(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    const next = !collapsed;
    setCollapsed(next);
    sessionStorage.setItem("jamiaati_pwa_button_collapsed", next ? "1" : "0");
  }

  if (!visible) return null;

  return (
    <>
      <div className={`pwa-install-floater ${collapsed ? "is-collapsed" : ""}`}>
        <button
          type="button"
          className="pwa-install-main"
          onClick={handleInstallClick}
          aria-label="Install Jamiaati app"
          title="Install Jamiaati app"
        >
          <span className="pwa-install-icon" aria-hidden="true">⬇</span>
          <span className="pwa-install-copy">
            <strong>Install App</strong>
            <small>حمّل التطبيق</small>
            <small>ئەپەکە دابەزێنە</small>
          </span>
        </button>

        <button
          type="button"
          className="pwa-install-mini"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand install button" : "Minimize install button"}
          title={collapsed ? "Show install button" : "Minimize"}
        >
          {collapsed ? "›" : "×"}
        </button>
      </div>

      {modalOpen && (
        <div className="pwa-install-modal-backdrop" role="presentation" onClick={() => setModalOpen(false)}>
          <div
            className="pwa-install-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-install-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="pwa-install-modal-close"
              onClick={() => setModalOpen(false)}
              aria-label="Close install instructions"
            >
              ×
            </button>

            <div className="pwa-install-modal-badge">Jamiaati / StudentHUB</div>

            <h2 id="pwa-install-title">Install the app</h2>
            <p className="pwa-install-subtitle">
              حمّل التطبيق على هاتفك · ئەپەکە بخەرە سەر مۆبایلەکەت
            </p>

            {deviceKind === "ios" && (
              <ol className="pwa-install-steps">
                <li>Open this website in Safari.</li>
                <li>Tap the Share button <strong>□↑</strong>.</li>
                <li>Choose <strong>Add to Home Screen</strong>.</li>
                <li>Tap <strong>Add</strong>.</li>
              </ol>
            )}

            {deviceKind === "android" && (
              <ol className="pwa-install-steps">
                <li>Open this website in Chrome or Edge.</li>
                <li>Tap the browser menu <strong>⋮</strong>.</li>
                <li>Choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
                <li>Confirm installation.</li>
              </ol>
            )}

            {deviceKind === "desktop" && (
              <ol className="pwa-install-steps">
                <li>Use Chrome, Edge, or another PWA-supporting browser.</li>
                <li>Look for the install icon in the address bar.</li>
                <li>Choose <strong>Install Jamiaati</strong>.</li>
                <li>If you do not see it, open browser menu and choose install app.</li>
              </ol>
            )}

            <div className="pwa-install-note">
              After installation, open Jamiaati from your home screen. This button will disappear automatically.
            </div>
          </div>
        </div>
      )}
    </>
  );
}

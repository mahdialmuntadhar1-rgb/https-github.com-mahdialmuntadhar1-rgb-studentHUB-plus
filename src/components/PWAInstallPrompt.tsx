import React, { useEffect, useMemo, useState } from 'react';
import { Download, ExternalLink, Share, X } from 'lucide-react';
import { Language } from '../types';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

interface PWAInstallPromptProps {
  language: Language;
}

/*
  IMPORTANT:
  Use a new dismiss key so old mobile localStorage cannot hide the prompt.
  Some users installed/uninstalled the old PWA, but Chrome may keep old site data.
*/
const DISMISS_KEY = 'talaba_pwa_install_prompt_dismissed_until_v4';
const DISMISS_DAYS = 1;

const copy = {
  en: {
    install: 'Install Talaba',
    subtitle: 'Access jobs, internships, announcements, and campus updates faster.',
    inApp: 'For best installation, open this link in Chrome or Safari.',
    guideTitle: 'Install Talaba',
    step1: 'Open this site in Chrome or Safari',
    step2: 'Tap the browser menu or Share button',
    step3: 'Choose Install app or Add to Home Screen',
    step4: 'Confirm Add / Install',
    openBrowser: 'Open in browser',
    close: 'Close'
  },
  ar: {
    install: 'تثبيت طلبة',
    subtitle: 'وصول أسرع إلى الوظائف، التدريب، الإعلانات، وأخبار الجامعة.',
    inApp: 'للتثبيت بشكل صحيح، افتح الرابط في Chrome أو Safari.',
    guideTitle: 'تثبيت طلبة',
    step1: 'افتح الموقع في Chrome أو Safari',
    step2: 'اضغط قائمة المتصفح أو زر المشاركة',
    step3: 'اختر تثبيت التطبيق أو إضافة إلى الشاشة الرئيسية',
    step4: 'اضغط إضافة / تثبيت',
    openBrowser: 'افتح في المتصفح',
    close: 'إغلاق'
  },
  ku: {
    install: 'دابەزاندنی تەلەبە',
    subtitle: 'گەیشتنی خێراتر بە کار، ڕاهێنان، ئاگاداری و نوێکاری زانکۆ.',
    inApp: 'بۆ دابەزاندنی باشتر، لینکەکە لە Chrome یان Safari بکەرەوە.',
    guideTitle: 'دابەزاندنی تەلەبە',
    step1: 'ماڵپەڕەکە لە Chrome یان Safari بکەرەوە',
    step2: 'لیستی وێبگەڕ یان دوگمەی Share دابگرە',
    step3: 'Install app یان Add to Home Screen هەڵبژێرە',
    step4: 'Add / Install پشتڕاست بکەرەوە',
    openBrowser: 'کردنەوە لە وێبگەڕ',
    close: 'داخستن'
  }
} as const;

function getDismissedUntil() {
  const value = Number(localStorage.getItem(DISMISS_KEY) || '0');
  return Number.isFinite(value) ? value : 0;
}

function isStandaloneDisplay() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIosDevice() {
  const platform = navigator.platform || '';
  const ua = navigator.userAgent || '';
  return /iPad|iPhone|iPod/.test(platform) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1) || /iPad|iPhone|iPod/.test(ua);
}

function isMobileDevice() {
  const ua = navigator.userAgent || '';
  return /Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(ua) || navigator.maxTouchPoints > 1;
}

function isInAppBrowser() {
  const ua = navigator.userAgent || '';
  return /FBAN|FBAV|Instagram|Messenger|WhatsApp|Telegram|TikTok|Bytedance|Line\//i.test(ua);
}

function openExternalBrowser() {
  const href = 'https://talaba.kaniq.org/?source=pwa-install';
  const ua = navigator.userAgent || '';

  if (/Android/i.test(ua)) {
    const clean = href.replace(/^https?:\/\//, '');
    window.location.href = `intent://${clean}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(href)};end`;
    return;
  }

  window.open(href, '_blank', 'noopener,noreferrer');
}

export default function PWAInstallPrompt({ language }: PWAInstallPromptProps) {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const text = copy[language] || copy.en;

  const environment = useMemo(() => {
    if (typeof window === 'undefined') {
      return { ios: false, inApp: false, standalone: false, mobile: false };
    }

    return {
      ios: isIosDevice(),
      inApp: isInAppBrowser(),
      standalone: isStandaloneDisplay(),
      mobile: isMobileDevice()
    };
  }, []);

  useEffect(() => {
    // Clear old dismiss keys from previous versions so the button can reappear after reinstall/uninstall tests.
    localStorage.removeItem('talaba_pwa_install_prompt_dismissed_until');
    localStorage.removeItem('talaba_pwa_install_prompt_dismissed_until_v2');
    localStorage.removeItem('talaba_pwa_install_prompt_dismissed_until_v3');

    if (getDismissedUntil() > Date.now()) {
      setDismissed(true);
      return;
    }

    setInstalled(environment.standalone);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, [environment.standalone]);

  const dismiss = () => {
    const dismissedUntil = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(DISMISS_KEY, String(dismissedUntil));
    setDismissed(true);
  };

  const handleInstallClick = async () => {
    // iOS, in-app browsers, and Android without Chrome install event all get the manual guide.
    if (environment.ios || environment.inApp || !installEvent) {
      setShowGuide(true);
      return;
    }

    await installEvent.prompt();
    const choice = await installEvent.userChoice.catch(() => null);

    if (choice?.outcome === 'accepted') {
      setInstalled(true);
      setInstallEvent(null);
    } else {
      setShowGuide(true);
    }
  };

  if (installed || dismissed) return null;

  // Main fix: show on mobile even if beforeinstallprompt never fires.
  const shouldShowInstallButton = environment.mobile || Boolean(installEvent) || environment.ios;
  const shouldShowInAppBanner = environment.inApp;

  if (!shouldShowInstallButton && !shouldShowInAppBanner) return null;

  return (
    <>
      <div
        className="fixed bottom-24 left-3 z-50 max-w-[calc(100%-24px)]"
        dir={language === 'en' ? 'ltr' : 'rtl'}
      >
        <div className="rounded-2xl border border-violet-200/80 bg-white/95 p-2 shadow-xl shadow-violet-950/15 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={environment.inApp ? openExternalBrowser : handleInstallClick}
              className="flex items-center gap-2 rounded-xl bg-violet-700 px-3 py-2 text-xs font-black text-white shadow-lg shadow-violet-900/20 transition hover:bg-violet-800"
            >
              {shouldShowInAppBanner ? <ExternalLink className="h-4 w-4" /> : <Download className="h-4 w-4" />}
              <span>{shouldShowInAppBanner ? text.openBrowser : text.install}</span>
            </button>

            {shouldShowInstallButton && environment.inApp && (
              <button
                type="button"
                onClick={() => setShowGuide(true)}
                className="rounded-xl bg-violet-50 px-2.5 py-2 text-[11px] font-black text-violet-800"
              >
                {text.install}
              </button>
            )}

            <button
              type="button"
              onClick={dismiss}
              aria-label={text.close}
              className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {showGuide && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/55 p-5 backdrop-blur-sm" dir={language === 'en' ? 'ltr' : 'rtl'}>
          <div className="w-full max-w-sm rounded-[28px] border border-violet-100 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-950">{text.guideTitle}</h2>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">{text.subtitle}</p>
              </div>

              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label={text.close}
                className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <ol className="mt-5 space-y-3">
              {[text.step1, text.step2, text.step3, text.step4].map((step, index) => (
                <li key={step} className="flex items-center gap-3 rounded-2xl bg-violet-50 p-3 text-sm font-extrabold text-slate-800">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-violet-700 text-xs text-white">
                    {index + 1}
                  </span>
                  <span className="flex-1">{step}</span>
                  {index === 1 && <Share className="h-4 w-4 text-violet-600" />}
                </li>
              ))}
            </ol>

            {environment.inApp && (
              <button
                type="button"
                onClick={openExternalBrowser}
                className="mt-5 w-full rounded-2xl bg-violet-700 px-4 py-3 text-sm font-black text-white"
              >
                {text.openBrowser}
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className={`${environment.inApp ? 'mt-2' : 'mt-5'} w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white`}
            >
              {text.close}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

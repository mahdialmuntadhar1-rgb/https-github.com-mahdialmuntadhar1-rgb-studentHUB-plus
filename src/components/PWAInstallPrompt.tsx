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

const DISMISS_KEY = 'talaba_pwa_install_prompt_dismissed_until';
const DISMISS_DAYS = 3;

const copy = {
  en: {
    install: 'Install Talaba',
    subtitle: 'Access jobs, internships, announcements, and campus updates faster.',
    inApp: 'For best installation, open this link in Chrome or Safari.',
    guideTitle: 'Install Talaba on iPhone',
    step1: 'Open in Safari',
    step2: 'Tap Share',
    step3: 'Tap Add to Home Screen',
    step4: 'Tap Add',
    close: 'Close'
  },
  ar: {
    install: 'تثبيت طلبة',
    subtitle: 'وصول أسرع إلى الوظائف، التدريب، الإعلانات، وأخبار الجامعة.',
    inApp: 'للتثبيت بشكل صحيح، افتح الرابط في Chrome أو Safari.',
    guideTitle: 'تثبيت طلبة على iPhone',
    step1: 'افتح الرابط في Safari',
    step2: 'اضغط مشاركة',
    step3: 'اختر إضافة إلى الشاشة الرئيسية',
    step4: 'اضغط إضافة',
    close: 'إغلاق'
  },
  ku: {
    install: 'دابەزاندنی تەلەبە',
    subtitle: 'گەیشتنی خێراتر بە کار، ڕاهێنان، ئاگاداری و نوێکاری زانکۆ.',
    inApp: 'بۆ دابەزاندنی باشتر، لینکەکە لە Chrome یان Safari بکەرەوە.',
    guideTitle: 'دابەزاندنی تەلەبە لەسەر iPhone',
    step1: 'لە Safari بیکەرەوە',
    step2: 'Share دابگرە',
    step3: 'Add to Home Screen هەڵبژێرە',
    step4: 'Add دابگرە',
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

function isInAppBrowser() {
  const ua = navigator.userAgent || '';
  return /FBAN|FBAV|Instagram|Messenger|WhatsApp|Telegram|TikTok|Bytedance|Line\//i.test(ua);
}

export default function PWAInstallPrompt({ language }: PWAInstallPromptProps) {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const text = copy[language] || copy.en;

  const environment = useMemo(() => {
    if (typeof window === 'undefined') {
      return { ios: false, inApp: false, standalone: false };
    }

    return {
      ios: isIosDevice(),
      inApp: isInAppBrowser(),
      standalone: isStandaloneDisplay()
    };
  }, []);

  useEffect(() => {
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
    if (environment.ios || environment.inApp) {
      setShowIosGuide(true);
      return;
    }

    if (!installEvent) return;

    await installEvent.prompt();
    const choice = await installEvent.userChoice.catch(() => null);
    if (choice?.outcome === 'accepted') {
      setInstalled(true);
      setInstallEvent(null);
    }
  };

  if (installed || dismissed) return null;

  const shouldShowInstallButton = Boolean(installEvent) || environment.ios;
  const shouldShowInAppBanner = environment.inApp;

  if (!shouldShowInstallButton && !shouldShowInAppBanner) return null;

  return (
    <>
      <div
        className="fixed left-1/2 bottom-24 z-50 w-[calc(100%-24px)] max-w-md -translate-x-1/2 px-3"
        dir={language === 'en' ? 'ltr' : 'rtl'}
      >
        <div className="rounded-3xl border border-violet-200/80 bg-white/95 p-3 shadow-2xl shadow-violet-950/15 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-700 to-fuchsia-600 text-white shadow-lg">
              {shouldShowInAppBanner ? <ExternalLink className="h-5 w-5" /> : <Download className="h-5 w-5" />}
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-sm font-black text-slate-950">
                {shouldShowInAppBanner ? text.inApp : text.install}
              </div>
              {!shouldShowInAppBanner && (
                <p className="mt-0.5 text-[11px] font-semibold leading-relaxed text-slate-500">
                  {text.subtitle}
                </p>
              )}
              {shouldShowInstallButton && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="mt-2 rounded-2xl bg-violet-700 px-4 py-2 text-xs font-black text-white shadow-lg shadow-violet-900/20 transition hover:bg-violet-800"
                >
                  {text.install}
                </button>
              )}
            </div>

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

      {showIosGuide && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/55 p-5 backdrop-blur-sm" dir={language === 'en' ? 'ltr' : 'rtl'}>
          <div className="w-full max-w-sm rounded-[28px] border border-violet-100 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-950">{text.guideTitle}</h2>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">{text.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
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

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="mt-5 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white"
            >
              {text.close}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

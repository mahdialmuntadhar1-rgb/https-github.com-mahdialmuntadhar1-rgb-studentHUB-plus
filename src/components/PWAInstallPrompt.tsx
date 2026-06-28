import React, { useEffect, useState } from 'react';
import { CheckCircle2, Download, ExternalLink, Info, X } from 'lucide-react';
import { Language } from '../types';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

interface PWAInstallPromptProps {
  language: Language;
}

function isStandaloneMode(): boolean {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

function isIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isInAppBrowser(): boolean {
  return /FBAN|FBAV|Instagram|Line|Twitter|GSA|Gmail|TikTok|Snapchat|WhatsApp/i.test(
    navigator.userAgent
  );
}

function openInChrome(): void {
  const url = window.location.href.replace(/^https?:\/\//, '');
  window.location.href = `intent://${url}#Intent;scheme=https;package=com.android.chrome;end`;
}

export default function PWAInstallPrompt({ language }: PWAInstallPromptProps) {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [closed, setClosed] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const copy = {
    en: {
      install: 'Install Talaba',
      installed: 'Installed',
      openChrome: 'Open Chrome',
      title: 'Install Talaba',
      directReady: 'Your browser can install the app directly. Tap Install and confirm.',
      directMissing: 'This browser did not show the direct install prompt. Use the steps below.',
      inAppWarning: 'If you opened this from WhatsApp, Facebook, Instagram, Gmail, or TikTok, first open it in Chrome or Safari.',
      androidTitle: 'Android / Chrome',
      androidSteps: ['Tap the button again if Chrome shows Install.', 'Or tap ⋮ menu.', 'Choose Add to Home screen or Install app.', 'Confirm Install.'],
      iosTitle: 'iPhone / Safari',
      iosSteps: ['Open this site in Safari.', 'Tap the Share button.', 'Choose Add to Home Screen.', 'Tap Add.'],
      desktopTitle: 'Desktop Chrome / Edge',
      desktopSteps: ['Look for the install icon in the address bar.', 'Or open the browser menu.', 'Choose Install app.', 'Confirm.'],
      close: 'Close',
      help: 'Help'
    },
    ar: {
      install: 'تثبيت طلبة',
      installed: 'تم التثبيت',
      openChrome: 'افتح Chrome',
      title: 'تثبيت طلبة',
      directReady: 'المتصفح يستطيع تثبيت التطبيق مباشرة. اضغط تثبيت ثم وافق.',
      directMissing: 'هذا المتصفح لم يظهر التثبيت المباشر. استخدم الخطوات أدناه.',
      inAppWarning: 'إذا فتحت الرابط من واتساب أو فيسبوك أو إنستغرام أو Gmail أو TikTok، افتحه أولاً في Chrome أو Safari.',
      androidTitle: 'أندرويد / Chrome',
      androidSteps: ['اضغط الزر مرة ثانية إذا ظهر خيار التثبيت.', 'أو اضغط قائمة ⋮.', 'اختر إضافة إلى الشاشة الرئيسية أو تثبيت التطبيق.', 'اضغط تثبيت.'],
      iosTitle: 'آيفون / Safari',
      iosSteps: ['افتح الموقع في Safari.', 'اضغط زر المشاركة.', 'اختر إضافة إلى الشاشة الرئيسية.', 'اضغط إضافة.'],
      desktopTitle: 'كمبيوتر / Chrome أو Edge',
      desktopSteps: ['ابحث عن أيقونة التثبيت في شريط الرابط.', 'أو افتح قائمة المتصفح.', 'اختر تثبيت التطبيق.', 'ثم وافق.'],
      close: 'إغلاق',
      help: 'شرح'
    },
    ku: {
      install: 'دابەزاندنی تەلەبە',
      installed: 'دامەزرا',
      openChrome: 'Chrome بکەرەوە',
      title: 'دامەزراندنی تەلەبە',
      directReady: 'وێبگەڕەکەت دەتوانێت ڕاستەوخۆ ئەپەکە دابمەزرێنێت. دابەزاندن دابگرە و پەسەندی بکە.',
      directMissing: 'ئەم وێبگەڕە دامەزراندنی ڕاستەوخۆی پیشان نەدا. ئەم هەنگاوانە بەکاربهێنە.',
      inAppWarning: 'ئەگەر لینکەکەت لە WhatsApp، Facebook، Instagram، Gmail یان TikTok کردووەتەوە، سەرەتا لە Chrome یان Safari بیکەرەوە.',
      androidTitle: 'ئەندرۆید / Chrome',
      androidSteps: ['ئەگەر Chrome هەڵبژاردەی Install پیشاندا، دوگمەکە جارێکی تر دابگرە.', 'یان لیستی ⋮ دابگرە.', 'Add to Home screen یان Install app هەڵبژێرە.', 'Install پەسەند بکە.'],
      iosTitle: 'ئایفۆن / Safari',
      iosSteps: ['ماڵپەڕەکە لە Safari بکەرەوە.', 'دوگمەی Share دابگرە.', 'Add to Home Screen هەڵبژێرە.', 'Add دابگرە.'],
      desktopTitle: 'کۆمپیوتەر / Chrome یان Edge',
      desktopSteps: ['ئایکۆنی دامەزراندن لە شریتی ناونیشان بگەڕێ.', 'یان لیستی وێبگەڕ بکەرەوە.', 'Install app هەڵبژێرە.', 'پەسەند بکە.'],
      close: 'داخستن',
      help: 'ڕێنمایی'
    }
  }[language];

  const isRtl = language === 'ar' || language === 'ku';

  useEffect(() => {
    setInstalled(isStandaloneMode());

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
      setShowGuide(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (isStandaloneMode()) {
      setInstalled(true);
      setShowGuide(false);
      return;
    }

    if (installEvent) {
      await installEvent.prompt();
      const choice = await installEvent.userChoice.catch(() => null);
      setInstallEvent(null);
      if (choice?.outcome === 'accepted') {
        setInstalled(true);
        setShowGuide(false);
      } else {
        setShowGuide(true);
      }
      return;
    }

    if (isAndroid() && isInAppBrowser()) {
      openInChrome();
      window.setTimeout(() => setShowGuide(true), 1200);
      return;
    }

    setShowGuide(true);
  };

  if (installed || closed) return null;

  const canInstallNow = Boolean(installEvent);
  const canOpenChrome = isAndroid() && isInAppBrowser() && !canInstallNow;
  const buttonText = canOpenChrome ? copy.openChrome : copy.install;

  return (
    <>
      <button
        type="button"
        onClick={handleInstall}
        id="talaba-pwa-install-visible"
        className="fixed left-0 top-1/2 z-[9999] -translate-y-1/2 rounded-r-2xl border border-purple-400/70 border-l-0 bg-[#111116]/95 px-2.5 py-2 text-white shadow-2xl backdrop-blur-xl transition active:scale-95 md:left-2 md:rounded-2xl md:border-l"
        aria-label={buttonText}
        aria-expanded={showGuide}
        title={buttonText}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <span className="flex min-w-[76px] items-center justify-center gap-1.5 text-[11px] font-black leading-tight">
          {canOpenChrome ? <ExternalLink className="h-4 w-4 shrink-0" /> : <Download className="h-4 w-4 shrink-0" />}
          <span className="whitespace-nowrap">{buttonText}</span>
        </span>
      </button>

      <button
        type="button"
        onClick={() => setShowGuide((value) => !value)}
        className="fixed left-0 top-[calc(50%+44px)] z-[9999] rounded-r-xl border border-purple-400/50 border-l-0 bg-black/85 px-2 py-1.5 text-white shadow-md backdrop-blur md:left-2 md:rounded-xl md:border-l"
        aria-label={copy.help}
        title={copy.help}
      >
        <Info className="h-4 w-4" />
      </button>

      {showGuide && (
        <aside
          className="fixed left-2 top-[calc(50%+82px)] z-[9999] max-h-[calc(100vh-120px)] w-[min(88vw,350px)] overflow-y-auto rounded-2xl border border-purple-400/35 bg-[#101014]/95 p-4 text-white shadow-2xl backdrop-blur-xl md:left-4"
          dir={isRtl ? 'rtl' : 'ltr'}
          role="dialog"
          aria-label={copy.title}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-amber-300">{copy.title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-zinc-300">
                {canInstallNow ? copy.directReady : copy.directMissing}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="rounded-full bg-white/10 p-1.5 text-zinc-300 hover:bg-white/20 hover:text-white"
              aria-label={copy.close}
              title={copy.close}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {isInAppBrowser() && (
            <div className="mb-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs font-bold leading-relaxed text-amber-100">
              {copy.inAppWarning}
            </div>
          )}

          <div className="space-y-3 text-xs leading-relaxed text-zinc-200">
            <section>
              <h3 className="mb-1 flex items-center gap-1.5 font-black text-white">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                {copy.androidTitle}
              </h3>
              <ol className="list-decimal space-y-0.5 ps-5">
                {copy.androidSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>

            <section>
              <h3 className="mb-1 flex items-center gap-1.5 font-black text-white">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                {copy.iosTitle}
              </h3>
              <ol className="list-decimal space-y-0.5 ps-5">
                {copy.iosSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>

            <section className="hidden sm:block">
              <h3 className="mb-1 flex items-center gap-1.5 font-black text-white">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                {copy.desktopTitle}
              </h3>
              <ol className="list-decimal space-y-0.5 ps-5">
                {copy.desktopSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>
          </div>
        </aside>
      )}
    </>
  );
}

import { useEffect, useState } from 'react';
import './PWAInstallButton.css';

type LangKey = 'en' | 'ar' | 'ku';

type TextSet = {
  label: string;
  title: string;
  iosTitle: string;
  iosBody: string;
  genericTitle: string;
  genericBody: string;
  close: string;
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const TEXT: Record<LangKey, TextSet> = {
  en: {
    label: 'Download App',
    title: 'Download App',
    iosTitle: 'Install this app',
    iosBody: 'On iPhone or iPad, open this site in Safari, tap Share, then choose Add to Home Screen.',
    genericTitle: 'Install this app',
    genericBody: 'Open this site in Chrome or Edge, then choose Install app from the browser menu.',
    close: 'Got it',
  },
  ar: {
    label: 'تحميل التطبيق',
    title: 'تحميل التطبيق',
    iosTitle: 'تثبيت التطبيق',
    iosBody: 'على iPhone أو iPad افتح الموقع في Safari، اضغط مشاركة، ثم اختر إضافة إلى الشاشة الرئيسية.',
    genericTitle: 'تثبيت التطبيق',
    genericBody: 'افتح الموقع في Chrome أو Edge، ثم اختر تثبيت التطبيق من قائمة المتصفح.',
    close: 'حسنًا',
  },
  ku: {
    label: 'داگرتنی ئەپ',
    title: 'داگرتنی ئەپ',
    iosTitle: 'دابەزاندنی ئەپ',
    iosBody: 'لە iPhone یان iPad ئەم ماڵپەڕە بە Safari بکەرەوە، کرتە لە Share بکە، پاشان Add to Home Screen هەڵبژێرە.',
    genericTitle: 'دابەزاندنی ئەپ',
    genericBody: 'ئەم ماڵپەڕە بە Chrome یان Edge بکەرەوە، پاشان لە لیستی وێبگەڕەکە Install app هەڵبژێرە.',
    close: 'باشە',
  },
};

function getCurrentLang(): LangKey {
  const values = [
    document.documentElement.lang,
    localStorage.getItem('language'),
    localStorage.getItem('lang'),
    localStorage.getItem('selectedLanguage'),
    localStorage.getItem('appLanguage'),
    localStorage.getItem('i18nextLng'),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (values.includes('ar') || values.includes('arabic') || values.includes('عربي')) return 'ar';

  if (
    values.includes('ku') ||
    values.includes('ckb') ||
    values.includes('sorani') ||
    values.includes('kurdish') ||
    values.includes('کورد') ||
    values.includes('كورد')
  ) {
    return 'ku';
  }

  return 'en';
}

function isStandaloneApp(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    Boolean((window.navigator as any).standalone)
  );
}

function isIOSDevice(): boolean {
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export default function PWAInstallButton() {
  const [lang, setLang] = useState<LangKey>(() => getCurrentLang());
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState<boolean>(() => isStandaloneApp());
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const updateLang = () => setLang(getCurrentLang());

    const observer = new MutationObserver(updateLang);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

    window.addEventListener('storage', updateLang);

    const interval = window.setInterval(updateLang, 1000);

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', updateLang);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setInstalled(false);
    };

    const onAppInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setShowHelp(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;

      if (choice.outcome === 'accepted') {
        setInstalled(true);
      }

      setInstallPrompt(null);
      return;
    }

    setShowHelp(true);
  };

  if (installed) return null;

  const copy = TEXT[lang];
  const dir = lang === 'en' ? 'ltr' : 'rtl';
  const helpTitle = isIOSDevice() ? copy.iosTitle : copy.genericTitle;
  const helpBody = isIOSDevice() ? copy.iosBody : copy.genericBody;

  return (
    <>
      <button
        type="button"
        className="pwa-install-button"
        onClick={handleInstallClick}
        aria-label={copy.title}
        title={copy.title}
        dir={dir}
      >
        <span className="pwa-install-dot" />
        <span className="pwa-install-label">{copy.label}</span>
      </button>

      {showHelp && (
        <div className="pwa-install-backdrop" role="presentation" onClick={() => setShowHelp(false)}>
          <div
            className="pwa-install-card"
            role="dialog"
            aria-modal="true"
            aria-label={helpTitle}
            dir={dir}
            onClick={(event) => event.stopPropagation()}
          >
            <h3>{helpTitle}</h3>
            <p>{helpBody}</p>
            <button type="button" onClick={() => setShowHelp(false)}>
              {copy.close}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Language } from '../types';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

interface PWAInstallPromptProps {
  language: Language;
}

export default function PWAInstallPrompt({ language }: PWAInstallPromptProps) {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [closed, setClosed] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const text = {
    en: {
      install: 'Install Talaba',
      guide: 'Open browser menu ⋮ then choose Install app or Add to Home Screen.',
      close: 'Close'
    },
    ar: {
      install: 'تثبيت طلبة',
      guide: 'افتح قائمة المتصفح ⋮ ثم اختر تثبيت التطبيق أو إضافة إلى الشاشة الرئيسية.',
      close: 'إغلاق'
    },
    ku: {
      install: 'دابەزاندنی تەلەبە',
      guide: 'لیستی وێبگەڕ ⋮ بکەرەوە، پاشان Install app یان Add to Home Screen هەڵبژێرە.',
      close: 'داخستن'
    }
  }[language];

  useEffect(() => {
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setInstalled(Boolean(standalone));

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
  }, []);

  const handleInstall = async () => {
    if (installEvent) {
      await installEvent.prompt();
      await installEvent.userChoice.catch(() => null);
      setInstallEvent(null);
      return;
    }

    setShowGuide(true);
  };

  if (installed || closed) return null;

  return (
    <div
      id="talaba-pwa-install-visible"
      className="fixed left-1/2 bottom-20 z-[9999] w-[92%] max-w-md -translate-x-1/2 rounded-2xl border border-orange-300 bg-white shadow-2xl"
      dir={language === 'ar' || language === 'ku' ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-2 p-2">
        <button
          type="button"
          onClick={handleInstall}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6B25C9] to-[#F59E0B] px-4 py-3 text-sm font-black text-white shadow-lg"
        >
          <Download className="h-4 w-4" />
          <span>{text.install}</span>
        </button>

        <button
          type="button"
          onClick={() => setClosed(true)}
          aria-label={text.close}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {showGuide && (
        <div className="border-t border-orange-100 px-4 pb-3 pt-2 text-center text-xs font-bold leading-relaxed text-slate-700">
          {text.guide}
        </div>
      )}
    </div>
  );
}

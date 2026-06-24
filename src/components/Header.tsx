import React, { useState } from 'react';
import { Governorate, University, Language } from '../types';
import { IraqiGovernorates, IraqiUniversities } from '../data/mockData';
import { MapPin, School, Bell, Languages, Check, BookOpen, Palette, MessageSquare, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getTranslation } from '../data/translations';
import { brandingThemes } from '../data/themes';

interface HeaderProps {
  selectedGov: string;
  setSelectedGov: (id: string) => void;
  selectedUni: string;
  setSelectedUni: (id: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currentUserAvatar: string;
  onProfileClick: () => void;
  onLoginClick?: () => void;
  isLoggedIn?: boolean;
  onChatsClick?: () => void;
  selectedTheme: string;
  setSelectedTheme: (themeId: string) => void;
  incomingFriendRequestsCount?: number;
  incomingMessageRequestsCount?: number;
}

export default function Header({
  language,
  setLanguage,
  currentUserAvatar,
  onProfileClick,
  onLoginClick,
  isLoggedIn = false,
  onChatsClick,
  incomingFriendRequestsCount = 0,
  incomingMessageRequestsCount = 0
}: Omit<HeaderProps, 'selectedGov' | 'setSelectedGov' | 'selectedUni' | 'setSelectedUni' | 'selectedTheme' | 'setSelectedTheme'> & Partial<HeaderProps>) {
  const [showNotificationCount, setShowNotificationCount] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Ahmad replied to your syllabus question.", time: "10m ago" },
    { id: 2, text: "New Internships listed: Zain Iraq Software Dev.", time: "1h ago" },
    { id: 3, text: "Salahaddin University updated final exam calendar.", time: "3h ago" }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const getLanguageMeta = (lang: Language) => {
    if (lang === 'ar') return { flag: '🇮🇶', label: 'العربية' };
    if (lang === 'ku') return { flag: '☀️', label: 'کوردی' };
    return { flag: '🇺🇸', label: 'English' };
  };

  return (
    <header
      className="relative z-40 bg-white border-b border-[#E6E1F5] px-3.5 py-2 shadow-sm"
      id="app-header-container"
      dir={language === 'en' ? 'ltr' : 'rtl'}
    >
      <div className="mx-auto flex max-w-lg flex-col gap-2">
        <div className="flex items-center justify-between gap-3" id="header-top-row">
          <div className="flex min-w-0 items-center gap-2" id="header-brand-logo">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-orange-500 text-white shadow-sm">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[17px] font-black leading-none tracking-tight text-orange-600">Talaba</span>
                <span className="text-[10px] font-bold leading-none text-slate-300">|</span>
                <h1 className="truncate text-[13px] font-black leading-none tracking-tight text-[#1E293B]" id="header-app-name-ar">طلبة</h1>
              </div>
              <p className="mt-1 truncate text-[9px] font-semibold leading-tight text-slate-500">
                {language === 'ar'
                  ? 'حياة الجامعة والفرص في مكان واحد'
                  : language === 'ku'
                  ? 'ژیانی زانکۆ و هەلەکان لە یەک شوێندا'
                  : 'University life and opportunities in one place'}
              </p>
            </div>
          </div>

          {isLoggedIn ? (
            <button
              id="profile-avatar-trigger"
              onClick={onProfileClick}
              className="h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-orange-500/40 bg-white shadow-sm transition-all hover:scale-105 active:scale-95"
              title="Profile"
            >
              <img src={currentUserAvatar} alt="Profile" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            </button>
          ) : (
            <button
              id="header-login-trigger"
              onClick={onLoginClick || onProfileClick}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-orange-50 px-3 py-2 text-[12px] font-black text-slate-800 shadow-sm transition-all hover:bg-orange-100 hover:text-orange-700"
              title="Login"
            >
              <LogIn className="h-4 w-4" />
              <span>{language === 'ar' ? 'دخول' : language === 'ku' ? 'چوونەژوورەوە' : 'Login'}</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 border-t border-slate-100 pt-1.5" id="inline-language-bar">
          {(['ar', 'ku', 'en'] as Language[]).map(lang => {
            const meta = getLanguageMeta(lang);
            const active = language === lang;

            return (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`flex min-w-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-black transition-all ${
                  active
                    ? 'border-violet-300 bg-violet-700 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:bg-violet-50'
                }`}
                title={meta.label}
                aria-label={`Switch language to ${meta.label}`}
              >
                <span className="text-sm leading-none">{meta.flag}</span>
                <span className="whitespace-nowrap">{meta.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}





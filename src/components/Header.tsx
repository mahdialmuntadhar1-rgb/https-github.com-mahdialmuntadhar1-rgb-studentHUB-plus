import React from 'react';
import { BookOpen, LogIn, User } from 'lucide-react';
import { Language } from '../types';

interface HeaderProps {
  selectedGov?: string;
  setSelectedGov?: (id: string) => void;
  selectedUni?: string;
  setSelectedUni?: (id: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currentUserAvatar?: string;
  onProfileClick: () => void;
  onLoginClick?: () => void;
  isLoggedIn?: boolean;
  onChatsClick?: () => void;
  selectedTheme?: string;
  setSelectedTheme?: (themeId: string) => void;
  incomingFriendRequestsCount?: number;
  incomingMessageRequestsCount?: number;
}

function KurdistanFlag() {
  return (
    <span
      aria-label="Kurdistan flag"
      title="Kurdistan"
      className="relative inline-flex h-4 w-6 overflow-hidden rounded-[4px] border border-slate-200 shadow-sm shrink-0"
    >
      <span className="absolute inset-x-0 top-0 h-1/3 bg-red-600" />
      <span className="absolute inset-x-0 top-1/3 h-1/3 bg-white" />
      <span className="absolute inset-x-0 bottom-0 h-1/3 bg-green-600" />
      <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-400 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]" />
    </span>
  );
}

export default function Header({
  language,
  setLanguage,
  onProfileClick,
  onLoginClick,
  isLoggedIn = false,
}: HeaderProps) {
  const loginLabel =
    language === 'ar'
      ? 'تسجيل الدخول'
      : language === 'ku'
        ? 'چوونەژوورەوە'
        : 'Login';

  const profileLabel =
    language === 'ar'
      ? 'الملف'
      : language === 'ku'
        ? 'پڕۆفایل'
        : 'Profile';

  const languageOptions: Array<{
    id: Language;
    label: string;
    flag: React.ReactNode;
  }> = [
    { id: 'ar' as Language, label: 'العربية', flag: <span className="text-base leading-none">🇮🇶</span> },
    { id: 'ku' as Language, label: 'کوردی', flag: <KurdistanFlag /> },
    { id: 'en' as Language, label: 'English', flag: <span className="text-base leading-none">🇺🇸</span> },
  ];

  return (
    <header
      id="app-header-container"
      className="sticky top-0 z-50 border-b border-orange-200/70 bg-white/96 px-3 py-2 shadow-[0_10px_30px_rgba(88,28,135,0.10)] backdrop-blur-xl"
      dir={language === 'en' ? 'ltr' : 'rtl'}
      lang={language}
    >
      <div className="mx-auto flex w-full max-w-lg flex-col gap-2">

        {/* Row 1: Brand + Login/Profile only */}
        <div
          id="header-top-row"
          className="flex w-full items-center justify-between gap-3 rounded-[22px] border border-orange-200/80 bg-gradient-to-r from-white via-purple-50/70 to-orange-50/70 px-3 py-2 shadow-sm"
        >
          <div id="header-brand-logo" className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-200">
              <BookOpen className="h-5 w-5 text-white" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-[20px] font-black tracking-tight text-purple-700">
                  Talaba
                </span>
                <span className="text-[13px] font-black text-slate-400">|</span>
                <span className="text-[16px] font-black text-slate-900">
                  طلبة
                </span>
              </div>
            </div>
          </div>

          {isLoggedIn ? (
            <button
              id="profile-avatar-trigger"
              type="button"
              onClick={onProfileClick}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-[13px] font-black text-white shadow-lg shadow-slate-300 transition active:scale-[0.98]"
              title={profileLabel}
              aria-label={profileLabel}
            >
              <User className="h-4 w-4" />
              <span>{profileLabel}</span>
            </button>
          ) : (
            <button
              id="header-login-trigger"
              type="button"
              onClick={onLoginClick || onProfileClick}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-purple-700 px-4 py-2.5 text-[13px] font-black text-white shadow-lg shadow-orange-200 transition active:scale-[0.98]"
              title={loginLabel}
              aria-label={loginLabel}
            >
              <LogIn className="h-4 w-4" />
              <span>{loginLabel}</span>
            </button>
          )}
        </div>

        {/* Row 2: clean full language names */}
        <div
          id="header-language-row"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-purple-100 bg-white/90 px-2 py-1.5 shadow-sm"
        >
          {languageOptions.map((item) => {
            const active = language === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setLanguage(item.id)}
                aria-pressed={active}
                className={`inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-[12px] font-black transition active:scale-[0.98] ${
                  active
                    ? 'bg-yellow-300 text-slate-950 shadow-md shadow-yellow-100 ring-1 ring-orange-300'
                    : 'bg-slate-50 text-slate-800 ring-1 ring-slate-200 hover:bg-purple-50'
                }`}
              >
                {item.flag}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}

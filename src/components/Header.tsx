import React, { useEffect, useState } from 'react';
import { Language } from '../types';
import { Bell, BookOpen, LogIn, MessageSquare, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getTranslation } from '../data/translations';
import AuthModal from './AuthModal';

interface HeaderProps {
  selectedGov?: string;
  setSelectedGov?: (id: string) => void;
  selectedUni?: string;
  setSelectedUni?: (id: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currentUserAvatar: string;
  onProfileClick: () => void;
  onChatsClick?: () => void;
  selectedTheme?: string;
  setSelectedTheme?: (themeId: string) => void;
  incomingFriendRequestsCount?: number;
  incomingMessageRequestsCount?: number;
}

const hasStoredSession = () => {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('jamiaati_token') || localStorage.getItem('admin_token');
  const notLoggedOut = localStorage.getItem('jamiaati_logged_in') !== 'false';
  return Boolean(token) && notLoggedOut;
};

export default function Header({
  language,
  setLanguage,
  currentUserAvatar,
  onProfileClick,
  onChatsClick,
  incomingFriendRequestsCount = 0,
  incomingMessageRequestsCount = 0,
}: HeaderProps) {
  const [showNotificationCount, setShowNotificationCount] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => hasStoredSession());

  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Ahmad replied to your syllabus question.', time: '10m ago' },
    { id: 2, text: 'New Internships listed: Zain Iraq Software Dev.', time: '1h ago' },
    { id: 3, text: 'Salahaddin University updated final exam calendar.', time: '3h ago' },
  ]);

  useEffect(() => {
    const syncAuthState = () => setIsAuthenticated(hasStoredSession());
    window.addEventListener('storage', syncAuthState);
    window.addEventListener('focus', syncAuthState);
    window.addEventListener('jamiaati_auth_success', syncAuthState as EventListener);
    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener('focus', syncAuthState);
      window.removeEventListener('jamiaati_auth_success', syncAuthState as EventListener);
    };
  }, []);

  const getLanguageMeta = (lang: Language) => {
    if (lang === 'ar') return { flag: '🇮🇶', label: 'العربية' };
    if (lang === 'ku') return { flag: '☀️', label: 'کوردی' };
    return { flag: '🇺🇸', label: 'English' };
  };

  const loginLabel = language === 'ar' ? 'دخول' : language === 'ku' ? 'چوونەژوورەوە' : 'Login';

  const brandSubline =
    language === 'ar'
      ? 'حياة الجامعة والفرص في مكان واحد'
      : language === 'ku'
        ? 'ژیانی زانکۆ و هەلەکان لە یەک شوێندا'
        : 'University life and opportunities in one place';

  const handleAuthSuccess = (username: string, email: string) => {
    localStorage.setItem('jamiaati_logged_in', 'true');
    localStorage.setItem('jamiaati_user_email', email);
    setIsAuthenticated(true);
    setShowAuthModal(false);
    window.dispatchEvent(new Event('jamiaati_auth_success'));
    window.setTimeout(() => window.location.reload(), 120);
  };

  return (
    <>
      <header className="relative z-40 bg-white border-b border-[#E6E1F5] px-3 py-2 shadow-sm" id="app-header-container">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between gap-2" id="header-top-row">
            <div className="flex items-center gap-2 min-w-0" id="header-brand-logo">
              <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                <BookOpen className="w-5 h-5 text-white" />
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[16px] text-orange-600 font-black tracking-tight leading-none">Talaba</span>
                  <span className="text-[11px] text-slate-300 font-bold leading-none">|</span>
                  <h1 className="text-[14px] font-black tracking-tight leading-none text-[#1E293B]">
                    طلبة
                  </h1>
                </div>
                <p className="text-[10px] text-slate-500 font-semibold leading-tight mt-1 truncate max-w-[210px]">
                  {brandSubline}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0" id="header-actions">
              <div className="relative">
                <button
                  id="notif-bell"
                  type="button"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowNotificationCount(false);
                  }}
                  className="h-9 w-9 flex items-center justify-center text-slate-700 hover:text-orange-600 hover:bg-[#F3F7FF] rounded-xl transition-colors cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {showNotificationCount && (
                    <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-[#D9272E] rounded-full animate-ping" />
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-2xl border-2 border-[#161A33] p-2 text-xs text-slate-900 z-50 pointer-events-auto"
                    >
                      <div className="flex justify-between items-center px-1.5 py-0.5 border-b border-[#E6E1F5] font-bold text-[#161A33] mb-1">
                        <span>{getTranslation('notificationsTitle', language)}</span>
                        <button type="button" onClick={() => setNotifications([])} className="text-[9px] text-slate-500 hover:text-[#D9272E] cursor-pointer font-bold">
                          {getTranslation('clearAllBtn', language)}
                        </button>
                      </div>

                      {notifications.length === 0 ? (
                        <div className="p-3 text-center text-slate-500 font-bold text-[10px] leading-relaxed">
                          {getTranslation('notificationEmpty', language)}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                          {notifications.map(n => (
                            <div key={n.id} className="p-1.5 hover:bg-orange-50 rounded-lg transition-all border-l-2 border-orange-500">
                              <p className="font-semibold text-[10px] leading-tight text-[#161A33]">{n.text}</p>
                              <span className="text-[8px] text-slate-500 mt-0.5 block">{n.time}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {onChatsClick && (
                <button
                  type="button"
                  onClick={onChatsClick}
                  className="h-9 w-9 flex items-center justify-center text-slate-700 hover:text-orange-600 hover:bg-[#F3F7FF] rounded-xl transition-colors cursor-pointer relative"
                  title="Inbox & Chats"
                  id="header-chats-trigger"
                >
                  <MessageSquare className="w-4 h-4" />
                  {(incomingFriendRequestsCount + incomingMessageRequestsCount) > 0 ? (
                    <span className="absolute -top-1 -right-1 bg-cyan-500 text-slate-900 text-[8px] font-black h-3.5 px-1 rounded-full flex items-center justify-center min-w-3.5 shadow-sm border border-white shrink-0">
                      {incomingFriendRequestsCount + incomingMessageRequestsCount}
                    </span>
                  ) : (
                    <span className="absolute top-0.5 right-1 w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  )}
                </button>
              )}

              {isAuthenticated ? (
                <button
                  id="profile-avatar-trigger"
                  type="button"
                  onClick={onProfileClick}
                  className="w-9 h-9 rounded-xl border border-orange-500/40 overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer shrink-0 bg-slate-100 flex items-center justify-center"
                  aria-label="Open profile"
                >
                  {currentUserAvatar ? (
                    <img src={currentUserAvatar} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-4 h-4 text-slate-700" />
                  )}
                </button>
              ) : (
                <button
                  id="header-login-button"
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  className="h-9 px-3 rounded-xl bg-slate-900 text-white border border-slate-900 hover:bg-orange-600 hover:border-orange-600 transition-colors font-black text-[12px] flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
                  aria-label={loginLabel}
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loginLabel}</span>
                </button>
              )}
            </div>
          </div>

          <div
            id="language-row-under-header"
            className="mt-2 rounded-2xl bg-gradient-to-r from-[#6B25C9] via-[#7C3AED] to-[#F59E0B] p-1.5 shadow-md"
          >
            <div className="grid grid-cols-3 gap-1.5">
              {(['ar', 'ku', 'en'] as Language[]).map(lang => {
                const meta = getLanguageMeta(lang);
                const active = language === lang;

                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    className={`min-h-10 rounded-xl px-2 py-2 text-[12px] font-black cursor-pointer transition-all duration-150 flex items-center justify-center gap-1.5 ${
                      active
                        ? 'bg-white text-[#5B21B6] shadow-[0_0_16px_rgba(255,210,31,0.85)] ring-2 ring-[#FFD21F]'
                        : 'bg-white/15 text-white hover:bg-white/25'
                    }`}
                    title={meta.label}
                    aria-label={`Switch language to ${meta.label}`}
                  >
                    <span className="text-base leading-none">{meta.flag}</span>
                    <span className="leading-none whitespace-nowrap">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        language={language}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
}

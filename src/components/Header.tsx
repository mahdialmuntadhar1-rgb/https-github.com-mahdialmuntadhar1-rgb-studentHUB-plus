import React, { useState } from 'react';
import { Governorate, University, Language } from '../types';
import { IraqiGovernorates, IraqiUniversities } from '../data/mockData';
import { MapPin, School, Bell, Languages, Check, BookOpen, Palette, MessageSquare } from 'lucide-react';
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

  const getLanguageLabel = (lang: Language) => {
    if (lang === 'en') return 'EN';
    if (lang === 'ar') return 'عربي';
    return 'کوردی';
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E6E1F5] px-3.5 py-2 shadow-sm" id="app-header-container">
      {/* Top row: Brand & Language Bar & Notif & Profile */}
      <div className="flex items-center justify-between gap-1.5 max-w-lg mx-auto" id="header-top-row">
        
        {/* Brand Logo and Title */}
        <div className="flex items-center gap-1.5" id="header-brand-logo">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] flex items-center justify-center text-white font-bold shadow-sm shrink-0">
            <BookOpen className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <h1 className="text-sm font-black tracking-tight leading-none bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] bg-clip-text text-transparent" id="header-app-name-ar">
                جامعتي
              </h1>
              <span className="text-[10px] text-slate-400 font-bold leading-none">|</span>
              <span className="text-[10px] text-[var(--secondary)] font-black uppercase tracking-tight leading-none">Jamiaati</span>
            </div>
          </div>
        </div>

        {/* Action Elements: Inline Language Switcher Bar, Notifications & Profile */}
        <div className="flex items-center gap-2" id="header-actions">
          {/* Inline Language Bar: Beautiful, pill-shaped, intuitive switcher */}
          <div className="flex items-center bg-[#F3F1FB] border border-[#E6E1F5] rounded-lg p-0.5" id="inline-language-bar">
            {(['en', 'ar', 'ku'] as Language[]).map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-1.5 py-0.5 text-[9px] font-black rounded-md cursor-pointer transition-all duration-150 ${
                  language === lang 
                    ? 'bg-[#6B25C9] text-white shadow-sm' 
                    : 'text-slate-600 hover:text-[#6B25C9]'
                }`}
              >
                {getLanguageLabel(lang)}
              </button>
            ))}
          </div>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
               id="notif-bell"
               onClick={() => {
                 setShowNotifications(!showNotifications);
                 setShowNotificationCount(false);
               }}
               className="p-1 px-1.5 text-slate-700 hover:text-[#6B25C9] hover:bg-[#F3F7FF] rounded-lg transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {showNotificationCount && (
                <span className="absolute top-1 right-2 w-1.5 h-1.5 bg-[#D9272E] rounded-full animate-ping" />
              )}
            </button>

            {/* Quick Notifications Popover */}
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
                    <button onClick={() => setNotifications([])} className="text-[9px] text-slate-500 hover:text-[#D9272E] cursor-pointer font-bold">
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
                        <div key={n.id} className="p-1.5 hover:bg-[#F7F4FF] rounded-lg transition-all border-l-2 border-[#6B25C9]">
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

          {/* Chats / Social Hub Trigger */}
          {onChatsClick && (
            <button
              onClick={onChatsClick}
              className="p-1 px-1.5 text-slate-700 hover:text-[#6B25C9] hover:bg-[#F3F7FF] rounded-lg transition-colors cursor-pointer relative"
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

          {/* Profile Avatar */}
          <button
            id="profile-avatar-trigger"
            onClick={onProfileClick}
            className="w-7' w-7 h-7 rounded-lg border border-[#6B25C9]/40 overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer shrink-0"
          >
            <img src={currentUserAvatar} alt="Zara Al-Iraqi Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </button>
        </div>

      </div>
    </header>
  );
}

import React, { useState } from 'react';
import { Governorate, University, Language } from '../types';
import { IraqiGovernorates, IraqiUniversities } from '../data/mockData';
import { MapPin, School, Bell, Languages, Check, BookOpen, Palette } from 'lucide-react';
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
  selectedTheme: string;
  setSelectedTheme: (themeId: string) => void;
}

export default function Header({
  selectedGov,
  setSelectedGov,
  selectedUni,
  setSelectedUni,
  language,
  setLanguage,
  currentUserAvatar,
  onProfileClick,
  selectedTheme,
  setSelectedTheme
}: HeaderProps) {
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showNotificationCount, setShowNotificationCount] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Ahmad replied to your syllabus question.", time: "10m ago" },
    { id: 2, text: "New Internships listed: Zain Iraq Software Dev.", time: "1h ago" },
    { id: 3, text: "Salahaddin University updated final exam calendar.", time: "3h ago" }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Filter universities based on selected Governorate
  const filteredUnis = selectedGov === 'all' 
    ? IraqiUniversities 
    : IraqiUniversities.filter(u => u.governorateId === selectedGov);

  const handleGovChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedGov(val);
    setSelectedUni('all'); // reset university filter when governorate changes
  };

  const getLanguageLabel = (lang: Language) => {
    if (lang === 'en') return 'English';
    if (lang === 'ar') return 'العربية';
    return 'کوردی';
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-[#E6E1F5] px-4 py-3.5 shadow-sm" id="app-header-container">
      {/* Top row: Logo & Language & Notif & Profile */}
      <div className="flex items-center justify-between gap-2 max-w-lg mx-auto" id="header-top-row">
        
        {/* Brand Logo and Title */}
        <div className="flex items-center gap-3" id="header-brand-logo">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] flex items-center justify-center text-white font-bold shadow-md shadow-cyan-500/10 shrink-0 border border-[var(--secondary)]/30">
            <BookOpen className="w-6 h-6 text-white drop-shadow-md animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none flex items-center gap-1.5" id="header-app-name">
              <span className="font-sans font-black bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] bg-clip-text text-transparent">جامعتي</span> 
              <span className="text-[var(--secondary)] font-black text-sm uppercase tracking-tight">Jamiaati</span>
              <span className="px-1.5 py-0.5 text-[8px] font-black bg-[var(--accent)] text-[#0F172A] rounded-md shadow-sm border border-[var(--accent)]/30 transform rotate-1">جديد</span>
            </h1>
            <p className="text-[8px] font-mono font-black tracking-wider text-[var(--secondary)] bg-[var(--secondary)]/10 border border-[var(--secondary)]/20 px-1.5 py-0.5 rounded-md mt-1 leading-none w-max">
              YOUR IRAQ • عِراقنا
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2" id="header-actions">
          {/* Language Selector Trigger */}
          <button
            id="lang-selector-trigger"
            onClick={() => setShowLanguageModal(!showLanguageModal)}
            className="p-2 text-slate-700 hover:text-[#6B25C9] hover:bg-[#F3F7FF] rounded-xl border border-transparent hover:border-[#E6E1F5] transition-all cursor-pointer relative"
          >
            <Languages className="w-5 h-5" />
            <span className="absolute bottom-0 right-0 text-[8px] font-mono font-black bg-[#FFD21F] text-[#161A33] px-1 rounded border border-[#161A33]/20">
              {language.toUpperCase()}
            </span>
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
               id="notif-bell"
               onClick={() => {
                 setShowNotifications(!showNotifications);
                 setShowLanguageModal(false);
                 setShowNotificationCount(false);
               }}
               className="p-2 text-slate-705 text-slate-700 hover:text-[#6B25C9] hover:bg-[#F3F7FF] rounded-lg transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {showNotificationCount && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D9272E] rounded-full animate-pulse" />
              )}
            </button>

            {/* Quick Notifications Popover */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border-2 border-[#161A33] p-2 text-xs text-slate-850 text-slate-900 z-50 pointer-events-auto"
                >
                  <div className="flex justify-between items-center px-2 py-1 border-b border-[#E6E1F5] font-bold text-[#161A33] mb-1">
                    <span>{getTranslation('notificationsTitle', language)}</span>
                    <button onClick={() => setNotifications([])} className="text-[10px] text-slate-500 hover:text-[#D9272E] cursor-pointer font-bold">
                      {getTranslation('clearAllBtn', language)}
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 font-bold text-[11px] leading-relaxed">
                      {getTranslation('notificationEmpty', language)}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className="p-2 hover:bg-[#F7F4FF] rounded-lg transition-all border-l-2 border-[#6B25C9]">
                          <p className="font-semibold text-[11px] leading-tight text-[#161A33]">{n.text}</p>
                          <span className="text-[9px] text-slate-500 mt-0.5 block">{n.time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Avatar */}
          <button
            id="profile-avatar-trigger"
            onClick={onProfileClick}
            className="w-9 h-9 rounded-xl border-2 border-[#6B25C9]/40 overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
          >
            <img src={currentUserAvatar} alt="Zara Al-Iraqi Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </button>
        </div>

      </div>

      {/* Language Quick Dropdown */}
      <AnimatePresence>
        {showLanguageModal && (
          <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowLanguageModal(false)}>
            <div className="absolute right-16 top-16 w-36 bg-[#121B2E] rounded-xl shadow-2xl border border-[#1F2E4D] p-1 z-50" onClick={e => e.stopPropagation()}>
              {(['en', 'ar', 'ku'] as Language[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setShowLanguageModal(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg text-left cursor-pointer transition-colors ${
                    language === lang 
                      ? 'bg-gradient-to-r from-cyan-950/30 to-indigo-950/30 text-cyan-400 border border-cyan-500/20' 
                      : 'text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <span>{getLanguageLabel(lang)}</span>
                  {language === lang && <Check className="w-4 h-4 text-cyan-400" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Selectors Row: Governorate & University dropdowns */}
      <div className="mt-3 max-w-lg mx-auto flex items-center gap-2 bg-[#F7F4FF] p-2 rounded-2xl border-2 border-[#E6E1F5]" id="header-selectors-row">
        
        {/* Governorate Selector */}
        <div 
          className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
            selectedGov !== 'all' 
              ? 'bg-white border-2 border-[#6B25C9] shadow-inner shadow-purple-500/5' 
              : 'bg-white border border-[#E6E1F5] hover:border-[#6B25C9]'
          }`} 
          id="gov-selector-wrapper"
        >
          <MapPin className={`w-4 h-4 shrink-0 transition-colors ${selectedGov !== 'all' ? 'text-[#6B25C9]' : 'text-slate-500'}`} />
          <select
            id="gov-select"
            value={selectedGov}
            onChange={handleGovChange}
            className="w-full text-xs font-black text-[#161A33] bg-transparent border-0 focus:outline-none focus:ring-0 cursor-pointer p-0 select-none"
          >
            <option value="all" className="bg-white text-[#161A33]">📍 {getTranslation('allGovs', language)}</option>
            {IraqiGovernorates.map(gov => (
              <option key={gov.id} value={gov.id} className="bg-white text-[#161A33]">
                {language === 'ar' ? gov.nameAR : language === 'ku' ? gov.nameKU : gov.nameEN}
              </option>
            ))}
          </select>
        </div>

        {/* University Selector */}
        <div 
          className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
            selectedUni !== 'all' 
              ? 'bg-white border-2 border-[#2F7CCB] shadow-inner' 
              : 'bg-white border border-[#E6E1F5] hover:border-[#2F7CCB]'
          }`} 
          id="uni-selector-wrapper"
        >
          <School className={`w-4 h-4 shrink-0 transition-colors ${selectedUni !== 'all' ? 'text-[#2F7CCB]' : 'text-slate-500'}`} />
          <select
            id="uni-select"
            value={selectedUni}
            onChange={(e) => setSelectedUni(e.target.value)}
            className="w-full text-xs font-black text-[#161A33] bg-transparent border-0 focus:outline-none focus:ring-0 cursor-pointer p-0 select-none"
          >
            <option value="all" className="bg-white text-[#161A33]">🏫 {getTranslation('allUnis', language)}</option>
            {filteredUnis.map(uni => (
              <option key={uni.id} value={uni.id} className="bg-white text-[#161A33]">
                {uni.logo} {language === 'ar' ? uni.nameAR : language === 'ku' ? uni.nameKU : uni.nameEN}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Premium Branding Theme Selector Dropdown */}
      <div 
        className="mt-2.5 max-w-lg mx-auto flex items-center justify-between gap-2 bg-[var(--soft-card)] px-3.5 py-2.5 rounded-2xl border-2 border-[var(--border-custom)] shadow-sm font-sans" 
        id="theme-banner-selector-bar"
      >
        <span className="text-[10px] font-black uppercase text-[var(--primary)] flex items-center gap-1.5 select-none leading-none">
          <Palette className="w-3.5 h-3.5 text-[var(--primary)] shrink-0 animate-pulse" />
          <span>{language === 'ar' ? 'سمة الهوية البصرية:' : language === 'ku' ? 'سمتی ناسنامەیی:' : 'Theme Mode:'}</span>
        </span>
        <select
          value={selectedTheme}
          onChange={(e) => setSelectedTheme(e.target.value)}
          className="text-[10px] font-black text-[var(--text-custom)] bg-white border border-[var(--border-custom)] rounded-xl px-2.5 py-1.5 outline-none cursor-pointer max-w-[210px] shadow-sm hover:scale-[1.01] transition-transform select-none"
        >
          {brandingThemes.map(t => (
            <option key={t.id} value={t.id} className="font-extrabold text-[#161A33] bg-white">
              {t.name}
            </option>
          ))}
        </select>
      </div>

    </header>
  );
}

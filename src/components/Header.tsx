import React, { useState } from 'react';
import { Governorate, University, Language } from '../types';
import { IraqiGovernorates, IraqiUniversities } from '../data/mockData';
import { MapPin, School, Bell, Languages, Check, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getTranslation } from '../data/translations';

interface HeaderProps {
  selectedGov: string;
  setSelectedGov: (id: string) => void;
  selectedUni: string;
  setSelectedUni: (id: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currentUserAvatar: string;
  onProfileClick: () => void;
}

export default function Header({
  selectedGov,
  setSelectedGov,
  selectedUni,
  setSelectedUni,
  language,
  setLanguage,
  currentUserAvatar,
  onProfileClick
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
    <header className="sticky top-0 z-40 bg-white/95 border-b border-gray-100 backdrop-blur-md px-4 py-3" id="app-header-container">
      {/* Top row: Logo & Language & Notif & Profile */}
      <div className="flex items-center justify-between gap-2 max-w-lg mx-auto" id="header-top-row">
        
        {/* Brand Logo and Title */}
        <div className="flex items-center gap-2" id="header-brand-logo">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-orange-500/15">
            <BookOpen className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-tight leading-none" id="header-app-name">
              جامعتي <span className="text-orange-500 font-extrabold">Jamiaati</span>
            </h1>
            <p className="text-[9px] font-mono font-semibold tracking-wider text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded-sm mt-0.5 leading-none w-max">
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
            className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer relative"
          >
            <Languages className="w-5 h-5" />
            <span className="absolute bottom-0 right-0 text-[8px] font-semibold bg-gray-100 text-gray-700 px-1 rounded border border-white">
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
              className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {showNotificationCount && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>

            {/* Quick Notifications Popover */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-2 text-xs text-gray-800 z-50 pointer-events-auto"
                >
                  <div className="flex justify-between items-center px-2 py-1 border-b border-gray-100 font-bold text-gray-900 mb-1">
                    <span>{getTranslation('notificationsTitle', language)}</span>
                    <button onClick={() => setNotifications([])} className="text-[10px] text-gray-400 hover:text-orange-500 cursor-pointer">
                      {getTranslation('clearAllBtn', language)}
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 font-bold text-[11px] leading-relaxed">
                      {getTranslation('notificationEmpty', language)}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className="p-2 hover:bg-orange-50 rounded-lg transition-all border-l-2 border-orange-500">
                          <p className="font-medium text-[11px] leading-tight text-gray-800">{n.text}</p>
                          <span className="text-[9px] text-gray-400 mt-0.5 block">{n.time}</span>
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
            className="w-9 h-9 rounded-xl border-2 border-orange-500/35 overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
          >
            <img src={currentUserAvatar} alt="Zara Al-Iraqi Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </button>
        </div>

      </div>

      {/* Language Quick Dropdown */}
      <AnimatePresence>
        {showLanguageModal && (
          <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowLanguageModal(false)}>
            <div className="absolute right-16 top-16 w-36 bg-white rounded-xl shadow-xl border border-gray-100 p-1 z-50" onClick={e => e.stopPropagation()}>
              {(['en', 'ar', 'ku'] as Language[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setShowLanguageModal(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg text-left cursor-pointer transition-colors ${
                    language === lang 
                      ? 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{getLanguageLabel(lang)}</span>
                  {language === lang && <Check className="w-4 h-4 text-orange-500" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Selectors Row: Governorate & University dropdowns */}
      <div className="mt-3 max-w-lg mx-auto flex items-center gap-2 bg-gray-50/80 p-1.5 rounded-xl border border-gray-150/70" id="header-selectors-row">
        
        {/* Governorate Selector */}
        <div className="flex-1 flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-gray-100 shadow-sm" id="gov-selector-wrapper">
          <MapPin className="w-4.5 h-4.5 text-orange-400 shrink-0" />
          <select
            id="gov-select"
            value={selectedGov}
            onChange={handleGovChange}
            className="w-full text-xs font-bold text-gray-800 bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer pr-1"
          >
            <option value="all">📍 {getTranslation('allGovs', language)}</option>
            {IraqiGovernorates.map(gov => (
              <option key={gov.id} value={gov.id}>
                {language === 'ar' ? gov.nameAR : language === 'ku' ? gov.nameKU : gov.nameEN}
              </option>
            ))}
          </select>
        </div>

        {/* University Selector */}
        <div className="flex-1 flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-gray-100 shadow-sm" id="uni-selector-wrapper">
          <School className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
          <select
            id="uni-select"
            value={selectedUni}
            onChange={(e) => setSelectedUni(e.target.value)}
            className="w-full text-xs font-bold text-gray-800 bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer pr-1"
          >
            <option value="all">🏫 {getTranslation('allUnis', language)}</option>
            {filteredUnis.map(uni => (
              <option key={uni.id} value={uni.id}>
                {uni.logo} {language === 'ar' ? uni.nameAR : language === 'ku' ? uni.nameKU : uni.nameEN}
              </option>
            ))}
          </select>
        </div>

      </div>

    </header>
  );
}

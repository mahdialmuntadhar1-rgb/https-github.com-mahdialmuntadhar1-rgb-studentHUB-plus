import React from 'react';
import { Language } from '../types';
import { BookOpen, LogIn } from 'lucide-react';
import { getTranslation } from '../data/translations';

interface TopStripProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  isLoggedIn: boolean;
  onLoginClick: () => void;
}

export default function TopStrip({
  language,
  setLanguage,
  isLoggedIn,
  onLoginClick
}: TopStripProps) {
  const getFlagEmoji = (lang: Language) => {
    switch (lang) {
      case 'ar': return 'ðŸ‡®ðŸ‡¶';
      case 'ku': return 'ðŸ´';
      case 'en': return 'ðŸ‡ºðŸ‡¸';
      default: return 'ðŸ‡ºðŸ‡¸';
    }
  };

  const getLanguageName = (lang: Language) => {
    switch (lang) {
      case 'ar': return 'Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©';
      case 'ku': return 'Ú©ÙˆØ±Ø¯ÛŒ';
      case 'en': return 'English';
      default: return 'English';
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and App Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-md">
            <BookOpen className="w-6 h-6 text-orange-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-white tracking-tight leading-none">
              Talaba
            </span>
            <span className="text-xs font-bold text-orange-100 leading-none mt-0.5">
              Ø¬Ø§Ù…Ø¹ØªÙŠ
            </span>
          </div>
        </div>

        {/* Language Switcher with Flags */}
        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full p-1">
          {(['ar', 'ku', 'en'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-all duration-200 ${
                language === lang
                  ? 'bg-white text-orange-600 shadow-md'
                  : 'text-white hover:bg-white/30'
              }`}
            >
              <span className="text-lg">{getFlagEmoji(lang)}</span>
              <span className="hidden sm:inline">{getLanguageName(lang)}</span>
            </button>
          ))}
        </div>

        {/* Login Button */}
        {!isLoggedIn && (
          <button
            onClick={onLoginClick}
            className="flex items-center gap-2 bg-white text-orange-600 px-4 py-2 rounded-full font-bold hover:bg-orange-50 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">
              {language === 'ar' ? 'ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„' : language === 'ku' ? 'Ú†ÙˆÙˆÙ†Û•Ú˜ÙˆÙˆØ±Û•ÙˆÛ•' : 'Login'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}


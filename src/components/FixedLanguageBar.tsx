import React from 'react';
import { Language } from '../types';

interface FixedLanguageBarProps {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LANGUAGES: Array<{
  id: Language;
  flag: string;
  label: string;
}> = [
  { id: 'ar', flag: '🇮🇶', label: 'Arabic' },
  { id: 'ku', flag: '☀️', label: 'Kurdish' },
  { id: 'en', flag: '🇺🇸', label: 'English' }
];

export default function FixedLanguageBar({ language, setLanguage }: FixedLanguageBarProps) {
  return (
    <div id="fixed-language-bar" className="fixed left-1/2 top-3 z-[9999] -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-2 py-2 shadow-2xl backdrop-blur">
        {LANGUAGES.map((item) => {
          const active = language === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setLanguage(item.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-black transition-all ${
                active
                  ? 'bg-[#1E40AF] text-white shadow-md'
                  : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
              }`}
              aria-label={`Switch language to ${item.label}`}
              title={item.label}
            >
              <span className="text-2xl leading-none">{item.flag}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

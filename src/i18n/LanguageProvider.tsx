import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { languageMeta, translations, valueTranslations, type Language, type TranslationKey } from './translations';

type LanguageContextValue = {
  language: Language;
  dir: 'rtl' | 'ltr';
  setLanguage: (language: Language) => void;
  t: typeof translations.en;
  tr: (key: TranslationKey) => string;
  displayValue: (value: unknown) => string;
};

const DEFAULT_LANGUAGE: Language = 'ar';

const LanguageContext = createContext<LanguageContextValue>({
  language: DEFAULT_LANGUAGE,
  dir: 'rtl',
  setLanguage: () => undefined,
  t: translations.ar,
  tr: (key) => translations.ar[key] || translations.en[key] || key,
  displayValue: (value) => String(value ?? ''),
});

function normalizeLanguage(value: unknown): Language {
  return value === 'ku' || value === 'en' || value === 'ar' ? value : DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
    return normalizeLanguage(window.localStorage.getItem('talaba_language'));
  });

  const dir = languageMeta[language].dir;

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    window.localStorage.setItem('talaba_language', language);
  }, [language, dir]);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(normalizeLanguage(nextLanguage));
  };

  const displayValue = (value: unknown) => {
    const text = String(value ?? '').trim();
    if (!text) return '';

    const direct = valueTranslations[text];
    if (direct?.[language]) return direct[language];

    const lower = valueTranslations[text.toLowerCase()];
    if (lower?.[language]) return lower[language];

    return text;
  };

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    dir,
    setLanguage,
    t: translations[language],
    tr: (key) => translations[language][key] || translations.en[key] || String(key),
    displayValue,
  }), [language, dir]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

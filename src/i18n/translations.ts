import { Language } from '../types';
import { translations as uiTranslations } from '../data/translations';

type TranslationKey = keyof typeof uiTranslations;
type FlatTranslations = { dir: 'ltr' | 'rtl' } & Record<TranslationKey, string>;

function flatten(language: Language, dir: 'ltr' | 'rtl'): FlatTranslations {
  return {
    dir,
    ...Object.fromEntries(
      Object.entries(uiTranslations).map(([key, value]) => [key, value[language]])
    ),
  } as FlatTranslations;
}

export const translations: Record<Language, FlatTranslations> = {
  ar: flatten('ar', 'rtl'),
  ku: flatten('ku', 'rtl'),
  en: flatten('en', 'ltr'),
};

const valueTranslations: Record<string, Partial<Record<Language, string>>> = {
  all: { ar: 'الكل', ku: 'هەموو' },
  Baghdad: { ar: 'بغداد', ku: 'بەغدا' },
  Erbil: { ar: 'أربيل', ku: 'هەولێر' },
  Basra: { ar: 'البصرة', ku: 'بەسرە' },
  student: { ar: 'طالب', ku: 'خوێندکار' },
  graduate: { ar: 'خريج', ku: 'دەرچوو' },
  teacher: { ar: 'أستاذ', ku: 'مامۆستا' },
  staff: { ar: 'كادر الجامعة', ku: 'ستافی زانکۆ' },
};

export function displayValue(value: unknown, language: Language): string {
  const raw = String(value ?? '').trim();
  return valueTranslations[raw]?.[language] || raw;
}

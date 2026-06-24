export type Language = 'ar' | 'ku' | 'en';
export type Direction = 'rtl' | 'ltr';

export const languageMeta: Record<Language, { label: string; nativeName: string; flag: string; dir: Direction }> = {
  ar: { label: 'Arabic', nativeName: 'العربية', flag: '🇮🇶', dir: 'rtl' },
  ku: { label: 'Kurdish', nativeName: 'کوردی', flag: '☀️', dir: 'rtl' },
  en: { label: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
};

export const translations = {
  ar: {
    login: 'تسجيل الدخول',
    language: 'اللغة',
    installApp: 'تثبيت التطبيق',
    addToHomeScreen: 'إضافة إلى الشاشة الرئيسية',
    openInBrowser: 'افتح في المتصفح',
    opportunities: 'الفرص',
    jobs: 'الوظائف',
    scholarships: 'المنح الدراسية',
    training: 'التدريب',
    internships: 'التدريب العملي',
    events: 'الفعاليات',
    announcements: 'الإعلانات',
    campusLife: 'حياة الجامعة',
    applyViewDetails: 'التقديم / عرض التفاصيل',
    noLinkProvided: 'لا يوجد رابط',
    loading: 'جاري التحميل...',
    failedToLoad: 'تعذر تحميل البيانات',
    viewMore: 'عرض المزيد',
    whatOnYourMind: 'ماذا يدور في بالك؟',
  },
  ku: {
    login: 'چوونەژوورەوە',
    language: 'زمان',
    installApp: 'دابەزاندنی ئەپ',
    addToHomeScreen: 'زیادکردن بۆ شاشەی سەرەکی',
    openInBrowser: 'کردنەوە لە وێبگەڕ',
    opportunities: 'هەلەکان',
    jobs: 'کارەکان',
    scholarships: 'بورسیەکان',
    training: 'ڕاهێنان',
    internships: 'ڕاهێنانی کار',
    events: 'چالاکییەکان',
    announcements: 'ئاگادارییەکان',
    campusLife: 'ژیانی زانکۆ',
    applyViewDetails: 'پێشکەشکردن / بینینی وردەکاری',
    noLinkProvided: 'بەستەر نییە',
    loading: 'بارکردن...',
    failedToLoad: 'نەتوانرا داتا بار بکرێت',
    viewMore: 'زیاتر ببینە',
    whatOnYourMind: 'چی لە مێشکتدایە؟',
  },
  en: {
    login: 'Login',
    language: 'Language',
    installApp: 'Install App',
    addToHomeScreen: 'Add to Home Screen',
    openInBrowser: 'Open in Browser',
    opportunities: 'Opportunities',
    jobs: 'Jobs',
    scholarships: 'Scholarships',
    training: 'Training',
    internships: 'Internships',
    events: 'Events',
    announcements: 'Announcements',
    campusLife: 'Campus Life',
    applyViewDetails: 'Apply / View Details',
    noLinkProvided: 'No link provided',
    loading: 'Loading...',
    failedToLoad: 'Failed to load data',
    viewMore: 'View more',
    whatOnYourMind: "What's on your mind?",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export const valueTranslations: Record<string, Record<Language, string>> = {
  Baghdad: { ar: 'بغداد', ku: 'بەغدا', en: 'Baghdad' },
  Erbil: { ar: 'أربيل', ku: 'هەولێر', en: 'Erbil' },
  Sulaymaniyah: { ar: 'السليمانية', ku: 'سلێمانی', en: 'Sulaymaniyah' },
  Duhok: { ar: 'دهوك', ku: 'دهۆک', en: 'Duhok' },
  Kirkuk: { ar: 'كركوك', ku: 'کەرکووک', en: 'Kirkuk' },

  job: { ar: 'وظيفة', ku: 'کار', en: 'Job' },
  scholarship: { ar: 'منحة دراسية', ku: 'بورسیە', en: 'Scholarship' },
  training: { ar: 'تدريب', ku: 'ڕاهێنان', en: 'Training' },
  internship: { ar: 'تدريب عملي', ku: 'ڕاهێنانی کار', en: 'Internship' },
  event: { ar: 'فعالية', ku: 'چالاکی', en: 'Event' },

  male: { ar: 'ذكر', ku: 'نێر', en: 'Male' },
  female: { ar: 'أنثى', ku: 'مێ', en: 'Female' },
  "Bachelor's Degree": { ar: 'بكالوريوس', ku: 'بەکالۆریۆس', en: "Bachelor's Degree" },
};

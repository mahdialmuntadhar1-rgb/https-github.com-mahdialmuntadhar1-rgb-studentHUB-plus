import { Language } from '../types';

const mojibakePattern = /[ØÙÃÂÐ]/;

export function repairMojibake(value: unknown): string {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (!mojibakePattern.test(text)) return text;

  try {
    const bytes: number[] = [];
    for (const ch of text) {
      const code = ch.charCodeAt(0);
      if (code > 255) return text;
      bytes.push(code);
    }

    const decoded = new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(bytes));
    const decodedArabicScore = (decoded.match(/[\u0600-\u06FF]/g) || []).length;
    const originalArabicScore = (text.match(/[\u0600-\u06FF]/g) || []).length;

    if (decoded && decodedArabicScore > originalArabicScore) return decoded;
  } catch (_) {
    return text;
  }

  return text;
}

export function cleanLocalizedText(value: unknown, fallback = ''): string {
  const fixed = repairMojibake(value);
  const cleaned = fixed.replace(/\s+/g, ' ').trim();
  return cleaned || fallback;
}

export function firstLocalizedText(record: any, keys: string[], fallback = ''): string {
  for (const key of keys) {
    const value = record?.[key];
    const cleaned = cleanLocalizedText(value);
    if (cleaned) return cleaned;
  }
  return cleanLocalizedText(fallback);
}

const ui = {
  campusHighlight: {
    en: '✨ Campus Highlight',
    ar: '✨ لقطة جامعية',
    ku: '✨ دیاریکراوی زانکۆ'
  },
  viewFullscreen: {
    en: 'View Fullscreen 🔎',
    ar: 'عرض بالحجم الكامل 🔎',
    ku: 'پیشاندان بە قەبارەی تەواو 🔎'
  },
  demo: {
    en: 'Demo',
    ar: 'تجريبي',
    ku: 'تاقیکردنەوە'
  },
  verified: {
    en: 'Verified',
    ar: 'موثّق',
    ku: 'پەسەندکراو'
  },
  deadline: {
    en: 'Deadline',
    ar: 'آخر موعد',
    ku: 'دوا وادە'
  },
  whoCanApply: {
    en: 'Who can apply',
    ar: 'من يمكنه التقديم',
    ku: 'کێ دەتوانێت پێشکەش بکات'
  },
  studentsAppliedPrefix: {
    en: '',
    ar: 'تقدم',
    ku: 'پێشکەش کردووە'
  },
  studentsAppliedSuffix: {
    en: 'students from your university applied',
    ar: 'طلاب من جامعتك',
    ku: 'قوتابی لە زانکۆکەت'
  },
  savedByPeers: {
    en: 'saved by peers',
    ar: 'حفظها الطلاب',
    ku: 'لە لایەن قوتابیان پاشەکەوتکراوە'
  },
  appliedSuccessfully: {
    en: 'Applied Successfully!',
    ar: 'تم التقديم بنجاح!',
    ku: 'پێشکەشکردن سەرکەوتوو بوو!'
  },
  opportunityProvider: {
    en: 'Iraq Opportunity Provider',
    ar: 'جهة فرصة في العراق',
    ku: 'دابینکەری هەل لە عێراق'
  },
  allIraq: {
    en: 'All Iraq',
    ar: 'كل العراق',
    ku: 'هەموو عێراق'
  },
  career: {
    en: 'Career',
    ar: 'مسار مهني',
    ku: 'پیشە'
  },
  subject: {
    en: 'Subject',
    ar: 'المادة',
    ku: 'بابەت'
  },
  studyingInside: {
    en: 'studying inside',
    ar: 'يدرسون داخل المجموعة',
    ku: 'لە ناو گروپەکە دەخوێنن'
  },
  campusReels: {
    en: 'Campus Reels',
    ar: 'فيديوهات جامعية',
    ku: 'ڤیدیۆی زانکۆ'
  },
  nearestCampusAsset: {
    en: 'Nearest Campus Asset',
    ar: 'أقرب خدمة جامعية',
    ku: 'نزیکترین خزمەتی زانکۆ'
  }
} as const;

export function translateUi(key: keyof typeof ui, language: Language): string {
  return ui[key][language] || ui[key].en;
}

export function localizeFeedDate(value: unknown, language: Language): string {
  const text = cleanLocalizedText(value);
  if (!text) return '';

  if (/recently/i.test(text)) {
    return language === 'ar' ? 'نُشر مؤخراً 🔔' : language === 'ku' ? 'دوایی بڵاوکراوەتەوە 🔔' : 'Recently posted 🔔';
  }

  if (/just now/i.test(text)) {
    return language === 'ar' ? 'الآن' : language === 'ku' ? 'ئێستا' : 'Just now';
  }

  const postedPrefix = /^Posted on\s+/i;
  if (postedPrefix.test(text)) {
    const date = text.replace(postedPrefix, '');
    return language === 'ar' ? `نُشر في ${date}` : language === 'ku' ? `بڵاوکراوەتەوە لە ${date}` : text;
  }

  return text;
}

export function localizeWorkplaceType(value: unknown, language: Language): string {
  const text = cleanLocalizedText(value);
  const low = text.toLowerCase();

  if (low.includes('remote')) {
    return language === 'ar' ? 'عن بُعد' : language === 'ku' ? 'لە دوورەوە' : 'Remote';
  }

  if (low.includes('hybrid')) {
    return language === 'ar' ? 'مختلط' : language === 'ku' ? 'تێکەڵ' : 'Hybrid';
  }

  if (low.includes('site') || low.includes('on-site') || low.includes('onsite')) {
    return language === 'ar' ? 'حضوري' : language === 'ku' ? 'ئامادەبوون' : 'On-site';
  }

  return text;
}

export function localizeLocation(value: unknown, language: Language): string {
  const text = cleanLocalizedText(value);
  const low = text.toLowerCase();

  if (!text || low === 'all iraq' || low === 'iraq-wide') {
    return translateUi('allIraq', language);
  }

  const map: Record<string, { ar: string; ku: string; en: string }> = {
    baghdad: { en: 'Baghdad', ar: 'بغداد', ku: 'بەغدا' },
    erbil: { en: 'Erbil', ar: 'أربيل', ku: 'هەولێر' },
    sulaymaniyah: { en: 'Sulaymaniyah', ar: 'السليمانية', ku: 'سلێمانی' },
    basra: { en: 'Basra', ar: 'البصرة', ku: 'بەسرە' },
    kirkuk: { en: 'Kirkuk', ar: 'كركوك', ku: 'کەرکووک' },
    duhok: { en: 'Duhok', ar: 'دهوك', ku: 'دهۆک' },
    najaf: { en: 'Najaf', ar: 'النجف', ku: 'نەجەف' },
    karbala: { en: 'Karbala', ar: 'كربلاء', ku: 'کەربەلا' }
  };

  const matched = map[low];
  if (matched) return matched[language] || matched.en;

  return text;
}

export function localizeCategoryLabel(value: unknown, language: Language): string {
  const text = cleanLocalizedText(value);
  const low = text.toLowerCase().replace(/[_-]/g, ' ');

  const map: Record<string, { en: string; ar: string; ku: string }> = {
    career: { en: 'Career', ar: 'مسار مهني', ku: 'پیشە' },
    scholarship: { en: 'Scholarship', ar: 'منحة دراسية', ku: 'بورس' },
    internship: { en: 'Internship', ar: 'تدريب عملي', ku: 'مەشق' },
    training: { en: 'Training', ar: 'تدريب', ku: 'ڕاهێنان' },
    volunteering: { en: 'Volunteering', ar: 'عمل تطوعي', ku: 'خۆبەخشی' },
    competition: { en: 'Competition', ar: 'مسابقة', ku: 'کێبڕکێ' },
    event: { en: 'Event', ar: 'فعالية', ku: 'چالاکی' },
    news: { en: 'News', ar: 'خبر', ku: 'هەواڵ' },
    announcement: { en: 'Announcement', ar: 'إعلان', ku: 'ڕاگەیاندن' },
    'full time graduate job': { en: 'Graduate Job', ar: 'وظيفة للخريجين', ku: 'کاری دەرچووان' },
    'full time job': { en: 'Full-Time Job', ar: 'دوام كامل', ku: 'دەوامی تەواو' },
    'part time job': { en: 'Part-Time Job', ar: 'دوام جزئي', ku: 'دەوامی کاتی' },
    'graduation project support': { en: 'Project Support', ar: 'دعم مشاريع التخرج', ku: 'پاڵپشتی پڕۆژە' }
  };

  const found = map[low];
  if (found) return found[language] || found.en;

  return text || translateUi('career', language);
}

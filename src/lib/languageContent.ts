import { Language } from '../types';
import { cleanText } from './textClean';

type AnyItem = Record<string, any>;

function firstClean(item: AnyItem, fields: string[]): string {
  for (const field of fields) {
    const value = item?.[field];
    if (typeof value === 'string' && cleanText(value).trim()) {
      return cleanText(value).trim();
    }
  }
  return '';
}

function firstNestedClean(item: AnyItem, fields: string[]): string {
  for (const field of fields) {
    const parts = field.split('.');
    let value: any = item;
    for (const part of parts) value = value?.[part];

    if (typeof value === 'string' && cleanText(value).trim()) {
      return cleanText(value).trim();
    }
  }
  return '';
}

export function getLocalizedText(
  item: AnyItem,
  language: Language,
  fields: {
    ku?: string[];
    ar?: string[];
    en?: string[];
    original?: string[];
  } = {}
): string {
  const kuFields = fields.ku || ['titleKU', 'contentKU', 'summaryKU', 'descriptionKU', 'title_ku', 'body_ku', 'caption_ku'];
  const arFields = fields.ar || ['titleAR', 'contentAR', 'summaryAR', 'descriptionAR', 'title_ar', 'body_ar', 'caption_ar'];
  const enFields = fields.en || ['titleEN', 'contentEN', 'summaryEN', 'descriptionEN', 'title_en', 'body_en', 'caption_en'];
  const originalFields = fields.original || ['title_original', 'body_original', 'caption_original', 'titleOriginal', 'bodyOriginal', 'captionOriginal', 'title', 'content', 'body', 'caption', 'description', 'summary'];

  if (language === 'ku') {
    return firstClean(item, kuFields) || firstClean(item, enFields) || firstClean(item, originalFields) || firstClean(item, arFields);
  }

  if (language === 'ar') {
    return firstClean(item, arFields) || firstClean(item, enFields) || firstClean(item, originalFields) || firstClean(item, kuFields);
  }

  return firstClean(item, enFields) || firstClean(item, originalFields) || firstClean(item, arFields) || firstClean(item, kuFields);
}

export function getLocalizedPostTitle(post: AnyItem, language: Language): string {
  return getLocalizedText(post, language, {
    ku: ['titleKU', 'title_ku'],
    ar: ['titleAR', 'title_ar'],
    en: ['titleEN', 'title_en'],
    original: ['title_original', 'titleOriginal', 'title']
  });
}

export function getLocalizedPostContent(post: AnyItem, language: Language): string {
  return getLocalizedText(post, language, {
    ku: ['contentKU', 'body_ku', 'caption_ku', 'summaryKU', 'descriptionKU'],
    ar: ['contentAR', 'body_ar', 'caption_ar', 'summaryAR', 'descriptionAR'],
    en: ['contentEN', 'body_en', 'caption_en', 'summaryEN', 'descriptionEN'],
    original: ['body_original', 'caption_original', 'bodyOriginal', 'captionOriginal', 'content', 'body', 'caption', 'description', 'summary']
  });
}

export function getOriginalLanguageLabel(item: AnyItem): string {
  const raw = cleanText(item?.original_language || item?.originalLanguage || item?.language || '');
  if (!raw) return 'Original';
  if (raw.toLowerCase().includes('ku') || raw.includes('کورد') || raw.includes('كرد')) return 'Original Kurdish';
  if (raw.toLowerCase().includes('ar') || raw.includes('عرب')) return 'Original Arabic';
  if (raw.toLowerCase().includes('en')) return 'Original English';
  return 'Original';
}

export function hasTranslatedVersion(item: AnyItem, language: Language): boolean {
  if (language === 'ku') return Boolean(firstClean(item, ['titleKU', 'contentKU', 'title_ku', 'body_ku', 'caption_ku']));
  if (language === 'ar') return Boolean(firstClean(item, ['titleAR', 'contentAR', 'title_ar', 'body_ar', 'caption_ar']));
  return Boolean(firstClean(item, ['titleEN', 'contentEN', 'title_en', 'body_en', 'caption_en']));
}

export function getInstitutionName(item: AnyItem): string {
  return (
    firstClean(item, ['institution_name', 'university', 'universityName', 'organization', 'company', 'universityId']) ||
    firstNestedClean(item, ['author.name']) ||
    ''
  );
}

/**
 * Fallback image utility for feed cards
 * Provides expressive, modern, youthful images based on category/type
 * Used when backend items have no image_url
 */
import type { SyntheticEvent } from 'react';

export const FALLBACK_IMAGES: Record<string, string> = {
  news: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
  event: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
  announcement: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800',
  registration: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
  exam: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=800',
  activity: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800',
  student_club: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800',
  campus_life: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&q=80&w=800',
  scholarship: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800',
  job: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800',
  internship: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800',
  training: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
  volunteering: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=800',
  competition: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800',
  fellowship: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800',
  graduation_project_support: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800',
  part_time_job: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&q=80&w=800',
  full_time_job: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&q=80&w=800',
  study_group: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800',
  poll: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
  anonymous_question: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
  video: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=800',
  photo: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800',
  post: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800',
  story: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
  local_service: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800',
};

const KEYWORD_FALLBACKS: Array<{ pattern: RegExp; image: string }> = [
  {
    pattern: /\b(daad|chevening|erasmus|turkiye|türkiye|campus france|scholarship|study abroad)\b/i,
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800',
  },
  {
    pattern: /\b(engineering|engineer|robotics|solar|prototype|mechanical|civil|electrical)\b/i,
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
  },
  {
    pattern: /\b(medicine|medical|health|doctor|nursing|pharmacy|hospital|clinic)\b/i,
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800',
  },
  {
    pattern: /\b(exam|exams|classroom|finals|test|schedule)\b/i,
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=800',
  },
  {
    pattern: /\b(activity|club|campus life|student club|study group|social|students)\b/i,
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800',
  },
];

const IMAGE_LIKE_EXTENSIONS = /\.(avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i;
const TRUSTED_IMAGE_HOST_PARTS = [
  'images.unsplash.com',
  'plus.unsplash.com',
  'images.pexels.com',
  'cdn.pixabay.com',
  'res.cloudinary.com',
  'imagekit.io',
  'imgur.com',
  'i.imgur.com',
  'wikimedia.org',
  'githubusercontent.com',
  'googleusercontent.com',
  'cloudflare',
  'supabase',
  'firebasestorage',
];

function normalizedCategory(type: string | undefined): string {
  const value = (type || 'post').toLowerCase().trim().replace(/[-\s]+/g, '_');
  if (value === 'jobs') return 'job';
  if (value === 'events') return 'event';
  if (value === 'scholarships') return 'scholarship';
  if (value === 'internships') return 'internship';
  if (value === 'study_group') return 'student_club';
  if (value === 'campus') return 'campus_life';
  return value;
}

function textFromUnknown(value: unknown): string {
  if (!value) return '';
  if (Array.isArray(value)) return value.join(' ');
  if (typeof value === 'object') {
    try {
      return Object.values(value as Record<string, unknown>).join(' ');
    } catch {
      return '';
    }
  }
  return String(value);
}

export function isProbablyValidImageUrl(url: unknown): url is string {
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed || /\s/.test(trimmed)) return false;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    if (!host.includes('.')) return false;
    if (IMAGE_LIKE_EXTENSIONS.test(parsed.pathname)) return true;
    return TRUSTED_IMAGE_HOST_PARTS.some(part => host.includes(part));
  } catch {
    return false;
  }
}

export function looksLikeUrlText(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  return /^https?:\/\//i.test(value.trim());
}

/**
 * Get fallback image URL based on item type/category
 * @param type - The feed item type
 * @returns Fallback image URL
 */
export function getFallbackImage(type: string): string {
  const normalizedType = normalizedCategory(type);
  return FALLBACK_IMAGES[normalizedType] || FALLBACK_IMAGES.post;
}

export function getSafeCardImage(item: unknown): string {
  const record = (item || {}) as Record<string, unknown>;
  const candidates = [
    record.image_url,
    record.imageUrl,
    record.image,
    record.thumbnail,
    record.thumbnail_url,
    record.coverImage,
    record.cover_image,
    record.heroImage,
    record.hero_image,
    record.institution_logo,
  ];

  const validRemote = candidates.find(isProbablyValidImageUrl);
  if (validRemote) return validRemote;

  const category = normalizedCategory(
    textFromUnknown(record.category || record.type || record.opportunityCategory || record.sourceType)
  );
  const keywordText = [
    record.title,
    record.titleEN,
    record.summary,
    record.contentEN,
    record.description,
    record.provider,
    record.institution_name,
    record.organization,
    record.tags,
  ].map(textFromUnknown).join(' ');

  const keywordMatch = KEYWORD_FALLBACKS.find(entry => entry.pattern.test(keywordText));
  return keywordMatch?.image || getFallbackImage(category);
}

/**
 * Get image URL for a feed item with fallback logic
 * @param imageUrl - The item's image_url if available
 * @param type - The item's type/category
 * @returns Image URL to use (original or fallback)
 */
export function getImageWithFallback(imageUrl: string | undefined, type: string): string {
  if (isProbablyValidImageUrl(imageUrl)) {
    return imageUrl;
  }
  return getFallbackImage(type);
}

export function handleCardImageError(event: SyntheticEvent<HTMLImageElement>, fallbackUrl: string) {
  const img = event.currentTarget;
  if (img.src !== fallbackUrl) {
    img.src = fallbackUrl;
  }
}

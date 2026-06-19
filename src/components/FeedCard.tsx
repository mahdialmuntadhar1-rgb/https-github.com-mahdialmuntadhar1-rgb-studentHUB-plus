import React from 'react';
import { Language, FeedItem, getLocalizedContent } from '../types';

interface FeedCardProps {
  key?: string | number;
  item: FeedItem;
  language: Language;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onVote: (itemId: string, optionId: string) => void;
  onApply: (id: string) => void;
  onRsvp: (id: string) => void;
  onJoinGroup: (id: string) => void;
  onAddComment: (id: string, commentText: string) => void;
  allPostsHighlightDisabled?: boolean;
  onEditFeedItem?: (id: string, updatedFields: Partial<FeedItem>) => void;
  onDeleteFeedItem?: (id: string) => void;
  isAdminMode?: boolean;
  onUserClick?: (user: { id?: string; name: string; role: string; avatar: string; university?: string }) => void;
}

const OPPORTUNITY_TYPES = new Set([
  'job',
  'full_time_job',
  'part_time_job',
  'internship',
  'scholarship',
  'fellowship',
  'training',
  'volunteering',
  'competition',
  'graduation_project_support',
  'admission'
]);

function getSafeTags(tags: any): string[] {
  if (Array.isArray(tags)) {
    return tags.map(tag => String(tag || '').trim()).filter(Boolean);
  }

  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) {
        return parsed.map(tag => String(tag || '').trim()).filter(Boolean);
      }
    } catch {
      // keep plain string handling below
    }

    return tags
      .replace(/^\[/, '')
      .replace(/\]$/, '')
      .replace(/"/g, '')
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function cleanText(value: any, fallback = ''): string {
  const text = String(value || '').trim();

  if (!text) return fallback;

  if (/^https?:\/\//i.test(text)) return fallback;

  return text
    .replace(/ðŸ\S*/g, '')
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/â€™/g, "'")
    .replace(/â€˜/g, "'")
    .replace(/â€¢/g, '')
    .replace(/â€“/g, '-')
    .replace(/â€”/g, '-')
    .replace(/ï¿½/g, '')
    .replace(/�/g, '')
    .replace(/\s+/g, ' ')
    .trim() || fallback;
}

function getImageUrl(item: FeedItem): string {
  const candidates = [
    item.imageUrl,
    item.videoThumbnail,
    item.companyLogo,
    item.author?.avatar
  ];

  for (const candidate of candidates) {
    const url = String(candidate || '').trim();
    if (/^https?:\/\//i.test(url) || /^data:image\//i.test(url)) {
      return url;
    }
  }

  return '';
}

function getOpportunityUrl(item: FeedItem): string {
  const anyItem = item as any;

  const candidates = [
    anyItem.applyUrl,
    anyItem.sourceUrl,
    anyItem.apply_url,
    anyItem.source_url,
    anyItem.details_url,
    anyItem.detailsUrl,
    anyItem.application_link,
    anyItem.application_url,
    anyItem.apply_link,
    anyItem.url,
    anyItem.link,
    anyItem.external_url,
    anyItem.original_source_url,
    anyItem.original_url,
    anyItem.raw_url,
    anyItem.raw_item_url,
    anyItem.candidate_url,
    anyItem.source_link,
    anyItem.source?.url,
    anyItem.raw?.url,
    anyItem.metadata?.url,
    anyItem.metadata?.source_url,
    anyItem.metadata?.application_link
  ];

  for (const candidate of candidates) {
    const url = String(candidate || '').trim().replace(/[)\].,;]+$/g, '');
    if (/^https?:\/\//i.test(url)) return url;
  }

  return '';
}

function getApplyLabel(item: FeedItem, language: Language): string {
  if (item.type === 'scholarship' || item.type === 'fellowship') {
    return language === 'ar' ? 'قدّم للمنحة' : language === 'ku' ? 'داواکاری بۆ سکۆلەرشیپ' : 'Apply for Scholarship';
  }

  if (item.type === 'training' || item.type === 'internship') {
    return language === 'ar' ? 'قدّم الآن' : language === 'ku' ? 'ئێستا داواکاری بکە' : 'Apply Now';
  }

  return language === 'ar' ? 'قدّم الآن' : language === 'ku' ? 'ئێستا داواکاری بکە' : 'Apply Now';
}

export default function FeedCard({
  item,
  language,
  onApply
}: FeedCardProps) {
  const isOpportunity = OPPORTUNITY_TYPES.has(item.type) || Boolean((item as any).opportunityCategory);
  const isRtl = language === 'ar' || language === 'ku';

  const title = cleanText(getLocalizedContent(item, 'title', language), item.titleEN || 'Jamiaati Post');
  const body = cleanText(getLocalizedContent(item, 'content', language), item.contentEN || '');

  const caption = (() => {
    if (title && body && title !== body) return `${title}\n${body}`;
    return body || title;
  })();

  const imageUrl = getImageUrl(item);
  const opportunityUrl = getOpportunityUrl(item);

  const tags = (() => {
    const rawTags = getSafeTags(item.tags)
      .map(tag => tag.replace(/^#/, '').trim())
      .filter(Boolean)
      .filter(tag => tag.length <= 28)
      .slice(0, 4);

    if (rawTags.length > 0) return rawTags;

    if (isOpportunity) return [item.type.replace(/_/g, '')];

    return ['StudentShare'];
  })();

  const openOpportunity = () => {
    if (opportunityUrl) {
      window.open(opportunityUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (isOpportunity) {
      onApply(item.id);
    }
  };

  return (
    <article
      id={`feed-card-${item.id}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      className="mb-5 overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm"
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="block w-full max-h-[520px] object-cover bg-slate-100"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex min-h-[230px] w-full items-center justify-center bg-gradient-to-br from-[#4c1d95] via-[#6d28d9] to-[#111827] px-6 py-10 text-center text-white">
          <div>
            <div className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-white/70">
              Jamiaati
            </div>
            <div className="text-2xl font-black leading-tight">
              {title}
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-3">
        <p className="whitespace-pre-line text-[14px] font-semibold leading-relaxed text-slate-900">
          {caption}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <span
              key={tag}
              className="rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 text-[10px] font-black text-orange-600"
            >
              #{tag}
            </span>
          ))}
        </div>

        {isOpportunity && (
          <button
            type="button"
            onClick={openOpportunity}
            className="mt-4 w-full rounded-2xl bg-orange-500 px-4 py-3 text-center text-[13px] font-black text-white shadow-sm active:scale-[0.99]"
          >
            {getApplyLabel(item, language)}
          </button>
        )}
      </div>
    </article>
  );
}

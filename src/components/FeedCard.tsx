import React, { useState } from 'react';
import { Heart, MessageSquare, Share2, Bookmark } from 'lucide-react';
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

  const directCandidates = [
    anyItem.applyUrl,
    anyItem.sourceUrl,
    anyItem.apply_url,
    anyItem.source_url,
    anyItem.details_url,
    anyItem.detailsUrl,
    anyItem.application_link,
    anyItem.application_url,
    anyItem.apply_link,
    anyItem.job_url,
    anyItem.jobUrl,
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

  for (const candidate of directCandidates) {
    const url = String(candidate || '').trim().replace(/[)\].,;]+$/g, '');
    if (/^https?:\/\//i.test(url)) return url;
  }

  const textBlob = [
    anyItem.description,
    anyItem.summary,
    anyItem.content,
    anyItem.contentEN,
    anyItem.contentAR,
    anyItem.contentKU,
    anyItem.body,
    anyItem.body_original,
    anyItem.raw_text,
    anyItem.notes,
    anyItem.metadata,
    anyItem.raw
  ]
    .map(value => {
      if (!value) return '';
      if (typeof value === 'string') return value;
      try {
        return JSON.stringify(value);
      } catch {
        return String(value || '');
      }
    })
    .join('\n');

  const extracted = textBlob.match(/https?:\/\/[^\s<>"')\]]+/i);
  if (extracted?.[0]) {
    return extracted[0].replace(/[)\].,;]+$/g, '');
  }

  return '';
}

function getFallbackJobSearchUrl(item: FeedItem, title: string): string {
  const provider = String(item.company || item.author?.name || '').trim();
  const location = String(item.location || item.governorateId || 'Iraq').trim();
  const query = [title, provider, location, 'job application']
    .filter(Boolean)
    .join(' ');

  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function getApplyLabel(item: FeedItem, language: Language): string {
  if (item.type === 'scholarship' || item.type === 'fellowship') {
    return language === 'ar' ? 'قدّم للمنحة' : language === 'ku' ? 'داواکاری بۆ سکۆلەرشیپ' : 'Apply for Scholarship';
  }

  return language === 'ar' ? 'قدّم الآن' : language === 'ku' ? 'ئێستا داواکاری بکە' : 'Apply Now';
}

export default function FeedCard({
  item,
  language,
  onLike,
  onSave,
  onAddComment
}: FeedCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [copied, setCopied] = useState(false);
  const [showFullCaption, setShowFullCaption] = useState(false);

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
  const finalOpportunityUrl = opportunityUrl;

  const tags = (() => {
    const rawTags = getSafeTags(item.tags)
      .map(tag => tag.replace(/^#/, '').trim())
      .filter(Boolean)
      .filter(tag => tag.length <= 28)
      .slice(0, 5);

    if (rawTags.length > 0) return rawTags;

    if (isOpportunity) return [item.type.replace(/_/g, '')];

    return ['StudentShare'];
  })();

  const openOpportunity = () => {
    if (finalOpportunityUrl) {
      window.open(finalOpportunityUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const sharePost = async () => {
    const shareUrl = finalOpportunityUrl || `${window.location.origin}/item/${item.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const submitComment = (event: React.FormEvent) => {
    event.preventDefault();
    if (!commentText.trim()) return;

    onAddComment(item.id, commentText.trim());
    setCommentText('');
  };

  const captionIsLong = caption.length > 170;

  return (
    <article
      id={`feed-card-${item.id}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      className="mb-5 overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm"
    >
      {imageUrl && !isOpportunity ? (
        <div className="relative w-full overflow-hidden bg-slate-100">
          <img
            src={imageUrl}
            alt={title}
            className="block w-full max-h-[520px] object-cover bg-slate-100"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : isOpportunity ? (
        <div className="relative flex min-h-[340px] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-orange-100 via-orange-200 to-orange-400 px-6 py-10 text-center text-[#3b2208]">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_left,_#ffffff_0,_transparent_30%),radial-gradient(circle_at_bottom_right,_#fdba74_0,_transparent_34%)]" />
          <div className="relative z-10">
            <div className="mb-4 inline-flex rounded-full bg-orange-500 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-900 shadow">
              {item.type === 'scholarship' ? 'Scholarship' : item.type === 'internship' ? 'Internship' : 'Job Opportunity'}
            </div>
            <h2 className="text-5xl font-black leading-[1.02] tracking-tight">
              {title}
            </h2>
            <>
              <p className="mt-4 text-base font-black text-[#6b3a10]">
                {cleanText(item.company || item.author?.name || item.location || 'Iraq', 'Iraq')}
              </p>
              <p className="mx-auto mt-3 max-w-[34ch] text-sm font-semibold leading-6 text-[#4a2a0d]">
                {cleanText(
                  item.contentEN ||
                  item.contentAR ||
                  item.contentKU ||
                  'Open the direct link for full details.',
                  'Open the direct link for full details.'
                ).slice(0, 160)}
              </p>
            </>
          </div>
        </div>
      ) : null}

      <div className="px-4 py-3">
        <p className={`whitespace-pre-line text-[14px] font-semibold leading-relaxed text-slate-900 ${!showFullCaption ? 'line-clamp-4' : ''}`}>
          {caption}
        </p>

        {captionIsLong && (
          <button
            type="button"
            onClick={() => setShowFullCaption(prev => !prev)}
            className="mt-1 text-[12px] font-black text-orange-600"
          >
            {showFullCaption
              ? (language === 'ar' ? 'عرض أقل' : language === 'ku' ? 'کەمتر پیشان بدە' : 'Show less')
              : (language === 'ar' ? 'عرض التفاصيل' : language === 'ku' ? 'وردەکاری پیشان بدە' : 'Show details')}
          </button>
        )}

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
            disabled={!finalOpportunityUrl}
            className={`mt-4 w-full rounded-2xl px-4 py-3 text-center text-[13px] font-black text-slate-900 shadow-sm active:scale-[0.99] ${
              finalOpportunityUrl ? 'bg-orange-500' : 'cursor-not-allowed bg-slate-300'
            }`}
          >
            {finalOpportunityUrl
              ? getApplyLabel(item, language)
              : (language === 'ar' ? 'الرابط المباشر غير متوفر' : language === 'ku' ? 'لینکی ڕاستەوخۆ نییە' : 'Direct link missing')}
          </button>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-orange-50 pt-3">
          <div className="flex items-center gap-5 text-slate-700">
            <button
              type="button"
              onClick={() => onLike(item.id)}
              className="flex items-center gap-1.5 text-[12px] font-black"
              aria-label="Like"
            >
              <Heart className={`h-5 w-5 ${item.likedByUser ? 'fill-red-500 text-red-500' : 'text-slate-700'}`} />
              <span>{item.likes || 0}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowComments(prev => !prev)}
              className="flex items-center gap-1.5 text-[12px] font-black"
              aria-label="Comment"
            >
              <MessageSquare className="h-5 w-5" />
              <span>{item.commentsCount || 0}</span>
            </button>

            <button
              type="button"
              onClick={sharePost}
              className="flex items-center gap-1.5 text-[12px] font-black"
              aria-label="Share"
            >
              <Share2 className="h-5 w-5" />
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onSave(item.id)}
            className="text-slate-700"
            aria-label="Save"
          >
            <Bookmark className={`h-5 w-5 ${item.savedByUser ? 'fill-orange-400 text-orange-500' : ''}`} />
          </button>
        </div>

        {showComments && (
          <form onSubmit={submitComment} className="mt-3 flex gap-2">
            <input
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder={
                language === 'ar'
                  ? 'أضف تعليقاً...'
                  : language === 'ku'
                    ? 'کۆمێنت بنووسە...'
                    : 'Add a comment...'
              }
              className="min-w-0 flex-1 rounded-full border border-orange-100 bg-orange-50/40 px-3 py-2 text-[12px] font-bold outline-none focus:border-orange-400"
            />
            <button
              type="submit"
              className="rounded-full bg-slate-900 px-4 py-2 text-[12px] font-black text-white"
            >
              {language === 'ar' ? 'نشر' : language === 'ku' ? 'ناردن' : 'Post'}
            </button>
          </form>
        )}
      </div>
    </article>
  );
}




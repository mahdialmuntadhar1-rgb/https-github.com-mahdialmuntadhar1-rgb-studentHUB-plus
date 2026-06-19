import React, { useState } from 'react';
import { Heart, MessageSquare, Share2, Bookmark, UserPlus, Send, UserRound, X } from 'lucide-react';
import { BACKEND_URL } from '../lib/api';
import { Author, Language, FeedItem, getLocalizedContent } from '../types';

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
  onUserClick?: (user: Author) => void;
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

function getStableSocialStats(id: string) {
  let hash = 2166136261;
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  const unsigned = hash >>> 0;
  return {
    likes: 3 + (unsigned % 185),
    comments: (unsigned >>> 7) % 27,
    shares: (unsigned >>> 13) % 19,
    saves: (unsigned >>> 19) % 23,
  };
}

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
    if (/^https?:\/\//i.test(url) || /^data:image\//i.test(url) || /^\/campus-life\/post-\d{3}\.svg$/i.test(url)) {
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
  const [imageFailed, setImageFailed] = useState(false);
  const [showMockProfile, setShowMockProfile] = useState(false);
  const [friendRequested, setFriendRequested] = useState(false);
  const [messageRequested, setMessageRequested] = useState(false);

  const isOpportunity = OPPORTUNITY_TYPES.has(item.type) || Boolean((item as any).opportunityCategory);
  const isMockCampusPost = item.type === 'campus_life' && (item as any).isMock === true;
  const stableStats = getStableSocialStats(String(item.id));
  const displayLikes = Math.min(187, stableStats.likes + (item.likedByUser ? 1 : 0));
  const isRtl = language === 'ar' || language === 'ku';

  // Campus Life reads like a social caption; it should not prepend a generic poster headline.
  const title = isMockCampusPost ? '' : cleanText(getLocalizedContent(item, 'title', language), item.titleEN || 'Jamiaati Post');
  const body = cleanText(getLocalizedContent(item, 'content', language), item.contentEN || '');

  const caption = (() => {
    if (title && body && title !== body) return `${title}\n${body}`;
    return body || title;
  })();

  const imageUrl = imageFailed ? '' : getImageUrl(item);
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
  const authorInitials = item.author.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0))
    .join('');

  const openMockProfile = () => {
    setShowMockProfile(true);
  };

  const getAuthToken = () => localStorage.getItem('jamiaati_token') || localStorage.getItem('admin_token') || '';

  const getTargetUserId = () => {
    const possibleId = String(
      item.author?.id ||
      (item as any).author_id ||
      (item as any).authorId ||
      ''
    ).trim();

    return possibleId;
  };

  const isRealRegisteredTarget = () => {
    const targetUserId = getTargetUserId();
    if (!targetUserId) return false;

    const lowerId = targetUserId.toLowerCase();
    const isDemo =
      lowerId.startsWith('mock') ||
      lowerId.startsWith('demo') ||
      lowerId.startsWith('campus') ||
      lowerId.includes('mock-profile') ||
      item.author?.isMockProfile === true;

    return !isDemo;
  };

  const sendRealFriendRequest = async () => {
    if (friendRequested) return;

    const token = getAuthToken();
    if (!token || token.startsWith('mock_token_')) {
      alert('Please sign in first to send a real friend request.');
      return;
    }

    const targetUserId = getTargetUserId();

    if (!isRealRegisteredTarget()) {
      alert('This is a demo Campus Life profile. Real friend requests are available for registered students.');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/friend-requests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetUserId,
          message: `Hi ${item.author?.name || 'there'}, I would like to connect on Jamiaati.`
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok && response.status !== 409) {
        throw new Error(data.error || 'Failed to send friend request');
      }

      setFriendRequested(true);
    } catch (error: any) {
      alert(error.message || 'Failed to send friend request.');
    }
  };

  const sendRealMessageRequest = async () => {
    if (messageRequested) return;

    const token = getAuthToken();
    if (!token || token.startsWith('mock_token_')) {
      alert('Please sign in first to send a real message request.');
      return;
    }

    const targetUserId = getTargetUserId();

    if (!isRealRegisteredTarget()) {
      alert('This is a demo Campus Life profile. Real message requests are available for registered students.');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/message-requests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetUserId,
          body: `Hi ${item.author?.name || 'there'}, I would like to connect with you on Jamiaati.`
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok && response.status !== 409) {
        throw new Error(data.error || 'Failed to send message request');
      }

      setMessageRequested(true);
    } catch (error: any) {
      alert(error.message || 'Failed to send message request.');
    }
  };


  return (
    <article
      id={`feed-card-${item.id}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      className="opportunity-readable-card mb-5 overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm"
    >
      {isMockCampusPost && (
        <div className="flex items-center gap-3 border-b border-orange-50 px-4 py-3" dir="auto">
          <button type="button" onClick={openMockProfile} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-400 text-sm font-black text-white shadow-sm" aria-label={`View ${item.author.name}'s demo profile`}>
            {authorInitials}
          </button>
          <button type="button" onClick={openMockProfile} className="min-w-0 flex-1 text-start">
            <div className="truncate text-[13px] font-black text-slate-900">{item.author.name}</div>
            <div className="truncate text-[10px] font-bold text-slate-500">
              {item.author.university} · {item.location}
            </div>
            <div className="truncate text-[9px] font-bold text-violet-700">
              @{item.author.username} · {item.author.major} · {item.author.studentYear}
            </div>
          </button>
          <span className="rounded-full bg-violet-50 px-2 py-1 text-[9px] font-black text-violet-700">DEMO</span>
        </div>
      )}

      {imageUrl && !isOpportunity ? (
        <div className="relative w-full overflow-hidden bg-slate-100">
          <img
            src={imageUrl}
            alt={item.imageAlt || title}
            className="block w-full max-h-[520px] object-cover bg-slate-100"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
          />
        </div>
      ) : isOpportunity ? (
        <div className="opportunity-type-badge relative flex min-h-[340px] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-orange-100 via-orange-200 to-orange-400 px-6 py-10 text-center text-[#3b2208]">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_left,_#ffffff_0,_transparent_30%),radial-gradient(circle_at_bottom_right,_#fdba74_0,_transparent_34%)]" />
          <div className="relative z-10">
            <div className="mb-4 inline-flex rounded-full bg-orange-500 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-900 shadow">
              {item.type === 'scholarship' ? 'Scholarship' : item.type === 'internship' ? 'Internship' : 'Job Opportunity'}
            </div>
            <h2 className="text-5xl font-black leading-[1.02] tracking-tight">
              {title}
            </h2>
            <>
              <p className="opportunity-duty-station-badge mt-4 text-base font-black text-[#6b3a10]" style={{ backgroundColor: "#0f172a", color: "#ffffff", WebkitTextFillColor: "#ffffff" }}>
                <span className="opportunity-company-black">{cleanText(item.company || item.author?.name || item.location || 'Iraq', 'Iraq')}</span>
              </p>
              <div className="mt-3 inline-flex rounded-lg bg-slate-900 px-3 py-1.5 shadow-md">
                <span className="text-[10px] font-black uppercase tracking-wider text-white">
                  DUTY STATION: {String((item as any).duty_station || item.governorateId || 'MULTIPLE / REMOTE / UNSPECIFIED').toUpperCase()}
                </span>
              </div>
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
      ) : isMockCampusPost ? (
        <div
          className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400 px-8 text-center text-white"
          role="img"
          aria-label={item.imageAlt || item.moodTag || 'Colorful Campus Life illustration'}
        >
          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-14 -right-8 h-48 w-48 rounded-full bg-yellow-200/20" />
          <div className="relative">
            <div className="mb-3 text-5xl">✨</div>
            <div className="text-lg font-black">{item.moodTag || 'Campus Life'}</div>
            <div className="mt-2 text-xs font-bold text-white/80">StudentHUB Campus Moment</div>
          </div>
        </div>
      ) : null}

      <div className="px-4 py-3">
        <p className={`whitespace-pre-line text-[14px] font-semibold leading-relaxed text-slate-900 ${!showFullCaption ? 'line-clamp-4' : ''}`}>
          {caption}
        </p>

        {isMockCampusPost && (item as any).cta && (
          <div className="mt-3 rounded-2xl bg-gradient-to-r from-violet-50 to-orange-50 px-3 py-2 text-[11px] font-black text-violet-800" dir="auto">
            💬 {(item as any).cta}
          </div>
        )}

        {isMockCampusPost && (
          <div className="mt-3 grid grid-cols-3 gap-2" dir="auto">
            <button type="button" onClick={openMockProfile} className="flex items-center justify-center gap-1 rounded-xl border border-violet-200 bg-violet-50 px-2 py-2 text-[9px] font-black text-violet-800">
              <UserRound className="h-3.5 w-3.5" /> View profile
            </button>
            <button type="button" onClick={sendRealFriendRequest} className="flex items-center justify-center gap-1 rounded-xl border border-blue-200 bg-blue-50 px-2 py-2 text-[9px] font-black text-blue-800">
              <UserPlus className="h-3.5 w-3.5" /> {friendRequested ? 'Request sent' : 'Add friend'}
            </button>
            <button type="button" onClick={sendRealMessageRequest} className="flex items-center justify-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-2 py-2 text-[9px] font-black text-emerald-800">
              <Send className="h-3.5 w-3.5" /> {messageRequested ? 'Request sent' : 'Message'}
            </button>
          </div>
        )}

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
              <span>{displayLikes}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowComments(prev => !prev)}
              className="flex items-center gap-1.5 text-[12px] font-black"
              aria-label="Comment"
            >
              <MessageSquare className="h-5 w-5" />
              <span>{stableStats.comments}</span>
            </button>

            <button
              type="button"
              onClick={sharePost}
              className="flex items-center gap-1.5 text-[12px] font-black"
              aria-label="Share"
            >
              <Share2 className="h-5 w-5" />
              <span>{copied ? 'Copied' : stableStats.shares}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onSave(item.id)}
            className="text-slate-700"
            aria-label="Save"
          >
            <span className="flex items-center gap-1 text-[12px] font-black">
              <Bookmark className={`h-5 w-5 ${item.savedByUser ? 'fill-orange-400 text-orange-500' : ''}`} />
              {Math.min(22, stableStats.saves + (item.savedByUser ? 1 : 0))}
            </span>
          </button>
        </div>

        {showComments && (
          <div className="mt-3 space-y-2">
            {item.commentsList?.map(comment => (
              <div key={comment.id} className="rounded-2xl bg-orange-50/60 px-3 py-2" dir="auto">
                <div className="text-[10px] font-black text-slate-800">{comment.authorName}</div>
                <div className="mt-0.5 text-[11px] font-semibold leading-relaxed text-slate-600">{comment.content}</div>
              </div>
            ))}
          <form onSubmit={submitComment} className="flex gap-2">
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
          </div>
        )}
      </div>

      {isMockCampusPost && showMockProfile && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4" onClick={() => setShowMockProfile(false)}>
          <section className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl" dir="auto" onClick={event => event.stopPropagation()} aria-label="Demo student profile">
            <div className="flex items-start gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-400 text-xl font-black text-white">{authorInitials}</div>
              <div className="min-w-0 flex-1">
                <div className="text-base font-black text-slate-950">{item.author.name}</div>
                <div className="text-[11px] font-bold text-violet-700">@{item.author.username}</div>
                <div className="mt-1 text-[10px] font-bold text-slate-500">{item.author.university} · {item.author.governorate || item.location}</div>
              </div>
              <button type="button" onClick={() => setShowMockProfile(false)} className="rounded-full bg-slate-100 p-2" aria-label="Close profile"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-[11px] font-semibold leading-relaxed text-slate-700">
              <div className="font-black text-slate-950">{item.author.major} · {item.author.studentYear}</div>
              <p className="mt-1">{item.author.bio}</p>
            </div>
            <div className="mt-3">
              <div className="text-[10px] font-black uppercase tracking-wide text-slate-500">Recent Campus Life post</div>
              <p className="mt-1 line-clamp-3 rounded-2xl border border-orange-100 p-3 text-[11px] font-semibold leading-relaxed text-slate-700">{body}</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={sendRealFriendRequest} className="rounded-xl bg-blue-600 px-3 py-3 text-[11px] font-black text-white">{friendRequested ? 'Friend request sent' : 'Add friend'}</button>
              <button type="button" onClick={sendRealMessageRequest} className="rounded-xl bg-emerald-600 px-3 py-3 text-[11px] font-black text-white">{messageRequested ? 'Message request sent' : 'Message request'}</button>
            </div>
            <p className="mt-3 text-center text-[9px] font-bold text-slate-400">Real requests work with registered student profiles</p>
          </section>
        </div>
      )}
    </article>
  );
}





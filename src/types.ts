export type Language = 'en' | 'ar' | 'ku';

export interface Governorate {
  id: string;
  nameEN: string;
  nameAR: string;
  nameKU: string;
}

export interface University {
  id: string;
  nameEN: string;
  nameAR: string;
  nameKU: string;
  governorateId: string;
  logo: string;
  color: string;
}

export interface Author {
  name: string;
  role: 'student' | 'graduate' | 'teacher' | 'staff' | 'institution';
  avatar: string;
  verified?: boolean;
  university?: string;
}

export interface PollOption {
  id: string;
  textEN: string;
  textAR: string;
  textKU: string;
  votes: number;
}

export interface Comment {
  id: string;
  authorName: string;
  authorRole: 'student' | 'graduate' | 'teacher' | 'staff' | 'institution';
  authorAvatar: string;
  content: string;
  date: string;
  likes?: number;
  
  // Translation Support Data Model
  original_language?: Language;
  content_original?: string;
  content_ar?: string;
  content_ku?: string;
  content_en?: string;
}

export interface FeedItem {
  id: string;
  type:
    | 'post'
    | 'video'
    | 'photo'
    | 'story'
    | 'poll'
    | 'anonymous_question'
    | 'announcement'
    | 'job'
    | 'internship'
    | 'scholarship'
    | 'training'
    | 'event'
    | 'study_group'
    | 'local_service'
    | 'part_time_job'
    | 'full_time_job'
    | 'volunteering'
    | 'competition'
    | 'graduation_project_support'
    | 'fellowship'
    | 'exam'
    | 'campus_life'
    | 'question'
    | 'club'
    | 'admission'
    | 'general';
  
  // Localized Content
  titleEN: string;
  titleAR: string;
  titleKU: string;
  contentEN: string;
  contentAR: string;
  contentKU: string;
  
  // Translation Support Data Model
  original_language?: Language;
  title_original?: string;
  body_original?: string;
  caption_original?: string;
  title_ar?: string;
  body_ar?: string;
  caption_ar?: string;
  title_ku?: string;
  body_ku?: string;
  caption_ku?: string;
  title_en?: string;
  body_en?: string;
  caption_en?: string;
  
  // Meta
  author: Author;
  date: string; // e.g. '3 hours ago' / '٣ ساعات مضت'
  rawDate?: string; // ISO date for sorting
  likes: number;
  commentsCount: number;
  commentsList: Comment[];
  likedByUser?: boolean;
  savedByUser?: boolean;
  views?: number;
  tags?: string[];
  isNew?: boolean;
  original_source_url?: string;
  application_link?: string;
  country?: string;
  
  // Relations
  universityId?: string; // 'all' or specific
  governorateId?: string; // 'all' or specific
  
  // Specific Type Data
  videoUrl?: string; // Placeholder ratio string or actual link
  videoThumbnail?: string;
  imageUrl?: string;
  
  // For Polls
  pollOptions?: PollOption[];
  pollVotedId?: string;
  
  // For Jobs / Internships / Scholarships
  company?: string;
  companyLogo?: string;
  salary?: string;
  location?: string; // Localized location string e.g. 'Baghdad'
  deadline?: string;
  applied?: boolean;
  
  // Upgraded rich opportunity details
  opportunityCategory?: 'Internship' | 'Part-time job' | 'Full-time graduate job' | 'Training' | 'Scholarship' | 'Volunteering' | 'Competition' | 'Graduation project support';
  workplaceType?: 'Remote' | 'On-site' | 'Hybrid';
  whoCanApply?: string;
  savedCount?: number;
  universityAppliedCount?: number;
  companyVerified?: boolean;
  applyUrl?: string;
  sourceUrl?: string;
  
  // For Events / Calendar
  eventDate?: string; // e.g., 'Thursday, June 18'
  eventTime?: string; // e.g., '10:00 AM'
  eventVenue?: string; // e.g., 'Central Hall, University of Baghdad'
  eventRsvped?: boolean;
  eventRsvpCount?: number;

  // Study group details
  subject?: string;
  memberCount?: number;
  joined?: boolean;
  
  // Local services Details
  serviceCategory?: 'cafe' | 'photocopy' | 'dorm' | 'stationery' | 'restaurant' | 'gym';
  serviceRating?: number;
  serviceDistance?: string; // e.g., '50m from gate'
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  role: 'student' | 'graduate' | 'teacher' | 'staff' | 'institution';
  universityId: string;
  governorateId: string;
  bioEN: string;
  bioAR: string;
  bioKU: string;
  majorEN: string;
  majorAR: string;
  majorKU: string;
  points: number; // gamification points (e.g. for asking, answering, RSVP)
  level: number;
  savedItemIds: string[];
  appliedJobIds: string[];
  joinedGroupIds: string[];
  rsvpedEventIds: string[];
}

export function healMojibake(str: string): string {
  if (!str || typeof str !== 'string') return str;
  // If the string contains classic mojibake Latin-1 character sequences
  if (/[ØÙÚÛÃùûüýþÿ]/.test(str)) {
    try {
      const bytes = new Uint8Array(str.length);
      let isValidLatin1 = true;
      for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if (code <= 255) {
          bytes[i] = code;
        } else {
          isValidLatin1 = false;
          break;
        }
      }
      if (isValidLatin1) {
        const decoded = new TextDecoder('utf-8').decode(bytes);
        // If healed text contains Arabic/Kurdish characters, return it
        if (/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(decoded)) {
          return decoded;
        }
      }
    } catch (e) {
      // Fallback
    }
  }
  return str;
}

export function getLocalizedContent(
  item: any,
  field: string,
  selectedLanguage: 'en' | 'ar' | 'ku',
  showOriginal?: boolean
): string {
  if (!item) return '';

  const getKeysForLang = (lang: 'en' | 'ar' | 'ku') => {
    if (field === 'title') {
      return lang === 'ar' ? ['title_ar', 'titleAR'] : lang === 'ku' ? ['title_ku', 'titleKU'] : ['title_en', 'titleEN'];
    }
    if (field === 'body' || field === 'content') {
      return lang === 'ar' ? ['body_ar', 'bodyAR', 'content_ar', 'contentAR'] : lang === 'ku' ? ['body_ku', 'bodyKU', 'content_ku', 'contentKU'] : ['body_en', 'bodyEN', 'content_en', 'contentEN'];
    }
    // Dynamic naming support for other fields (e.g., whoCanApply, etc.)
    const keySnake = `${field}_${lang}`;
    const keyCamelEn = `${field}${lang === 'en' ? 'EN' : lang === 'ar' ? 'AR' : 'KU'}`;
    return [keySnake, keyCamelEn];
  };

  const getOriginalKeys = () => {
    if (field === 'title') return ['title_original', 'titleOriginal'];
    if (field === 'body' || field === 'content') return ['body_original', 'bodyOriginal', 'content_original', 'contentOriginal'];
    const keySnake = `${field}_original`;
    const keyCamel = `${field}Original`;
    return [keySnake, keyCamel];
  };

  const getRawKeys = () => {
    if (field === 'body' || field === 'content') return ['body', 'content'];
    return [field];
  };

  const getValueForKeys = (keys: string[]): string | undefined => {
    for (const key of keys) {
      if (item[key] !== undefined && item[key] !== null && String(item[key]).trim() !== '') {
        return String(item[key]);
      }
    }
    return undefined;
  };

  const finalValue = (() => {
    // If showOriginal is requested, prioritize original
    if (showOriginal) {
      // 1. Try original version of the field
      const origVal = getValueForKeys(getOriginalKeys());
      if (origVal !== undefined) return origVal;

      // 2. Try the language specified in original_language
      if (item.original_language && (item.original_language === 'ar' || item.original_language === 'ku' || item.original_language === 'en')) {
        const origLangVal = getValueForKeys(getKeysForLang(item.original_language));
        if (origLangVal !== undefined) return origLangVal;
      }
    }

    // Fallback priority:
    // 1. Selected language version
    const selectedVal = getValueForKeys(getKeysForLang(selectedLanguage));
    if (selectedVal !== undefined) return selectedVal;

    // 2. Original version
    const origVal = getValueForKeys(getOriginalKeys());
    if (origVal !== undefined) return origVal;

    // 2b. If item has original_language, try that
    if (item.original_language && (item.original_language === 'ar' || item.original_language === 'ku' || item.original_language === 'en')) {
      const origLangVal = getValueForKeys(getKeysForLang(item.original_language));
      if (origLangVal !== undefined) return origLangVal;
    }

    // 3. Arabic version
    const arVal = getValueForKeys(getKeysForLang('ar'));
    if (arVal !== undefined) return arVal;

    // 4. Kurdish Sorani version
    const kuVal = getValueForKeys(getKeysForLang('ku'));
    if (kuVal !== undefined) return kuVal;

    // 5. English version
    const enVal = getValueForKeys(getKeysForLang('en'));
    if (enVal !== undefined) return enVal;

    // 6. Existing raw field
    const rawVal = getValueForKeys(getRawKeys());
    if (rawVal !== undefined) return rawVal;

    return '';
  })();

  return healMojibake(finalValue);
}

export function hasAlternativeLanguages(item: any, currentLanguage: 'en' | 'ar' | 'ku'): boolean {
  if (!item) return false;
  
  const hasAr = (item.titleAR && item.titleAR.trim() !== '') || (item.contentAR && item.contentAR.trim() !== '') || (item.title_ar && item.title_ar.trim() !== '') || (item.body_ar && item.body_ar.trim() !== '') || (item.caption_ar && item.caption_ar.trim() !== '') || (item.content_ar && item.content_ar.trim() !== '');
  const hasKu = (item.titleKU && item.titleKU.trim() !== '') || (item.contentKU && item.contentKU.trim() !== '') || (item.title_ku && item.title_ku.trim() !== '') || (item.body_ku && item.body_ku.trim() !== '') || (item.caption_ku && item.caption_ku.trim() !== '') || (item.content_ku && item.content_ku.trim() !== '');
  const hasEn = (item.titleEN && item.titleEN.trim() !== '') || (item.contentEN && item.contentEN.trim() !== '') || (item.title_en && item.title_en.trim() !== '') || (item.body_en && item.body_en.trim() !== '') || (item.caption_en && item.caption_en.trim() !== '') || (item.content_en && item.content_en.trim() !== '');
  
  const hasOriginal = (item.title_original && item.title_original.trim() !== '') || (item.body_original && item.body_original.trim() !== '') || (item.caption_original && item.caption_original.trim() !== '') || (item.content_original && item.content_original.trim() !== '');

  if (currentLanguage === 'ar') {
    return !!(hasKu || hasEn || hasOriginal);
  } else if (currentLanguage === 'ku') {
    return !!(hasAr || hasEn || hasOriginal);
  } else {
    return !!(hasAr || hasKu || hasOriginal);
  }
}

// Social Networking & Messaging Types
export interface SocialRecipient {
  id: string;
  name: string;
  full_name?: string;
  email?: string;
  role: string;
  avatar_url?: string;
}

export interface FriendRequestItem {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  created_at: string;
  updated_at: string;
  requester_name?: string;
  requester_avatar?: string;
  requester_email?: string;
  recipient_name?: string;
  recipient_avatar?: string;
  recipient_email?: string;
  senderName?: string;
  senderAvatar?: string;
  senderUni?: string;
}

export interface FriendRequestsResponse {
  incoming: FriendRequestItem[];
  outgoing: FriendRequestItem[];
}

export interface SendFriendRequestResponse {
  request: FriendRequestItem;
  recipient: SocialRecipient;
}

export interface MessageRequestItem {
  id: string;
  threadId: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  body: string;
  recipientId?: string;
  recipientName?: string;
  recipientAvatar?: string;
  recipientEmail?: string;
  senderEmail?: string;
  status?: string;
  created_at?: string;
}

export interface MessageRequestsResponse {
  incoming: MessageRequestItem[];
  outgoing: MessageRequestItem[];
}

export interface MessageThread {
  id: string;
  type?: string;
  status?: string;
  requester_id?: string;
  recipient_id?: string;
  last_message_at?: string;
  other_user_id?: string;
  other_name?: string;
  other_email?: string;
  last_message?: string;
}

export interface MessageThreadsResponse {
  threads: MessageThread[];
}

export interface MessageItem {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  status: string;
  created_at: string;
  deleted_at?: string;
  sender_name?: string;
  sender_role?: string;
}

export interface ThreadMessagesResponse {
  thread: MessageThread;
  messages: MessageItem[];
}


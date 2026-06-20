import React, { useState, useEffect, useMemo } from 'react';
import { FeedItem, Language, University } from '../types';
import { getTranslation } from '../data/translations';
import { initialFeedItems, defaultUserProfile, IraqiUniversities, IraqiGovernorates } from '../data/mockData';
import { campusLifeFeedItems } from '../data/campusLifeMockPosts';
import { Sparkles, MessageSquare, Briefcase, PlusCircle, CheckCircle, Info, Image, EyeOff, MapPin, School, Palette, X, Calendar, Megaphone, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import FeedCard from './FeedCard';
import StudentStories from './StudentStories';
import { getOpportunities, heroImagesApi } from '../lib/api';
import { cleanDisplayText } from '../utils/safeText';
import { compressImageToDataUrl } from '../utils/imageCompression';

const DEFAULT_HERO_IMAGES: string[] = [
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1920',
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1920',
  'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1920',
  'https://images.unsplash.com/photo-1607237138185-eedd9c632b0e?auto=format&fit=crop&q=80&w=1920',
  'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&q=80&w=1920'
];

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

interface HomeFeedProps {
  feedItems: FeedItem[];
  language: Language;
  selectedGov: string;
  setSelectedGov: (id: string) => void;
  selectedUni: string;
  setSelectedUni: (id: string) => void;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onVote: (itemId: string, optionId: string) => void;
  onApply: (id: string) => void;
  onRsvp: (id: string) => void;
  onJoinGroup: (id: string) => void;
  onAddComment: (id: string, commentText: string) => void;
  onNavigateTab: (tabId: 'home' | 'life' | 'ask' | 'future' | 'profile' | 'admin') => void;
  onAddNewPost: (title: string, body: string, anonymous: boolean, customType?: string, imageUrl?: string, governorateId?: string, universityId?: string) => void;
  isFeedLoading?: boolean;
  onAwardPoints?: (points: number) => void;
  showToast?: (text: string, type?: 'success' | 'error' | 'info') => void;
  institutions?: University[];
  institutionsLoading?: boolean;
  institutionsError?: string | null;
  onRetryInstitutions?: () => void;
  onEditFeedItem?: (id: string, updatedFields: Partial<FeedItem>) => void;
  onDeleteFeedItem?: (id: string) => void;
  isAdminMode?: boolean;
  onSelectSection?: (sectionId: string) => void;
  onUserClick?: (user: any) => void;
}

// Global reuseable beautiful pulse Skeleton Loader
export function SkeletonLoader() {
  return (
    <div className="flex flex-col gap-4 w-full select-none" id="jamiaati-skeleton-loader">
      {[1, 2].map(i => (
        <div 
          key={i} 
          className="bg-[#121B2E] rounded-3xl border border-[#1F2E4D] p-5 mb-1 relative flex flex-col gap-4 animate-pulse overflow-hidden"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#1F2E4D]/80 rounded-xl shrink-0" />
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="h-3 bg-[#1F2E4D]/80 rounded-md w-1/3" />
              <div className="h-2.5 bg-[#1F2E4D]/50 rounded-md w-1/2" />
            </div>
            <div className="w-16 h-5.5 bg-[#1F2E4D]/60 rounded-xl" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-3 bg-[#1F2E4D]/75 rounded-md w-full" />
            <div className="h-3 bg-[#1F2E4D]/75 rounded-md w-5/6" />
            <div className="h-3 bg-[#1F2E4D]/44 rounded-md w-1/2" />
          </div>
          <div className="flex items-center justify-between border-t border-[#1F2E4D] pt-4 mt-1">
            <div className="flex gap-4">
              <div className="w-11 h-4 bg-[#1F2E4D]/60 rounded-md" />
              <div className="w-11 h-4 bg-[#1F2E4D]/60 rounded-md" />
            </div>
            <div className="w-5 h-5 bg-[#1F2E4D]/60 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomeFeed({
  feedItems,
  language,
  selectedGov,
  setSelectedGov,
  selectedUni,
  setSelectedUni,
  onLike,
  onSave,
  onVote,
  onApply,
  onRsvp,
  onJoinGroup,
  onAddComment,
  onNavigateTab,
  onAddNewPost,
  isFeedLoading = false,
  onAwardPoints,
  showToast,
  institutions = [],
  institutionsLoading = false,
  institutionsError = null,
  onRetryInstitutions,
  onEditFeedItem,
  onDeleteFeedItem,
  isAdminMode = false,
  onSelectSection,
  onUserClick
}: HomeFeedProps) {
   // Custom Story-based categories filter state
  const [activeStoryFilter, setActiveStoryFilter] = useState<string | null>(null);
  const [selectedFeedTab, setSelectedFeedTab] = useState<'opportunities' | 'campus_life'>('campus_life');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedOppFilter, setSelectedOppFilter] = useState<'all' | 'job' | 'scholarship' | 'training' | 'admission' | 'announcement' | 'news' | 'deadline' | 'internship'>('all');
  const [selectedCampusFilter, setSelectedCampusFilter] = useState<'all' | 'post' | 'event' | 'club' | 'question' | 'study_group' | 'friends'>('all');
  const [postCategory, setPostCategory] = useState<string>('campus_life');
  const [postGov, setPostGov] = useState<string>(selectedGov !== 'all' ? selectedGov : defaultUserProfile.governorateId);
  const [postUni, setPostUni] = useState<string>(selectedUni !== 'all' ? selectedUni : defaultUserProfile.universityId);
  const [friendRequestsSent, setFriendRequestsSent] = useState<string[]>([]);
  const [activeStoryViewer, setActiveStoryViewer] = useState<any | null>(null);
  const [messageRequestsSent, setMessageRequestsSent] = useState<string[]>([]);
  const [feedSearchQuery, setFeedSearchQuery] = useState('');
  const [backendOpportunities, setBackendOpportunities] = useState<FeedItem[]>([]);
  const [isLoadingBackend, setIsLoadingBackend] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const INITIAL_OPPORTUNITY_LIMIT = 12;
  const INITIAL_CAMPUS_LIMIT = 8;
  const LOAD_MORE_STEP = 12;
  const [visibleItemsCount, setVisibleItemsCount] = useState(INITIAL_CAMPUS_LIMIT);

  useEffect(() => {
    setVisibleItemsCount(selectedFeedTab === 'opportunities' ? INITIAL_OPPORTUNITY_LIMIT : INITIAL_CAMPUS_LIMIT);
  }, [selectedFeedTab, selectedOppFilter, selectedCampusFilter, selectedGov, selectedUni, activeStoryFilter, feedSearchQuery]);
  
  const studentsToDiscover: any[] = [];

  const normalizeHomeGovernorateId = (raw: any): string => {
    const text = String(raw || '').trim().toLowerCase();

    if (!text || text === 'all' || text === 'iraq' || text === 'all iraq' || text === 'iraq-wide') return 'all';

    const aliases: Record<string, string[]> = {
      baghdad: ['baghdad', 'بغداد'],
      erbil: ['erbil', 'hawler', 'هەولێر', 'اربيل', 'أربيل'],
      basra: ['basra', 'basrah', 'البصرة'],
      sulaymaniyah: ['sulaymaniyah', 'sulaimani', 'sulaimaniyah', 'slemani', 'سلێمانی', 'السليمانية'],
      nineveh: ['nineveh', 'mosul', 'ninhava', 'نينوى', 'الموصل'],
      duhok: ['duhok', 'dohuk', 'دهوك', 'دهۆک'],
      kirkuk: ['kirkuk', 'كركوك'],
      anbar: ['anbar', 'الانبار', 'الأنبار'],
      diyala: ['diyala', 'ديالى'],
      salah_al_din: ['salah', 'salah al-din', 'صلاح الدين'],
      najaf: ['najaf', 'النجف'],
      karbala: ['karbala', 'kerbala', 'كربلاء'],
      babil: ['babil', 'babylon', 'بابل'],
      wasit: ['wasit', 'واسط'],
      maysan: ['maysan', 'missan', 'ميسان'],
      dhi_qar: ['dhi qar', 'thi qar', 'ذي قار'],
      muthanna: ['muthanna', 'المثنى'],
      al_qadisiyah: ['qadisiyah', 'qadisiyyah', 'diwaniyah', 'القادسية', 'الديوانية'],
      halabja: ['halabja', 'حلبجة', 'هەڵەبجە']
    };

    for (const [govId, names] of Object.entries(aliases)) {
      if (text === govId || names.some(alias => text.includes(alias.toLowerCase()))) return govId;
    }

    return text.replace(/\s+/g, '_').replace(/-/g, '_').replace(/[^\w_]/g, '');
  };


  // Safe mapper for backend opportunities to FeedItem shape
  const mapBackendOpportunity = (item: any): FeedItem => {
    const categoryRaw = (item.category || item.type || 'job').toLowerCase();
    
    let displayCategory = 'Full-time graduate job';
    if (categoryRaw.includes('intern')) {
      displayCategory = 'Internship';
    } else if (categoryRaw.includes('scholar')) {
      displayCategory = 'Scholarship';
    } else if (categoryRaw.includes('train')) {
      displayCategory = 'Training';
    } else if (categoryRaw.includes('volun')) {
      displayCategory = 'Volunteering';
    } else if (categoryRaw.includes('compete') || categoryRaw.includes('competition')) {
      displayCategory = 'Competition';
    } else if (categoryRaw.includes('exam')) {
      displayCategory = 'Exam';
    } else if (categoryRaw.includes('announc')) {
      displayCategory = 'Announcement';
    } else if (categoryRaw.includes('fellow')) {
      displayCategory = 'Fellowship';
    } else if (categoryRaw.includes('graduation') || categoryRaw.includes('project')) {
      displayCategory = 'Graduation project support';
    }

    const titleEN = cleanDisplayText(item.titleEN || item.title || item.title_en, 'Public Opportunity', categoryRaw);
    const titleAR = cleanDisplayText(item.titleAR || item.title_ar || item.title, titleEN, categoryRaw);
    const titleKU = cleanDisplayText(item.titleKU || item.title_ku || item.title, titleEN, categoryRaw);

    const contentEN = cleanDisplayText(item.contentEN || item.description || item.summary || item.description_en, 'View details of this public opportunity.', categoryRaw);
    const contentAR = cleanDisplayText(item.contentAR || item.description_ar || item.description || item.summary, contentEN, categoryRaw);
    const contentKU = cleanDisplayText(item.contentKU || item.description_ku || item.description || item.summary, contentEN, categoryRaw);

    const orgName = item.organization || item.institution_name || item.company || 'Recruiter/Provider';
    const gov = normalizeHomeGovernorateId(item.governorateId || item.governorate || item.location || item.city || item.duty_station || item.work_location);
    const country = item.country || 'Iraq';
    const city = item.city || '';
    
    const locationParts = [city, gov !== 'all' ? gov : '', country].filter(Boolean);
    const locationStr = locationParts.length > 0 ? locationParts.join(', ') : 'Iraq';

    const resolvedOpportunityUrl = (() => {
      const stringifyValue = (value: any): string => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        try {
          return JSON.stringify(value);
        } catch {
          return String(value || '');
        }
      };

      const cleanUrlCandidate = (value: any): string => {
        return String(value || '')
          .trim()
          .replace(/[)\].,;]+$/g, '');
      };

      const directCandidates = [
        item.applyUrl,
        item.sourceUrl,
        item.apply_url,
        item.source_url,
        item.details_url,
        item.detailsUrl,
        item.application_link,
        item.application_url,
        item.apply_link,
        item.url,
        item.link,
        item.external_url,
        item.original_source_url,
        item.original_url,
        item.raw_url,
        item.raw_item_url,
        item.candidate_url,
        item.source_link,
        item.source?.url,
        item.raw?.url,
        item.metadata?.url,
        item.metadata?.source_url,
        item.metadata?.application_link
      ];

      const textBlob = [
        item.description,
        item.summary,
        item.content,
        item.contentEN,
        item.contentAR,
        item.contentKU,
        item.body,
        item.body_original,
        item.raw_text,
        item.notes,
        item.metadata,
        item.raw
      ].map(stringifyValue).join('\n');

      const extractedMatch = textBlob.match(/https?:\/\/[^\s<>"')\]]+/i);
      if (extractedMatch) directCandidates.push(extractedMatch[0]);

      for (const candidate of directCandidates) {
        const cleaned = cleanUrlCandidate(candidate);
        if (/^https?:\/\//i.test(cleaned)) {
          return cleaned;
        }
      }

      return '';
    })();

    const applyUrl = resolvedOpportunityUrl;
    const sourceUrl = resolvedOpportunityUrl;
    const imgUrl = item.image_url || item.imageUrl || '';

    const safeImageUrl = imgUrl && !imgUrl.includes('images.unsplash.com') ? imgUrl : '';

    return {
      id: String(item.id),
      type: categoryRaw,
      titleEN,
      titleAR,
      titleKU,
      contentEN,
      contentAR,
      contentKU,
      original_language: item.original_language || item.originalLanguage,
      title_original: item.title_original || item.titleOriginal || item.title,
      body_original: item.body_original || item.bodyOriginal || item.content_original || item.contentOriginal || item.description || item.summary,
      caption_original: item.caption_original || item.captionOriginal,
      title_ar: item.title_ar || item.titleAR || titleAR,
      body_ar: item.body_ar || item.bodyAR || item.content_ar || item.contentAR || contentAR,
      caption_ar: item.caption_ar || item.captionAR,
      title_ku: item.title_ku || item.titleKU || titleKU,
      body_ku: item.body_ku || item.bodyKU || item.content_ku || item.contentKU || contentKU,
      caption_ku: item.caption_ku || item.captionKU,
      title_en: item.title_en || item.titleEN || titleEN,
      body_en: item.body_en || item.bodyEN || item.content_en || item.contentEN || contentEN,
      caption_en: item.caption_en || item.captionEN,
      author: {
        name: orgName,
        role: 'institution' as const,
        avatar: safeImageUrl || '',
        verified: true
      },
      date: item.published_date ? `Posted on ${item.published_date}` : 'Recently posted 🔔',
      likes: Number(item.likes || 12),
      likedByUser: false,
      savedCount: Number(item.saved_count || 15),
      savedByUser: false,
      commentsCount: 0,
      commentsList: [],
      governorateId: gov,
      country: country,
      universityId: 'all',
      tags: [categoryRaw, displayCategory],
      company: orgName,
      companyLogo: safeImageUrl || '',
      location: locationStr,
      deadline: item.deadline || '',
      imageUrl: safeImageUrl,
      opportunityCategory: displayCategory as any,
      workplaceType: item.workplaceType || 'On-site',
      whoCanApply: item.whoCanApply || 'Interested applicants',
      salary: item.salary || 'Recruiter structured',
      applyUrl,
      sourceUrl,
      universityAppliedCount: Number(item.applied_count || 5),
      applied: false
    };
  };

  // Fetch backend opportunities for the whole Opportunities tab.
  // Do not rely on local mock feed only. Fetch a large approved backend list, then filter locally.
  useEffect(() => {
    if (selectedFeedTab !== 'opportunities') {
      setBackendOpportunities([]);
      return;
    }

    const categoryMap: Record<string, string> = {
      'job': 'job',
      'scholarship': 'scholarship',
      'training': 'training',
      'internship': 'internship',
      'admission': 'admission',
      'announcement': 'announcement',
      'news': 'news',
      'deadline': 'deadline'
    };

    const category = selectedOppFilter !== 'all' ? categoryMap[selectedOppFilter] : undefined;

    setIsLoadingBackend(true);
    setBackendError(null);

    getOpportunities({ category, page: 1, limit: 120 }, language)
      .then((result: any) => {
        const rawItems = Array.isArray(result) ? result : Array.isArray(result?.items) ? result.items : [];
        setBackendOpportunities(rawItems.map(mapBackendOpportunity));
      })
      .catch(err => {
        setBackendError(err.message || 'Failed to load opportunities');
        setBackendOpportunities([]);
      })
      .finally(() => {
        setIsLoadingBackend(false);
      });
  }, [selectedFeedTab, selectedOppFilter, language]);

  const campusLifeCategories = [
    { id: 'campus_guide', labelEN: 'Campus Guide', labelAR: 'دليل الحرم', labelKU: 'ڕێبەری کەمپەس', emoji: '🏛️', color: 'bg-emerald-500', bg: 'from-emerald-400 to-teal-500' },
    { id: 'clubs', labelEN: 'Clubs & Groups', labelAR: 'النوادي والأنشطة', labelKU: 'کۆمەڵە و یانەکان', emoji: '🤝', color: 'bg-orange-500', bg: 'from-orange-400 to-amber-500' },
    { id: 'event', labelEN: 'Events', labelAR: 'الفعاليات', labelKU: 'چالاکییەکان', emoji: '📅', color: 'bg-rose-500', bg: 'from-rose-400 to-pink-500' },
    { id: 'student_tip', labelEN: 'Student Tips', labelAR: 'نصائح الطلاب', labelKU: 'ئامۆژگاری قوتابی', emoji: '💡', color: 'bg-amber-500', bg: 'from-amber-400 to-yellow-500' },
    { id: 'volunteering', labelEN: 'Volunteering', labelAR: 'التطوع', labelKU: 'خۆبەخشی', emoji: '🌱', color: 'bg-[#2F7CCB]', bg: 'from-blue-400 to-indigo-500' },
    { id: 'exams', labelEN: 'Exams & Registration', labelAR: 'الامتحانات والتسجيل', labelKU: 'تاقیکردنەوەکان', emoji: '📝', color: 'bg-violet-500', bg: 'from-violet-400 to-purple-500' },
    { id: 'career_prep', labelEN: 'Career Prep', labelAR: 'التطوير المهني', labelKU: 'ئامادەکاری کار', emoji: '🚀', color: 'bg-teal-500', bg: 'from-teal-400 to-cyan-500' },
    { id: 'university_services', labelEN: 'Uni Services', labelAR: 'الخدمات لطلاب', labelKU: 'خزمەتگوزاری زانکۆ', emoji: '🏫', color: 'bg-indigo-500', bg: 'from-indigo-400 to-violet-500' }
  ];

  const studentsToDiscover_old = useMemo(() => [
    {
      id: 'stu-sarah-ahmed',
      nameEN: 'Sarah Ahmed',
      nameAR: 'سارة أحمد',
      nameKU: 'سارا ئەحمەد',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      universityEN: 'University of Baghdad',
      universityAR: 'جامعة بغداد',
      universityKU: 'زانکۆی بەغدا',
      bioEN: 'Computer engineering undergarduate. Passionate about algorithms and software architecture.',
      bioAR: 'طالبة هندسة حاسبات. شغوفة بالخوارزميات وهيكلة البرمجيات.',
      bioKU: 'خوێندکاری ئەندازیاری کۆمپیوتەر. خولیای زۆرم بۆ دۆزینەوەی چارەسەری زیرەک هەیە.',
      majorEN: 'Computer Engineering',
      majorAR: 'هندسة حاسوب',
      majorKU: 'ئەندازیاری کۆمپیوتەر',
      isOnline: true,
      statusEN: 'Online',
      statusAR: 'متصل الآن',
      statusKU: 'ئێستا لەسەر هێڵە',
      storyImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600',
      storyCaptionEN: 'Study group marathon with hot coffee before the final exams! Wish us luck!',
      storyCaptionAR: 'ماراثون دراسي رائع مع فنجان قهوة ساخن قبل الامتحان! دعواتكم لنا بالنجاح!',
      storyCaptionKU: 'خوێندنی بەکۆمەڵ پێش تاقیکردنەوەکان لەگەڵ قاوەیەکی گەرم! هیوای سەرکەوتن بۆ هەمووان!'
    },
    {
      id: 'stu-ali-hassan',
      nameEN: 'Ali Hassan',
      nameAR: 'علي حسن',
      nameKU: 'عەلی حەسەن',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
      universityEN: 'University of Mosul',
      universityAR: 'جامعة الموصل',
      universityKU: 'زانکۆی موسڵ',
      bioEN: 'Civil engineering student looking to connect for joint graduation project preparation.',
      bioAR: 'طالب هندسة مدنية، يتطلع للمشاركة وبناء مشاريع تخرج إبداعية مشتركة.',
      bioKU: 'خوێندکاری ئەندازیاری شارستانی، بەدوای دەرفەتی هاوبەش دەگەڕێم بۆ کاری پڕۆژە.',
      majorEN: 'Civil Engineering',
      majorAR: 'الهندسة المدنية',
      majorKU: 'ئەندازیاری شارستانی',
      isOnline: true,
      statusEN: 'Online',
      statusAR: 'متصل الآن',
      statusKU: 'ئێستا لەسەر هێڵە',
      storyImage: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600',
      storyCaptionEN: 'Testing soil samples for our civil engineering graduation project at Mosul campus!',
      storyCaptionAR: 'فحص عينات التربة لمشروع تخرج الهندسة المدنية في جامعة الموصل اليوم!',
      storyCaptionKU: 'تاقیکردنەوەی سامپڵەکانی خاک بۆ پڕۆژەی کۆتایی ئەندازیاری شارستانی لە زانکۆی موسڵ!'
    },
    {
      id: 'stu-sara-suli',
      nameEN: 'Sara Ahmed',
      nameAR: 'سارا أحمد',
      nameKU: 'سارا ئەحمەد',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      universityEN: 'University of Sulaimani',
      universityAR: 'جامعة السليمانية',
      universityKU: 'زانکۆی سلێمانی',
      bioEN: 'Undergraduate student in translation. Friendly peer mentor eager to assist you with linguistics.',
      bioAR: 'طالبة ترجمة لغات. مرشدة أكاديمية مستعدة لتقديم المساعدة في اللسانيات.',
      bioKU: 'خوێندکاری بەشی وەرگێڕان. ئامادەم بۆ یارمەتیدانی هاوڕێیان لە بواری زمانەوانی.',
      majorEN: 'Translation & English',
      majorAR: 'الترجمة والإنجليزية',
      majorKU: 'وەرگێڕان و ئینگلیزی',
      isOnline: true,
      statusEN: 'Online',
      statusAR: 'متصل الآن',
      statusKU: 'ئێستا لەسەر هێڵە',
      storyImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600',
      storyCaptionEN: 'Translating modern prose literature under the library study lighting today.',
      storyCaptionAR: 'ترجمة النثر والقصائد الأدبية الحديثة تحت أضواء مكتبة الجامعة الهادئة.',
      storyCaptionKU: 'وەرگێڕانی تێکستە ئەدەبییە نوێیەکان لە ژێر ڕووناکی ئارامی کتێبخانەی زانکۆ.'
    },
    {
      id: 'stu-mohammed-kareem',
      nameEN: 'Mohammed Kareem',
      nameAR: 'محمد كريم',
      nameKU: 'محەمەد کەریم',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      universityEN: 'University of Technology',
      universityAR: 'الجامعة التكنولوجية',
      universityKU: 'زانکۆی تەکنەلۆجیا',
      bioEN: 'Electrical systems engineer. Building IoT hardware prototypes and solar automation modules.',
      bioAR: 'هندسة نظم كهربائية، شغوف بإنشاء نماذج إنترنت الأشياء والتحكم الآلي بالطاقة الشمسية.',
      bioKU: 'ئەندازیاری سیستەمی کارەبا. کار لەسەر پرۆژەی مۆدێرنی ئۆتۆماتیک دەکەم.',
      majorEN: 'Electrical Engineering',
      majorAR: 'الهندسة الكهربائية',
      majorKU: 'ئەندازیاری کارەبا',
      isOnline: true,
      statusEN: 'Online',
      statusAR: 'متصل الآن',
      statusKU: 'ئێستا لەسەر هێڵە',
      storyImage: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=600',
      storyCaptionEN: 'Assembling an IoT hardware prototype with solar automated tracking trackers.',
      storyCaptionAR: 'تجميع نموذج ميكانيكي لإنترنت الأشياء وتتبع ذكي آلي للألواح الشمسية!',
      storyCaptionKU: 'کۆکردنەوەی مۆدێلێکی زیرەک بۆ بەهێزکردنی کۆنترۆڵەری سیستەمی سۆلار!'
    },
    {
      id: 'stu-noor-ali',
      nameEN: 'Noor Ali',
      nameAR: 'نور علي',
      nameKU: 'نوور عەلی',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      universityEN: 'University of Basrah',
      universityAR: 'جامعة البصرة',
      universityKU: 'زانکۆی بەسرە',
      bioEN: 'Information technology enthusiast. Working on responsive mobile applications and front-end designs.',
      bioAR: 'شغوفة بتكنولوجيا المعلومات والبرمجة. تعمل على تطبيقات الهاتف وتصميمات الواجهات.',
      bioKU: 'خولیام بۆ تەکنەلۆجیای زانیارییە. کار لەسەر پۆلی نوێی ئەپڵیکەیشنەکان دەکەم.',
      majorEN: 'Information Technology',
      majorAR: 'تكنولوجيا المعلومات',
      majorKU: 'تەکنەلۆجیای زانیاری',
      isOnline: true,
      statusEN: 'Online',
      statusAR: 'متصل الآن',
      statusKU: 'ئێستا لەسەر هێڵە',
      storyImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600',
      storyCaptionEN: 'Creating custom UI wireframes and configuring deep-link APIs for my project.',
      storyCaptionAR: 'تصميم واجهات مستخدم مخصصة وربط الواجهات الخلفية للتطبيق المحمول!',
      storyCaptionKU: 'دیزاینکردنی ڕوکاری ئەپڵیکەیشن و ڕێکخستنی سیستەمی بەستەرەکان!'
    },
    {
      id: 'stu-rawa-omer',
      nameEN: 'Rawa Omer',
      nameAR: 'روا عمر',
      nameKU: 'رەوا عومەر',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      universityEN: 'Salahaddin University',
      universityAR: 'جامعة أربيل',
      universityKU: 'زانکۆی هەولێر',
      bioEN: 'Software engineer from Erbil. Studying cloud operations and responsive full-stack dashboards.',
      bioAR: 'مطور برمجيات من أربيل، يدرس تكنولوجيا السحاب وإدارة لوحات التحكم المتكاملة.',
      bioKU: 'پەرەپێدەری نەرمەکاڵا لە هەولێر. خوێندکاری چالاکی کلاود و فرە-زمان.',
      majorEN: 'Software Engineering',
      majorAR: 'هندسة البرمجيات',
      majorKU: 'ئەندازیاری نەرمەکاڵا',
      isOnline: true,
      statusEN: 'Online',
      statusAR: 'متصل الآن',
      statusKU: 'ئێستا لەسەر هێڵە',
      storyImage: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=600',
      storyCaptionEN: 'Just deployed custom staging microservices on Kubernetes clusters. Staging complete!',
      storyCaptionAR: 'نجحنا في تفعيل الخدمات المصغرة البرمجية على سحابة كوبرنيتس في أربيل!',
      storyCaptionKU: 'بە سەرکەوتوویی پڕۆژەی کلاودمان لە کەمپەسی هەولێر بڵاوکردەوە!'
    },
    {
      id: 'stu-zainab-mohammed',
      nameEN: 'Zeynab Mohammed',
      nameAR: 'زينب محمد',
      nameKU: 'زەینەب محەمەد',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      universityEN: 'University of Karbala',
      universityAR: 'جامعة كربلاء',
      universityKU: 'زانکۆی کەربەلا',
      bioEN: 'Pharmacy student interested in clinical chemistry and interactive student research forums.',
      bioAR: 'طالبة صيدلة مهتمة بالكيمياء السريرية والندوات التعليمية في الحرم الجامعي.',
      bioKU: 'خوێندکاری دەرمانسازی کە سەرنج دەخاتە سەر پڕۆژە پزیشکییە نوێیەکان.',
      majorEN: 'Pharmacy & Chemistry',
      majorAR: 'الصيدلة والكيمياء',
      majorKU: 'دەرمانسازی و کیمیا',
      isOnline: true,
      statusEN: 'Online',
      statusAR: 'متصل الآن',
      statusKU: 'ئێستا لەسەر هێڵە',
      storyImage: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&q=80&w=600',
      storyCaptionEN: 'Analyzing organic molecular crystals inside the clinical analytical laboratory today.',
      storyCaptionAR: 'تحليل البلورات الجزيئية العضوية في المختبر السريري للكيمياء الصيدلانية.',
      storyCaptionKU: 'شیکردنەوەی پێکهاتە کیمیاییەکان لە تاقیگەی سەرەکی زانکۆی کەربەلا.'
    },
    {
      id: 'stu-dilan-hassan',
      nameEN: 'Dilan Hassan',
      nameAR: 'ديلان حسن',
      nameKU: 'دیلان حەسەن',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
      universityEN: 'University of Duhok',
      universityAR: 'جامعة دهوك',
      universityKU: 'زانکۆی دهۆک',
      bioEN: 'IT student and graphic artist looking to organize student tech bootcamps in Badinan region.',
      bioAR: 'طالب هومات كمبيوتر ومصمم جرافيك، يعمل لتنظيم ورش تقنية لطلاب منطقة بادينان.',
      bioKU: 'خوێندکاری بەشی تەکنەلۆجیا و هونەری دیزاین لە بەهدینان.',
      majorEN: 'Information Systems',
      majorAR: 'نظم المعلومات',
      majorKU: 'سیستەمی زانیاری',
      isOnline: true,
      statusEN: 'Online',
      statusAR: 'متصل الآن',
      statusKU: 'ئێستا لەسەر هێڵە',
      storyImage: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=600',
      storyCaptionEN: 'Drafting new promotional illustrations for Badinan student technology sessions.',
      storyCaptionAR: 'رسم ملصقات ترويجية مبدعة لورشة بادينان لتمكين مهارات تكنولوجيا المعلومات.',
      storyCaptionKU: 'کێشانی پۆستەر و لۆگۆ بۆ خولی داهاتووی فێربوونی کۆمپیوتەر لە بەهدینان.'
    }
  ], []);

  const selectShortcut = (id: string) => {
    if (id === 'job') {
      setSelectedFeedTab('opportunities');
      setSelectedOppFilter('job');
    } else if (id === 'scholarship') {
      setSelectedFeedTab('opportunities');
      setSelectedOppFilter('scholarship');
    } else if (id === 'training') {
      setSelectedFeedTab('opportunities');
      setSelectedOppFilter('training');
    } else if (id === 'admission' || id === 'registration') {
      setSelectedFeedTab('opportunities');
      setSelectedOppFilter('admission');
    } else if (id === 'announcement') {
      setSelectedFeedTab('opportunities');
      setSelectedOppFilter('announcement');
    } else if (id === 'news') {
      setSelectedFeedTab('opportunities');
      setSelectedOppFilter('news');
    } else if (id === 'deadline') {
      setSelectedFeedTab('opportunities');
      setSelectedOppFilter('deadline');
    } else if (id === 'internship') {
      setSelectedFeedTab('opportunities');
      setSelectedOppFilter('internship');
    } else if (id === 'event') {
      setSelectedFeedTab('campus_life');
      setSelectedCampusFilter('event');
    } else if (id === 'club') {
      setSelectedFeedTab('campus_life');
      setSelectedCampusFilter('club');
    } else if (id === 'study_group') {
      setSelectedFeedTab('campus_life');
      setSelectedCampusFilter('study_group');
    } else if (id === 'friends') {
      setSelectedFeedTab('campus_life');
      setSelectedCampusFilter('friends');
    } else if (id === 'campus_life' || id === 'post') {
      setSelectedFeedTab('campus_life');
      setSelectedCampusFilter('post');
    } else if (id === 'questions' || id === 'question') {
      setSelectedFeedTab('campus_life');
      setSelectedCampusFilter('question');
    }
    
    // Clear the active story highlight filter from before
    setActiveStoryFilter(null);
    
    // Scroll window smoothly to tabs element
    const el = document.getElementById('home-feed-tabs-selector');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Public hero state is read-only here. D1/R2 mutations live exclusively in HeroPhotoManager.
  const [heroImages, setHeroImages] = useState<string[]>(DEFAULT_HERO_IMAGES);

  // Load persistent active hero images from the API; defaults keep the homepage non-empty.
  useEffect(() => {
    let active = true;
    const syncImages = async () => {
      try {
        const savedImages = await heroImagesApi.getPublic();
        const nextImages = savedImages.map(image => image.image_url).filter(Boolean);
        const resolved = nextImages.length > 0 ? nextImages : DEFAULT_HERO_IMAGES;
        if (active) setHeroImages(resolved);
      } catch (error) {
        console.warn('Persistent hero images unavailable; using built-in defaults.', error);
        if (active) setHeroImages(DEFAULT_HERO_IMAGES);
      }
    };
    void syncImages();
    const handleUpdate = () => void syncImages();
    window.addEventListener('jamiaati_hero_images_updated', handleUpdate);
    return () => {
      active = false;
      window.removeEventListener('jamiaati_hero_images_updated', handleUpdate);
    };
  }, []);

  // Public carousel uses active D1 records returned by the API, with built-in fallbacks.
  const heroSlides = useMemo(() => {
    const baseSlides = [
      {
        id: 'slide_1',
        image: heroImages[0] || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600',
        tag: language === 'ar' ? 'مجتمع الحرم' : language === 'ku' ? 'کۆمەڵگەی زانکۆ' : 'Campus Community',
        tagColor: 'bg-[#1E40AF] text-white',
        headline: language === 'ar' ? 'اعثر على مسارك الدراسي والفرص المثمرة بكفاءة' : language === 'ku' ? 'ڕێڕەوی ئەکادیمی و گونجاوترین دەرفەت بدۆزەرەوە' : 'Find your university life and opportunities',
        subtitle: language === 'ar' ? 'شاهد المنح التدريبية والوظائف وعش حياة الكلية مع زملائك' : language === 'ku' ? 'سکۆلەرشیپی بە فەرمی دابینکراو، باشترین برۆگرامی ڕاهێنان' : 'Scholarships, jobs, events, and campus community in one platform',
        cta: language === 'ar' ? 'استكشف الفرص ➔' : language === 'ku' ? 'الفرص ➔' : 'Explore Now ➔',
        action: () => {
          setSelectedFeedTab('opportunities');
          const el = document.getElementById('home-feed-tabs-selector');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      },
      {
        id: 'slide_2',
        image: heroImages[1] || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600',
        tag: language === 'ar' ? 'المنح والمستقبل' : language === 'ku' ? 'سکۆلەرشیپ' : 'Scholarships',
        tagColor: 'bg-indigo-600 text-white',
        headline: language === 'ar' ? 'منح وتسهيلات دراسية ممولة بالكامل لطلابنا' : language === 'ku' ? 'هەلی بورس و خوێندنی باڵا بە شێوازی فەرمی' : 'Scholarships & Career Opportunities',
        subtitle: language === 'ar' ? 'بوابة المنح الجامعية المحلية والدولية الممولة للمستويات كافة' : language === 'ku' ? 'نوێترین بورسە دراسييەکان لە ناوخۆ و دەرەوەی عێراق' : 'Apply for fully-funded local and international academic scholarships',
        cta: language === 'ar' ? 'عرض منح الطلاب ➔' : language === 'ku' ? 'بینینی بورسەکان ➔' : 'View Scholarships ➔',
        action: () => {
          setSelectedFeedTab('opportunities');
          setSelectedOppFilter('scholarship');
          const el = document.getElementById('home-feed-tabs-selector');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      },
      {
        id: 'slide_3',
        image: heroImages[2] || 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=600',
        tag: language === 'ar' ? 'وظائف التدريب والعمل' : language === 'ku' ? 'هەلی کار' : 'Job Opportunities',
        tagColor: 'bg-emerald-600 text-white',
        headline: language === 'ar' ? 'انطلق في مسيرتك المهنية مع شركائنا الموثوقين' : language === 'ku' ? 'سەرەتای کاروانە پیشەییەکەت لێرەوە دەستپێبکە' : 'Career & Entry-Level Job Openings',
        subtitle: language === 'ar' ? 'قدم على وظائف صيفية، وتدريبات عمل خريجين في أفضل قطاعات العراق' : language === 'ku' ? 'مەشق و خولی هاوینە بۆ گەشەپێدانی توانای خوێندکاران' : 'Everything important for students in one place',
        cta: language === 'ar' ? 'عرض الوظائف والتدريب ➔' : language === 'ku' ? 'بینینی کارەکان ➔' : 'View Career Openings ➔',
        action: () => {
          setSelectedFeedTab('opportunities');
          setSelectedOppFilter('job');
          const el = document.getElementById('home-feed-tabs-selector');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      },
      {
        id: 'slide_4',
        image: heroImages[3] || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=600',
        tag: language === 'ar' ? 'حياة الحرم' : language === 'ku' ? 'کەمپەس لایف' : 'Campus Life',
        tagColor: 'bg-orange-600 text-white',
        headline: language === 'ar' ? 'تفوق وتفاعل في بيئة الحرم الجامعي الحيوية' : language === 'ku' ? 'لەگەڵ هاوڕێکانت بابەت و چالاکییەکان بەش بکە' : 'Campus Life & Interactive Communities',
        subtitle: language === 'ar' ? 'شاهد منشورات زملائك، النوادي النشطة، وشارك في النقاشات الأكاديمية' : language === 'ku' ? 'ژیانی ڕۆژانەی زانکۆ و ئاگاداری فەرمی لە نوێترین گروپی خوێندن' : 'Exchange stories, join student clubs, and find study peer groups',
        cta: language === 'ar' ? 'تصفح حياة الكلية ➔' : language === 'ku' ? 'تێکەڵ بە کەمپەس بە ➔' : 'Join Campus Groups ➔',
        action: () => {
          setSelectedFeedTab('campus_life');
          setSelectedCampusFilter('all');
          const el = document.getElementById('home-feed-tabs-selector');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      },
      {
        id: 'slide_5',
        image: heroImages[4] || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=600',
        tag: language === 'ar' ? 'الفعاليات الكبرى' : language === 'ku' ? 'کۆنفرانس و چالاکی' : 'Exhibits & Seminars',
        tagColor: 'bg-purple-600 text-white',
        headline: language === 'ar' ? 'كن شريكاً في المؤتمرات ومعارض التوظيف السنوية' : language === 'ku' ? 'ئامادەی کۆڕبەند و سیمینارە کەمپەسییەکان بە' : 'University Scientific Conferences & Events',
        subtitle: language === 'ar' ? 'تفاصيل كاملة عن مواعيد الورش والندوات والفعاليات داخل جامعات العراق' : language === 'ku' ? 'کات و ساتی کۆبوونەوە و گفتوگۆ ئەکادیمییەکان بزانە' : 'Never miss exhibitions, academic seminars, and graduate workshops',
        cta: language === 'ar' ? 'عرض الفعاليات والمؤتمرات ➔' : language === 'ku' ? 'بینینی چالاکییەکان ➔' : 'Browse All Events ➔',
        action: () => {
          setSelectedFeedTab('campus_life');
          setSelectedCampusFilter('event');
          const el = document.getElementById('home-feed-tabs-selector');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    ];

    // Map dynamic heroImages to slides (cycle through images if more slides than images)
    return baseSlides.map((slide, idx) => ({
      ...slide,
      image: heroImages[idx % heroImages.length] || slide.image
    }));
  }, [language, heroImages]);

  // Carousel auto slider interval configuration
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(slideTimer);
  }, [heroSlides.length]);

  // ⚠️ Searchable Custom Picker States (Task 1, 2, 3, 5)
  const [showPicker, setShowPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerPage, setPickerPage] = useState(1);
  const itemsPerPage = 8;

  // Let's reset the pagination any time selectedGov or pickerSearch changes
  useEffect(() => {
    setPickerPage(1);
  }, [selectedGov, pickerSearch]);

  const filteredAndSearchedUnis = useMemo(() => {
    // Return either institutions props or fallback to IraqiUniversities global
    const sourceList = institutions && institutions.length > 0 ? institutions : IraqiUniversities;
    
    // Governorate filtering
    const govUnis = selectedGov === 'all'
      ? sourceList
      : sourceList.filter(u => u.governorateId === selectedGov);

    if (!pickerSearch.trim()) return govUnis;
    const searchLower = pickerSearch.trim().toLowerCase();
    
    return govUnis.filter(u => 
      u.nameEN.toLowerCase().includes(searchLower) ||
      u.nameAR.toLowerCase().includes(searchLower) ||
      u.nameKU.toLowerCase().includes(searchLower)
    );
  }, [selectedGov, pickerSearch, institutions, IraqiUniversities, institutionsLoading]);

  const totalItems = filteredAndSearchedUnis.length;
  const maxPage = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedUnis = useMemo(() => {
    const start = (pickerPage - 1) * itemsPerPage;
    return filteredAndSearchedUnis.slice(start, start + itemsPerPage);
  }, [filteredAndSearchedUnis, pickerPage]);

  // New post publisher collapsible state
  const [showPublisher, setShowPublisher] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState('');

  // Story definition representing the required elements of section view clicks
  const storyHighlightsData = [
    {
      id: 'job',
      emoji: '💼',
      labelEN: 'Jobs',
      labelAR: 'الوظائف',
      labelKU: 'کارەکان',
      color: 'from-emerald-500 to-teal-500',
      tabType: 'opportunities',
      filterType: 'job'
    },
    {
      id: 'internship',
      emoji: '⚙️',
      labelEN: 'Internships',
      labelAR: 'فرص التدريب',
      labelKU: 'مەشقەکان',
      color: 'from-blue-500 to-indigo-500',
      tabType: 'opportunities',
      filterType: 'internship'
    },
    {
      id: 'training',
      emoji: '🏫',
      labelEN: 'Trainings',
      labelAR: 'التدريب',
      labelKU: 'ڕاهێنان',
      color: 'from-cyan-500 to-blue-500',
      tabType: 'opportunities',
      filterType: 'training'
    },
    {
      id: 'event',
      emoji: '🎟️',
      labelEN: 'Events',
      labelAR: 'الفعاليات',
      labelKU: 'چالاکییەکان',
      color: 'from-purple-500 to-blue-500',
      tabType: 'campus',
      filterType: 'event'
    },
    {
      id: 'news',
      emoji: '📰',
      labelEN: 'News',
      labelAR: 'الأخبار',
      labelKU: 'هەواڵەکان',
      color: 'from-amber-500 to-rose-500',
      tabType: 'campus',
      filterType: 'news'
    },
    {
      id: 'announcement',
      emoji: '📢',
      labelEN: 'Announcements',
      labelAR: 'الإعلانات',
      labelKU: 'ڕاگەیاندنەکان',
      color: 'from-teal-500 to-emerald-500',
      tabType: 'campus',
      filterType: 'announcement'
    },
    {
      id: 'exam',
      emoji: '📝',
      labelEN: 'Exams',
      labelAR: 'الامتحانات',
      labelKU: 'تاقیکردنەوەکان',
      color: 'from-[#2F7CCB] to-indigo-500',
      tabType: 'campus',
      filterType: 'exam'
    },
    {
      id: 'registration',
      emoji: '📌',
      labelEN: 'Registration',
      labelAR: 'التسجيل',
      labelKU: 'تۆمارکردن',
      color: 'from-fuchsia-500 to-pink-500',
      tabType: 'campus',
      filterType: 'registration'
    },
    {
      id: 'student_club',
      emoji: '👥',
      labelEN: 'Student Clubs',
      labelAR: 'النوادي الطلابية',
      labelKU: 'یانە خوێندکارییەکان',
      color: 'from-violet-500 to-fuchsia-500',
      tabType: 'campus',
      filterType: 'student_club'
    }
  ];

  // Helper handles Governorate modification
  const handleGovChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedGov(val);
    setSelectedUni('all'); // Clear specific university when governorate shifts
  };

  // Filter universities based on chosen Governorate
  const filteredUnis = selectedGov === 'all' 
    ? IraqiUniversities 
    : IraqiUniversities.filter(u => u.governorateId === selectedGov);

  // New post submission logic
  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postBody.trim()) return;

    onAddNewPost('Campus Moment 🌟', postBody, anonymous, 'post', postImageUrl || undefined, postGov, postUni);

    setSelectedFeedTab('campus_life');
    setSelectedCampusFilter('all');
    setActiveStoryFilter(null);
    setVisibleItemsCount(INITIAL_CAMPUS_LIMIT);

    setTimeout(() => {
      const list = document.getElementById('mixed-feed-items-list');
      if (list) list.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    
    setPostTitle('');
    setPostBody('');
    setPostImageUrl('');
    setAnonymous(false);
    setPostCategory('campus_life');
    setShowPublisher(false);

    setMessage(language === 'ar' ? 'تم نشر مشاركتك بنجاح! ✨' : language === 'ku' ? 'بابەتەکەت بە سەرکەوتوویی بڵاوکرایەوە! ✨' : 'Post shared successfully on Campus Today!');
    setTimeout(() => setMessage(''), 3000);
  };

  // Serious opportunity categories
  const seriousTypes = [
    'job', 'part_time_job', 'full_time_job', 'internship',
    'scholarship', 'fellowship',
    'training', 'graduation_project_support', 'volunteering', 'competition',
    'admission', 'announcement', 'news', 'deadline'
  ];

  // Filter by governorate & university first.
  // For opportunities, governorate matters but university should not hide jobs/scholarships.
  const matchesGovAndUni = (item: any) => {
    const itemGovText = [
      item.governorateId,
      item.governorate,
      item.location,
      item.city,
      Array.isArray(item.tags) ? item.tags.join(' ') : ''
    ].filter(Boolean).join(' ');

    const normalizedItemGov = normalizeHomeGovernorateId(itemGovText);
    const itemUni = item.universityId;
    const isOpportunityItem = seriousTypes.includes(item.type);

    const matchesGov = selectedGov === 'all' || normalizedItemGov === 'all' || normalizedItemGov === selectedGov;
    const matchesUni = isOpportunityItem || selectedUni === 'all' || !itemUni || itemUni === 'all' || itemUni === selectedUni;
    
    return matchesGov && matchesUni;
  };

  const geoFilteredItems = useMemo(() => {
    return feedItems.filter(matchesGovAndUni);
  }, [feedItems, selectedGov, selectedUni]);

  // Divide into serious opportunities vs campus social categories
  const allSeriousItems = useMemo(() => {
    return geoFilteredItems.filter(item => seriousTypes.includes(item.type));
  }, [geoFilteredItems]);

  const allSocialItems = useMemo(() => {
    const liveAndStudentPosts = geoFilteredItems.filter(item => !seriousTypes.includes(item.type));
    const customStudentPosts = liveAndStudentPosts.filter(item => String(item.id || '').startsWith('custom-'));
    const otherLivePosts = liveAndStudentPosts.filter(item => !String(item.id || '').startsWith('custom-'));
    const mockCampusPosts = campusLifeFeedItems.filter(matchesGovAndUni);
    const liveIds = new Set(liveAndStudentPosts.map(item => item.id));

    // User-created Campus Life posts must appear first, then real/live posts, then public posts.
    return [
      ...customStudentPosts,
      ...otherLivePosts,
      ...mockCampusPosts.filter(item => !liveIds.has(item.id))
    ];
  }, [geoFilteredItems, selectedGov, selectedUni]);

  // For You (Mixed & organized feed with controlled sorting)
  const forYouItems = useMemo(() => {
    // 1. Important official announcements first
    const officialAnnouncements = geoFilteredItems.filter(item => 
      item.type === 'announcement' || 
      item.author?.role === 'institution' || 
      item.author?.role === 'staff'
    );

    // 2. Careers, Scholarships, Training next (other serious content)
    const officialIds = new Set(officialAnnouncements.map(x => x.id));
    const scholarshipsJobsTraining = geoFilteredItems.filter(item => 
      !officialIds.has(item.id) && 
      ['job', 'part_time_job', 'full_time_job', 'internship', 'scholarship', 'fellowship', 'training', 'graduation_project_support', 'volunteering', 'competition', 'admission'].includes(item.type)
    );

    // 3. Casual Campus life posts after (neither of the above)
    const seriousIds = new Set([...officialAnnouncements, ...scholarshipsJobsTraining].map(x => x.id));
    const casualCampusLife = geoFilteredItems.filter(item => !seriousIds.has(item.id));

    return [...officialAnnouncements, ...scholarshipsJobsTraining, ...casualCampusLife];
  }, [geoFilteredItems]);

  // Filtering for Opportunities Tab
  const filteredOppsItems = useMemo(() => {
    // Use backend opportunities when a specific category filter is selected
    if (selectedOppFilter !== 'all' && backendOpportunities.length > 0) {
      // Filter backend opportunities by governorate
      const govFiltered = backendOpportunities.filter(item => {
        const itemGovText = [
          item.governorateId,
          item.governorate,
          item.location,
          item.city,
          Array.isArray(item.tags) ? item.tags.join(' ') : ''
        ].filter(Boolean).join(' ');
        const normalizedItemGov = normalizeHomeGovernorateId(itemGovText);
        return selectedGov === 'all' || normalizedItemGov === 'all' || normalizedItemGov === selectedGov;
      });

      // Add Iraq-wide fallback if governorate has few results (less than 5)
      if (selectedGov !== 'all' && govFiltered.length < 5 && govFiltered.length < backendOpportunities.length) {
        // Add Iraq-wide jobs that aren't already in the filtered list
        const iraqWideJobs = backendOpportunities.filter(item => {
          const itemGovText = [
            item.governorateId,
            item.governorate,
            item.location,
            item.city,
            Array.isArray(item.tags) ? item.tags.join(' ') : ''
          ].filter(Boolean).join(' ');
          const normalizedItemGov = normalizeHomeGovernorateId(itemGovText);
          const isAlreadyIncluded = govFiltered.some(govItem => govItem.id === item.id);
          return !isAlreadyIncluded && (normalizedItemGov === 'all' || normalizedItemGov !== selectedGov);
        });
        return [...govFiltered, ...iraqWideJobs];
      }

      return govFiltered;
    }

    if (selectedOppFilter === 'all') {
      return allSeriousItems;
    }
    if (selectedOppFilter === 'job') {
      return allSeriousItems.filter(item =>
        ['job', 'part_time_job', 'full_time_job', 'internship'].includes(item.type)
      );
    }
    if (selectedOppFilter === 'scholarship') {
      return allSeriousItems.filter(item =>
        ['scholarship', 'fellowship'].includes(item.type)
      );
    }
    if (selectedOppFilter === 'training') {
      return allSeriousItems.filter(item =>
        ['training', 'graduation_project_support', 'volunteering', 'competition'].includes(item.type)
      );
    }
    if (selectedOppFilter === 'admission') {
      return allSeriousItems.filter(item =>
        ['admission', 'registration'].includes(item.type)
      );
    }
    if (selectedOppFilter === 'announcement') {
      return allSeriousItems.filter(item => item.type === 'announcement');
    }
    if (selectedOppFilter === 'news') {
      return allSeriousItems.filter(item =>
        item.type === 'news' ||
        getSafeTags(item.tags).some(tag => tag.toLowerCase().includes('news')) ||
        item.type === 'announcement'
      );
    }
    if (selectedOppFilter === 'deadline') {
      return allSeriousItems.filter(item => !!item.deadline);
    }
    if (selectedOppFilter === 'internship') {
      return allSeriousItems.filter(item =>
        item.type === 'internship' ||
        getSafeTags(item.tags).some(tag => tag.toLowerCase().includes('intern'))
      );
    }
    return allSeriousItems;
  }, [allSeriousItems, selectedOppFilter, backendOpportunities, selectedGov]);

  // Filtering for Campus Life Tab
  const filteredCampusItems = useMemo(() => {
    if (selectedCampusFilter === 'all') {
      return allSocialItems;
    }
    // Filter by academic category, sourceType, or type fallbacks
    return allSocialItems.filter(item => {
      if (item.category === selectedCampusFilter) return true;
      if (item.sourceType === selectedCampusFilter) return true;
      
      // Secondary fallback mappings for legacy schema or filters
      if (selectedCampusFilter === 'event') {
        return item.type === 'event' || item.type === 'poll' || item.category === 'event';
      }
      if (selectedCampusFilter === 'clubs') {
        return item.type === 'club' || item.category === 'clubs' || getSafeTags(item.tags).some(tag => ['club', 'clubs', 'study group'].includes(tag.toLowerCase()));
      }
      if (selectedCampusFilter === 'exams') {
        return item.category === 'exams' || item.type === 'exam' || getSafeTags(item.tags).some(tag => ['exams', 'exam', 'registration'].includes(tag.toLowerCase()));
      }
      if (selectedCampusFilter === 'campus_guide') {
        return item.category === 'campus_guide' || getSafeTags(item.tags).some(tag => ['guide', 'orientation'].includes(tag.toLowerCase()));
      }
      return false;
    });
  }, [allSocialItems, selectedCampusFilter]);

   let filteredFeedItems: typeof feedItems = [];

  if (selectedFeedTab === 'opportunities') {
    filteredFeedItems = filteredOppsItems;
  } else {
    filteredFeedItems = filteredCampusItems;
  }

  // Filter based on activeStoryFilter representing active story highlight categories
  if (activeStoryFilter) {
    filteredFeedItems = filteredFeedItems.filter(item => 
      item.tags?.includes(activeStoryFilter) || item.type === activeStoryFilter
    );
  }

  // Functional live search query filter
  if (feedSearchQuery.trim()) {
    const q = feedSearchQuery.trim().toLowerCase();
    filteredFeedItems = filteredFeedItems.filter(item => {
      const authName = item.author?.name || '';
      const authUni = item.author?.university || '';
      return (
        (item.titleEN && item.titleEN.toLowerCase().includes(q)) ||
        (item.titleAR && item.titleAR.toLowerCase().includes(q)) ||
        (item.titleKU && item.titleKU.toLowerCase().includes(q)) ||
        (item.contentEN && item.contentEN.toLowerCase().includes(q)) ||
        (item.contentAR && item.contentAR.toLowerCase().includes(q)) ||
        (item.contentKU && item.contentKU.toLowerCase().includes(q)) ||
        authName.toLowerCase().includes(q) ||
        authUni.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
      );
    });
  }

  const visibleFeedItems = filteredFeedItems.slice(0, visibleItemsCount);
  const hasMoreFeedItems = filteredFeedItems.length > visibleItemsCount;

  return (
    <div className="px-3.5 py-4 max-w-lg mx-auto flex flex-col pb-24 bg-white text-slate-800" id="home-feed-container">
      
      {/* 1. Hero Slides Carousel Section */}
      <div className="relative w-full overflow-hidden rounded-3xl mb-5 shadow-md bg-slate-950 aspect-[16/9]" id="home-hero-carousel">
        {heroSlides.map((slide, idx) => (
          <div 
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out flex flex-col justify-end p-5 text-white ${
              idx === currentSlide 
                ? 'opacity-100 scale-100 pointer-events-auto z-10' 
                : 'opacity-0 scale-95 pointer-events-none z-0'
            }`}
          >
            {/* Slide Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[5000ms] ease-linear"
              style={{ 
                backgroundImage: `url(${slide.image})`,
                transform: idx === currentSlide ? 'scale(1.04)' : 'scale(1.0)'
              }}
              referrerPolicy="no-referrer"
            />
            {/* Dark contrast gradient overlay */}
            <div className="hidden" />
            
            {/* Slide Content */}
            <div className="hidden">
              <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg select-none ${slide.tagColor}`}>
                {slide.tag}
              </span>
              <h2 className="text-xs sm:text-sm font-black leading-snug tracking-tight text-white max-w-sm">
                {slide.headline}
              </h2>
              <p className="text-[9px] text-white/80 max-w-xs font-bold leading-normal">
                {slide.subtitle}
              </p>
              <button 
                onClick={slide.action}
                className="mt-2 text-[9px] font-black bg-[#1E40AF] hover:bg-blue-700 text-white rounded-lg py-1.5 px-3.5 shadow-sm hover:shadow-md transition-all uppercase cursor-pointer"
              >
                {slide.cta}
              </button>
            </div>
          </div>
        ))}
        
        {/* Next/Prev arrow navigation controls */}
        <button 
          onClick={() => setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 border border-white/10 rounded-full text-white cursor-pointer backdrop-blur-xs select-none transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setCurrentSlide(prev => (prev + 1) % heroSlides.length)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 border border-white/10 rounded-full text-white cursor-pointer backdrop-blur-xs select-none transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentSlide
                  ? 'bg-[#FFD21F] w-4.5'
                  : 'bg-white/35 hover:bg-white/60 w-1.5'
              }`}
            />
          ))}
        </div>

        {/* Admins manage persistent D1/R2 hero images in HeroPhotoManager only. */}
        {isAdminMode && (
          <button
            type="button"
            onClick={() => onNavigateTab('admin')}
            className="absolute right-3 top-3 z-30 rounded-full bg-white/95 px-4 py-2 text-xs font-black text-slate-900 shadow-lg hover:bg-white"
          >
            ✎ Manage Hero Photos
          </button>
        )}
      </div>

      {/* 3 & 4. Governorate & University combined Row Filter */}
      <div className="grid grid-cols-2 gap-3 mb-5" id="home-combined-filters-row">
        {/* Governorate filter */}
        <div className="flex flex-col gap-1.5" id="home-gov-filter-container">
          <label className="text-[10px] font-black text-[#1E40AF] uppercase tracking-wider px-1 truncate">
            📍 {language === 'ar' ? 'المحافظة' : language === 'ku' ? 'پارێزگا' : 'Governorate'}
          </label>
          <div 
            className={`flex items-center gap-2 px-2.5 py-2 rounded-2xl bg-white border-2 transition-all h-[42px] min-w-0 ${
              selectedGov !== 'all' 
                ? 'border-[#1E40AF] shadow-xs bg-blue-50/10' 
                : 'border-slate-200 hover:border-[#1E40AF]/50'
            }`}
            id="gov-dropdown-container"
          >
            <MapPin className={`w-3.5 h-3.5 shrink-0 ${selectedGov !== 'all' ? 'text-[#1E40AF]' : 'text-slate-400'}`} />
            <select
              id="governorate-select"
              value={selectedGov}
              onChange={handleGovChange}
              className="w-full text-xs font-black text-slate-800 bg-transparent border-0 focus:outline-none cursor-pointer outline-none p-0 select-none truncate"
            >
              <option value="all">🌍 {language === 'ar' ? 'الكل' : language === 'ku' ? 'هەموو' : 'All'}</option>
              {IraqiGovernorates.map(gov => (
                <option key={gov.id} value={gov.id}>
                  {language === 'ar' ? gov.nameAR : language === 'ku' ? gov.nameKU : gov.nameEN}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* University filter */}
        <div className="flex flex-col gap-1.5" id="home-uni-filter-container">
          <label className="text-[10px] font-black text-[#1E40AF] uppercase tracking-wider px-1 truncate">
            🏫 {language === 'ar' ? 'الجامعة' : language === 'ku' ? 'زانکۆ' : 'University'}
          </label>
          <button 
            id="university-select-trigger"
            type="button"
            onClick={() => {
              if (!institutionsLoading) {
                setPickerPage(1);
                setPickerSearch('');
                setShowPicker(true);
              }
            }}
            className={`flex items-center justify-between text-left gap-2 px-2.5 py-2 rounded-2xl bg-white border-2 transition-all cursor-pointer h-[42px] min-w-0 ${
              selectedUni !== 'all' 
                ? 'border-[#1E40AF] shadow-xs bg-blue-50/10' 
                : 'border-slate-200 hover:border-[#1E40AF]/50'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <School className={`w-3.5 h-3.5 shrink-0 ${selectedUni !== 'all' ? 'text-[#1E40AF]' : 'text-slate-400'}`} />
              <span className="text-xs font-black text-slate-800 truncate">
                {institutionsLoading ? (
                  <span>⌛...</span>
                ) : selectedUni === 'all' ? (
                  <span>{language === 'ar' ? 'الكل' : language === 'ku' ? 'هەموو' : 'All'}</span>
                ) : (
                  (() => {
                    const sourceList = institutions && institutions.length > 0 ? institutions : IraqiUniversities;
                    const found = sourceList.find(u => u.id === selectedUni);
                    if (found) {
                      return `${found.logo} ${language === 'ar' ? found.nameAR : language === 'ku' ? found.nameKU : found.nameEN}`;
                    }
                    return `${selectedUni}`;
                  })()
                )}
              </span>
            </div>
            {institutionsLoading && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping shrink-0" />}
          </button>
        </div>
      </div>

      {/* 5. Fluid dual-lane tab selector that scrolls naturally with page flow */}
      <div 
        className="relative z-10 bg-white border-b-2 border-slate-100 py-3 flex justify-between gap-1.5 mb-4 shadow-xs select-none" 
        id="home-feed-tabs-selector"
      >
        <button
          onClick={() => setSelectedFeedTab('opportunities')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-black text-center rounded-2xl transition-all cursor-pointer ${
            selectedFeedTab === 'opportunities'
              ? 'bg-teal-50 text-teal-700 border-2 border-teal-500 scale-102 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-2 border-transparent'
          }`}
        >
          <span>🎯</span>
          <span>{language === 'ar' ? 'الفرص والتطوير' : language === 'ku' ? 'هەلەکان' : 'Opportunities'}</span>
        </button>
        <button
          onClick={() => setSelectedFeedTab('campus_life')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-black text-center rounded-2xl transition-all cursor-pointer ${
            selectedFeedTab === 'campus_life'
              ? 'bg-orange-50 text-orange-600 border-2 border-orange-500 scale-102 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-2 border-transparent'
          }`}
        >
          <span>🏛️</span>
          <span>{language === 'ar' ? 'حياة الحرم الجامعي' : language === 'ku' ? 'کەمپەس لایف' : 'Campus Life'}</span>
        </button>
      </div>

      {/* 5.1 Real-time and responsive Search Input Bar within Selected Feed Lane */}
      <div className="mb-4 relative px-1 animate-fadeIn" id="feed-items-live-search-bar">
        <input
          type="text"
          value={feedSearchQuery}
          onChange={(e) => setFeedSearchQuery(e.target.value)}
          placeholder={
            selectedFeedTab === 'opportunities'
              ? (language === 'ar' ? '🔍 ابحث عن وظائف، منح دراسية وتدريبات...' : language === 'ku' ? '🔍 گەڕان بەدوای هەلی کار، سکۆلەرشیپ یان مەشق...' : '🔍 Search jobs, scholarships, or training...')
              : (language === 'ar' ? '🔍 ابحث في منشورات وفعاليات الحرم الجامعي...' : language === 'ku' ? '🔍 گەڕان بەدوای پۆست و ڕووداوەکان...' : '🔍 Search student posts, campus events, and clubs...')
          }
          className={`w-full text-xs font-bold bg-slate-50 text-slate-800 border-2 rounded-2xl pl-4 pr-9 py-2.5 outline-none transition-all placeholder:text-slate-400 ${
            selectedFeedTab === 'opportunities'
              ? 'border-slate-200 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100/50'
              : 'border-slate-200 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100/50'
          }`}
        />
        {feedSearchQuery && (
          <button
            type="button"
            onClick={() => setFeedSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer text-[10px] bg-slate-200/60 rounded-full w-4.5 h-4.5 flex items-center justify-center font-black"
          >
            ✕
          </button>
        )}
      </div>

      {/* Advanced Filter Chips for Opportunities Tab (using Circular Shortcut style) */}
      {selectedFeedTab === 'opportunities' && (
        <div 
          className="flex gap-4 mb-5 overflow-x-auto pb-3 pt-1.5 scrollbar-none snap-x touch-pan-x justify-start" 
          id="opp-shortcuts-circles"
        >
          {[
            { id: 'all', emoji: '🌐', labelEN: 'All', labelAR: 'الكل', labelKU: 'هەموو' },
            { id: 'job', emoji: '💼', labelEN: 'Jobs', labelAR: 'وظائف', labelKU: 'کارەکان' },
            { id: 'scholarship', emoji: '🎓', labelEN: 'Scholarships', labelAR: 'منح دراسية', labelKU: 'سکۆلەرشیپ' },
            { id: 'training', emoji: '📖', labelEN: 'Training', labelAR: 'تدريب', labelKU: 'ڕاهێنان' },
            { id: 'admission', emoji: '📌', labelEN: 'Admissions', labelAR: 'القبول والتسجيل', labelKU: 'وەرگرتن' },
            { id: 'announcement', emoji: '📢', labelEN: 'Announcements', labelAR: 'الأخبار', labelKU: 'ئاگاداریی' },
            { id: 'news', emoji: '📰', labelEN: 'News', labelAR: 'أخبار الطلاب', labelKU: 'هەواڵەکان' },
            { id: 'deadline', emoji: '⏳', labelEN: 'Deadlines', labelAR: 'آجال التقديم', labelKU: 'مۆڵەتەکان' },
            { id: 'internship', emoji: '🚀', labelEN: 'Internships', labelAR: 'فرص تدريب العمل', labelKU: 'ڕاهێنانی کار' },
          ].map(shortcut => {
            const isActive = selectedOppFilter === shortcut.id;
            return (
              <button
                key={shortcut.id}
                onClick={() => {
                  if (shortcut.id === 'job' && onSelectSection) {
                    onSelectSection('jobs');
                    return;
                  }

                  setSelectedOppFilter(shortcut.id as any);
                  // Clear story category highlight matching
                  setActiveStoryFilter(null);
                  
                  // Smoothly scroll down to the search / feed list area so they can search there
                  setTimeout(() => {
                    const searchBox = document.getElementById('feed-items-live-search-bar');
                    if (searchBox) {
                      searchBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      // Find input inside the container and focus it
                      const input = searchBox.querySelector('input');
                      if (input) input.focus();
                    }
                  }, 150);
                }}
                className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 snap-center min-w-[76px] text-center focus:outline-none select-none transition-all"
              >
                {/* Circle icon container */}
                <div 
                  className={`w-13 h-13 rounded-full flex items-center justify-center text-xl transition-all border-2 ${
                    isActive 
                      ? 'border-teal-500 bg-teal-50 text-teal-700 scale-105 shadow-md ring-4 ring-teal-100' 
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-500 shadow-xs'
                  }`}
                >
                  <span>{shortcut.emoji}</span>
                </div>
                {/* Short label text below */}
                <span 
                  className={`text-[10px] font-extrabold uppercase tracking-wide leading-tight px-1 transition-colors duration-200 ${
                    isActive 
                      ? 'text-teal-600 font-black' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {language === 'ar' ? shortcut.labelAR : language === 'ku' ? shortcut.labelKU : shortcut.labelEN}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* External IQJScout Search Button */}
      {selectedFeedTab === 'opportunities' && selectedOppFilter === 'job' && (
        <div className="mb-5 flex justify-center">
          <button
            onClick={() => window.open('https://iqjscout.com/jobs/', '_blank', 'noopener,noreferrer')}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <span>🔍</span>
            <span>{language === 'ar' ? 'ابحث عن المزيد من الوظائف على IQJScout' : language === 'ku' ? 'گەڕان بەدوای هەلی کار زیاتر لە IQJScout' : 'Search more jobs on IQJScout'}</span>
            <span>↗</span>
          </button>
        </div>
      )}



      {/* Circular Shortcut Chips for Campus Life Tab */}
      {selectedFeedTab === 'campus_life' && (
        <div 
          className="flex gap-4 mb-5 overflow-x-auto pb-3 pt-1.5 scrollbar-none snap-x touch-pan-x justify-start" 
          id="campus-shortcuts-circles" hidden
        >
          {[
            { id: 'all', emoji: '🏛️', labelEN: 'All', labelAR: 'الكل', labelKU: 'هەموو' },
            { id: 'campus_guide', emoji: '📘', labelEN: 'Guides', labelAR: 'الأدلة', labelKU: 'ڕێبەرەکان' },
            { id: 'clubs', emoji: '🤝', labelEN: 'Clubs', labelAR: 'النوادي', labelKU: 'یانەکان' },
            { id: 'event', emoji: '📅', labelEN: 'Events', labelAR: 'الفعاليات', labelKU: 'چالاکییەکان' },
            { id: 'student_tip', emoji: '💡', labelEN: 'Tips', labelAR: 'نصائح', labelKU: 'ئامۆژگاری' },
            { id: 'volunteering', emoji: '🌱', labelEN: 'Volunteer', labelAR: 'التطوع', labelKU: 'خۆبەخشی' },
            { id: 'exams', emoji: '📝', labelEN: 'Exams', labelAR: 'الامتحانات', labelKU: 'تاقیکردنەوەكان' },
            { id: 'career_prep', emoji: '🚀', labelEN: 'Careers', labelAR: 'الوظائف', labelKU: 'کارەکان' },
            { id: 'university_services', emoji: '🏫', labelEN: 'Services', labelAR: 'الخدمات', labelKU: 'خزمەتگوزاری' },
          ].map(shortcut => {
            const isActive = selectedCampusFilter === shortcut.id;
            return (
              <button
                key={shortcut.id}
                onClick={() => {
                  setSelectedCampusFilter(shortcut.id as any);
                  // Clear story category highlight matching
                  setActiveStoryFilter(null);
                }}
                className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 snap-center min-w-[76px] text-center focus:outline-none select-none transition-all"
              >
                {/* Circle icon container */}
                <div 
                  className={`w-13 h-13 rounded-full flex items-center justify-center text-xl transition-all border-2 ${
                    isActive 
                      ? 'border-orange-500 bg-orange-50 text-orange-700 scale-105 shadow-md ring-4 ring-orange-100' 
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-500 shadow-xs'
                  }`}
                >
                  <span>{shortcut.emoji}</span>
                </div>
                {/* Short label text below */}
                <span 
                  className={`text-[10px] font-extrabold uppercase tracking-wide leading-tight px-1 transition-colors duration-200 ${
                    isActive 
                      ? 'text-orange-600 font-black' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {language === 'ar' ? shortcut.labelAR : language === 'ku' ? shortcut.labelKU : shortcut.labelEN}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Feed Filter Alert & Active Stories filter indicator */}
      {activeStoryFilter && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-850 text-[10px] font-bold p-2.5 rounded-xl flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 leading-none">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              {language === 'ar' 
                ? `عرض فلترة: ${storyHighlightsData.find(s => s.filterType === activeStoryFilter)?.labelAR || 'تصنيف مخصص'}` 
                : language === 'ku'
                ? `بینینی دەستنیشانکراوی: ${storyHighlightsData.find(s => s.filterType === activeStoryFilter)?.labelKU || 'فلتەر'}`
                : `Showing matching category: ${storyHighlightsData.find(s => s.filterType === activeStoryFilter)?.labelEN || 'Filtered'}`}
            </span>
          </div>
          <button 
            onClick={() => setActiveStoryFilter(null)}
            className="text-[10px] font-black hover:text-slate-900 transition-colors bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded cursor-pointer"
          >
            Clear ✕
          </button>
        </div>
      )}

      {/* Compose post layout bar */}
      <div className="bg-white border-2 border-[#161A33] rounded-3xl p-4.5 mb-5 shadow-[3px_3px_0px_0px_#161A33]" id="post-composition-box">
        {message && (
          <div className="bg-emerald-550 bg-emerald-50 text-emerald-800 text-xs font-bold p-2.5 rounded-xl border-2 border-[#E6E1F5] mb-3 flex items-center gap-1.5 animate-pulse">
            <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <div className="flex items-center gap-2.5 pointer-events-auto cursor-pointer" onClick={() => setShowPublisher(!showPublisher)}>
          <div className="text-xl">⚡</div>
          <div className="flex-1 bg-[#F7F4FF] hover:bg-[#F3F7FF] border border-[#E6E1F5] px-3.5 py-3 rounded-xl text-xs font-bold text-slate-500 transition-all shadow-inner">
            {language === 'ar' ? 'شارك شيئاً مع زملائك اليوم...' : language === 'ku' ? 'ئەمڕۆ شتێک هاوبەش بکە...' : "What's happening on campus today?"}
          </div>
          <button id="post-trigger-plus" className="p-3 bg-[#FFD21F] text-[#161A33] hover:bg-yellow-450 border-2 border-[#161A33] rounded-xl transition-all cursor-pointer shadow-[2px_2px_0px_0px_#161A33]">
            <PlusCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Collapsible publish form */}
        <AnimatePresence>
          {showPublisher && (
            <motion.form
              onSubmit={handlePostSubmit}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-3.5 border-t border-[#E6E1F5] pt-4 flex flex-col gap-4 text-left"
            >
              {/* Caption Description field */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">
                  📝 {language === 'ar' ? 'الوصف' : language === 'ku' ? 'پێناسە / نووسین' : 'Caption'}
                </label>
                <textarea
                  value={postBody}
                  onChange={e => setPostBody(e.target.value)}
                  required
                  rows={3}
                  placeholder={language === 'ar' ? 'اكتب ما تفكر به لمشاركته مع الكلية...' : language === 'ku' ? 'ئەمڕۆ چی لە زانکۆ ڕوودەدات؟...' : 'What is happening on campus today?'}
                  className="w-full text-xs font-semibold text-[#161A33] bg-white border border-[#E6E1F5] rounded-xl p-3.5 focus:bg-[#F3F7FF] focus:outline-none focus:border-orange-500 transition-colors resize-none"
                />
              </div>

              {/* Photo attachment component - FILE UPLOAD ONLY */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">
                  📷 {language === 'ar' ? 'تحميل صورة' : language === 'ku' ? 'بارکردنی وێنە' : 'Upload Image'}
                </label>
                <div 
                  className={`border-2 border-dashed rounded-xl p-4 transition-colors text-center ${
                    isDragging 
                      ? 'border-[#6B25C9] bg-[#F7F4FF]' 
                      : 'border-[#E6E1F5] hover:border-[#6B25C9] bg-white'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={async (e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const files = e.dataTransfer.files;
                    if (files && files[0]) {
                      const file = files[0];
                      if (file.type.startsWith('image/')) {
                        try {
                          const compressedDataUrl = await compressImageToDataUrl(file, {
                            maxWidth: 1200,
                            maxHeight: 1200,
                            quality: 0.68,
                            maxBytes: 650 * 1024
                          });
                          setPostImageUrl(compressedDataUrl);
                        } catch (error) {
                          alert('Could not compress this image. Please choose a smaller JPG/PNG/WebP photo.');
                        }
                      }
                    }
                  }}
                >
                  {postImageUrl ? (
                    <div className="relative inline-block w-full max-w-[200px] rounded-lg overflow-hidden border border-[#E6E1F5]">
                      <img 
                        src={postImageUrl} 
                        alt="Attachment Preview" 
                        className="w-full h-auto object-cover max-h-32 shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => setPostImageUrl('')}
                        className="absolute top-1 right-1 p-1 bg-black/65 text-white rounded-full hover:bg-black/95 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1.5 py-1.5 cursor-pointer" onClick={() => document.getElementById('post-photo-upload')?.click()}>
                      <Image className="w-6 h-6 text-[#6B25C9]" />
                      <div className="text-[10px] font-bold text-slate-500">
                        {language === 'ar' 
                          ? 'اضغط هنا أو اسحب الصورة لرفعها' 
                          : language === 'ku' 
                          ? 'کلیک لێرە بکە بۆ بارکردنی وێنە' 
                          : 'Click to upload or drag image file here'}
                      </div>
                      <input 
                        type="file" 
                        id="post-photo-upload" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          const files = e.target.files;
                          if (files && files[0]) {
                            const file = files[0];
                            try {
                              const compressedDataUrl = await compressImageToDataUrl(file, {
                                maxWidth: 1400,
                                maxHeight: 1400,
                                quality: 0.72,
                                maxBytes: 750 * 1024
                              });
                              setPostImageUrl(compressedDataUrl);
                            } catch (error) {
                              alert('Could not compress this image. Please choose a smaller JPG/PNG/WebP photo.');
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Governorate and University selection inputs inside publish form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-1">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">
                    📍 {language === 'ar' ? 'المحافظة' : language === 'ku' ? 'پارێزگا' : 'Governorate'}
                  </label>
                  <select
                    value={postGov}
                    onChange={async (e) => {
                      const gVal = e.target.value;
                      setPostGov(gVal);
                      const matchedUnis = IraqiUniversities.filter(u => u.governorateId === gVal);
                      if (matchedUnis.length > 0) {
                        setPostUni(matchedUnis[0].id);
                      } else {
                        setPostUni('all');
                      }
                    }}
                    className="w-full text-xs font-bold text-slate-800 bg-white border border-[#E6E1F5] rounded-xl px-3.5 py-2.5 focus:bg-[#F3F7FF] focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
                  >
                    {IraqiGovernorates.map(gov => (
                      <option key={gov.id} value={gov.id}>
                        {language === 'ar' ? gov.nameAR : language === 'ku' ? gov.nameKU : gov.nameEN}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">
                    🏫 {language === 'ar' ? 'الجامعة / المؤسسة الأكاديمية' : language === 'ku' ? 'زانکۆ / دامەزراوە' : 'University / Institution'}
                  </label>
                  <select
                    value={postUni}
                    onChange={(e) => setPostUni(e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 bg-white border border-[#E6E1F5] rounded-xl px-3.5 py-2.5 focus:bg-[#F3F7FF] focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
                  >
                    {(postGov === 'all' ? IraqiUniversities : IraqiUniversities.filter(u => u.governorateId === postGov)).map(uni => (
                      <option key={uni.id} value={uni.id}>
                        {language === 'ar' ? uni.nameAR : language === 'ku' ? uni.nameKU : uni.nameEN}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between border-t border-[#E6E1F5] pt-3 mt-1">
                <label className="flex items-center gap-1.5 cursor-pointer bg-white border border-[#E6E1F5] px-3 py-1.5 rounded-xl hover:border-[#6B25C9] transition-colors" id="anonymous-toggle-label">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={e => setAnonymous(e.target.checked)}
                    className="w-4 h-4 text-[#6B25C9] bg-white border-[#E6E1F5] rounded focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase flex items-center gap-1">
                    <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                    {getTranslation('anonymous', language)}
                  </span>
                </label>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowPublisher(false)}
                    className="text-[10px] font-extrabold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-[10px] font-black bg-[#FFD21F] text-[#161A33] hover:bg-[#FFE052] px-4 py-2 rounded-xl shadow-sm border-2 border-[#161A33] cursor-pointer transition-all"
                  >
                    {getTranslation('postBtn', language)}
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* 6. Content Feed/Cards Column */}
      <div className={selectedFeedTab === "opportunities" ? "grid grid-cols-2 gap-3 md:grid-cols-2" : "flex flex-col gap-2"} id="mixed-feed-items-list">
        {/* Category Heading */}
        {selectedFeedTab === 'opportunities' && selectedOppFilter !== 'all' && (
          <div className="mb-3">
            <h2 className="text-sm font-black text-[#161A33] uppercase tracking-tight">
              {selectedOppFilter === 'job' 
                ? (language === 'ar' ? 'فرص العمل' : language === 'ku' ? 'هەلی کار' : 'Job Opportunities')
                : selectedOppFilter === 'scholarship'
                ? (language === 'ar' ? 'المنح الدراسية' : language === 'ku' ? 'سکۆلەرشیپ' : 'Scholarships')
                : selectedOppFilter === 'training'
                ? (language === 'ar' ? 'التدريب' : language === 'ku' ? 'ڕاهێنان' : 'Trainings')
                : selectedOppFilter === 'internship'
                ? (language === 'ar' ? 'فرص التدريب' : language === 'ku' ? 'مەشقەکان' : 'Internships')
                : selectedOppFilter}
            </h2>
          </div>
        )}
        
        {isFeedLoading ? (
          <SkeletonLoader />
        ) : filteredFeedItems.length === 0 ? (
          <div className="text-center py-10 bg-white border border-[#E6E1F5] rounded-2xl p-6 shadow-xs" id="empty-feed-card">
            <div className="text-3xl mb-2">🔭</div>
            <h3 className="font-extrabold text-slate-800 text-xs">
              {selectedFeedTab === 'opportunities'
                ? (language === 'ar' ? 'لا توجد فرص متاحة حالياً' : language === 'ku' ? 'هیچ دەرفەتێک نەدۆزراوەتەوە' : 'No opportunities found yet')
                : (language === 'ar' ? 'لا توجد منشورات بعد' : language === 'ku' ? 'هیچ بابەتێک هێشتا نییە' : 'No posts yet for this category')}
            </h3>
            <p className="text-[10px] text-slate-500 max-w-xs mt-1.5 mx-auto leading-relaxed font-bold">
              {selectedFeedTab === 'opportunities'
                ? (language === 'ar' ? 'تحقق مرة أخرى قريباً أو قم بتغيير فلتر الجامعة.' : language === 'ku' ? 'بەم زووانە دووبارە پشکنین بکەرەوە یان فلتەری زانکۆکەت بگۆڕە.' : 'Check again soon or change your university filter.')
                : (language === 'ar' ? 'كن أول من يشارك شيئاً من جامعتك!' : language === 'ku' ? 'یەکەم کەس بە بۆ هاوبەشکردنی شتێک لە زانکۆکەتەوە!' : 'Be the first to share something from your university.')}
            </p>
          </div>
        ) : (
          <>
            {visibleFeedItems.map(item => (
              <FeedCard
                key={item.id}
                item={item}
                language={language}
                onLike={onLike}
                onSave={onSave}
                onVote={onVote}
                onApply={onApply}
                onRsvp={onRsvp}
                onJoinGroup={onJoinGroup}
                onAddComment={onAddComment}
                onEditFeedItem={onEditFeedItem}
                onDeleteFeedItem={onDeleteFeedItem}
                isAdminMode={isAdminMode}
                onUserClick={onUserClick}
              />
            ))}

            {hasMoreFeedItems && (
              <button
                type="button"
                onClick={() => setVisibleItemsCount(current => current + LOAD_MORE_STEP)}
                className={selectedFeedTab === "opportunities" ? "col-span-2 md:col-span-3 mt-3 rounded-2xl bg-[#161A33] px-4 py-3 text-xs font-black text-white shadow-md" : "mt-3 rounded-2xl bg-[#161A33] px-4 py-3 text-xs font-black text-white shadow-md"}
              >
                {language === "ar" ? "تحميل المزيد" : language === "ku" ? "زیاتر باربکە" : "Load more"}
              </button>
            )}
          </>
        )}
      </div>

      {/* ⚠️ Searchable Custom Institution Picker Modal (Task 1, 2, 3) */}
      <AnimatePresence>
        {showPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="institution-picker-modal">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPicker(false)}
              className="absolute inset-0 bg-[#0c0e1a]"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border-4 border-[#161A33] rounded-3xl w-full max-w-md p-5 shadow-[8px_8px_0px_0px_#161A33] relative z-10 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-[#161A33] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#2F7CCB] text-white flex items-center justify-center font-bold">
                    <School className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#161A33]">
                      {language === 'ar' ? 'اختر المؤسسة الأكاديمية' : language === 'ku' ? 'دامەزراوەی ئەکادیمی هەڵبژێرە' : 'Select Academic Institution'}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold">
                      {selectedGov === 'all' 
                        ? (language === 'ar' ? 'عرض كافة المؤسسات في العراق' : 'Showing all institutions across Iraq')
                        : `${language === 'ar' ? 'مصفى حسب محافظة: ' : 'Filter: '}${IraqiGovernorates.find(g => g.id === selectedGov)?.nameEN || selectedGov}`}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPicker(false)}
                  className="p-1 px-2 border-2 border-[#161A33] rounded-lg bg-[#F3F1FB] hover:bg-rose-100 hover:text-[#D9272E] cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Bar Input */}
              <div className="relative mb-3">
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={async (e) => {
                    setPickerSearch(e.target.value);
                    setPickerPage(1);
                  }}
                  placeholder={language === 'ar' ? 'ابحث بالاسم العربي أو الإنجليزي...' : language === 'ku' ? 'بگەڕێ بەپێی ناو...' : 'Search by Arabic or English name...'}
                  className="w-full text-xs font-bold border-2 border-[#161A33] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F7CCB] focus:shadow-[2px_2px_0px_0px_#2F7CCB] transition-all bg-slate-50 text-[#161A33]"
                  autoFocus
                />
              </div>

              {/* Status & Results Information */}
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-extrabold px-1 mb-2">
                <span>
                  {language === 'ar' ? 'إجمالي النتائج: ' : 'Matched results: '}
                  <strong className="text-[#161A33]">{totalItems}</strong>
                </span>
                <span>
                  {language === 'ar' ? 'صفحة ' : 'Page '}
                  <strong className="text-[#161A33]">{pickerPage}</strong> / {maxPage}
                </span>
              </div>

              {/* Items List container */}
              <div className="flex-1 overflow-y-auto pr-1 min-h-[220px] flex flex-col gap-1.5 scrollbar-thin">
                {institutionsLoading ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <span className="w-8 h-8 rounded-full border-4 border-[#2F7CCB] border-t-transparent animate-spin animate-duration-1000" />
                    <span className="text-xs font-bold text-slate-500">{language === 'ar' ? '⏳ جاري جلب المؤسسات...' : 'Loading institutions from API...'}</span>
                  </div>
                ) : institutionsError ? (
                  <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-xl text-center flex flex-col gap-3">
                    <p className="text-xs font-bold text-rose-950">{language === 'ar' ? `فشل تحميل البيانات: ${institutionsError}` : `API connection error: ${institutionsError}`}</p>
                    <button
                      onClick={onRetryInstitutions}
                      className="py-1.5 px-4 bg-rose-100 hover:bg-rose-200 text-rose-950 font-black border-2 border-[#161A33] cursor-pointer text-[10px] rounded-lg transition-all"
                    >
                      🔄 Retry Call
                    </button>
                  </div>
                ) : paginatedUnis.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-350 rounded-xl">
                    <span className="text-2xl block mb-1">🛰️</span>
                    <span className="text-xs font-extrabold text-slate-500">
                      {language === 'ar' ? 'لا توجد مؤسسات مطابقة للبحث' : 'No matching academic centers'}
                    </span>
                  </div>
                ) : (
                  <>
                    {/* Clear selection option */}
                    {pickerPage === 1 && !pickerSearch && (
                      <button
                        onClick={() => {
                          setSelectedUni('all');
                          setShowPicker(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border-2 hover:bg-slate-50 cursor-pointer text-left transition-all ${
                          selectedUni === 'all'
                            ? 'border-[#2F7CCB] bg-slate-50/70 font-black text-[#2F7CCB]'
                            : 'border-slate-200 font-bold text-slate-700'
                        }`}
                      >
                        <span className="text-xs">🏫 {language === 'ar' ? 'كل الجامعات والمؤسسات' : language === 'ku' ? 'هەموو زانکۆکان' : 'All Institutions / Global Scope'}</span>
                        {selectedUni === 'all' && <CheckCircle className="w-4 h-4 text-[#2F7CCB] shrink-0" />}
                      </button>
                    )}

                    {paginatedUnis.map(uni => (
                      <button
                        key={uni.id}
                        onClick={() => {
                          setSelectedUni(uni.id);
                          setShowPicker(false);
                        }}
                        className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border-2 hover:bg-slate-50 cursor-pointer text-left transition-all ${
                          selectedUni === uni.id
                            ? 'border-[#2F7CCB] bg-blue-50/40 text-[#161A33]'
                            : 'border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-250 flex items-center justify-center text-xs shrink-0">{uni.logo}</span>
                        <div className="flex-1 min-w-0 pr-1.5">
                          <p className="text-[11px] font-black leading-tight text-[#161A33] truncate">
                            {language === 'ar' ? uni.nameAR : language === 'ku' ? uni.nameKU : uni.nameEN}
                          </p>
                          <p className="text-[9px] font-semibold text-slate-400 capitalize flex items-center gap-1.5 mt-0.5">
                            📍 {IraqiGovernorates.find(g => g.id === uni.governorateId)?.nameEN || uni.governorateId}
                          </p>
                        </div>
                        {selectedUni === uni.id && <CheckCircle className="w-4 h-4 text-[#2F7CCB] shrink-0" />}
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* Pagination Footer Controls */}
              {maxPage > 1 && !institutionsLoading && !institutionsError && (
                <div className="flex items-center justify-between border-t border-[#161A33]/15 pt-3 mt-3">
                  <button
                    disabled={pickerPage === 1}
                    onClick={() => setPickerPage(p => Math.max(1, p - 1))}
                    className="p-1.5 px-3 border-2 border-[#161A33] rounded-lg text-xs font-black bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer flex items-center gap-1"
                  >
                    ◀ {language === 'ar' ? 'السابق' : 'Prev'}
                  </button>
                  <span className="text-[10px] font-extrabold text-slate-500">
                    {pickerPage} / {maxPage}
                  </span>
                  <button
                    disabled={pickerPage === maxPage}
                    onClick={() => setPickerPage(p => Math.min(maxPage, p + 1))}
                    className="p-1.5 px-3 border-2 border-[#161A33] rounded-lg text-xs font-black bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer flex items-center gap-1"
                  >
                    {language === 'ar' ? 'التالي' : 'Next'} ▶
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Beautiful Immersive Member Story Board Popup Modal */}
      <AnimatePresence>
        {activeStoryViewer && (() => {
          const student = activeStoryViewer;
          const studentName = language === 'ar' ? student.nameAR : language === 'ku' ? student.nameKU : student.nameEN;
          const studentUni = language === 'ar' ? student.universityAR : language === 'ku' ? student.universityKU : student.universityEN;
          const studentMajor = language === 'ar' ? student.majorAR : language === 'ku' ? student.majorKU : student.majorEN;
          const storyCaption = language === 'ar' ? student.storyCaptionAR : language === 'ku' ? student.storyCaptionKU : student.storyCaptionEN;
          const isRequestSent = friendRequestsSent.includes(student.id);
          const isMsgSent = messageRequestsSent.includes(student.id);

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md select-none transition-all" id="member-storyboard-viewer">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl h-[560px]"
              >
                {/* Simulated story timer progress bar segments at top */}
                <div className="flex gap-1 px-3.5 pt-3.5 pb-2.5 z-20 shrink-0">
                  <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                    <motion.div 
                      key={student.id}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 7, ease: "linear" }}
                      className="h-full bg-orange-400 rounded-full"
                      onAnimationComplete={() => {
                        // Automatically slide to next or close if it is the last
                        const currentIndex = studentsToDiscover.findIndex(s => s.id === student.id);
                        if (currentIndex !== -1 && currentIndex < studentsToDiscover.length - 1) {
                          setActiveStoryViewer(studentsToDiscover[currentIndex + 1]);
                        } else {
                          setActiveStoryViewer(null);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Header info bar */}
                <div className="flex items-center justify-between px-3.5 pb-3 z-20 text-white shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-[#FFD21F] via-orange-500 to-pink-500">
                      <img 
                        src={student.avatar} 
                        alt={studentName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-full bg-slate-900"
                      />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-black text-white flex items-center gap-1.5 leading-none">
                        {studentName}
                        <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" />
                      </span>
                      <span className="text-[9.5px] font-bold text-slate-350 truncate max-w-[190px] block mt-1">
                        {studentUni} • {studentMajor}
                      </span>
                    </div>
                  </div>
                  {/* Close action button */}
                  <button
                    type="button"
                    onClick={() => setActiveStoryViewer(null)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-black cursor-pointer text-sm"
                  >
                    ✕
                  </button>
                </div>

                {/* Immersive high quality image stage */}
                <div className="relative flex-1 bg-slate-950 overflow-hidden flex items-center justify-center p-0" id="story-viewer-stage">
                  <img 
                    src={student.storyImage} 
                    alt="Campus study snapshot" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-4 flex flex-col text-left">
                    <span className="text-[8px] font-black text-[#FFD21F] uppercase tracking-wider mb-1 px-1">{language === 'ar' ? 'قصّة الحرم الجامعي 📷' : language === 'ku' ? 'ستۆری کەمپەس' : 'CAMPUS STUDY LIFE STORY 📷'}</span>
                    <p className="text-xs font-semibold text-slate-100 px-1 leading-relaxed text-left" style={{ direction: language === 'ar' || language === 'ku' ? 'rtl' : 'ltr' }}>
                      {storyCaption}
                    </p>
                  </div>
                </div>

                {/* Bottom interactive action triggers */}
                <div className="p-4 bg-slate-950 border-t border-slate-800/65 flex flex-col gap-2 z-20 shrink-0">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Add Friend Request */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isRequestSent) {
                          setFriendRequestsSent(prev => prev.filter(id => id !== student.id));
                          if (showToast) showToast(language === 'ar' ? 'تم إلغاء الطلب.' : 'Request cancelled.', 'info');
                        } else {
                          setFriendRequestsSent(prev => [...prev, student.id]);
                          if (onAwardPoints) onAwardPoints(20);
                          if (showToast) showToast(language === 'ar' ? `طلب الإضافة مرسل إلى ${studentName}! 🎉` : `Add request sent to ${studentName}! 🎉`, 'success');
                        }
                      }}
                      className={`py-2 px-3 text-[10px] font-black rounded-xl border flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                        isRequestSent 
                          ? 'bg-slate-850 text-slate-400 border-slate-700' 
                          : 'bg-orange-500 hover:bg-orange-600 text-white border-orange-600 shadow-sm active:scale-95'
                      }`}
                    >
                      <span>🤝</span>
                      <span>
                        {isRequestSent 
                          ? (language === 'ar' ? 'تم الإرسال' : language === 'ku' ? 'نێردرا' : 'Request Sent') 
                          : (language === 'ar' ? 'إرسال طلب إضافة' : language === 'ku' ? 'داواکاری زیادکردن' : 'Add Request')}
                      </span>
                    </button>

                    {/* Send Message Request */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isMsgSent) {
                          if (showToast) showToast(language === 'ar' ? 'طلب رسالة نشط بالفعل.' : 'Message request is active.', 'info');
                        } else {
                          setMessageRequestsSent(prev => [...prev, student.id]);
                          if (showToast) showToast(language === 'ar' ? `أرسلت طلب رسالة إلى ${studentName}! 💬` : `Direct message request sent to ${studentName}! 💬`, 'success');
                        }
                      }}
                      className={`py-2 px-3 text-[10px] font-black rounded-xl border flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                        isMsgSent 
                          ? 'bg-slate-850 text-slate-400 border-slate-700' 
                          : 'bg-blue-600 hover:bg-blue-705 text-white border-blue-700 shadow-sm active:scale-95'
                      }`}
                    >
                      <span>💬</span>
                      <span>
                        {isMsgSent 
                          ? (language === 'ar' ? 'طلب مرسل 💬' : 'Sent 💬') 
                          : (language === 'ar' ? 'إرسال رسالة' : language === 'ku' ? 'نامە بنێرە' : 'Send Message')}
                      </span>
                    </button>
                  </div>

                  {/* View Full Profile details */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveStoryViewer(null);
                      if (onUserClick) {
                        onUserClick({
                          id: student.id,
                          name: studentName,
                          avatar: student.avatar,
                          role: student.role as any,
                          universityId: 'all',
                          governorateId: 'all',
                          bioEN: student.bioEN,
                          bioAR: student.bioAR,
                          bioKU: student.bioKU,
                          majorEN: student.majorEN,
                          majorAR: student.majorAR,
                          majorKU: student.majorKU,
                          points: 120,
                          level: 1,
                          savedItemIds: [],
                          appliedJobIds: [],
                          joinedGroupIds: [],
                          rsvpedEventIds: []
                        });
                      }
                    }}
                    className="w-full text-center py-2 px-3 text-[10.5px] font-black text-[#FFD21F] bg-slate-900 border-2 border-[#FFD21F]/80 hover:bg-[#FFD21F]/10 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    🔍 {language === 'ar' ? 'عرض الملف الشخصي الكامل' : language === 'ku' ? 'بینی پڕۆفایلی تەواو' : 'Explore Full Student Profile'}
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Temporary Admin Debug Card (Visible in development mode) */}
      {(() => {
        const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1') || window.location.hostname.includes('run.app');
        const sourceList = institutions && institutions.length > 0 ? institutions : IraqiUniversities;
        const govUnis = selectedGov === 'all' ? sourceList : sourceList.filter(u => u.governorateId === selectedGov);
        
        return isDev ? (
          <div className="mt-8 bg-white border-4 border-dashed border-[#161A33] rounded-3xl p-4.5 shadow-[4px_4px_0px_0px_#161A33] text-left" id="dev-admin-debug-panel">
            <div className="flex items-center gap-2 mb-2.5 border-b-2 border-[#161A33] pb-1.5">
              <span className="text-sm">🛠️</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#161A33]">{language === 'ar' ? 'لوحة تصحيح الأخطاء (المشرف)' : 'Admin Debug Control Panel'}</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-700">
              <div className="p-2 bg-slate-50 border border-[#161A33]/10 rounded-xl">
                <span className="text-slate-400 block uppercase text-[8px] font-black">Institutions Loaded</span>
                <span className="font-extrabold text-[#161A33] font-mono select-all text-xs">{sourceList.length} records</span>
              </div>
              <div className="p-2 bg-slate-50 border border-[#161A33]/10 rounded-xl">
                <span className="text-slate-400 block uppercase text-[8px] font-black">Filtered Count</span>
                <span className="font-extrabold text-[#161A33] font-mono text-xs">{govUnis.length} matches</span>
              </div>
              <div className="p-2 bg-slate-50 border border-[#161A33]/10 rounded-xl">
                <span className="text-slate-400 block uppercase text-[8px] font-black">Selected Governorate</span>
                <span className="font-extrabold text-[#6B25C9] font-mono text-xs capitalize">{selectedGov === 'all' ? 'All' : selectedGov}</span>
              </div>
              <div className="p-2 bg-slate-50 border border-[#161A33]/10 rounded-xl">
                <span className="text-slate-400 block uppercase text-[8px] font-black">Selected Institution</span>
                <span className="font-extrabold text-[#2F7CCB] font-mono text-xs truncate capitalize max-w-[150px] block" title={selectedUni}>
                  {selectedUni === 'all' ? 'All' : selectedUni}
                </span>
              </div>
              <div className="p-2 bg-slate-50 border border-[#161A33]/10 rounded-xl col-span-2">
                <span className="text-slate-400 block uppercase text-[8px] font-black">API Loading / Error Status</span>
                <div className="flex gap-2 items-center mt-0.5">
                  <span className="font-extrabold text-[10px]">
                    {institutionsLoading ? (
                      <span className="text-amber-600 font-mono animate-pulse">LOADING</span>
                    ) : (
                      <span className="text-emerald-600 font-mono">COMPLETE</span>
                    )}
                  </span>
                  <span className="text-slate-300 font-medium">|</span>
                  <span className="font-extrabold font-mono text-[10px] truncate max-w-[200px]" title={institutionsError || 'ONLINE'}>
                    {institutionsError ? <span className="text-rose-600">ERROR: {institutionsError}</span> : <span className="text-emerald-600">ONLINE ✓</span>}
                  </span>
                </div>
              </div>
            </div>
            {institutionsError && (
              <button
                onClick={onRetryInstitutions}
                className="mt-3 w-full py-2 bg-rose-100 hover:bg-rose-200 text-rose-950 font-black border-2 border-[#161A33] cursor-pointer text-[10px] rounded-xl transition-all shadow-[2px_2px_0px_0px_#161A33]"
              >
                🔄 Retry Institutions Load API Call
              </button>
            )}
          </div>
        ) : null;
      })()}

    </div>
  );
}













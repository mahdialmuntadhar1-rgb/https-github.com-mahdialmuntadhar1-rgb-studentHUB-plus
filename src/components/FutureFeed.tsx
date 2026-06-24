import React, { useState, useEffect } from 'react';
import { FeedItem, Language } from '../types';
import { getTranslation } from '../data/translations';
import { IraqiUniversities, IraqiGovernorates } from '../data/mockData';
import { getOpportunities } from '../lib/api';
import { cleanDisplayText } from '../utils/safeText';
import { 
  Calendar, 
  ChevronRight, 
  Briefcase, 
  Award, 
  GraduationCap, 
  School, 
  Users, 
  Activity, 
  BellRing, 
  Compass, 
  Bookmark, 
  MapPin, 
  TrendingUp, 
  Search,
  Globe,
  Clock,
  Filter
} from 'lucide-react';
import { motion } from 'motion/react';
import FeedCard from './FeedCard';
import { SkeletonLoader } from './HomeFeed';

interface FutureFeedProps {
  feedItems: FeedItem[];
  language: Language;
  selectedGov: string;
  selectedUni: string;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onVote: (itemId: string, optionId: string) => void;
  onApply: (id: string) => void;
  onRsvp: (id: string) => void;
  onJoinGroup: (id: string) => void;
  onAddComment: (id: string, commentText: string) => void;
  onBackToHome: () => void;
  isFeedLoading?: boolean;
  onEditFeedItem?: (id: string, updatedFields: Partial<FeedItem>) => void;
  onDeleteFeedItem?: (id: string) => void;
  isAdminMode?: boolean;
  onUserClick?: (user: any) => void;
}

export default function FutureFeed({
  feedItems,
  language,
  selectedGov,
  selectedUni,
  onLike,
  onSave,
  onVote,
  onApply,
  onRsvp,
  onJoinGroup,
  onAddComment,
  onBackToHome,
  isFeedLoading = false,
  onEditFeedItem,
  onDeleteFeedItem,
  isAdminMode = false,
  onUserClick
}: FutureFeedProps) {
  const [opportunities, setOpportunities] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChip, setActiveChip] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterGov, setFilterGov] = useState<string>('all');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [filterDeadline, setFilterDeadline] = useState<string>('all');


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
    } else if (categoryRaw.includes('event')) {
      displayCategory = 'Event';
    } else if (categoryRaw.includes('admission') || categoryRaw.includes('registration')) {
      displayCategory = 'Opportunity';
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

    const rawPositionTitle =
      item.position_title ||
      item.positionTitle ||
      item.job_title ||
      item.jobTitle ||
      item.vacancy_title ||
      item.vacancyTitle ||
      item.role_title ||
      item.roleTitle ||
      item.post_title ||
      item.postTitle ||
      item.titleEN ||
      item.title_en ||
      item.title ||
      item.name ||
      item.headline ||
      '';

    const fallbackTitle = categoryRaw.includes('scholar')
      ? 'Scholarship opportunity'
      : categoryRaw.includes('train')
        ? 'Training opportunity'
        : 'Job position';

    const titleEN = cleanDisplayText(rawPositionTitle, fallbackTitle, categoryRaw);
    const titleAR = cleanDisplayText(
      item.titleAR ||
      item.title_ar ||
      item.position_title_ar ||
      item.job_title_ar ||
      item.vacancy_title_ar ||
      item.title ||
      rawPositionTitle,
      titleEN,
      categoryRaw
    );
    const titleKU = cleanDisplayText(
      item.titleKU ||
      item.title_ku ||
      item.position_title_ku ||
      item.job_title_ku ||
      item.vacancy_title_ku ||
      item.title ||
      rawPositionTitle,
      titleEN,
      categoryRaw
    );

    const contentEN = cleanDisplayText(item.contentEN || item.description || item.summary || item.description_en, 'View details of this public opportunity.', categoryRaw);
    const contentAR = cleanDisplayText(item.contentAR || item.description_ar || item.description || item.summary, contentEN, categoryRaw);
    const contentKU = cleanDisplayText(item.contentKU || item.description_ku || item.description || item.summary, contentEN, categoryRaw);

    const orgName = item.organization || item.institution_name || item.company || 'Recruiter/Provider';
    const gov = item.governorateId || item.governorate || 'all';
    const country = item.country || 'Iraq';
    const city = item.city || '';
    
    const locationParts = [city, gov !== 'all' ? gov : '', country].filter(Boolean);
    const locationStr = locationParts.length > 0 ? locationParts.join(', ') : 'Iraq';

    const resolvedOpportunityUrl = (() => {
      const candidates = [
        item.source_url,
        item.sourceUrl,
        item.apply_url,
        item.applyUrl,
        item.url,
        item.link,
        item.original_url,
        item.originalUrl,
        item.original_source_url,
        item.originalSourceUrl,
        item.application_link
      ];

      for (const candidate of candidates) {
        const cleaned = String(candidate || '').trim().replace(/[)\].,;]+$/g, '');
        if (!/^https?:\/\//i.test(cleaned)) continue;
        if (/(^|\.)google\.[^/]+\/search/i.test(cleaned)) continue;
        if (/(^|\.)bing\.com\/search|(^|\.)duckduckgo\.com\/|(^|\.)yahoo\.com\/search/i.test(cleaned)) continue;
        if (/\.(png|jpe?g|webp|gif|svg)(\?|#|$)/i.test(cleaned)) continue;
        return cleaned;
      }

      return '';
    })();
    const applyUrl = resolvedOpportunityUrl;
    const sourceUrl = resolvedOpportunityUrl;
    const imgUrl = item.image_url || item.imageUrl || '';

    // Safe image URL - don't use Unsplash fallbacks
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

      // High-end localization spec data model fields
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
      date: item.published_date ? `Posted on ${item.published_date}` : 'Recently posted ðŸ””',
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
      source_url: resolvedOpportunityUrl,
      apply_url: resolvedOpportunityUrl,
      application_link: resolvedOpportunityUrl,
      original_source_url: resolvedOpportunityUrl,
      source_name: item.source_name || item.sourceName || item.source?.name || item.source_id || item.sourceId || item.platform || '',
      universityAppliedCount: Number(item.applied_count || 5),
      applied: false
    };
  };

  // Fetch opportunities from backend based on language and activeChip (category filter)
  useEffect(() => {
    let active = true;
    const fetchOpps = async () => {
      setIsLoading(true);
      setError(null);
      setCurrentPage(1);
      try {
        const coreOpportunityCategories = ['job', 'scholarship', 'training', 'internship', 'event', 'exam', 'registration', 'registration'];
        const isAllBatch = activeChip === 'all' || activeChip === 'deadline_soon';
        const categoriesToFetch = isAllBatch ? coreOpportunityCategories : [activeChip];

        const results = await Promise.all(
          categoriesToFetch.map(category =>
            getOpportunities({
              category,
              page: 1,
              limit: category === 'job' ? 1200 : 300,
              governorate: filterGov !== 'all' ? filterGov : undefined
            }, language)
          )
        );

        const mergedItems = results.flatMap(result => result.items || []);
        const mergedTotal = results.reduce((sum, result) => {
          return sum + (Number(result.total) || (result.items?.length || 0));
        }, 0);

        if (active) {
          setOpportunities(mergedItems.map(mapBackendOpportunity));
          setTotalCount(mergedTotal || null);
          setVisibleCount(12);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Failed to fetch opportunities from backend.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };
    fetchOpps();
    return () => {
      active = false;
    };
  }, [language, activeChip, filterGov]);

  // Action wrapper overrides to keep visual states reactive inside the loaded list
  const handleLocalLike = (id: string) => {
    onLike(id);
    setOpportunities(prev => prev.map(item => {
      if (item.id === id) {
        const isLiked = !item.likedByUser;
        return {
          ...item,
          likes: isLiked ? item.likes + 1 : item.likes - 1,
          likedByUser: isLiked
        };
      }
      return item;
    }));
  };

  const handleLocalSave = (id: string) => {
    onSave(id);
    setOpportunities(prev => prev.map(item => {
      if (item.id === id) {
        const isSaved = !item.savedByUser;
        return {
          ...item,
          savedCount: isSaved ? (item.savedCount || 0) + 1 : Math.max(0, (item.savedCount || 1) - 1),
          savedByUser: isSaved
        };
      }
      return item;
    }));
  };

  const handleLocalApply = (id: string) => {
    onApply(id);
    setOpportunities(prev => prev.map(item => {
      if (item.id === id) {
        const isApplied = !item.applied;
        
        // Open opportunity apply link safely after applying
        const urlToOpen = item.applyUrl || item.sourceUrl;
        if (urlToOpen && isApplied) {
          try {
            window.open(urlToOpen, '_blank', 'noopener,noreferrer');
          } catch (e) {
            console.error('Failed to open programmatic URL:', e);
          }
        }

        return {
          ...item,
          applied: isApplied,
          universityAppliedCount: isApplied ? (item.universityAppliedCount || 0) + 1 : Math.max(0, (item.universityAppliedCount || 1) - 1)
        };
      }
      return item;
    }));
  };
// Pagination State
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Exact 11 core categories + All requested in PART 3
  const chips = [
    { id: 'all', labelEN: 'All Future ðŸš€', labelAR: 'ÙƒÙ„ Ø§Ù„Ù…Ø³ØªÙ‚Ø¨Ù„', labelKU: 'Ù‡Û•Ù…ÙˆÙˆ Ø¦Ø§Ù…Ø§Ù†Ø¬Û•Ú©Ø§Ù†' },
    { id: 'job', labelEN: 'Jobs ðŸ’¼', labelAR: 'ÙˆØ¸Ø§Ø¦Ù Ø®Ø±ÙŠØ¬ÙŠÙ†', labelKU: 'Ù‡Û•Ù„ÛŒ Ú©Ø§Ø±' },
    { id: 'scholarship', labelEN: 'Scholarships ðŸŽ“', labelAR: 'Ù…Ù†Ø­ Ø¯Ø±Ø§Ø³ÙŠØ©', labelKU: 'Ø¨Û†Ø±Ø³Û•Ú©Ø§Ù†' },
    { id: 'internship', labelEN: 'Internships ðŸ‘”', labelAR: 'ØªØ¯Ø±ÙŠØ¨ Ø¹Ù…Ù„ÙŠ', labelKU: 'Ù…Û•Ø´Ù‚Û•Ú©Ø§Ù†' },
    { id: 'training', labelEN: 'Trainings ðŸŒŸ', labelAR: 'Ø¯ÙˆØ±Ø§Øª ØªØ£Ù‡ÙŠÙ„ÙŠØ©', labelKU: 'Ú©Û†Ø±Ø³Û•Ú©Ø§Ù†' },
    { id: 'event', labelEN: 'Events ðŸ“…', labelAR: 'ÙØ¹Ø§Ù„ÙŠØ§Øª ØªÙˆØ§ØµÙ„', labelKU: 'Ú†Ø§Ù„Ø§Ú©ÛŒÛŒÛ•Ú©Ø§Ù†' },
    { id: 'volunteering', labelEN: 'Volunteering ðŸ¤', labelAR: 'Ø¹Ù…Ù„ ØªØ·ÙˆØ¹ÙŠ', labelKU: 'Ø®Û†Ø¨Û•Ø®Ø´ÛŒ' },
    { id: 'fellowship', labelEN: 'Fellowships ðŸŽ–ï¸', labelAR: 'Ø²Ù…Ø§Ù„Ø§Øª Ø¯Ø±Ø§Ø³ÙŠØ©', labelKU: 'Ø²Û•Ù…Ø§Ù„Û•Ú©Ø§Ù†' },
    { id: 'competition', labelEN: 'Competitions ðŸ†', labelAR: 'Ù…Ø³Ø§Ø¨Ù‚Ø§Øª ÙˆØ¨Ø·ÙˆÙ„Ø§Øª', labelKU: 'Ù¾ÛŽØ´Ø¨Ú•Ú©ÛŽÚ©Ø§Ù†' },
    { id: 'announcement', labelEN: 'Announcements ðŸ“¢', labelAR: 'Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ø¬Ø§Ù…Ø¹ÙŠØ©', labelKU: 'Ú•Ø§Ú¯Û•ÛŒÛ•Ù†Ø¯Ø±Ø§ÙˆÛ•Ú©Ø§Ù†' },
    { id: 'exam', labelEN: 'Exams ðŸ“', labelAR: 'Ø§Ù…ØªØ­Ø§Ù†Ø§Øª ÙˆØ§Ø®ØªØ¨Ø§Ø±Ø§Øª', labelKU: 'ØªØ§Ù‚ÛŒÚ©Ø±Ø¯Ù†Û•ÙˆÛ•Ú©Ø§Ù†' },
    { id: 'deadline_soon', labelEN: 'Closing Soon â³', labelAR: 'Ù‚Ø±ÙŠØ¨ Ø§Ù„Ø¥ØºÙ„Ø§Ù‚', labelKU: 'Ù†Ø²ÛŒÚ© Ù„Û• Ù…Û†ÚµÛ•Øª' },
  ];

  // Helper selectors matching user's selections
  const currentUniversity = IraqiUniversities.find(u => u.id === selectedUni);
  const currentGovernorate = IraqiGovernorates.find(g => g.id === selectedGov);

  const getUniLabel = () => {
    if (!currentUniversity) return language === 'ar' ? 'Ø¬Ø§Ù…Ø¹ØªÙƒ Ø§Ù„Ù…Ø­Ø¯Ø¯Ø©' : language === 'ku' ? 'Ø²Ø§Ù†Ú©Û†Ú©Û•Øª' : 'Your University';
    return language === 'ar' ? currentUniversity.nameAR : language === 'ku' ? currentUniversity.nameKU : currentUniversity.nameEN;
  };

  const getGovLabel = () => {
    if (!currentGovernorate) return 'Sulaymaniyah';
    return language === 'ar' ? currentGovernorate.nameAR : language === 'ku' ? currentGovernorate.nameKU : currentGovernorate.nameEN;
  };

  // Quick deadlines database
  const timelineReminders = [
    {
      titleEN: "Iraq Cybersecurity CTF Application",
      titleAR: "Ù…Ø³Ø§Ø¨Ù‚Ø© Ø§Ù„Ø£Ù…Ù† Ø§Ù„Ø³ÙŠØ¨Ø±Ø§Ù†ÙŠ Ø§Ù„ÙˆØ·Ù†ÙŠØ©",
      titleKU: "Ú©Û†ØªØ§ Ù…Û†ÚµÛ•ØªÛŒ Ú©ÛŽØ¨Ú•Ú©ÛŽÛŒ Ø³ÛŒØ¨Ø±Ø§Ù†ÛŒ",
      date: "July 5, 2026",
      urgent: true
    },
    {
      titleEN: "Hunar Tech Frontend Internship",
      titleAR: "ØªØ¯Ø±ÙŠØ¨ Ù‡ÙÙ†Ø± Ø§Ù„ØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠ Ù„Ù„Ø¨Ø±Ù…Ø¬Ø©",
      titleKU: "Ù…Û•Ø´Ù‚ÛŒ ÙØ±Û†Ù†ØªÛŽÙ†Ø¯ Ù„Û• Ú©Û†Ù…Ù¾Ø§Ù†ÛŒØ§ÛŒ Ù‡Û†Ù†Û•Ø±",
      date: "June 30, 2026",
      urgent: false
    }
  ];

  // Logic to identify if item is an opportunity card
  const getIsOpportunity = (item: FeedItem) => {
    return [
      'job', 'internship', 'scholarship', 'training', 
      'part_time_job', 'full_time_job', 'volunteering', 
      'competition', 'graduation_project_support', 'fellowship',
      'event', 'announcement', 'exam', 'registration', 'registration', 'registration', 'registration'
    ].includes(item.type) || !!item.opportunityCategory;
  };

  // Governorate alias mapping for client-side filtering
  const getGovernorateAliases = (govId: string): string[] => {
    const aliasMap: Record<string, string[]> = {
      'erbil': ['erbil', 'hawler', 'هەولێر', 'أربيل'],
      'sulaymaniyah': ['sulaymaniyah', 'sulaimani', 'slemani', 'السليمانية', 'سلێمانی'],
      'duhok': ['duhok', 'dohuk', 'دهوك', 'دهۆک'],
      'kirkuk': ['kirkuk', 'كركوك', 'کەرکووک'],
      'baghdad': ['baghdad', 'بغداد'],
      'basra': ['basra', 'البصرة'],
      'nineveh': ['nineveh', 'mosul', 'نينوى', 'الموصل'],
      'najaf': ['najaf', 'النجف'],
      'karbala': ['karbala', 'كربلاء'],
      'wasit': ['wasit', 'واسط'],
      'diyala': ['diyala', 'ديالى'],
      'anbar': ['anbar', 'الأنبار'],
      'babylon': ['babylon', 'بابل'],
      'maysan': ['maysan', 'ميسان'],
      'dhi qar': ['dhi qar', 'ذي قار'],
      'muthanna': ['muthanna', 'المثنى'],
      'qadisiyah': ['qadisiyah', 'القادسية'],
      'salah al-din': ['salah al-din', 'صلاح الدين'],
      'halabja': ['halabja', 'حلبجة']
    };
    return aliasMap[govId.toLowerCase()] || [govId.toLowerCase()];
  };

  // Check if item matches governorate (with alias support)
  const matchesGovernorate = (item: FeedItem, govId: string): boolean => {
    if (govId === 'all') return true;
    
    const aliases = getGovernorateAliases(govId);
    const itemGov = String(item.governorateId || '').toLowerCase();
    const itemLocation = String(item.location || '').toLowerCase();
    const itemCity = String((item as any).city || '').toLowerCase();
    const itemProvince = String((item as any).province || '').toLowerCase();
    
    // Check governorateId field
    if (aliases.some(alias => itemGov.includes(alias) || itemGov === alias)) {
      return true;
    }
    
    // Check location field with aliases
    if (aliases.some(alias => itemLocation.includes(alias) || itemLocation === alias)) {
      return true;
    }
    
    // Check city field with aliases
    if (aliases.some(alias => itemCity.includes(alias) || itemCity === alias)) {
      return true;
    }
    
    // Check province field with aliases
    if (aliases.some(alias => itemProvince.includes(alias) || itemProvince === alias)) {
      return true;
    }
    
    return false;
  };

  // Filter logic across Search + Governorate + Country + Deadline
  const filteredBaseOpportunities = opportunities.filter(item => {
    const isOpp = getIsOpportunity(item) || item.type === 'study_group';
    if (!isOpp) return false;

    // Search filter
    if (searchQuery.trim()) {
      const textSearch = searchQuery.toLowerCase();
      const matchesEN = item.titleEN?.toLowerCase().includes(textSearch) || item.company?.toLowerCase().includes(textSearch) || item.contentEN?.toLowerCase().includes(textSearch);
      const matchesAR = item.titleAR?.toLowerCase().includes(textSearch) || item.company?.toLowerCase().includes(textSearch) || item.contentAR?.toLowerCase().includes(textSearch);
      const matchesKU = item.titleKU?.toLowerCase().includes(textSearch) || item.company?.toLowerCase().includes(textSearch) || item.contentKU?.toLowerCase().includes(textSearch);
      if (!matchesEN && !matchesAR && !matchesKU) return false;
    }

    // Governorate filter with alias support
    if (filterGov !== 'all') {
      if (!matchesGovernorate(item, filterGov)) {
        return false;
      }
    }

    // Country filter
    if (filterCountry !== 'all') {
      const isCountryIraq = (item.country || 'iraq').toLowerCase() === 'iraq';
      if (filterCountry === 'iraq' && !isCountryIraq) return false;
      if (filterCountry === 'international' && isCountryIraq) return false;
    }

    // Deadline filter
    if (filterDeadline !== 'all' && item.deadline) {
      try {
        const diffTime = new Date(item.deadline).getTime() - new Date().getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (filterDeadline === 'week' && (diffDays < 0 || diffDays > 7)) return false;
        if (filterDeadline === 'month' && (diffDays < 0 || diffDays > 30)) return false;
      } catch (e) {
        // ignore raw dates
      }
    }

    return true;
  });

  // Category filter resolver helper for chips selection - STRICT category filtering
  const resolveChipFilteredItems = () => {
    if (activeChip === 'all') return filteredBaseOpportunities;

    return filteredBaseOpportunities.filter(item => {
      const cat = (item.opportunityCategory || item.type || '').toLowerCase();
      
      if (activeChip === 'job') {
        // STRICT: ONLY show job items, not scholarships, training, or fellowships
        const isJob = ['job', 'full_time_job', 'part_time_job'].includes(item.type);
        const isInternship = item.type === 'internship' || cat.includes('intern');
        const isScholarship = cat.includes('scholarship') || cat.includes('fellow');
        const isTraining = cat.includes('train');
        const isVolunteering = cat.includes('volun');
        const isCompetition = cat.includes('compete');
        
        return (isJob || isInternship) && !isScholarship && !isTraining && !isVolunteering && !isCompetition;
      }
      if (activeChip === 'scholarship') {
        // STRICT: ONLY show scholarship/fellowship items, not jobs, training, volunteering, or competitions
        const isScholarship = item.type === 'scholarship' || cat.includes('scholarship');
        const isFellowship = item.type === 'fellowship' || cat.includes('fellow');
        const isJob = cat.includes('job');
        const isTraining = cat.includes('train');
        const isVolunteering = cat.includes('volun');
        const isCompetition = cat.includes('compete');
        const isInternship = cat.includes('intern');
        
        return (isScholarship || isFellowship) && !isJob && !isTraining && !isVolunteering && !isCompetition && !isInternship;
      }
      if (activeChip === 'internship') {
        return item.type === 'internship' || cat.includes('intern');
      }
      if (activeChip === 'training') {
        // STRICT: ONLY show training items, not jobs, scholarships, fellowships, volunteering, or competitions
        const isTraining = item.type === 'training' || cat.includes('train');
        const isJob = cat.includes('job');
        const isScholarship = cat.includes('scholarship') || cat.includes('fellow');
        const isVolunteering = cat.includes('volun');
        const isCompetition = cat.includes('compete');
        const isInternship = cat.includes('intern');
        
        return isTraining && !isJob && !isScholarship && !isVolunteering && !isCompetition && !isInternship;
      }
      if (activeChip === 'event') {
        return item.type === 'event' || cat.includes('event');
      }
      if (activeChip === 'volunteering') {
        return item.type === 'volunteering' || cat.includes('volun');
      }
      if (activeChip === 'fellowship') {
        return item.type === 'fellowship' || cat.includes('fellow');
      }
      if (activeChip === 'competition') {
        return item.type === 'competition' || cat.includes('compete') || cat.includes('grant');
      }
      if (activeChip === 'announcement') {
        return item.type === 'announcement' || cat.includes('announc');
      }
      if (activeChip === 'exam') {
        return item.type === 'exam' || cat.includes('exam') || cat.includes('test');
      }
      if (activeChip === 'deadline_soon') {
        if (!item.deadline) return false;
        try {
          const diffTime = new Date(item.deadline).getTime() - new Date().getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 5;
        } catch (_) {
          return false;
        }
      }
      
      return true;
    });
  };

  const finalFilteredOpportunityItems = resolveChipFilteredItems();

  // Extracting data specifically for the boards (Featured when search is simple and no custom drop filters active)
  const isCustomFiltersActive = filterGov !== 'all' || filterCountry !== 'all' || filterDeadline !== 'all' || searchQuery;

  // Board layout queries (only fallback to default if all dropdowns/search are 'all')
  const featuredUniItems = filteredBaseOpportunities.filter(item => 
    item.universityId === selectedUni
  );

  const popularGovId = selectedGov !== 'all' ? selectedGov : 'sulaymaniyah';
  const popularLocalItems = filteredBaseOpportunities.filter(item => 
    (item.governorateId === popularGovId || item.governorateId === 'all') && (item.likes > 20 || (item.savedCount && item.savedCount > 10))
  );

  const openAllIraqItems = filteredBaseOpportunities.filter(item => 
    item.governorateId === 'all' || item.location?.toLowerCase().includes('all iraq') || item.location?.toLowerCase().includes('online')
  );

  const newInternshipItems = filteredBaseOpportunities.filter(item => 
    item.type === 'internship' || (item.opportunityCategory || '').toLowerCase().includes('intern')
  );

  const scholarshipTrainingItems = filteredBaseOpportunities.filter(item => 
    ['scholarship', 'training'].includes(item.type) || ['Scholarship', 'Training'].includes(item.opportunityCategory || '')
  );

  const savedByClassmatesItems = filteredBaseOpportunities.filter(item => 
    (item.savedCount && item.savedCount > 15) || item.savedByUser
  );

  // Language titles lookups
  const section1Title = language === 'ar' ? `Ø§Ù„Ù…Ù…ÙŠØ²Ø© ÙÙŠ ${getUniLabel()}` : language === 'ku' ? `ØªØ§ÛŒØ¨Û•Øª Ø¨Û• ${getUniLabel()}` : `Featured for ${getUniLabel()}`;
  const section2Title = language === 'ar' ? `Ø§Ù„Ø£ÙƒØ«Ø± Ø´Ø¹Ø¨ÙŠØ© ÙÙŠ ${getGovLabel()}` : language === 'ku' ? `Ø¨Û•Ù†Ø§ÙˆØ¨Ø§Ù†Ú¯ Ù„Û• ${getGovLabel()}` : `Popular in ${getGovLabel()}`;
  const section3Title = language === 'ar' ? 'Ù…ØªØ§Ø­Ø© Ù„Ø¹Ù…ÙˆÙ… Ø§Ù„Ø¹Ø±Ø§Ù‚' : language === 'ku' ? 'Ú©Ø±Ø§ÙˆÛ• Ø¨Û† Ù‡Û•Ù…ÙˆÙˆ Ø¹ÛŽØ±Ø§Ù‚' : 'Open for All Iraq';
  const section4Title = language === 'ar' ? 'Ø¬Ø¯ÙŠØ¯ Ø§Ù„ØªØ¯Ø±ÙŠØ¨ Ø§Ù„ØµÙŠÙÙŠ' : language === 'ku' ? 'Ù…Û•Ø´Ù‚Û• Ù†ÙˆÛŽÛŒÛ•Ú©Ø§Ù†' : 'New Internships';
  const section5Title = language === 'ar' ? 'Ø§Ù„Ù…Ù†Ø­ ÙˆØ§Ù„Ø¯ÙˆØ±Ø§Øª Ø§Ù„ØªØ¯Ø±ÙŠØ¨ÙŠØ©' : language === 'ku' ? 'Ø¨Û†Ø±Ø³Û• Ùˆ Ú•Ø§Ù‡ÛŽÙ†Ø§Ù†Û•Ú©Ø§Ù†' : 'Scholarships & Training';
  const section6Title = language === 'ar' ? 'Ø­ÙØ¸Ù‡Ø§ Ø²Ù…Ù„Ø§Ø¤Ùƒ ÙÙŠ Ø§Ù„ØµÙ' : language === 'ku' ? 'Ù¾Ø§Ø´Û•Ú©Û•ÙˆØªÚ©Ø±Ø§Ùˆ Ù„Û•Ù„Ø§ÛŒÛ•Ù† Ù‡Ø§ÙˆÙ¾Û†Ù„Û•Ú©Ø§Ù†Øª' : 'Saved by Your Classmates';

  // Slice paginated items
  const paginatedItems = finalFilteredOpportunityItems.slice(0, visibleCount);
  const hasHiddenLoadedItems = finalFilteredOpportunityItems.length > visibleCount;
  const hasMoreRemoteItems = totalCount !== null && opportunities.length < totalCount;
  const hasMore = hasHiddenLoadedItems || hasMoreRemoteItems;

  const handleLoadMore = async () => {
    if (finalFilteredOpportunityItems.length > visibleCount) {
      setVisibleCount(prev => prev + 12);
      return;
    }

    const nextPage = currentPage + 1;
    setIsLoading(true);
    try {
      const coreOpportunityCategories = ['job', 'scholarship', 'training', 'internship', 'event', 'exam', 'registration', 'registration'];
      const isAllBatch = activeChip === 'all' || activeChip === 'deadline_soon';
      const categoriesToFetch = isAllBatch ? coreOpportunityCategories : [activeChip];

      const results = await Promise.all(
        categoriesToFetch.map(category =>
          getOpportunities({
            category,
            page: nextPage,
            limit: category === 'job' ? 1200 : 300,
            governorate: filterGov !== 'all' ? filterGov : undefined
          }, language)
        )
      );

      const mergedItems = results.flatMap(result => result.items || []);
      const mergedTotal = results.reduce((sum, result) => {
        return sum + (Number(result.total) || (result.items?.length || 0));
      }, 0);

      setOpportunities(prev => [...prev, ...mergedItems.map(mapBackendOpportunity)]);
      setCurrentPage(nextPage);
      setTotalCount(mergedTotal || null);
    } catch (err: any) {
      setError(err.message || 'Failed to load more opportunities');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 py-4 max-w-lg mx-auto flex flex-col pb-28 bg-[#F3F7FF] min-h-screen" id="future-feed-container">
      
      {/* Dynamic Reset Banner back to Campus Today */}
      <div 
        id="future-filter-reset-banner"
        onClick={onBackToHome}
        className="mb-5 bg-white border-2 border-[#161A33] rounded-3xl p-3.5 flex items-center justify-between cursor-pointer shadow-[3px_3px_0px_0px_#161A33] hover:shadow-[5px_5px_0px_0px_#161A33] transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#6B25C9]/10 border border-[#161A33]/20 text-[#6B25C9] flex items-center justify-center font-bold text-lg select-none">
            ðŸš€
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black tracking-tight text-[#161A33] uppercase">
              {getTranslation('viewingFuture', language)}
            </span>
            <span className="text-[9px] text-slate-500 font-extrabold leading-tight mt-0.5">
              Your Campus Life. Your Future. Your Iraq.
            </span>
          </div>
        </div>
        <div className="text-[10px] bg-[#FFD21F] text-[#161A33] border-2 border-[#161A33] rounded-xl px-2.5 py-1.5 font-black shadow-sm flex items-center gap-1 shrink-0 hover:scale-[1.03] transition-transform">
          <span>Campus Today</span>
          <ChevronRight className="w-3 text-[#161A33]" />
        </div>
      </div>

      {/* Search box overlay */}
      <div className="relative mb-3" id="future-search-bar">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-[#161A33]" />
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={language === 'ar' ? 'Ø§Ø¨Ø­Ø« Ø¹Ù† ÙØ±Øµ Ø¹Ù…Ù„ ÙˆØªØ¯Ø±ÙŠØ¨...' : language === 'ku' ? 'Ø¨Ú¯Û•Ú•ÛŽ Ø¨Û† Ú©Ø§Ø± Ùˆ Ù…Û•Ø´Ù‚...' : 'Search jobs, internships, training...'}
          className="w-full bg-white text-xs border-2 border-[#161A33] rounded-2xl py-3 pl-10 pr-4 text-[#161A33] font-black focus:outline-none focus:bg-[#FFFBEB]/40 shadow-inner placeholder-slate-400"
        />
        {searchQuery && (
          <button 
            type="button" 
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-3.5 flex items-center text-xs font-black text-[#6B25C9] active:scale-95 px-1 bg-transparent border-0 cursor-pointer"
          >
            {language === 'ar' ? 'Ù…Ø³Ø­' : language === 'ku' ? 'Ø³Ú•ÛŒÙ†Û•ÙˆÛ•' : 'Clear'}
          </button>
        )}
      </div>
      {/* Clean city/governorate filter - Only show for Jobs */}
      {activeChip === 'job' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-4 mb-4 shadow-sm" id="advanced-filters-panel">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900">Jobs by governorate</h3>
              <p className="text-[11px] font-bold text-slate-500">Choose a city/governorate to show matching opportunities.</p>
            </div>
            <MapPin className="w-5 h-5 text-orange-500 shrink-0" />
          </div>

          <select
            value={filterGov}
            onChange={e => {
              setFilterGov(e.target.value);
              setVisibleCount(12);
              setCurrentPage(1);
            }}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-800 outline-none focus:border-orange-400"
          >
            <option value="all">All Iraq</option>
            {IraqiGovernorates.map(g => (
              <option key={g.id} value={g.id}>
                {language === 'ar' ? g.nameAR : language === 'ku' ? g.nameKU : g.nameEN}
              </option>
            ))}
          </select>
        </div>
      )}
      {/* Deadlines Alert list (Rendered only on general view with no search) */}
      {!isCustomFiltersActive && (
        <div className="bg-white border-2 border-[#161A33] rounded-3xl p-3.5 mb-5 shadow-[3px_3px_0px_0px_#161A33]" id="deadlines-ticker-panel">
          <h3 className="text-[10px] font-black uppercase text-[#D9272E] tracking-wider mb-2.5 flex items-center gap-1.5 leading-none">
            <BellRing className="w-4 h-4 text-[#D9272E] animate-bounce" /> {getTranslation('upcomingDeadlines', language)}
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            {timelineReminders.map((rem, i) => (
              <div 
                key={i} 
                className={`p-2.5 rounded-xl border-y border-r border-[#E6E1F5] flex flex-col justify-between h-22 shadow-sm transition-transform hover:-translate-y-0.5 border-l-4 ${
                  rem.urgent 
                    ? 'bg-red-50/50 border-l-[#D9272E]' 
                    : 'bg-[#F3F7FF] border-l-[#6B25C9]'
                }`}
              >
                <p className={`text-[10px] font-black leading-tight limit-rows-2 ${rem.urgent ? 'text-[#D9272E]' : 'text-[#161A33]'}`}>
                  {language === 'ar' ? rem.titleAR : language === 'ku' ? rem.titleKU : rem.titleEN}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[8px] text-slate-500 font-bold uppercase">{getTranslation('dueDateLabel', language)}</span>
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                    rem.urgent 
                      ? 'text-[#D9272E] bg-red-100 border border-[#D9272E]/25' 
                      : 'text-[#6B25C9] bg-[#6B25C9]/10 border border-[#6B25C9]/20'
                  }`}>
                    {rem.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category selector slider chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-5 scrollbar-none" id="future-chips-container">
        {chips.map((chip) => {
          const isSelected = activeChip === chip.id;
          const label = language === 'ar' ? chip.labelAR : language === 'ku' ? chip.labelKU : chip.labelEN;

          return (
            <button
              key={chip.id}
              onClick={() => { setActiveChip(chip.id); setVisibleCount(12); }}
              className={`px-3 py-1.8 rounded-xl text-xs shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#6B25C9] text-white border-2 border-[#161A33] shadow-[2px_2px_0px_0px_#161A33] font-black'
                  : 'bg-white hover:bg-slate-50 border-2 border-[#E6E1F5] text-[#161A33] hover:text-[#6B25C9] font-bold'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Board Layouts: 6 Sections displayed when "all" chip is active AND no filters are selected */}
      {error ? (
        <div className="text-[#D9272E] bg-white border-2 border-[#D9272E] rounded-3xl p-8 text-center shadow-[3px_3px_0px_0px_#D9272E] mb-5">
          <div className="text-4xl mb-3">âš ï¸</div>
          <h3 className="font-extrabold text-sm uppercase tracking-wide">
            {language === 'ar' ? 'ÙØ´Ù„ ØªØ­Ù…ÙŠÙ„ Ø§Ù„ÙØ±Øµ Ø§Ù„Ø¹Ø§Ù…Ø©' : language === 'ku' ? 'Ø¨Ø§Ø±Ú©Ø±Ø¯Ù†ÛŒ Ø¯Û•Ø±ÙÛ•ØªÛ•Ú©Ø§Ù† Ø³Û•Ø±Ú©Û•ÙˆØªÙˆÙˆ Ù†Û•Ø¨ÙˆÙˆ' : 'Failed to load opportunities'}
          </h3>
          <p className="text-[11px] text-slate-500 max-w-xs mt-2 mx-auto leading-relaxed">
            {error}
          </p>
          <button
            onClick={() => {
              let active = true;
              setIsLoading(true);
              setError(null);
              let categoryParam: string | undefined = undefined;
              if (['job', 'scholarship', 'internship', 'training', 'event', 'volunteering', 'fellowship', 'competition', 'announcement', 'exam'].includes(activeChip)) {
                categoryParam = activeChip;
              }
              getOpportunities({ category: categoryParam, page: 1, limit: 50, governorate: filterGov !== 'all' ? filterGov : undefined }, language).then(result => {
                if (active) {
                  setOpportunities(result.items.map(mapBackendOpportunity));
                  setTotalCount(result.total);
                  setIsLoading(false);
                }
              }).catch(err => {
                if (active) {
                  setError(err.message || 'Failed to fetch');
                  setIsLoading(false);
                }
              });
            }}
            className="mt-4 bg-[#D9272E] text-white border-2 border-[#161A33] font-black text-xs px-4 py-2 rounded-xl transition-all active:scale-95 cursor-pointer shadow-[2px_2px_0px_0px_#161A33]"
          >
            {language === 'ar' ? 'Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© ðŸ”„' : language === 'ku' ? 'Ø¯ÙˆÙˆØ¨Ø§Ø±Û• Ù‡Û•ÙˆÚµØ¨Ø¯Û•Ø±Û•ÙˆÛ• ðŸ”„' : 'Retry Loading ðŸ”„'}
          </button>
        </div>
      ) : (isFeedLoading || isLoading) ? (
        <SkeletonLoader />
      ) : activeChip === 'job' && filterGov !== 'all' && finalFilteredOpportunityItems.length === 0 ? (
        <div className="text-slate-500 bg-white border-2 border-[#161A33] rounded-3xl p-8 text-center shadow-[3px_3px_0px_0px_#161A33] mb-5">
          <div className="text-4xl mb-3">ðŸ”­</div>
          <h3 className="font-extrabold text-[#161A33] text-sm uppercase tracking-wide">
            {language === 'ar' ? 'لا توجد وظائف في هذه المحافظة حالياً.' : language === 'ku' ? 'لە ئێستادا هیچ هەلی کارێک لەم پارێزگایەدا نییە.' : 'No jobs found in this governorate.'}
          </h3>
          <p className="text-[11px] text-slate-500 max-w-xs mt-2 mx-auto leading-relaxed">
            {language === 'ar' ? 'جرب اختيار محافظة أخرى أو تصفح جميع الوظائف في العراق.' : language === 'ku' ? 'تکایە پارێزگایەکی دیکە هەڵبژێرە یان هەموو کارەکانی عێراق ببینە.' : 'Try selecting a different governorate or browse all jobs in Iraq.'}
          </p>
          <button
            onClick={() => setFilterGov('all')}
            className="mt-4 bg-[#6B25C9] text-white border-2 border-[#161A33] font-black text-xs px-4 py-2 rounded-xl transition-all active:scale-95 cursor-pointer shadow-[2px_2px_0px_0px_#161A33]"
          >
            {language === 'ar' ? 'عرض جميع الوظائف' : language === 'ku' ? 'هەموو کارەکان پیشان بدە' : 'Show All Jobs'}
          </button>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="text-slate-500 bg-white border-2 border-[#161A33] rounded-3xl p-8 text-center shadow-[3px_3px_0px_0px_#161A33] mb-5">
          <div className="text-4xl mb-3">ðŸ”­</div>
          <h3 className="font-extrabold text-[#161A33] text-sm uppercase tracking-wide">
            {language === 'ar' ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¹Ù†Ø§ØµØ± Ù…ØªØ§Ø­Ø© Ø¨Ø¹Ø¯ Ù„Ù‡Ø°Ù‡ Ø§Ù„ÙØ¦Ø©.' : language === 'ku' ? 'Ù‡ÛŒÚ† Ù¾Û†Ø³ØªÛŽÚ© Ø¨Û† Ø¦Û•Ù… Ù¾Û†Ù„Û• Ø¨Û•Ø±Ø¯Û•Ø³Øª Ù†ÛŒÛŒÛ•.' : 'No items available yet for this category.'}
          </h3>
          <p className="text-[11px] text-slate-500 max-w-xs mt-2 mx-auto leading-relaxed">
            {language === 'ar' ? 'Ø§Ù„ÙØ±Øµ Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø© Ù…Ù† Ù‚Ø¨Ù„ Ø§Ù„Ù…Ø³Ø¤ÙˆÙ„ÙŠÙ† ÙˆØ§Ù„Ø´Ø±ÙƒØ§Ø¡ Ù„Ø¬Ø§Ù…Ø¹ØªÙƒ ÙˆÙ…Ø­Ø§ÙØ¸ØªÙƒ Ø³ØªØ¸Ù‡Ø± Ù‡Ù†Ø§ Ù‚Ø±ÙŠØ¨Ø§Ù‹.' : 'Opportunities moderated by administrators and partners for your university and governorate will appear here once approved.'}
          </p>
        </div>
      ) : (activeChip === 'all' && !isCustomFiltersActive) ? (
        <div className="flex flex-col gap-6" id="serious-career-future-dashboard">
          
          {/* Section 1: Featured for your university */}
          <div className="flex flex-col" id="dashboard-sec-uni">
            <h2 className="text-xs font-black text-[#161A33] uppercase tracking-tight flex items-center gap-1.5 mb-2.5 border-l-4 border-[#FFD21F] pl-2">
              <School className="w-4 h-4 text-[#6B25C9] shrink-0" />
              <span>{section1Title}</span>
              <span className="w-1.5 h-1.5 bg-[#FFD21F] rounded-full animate-ping mt-0.5" />
            </h2>
            
            {featuredUniItems.length === 0 ? (
              <div className="rounded-3xl border-2 border-[#161A33] bg-white p-6 text-center shadow-sm flex flex-col items-center justify-center">
                <span className="text-3xl mb-1.5 select-none animate-bounce">ðŸŽ“</span>
                <p className="text-[11px] font-black text-slate-700 uppercase tracking-wide">
                  {language === 'ar' 
                    ? `Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ù†Ø´ÙˆØ±Ø§Øª Ù„Ø¬Ø§Ù…Ø¹ØªÙƒ Ø­Ø§Ù„ÙŠØ§Ù‹. ØªØµÙØ­ Ø§Ù„ÙØ±Øµ Ø§Ù„Ø¹Ø§Ù…Ø© Ù„Ø¹Ù…ÙˆÙ… Ø§Ù„Ø¹Ø±Ø§Ù‚!` 
                    : language === 'ku' 
                    ? `Ù‡ÛŒÚ† Ø¯Û•Ø±ÙÛ•ØªÛŽÚ© Ø¨Û† Ø²Ø§Ù†Ú©Û†Ú©Û•Øª Ù†ÛŒÛŒÛ• Ù„Û• Ø¦ÛŽØ³ØªØ§Ø¯Ø§. Ø¯Û•Ø±ÙÛ•ØªÛ• Ú¯Ø´ØªÛŒÛŒÛ•Ú©Ø§Ù†ÛŒ Ø¹ÛŽØ±Ø§Ù‚ ØªØ§Ù‚ÛŒØ¨Ú©Û• Ø¨Ú©Û•!` 
                    : `No jobs yet for your university â€” explore All Iraq opportunities.`}
                </p>
                <div 
                  onClick={() => setActiveChip('internship')}
                  className="mt-3 bg-[#FFD21F] text-[#161A33] border-2 border-[#161A33] font-black text-[10px] px-3 py-1.5 rounded-xl transition-all hover:scale-102 cursor-pointer shadow-[2px_2px_0px_0px_#161A33]"
                >
                  {language === 'ar' ? 'Ø§Ø³ØªÙƒØ´Ù Ø§Ù„ÙØ±Øµ Ø§Ù„Ø¹Ø§Ù…Ø© Ù„Ù„Ø¹Ø±Ø§Ù‚' : language === 'ku' ? 'Ø¨ÛŒÙ†ÛŒÙ†ÛŒ Ù‡Û•Ù„ÛŒ Ú©Ø§Ø±Û• Ú¯Ø´ØªÛŒÛŒÛ•Ú©Ø§Ù†' : 'Explore General Opportunities'}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {featuredUniItems.map(item => (
                   <FeedCard
                     key={item.id}
                     item={item}
                     language={language}
                     onLike={handleLocalLike}
                     onSave={handleLocalSave}
                     onVote={onVote}
                     onApply={handleLocalApply}
                     onRsvp={onRsvp}
                     onJoinGroup={onJoinGroup}
                     onAddComment={onAddComment}
                     onEditFeedItem={onEditFeedItem}
                     onDeleteFeedItem={onDeleteFeedItem}
                     isAdminMode={isAdminMode}
                   />
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Popular in selected governorate / Sulaymaniyah */}
          <div className="flex flex-col" id="dashboard-sec-gov">
            <h2 className="text-xs font-black text-[#161A33] uppercase tracking-tight flex items-center gap-1.5 mb-2.5 border-l-4 border-[#2F7CCB] pl-2">
              <TrendingUp className="w-4 h-4 text-[#2F7CCB] shrink-0" />
              <span>{section2Title}</span>
            </h2>
            {popularLocalItems.length === 0 ? (
              <p className="text-[10px] font-bold text-slate-600 bg-white rounded-2xl p-4 border-2 border-[#E6E1F5] text-center leading-relaxed">
                {language === 'ar' 
                  ? `Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ù†Ø´ÙˆØ±Ø§Øª Ù…Ù…ÙŠØ²Ø© Ø­Ø§Ù„ÙŠØ§Ù‹ ÙÙŠ ${getGovLabel()}. Ù…Ø¹Ø±ÙˆØ¶ Ù„Ùƒ Ø§Ù„ÙØ±Øµ Ø§Ù„Ø¹Ø§Ù…Ø© ÙÙŠ Ø§Ù„Ø¹Ø±Ø§Ù‚!` 
                  : language === 'ku' 
                  ? `Ù‡ÛŒÚ† Ù¾Û†Ø³ØªÛŽÚ©ÛŒ Ø³Û•Ø±Ù†Ø¬Ú•Ø§Ú©ÛŽØ´ Ù„Û• ${getGovLabel()} Ù†ÛŒÛŒÛ•. Ø¨Û•Ù‡Ø§ÛŒ Ú¯Ø´ØªÛŒ Ø¹ÛŽØ±Ø§Ù‚Øª Ù¾ÛŒØ´Ø§Ù† Ø¯Û•Ø¯Û•ÛŒÙ†!` 
                  : `No active highlights in ${getGovLabel()} yet. Showing Iraqi national highlights instead!`}
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {popularLocalItems.map(item => (
                   <FeedCard
                     key={item.id}
                     item={item}
                     language={language}
                     onLike={handleLocalLike}
                     onSave={handleLocalSave}
                     onVote={onVote}
                     onApply={handleLocalApply}
                     onRsvp={onRsvp}
                     onJoinGroup={onJoinGroup}
                     onAddComment={onAddComment}
                     onEditFeedItem={onEditFeedItem}
                     onDeleteFeedItem={onDeleteFeedItem}
                     isAdminMode={isAdminMode}
                   />
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Open for all Iraq */}
          <div className="flex flex-col" id="dashboard-sec-alliraq">
            <h2 className="text-xs font-black text-[#161A33] uppercase tracking-tight flex items-center gap-1.5 mb-2.5 border-l-4 border-[#6B25C9] pl-2">
              <Compass className="w-4 h-4 text-[#6B25C9] shrink-0" />
              <span>{section3Title}</span>
            </h2>
            <div className="flex flex-col gap-1">
              {openAllIraqItems.slice(0, 4).map(item => (
                <FeedCard
                  key={item.id}
                  item={item}
                  language={language}
                  onLike={handleLocalLike}
                  onSave={handleLocalSave}
                  onVote={onVote}
                  onApply={handleLocalApply}
                  onRsvp={onRsvp}
                  onJoinGroup={onJoinGroup}
                  onAddComment={onAddComment}
                  onEditFeedItem={onEditFeedItem}
                  onDeleteFeedItem={onDeleteFeedItem}
                  isAdminMode={isAdminMode}
                />
              ))}
            </div>
          </div>

          {/* Section 4: New internships */}
          <div className="flex flex-col" id="dashboard-sec-interns">
            <h2 className="text-xs font-black text-[#161A33] uppercase tracking-tight flex items-center gap-1.5 mb-2.5 border-l-4 border-[#6B25C9] pl-2">
              <Briefcase className="w-4 h-4 text-[#6B25C9] shrink-0" />
              <span>{section4Title}</span>
            </h2>
            <div className="flex flex-col gap-1">
              {newInternshipItems.slice(0, 3).map(item => (
                <FeedCard
                  key={item.id}
                  item={item}
                  language={language}
                  onLike={handleLocalLike}
                  onSave={handleLocalSave}
                  onVote={onVote}
                  onApply={handleLocalApply}
                  onRsvp={onRsvp}
                  onJoinGroup={onJoinGroup}
                  onAddComment={onAddComment}
                  onEditFeedItem={onEditFeedItem}
                  onDeleteFeedItem={onDeleteFeedItem}
                  isAdminMode={isAdminMode}
                />
              ))}
            </div>
          </div>

          {/* Section 5: Scholarships and training */}
          <div className="flex flex-col" id="dashboard-sec-scholarships">
            <h2 className="text-xs font-black text-[#161A33] uppercase tracking-tight flex items-center gap-1.5 mb-2.5 border-l-4 border-[#2F7CCB] pl-2">
              <GraduationCap className="w-4 h-4 text-[#2F7CCB] shrink-0" />
              <span>{section5Title}</span>
            </h2>
            <div className="flex flex-col gap-1">
              {scholarshipTrainingItems.slice(0, 3).map(item => (
                <FeedCard
                  key={item.id}
                  item={item}
                  language={language}
                  onLike={handleLocalLike}
                  onSave={handleLocalSave}
                  onVote={onVote}
                  onApply={handleLocalApply}
                  onRsvp={onRsvp}
                  onJoinGroup={onJoinGroup}
                  onAddComment={onAddComment}
                  onEditFeedItem={onEditFeedItem}
                  onDeleteFeedItem={onDeleteFeedItem}
                  isAdminMode={isAdminMode}
                />
              ))}
            </div>
          </div>

          {/* Section 6: Saved by classmates */}
          <div className="flex flex-col" id="dashboard-sec-savedbypeers">
            <h2 className="text-xs font-black text-[#161A33] uppercase tracking-tight flex items-center gap-1.5 mb-2.5 border-l-4 border-[#D9272E] pl-2">
              <Bookmark className="w-4 h-4 text-[#D9272E] shrink-0" />
              <span>{section6Title}</span>
            </h2>
            <div className="flex flex-col gap-1">
              {savedByClassmatesItems.slice(0, 3).map(item => (
                <FeedCard
                  key={item.id}
                  item={item}
                  language={language}
                  onLike={handleLocalLike}
                  onSave={handleLocalSave}
                  onVote={onVote}
                  onApply={handleLocalApply}
                  onRsvp={onRsvp}
                  onJoinGroup={onJoinGroup}
                  onAddComment={onAddComment}
                  onEditFeedItem={onEditFeedItem}
                  onDeleteFeedItem={onDeleteFeedItem}
                  isAdminMode={isAdminMode}
                />
              ))}
            </div>
          </div>

        </div>
      ) : (
        /* Linear flow with active filters and pagination */
        <div className="flex flex-col gap-1 text-left" id="linear-opportunities-feed-items">
          {paginatedItems.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-white border-2 border-[#161A33] rounded-3xl p-6 shadow-sm">
              <div className="text-3xl mb-2">ðŸ”­</div>
              <h3 className="font-extrabold text-[#161A33] text-xs">
                {language === 'ar' ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¹Ù†Ø§ØµØ± Ù…ØªØ§Ø­Ø© Ø¨Ø¹Ø¯ Ù„Ù‡Ø°Ù‡ Ø§Ù„ÙØ¦Ø©.' : language === 'ku' ? 'Ù‡ÛŒÚ† Ù¾Û†Ø³ØªÛŽÚ© Ø¨Û† Ø¦Û•Ù… Ù¾Û†Ù„Û• Ø¨Û•Ø±Ø¯Û•Ø³Øª Ù†ÛŒÛŒÛ•.' : 'No items available yet for this category.'}
              </h3>
              <p className="text-[10px] text-slate-500 max-w-xs mt-1.5 mx-auto leading-relaxed">
                {language === 'ar' ? 'Ø¬Ø±Ù‘Ø¨ ÙƒØªØ§Ø¨Ø© ÙƒÙ„Ù…Ø§Øª Ø£Ø¨Ø³Ø· Ø£Ùˆ ØªØºÙŠÙŠØ± Ø§Ù„ÙÙ„ØªØ± Ø§Ù„Ø°ÙƒÙŠ Ø£Ùˆ Ù‚Ù… Ø¨Ù…Ø­Ùˆ Ù…Ø¹ÙŠØ§Ø± Ø§Ù„Ø¨Ø­Ø«.' : 'Try broadening your governorate or scope selection or clearing the search bar.'}
              </p>
            </div>
          ) : (
            <>
              {paginatedItems.map(item => (
                <FeedCard
                  key={item.id}
                  item={item}
                  language={language}
                  onLike={handleLocalLike}
                  onSave={handleLocalSave}
                  onVote={onVote}
                  onApply={handleLocalApply}
                  onRsvp={onRsvp}
                  onJoinGroup={onJoinGroup}
                  onAddComment={onAddComment}
                  onEditFeedItem={onEditFeedItem}
                  onDeleteFeedItem={onDeleteFeedItem}
                  isAdminMode={isAdminMode}
                />
              ))}
              
              {/* Pagination load more triggers */}
              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  className="w-full mt-2 py-3 bg-white text-[#161A33] font-black border-2 border-[#161A33] hover:bg-slate-55 hover:text-[#6B25C9] rounded-2xl cursor-pointer transition-all active:scale-[0.98] shadow-[2px_2px_0px_0px_#161A33] flex items-center justify-center gap-1.5 text-xs select-none"
                  id="opportunities-load-more-btn"
                >
                  <span>{language === 'ar' ? 'Ø¹Ø±Ø¶ Ø§Ù„Ù…Ø²ÙŠØ¯ Ù…Ù† Ø§Ù„ÙØ±Øµ ðŸ”„' : language === 'ku' ? 'Ø¨ÛŒÙ†ÛŒÙ†ÛŒ Ø¯Û•Ø±ÙÛ•ØªÛŒ Ø²ÛŒØ§ØªØ± ðŸ”„' : 'Load More Opportunities ðŸ”„'}</span>
                </button>
              )}
            </>
          )}
        </div>
      )}

    </div>
  );
}







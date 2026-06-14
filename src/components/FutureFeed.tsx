import React, { useState, useEffect } from 'react';
import { FeedItem, Language } from '../types';
import { getTranslation } from '../data/translations';
import { IraqiUniversities, IraqiGovernorates } from '../data/mockData';
import { getOpportunities } from '../lib/api';
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
  isAdminMode = false
}: FutureFeedProps) {
  const [opportunities, setOpportunities] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

    const titleEN = item.titleEN || item.title || item.title_en || 'Public Opportunity';
    const titleAR = item.titleAR || item.title_ar || item.title || titleEN;
    const titleKU = item.titleKU || item.title_ku || item.title || titleEN;

    const contentEN = item.contentEN || item.description || item.summary || item.description_en || 'View details of this public opportunity.';
    const contentAR = item.contentAR || item.description_ar || item.description || item.summary || contentEN;
    const contentKU = item.contentKU || item.description_ku || item.description || item.summary || contentEN;

    const orgName = item.organization || item.institution_name || item.company || 'Recruiter/Provider';
    const gov = item.governorateId || item.governorate || 'all';
    const country = item.country || 'Iraq';
    const city = item.city || '';
    
    const locationParts = [city, gov !== 'all' ? gov : '', country].filter(Boolean);
    const locationStr = locationParts.length > 0 ? locationParts.join(', ') : 'Iraq';

    const applyUrl = item.apply_url || item.application_link || item.original_source_url || item.source_url || '';
    const sourceUrl = item.source_url || item.original_source_url || item.application_link || '';
    const imgUrl = item.image_url || item.imageUrl || '';

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
        avatar: imgUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=100',
        verified: true
      },
      date: item.published_date ? `Posted on ${item.published_date}` : 'Recently posted 🔔',
      likes: Number(item.likes || 0),
      likedByUser: false,
      savedCount: Number(item.savedCount || item.saved_count || 0),
      savedByUser: false,
      commentsCount: 0,
      commentsList: [],
      governorateId: gov,
      country: country,
      universityId: 'all',
      tags: [categoryRaw, displayCategory],
      company: orgName,
      companyLogo: imgUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=100',
      location: locationStr,
      deadline: item.deadline || '',
      imageUrl: imgUrl,
      opportunityCategory: displayCategory as any,
      workplaceType: item.workplaceType || 'On-site',
      whoCanApply: item.whoCanApply || 'Interested applicants',
      salary: item.salary || 'Recruiter structured',
      applyUrl,
      sourceUrl,
      universityAppliedCount: Number(item.universityAppliedCount || item.applied_count || 0),
      applied: false
    };
  };

  // Fetch opportunities from backend
  useEffect(() => {
    let active = true;
    const fetchOpps = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getOpportunities(language);
        if (active) {
          setOpportunities(data.opportunities.map(mapBackendOpportunity));
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
  }, [language]);

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

  const [activeChip, setActiveChip] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom filter dropdown states
  const [filterGov, setFilterGov] = useState<string>('all');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [filterDeadline, setFilterDeadline] = useState<string>('all');
  
  // Pagination State
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Exact 11 core categories + All requested in PART 3
  const chips = [
    { id: 'all', labelEN: 'All Future 🚀', labelAR: 'كل المستقبل', labelKU: 'هەموو ئامانجەکان' },
    { id: 'job', labelEN: 'Jobs 💼', labelAR: 'وظائف خريجين', labelKU: 'هەلی کار' },
    { id: 'scholarship', labelEN: 'Scholarships 🎓', labelAR: 'منح دراسية', labelKU: 'بۆرسەکان' },
    { id: 'internship', labelEN: 'Internships 👔', labelAR: 'تدريب عملي', labelKU: 'مەشقەکان' },
    { id: 'training', labelEN: 'Trainings 🌟', labelAR: 'دورات تأهيلية', labelKU: 'کۆرسەکان' },
    { id: 'event', labelEN: 'Events 📅', labelAR: 'فعاليات تواصل', labelKU: 'چالاکییەکان' },
    { id: 'volunteering', labelEN: 'Volunteering 🤝', labelAR: 'عمل تطوعي', labelKU: 'خۆبەخشی' },
    { id: 'fellowship', labelEN: 'Fellowships 🎖️', labelAR: 'زمالات دراسية', labelKU: 'زەمالەکان' },
    { id: 'competition', labelEN: 'Competitions 🏆', labelAR: 'مسابقات وبطولات', labelKU: 'پێشبڕکێکان' },
    { id: 'announcement', labelEN: 'Announcements 📢', labelAR: 'إعلانات جامعية', labelKU: 'ڕاگەیەندراوەکان' },
    { id: 'exam', labelEN: 'Exams 📝', labelAR: 'امتحانات واختبارات', labelKU: 'تاقیکردنەوەکان' },
    { id: 'deadline_soon', labelEN: 'Closing Soon ⏳', labelAR: 'قريب الإغلاق', labelKU: 'نزیک لە مۆڵەت' },
  ];

  // Helper selectors matching user's selections
  const currentUniversity = IraqiUniversities.find(u => u.id === selectedUni);
  const currentGovernorate = IraqiGovernorates.find(g => g.id === selectedGov);

  const getUniLabel = () => {
    if (!currentUniversity) return language === 'ar' ? 'جامعتك المحددة' : language === 'ku' ? 'زانکۆکەت' : 'Your University';
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
      titleAR: "مسابقة الأمن السيبراني الوطنية",
      titleKU: "کۆتا مۆڵەتی کێبڕکێی سیبرانی",
      date: "July 5, 2026",
      urgent: true
    },
    {
      titleEN: "Hunar Tech Frontend Internship",
      titleAR: "تدريب هُنر التكنولوجي للبرمجة",
      titleKU: "مەشقی فرۆنتێند لە کۆمپانیای هۆنەر",
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
      'event', 'announcement', 'exam'
    ].includes(item.type) || !!item.opportunityCategory;
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

    // Governorate filter
    if (filterGov !== 'all') {
      if (item.governorateId !== filterGov && item.governorateId !== 'all') {
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

  // Category filter resolver helper for chips selection
  const resolveChipFilteredItems = () => {
    if (activeChip === 'all') return filteredBaseOpportunities;

    return filteredBaseOpportunities.filter(item => {
      const cat = (item.opportunityCategory || item.type || '').toLowerCase();
      
      if (activeChip === 'job') {
        return ['job', 'full_time_job', 'part_time_job'].includes(item.type) || cat.includes('job');
      }
      if (activeChip === 'scholarship') {
        return item.type === 'scholarship' || cat.includes('scholarship');
      }
      if (activeChip === 'internship') {
        return item.type === 'internship' || cat.includes('intern');
      }
      if (activeChip === 'training') {
        return item.type === 'training' || cat.includes('train');
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
  const section1Title = language === 'ar' ? `المميزة في ${getUniLabel()}` : language === 'ku' ? `تایبەت بە ${getUniLabel()}` : `Featured for ${getUniLabel()}`;
  const section2Title = language === 'ar' ? `الأكثر شعبية في ${getGovLabel()}` : language === 'ku' ? `بەناوبانگ لە ${getGovLabel()}` : `Popular in ${getGovLabel()}`;
  const section3Title = language === 'ar' ? 'متاحة لعموم العراق' : language === 'ku' ? 'کراوە بۆ هەموو عێراق' : 'Open for All Iraq';
  const section4Title = language === 'ar' ? 'جديد التدريب الصيفي' : language === 'ku' ? 'مەشقە نوێیەکان' : 'New Internships';
  const section5Title = language === 'ar' ? 'المنح والدورات التدريبية' : language === 'ku' ? 'بۆرسە و ڕاهێنانەکان' : 'Scholarships & Training';
  const section6Title = language === 'ar' ? 'حفظها زملاؤك في الصف' : language === 'ku' ? 'پاشەکەوتکراو لەلایەن هاوپۆلەکانت' : 'Saved by Your Classmates';

  // Slice paginated items
  const paginatedItems = finalFilteredOpportunityItems.slice(0, visibleCount);
  const hasMore = finalFilteredOpportunityItems.length > visibleCount;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 12);
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
            🚀
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
          placeholder={language === 'ar' ? 'ابحث عن فرص عمل وتدريب...' : language === 'ku' ? 'بگەڕێ بۆ کار و مەشق...' : 'Search jobs, internships, training...'}
          className="w-full bg-white text-xs border-2 border-[#161A33] rounded-2xl py-3 pl-10 pr-4 text-[#161A33] font-black focus:outline-none focus:bg-[#FFFBEB]/40 shadow-inner placeholder-slate-400"
        />
        {searchQuery && (
          <button 
            type="button" 
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-3.5 flex items-center text-xs font-black text-[#6B25C9] active:scale-95 px-1 bg-transparent border-0 cursor-pointer"
          >
            {language === 'ar' ? 'مسح' : language === 'ku' ? 'سڕینەوە' : 'Clear'}
          </button>
        )}
      </div>

      {/* Advanced Filters deck (Governorate, Country, Deadline) */}
      <div className="bg-white border-2 border-[#161A33] rounded-2xl p-3.5 mb-4 shadow-[2px_2px_0px_0px_#161A33]" id="advanced-filters-panel">
        <div className="flex items-center gap-1.5 text-[10px] font-black text-[#161A33] uppercase tracking-wider mb-2.5">
          <Filter className="w-3.5 h-3.5 text-[#6B25C9]" />
          <span>{language === 'ar' ? 'تصفية ذكية للمستقبل' : language === 'ku' ? 'پاڵاوتنی پێشکەوتوو' : 'Advanced Filters'}</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {/* Governorate select */}
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-black uppercase text-slate-400">
              {language === 'ar' ? 'المحافظة' : language === 'ku' ? 'پارێزگا' : 'Governorate'}
            </span>
            <select
              value={filterGov}
              onChange={e => { setFilterGov(e.target.value); setVisibleCount(12); }}
              className="text-[10px] font-bold text-[#161A33] bg-[#F3F7FF] border border-[#161A33]/20 rounded-lg p-1.5 focus:outline-none focus:border-[#6B25C9]"
            >
              <option value="all">{language === 'ar' ? 'كل العراق 🇮🇶' : language === 'ku' ? 'هەموو عێراق 🇮🇶' : 'All Iraq 🇮🇶'}</option>
              {IraqiGovernorates.map(g => (
                <option key={g.id} value={g.id}>
                  {language === 'ar' ? g.nameAR : language === 'ku' ? g.nameKU : g.nameEN}
                </option>
              ))}
            </select>
          </div>

          {/* Country type select */}
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-black uppercase text-slate-400">
              {language === 'ar' ? 'النطاق الجغرافي' : language === 'ku' ? 'پانتایی' : 'Scope'}
            </span>
            <select
              value={filterCountry}
              onChange={e => { setFilterCountry(e.target.value); setVisibleCount(12); }}
              className="text-[10px] font-bold text-[#161A33] bg-[#F3F7FF] border border-[#161A33]/20 rounded-lg p-1.5 focus:outline-none focus:border-[#6B25C9]"
            >
              <option value="all">{language === 'ar' ? 'الكل 🌐' : language === 'ku' ? 'هەموو 🌐' : 'All 🌐'}</option>
              <option value="iraq">{language === 'ar' ? 'داخلي (العراق)' : language === 'ku' ? 'ناوخۆیی (عێراق)' : 'Local (Iraq)'}</option>
              <option value="international">{language === 'ar' ? 'دولي وخارجي' : language === 'ku' ? 'نێودەوڵەتی' : 'International'}</option>
            </select>
          </div>

          {/* Deadline select */}
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-black uppercase text-slate-400">
              {language === 'ar' ? 'مؤقت التقديم' : language === 'ku' ? 'مۆڵەت' : 'Deadline'}
            </span>
            <select
              value={filterDeadline}
              onChange={e => { setFilterDeadline(e.target.value); setVisibleCount(12); }}
              className="text-[10px] font-bold text-[#161A33] bg-[#F3F7FF] border border-[#161A33]/20 rounded-lg p-1.5 focus:outline-none focus:border-[#6B25C9]"
            >
              <option value="all">{language === 'ar' ? 'مفتوح 📅' : language === 'ku' ? 'کراوە 📅' : 'Open 📅'}</option>
              <option value="week">{language === 'ar' ? 'خلال أسبوع' : language === 'ku' ? 'لەم هەفتەیەدا' : 'Within Week'}</option>
              <option value="month">{language === 'ar' ? 'خلال شهر' : language === 'ku' ? 'لەم مانگەدا' : 'Within Month'}</option>
            </select>
          </div>
        </div>
      </div>

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
          <div className="text-4xl mb-3">⚠️</div>
          <h3 className="font-extrabold text-sm uppercase tracking-wide">
            {language === 'ar' ? 'فشل تحميل الفرص العامة' : language === 'ku' ? 'بارکردنی دەرفەتەکان سەرکەوتوو نەبوو' : 'Failed to load opportunities'}
          </h3>
          <p className="text-[11px] text-slate-500 max-w-xs mt-2 mx-auto leading-relaxed">
            {error}
          </p>
          <button
            onClick={() => {
              let active = true;
              setIsLoading(true);
              setError(null);
              getOpportunities(language).then(data => {
                if (active) {
                  setOpportunities(data.opportunities.map(mapBackendOpportunity));
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
            {language === 'ar' ? 'إعادة المحاولة 🔄' : language === 'ku' ? 'دووبارە هەوڵبدەرەوە 🔄' : 'Retry Loading 🔄'}
          </button>
        </div>
      ) : (isFeedLoading || isLoading) ? (
        <SkeletonLoader />
      ) : opportunities.length === 0 ? (
        <div className="text-slate-500 bg-white border-2 border-[#161A33] rounded-3xl p-8 text-center shadow-[3px_3px_0px_0px_#161A33] mb-5">
          <div className="text-4xl mb-3">🔭</div>
          <h3 className="font-extrabold text-[#161A33] text-sm uppercase tracking-wide">
            {language === 'ar' ? 'لا توجد فرص معتمدة بعد' : language === 'ku' ? 'هیچ دەرفەتێکی پەسەندکراو نییە لە ئێستادا' : 'No approved opportunities yet'}
          </h3>
          <p className="text-[11px] text-slate-500 max-w-xs mt-2 mx-auto leading-relaxed">
            {language === 'ar' ? 'الفرص المعتمدة من قبل المسؤولين ومحرك البحث الذكي ستظهر هنا فور نشرها.' : 'Opportunities moderated by administrators and our auto-crawlers will appear here once approved.'}
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
                <span className="text-3xl mb-1.5 select-none animate-bounce">🎓</span>
                <p className="text-[11px] font-black text-slate-700 uppercase tracking-wide">
                  {language === 'ar' 
                    ? `لا توجد منشورات لجامعتك حالياً. تصفح الفرص العامة لعموم العراق!` 
                    : language === 'ku' 
                    ? `هیچ دەرفەتێک بۆ زانکۆکەت نییە لە ئێستادا. دەرفەتە گشتییەکانی عێراق تاقیبکە بکە!` 
                    : `No jobs yet for your university — explore All Iraq opportunities.`}
                </p>
                <div 
                  onClick={() => setActiveChip('internship')}
                  className="mt-3 bg-[#FFD21F] text-[#161A33] border-2 border-[#161A33] font-black text-[10px] px-3 py-1.5 rounded-xl transition-all hover:scale-102 cursor-pointer shadow-[2px_2px_0px_0px_#161A33]"
                >
                  {language === 'ar' ? 'استكشف الفرص العامة للعراق' : language === 'ku' ? 'بینینی هەلی کارە گشتییەکان' : 'Explore General Opportunities'}
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
                  ? `لا توجد منشورات مميزة حالياً في ${getGovLabel()}. معروض لك الفرص العامة في العراق!` 
                  : language === 'ku' 
                  ? `هیچ پۆستێکی سەرنجڕاکێش لە ${getGovLabel()} نییە. بەهای گشتی عێراقت پیشان دەدەین!` 
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
              <div className="text-3xl mb-2">🔭</div>
              <h3 className="font-extrabold text-[#161A33] text-xs">
                {language === 'ar' ? 'لا توجد فرص مطابقة للتصفية المحسنة' : language === 'ku' ? 'هیچ دەرفەتێک نەدۆزرایەوە بەم مەرجانە' : 'No opportunities matches this filter'}
              </h3>
              <p className="text-[10px] text-slate-500 max-w-xs mt-1.5 mx-auto leading-relaxed">
                {language === 'ar' ? 'جرّب كتابة كلمات أبسط أو تغيير الفلتر الذكي أو قم بمحو معيار البحث.' : 'Try broadening your governorate or scope selection or clearing the search bar.'}
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
                  <span>{language === 'ar' ? 'عرض المزيد من الفرص 🔄' : language === 'ku' ? 'بینینی دەرفەتی زیاتر 🔄' : 'Load More Opportunities 🔄'}</span>
                </button>
              )}
            </>
          )}
        </div>
      )}

    </div>
  );
}

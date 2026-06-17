import React, { useState, useEffect, useMemo } from 'react';
import { FeedItem, Language, University } from '../types';
import { getTranslation } from '../data/translations';
import { initialFeedItems, defaultUserProfile, IraqiUniversities, IraqiGovernorates } from '../data/mockData';
import { Sparkles, MessageSquare, Briefcase, PlusCircle, CheckCircle, Info, Image, EyeOff, MapPin, School, Palette, X, Calendar, Megaphone, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import FeedCard from './FeedCard';
import StudentStories from './StudentStories';

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
  onNavigateTab: (tabId: 'home' | 'life' | 'ask' | 'future' | 'profile') => void;
  onAddNewPost: (title: string, body: string, anonymous: boolean, customType?: string, imageUrl?: string) => void;
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
  const [selectedFeedTab, setSelectedFeedTab] = useState<'for_you' | 'opportunities' | 'campus_life'>('for_you');
  const [selectedOppFilter, setSelectedOppFilter] = useState<'all' | 'job' | 'scholarship' | 'training' | 'admission' | 'announcement'>('all');
  const [selectedCampusFilter, setSelectedCampusFilter] = useState<'all' | 'post' | 'event' | 'club' | 'question'>('all');
  const [postCategory, setPostCategory] = useState<string>('campus_life');

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
    } else if (id === 'event') {
      setSelectedFeedTab('campus_life');
      setSelectedCampusFilter('event');
    } else if (id === 'campus_life') {
      setSelectedFeedTab('campus_life');
      setSelectedCampusFilter('post');
    } else if (id === 'questions') {
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

  // Dynamic Hero Configuration with real-time updates support (localStorage + event listeners)
  const [heroBg, setHeroBg] = useState(() => localStorage.getItem('jamiaati_hero_bg') || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600');
  
  const [heroTitleEN, setHeroTitleEN] = useState(() => localStorage.getItem('jamiaati_hero_title_en') || 'Master Your Campus Journey!');
  const [heroTitleAR, setHeroTitleAR] = useState(() => localStorage.getItem('jamiaati_hero_title_ar') || 'تميّز وابنِ مستقبلك الأكاديمي!');
  const [heroTitleKU, setHeroTitleKU] = useState(() => localStorage.getItem('jamiaati_hero_title_ku') || 'داهاتوویەکی پڕشنگدار بنيات بنێ!');
  
  const [heroDescEN, setHeroDescEN] = useState(() => localStorage.getItem('jamiaati_hero_desc_en') || 'The ultimate collegiate hub for premium opportunities & academic resources');
  const [heroDescAR, setHeroDescAR] = useState(() => localStorage.getItem('jamiaati_hero_desc_ar') || 'البوابة الطلابية الأقوى للجامعات والتدريب في عِراقنا الحبيب');
  const [heroDescKU, setHeroDescKU] = useState(() => localStorage.getItem('jamiaati_hero_desc_ku') || 'یەکەم دەروازەی خوێندکارانی زانکۆ و دابینکردنی هەلی مەشق');

  const [heroTagEN, setHeroTagEN] = useState(() => localStorage.getItem('jamiaati_hero_tag_en') || 'PORTAL ACCELERATION');
  const [heroTagAR, setHeroTagAR] = useState(() => localStorage.getItem('jamiaati_hero_tag_ar') || 'بوابة هويتنا الأكاديمية');
  const [heroTagKU, setHeroTagKU] = useState(() => localStorage.getItem('jamiaati_hero_tag_ku') || 'دەروازەی ئەکادیمی عێراق');

  useEffect(() => {
    const handleHeroSync = () => {
      setHeroBg(localStorage.getItem('jamiaati_hero_bg') || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600');
      setHeroTitleEN(localStorage.getItem('jamiaati_hero_title_en') || 'Master Your Campus Journey!');
      setHeroTitleAR(localStorage.getItem('jamiaati_hero_title_ar') || 'تميّز وابنِ مستقبلك الأكاديمي!');
      setHeroTitleKU(localStorage.getItem('jamiaati_hero_title_ku') || 'داهاتوویەکی پڕشنگدار بنيات بنێ!');
      setHeroDescEN(localStorage.getItem('jamiaati_hero_desc_en') || 'The ultimate collegiate hub for premium opportunities & academic resources');
      setHeroDescAR(localStorage.getItem('jamiaati_hero_desc_ar') || 'البوابة الطلابية الأقوى للجامعات والتدريب في عِراقنا الحبيب');
      setHeroDescKU(localStorage.getItem('jamiaati_hero_desc_ku') || 'یەکەم دەروازەی خوێندکارانی زانکۆ و دابینکردنی هەلی مەشق');
      setHeroTagEN(localStorage.getItem('jamiaati_hero_tag_en') || 'PORTAL ACCELERATION');
      setHeroTagAR(localStorage.getItem('jamiaati_hero_tag_ar') || 'بوابة هويتنا الأكاديمية');
      setHeroTagKU(localStorage.getItem('jamiaati_hero_tag_ku') || 'دەروازەی ئەکادیمی عێراق');
    };
    window.addEventListener('jamiaati_hero_updated', handleHeroSync);
    return () => window.removeEventListener('jamiaati_hero_updated', handleHeroSync);
  }, []);

  // Admin Hero Custom editing states
  const [isEditingHero, setIsEditingHero] = useState(false);
  const [formHeroBg, setFormHeroBg] = useState(heroBg);
  const [formTitleEN, setFormTitleEN] = useState(heroTitleEN);
  const [formTitleAR, setFormTitleAR] = useState(heroTitleAR);
  const [formTitleKU, setFormTitleKU] = useState(heroTitleKU);
  const [formDescEN, setFormDescEN] = useState(heroDescEN);
  const [formDescAR, setFormDescAR] = useState(heroDescAR);
  const [formDescKU, setFormDescKU] = useState(heroDescKU);
  const [formTagEN, setFormTagEN] = useState(heroTagEN);
  const [formTagAR, setFormTagAR] = useState(heroTagAR);
  const [formTagKU, setFormTagKU] = useState(heroTagKU);

  const handleStartEditingHero = () => {
    setFormHeroBg(heroBg);
    setFormTitleEN(heroTitleEN);
    setFormTitleAR(heroTitleAR);
    setFormTitleKU(heroTitleKU);
    setFormDescEN(heroDescEN);
    setFormDescAR(heroDescAR);
    setFormDescKU(heroDescKU);
    setFormTagEN(heroTagEN);
    setFormTagAR(heroTagAR);
    setFormTagKU(heroTagKU);
    setIsEditingHero(true);
  };

  const handleSaveHeroCustomization = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('jamiaati_hero_bg', formHeroBg);
    localStorage.setItem('jamiaati_hero_title_en', formTitleEN);
    localStorage.setItem('jamiaati_hero_title_ar', formTitleAR);
    localStorage.setItem('jamiaati_hero_title_ku', formTitleKU);
    localStorage.setItem('jamiaati_hero_desc_en', formDescEN);
    localStorage.setItem('jamiaati_hero_desc_ar', formDescAR);
    localStorage.setItem('jamiaati_hero_desc_ku', formDescKU);
    localStorage.setItem('jamiaati_hero_tag_en', formTagEN);
    localStorage.setItem('jamiaati_hero_tag_ar', formTagAR);
    localStorage.setItem('jamiaati_hero_tag_ku', formTagKU);
    
    window.dispatchEvent(new Event('jamiaati_hero_updated'));
    setIsEditingHero(false);
    if (showToast) {
      showToast(language === 'ar' ? 'تم حفظ التغييرات على الغلاف والبطاقة بنجاح! 💫' : 'Hero settings saved successfully! 💫', 'success');
    }
  };

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
      id: 'scholarship',
      emoji: '🎓',
      labelEN: 'Scholarships',
      labelAR: 'المنح',
      labelKU: 'بورسیەکان',
      color: 'from-pink-500 to-rose-500',
      tabType: 'opportunities',
      filterType: 'scholarship'
    },
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

    const generatedTitle = postTitle.trim() || (anonymous ? 'Anonymous Question' : 'Campus Moment 🌟');
    onAddNewPost(generatedTitle, postBody, anonymous, postCategory, postImageUrl || undefined);
    
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
    'admission', 'announcement'
  ];

  // Filter by governorate & university first (keeps the university & city ownership solid)
  const matchesGovAndUni = (item: any) => {
    const itemGov = item.governorateId;
    const itemUni = item.universityId;

    const matchesGov = selectedGov === 'all' || !itemGov || itemGov === 'all' || itemGov === selectedGov;
    const matchesUni = selectedUni === 'all' || !itemUni || itemUni === 'all' || itemUni === selectedUni;
    
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
    return geoFilteredItems.filter(item => !seriousTypes.includes(item.type));
  }, [geoFilteredItems]);

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
    return allSeriousItems;
  }, [allSeriousItems, selectedOppFilter]);

  // Filtering for Campus Life Tab
  const filteredCampusItems = useMemo(() => {
    if (selectedCampusFilter === 'all') {
      return allSocialItems;
    }
    if (selectedCampusFilter === 'post') {
      return allSocialItems.filter(item => 
        ['post', 'photo', 'video', 'story', 'local_service', 'campus_life', 'general'].includes(item.type)
      );
    }
    if (selectedCampusFilter === 'event') {
      return allSocialItems.filter(item => 
        ['event', 'exam'].includes(item.type)
      );
    }
    if (selectedCampusFilter === 'club') {
      return allSocialItems.filter(item => 
        ['club', 'study_group'].includes(item.type) || item.tags?.includes('Club')
      );
    }
    if (selectedCampusFilter === 'question') {
      return allSocialItems.filter(item => 
        ['question', 'anonymous_question', 'poll'].includes(item.type)
      );
    }
    return allSocialItems;
  }, [allSocialItems, selectedCampusFilter]);

  let filteredFeedItems: typeof feedItems = [];

  if (selectedFeedTab === 'opportunities') {
    filteredFeedItems = filteredOppsItems;
  } else if (selectedFeedTab === 'campus_life') {
    filteredFeedItems = filteredCampusItems;
  } else {
    filteredFeedItems = forYouItems;
  }

  return (
    <div className="px-3.5 py-4 max-w-lg mx-auto flex flex-col pb-24 bg-slate-50 text-slate-800" id="home-feed-container">
      
      {/* 2. Top Governorate & Academic Institution filters */}
      <div className="grid grid-cols-2 gap-3 mb-5 mt-1" id="home-filter-row">
        
        {/* Dropdown 1: Governorate Selection */}
        <div 
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border transition-all shrink-0 ${
            selectedGov !== 'all' 
              ? 'border-blue-600 shadow-sm bg-blue-50/20' 
              : 'border-slate-200 shadow-sm'
          }`}
          id="gov-dropdown-container"
        >
          <MapPin className={`w-4 h-4 shrink-0 ${selectedGov !== 'all' ? 'text-blue-606' : 'text-slate-400'}`} />
          <select
            id="governorate-select"
            value={selectedGov}
            onChange={handleGovChange}
            className="w-full text-xs font-bold text-slate-800 bg-transparent border-0 focus:outline-none cursor-pointer outline-none p-0 select-none"
          >
            <option value="all">📍 {language === 'ar' ? 'كل المحافظات' : language === 'ku' ? 'هەموو پارێزگاکان' : 'All Governorates'}</option>
            {IraqiGovernorates.map(gov => (
              <option key={gov.id} value={gov.id}>
                {language === 'ar' ? gov.nameAR : language === 'ku' ? gov.nameKU : gov.nameEN}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown 2: Academic Institution Selection */}
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
          className={`flex items-center justify-between text-left gap-2 px-3 py-2.5 rounded-xl bg-white border transition-all shrink-0 cursor-pointer ${
            selectedUni !== 'all' 
              ? 'border-blue-600 shadow-sm bg-blue-50/20' 
              : 'border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <School className={`w-4 h-4 shrink-0 ${selectedUni !== 'all' ? 'text-blue-606' : 'text-slate-400'}`} />
            <span className="text-xs font-bold text-slate-800 truncate">
              {institutionsLoading ? (
                <span>{language === 'ar' ? '⏳ تحميل...' : '⏳ Loading...'}</span>
              ) : selectedUni === 'all' ? (
                <span>{language === 'ar' ? 'كل الجامعات' : language === 'ku' ? 'هەموو زانکۆکان' : 'All Institutions'}</span>
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
          {institutionsLoading && <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping shrink-0" />}
        </button>

      </div>

      {/* 3. Divided Story Shortcut Row */}
      <div className="w-full mb-5 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm" id="story-shortcuts-container">
        <div className="flex flex-col gap-3.5">
          {/* Opportunities shortcuts */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              💼 {language === 'ar' ? 'الفرص والمستقبل' : language === 'ku' ? 'هەلی داهاتوو' : 'Opportunities & Future'}
            </span>
            <div className="flex gap-4 overflow-x-auto pb-1.5 scrollbar-none snap-x touch-pan-x">
              {[
                { id: 'job', emoji: '💼', labelEN: 'Jobs', labelAR: 'وظائف', labelKU: 'کارەکان' },
                { id: 'scholarship', emoji: '🎓', labelEN: 'Scholarships', labelAR: 'منح', labelKU: 'سکۆلەرشیپ' },
                { id: 'training', emoji: '🏫', labelEN: 'Training', labelAR: 'تدريب', labelKU: 'ڕاهێنان' },
                { id: 'admission', emoji: '📌', labelEN: 'Admissions', labelAR: 'بوابة القبول', labelKU: 'پێشکەش' },
              ].map((shortcut) => (
                <div 
                  key={shortcut.id}
                  onClick={() => selectShortcut(shortcut.id)}
                  className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 snap-start"
                  id={`shortcut-btn-${shortcut.id}`}
                >
                  <div className="relative group">
                    <span className="absolute inset-0 bg-gradient-to-tr from-orange-400 to-amber-300 rounded-full p-[2px]" />
                    <span className="relative flex items-center justify-center w-11 h-11 bg-white rounded-full border border-white text-lg shadow-sm transition-transform duration-200 group-hover:scale-105">
                      {shortcut.emoji}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 text-center leading-none">
                    {language === 'ar' ? shortcut.labelAR : language === 'ku' ? shortcut.labelKU : shortcut.labelEN}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 my-0.5" />

          {/* Campus shortcuts */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              🏛️ {language === 'ar' ? 'الحرَم والأنشطة' : language === 'ku' ? 'کەمپەس و چالاکی' : 'Campus & Society'}
            </span>
            <div className="flex gap-4 overflow-x-auto pb-1.5 scrollbar-none snap-x touch-pan-x">
              {[
                { id: 'announcement', emoji: '📢', labelEN: 'Official', labelAR: 'رسمي', labelKU: 'فەرمی' },
                { id: 'event', emoji: '📅', labelEN: 'Events', labelAR: 'فعاليات', labelKU: 'چالاکی' },
                { id: 'campus_life', emoji: '🌸', labelEN: 'Campus Life', labelAR: 'حياة الحرم', labelKU: 'کەمپەس' },
                { id: 'questions', emoji: '💬', labelEN: 'Questions', labelAR: 'أسئلة', labelKU: 'پرسیار' },
              ].map((shortcut) => (
                <div 
                  key={shortcut.id}
                  onClick={() => selectShortcut(shortcut.id)}
                  className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 snap-start"
                  id={`shortcut-btn-${shortcut.id}`}
                >
                  <div className="relative group">
                    <span className="absolute inset-0 bg-gradient-to-tr from-orange-400 to-amber-300 rounded-full p-[2px]" />
                    <span className="relative flex items-center justify-center w-11 h-11 bg-white rounded-full border border-white text-lg shadow-sm transition-transform duration-200 group-hover:scale-105">
                      {shortcut.emoji}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 text-center leading-none">
                    {language === 'ar' ? shortcut.labelAR : language === 'ku' ? shortcut.labelKU : shortcut.labelEN}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Important for Students Today section */}
      <div className="w-full mb-5" id="important-today-section">
        <div className="flex items-center gap-1.5 mb-2.5 px-1">
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            {language === 'ar' ? 'هام للطلاب اليوم ⚡' : language === 'ku' ? 'گرنگ بۆ خوێندکارانی ئەمڕۆ ⚡' : 'Important for Students Today ⚡'}
          </h3>
        </div>

        {/* Horizontal scrollable cards list */}
        <div className="flex gap-3 overflow-x-auto pb-1.5 scrollbar-none snap-x touch-pan-x" id="important-cards-list">
          
          {/* Card A: Scholarship Deadline */}
          <div 
            onClick={() => selectShortcut('scholarship')}
            className="w-[240px] shrink-0 snap-start bg-gradient-to-br from-orange-50/20 via-white to-white border border-orange-200 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] font-black uppercase text-orange-700 bg-orange-100 rounded-md px-2 py-0.5 border border-orange-200 leading-none">
                  {language === 'ar' ? 'منحة دراسية 🎓' : language === 'ku' ? 'بورس' : 'Scholarship 🎓'}
                </span>
                <span className="text-[9px] font-black text-red-500 bg-red-50 px-1.5 py-0.5 rounded leading-none shrink-0 border border-red-105">
                  {language === 'ar' ? 'قريبًا' : 'Soon'}
                </span>
              </div>
              <h4 className="text-xs font-extrabold text-slate-900 tracking-tight line-clamp-2 leading-snug">
                {language === 'ar' ? 'منحة DAAD الألمانية الممولة بالكامل للماجستير' : language === 'ku' ? 'سکۆلەرشیپی بەنێوبانگی DAAD بۆ کۆمەڵەی ماستەر' : 'DAAD Germany Fully Funded Masters Program'}
              </h4>
            </div>
            <div className="mt-3.5 border-t border-slate-100 pt-2 flex items-center justify-between text-[9px] text-slate-500 font-sans">
              <span className="font-bold">📅 Deadline: Aug 31</span>
              <span className="font-extrabold text-orange-600">Apply Now ➜</span>
            </div>
          </div>

          {/* Card B: Job Opportunity */}
          <div 
            onClick={() => selectShortcut('job')}
            className="w-[240px] shrink-0 snap-start bg-gradient-to-br from-orange-50/20 via-white to-white border border-orange-200 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] font-black uppercase text-orange-700 bg-orange-100 rounded-md px-2 py-0.5 border border-orange-200 leading-none">
                  {language === 'ar' ? 'بوابة التوظيف 💼' : language === 'ku' ? 'هەلی کار' : 'Job Career 💼'}
                </span>
                <span className="text-[9px] font-black text-blue-500 bg-white px-1.5 py-0.5 rounded leading-none shrink-0 border border-blue-50">
                  {language === 'ar' ? 'نشط' : 'Active'}
                </span>
              </div>
              <h4 className="text-xs font-extrabold text-slate-900 tracking-tight line-clamp-2 leading-snug">
                {language === 'ar' ? 'برنامج نخبة آسيا سيل لإعداد الخريجين الجدد' : language === 'ku' ? 'خولی پێگەیاندنی ئەکادیمی ئاسیاسێل بۆ دهرچووان' : 'Asiacell Graduate Elite Accelerator Program'}
              </h4>
            </div>
            <div className="mt-3.5 border-t border-slate-100 pt-2 flex items-center justify-between text-[9px] text-slate-500 font-sans">
              <span className="font-bold">💼 Telecom Sector</span>
              <span className="font-extrabold text-orange-600">Register ➜</span>
            </div>
          </div>

          {/* Card C: University Announcement */}
          <div 
            onClick={() => selectShortcut('announcement')}
            className="w-[240px] shrink-0 snap-start bg-gradient-to-br from-orange-50/20 via-white to-white border border-orange-200 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] font-black uppercase text-orange-700 bg-orange-100 rounded-md px-2 py-0.5 border border-orange-200 leading-none">
                  {language === 'ar' ? 'إعلان رسمي 📢' : language === 'ku' ? 'فەرمی' : 'Official 📢'}
                </span>
                <span className="text-[9px] font-black text-purple-500 bg-purple-50 px-1.5 py-0.5 rounded leading-none shrink-0 border border-purple-105">
                  {language === 'ar' ? 'عاجل' : 'Urgent'}
                </span>
              </div>
              <h4 className="text-xs font-extrabold text-slate-900 tracking-tight line-clamp-2 leading-snug">
                {language === 'ar' ? 'جدول وتعليمات الامتحانات النهائية للفصل الثاني' : language === 'ku' ? 'خشتە و ڕێنمایی نوێی تاقیکردنەوەکان' : 'Semester 2 Final Exam Guidelines & Timetable'}
              </h4>
            </div>
            <div className="mt-3.5 border-t border-slate-100 pt-2 flex items-center justify-between text-[9px] text-slate-500 font-sans">
              <span className="font-bold">🏫 Presidency Board</span>
              <span className="font-extrabold text-orange-600">View Draft ➜</span>
            </div>
          </div>

        </div>
      </div>

      {/* 5. Feed Tabs Selector */}
      <div className="flex border-b border-slate-200 mb-4 bg-white rounded-xl p-1 shadow-xs font-sans" id="home-feed-tabs-selector">
        <button
          onClick={() => setSelectedFeedTab('for_you')}
          className={`flex-1 py-2 text-xs font-extrabold text-center rounded-lg transition-all cursor-pointer ${
            selectedFeedTab === 'for_you'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          {language === 'ar' ? 'لك (مخصص) ✨' : language === 'ku' ? 'بۆ تۆ ✨' : 'For You ✨'}
        </button>
        <button
          onClick={() => setSelectedFeedTab('opportunities')}
          className={`flex-1 py-2 text-xs font-extrabold text-center rounded-lg transition-all cursor-pointer ${
            selectedFeedTab === 'opportunities'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          {language === 'ar' ? 'الفرص 🎯' : language === 'ku' ? 'هەلەکان 🎯' : 'Opportunities 🎯'}
        </button>
        <button
          onClick={() => setSelectedFeedTab('campus_life')}
          className={`flex-1 py-2 text-xs font-extrabold text-center rounded-lg transition-all cursor-pointer ${
            selectedFeedTab === 'campus_life'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          {language === 'ar' ? 'حياة وجامعة 🏛️' : language === 'ku' ? 'کەمپەس 🏛️' : 'Campus Life 🏛️'}
        </button>
      </div>

      {/* Advanced Filter Chips for Opportunities Tab */}
      {selectedFeedTab === 'opportunities' && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1.5 scrollbar-none snap-x touch-pan-x" id="opp-filter-chips">
          {[
            { id: 'all', labelEN: 'All', labelAR: 'الكل', labelKU: 'هەموو' },
            { id: 'job', labelEN: 'Jobs', labelAR: 'وظائف', labelKU: 'کارەکان' },
            { id: 'scholarship', labelEN: 'Scholarships', labelAR: 'منح دراسية', labelKU: 'سکۆلەرشیپ' },
            { id: 'training', labelEN: 'Training', labelAR: 'تدريب', labelKU: 'ڕاهێنان' },
            { id: 'admission', labelEN: 'Admissions', labelAR: 'القبول والتسجيل', labelKU: 'وەرگرتن' },
            { id: 'announcement', labelEN: 'Announcements', labelAR: 'الأخبار الطلابية', labelKU: 'ئاگادارییەکان' },
          ].map(chip => (
            <button
              key={chip.id}
              onClick={() => setSelectedOppFilter(chip.id as any)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide cursor-pointer shrink-0 border transition-all ${
                selectedOppFilter === chip.id
                  ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {language === 'ar' ? chip.labelAR : language === 'ku' ? chip.labelKU : chip.labelEN}
            </button>
          ))}
        </div>
      )}

      {/* Advanced Filter Chips for Campus Life Tab */}
      {selectedFeedTab === 'campus_life' && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1.5 scrollbar-none snap-x touch-pan-x" id="campus-filter-chips">
          {[
            { id: 'all', labelEN: 'All', labelAR: 'الكل', labelKU: 'هەموو' },
            { id: 'post', labelEN: 'Posts', labelAR: 'المنشورات', labelKU: 'پۆستەکان' },
            { id: 'event', labelEN: 'Events', labelAR: 'الفعاليات', labelKU: 'چالاکییەکان' },
            { id: 'club', labelEN: 'Clubs', labelAR: 'النوادي والفرق', labelKU: 'یانەکان' },
            { id: 'question', labelEN: 'Questions', labelAR: 'الأسئلة', labelKU: 'پرسیارەکان' },
          ].map(chip => (
            <button
              key={chip.id}
              onClick={() => setSelectedCampusFilter(chip.id as any)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide cursor-pointer shrink-0 border transition-all ${
                selectedCampusFilter === chip.id
                  ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {language === 'ar' ? chip.labelAR : language === 'ku' ? chip.labelKU : chip.labelEN}
            </button>
          ))}
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

        <div className="flex items-center gap-2.5 pointer-events-auto" onClick={() => setShowPublisher(!showPublisher)}>
          <div className="text-xl">⚡</div>
          <div className="flex-1 bg-[#F7F4FF] hover:bg-[#F3F7FF] border border-[#E6E1F5] px-3.5 py-3 rounded-xl text-xs font-bold text-slate-500 transition-all cursor-pointer shadow-inner">
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
              className="overflow-hidden mt-3.5 border-t border-[#E6E1F5] pt-4 flex flex-col gap-3"
            >
              <input
                type="text"
                value={postTitle}
                onChange={e => setPostTitle(e.target.value)}
                placeholder={getTranslation('headlineTopic', language)}
                className="w-full text-xs font-bold text-[#161A33] bg-white border border-[#E6E1F5] rounded-xl px-3.5 py-2.5 focus:bg-[#F3F7FF] focus:outline-none focus:border-[#6B25C9] transition-colors"
              />

              <textarea
                value={postBody}
                onChange={e => setPostBody(e.target.value)}
                required
                rows={3}
                placeholder={language === 'ar' ? 'اكتب ما تفكر به لمشاركته مع الكلية...' : language === 'ku' ? 'ئەمڕۆ چی لە زانکۆ ڕوودەدات؟...' : 'What is happening on campus today?'}
                className="w-full text-xs font-semibold text-[#161A33] bg-white border border-[#E6E1F5] rounded-xl p-3.5 focus:bg-[#F3F7FF] focus:outline-none focus:border-orange-500 transition-colors resize-none"
              />

              {/* Categorization selector */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">
                  📌 {language === 'ar' ? 'فئة المنشور' : language === 'ku' ? 'پۆلی بابەت' : 'Post Category'}
                </label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className="w-full text-xs font-bold text-slate-800 bg-white border border-[#E6E1F5] rounded-xl px-3.5 py-2.5 focus:bg-[#F3F7FF] focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
                >
                  <option value="campus_life">
                    {language === 'ar' ? '🌸 حياة الحرم الأكاديمي' : language === 'ku' ? '🌸 ژیانی کەمپەس' : '🌸 Campus Life / Social'}
                  </option>
                  <option value="question">
                    {language === 'ar' ? '💬 سؤال أو استفسار طلابي' : language === 'ku' ? '💬 پرسیاری قوتابی' : '💬 Student Question'}
                  </option>
                  <option value="event">
                    {language === 'ar' ? '📅 فعالية، نشاط، ورشة' : language === 'ku' ? '📅 چالاکی کەمپەس' : '📅 Campus Event / Activity'}
                  </option>
                  <option value="club">
                    {language === 'ar' ? '👥 فريق أو نادي طلابي' : language === 'ku' ? '👥 یانەی قوتابیان' : '👥 Student Club / Group'}
                  </option>
                  <option value="job">
                    {language === 'ar' ? '💼 فرصة عمل أو وظيفة' : language === 'ku' ? '💼 هەلی کار' : '💼 Job Opportunity'}
                  </option>
                  <option value="scholarship">
                    {language === 'ar' ? '🎓 منحة دراسية للطلاب' : language === 'ku' ? '🎓 بورس' : '🎓 Scholarship'}
                  </option>
                  <option value="training">
                    {language === 'ar' ? '🏫 برنامج تدريبي أو تأهيلي' : language === 'ku' ? '🏫 خولی ڕاهێنان' : '🏫 Training / Internship'}
                  </option>
                  <option value="admission">
                    {language === 'ar' ? '📌 معلومات أو روابط القبول' : language === 'ku' ? '📌 وەرگرتن' : '📌 Admission & Entrance'}
                  </option>
                </select>
              </div>

              {/* Photo attachment component */}
              <div 
                className={`border-2 border-dashed rounded-xl p-3 transition-colors text-center ${
                  isDragging 
                    ? 'border-[#6B25C9] bg-[#F7F4FF]' 
                    : 'border-[#E6E1F5] hover:border-[#6B25C9] bg-white'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const files = e.dataTransfer.files;
                  if (files && files[0]) {
                    const file = files[0];
                    if (file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = (uploadEvent) => {
                        if (uploadEvent.target?.result) {
                          setPostImageUrl(String(uploadEvent.target.result));
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }
                }}
              >
                {postImageUrl ? (
                  <div className="relative inline-block w-full max-w-[200px] rounded-lg overflow-hidden border border-[#E6E1F5]">
                    <img 
                      src={postImageUrl} 
                      alt="Attachment Preview" 
                      className="w-full h-auto object-cover max-h-32"
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
                        ? 'اسحب وأسقط صورة هنا، أو اضغط للاختيار' 
                        : language === 'ku' 
                        ? 'وێنەیەک لێرە دابنێ، یان کلیک بکە بۆ هەڵبژاردن' 
                        : 'Drag & drop a photo here, or click to browse'}
                    </div>
                    <input 
                      type="file" 
                      id="post-photo-upload" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files[0]) {
                          const file = files[0];
                          const reader = new FileReader();
                          reader.onload = (uploadEvent) => {
                            if (uploadEvent.target?.result) {
                              setPostImageUrl(String(uploadEvent.target.result));
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                )}

                {/* Optional paste-by-url tool for supreme convenience */}
                {!postImageUrl && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10px] w-full max-w-xs mx-auto">
                    <span className="text-slate-400 font-bold shrink-0">🔗 {language === 'ar' ? 'أو رابط:' : language === 'ku' ? 'یاخود لینک:' : 'Or URL:'}</span>
                    <input 
                      type="text" 
                      placeholder="https://images.unsplash.com/..." 
                      value={postImageUrl}
                      onChange={(e) => setPostImageUrl(e.target.value)}
                      className="flex-1 bg-slate-50 border border-[#E6E1F5] rounded-lg px-2 py-0.5 text-[9px] font-medium text-slate-700 focus:outline-none focus:bg-white"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-1">
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
      <div className="flex flex-col gap-1.5" id="mixed-feed-items-list">
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
          filteredFeedItems.map(item => (
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
          ))
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
                  onChange={(e) => {
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

      {/* Temporary Admin Debug Card (Visible in development mode) */}
      {(() => {
        const isDev = process.env.NODE_ENV !== 'production' || window.location.hostname.includes('localhost') || window.location.hostname.includes('run.app') || true;
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

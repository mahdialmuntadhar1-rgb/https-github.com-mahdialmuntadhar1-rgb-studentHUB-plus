import React, { useState, useEffect, useMemo } from 'react';
import { FeedItem, Language, University } from '../types';
import { getTranslation } from '../data/translations';
import { IraqiUniversities, IraqiGovernorates } from '../data/mockData';
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
  onAddNewPost: (title: string, body: string, anonymous: boolean) => void;
  isFeedLoading?: boolean;
  onAwardPoints?: (points: number) => void;
  showToast?: (text: string, type?: 'success' | 'error' | 'info') => void;
  institutions?: University[];
  institutionsLoading?: boolean;
  institutionsError?: string | null;
  onRetryInstitutions?: () => void;
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
  onRetryInstitutions
}: HomeFeedProps) {
  // Main tab selection state (Campus Life or Opportunities)
  const [activeSubTab, setActiveSubTab] = useState<'campus' | 'opportunities'>('campus');
  
  // Custom Story-based categories filter state
  const [activeStoryFilter, setActiveStoryFilter] = useState<string | null>(null);

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

  const handleTabChange = (tab: 'campus' | 'opportunities') => {
    setActiveSubTab(tab);
    setActiveStoryFilter(null);
  };

  // New post publisher collapsible state
  const [showPublisher, setShowPublisher] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState('');

  // Story definition representing the 7 required elements
  const storyHighlightsData = [
    {
      id: 'h_news',
      emoji: '📰',
      labelEN: 'Uni News',
      labelAR: 'أخبار الجامعة',
      labelKU: 'هەواڵەکان',
      color: 'from-amber-500 to-rose-500',
      tabType: 'campus',
      filterType: 'announcement'
    },
    {
      id: 'h_events',
      emoji: '🎟️',
      labelEN: 'Events',
      labelAR: 'الفعاليات',
      labelKU: 'چالاکییەکان',
      color: 'from-purple-500 to-blue-500',
      tabType: 'campus',
      filterType: 'event'
    },
    {
      id: 'h_jobs',
      emoji: '💼',
      labelEN: 'Jobs',
      labelAR: 'الوظائف والفرص',
      labelKU: 'هەلی کار',
      color: 'from-emerald-500 to-teal-500',
      tabType: 'opportunities',
      filterType: 'job'
    },
    {
      id: 'h_internships',
      emoji: '⚙️',
      labelEN: 'Internships',
      labelAR: 'فرص التدريب',
      labelKU: 'مەشقەکان',
      color: 'from-blue-500 to-indigo-500',
      tabType: 'opportunities',
      filterType: 'internship'
    },
    {
      id: 'h_scholarships',
      emoji: '🎓',
      labelEN: 'Scholarships',
      labelAR: 'المنح الدراسية',
      labelKU: 'منح دراسية',
      color: 'from-pink-550 to-rose-500',
      tabType: 'opportunities',
      filterType: 'scholarship'
    },
    {
      id: 'h_clubs',
      emoji: '👥',
      labelEN: 'Student Clubs',
      labelAR: 'نوادي الطلاب',
      labelKU: 'یانەی خوێندکاران',
      color: 'from-violet-500 to-fuchsia-500',
      tabType: 'campus',
      filterType: 'study_group'
    },
    {
      id: 'h_announcements',
      emoji: '📢',
      labelEN: 'Alerts',
      labelAR: 'الإعلانات',
      labelKU: 'ڕاگەیاندنەکان',
      color: 'from-red-500 to-amber-500',
      tabType: 'campus',
      filterType: 'official_announcement'
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
    onAddNewPost(generatedTitle, postBody, anonymous);
    
    setPostTitle('');
    setPostBody('');
    setAnonymous(false);
    setShowPublisher(false);

    setMessage(language === 'ar' ? 'تم نشر مشاركتك بنجاح! ✨' : language === 'ku' ? 'بابەتەکەت بە سەرکەوتوویی بڵاوکرایەوە! ✨' : 'Post shared successfully on Campus Today!');
    setTimeout(() => setMessage(''), 3000);
  };

  // 1. Map Campus Life post categories VS Careers opportunities
  const campusTypes = ['announcement', 'video', 'poll', 'story', 'study_group', 'local_service', 'anonymous_question'];
  const opportunityTypes = ['internship', 'training', 'graduation_project_support', 'volunteering', 'part_time_job', 'competition', 'job', 'scholarship'];

  // 2. Perform the precise multi-layered filter logic:
  const filteredFeedItems = feedItems.filter(item => {
    // 2a. Determine if appropriate for chosen sub-tab (Campus Life vs. Opportunities)
    const matchesTab = activeSubTab === 'campus' 
      ? campusTypes.includes(item.type) 
      : opportunityTypes.includes(item.type);

    if (!matchesTab) return false;

    // 2b. Map Story highlighting sub-category filters
    if (activeStoryFilter) {
      if (activeStoryFilter === 'announcement' || activeStoryFilter === 'official_announcement') {
        return item.type === 'announcement';
      }
      if (activeStoryFilter === 'event') {
        return item.type === 'event' || item.type === 'video' || item.tags.some(t => t.toLowerCase().includes('event') || t.toLowerCase().includes('sunset'));
      }
      if (activeStoryFilter === 'job') {
        return item.type === 'job' || item.type === 'part_time_job';
      }
      if (activeStoryFilter === 'internship') {
        return item.type === 'internship' || item.type === 'training';
      }
      if (activeStoryFilter === 'scholarship') {
        return item.type === 'scholarship' || item.type === 'graduation_project_support';
      }
      if (activeStoryFilter === 'study_group') {
        return item.type === 'study_group' || item.type === 'local_service';
      }
    }

    return true;
  });

  return (
    <div className="px-3.5 py-4 max-w-lg mx-auto flex flex-col pb-24 bg-[#0B1020]" id="home-feed-container">
      
      {/* 2. Compact, Student-Friendly Modern Hero Section */}
      <div 
        className="mb-5 relative rounded-3xl overflow-hidden border-2 border-[#161A33] shadow-[4px_4px_0px_0px_#161A33] min-h-[148px] flex flex-col justify-end p-4 text-white" 
        id="homepage-academic-banner-hero"
      >
        <img 
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600" 
          alt="Iraqi Academic Campus" 
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-0" />
        
        <div className="relative z-10 select-none">
          <div className="inline-flex items-center gap-1.5 bg-[#FFD21F] text-[#161A33] text-[8.5px] font-black uppercase px-2.5 py-0.5 rounded-full mb-1.5 border border-[#161A33]/15">
            <span>✨ {language === 'ar' ? 'بوابة هويتنا الأكاديمية' : language === 'ku' ? 'دەروازەی ئەکادیمی عێراق' : 'PORTAL ACCELERATION'}</span>
          </div>
          
          <h2 className="text-sm md:text-base font-black tracking-tight leading-tight uppercase text-white drop-shadow-md">
            {language === 'ar' ? (
              <>تميّز وابنِ <span className="text-[#FFD21F]">مستقبلك الأكاديمي!</span> 🚀</>
            ) : language === 'ku' ? (
              <>داهاتوویەکی <span className="text-[#FFD21F]">پڕشنگدار بنيات بنێ!</span> 🚀</>
            ) : (
              <>Master Your <span className="text-[#FFD21F]">Campus Journey!</span> 🚀</>
            )}
          </h2>
          
          <p className="text-[10px] text-slate-200 mt-1 font-medium leading-tight max-w-[300px] drop-shadow-sm">
            {language === 'ar' ? 'البوابة الطلابية الأقوى للجامعات والتدريب في عِراقنا الحبيب' : language === 'ku' ? 'یەکەم دەروازەی خوێندکارانی زانکۆ و دابینکردنی هەلی مەشق' : 'The ultimate collegiate hub for premium opportunities & academic resources'}
          </p>

          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-[9px] font-black bg-white text-[#161A33] px-3 py-1 rounded-lg shadow-sm border border-[#161A33]/20 flex items-center gap-1">
              <span>{language === 'ar' ? 'عِراقنا بلمحة 🇮🇶' : language === 'ku' ? 'عێراقی ئەکادیمی 🇮🇶' : 'Iraq Academia 🇮🇶'}</span>
            </span>
            <span className="text-[8px] font-mono font-bold text-[#FFD21F] bg-black/40 px-1.5 py-0.5 rounded border border-white/10 flex items-center gap-1 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ● {language === 'ar' ? 'رسمي ومباشر' : language === 'ku' ? 'ڕاستەوخۆ' : 'OFFICIAL LIVE'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filter Row: Side by Side Governorate & Academic Institution dropdowns */}
      <div className="grid grid-cols-2 gap-3.5 mb-5" id="home-filter-row">
        
        {/* Dropdown 1: Governorate Selection */}
        <div 
          className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-white border-2 transition-all shrink-0 ${
            selectedGov !== 'all' 
              ? 'border-[#6B25C9] shadow-[3px_3px_0px_0px_#6B25C9]' 
              : 'border-[#161A33] shadow-[3px_3px_0px_0px_#161A33]'
          }`}
          id="gov-dropdown-container"
        >
          <MapPin className={`w-4 h-4 shrink-0 ${selectedGov !== 'all' ? 'text-[#6B25C9]' : 'text-slate-500'}`} />
          <select
            id="governorate-select"
            value={selectedGov}
            onChange={handleGovChange}
            className="w-full text-xs font-black text-[#161A33] bg-transparent border-0 focus:outline-none cursor-pointer outline-none p-0 select-none"
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
          className={`flex items-center justify-between text-left gap-2 px-3 py-2.5 rounded-2xl bg-white border-2 transition-all shrink-0 cursor-pointer ${
            selectedUni !== 'all' 
              ? 'border-[#2F7CCB] shadow-[3px_3px_0px_0px_#2F7CCB]' 
              : 'border-[#161A33] shadow-[3px_3px_0px_0px_#161A33]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <School className={`w-4 h-4 shrink-0 ${selectedUni !== 'all' ? 'text-[#2F7CCB]' : 'text-slate-500'}`} />
            <span className="text-xs font-black text-[#161A33] truncate">
              {institutionsLoading ? (
                <span>{language === 'ar' ? '⏳ جاري جلب البيانات...' : '⏳ Loading...'}</span>
              ) : selectedUni === 'all' ? (
                <span>🏫 {language === 'ar' ? 'كل الجامعات' : language === 'ku' ? 'هەموو زانکۆکان' : 'All Institutions'}</span>
              ) : (
                (() => {
                  const sourceList = institutions && institutions.length > 0 ? institutions : IraqiUniversities;
                  const found = sourceList.find(u => u.id === selectedUni);
                  if (found) {
                    return `${found.logo} ${language === 'ar' ? found.nameAR : language === 'ku' ? found.nameKU : found.nameEN}`;
                  }
                  return `🏫 ${selectedUni}`;
                })()
              )}
            </span>
          </div>
          {institutionsLoading && <span className="w-2 h-2 rounded-full bg-[#2F7CCB] animate-ping shrink-0" />}
        </button>

      </div>

      {/* Real-time Interactive Student Stories Row */}
      <StudentStories 
        language={language} 
        onAwardPoints={onAwardPoints} 
        showToast={showToast} 
      />

      {/* 4. Stories Circles: social media story bubbles */}
      <div className="w-full mb-5 bg-[#121B2E] rounded-3xl border border-[#1F2E4D] p-3.5 shadow-sm" id="story-highlights-scroller-box">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[9px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded-md leading-none">
            {language === 'ar' ? 'أبرز القصص والدليل الأكاديمي ⚡' : language === 'ku' ? 'چیرۆکە دیارەکانە زانکۆ ⚡' : 'CAMPUS HIGHLIGHTS ⚡'}
          </span>
          <span className="text-[8px] font-black text-slate-400 flex items-center gap-1 select-none animate-pulse">
            {language === 'ar' ? 'اسحب لليمين واليسار' : language === 'ku' ? 'ڕابکێشە بۆ بینین' : 'Swipe items'}
          </span>
        </div>

        {/* Story Scroller Row */}
        <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none snap-x touch-pan-x" id="stories-scrollable-bar">
          {storyHighlightsData.map((story) => {
            const label = language === 'ar' ? story.labelAR : language === 'ku' ? story.labelKU : story.labelEN;
            const isStoryActive = activeStoryFilter === story.filterType;
            return (
              <div 
                key={story.id} 
                className="flex flex-col items-center gap-1.5 snap-start cursor-pointer shrink-0"
                onClick={() => {
                  // Switch sub-tab appropriately based on story characteristics
                  setActiveSubTab(story.tabType as any);
                  // Toggle active category specific filter
                  if (activeStoryFilter === story.filterType) {
                    setActiveStoryFilter(null);
                  } else {
                    setActiveStoryFilter(story.filterType);
                  }
                }}
              >
                {/* Visual Circle Bubble */}
                <div className="relative group">
                  {/* Dynamic Gradient Ring indicator */}
                  <span className={`absolute inset-0 bg-gradient-to-tr ${story.color} rounded-full p-[2.5px] transition-all duration-300 group-hover:scale-105 ${
                    isStoryActive ? 'ring-4 ring-yellow-405 shadow-md shadow-cyan-400/20' : 'opacity-90'
                  }`} />
                  
                  {/* Inner Emoji bubble */}
                  <span className="relative flex items-center justify-center w-12 h-12 bg-white rounded-full border-2 border-[#121B2E] text-xl shadow-inner select-none transition-transform duration-300 group-hover:scale-95 group-active:rotate-6">
                    {story.emoji}
                  </span>

                  {/* Sparkle badge */}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#FFD21F] border border-white rounded-full flex items-center justify-center text-[7px]" title="Quick View">
                    ✨
                  </span>
                </div>

                {/* Subtext Label */}
                <div className="flex flex-col items-center">
                  <span className={`text-[10px] font-bold text-center tracking-tight leading-none max-w-[76px] truncate ${
                    isStoryActive ? 'text-cyan-400 font-black underline' : 'text-slate-300'
                  }`}>
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Main Switcher Tabs: Campus Life vs. Opportunities */}
      <div className="mb-5 bg-[#121B2E] border border-[#1F2E4D] p-1 rounded-2xl flex items-center gap-1" id="homepage-tab-section">
        
        {/* Tab 1: Campus Life */}
        <button
          onClick={() => handleTabChange('campus')}
          className={`flex-1 py-3 px-3 rounded-xl font-black text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'campus'
              ? 'bg-[#6B25C9] text-white shadow-md shadow-[#6B25C9]/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/20'
          }`}
          id="tab-campus-life-trigger"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{language === 'ar' ? 'حياة الحرم الجامعي' : language === 'ku' ? 'ژیانی زانکۆ' : 'Campus Life'}</span>
        </button>

        {/* Tab 2: Opportunities */}
        <button
          onClick={() => handleTabChange('opportunities')}
          className={`flex-1 py-3 px-3 rounded-xl font-black text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'opportunities'
              ? 'bg-[#6B25C9] text-white shadow-md shadow-[#6B25C9]/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/20'
          }`}
          id="tab-opportunities-trigger"
        >
          <Briefcase className="w-4 h-4" />
          <span>{language === 'ar' ? 'الفرص والمهن' : language === 'ku' ? 'هەلی کار و ڕاهێنان' : 'Opportunities'}</span>
        </button>

      </div>

      {/* Feed Filter Alert & Active Stories filter indicator */}
      {activeStoryFilter && (
        <div className="mb-4 bg-[#6B25C9]/20 border border-[#6B25C9]/35 text-[#c1a0f9] text-[10px] font-bold p-2.5 rounded-xl flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 leading-none">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
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
            className="text-[10px] font-black hover:text-white transition-colors bg-white/10 px-1.5 py-0.5 rounded cursor-pointer"
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
                placeholder={activeSubTab === 'opportunities' 
                  ? (language === 'ar' ? 'تفاصيل الفرصة أو التدريب الشاغر...' : 'Opportunity details: description, requirements...') 
                  : (language === 'ar' ? 'اكتب ما تفكر به لمشاركته مع الكلية...' : 'Write your campus moment or query...')}
                className="w-full text-xs font-semibold text-[#161A33] bg-white border border-[#E6E1F5] rounded-xl p-3.5 focus:bg-[#F3F7FF] focus:outline-none focus:border-[#6B25C9] transition-colors resize-none"
              />

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
          <div className="text-center py-12 text-slate-500 bg-[#121B2E] border border-[#1F2E4D] rounded-3xl p-6 shadow-sm">
            <div className="text-3xl mb-2">🔭</div>
            <h3 className="font-extrabold text-white text-xs">No active posts match these filters</h3>
            <p className="text-[10px] text-slate-400 max-w-xs mt-1.5 mx-auto leading-relaxed">
              {language === 'ar' 
                ? 'لا توجد منشورات للطلاب تناسب اختيارات التصفية هذه حالياً. وسّع التحديد أو غيّر المحافظة لرؤية المزيد!' 
                : language === 'ku' 
                ? 'هیچ بابەتێک نییە بەپێی ئەم پاڵاوتنە لە ئێستادا. تصفیەکەت بگۆڕە بۆ بینینی هەموو شتێک!' 
                : 'No campus items match this selector combination. Broaden your filters to explore materials around the map!'}
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
        const isDev = Boolean((import.meta as any).env?.DEV) || window.location.hostname.includes('localhost');
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

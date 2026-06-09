import React, { useState } from 'react';
import { FeedItem, Language } from '../types';
import { getTranslation } from '../data/translations';
import { IraqiUniversities, IraqiGovernorates } from '../data/mockData';
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
  Sparkles, 
  Bookmark, 
  Compass, 
  BookOpen,
  MapPin,
  CheckCircle,
  TrendingUp,
  Search
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
  isFeedLoading = false
}: FutureFeedProps) {
  const [activeChip, setActiveChip] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 8 Youth-focused opportunity categories chips + groups
  const chips = [
    { id: 'all', labelEN: 'All Future 🚀', labelAR: 'كل المستقبل', labelKU: 'هەموو ئامانجەکان' },
    { id: 'internship', labelEN: 'Internship 💼', labelAR: 'تدريب عملي', labelKU: 'مەشقەکان' },
    { id: 'part_time_job', labelEN: 'Part-time ⏰', labelAR: 'دوام جزئي', labelKU: 'دوامی کاتی' },
    { id: 'full_time_job', labelEN: 'Graduate Jobs 👔', labelAR: 'وظائف خريجين', labelKU: 'هەلی کار' },
    { id: 'training', labelEN: 'Training 🌟', labelAR: 'دورات تأهيلية', labelKU: 'کۆرسەکان' },
    { id: 'scholarship', labelEN: 'Scholarships 🎓', labelAR: 'منح دراسية', labelKU: 'بۆرسەکان' },
    { id: 'volunteering', labelEN: 'Volunteering 🤝', labelAR: 'عمل تطوعي', labelKU: 'خۆبەخشی' },
    { id: 'competition', labelEN: 'Competition 🏆', labelAR: 'مسابقات', labelKU: 'پێشبڕکێ' },
    { id: 'graduation_support', labelEN: 'Project Grant 🔬', labelAR: 'منح التخرج', labelKU: 'مینی گرانت' },
    { id: 'study_group', labelEN: 'Study Circles 👥', labelAR: 'مجموعات دراسية', labelKU: 'گروپی خوێندن' },
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
      'competition', 'graduation_project_support'
    ].includes(item.type) || !!item.opportunityCategory;
  };

  // Base list of opportunities (filtered by search query if any)
  const allOpportunities = feedItems.filter(item => {
    const livesInOpp = getIsOpportunity(item) || item.type === 'study_group';
    if (!livesInOpp) return false;

    if (!searchQuery.trim()) return true;
    
    // Search matching content translation or details
    const textSearch = searchQuery.toLowerCase();
    const matchesEN = item.titleEN?.toLowerCase().includes(textSearch) || item.company?.toLowerCase().includes(textSearch);
    const matchesAR = item.titleAR?.toLowerCase().includes(textSearch) || item.company?.toLowerCase().includes(textSearch);
    const matchesKU = item.titleKU?.toLowerCase().includes(textSearch) || item.company?.toLowerCase().includes(textSearch);
    return matchesEN || matchesAR || matchesKU;
  });

  // Category filter resolver helper for chips selection
  const resolveChipFilteredItems = () => {
    if (activeChip === 'all') return allOpportunities;
    return allOpportunities.filter(item => {
      if (activeChip === 'internship') return item.type === 'internship' || item.opportunityCategory === 'Internship';
      if (activeChip === 'part_time_job') return item.type === 'part_time_job' || item.opportunityCategory === 'Part-time job';
      if (activeChip === 'full_time_job') return item.type === 'full_time_job' || item.opportunityCategory === 'Full-time graduate job' || item.type === 'job';
      if (activeChip === 'training') return item.type === 'training' || item.opportunityCategory === 'Training';
      if (activeChip === 'scholarship') return item.type === 'scholarship' || item.opportunityCategory === 'Scholarship';
      if (activeChip === 'volunteering') return item.type === 'volunteering' || item.opportunityCategory === 'Volunteering';
      if (activeChip === 'competition') return item.type === 'competition' || item.opportunityCategory === 'Competition';
      if (activeChip === 'graduation_support') return item.type === 'graduation_project_support' || item.opportunityCategory === 'Graduation project support';
      if (activeChip === 'study_group') return item.type === 'study_group';
      return true;
    });
  };

  const finalFilteredOpportunityItems = resolveChipFilteredItems();

  // Extracting data specifically for the 6 requested board sections (active when activeChip is 'all')
  
  // Section 1: Featured for your university (matches user's selected uni ID)
  const featuredUniItems = allOpportunities.filter(item => 
    item.universityId === selectedUni
  );

  // Section 2: Popular in Sulaymaniyah / Selected Governorate (filtered by Gov or fallback)
  const popularGovId = selectedGov !== 'all' ? selectedGov : 'sulaymaniyah';
  const popularLocalItems = allOpportunities.filter(item => 
    item.governorateId === popularGovId && (item.likes > 40 || (item.savedCount && item.savedCount > 20))
  );

  // Section 3: Open for all Iraq (locations tagged 'all' or 'All Iraq')
  const openAllIraqItems = allOpportunities.filter(item => 
    item.governorateId === 'all' || item.location?.toLowerCase().includes('all iraq') || item.location?.toLowerCase().includes('online')
  );

  // Section 4: New internships (type or category is Internship)
  const newInternshipItems = allOpportunities.filter(item => 
    item.type === 'internship' || item.opportunityCategory === 'Internship'
  );

  // Section 5: Scholarships and training (types scholarship or training)
  const scholarshipTrainingItems = allOpportunities.filter(item => 
    ['scholarship', 'training'].includes(item.type) || ['Scholarship', 'Training'].includes(item.opportunityCategory || '')
  );

  // Section 6: Saved by classmates (items where user applied, or have high savings > 20)
  const savedByClassmatesItems = allOpportunities.filter(item => 
    (item.savedCount && item.savedCount > 30) || item.savedByUser
  );

  // Language titles lookups
  const section1Title = language === 'ar' ? `المميزة في ${getUniLabel()}` : language === 'ku' ? `تایبەت بە ${getUniLabel()}` : `Featured for ${getUniLabel()}`;
  const section2Title = language === 'ar' ? `الأكثر شعبية في ${getGovLabel()}` : language === 'ku' ? `بەناوبانگ لە ${getGovLabel()}` : `Popular in ${getGovLabel()}`;
  const section3Title = language === 'ar' ? 'متاحة لعموم العراق' : language === 'ku' ? 'کراوە بۆ هەموو عێراق' : 'Open for All Iraq';
  const section4Title = language === 'ar' ? 'جديد التدريب الصيفي' : language === 'ku' ? 'مەشقە نوێیەکان' : 'New Internships';
  const section5Title = language === 'ar' ? 'المنح والدورات التدريبية' : language === 'ku' ? 'بۆرسە و ڕاهێنانەکان' : 'Scholarships & Training';
  const section6Title = language === 'ar' ? 'حفظها زملاؤك في الصف' : language === 'ku' ? 'پاشەکەوتکراو لەلایەن هاوپۆلەکانت' : 'Saved by Your Classmates';

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
        <div className="text-[10px] bg-[#FFD21F] text-[#161A33] border-2 border-[#161A33] rounded-xl px-2.5 py-1.5 font-black shadow-sm flex items-center gap-1 shrink-0 hover:scale-[1.03] transition-transform animate-pulse">
          <span>Campus Today</span>
          <ChevronRight className="w-3 text-[#161A33]" />
        </div>
      </div>

      {/* Search box overlay */}
      <div className="relative mb-5" id="future-search-bar">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-450">
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

      {/* Deadlines Alert list */}
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
                  : 'bg-[var(--soft-card)] border-l-[var(--primary)]'
              }`}
            >
              <p className={`text-[10px] font-black leading-tight limit-rows-2 ${rem.urgent ? 'text-[#D9272E]' : 'text-[var(--text-custom)]'}`}>
                {language === 'ar' ? rem.titleAR : language === 'ku' ? rem.titleKU : rem.titleEN}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[8px] text-slate-500 font-bold uppercase">{getTranslation('dueDateLabel', language)}</span>
                <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                  rem.urgent 
                    ? 'text-[#D9272E] bg-red-100 border border-[#D9272E]/25' 
                    : 'text-[var(--primary)] bg-[var(--soft-card)] border border-[var(--primary)]/20'
                }`}>
                  {rem.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category selector slider chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-5 scrollbar-none" id="future-chips-container">
        {chips.map((chip) => {
          const isSelected = activeChip === chip.id;
          const label = language === 'ar' ? chip.labelAR : language === 'ku' ? chip.labelKU : chip.labelEN;

          return (
            <button
              key={chip.id}
              onClick={() => setActiveChip(chip.id)}
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

      {/* Board Layouts: 6 Sections displayed when "all" chip is active */}
      {isFeedLoading ? (
        <SkeletonLoader />
      ) : activeChip === 'all' ? (
        <div className="flex flex-col gap-6" id="serious-career-future-dashboard">
          
          {/* Section 1: Featured for your university */}
          <div className="flex flex-col" id="dashboard-sec-uni">
            <h2 className="text-xs font-black text-[#161A33] uppercase tracking-tight flex items-center gap-1.5 mb-2.5 border-l-4 border-[#FFD21F] pl-2">
              <School className="w-4 h-4 text-[#6B25C9] shrink-0" />
              <span>{section1Title}</span>
              <span className="w-1.5 h-1.5 bg-[#FFD21F] rounded-full animate-ping mt-0.5" />
            </h2>
            
            {/* Featured Section Empty State Banner */}
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
                     onLike={onLike}
                     onSave={onSave}
                     onVote={onVote}
                     onApply={onApply}
                     onRsvp={onRsvp}
                     onJoinGroup={onJoinGroup}
                     onAddComment={onAddComment}
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
                     onLike={onLike}
                     onSave={onSave}
                     onVote={onVote}
                     onApply={onApply}
                     onRsvp={onRsvp}
                     onJoinGroup={onJoinGroup}
                     onAddComment={onAddComment}
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
                  onLike={onLike}
                  onSave={onSave}
                  onVote={onVote}
                  onApply={onApply}
                  onRsvp={onRsvp}
                  onJoinGroup={onJoinGroup}
                  onAddComment={onAddComment}
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
                  onLike={onLike}
                  onSave={onSave}
                  onVote={onVote}
                  onApply={onApply}
                  onRsvp={onRsvp}
                  onJoinGroup={onJoinGroup}
                  onAddComment={onAddComment}
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
                  onLike={onLike}
                  onSave={onSave}
                  onVote={onVote}
                  onApply={onApply}
                  onRsvp={onRsvp}
                  onJoinGroup={onJoinGroup}
                  onAddComment={onAddComment}
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
                  onLike={onLike}
                  onSave={onSave}
                  onVote={onVote}
                  onApply={onApply}
                  onRsvp={onRsvp}
                  onJoinGroup={onJoinGroup}
                  onAddComment={onAddComment}
                />
              ))}
            </div>
          </div>

        </div>
      ) : (
        /* If a separate slot selected, linear flow with no boards grouping */
        <div className="flex flex-col gap-1" id="linear-opportunities-feed-items">
          {finalFilteredOpportunityItems.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-white border-2 border-[#161A33] rounded-3xl p-6 shadow-sm">
              <div className="text-3xl mb-2">🔭</div>
              <h3 className="font-extrabold text-[#161A33] text-xs">No opportunities matches this filter</h3>
              <p className="text-[10px] text-slate-500 max-w-xs mt-1.5 mx-auto leading-relaxed">
                Try writing brief segments (e.g. "Dev", "Intern") or broaden your campus governorate selection.
              </p>
            </div>
          ) : (
            finalFilteredOpportunityItems.map(item => (
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
      )}

    </div>
  );
}

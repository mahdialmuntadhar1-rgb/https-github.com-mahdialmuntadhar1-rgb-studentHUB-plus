import React from 'react';
import { Language } from '../types';
import { motion } from 'motion/react';

interface StoryItem {
  id: string;
  emoji: string;
  labelEN: string;
  labelAR: string;
  labelKU: string;
  color: string; // gradient classes e.g. "from-pink-500 via-purple-500 to-yellow-500"
  tab: 'home' | 'life' | 'ask' | 'future' | 'profile';
  filterType?: string;
  highlightTextEN: string;
  highlightTextAR: string;
  highlightTextKU: string;
}

const storiesData: StoryItem[] = [
  {
    id: 'story-life',
    emoji: '🎈',
    labelEN: 'Campus Life',
    labelAR: 'حياة الحرم',
    labelKU: 'ژیانی زانکۆ',
    color: 'from-pink-550 from-pink-500 via-rose-500 to-yellow-500',
    tab: 'life',
    highlightTextEN: 'Backstage & fun moments',
    highlightTextAR: 'كواليس ولحظات ممتعة',
    highlightTextKU: 'کوالیس و کاتە خۆشەکان'
  },
  {
    id: 'story-scholarships',
    emoji: '🎓',
    labelEN: 'Scholarships',
    labelAR: 'المنح الدراسية',
    labelKU: 'منحەی خوێندن',
    color: 'from-purple-600 via-indigo-600 to-pink-550 to-pink-500',
    tab: 'future',
    filterType: 'scholarship',
    highlightTextEN: 'Fully funded tuition info',
    highlightTextAR: 'معلومات المنح الممولة بالكامل',
    highlightTextKU: 'زانیاری لەسەر منحەی خوێندن'
  },
  {
    id: 'story-internships',
    emoji: '💼',
    labelEN: 'Internships',
    labelAR: 'الفرص والتدريب',
    labelKU: 'مەشق و ڕاهێنان',
    color: 'from-cyan-500 via-blue-600 to-indigo-600',
    tab: 'future',
    filterType: 'internship',
    highlightTextEN: 'Build tech & business skills',
    highlightTextAR: 'تدريبات عملية حقيقية في عِراقنا',
    highlightTextKU: 'مەشقی ڕاهێنانی پراکتیکی'
  },
  {
    id: 'story-events',
    emoji: '🎟️',
    labelEN: 'Events',
    labelAR: 'الفعاليات وبغداد',
    labelKU: 'چالاکییەکان',
    color: 'from-amber-500 via-red-500 to-pink-500',
    tab: 'life',
    filterType: 'event',
    highlightTextEN: 'Hackathons and meetups today',
    highlightTextAR: 'هاكاثونات ومؤتمرات تقنية',
    highlightTextKU: 'هاکاتۆن و کۆنفرانسی تەکنەلۆژی'
  },
  {
    id: 'story-study',
    emoji: '📖',
    labelEN: 'Study Tips',
    labelAR: 'نصائح دراسية',
    labelKU: 'ئامۆژگاری زانستی',
    color: 'from-emerald-450 from-emerald-500 via-teal-500 to-cyan-500',
    tab: 'ask',
    highlightTextEN: 'Top notes & AI assistance',
    highlightTextAR: 'ملخصات ومساعدة بالذكاء الاصطناعي',
    highlightTextKU: 'کورتکراوەکان و هاوکاری سەرچاوەکان'
  },
  {
    id: 'story-unis',
    emoji: '🏛️',
    labelEN: 'Universities',
    labelAR: 'الجامعات',
    labelKU: 'زانکۆکان',
    color: 'from-indigo-500 via-purple-500 to-teal-400',
    tab: 'home',
    highlightTextEN: 'Iraqi institution guides',
    highlightTextAR: 'دليل شامل للجامعات العراقية',
    highlightTextKU: 'ڕێبەری گشتی زانکۆکانی عێراق'
  }
];

interface StoryHighlightsProps {
  language: Language;
  onNavigateTab: (tabId: 'home' | 'life' | 'ask' | 'future' | 'profile') => void;
  onSelectStory?: (item: StoryItem) => void;
}

export default function StoryHighlights({
  language,
  onNavigateTab,
  onSelectStory
}: StoryHighlightsProps) {
  return (
    <div className="w-full mt-2 mb-6 bg-white rounded-3xl border-2 border-[#E6E1F5] p-4.5 shadow-sm" id="jamiaati-stories-frame">
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-[11px] font-black uppercase tracking-widest text-[#6B25C9] bg-[#6B25C9]/10 px-3 py-1 rounded-full leading-none">
          {language === 'ar' ? 'أبرز القصص وبانوراما 📸' : language === 'ku' ? 'چیرۆکە دیارەکان 📸' : 'CAMPUS STORIES 📸'}
        </span>
        <span className="text-[9px] font-black text-[#6B25C9] animate-pulse flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#FFD21F]" />
          {language === 'ar' ? 'اسحب للمشاهدة' : language === 'ku' ? 'ڕابکێشە' : 'Swipe now'}
        </span>
      </div>
      
      {/* Horizontal Swipe Layout wrapped elegantly */}
      <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none snap-x touch-pan-x" id="stories-scrollable-bar">
        {storiesData.map((story) => {
          const label = language === 'ar' ? story.labelAR : language === 'ku' ? story.labelKU : story.labelEN;
          // Apply custom playful yellow/purple/blue gradient border for Campus Pop 1 spec
          const popGradient = "from-[#6B25C9] via-[#2F7CCB] to-[#FFD21F]";
          return (
            <div 
              key={story.id} 
              className="flex flex-col items-center gap-2 snap-start cursor-pointer shrink-0"
              onClick={() => {
                if (onSelectStory) {
                  onSelectStory(story);
                } else {
                  onNavigateTab(story.tab);
                }
              }}
            >
              {/* Instagram styled dynamic story circle */}
              <div className="relative group">
                {/* 3D dynamic spinning/popping gradient ring */}
                <span className={`absolute inset-0 bg-gradient-to-tr ${popGradient} rounded-full p-[2.5px] transition-all duration-300 group-hover:scale-110 shadow-md shadow-[#6B25C9]/10`} />
                
                {/* Inner bubble circle */}
                <span className="relative flex items-center justify-center w-14 h-14 bg-white rounded-full border-2 border-white text-2xl shadow-inner select-none transition-transform duration-300 group-hover:rotate-6">
                  {story.emoji}
                </span>

                {/* Sparkling tiny live indicator - bright yellow or red */}
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#FFD21F] border-2 border-white rounded-full shadow-sm flex items-center justify-center text-[7px]" title="Live Story">
                  ✨
                </span>
              </div>

              {/* Story text label */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-[#161A33] text-center tracking-tight leading-none max-w-[72px] truncate">
                  {label}
                </span>
                <span className="text-[7px] font-black uppercase text-[#6B25C9] bg-[#6B25C9]/5 px-1 py-0.2 rounded mt-0.5 scale-90">
                  {story.emoji === '🎈' ? 'Live' : 'Hot'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

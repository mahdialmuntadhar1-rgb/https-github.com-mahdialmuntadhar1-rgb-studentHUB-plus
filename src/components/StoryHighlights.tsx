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
    <div className="w-full mt-2 mb-6" id="jamiaati-stories-frame">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <span className="text-[11px] font-black uppercase tracking-widest text-[#7C3AED] dark:text-[#EC4899] bg-gradient-to-r from-pink-500/10 to-purple-500/10 px-2.5 py-1 rounded-xl border border-pink-500/10 leading-none">
          {language === 'ar' ? 'أبرز القصص وبانوراما 📸' : language === 'ku' ? 'چیرۆکە دیارەکان 📸' : 'CAMPUS HIGHLIGHTS 📸'}
        </span>
        <span className="text-[9px] font-bold text-slate-500 animate-pulse">
          {language === 'ar' ? 'اسحب لمشاهدة المزيد' : language === 'ku' ? 'بۆ بینینی زیاتر ڕابکێشە' : 'Swipe for more'}
        </span>
      </div>
      
      {/* Horizontal Swipe Layout */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x touch-pan-x" id="stories-scrollable-bar">
        {storiesData.map((story) => {
          const label = language === 'ar' ? story.labelAR : language === 'ku' ? story.labelKU : story.labelEN;
          return (
            <div 
              key={story.id} 
              className="flex flex-col items-center gap-1.5 snap-start cursor-pointer shrink-0"
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
                <span className={`absolute inset-0 bg-gradient-to-tr ${story.color} rounded-full p-[2.5px] transition-all duration-300 group-hover:scale-105 group-active:scale-95 shadow-md shadow-black/10`} />
                
                {/* Inner bubble circle */}
                <span className="relative flex items-center justify-center w-15 h-15 bg-[#FFFFFF] dark:bg-[#121B2E] rounded-full border-2 border-[#F8FAFC] dark:border-[#0B1020] text-2xl shadow-inner select-none transition-transform duration-300 group-hover:rotate-6">
                  {story.emoji}
                </span>

                {/* Sparkling tiny live indicator */}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#EC4899] border-2 border-white dark:border-[#0B1020] rounded-full shadow-sm animate-pulse" />
              </div>

              {/* Story text label */}
              <span className="text-[10px] font-bold text-[#0F172A] dark:text-slate-200 text-center tracking-tight leading-tight max-w-[72px] truncate">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

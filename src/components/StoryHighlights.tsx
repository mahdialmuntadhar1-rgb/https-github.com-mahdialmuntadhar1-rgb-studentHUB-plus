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
    emoji: 'ðŸŽˆ',
    labelEN: 'Campus Life',
    labelAR: 'Ø­ÙŠØ§Ø© Ø§Ù„Ø­Ø±Ù…',
    labelKU: 'Ú˜ÛŒØ§Ù†ÛŒ Ø²Ø§Ù†Ú©Û†',
    color: 'from-pink-550 from-pink-500 via-rose-500 to-yellow-500',
    tab: 'life',
    highlightTextEN: 'Backstage & fun moments',
    highlightTextAR: 'ÙƒÙˆØ§Ù„ÙŠØ³ ÙˆÙ„Ø­Ø¸Ø§Øª Ù…Ù…ØªØ¹Ø©',
    highlightTextKU: 'Ú©ÙˆØ§Ù„ÛŒØ³ Ùˆ Ú©Ø§ØªÛ• Ø®Û†Ø´Û•Ú©Ø§Ù†'
  },
  {
    id: 'story-scholarships',
    emoji: 'ðŸŽ“',
    labelEN: 'Scholarships',
    labelAR: 'Ø§Ù„Ù…Ù†Ø­ Ø§Ù„Ø¯Ø±Ø§Ø³ÙŠØ©',
    labelKU: 'Ù…Ù†Ø­Û•ÛŒ Ø®ÙˆÛŽÙ†Ø¯Ù†',
    color: 'from-purple-600 via-indigo-600 to-pink-550 to-pink-500',
    tab: 'future',
    filterType: 'scholarship',
    highlightTextEN: 'Fully funded tuition info',
    highlightTextAR: 'Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ù…Ù†Ø­ Ø§Ù„Ù…Ù…ÙˆÙ„Ø© Ø¨Ø§Ù„ÙƒØ§Ù…Ù„',
    highlightTextKU: 'Ø²Ø§Ù†ÛŒØ§Ø±ÛŒ Ù„Û•Ø³Û•Ø± Ù…Ù†Ø­Û•ÛŒ Ø®ÙˆÛŽÙ†Ø¯Ù†'
  },
  {
    id: 'story-internships',
    emoji: 'ðŸ’¼',
    labelEN: 'Internships',
    labelAR: 'Ø§Ù„ÙØ±Øµ ÙˆØ§Ù„ØªØ¯Ø±ÙŠØ¨',
    labelKU: 'Ù…Û•Ø´Ù‚ Ùˆ Ú•Ø§Ù‡ÛŽÙ†Ø§Ù†',
    color: 'from-cyan-500 via-blue-600 to-indigo-600',
    tab: 'future',
    filterType: 'internship',
    highlightTextEN: 'Build tech & business skills',
    highlightTextAR: 'ØªØ¯Ø±ÙŠØ¨Ø§Øª Ø¹Ù…Ù„ÙŠØ© Ø­Ù‚ÙŠÙ‚ÙŠØ© ÙÙŠ Ø¹ÙØ±Ø§Ù‚Ù†Ø§',
    highlightTextKU: 'Ù…Û•Ø´Ù‚ÛŒ Ú•Ø§Ù‡ÛŽÙ†Ø§Ù†ÛŒ Ù¾Ø±Ø§Ú©ØªÛŒÚ©ÛŒ'
  },
  {
    id: 'story-events',
    emoji: 'ðŸŽŸï¸',
    labelEN: 'Events',
    labelAR: 'Ø§Ù„ÙØ¹Ø§Ù„ÙŠØ§Øª ÙˆØ¨ØºØ¯Ø§Ø¯',
    labelKU: 'Ú†Ø§Ù„Ø§Ú©ÛŒÛŒÛ•Ú©Ø§Ù†',
    color: 'from-amber-500 via-red-500 to-pink-500',
    tab: 'life',
    filterType: 'event',
    highlightTextEN: 'Hackathons and meetups today',
    highlightTextAR: 'Ù‡Ø§ÙƒØ§Ø«ÙˆÙ†Ø§Øª ÙˆÙ…Ø¤ØªÙ…Ø±Ø§Øª ØªÙ‚Ù†ÙŠØ©',
    highlightTextKU: 'Ù‡Ø§Ú©Ø§ØªÛ†Ù† Ùˆ Ú©Û†Ù†ÙØ±Ø§Ù†Ø³ÛŒ ØªÛ•Ú©Ù†Û•Ù„Û†Ú˜ÛŒ'
  },
  {
    id: 'story-study',
    emoji: 'ðŸ“–',
    labelEN: 'Study Tips',
    labelAR: 'Ù†ØµØ§Ø¦Ø­ Ø¯Ø±Ø§Ø³ÙŠØ©',
    labelKU: 'Ø¦Ø§Ù…Û†Ú˜Ú¯Ø§Ø±ÛŒ Ø²Ø§Ù†Ø³ØªÛŒ',
    color: 'from-emerald-450 from-emerald-500 via-teal-500 to-cyan-500',
    tab: 'ask',
    highlightTextEN: 'Top notes & AI assistance',
    highlightTextAR: 'Ù…Ù„Ø®ØµØ§Øª ÙˆÙ…Ø³Ø§Ø¹Ø¯Ø© Ø¨Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ',
    highlightTextKU: 'Ú©ÙˆØ±ØªÚ©Ø±Ø§ÙˆÛ•Ú©Ø§Ù† Ùˆ Ù‡Ø§ÙˆÚ©Ø§Ø±ÛŒ Ø³Û•Ø±Ú†Ø§ÙˆÛ•Ú©Ø§Ù†'
  },
  {
    id: 'story-unis',
    emoji: 'ðŸ›ï¸',
    labelEN: 'Universities',
    labelAR: 'Ø§Ù„Ø¬Ø§Ù…Ø¹Ø§Øª',
    labelKU: 'Ø²Ø§Ù†Ú©Û†Ú©Ø§Ù†',
    color: 'from-indigo-500 via-purple-500 to-teal-400',
    tab: 'home',
    highlightTextEN: 'Iraqi institution guides',
    highlightTextAR: 'Ø¯Ù„ÙŠÙ„ Ø´Ø§Ù…Ù„ Ù„Ù„Ø¬Ø§Ù…Ø¹Ø§Øª Ø§Ù„Ø¹Ø±Ø§Ù‚ÙŠØ©',
    highlightTextKU: 'Ú•ÛŽØ¨Û•Ø±ÛŒ Ú¯Ø´ØªÛŒ Ø²Ø§Ù†Ú©Û†Ú©Ø§Ù†ÛŒ Ø¹ÛŽØ±Ø§Ù‚'
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
    <div className="w-full mt-2 mb-6 bg-white rounded-3xl border-2 border-[#E6E1F5] p-4.5 shadow-sm" id="Talaba-stories-frame">
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-[11px] font-black uppercase tracking-widest text-[#6B25C9] bg-[#6B25C9]/10 px-3 py-1 rounded-full leading-none">
          {language === 'ar' ? 'Ø£Ø¨Ø±Ø² Ø§Ù„Ù‚ØµØµ ÙˆØ¨Ø§Ù†ÙˆØ±Ø§Ù…Ø§ ðŸ“¸' : language === 'ku' ? 'Ú†ÛŒØ±Û†Ú©Û• Ø¯ÛŒØ§Ø±Û•Ú©Ø§Ù† ðŸ“¸' : 'CAMPUS STORIES ðŸ“¸'}
        </span>
        <span className="text-[9px] font-black text-[#6B25C9] animate-pulse flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#FFD21F]" />
          {language === 'ar' ? 'Ø§Ø³Ø­Ø¨ Ù„Ù„Ù…Ø´Ø§Ù‡Ø¯Ø©' : language === 'ku' ? 'Ú•Ø§Ø¨Ú©ÛŽØ´Û•' : 'Swipe now'}
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
                  âœ¨
                </span>
              </div>

              {/* Story text label */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-[#161A33] text-center tracking-tight leading-none max-w-[72px] truncate">
                  {label}
                </span>
                <span className="text-[7px] font-black uppercase text-[#6B25C9] bg-[#6B25C9]/5 px-1 py-0.2 rounded mt-0.5 scale-90">
                  {story.emoji === 'ðŸŽˆ' ? 'Live' : 'Hot'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


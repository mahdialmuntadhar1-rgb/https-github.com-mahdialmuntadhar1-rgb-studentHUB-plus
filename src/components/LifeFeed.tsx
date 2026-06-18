import React, { useState } from 'react';
import { FeedItem, Language } from '../types';
import { getTranslation } from '../data/translations';
import { initialFeedItems } from '../data/mockData';
import { X, Search, Heart, Sparkles, Filter, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import FeedCard from './FeedCard';
import { SkeletonLoader } from './HomeFeed';
interface LifeFeedProps {
  feedItems: FeedItem[];
  language: Language;
  selectedGov: string;
  selectedUni: string;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onVote: (itemId: string, optionId: string) => void;
  onApply: (id: string) => void;
  onAddComment: (id: string, commentText: string) => void;
  onShowAll: () => void;
  isFeedLoading?: boolean;
  onEditFeedItem?: (id: string, updatedFields: Partial<FeedItem>) => void;
  onDeleteFeedItem?: (id: string) => void;
  isAdminMode?: boolean;
  onUserClick?: (user: any) => void;
}

export default function LifeFeed({
  feedItems,
  language,
  selectedGov,
  selectedUni,
  onLike,
  onSave,
  onVote,
  onApply,
  onAddComment,
  onShowAll,
  isFeedLoading = false,
  onEditFeedItem,
  onDeleteFeedItem,
  isAdminMode = false,
  onUserClick
}: LifeFeedProps) {
  const [activeChip, setActiveChip] = useState<'all' | 'video' | 'photo' | 'story' | 'poll' | 'clubs' | 'nearby' | 'trending'>('all');
  const [selectedStory, setSelectedStory] = useState<null | FeedItem>(null);

  // Filter keys inside Life Feed
  const chips = [
    { id: 'all', labelEN: 'All', labelAR: 'الكل', labelKU: 'هەموو' },
    { id: 'video', labelEN: 'Videos 🎥', labelAR: 'فيديوهات', labelKU: 'ڤیدیۆکان' },
    { id: 'photo', labelEN: 'Photos 📸', labelAR: 'صور', labelKU: 'وێنەکان' },
    { id: 'story', labelEN: 'Stories ⏳', labelAR: 'قصص طلابية', labelKU: 'ستۆری' },
    { id: 'poll', labelEN: 'Polls 📊', labelAR: 'استطلاعات', labelKU: 'ڕاپرسییەکان' },
    { id: 'clips', labelEN: 'Clubs 🤝', labelAR: 'نوادي طلابية', labelKU: 'یانەکان' },
    { id: 'nearby', labelEN: 'Nearby Cafes ☕', labelAR: 'قرب الجامعة', labelKU: 'لەنزیکەوە' },
    { id: 'trending', labelEN: 'Trending 🔥', labelAR: 'رائج الآن', labelKU: 'ترێندینگ' }
  ];

  // Specific circular story list data
  const storiesList = initialFeedItems.filter(item => item.type === 'story' || item.type === 'video');

  // Intelligent inline classification to avoid empty feeds
  const filteredItems = feedItems.filter(item => {
    // Keep only Life-type items (social, media, story, poll, service)
    const isLifeContent = ['post', 'video', 'photo', 'story', 'poll', 'local_service'].includes(item.type);
    if (!isLifeContent) return false;

    if (activeChip === 'all') return true;
    if (activeChip === 'video') return item.type === 'video';
    if (activeChip === 'photo') return item.type === 'photo';
    if (activeChip === 'story') return item.type === 'story';
    if (activeChip === 'poll') return item.type === 'poll';
    if (activeChip === 'clubs') return item.tags?.some(tag => tag.toLowerCase().includes('club') || tag.toLowerCase().includes('group')) || item.type === 'study_group';
    if (activeChip === 'nearby') return item.type === 'local_service';
    if (activeChip === 'trending') return item.likes > 150 || item.tags?.includes('Trending');
    return true;
  });

  return (
    <div className="px-4 py-4 max-w-lg mx-auto flex flex-col pb-24 bg-[#F3F7FF] min-h-screen" id="life-feed-container">
      
      {/* Absolute Header Alert UX Rule: "Viewing Campus Life · Show all" */}
      <div 
        id="life-filter-reset-banner"
        onClick={onShowAll}
        className="mb-5 bg-white rounded-3xl p-3.5 border-2 border-[#161A33] flex items-center justify-between pointer-events-auto cursor-pointer shadow-[3px_3px_0px_0px_#161A33] hover:shadow-[5px_5px_0px_0px_#161A33] transition-all"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#6B25C9]/10 text-[#6B25C9] flex items-center justify-center font-bold">
            🌸
          </div>
          <span className="text-[11px] font-black tracking-tight text-[#161A33]">
            {getTranslation('viewingLife', language)}
          </span>
        </div>
        <div className="text-[10px] bg-[#FFD21F] text-[#161A33] border-2 border-[#161A33] rounded-xl px-2.5 py-1.5 font-black shadow-sm flex items-center gap-0.5 shrink-0 hover:scale-[1.03] transition-transform">
          <span>Show All</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>

      {/* Stories Rail */}
      <div className="mb-5" id="stories-circular-container">
        <h3 className="text-[10px] font-black uppercase text-[#6B25C9] tracking-wider mb-2.5 flex items-center gap-1">
          ✨ Campus Moments Stories
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-1.5 scrollbar-none" id="stories-circular-rail">
          {storiesList.map((story) => (
            <button
              key={story.id}
              onClick={() => setSelectedStory(story)}
              className="flex flex-col items-center gap-1.5 focus:outline-none shrink-0 cursor-pointer group"
            >
              <div className="relative p-0.5 rounded-2xl bg-gradient-to-tr from-[#6B25C9] via-[#2F7CCB] to-[#FFD21F] select-none group-hover:scale-105 active:scale-95 transition-all shadow-md shadow-[#6B25C9]/10">
                <div className="bg-white p-0.5 rounded-2xl">
                  <img
                    src={story.author.avatar}
                    alt={story.author.name}
                    className="w-13 h-13 rounded-2xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {story.type === 'video' ? (
                  <span className="absolute bottom-0 right-0 bg-[#FFD21F] text-[#161A33] text-[8px] font-black px-1.5 rounded-md py-0.2 border border-white">
                    LIVE
                  </span>
                ) : (
                  <span className="absolute bottom-0 right-0 bg-[#6B25C9] text-white text-[8px] font-black px-1.5 rounded-md py-0.2 border border-white">
                    MEM
                  </span>
                )}
              </div>
              <span className="text-[9px] font-bold text-slate-700 max-w-[65px] truncate">
                {story.author.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal horizontal chips selectors as requested */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none" id="life-chips-container">
        {chips.map((chip) => {
          const isSelected = activeChip === chip.id;
          const label = language === 'ar' ? chip.labelAR : language === 'ku' ? chip.labelKU : chip.labelEN;

          return (
            <button
              key={chip.id}
              onClick={() => setActiveChip(chip.id as any)}
              className={`px-3 py-1.8 rounded-xl text-xs shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#6B25C9] text-white border-2 border-[#161A33] shadow-[2px_2px_0px_0px_#161A33] font-black'
                  : 'bg-white hover:bg-[#F3F7FF] text-[#161A33] hover:text-[#6B25C9] border-2 border-[#E6E1F5] font-bold'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Social content feed loop */}
      <div className="flex flex-col gap-1" id="social-visual-life-list">
        {isFeedLoading ? (
          <SkeletonLoader />
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white border-2 border-[#161A33] rounded-3xl p-6 shadow-sm">
            <div className="text-3xl mb-2">🎈</div>
            <h3 className="font-extrabold text-[#161A33] text-xs text-center">
              {language === 'ar'
                ? 'لا توجد منشورات حالياً'
                : language === 'ku'
                ? 'ئێستا هیچ بابەتێک نییە'
                : 'No posts available yet'}
            </h3>
            <p className="text-[10px] text-slate-500 max-w-xs mt-1.5 mx-auto text-center leading-relaxed">
              {language === 'ar'
                ? 'لا توجد منشورات حالياً. يرجى المحاولة لاحقاً.'
                : language === 'ku'
                ? 'ئێستا هیچ بابەتێک نییە. تکایە دواتر هەوڵ بدەوە.'
                : 'No posts available yet. Please check again later.'}
            </p>
          </div>
        ) : (
          filteredItems.map(item => (
            <FeedCard
              key={item.id}
              item={item}
              language={language}
              onLike={onLike}
              onSave={onSave}
              onVote={onVote}
              onApply={onApply}
              onAddComment={onAddComment}
              onEditFeedItem={onEditFeedItem}
              onDeleteFeedItem={onDeleteFeedItem}
              isAdminMode={isAdminMode}
              onUserClick={onUserClick}
            />
          ))
        )}
      </div>

      {/* Story Immersive Visual overlay Modal */}
      <AnimatePresence>
        {selectedStory && (
          <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between" id="immersive-story-modal">
            
            {/* Top Close bar */}
            <div className="w-full max-w-lg p-5 flex items-center justify-between text-white z-20">
              <div className="flex items-center gap-2">
                <img src={selectedStory.author.avatar} alt="Author" className="w-9 h-9 rounded-xl object-cover border border-white/20" referrerPolicy="no-referrer" />
                <div>
                  <h4 className="text-xs font-extrabold">{selectedStory.author.name}</h4>
                  <span className="text-[9px] text-stone-400 block">{selectedStory.date}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStory(null)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Immersive content area */}
            <div className="flex-1 w-full max-w-lg flex items-center justify-center relative p-4">
              {selectedStory.videoThumbnail ? (
                <div className="relative w-full max-h-[70vh] rounded-2xl overflow-hidden aspect-[9/16] bg-black">
                  <img src={selectedStory.videoThumbnail} className="w-full h-full object-cover" alt="Video frame" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-white bg-black/60 px-3 py-1.5 rounded-full flex items-center gap-1">
                      <Eye className="w-4 h-4 text-cyan-400" />
                      Simulated Campus Reel Loop
                    </span>
                  </div>
                </div>
              ) : selectedStory.imageUrl ? (
                <div className="w-full max-h-[70vh] rounded-2xl overflow-hidden">
                  <img src={selectedStory.imageUrl} className="w-full h-full object-contain" alt="Story graphic" referrerPolicy="no-referrer" />
                </div>
              ) : (
                <div className="bg-gradient-to-tr from-[#4F46E5] to-[#2563EB] p-8 rounded-2xl text-center text-white text-sm font-bold min-h-[300px] flex flex-col justify-center max-w-md mx-auto shadow-2xl">
                  <div className="text-4xl mb-4">💬</div>
                  <p className="leading-relaxed font-black">
                    "{language === 'ar' ? selectedStory.contentAR : language === 'ku' ? selectedStory.contentKU : selectedStory.contentEN}"
                  </p>
                </div>
              )}
            </div>

            {/* Bottom text overlay */}
            <div className="w-full max-w-lg p-5 bg-gradient-to-t from-black via-black/80 to-transparent text-white z-10">
              <h3 className="text-sm font-black mb-1.5">
                {language === 'ar' ? selectedStory.titleAR : language === 'ku' ? selectedStory.titleKU : selectedStory.titleEN}
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed font-semibold">
                {language === 'ar' ? selectedStory.contentAR : language === 'ku' ? selectedStory.contentKU : selectedStory.contentEN}
              </p>
            </div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}




import React, { useState } from 'react';
import { FeedItem, Language } from '../types';
import { getTranslation } from '../data/translations';
import { initialFeedItems } from '../data/mockData';
import { X, Search, Heart, Sparkles, Filter, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import FeedCard from './FeedCard';

interface LifeFeedProps {
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
  onShowAll: () => void;
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
  onRsvp,
  onJoinGroup,
  onAddComment,
  onShowAll
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
    <div className="px-4 py-3 max-w-lg mx-auto flex flex-col pb-24" id="life-feed-container">
      
      {/* Absolute Header Alert UX Rule: "Viewing Campus Life · Show all" */}
      <div 
        id="life-filter-reset-banner"
        onClick={onShowAll}
        className="mb-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-3 border border-orange-100/50 flex items-center justify-between pointer-events-auto cursor-pointer shadow-sm hover:border-orange-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold">
            🌸
          </div>
          <span className="text-[11px] font-black tracking-tight text-orange-950">
            {getTranslation('viewingLife', language)}
          </span>
        </div>
        <div className="text-[10px] bg-orange-600 text-white rounded-lg px-2.5 py-1 font-bold shadow-sm flex items-center gap-0.5 shrink-0">
          <span>Show All</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>

      {/* Stories Rail */}
      <div className="mb-5" id="stories-circular-container">
        <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2.5 flex items-center gap-1">
          ✨ Campus Moments Stories
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none" id="stories-circular-rail">
          {storiesList.map((story) => (
            <button
              key={story.id}
              onClick={() => setSelectedStory(story)}
              className="flex flex-col items-center gap-1.5 focus:outline-none shrink-0 cursor-pointer group"
            >
              <div className="relative p-0.5 rounded-2xl bg-gradient-to-tr from-orange-500 via-pink-500 to-amber-400 select-none group-hover:scale-105 active:scale-95 transition-all shadow-md shadow-pink-500/10">
                <div className="bg-white p-0.4 rounded-2xl">
                  <img
                    src={story.author.avatar}
                    alt={story.author.name}
                    className="w-13 h-13 rounded-2xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {story.type === 'video' ? (
                  <span className="absolute bottom-0 right-0 bg-orange-500 text-white text-[8px] font-black px-1 rounded-md py-0.2 border border-white">
                    LIVE
                  </span>
                ) : (
                  <span className="absolute bottom-0 right-0 bg-pink-500 text-white text-[8px] font-black px-1 rounded-md py-0.2 border border-white">
                    MEM
                  </span>
                )}
              </div>
              <span className="text-[9px] font-extrabold text-gray-700 max-w-[65px] truncate">
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
              className={`px-3 py-1.8 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-orange-500 text-white shadow shadow-orange-500/15 scale-102'
                  : 'bg-gray-100 hover:bg-gray-150 text-gray-600 hover:text-gray-900 border border-transparent'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Social content feed loop */}
      <div className="flex flex-col gap-1" id="social-visual-life-list">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white border border-gray-100 rounded-3xl p-6">
            <div className="text-3xl mb-2">🎈</div>
            <h3 className="font-bold text-gray-700 text-xs text-center">No active entries matching filter</h3>
            <p className="text-[10px] text-gray-400 max-w-xs mt-1 mx-auto text-center">
              We reused details across lists to avoid empty views. Change selectors or try the "All" tab.
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
              onRsvp={onRsvp}
              onJoinGroup={onJoinGroup}
              onAddComment={onAddComment}
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
                      <Eye className="w-4 h-4 text-orange-400" />
                      Simulated Campus Reel Loop
                    </span>
                  </div>
                </div>
              ) : selectedStory.imageUrl ? (
                <div className="w-full max-h-[70vh] rounded-2xl overflow-hidden">
                  <img src={selectedStory.imageUrl} className="w-full h-full object-contain" alt="Story graphic" referrerPolicy="no-referrer" />
                </div>
              ) : (
                <div className="bg-gradient-to-tr from-orange-500 to-indigo-600 p-8 rounded-2xl text-center text-white text-sm font-bold min-h-[300px] flex flex-col justify-center max-w-md mx-auto">
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

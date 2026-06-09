import React, { useState } from 'react';
import { FeedItem, Language } from '../types';
import { getTranslation } from '../data/translations';
import { Sparkles, MessageSquare, Briefcase, PlusCircle, CheckCircle, Info, Image, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import FeedCard from './FeedCard';
import StoryHighlights from './StoryHighlights';

interface HomeFeedProps {
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
  onNavigateTab: (tabId: 'home' | 'life' | 'ask' | 'future' | 'profile') => void;
  onAddNewPost: (title: string, body: string, anonymous: boolean) => void;
  isFeedLoading?: boolean;
}

// Global reuseable beautiful pulse Skeleton Loader
export function SkeletonLoader() {
  return (
    <div className="flex flex-col gap-4 w-full select-none" id="jamiaati-skeleton-loader">
      {[1, 2].map(i => (
        <div 
          key={i} 
          className="bg-[#121B2E] rounded-3xl border border-[#1F2E4D] p-5 mb-1 relative flex flex-col gap-4 animate-pulse relative overflow-hidden"
        >
          {/* Top header line mimicking avatar + author */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#1F2E4D]/80 rounded-xl shrink-0" />
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="h-3 bg-[#1F2E4D]/80 rounded-md w-1/3" />
              <div className="h-2.5 bg-[#1F2E4D]/50 rounded-md w-1/2" />
            </div>
            <div className="w-16 h-5.5 bg-[#1F2E4D]/60 rounded-xl" />
          </div>
          {/* Core content line mimicking body text */}
          <div className="flex flex-col gap-2">
            <div className="h-3 bg-[#1F2E4D]/75 rounded-md w-full" />
            <div className="h-3 bg-[#1F2E4D]/75 rounded-md w-5/6" />
            <div className="h-3 bg-[#1F2E4D]/45 rounded-md w-1/2" />
          </div>
          {/* Stats Bar and reactions */}
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
  selectedUni,
  onLike,
  onSave,
  onVote,
  onApply,
  onRsvp,
  onJoinGroup,
  onAddComment,
  onNavigateTab,
  onAddNewPost,
  isFeedLoading = false
}: HomeFeedProps) {
  const [showPublisher, setShowPublisher] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState('');

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postBody.trim()) return;

    // Use default titles if not filled
    const generatedTitle = postTitle.trim() || (anonymous ? 'Anonymous Question' : 'Campus Moment 🌟');
    onAddNewPost(generatedTitle, postBody, anonymous);
    
    // reset states
    setPostTitle('');
    setPostBody('');
    setAnonymous(false);
    setShowPublisher(false);

    setMessage('Post shared successfully on Campus Today!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="px-4 py-4 max-w-lg mx-auto flex flex-col pb-24 bg-[#0B1020]" id="home-feed-container">
      
      {/* Slogan Banner / Playful Dynamic Gradient Hero */}
      <div className="mb-6 relative rounded-3xl bg-gradient-to-tr from-[#6B25C9] via-[#D9272E] to-[#2F7CCB] p-6 text-white border-b-6 border-[#FFD21F] shadow-lg overflow-hidden select-none" id="campus-core-slogan-card">
        {/* Playful background decorative shapes/stars/circles */}
        <div className="absolute top-2 right-4 text-2xl opacity-20 select-none pointer-events-none animate-pulse">✦</div>
        <div className="absolute bottom-4 left-6 text-3xl opacity-15 select-none pointer-events-none animate-bounce">★</div>
        <div className="absolute -top-10 -left-10 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-yellow-405 bg-[#FFD21F]/10 rounded-full blur-lg pointer-events-none" />
        
        {/* Floating Yellow Slogan Pill */}
        <div className="inline-flex items-center gap-1.5 bg-[#FFD21F] text-[#161A33] text-[9px] font-black tracking-wider uppercase px-3 py-1 rounded-full shadow-sm mb-3.5 border border-[#161A33]/15 transform -rotate-1 hover:rotate-0 transition-transform">
          <span>🎯 {language === 'ar' ? 'البوابة الذكية الأولى' : language === 'ku' ? 'یەکەم دەروازی خوێندکاران' : 'NUM. 1 CAMPUS APP'}</span>
        </div>

        {/* Big Bold Titles in White & Yellow */}
        <div className="relative z-10">
          <h2 className="text-lg md:text-xl font-black tracking-tight leading-snug drop-shadow-sm">
            {language === 'ar' ? (
              <>
                تميّز وابنِ <span className="text-[#FFD21F] underline decoration-wavy decoration-[#FFD21F] underline-offset-4 font-black">مستقبلك الأكاديمي!</span> 🚀
              </>
            ) : language === 'ku' ? (
              <>
                داهاتوویەکی <span className="text-[#FFD21F] underline decoration-wavy decoration-[#FFD21F] underline-offset-4 font-black">پڕشنگدار بنيات بنێ!</span> 🚀
              </>
            ) : (
              <>
                Master Your <span className="text-[#FFD21F] underline decoration-wavy decoration-[#FFD21F] underline-offset-4 font-black">Campus Journey!</span> 🚀
              </>
            )}
          </h2>
          
          <p className="text-[10px] text-white/90 font-black mt-2 leading-relaxed max-w-sm">
            {language === 'ar' ? 'البوابة الطلابية الأقوى للجامعات والتدريب في عِراقنا الحبيب' : language === 'ku' ? 'یەکەم دەروازەی خوێندکارانی زانکۆ و دابینکردنی هەلی مەشق و ڕاهێنان' : 'The ultimate collegiate hub for premium opportunities & academic resources'}
          </p>

          {/* Interactive features inside the hero */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[9px] font-black bg-[#FFD21F] text-[#161A33] px-3.5 py-1.5 rounded-full hover:bg-yellow-300 transition-colors shadow-sm cursor-pointer transform hover:scale-105 active:scale-95 leading-none">
              {language === 'ar' ? 'استكشف الفرص ✨' : language === 'ku' ? 'گەڕان بەدوای هەلەکان ✨' : 'Explore Opportunities ✨'}
            </span>
            <span className="text-[8px] font-mono font-black text-[#FFD21F] bg-white/10 px-2 py-1 rounded-lg border border-white/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFD21F] animate-ping" />
              ● {language === 'ar' ? 'مباشر الآن' : language === 'ku' ? 'ئەکتیڤە' : 'LIVE'}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <div className="mb-5" id="home-hero-header">
        <div className="flex items-center gap-1.5 text-[#6B25C9] mb-1">
          <Sparkles className="w-4 h-4 animate-spin-slow text-[#6B25C9]" />
          <span className="text-[9px] font-black uppercase tracking-widest leading-none text-[#6B25C9]">{getTranslation('campusToday', language)}</span>
        </div>
        <h2 className="text-xl font-black text-[#161A33] tracking-tight leading-tight">
          {getTranslation('campusToday', language)}
        </h2>
        <p className="text-xs text-slate-500 font-semibold mt-1 max-w-sm">
          {getTranslation('heroSubtitle', language)}
        </p>
      </div>

      {/* Story Highlights */}
      <StoryHighlights language={language} onNavigateTab={onNavigateTab} />

      {/* Two giant quick access cards inside Home feed as requested */}
      <div className="grid grid-cols-2 gap-3.5 mb-6" id="quick-access-cards">
        
        {/* Card 1: Campus Life (Fun side) */}
        <button
          id="quick-card-life"
          onClick={() => onNavigateTab('life')}
          className="text-left bg-gradient-to-br from-[#6B25C9] to-[#2F7CCB] rounded-3xl p-4.5 text-white border-2 border-[#161A33] shadow-[3px_3px_0px_0px_#161A33] hover:shadow-[5px_5px_0px_0px_#161A33] cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0.5 transition-all relative overflow-hidden group flex flex-col justify-between min-h-[148px]"
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform blur-md" />
          <div className="bg-white/20 w-9 h-9 rounded-xl flex items-center justify-center mb-1 shadow-inner">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-tight leading-none uppercase">
              {getTranslation('cardLifeTitle', language)}
            </h3>
            <p className="text-[9px] text-[#F3F7FF] font-extrabold leading-tight mt-1 opacity-95">
              {getTranslation('cardLifeDesc', language)}
            </p>
            <div className="mt-3 flex items-center gap-1 text-[8px] font-black uppercase tracking-wider bg-[#FFD21F] text-[#161A33] px-2.5 py-1 rounded-md cursor-pointer w-max shadow-sm">
              <span>Go social</span>
              <span>→</span>
            </div>
          </div>
        </button>

        {/* Card 2: Your Future (Serious side) */}
        <button
          id="quick-card-future"
          onClick={() => onNavigateTab('future')}
          className="text-left bg-gradient-to-br from-[#D9272E] to-[#FFD21F] rounded-3xl p-4.5 text-white border-2 border-[#161A33] shadow-[3px_3px_0px_0px_#161A33] hover:shadow-[5px_5px_0px_0px_#161A33] cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0.5 transition-all relative overflow-hidden group flex flex-col justify-between min-h-[148px]"
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform blur-md" />
          <div className="bg-white/20 w-9 h-9 rounded-xl flex items-center justify-center mb-1 shadow-inner">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-tight leading-none uppercase">
              {getTranslation('cardFutureTitle', language)}
            </h3>
            <p className="text-[9px] text-white font-extrabold leading-tight mt-1 opacity-95">
              {getTranslation('cardFutureDesc', language)}
            </p>
            <div className="mt-3 flex items-center gap-1 text-[8px] font-black uppercase tracking-wider bg-white text-[#161A33] px-2.5 py-1 rounded-md cursor-pointer w-max shadow-sm border border-[#161A33]/10">
              <span>Build Career</span>
              <span>→</span>
            </div>
          </div>
        </button>

      </div>

      {/* Share bar / compose post */}
      <div className="bg-white border-2 border-[#161A33] rounded-3xl p-4.5 mb-5 shadow-[3px_3px_0px_0px_#161A33]" id="post-composition-box">
        {message && (
          <div className="bg-emerald-50 text-emerald-800 text-xs font-bold p-2.5 rounded-xl border-2 border-emerald-500/30 mb-3 flex items-center gap-1.5 animate-pulse">
            <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <div className="flex items-center gap-2.5 pointer-events-auto" onClick={() => setShowPublisher(!showPublisher)}>
          <div className="text-xl">⚡</div>
          <div className="flex-1 bg-[#F7F4FF] hover:bg-[#F3F7FF] border border-[#E6E1F5] px-3.5 py-3 rounded-xl text-xs font-bold text-slate-500 transition-all cursor-pointer shadow-inner">
            {getTranslation('newPostPlaceholder', language)}
          </div>
          <button id="post-trigger-plus" className="p-3 bg-[#FFD21F] text-[#161A33] hover:bg-yellow-450 border-2 border-[#161A33] rounded-xl transition-all cursor-pointer shadow-[2px_2px_0px_0px_#161A33]">
            <PlusCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Collapsible status publisher formulation */}
        <AnimatePresence>
          {showPublisher && (
            <motion.form
              onSubmit={handlePostSubmit}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-3.5 border-t border-[#E6E1F5] pt-4 flex flex-col gap-3"
            >
              {/* Optional Title input */}
              <input
                type="text"
                value={postTitle}
                onChange={e => setPostTitle(e.target.value)}
                placeholder={getTranslation('headlineTopic', language)}
                className="w-full text-xs font-bold text-[#161A33] bg-white border border-[#E6E1F5] rounded-xl px-3.5 py-2.5 focus:bg-[#F3F7FF] focus:outline-none focus:border-[#6B25C9] transition-colors"
              />

              {/* Main Text Content */}
              <textarea
                value={postBody}
                onChange={e => setPostBody(e.target.value)}
                required
                rows={3}
                placeholder={getTranslation('newPostPlaceholder', language)}
                className="w-full text-xs font-semibold text-[#161A33] bg-white border border-[#E6E1F5] rounded-xl p-3.5 focus:bg-[#F3F7FF] focus:outline-none focus:border-[#6B25C9] transition-colors resize-none"
              />

              {/* Options panel */}
              <div className="flex items-center justify-between mt-1">
                {/* Anonymous Toggle */}
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

                {/* Submit actions */}
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

      {/* Selector feedback and Reset filters info */}
      {(selectedGov !== 'all' || selectedUni !== 'all') && (
        <div className="bg-[#F3F7FF] border-2 border-[#161A33] rounded-2xl p-3 mb-4 text-[10px] font-bold text-[#161A33] flex items-center justify-between gap-1 shadow-sm">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-[#6B25C9] shrink-0" />
            <span>
              {language === 'ar' 
                ? 'يتم تصفية المنشورات حالياً طبقاً لاختياراتك الجغرافية والأكاديمية المحددة.' 
                : language === 'ku' 
                ? 'بینینی بابەتەکان پاڵێوراوە بەپێی ویلایەت و زانکۆ دیاریکراوەکانت.' 
                : 'Feed is filtered by your Governorate/University selections.'}
            </span>
          </div>
        </div>
      )}

      {/* Mixed Feed Loop */}
      <div className="flex flex-col gap-1" id="mixed-feed-items-list">
        {isFeedLoading ? (
          <SkeletonLoader />
        ) : feedItems.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white border-2 border-[#161A33] rounded-3xl p-6 shadow-sm">
            <div className="text-3xl mb-2">🔭</div>
            <h3 className="font-extrabold text-[#161A33] text-xs">No active posts for this combination</h3>
            <p className="text-[10px] text-[#5C677D] max-w-xs mt-1.5 mx-auto leading-relaxed">
              {language === 'ar' 
                ? 'لا توجد منشورات للطلاب هنا لهذه التصفية. وسّع نطاق تحديد المحافظة أو الجامعة لرى المزيد!' 
                : language === 'ku' 
                ? 'هیچ پۆستێک نییە بەم گەڕانەت. گەڕانەکەت فراوانتر بکە بۆ بینینی هەموو زانکۆکانی عێراق!' 
                : 'No student shares here yet. Broaden your selectors to see the rest of Iraq!'}
            </p>
          </div>
        ) : (
          feedItems.map(item => (
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

    </div>
  );
}

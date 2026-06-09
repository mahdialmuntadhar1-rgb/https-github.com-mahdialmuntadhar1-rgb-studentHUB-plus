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
      
      {/* Slogan Banner / Immersive Hero */}
      <div className="mb-6 relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-[#1F2E4D] h-44 select-none group cursor-pointer" id="campus-core-slogan-card">
        {/* Unsplash beautiful college student collaboration illustration image */}
        <img 
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600" 
          alt="Jamiaati College life banner" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        {/* Dark colorful gradient overlay for readable text */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-[#7C3AED]/20" />
        
        {/* Floating badge */}
        <div className="absolute top-3 left-4 bg-[#7C3AED] text-white text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-lg shadow-md border border-white/10">
          CAMPUS EXCLUSIVE • حصري
        </div>

        {/* Text Content overlay */}
        <div className="absolute bottom-4 inset-x-4 flex flex-col justify-end text-left">
          <h2 className="text-white text-base font-black tracking-tight leading-snug">
            {language === 'ar' ? 'تميّز، تواصل، وابنِ مستقبلك الأكاديمي! 🚀' : language === 'ku' ? 'داهاتوو لێرە بنیات بنێ! 🚀' : 'Master your campus life! 🚀'}
          </h2>
          <p className="text-[#06B6D4] text-[10px] font-extrabold mt-0.5">
            {language === 'ar' ? 'البوابة الطلابية الأولى للجامعات والتدريب في عِراقنا' : language === 'ku' ? 'یەکەم دەروازەی خوێندکارانی زانکۆ لە عێراق' : 'The ultimate student hub for universities & premium opportunities'}
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-[9px] font-bold bg-[#FFFFFF]/15 hover:bg-[#FFFFFF]/25 text-white px-2.5 py-1 rounded-lg border border-white/10 transition-colors">
              {language === 'ar' ? 'استكشف الفرص ✨' : language === 'ku' ? 'گەڕان بەدوای هەلەکان ✨' : 'Explore Hub ✨'}
            </span>
            <span className="text-[8px] font-mono font-black text-rose-400 animate-pulse bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
              ● {language === 'ar' ? 'نشط الآن' : language === 'ku' ? 'ئەکتیڤە' : 'LIVE'}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <div className="mb-5" id="home-hero-header">
        <div className="flex items-center gap-1.5 text-cyan-400 mb-1">
          <Sparkles className="w-4 h-4 animate-spin-slow text-[#06B6D4]" />
          <span className="text-[9px] font-black uppercase tracking-widest leading-none text-cyan-400">{getTranslation('campusToday', language)}</span>
        </div>
        <h2 className="text-xl font-black text-white tracking-tight leading-tight">
          {getTranslation('campusToday', language)}
        </h2>
        <p className="text-xs text-slate-400 font-semibold mt-1 max-w-sm">
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
          className="text-left bg-gradient-to-br from-[#2563EB] to-[#06B6D4] rounded-3xl p-4.5 text-white shadow-lg cursor-pointer transform hover:scale-[1.02] active:scale-95 transition-all relative overflow-hidden group flex flex-col justify-between min-h-[148px] border border-cyan-500/25"
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform blur-md" />
          <div className="bg-white/15 w-9 h-9 rounded-xl flex items-center justify-center mb-1 shadow-inner">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-tight leading-none uppercase">
              {getTranslation('cardLifeTitle', language)}
            </h3>
            <p className="text-[9px] text-[#E0F7FA] font-extrabold leading-tight mt-1 opacity-95">
              {getTranslation('cardLifeDesc', language)}
            </p>
            <div className="mt-3 flex items-center gap-1 text-[8px] font-black uppercase tracking-wider bg-white/20 px-2 py-1 rounded-md cursor-pointer w-max border border-white/10">
              <span>Go social</span>
              <span>→</span>
            </div>
          </div>
        </button>

        {/* Card 2: Your Future (Serious side) */}
        <button
          id="quick-card-future"
          onClick={() => onNavigateTab('future')}
          className="text-left bg-gradient-to-br from-[#4F46E5] to-[#2563EB] rounded-3xl p-4.5 text-white shadow-lg cursor-pointer transform hover:scale-[1.02] active:scale-95 transition-all relative overflow-hidden group flex flex-col justify-between min-h-[148px] border border-indigo-500/25"
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform blur-md" />
          <div className="bg-white/15 w-9 h-9 rounded-xl flex items-center justify-center mb-1 shadow-inner">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-tight leading-none uppercase">
              {getTranslation('cardFutureTitle', language)}
            </h3>
            <p className="text-[9px] text-[#E0F2FE] font-extrabold leading-tight mt-1 opacity-95">
              {getTranslation('cardFutureDesc', language)}
            </p>
            <div className="mt-3 flex items-center gap-1 text-[8px] font-black uppercase tracking-wider bg-white/20 px-2 py-1 rounded-md cursor-pointer w-max border border-white/10">
              <span>Build Career</span>
              <span>→</span>
            </div>
          </div>
        </button>

      </div>

      {/* Share bar / compose post */}
      <div className="bg-[#121B2E] border border-[#1F2E4D] rounded-3xl p-4 mb-5 shadow-lg" id="post-composition-box">
        {message && (
          <div className="bg-emerald-500/10 text-emerald-400 text-xs font-bold p-2.5 rounded-xl border border-emerald-500/25 mb-3 flex items-center gap-1.5 animate-pulse">
            <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <div className="flex items-center gap-2.5 pointer-events-auto" onClick={() => setShowPublisher(!showPublisher)}>
          <div className="text-xl">⚡</div>
          <div className="flex-1 bg-[#16223F] hover:bg-[#1E2E4E] border border-[#1F2E4D] px-3.5 py-3 rounded-xl text-xs font-semibold text-slate-300 transition-all cursor-pointer shadow-inner">
            {getTranslation('newPostPlaceholder', language)}
          </div>
          <button id="post-trigger-plus" className="p-3 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-xl transition-all cursor-pointer">
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
              className="overflow-hidden mt-3.5 border-t border-[#1F2E4D] pt-4 flex flex-col gap-3"
            >
              {/* Optional Title input */}
              <input
                type="text"
                value={postTitle}
                onChange={e => setPostTitle(e.target.value)}
                placeholder={getTranslation('headlineTopic', language)}
                className="w-full text-xs font-bold text-white bg-[#101726] border border-[#1F2E4D] rounded-xl px-3.5 py-2.5 focus:bg-[#16223F] focus:outline-none focus:border-cyan-400/50 transition-colors"
              />

              {/* Main Text Content */}
              <textarea
                value={postBody}
                onChange={e => setPostBody(e.target.value)}
                required
                rows={3}
                placeholder={getTranslation('newPostPlaceholder', language)}
                className="w-full text-xs font-semibold text-slate-100 bg-[#101726] border border-[#1F2E4D] rounded-xl p-3.5 focus:bg-[#16223F] focus:outline-none focus:border-cyan-400/50 transition-colors resize-none"
              />

              {/* Options panel */}
              <div className="flex items-center justify-between mt-1">
                {/* Anonymous Toggle */}
                <label className="flex items-center gap-1.5 cursor-pointer bg-slate-900 border border-[#1F2E4D] px-3 py-1.5 rounded-xl hover:border-slate-600 transition-colors" id="anonymous-toggle-label">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={e => setAnonymous(e.target.checked)}
                    className="w-4 h-4 text-[#06B6D4] bg-slate-950 border-[#1F2E4D] rounded focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase flex items-center gap-1">
                    <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    {getTranslation('anonymous', language)}
                  </span>
                </label>

                {/* Submit actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowPublisher(false)}
                    className="text-[10px] font-extrabold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-755 hover:bg-slate-700/80 px-3.5 py-2 rounded-xl border border-slate-700 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-[10px] font-black bg-gradient-to-tr from-[#06B6D4] via-[#2563EB] to-[#4F46E5] hover:scale-[1.01] active:scale-95 text-white px-4 py-2 rounded-xl shadow-glow-cyan/5 border border-white/5 cursor-pointer transition-all"
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
        <div className="bg-cyan-500/10 border border-cyan-400/20 rounded-xl p-2.5 mb-4 text-[10px] font-bold text-cyan-400 flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
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
          <div className="text-center py-12 text-slate-400 bg-[#121B2E] border border-[#1F2E4D] rounded-3xl p-6 shadow-inner">
            <div className="text-3xl mb-2">🔭</div>
            <h3 className="font-extrabold text-white text-xs">No active posts for this combination</h3>
            <p className="text-[10px] text-slate-400 max-w-xs mt-1.5 mx-auto leading-relaxed">
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

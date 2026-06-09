import React, { useState } from 'react';
import { FeedItem, Language } from '../types';
import { getTranslation } from '../data/translations';
import { Sparkles, MessageSquare, Briefcase, PlusCircle, CheckCircle, Info, Image, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import FeedCard from './FeedCard';

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
  onAddNewPost
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
    <div className="px-4 py-3 max-w-lg mx-auto flex flex-col pb-24" id="home-feed-container">
      
      {/* Slogan Banner */}
      <div className="mb-4 text-center p-3.5 bg-gradient-to-r from-orange-500 via-orange-600 to-indigo-600 rounded-2xl text-white shadow-md shadow-orange-500/10">
        <h2 className="text-[14px] font-black tracking-tight uppercase leading-tight bg-black/10 px-2 py-1 rounded w-max mx-auto mb-1 font-mono font-sans">
          {getTranslation('slogan', language)}
        </h2>
        <p className="text-[10px] opacity-90 font-bold">
          {language === 'ar' ? 'العراق الأكاديمي كله في تطبيق واحد' : language === 'ku' ? 'هەموو عێراقی ئەکادیمی لە یەک ئەپدا' : 'The entire academic Iraq connected in one app.'}
        </p>
      </div>

      {/* Hero Header */}
      <div className="mb-5" id="home-hero-header">
        <div className="flex items-center gap-1.5 text-orange-500 mb-1">
          <Sparkles className="w-4 h-4 animate-spin-slow" />
          <span className="text-[10px] font-black uppercase tracking-widest">{getTranslation('campusToday', language)}</span>
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
          {getTranslation('campusToday', language)}
        </h2>
        <p className="text-xs text-gray-400 font-bold mt-1 max-w-sm">
          {getTranslation('heroSubtitle', language)}
        </p>
      </div>

      {/* Two giant quick access cards inside Home feed as requested */}
      <div className="grid grid-cols-2 gap-3.5 mb-6" id="quick-access-cards">
        
        {/* Card 1: Campus Life (Fun side) */}
        <button
          id="quick-card-life"
          onClick={() => onNavigateTab('life')}
          className="text-left bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-4 text-white shadow-xl shadow-orange-500/15 cursor-pointer transform hover:scale-[1.02] transition-all relative overflow-hidden group flex flex-col justify-between min-h-[140px]"
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform" />
          <div className="bg-white/15 w-8 h-8 rounded-xl flex items-center justify-center mb-1">
            <MessageSquare className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-tight leading-none">
              {getTranslation('cardLifeTitle', language)}
            </h3>
            <p className="text-[9px] text-orange-50 font-semibold leading-tight mt-1 opacity-95">
              {getTranslation('cardLifeDesc', language)}
            </p>
            <div className="mt-2.5 flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded cursor-pointer w-max">
              <span>Go social</span>
              <span>→</span>
            </div>
          </div>
        </button>

        {/* Card 2: Your Future (Serious side) */}
        <button
          id="quick-card-future"
          onClick={() => onNavigateTab('future')}
          className="text-left bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-4 text-white shadow-xl shadow-indigo-600/15 cursor-pointer transform hover:scale-[1.02] transition-all relative overflow-hidden group flex flex-col justify-between min-h-[140px]"
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/15 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform" />
          <div className="bg-white/15 w-8 h-8 rounded-xl flex items-center justify-center mb-1">
            <Briefcase className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-tight leading-none">
              {getTranslation('cardFutureTitle', language)}
            </h3>
            <p className="text-[9px] text-indigo-100 font-semibold leading-tight mt-1 opacity-95">
              {getTranslation('cardFutureDesc', language)}
            </p>
            <div className="mt-2.5 flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded cursor-pointer w-max">
              <span>Build Career</span>
              <span>→</span>
            </div>
          </div>
        </button>

      </div>

      {/* Share bar / compose post */}
      <div className="bg-white border border-gray-100 rounded-2xl p-3 mb-5 shadow-sm" id="post-composition-box">
        {message && (
          <div className="bg-emerald-50 text-emerald-700 text-xs font-bold p-2.5 rounded-xl border border-emerald-100 mb-3 flex items-center gap-1.5">
            <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <div className="flex items-center gap-2.5 pointer-events-auto" onClick={() => setShowPublisher(!showPublisher)}>
          <div className="text-2xl">⚡</div>
          <div className="flex-1 bg-gray-50 hover:bg-gray-100/70 border border-gray-100 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-500 transition-colors cursor-pointer">
            {getTranslation('newPostPlaceholder', language)}
          </div>
          <button id="post-trigger-plus" className="p-2 bg-orange-100 text-orange-600 hover:bg-orange-200 rounded-xl transition-all cursor-pointer">
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
              className="overflow-hidden mt-3 border-t border-gray-100 pt-3 flex flex-col gap-2.5"
            >
              {/* Optional Title input */}
              <input
                type="text"
                value={postTitle}
                onChange={e => setPostTitle(e.target.value)}
                placeholder={language === 'ar' ? 'عنوان المنشور (اختياري)...' : language === 'ku' ? 'ناونیشانی پۆست (ئارەزوومەندانە)...' : 'Headline/Topic (Optional)...'}
                className="w-full text-xs font-black text-gray-900 bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2 focus:bg-white focus:outline-none"
              />

              {/* Main Text Content */}
              <textarea
                value={postBody}
                onChange={e => setPostBody(e.target.value)}
                required
                rows={3}
                placeholder={getTranslation('newPostPlaceholder', language)}
                className="w-full text-xs font-medium text-gray-800 bg-gray-50 border border-gray-100 rounded-xl p-3.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
              />

              {/* Options panel */}
              <div className="flex items-center justify-between mt-1">
                {/* Anonymous Toggle */}
                <label className="flex items-center gap-1.5 cursor-pointer" id="anonymous-toggle-label">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={e => setAnonymous(e.target.checked)}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
                    <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                    {getTranslation('anonymous', language)}
                  </span>
                </label>

                {/* Submit actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowPublisher(false)}
                    className="text-[10px] font-black text-gray-400 hover:text-gray-600 bg-gray-100/50 hover:bg-gray-100 px-3 py-1.5 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-[10px] font-black bg-gradient-to-tr from-orange-500 to-amber-500 text-white px-3.5 py-1.5 rounded-xl shadow cursor-pointer"
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
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-2.5 mb-4 text-[10px] font-bold text-orange-800 flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-orange-500 shrink-0" />
            <span>
              {language === 'ar' 
                ? 'يتم تصفية المنشورات حالياً طبقاً لاختياراتك' 
                : language === 'ku' 
                ? 'پۆستەکان دەپاڵێورێن بەپێی ویستت' 
                : 'Feed is filtered by your Governorate/University selections.'}
            </span>
          </div>
        </div>
      )}

      {/* Mixed Feed Loop */}
      <div className="flex flex-col gap-1" id="mixed-feed-items-list">
        {feedItems.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white border border-gray-100 rounded-3xl p-6">
            <div className="text-3xl mb-2">🔭</div>
            <h3 className="font-bold text-gray-700 text-xs">No active posts for this combination</h3>
            <p className="text-[10px] text-gray-400 max-w-xs mt-1 mx-auto">
              {language === 'ar' 
                ? 'يبدو أنه لا توجد مشاركات لهذه المحافظة أو الجامعة حالياً. وسع عوامل التصفية لاستكشاف المزيد!' 
                : language === 'ku' 
                ? 'هیچ پۆستێک نییە لەم زانکۆ یان پارێزگایەدا. فلتەرەکە لابدە!' 
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

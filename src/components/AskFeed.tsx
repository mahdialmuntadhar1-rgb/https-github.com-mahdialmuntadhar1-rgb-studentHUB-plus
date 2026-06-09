import React, { useState } from 'react';
import { FeedItem, Language } from '../types';
import { getTranslation } from '../data/translations';
import { HelpCircle, Sparkles, Send, MessagesSquare, CheckCircle, EyeOff, BookOpen, Clock, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import FeedCard from './FeedCard';
import { SkeletonLoader } from './HomeFeed';

interface AskFeedProps {
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
  onAddNewPost: (title: string, body: string, anonymous: boolean, customType?: string) => void;
  isFeedLoading?: boolean;
}

export default function AskFeed({
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
  onAddNewPost,
  isFeedLoading = false
}: AskFeedProps) {
  const [askQuery, setAskQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [anonymousAi, setAnonymousAi] = useState(false);
  
  // Community Question input
  const [communityQuery, setCommunityQuery] = useState('');
  const [anonymousCommunity, setAnonymousCommunity] = useState(true);
  const [notiMessage, setNotiMessage] = useState('');

  // AI Advisor submission
  const handleAiConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!askQuery.trim()) return;

    setIsAiLoading(true);
    setAiResponse(null);

    try {
      const response = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: askQuery,
          lang: language,
          governorate: selectedGov,
          university: selectedUni,
          anonymous: anonymousAi
        })
      });

      if (!response.ok) {
        throw new Error('Connection failed');
      }

      const data = await response.json();
      setAiResponse(data.text);
    } catch (err: any) {
      console.error(err);
      setAiResponse("⚠️ [MOCK_NETWORK_NOTICE]: I am unable to connect to the active backend. Please review your server processes. Here is local guidance: Absences over 10% invoke an 'أول إنذار' (First warning). Present a valid emergency medical note to the student registry immediately.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Publish to community feed
  const handleCommunitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!communityQuery.trim()) return;

    onAddNewPost('Student Question 🙋‍♀️', communityQuery, anonymousCommunity, 'anonymous_question');
    
    setCommunityQuery('');
    setNotiMessage(language === 'ar' ? 'تم نشر سؤالك في تبويب المناقشات!' : language === 'ku' ? 'پرسیارەکەت بڵاوکرایەوە لە گفتوگۆکاندا!' : 'Question published to student discussions!');
    setTimeout(() => setNotiMessage(''), 3500);
  };

  // Filter only student questions (anonymous questions, study help)
  const questionItems = feedItems.filter(item => {
    return item.type === 'anonymous_question' || item.type === 'poll' || item.tags?.includes('Advising') || item.type === 'study_group';
  });

  return (
    <div className="px-4 py-4 max-w-lg mx-auto flex flex-col pb-24 bg-[#0B1020]" id="ask-feed-container">
      
      {/* 1. AI ADVISOR MAIN INTERACTIVE SECTION */}
      <div 
        className="bg-[#121B2E] border border-[#1F2E4D] rounded-2xl p-4.5 text-white shadow-xl shadow-cyan-900/5 mb-6" 
        id="ai-advisor-panel"
      >
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-400/25 flex items-center justify-center text-cyan-400 text-sm shrink-0 shadow animate-pulse">
            ✨
          </div>
          <div>
            <h2 className="text-[10px] font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1 leading-none">
              {language === 'ar' ? 'مستشار الذكاء الاصطناعي' : language === 'ku' ? 'ڕاوێژکاری زیرەکی دەستکرد' : 'Al-Murshed AI Advisor'} <span className="bg-cyan-500/15 text-cyan-300 text-[8px] font-black px-1.5 py-0.2 rounded border border-cyan-400/20">LIVE v3.5</span>
            </h2>
            <h3 className="text-sm font-black text-white leading-tight mt-1">
              {getTranslation('askAiTitle', language)}
            </h3>
          </div>
        </div>
        
        <p className="text-[11px] text-slate-300 leading-relaxed font-semibold mb-4">
          {getTranslation('askAiDesc', language)}
        </p>

        {/* Input Form */}
        <form onSubmit={handleAiConsult} className="flex flex-col gap-2.5" id="ai-advisor-form">
          <textarea
            value={askQuery}
            onChange={e => setAskQuery(e.target.value)}
            rows={2}
            placeholder={getTranslation('askAiPlaceholder', language)}
            className="w-full bg-[#16223F] border border-[#1F2E4D] hover:border-slate-600 rounded-xl p-3.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:bg-[#1E2E4B]/50 focus:border-cyan-400/50 resize-none font-semibold leading-relaxed"
          />

          <div className="flex items-center justify-between">
            {/* Anonymous Toggle for AI */}
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-white transition-colors" id="ai-anonymous-check">
              <input
                type="checkbox"
                checked={anonymousAi}
                onChange={e => setAnonymousAi(e.target.checked)}
                className="w-3.5 h-3.5 text-cyan-500 rounded border-[#1F2E4D] bg-[#101726] focus:ring-cyan-500 cursor-pointer"
              />
              <span className="text-[9px] font-black uppercase tracking-wider">
                {getTranslation('anonymous', language)}
              </span>
            </label>

            <button
              type="submit"
              disabled={isAiLoading || !askQuery.trim()}
              className="px-4 py-2 bg-gradient-to-r from-[#4F46E5] to-[#2563EB] hover:scale-[1.01] active:scale-95 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all disabled:opacity-50 flex items-center gap-1.5 border border-indigo-500/20"
            >
              {isAiLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{language === 'ar' ? 'تحليل...' : language === 'ku' ? 'شیکردنەوە...' : 'Analyzing...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{getTranslation('askAiBtn', language)}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* AI Answer Stream Card */}
        <AnimatePresence>
          {aiResponse && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 bg-[#16223F] rounded-xl p-3.5 border border-[#1F2E4D] flex flex-col gap-2 shadow-inner text-slate-200"
              id="ai-response-memo-box"
            >
              <div className="flex justify-between items-center text-[9px] font-black text-slate-450 border-b border-[#1F2E4D] pb-1.5 uppercase tracking-wider">
                <span className="flex items-center gap-1 text-cyan-400">
                  <Clock className="w-3.5 h-3.5" /> {getTranslation('verifiedSolution', language)}
                </span>
                <span>Response v3.5-flash</span>
              </div>
              <p className="text-xs font-semibold text-slate-200 leading-relaxed whitespace-pre-wrap break-words">
                {aiResponse}
              </p>
              <button
                onClick={() => {
                  setAskQuery('');
                  setAiResponse(null);
                }}
                className="text-[10px] font-black text-center text-rose-400 mt-2 hover:bg-rose-500/10 py-1.5 rounded bg-rose-500/5 cursor-pointer border border-[#FEF2F2]/10 w-full"
              >
                {getTranslation('clearMemo', language)}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. COMMUNITY DISCUSSION INTERACTIVE SECTION */}
      <div className="bg-[#121B2E] rounded-2xl border border-[#1F2E4D] p-3.5 mb-5 shadow-lg" id="community-ask-form-wrapper">
        {notiMessage && (
          <div className="bg-[#121B2E] text-emerald-400 text-xs font-bold p-2.5 rounded-xl border border-emerald-500/25 mb-3 flex items-center gap-1.5">
            <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
            <span>{notiMessage}</span>
          </div>
        )}

        <h3 className="text-xs font-black text-white tracking-tight mb-2 flex items-center gap-1.5">
          <MessagesSquare className="w-4 h-4 text-cyan-450" /> {getTranslation('classmateCommTitle', language)}
        </h3>
        <p className="text-[10px] text-slate-400 font-bold mb-3">
          {getTranslation('classmateCommDesc', language)}
        </p>

        {/* Input for publishing direct questions */}
        <form onSubmit={handleCommunitySubmit} className="flex flex-col gap-2.5">
          <textarea
            value={communityQuery}
            onChange={e => setCommunityQuery(e.target.value)}
            rows={2}
            required
            placeholder={language === 'ar' ? 'اكتب سؤالك هنا لزملائك الطلاب...' : language === 'ku' ? 'پرسیارەکەت بنووسە لێرە بۆ هاوڕێکانت...' : 'Ask your classmate peers: Can anyone share Networking syllabus notes? Or are there team members available?'}
            className="w-full text-xs font-semibold text-slate-100 bg-[#16223F] border border-[#1F2E4D] rounded-xl p-3.5 focus:bg-[#1E2E4E] focus:outline-none focus:border-cyan-400 resize-none"
          />

          <div className="flex items-center justify-between">
            {/* Anonymous Toggle for Community */}
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 bg-[#101726] border border-[#1F2E4D]/85 px-2.5 py-1 rounded-lg" id="community-anonymous-check">
              <input
                type="checkbox"
                checked={anonymousCommunity}
                onChange={e => setAnonymousCommunity(e.target.checked)}
                className="w-3.5 h-3.5 text-cyan-500 rounded border-gray-300 focus:ring-cyan-500 cursor-pointer"
              />
              <span className="text-[9px] font-black uppercase tracking-wider">
                {getTranslation('anonymous', language)}
              </span>
            </label>

            <button
              type="submit"
              disabled={!communityQuery.trim()}
              className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:scale-[1.01] text-xs font-extrabold rounded-xl shadow cursor-pointer transition-transform disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{getTranslation('askCommunityBtn', language)}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. ACTIVE QUESTIONS LIST FOR GENERAL BENEFIT */}
      <div id="student-discussions-header" className="mb-3">
        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
          💬 {getTranslation('activeDiscussionsTitle', language)} ({questionItems.length})
        </h3>
      </div>

      <div className="flex flex-col gap-1" id="active-questions-posts-list">
        {isFeedLoading ? (
          <SkeletonLoader />
        ) : questionItems.length === 0 ? (
          <div className="text-center py-12 text-slate-450 bg-[#121B2E] border border-[#1F2E4D] rounded-3xl p-6 shadow-inner">
            <div className="text-3xl mb-2">🔭</div>
            <h3 className="font-extrabold text-white text-xs text-center">{getTranslation('noDiscussions', language)}</h3>
            <p className="text-[10px] text-slate-450 max-w-xs mt-1.5 mx-auto leading-relaxed text-center">
              {language === 'ar' ? 'غير عوامل التصفية واستعرض من جديد.' : language === 'ku' ? 'فلتەرەکە بگۆڕە و دووبارە بگەڕێ.' : 'Change selectors and search again.'}
            </p>
          </div>
        ) : (
          questionItems.map(item => (
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

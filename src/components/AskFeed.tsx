import React, { useState } from 'react';
import { FeedItem, Language } from '../types';
import { getTranslation } from '../data/translations';
import { HelpCircle, Sparkles, Send, MessagesSquare, CheckCircle, EyeOff, BookOpen, Clock, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import FeedCard from './FeedCard';

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
  onAddNewPost
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
    <div className="px-4 py-3 max-w-lg mx-auto flex flex-col pb-24" id="ask-feed-container">
      
      {/* 1. AI ADVISOR MAIN INTERACTIVE SECTION */}
      <div 
        className="bg-gradient-to-tr from-indigo-900 via-indigo-950 to-orange-950 rounded-2xl p-4 text-white shadow-xl shadow-indigo-950/20 mb-6" 
        id="ai-advisor-panel"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white text-sm shrink-0 shadow shadow-orange-500/30 animate-pulse">
            ✨
          </div>
          <div>
            <h2 className="text-xs font-black text-orange-400 uppercase tracking-wider flex items-center gap-1">
              {language === 'ar' ? 'مستشار الذكاء الاصطناعي' : language === 'ku' ? 'ڕاوێژکاری زیرەکی دەستکرد' : 'Al-Murshed AI Advisor'} <span className="bg-orange-500/20 text-orange-300 text-[8px] font-black px-1.5 py-0.2 rounded">LIVE v3.5</span>
            </h2>
            <h3 className="text-sm font-black text-white pr-2 leading-tight">
              {getTranslation('askAiTitle', language)}
            </h3>
          </div>
        </div>
        
        <p className="text-[11px] text-indigo-200 leading-relaxed font-medium mb-4">
          {getTranslation('askAiDesc', language)}
        </p>

        {/* Input Form */}
        <form onSubmit={handleAiConsult} className="flex flex-col gap-2.5" id="ai-advisor-form">
          <textarea
            value={askQuery}
            onChange={e => setAskQuery(e.target.value)}
            rows={2}
            placeholder={getTranslation('askAiPlaceholder', language)}
            className="w-full bg-white/10 border border-white/15 hover:border-white/25 rounded-xl p-3 text-xs text-white placeholder-indigo-300 focus:outline-none focus:bg-white/15 focus:border-white/30 resize-none font-medium leading-relaxed"
          />

          <div className="flex items-center justify-between">
            {/* Anonymous Toggle for AI */}
            <label className="flex items-center gap-1.5 cursor-pointer text-white/75 hover:text-white transition-colors" id="ai-anonymous-check">
              <input
                type="checkbox"
                checked={anonymousAi}
                onChange={e => setAnonymousAi(e.target.checked)}
                className="w-3.5 h-3.5 text-orange-500 rounded border-white/20 bg-white/5 focus:ring-orange-500"
              />
              <span className="text-[9px] font-black">
                {getTranslation('anonymous', language)}
              </span>
            </label>

            <button
              type="submit"
              disabled={isAiLoading || !askQuery.trim()}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all disabled:opacity-50 flex items-center gap-1.5"
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
              className="mt-4 bg-white rounded-xl p-3.5 border border-indigo-100 flex flex-col gap-2 shadow-inner text-gray-800"
              id="ai-response-memo-box"
            >
              <div className="flex justify-between items-center text-[9px] font-black text-gray-400 border-b border-gray-100 pb-1.5 uppercase tracking-wider">
                <span className="flex items-center gap-1 text-indigo-600">
                  <Clock className="w-3.5 h-3.5" /> {getTranslation('verifiedSolution', language)}
                </span>
                <span>Response v3.5-flash</span>
              </div>
              <p className="text-xs font-semibold text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                {aiResponse}
              </p>
              <button
                onClick={() => {
                  setAskQuery('');
                  setAiResponse(null);
                }}
                className="text-[10px] font-black text-center text-orange-600 mt-2 hover:bg-orange-50 py-1.5 rounded bg-orange-50/20 cursor-pointer border border-orange-100/30 w-full"
              >
                {getTranslation('clearMemo', language)}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. COMMUNITY DISCUSSION INTERACTIVE SECTION */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3.5 mb-5 shadow-sm" id="community-ask-form-wrapper">
        {notiMessage && (
          <div className="bg-emerald-50 text-emerald-700 text-xs font-bold p-2.5 rounded-xl border border-emerald-100 mb-3 flex items-center gap-1.5">
            <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
            <span>{notiMessage}</span>
          </div>
        )}

        <h3 className="text-xs font-black text-gray-900 tracking-tight mb-2 flex items-center gap-1">
          <MessagesSquare className="w-4 h-4 text-orange-500" /> {getTranslation('classmateCommTitle', language)}
        </h3>
        <p className="text-[10px] text-gray-400 font-bold mb-3">
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
            className="w-full text-xs font-medium text-gray-800 bg-gray-50 border border-gray-100 rounded-xl p-3.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
          />

          <div className="flex items-center justify-between">
            {/* Anonymous Toggle for Community */}
            <label className="flex items-center gap-1.5 cursor-pointer text-gray-500" id="community-anonymous-check">
              <input
                type="checkbox"
                checked={anonymousCommunity}
                onChange={e => setAnonymousCommunity(e.target.checked)}
                className="w-3.5 h-3.5 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
              />
              <span className="text-[9px] font-bold">
                {getTranslation('anonymous', language)}
              </span>
            </label>

            <button
              type="submit"
              disabled={!communityQuery.trim()}
              className="px-3.5 py-1.8 bg-gray-900 text-white hover:bg-gray-800 text-xs font-bold rounded-xl shadow cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{getTranslation('askCommunityBtn', language)}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. ACTIVE QUESTIONS LIST FOR GENERAL BENEFIT */}
      <div id="student-discussions-header" className="mb-3">
        <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1">
          💬 {getTranslation('activeDiscussionsTitle', language)} ({questionItems.length})
        </h3>
      </div>

      <div className="flex flex-col gap-1" id="active-questions-posts-list">
        {questionItems.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white border border-gray-100 rounded-3xl p-6">
            <div className="text-3xl mb-2">🔭</div>
            <h3 className="font-bold text-gray-700 text-xs">{getTranslation('noDiscussions', language)}</h3>
            <p className="text-[10px] text-gray-400 max-w-xs mt-1 mx-auto">
              {language === 'ar' ? 'غير عوامل التصفية وابحث من جديد.' : language === 'ku' ? 'فلتەرەکە بگۆڕە و دووبارە بگەڕێ.' : 'Change selectors and search again.'}
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

import React, { useState } from 'react';
import { FeedItem, UserProfile, Language } from '../types';
import { getTranslation } from '../data/translations';
import { IraqiUniversities, IraqiGovernorates } from '../data/mockData';
import { Award, Bookmark, ArrowRightLeft, Briefcase, GraduationCap, Calendar, Users, Star, Grid } from 'lucide-react';
import { motion } from 'motion/react';
import FeedCard from './FeedCard';

interface ProfileViewProps {
  user: UserProfile;
  feedItems: FeedItem[];
  language: Language;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onVote: (itemId: string, optionId: string) => void;
  onApply: (id: string) => void;
  onRsvp: (id: string) => void;
  onJoinGroup: (id: string) => void;
  onAddComment: (id: string, commentText: string) => void;
  onToggleUserRole: () => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  onTriggerAuth: () => void;
  onNavigateAdmin?: () => void;
  onEditFeedItem?: (id: string, updatedFields: Partial<FeedItem>) => void;
  onDeleteFeedItem?: (id: string) => void;
  isAdminMode?: boolean;
}

export default function ProfileView({
  user,
  feedItems,
  language,
  onLike,
  onSave,
  onVote,
  onApply,
  onRsvp,
  onJoinGroup,
  onAddComment,
  onToggleUserRole,
  isLoggedIn,
  onLogout,
  onTriggerAuth,
  onNavigateAdmin,
  onEditFeedItem,
  onDeleteFeedItem,
  isAdminMode = false
}: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'activities'>('bookmarks');

  // Load university & governorate labels
  const userUni = IraqiUniversities.find(u => u.id === user.universityId);
  const userGov = IraqiGovernorates.find(g => g.id === user.governorateId);

  const uniName = userUni 
    ? (language === 'ar' ? userUni.nameAR : language === 'ku' ? userUni.nameKU : userUni.nameEN) 
    : 'Iraqi University';
  const govName = userGov 
    ? (language === 'ar' ? userGov.nameAR : language === 'ku' ? userGov.nameKU : userGov.nameEN) 
    : 'Iraq';

  const bio = language === 'ar' ? user.bioAR : language === 'ku' ? user.bioKU : user.bioEN;
  const major = language === 'ar' ? user.majorAR : language === 'ku' ? user.majorKU : user.majorEN;

  // Bookmarked / Saved Items selector
  const bookmarkedItems = feedItems.filter(item => item.savedByUser);

  // Active student engagements (applied jobs, joined groups, rsvped events)
  const activeEngagements = feedItems.filter(item => {
    return item.applied || item.eventRsvped || item.joined;
  });

  if (!isLoggedIn) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto flex flex-col pb-28 bg-[#0B1020] min-h-[70vh] justify-center items-center" id="profile-view-container">
        <div className="bg-gradient-to-b from-[#121B2E] to-[#0E1726]/60 border border-[#1F2E4D] rounded-3xl p-6.5 shadow-xl text-center w-full relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-[#2563EB] to-[#4F46E5]" />
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-[#1F2E4D] flex items-center justify-center text-3xl mb-4 shadow-inner">
            👤
          </div>
          
          <h2 className="text-base font-black text-white px-2 leading-tight">
            {language === 'ar' ? 'بوابة الطالب الأكاديمية' : language === 'ku' ? 'دەروازەی ئەکادیمی خوێندکاران' : 'Academic Student Portal'}
          </h2>
          
          <p className="text-xs font-semibold text-slate-300 leading-relaxed mt-3 max-w-xs mx-auto">
            {language === 'ar' 
              ? 'سجل دخولك الآن لتتبع نقاط تفاعلك لمساعدة زملائك، حفظ ومراجعة ملازم الدراسة، التقديم لوظائف الخريجين، واستشارة مساعد الذكاء الاصطناعي "المرشد"!' 
              : language === 'ku'
              ? 'ئێستا بچۆ ژوورەوە بۆ پاشەکەوتکردنی بابەتەکانی خوێندن، پێشکەشکردنی داواکاری بۆ هەلی کار، و ڕاوێژکردن لەگەڵ ڕێبەری زیرەکی دەستکرد!'
              : 'Sign in to access advanced features: rack up academic interaction points by helping your peers, save and bookmark lectures, apply directly to tech opportunities, and unlock our AI advisor Al-Murshed!'}
          </p>

          <button
            onClick={onTriggerAuth}
            className="w-full mt-6 py-3 bg-gradient-to-r from-[#4F46E5] via-[#2563EB] to-[#06B6D4] hover:scale-[1.01] active:scale-95 text-xs font-black text-white hover:shadow-glow-cyan/5 border border-white/5 cursor-pointer rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5"
            id="guest-signin-btn"
          >
            {language === 'ar' ? 'تسجيل الدخول / إنشاء حساب' : language === 'ku' ? 'چوونەژوورەوە / دروستکردنی هەژمار' : 'Sign In / Create Account'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 max-w-lg mx-auto flex flex-col pb-24 bg-[#0B1020]" id="profile-view-container">
      
      {/* Profile Header Cards */}
      <div className="bg-[#121B2E] border border-[#1F2E4D] rounded-3xl p-5 shadow-lg text-center mb-5 relative overflow-hidden" id="profile-card-header">
        
        {/* Absolute header pattern color depending on role */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-[#4F46E5] via-[#2563EB] to-cyan-500 -z-10 opacity-75" />

        {/* Profile Details */}
        <div className="mt-6 flex flex-col items-center">
          <div className="relative">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-20 h-20 rounded-2xl object-cover border-4 border-[#121B2E] shadow-xl"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 bg-cyan-500 text-slate-900 text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#121B2E] shadow-md">
              L{user.level}
            </span>
          </div>

          <h2 className="text-base font-black text-white mt-3 flex items-center gap-1.5 leading-none">
            {user.name}
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </h2>

          <p className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-400/25 font-black px-2.5 py-0.5 rounded-lg uppercase mt-2.5 leading-none w-max">
            {getTranslation('eliteStudent', language)}
          </p>

          <div className="flex flex-col gap-1 text-center text-slate-400 font-bold text-[10px] mt-3">
            <span className="text-slate-100 flex items-center justify-center gap-1">
              🎓 {uniName}
            </span>
            <span className="flex items-center justify-center gap-1">
              📍 {govName} • {major}
            </span>
          </div>

          {/* Interactive Role Toggle & Logout Options */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5" id="profile-actions-row">
            {onNavigateAdmin && (
              <button
                onClick={onNavigateAdmin}
                className="text-[9px] font-black text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 rounded-xl px-3 py-1.5 cursor-pointer transition-all flex items-center gap-1.5"
                id="navigateToAdminLink"
              >
                <span>🕵️‍♀️</span>
                <span>{language === 'ar' ? 'بوابة التشغيل والأتمتة' : language === 'ku' ? 'سیستەمی کۆنترۆڵ' : 'Scraper Console'}</span>
              </button>
            )}
            <button
              onClick={onToggleUserRole}
              className="text-[9px] font-black text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/20 rounded-xl px-3 py-1.5 cursor-pointer transition-all flex items-center gap-1"
            >
              <ArrowRightLeft className="w-3 h-3 text-cyan-400" />
              <span>{getTranslation('switchRoleBtn', language)}</span>
            </button>
            <button
              onClick={onLogout}
              className="text-[9px] font-black text-red-400 bg-red-400/10 hover:bg-red-400/20 border border-red-500/10 rounded-xl px-3 py-1.5 cursor-pointer transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>{language === 'ar' ? 'تسجيل الخروج' : language === 'ku' ? 'چوونەدەرەوە' : 'Log Out'}</span>
            </button>
          </div>
        </div>

        {/* Bio segment */}
        <div className="mt-4 border-t border-[#1F2E4D] pt-3 text-xs text-slate-200 font-semibold leading-relaxed max-w-sm mx-auto">
          "{bio}"
        </div>

        {/* Gamified stats panel */}
        <div className="grid grid-cols-2 gap-3 mt-4.5 pt-3.5 border-t border-[#1F2E4D]">
          <div className="bg-[#16223F] p-3 rounded-2xl border border-cyan-500/15 text-center shadow-inner">
            <span className="text-[9px] font-black uppercase text-cyan-400 tracking-wider block">
              {getTranslation('pointsBadge', language)}
            </span>
            <span className="text-lg font-black text-white mt-1 block leading-none">
              {user.points}
            </span>
          </div>

          <div className="bg-[#16223F] p-3 rounded-2xl border border-indigo-505/15 text-center shadow-inner">
            <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider block">
              {getTranslation('levelLabel', language)}
            </span>
            <span className="text-lg font-black text-white mt-1 block leading-none">
              {user.level}
            </span>
          </div>
        </div>

        {/* Quick points description banner */}
        <div className="mt-4 p-2.5 bg-[#101726]/60 border border-[#1F2E4D] text-[10px] text-slate-300 rounded-xl font-bold flex items-center gap-1.5 text-left leading-snug">
          <Star className="w-4 h-4 text-yellow-450 shrink-0 fill-current text-yellow-400" />
          <span>{getTranslation('gamificationTip', language)}</span>
        </div>

      </div>

      {/* Selector Tabs: Bookmarked, Applied activities */}
      <div className="flex border-b border-[#1F2E4D] mb-4 mt-1" id="profile-saved-tabs">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex-1 py-2.5 text-xs font-black transition-all border-b-2 text-center cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'bookmarks'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>{getTranslation('savedPostsTab', language)} ({bookmarkedItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('activities')}
          className={`flex-1 py-2.5 text-xs font-black transition-all border-b-2 text-center cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'activities'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>{getTranslation('myAppsTab', language)} ({activeEngagements.length})</span>
        </button>
      </div>

      {/* Tabs list loops */}
      <div className="flex flex-col gap-1" id="profile-tabs-content">
        {activeTab === 'bookmarks' ? (
          bookmarkedItems.length === 0 ? (
            <div className="text-center py-10 bg-[#121B2E] border border-[#1F2E4D] rounded-2xl p-4 text-slate-450 text-xs">
              <div className="text-2xl mb-1.5">🔖</div>
              <h4 className="font-extrabold text-white">{getTranslation('bookmarksEmptyTitle', language)}</h4>
              <p className="text-[10px] text-slate-450 mt-1 max-w-[200px] mx-auto leading-normal">{getTranslation('bookmarksEmptyDesc', language)}</p>
            </div>
          ) : (
            bookmarkedItems.map(item => (
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
                onEditFeedItem={onEditFeedItem}
                onDeleteFeedItem={onDeleteFeedItem}
                isAdminMode={isAdminMode}
              />
            ))
          )
        ) : (
          activeEngagements.length === 0 ? (
            <div className="text-center py-10 bg-[#121B2E] border border-[#1F2E4D] rounded-2xl p-4 text-slate-450 text-xs">
              <div className="text-2xl mb-1.5">💼</div>
              <h4 className="font-extrabold text-white">{getTranslation('entriesEmptyTitle', language)}</h4>
              <p className="text-[10px] text-slate-450 mt-1 max-w-[200px] mx-auto leading-normal">{getTranslation('entriesEmptyDesc', language)}</p>
            </div>
          ) : (
            activeEngagements.map(item => (
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
                onEditFeedItem={onEditFeedItem}
                onDeleteFeedItem={onDeleteFeedItem}
                isAdminMode={isAdminMode}
              />
            ))
          )
        )}
      </div>

    </div>
  );
}

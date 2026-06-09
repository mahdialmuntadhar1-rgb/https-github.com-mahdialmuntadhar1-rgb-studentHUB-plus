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
  onToggleUserRole
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

  return (
    <div className="px-4 py-3 max-w-lg mx-auto flex flex-col pb-24" id="profile-view-container">
      
      {/* Profile Header Cards */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm text-center mb-5 relative overflow-hidden" id="profile-card-header">
        
        {/* Absolute header pattern color depending on role */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-orange-500 via-indigo-600 to-indigo-800 -z-10" />

        {/* Profile Details */}
        <div className="mt-6 flex flex-col items-center">
          <div className="relative">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 bg-orange-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
              L{user.level}
            </span>
          </div>

          <h2 className="text-base font-black text-gray-900 mt-2.5 flex items-center gap-1">
            {user.name}
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </h2>

          <p className="text-[10px] bg-orange-50 text-orange-600 border border-orange-100 font-extrabold px-2.5 py-0.5 rounded-lg uppercase mt-1 leading-none w-max">
            {getTranslation('eliteStudent', language)}
          </p>

          <div className="flex flex-col gap-0.5 text-center text-gray-400 font-bold text-[10px] mt-2">
            <span className="text-gray-800 flex items-center justify-center gap-1">
              🎓 {uniName}
            </span>
            <span className="flex items-center justify-center gap-1">
              📍 {govName} • {major}
            </span>
          </div>

          {/* Interactive Role Toggle as requested to simulate teachers/graduates */}
          <button
            onClick={onToggleUserRole}
            className="mt-3 text-[9px] font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/50 rounded-xl px-3 py-1.5 cursor-pointer transition-colors flex items-center gap-1"
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span>{getTranslation('switchRoleBtn', language)}</span>
          </button>
        </div>

        {/* Bio segment */}
        <div className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-600 font-medium leading-relaxed max-w-sm mx-auto">
          "{bio}"
        </div>

        {/* Gamified stats panel */}
        <div className="grid grid-cols-2 gap-2 mt-4.5 pt-3 border-t border-gray-100">
          <div className="bg-orange-50/50 p-2.5 rounded-2xl border border-orange-100/50 text-center">
            <span className="text-[9px] font-black uppercase text-orange-500 tracking-wider block">
              {getTranslation('pointsBadge', language)}
            </span>
            <span className="text-lg font-black text-orange-950 mt-0.5 block">
              {user.points}
            </span>
          </div>

          <div className="bg-indigo-50/50 p-2.5 rounded-2xl border border-indigo-100/50 text-center">
            <span className="text-[9px] font-black uppercase text-indigo-600 tracking-wider block">
              {getTranslation('levelLabel', language)}
            </span>
            <span className="text-lg font-black text-indigo-950 mt-0.5 block">
              {user.level}
            </span>
          </div>
        </div>

        {/* Quick points description banner */}
        <div className="mt-4 p-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-100 text-[10px] text-gray-500 rounded-xl font-bold flex items-center gap-1 text-left">
          <Star className="w-4 h-4 text-orange-400 shrink-0 fill-current" />
          <span>{getTranslation('gamificationTip', language)}</span>
        </div>

      </div>

      {/* Selector Tabs: Bookmarked, Applied activities */}
      <div className="flex border-b border-gray-150 mb-4" id="profile-saved-tabs">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex-1 py-2.5 text-xs font-black transition-all border-b-2 text-center cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'bookmarks'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>{getTranslation('savedPostsTab', language)} ({bookmarkedItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('activities')}
          className={`flex-1 py-2.5 text-xs font-black transition-all border-b-2 text-center cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'activities'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
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
            <div className="text-center py-10 bg-white border border-gray-100 rounded-2xl p-4 text-gray-400 text-xs">
              <div className="text-2xl mb-1.5">🔖</div>
              <h4 className="font-extrabold text-gray-700">{getTranslation('bookmarksEmptyTitle', language)}</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">{getTranslation('bookmarksEmptyDesc', language)}</p>
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
              />
            ))
          )
        ) : (
          activeEngagements.length === 0 ? (
            <div className="text-center py-10 bg-white border border-gray-100 rounded-2xl p-4 text-gray-400 text-xs text-center">
              <div className="text-2xl mb-1.5">💼</div>
              <h4 className="font-extrabold text-gray-700">{getTranslation('entriesEmptyTitle', language)}</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">{getTranslation('entriesEmptyDesc', language)}</p>
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
              />
            ))
          )
        )}
      </div>

    </div>
  );
}

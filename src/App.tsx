import React, { useState, useEffect } from 'react';
import { Language, FeedItem, UserProfile, Comment } from './types';
import { initialFeedItems, defaultUserProfile, IraqiUniversities, IraqiGovernorates } from './data/mockData';
import { getTranslation } from './data/translations';
import Header from './components/Header';
import HomeFeed from './components/HomeFeed';
import LifeFeed from './components/LifeFeed';
import FutureFeed from './components/FutureFeed';
import AskFeed from './components/AskFeed';
import ProfileView from './components/ProfileView';
import AuthModal from './components/AuthModal';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Sparkles, HelpCircle, Briefcase, User, Compass, Info, FileText } from 'lucide-react';

export default function App() {
  // Locale States
  const [language, setLanguage] = useState<Language>('en');
  const [selectedGov, setSelectedGov] = useState<string>('all');
  const [selectedUni, setSelectedUni] = useState<string>('all');

  // Toast notifications manager state
  interface ToastMessage {
    id: string;
    text: string;
    type: 'success' | 'error' | 'info';
    icon?: string;
  }
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success', icon?: string) => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, text, type, icon }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'home' | 'life' | 'ask' | 'future' | 'profile'>('home');

  // Brief dynamic feed loading skeleton simulator
  const [isFeedLoading, setIsFeedLoading] = useState(false);

  useEffect(() => {
    setIsFeedLoading(true);
    const t = setTimeout(() => setIsFeedLoading(false), 450);
    return () => clearTimeout(t);
  }, [selectedGov, selectedUni, activeTab]);

  // Auth States
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => localStorage.getItem('jamiaati_logged_in') !== 'false');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Feed database state (persisted in session / local storage for active play)
  const [feedItems, setFeedItems] = useState<FeedItem[]>(() => {
    const saved = localStorage.getItem('jamiaati_feed_v2');
    return saved ? JSON.parse(saved) : initialFeedItems;
  });

  // User profile state (gamification & badges tracker)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('jamiaati_profile_v2');
    return saved ? JSON.parse(saved) : defaultUserProfile;
  });

  // Sync to local states
  useEffect(() => {
    localStorage.setItem('jamiaati_feed_v2', JSON.stringify(feedItems));
  }, [feedItems]);

  useEffect(() => {
    localStorage.setItem('jamiaati_profile_v2', JSON.stringify(userProfile));
  }, [userProfile]);

  // Adjust application alignment automatically based on language direction
  const isRTL = language === 'ar' || language === 'ku';

  // State modification events
  const handleLike = (id: string) => {
    let triggeredToast = false;
    setFeedItems(prev => prev.map(item => {
      if (item.id === id) {
        const isLiked = !item.likedByUser;
        if (!triggeredToast) {
          triggeredToast = true;
          if (isLiked) {
            handleAwardPoints(5);
            showToast(
              language === 'ar' ? 'تم الإعجاب بالمنشور! ❤️ +٥ نقاط تفاعل' : language === 'ku' ? 'دڵخواز بوو! ❤️ +٥ خاڵی کارلێک' : 'Post Liked! ❤️ +5 pts', 
              'success'
            );
          } else {
            showToast(
              language === 'ar' ? 'تم إلغاء الإعجاب بالمنشور' : language === 'ku' ? 'لادانی دڵخواز لە بابەتەکە' : 'Removed like from post', 
              'info'
            );
          }
        }
        return {
          ...item,
          likes: isLiked ? item.likes + 1 : item.likes - 1,
          likedByUser: isLiked
        };
      }
      return item;
    }));
  };

  const handleSave = (id: string) => {
    let triggeredToast = false;
    setFeedItems(prev => prev.map(item => {
      if (item.id === id) {
        const isSaved = !item.savedByUser;
        if (!triggeredToast) {
          triggeredToast = true;
          if (isSaved) {
            handleAwardPoints(10);
            showToast(
              language === 'ar' ? 'تم الحفظ في المحفظة الأكاديمية! 🔖 +١٠ نقاط' : language === 'ku' ? 'پاشەکەوتکرا لە جزدانی ئەکادیمی! 🔖 +١٠ خاڵ' : 'Saved to Hub Library! 🔖 +10 pts', 
              'success'
            );
          } else {
            showToast(
              language === 'ar' ? 'تمت الإزالة من المفضلة الأكاديمية' : language === 'ku' ? 'لادانی لە پاشەکەوتکراوەکان' : 'Removed bookmark', 
              'info'
            );
          }
        }
        return {
          ...item,
          savedByUser: isSaved
        };
      }
      return item;
    }));
  };

  const handleVote = (itemId: string, optionId: string) => {
    let triggeredToast = false;
    setFeedItems(prev => prev.map(item => {
      if (item.id === itemId && item.pollOptions) {
        // Prevent voting if already voted
        if (item.pollVotedId) return item;

        if (!triggeredToast) {
          triggeredToast = true;
          handleAwardPoints(25); // high reward for sharing feedback
          showToast(
            language === 'ar' ? 'تم تسجيل رأيك الطلابي بنجاح! 📊 +٢٥ نقطة مساهمة' : language === 'ku' ? 'دەنگەکەت بە سەرکەوتوویی تۆمارکرا! 📊 +٢٥ خاڵ' : 'Feedback vote recorded! 📊 +25 pts', 
            'success'
          );
        }

        return {
          ...item,
          pollVotedId: optionId,
          pollOptions: item.pollOptions.map(opt => {
            if (opt.id === optionId) {
              return { ...opt, votes: opt.votes + 1 };
            }
            return opt;
          })
        };
      }
      return item;
    }));
  };

  const handleApply = (id: string) => {
    let triggeredToast = false;
    setFeedItems(prev => prev.map(item => {
      if (item.id === id) {
        const isApplied = !item.applied;
        if (!triggeredToast) {
          triggeredToast = true;
          if (isApplied) {
            handleAwardPoints(50); // Massive career action reward!
            showToast(
              language === 'ar' ? 'تم تسجيل طلب التقديم للفرصة بنجاح! 💼 +٥٠ نقطة تواصل مهني' : language === 'ku' ? 'پێشکەشکردنی داواکاری کارەکەت سەرکەوتوو بوو! 💼 +٥٠ خاڵی پیشەیی' : 'Application registered successfully! 💼 +50 Career pts', 
              'success'
            );
          } else {
            showToast(
              language === 'ar' ? 'تم إلغاء تقديم الطلب بنجاح' : language === 'ku' ? 'داواکاریەکەت هەڵوەشێنرایەوە' : 'Cancelled application request', 
              'info'
            );
          }
        }
        return {
          ...item,
          applied: isApplied
        };
      }
      return item;
    }));
  };

  const handleRsvp = (id: string) => {
    let triggeredToast = false;
    setFeedItems(prev => prev.map(item => {
      if (item.id === id) {
        const isRsvped = !item.eventRsvped;
        if (!triggeredToast) {
          triggeredToast = true;
          if (isRsvped) {
            handleAwardPoints(30);
            showToast(
              language === 'ar' ? 'تم حجز تذكرتك الأكاديمية بنجاح! 🎟️ +٣٠ نقطة تفاعل' : language === 'ku' ? 'کورسیەکەت گیرا بۆ مەراسیمەکە! 🎟️ +٣٠ خاڵ' : 'Access ticket reserved! 🎟️ +30 pts', 
              'success'
            );
          } else {
            showToast(
              language === 'ar' ? 'تم إلغاء تأكيد حضور الفعالية' : language === 'ku' ? 'هەڵوەشاندنەوەی حیجزی مەراسیمەکە' : 'Reservation cancelled', 
              'info'
            );
          }
        }
        return {
          ...item,
          eventRsvped: isRsvped,
          eventRsvpCount: isRsvped ? (item.eventRsvpCount || 0) + 1 : (item.eventRsvpCount || 1) - 1
        };
      }
      return item;
    }));
  };

  const handleJoinGroup = (id: string) => {
    let triggeredToast = false;
    setFeedItems(prev => prev.map(item => {
      if (item.id === id) {
        const isJoined = !item.joined;
        if (!triggeredToast) {
          triggeredToast = true;
          if (isJoined) {
            handleAwardPoints(30);
            showToast(
              language === 'ar' ? 'انضممت لمجموعة المراجعة! 👥 +٣٠ نقطة دراسية' : language === 'ku' ? 'پەیوەست بوویت بە گروپی گفتوگۆکە! 👥 +٣٠ خاڵی مراجعە' : 'Joined study circle! 👥 +30 Study pts', 
              'success'
            );
          } else {
            showToast(
              language === 'ar' ? 'غادرت مجموعة الصداقة والمراجعة' : language === 'ku' ? 'جێهێشتنی بازنەی خوێندنەکە' : 'Left study circle', 
              'info'
            );
          }
        }
        return {
          ...item,
          joined: isJoined,
          memberCount: isJoined ? (item.memberCount || 3) + 1 : (item.memberCount || 4) - 1
        };
      }
      return item;
    }));
  };

  const handleAddComment = (itemId: string, content: string) => {
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      authorName: userProfile.name,
      authorRole: userProfile.role,
      authorAvatar: userProfile.avatar,
      content,
      date: 'Just now'
    };

    handleAwardPoints(15); // reward commenting and discussion
    showToast(
      language === 'ar' ? 'تم نشر تعليقك الأكاديمي بنجاح! 💬 +١٥ نقطة مراجع' : language === 'ku' ? 'وەڵامەکەت بڵاوکرایەوە بە سەرکەوتوویی! 💬 +١٥ خاڵ' : 'Academic comment posted! 💬 +15 pts', 
      'success'
    );

    setFeedItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          commentsCount: item.commentsCount + 1,
          commentsList: [...item.commentsList, newComment]
        };
      }
      return item;
    }));
  };

  const handleAddNewPost = (title: string, body: string, anonymous: boolean, customType = 'post') => {
    const freshPost: FeedItem = {
      id: `custom-${Date.now()}`,
      type: customType as any,
      titleEN: title,
      titleAR: title,
      titleKU: title,
      contentEN: body,
      contentAR: body,
      contentKU: body,
      author: anonymous ? {
        name: 'Anonymous Student',
        role: 'student',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'
      } : {
        name: userProfile.name,
        role: userProfile.role,
        avatar: userProfile.avatar,
        university: IraqiUniversities.find(u => u.id === userProfile.universityId)?.nameEN
      },
      date: 'Just now',
      likes: 1,
      commentsCount: 0,
      commentsList: [],
      likedByUser: true,
      governorateId: selectedGov === 'all' ? userProfile.governorateId : selectedGov,
      universityId: selectedUni === 'all' ? userProfile.universityId : selectedUni,
      tags: ['StudentShare', customType === 'anonymous_question' ? 'Advising' : 'Life']
    };

    handleAwardPoints(40); // high points for sharing posts!
    showToast(
      language === 'ar' ? 'تم نشر مساهمتك بنجاح على ساحة الطلاب! ✨ +٤٠ نقطة' : language === 'ku' ? 'بڵاوکراوەکەت بڵاوکرایەوە لە ساحەی قوتابیان! ✨ +٤٠ خاڵ' : 'Contribution published successfully! ✨ +40 pts', 
      'success'
    );
    setFeedItems(prev => [freshPost, ...prev]);
  };

  // Gamification engine helpers
  const handleAwardPoints = (qty: number) => {
    setUserProfile(prev => {
      const nextPoints = prev.points + qty;
      const nextLevel = Math.floor(nextPoints / 150) + 1; // 150 points per level
      return {
        ...prev,
        points: nextPoints,
        level: nextLevel > prev.level ? nextLevel : prev.level
      };
    });
  };

  // Simulating user switches Roles inside their profile
  const handleRoleToggle = () => {
    const roles: ('student' | 'graduate' | 'teacher' | 'staff')[] = ['student', 'graduate', 'teacher', 'staff'];
    const currentIdx = roles.indexOf(userProfile.role as any);
    const nextIdx = (currentIdx + 1) % roles.length;
    const nextRole = roles[nextIdx];

    setUserProfile(prev => ({
      ...prev,
      role: nextRole,
      name: nextRole === 'teacher' ? 'Dr. Yousif Al-Hamadani' : nextRole === 'staff' ? 'Admin Layla' : defaultUserProfile.name,
      avatar: nextRole === 'teacher' 
        ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200' 
        : nextRole === 'staff' 
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
        : defaultUserProfile.avatar
    }));
  };

  // Absolute central filtering query based on Governorate and university selections
  const matchesGovAndUni = (item: FeedItem) => {
    // Standard feed filtering rules: matches selected filters OR contains standard global scope tags
    const itemGov = item.governorateId;
    const itemUni = item.universityId;

    const matchesGov = selectedGov === 'all' || !itemGov || itemGov === 'all' || itemGov === selectedGov;
    const matchesUni = selectedUni === 'all' || !itemUni || itemUni === 'all' || itemUni === selectedUni;
    
    return matchesGov && matchesUni;
  };

  const filteredFeedItems = feedItems.filter(matchesGovAndUni);

  // Active filter helper callbacks
  const handleShowAllLife = () => {
    // Reset filters and swap tab to main feed
    setSelectedGov('all');
    setSelectedUni('all');
    setActiveTab('home');
  };

  const handleBackToHomeFuture = () => {
    setSelectedGov('all');
    setSelectedUni('all');
    setActiveTab('home');
  };

  // Router dispatcher
  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeFeed
            feedItems={filteredFeedItems}
            language={language}
            selectedGov={selectedGov}
            selectedUni={selectedUni}
            onLike={handleLike}
            onSave={handleSave}
            onVote={handleVote}
            onApply={handleApply}
            onRsvp={handleRsvp}
            onJoinGroup={handleJoinGroup}
            onAddComment={handleAddComment}
            onNavigateTab={setActiveTab}
            onAddNewPost={handleAddNewPost}
            isFeedLoading={isFeedLoading}
          />
        );
      case 'life':
        return (
          <LifeFeed
            feedItems={filteredFeedItems}
            language={language}
            selectedGov={selectedGov}
            selectedUni={selectedUni}
            onLike={handleLike}
            onSave={handleSave}
            onVote={handleVote}
            onApply={handleApply}
            onRsvp={handleRsvp}
            onJoinGroup={handleJoinGroup}
            onAddComment={handleAddComment}
            onShowAll={handleShowAllLife}
            isFeedLoading={isFeedLoading}
          />
        );
      case 'ask':
        return (
          <AskFeed
            feedItems={filteredFeedItems}
            language={language}
            selectedGov={selectedGov}
            selectedUni={selectedUni}
            onLike={handleLike}
            onSave={handleSave}
            onVote={handleVote}
            onApply={handleApply}
            onRsvp={handleRsvp}
            onJoinGroup={handleJoinGroup}
            onAddComment={handleAddComment}
            onAddNewPost={handleAddNewPost}
            isFeedLoading={isFeedLoading}
          />
        );
      case 'future':
        return (
          <FutureFeed
            feedItems={filteredFeedItems}
            language={language}
            selectedGov={selectedGov}
            selectedUni={selectedUni}
            onLike={handleLike}
            onSave={handleSave}
            onVote={handleVote}
            onApply={handleApply}
            onRsvp={handleRsvp}
            onJoinGroup={handleJoinGroup}
            onAddComment={handleAddComment}
            onBackToHome={handleBackToHomeFuture}
            isFeedLoading={isFeedLoading}
          />
        );
      case 'profile':
        return (
          <ProfileView
            user={userProfile}
            feedItems={feedItems}
            language={language}
            onLike={handleLike}
            onSave={handleSave}
            onVote={handleVote}
            onApply={handleApply}
            onRsvp={handleRsvp}
            onJoinGroup={handleJoinGroup}
            onAddComment={handleAddComment}
            onToggleUserRole={handleRoleToggle}
            isLoggedIn={isLoggedIn}
            onLogout={() => {
              setIsLoggedIn(false);
              localStorage.setItem('jamiaati_logged_in', 'false');
              showToast(
                language === 'ar' ? 'تم تسجيل خروجك بنجاح. نراك قريباً! 👋' : language === 'ku' ? 'خۆتۆمارکردنەکەت کۆتایی پێهات. بە هیوای دیدار! 👋' : 'Logged out successfully. See you! 👋', 
                'info'
              );
            }}
            onTriggerAuth={() => setIsAuthModalOpen(true)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div id="jamiaati-portal" className="bg-[#040814] min-h-screen text-slate-900 dark:text-slate-100 antialiased font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Centered device presentation mock */}
      <div className="w-full max-w-md mx-auto min-h-screen bg-[#0B1020] shadow-2xl shadow-black/8 w-full relative flex flex-col border-x border-[#1F2E4D]">
        
        {/* Top Header Selector Component */}
        <Header
          selectedGov={selectedGov}
          setSelectedGov={setSelectedGov}
          selectedUni={selectedUni}
          setSelectedUni={setSelectedUni}
          language={language}
          setLanguage={setLanguage}
          currentUserAvatar={userProfile.avatar}
          onProfileClick={() => setActiveTab('profile')}
        />

        {/* Dynamic Inner views container */}
        <main className="flex-1 overflow-y-auto bg-[#0B1020]">
          {renderActiveView()}
        </main>

        {/* Bottom Persistent Navigation Bar: Visible at all times */}
        <nav 
          id="persistent-bottom-navbar"
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#0B1020]/95 border-t border-[#1F2E4D] px-2 py-3.5 flex justify-around items-center backdrop-blur-md z-40 shadow-2xl shadow-cyan-950/20 pointer-events-auto"
        >
          {/* TAB 1: Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1.5 py-1 px-3 rounded-2xl cursor-pointer transition-all duration-200 relative ${
              activeTab === 'home' 
                ? 'text-cyan-400 font-extrabold scale-105' 
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/10'
            }`}
          >
            <Home className="w-5 h-5 shrink-0" />
            <span className="text-[10px] leading-none font-bold">{getTranslation('navHome', language)}</span>
            {activeTab === 'home' && (
              <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-cyan-400 shadow-glow-cyan" />
            )}
          </button>

          {/* TAB 2: Life (Fun/Social) */}
          <button
            onClick={() => setActiveTab('life')}
            className={`flex flex-col items-center gap-1.5 py-1 px-3 rounded-2xl cursor-pointer transition-all duration-200 relative ${
              activeTab === 'life' 
                ? 'text-cyan-400 font-extrabold scale-105' 
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/10'
            }`}
          >
            <Compass className="w-5 h-5 shrink-0" />
            <span className="text-[10px] leading-none font-bold">{getTranslation('navLife', language)}</span>
            {activeTab === 'life' && (
              <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-cyan-400 shadow-glow-cyan" />
            )}
          </button>

          {/* TAB 3: Ask (AI & Discussions) */}
          <button
            onClick={() => setActiveTab('ask')}
            className={`flex flex-col items-center gap-1.5 py-1 px-3 rounded-2xl cursor-pointer transition-all duration-200 relative ${
              activeTab === 'ask' 
                ? 'text-cyan-400 font-extrabold scale-105' 
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/10'
            }`}
          >
            <HelpCircle className="w-5 h-5 shrink-0" />
            <span className="text-[10px] leading-none font-bold">{getTranslation('navAsk', language)}</span>
            {activeTab === 'ask' && (
              <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-cyan-400 shadow-glow-cyan" />
            )}
          </button>

          {/* TAB 4: Future (Careers & Board) */}
          <button
            onClick={() => setActiveTab('future')}
            className={`flex flex-col items-center gap-1.5 py-1 px-3 rounded-2xl cursor-pointer transition-all duration-200 relative ${
              activeTab === 'future' 
                ? 'text-cyan-400 font-extrabold scale-105' 
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/10'
            }`}
          >
            <Briefcase className="w-5 h-5 shrink-0" />
            <span className="text-[10px] leading-none font-bold">{getTranslation('navFuture', language)}</span>
            {activeTab === 'future' && (
              <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-cyan-400 shadow-glow-cyan" />
            )}
          </button>

          {/* TAB 5: Profile */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1.5 py-1 px-3 rounded-2xl cursor-pointer transition-all duration-200 relative ${
              activeTab === 'profile' 
                ? 'text-cyan-400 font-extrabold scale-105' 
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/10'
            }`}
          >
            <User className="w-5 h-5 shrink-0" />
            <span className="text-[10px] leading-none font-bold">{getTranslation('navProfile', language)}</span>
            {activeTab === 'profile' && (
              <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-cyan-400 shadow-glow-cyan" />
            )}
          </button>
        </nav>

        {/* Global Auth Modal Portal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          language={language}
          onAuthSuccess={(newUsername) => {
            setIsLoggedIn(true);
            localStorage.setItem('jamiaati_logged_in', 'true');
            setUserProfile(prev => ({
              ...prev,
              name: newUsername || 'Zara Al-Iraqi'
            }));
            showToast(
              language === 'ar' ? `مرحباً بك مجدداً يا ${newUsername || 'زارا'}! 👋 تم الدخول بنجاح` : language === 'ku' ? `بەخێربێیتەوە ${newUsername || 'زارا'}! 👋 دابەزاندن سەرکەوتوو بوو` : `Welcome back, ${newUsername || 'Zara'}! 👋 Signed in`, 
              'success'
            );
          }}
        />

        {/* Floating Toast Notification Center */}
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 w-full max-w-[340px] flex flex-col gap-2 pointer-events-none">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="pointer-events-auto shadow-xl"
              >
                <div className={`p-3.5 rounded-2xl border text-center font-extrabold text-xs flex items-center gap-3 backdrop-blur-md justify-between ${
                  toast.type === 'success'
                    ? 'bg-[#121B2E]/95 border-emerald-500/35 text-emerald-300'
                    : toast.type === 'error'
                    ? 'bg-[#1D1720]/95 border-rose-500/35 text-rose-300'
                    : 'bg-[#121B2E]/95 border-cyan-500/30 text-cyan-300'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {toast.type === 'success' ? '⚡' : toast.type === 'error' ? '🚨' : '✨'}
                    </span>
                    <span className="leading-relaxed tracking-tight text-[11px] text-left">
                      {toast.text}
                    </span>
                  </div>
                  <button 
                    onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                    className="text-slate-400 hover:text-white transition-colors p-1 bg-transparent border-0 cursor-pointer text-[10px] font-black"
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

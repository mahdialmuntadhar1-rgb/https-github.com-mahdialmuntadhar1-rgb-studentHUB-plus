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
import { motion, AnimatePresence } from 'motion/react';
import { Home, HelpCircle, Briefcase, User, Compass, Lock } from 'lucide-react';
import {
  getOpportunities,
  getPosts,
  getToken,
  isLoggedIn,
  login,
  createPost,
  likePost,
  createComment
} from './lib/rafidApi';

const isOpportunityItem = (item: FeedItem) => {
  return [
    'job',
    'internship',
    'scholarship',
    'training',
    'part_time_job',
    'full_time_job',
    'volunteering',
    'competition',
    'graduation_project_support'
  ].includes(item.type) || !!item.opportunityCategory;
};

const fallbackAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100';

const normalizeText = (value?: string | null) => (value || '').toLowerCase().trim();

const resolveGovernorateId = (value?: string | null) => {
  const text = normalizeText(value);
  if (!text) return 'all';
  const found = IraqiGovernorates.find(g =>
    [g.id, g.nameEN, g.nameAR, g.nameKU].some(name => normalizeText(name).includes(text) || text.includes(normalizeText(name)))
  );
  return found?.id || 'all';
};

const resolveUniversityId = (value?: string | null) => {
  const text = normalizeText(value);
  if (!text) return 'all';
  const found = IraqiUniversities.find(u =>
    [u.id, u.nameEN, u.nameAR, u.nameKU].some(name => normalizeText(name).includes(text) || text.includes(normalizeText(name)))
  );
  return found?.id || 'all';
};

const formatDateLabel = (value?: string | null) => {
  if (!value) return 'Recently';
  const date = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const mapBackendPostToFeedItem = (post: any): FeedItem => {
  const mediaUrl = post.image_url || post.imageUrl || post.media_url;
  const isImage = typeof mediaUrl === 'string' && /\.(png|jpe?g|gif|webp|avif)$/i.test(mediaUrl);
  const title = post.title || 'Campus update';
  const content = post.content || post.body || '';

  return {
    id: String(post.id),
    type: post.type === 'announcement' ? 'announcement' : 'post',
    titleEN: title,
    titleAR: title,
    titleKU: title,
    contentEN: content,
    contentAR: content,
    contentKU: content,
    author: {
      name: post.author_full_name || post.author?.name || 'Rafid Student',
      role: post.is_verified ? 'institution' : 'student',
      avatar: post.author_avatar_url || post.author?.avatar || fallbackAvatar,
      verified: Boolean(post.is_verified)
    },
    date: formatDateLabel(post.created_at || post.createdAt),
    rawDate: post.created_at || post.createdAt,
    likes: Number(post.likes_count || post.likes || 0),
    commentsCount: Number(post.comments_count || post.commentsCount || 0),
    commentsList: [],
    views: Number(post.views_count || post.views || 0),
    imageUrl: isImage ? mediaUrl : undefined,
    governorateId: resolveGovernorateId(post.governorate),
    universityId: resolveUniversityId(post.institution || post.university || post.institution_name),
    tags: ['Rafid', 'Live']
  };
};

const mapBackendOpportunityToFeedItem = (opportunity: any): FeedItem => {
  const title = opportunity.title || opportunity.name || opportunity.position || 'Opportunity';
  const content = opportunity.description || opportunity.content || opportunity.summary || '';
  const category = opportunity.category || opportunity.type || 'job';
  const type = category.toLowerCase().includes('intern') ? 'internship'
    : category.toLowerCase().includes('scholar') ? 'scholarship'
    : category.toLowerCase().includes('train') ? 'training'
    : category.toLowerCase().includes('volunteer') ? 'volunteering'
    : category.toLowerCase().includes('competition') ? 'competition'
    : 'job';

  return {
    id: String(opportunity.id || `backend-opp-${title}`),
    type: type as FeedItem['type'],
    titleEN: title,
    titleAR: opportunity.title_ar || title,
    titleKU: opportunity.title_ku || title,
    contentEN: content,
    contentAR: opportunity.description_ar || content,
    contentKU: opportunity.description_ku || content,
    author: {
      name: opportunity.company || opportunity.provider || 'Rafid Opportunity',
      role: 'institution',
      avatar: opportunity.logo_url || fallbackAvatar,
      verified: true
    },
    date: formatDateLabel(opportunity.created_at || opportunity.createdAt),
    rawDate: opportunity.created_at || opportunity.createdAt,
    likes: Number(opportunity.likes_count || opportunity.likes || 0),
    commentsCount: Number(opportunity.comments_count || opportunity.commentsCount || 0),
    commentsList: [],
    governorateId: resolveGovernorateId(opportunity.governorate || opportunity.location),
    universityId: resolveUniversityId(opportunity.institution || opportunity.university),
    company: opportunity.company || opportunity.provider,
    companyLogo: opportunity.company_logo || '💼',
    location: opportunity.location || opportunity.governorate || 'All Iraq',
    deadline: opportunity.deadline,
    opportunityCategory: type === 'internship' ? 'Internship'
      : type === 'scholarship' ? 'Scholarship'
      : type === 'training' ? 'Training'
      : type === 'volunteering' ? 'Volunteering'
      : type === 'competition' ? 'Competition'
      : 'Full-time graduate job',
    workplaceType: (opportunity.workplace_type || opportunity.workplaceType || 'On-site') as FeedItem['workplaceType'],
    whoCanApply: opportunity.who_can_apply || opportunity.whoCanApply,
    savedCount: Number(opportunity.saved_count || opportunity.savedCount || 0),
    companyVerified: true,
    tags: ['Rafid', 'Opportunity']
  };
};

export default function App() {
  // Locale States
  const [language, setLanguage] = useState<Language>('en');
  const [selectedGov, setSelectedGov] = useState<string>('all');
  const [selectedUni, setSelectedUni] = useState<string>('all');

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'home' | 'life' | 'ask' | 'future' | 'profile'>('home');
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'prompt' | 'login'>('prompt');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');

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

  useEffect(() => {
    let cancelled = false;

    async function loadRafidData() {
      const [backendOpportunities, backendPosts] = await Promise.all([
        getOpportunities(),
        getPosts()
      ]);

      if (cancelled) return;

      const mockOpportunities = initialFeedItems.filter(isOpportunityItem);
      const mockPosts = initialFeedItems.filter(item => !isOpportunityItem(item));
      const opportunityItems = backendOpportunities.length > 0
        ? backendOpportunities.map(mapBackendOpportunityToFeedItem)
        : mockOpportunities;
      const postItems = backendPosts.length > 0
        ? backendPosts.map(mapBackendPostToFeedItem)
        : mockPosts;

      setFeedItems([...postItems, ...opportunityItems]);
    }

    loadRafidData();

    return () => {
      cancelled = true;
    };
  }, []);

  // Adjust application alignment automatically based on language direction
  const isRTL = language === 'ar' || language === 'ku';

  // State modification events
  const requireLogin = () => {
    if (isLoggedIn()) return false;
    setAuthMode('prompt');
    setAuthMessage('');
    setAuthPromptOpen(true);
    return true;
  };

  const handleModalLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthMessage('');
    const result = await login(authEmail, authPassword);
    if (!result) {
      setAuthMessage('تعذر تسجيل الدخول الآن. يمكنك متابعة التصفح والمحاولة لاحقاً.');
      return;
    }
    setAuthPromptOpen(false);
    setAuthEmail('');
    setAuthPassword('');
  };

  const handleLike = async (id: string) => {
    if (requireLogin()) return;
    const token = getToken();
    if (token) {
      likePost(token, id);
    }

    setFeedItems(prev => prev.map(item => {
      if (item.id === id) {
        const isLiked = !item.likedByUser;
        // Award points on first like
        if (isLiked) {
          handleAwardPoints(5);
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
    if (requireLogin()) return;

    setFeedItems(prev => prev.map(item => {
      if (item.id === id) {
        const isSaved = !item.savedByUser;
        if (isSaved) {
          handleAwardPoints(10);
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
    if (requireLogin()) return;

    setFeedItems(prev => prev.map(item => {
      if (item.id === itemId && item.pollOptions) {
        // Prevent voting if already voted
        if (item.pollVotedId) return item;

        handleAwardPoints(25); // high reward for sharing feedback

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
    if (requireLogin()) return;

    setFeedItems(prev => prev.map(item => {
      if (item.id === id) {
        const isApplied = !item.applied;
        if (isApplied) {
          handleAwardPoints(50); // Massive career action reward!
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
    if (requireLogin()) return;

    setFeedItems(prev => prev.map(item => {
      if (item.id === id) {
        const isRsvped = !item.eventRsvped;
        if (isRsvped) {
          handleAwardPoints(30);
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
    if (requireLogin()) return;

    setFeedItems(prev => prev.map(item => {
      if (item.id === id) {
        const isJoined = !item.joined;
        if (isJoined) {
          handleAwardPoints(30);
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

  const handleAddComment = async (itemId: string, content: string) => {
    if (requireLogin()) return;
    const token = getToken();
    if (token) {
      createComment(token, itemId, content);
    }

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      authorName: userProfile.name,
      authorRole: userProfile.role,
      authorAvatar: userProfile.avatar,
      content,
      date: 'Just now'
    };

    handleAwardPoints(15); // reward commenting and discussion

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

  const handleAddNewPost = async (title: string, body: string, anonymous: boolean, customType = 'post') => {
    if (requireLogin()) return;

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
    setFeedItems(prev => [freshPost, ...prev]);

    const token = getToken();
    if (token) {
      createPost(token, {
        title,
        content: body,
        anonymous,
        type: customType,
        governorate: selectedGov,
        institution: selectedUni
      });
    }
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
    if (requireLogin()) return;

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
            onRequireLogin={requireLogin}
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
            onRequireLogin={requireLogin}
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
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-gray-800 antialiased font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Centered device presentation mock */}
      <div className="w-full max-w-md mx-auto min-h-screen bg-white shadow-2xl relative flex flex-col border-x border-gray-150/50">
        
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
        <main className="flex-1 overflow-y-auto">
          {renderActiveView()}
        </main>

        {/* Bottom Persistent Navigation Bar: Visible at all times */}
        <nav 
          id="persistent-bottom-navbar"
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 border-t border-gray-100 p-2.5 flex justify-around items-center backdrop-blur-md z-40 shadow-lg pointer-events-auto"
        >
          {/* TAB 1: Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1.5 py-1 px-3.5 rounded-2xl cursor-pointer transition-all ${
              activeTab === 'home' 
                ? 'text-orange-500 bg-orange-50 font-black' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Home className="w-5 h-5 shrink-0" />
            <span className="text-[10px] leading-none font-extrabold">{getTranslation('navHome', language)}</span>
          </button>

          {/* TAB 2: Life (Fun/Social) */}
          <button
            onClick={() => setActiveTab('life')}
            className={`flex flex-col items-center gap-1.5 py-1 px-3.5 rounded-2xl cursor-pointer transition-all ${
              activeTab === 'life' 
                ? 'text-orange-500 bg-orange-50 font-black' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Compass className="w-5 h-5 shrink-0" />
            <span className="text-[10px] leading-none font-extrabold">{getTranslation('navLife', language)}</span>
          </button>

          {/* TAB 3: Ask (AI & Discussions) */}
          <button
            onClick={() => setActiveTab('ask')}
            className={`flex flex-col items-center gap-1.5 py-1 px-3.5 rounded-2xl cursor-pointer transition-all ${
              activeTab === 'ask' 
                ? 'text-orange-500 bg-orange-50 font-black font-semibold' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <HelpCircle className="w-5 h-5 shrink-0" />
            <span className="text-[10px] leading-none font-extrabold">{getTranslation('navAsk', language)}</span>
          </button>

          {/* TAB 4: Future (Careers & Board) */}
          <button
            onClick={() => setActiveTab('future')}
            className={`flex flex-col items-center gap-1.5 py-1 px-3.5 rounded-2xl cursor-pointer transition-all ${
              activeTab === 'future' 
                ? 'text-orange-500 bg-orange-50 font-black' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Briefcase className="w-5 h-5 shrink-0" />
            <span className="text-[10px] leading-none font-extrabold">{getTranslation('navFuture', language)}</span>
          </button>

          {/* TAB 5: Profile */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1.5 py-1 px-3.5 rounded-2xl cursor-pointer transition-all ${
              activeTab === 'profile' 
                ? 'text-orange-500 bg-orange-50 font-black' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <User className="w-5 h-5 shrink-0" />
            <span className="text-[10px] leading-none font-extrabold">{getTranslation('navProfile', language)}</span>
          </button>
        </nav>

        <AnimatePresence>
          {authPromptOpen && (
            <motion.div
              className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm flex items-end sm:items-center justify-center px-4 pb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              role="dialog"
              aria-modal="true"
            >
              <motion.div
                initial={{ y: 28, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 20, opacity: 0, scale: 0.98 }}
                className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-orange-100 p-5 text-center"
              >
                {authMode === 'prompt' ? (
                  <>
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-3">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h2 className="text-base font-black text-gray-950 mb-1">
                      تحتاج تسجيل الدخول للتفاعل
                    </h2>
                    <p className="text-xs font-bold text-gray-400 leading-relaxed mb-4">
                      يمكنك متابعة تصفح جامعاتك والفرص والمنشورات بدون حساب. سجّل الدخول فقط عندما تريد المشاركة.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAuthMode('login')}
                        className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black py-3 shadow-md shadow-orange-500/10"
                      >
                        تسجيل الدخول
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthPromptOpen(false)}
                        className="rounded-2xl bg-gray-100 text-gray-600 text-xs font-black py-3"
                      >
                        متابعة التصفح
                      </button>
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleModalLogin} className="text-left">
                    <h2 className="text-base font-black text-gray-950 mb-1 text-center">
                      تسجيل الدخول
                    </h2>
                    <p className="text-xs font-bold text-gray-400 leading-relaxed mb-4 text-center">
                      أدخل بريدك وكلمة المرور للمتابعة بالتفاعل داخل جامعاتي.
                    </p>
                    <div className="flex flex-col gap-2.5">
                      <input
                        type="email"
                        value={authEmail}
                        onChange={e => setAuthEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-3 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-400/30"
                        required
                      />
                      <input
                        type="password"
                        value={authPassword}
                        onChange={e => setAuthPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-3 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-400/30"
                        required
                      />
                      {authMessage && (
                        <p className="text-[11px] font-bold text-red-500 bg-red-50 rounded-xl p-2 text-center">
                          {authMessage}
                        </p>
                      )}
                      <button
                        type="submit"
                        className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black py-3 shadow-md shadow-orange-500/10"
                      >
                        تسجيل الدخول
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('prompt');
                          setAuthMessage('');
                        }}
                        className="rounded-2xl bg-gray-100 text-gray-600 text-xs font-black py-3"
                      >
                        متابعة التصفح
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

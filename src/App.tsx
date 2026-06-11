import React, { useState, useEffect } from 'react';
import { Language, FeedItem, UserProfile, Comment } from './types';
import { IraqiUniversities } from './data/mockData';
import { getTranslation } from './data/translations';
import { brandingThemes } from './data/themes';
import Header from './components/Header';
import HomeFeed from './components/HomeFeed';
import LifeFeed from './components/LifeFeed';
import FutureFeed from './components/FutureFeed';
import AskFeed from './components/AskFeed';
import ProfileView from './components/ProfileView';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
import AdminAutomation from './components/AdminAutomation';
import { authApi, getInstitutions, postsApi } from './lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { Home, HelpCircle, Briefcase, User, Compass } from 'lucide-react';

const OPPORTUNITY_TYPES = new Set([
  'announcement',
  'job',
  'internship',
  'scholarship',
  'training',
  'event',
  'part_time_job',
  'full_time_job',
  'volunteering',
  'competition',
  'graduation_project_support',
  'fellowship',
  'exam'
]);

const FEED_TYPES = new Set([
  'post',
  'video',
  'photo',
  'story',
  'poll',
  'anonymous_question',
  'announcement',
  'job',
  'internship',
  'scholarship',
  'training',
  'event',
  'study_group',
  'local_service',
  'part_time_job',
  'full_time_job',
  'volunteering',
  'competition',
  'graduation_project_support',
  'fellowship',
  'exam'
]);

function isPublicOpportunity(item: FeedItem): boolean {
  return OPPORTUNITY_TYPES.has(item.type) || Boolean(item.opportunityCategory);
}

function getStoredAuth() {
  const token = localStorage.getItem('jamiaati_token') || '';
  let role = '';

  try {
    const raw = localStorage.getItem('jamiaati_user');
    if (raw) {
      const user = JSON.parse(raw);
      role = String(user?.role || user?.user?.role || '').toLowerCase();
    }
  } catch {
    localStorage.removeItem('jamiaati_user');
  }

  return {
    token,
    isLoggedIn: Boolean(token),
    isAdmin: Boolean(token && ['admin', 'super_admin'].includes(role))
  };
}

const guestUserProfile: UserProfile = {
  id: 'guest',
  name: 'Guest',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
  role: 'student',
  universityId: 'all',
  governorateId: 'all',
  bioEN: 'Sign in to personalize your student profile.',
  bioAR: 'سجّل دخولك لتخصيص ملفك الطلابي.',
  bioKU: 'بچۆ ژوورەوە بۆ تایبەتمەندکردنی پڕۆفایلی خوێندکاریت.',
  majorEN: 'Student',
  majorAR: 'طالب',
  majorKU: 'خوێندکار',
  points: 0,
  level: 1,
  savedItemIds: [],
  appliedJobIds: [],
  joinedGroupIds: [],
  rsvpedEventIds: []
};

function mapBackendUserToProfile(rawUser: any): UserProfile {
  const user = rawUser?.user || rawUser?.profile || rawUser || {};
  const role = String(user.role || 'student').toLowerCase();
  const safeRole = ['student', 'graduate', 'teacher', 'staff', 'institution', 'admin', 'super_admin'].includes(role)
    ? role
    : 'student';

  return {
    ...guestUserProfile,
    id: String(user.id || user.uid || user.email || 'me'),
    name: String(user.name || user.full_name || user.email || 'Student'),
    avatar: String(user.avatar || user.photoURL || guestUserProfile.avatar),
    role: safeRole as any,
    universityId: String(user.universityId || user.university_id || 'all'),
    governorateId: String(user.governorateId || user.governorate_id || 'all'),
    bioEN: String(user.bioEN || user.bio_en || guestUserProfile.bioEN),
    bioAR: String(user.bioAR || user.bio_ar || guestUserProfile.bioAR),
    bioKU: String(user.bioKU || user.bio_ku || guestUserProfile.bioKU),
    majorEN: String(user.majorEN || user.major_en || user.major || guestUserProfile.majorEN),
    majorAR: String(user.majorAR || user.major_ar || user.major || guestUserProfile.majorAR),
    majorKU: String(user.majorKU || user.major_ku || user.major || guestUserProfile.majorKU),
    points: Number(user.points || 0),
    level: Number(user.level || 1),
    savedItemIds: Array.isArray(user.savedItemIds) ? user.savedItemIds : [],
    appliedJobIds: Array.isArray(user.appliedJobIds) ? user.appliedJobIds : [],
    joinedGroupIds: Array.isArray(user.joinedGroupIds) ? user.joinedGroupIds : [],
    rsvpedEventIds: Array.isArray(user.rsvpedEventIds) ? user.rsvpedEventIds : []
  };
}

function mapBackendPostToFeedItem(post: any): FeedItem {
  const type = FEED_TYPES.has(String(post?.type || '')) ? String(post.type) : 'post';
  const content = String(post?.content || '');
  const title = String(post?.title || '').trim();
  const createdAt = post?.created_at || post?.createdAt || post?.date || new Date().toISOString();
  const authorName = String(post?.author_full_name || post?.author_name || post?.author?.full_name || post?.author?.name || 'Jamiaati Student');
  const authorAvatar = String(post?.author_avatar_url || post?.author_avatar || post?.author?.avatar_url || guestUserProfile.avatar);
  const comments = Array.isArray(post?.comments) ? post.comments : [];

  return {
    id: String(post?.id || `post-${Date.now()}`),
    type: type as FeedItem['type'],
    titleEN: title,
    titleAR: title,
    titleKU: title,
    contentEN: content,
    contentAR: content,
    contentKU: content,
    author: {
      name: authorName,
      role: post?.is_verified ? 'institution' : 'student',
      avatar: authorAvatar,
      verified: Boolean(post?.is_verified),
      university: String(post?.institution || '')
    },
    date: 'Recently',
    rawDate: String(createdAt),
    likes: Number(post?.likes_count || post?.likes || 0),
    commentsCount: Number(post?.comments_count || comments.length || 0),
    commentsList: comments.map((comment: any): Comment => ({
      id: String(comment?.id || `comment-${Date.now()}`),
      authorName: String(comment?.author_name || comment?.author_full_name || 'Student'),
      authorRole: 'student',
      authorAvatar: String(comment?.author_avatar || comment?.author_avatar_url || guestUserProfile.avatar),
      content: String(comment?.content || ''),
      date: 'Recently',
      likes: Number(comment?.likes_count || 0)
    })),
    likedByUser: Boolean(post?.liked_by_user),
    savedByUser: false,
    views: Number(post?.views_count || 0),
    tags: ['Community'],
    imageUrl: post?.image_url || undefined,
    governorateId: String(post?.governorate || '').toLowerCase() === 'iraq' ? 'all' : String(post?.governorate || 'all'),
    universityId: String(post?.institution_id || 'all')
  };
}

export default function App() {
  // Locale States
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('jamiaati_language');
    return saved === 'ar' || saved === 'ku' || saved === 'en' ? saved : 'ar';
  });
  const [selectedGov, setSelectedGov] = useState<string>('all');
  const [selectedUni, setSelectedUni] = useState<string>('all');

  // Branding Theme state initialized from localStorage (defaulting to iraq-local)
  const [selectedTheme, setSelectedTheme] = useState<string>(() => {
    return localStorage.getItem('jamiaati_theme') || 'iraq-local';
  });

  // Dynamic root CSS variables updates on theme selection
  useEffect(() => {
    const theme = brandingThemes.find(t => t.id === selectedTheme) || brandingThemes[0];
    localStorage.setItem('jamiaati_theme', selectedTheme);
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--background', theme.background);
    root.style.setProperty('--surface', theme.surface);
    root.style.setProperty('--soft-card', theme.softCard);
    root.style.setProperty('--border-custom', theme.border);
    root.style.setProperty('--text-custom', theme.text);
    root.style.setProperty('--muted-text', theme.mutedText);
    root.style.setProperty('--shadow', theme.shadow);
    root.style.setProperty('--card-text-custom', theme.cardText || theme.text);
    
    root.style.setProperty('--secondary-dark', theme.secondaryDark || theme.background);
    if (theme.bgGradient) {
      root.style.setProperty('--bg-gradient', theme.bgGradient);
    } else {
      root.style.setProperty('--bg-gradient', `linear-gradient(180deg, ${theme.background} 0%, ${theme.background} 100%)`);
    }
  }, [selectedTheme]);

  useEffect(() => {
    localStorage.setItem('jamiaati_language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'en' ? 'ltr' : 'rtl';
  }, [language]);

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
  const [activeTab, setActiveTab] = useState<'home' | 'life' | 'ask' | 'future' | 'profile' | 'admin'>('home');

  // Brief dynamic feed loading skeleton for filter transitions.
  const [isFeedLoading, setIsFeedLoading] = useState(false);

  useEffect(() => {
    setIsFeedLoading(true);
    const t = setTimeout(() => setIsFeedLoading(false), 450);
    return () => clearTimeout(t);
  }, [selectedGov, selectedUni, activeTab]);

  // Auth States
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => getStoredAuth().isLoggedIn);
  const [hasAdminAccess, setHasAdminAccess] = useState<boolean>(() => getStoredAuth().isAdmin);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Feed posts come from the official backend. Unsupported interactions are labelled device-local.
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);

  // User profile state (gamification & badges tracker)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const token = localStorage.getItem('jamiaati_token');
      const saved = localStorage.getItem('jamiaati_user');
      return token && saved ? mapBackendUserToProfile(JSON.parse(saved)) : guestUserProfile;
    } catch {
      return guestUserProfile;
    }
  });

  // Institutions Dynamic Loading States
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [institutionsLoading, setInstitutionsLoading] = useState<boolean>(true);
  const [institutionsError, setInstitutionsError] = useState<string | null>(null);

  const normalizeGovernorate = (raw: string | null | undefined): string => {
    if (!raw) return 'all';
    const val = raw.trim().toLowerCase();
    if (val === 'all iraq') return 'all';
    if (val === 'baghdad') return 'baghdad';
    if (val === 'nineveh' || val.includes('mosul') || val === 'nineveh (mosul)') return 'nineveh';
    if (val === 'basra' || val === 'basrah') return 'basra';
    if (val === 'sulaymaniyah' || val === 'sulaimani' || val === 'sulaimaniyah') return 'sulaymaniyah';
    if (val === 'erbil' || val === 'erbil governorate') return 'erbil';
    if (val === 'kirkuk') return 'kirkuk';
    if (val === 'najaf') return 'najaf';
    if (val === 'karbala' || val === 'kerbala') return 'karbala';
    if (val === 'dhi qar' || val === 'dhi_qar' || val === 'thi qar' || val === 'ziqar') return 'dhi_qar';
    if (val === 'babil' || val === 'babylon') return 'babil';
    if (val === 'anbar') return 'anbar';
    if (val === 'diyala') return 'diyala';
    if (val === 'salahaddin' || val === 'salah ad-din' || val === 'salah_al_din' || val === 'salahaldeen' || val === 'salah al-din') return 'salah_al_din';
    if (val === 'wasit') return 'wasit';
    if (val === 'maysan') return 'maysan';
    if (val === 'al-qadisiyah' || val === 'al_qadisiyah' || val === 'qadisiyah' || val === 'qadisiyyah' || val === 'diwaniyah' || val === 'al_qadisiyyah' || val === 'qadisiyah' || val === 'al-qadisiyyah') return 'al_qadisiyah';
    if (val === 'muthanna') return 'muthanna';
    if (val === 'duhok' || val === 'duhok governorate') return 'duhok';
    if (val === 'halabja') return 'halabja';
    return 'all';
  };

  const fetchInstitutions = async () => {
    setInstitutionsLoading(true);
    setInstitutionsError(null);
    try {
      let all: any[] = [];
      let offset = 0;
      let limit = 200;
      let hasMore = true;
      let attempts = 0;
      
      while (hasMore && attempts < 15) {
        attempts++;
        const json = await getInstitutions({ limit, offset }, language);
        const list = json.institutions || [];
        all = all.concat(list);
        const pag = json.pagination || {};
        offset += list.length;
        hasMore = pag.hasMore && list.length > 0 && all.length < pag.total;
      }

      const colors = [
        'from-blue-600 to-sky-500',
        'from-emerald-600 to-teal-500',
        'from-amber-600 to-indigo-500',
        'from-rose-600 to-orange-500',
        'from-violet-600 to-purple-500',
        'from-cyan-600 to-blue-500'
      ];

      const mapped = all.map((inst: any) => {
        const govId = normalizeGovernorate(inst.governorate);
        
        let logo = '🎓';
        const type = (inst.type || '').toLowerCase();
        if (type.includes('private')) logo = '🏛️';
        else if (type.includes('college')) logo = '📖';
        else if (type.includes('school')) logo = '🏫';
        else if (type.includes('division') || type.includes('department')) logo = '🔬';
        else if (type.includes('institute') || type.includes('research')) logo = '🛡️';
        
        const charSum = inst.id.split('').reduce((sum: number, c: string) => sum + c.charCodeAt(0), 0);
        const color = colors[charSum % colors.length];

        const nameEN = inst.name_en?.trim() || inst.name_ar?.trim() || 'Unnamed Institution';
        let nameAR = inst.name_ar?.trim() || inst.name_en?.trim() || 'مؤسسة غير معروفة';
        let nameKU = inst.name_ku?.trim() || inst.name_en?.trim() || inst.name_ar?.trim() || 'مؤسسەی نەناسراو';

        return {
          id: inst.id,
          nameEN,
          nameAR,
          nameKU,
          governorateId: govId,
          logo,
          color
        };
      });

      setInstitutions(mapped);
    } catch (err: any) {
      console.error('Failed to load institutions dynamically:', err);
      setInstitutionsError(err.message || 'Unknown network error');
    } finally {
      setInstitutionsLoading(false);
    }
  };

  const fetchPosts = async () => {
    setIsFeedLoading(true);
    try {
      const json = await postsApi.list(language);
      const list = Array.isArray(json?.posts) ? json.posts : Array.isArray(json) ? json : [];
      setFeedItems(list.map(mapBackendPostToFeedItem).filter((item: FeedItem) => !isPublicOpportunity(item)));
    } catch (err: any) {
      console.error('Failed to load backend posts:', err);
      setFeedItems([]);
      showToast(
        language === 'ar' ? 'تعذر تحميل منشورات الخادم الرسمي.' : language === 'ku' ? 'بارکردنی بابەتەکانی بەکئێندی فەرمی سەرکەوتوو نەبوو.' : 'Could not load official backend posts.',
        'error'
      );
    } finally {
      setIsFeedLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
    fetchPosts();
    const syncAuth = () => {
      const auth = getStoredAuth();
      setIsLoggedIn(auth.isLoggedIn);
      setHasAdminAccess(auth.isAdmin);
    };
    window.addEventListener('storage', syncAuth);
    window.addEventListener('jamiaati-auth-changed', syncAuth);

    const validateSession = async () => {
      if (!localStorage.getItem('jamiaati_token')) {
        setIsLoggedIn(false);
        setHasAdminAccess(false);
        setUserProfile(guestUserProfile);
        return;
      }

      try {
        const me = await authApi.me(language);
        const profile = mapBackendUserToProfile(me);
        localStorage.setItem('jamiaati_user', JSON.stringify(profile));
        setUserProfile(profile);
        setIsLoggedIn(true);
        setHasAdminAccess(['admin', 'super_admin'].includes(String(profile.role).toLowerCase()));
      } catch {
        authApi.logout();
        setIsLoggedIn(false);
        setHasAdminAccess(false);
        setUserProfile(guestUserProfile);
      }
    };
    void validateSession();

    // Support #/opportunities or #opportunities route to switch tab to 'future'
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#/opportunities' || hash === '#opportunities') {
        setActiveTab('future');
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash(); // Run on initial load
    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('jamiaati-auth-changed', syncAuth);
    };
  }, []);

  const handleRetryInstitutions = () => {
    fetchInstitutions();
  };

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('jamiaati_user', JSON.stringify(userProfile));
    }
  }, [isLoggedIn, userProfile]);

  // Adjust application alignment automatically based on language direction
  const isRTL = language === 'ar' || language === 'ku';

  // State modification events
  const handleLike = async (id: string) => {
    const previous = feedItems;
    setFeedItems(prev => prev.map(item => {
      if (item.id === id) {
        const isLiked = !item.likedByUser;
        return {
          ...item,
          likes: Math.max(0, isLiked ? item.likes + 1 : item.likes - 1),
          likedByUser: isLiked
        };
      }
      return item;
    }));

    try {
      const res = await postsApi.toggleLike(id, language);
      setFeedItems(prev => prev.map(item => item.id === id ? {
        ...item,
        likes: Number(res?.likes_count ?? item.likes),
        likedByUser: Boolean(res?.liked ?? item.likedByUser)
      } : item));
      showToast(
        Boolean(res?.liked)
          ? (language === 'ar' ? 'تم تسجيل الإعجاب في الخادم الرسمي.' : language === 'ku' ? 'دڵخوازکردن لە بەکئێندی فەرمی تۆمارکرا.' : 'Like saved to the official backend.')
          : (language === 'ar' ? 'تم إلغاء الإعجاب في الخادم الرسمي.' : language === 'ku' ? 'دڵخوازکردن لە بەکئێندی فەرمی لابرا.' : 'Like removed from the official backend.'),
        Boolean(res?.liked) ? 'success' : 'info'
      );
    } catch (err: any) {
      setFeedItems(previous);
      showToast(
        err?.message || (language === 'ar' ? 'تعذر تحديث الإعجاب في الخادم الرسمي.' : language === 'ku' ? 'نوێکردنەوەی دڵخوازکردن لە بەکئێند سەرکەوتوو نەبوو.' : 'Could not update like on the official backend.'),
        'error'
      );
    }
  };

  const handleSave = (id: string) => {
    let triggeredToast = false;
    setFeedItems(prev => prev.map(item => {
      if (item.id === id) {
        const isSaved = !item.savedByUser;
        if (!triggeredToast) {
          triggeredToast = true;
          if (isSaved) {
            showToast(
              language === 'ar' ? 'تم الحفظ على هذا الجهاز.' : language === 'ku' ? 'لەم ئامێرەدا پاشەکەوتکرا.' : 'Saved on this device.',
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
          showToast(
            language === 'ar' ? 'تم تسجيل التصويت محلياً على هذا الجهاز.' : language === 'ku' ? 'دەنگەکەت ناوخۆیی لەم ئامێرەدا تۆمارکرا.' : 'Vote saved locally on this device.',
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
            showToast(
              language === 'ar' ? 'تم فتح رابط التقديم إن توفر. لم يتم إرسال طلب داخل جامعتي.' : language === 'ku' ? 'ئەگەر لینک هەبێت کرایەوە. داواکاری لە جامعتي نەنێردرا.' : 'Apply link opened if available. No application was submitted inside Jamiaati.',
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
            showToast(
              language === 'ar' ? 'تم حفظ تأكيد الحضور على هذا الجهاز.' : language === 'ku' ? 'بەشدارییەکە لەم ئامێرەدا پاشەکەوتکرا.' : 'RSVP saved on this device.',
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
            showToast(
              language === 'ar' ? 'تم حفظ الانضمام على هذا الجهاز.' : language === 'ku' ? 'پەیوەستبوونەکە لەم ئامێرەدا پاشەکەوتکرا.' : 'Join saved on this device.',
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

  const handleAddComment = async (itemId: string, content: string) => {
    try {
      const saved = await postsApi.addComment(itemId, content, language);
      const newComment: Comment = {
        id: String(saved?.id || `c-${Date.now()}`),
        authorName: String(saved?.author_name || userProfile.name),
        authorRole: userProfile.role,
        authorAvatar: String(saved?.author_avatar || userProfile.avatar),
        content: String(saved?.content || content),
        date: 'Just now',
        likes: Number(saved?.likes_count || 0)
      };

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

      showToast(
        language === 'ar' ? 'تم حفظ تعليقك في الخادم الرسمي.' : language === 'ku' ? 'لێدوانەکەت لە بەکئێندی فەرمی پاشەکەوتکرا.' : 'Comment saved to the official backend.',
        'success'
      );
    } catch (err: any) {
      showToast(
        err?.message || (language === 'ar' ? 'تعذر حفظ التعليق في الخادم الرسمي.' : language === 'ku' ? 'پاشەکەوتکردنی لێدوان لە بەکئێند سەرکەوتوو نەبوو.' : 'Could not save comment to the official backend.'),
        'error'
      );
    }
  };

  const handleAddNewPost = async (title: string, body: string, anonymous: boolean, customType = 'post') => {
    try {
      const institution = IraqiUniversities.find(u => u.id === (selectedUni === 'all' ? userProfile.universityId : selectedUni));
      const saved = await postsApi.create({
        type: customType,
        title,
        content: body,
        governorate: selectedGov === 'all' ? userProfile.governorateId : selectedGov,
        institution: institution?.nameEN || userProfile.universityId || 'Jamiaati',
        institution_id: selectedUni === 'all' ? userProfile.universityId : selectedUni,
        metadata: { anonymous }
      }, language);

      const freshPost = mapBackendPostToFeedItem(saved);
      setFeedItems(prev => [freshPost, ...prev]);
      showToast(
        language === 'ar' ? 'تم حفظ المشاركة في الخادم الرسمي.' : language === 'ku' ? 'هاوبەشکراوەکە لە بەکئێندی فەرمی پاشەکەوتکرا.' : 'Post saved to the official backend.',
        'success'
      );
    } catch (err: any) {
      showToast(
        err?.message || (language === 'ar' ? 'تعذر حفظ المشاركة في الخادم الرسمي.' : language === 'ku' ? 'پاشەکەوتکردنی هاوبەشکراوە لە بەکئێند سەرکەوتوو نەبوو.' : 'Could not save post to the official backend.'),
        'error'
      );
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
            setSelectedGov={setSelectedGov}
            selectedUni={selectedUni}
            setSelectedUni={setSelectedUni}
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
            onAwardPoints={handleAwardPoints}
            showToast={showToast}
            institutions={institutions}
            institutionsLoading={institutionsLoading}
            institutionsError={institutionsError}
            onRetryInstitutions={handleRetryInstitutions}
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
            isLoggedIn={isLoggedIn}
            onLogout={() => {
              authApi.logout();
              setIsLoggedIn(false);
              setHasAdminAccess(false);
              setUserProfile(guestUserProfile);
              showToast(
                language === 'ar' ? 'تم تسجيل خروجك بنجاح. نراك قريباً! 👋' : language === 'ku' ? 'خۆتۆمارکردنەکەت کۆتایی پێهات. بە هیوای دیدار! 👋' : 'Logged out successfully. See you! 👋', 
                'info'
              );
            }}
            onTriggerAuth={() => setIsAuthModalOpen(true)}
            onNavigateAdmin={hasAdminAccess ? () => setActiveTab('admin') : undefined}
          />
        );
      case 'admin':
        return hasAdminAccess ? (
          <AdminAutomation
            language={language}
            onBack={() => setActiveTab('profile')}
            showToast={showToast}
            userRole={String(userProfile.role)}
          />
        ) : (
          <div className="px-4 py-10 max-w-lg mx-auto flex flex-col pb-28 bg-[#0B1020] min-h-[70vh] justify-center items-center">
            <div className="bg-[#121B2E] border border-[#1F2E4D] rounded-3xl p-6 text-center w-full">
              <h2 className="text-base font-black text-white">
                {language === 'ar' ? 'تسجيل دخول المدير مطلوب' : language === 'ku' ? 'چوونەژوورەوەی بەڕێوەبەر پێویستە' : 'Admin login required'}
              </h2>
              <p className="mt-2 text-xs text-slate-300 font-semibold">
                {language === 'ar' ? 'يجب استخدام حساب مدير موثق من الخادم الرسمي.' : language === 'ku' ? 'دەبێت هەژماری بەڕێوەبەری پشتڕاستکراوی بەکئێند بەکاربهێنیت.' : 'Use a backend-authenticated admin account to continue.'}
              </p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full mt-5 py-3 bg-gradient-to-r from-[#4F46E5] via-[#2563EB] to-[#06B6D4] text-xs font-black text-white rounded-2xl"
              >
                {language === 'ar' ? 'تسجيل الدخول' : language === 'ku' ? 'چوونەژوورەوە' : 'Sign in'}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div id="jamiaati-portal" className="bg-[#040814] min-h-screen text-slate-900 dark:text-slate-100 antialiased font-sans" dir={isRTL ? 'rtl' : 'ltr'} lang={language}>
      {/* Centered device presentation mock */}
      <div className="w-full max-w-md mx-auto min-h-screen bg-[#0B1020] shadow-2xl shadow-black/8 w-full relative flex flex-col border-x border-[#1F2E4D]">
        
        {/* Top Header Selector Component */}
        <Header
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
          onAuthSuccess={(backendUser) => {
            const profile = mapBackendUserToProfile(backendUser);
            const auth = getStoredAuth();
            setIsLoggedIn(true);
            setHasAdminAccess(auth.isAdmin || ['admin', 'super_admin'].includes(String(profile.role).toLowerCase()));
            setUserProfile(profile);
            showToast(
              language === 'ar' ? `مرحباً بك ${profile.name}! تم الدخول بنجاح` : language === 'ku' ? `بەخێربێیت ${profile.name}! چوونەژوورەوە سەرکەوتوو بوو` : `Welcome, ${profile.name}! Signed in`,
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

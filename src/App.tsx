import React, { useState, useEffect } from 'react';
import './styles/high-contrast-fix.css';
import { Language, FeedItem, UserProfile, Comment } from './types';
import { initialFeedItems, defaultUserProfile, IraqiUniversities, IraqiGovernorates } from './data/mockData';
import { getTranslation } from './data/translations';
import { brandingThemes } from './data/themes';
import Header from './components/Header';
import HomeFeed from './components/HomeFeed';
import LifeFeed from './components/LifeFeed';
import FutureFeed from './components/FutureFeed';
import AskFeed from './components/AskFeed';
import ProfileView from './components/ProfileView';
import SectionView from './components/SectionView';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
import AdminAutomation from './components/AdminAutomation';
import AdminModeration from './components/AdminModeration';
import SocialHub from './components/SocialHub';
import UserProfileModal from './components/UserProfileModal';
import UniversitiesList from './components/UniversitiesList';
import { BACKEND_URL, socialApi } from './lib/api';
import { useLanguage } from './i18n/LanguageProvider';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Sparkles, HelpCircle, Briefcase, User, Compass, Info, FileText } from 'lucide-react';

export default function App() {
  // Locale States
  const { language, setLanguage } = useLanguage();
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
  const [activeTab, setActiveTab] = useState<'home' | 'life' | 'ask' | 'future' | 'profile' | 'chats' | 'admin' | 'universities'>('home');

  // Interactive student profile details overlay state
  const [selectedUserForProfileCard, setSelectedUserForProfileCard] = useState<any | null>(null);

  // Selected Section state for horizontal stories
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // Clear selected section when switching top-level tabs
  useEffect(() => {
    setSelectedSection(null);
  }, [activeTab]);

  // Brief dynamic feed loading skeleton simulator
  const [isFeedLoading, setIsFeedLoading] = useState(false);

  useEffect(() => {
    setIsFeedLoading(true);
    const t = setTimeout(() => setIsFeedLoading(false), 450);
    return () => clearTimeout(t);
  }, [selectedGov, selectedUni, activeTab]);

  // Auth States
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const token = localStorage.getItem('jamiaati_token') || localStorage.getItem('admin_token');
    const notLoggedOut = localStorage.getItem('jamiaati_logged_in') !== 'false';
    return Boolean(token) && notLoggedOut;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Social Badge Counts (Friend/Connection Requests & Messages)
  const [friendRequestsCount, setFriendRequestsCount] = useState<number>(0);
  const [messageRequestsCount, setMessageRequestsCount] = useState<number>(0);
  const [socialSubTab, setSocialSubTab] = useState<'threads' | 'requests' | 'discover'>('threads');

  const updateSocialBadgeCounts = async () => {
    if (!isLoggedIn) {
      setFriendRequestsCount(0);
      setMessageRequestsCount(0);
      return;
    }
    try {
      const [fReqs, mReqs] = await Promise.all([
        socialApi.getFriendRequests(language).catch(() => ({ incoming: [] })),
        socialApi.getMessageRequests(language).catch(() => ({ incoming: [] }))
      ]);
      const fCount = fReqs && Array.isArray(fReqs.incoming) ? fReqs.incoming.length : 0;
      const mCount = mReqs && Array.isArray(mReqs.incoming) ? mReqs.incoming.length : 0;
      setFriendRequestsCount(fCount);
      setMessageRequestsCount(mCount);
    } catch (e) {
      console.warn("Failed to load badge counts.", e);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      updateSocialBadgeCounts();
      // Periodically update the badge counts silently every 30 seconds
      const interval = setInterval(updateSocialBadgeCounts, 30000);
      return () => clearInterval(interval);
    } else {
      setFriendRequestsCount(0);
      setMessageRequestsCount(0);
    }
  }, [isLoggedIn, language, activeTab]);

  // Feed database state - strong browser persistence for Campus Life custom posts
  const CUSTOM_FEED_STORAGE_KEYS = [
    'jamiaati_feed_v2',
    'jamiaati_feed_v2_backup',
    'jamiaati_custom_feed_backup'
  ];

  const cleanCustomFeedItemForStorage = (item: any): FeedItem | null => {
    if (!item?.id || !String(item.id).startsWith('custom-')) return null;

    const safeItem: any = {
      ...item,
      commentsList: Array.isArray(item.commentsList) ? item.commentsList : [],
      tags: Array.isArray(item.tags) ? item.tags : []
    };

    if (
      typeof safeItem.imageUrl === 'string' &&
      safeItem.imageUrl.startsWith('data:image/') &&
      safeItem.imageUrl.length > 1600000
    ) {
      safeItem.imageUrl = undefined;
      safeItem.imageAlt = safeItem.imageAlt || 'Large image removed from browser storage';
    }

    if (
      safeItem.author &&
      typeof safeItem.author.avatar === 'string' &&
      safeItem.author.avatar.startsWith('data:image/')
    ) {
      safeItem.author = {
        ...safeItem.author,
        avatar: defaultUserProfile.avatar
      };
    }

    return safeItem as FeedItem;
  };

  const readCustomFeedItemsFromBrowser = (): FeedItem[] => {
    const readFrom = (storage: Storage | null, key: string): FeedItem[] => {
      if (!storage) return [];
      const raw = storage.getItem(key);
      if (!raw) return [];

      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed
          .map(cleanCustomFeedItemForStorage)
          .filter(Boolean) as FeedItem[];
      } catch (error) {
        console.warn('Could not read saved Campus Life posts from', key, error);
        return [];
      }
    };

    for (const key of CUSTOM_FEED_STORAGE_KEYS) {
      const fromLocal = readFrom(localStorage, key);
      if (fromLocal.length > 0) return fromLocal;
    }

    for (const key of CUSTOM_FEED_STORAGE_KEYS) {
      const fromSession = readFrom(sessionStorage, key);
      if (fromSession.length > 0) return fromSession;
    }

    return [];
  };

  const writeCustomFeedItemsToBrowser = (items: FeedItem[]) => {
    const customOnly = items
      .map(cleanCustomFeedItemForStorage)
      .filter(Boolean) as FeedItem[];

    const saveAll = (payloadItems: FeedItem[]) => {
      const payload = JSON.stringify(payloadItems);

      for (const key of CUSTOM_FEED_STORAGE_KEYS) {
        localStorage.setItem(key, payload);
      }

      for (const key of CUSTOM_FEED_STORAGE_KEYS) {
        sessionStorage.setItem(key, payload);
      }
    };

    try {
      saveAll(customOnly);
    } catch (error) {
      console.warn('Campus Life storage quota issue. Saving text-first backup.', error);

      const textOnly = customOnly.map((item: any) => ({
        ...item,
        imageUrl:
          typeof item.imageUrl === 'string' && item.imageUrl.startsWith('data:image/')
            ? undefined
            : item.imageUrl,
        imageAlt: item.imageAlt || 'Image removed from browser backup'
      }));

      try {
        saveAll(textOnly as FeedItem[]);
      } catch (fallbackError) {
        console.error('Could not save Campus Life posts even as text backup.', fallbackError);
      }
    }
  };

  const [feedItems, setFeedItems] = useState<FeedItem[]>(() => readCustomFeedItemsFromBrowser());

  // User profile state (gamification & badges tracker)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('jamiaati_profile_v2');
    return saved ? JSON.parse(saved) : defaultUserProfile;
  });

  // UI authorization follows the authenticated API identity, not the locally
  // editable profile role used by the demo/gamification controls.
  const hasAuthenticatedAdminAccess = (() => {
    if (!isLoggedIn || !localStorage.getItem('jamiaati_token')) return false;
    try {
      const authUser = JSON.parse(localStorage.getItem('jamiaati_auth_user') || 'null');
      const email = String(authUser?.email || localStorage.getItem('jamiaati_user_email') || '').trim().toLowerCase();
      return authUser?.role === 'admin' || authUser?.role === 'staff' || email === 'mahdialmuntadhar1@gmail.com';
    } catch {
      return false;
    }
  })();

  // Sync to local states - save only user-created custom posts.
  // IMPORTANT: never persist large base64 uploaded images in localStorage.
  // Big uploaded images must go to backend/R2 later; localStorage is only for small text demo posts.
  useEffect(() => {
    const stripLargeInlineImages = (item: any) => {
      const safeItem = { ...item };

      if (typeof safeItem.imageUrl === 'string' && safeItem.imageUrl.startsWith('data:image/') && safeItem.imageUrl.length > 1200000) {
        safeItem.imageUrl = undefined;
        safeItem.imageAlt = safeItem.imageAlt || 'Uploaded image removed from local browser storage';
      }

      if (safeItem.author && typeof safeItem.author.avatar === 'string' && safeItem.author.avatar.startsWith('data:image/')) {
        safeItem.author = {
          ...safeItem.author,
          avatar: defaultUserProfile.avatar
        };
      }

      return safeItem;
    };

    const customOnly = feedItems
      .filter(item => item.id && String(item.id).startsWith('custom-'))
      .map(stripLargeInlineImages);

    try {
      localStorage.setItem('jamiaati_feed_v2', JSON.stringify(customOnly));
    } catch (error) {
      console.warn('jamiaati_feed_v2 was too large. Saving text-only posts instead.', error);

      try {
        const textOnly = customOnly.map((item: any) => ({
          ...item,
          imageUrl: undefined,
          imageAlt: item.imageAlt || ''
        }));
        localStorage.setItem('jamiaati_feed_v2', JSON.stringify(textOnly));
      } catch {
        localStorage.removeItem('jamiaati_feed_v2');
      }
    }
  }, [feedItems]);

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
        const url = `${BACKEND_URL}/api/institutions?limit=${limit}&offset=${offset}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.statusText}`);
        }
        const json = await res.json();
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

      // Synchronize/overwrite the exported IraqiUniversities array in-place so all downstream imports access live data
      IraqiUniversities.length = 0;
      IraqiUniversities.push(...mapped);

      // Synchronize/overwrite the exported IraqiGovernorates array in-place to reflect active governorates from dynamic loading
      const activeGovIds = new Set(mapped.map(u => u.governorateId));
      const originalGovs = [...IraqiGovernorates];
      const activeGovsList = originalGovs.filter(g => activeGovIds.has(g.id));
      if (activeGovsList.length > 0) {
        IraqiGovernorates.length = 0;
        IraqiGovernorates.push(...activeGovsList);
      }

      setInstitutions(mapped);
    } catch (err: any) {
      console.error('Failed to load institutions dynamically:', err);
      setInstitutionsError(err.message || 'Unknown network error');
    } finally {
      setInstitutionsLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();

    // Support hash-based back-navigation routing
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#/opportunities' || hash === '#opportunities') {
        setActiveTab('future');
        setSelectedSection(null);
      } else if (hash.startsWith('#/section/')) {
        const sec = hash.substring('#/section/'.length);
        setSelectedSection(sec || null);
      } else if (hash === '' || hash === '#/') {
        setSelectedSection(null);
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash(); // Run on initial load
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Synchronize selectedSection changes with URL hash for browser history back support
  useEffect(() => {
    const currentHash = window.location.hash;
    if (selectedSection) {
      const expected = `#/section/${selectedSection}`;
      if (currentHash !== expected) {
        window.location.hash = expected;
      }
    } else {
      if (currentHash.startsWith('#/section/')) {
        window.location.hash = '';
      }
    }
  }, [selectedSection]);

  const handleRetryInstitutions = () => {
    fetchInstitutions();
  };

  // Synchronised dynamic fetcher of live highlights & opportunities from the backend
  useEffect(() => {
    const fetchLiveFeed = async () => {
      try {
        const [oppsResponse, highlightsResponse] = await Promise.all([
          fetch(`${BACKEND_URL}/api/opportunities`),
          fetch(`${BACKEND_URL}/api/highlights`)
        ]);

        let dbItems: FeedItem[] = [];

        // 1. Process Opportunities
        if (oppsResponse.ok) {
          const list = await oppsResponse.json();
          if (Array.isArray(list)) {
            const mappedOpps = list.map((item: any) => ({
              id: String(item.id || `scraped-${Date.now()}-${Math.random()}`),
              type: (item.category || item.type || 'job') as any,
              titleEN: item.titleEN || item.title || 'Untitled Opportunity',
              titleAR: item.titleAR || (item.title && /[\u0600-\u06FF]/.test(item.title) ? item.title : '') || 'فرصة غير معنونة',
              titleKU: item.titleKU || (item.title && /[\u0600-\u06FF]/.test(item.title) ? item.title : '') || 'هەلی بێ ناونیشان',
              contentEN: item.contentEN || item.description || item.summary || 'Check original portal for instructions.',
              contentAR: item.contentAR || (item.description && /[\u0600-\u06FF]/.test(item.description) ? item.description : '') || 'يرجى مراجعة المصدر الأصلي لمعلومات التقديم.',
              contentKU: item.contentKU || (item.description && /[\u0600-\u06FF]/.test(item.description) ? item.description : '') || 'تکایە سەرچاوەی سەرەکی ببینە بۆ زانیاری.',
              author: {
                name: item.organization || item.institution_name || 'Scraped Recruiter',
                role: 'institution' as const,
                avatar: item.institution_logo || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=100',
                verified: true
              },
              date: item.published_date ? `Posted on ${item.published_date}` : 'Recently scraped 🔔',
              likes: item.likes || 12,
              commentsCount: 0,
              commentsList: [],
              governorateId: item.governorateId || item.governorate || 'all',
              universityId: item.universityId || item.university_id || 'all',
              tags: item.tags || ['scraped', item.category || 'career'],
              company: item.organization || item.institution_name,
              companyLogo: item.institution_logo || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=100',
              location: item.location || item.city || 'Iraq',
              deadline: item.deadline || 'August 2026',
              imageUrl: item.imageUrl || item.image_url,

              applyUrl: item.application_link || item.apply_url || item.source_url || item.original_source_url || item.url || item.link || item.job_url || item.details_url,

              sourceUrl: item.source_url || item.original_source_url || item.application_link || item.apply_url || item.url || item.link || item.job_url || item.details_url,

              application_link: item.application_link || item.apply_url || item.source_url || item.original_source_url || item.url || item.link || item.job_url || item.details_url,

              original_source_url: item.original_source_url || item.source_url || item.application_link || item.apply_url || item.url || item.link || item.job_url || item.details_url,

              url: item.url || item.link || item.application_link || item.apply_url || item.source_url || item.original_source_url || item.job_url || item.details_url,
              opportunityCategory: (item.category === 'internship' ? 'Internship' : 
                                     item.category === 'scholarship' ? 'Scholarship' : 
                                     item.category === 'training' ? 'Training' : 
                                     item.category === 'volunteering' ? 'Volunteering' : 
                                     item.category === 'competition' ? 'Competition' : 
                                     item.category === 'graduation_support' ? 'Graduation project support' : 'Full-time graduate job') as any,
              workplaceType: item.workplaceType || 'On-site',
              whoCanApply: item.eligibility || item.whoCanApply || 'Iraqi students',
              salary: item.salary || item.salary_or_funding || 'Recruiter structured'
            }));
            dbItems = [...dbItems, ...mappedOpps];
          }
        }

        // 2. Process Highlights
        if (highlightsResponse.ok) {
          const hList = await highlightsResponse.json();
          if (Array.isArray(hList)) {
            const mappedHighlights = hList.map((item: any) => ({
              id: String(item.id || `highlight-${Date.now()}-${Math.random()}`),
              type: (item.category || 'news') as any,
              titleEN: item.titleEN || item.title || 'Campus Notification',
              titleAR: item.titleAR || (item.title && /[\u0600-\u06FF]/.test(item.title) ? item.title : '') || 'تنبيه جامعي',
              titleKU: item.titleKU || (item.title && /[\u0600-\u06FF]/.test(item.title) ? item.title : '') || 'ئاگاداری خوێندکاران',
              contentEN: item.contentEN || item.summary || 'Check original university channel for details.',
              contentAR: item.contentAR || (item.summary && /[\u0600-\u06FF]/.test(item.summary) ? item.summary : '') || 'يرجى مراجعة القناة الرسمية للمزيد من التفاصيل.',
              contentKU: item.contentKU || (item.summary && /[\u0600-\u06FF]/.test(item.summary) ? item.summary : '') || 'تکایە سەرچاوەی فەرمی ببینە بۆ زانیاری.',
              author: {
                name: item.organization || 'Academic Center Feed',
                role: 'institution' as const,
                avatar: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=100',
                verified: true
              },
              date: item.created_at ? `Posted on ${new Date(item.created_at).toLocaleDateString()}` : 'Recently posted 🔔',
              likes: item.likes || 15,
              commentsCount: 0,
              commentsList: [],
              governorateId: item.governorate || item.governorateId || 'all',
              universityId: item.university_id || item.universityId || 'all',
              tags: ['Campus', item.category || 'highlights'],
              imageUrl: item.image_url || item.imageUrl,
              application_link: item.apply_url || item.source_url || item.application_link,
              deadline: item.deadline || undefined,
            }));
            dbItems = [...dbItems, ...mappedHighlights];
          }
        }

        setFeedItems(prev => {
          const customOnly = prev.filter(p => p.id && String(p.id).startsWith('custom-'));
          if (dbItems.length > 0) {
            // Live backend listings exist! We show only live + custom posts. We do not mix mock data.
            return [...customOnly, ...dbItems];
          } else {
            // Live backend listings are empty or failed, so fallback to mock details cleanly.
            return [...customOnly, ...initialFeedItems];
          }
        });

      } catch (err) {
        console.error("Error loading approved scraped opportunities and highlights:", err);
        // Fallback to initialFeedItems in case of complete API/fetch issues
        setFeedItems(prev => {
          const customOnly = prev.filter(p => p.id && String(p.id).startsWith('custom-'));
          const withoutLive = prev.filter(p => p.id && !String(p.id).startsWith('custom-') && !String(p.id).startsWith('scraped-') && !String(p.id).startsWith('highlight-'));
          if (withoutLive.length === 0) {
            return [...customOnly, ...initialFeedItems];
          }
          return prev;
        });
      }
    };
    fetchLiveFeed();
  }, [activeTab]);

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

  const handleEditFeedItem = (id: string, updatedFields: Partial<FeedItem>) => {
    setFeedItems(prev => {
      const next = prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            ...updatedFields
          };
        }
        return item;
      });
      writeCustomFeedItemsToBrowser(next);
      return next;
    });
    showToast(
      language === 'ar' ? 'تم تحديث المنشور بنجاح! ✏️' : 'Post updated successfully by admin! ✏️', 
      'success'
    );
  };

  const handleDeleteFeedItem = (id: string) => {
    setFeedItems(prev => {
      const next = prev.filter(item => item.id !== id);
      writeCustomFeedItemsToBrowser(next);
      return next;
    });
    showToast(
      language === 'ar' ? 'تم حذف المنشور بنجاح! 🗑️' : 'Post deleted successfully by admin! 🗑️', 
      'success'
    );
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
    const originalLanguage = language;
    const contentOriginal = content;

    let contentEN = content;
    let contentAR = content;
    let contentKU = content;

    if (language === 'en') {
      contentEN = content;
      contentAR = `${content} (مترجم)`;
      contentKU = `${content} (وەرگێڕدراو)`;
    } else if (language === 'ar') {
      contentAR = content;
      contentEN = `${content} (Auto-translated)`;
      contentKU = `${content} (وەرگێڕدراو)`;
    } else if (language === 'ku') {
      contentKU = content;
      contentEN = `${content} (Auto-translated)`;
      contentAR = `${content} (مترجم)`;
    }

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      authorName: userProfile.name,
      authorRole: userProfile.role,
      authorAvatar: userProfile.avatar,
      content,
      
      // Multilingual structural bindings
      original_language: originalLanguage,
      content_original: contentOriginal,
      content_en: contentEN,
      content_ar: contentAR,
      content_ku: contentKU,

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

  const handleAddNewPost = (title: string, body: string, anonymous: boolean, customType = 'post', imageUrl?: string, governorateId?: string, universityId?: string) => {
    // Generate original and translated contents
    const originalLanguage = language;
    const titleOriginal = title;
    const bodyOriginal = body;

    let titleEN = title;
    let titleAR = title;
    let titleKU = title;
    let contentEN = body;
    let contentAR = body;
    let contentKU = body;

    if (language === 'en') {
      titleEN = title;
      contentEN = body;
      titleAR = `${title} (مترجم للطلاب)`;
      contentAR = `${body}\n\n[تم الترجمة تلقائياً إلى العربية عبر خادم الطلاب]`;
      titleKU = `${title} (وەرگێڕدراو)`;
      contentKU = `${body}\n\n[بە شیوازێکی ئۆتۆماتیکی وەرگێڕدراوە بۆ کوردی]`;
    } else if (language === 'ar') {
      titleAR = title;
      contentAR = body;
      titleEN = `${title} (Auto-translated)`;
      contentEN = `${body}\n\n[Auto-translated to English via Jamiaati Translate Engine]`;
      titleKU = `${title} (وەرگێڕدراو)`;
      contentKU = `${body}\n\n[بە شیوازێکی ئۆتۆماتیکی وەرگێڕدراوە بۆ کوردی]`;
    } else if (language === 'ku') {
      titleKU = title;
      contentKU = body;
      titleEN = `${title} (Auto-translated)`;
      contentEN = `${body}\n\n[Auto-translated to English via Jamiaati Translate Engine]`;
      titleAR = `${title} (مترجم للطلاب)`;
      contentAR = `${body}\n\n[تم الترجمة تلقائياً إلى العربية عبر خادم الطلاب]`;
    }

    const freshPost: FeedItem = {
      id: `custom-${Date.now()}`,
      type: customType as any,
      
      // Traditional localized fields for display fallbacks
      titleEN,
      titleAR,
      titleKU,
      contentEN,
      contentAR,
      contentKU,

      // High-end localization spec data model fields
      original_language: originalLanguage,
      title_original: titleOriginal,
      body_original: bodyOriginal,
      title_en: titleEN,
      body_en: contentEN,
      title_ar: titleAR,
      body_ar: contentAR,
      title_ku: titleKU,
      body_ku: contentKU,

      imageUrl: imageUrl || undefined,
      author: anonymous ? {
        name: language === 'ar' ? 'مجهول' : language === 'ku' ? 'نەناسراو' : 'Anonymous',
        role: 'student',
        avatar: defaultUserProfile.avatar
      } : {
        name: userProfile.name,
        role: userProfile.role,
        avatar: userProfile.avatar,
        university: IraqiUniversities.find(u => u.id === (universityId || userProfile.universityId || ''))?.nameEN || ''
      },
      date: 'Just now',
      likes: 0,
      commentsCount: 0,
      commentsList: [],
      likedByUser: true,
      governorateId: governorateId || (selectedGov === 'all' ? userProfile.governorateId : selectedGov),
      universityId: universityId || (selectedUni === 'all' ? userProfile.universityId : selectedUni),
      category: 'post',
      sourceType: 'student_share',
      moodTag: '',
      tags: customType === 'anonymous_question' ? ['Advising'] : []
    };

    handleAwardPoints(40); // high points for sharing posts!
    showToast(
      language === 'ar' ? 'تم نشر مساهمتك بنجاح على ساحة الطلاب! ✨ +٤٠ نقطة' : language === 'ku' ? 'بڵاوکراوەکەت بڵاوکرایەوە لە ساحەی قوتابیان! ✨ +٤٠ خاڵ' : 'Contribution published successfully! ✨ +40 pts', 
      'success'
    );
    setFeedItems(prev => {
      const next = [freshPost, ...prev];
      writeCustomFeedItemsToBrowser(next);
      return next;
    });
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
    if (selectedSection) {
      return (
        <SectionView
          sectionId={selectedSection}
          language={language}
          selectedGov={selectedGov}
          setSelectedGov={setSelectedGov}
          selectedUni={selectedUni}
          setSelectedUni={setSelectedUni}
          onBackToHome={() => setSelectedSection(null)}
          onLike={handleLike}
          onSave={handleSave}
          onVote={handleVote}
          onApply={handleApply}
          onRsvp={handleRsvp}
          onJoinGroup={handleJoinGroup}
          onAddComment={handleAddComment}
          onEditFeedItem={handleEditFeedItem}
          onDeleteFeedItem={handleDeleteFeedItem}
          isAdminMode={hasAuthenticatedAdminAccess}
          onUserClick={setSelectedUserForProfileCard}
        />
      );
    }

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
            onEditFeedItem={handleEditFeedItem}
            onDeleteFeedItem={handleDeleteFeedItem}
            isAdminMode={hasAuthenticatedAdminAccess}
            onSelectSection={setSelectedSection}
            onUserClick={setSelectedUserForProfileCard}
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
            onEditFeedItem={handleEditFeedItem}
            onDeleteFeedItem={handleDeleteFeedItem}
            isAdminMode={hasAuthenticatedAdminAccess}
            onUserClick={setSelectedUserForProfileCard}
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
            onEditFeedItem={handleEditFeedItem}
            onDeleteFeedItem={handleDeleteFeedItem}
            isAdminMode={hasAuthenticatedAdminAccess}
            onUserClick={setSelectedUserForProfileCard}
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
            onEditFeedItem={handleEditFeedItem}
            onDeleteFeedItem={handleDeleteFeedItem}
            isAdminMode={hasAuthenticatedAdminAccess}
            onUserClick={setSelectedUserForProfileCard}
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
              localStorage.removeItem('jamiaati_token');
              localStorage.removeItem('admin_token');
              localStorage.removeItem('jamiaati_auth_user');
              localStorage.removeItem('jamiaati_user_email');
              setUserProfile(prev => ({ ...prev, role: 'student' }));
              showToast(
                language === 'ar' ? 'تم تسجيل خروجك بنجاح. نراك قريباً! 👋' : language === 'ku' ? 'خۆتۆمارکردنەکەت کۆتایی پێهات. بە هیوای دیدار! 👋' : 'Logged out successfully. See you! 👋', 
                'info'
              );
            }}
            onTriggerAuth={() => setIsAuthModalOpen(true)}
            onNavigateAdmin={() => setActiveTab('admin')}
            onEditFeedItem={handleEditFeedItem}
            onDeleteFeedItem={handleDeleteFeedItem}
            isAdminMode={hasAuthenticatedAdminAccess}
            onUserClick={setSelectedUserForProfileCard}
            onNavigateToSocialTab={(tabType) => {
              setSocialSubTab(tabType);
              setActiveTab('chats');
            }}
            incomingFriendRequestsCount={friendRequestsCount}
            incomingMessageRequestsCount={messageRequestsCount}
          />
        );
      case 'universities':
        return (
          <UniversitiesList
            language={language}
            selectedUni={selectedUni}
            setSelectedUni={setSelectedUni}
            selectedGov={selectedGov}
            setSelectedGov={setSelectedGov}
            institutions={institutions}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        );
      case 'admin':
        return (
          <>
            <AdminAutomation
              language={language}
              onBack={() => setActiveTab('profile')}
              showToast={showToast}
              userRole={hasAuthenticatedAdminAccess ? 'admin' : 'student'}
            />
            {hasAuthenticatedAdminAccess && (
              <AdminModeration
                language={language}
                showToast={showToast}
              />
            )}
          </>
        );
      case 'chats':
        return (
          <SocialHub
            language={language}
            isLoggedIn={isLoggedIn}
            onTriggerAuth={() => setIsAuthModalOpen(true)}
            showToast={showToast}
            onViewUserProfile={(usr) => {
              setSelectedUserForProfileCard(usr);
            }}
            currentUserId={isLoggedIn ? userProfile.id : undefined}
            currentUserName={isLoggedIn ? userProfile.name : undefined}
            initialTab={socialSubTab}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div id="jamiaati-portal" className="bg-[#FAF9FF] min-h-screen text-slate-800 antialiased font-sans" dir={isRTL ? 'rtl' : 'ltr'} lang={language}>
      {/* Centered device presentation mock */}
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 shadow-2xl relative flex flex-col border-x border-slate-205">
        
        {/* Dynamic Inner views container */}
        <main className="flex-1 overflow-y-auto bg-slate-50 pb-20">
          {/* Top Header Selector Component */}
          <Header
            language={language}
            setLanguage={setLanguage}
            currentUserAvatar={userProfile.avatar}
            onProfileClick={() => setActiveTab('profile')}
            onChatsClick={() => {
              setSocialSubTab('threads');
              setActiveTab('chats');
            }}
            incomingFriendRequestsCount={friendRequestsCount}
            incomingMessageRequestsCount={messageRequestsCount}
          />
          {renderActiveView()}
        </main>

        {/* Bottom Persistent Navigation Bar: Visible at all times */}
        <nav 
          id="persistent-bottom-navbar"
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 border-t border-slate-200 px-2 py-3 flex justify-around items-center backdrop-blur-md z-40 shadow-lg pointer-events-auto"
        >
          {/* TAB 1: Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl cursor-pointer transition-all duration-200 relative ${
              activeTab === 'home' 
                ? 'text-orange-600 font-extrabold scale-105' 
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100/40'
            }`}
          >
            <Home className="w-5 h-5 shrink-0" />
            <span className="text-[10px] leading-none font-bold">{getTranslation('navHome', language)}</span>
            {activeTab === 'home' && (
              <span className="absolute -bottom-1 w-1 h-3 rounded-full bg-orange-600" />
            )}
          </button>

          {/* TAB 2: Opportunities */}
          <button
            onClick={() => setActiveTab('future')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl cursor-pointer transition-all duration-200 relative ${
              activeTab === 'future' 
                ? 'text-orange-600 font-extrabold scale-105' 
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100/40'
            }`}
          >
            <Briefcase className="w-5 h-5 shrink-0" />
            <span className="text-[10px] leading-none font-bold">{getTranslation('opportunitiesTabLabel', language)}</span>
            {activeTab === 'future' && (
              <span className="absolute -bottom-1 w-1 h-3 rounded-full bg-orange-600" />
            )}
          </button>

          {/* TAB 3: Campus */}
          <button
            onClick={() => setActiveTab('life')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl cursor-pointer transition-all duration-200 relative ${
              activeTab === 'life' 
                ? 'text-orange-600 font-extrabold scale-105' 
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100/40'
            }`}
          >
            <Compass className="w-5 h-5 shrink-0" />
            <span className="text-[10px] leading-none font-bold">{getTranslation('campusLifeTabLabel', language)}</span>
            {activeTab === 'life' && (
              <span className="absolute -bottom-1 w-1 h-3 rounded-full bg-orange-600" />
            )}
          </button>

          {/* TAB 4: Universities */}
          <button
            onClick={() => setActiveTab('universities')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl cursor-pointer transition-all duration-200 relative ${
              activeTab === 'universities' 
                ? 'text-orange-600 font-extrabold scale-105' 
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100/40'
            }`}
          >
            <Sparkles className="w-5 h-5 shrink-0 text-orange-500" />
            <span className="text-[10px] leading-none font-bold">
              {language === 'ar' ? 'الجامعات' : language === 'ku' ? 'زانکۆکان' : 'Universities'}
            </span>
            {activeTab === 'universities' && (
              <span className="absolute -bottom-1 w-1 h-3 rounded-full bg-orange-600" />
            )}
          </button>

          {/* TAB 5: Profile */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl cursor-pointer transition-all duration-200 relative ${
              activeTab === 'profile' 
                ? 'text-orange-600 font-extrabold scale-105' 
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100/40'
            }`}
          >
            <div className="relative">
              <User className="w-5 h-5 shrink-0" />
              {isLoggedIn && (friendRequestsCount + messageRequestsCount) > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse" />
              )}
            </div>
            <span className="text-[10px] leading-none font-bold">{getTranslation('navProfile', language)}</span>
            {activeTab === 'profile' && (
              <span className="absolute -bottom-1 w-1 h-3 rounded-full bg-orange-600" />
            )}
          </button>
        </nav>

        {/* Global Auth Modal Portal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          language={language}
          onAuthSuccess={(newUsername, userEmail) => {
            setIsLoggedIn(true);
            localStorage.setItem('jamiaati_logged_in', 'true');
            localStorage.setItem('jamiaati_user_email', userEmail);
            setUserProfile(prev => ({
              ...prev,
              name: newUsername || '',
              role: userEmail.trim().toLowerCase() === 'mahdialmuntadhar1@gmail.com' ? 'staff' : prev.role
            }));
            showToast(
              language === 'ar' ? `مرحباً بك مجدداً يا ${newUsername || 'زارا'}! 👋 تم الدخول بنجاح` : language === 'ku' ? `بەخێربێیتەوە ${newUsername || 'زارا'}! 👋 دابەزاندن سەرکەوتوو بوو` : `Welcome back, ${newUsername || 'Zara'}! 👋 Signed in`, 
              'success'
            );
          }}
        />

        {/* User Profile Details Modal (Student Discovery) */}
        <AnimatePresence>
          {selectedUserForProfileCard && (
            <UserProfileModal
              isOpen={true}
              user={selectedUserForProfileCard}
              currentUser={isLoggedIn ? userProfile : null}
              onClose={() => setSelectedUserForProfileCard(null)}
              language={language}
              isLoggedIn={isLoggedIn}
              onTriggerAuth={() => setIsAuthModalOpen(true)}
              showToast={showToast}
              onOpenDirectChat={(recipientId, recipientName) => {
                setSelectedUserForProfileCard(null);
                setActiveTab('chats');
                localStorage.setItem('jamiaati_pending_chat_recipient_id', recipientId);
                localStorage.setItem('jamiaati_pending_chat_recipient_name', recipientName);
                // Dispatch a storage event or tab change notification
                window.dispatchEvent(new Event('jamiaati_switch_chat'));
              }}
            />
          )}
        </AnimatePresence>

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














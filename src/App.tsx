import React, { useState, useEffect } from 'react';
import { Language, FeedItem, UserProfile, Comment } from './types';
import { defaultUserProfile, IraqiUniversities, IraqiGovernorates } from './data/mockData';
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
import { AuthUser, BACKEND_URL, authApi, userContentApi } from './lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Sparkles, HelpCircle, Briefcase, User, Compass, Info, FileText } from 'lucide-react';

export default function App() {
  const opportunityTypes = new Set(['job', 'internship', 'scholarship', 'training', 'competition', 'volunteering', 'fellowship', 'full_time_job', 'part_time_job']);
  // Locale States
  const [language, setLanguage] = useState<Language>('ar');
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
  const [activeTab, setActiveTab] = useState<'home' | 'life' | 'ask' | 'future' | 'profile' | 'admin'>('home');

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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => Boolean(localStorage.getItem('jamiaati_token')));
  const [isAdminVerified, setIsAdminVerified] = useState<boolean>(false);
  const [authUserRole, setAuthUserRole] = useState<string>('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const isAdminRole = (role?: string) => role === 'admin' || role === 'staff' || role === 'super_admin';
  const toProfileRole = (role?: string): UserProfile['role'] => {
    if (role === 'graduate' || role === 'teacher' || role === 'institution') return role;
    if (isAdminRole(role)) return 'staff';
    return 'student';
  };
  const clearAuthSession = () => {
    setIsLoggedIn(false);
    setIsAdminVerified(false);
    setAuthUserRole('');
    localStorage.removeItem('jamiaati_logged_in');
    localStorage.removeItem('jamiaati_token');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('jamiaati_user');
    localStorage.removeItem('jamiaati_profile_v2');
    setUserProfile(defaultUserProfile);
  };
  const applyAuthSession = (token: string, user: AuthUser) => {
    localStorage.setItem('jamiaati_token', token);
    localStorage.setItem('jamiaati_user', JSON.stringify(user));
    localStorage.removeItem('admin_token');
    localStorage.removeItem('jamiaati_logged_in');
    setIsLoggedIn(true);
    setIsAdminVerified(isAdminRole(user.role));
    setAuthUserRole(user.role || '');
    setUserProfile(prev => ({
      ...prev,
      id: user.id || prev.id,
      name: user.name || prev.name || 'طالب جامعتي',
      role: toProfileRole(user.role)
    }));
  };

  // Feed database state (persisted in session / local storage for active play)
  const [feedItems, setFeedItems] = useState<FeedItem[]>(() => {
    const saved = localStorage.getItem('jamiaati_feed_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Keep only user-created custom posts and discard any leaked scraped/mock/highlight records
          return parsed.filter((item: any) => item.id && String(item.id).startsWith('custom-'));
        }
      } catch (e) {
        console.error("Error reading custom feed from storage:", e);
      }
    }
    return [];
  });

  // User profile state (gamification & badges tracker)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('jamiaati_token') ? localStorage.getItem('jamiaati_profile_v2') : null;
    return saved ? JSON.parse(saved) : defaultUserProfile;
  });

  useEffect(() => {
    const token = localStorage.getItem('jamiaati_token');
    if (!token) {
      clearAuthSession();
      return;
    }

    let cancelled = false;
    authApi.me(language)
      .then((result) => {
        if (cancelled) return;
        const user = result?.user as AuthUser | undefined;
        if (!user) {
          clearAuthSession();
          return;
        }
        applyAuthSession(token, user);
      })
      .catch(() => {
        if (!cancelled) {
          clearAuthSession();
          if (activeTab === 'admin') setActiveTab('profile');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Sync to local states - save only user-created custom posts
  useEffect(() => {
    const customOnly = feedItems.filter(item => item.id && String(item.id).startsWith('custom-'));
    localStorage.setItem('jamiaati_feed_v2', JSON.stringify(customOnly));
  }, [feedItems]);

  // Institutions Dynamic Loading States
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [institutionsLoading, setInstitutionsLoading] = useState<boolean>(true);
  const [institutionsError, setInstitutionsError] = useState<string | null>(null);
  const [feedApiError, setFeedApiError] = useState<string | null>(null);

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
        const list = Array.isArray(json.institutions) ? json.institutions : [];
        all = all.concat(list);
        const pag = json.pagination || {};
        offset += list.length;
        hasMore = Boolean(pag.hasMore) && list.length > 0 && all.length < Number(pag.total || 0);
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
        let nameKU = inst.name_ku?.trim() || inst.name_en?.trim() || inst.name_ar?.trim() || 'دامەزراوەی نەناسراو';

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
        setFeedApiError(null);
        const token = localStorage.getItem('jamiaati_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const [oppsResponse, highlightsResponse] = await Promise.all([
          fetch(`${BACKEND_URL}/api/opportunities?limit=50`, { headers }),
          fetch(`${BACKEND_URL}/api/highlights?limit=50`, { headers })
        ]);

        let dbItems: FeedItem[] = [];

        // 1. Process Opportunities
        if (oppsResponse.ok) {
          const payload = await oppsResponse.json();
          const list = Array.isArray(payload?.opportunities) ? payload.opportunities : [];
          if (Array.isArray(list)) {
            const mappedOpps = list.map((item: any) => ({
              id: String(item.id || `scraped-${Date.now()}-${Math.random()}`),
              type: (item.category || item.type || 'job') as any,
              titleEN: item.title || item.titleEN || 'Untitled Opportunity',
              titleAR: item.title || item.titleAR || 'فرصة غير معنونة',
              titleKU: item.title || item.titleKU || 'هەلی بێ ناونیشان',
              contentEN: item.description || item.summary || item.contentEN || 'Check original portal for instructions.',
              contentAR: item.description || item.summary || item.contentAR || 'يرجى مراجعة المصدر الأصلي لمعلومات التقديم.',
              contentKU: item.description || item.summary || item.contentKU || 'تکایە سەرچاوەی سەرەکی ببینە بۆ زانیاری.',
              author: {
                name: item.organization || item.institution_name || 'Scraped Recruiter',
                role: 'institution' as const,
                avatar: item.institution_logo || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=100',
                verified: true
              },
              date: item.published_date ? `Published on ${item.published_date}` : 'Recently published',
              likes: Number(item.likes || 0),
              likedByUser: Boolean(item.likedByUser),
              savedByUser: Boolean(item.savedByUser),
              applied: Boolean(item.applied),
              commentsCount: Number(item.commentsCount || 0),
              commentsList: [],
              governorateId: item.governorateId || item.governorate || 'all',
              universityId: item.universityId || item.university_id || 'all',
              tags: item.tags || ['scraped', item.category || 'career'],
              company: item.organization || item.institution_name,
              companyLogo: item.institution_logo || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=100',
              location: item.location || item.city || 'Iraq',
              deadline: item.deadline || 'August 2026',
              imageUrl: item.imageUrl || item.image_url,
              opportunityCategory: (item.category === 'internship' ? 'Internship' : 
                                     item.category === 'scholarship' ? 'Scholarship' : 
                                     item.category === 'training' ? 'Training' : 
                                     item.category === 'volunteering' ? 'Volunteering' : 
                                     item.category === 'competition' ? 'Competition' : 
                                     item.category === 'graduation_support' ? 'Graduation project support' : 'Full-time graduate job') as any,
              workplaceType: item.workplaceType || 'On-site',
              whoCanApply: item.eligibility || item.whoCanApply || 'Iraqi students',
              salary: item.salary || item.salary_or_funding || 'Recruiter structured',
              savedCount: Number(item.savedCount || 0),
              universityAppliedCount: Number(item.universityAppliedCount || 0)
            }));
            dbItems = [...dbItems, ...mappedOpps];
          }
        } else {
          throw new Error(`Opportunities API returned HTTP ${oppsResponse.status}`);
        }

        // 2. Process Highlights
        if (highlightsResponse.ok) {
          const highlightsPayload = await highlightsResponse.json();
          const hList = Array.isArray(highlightsPayload?.highlights) ? highlightsPayload.highlights : [];
          if (Array.isArray(hList)) {
            const mappedHighlights = hList.map((item: any) => ({
              id: String(item.id || `highlight-${Date.now()}-${Math.random()}`),
              type: (item.category || 'news') as any,
              titleEN: item.title || item.titleEN || 'Campus Notification',
              titleAR: item.title || item.titleAR || 'تنبيه جامعي',
              titleKU: item.title || item.titleKU || 'ئاگاداری خوێندکاران',
              contentEN: item.summary || item.contentEN || 'Check original university channel for details.',
              contentAR: item.summary || item.contentAR || 'يرجى مراجعة القناة الرسمية للمزيد من التفاصيل.',
              contentKU: item.summary || item.contentKU || 'تکایە سەرچاوەی فەرمی ببینە بۆ زانیاری.',
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
        } else {
          throw new Error(`Highlights API returned HTTP ${highlightsResponse.status}`);
        }

        setFeedItems(prev => {
          const customOnly = prev.filter(p => p.id && String(p.id).startsWith('custom-'));
          return [...customOnly, ...dbItems];
        });

      } catch (err: any) {
        console.error("Error loading approved scraped opportunities and highlights:", err);
        setFeedApiError(err.message || 'Failed to load live feed from backend.');
        setFeedItems(prev => {
          const customOnly = prev.filter(p => p.id && String(p.id).startsWith('custom-'));
          return customOnly;
        });
      }
    };
    fetchLiveFeed();
  }, [activeTab]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const result = isLoggedIn
          ? await userContentApi.getFeed({ limit: 50 }, language)
          : await userContentApi.getPosts(language);
        const posts = result?.posts || [];
        const mappedPosts: FeedItem[] = posts.map((post: any) => ({
          id: post.id,
          type: post.type || 'post',
          titleEN: post.titleEN || post.title || '',
          titleAR: post.titleAR || post.title || '',
          titleKU: post.titleKU || post.title || '',
          contentEN: post.contentEN || post.content || '',
          contentAR: post.contentAR || post.content || '',
          contentKU: post.contentKU || post.content || '',
          author: {
            id: post.userId,
            name: post.anonymous ? 'Anonymous Student' : (post.authorName || 'Student'),
            role: post.authorRole === 'admin' ? 'staff' : (post.authorRole || 'student'),
            avatar: post.anonymous ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100' : userProfile.avatar
          },
          date: post.createdAt ? `Posted on ${post.createdAt.split('T')[0]}` : 'Recently posted',
          rawDate: post.createdAt,
          likes: Number(post.likes || 0),
          commentsCount: Number(post.commentsCount || 0),
          commentsList: post.commentsList || [],
          likedByUser: Boolean(post.likedByUser),
          savedByUser: Boolean(post.savedByUser),
          governorateId: post.governorateId || 'all',
          universityId: post.universityId || 'all',
          imageUrl: post.imageUrl || undefined
        }));

        setFeedItems(prev => {
          const nonBackendPosts = prev.filter(item => !String(item.id).startsWith('post-'));
          return [...mappedPosts, ...nonBackendPosts];
        });
      } catch (err) {
        console.warn('Could not hydrate backend posts; using local cache only.', err);
      }
    };

    fetchUserPosts();
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('jamiaati_profile_v2', JSON.stringify(userProfile));
      void userContentApi.updateProfile(userProfile, language).catch(() => {
        // Local cache remains responsive; backend will retry on the next profile change.
      });
    } else {
      localStorage.removeItem('jamiaati_profile_v2');
    }
  }, [userProfile, isLoggedIn, language]);

  // Adjust application alignment automatically based on language direction
  const isRTL = language === 'ar' || language === 'ku';

  // State modification events
  const handleLike = (id: string) => {
    if (isLoggedIn) {
      void userContentApi.toggleLike(id, language).catch((err) => {
        showToast(err.message, 'error');
      });
    }
    let triggeredToast = false;
    setFeedItems(prev => prev.map(item => {
      if (item.id === id) {
        const isLiked = !item.likedByUser;
        if (!triggeredToast) {
          triggeredToast = true;
          if (isLiked) {
            handleAwardPoints(5);
            showToast(
              language === 'ar' ? 'تم الإعجاب بالمنشور. +5 نقاط' : language === 'ku' ? 'بابەتەکە بەدڵ بوو. +5 خاڵ' : 'Post liked. +5 pts',
              'success'
            );
          } else {
            showToast(
              language === 'ar' ? 'تم إلغاء الإعجاب بالمنشور' : language === 'ku' ? 'دڵخواز لە بابەتەکە لادرا' : 'Removed like from post',
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
    setFeedItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          ...updatedFields
        };
      }
      return item;
    }));
    showToast(
      language === 'ar' ? 'تم تحديث المنشور بنجاح! ✏️' : 'Post updated successfully by admin! ✏️', 
      'success'
    );
  };

  const handleDeleteFeedItem = (id: string) => {
    setFeedItems(prev => prev.filter(item => item.id !== id));
    if (isLoggedIn) {
      void userContentApi.deletePost(id, language).catch((err) => {
        showToast(err.message, 'error');
      });
    }
    showToast(
      language === 'ar' ? 'تم حذف المنشور بنجاح! 🗑️' : 'Post deleted successfully by admin! 🗑️', 
      'success'
    );
  };

  const handleSave = (id: string) => {
    if (isLoggedIn) {
      void userContentApi.toggleSave(id, language).catch((err) => {
        showToast(err.message, 'error');
      });
    }
    let triggeredToast = false;
    setFeedItems(prev => prev.map(item => {
      if (item.id === id) {
        const isSaved = !item.savedByUser;
        if (!triggeredToast) {
          triggeredToast = true;
          if (isSaved) {
            handleAwardPoints(10);
            showToast(
              language === 'ar' ? 'تم الحفظ في مكتبتك. +10 نقاط' : language === 'ku' ? 'لە کتێبخانەکەت پاشەکەوت کرا. +10 خاڵ' : 'Saved to your library. +10 pts',
              'success'
            );
          } else {
            showToast(
              language === 'ar' ? 'تمت الإزالة من المحفوظات' : language === 'ku' ? 'لە پاشەکەوتکراوەکان لادرا' : 'Removed bookmark',
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
            language === 'ar' ? 'تم تسجيل رأيك. +25 نقطة' : language === 'ku' ? 'دەنگەکەت تۆمارکرا. +25 خاڵ' : 'Feedback vote recorded. +25 pts',
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
    if (isLoggedIn) {
      void userContentApi.toggleApply(id, language).catch((err) => {
        showToast(err.message, 'error');
      });
    }
    let triggeredToast = false;
    setFeedItems(prev => prev.map(item => {
      if (item.id === id) {
        const isApplied = !item.applied;
        if (!triggeredToast) {
          triggeredToast = true;
          if (isApplied) {
            handleAwardPoints(50); // Massive career action reward!
            showToast(
              language === 'ar' ? 'تم تسجيل طلب التقديم بنجاح. +50 نقطة' : language === 'ku' ? 'داواکارییەکەت بە سەرکەوتوویی تۆمارکرا. +50 خاڵ' : 'Application registered successfully. +50 pts',
              'success'
            );
          } else {
            showToast(
              language === 'ar' ? 'تم إلغاء طلب التقديم' : language === 'ku' ? 'داواکارییەکەت هەڵوەشێنرایەوە' : 'Cancelled application request',
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
              language === 'ar' ? 'تم تأكيد الحضور. +30 نقطة' : language === 'ku' ? 'ئامادەبوون پشتڕاستکرایەوە. +30 خاڵ' : 'Attendance confirmed. +30 pts',
              'success'
            );
          } else {
            showToast(
              language === 'ar' ? 'تم إلغاء تأكيد الحضور' : language === 'ku' ? 'پشتڕاستکردنەوەی ئامادەبوون هەڵوەشێنرایەوە' : 'Reservation cancelled',
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
              language === 'ar' ? 'انضممت إلى مجموعة المراجعة. +30 نقطة' : language === 'ku' ? 'پەیوەست بوویت بە گرووپی گفتوگۆ. +30 خاڵ' : 'Joined study circle. +30 pts',
              'success'
            );
          } else {
            showToast(
              language === 'ar' ? 'غادرت مجموعة المراجعة' : language === 'ku' ? 'گرووپی خوێندنەکەت جێهێشت' : 'Left study circle',
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
      language === 'ar' ? 'تم نشر تعليقك. +15 نقطة' : language === 'ku' ? 'لێدوانەکەت بڵاوکرایەوە. +15 خاڵ' : 'Comment posted. +15 pts',
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
    if (isLoggedIn) {
      void userContentApi.addComment(itemId, content, userProfile.avatar, language).catch((err) => {
        showToast(err.message, 'error');
      });
    }
  };

  const handleAddNewPost = (title: string, body: string, anonymous: boolean, customType = 'post', imageUrl?: string) => {
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
        id: userProfile.id,
        name: 'Anonymous Student',
        role: 'student',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'
      } : {
        id: userProfile.id,
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
      language === 'ar' ? 'تم نشر مساهمتك بنجاح. +40 نقطة' : language === 'ku' ? 'بەشدارییەکەت بە سەرکەوتوویی بڵاوکرایەوە. +40 خاڵ' : 'Contribution published successfully. +40 pts',
      'success'
    );
    setFeedItems(prev => [freshPost, ...prev]);
    if (isLoggedIn) {
      void userContentApi.createPost({
        title,
        content: body,
        anonymous,
        type: customType,
        governorateId: selectedGov === 'all' ? userProfile.governorateId : selectedGov,
        universityId: selectedUni === 'all' ? userProfile.universityId : selectedUni
      }, language).then((result) => {
        const backendPost = result?.post;
        if (!backendPost) return;
        setFeedItems(prev => prev.map(item => item.id === freshPost.id ? {
          ...item,
          id: backendPost.id,
          rawDate: backendPost.createdAt,
          likes: Number(backendPost.likes || 0),
          commentsCount: Number(backendPost.commentsCount || 0),
          commentsList: backendPost.commentsList || [],
          likedByUser: Boolean(backendPost.likedByUser),
          imageUrl: undefined
        } : item));
        if (backendPost.status === 'pending_review') {
          showToast(
            language === 'ar'
              ? 'تم حفظ المنشور المجهول للمراجعة قبل النشر.'
              : language === 'ku'
              ? 'بابەتی نادیار بۆ پێداچوونەوە پاشەکەوت کرا.'
              : 'Anonymous post saved for moderation before publishing.',
            'info'
          );
        }
      }).catch((err) => {
        showToast(err.message, 'error');
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

  // Public safety: role switching is disabled in production. Roles must come from backend auth.
  const handleRoleToggle = () => {
    showToast(
      language === 'ar'
        ? 'تغيير الدور غير متاح في النسخة العامة. صلاحيات المسؤول تأتي من الخادم فقط.'
        : language === 'ku'
        ? 'گۆڕینی ڕۆڵ لە وەشانی گشتی داخراوە. دەسەڵاتی بەڕێوەبەر تەنها لە سێرڤەرەوە دێت.'
        : 'Role switching is disabled in the public app. Admin access must come from the backend.',
      'info'
    );
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
          isAdminMode={isAdminVerified}
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
            isAdminMode={isAdminVerified}
            onSelectSection={setSelectedSection}
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
            isAdminMode={isAdminVerified}
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
            isAdminMode={isAdminVerified}
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
            isAdminMode={isAdminVerified}
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
              clearAuthSession();
              showToast(
                language === 'ar' ? 'تم تسجيل الخروج بنجاح.' : language === 'ku' ? 'بە سەرکەوتوویی چوویتە دەرەوە.' : 'Logged out successfully.',
                'info'
              );
            }}
            onTriggerAuth={() => setIsAuthModalOpen(true)}
            onNavigateAdmin={isAdminVerified ? () => setActiveTab('admin') : undefined}
            onEditFeedItem={handleEditFeedItem}
            onDeleteFeedItem={handleDeleteFeedItem}
            isAdminMode={isAdminVerified}
          />
        );
      case 'admin':
        return (
          <AdminAutomation
            language={language}
            onBack={() => setActiveTab('profile')}
            showToast={showToast}
            userRole={isAdminVerified ? authUserRole : 'student'}
          />
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
          {feedApiError && (
            <div className="mx-4 mt-3 rounded-2xl border border-rose-500/30 bg-rose-950/30 px-3 py-2 text-[10px] font-bold text-rose-200">
              {language === 'ar' ? `تعذر تحميل الخلاصة من الخادم: ${feedApiError}` : language === 'ku' ? `بارکردنی فید لە سێرڤەر سەرکەوتوو نەبوو: ${feedApiError}` : `Could not load live feed from backend: ${feedApiError}`}
            </div>
          )}
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
          {false && <button
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
          </button>}

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
          {false && <button
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
          </button>}

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
          onAuthSuccess={(newUsername, token, role, user) => {
            if (!token) {
              clearAuthSession();
              return;
            }
            applyAuthSession(token, user || {
              id: userProfile.id,
              name: newUsername || userProfile.name || 'طالب جامعتي',
              email: '',
              role: role || 'student'
            });
            showToast(
              language === 'ar' ? `مرحباً بك ${newUsername || 'زائر'}، تم الدخول بنجاح` : language === 'ku' ? `بەخێربێیتەوە ${newUsername || 'میوان'}، چوونەژوورەوە سەرکەوتوو بوو` : `Welcome back, ${newUsername || 'Guest'}! Signed in`,
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
                      {toast.type === 'success' ? 'OK' : toast.type === 'error' ? '!' : 'i'}
                    </span>
                    <span className="leading-relaxed tracking-tight text-[11px] text-left">
                      {toast.text}
                    </span>
                  </div>
                  <button 
                    onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                    className="text-slate-400 hover:text-white transition-colors p-1 bg-transparent border-0 cursor-pointer text-[10px] font-black"
                  >
                    ×
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

import React, { useState, useEffect } from 'react';
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
import { BACKEND_URL } from './lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Sparkles, HelpCircle, Briefcase, User, Compass, Info, FileText } from 'lucide-react';
// Public launch mode keeps the first release simple.
// It hides staff/admin editing, scraper console, and outreach-related public access.
// Admin/outreach backend code remains in the repo for later controlled use.
const PUBLIC_LAUNCH_MODE = true;


export default function App() {
  // Locale States
  const [language, setLanguage] = useState<Language>('en');
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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => localStorage.getItem('jamiaati_logged_in') !== 'false');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
    const saved = localStorage.getItem('jamiaati_profile_v2');
    return saved ? JSON.parse(saved) : defaultUserProfile;
  });

  // Sync to local states - save only user-created custom posts
  useEffect(() => {
    const customOnly = feedItems.filter(item => item.id && String(item.id).startsWith('custom-'));
    localStorage.setItem('jamiaati_feed_v2', JSON.stringify(customOnly));
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
        
        let logo = 'ðŸŽ“';
        const type = (inst.type || '').toLowerCase();
        if (type.includes('private')) logo = 'ðŸ›ï¸';
        else if (type.includes('college')) logo = 'ðŸ“–';
        else if (type.includes('school')) logo = 'ðŸ«';
        else if (type.includes('division') || type.includes('department')) logo = 'ðŸ”¬';
        else if (type.includes('institute') || type.includes('research')) logo = 'ðŸ›¡ï¸';
        
        const charSum = inst.id.split('').reduce((sum: number, c: string) => sum + c.charCodeAt(0), 0);
        const color = colors[charSum % colors.length];

        const nameEN = inst.name_en?.trim() || inst.name_ar?.trim() || 'Unnamed Institution';
        let nameAR = inst.name_ar?.trim() || inst.name_en?.trim() || 'Ù…Ø¤Ø³Ø³Ø© ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙØ©';
        let nameKU = inst.name_ku?.trim() || inst.name_en?.trim() || inst.name_ar?.trim() || 'Ù…Ø¤Ø³Ø³Û•ÛŒ Ù†Û•Ù†Ø§Ø³Ø±Ø§Ùˆ';

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
            const mappedOpps = list.map((item: any) => {
              const category = item.category || item.type || 'job';
              const actionUrl = item.apply_url || item.source_url || item.application_link;

              return {
                id: String(item.id || `scraped-${Date.now()}-${Math.random()}`),
                type: category as any,
                titleEN: item.title || item.titleEN || 'Untitled Opportunity',
                titleAR: item.title || item.titleAR || 'ÙØ±ØµØ© ØºÙŠØ± Ù…Ø¹Ù†ÙˆÙ†Ø©',
                titleKU: item.title || item.titleKU || 'Ù‡Û•Ù„ÛŒ Ø¨ÛŽ Ù†Ø§ÙˆÙ†ÛŒØ´Ø§Ù†',
                contentEN: item.description || item.summary || item.contentEN || 'Check original portal for instructions.',
                contentAR: item.description || item.summary || item.contentAR || 'ÙŠØ±Ø¬Ù‰ Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„Ù…ØµØ¯Ø± Ø§Ù„Ø£ØµÙ„ÙŠ Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„ØªÙ‚Ø¯ÙŠÙ….',
                contentKU: item.description || item.summary || item.contentKU || 'ØªÚ©Ø§ÛŒÛ• Ø³Û•Ø±Ú†Ø§ÙˆÛ•ÛŒ Ø³Û•Ø±Û•Ú©ÛŒ Ø¨Ø¨ÛŒÙ†Û• Ø¨Û† Ø²Ø§Ù†ÛŒØ§Ø±ÛŒ.',
                author: {
                  name: item.organization || item.institution_name || 'Scraped Recruiter',
                  role: 'institution' as const,
                  avatar: item.institution_logo || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=100',
                  verified: true
                },
                date: item.published_date ? `Posted on ${item.published_date}` : 'Recently posted ðŸ””',
                likes: item.likes || 12,
                commentsCount: 0,
                commentsList: [],
                governorateId: normalizeGovernorate(item.governorateId || item.governorate),
                universityId: item.universityId || item.university_id || item.institution_id || 'all',
                tags: item.tags || ['opportunity', category],
                original_source_url: item.source_url,
                application_link: actionUrl,
                company: item.organization || item.institution_name,
                companyLogo: item.institution_logo || 'ðŸ’¼',
                location: item.location || item.city || item.governorate || 'Iraq-wide',
                deadline: item.deadline || undefined,
                imageUrl: item.imageUrl || item.image_url,
                opportunityCategory: (category === 'internship' ? 'Internship' :
                                      category === 'scholarship' ? 'Scholarship' :
                                      category === 'training' ? 'Training' :
                                      category === 'volunteering' ? 'Volunteering' :
                                      category === 'competition' ? 'Competition' :
                                      category === 'graduation_support' ? 'Graduation project support' : 'Full-time graduate job') as any,
                workplaceType: item.workplaceType || 'On-site',
                whoCanApply: item.eligibility || item.whoCanApply || 'Iraqi students',
                salary: item.salary || item.salary_or_funding || undefined
              };
            });
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
              titleEN: item.title || item.titleEN || 'Campus Notification',
              titleAR: item.title || item.titleAR || 'ØªÙ†Ø¨ÙŠÙ‡ Ø¬Ø§Ù…Ø¹ÙŠ',
              titleKU: item.title || item.titleKU || 'Ø¦Ø§Ú¯Ø§Ø¯Ø§Ø±ÛŒ Ø®ÙˆÛŽÙ†Ø¯Ú©Ø§Ø±Ø§Ù†',
              contentEN: item.summary || item.contentEN || 'Check original university channel for details.',
              contentAR: item.summary || item.contentAR || 'ÙŠØ±Ø¬Ù‰ Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„Ù‚Ù†Ø§Ø© Ø§Ù„Ø±Ø³Ù…ÙŠØ© Ù„Ù„Ù…Ø²ÙŠØ¯ Ù…Ù† Ø§Ù„ØªÙØ§ØµÙŠÙ„.',
              contentKU: item.summary || item.contentKU || 'ØªÚ©Ø§ÛŒÛ• Ø³Û•Ø±Ú†Ø§ÙˆÛ•ÛŒ ÙÛ•Ø±Ù…ÛŒ Ø¨Ø¨ÛŒÙ†Û• Ø¨Û† Ø²Ø§Ù†ÛŒØ§Ø±ÛŒ.',
              author: {
                name: item.organization || 'Academic Center Feed',
                role: 'institution' as const,
                avatar: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=100',
                verified: true
              },
              date: item.created_at ? `Posted on ${new Date(item.created_at).toLocaleDateString()}` : 'Recently posted ðŸ””',
              likes: item.likes || 15,
              commentsCount: 0,
              commentsList: [],
              governorateId: normalizeGovernorate(item.governorate || item.governorateId),
              universityId: item.university_id || item.universityId || 'all',
              tags: ['Campus', item.category || 'highlights'],
              imageUrl: item.image_url || item.imageUrl,
              original_source_url: item.source_url,
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
              language === 'ar' ? 'ØªÙ… Ø§Ù„Ø¥Ø¹Ø¬Ø§Ø¨ Ø¨Ø§Ù„Ù…Ù†Ø´ÙˆØ±! â¤ï¸ +Ù¥ Ù†Ù‚Ø§Ø· ØªÙØ§Ø¹Ù„' : language === 'ku' ? 'Ø¯ÚµØ®ÙˆØ§Ø² Ø¨ÙˆÙˆ! â¤ï¸ +Ù¥ Ø®Ø§ÚµÛŒ Ú©Ø§Ø±Ù„ÛŽÚ©' : 'Post Liked! â¤ï¸ +5 pts', 
              'success'
            );
          } else {
            showToast(
              language === 'ar' ? 'ØªÙ… Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ø¥Ø¹Ø¬Ø§Ø¨ Ø¨Ø§Ù„Ù…Ù†Ø´ÙˆØ±' : language === 'ku' ? 'Ù„Ø§Ø¯Ø§Ù†ÛŒ Ø¯ÚµØ®ÙˆØ§Ø² Ù„Û• Ø¨Ø§Ø¨Û•ØªÛ•Ú©Û•' : 'Removed like from post', 
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
      language === 'ar' ? 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…Ù†Ø´ÙˆØ± Ø¨Ù†Ø¬Ø§Ø­! âœï¸' : 'Post updated successfully by admin! âœï¸', 
      'success'
    );
  };

  const handleDeleteFeedItem = (id: string) => {
    setFeedItems(prev => prev.filter(item => item.id !== id));
    showToast(
      language === 'ar' ? 'ØªÙ… Ø­Ø°Ù Ø§Ù„Ù…Ù†Ø´ÙˆØ± Ø¨Ù†Ø¬Ø§Ø­! ðŸ—‘ï¸' : 'Post deleted successfully by admin! ðŸ—‘ï¸', 
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
              language === 'ar' ? 'ØªÙ… Ø§Ù„Ø­ÙØ¸ ÙÙŠ Ø§Ù„Ù…Ø­ÙØ¸Ø© Ø§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠØ©! ðŸ”– +Ù¡Ù  Ù†Ù‚Ø§Ø·' : language === 'ku' ? 'Ù¾Ø§Ø´Û•Ú©Û•ÙˆØªÚ©Ø±Ø§ Ù„Û• Ø¬Ø²Ø¯Ø§Ù†ÛŒ Ø¦Û•Ú©Ø§Ø¯ÛŒÙ…ÛŒ! ðŸ”– +Ù¡Ù  Ø®Ø§Úµ' : 'Saved to Hub Library! ðŸ”– +10 pts', 
              'success'
            );
          } else {
            showToast(
              language === 'ar' ? 'ØªÙ…Øª Ø§Ù„Ø¥Ø²Ø§Ù„Ø© Ù…Ù† Ø§Ù„Ù…ÙØ¶Ù„Ø© Ø§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠØ©' : language === 'ku' ? 'Ù„Ø§Ø¯Ø§Ù†ÛŒ Ù„Û• Ù¾Ø§Ø´Û•Ú©Û•ÙˆØªÚ©Ø±Ø§ÙˆÛ•Ú©Ø§Ù†' : 'Removed bookmark', 
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
            language === 'ar' ? 'ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø±Ø£ÙŠÙƒ Ø§Ù„Ø·Ù„Ø§Ø¨ÙŠ Ø¨Ù†Ø¬Ø§Ø­! ðŸ“Š +Ù¢Ù¥ Ù†Ù‚Ø·Ø© Ù…Ø³Ø§Ù‡Ù…Ø©' : language === 'ku' ? 'Ø¯Û•Ù†Ú¯Û•Ú©Û•Øª Ø¨Û• Ø³Û•Ø±Ú©Û•ÙˆØªÙˆÙˆÛŒÛŒ ØªÛ†Ù…Ø§Ø±Ú©Ø±Ø§! ðŸ“Š +Ù¢Ù¥ Ø®Ø§Úµ' : 'Feedback vote recorded! ðŸ“Š +25 pts', 
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
              language === 'ar' ? 'ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø·Ù„Ø¨ Ø§Ù„ØªÙ‚Ø¯ÙŠÙ… Ù„Ù„ÙØ±ØµØ© Ø¨Ù†Ø¬Ø§Ø­! ðŸ’¼ +Ù¥Ù  Ù†Ù‚Ø·Ø© ØªÙˆØ§ØµÙ„ Ù…Ù‡Ù†ÙŠ' : language === 'ku' ? 'Ù¾ÛŽØ´Ú©Û•Ø´Ú©Ø±Ø¯Ù†ÛŒ Ø¯Ø§ÙˆØ§Ú©Ø§Ø±ÛŒ Ú©Ø§Ø±Û•Ú©Û•Øª Ø³Û•Ø±Ú©Û•ÙˆØªÙˆÙˆ Ø¨ÙˆÙˆ! ðŸ’¼ +Ù¥Ù  Ø®Ø§ÚµÛŒ Ù¾ÛŒØ´Û•ÛŒÛŒ' : 'Application registered successfully! ðŸ’¼ +50 Career pts', 
              'success'
            );
          } else {
            showToast(
              language === 'ar' ? 'ØªÙ… Ø¥Ù„ØºØ§Ø¡ ØªÙ‚Ø¯ÙŠÙ… Ø§Ù„Ø·Ù„Ø¨ Ø¨Ù†Ø¬Ø§Ø­' : language === 'ku' ? 'Ø¯Ø§ÙˆØ§Ú©Ø§Ø±ÛŒÛ•Ú©Û•Øª Ù‡Û•ÚµÙˆÛ•Ø´ÛŽÙ†Ø±Ø§ÛŒÛ•ÙˆÛ•' : 'Cancelled application request', 
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
              language === 'ar' ? 'ØªÙ… Ø­Ø¬Ø² ØªØ°ÙƒØ±ØªÙƒ Ø§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠØ© Ø¨Ù†Ø¬Ø§Ø­! ðŸŽŸï¸ +Ù£Ù  Ù†Ù‚Ø·Ø© ØªÙØ§Ø¹Ù„' : language === 'ku' ? 'Ú©ÙˆØ±Ø³ÛŒÛ•Ú©Û•Øª Ú¯ÛŒØ±Ø§ Ø¨Û† Ù…Û•Ø±Ø§Ø³ÛŒÙ…Û•Ú©Û•! ðŸŽŸï¸ +Ù£Ù  Ø®Ø§Úµ' : 'Access ticket reserved! ðŸŽŸï¸ +30 pts', 
              'success'
            );
          } else {
            showToast(
              language === 'ar' ? 'ØªÙ… Ø¥Ù„ØºØ§Ø¡ ØªØ£ÙƒÙŠØ¯ Ø­Ø¶ÙˆØ± Ø§Ù„ÙØ¹Ø§Ù„ÙŠØ©' : language === 'ku' ? 'Ù‡Û•ÚµÙˆÛ•Ø´Ø§Ù†Ø¯Ù†Û•ÙˆÛ•ÛŒ Ø­ÛŒØ¬Ø²ÛŒ Ù…Û•Ø±Ø§Ø³ÛŒÙ…Û•Ú©Û•' : 'Reservation cancelled', 
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
              language === 'ar' ? 'Ø§Ù†Ø¶Ù…Ù…Øª Ù„Ù…Ø¬Ù…ÙˆØ¹Ø© Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©! ðŸ‘¥ +Ù£Ù  Ù†Ù‚Ø·Ø© Ø¯Ø±Ø§Ø³ÙŠØ©' : language === 'ku' ? 'Ù¾Û•ÛŒÙˆÛ•Ø³Øª Ø¨ÙˆÙˆÛŒØª Ø¨Û• Ú¯Ø±ÙˆÙ¾ÛŒ Ú¯ÙØªÙˆÚ¯Û†Ú©Û•! ðŸ‘¥ +Ù£Ù  Ø®Ø§ÚµÛŒ Ù…Ø±Ø§Ø¬Ø¹Û•' : 'Joined study circle! ðŸ‘¥ +30 Study pts', 
              'success'
            );
          } else {
            showToast(
              language === 'ar' ? 'ØºØ§Ø¯Ø±Øª Ù…Ø¬Ù…ÙˆØ¹Ø© Ø§Ù„ØµØ¯Ø§Ù‚Ø© ÙˆØ§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©' : language === 'ku' ? 'Ø¬ÛŽÙ‡ÛŽØ´ØªÙ†ÛŒ Ø¨Ø§Ø²Ù†Û•ÛŒ Ø®ÙˆÛŽÙ†Ø¯Ù†Û•Ú©Û•' : 'Left study circle', 
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
      language === 'ar' ? 'ØªÙ… Ù†Ø´Ø± ØªØ¹Ù„ÙŠÙ‚Ùƒ Ø§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠ Ø¨Ù†Ø¬Ø§Ø­! ðŸ’¬ +Ù¡Ù¥ Ù†Ù‚Ø·Ø© Ù…Ø±Ø§Ø¬Ø¹' : language === 'ku' ? 'ÙˆÛ•ÚµØ§Ù…Û•Ú©Û•Øª Ø¨ÚµØ§ÙˆÚ©Ø±Ø§ÛŒÛ•ÙˆÛ• Ø¨Û• Ø³Û•Ø±Ú©Û•ÙˆØªÙˆÙˆÛŒÛŒ! ðŸ’¬ +Ù¡Ù¥ Ø®Ø§Úµ' : 'Academic comment posted! ðŸ’¬ +15 pts', 
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

  const handleAddNewPost = (title: string, body: string, anonymous: boolean, customType = 'post', imageUrl?: string) => {
    const freshPost: FeedItem = {
      id: `custom-${Date.now()}`,
      type: customType as any,
      titleEN: title,
      titleAR: title,
      titleKU: title,
      contentEN: body,
      contentAR: body,
      contentKU: body,
      imageUrl: imageUrl || undefined,
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
      language === 'ar' ? 'ØªÙ… Ù†Ø´Ø± Ù…Ø³Ø§Ù‡Ù…ØªÙƒ Ø¨Ù†Ø¬Ø§Ø­ Ø¹Ù„Ù‰ Ø³Ø§Ø­Ø© Ø§Ù„Ø·Ù„Ø§Ø¨! âœ¨ +Ù¤Ù  Ù†Ù‚Ø·Ø©' : language === 'ku' ? 'Ø¨ÚµØ§ÙˆÚ©Ø±Ø§ÙˆÛ•Ú©Û•Øª Ø¨ÚµØ§ÙˆÚ©Ø±Ø§ÛŒÛ•ÙˆÛ• Ù„Û• Ø³Ø§Ø­Û•ÛŒ Ù‚ÙˆØªØ§Ø¨ÛŒØ§Ù†! âœ¨ +Ù¤Ù  Ø®Ø§Úµ' : 'Contribution published successfully! âœ¨ +40 pts', 
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
    const roles: ('student' | 'graduate' | 'teacher' | 'staff')[] = PUBLIC_LAUNCH_MODE ? ['student', 'graduate'] : ['student', 'graduate', 'teacher', 'staff'];
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
          isAdminMode={!PUBLIC_LAUNCH_MODE && userProfile.role === 'staff'}
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
            isAdminMode={!PUBLIC_LAUNCH_MODE && userProfile.role === 'staff'}
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
            isAdminMode={!PUBLIC_LAUNCH_MODE && userProfile.role === 'staff'}
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
            isAdminMode={!PUBLIC_LAUNCH_MODE && userProfile.role === 'staff'}
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
            isAdminMode={!PUBLIC_LAUNCH_MODE && userProfile.role === 'staff'}
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
                language === 'ar' ? 'ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø®Ø±ÙˆØ¬Ùƒ Ø¨Ù†Ø¬Ø§Ø­. Ù†Ø±Ø§Ùƒ Ù‚Ø±ÙŠØ¨Ø§Ù‹! ðŸ‘‹' : language === 'ku' ? 'Ø®Û†ØªÛ†Ù…Ø§Ø±Ú©Ø±Ø¯Ù†Û•Ú©Û•Øª Ú©Û†ØªØ§ÛŒÛŒ Ù¾ÛŽÙ‡Ø§Øª. Ø¨Û• Ù‡ÛŒÙˆØ§ÛŒ Ø¯ÛŒØ¯Ø§Ø±! ðŸ‘‹' : 'Logged out successfully. See you! ðŸ‘‹', 
                'info'
              );
            }}
            onTriggerAuth={() => setIsAuthModalOpen(true)}
            onNavigateAdmin={PUBLIC_LAUNCH_MODE ? undefined : () => setActiveTab('admin')}
            onEditFeedItem={handleEditFeedItem}
            onDeleteFeedItem={handleDeleteFeedItem}
            isAdminMode={!PUBLIC_LAUNCH_MODE && userProfile.role === 'staff'}
          />
        );
      case 'admin':
        return (
          <AdminAutomation
            language={language}
            onBack={() => setActiveTab('profile')}
            showToast={showToast}
            userRole={userProfile.role}
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
              language === 'ar' ? `Ù…Ø±Ø­Ø¨Ø§Ù‹ Ø¨Ùƒ Ù…Ø¬Ø¯Ø¯Ø§Ù‹ ÙŠØ§ ${newUsername || 'Ø²Ø§Ø±Ø§'}! ðŸ‘‹ ØªÙ… Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¨Ù†Ø¬Ø§Ø­` : language === 'ku' ? `Ø¨Û•Ø®ÛŽØ±Ø¨ÛŽÛŒØªÛ•ÙˆÛ• ${newUsername || 'Ø²Ø§Ø±Ø§'}! ðŸ‘‹ Ø¯Ø§Ø¨Û•Ø²Ø§Ù†Ø¯Ù† Ø³Û•Ø±Ú©Û•ÙˆØªÙˆÙˆ Ø¨ÙˆÙˆ` : `Welcome back, ${newUsername || 'Zara'}! ðŸ‘‹ Signed in`, 
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
                      {toast.type === 'success' ? 'âš¡' : toast.type === 'error' ? 'ðŸš¨' : 'âœ¨'}
                    </span>
                    <span className="leading-relaxed tracking-tight text-[11px] text-left">
                      {toast.text}
                    </span>
                  </div>
                  <button 
                    onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                    className="text-slate-400 hover:text-white transition-colors p-1 bg-transparent border-0 cursor-pointer text-[10px] font-black"
                  >
                    âœ•
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


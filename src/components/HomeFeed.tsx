import React, { useState, useEffect, useMemo } from 'react';
import { FeedItem, Language, University } from '../types';
import { getTranslation } from '../data/translations';
import { initialFeedItems, defaultUserProfile, IraqiUniversities, IraqiGovernorates } from '../data/mockData';
import { Sparkles, MessageSquare, Briefcase, PlusCircle, CheckCircle, Info, Image, EyeOff, MapPin, School, Palette, X, Calendar, Megaphone, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import FeedCard from './FeedCard';
import StudentStories from './StudentStories';
import { PortalSettings, portalSettingsApi } from '../lib/api';

interface HomeFeedProps {
  feedItems: FeedItem[];
  language: Language;
  selectedGov: string;
  setSelectedGov: (id: string) => void;
  selectedUni: string;
  setSelectedUni: (id: string) => void;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onVote: (itemId: string, optionId: string) => void;
  onApply: (id: string) => void;
  onRsvp: (id: string) => void;
  onJoinGroup: (id: string) => void;
  onAddComment: (id: string, commentText: string) => void;
  onNavigateTab: (tabId: 'home' | 'life' | 'ask' | 'future' | 'profile') => void;
  onAddNewPost: (title: string, body: string, anonymous: boolean, customType?: string, imageUrl?: string) => void;
  isFeedLoading?: boolean;
  onAwardPoints?: (points: number) => void;
  showToast?: (text: string, type?: 'success' | 'error' | 'info') => void;
  institutions?: University[];
  institutionsLoading?: boolean;
  institutionsError?: string | null;
  onRetryInstitutions?: () => void;
  onEditFeedItem?: (id: string, updatedFields: Partial<FeedItem>) => void;
  onDeleteFeedItem?: (id: string) => void;
  isAdminMode?: boolean;
  onSelectSection?: (sectionId: string) => void;
}

const HERO_DEFAULTS = {
  image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600',
  titleEN: 'Master Your Campus Journey!',
  titleAR: 'ØªÙ…ÙŠÙ‘Ø² ÙˆØ§Ø¨Ù†Ù Ù…Ø³ØªÙ‚Ø¨Ù„Ùƒ Ø§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠ!',
  titleKU: 'Ø¯Ø§Ù‡Ø§ØªÙˆÙˆÛŒÛ•Ú©ÛŒ Ù¾Ú•Ø´Ù†Ú¯Ø¯Ø§Ø± Ø¨Ù†ÙŠØ§Øª Ø¨Ù†ÛŽ!',
  descEN: 'The ultimate collegiate hub for premium opportunities & academic resources',
  descAR: 'Ø§Ù„Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„Ø·Ù„Ø§Ø¨ÙŠØ© Ø§Ù„Ø£Ù‚ÙˆÙ‰ Ù„Ù„Ø¬Ø§Ù…Ø¹Ø§Øª ÙˆØ§Ù„ØªØ¯Ø±ÙŠØ¨ ÙÙŠ Ø¹ÙØ±Ø§Ù‚Ù†Ø§ Ø§Ù„Ø­Ø¨ÙŠØ¨',
  descKU: 'ÛŒÛ•Ú©Û•Ù… Ø¯Û•Ø±ÙˆØ§Ø²Û•ÛŒ Ø®ÙˆÛŽÙ†Ø¯Ú©Ø§Ø±Ø§Ù†ÛŒ Ø²Ø§Ù†Ú©Û† Ùˆ Ø¯Ø§Ø¨ÛŒÙ†Ú©Ø±Ø¯Ù†ÛŒ Ù‡Û•Ù„ÛŒ Ù…Û•Ø´Ù‚',
  tagEN: 'PORTAL ACCELERATION',
  tagAR: 'Ø¨ÙˆØ§Ø¨Ø© Ù‡ÙˆÙŠØªÙ†Ø§ Ø§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠØ©',
  tagKU: 'Ø¯Û•Ø±ÙˆØ§Ø²Û•ÛŒ Ø¦Û•Ú©Ø§Ø¯ÛŒÙ…ÛŒ Ø¹ÛŽØ±Ø§Ù‚'
};

function cachePortalSettings(settings: PortalSettings) {
  localStorage.setItem('jamiaati_hero_bg', settings.heroImage);
  localStorage.setItem('jamiaati_hero_title_en', settings.heroTitle.en);
  localStorage.setItem('jamiaati_hero_title_ar', settings.heroTitle.ar);
  localStorage.setItem('jamiaati_hero_title_ku', settings.heroTitle.ku);
  localStorage.setItem('jamiaati_hero_desc_en', settings.heroDescription.en);
  localStorage.setItem('jamiaati_hero_desc_ar', settings.heroDescription.ar);
  localStorage.setItem('jamiaati_hero_desc_ku', settings.heroDescription.ku);
  localStorage.setItem('jamiaati_hero_tag_en', settings.heroTag.en);
  localStorage.setItem('jamiaati_hero_tag_ar', settings.heroTag.ar);
  localStorage.setItem('jamiaati_hero_tag_ku', settings.heroTag.ku);
  localStorage.setItem('jamiaati_edited_default_stories', JSON.stringify(settings.defaultStories || []));
}

// Global reuseable beautiful pulse Skeleton Loader
export function SkeletonLoader() {
  return (
    <div className="flex flex-col gap-4 w-full select-none" id="jamiaati-skeleton-loader">
      {[1, 2].map(i => (
        <div 
          key={i} 
          className="bg-[#121B2E] rounded-3xl border border-[#1F2E4D] p-5 mb-1 relative flex flex-col gap-4 animate-pulse overflow-hidden"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#1F2E4D]/80 rounded-xl shrink-0" />
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="h-3 bg-[#1F2E4D]/80 rounded-md w-1/3" />
              <div className="h-2.5 bg-[#1F2E4D]/50 rounded-md w-1/2" />
            </div>
            <div className="w-16 h-5.5 bg-[#1F2E4D]/60 rounded-xl" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-3 bg-[#1F2E4D]/75 rounded-md w-full" />
            <div className="h-3 bg-[#1F2E4D]/75 rounded-md w-5/6" />
            <div className="h-3 bg-[#1F2E4D]/44 rounded-md w-1/2" />
          </div>
          <div className="flex items-center justify-between border-t border-[#1F2E4D] pt-4 mt-1">
            <div className="flex gap-4">
              <div className="w-11 h-4 bg-[#1F2E4D]/60 rounded-md" />
              <div className="w-11 h-4 bg-[#1F2E4D]/60 rounded-md" />
            </div>
            <div className="w-5 h-5 bg-[#1F2E4D]/60 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomeFeed({
  feedItems,
  language,
  selectedGov,
  setSelectedGov,
  selectedUni,
  setSelectedUni,
  onLike,
  onSave,
  onVote,
  onApply,
  onRsvp,
  onJoinGroup,
  onAddComment,
  onNavigateTab,
  onAddNewPost,
  isFeedLoading = false,
  onAwardPoints,
  showToast,
  institutions = [],
  institutionsLoading = false,
  institutionsError = null,
  onRetryInstitutions,
  onEditFeedItem,
  onDeleteFeedItem,
  isAdminMode = false,
  onSelectSection
}: HomeFeedProps) {
   // Custom Story-based categories filter state
  const [activeStoryFilter, setActiveStoryFilter] = useState<string | null>(null);

  // Dynamic Hero Configuration with real-time updates support (localStorage + event listeners)
  const [heroBg, setHeroBg] = useState(() => localStorage.getItem('jamiaati_hero_bg') || HERO_DEFAULTS.image);
  
  const [heroTitleEN, setHeroTitleEN] = useState(() => localStorage.getItem('jamiaati_hero_title_en') || HERO_DEFAULTS.titleEN);
  const [heroTitleAR, setHeroTitleAR] = useState(() => localStorage.getItem('jamiaati_hero_title_ar') || HERO_DEFAULTS.titleAR);
  const [heroTitleKU, setHeroTitleKU] = useState(() => localStorage.getItem('jamiaati_hero_title_ku') || HERO_DEFAULTS.titleKU);
  
  const [heroDescEN, setHeroDescEN] = useState(() => localStorage.getItem('jamiaati_hero_desc_en') || HERO_DEFAULTS.descEN);
  const [heroDescAR, setHeroDescAR] = useState(() => localStorage.getItem('jamiaati_hero_desc_ar') || HERO_DEFAULTS.descAR);
  const [heroDescKU, setHeroDescKU] = useState(() => localStorage.getItem('jamiaati_hero_desc_ku') || HERO_DEFAULTS.descKU);

  const [heroTagEN, setHeroTagEN] = useState(() => localStorage.getItem('jamiaati_hero_tag_en') || HERO_DEFAULTS.tagEN);
  const [heroTagAR, setHeroTagAR] = useState(() => localStorage.getItem('jamiaati_hero_tag_ar') || HERO_DEFAULTS.tagAR);
  const [heroTagKU, setHeroTagKU] = useState(() => localStorage.getItem('jamiaati_hero_tag_ku') || HERO_DEFAULTS.tagKU);

  useEffect(() => {
    const handleHeroSync = () => {
      setHeroBg(localStorage.getItem('jamiaati_hero_bg') || HERO_DEFAULTS.image);
      setHeroTitleEN(localStorage.getItem('jamiaati_hero_title_en') || HERO_DEFAULTS.titleEN);
      setHeroTitleAR(localStorage.getItem('jamiaati_hero_title_ar') || HERO_DEFAULTS.titleAR);
      setHeroTitleKU(localStorage.getItem('jamiaati_hero_title_ku') || HERO_DEFAULTS.titleKU);
      setHeroDescEN(localStorage.getItem('jamiaati_hero_desc_en') || HERO_DEFAULTS.descEN);
      setHeroDescAR(localStorage.getItem('jamiaati_hero_desc_ar') || HERO_DEFAULTS.descAR);
      setHeroDescKU(localStorage.getItem('jamiaati_hero_desc_ku') || HERO_DEFAULTS.descKU);
      setHeroTagEN(localStorage.getItem('jamiaati_hero_tag_en') || HERO_DEFAULTS.tagEN);
      setHeroTagAR(localStorage.getItem('jamiaati_hero_tag_ar') || HERO_DEFAULTS.tagAR);
      setHeroTagKU(localStorage.getItem('jamiaati_hero_tag_ku') || HERO_DEFAULTS.tagKU);
    };
    portalSettingsApi.get(language)
      .then((result) => {
        if (result?.settings) {
          cachePortalSettings(result.settings);
          handleHeroSync();
          window.dispatchEvent(new Event('jamiaati_stories_updated'));
        }
      })
      .catch((err) => {
        console.warn('Portal settings backend unavailable; using local cache/defaults.', err);
      });
    window.addEventListener('jamiaati_hero_updated', handleHeroSync);
    return () => window.removeEventListener('jamiaati_hero_updated', handleHeroSync);
  }, [language]);

  // Admin Hero Custom editing states
  const [isEditingHero, setIsEditingHero] = useState(false);
  const [formHeroBg, setFormHeroBg] = useState(heroBg);
  const [formTitleEN, setFormTitleEN] = useState(heroTitleEN);
  const [formTitleAR, setFormTitleAR] = useState(heroTitleAR);
  const [formTitleKU, setFormTitleKU] = useState(heroTitleKU);
  const [formDescEN, setFormDescEN] = useState(heroDescEN);
  const [formDescAR, setFormDescAR] = useState(heroDescAR);
  const [formDescKU, setFormDescKU] = useState(heroDescKU);
  const [formTagEN, setFormTagEN] = useState(heroTagEN);
  const [formTagAR, setFormTagAR] = useState(heroTagAR);
  const [formTagKU, setFormTagKU] = useState(heroTagKU);

  const handleStartEditingHero = () => {
    setFormHeroBg(heroBg);
    setFormTitleEN(heroTitleEN);
    setFormTitleAR(heroTitleAR);
    setFormTitleKU(heroTitleKU);
    setFormDescEN(heroDescEN);
    setFormDescAR(heroDescAR);
    setFormDescKU(heroDescKU);
    setFormTagEN(heroTagEN);
    setFormTagAR(heroTagAR);
    setFormTagKU(heroTagKU);
    setIsEditingHero(true);
  };

  const handleSaveHeroCustomization = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const savedStories = localStorage.getItem('jamiaati_edited_default_stories');
      let defaultStories = savedStories ? JSON.parse(savedStories) : [];
      if (!Array.isArray(defaultStories) || defaultStories.length === 0) {
        const current = await portalSettingsApi.get(language);
        defaultStories = current?.settings?.defaultStories || [];
      }
      const settings: PortalSettings = {
        heroImage: formHeroBg,
        heroTitle: { en: formTitleEN, ar: formTitleAR, ku: formTitleKU },
        heroDescription: { en: formDescEN, ar: formDescAR, ku: formDescKU },
        heroTag: { en: formTagEN, ar: formTagAR, ku: formTagKU },
        defaultStories
      };
      const result = await portalSettingsApi.update(settings, language);
      cachePortalSettings(result?.settings || settings);
      window.dispatchEvent(new Event('jamiaati_hero_updated'));
      window.dispatchEvent(new Event('jamiaati_stories_updated'));
      setIsEditingHero(false);
      if (showToast) {
        showToast(language === 'ar' ? 'ØªÙ… Ø­ÙØ¸ Ø§Ù„ØªØºÙŠÙŠØ±Ø§Øª Ø¹Ù„Ù‰ Ø§Ù„Ø®Ø§Ø¯Ù… Ø¨Ù†Ø¬Ø§Ø­! ðŸ’«' : language === 'ku' ? 'Ú¯Û†Ú•Ø§Ù†Ú©Ø§Ø±ÛŒÛŒÛ•Ú©Ø§Ù† Ù„Û• Ø³ÛŽØ±Ú¤Û•Ø± Ù¾Ø§Ø´Û•Ú©Û•ÙˆØª Ú©Ø±Ø§Ù†! ðŸ’«' : 'Hero settings saved to backend! ðŸ’«', 'success');
      }
    } catch (err: any) {
      if (showToast) {
        showToast(language === 'ar' ? `ÙØ´Ù„ Ø­ÙØ¸ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„ÙˆØ§Ø¬Ù‡Ø©: ${err.message}` : language === 'ku' ? `Ù¾Ø§Ø´Û•Ú©Û•ÙˆØªÚ©Ø±Ø¯Ù†ÛŒ Ú•ÙˆÙˆÚ©Ø§Ø± Ø³Û•Ø±Ú©Û•ÙˆØªÙˆÙˆ Ù†Û•Ø¨ÙˆÙˆ: ${err.message}` : `Failed to save hero settings: ${err.message}`, 'error');
      }
    }
  };

  // âš ï¸ Searchable Custom Picker States (Task 1, 2, 3, 5)
  const [showPicker, setShowPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerPage, setPickerPage] = useState(1);
  const itemsPerPage = 8;

  // Let's reset the pagination any time selectedGov or pickerSearch changes
  useEffect(() => {
    setPickerPage(1);
  }, [selectedGov, pickerSearch]);

  const filteredAndSearchedUnis = useMemo(() => {
    // Return either institutions props or fallback to IraqiUniversities global
    const sourceList = institutions && institutions.length > 0 ? institutions : IraqiUniversities;
    
    // Governorate filtering
    const govUnis = selectedGov === 'all'
      ? sourceList
      : sourceList.filter(u => u.governorateId === selectedGov);

    if (!pickerSearch.trim()) return govUnis;
    const searchLower = pickerSearch.trim().toLowerCase();
    
    return govUnis.filter(u => 
      u.nameEN.toLowerCase().includes(searchLower) ||
      u.nameAR.toLowerCase().includes(searchLower) ||
      u.nameKU.toLowerCase().includes(searchLower)
    );
  }, [selectedGov, pickerSearch, institutions, IraqiUniversities, institutionsLoading]);

  const totalItems = filteredAndSearchedUnis.length;
  const maxPage = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedUnis = useMemo(() => {
    const start = (pickerPage - 1) * itemsPerPage;
    return filteredAndSearchedUnis.slice(start, start + itemsPerPage);
  }, [filteredAndSearchedUnis, pickerPage]);

  // New post publisher collapsible state
  const [showPublisher, setShowPublisher] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Story definition representing the required elements of section view clicks
  const storyHighlightsData = [
    {
      id: 'scholarship',
      emoji: 'ðŸŽ“',
      labelEN: 'Scholarships',
      labelAR: 'Ø§Ù„Ù…Ù†Ø­',
      labelKU: 'Ø¨ÙˆØ±Ø³ÛŒÛ•Ú©Ø§Ù†',
      color: 'from-pink-500 to-rose-500',
      tabType: 'opportunities',
      filterType: 'scholarship'
    },
    {
      id: 'job',
      emoji: 'ðŸ’¼',
      labelEN: 'Jobs',
      labelAR: 'Ø§Ù„ÙˆØ¸Ø§Ø¦Ù',
      labelKU: 'Ú©Ø§Ø±Û•Ú©Ø§Ù†',
      color: 'from-emerald-500 to-teal-500',
      tabType: 'opportunities',
      filterType: 'job'
    },
    {
      id: 'internship',
      emoji: 'âš™ï¸',
      labelEN: 'Internships',
      labelAR: 'ÙØ±Øµ Ø§Ù„ØªØ¯Ø±ÙŠØ¨',
      labelKU: 'Ù…Û•Ø´Ù‚Û•Ú©Ø§Ù†',
      color: 'from-blue-500 to-indigo-500',
      tabType: 'opportunities',
      filterType: 'internship'
    },
    {
      id: 'training',
      emoji: 'ðŸ«',
      labelEN: 'Trainings',
      labelAR: 'Ø§Ù„ØªØ¯Ø±ÙŠØ¨',
      labelKU: 'Ú•Ø§Ù‡ÛŽÙ†Ø§Ù†',
      color: 'from-cyan-500 to-blue-500',
      tabType: 'opportunities',
      filterType: 'training'
    },
    {
      id: 'event',
      emoji: 'ðŸŽŸï¸',
      labelEN: 'Events',
      labelAR: 'Ø§Ù„ÙØ¹Ø§Ù„ÙŠØ§Øª',
      labelKU: 'Ú†Ø§Ù„Ø§Ú©ÛŒÛŒÛ•Ú©Ø§Ù†',
      color: 'from-purple-500 to-blue-500',
      tabType: 'campus',
      filterType: 'event'
    },
    {
      id: 'news',
      emoji: 'ðŸ“°',
      labelEN: 'News',
      labelAR: 'Ø§Ù„Ø£Ø®Ø¨Ø§Ø±',
      labelKU: 'Ù‡Û•ÙˆØ§ÚµÛ•Ú©Ø§Ù†',
      color: 'from-amber-500 to-rose-500',
      tabType: 'campus',
      filterType: 'news'
    },
    {
      id: 'announcement',
      emoji: 'ðŸ“¢',
      labelEN: 'Announcements',
      labelAR: 'Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª',
      labelKU: 'Ú•Ø§Ú¯Û•ÛŒØ§Ù†Ø¯Ù†Û•Ú©Ø§Ù†',
      color: 'from-teal-500 to-emerald-500',
      tabType: 'campus',
      filterType: 'announcement'
    },
    {
      id: 'exam',
      emoji: 'ðŸ“',
      labelEN: 'Exams',
      labelAR: 'Ø§Ù„Ø§Ù…ØªØ­Ø§Ù†Ø§Øª',
      labelKU: 'ØªØ§Ù‚ÛŒÚ©Ø±Ø¯Ù†Û•ÙˆÛ•Ú©Ø§Ù†',
      color: 'from-[#2F7CCB] to-indigo-500',
      tabType: 'campus',
      filterType: 'exam'
    },
    {
      id: 'registration',
      emoji: 'ðŸ“Œ',
      labelEN: 'Registration',
      labelAR: 'Ø§Ù„ØªØ³Ø¬ÙŠÙ„',
      labelKU: 'ØªÛ†Ù…Ø§Ø±Ú©Ø±Ø¯Ù†',
      color: 'from-fuchsia-500 to-pink-500',
      tabType: 'campus',
      filterType: 'registration'
    },
    {
      id: 'student_club',
      emoji: 'ðŸ‘¥',
      labelEN: 'Student Clubs',
      labelAR: 'Ø§Ù„Ù†ÙˆØ§Ø¯ÙŠ Ø§Ù„Ø·Ù„Ø§Ø¨ÙŠØ©',
      labelKU: 'ÛŒØ§Ù†Û• Ø®ÙˆÛŽÙ†Ø¯Ú©Ø§Ø±ÛŒÛŒÛ•Ú©Ø§Ù†',
      color: 'from-violet-500 to-fuchsia-500',
      tabType: 'campus',
      filterType: 'student_club'
    }
  ];

  // Helper handles Governorate modification
  const handleGovChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedGov(val);
    setSelectedUni('all'); // Clear specific university when governorate shifts
  };

  // Filter universities based on chosen Governorate
  const filteredUnis = selectedGov === 'all' 
    ? IraqiUniversities 
    : IraqiUniversities.filter(u => u.governorateId === selectedGov);

  // New post submission logic
  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postBody.trim() || isPosting) return;
    if (postBody.trim().length > 2000) {
      setMessage(language === 'ar' ? 'Ø§Ù„Ù…Ù†Ø´ÙˆØ± Ø·ÙˆÙŠÙ„ Ø¬Ø¯Ø§Ù‹. Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰ 2000 Ø­Ø±Ù.' : language === 'ku' ? 'Ø¨Ø§Ø¨Û•ØªÛ•Ú©Û• Ø²Û†Ø± Ø¯Ø±ÛŽÚ˜Û•. Ø³Ù†ÙˆÙˆØ± 2000 Ù¾ÛŒØªÛ•.' : 'Post is too long. Maximum is 2000 characters.');
      return;
    }
    setIsPosting(true);

    const generatedTitle = postTitle.trim() || (anonymous ? 'Anonymous Question' : 'Campus Moment ðŸŒŸ');
    onAddNewPost(generatedTitle, postBody, anonymous, 'post');
    
    setPostTitle('');
    setPostBody('');
    setPostImageUrl('');
    setAnonymous(false);
    setShowPublisher(false);

    setMessage(language === 'ar' ? 'ØªÙ… Ù†Ø´Ø± Ù…Ø´Ø§Ø±ÙƒØªÙƒ Ø¨Ù†Ø¬Ø§Ø­! âœ¨' : language === 'ku' ? 'Ø¨Ø§Ø¨Û•ØªÛ•Ú©Û•Øª Ø¨Û• Ø³Û•Ø±Ú©Û•ÙˆØªÙˆÙˆÛŒÛŒ Ø¨ÚµØ§ÙˆÚ©Ø±Ø§ÛŒÛ•ÙˆÛ•! âœ¨' : 'Post shared successfully on Campus Today!');
    setTimeout(() => setMessage(''), 3000);
    window.setTimeout(() => setIsPosting(false), 800);
  };

  // Filter out any opportunities/careers listings from the main home feed, allowing only social, campus posts, and highlights.
  const opportunityTypes = ['job', 'scholarship', 'internship', 'training', 'fellowship', 'volunteering', 'competition', 'part_time_job', 'graduation_project_support'];
  const filteredFeedItems = feedItems.filter(item => {
    const isOpportunity = opportunityTypes.includes(item.type);
    return !isOpportunity;
  });

  return (
    <div className="px-3.5 py-4 max-w-lg mx-auto flex flex-col pb-24 bg-[#0B1020]" id="home-feed-container">
      
      {/* 2. Compact, Student-Friendly Modern Hero Section */}
      {isEditingHero ? (
        <form onSubmit={handleSaveHeroCustomization} className="mb-5 bg-[#121B2E] rounded-3xl p-5 border-2 border-[#FFD21F] shadow-[3px_3px_0px_0px_#FFD21F] text-left text-white flex flex-col gap-3" id="admin-hero-editor-form">
          <div className="flex items-center justify-between border-b border-[#1F2E4D] pb-2">
            <h3 className="text-xs font-black text-[#FFD21F] uppercase flex items-center gap-1.5">
              <Palette className="w-4 h-4" />
              <span>Customize Hero Banner</span>
            </h3>
            <button type="button" onClick={() => setIsEditingHero(false)} className="text-slate-400 hover:text-white font-bold text-[10px] uppercase cursor-pointer">
              Cancel
            </button>
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase font-black text-slate-400">Hero BG Image URL</label>
            <input 
              type="text" 
              className="bg-[#0B1020] border border-[#1F2E4D] text-xs px-2.5 py-1.5 rounded-xl text-white focus:outline-none focus:border-[#FFD21F] w-full"
              placeholder="https://images.unsplash.com/..."
              value={formHeroBg}
              onChange={(e) => setFormHeroBg(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-0.5">
              <label className="text-[8px] uppercase font-black text-slate-400">Tag (EN)</label>
              <input 
                type="text" 
                className="bg-[#0B1020] border border-[#1F2E4D] text-[10px] px-2 py-1 rounded-lg text-white font-bold focus:outline-none focus:border-[#FFD21F]"
                value={formTagEN} 
                onChange={e => setFormTagEN(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[8px] uppercase font-black text-slate-400 font-sans">Tag (AR)</label>
              <input 
                type="text" 
                className="bg-[#0B1020] border border-[#1F2E4D] text-[10px] px-2 py-1 rounded-lg text-white font-bold text-right font-sans focus:outline-none focus:border-[#FFD21F]"
                value={formTagAR} 
                onChange={e => setFormTagAR(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[8px] uppercase font-black text-slate-400 font-sans">Tag (KU)</label>
              <input 
                type="text" 
                className="bg-[#0B1020] border border-[#1F2E4D] text-[10px] px-2 py-1 rounded-lg text-white font-bold text-right font-sans focus:outline-none focus:border-[#FFD21F]"
                value={formTagKU} 
                onChange={e => setFormTagKU(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-[#1F2E4D]/60 pt-2 pb-1">
            <div className="flex flex-col gap-0.5">
              <label className="text-[8px] uppercase font-black text-slate-400">Title (EN)</label>
              <input 
                type="text" 
                className="bg-[#0B1020] border border-[#1F2E4D] text-xs px-2.5 py-1 rounded-lg text-white font-black focus:outline-none focus:border-[#FFD21F]"
                value={formTitleEN} 
                onChange={e => setFormTitleEN(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[8px] uppercase font-black text-slate-400 font-sans">Title (AR)</label>
              <input 
                type="text" 
                className="bg-[#0B1020] border border-[#1F2E4D] text-xs px-2.5 py-1 rounded-lg text-white font-black text-right font-sans focus:outline-none focus:border-[#FFD21F]"
                value={formTitleAR} 
                onChange={e => setFormTitleAR(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[8px] uppercase font-black text-slate-400 font-sans">Title (KU)</label>
              <input 
                type="text" 
                className="bg-[#0B1020] border border-[#1F2E4D] text-xs px-2.5 py-1 rounded-lg text-white font-black text-right font-sans focus:outline-none focus:border-[#FFD21F]"
                value={formTitleKU} 
                onChange={e => setFormTitleKU(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-[#1F2E4D]/60 pt-2">
            <div className="flex flex-col gap-0.5">
              <label className="text-[8px] uppercase font-black text-slate-400">Subtitle (EN)</label>
              <textarea 
                className="bg-[#0B1020] border border-[#1F2E4D] text-[10px] px-2.5 py-1 rounded-lg text-white h-11 resize-none font-medium focus:outline-none focus:border-[#FFD21F]"
                value={formDescEN} 
                onChange={e => setFormDescEN(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[8px] uppercase font-black text-slate-400 font-sans">Subtitle (AR)</label>
              <textarea 
                className="bg-[#0B1020] border border-[#1F2E4D] text-[10px] px-2.5 py-1 rounded-lg text-white h-11 resize-none text-right font-medium font-sans focus:outline-none focus:border-[#FFD21F]"
                value={formDescAR} 
                onChange={e => setFormDescAR(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[8px] uppercase font-black text-slate-400 font-sans">Subtitle (KU)</label>
              <textarea 
                className="bg-[#0B1020] border border-[#1F2E4D] text-[10px] px-2.5 py-1 rounded-lg text-white h-11 resize-none text-right font-medium font-sans focus:outline-none focus:border-[#FFD21F]"
                value={formDescKU} 
                onChange={e => setFormDescKU(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-[#FFD21F] hover:bg-[#FFD21F]/90 text-slate-950 font-black text-xs py-2 rounded-xl border border-slate-950 shadow-[2px_2px_0px_0px_#1B2E4D] cursor-pointer select-none text-center"
          >
            Save Customized Hero Settings âœ¨
          </button>
        </form>
      ) : (
        <div 
          className="mb-5 relative rounded-3xl overflow-hidden border-2 border-[#161A33] shadow-[4px_4px_0px_0px_#161A33] min-h-[148px] flex flex-col justify-end p-4 text-white" 
          id="homepage-academic-banner-hero"
        >
          <img 
            src={heroBg} 
            alt="Iraqi Academic Campus" 
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-0" />
          
          {isAdminMode && (
            <button 
              type="button"
              onClick={handleStartEditingHero}
              className="absolute top-3.5 right-3.5 z-20 bg-slate-950/80 hover:bg-slate-950 text-[#FFD21F] hover:scale-105 p-2 rounded-xl border border-white/20 cursor-pointer shadow-md transition-all flex items-center gap-1 text-[10px] font-black pointer-events-auto select-none"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>EDIT HERO</span>
            </button>
          )}

          <div className="relative z-10 select-none">
            <div className="inline-flex items-center gap-1.5 bg-[#FFD21F] text-[#161A33] text-[8.5px] font-black uppercase px-2.5 py-0.5 rounded-full mb-1.5 border border-[#161A33]/15">
              <span>âœ¨ {language === 'ar' ? heroTagAR : language === 'ku' ? heroTagKU : heroTagEN}</span>
            </div>
            
            <h2 className="text-sm md:text-base font-black tracking-tight leading-tight uppercase text-white drop-shadow-md">
              {language === 'ar' ? (
                <>{heroTitleAR} ðŸš€</>
              ) : language === 'ku' ? (
                <>{heroTitleKU} ðŸš€</>
              ) : (
                <>{heroTitleEN} ðŸš€</>
              )}
            </h2>
            
            <p className="text-[10px] text-slate-200 mt-1 font-medium leading-tight max-w-[300px] drop-shadow-sm">
              {language === 'ar' ? heroDescAR : language === 'ku' ? heroDescKU : heroDescEN}
            </p>

            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[9px] font-black bg-white text-[#161A33] px-3 py-1 rounded-lg shadow-sm border border-[#161A33]/20 flex items-center gap-1">
                <span>{language === 'ar' ? 'Ø¹ÙØ±Ø§Ù‚Ù†Ø§ Ø¨Ù„Ù…Ø­Ø© ðŸ‡®ðŸ‡¶' : language === 'ku' ? 'Ø¹ÛŽØ±Ø§Ù‚ÛŒ Ø¦Û•Ú©Ø§Ø¯ÛŒÙ…ÛŒ ðŸ‡®ðŸ‡¶' : 'Iraq Academia ðŸ‡®ðŸ‡¶'}</span>
              </span>
              <span className="text-[8px] font-mono font-bold text-[#FFD21F] bg-black/40 px-1.5 py-0.5 rounded border border-white/10 flex items-center gap-1 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                â— {language === 'ar' ? 'Ø±Ø³Ù…ÙŠ ÙˆÙ…Ø¨Ø§Ø´Ø±' : language === 'ku' ? 'Ú•Ø§Ø³ØªÛ•ÙˆØ®Û†' : 'OFFICIAL LIVE'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Filter Row: Side by Side Governorate & Academic Institution dropdowns */}
      <div className="grid grid-cols-2 gap-3.5 mb-5" id="home-filter-row">
        
        {/* Dropdown 1: Governorate Selection */}
        <div 
          className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-white border-2 transition-all shrink-0 ${
            selectedGov !== 'all' 
              ? 'border-[#6B25C9] shadow-[3px_3px_0px_0px_#6B25C9]' 
              : 'border-[#161A33] shadow-[3px_3px_0px_0px_#161A33]'
          }`}
          id="gov-dropdown-container"
        >
          <MapPin className={`w-4 h-4 shrink-0 ${selectedGov !== 'all' ? 'text-[#6B25C9]' : 'text-slate-500'}`} />
          <select
            id="governorate-select"
            value={selectedGov}
            onChange={handleGovChange}
            className="w-full text-xs font-black text-[#161A33] bg-transparent border-0 focus:outline-none cursor-pointer outline-none p-0 select-none"
          >
            <option value="all">ðŸ“ {language === 'ar' ? 'ÙƒÙ„ Ø§Ù„Ù…Ø­Ø§ÙØ¸Ø§Øª' : language === 'ku' ? 'Ù‡Û•Ù…ÙˆÙˆ Ù¾Ø§Ø±ÛŽØ²Ú¯Ø§Ú©Ø§Ù†' : 'All Governorates'}</option>
            {IraqiGovernorates.map(gov => (
              <option key={gov.id} value={gov.id}>
                {language === 'ar' ? gov.nameAR : language === 'ku' ? gov.nameKU : gov.nameEN}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown 2: Academic Institution Selection */}
        <button 
          id="university-select-trigger"
          type="button"
          onClick={() => {
            if (!institutionsLoading) {
              setPickerPage(1);
              setPickerSearch('');
              setShowPicker(true);
            }
          }}
          className={`flex items-center justify-between text-left gap-2 px-3 py-2.5 rounded-2xl bg-white border-2 transition-all shrink-0 cursor-pointer ${
            selectedUni !== 'all' 
              ? 'border-[#2F7CCB] shadow-[3px_3px_0px_0px_#2F7CCB]' 
              : 'border-[#161A33] shadow-[3px_3px_0px_0px_#161A33]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <School className={`w-4 h-4 shrink-0 ${selectedUni !== 'all' ? 'text-[#2F7CCB]' : 'text-slate-500'}`} />
            <span className="text-xs font-black text-[#161A33] truncate">
              {institutionsLoading ? (
                <span>{language === 'ar' ? 'â³ Ø¬Ø§Ø±ÙŠ Ø¬Ù„Ø¨ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª...' : 'â³ Loading...'}</span>
              ) : selectedUni === 'all' ? (
                <span>ðŸ« {language === 'ar' ? 'ÙƒÙ„ Ø§Ù„Ø¬Ø§Ù…Ø¹Ø§Øª' : language === 'ku' ? 'Ù‡Û•Ù…ÙˆÙˆ Ø²Ø§Ù†Ú©Û†Ú©Ø§Ù†' : 'All Institutions'}</span>
              ) : (
                (() => {
                  const sourceList = institutions && institutions.length > 0 ? institutions : IraqiUniversities;
                  const found = sourceList.find(u => u.id === selectedUni);
                  if (found) {
                    return `${found.logo} ${language === 'ar' ? found.nameAR : language === 'ku' ? found.nameKU : found.nameEN}`;
                  }
                  return `ðŸ« ${selectedUni}`;
                })()
              )}
            </span>
          </div>
          {institutionsLoading && <span className="w-2 h-2 rounded-full bg-[#2F7CCB] animate-ping shrink-0" />}
        </button>

      </div>

      {/* Real-time Interactive Student Stories Row */}
      <StudentStories 
        language={language} 
        onAwardPoints={onAwardPoints} 
        showToast={showToast} 
      />

      {/* 4. Stories Circles: social media story bubbles */}
      <div className="w-full mb-5 bg-[#121B2E] rounded-3xl border border-[#1F2E4D] p-3.5 shadow-sm" id="story-highlights-scroller-box">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[9px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded-md leading-none">
            {language === 'ar' ? 'Ø£Ø¨Ø±Ø² Ø§Ù„Ù‚ØµØµ ÙˆØ§Ù„Ø¯Ù„ÙŠÙ„ Ø§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠ âš¡' : language === 'ku' ? 'Ú†ÛŒØ±Û†Ú©Û• Ø¯ÛŒØ§Ø±Û•Ú©Ø§Ù†Û• Ø²Ø§Ù†Ú©Û† âš¡' : 'CAMPUS HIGHLIGHTS âš¡'}
          </span>
          <span className="text-[8px] font-black text-slate-400 flex items-center gap-1 select-none animate-pulse">
            {language === 'ar' ? 'Ø§Ø³Ø­Ø¨ Ù„Ù„ÙŠÙ…ÙŠÙ† ÙˆØ§Ù„ÙŠØ³Ø§Ø±' : language === 'ku' ? 'Ú•Ø§Ø¨Ú©ÛŽØ´Û• Ø¨Û† Ø¨ÛŒÙ†ÛŒÙ†' : 'Swipe items'}
          </span>
        </div>

        {/* Story Scroller Row */}
        <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none snap-x touch-pan-x" id="stories-scrollable-bar">
          {storyHighlightsData.map((story) => {
            const label = language === 'ar' ? story.labelAR : language === 'ku' ? story.labelKU : story.labelEN;
            const isStoryActive = activeStoryFilter === story.filterType;
            return (
              <div 
                key={story.id} 
                className="flex flex-col items-center gap-1.5 snap-start cursor-pointer shrink-0"
                onClick={() => {
                  if (onSelectSection) {
                    onSelectSection(story.id);
                  }
                }}
              >
                {/* Visual Circle Bubble */}
                <div className="relative group">
                  {/* Dynamic Gradient Ring indicator */}
                  <span className={`absolute inset-0 bg-gradient-to-tr ${story.color} rounded-full p-[2.5px] transition-all duration-300 group-hover:scale-105 ${
                    isStoryActive ? 'ring-4 ring-yellow-405 shadow-md shadow-cyan-400/20' : 'opacity-90'
                  }`} />
                  
                  {/* Inner Emoji bubble */}
                  <span className="relative flex items-center justify-center w-12 h-12 bg-white rounded-full border-2 border-[#121B2E] text-xl shadow-inner select-none transition-transform duration-300 group-hover:scale-95 group-active:rotate-6">
                    {story.emoji}
                  </span>

                  {/* Sparkle badge */}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#FFD21F] border border-white rounded-full flex items-center justify-center text-[7px]" title="Quick View">
                    âœ¨
                  </span>
                </div>

                {/* Subtext Label */}
                <div className="flex flex-col items-center">
                  <span className={`text-[10px] font-bold text-center tracking-tight leading-none max-w-[76px] truncate ${
                    isStoryActive ? 'text-cyan-400 font-black underline' : 'text-slate-300'
                  }`}>
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>



      {/* Feed Filter Alert & Active Stories filter indicator */}
      {activeStoryFilter && (
        <div className="mb-4 bg-[#6B25C9]/20 border border-[#6B25C9]/35 text-[#c1a0f9] text-[10px] font-bold p-2.5 rounded-xl flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 leading-none">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
            <span>
              {language === 'ar' 
                ? `Ø¹Ø±Ø¶ ÙÙ„ØªØ±Ø©: ${storyHighlightsData.find(s => s.filterType === activeStoryFilter)?.labelAR || 'ØªØµÙ†ÙŠÙ Ù…Ø®ØµØµ'}` 
                : language === 'ku'
                ? `Ø¨ÛŒÙ†ÛŒÙ†ÛŒ Ø¯Û•Ø³ØªÙ†ÛŒØ´Ø§Ù†Ú©Ø±Ø§ÙˆÛŒ: ${storyHighlightsData.find(s => s.filterType === activeStoryFilter)?.labelKU || 'ÙÙ„ØªÛ•Ø±'}`
                : `Showing matching category: ${storyHighlightsData.find(s => s.filterType === activeStoryFilter)?.labelEN || 'Filtered'}`}
            </span>
          </div>
          <button 
            onClick={() => setActiveStoryFilter(null)}
            className="text-[10px] font-black hover:text-white transition-colors bg-white/10 px-1.5 py-0.5 rounded cursor-pointer"
          >
            Clear âœ•
          </button>
        </div>
      )}

      {/* Compose post layout bar */}
      <div className="bg-white border-2 border-[#161A33] rounded-3xl p-4.5 mb-5 shadow-[3px_3px_0px_0px_#161A33]" id="post-composition-box">
        {message && (
          <div className="bg-emerald-550 bg-emerald-50 text-emerald-800 text-xs font-bold p-2.5 rounded-xl border-2 border-[#E6E1F5] mb-3 flex items-center gap-1.5 animate-pulse">
            <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <div className="flex items-center gap-2.5 pointer-events-auto" onClick={() => setShowPublisher(!showPublisher)}>
          <div className="text-xl">âš¡</div>
          <div className="flex-1 bg-[#F7F4FF] hover:bg-[#F3F7FF] border border-[#E6E1F5] px-3.5 py-3 rounded-xl text-xs font-bold text-slate-500 transition-all cursor-pointer shadow-inner">
            {language === 'ar' ? 'Ø´Ø§Ø±Ùƒ Ø´ÙŠØ¦Ø§Ù‹ Ù…Ø¹ Ø²Ù…Ù„Ø§Ø¦Ùƒ Ø§Ù„ÙŠÙˆÙ…...' : language === 'ku' ? 'Ø¦Û•Ù…Ú•Û† Ø´ØªÛŽÚ© Ù‡Ø§ÙˆØ¨Û•Ø´ Ø¨Ú©Û•...' : "What's happening on campus today?"}
          </div>
          <button id="post-trigger-plus" className="p-3 bg-[#FFD21F] text-[#161A33] hover:bg-yellow-450 border-2 border-[#161A33] rounded-xl transition-all cursor-pointer shadow-[2px_2px_0px_0px_#161A33]">
            <PlusCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Collapsible publish form */}
        <AnimatePresence>
          {showPublisher && (
            <motion.form
              onSubmit={handlePostSubmit}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-3.5 border-t border-[#E6E1F5] pt-4 flex flex-col gap-3"
            >
              <input
                type="text"
                value={postTitle}
                onChange={e => setPostTitle(e.target.value)}
                placeholder={getTranslation('headlineTopic', language)}
                className="w-full text-xs font-bold text-[#161A33] bg-white border border-[#E6E1F5] rounded-xl px-3.5 py-2.5 focus:bg-[#F3F7FF] focus:outline-none focus:border-[#6B25C9] transition-colors"
              />

              <textarea
                value={postBody}
                onChange={e => setPostBody(e.target.value)}
                required
                maxLength={2000}
                rows={3}
                placeholder={language === 'ar' ? 'Ø§ÙƒØªØ¨ Ù…Ø§ ØªÙÙƒØ± Ø¨Ù‡ Ù„Ù…Ø´Ø§Ø±ÙƒØªÙ‡ Ù…Ø¹ Ø§Ù„ÙƒÙ„ÙŠØ©...' : language === 'ku' ? 'Ø¦Û•Ù…Ú•Û† Ú†ÛŒ Ù„Û• Ø²Ø§Ù†Ú©Û† Ú•ÙˆÙˆØ¯Û•Ø¯Ø§ØªØŸ...' : 'What is happening on campus today?'}
                className="w-full text-xs font-semibold text-[#161A33] bg-white border border-[#E6E1F5] rounded-xl p-3.5 focus:bg-[#F3F7FF] focus:outline-none focus:border-[#6B25C9] transition-colors resize-none"
              />
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span>{language === 'ar' ? 'Ù…Ù†Ø´ÙˆØ± Ù†ØµÙŠ ÙÙ‚Ø· Ù„Ù„Ù†Ø³Ø®Ø© Ø§Ù„Ø£ÙˆÙ„Ù‰' : language === 'ku' ? 'Ø¨Û† MVP ØªÛ•Ù†Ù‡Ø§ Ø¯Û•Ù‚ Ù¾Ø´ØªÛŒÙˆØ§Ù†ÛŒ Ø¯Û•Ú©Ø±ÛŽØª' : 'Text-only MVP. Image upload is hidden until R2 is ready.'}</span>
                <span className={postBody.length > 1800 ? 'text-amber-400' : ''}>{postBody.length}/2000</span>
              </div>

              <div className="flex items-center justify-between mt-1">
                <label className="flex items-center gap-1.5 cursor-pointer bg-white border border-[#E6E1F5] px-3 py-1.5 rounded-xl hover:border-[#6B25C9] transition-colors" id="anonymous-toggle-label">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={e => setAnonymous(e.target.checked)}
                    className="w-4 h-4 text-[#6B25C9] bg-white border-[#E6E1F5] rounded focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase flex items-center gap-1">
                    <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                    {getTranslation('anonymous', language)}
                  </span>
                </label>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowPublisher(false)}
                    className="text-[10px] font-extrabold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPosting || !postBody.trim()}
                    className="text-[10px] font-black bg-[#FFD21F] text-[#161A33] hover:bg-[#FFE052] disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2 rounded-xl shadow-sm border-2 border-[#161A33] cursor-pointer transition-all"
                  >
                    {isPosting ? (language === 'ar' ? 'Ø¬Ø§Ø± Ø§Ù„Ù†Ø´Ø±...' : language === 'ku' ? 'Ø¨ÚµØ§ÙˆØ¯Û•Ú©Ø±ÛŽØªÛ•ÙˆÛ•...' : 'Posting...') : getTranslation('postBtn', language)}
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* 6. Content Feed/Cards Column */}
      <div className="flex flex-col gap-1.5" id="mixed-feed-items-list">
        {isFeedLoading ? (
          <SkeletonLoader />
        ) : filteredFeedItems.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-[#121B2E] border border-[#1F2E4D] rounded-3xl p-6 shadow-sm">
            <div className="text-3xl mb-2">ðŸ”­</div>
            <h3 className="font-extrabold text-white text-xs">No active posts match these filters</h3>
            <p className="text-[10px] text-slate-400 max-w-xs mt-1.5 mx-auto leading-relaxed">
              {language === 'ar' 
                ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ù†Ø´ÙˆØ±Ø§Øª Ù„Ù„Ø·Ù„Ø§Ø¨ ØªÙ†Ø§Ø³Ø¨ Ø§Ø®ØªÙŠØ§Ø±Ø§Øª Ø§Ù„ØªØµÙÙŠØ© Ù‡Ø°Ù‡ Ø­Ø§Ù„ÙŠØ§Ù‹. ÙˆØ³Ù‘Ø¹ Ø§Ù„ØªØ­Ø¯ÙŠØ¯ Ø£Ùˆ ØºÙŠÙ‘Ø± Ø§Ù„Ù…Ø­Ø§ÙØ¸Ø© Ù„Ø±Ø¤ÙŠØ© Ø§Ù„Ù…Ø²ÙŠØ¯!' 
                : language === 'ku' 
                ? 'Ù‡ÛŒÚ† Ø¨Ø§Ø¨Û•ØªÛŽÚ© Ù†ÛŒÛŒÛ• Ø¨Û•Ù¾ÛŽÛŒ Ø¦Û•Ù… Ù¾Ø§ÚµØ§ÙˆØªÙ†Û• Ù„Û• Ø¦ÛŽØ³ØªØ§Ø¯Ø§. ØªØµÙÛŒÛ•Ú©Û•Øª Ø¨Ú¯Û†Ú•Û• Ø¨Û† Ø¨ÛŒÙ†ÛŒÙ†ÛŒ Ù‡Û•Ù…ÙˆÙˆ Ø´ØªÛŽÚ©!' 
                : 'No campus items match this selector combination. Broaden your filters to explore materials around the map!'}
            </p>
          </div>
        ) : (
          filteredFeedItems.map(item => (
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
        )}
      </div>

      {/* âš ï¸ Searchable Custom Institution Picker Modal (Task 1, 2, 3) */}
      <AnimatePresence>
        {showPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="institution-picker-modal">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPicker(false)}
              className="absolute inset-0 bg-[#0c0e1a]"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border-4 border-[#161A33] rounded-3xl w-full max-w-md p-5 shadow-[8px_8px_0px_0px_#161A33] relative z-10 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-[#161A33] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#2F7CCB] text-white flex items-center justify-center font-bold">
                    <School className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#161A33]">
                      {language === 'ar' ? 'Ø§Ø®ØªØ± Ø§Ù„Ù…Ø¤Ø³Ø³Ø© Ø§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠØ©' : language === 'ku' ? 'Ø¯Ø§Ù…Û•Ø²Ø±Ø§ÙˆÛ•ÛŒ Ø¦Û•Ú©Ø§Ø¯ÛŒÙ…ÛŒ Ù‡Û•ÚµØ¨Ú˜ÛŽØ±Û•' : 'Select Academic Institution'}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold">
                      {selectedGov === 'all' 
                        ? (language === 'ar' ? 'Ø¹Ø±Ø¶ ÙƒØ§ÙØ© Ø§Ù„Ù…Ø¤Ø³Ø³Ø§Øª ÙÙŠ Ø§Ù„Ø¹Ø±Ø§Ù‚' : 'Showing all institutions across Iraq')
                        : `${language === 'ar' ? 'Ù…ØµÙÙ‰ Ø­Ø³Ø¨ Ù…Ø­Ø§ÙØ¸Ø©: ' : 'Filter: '}${IraqiGovernorates.find(g => g.id === selectedGov)?.nameEN || selectedGov}`}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPicker(false)}
                  className="p-1 px-2 border-2 border-[#161A33] rounded-lg bg-[#F3F1FB] hover:bg-rose-100 hover:text-[#D9272E] cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Bar Input */}
              <div className="relative mb-3">
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => {
                    setPickerSearch(e.target.value);
                    setPickerPage(1);
                  }}
                  placeholder={language === 'ar' ? 'Ø§Ø¨Ø­Ø« Ø¨Ø§Ù„Ø§Ø³Ù… Ø§Ù„Ø¹Ø±Ø¨ÙŠ Ø£Ùˆ Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ...' : language === 'ku' ? 'Ø¨Ú¯Û•Ú•ÛŽ Ø¨Û•Ù¾ÛŽÛŒ Ù†Ø§Ùˆ...' : 'Search by Arabic or English name...'}
                  className="w-full text-xs font-bold border-2 border-[#161A33] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F7CCB] focus:shadow-[2px_2px_0px_0px_#2F7CCB] transition-all bg-slate-50 text-[#161A33]"
                  autoFocus
                />
              </div>

              {/* Status & Results Information */}
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-extrabold px-1 mb-2">
                <span>
                  {language === 'ar' ? 'Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ù†ØªØ§Ø¦Ø¬: ' : 'Matched results: '}
                  <strong className="text-[#161A33]">{totalItems}</strong>
                </span>
                <span>
                  {language === 'ar' ? 'ØµÙØ­Ø© ' : 'Page '}
                  <strong className="text-[#161A33]">{pickerPage}</strong> / {maxPage}
                </span>
              </div>

              {/* Items List container */}
              <div className="flex-1 overflow-y-auto pr-1 min-h-[220px] flex flex-col gap-1.5 scrollbar-thin">
                {institutionsLoading ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <span className="w-8 h-8 rounded-full border-4 border-[#2F7CCB] border-t-transparent animate-spin animate-duration-1000" />
                    <span className="text-xs font-bold text-slate-500">{language === 'ar' ? 'â³ Ø¬Ø§Ø±ÙŠ Ø¬Ù„Ø¨ Ø§Ù„Ù…Ø¤Ø³Ø³Ø§Øª...' : 'Loading institutions from API...'}</span>
                  </div>
                ) : institutionsError ? (
                  <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-xl text-center flex flex-col gap-3">
                    <p className="text-xs font-bold text-rose-950">{language === 'ar' ? `ÙØ´Ù„ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª: ${institutionsError}` : `API connection error: ${institutionsError}`}</p>
                    <button
                      onClick={onRetryInstitutions}
                      className="py-1.5 px-4 bg-rose-100 hover:bg-rose-200 text-rose-950 font-black border-2 border-[#161A33] cursor-pointer text-[10px] rounded-lg transition-all"
                    >
                      ðŸ”„ Retry Call
                    </button>
                  </div>
                ) : paginatedUnis.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-350 rounded-xl">
                    <span className="text-2xl block mb-1">ðŸ›°ï¸</span>
                    <span className="text-xs font-extrabold text-slate-500">
                      {language === 'ar' ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ø¤Ø³Ø³Ø§Øª Ù…Ø·Ø§Ø¨Ù‚Ø© Ù„Ù„Ø¨Ø­Ø«' : 'No matching academic centers'}
                    </span>
                  </div>
                ) : (
                  <>
                    {/* Clear selection option */}
                    {pickerPage === 1 && !pickerSearch && (
                      <button
                        onClick={() => {
                          setSelectedUni('all');
                          setShowPicker(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border-2 hover:bg-slate-50 cursor-pointer text-left transition-all ${
                          selectedUni === 'all'
                            ? 'border-[#2F7CCB] bg-slate-50/70 font-black text-[#2F7CCB]'
                            : 'border-slate-200 font-bold text-slate-700'
                        }`}
                      >
                        <span className="text-xs">ðŸ« {language === 'ar' ? 'ÙƒÙ„ Ø§Ù„Ø¬Ø§Ù…Ø¹Ø§Øª ÙˆØ§Ù„Ù…Ø¤Ø³Ø³Ø§Øª' : language === 'ku' ? 'Ù‡Û•Ù…ÙˆÙˆ Ø²Ø§Ù†Ú©Û†Ú©Ø§Ù†' : 'All Institutions / Global Scope'}</span>
                        {selectedUni === 'all' && <CheckCircle className="w-4 h-4 text-[#2F7CCB] shrink-0" />}
                      </button>
                    )}

                    {paginatedUnis.map(uni => (
                      <button
                        key={uni.id}
                        onClick={() => {
                          setSelectedUni(uni.id);
                          setShowPicker(false);
                        }}
                        className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border-2 hover:bg-slate-50 cursor-pointer text-left transition-all ${
                          selectedUni === uni.id
                            ? 'border-[#2F7CCB] bg-blue-50/40 text-[#161A33]'
                            : 'border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-250 flex items-center justify-center text-xs shrink-0">{uni.logo}</span>
                        <div className="flex-1 min-w-0 pr-1.5">
                          <p className="text-[11px] font-black leading-tight text-[#161A33] truncate">
                            {language === 'ar' ? uni.nameAR : language === 'ku' ? uni.nameKU : uni.nameEN}
                          </p>
                          <p className="text-[9px] font-semibold text-slate-400 capitalize flex items-center gap-1.5 mt-0.5">
                            ðŸ“ {IraqiGovernorates.find(g => g.id === uni.governorateId)?.nameEN || uni.governorateId}
                          </p>
                        </div>
                        {selectedUni === uni.id && <CheckCircle className="w-4 h-4 text-[#2F7CCB] shrink-0" />}
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* Pagination Footer Controls */}
              {maxPage > 1 && !institutionsLoading && !institutionsError && (
                <div className="flex items-center justify-between border-t border-[#161A33]/15 pt-3 mt-3">
                  <button
                    disabled={pickerPage === 1}
                    onClick={() => setPickerPage(p => Math.max(1, p - 1))}
                    className="p-1.5 px-3 border-2 border-[#161A33] rounded-lg text-xs font-black bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer flex items-center gap-1"
                  >
                    â—€ {language === 'ar' ? 'Ø§Ù„Ø³Ø§Ø¨Ù‚' : 'Prev'}
                  </button>
                  <span className="text-[10px] font-extrabold text-slate-500">
                    {pickerPage} / {maxPage}
                  </span>
                  <button
                    disabled={pickerPage === maxPage}
                    onClick={() => setPickerPage(p => Math.min(maxPage, p + 1))}
                    className="p-1.5 px-3 border-2 border-[#161A33] rounded-lg text-xs font-black bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer flex items-center gap-1"
                  >
                    {language === 'ar' ? 'Ø§Ù„ØªØ§Ù„ÙŠ' : 'Next'} â–¶
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Temporary Admin Debug Card (Visible in development mode) */}
      {(() => {
        const isDev = Boolean((import.meta as any).env?.DEV) || window.location.hostname.includes('localhost') || window.location.hostname === '127.0.0.1';
        const sourceList = institutions && institutions.length > 0 ? institutions : IraqiUniversities;
        const govUnis = selectedGov === 'all' ? sourceList : sourceList.filter(u => u.governorateId === selectedGov);
        
        return isDev ? (
          <div className="mt-8 bg-white border-4 border-dashed border-[#161A33] rounded-3xl p-4.5 shadow-[4px_4px_0px_0px_#161A33] text-left" id="dev-admin-debug-panel">
            <div className="flex items-center gap-2 mb-2.5 border-b-2 border-[#161A33] pb-1.5">
              <span className="text-sm">ðŸ› ï¸</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#161A33]">{language === 'ar' ? 'Ù„ÙˆØ­Ø© ØªØµØ­ÙŠØ­ Ø§Ù„Ø£Ø®Ø·Ø§Ø¡ (Ø§Ù„Ù…Ø´Ø±Ù)' : 'Admin Debug Control Panel'}</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-700">
              <div className="p-2 bg-slate-50 border border-[#161A33]/10 rounded-xl">
                <span className="text-slate-400 block uppercase text-[8px] font-black">Institutions Loaded</span>
                <span className="font-extrabold text-[#161A33] font-mono select-all text-xs">{sourceList.length} records</span>
              </div>
              <div className="p-2 bg-slate-50 border border-[#161A33]/10 rounded-xl">
                <span className="text-slate-400 block uppercase text-[8px] font-black">Filtered Count</span>
                <span className="font-extrabold text-[#161A33] font-mono text-xs">{govUnis.length} matches</span>
              </div>
              <div className="p-2 bg-slate-50 border border-[#161A33]/10 rounded-xl">
                <span className="text-slate-400 block uppercase text-[8px] font-black">Selected Governorate</span>
                <span className="font-extrabold text-[#6B25C9] font-mono text-xs capitalize">{selectedGov === 'all' ? 'All' : selectedGov}</span>
              </div>
              <div className="p-2 bg-slate-50 border border-[#161A33]/10 rounded-xl">
                <span className="text-slate-400 block uppercase text-[8px] font-black">Selected Institution</span>
                <span className="font-extrabold text-[#2F7CCB] font-mono text-xs truncate capitalize max-w-[150px] block" title={selectedUni}>
                  {selectedUni === 'all' ? 'All' : selectedUni}
                </span>
              </div>
              <div className="p-2 bg-slate-50 border border-[#161A33]/10 rounded-xl col-span-2">
                <span className="text-slate-400 block uppercase text-[8px] font-black">API Loading / Error Status</span>
                <div className="flex gap-2 items-center mt-0.5">
                  <span className="font-extrabold text-[10px]">
                    {institutionsLoading ? (
                      <span className="text-amber-600 font-mono animate-pulse">LOADING</span>
                    ) : (
                      <span className="text-emerald-600 font-mono">COMPLETE</span>
                    )}
                  </span>
                  <span className="text-slate-300 font-medium">|</span>
                  <span className="font-extrabold font-mono text-[10px] truncate max-w-[200px]" title={institutionsError || 'ONLINE'}>
                    {institutionsError ? <span className="text-rose-600">ERROR: {institutionsError}</span> : <span className="text-emerald-600">ONLINE âœ“</span>}
                  </span>
                </div>
              </div>
            </div>
            {institutionsError && (
              <button
                onClick={onRetryInstitutions}
                className="mt-3 w-full py-2 bg-rose-100 hover:bg-rose-200 text-rose-950 font-black border-2 border-[#161A33] cursor-pointer text-[10px] rounded-xl transition-all shadow-[2px_2px_0px_0px_#161A33]"
              >
                ðŸ”„ Retry Institutions Load API Call
              </button>
            )}
          </div>
        ) : null;
      })()}

    </div>
  );
}


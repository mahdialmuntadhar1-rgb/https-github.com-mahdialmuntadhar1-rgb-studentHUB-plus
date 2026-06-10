import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Send, Heart, Sparkles, Trophy, MessageCircle } from 'lucide-react';

interface StorySlide {
  textEN: string;
  textAR: string;
  textKU: string;
  emoji: string;
  bgColor: string; // Tailwind gradient classes
  bgImage?: string; // Optional nice background illustration
}

interface StudentStory {
  id: string;
  nameEN: string;
  nameAR: string;
  nameKU: string;
  uniEN: string;
  uniAR: string;
  uniKU: string;
  avatarEmoji: string;
  avatarColor: string; // e.g. bg-purple-500
  slides: StorySlide[];
  isSeen?: boolean;
}

const studentStoriesMockData: StudentStory[] = [
  {
    id: 'story-sara',
    nameEN: 'Sara Ahmed',
    nameAR: 'سارة أحمد',
    nameKU: 'سارە ئەحمەد',
    uniEN: 'Univ of Baghdad 🩺',
    uniAR: 'جامعة بغداد 🩺',
    uniKU: 'زانکۆی بەغدا 🩺',
    avatarEmoji: '👩‍⚕️',
    avatarColor: 'bg-emerald-500',
    slides: [
      {
        textEN: "Morning lab session checking microscopic cells! Midterms are so close 😭🔬",
        textAR: "جلسة المختبر الصباحية لفحص الخلايا المجهرية! الامتحانات النصفية باتت قريبة جداً 😭🔬",
        textKU: "کۆبوونەوەی تاقیگەی بەیانیان بۆ پشکنینی خانە وردبینەکان! تاقیکردنەوەکان نزیکن 😭🔬",
        emoji: '🔬',
        bgColor: 'from-emerald-600 via-teal-700 to-cyan-800'
      },
      {
        textEN: "Kurdistan study escape this weekend is planned! Need that fresh mountain air 🏔️✨",
        textAR: "تم التخطيط لرحلة دراسية إلى كوردستان عطلة نهاية هذا الأسبوع! أحتاج هواء الجبل النقي 🏔️✨",
        textKU: "گەشتی خوێندن بۆ کوردستان بۆ کۆتایی ئەم هەفتەیە پلان بۆ داڕێژراوە! پێویستم بە هەوای چیا هەیە 🏔️✨",
        emoji: '🏞️',
        bgColor: 'from-teal-600 to-indigo-700'
      }
    ]
  },
  {
    id: 'story-mustafa',
    nameEN: 'Mustafa Ali',
    nameAR: 'مصطفى علي',
    nameKU: 'مستەفا عەلی',
    uniEN: 'Al-Mustansiriya Univ 💻',
    uniAR: 'الجامعة المستنصرية 💻',
    uniKU: 'زانکۆی موستەنسریە 💻',
    avatarEmoji: '👨‍💻',
    avatarColor: 'bg-cyan-500',
    slides: [
      {
        textEN: "Building our AI-powered student assistant with Gemini API! App is almost alive! 🤖🚀",
        textAR: "نبني مساعدنا الطلابي المدعوم بالذكاء الاصطناعي مع Gemini API! التطبيق على وشك النجاح العملي! 🤖🚀",
        textKU: "دروستکردنی یاریدەدەری قوتابی لەسەر بنەمای ژیری دەستکرد بە بەکارهێنانی Gemini! بەرنامەکە نزیکە لە دەرچوون! 🤖🚀",
        emoji: '🤖',
        bgColor: 'from-cyan-600 via-blue-750 to-indigo-850'
      }
    ]
  },
  {
    id: 'story-rawan',
    nameEN: 'Rawan Omer',
    nameAR: 'روان عمر',
    nameKU: 'ڕەوان عومەر',
    uniEN: 'Univ of Sulaymaniyah 🏔️',
    uniAR: 'جامعة السليمانية 🏔️',
    uniKU: 'زانکۆی سلێمانی 🏔️',
    avatarEmoji: '👩‍🎨',
    avatarColor: 'bg-indigo-500',
    slides: [
      {
        textEN: "Sunset over Mount Goizha from campus was stunning today! Beautiful breezes 🌄☕",
        textAR: "غروب الشمس فوق جبل كويجة من الحرم الجامعي كان مذهلاً اليوم! نسمات منعشة 🌄☕",
        textKU: "ئاوابوونی خۆر بەسەر چیای گۆیژە لە کەمپەسەوە ئەمڕۆ سەرنجڕاکێش بوو! کاتێکی دڵگیر 🌄☕",
        emoji: '🌅',
        bgColor: 'from-indigo-600 via-purple-700 to-pink-600'
      },
      {
        textEN: "Midterm study sessions with traditional Kurdish tea! Best fuel ever! 🫖📚",
        textAR: "جلسات دراسة الامتحانات النصفية مع الشاي الكردي التقليدي! أفضل دافع على الإطلاق! 🫖📚",
        textKU: "خوێندنی تاقیکردنەوەکان لەگەڵ چای کوردی ڕەسەن! باشترین وزە بەخش! 🫖📚",
        emoji: '🫖',
        bgColor: 'from-purple-600 to-rose-600'
      }
    ]
  },
  {
    id: 'story-ali',
    nameEN: 'Ali Jabbar',
    nameAR: 'علي جبار',
    nameKU: 'عەلی جەبار',
    uniEN: 'Univ of Basra 🌴',
    uniAR: 'جامعة البصرة 🌴',
    uniKU: 'زانکۆی بەسرە 🌴',
    avatarEmoji: '👨‍⚕️',
    avatarColor: 'bg-amber-500',
    slides: [
      {
        textEN: "Long shift in clinical practice! Basra Heat is here but we keep smiling! 🩺🥤",
        textAR: "نوبة عمل طويلة في التدريب السريري! حرارة البصرة مرتفعة ولكننا مستمرون بالابتسام! 🩺🥤",
        textKU: "کارێکی درێژخایەن لە پراکتیکی پزیشکی! گەرمای بەسرە زۆرە بەڵام پێکەنینمان بەردەوامە! 🩺🥤",
        emoji: '🌴',
        bgColor: 'from-amber-500 via-orange-600 to-rose-600'
      }
    ]
  },
  {
    id: 'story-zahid',
    nameEN: 'Noor Al-Huda',
    nameAR: 'نور الهدى',
    nameKU: 'نوور ئەلهودا',
    uniEN: 'Al-Nahrain Univ 🔬',
    uniAR: 'جامعة النهرين 🔬',
    uniKU: 'زانکۆی نەهرەین 🔬',
    avatarEmoji: '👩‍🔬',
    avatarColor: 'bg-rose-500',
    slides: [
      {
        textEN: "Setting up our chemical reaction samples. They look like glowing gems! 🧪💎",
        textAR: "نقوم بإعداد عينات التفاعل الكيميائي. تبدو مثل مجوهرات متوهجة! 🧪💎",
        textKU: "ئامادەکردنی نمونەی کارلێکی کیمیایی. وەک گەوهەری درەوشاوە دەردەکەون! 🧪💎",
        emoji: '🧪',
        bgColor: 'from-rose-500 via-purple-600 to-indigo-700'
      }
    ]
  },
  {
    id: 'story-soran',
    nameEN: 'Soran Dler',
    nameAR: 'سوران دلير',
    nameKU: 'سۆران دلێر',
    uniEN: 'Salahaddin Univ 🏰',
    uniAR: 'جامعة صلاح الدين 🏰',
    uniKU: 'زانکۆی سەڵاحەدین 🏰',
    avatarEmoji: '👨‍🎓',
    avatarColor: 'bg-violet-500',
    slides: [
      {
        textEN: "Beautiful morning at the historic Erbil Citadel before lectures start 🎒🏰",
        textAR: "صباح جميل في قلعة أربيل التاريخية قبل بدء المحاضرات اليومية 🎒🏰",
        textKU: "بەیانییەکی جوان لە قەڵای مێژوویی هەولێر پێش دەستپێکردنی وانەکان 🎒🏰",
        emoji: '🏰',
        bgColor: 'from-violet-600 via-indigo-600 to-purple-800'
      }
    ]
  }
];

interface StudentStoriesProps {
  language: Language;
  onAwardPoints?: (points: number) => void;
  showToast?: (text: string, type: 'success' | 'error' | 'info') => void;
}

export default function StudentStories({
  language,
  onAwardPoints,
  showToast
}: StudentStoriesProps) {
  const [stories, setStories] = useState<StudentStory[]>(() => {
    // Read seen status from local storage
    const savedSeen = localStorage.getItem('jamiaati_seen_stories');
    const seenIds = savedSeen ? JSON.parse(savedSeen) : [];
    return studentStoriesMockData.map(story => ({
      ...story,
      isSeen: seenIds.includes(story.id)
    }));
  });

  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null);
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const [replyText, setReplyText] = useState('');
  const [paused, setPaused] = useState(false);
  
  // Progress bar duration per slide (ms)
  const SLIDE_DURATION = 4000;
  const progressTimer = useRef<NodeJS.Timeout | null>(null);
  const [progress, setProgress] = useState(0);

  // Sync seen stories
  const markStoryAsSeen = (id: string) => {
    setStories(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, isSeen: true } : s);
      const seenIds = updated.filter(s => s.isSeen).map(s => s.id);
      localStorage.setItem('jamiaati_seen_stories', JSON.stringify(seenIds));
      return updated;
    });
  };

  const handleOpenStory = (index: number) => {
    setActiveStoryIdx(index);
    setActiveSlideIdx(0);
    setProgress(0);
    setReplyText('');
    setPaused(false);
    markStoryAsSeen(stories[index].id);
  };

  const handleCloseStory = () => {
    setActiveStoryIdx(null);
    setProgress(0);
  };

  const handleNextSlide = () => {
    if (activeStoryIdx === null) return;
    const currentStory = stories[activeStoryIdx];
    if (activeSlideIdx < currentStory.slides.length - 1) {
      setActiveSlideIdx(prev => prev + 1);
      setProgress(0);
    } else {
      // Go to next student's story if available
      if (activeStoryIdx < stories.length - 1) {
        handleOpenStory(activeStoryIdx + 1);
      } else {
        handleCloseStory();
      }
    }
  };

  const handlePrevSlide = () => {
    if (activeStoryIdx === null) return;
    if (activeSlideIdx > 0) {
      setActiveSlideIdx(prev => prev - 1);
      setProgress(0);
    } else {
      // Go to previous student's story if available
      if (activeStoryIdx > 0) {
        handleOpenStory(activeStoryIdx - 1);
        // Set to last slide of that story
        const prevStory = stories[activeStoryIdx - 1];
        setActiveSlideIdx(prevStory.slides.length - 1);
      }
    }
  };

  // Automated auto-play mechanism
  useEffect(() => {
    if (activeStoryIdx === null || paused) {
      if (progressTimer.current) clearInterval(progressTimer.current);
      return;
    }

    const intervalStep = 50; // Update progress every 50ms
    progressTimer.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer.current!);
          handleNextSlide();
          return 0;
        }
        return prev + (intervalStep / SLIDE_DURATION) * 100;
      });
    }, intervalStep);

    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  }, [activeStoryIdx, activeSlideIdx, paused]);

  const handleReactWithEmoji = (emoji: string) => {
    if (onAwardPoints) onAwardPoints(10);
    if (showToast) {
      showToast(
        language === 'ar' ? `تم تفاعلك بـ ${emoji}! 💖 +١٠ نقاط تفاعل` : language === 'ku' ? `کاردانەوە پۆزەتیڤ ${emoji}! 💖 +١٠ خاڵ` : `Reacted with ${emoji}! 💖 +10 pts`,
        'success'
      );
    }
    // Briefly celebrate or skip
    handleNextSlide();
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    if (onAwardPoints) onAwardPoints(15);
    if (showToast) {
      showToast(
        language === 'ar' ? 'تم إرسال ردّك المباشر بنجاح! 💬 +١٥ نقطة تفاعل' : language === 'ku' ? 'وەڵامەکەت بە سەرکەوتوویی نێردرا! 💬 +١٥ خاڵ' : 'Direct reply sent to student! 💬 +15 pts',
        'success'
      );
    }
    setReplyText('');
    handleNextSlide();
  };

  const currentStory = activeStoryIdx !== null ? stories[activeStoryIdx] : null;
  const currentSlide = currentStory ? currentStory.slides[activeSlideIdx] : null;

  return (
    <div className="w-full mb-4 px-1" id="student-stories-section-container">
      {/* Stories Line Section Label */}
      <div className="flex items-center justify-between mb-3.5 px-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#FFD21F] animate-spin" />
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FFD21F] bg-[#1A0D3D] border border-rgba(139, 92, 246, 0.4) px-3 py-1 rounded-full leading-none shadow-sm">
            {language === 'ar' ? 'يوميات طلابنا المباشرة 🎬' : language === 'ku' ? 'چیرۆکی نایابی خوێندکاران 🎬' : 'LIVE STUDENT STORIES 🎬'}
          </span>
        </div>
        <span className="text-[8.5px] font-bold text-violet-300 animate-pulse">
          {language === 'ar' ? 'اضغط للمشاهدة 🍿' : language === 'ku' ? 'کلیک بکە بۆ بینین 🍿' : 'Tap to watch 🍿'}
        </span>
      </div>

      {/* Horizontal List Scroll */}
      <div 
        className="flex gap-4 overflow-x-auto pb-2.5 pt-0.5 scrollbar-none snap-x touch-pan-x" 
        id="student-stories-horizontal-bar"
      >
        {/* Your Story trigger */}
        <div className="flex flex-col items-center gap-1.5 snap-start cursor-pointer shrink-0">
          <div className="relative">
            <div className="flex items-center justify-center w-12.5 h-12.5 rounded-full bg-slate-800 border-2 border-dashed border-violet-500/50 p-[2px] transition-transform duration-200 active:scale-95">
              <span className="flex items-center justify-center w-full h-full bg-[#11052C] rounded-full text-base font-black text-violet-400">
                ＋
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-350 tracking-tight leading-none text-center">
            {language === 'ar' ? 'قصتك' : language === 'ku' ? 'چیرۆکت' : 'My Story'}
          </span>
        </div>

        {stories.map((story, idx) => {
          const name = language === 'ar' ? story.nameAR : language === 'ku' ? story.nameKU : story.nameEN;
          // Gradient Ring color depending on seen status
          const ringGradient = story.isSeen 
            ? 'from-slate-700 to-slate-500 opacity-60' 
            : 'from-pink-500 via-[#FFD21F] to-violet-500 animate-pulse';

          return (
            <div 
              key={story.id}
              className="flex flex-col items-center gap-1.5 snap-start cursor-pointer shrink-0 relative"
              onClick={() => handleOpenStory(idx)}
              id={`student-story-${story.id}`}
            >
              {/* Profile Avatar with Dynamic Story Frame */}
              <div className="relative group">
                {/* Visual border ring */}
                <span className={`absolute inset-0 rounded-full p-[2.2px] bg-gradient-to-tr ${ringGradient} shadow-md transition-all duration-300 group-hover:scale-110`} />
                
                {/* Central Inner Circle */}
                <div className="relative flex items-center justify-center w-12.5 h-12.5 bg-slate-900 rounded-full border-2 border-[#070314] overflow-hidden">
                  <span className={`absolute inset-0 ${story.avatarColor} opacity-20`} />
                  <span className="text-xl select-none transition-transform duration-300 group-hover:scale-110">
                    {story.avatarEmoji}
                  </span>
                </div>

                {/* Sparkling Mini Badges */}
                {!story.isSeen && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 border border-white rounded-full flex items-center justify-center text-[7px] font-black text-white px-0.5">
                    1
                  </span>
                )}
              </div>

              {/* Story owner metadata */}
              <div className="flex flex-col items-center w-full">
                <span className={`text-[10px] tracking-tight leading-none text-center font-bold max-w-[72px] truncate ${
                  story.isSeen ? 'text-slate-400' : 'text-slate-100 font-extrabold'
                }`}>
                  {name}
                </span>
                <span className="text-[7px] text-[#A99ECA] font-medium scale-90 truncate max-w-[70px] mt-0.5">
                  {language === 'ar' ? story.uniAR : language === 'ku' ? story.uniKU : story.uniEN}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fullscreen Storytelling Modal Panel */}
      <AnimatePresence>
        {activeStoryIdx !== null && currentStory && currentSlide && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md select-none touch-none p-0 sm:p-4"
            id="fullscreen-story-viewer-modal"
          >
            {/* Click handlers on outer edges to close */}
            <div className="absolute inset-0 cursor-zoom-out" onClick={handleCloseStory} />

            <div className="relative w-full h-full sm:h-[820px] sm:max-w-[460px] bg-slate-950 sm:rounded-3xl shadow-2xl border-0 sm:border-2 sm:border-violet-500/30 overflow-hidden flex flex-col justify-between z-10">
              
              {/* Top Interactive Segments & User Info Header Section */}
              <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4 pt-6 z-20">
                
                {/* Horizontal segment loaders */}
                <div className="flex gap-1.5 mb-3.5 select-none">
                  {currentStory.slides.map((_, idx) => {
                    let fillWidth = '0%';
                    if (idx < activeSlideIdx) fillWidth = '100%';
                    else if (idx === activeSlideIdx) fillWidth = `${progress}%`;

                    return (
                      <div key={idx} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#FFD21F] to-rose-400 transition-all duration-75 ease-linear"
                          style={{ width: fillWidth }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Profile Meta & Actions */}
                <div className="flex items-center justify-between">
                  {/* Left Side: Avatar, Name & University */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-slate-900 rounded-full border border-yellow-400 flex items-center justify-center text-lg shadow-sm">
                      {currentStory.avatarEmoji}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-white flex items-center gap-1">
                        {language === 'ar' ? currentStory.nameAR : language === 'ku' ? currentStory.nameKU : currentStory.nameEN}
                        <Trophy className="w-3 h-3 text-[#FFD21F]" />
                      </span>
                      <span className="text-[9px] text-slate-300 font-bold">
                        {language === 'ar' ? currentStory.uniAR : language === 'ku' ? currentStory.uniKU : currentStory.uniEN}
                      </span>
                    </div>
                  </div>

                  {/* Right: Close Actions */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setPaused(!paused)}
                      className="px-2 py-1 text-[9px] font-black uppercase text-white bg-white/10 hover:bg-white/20 rounded-full leading-none mr-1"
                    >
                      {paused ? '▶ Play' : '⏸ Pause'}
                    </button>
                    <button 
                      onClick={handleCloseStory}
                      className="p-1.5 bg-white/10 hover:bg-white/20 transition rounded-full text-white"
                      aria-label="Close Story"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Large Central Content Slide Area */}
              <div className={`flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-br ${currentSlide.bgColor} relative`}>
                
                {/* Decorative background grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                {/* Click and tap zones to go backwards or forwards directly */}
                <div 
                  className="absolute left-0 inset-y-0 w-1/4 z-10 cursor-w-resize" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevSlide();
                  }}
                  title="Previous Slide"
                />
                
                <div 
                  className="absolute right-0 inset-y-0 w-1/4 z-10 cursor-e-resize"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextSlide();
                  }}
                  title="Next Slide"
                />

                {/* Text and emoji focus */}
                <div className="text-center max-w-sm px-4 z-10 flex flex-col items-center gap-5 relative">
                  {/* Glowing core emoji */}
                  <motion.div 
                    initial={{ scale: 0.6, rotate: -15 }}
                    animate={{ scale: 1.1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 100 }}
                    className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-4xl shadow-inner border border-white/20 select-none"
                  >
                    {currentSlide.emoji}
                  </motion.div>

                  {/* Slide text box with elegant neon effects */}
                  <motion.p 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={`${activeStoryIdx}-${activeSlideIdx}`}
                    className="text-base sm:text-lg font-black text-white leading-relaxed tracking-tight break-words drop-shadow-md"
                  >
                    {language === 'ar' ? currentSlide.textAR : language === 'ku' ? currentSlide.textKU : currentSlide.textEN}
                  </motion.p>
                </div>
              </div>

              {/* Bottom Quick Messaging Interactive Tray & Reactions */}
              <div className="bg-gradient-to-t from-black via-black/90 to-black/30 p-5 pt-8 pb-7 select-none">
                
                {/* Row of quick interactive click reactions */}
                <div className="flex items-center justify-around gap-2 mb-4">
                  {['❤️', '👏', '🔥', '😂', '💯', '🙌'].map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleReactWithEmoji(emoji)}
                      className="text-2xl hover:scale-125 transition-transform duration-250 active:scale-90 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-2xl"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* Interactive Reply Field */}
                <form onSubmit={handleSendReply} className="flex gap-2 relative">
                  <input 
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={language === 'ar' ? 'أرسل رداً خاصاً للغرفة... 💬' : language === 'ku' ? 'نامەیەک بنێرە... 💬' : 'Send a private reply... 💬'}
                    className="flex-1 bg-white/10 text-white placeholder-slate-400 text-xs px-4 py-3 rounded-2xl border border-white/20 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-450 text-left"
                    onFocus={() => setPaused(true)}
                    onBlur={() => setPaused(false)}
                  />
                  <button 
                    type="submit"
                    className="px-4 py-3 bg-[#6B25C9] hover:bg-gradient-to-r hover:from-[#6B25C9] hover:to-[#FFD21F]/80 text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                {/* Direct indicators */}
                <div className="flex justify-between items-center text-[8px] text-slate-400 font-bold mt-3.5 px-0.5">
                  <span>
                    {language === 'ar' ? 'الرد يمنح +١٥ نقطة!' : 'Replies award +15 pts! 🎉'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-2.5 h-2.5 text-yellow-400" />
                    Student Live Diary
                  </span>
                </div>
              </div>

              {/* Manual navigation buttons for wider screens/desktops outside click areas */}
              <button 
                onClick={handlePrevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white/75 transition-all hidden sm:flex border border-white/10 z-20"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button 
                onClick={handleNextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white/75 transition-all hidden sm:flex border border-white/10 z-20"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

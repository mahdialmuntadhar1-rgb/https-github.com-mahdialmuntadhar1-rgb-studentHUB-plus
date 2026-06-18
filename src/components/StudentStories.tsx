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
  avatarUrl?: string; // Optional real photo URL
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
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    slides: [
      {
        textEN: "Morning lab session checking microscopic cells! Midterms are so close 😭🔬",
        textAR: "جلسة المختبر الصباحية لفحص الخلايا المجهرية! الامتحانات النصفية باتت قريبة جداً 😭🔬",
        textKU: "کۆبوونەوەی تاقیگەی بەیانیان بۆ پشکنینی خانە وردبینەکان! تاقیکندرەوەکان نزیکن 😭🔬",
        emoji: '🔬',
        bgColor: 'from-emerald-700 via-teal-800 to-cyan-900',
        bgImage: 'https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&q=80&w=600'
      },
      {
        textEN: "Kurdistan study escape this weekend is planned! Need that fresh mountain air 🏔️✨",
        textAR: "تم التخطيط لرحلة دراسية إلى كوردستان عطلة نهاية هذا الأسبوع! أحتاج هواء الجبل النقي 🏔️✨",
        textKU: "گەشتی خوێندن بۆ کوردستان بۆ کۆتایی ئەم هەفتەیە پلان بۆ داڕێژراوە! پێویستم بە هەوای چیا هەیە 🏔️✨",
        emoji: '🏞️',
        bgColor: 'from-teal-700 to-indigo-800',
        bgImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600'
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
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    slides: [
      {
        textEN: "Building our AI-powered student assistant with Gemini API! App is almost alive! 🤖🚀",
        textAR: "نبني مساعدنا الطلابي المدعوم بالذكاء الاصطناعي مع Gemini API! التطبيق على وشك النجاح العملي! 🤖🚀",
        textKU: "دروستکردنی یاریدەدەری قوتابی لەسەر بنەمای ژیری دەستکرد بە بەکارهێنانی Gemini! بەرنامەکە نزیکە لە دەرچوون! 🤖🚀",
        emoji: '🤖',
        bgColor: 'from-cyan-700 via-blue-800 to-indigo-900',
        bgImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600'
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
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    slides: [
      {
        textEN: "Sunset over Mount Goizha from campus was stunning today! Beautiful breezes 🌄☕",
        textAR: "غروب الشمس فوق جبل كويجة من الحرم الجامعي كان مذهلاً اليوم! نسمات منعشة 🌄☕",
        textKU: "ئاوابوونی خۆر بەسەر چیای گۆیژە لە کەمپەسەوە ئەمڕۆ سەرنجڕاکێش بوو! کاتێکی دڵگیر 🌄☕",
        emoji: '🌅',
        bgColor: 'from-indigo-700 via-purple-800 to-pink-700',
        bgImage: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=600'
      },
      {
        textEN: "Midterm study sessions with traditional Kurdish tea! Best fuel ever! 🫖📚",
        textAR: "جلسات دراسة الامتحانات النصفية مع الشاي الكردي التقليدي! أفضل دافع على الإطلاق! 🫖📚",
        textKU: "خوێندنی تاقیکردنەوەکان لەگەڵ چای کوردی ڕەسەن! باشترین وزە بەخش! 🫖📚",
        emoji: '🫖',
        bgColor: 'from-purple-700 to-rose-700',
        bgImage: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600'
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
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    slides: [
      {
        textEN: "Long shift in clinical practice! Basra Heat is here but we keep smiling! 🩺🥤",
        textAR: "نوبة عمل طويلة في التدريب السريري! حرارة البصرة مرتفعة ولكننا مستمرون بالابتسام! 🩺🥤",
        textKU: "کارێکی درێژخایەن لە پراکتیکی پزیشکی! گەرمای بەسرە زۆرە بەڵام پێکەنینمان بەردەوامە! 🩺🥤",
        emoji: '🌴',
        bgColor: 'from-amber-650 via-orange-700 to-rose-700',
        bgImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600'
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
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    slides: [
      {
        textEN: "Setting up our chemical reaction samples. They look like glowing gems! 🧪💎",
        textAR: "نقوم بإعداد عينات التفاعل الكيميائي. تبدو مثل مجوهرات متوهجة! 🧪💎",
        textKU: "ئامادەکردنی نمونەی کارلێکی کیمیایی. وەک گەوهەری درەوشاوە دەردەکەون! 🧪💎",
        emoji: '🧪',
        bgColor: 'from-rose-500 via-purple-600 to-indigo-700',
        bgImage: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?auto=format&fit=crop&q=80&w=600'
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
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    slides: [
      {
        textEN: "Beautiful morning at the historic Erbil Citadel before lectures start 🎒🏰",
        textAR: "صباح جميل في قلعة أربيل التاريخية قبل بدء المحاضرات اليومية 🎒🏰",
        textKU: "بەیانییەکی جوان لە قەڵای مێژوویی هەولێر پێش دەستپێکردنی وانەکان 🎒🏰",
        emoji: '🏰',
        bgColor: 'from-violet-600 via-indigo-600 to-purple-800',
        bgImage: 'https://images.unsplash.com/photo-1596463059386-4418116ded9c?auto=format&fit=crop&q=80&w=600'
      }
    ]
  }
];

export const middleEasternAvatars = [
  {
    id: 'av_female_med',
    url: '/src/assets/images/me_female_med_student_1781347010284.jpg',
    emoji: '👩‍⚕️',
    labelEN: 'Medical Student (Female)',
    labelAR: 'طالبة طب (إناث)',
    labelKU: 'قوتابی پزیشکی (مێ)',
  },
  {
    id: 'av_male_eng',
    url: '/src/assets/images/me_male_eng_student_1781347025742.jpg',
    emoji: '👨‍💻',
    labelEN: 'Engineering Student (Male)',
    labelAR: 'طالب هندسة (ذكور)',
    labelKU: 'قوتابی ئەندازیاری (نێر)',
  },
  {
    id: 'av_female_cs',
    url: '/src/assets/images/me_female_cs_student_1781347041085.jpg',
    emoji: '👩‍💻',
    labelEN: 'Tech Student (Female)',
    labelAR: 'طالبة لغات برمجة (إناث)',
    labelKU: 'قوتابی تەکنەلۆجیا (مێ)',
  },
  {
    id: 'av_male_arts',
    url: '/src/assets/images/me_male_arts_student_1781347058036.jpg',
    emoji: '👨‍🎓',
    labelEN: 'Arts Student (Male)',
    labelAR: 'طالب آداب وفنون (ذكور)',
    labelKU: 'قوتابی هونەر (نێر)',
  },
  {
    id: 'av_sara',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    emoji: '👩‍⚕️',
    labelEN: 'Sara Ahmed',
    labelAR: 'سارة أحمد',
    labelKU: 'سارە ئەحمەد',
  },
  {
    id: 'av_mustafa',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    emoji: '👨‍💻',
    labelEN: 'Mustafa Ali',
    labelAR: 'مصطفى علي',
    labelKU: 'مستەفا عەلی',
  },
  {
    id: 'av_rawan',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    emoji: '👩‍🎨',
    labelEN: 'Rawan Omer',
    labelAR: 'روان عمر',
    labelKU: 'ڕەوان عومەر',
  },
  {
    id: 'av_ali',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    emoji: '👨‍⚕️',
    labelEN: 'Ali Jabbar',
    labelAR: 'علي جبار',
    labelKU: 'عەلی جەبار',
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
  const [selectedAvatar, setSelectedAvatar] = useState(middleEasternAvatars[0]);
  // Read/Write active list including user stories
  const [stories, setStories] = useState<StudentStory[]>(() => {
    // Read seen status from local storage
    const savedSeen = localStorage.getItem('jamiaati_seen_stories');
    const seenIds = savedSeen ? JSON.parse(savedSeen) : [];
    
    // Read custom stories contributed by user
    const savedCustom = localStorage.getItem('jamiaati_custom_stories');
    const customStories: StudentStory[] = savedCustom ? JSON.parse(savedCustom) : [];
    
    // Merge administrator story modifications
    const editedDefaultsStr = localStorage.getItem('jamiaati_edited_default_stories');
    const editedDefaults = editedDefaultsStr ? JSON.parse(editedDefaultsStr) : [];
    
    const preparedDefaultStories = studentStoriesMockData.map(defaultStory => {
      const editMatch = editedDefaults.find((e: any) => e.id === defaultStory.id);
      if (editMatch) {
        return {
          ...defaultStory,
          nameEN: editMatch.name,
          nameAR: editMatch.name,
          nameKU: editMatch.name,
          avatarUrl: editMatch.avatar,
          slides: defaultStory.slides.map((s, idx) => idx === 0 ? {
            ...s,
            textEN: editMatch.text,
            textAR: editMatch.text,
            textKU: editMatch.text
          } : s)
        };
      }
      return defaultStory;
    });

    const combined = [...preparedDefaultStories, ...customStories];
    return combined.map(story => ({
      ...story,
      isSeen: seenIds.includes(story.id)
    }));
  });

  // Listen for administrator updates to story photos/text in real-time
  useEffect(() => {
    const handleSync = () => {
      const savedSeen = localStorage.getItem('jamiaati_seen_stories');
      const seenIds = savedSeen ? JSON.parse(savedSeen) : [];
      
      const savedCustom = localStorage.getItem('jamiaati_custom_stories');
      const customStories: StudentStory[] = savedCustom ? JSON.parse(savedCustom) : [];
      
      const editedDefaultsStr = localStorage.getItem('jamiaati_edited_default_stories');
      const editedDefaults = editedDefaultsStr ? JSON.parse(editedDefaultsStr) : [];
      
      const preparedDefaultStories = studentStoriesMockData.map(defaultStory => {
        const editMatch = editedDefaults.find((e: any) => e.id === defaultStory.id);
        if (editMatch) {
          return {
            ...defaultStory,
            nameEN: editMatch.name,
            nameAR: editMatch.name,
            nameKU: editMatch.name,
            avatarUrl: editMatch.avatar,
            slides: defaultStory.slides.map((s, idx) => idx === 0 ? {
              ...s,
              textEN: editMatch.text,
              textAR: editMatch.text,
              textKU: editMatch.text
            } : s)
          };
        }
        return defaultStory;
      });

      const combined = [...preparedDefaultStories, ...customStories];
      setStories(combined.map(story => ({
        ...story,
        isSeen: seenIds.includes(story.id)
      })));
    };

    window.addEventListener('jamiaati_stories_updated', handleSync);
    return () => {
      window.removeEventListener('jamiaati_stories_updated', handleSync);
    };
  }, []);

  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null);
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const [replyText, setReplyText] = useState('');
  const [paused, setPaused] = useState(false);
  
  // Custom Live Story Creation States
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [creatorName, setCreatorName] = useState(() => {
    try {
      const p = localStorage.getItem('jamiaati_profile_v2');
      return p ? JSON.parse(p).name : 'Zara Al-Iraqi';
    } catch {
      return 'Zara Al-Iraqi';
    }
  });
  const [selectedTemplate, setSelectedTemplate] = useState<number | 'custom'>(0);
  const [customTextEN, setCustomTextEN] = useState('');
  const [customTextAR, setCustomTextAR] = useState('');
  const [customTextKU, setCustomTextKU] = useState('');
  const [slideEmoji, setSlideEmoji] = useState('💻');
  const [slideBg, setSlideBg] = useState('from-[#4F46E5] via-[#8B5CF6] to-[#EC4899]');

  const storyTemplates = [
    {
      id: 0,
      titleEN: '💻 Software Coding',
      titleAR: '💻 برمجة برمجيات',
      titleKU: '💻 کۆدکردنی نەرمەکاڵا',
      emoji: '💻',
      bgColor: 'from-blue-600 via-violet-750 to-indigo-900',
      textEN: 'Coding our new graduation prototype using React & Tailwind! Running close database queries 💻🚀',
      textAR: 'نبرمج نموذج تخرجنا الأولي المبتكر بالاعتماد على مكتبات React & Tailwind! نقوم بعمليات تصفية بيانات سريعة 💻🚀',
      textKU: 'کۆدکردنی پڕۆژەی دەرچوونمان بە بەکارهێنانی React & Tailwind! خەریکە تەواو دەبێت 💻🚀'
    },
    {
      id: 1,
      titleEN: '🫖 Cardamom Tea',
      titleAR: '🫖 شاي هيل دبل',
      titleKU: '🫖 چای هێلی دبل',
      emoji: '🫖',
      bgColor: 'from-amber-600 via-orange-600 to-rose-700',
      textEN: 'Cardamom double-fueled tea session near Mosul central library gardens to power through control exams! 📚✨',
      textAR: 'جلسة شاي مهيل عراقي مضاعف قرب حدائق مكتبة جامعة الموصل المركزية لاجتياز امتحانات التحكم العصيبة! 📚✨',
      textKU: 'خواردنەوەی چایەکی هێلی چڕ لە نزیک کتێبخانەی ناوەندی زانکۆی مووسڵ بۆ مراجەعەی تاقیکردنەوەکان! 📚✨'
    },
    {
      id: 2,
      titleEN: '🌅 Golden Hour',
      titleAR: '🌅 الساعة الذهبية',
      titleKU: '🌅 کاتی زێڕین',
      emoji: '🌅',
      bgColor: 'from-indigo-600 via-purple-700 to-pink-600',
      textEN: 'Unwinding with music near the university fountain. The Kurdish mountains highlight the sunset beautifully 🌄🏔️',
      textAR: 'فترة استرخاء لطيفة مع الموسيقى قرب نافورة الحرم الجامعي. جبال كوردستان ترسم الغروب بجمالية لا توصف 🌄🏔️',
      textKU: 'ئارامگرتنەوە پاش تەواوبوونی وانەکان لە نزیک نافورەی زانکۆ. چیاکانی کوردستان دیمەنی ئاوابوونەکە جوانتر دەکەن 🌄🏔️'
    },
    {
      id: 3,
      titleEN: '🤝 Study Group',
      titleAR: '🤝 حلقة دراسة',
      titleKU: '🤝 گروپی خوێندن',
      emoji: '🤝',
      bgColor: 'from-emerald-600 via-teal-700 to-cyan-800',
      textEN: 'Productive group project session at Al-Mansour Coworking lounge. Tech ecosystem in Iraq is fast! 🚀💡',
      textAR: 'جلسة عمل مشتركة ومثمرة لمشروعنا في قاعة المنصور الذكية. بيئة ريادة الأعمال في العراق تنمو بسرعة خارقة! 🚀💡',
      textKU: 'کارێکی بەکۆمەڵ بەرهەمدار بۆ یەکەم پڕۆژە لە هۆڵی مەنسور. سیستەمی کۆمپانیا دەستپێشخەرەکان لە عێراقدا خێرایە! 🚀💡'
    }
  ];

  const handleCreateStorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let resultSlide: StorySlide;

    if (selectedTemplate === 'custom') {
      const txtEN = customTextEN.trim() || 'Excited for next university semester class! 🌟🎒';
      const txtAR = customTextAR.trim() || 'متحمس لبدء الفصل الدراسي الجامعي الجديد وملاقاة الأصدقاء! 🌟🎒';
      const txtKU = customTextKU.trim() || 'بەپەرۆشم بۆ دەستپێکردنی وەرزی نوێی زانکۆ و بینینی هاوڕێیان! 🌟🎒';
      resultSlide = {
        textEN: txtEN,
        textAR: txtAR,
        textKU: txtKU,
        emoji: slideEmoji,
        bgColor: slideBg
      };
    } else {
      const template = storyTemplates.find(t => t.id === selectedTemplate) || storyTemplates[0];
      resultSlide = {
        textEN: template.textEN,
        textAR: template.textAR,
        textKU: template.textKU,
        emoji: template.emoji,
        bgColor: template.bgColor
      };
    }

    const newStoryId = `story-user-${Date.now()}`;
    const newStory: StudentStory = {
      id: newStoryId,
      nameEN: creatorName,
      nameAR: creatorName,
      nameKU: creatorName,
      uniEN: language === 'ar' ? 'جامعة بغداد 🎓' : language === 'ku' ? 'زانکۆی بەغدا 🎓' : 'Univ of Baghdad 🎓',
      uniAR: 'جامعة بغداد 🎓',
      uniKU: 'زانکۆی بەغدا 🎓',
      avatarEmoji: selectedAvatar.emoji || (selectedTemplate === 'custom' ? slideEmoji : (storyTemplates.find(t => t.id === selectedTemplate)?.emoji || '🎓')),
      avatarUrl: selectedAvatar.url,
      avatarColor: 'bg-violet-600',
      slides: [resultSlide],
      isSeen: false
    };

    // Save to localStorage list of custom stories
    const savedCustom = localStorage.getItem('jamiaati_custom_stories');
    const existingCustom = savedCustom ? JSON.parse(savedCustom) : [];
    const updatedCustom = [...existingCustom, newStory];
    localStorage.setItem('jamiaati_custom_stories', JSON.stringify(updatedCustom));

    // Update state directly
    setStories(prev => [newStory, ...prev]);
    setIsCreatingStory(false);

    // Reset fields
    setCustomTextEN('');
    setCustomTextAR('');
    setCustomTextKU('');
    setSelectedTemplate(0);

    // Award points
    if (onAwardPoints) onAwardPoints(50);
    if (showToast) {
      showToast(
        language === 'ar' ? 'تم نشر يومياتك وقصتك بنجاح! 🎬 +٥٠ نقطة صناعة محتوى' : language === 'ku' ? 'چیرۆکەکەت بە سەرکەوتوویی بڵاوکرایەوە! 🎬 +٥٠ خاڵ' : 'Your Live Diary story is now live! 🎬 +50 pts creator tier',
        'success'
      );
    }
  };
  
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
        <div 
          onClick={() => {
            setIsCreatingStory(true);
            if (onAwardPoints) onAwardPoints(5); // positive reinforcement
          }}
          className="flex flex-col items-center gap-1.5 snap-start cursor-pointer shrink-0"
          id="your-story-launch-trigger"
        >
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
                  {story.avatarUrl ? (
                    <img
                      src={story.avatarUrl}
                      alt={name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <>
                      <span className={`absolute inset-0 ${story.avatarColor} opacity-20`} />
                      <span className="text-xl select-none transition-transform duration-300 group-hover:scale-110">
                        {story.avatarEmoji}
                      </span>
                    </>
                  )}
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
                    <div className="w-9 h-9 bg-slate-900 rounded-full border border-yellow-400 flex items-center justify-center text-lg shadow-sm overflow-hidden">
                      {currentStory.avatarUrl ? (
                        <img
                          src={currentStory.avatarUrl}
                          alt={language === 'ar' ? currentStory.nameAR : currentStory.nameEN}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        currentStory.avatarEmoji
                      )}
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
              <div className={`flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-br ${currentSlide.bgColor} relative overflow-hidden`}>
                {/* Visual Backdrop Illustration if provided */}
                {currentSlide.bgImage && (
                  <div className="absolute inset-0 z-0 pointer-events-none">
                    <img 
                      src={currentSlide.bgImage} 
                      alt="Story Scene" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-30 mix-blend-overlay"
                    />
                  </div>
                )}
                
                {/* Decorative background grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-1" />

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

      {/* Modern Trilingual Story Maker Wizard Modal */}
      <AnimatePresence>
        {isCreatingStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
            id="story-maker-modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-[#12192C] border-2 border-[#1F2E4D] w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-[0px_20px_50px_rgba(0,0,0,0.5)] text-left relative"
              id="story-maker-card"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsCreatingStory(false)}
                className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-white/10 transition rounded-full text-white cursor-pointer"
                aria-label="Close Story Maker"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                <h3 className="text-sm sm:text-base font-black text-white">
                  {language === 'ar' ? 'اصنع يومياتك المباشرة 🎬' : language === 'ku' ? 'چیرۆکێکی ڕاستەوخۆ دروست بکە 🎬' : 'Create Live Student Story 🎬'}
                </h3>
              </div>

              <form onSubmit={handleCreateStorySubmit} className="flex flex-col gap-4">
                
                {/* Creator Name Field */}
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">
                    {language === 'ar' ? 'اسم صاحب القصة 👤' : language === 'ku' ? 'ناوی خاوەن چیرۆک 👤' : 'Author Name / Handle 👤'}
                  </label>
                  <input
                    type="text"
                    value={creatorName}
                    onChange={e => setCreatorName(e.target.value)}
                    required
                    maxLength={24}
                    placeholder="Enter name..."
                    className="w-full text-xs font-bold text-white bg-slate-800/80 border border-slate-750 rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                {/* Select Middle Eastern Portrait Avatar */}
                <div>
                  <label className="block text-[10px] uppercase font-black text-[#FFD21F] mb-1.5 flex items-center gap-1 leading-none">
                    <span>✨</span>
                    <span>
                      {language === 'ar' ? 'اختر صورتك الرمزية (وجوه عراقية وكردية واقعية) 📸' : language === 'ku' ? 'وێنەی خاوەن چیرۆکەکەت دیاریبکە (شێوازی کوردی و عێراقی) 📸' : 'SELECT MIDDLE EASTERN PROFILE IMAGE 📸'}
                    </span>
                  </label>
                  <p className="text-[9px] text-slate-300 mb-2 leading-relaxed">
                    {language === 'ar' ? 'اختر واحدة من صورنا الشخصية الواقعية لطلبة عراقيين وكرد لتضفي طابعاً فريداً على قصتك!' : language === 'ku' ? 'یەکێک لە وێنە ڕاستەقینە دیزاینکراوەکانی خوێندکارانمان هەڵبژێرە بۆ چیرۆکەکەت.' : 'Pick one of our high-quality realistic Middle Eastern student portraits to personalize your stories.'}
                  </p>
                  <div className="grid grid-cols-4 gap-2 mb-2 p-1.5 bg-[#090D1A]/80 rounded-xl border border-[#161B30] max-h-36 overflow-y-auto">
                    {middleEasternAvatars.map(av => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setSelectedAvatar(av)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer ${
                          selectedAvatar.id === av.id
                            ? 'border-yellow-400 scale-95 shadow-[0px_0px_8px_rgba(255,210,31,0.6)]'
                            : 'border-[#1F2E4D] hover:border-violet-500 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img 
                          src={av.url} 
                          alt={av.labelEN}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <span className="absolute bottom-1 right-1 bg-black/75 text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                          {av.emoji}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="text-[9px] text-slate-300 font-bold bg-[#141C2E] px-2.5 py-1.5 rounded-lg inline-block border border-slate-750">
                    {language === 'ar' ? 'الصورة الرمزية المحددة: ' : language === 'ku' ? 'وێنەی هەڵبژێردراو: ' : 'Selected Avatar: '}
                    <span className="text-yellow-405 font-black">
                      {language === 'ar' ? selectedAvatar.labelAR : language === 'ku' ? selectedAvatar.labelKU : selectedAvatar.labelEN}
                    </span>
                  </div>
                </div>

                {/* Grid Template Picker */}
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-2">
                    {language === 'ar' ? 'اختر قالب قصتك ⚡' : language === 'ku' ? 'قالب بۆ چیرۆکەکەت دیاریبکە ⚡' : 'Select Story Template ⚡'}
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {storyTemplates.map(template => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                          selectedTemplate === template.id
                            ? 'border-yellow-400 bg-slate-800 shadow-[2px_2px_0px_0px_rgba(255,210,31,0.5)]'
                            : 'border-[#1F2E4D] bg-slate-900/40 hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="text-base mb-1">{template.emoji}</div>
                        <div className="text-[10px] font-black text-white leading-tight">
                          {language === 'ar' ? template.titleAR : language === 'ku' ? template.titleKU : template.titleEN}
                        </div>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSelectedTemplate('custom')}
                      className={`p-3 rounded-xl border-2 text-left transition-all col-span-2 flex items-center justify-between cursor-pointer ${
                        selectedTemplate === 'custom'
                          ? 'border-yellow-400 bg-slate-800 shadow-[2px_2px_0px_0px_rgba(255,210,31,0.5)]'
                          : 'border-[#1F2E4D] bg-slate-900/40 hover:bg-slate-800/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">✏️</span>
                        <div className="text-[10px] font-black text-white">
                          {language === 'ar' ? '✍️ اكتب قصتك الخاصة بالكامل' : language === 'ku' ? '✍️ نووسینی چیرۆکی مەیلی خۆت' : '✍️ Write Custom Trilingual Story'}
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-violet-400 font-extrabold uppercase">Custom</span>
                    </button>
                  </div>
                </div>

                {/* Custom Editor Fields - Show only if selectedTemplate is 'custom' */}
                {selectedTemplate === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex flex-col gap-3.5 border-t border-slate-800 pt-3"
                  >
                    {/* TRILINGUAL TEXT INPUTS */}
                    <div>
                      <label className="block text-[8.5px] font-extrabold uppercase text-slate-400 mb-1 flex justify-between">
                        <span>English Story Caption 🇬🇧</span>
                        <span className="text-[7.5px] text-slate-500 font-bold">Max 120 chars</span>
                      </label>
                      <input
                        type="text"
                        value={customTextEN}
                        onChange={e => setCustomTextEN(e.target.value)}
                        maxLength={120}
                        placeholder="e.g. Debugging my database models after midnight! 💻✨"
                        className="w-full text-xs font-semibold text-white bg-slate-800/50 border border-slate-750 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[8.5px] font-extrabold uppercase text-slate-400 mb-1 flex justify-between">
                        <span>نص القصة بالعربية 🇮🇶</span>
                        <span className="text-[7.5px] text-slate-500 font-bold">الحد الأقصى ١٢٠ حرف</span>
                      </label>
                      <input
                        type="text"
                        value={customTextAR}
                        onChange={e => setCustomTextAR(e.target.value)}
                        maxLength={120}
                        placeholder="مثال: مراجعة كود قاعدة البيانات مع زملائي بعد منتصف الليل! 💻✨"
                        className="w-full text-xs font-semibold text-white bg-slate-800/50 border border-slate-750 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 transition-colors text-right"
                        dir="rtl"
                      />
                    </div>

                    <div>
                      <label className="block text-[8.5px] font-extrabold uppercase text-[#A99ECA] mb-1 flex justify-between">
                        <span>دەقی چیرۆک بە کوردی ☀️</span>
                        <span className="text-[7.5px] text-slate-500 font-bold">زۆرترین ١٢٠ پیت</span>
                      </label>
                      <input
                        type="text"
                        value={customTextKU}
                        onChange={e => setCustomTextKU(e.target.value)}
                        maxLength={120}
                        placeholder="نمونە: چاککردنی داتابەیسەکەم لەگەڵ هاوڕێیانم پاش نیوەشەو! 💻✨"
                        className="w-full text-xs font-semibold text-white bg-slate-800/50 border border-slate-750 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 transition-colors text-right"
                        dir="rtl"
                      />
                    </div>

                    {/* Emoji Select list */}
                    <div>
                      <label className="block text-[8.5px] font-black text-slate-400 uppercase mb-1.5">
                        Select Slide Emoji Key 🎭
                      </label>
                      <div className="flex gap-2.5 overflow-x-auto py-1 scrollbar-none">
                        {['💻', '🫖', '🌅', '🔬', '🎓', '🏥', '🧠', '🎨', '🚀', '💯'].map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setSlideEmoji(emoji)}
                            className={`w-9 h-9 text-lg rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                              slideEmoji === emoji
                                ? 'bg-violet-600 border-2 border-yellow-400 scale-110'
                                : 'bg-slate-850 border border-[#161B30]'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom bg selector list */}
                    <div>
                      <label className="block text-[8.5px] font-black text-slate-400 uppercase mb-1.5">
                        Choose Gradient Backdrop Theme 🎨
                      </label>
                      <div className="flex gap-2.5 overflow-x-auto py-1 scrollbar-none">
                        {[
                          { id: 'grad-1', cls: 'from-blue-600 via-violet-750 to-indigo-900', label: 'Tech Space' },
                          { id: 'grad-2', cls: 'from-emerald-650 via-teal-700 to-cyan-800', label: 'Nature Green' },
                          { id: 'grad-3', cls: 'from-indigo-650 via-purple-700 to-pink-650', label: 'Epic Sunset' },
                          { id: 'grad-4', cls: 'from-amber-600 via-orange-650 to-red-700', label: 'Retro Warmth' },
                          { id: 'grad-5', cls: 'from-[#6B25C9] to-fuchsia-600', label: 'Vibrant Purple' },
                          { id: 'grad-6', cls: 'from-slate-800 via-pink-700 to-indigo-950', label: 'Hot Pink Nebula' }
                        ].map(bg => (
                          <button
                            key={bg.id}
                            type="button"
                            onClick={() => setSlideBg(bg.cls)}
                            title={bg.label}
                            className={`w-8 h-8 rounded-full bg-gradient-to-tr ${bg.cls} shrink-0 transition-all cursor-pointer ${
                              slideBg === bg.cls
                                ? 'border-2 border-white scale-115 ring-2 ring-yellow-405 shadow-inner'
                                : 'border border-black/40'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Submit row */}
                <div className="flex items-center justify-end gap-2.5 mt-2 border-t border-slate-800/80 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreatingStory(false)}
                    className="text-[10px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-755 px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-[10px] font-black bg-[#FFD21F] hover:bg-[#FFE052] text-black px-5 py-2.5 rounded-xl shadow-md border-2 border-slate-950 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    🚀 {language === 'ar' ? 'انشر الآن' : language === 'ku' ? 'بڵاوکردنەوە' : 'Publish Story'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}




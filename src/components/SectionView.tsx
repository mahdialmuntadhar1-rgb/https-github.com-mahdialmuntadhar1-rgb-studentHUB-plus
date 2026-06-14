import React, { useState, useEffect, useMemo } from 'react';
import { Language, FeedItem, Comment } from '../types';
import { IraqiGovernorates, IraqiUniversities } from '../data/mockData';
import { DEMO_ITEMS, getDemoItemsByCategory } from '../data/demoData';
import { 
  ArrowLeft, 
  ArrowRight,
  MapPin, 
  School, 
  Loader2,
  Calendar,
  Briefcase,
  GraduationCap,
  Users,
  Award,
  BookOpen,
  ClipboardList,
  Flame,
  Globe,
  Tag
} from 'lucide-react';
import FeedCard from './FeedCard';
import { BACKEND_URL } from '../lib/api';

interface SectionViewProps {
  sectionId: string;
  language: Language;
  selectedGov: string;
  setSelectedGov: (govId: string) => void;
  selectedUni: string;
  setSelectedUni: (uniId: string) => void;
  onBackToHome: () => void;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onVote: (itemId: string, optionId: string) => void;
  onApply: (id: string) => void;
  onRsvp: (id: string) => void;
  onJoinGroup: (id: string) => void;
  onAddComment: (id: string, commentText: string) => void;
  onEditFeedItem?: (id: string, updatedFields: Partial<FeedItem>) => void;
  onDeleteFeedItem?: (id: string) => void;
  isAdminMode?: boolean;
}

const categoryConfigs: Record<string, {
  emoji: string;
  titleEN: string;
  titleAR: string;
  titleKU: string;
  descEN: string;
  descAR: string;
  descKU: string;
  endpoint: 'opportunities' | 'highlights';
  categoryValue: string;
  isOpportunity: boolean;
}> = {
  scholarship: {
    emoji: '🎓',
    titleEN: 'Scholarships',
    titleAR: 'المنح الدراسية',
    titleKU: 'منحەی خوێندن',
    descEN: 'Explore fully or partially funded scholarship opportunities for Iraqi students.',
    descAR: 'اكتشف المنح الدراسية والتمويلات الأكاديمية الكاملة والجزئية للطلاب العراقيين.',
    descKU: 'گەڕان بەدوای منحەی خوێندنی تەواو و بەشەکەی بۆ قوتابیانی عێراق.',
    endpoint: 'opportunities',
    categoryValue: 'scholarship',
    isOpportunity: true
  },
  job: {
    emoji: '💼',
    titleEN: 'Job Opportunities',
    titleAR: 'فرص العمل والتوظيف',
    titleKU: 'هەلی کار',
    descEN: 'Browse full-time, part-time, and graduate job positions in Iraq.',
    descAR: 'تصفح الوظائف بدوام كامل وجزئي وفرص الخريجين في العراق.',
    descKU: 'گەڕان بەدوای هەلی کار بە شێوەی هەمیشەیی یان کاتی.',
    endpoint: 'opportunities',
    categoryValue: 'job',
    isOpportunity: true
  },
  internship: {
    emoji: '⚙️',
    titleEN: 'Internships',
    titleAR: 'فرص التدريب والتأهيل',
    titleKU: 'مەشقەکان',
    descEN: 'Gain real-world experience through structured internships at organizations.',
    descAR: 'اكتسب تجربة حقيقية من خلال برامج تدريبات عملية مميزة في مؤسسات عراقية.',
    descKU: 'بەدەستهێنانی ئەزموونی ڕاستەقینە لە ڕێگەی مەشقی کۆمپانیاکانەوە.',
    endpoint: 'opportunities',
    categoryValue: 'internship',
    isOpportunity: true
  },
  training: {
    emoji: '🏫',
    titleEN: 'Trainings',
    titleAR: 'التدريبات وبناء المهارات',
    titleKU: 'ڕاهێنانەکان',
    descEN: 'Build practical technical and soft skills through local bootcamps & courses.',
    descAR: 'طور مهاراتك التقنية والشخصية من خلال المعسكرات التدريبية والدورات المحلية.',
    descKU: 'بنیاتنانی کارامەییەکان لە ڕێگەی خولی ڕاهێنان و وۆرکشۆپی جۆراوجۆرەوە.',
    endpoint: 'opportunities',
    categoryValue: 'training',
    isOpportunity: true
  },
  fellowship: {
    emoji: '🌟',
    titleEN: 'Fellowships',
    titleAR: 'الزمالات البحثية',
    titleKU: 'زەمالەی خوێندکاران',
    descEN: 'Discover elite research fellowship programs and academic exchanges.',
    descAR: 'اكتشف برامج الزمالات البحثية والتبادل الأكاديمي المتميزة.',
    descKU: 'بینینی بەرنامە جیاوازەکانی زەمالەی خوێندن و گۆڕینەوەی کلتوری.',
    endpoint: 'opportunities',
    categoryValue: 'fellowship',
    isOpportunity: true
  },
  volunteering: {
    emoji: '🤝',
    titleEN: 'Volunteering',
    titleAR: 'العمل التطوعي',
    titleKU: 'کاروباری خۆبەخشی',
    descEN: 'Give back to your community and develop teamwork leadership skills.',
    descAR: 'ساهم في خدمة مجتمعك وطوّر مهارات القيادة والعمل الجماعي لديك.',
    descKU: 'خزمەتکردنی کۆمەڵگە لە ڕێگەی کارە خۆبەخشییە جیاوازەکانەوە.',
    endpoint: 'opportunities',
    categoryValue: 'volunteering',
    isOpportunity: true
  },
  competition: {
    emoji: '🏆',
    titleEN: 'Competitions',
    titleAR: 'المسابقات والجوائز',
    titleKU: 'پێشبڕکێکان',
    descEN: 'Challenge yourself in hackathons, project fairs, and academic matches.',
    descAR: 'تحد نفسك في الهاكاثونات العِراقية، معارض المشاريع، والمسابقات الأكاديمية.',
    descKU: 'بەشداری لە پێشبڕکێ و هاكاتۆنە جۆراوجۆرە زانستییەکان بکە.',
    endpoint: 'opportunities',
    categoryValue: 'competition',
    isOpportunity: true
  },
  event: {
    emoji: '🎟️',
    titleEN: 'Campus Events',
    titleAR: 'الفعاليات والمؤتمرات',
    titleKU: 'چالاکییەکان',
    descEN: 'Stay updated on upcoming seminars, festivals, and student gatherings.',
    descAR: 'ابقَ على اطلاع على الندوات، المهرجانات، واللقاءات الطلابية القادمة.',
    descKU: 'بینینی کۆنفرانس و فیستیڤاڵە جۆراوجۆرەکانی زانکۆ.',
    endpoint: 'highlights',
    categoryValue: 'event',
    isOpportunity: false
  },
  news: {
    emoji: '📰',
    titleEN: 'University News',
    titleAR: 'أخبار الجامعات',
    titleKU: 'هەواڵەکانی خوێندن',
    descEN: 'Official and social campus updates, research highlights, and notices.',
    descAR: 'آخر الأخبار الرسمية والأكاديمية، الإنجازات، وتحديثات التعليم في العراق.',
    descKU: 'بینینی نوێترین هەواڵ و ڕووداوە ئەکادیمییەکانی زۆرینەی زانکۆکان.',
    endpoint: 'highlights',
    categoryValue: 'news',
    isOpportunity: false
  },
  announcement: {
    emoji: '📢',
    titleEN: 'Announcements',
    titleAR: 'الإعلانات الرسمية',
    titleKU: 'ڕاگەیاندنە فەرمییەکان',
    descEN: 'Important admin alerts, schedule adjustments, and ministry directives.',
    descAR: 'التنبيهات الإدارية الهامة، القرارات الوزارية، وتعديلات الجداول الزمنية.',
    descKU: 'ئاگادارکردنەوە فەرمییەکانی سەرۆکایەتی زانکۆکان و وەزارەت.',
    endpoint: 'highlights',
    categoryValue: 'announcement',
    isOpportunity: false
  },
  exam: {
    emoji: '📝',
    titleEN: 'Exams & Results',
    titleAR: 'الامتحانات والنتائج',
    titleKU: 'تاقیکردنەوەکان',
    descEN: 'Schedules, regulations, exam preparations, and official results links.',
    descAR: 'جداول الامتحانات، الضوابط والتعليمات، ومستندات التحضير والنتائج الرسمية.',
    descKU: 'خشتەی تاقیکردنەوەکان و ئەنجامە فەرمییە گشتییەکانی زانکۆکان.',
    endpoint: 'highlights',
    categoryValue: 'exam',
    isOpportunity: false
  },
  registration: {
    emoji: '📌',
    titleEN: 'Admissions & Registration',
    titleAR: 'التسجيل والقبولات',
    titleKU: 'تۆمارکردن و وەرگرتن',
    descEN: 'New admissions guidelines, tuition registration steps, and directories.',
    descAR: 'خطوات تقديم القبول المركزي والمسائي، ومواعيد التسجيل للعام الجديد.',
    descKU: 'ڕێبەری وەرگرتن لە زانکۆکان و کاتەکانی دەستپێکردنی ناونووسین.',
    endpoint: 'highlights',
    categoryValue: 'registration',
    isOpportunity: false
  },
  student_club: {
    emoji: '👥',
    titleEN: 'Student Clubs & Orgs',
    titleAR: 'نوادي ومجموعات الطلاب',
    titleKU: 'یانە و گرووپەکان',
    descEN: 'Join computer science, debate, theater, and creative student societies.',
    descAR: 'انضم لنوادي البرمجة، المناظرات، الفنون، والجمعيات العلمية بجامعتك.',
    descKU: 'بەشداری لە گرووپە جیاوازەکانی زانستی، تەکنەلۆژی و کلتوری بکە.',
    endpoint: 'highlights',
    categoryValue: 'student_club',
    isOpportunity: false
  },
  activity: {
    emoji: '🏃',
    titleEN: 'Campus Activities',
    titleAR: 'الأنشطة الميدانية والرياضية',
    titleKU: 'چالاکییە مەیدانییەکان',
    descEN: 'Register for sports tourneys, art galleries, and environmental campaigns.',
    descAR: 'سجل في البطولات الرياضية، معارض الفنون، وحملات التشجير والتبرع.',
    descKU: 'چالاکییە وەرزشی، هونەری و ژینگەییە جیاوازەکان لە زانکۆکان.',
    endpoint: 'highlights',
    categoryValue: 'activity',
    isOpportunity: false
  }
};

const normalizeGovernorate = (raw: string | null | undefined): string => {
  if (!raw) return 'all';
  const val = raw.trim().toLowerCase();
  if (val === 'all iraq') return 'all';
  if (val === 'baghdad') return 'baghdad';
  if (val === 'nineveh' || val.includes('mosul')) return 'nineveh';
  if (val === 'basra' || val === 'basrah') return 'basra';
  if (val === 'sulaymaniyah' || val === 'sulaimani' || val === 'sulaimaniyah') return 'sulaymaniyah';
  if (val === 'erbil') return 'erbil';
  if (val === 'duhok' || val === 'dohuk') return 'duhok';
  return val.replace(/\s+/g, '_');
};

export default function SectionView({
  sectionId,
  language,
  selectedGov,
  setSelectedGov,
  selectedUni,
  setSelectedUni,
  onBackToHome,
  onLike,
  onSave,
  onVote,
  onApply,
  onRsvp,
  onJoinGroup,
  onAddComment,
  onEditFeedItem,
  onDeleteFeedItem,
  isAdminMode = false
}: SectionViewProps) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Normalize sectionId to config keys (e.g. h_news -> news, scholarships -> scholarship)
  const lookupKey = sectionId.startsWith('h_') ? sectionId.substring(2) : sectionId;
  const normalizedKey = lookupKey === 'news' || lookupKey === 'announcements' ? 'news' : 
                        lookupKey === 'jobs' ? 'job' :
                        lookupKey === 'scholarships' ? 'scholarship' :
                        lookupKey === 'internships' ? 'internship' :
                        lookupKey === 'trainings' ? 'training' :
                        lookupKey === 'fellowships' ? 'fellowship' :
                        lookupKey === 'competitions' ? 'competition' :
                        lookupKey === 'clubs' ? 'student_club' :
                        lookupKey;

  const categoryConfig = categoryConfigs[normalizedKey] || categoryConfigs['news'];

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      setErrorStatus(null);
      try {
        const queryEndpoint = categoryConfig.endpoint;
        const targetVal = categoryConfig.categoryValue;
        
        // Construct query parameters elegantly following user specs
        const params = new URLSearchParams();
        
        // Category filtering
        params.append('category', targetVal);

        // 2. Governorate filtering
        if (selectedGov && selectedGov !== 'all') {
          params.append('governorate', selectedGov);
        }

        // 3. University / Institution filtering
        if (selectedUni && selectedUni !== 'all') {
          params.append('university_id', selectedUni);
          params.append('institution_id', selectedUni);
        }

        // 4. Default Limits
        params.append('limit', '50');

        const response = await fetch(`${BACKEND_URL}/api/${queryEndpoint}?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        const data = await response.json();
        if (active) {
          if (Array.isArray(data)) {
            // Apply client-side filtering by category value as safety guarantee
            let filteredResults = data.filter((item: any) => {
              const itemType = item.category || item.type || '';
              // Match standard category or direct type
              return itemType.toLowerCase() === targetVal.toLowerCase() || 
                     (targetVal === 'news' && itemType.toLowerCase() === 'announcement') ||
                     (targetVal === 'announcement' && itemType.toLowerCase() === 'official_announcement') ||
                     (targetVal === 'student_club' && itemType.toLowerCase() === 'study_group');
            });

            // Map standard FeedItem objects
            const mapped = filteredResults.map((item: any) => {
              const category = item.category || item.type || categoryConfig.categoryValue;
              return {
                id: item.id || `scraped-${Date.now()}-${Math.random()}`,
                type: category as any,
                titleEN: item.titleEN || item.title || 'Untitled Opportunity',
                titleAR: item.titleAR || item.title || 'فرصة غير معنونة',
                titleKU: item.titleKU || item.title || 'هەلی بێ ناونیشان',
                contentEN: item.description || item.summary || item.contentEN || item.content || 'Check original portal for instructions.',
                contentAR: item.contentAR || item.summary || item.description || item.content || 'يرجى مراجعة المصدر الأصلي لمعلومات التقديم.',
                contentKU: item.contentKU || item.summary || item.description || item.content || 'تکایە سەرچاوەی سەرەکی ببینە بۆ زانیاری.',
                author: {
                  name: item.organization || item.institution_name || item.author?.name || 'Academic Center',
                  role: 'institution' as const,
                  avatar: item.author?.avatar || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=100',
                  verified: true
                },
                date: item.published_date ? `Posted on ${item.published_date}` : 'Recently scraped 🔔',
                likes: item.likes || 10,
                commentsCount: 0,
                commentsList: [],
                governorateId: normalizeGovernorate(item.governorateId || item.governorate),
                universityId: item.universityId || item.university_id || item.institution_id || 'all',
                tags: item.tags || [categoryConfig.categoryValue, 'Iraq'],
                imageUrl: item.imageUrl || item.image_url || undefined,
                original_source_url: item.source_url,
                application_link: item.application_link || item.apply_url || item.source_url || undefined,
                deadline: item.deadline || undefined,
                company: item.organization || item.institution_name || undefined,
                location: item.location || item.city || item.governorate || 'Iraq-wide',
                whoCanApply: item.eligibility || item.whoCanApply || undefined,
                salary: item.salary || item.salary_or_funding || undefined,
                workplaceType: item.workplaceType || undefined,
                savedByUser: false,
                likedByUser: false
              };
            });
            setItems(mapped);
          } else {
            setItems([]);
          }
        }
      } catch (err: any) {
        console.error('Fetch section error:', err);
        if (active) {
          setErrorStatus(err.message || 'Error loading live feed');
          setItems([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      active = false;
    };
  }, [normalizedKey, selectedGov, selectedUni]);

  // Apply visual governorate and university filtering
  // Add demo items only if real section is sparse (less than 3 items)
  const filteredItems = useMemo(() => {
    const realItems = items.filter(item => !item.isDemo);
    
    // Filter real items by governorate and university
    const filteredRealItems = realItems.filter(item => {
      const matchesGov = selectedGov === 'all' || !item.governorateId || item.governorateId === 'all' || item.governorateId === selectedGov;
      const matchesUni = selectedUni === 'all' || !item.universityId || item.universityId === 'all' || item.universityId === selectedUni;
      return matchesGov && matchesUni;
    });
    
    // If we have enough real items, don't add demo items
    if (filteredRealItems.length >= 3) {
      return filteredRealItems;
    }
    
    // Get demo items matching the category
    const categoryDemoItems = getDemoItemsByCategory(normalizedKey);
    
    // Filter demo items by governorate and university
    const filteredDemoItems = categoryDemoItems.filter(demo => {
      const matchesGov = selectedGov === 'all' || demo.governorateId === 'all' || demo.governorateId === selectedGov;
      const matchesUni = selectedUni === 'all' || demo.universityId === 'all' || demo.universityId === selectedUni;
      return matchesGov && matchesUni;
    });
    
    // Limit demo items to fill up to 5 total items max
    const slotsNeeded = Math.max(0, 5 - filteredRealItems.length);
    const demoItemsToShow = filteredDemoItems.slice(0, slotsNeeded);
    
    // Return real items first, then demo items
    return [...filteredRealItems, ...demoItemsToShow];
  }, [items, selectedGov, selectedUni, normalizedKey]);

  const availableUnis = selectedGov === 'all' 
    ? IraqiUniversities 
    : IraqiUniversities.filter(u => u.governorateId === selectedGov);

  const isRTL = language === 'ar' || language === 'ku';

  return (
    <div className="px-3.5 py-4 max-w-lg mx-auto flex flex-col pb-24 bg-[#0B1020]" id="section-view-container">
      
      {/* Back to Home Header button */}
      <div className="mb-4 flex items-center justify-between" id="section-back-bar">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121B2E] border border-[#1F2E4D] text-slate-200 text-xs font-black cursor-pointer shadow-sm hover:bg-[#1C2C4E] hover:text-[#FFD21F] active:scale-95 transition-all select-none"
        >
          {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>
            {language === 'ar' ? 'العودة للرئيسية' : language === 'ku' ? 'گەڕانەوە بۆ سەرەکی' : 'Back to Home'}
          </span>
        </button>

        <span className="text-[10px] uppercase font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20 font-black">
          {categoryConfig.isOpportunity ? 'OPPORTUNITY' : 'CAMPUS FEED'}
        </span>
      </div>

      {/* Title & Headline Header */}
      <div className="mb-5 border-l-4 border-[#FFD21F] pl-3.5 rtl:border-l-0 rtl:border-r-4 rtl:pl-0 rtl:pr-3.5 pb-1">
        <h1 className="text-xl font-black text-white flex items-center gap-2">
          <span className="text-2xl">{categoryConfig.emoji}</span>
          <span>
            {language === 'ar' ? categoryConfig.titleAR : language === 'ku' ? categoryConfig.titleKU : categoryConfig.titleEN}
          </span>
        </h1>
        <p className="text-slate-400 text-[11px] leading-tight mt-1.5 font-medium">
          {language === 'ar' ? categoryConfig.descAR : language === 'ku' ? categoryConfig.descKU : categoryConfig.descEN}
        </p>
      </div>

      {/* 3. Filter Row: Side by Side Governorate & Academic Institution dropdowns */}
      <div className="grid grid-cols-2 gap-3.5 mb-5 select-none animate-fadeIn" id="section-filter-row">
        
        {/* Governorate filter select */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-[#121B2E] border border-[#1F2E4D] hover:border-cyan-500/30 transition-all shadow-sm">
          <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
          <select
            value={selectedGov}
            onChange={(e) => {
              setSelectedGov(e.target.value);
              setSelectedUni('all'); // Clear specific university when governorate shifts
            }}
            className="w-full text-xs font-black bg-transparent text-slate-100 border-none focus:outline-none cursor-pointer outline-none overflow-hidden"
          >
            <option value="all" className="bg-[#121B2E] text-white">📍 {language === 'ar' ? 'كل المحافظات' : language === 'ku' ? 'هەموو پارێزگاکان' : 'All Governorates'}</option>
            {IraqiGovernorates.map((gov) => (
              <option key={gov.id} value={gov.id} className="bg-[#121B2E] text-white">
                {language === 'ar' ? gov.nameAR : language === 'ku' ? gov.nameKU : gov.nameEN}
              </option>
            ))}
          </select>
        </div>

        {/* University filter select */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-[#121B2E] border border-[#1F2E4D] hover:border-cyan-500/30 transition-all shadow-sm">
          <School className="w-4 h-4 text-indigo-400 shrink-0" />
          <select
            value={selectedUni}
            onChange={(e) => setSelectedUni(e.target.value)}
            className="w-full text-xs font-black bg-transparent text-slate-100 border-none focus:outline-none cursor-pointer outline-none overflow-hidden"
          >
            <option value="all" className="bg-[#121B2E] text-white">🏫 {language === 'ar' ? 'كل الجامعات' : language === 'ku' ? 'هەموو زانکۆکان' : 'All Institutions'}</option>
            {availableUnis.map((uni) => (
              <option key={uni.id} value={uni.id} className="bg-[#121B2E] text-white">
                {uni.logo} {language === 'ar' ? uni.nameAR : language === 'ku' ? uni.nameKU : uni.nameEN}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Main cards layout / loading list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3" id="section-loading-screen">
          <Loader2 className="w-8 h-8 text-[#FFD21F] animate-spin" />
          <span className="text-xs text-slate-400 font-extrabold animate-pulse">
            {language === 'ar' ? 'جاري تحميل الفرص والأخبار...' : language === 'ku' ? 'بارکردنی دەرفەتەکان...' : 'Fetching sector items from server...'}
          </span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-6 bg-[#121B2E] rounded-3xl border border-[#1F2E4D] border-dashed text-center shadow-lg" id="section-empty-container">
          <div className="w-12 h-12 rounded-full bg-slate-950/40 flex items-center justify-center text-xl mb-3.5 border border-[#1F2E4D]">
            {categoryConfig.emoji}
          </div>
          <p className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
            {language === 'ar' ? 'القسم فارغ' : 'Section Empty'}
          </p>
          <p className="text-xs leading-relaxed text-slate-450 text-[#94A3B8]/90 max-w-[280px]">
            {language === 'ar' 
              ? 'لا توجد عناصر حالياً لهذا القسم' 
              : language === 'ku' 
              ? 'ئێستا هیچ بابەتێک بۆ ئەم بەشە نییە' 
              : 'No items available in this section yet'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5" id="section-cards-feed">
          {filteredItems.map((item) => (
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
          ))}
        </div>
      )}

    </div>
  );
}

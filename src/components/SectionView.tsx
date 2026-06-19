import React, { useState, useEffect } from 'react';
import { Language, FeedItem } from '../types';
import { IraqiGovernorates, IraqiUniversities } from '../data/mockData';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  School,
  Loader2,
  Briefcase,
  Search,
  Filter
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
  onUserClick?: (user: any) => void;
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
    descEN: 'Use the filters below to fetch current job cards by governorate and source, then apply on the original portal.',
    descAR: 'استخدم الفلاتر أدناه لجلب الوظائف الحالية حسب المحافظة والمصدر ثم قدّم من الموقع الأصلي.',
    descKU: 'فلتەرەکانی خوارەوە بەکاربهێنە بۆ هێنانی هەلی کار بە پارێزگا و سەرچاوە.',
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

type JobSource = {
  name: string;
  url: string;
  group: string;
  bestFor: string;
  mode: 'direct' | 'search';
  buildUrl?: (govName: string) => string;
};

const encode = (value: string) => encodeURIComponent(value);

const JOB_SOURCES: JobSource[] = [
  { name: 'Iraq Jobs Scout', url: 'https://iqjscout.com/jobs/', group: 'Main Iraq job platforms', bestFor: 'Iraq-wide job listings with direct job detail pages', mode: 'search', buildUrl: (g) => g === 'Iraq' ? 'https://iqjscout.com/jobs/' : `https://iqjscout.com/job-location/${iqScoutSlug(g)}/` },
  { name: 'LinkedIn Iraq Jobs', url: 'https://www.linkedin.com/jobs/search/?location=Iraq', group: 'Main Iraq job platforms', bestFor: 'Private sector, banks, telecom, NGOs, international companies', mode: 'search', buildUrl: (g) => `https://www.linkedin.com/jobs/search/?location=${encode(g === 'Iraq' ? 'Iraq' : `${g}, Iraq`)}` },
  { name: 'Bayt Iraq', url: 'https://www.bayt.com/en/iraq/jobs/', group: 'Main Iraq job platforms', bestFor: 'Sales, admin, accounting, engineering, hospitality', mode: 'search', buildUrl: (g) => `https://www.bayt.com/en/iraq/jobs/?q=${encode(g)}` },
  { name: 'Tanqeeb Iraq', url: 'https://iraq.tanqeeb.com/', group: 'Main Iraq job platforms', bestFor: 'Arabic job search and local vacancies', mode: 'search', buildUrl: (g) => `https://iraq.tanqeeb.com/jobs/search?keywords=${encode(g)}` },
  { name: 'Taeen Iraq', url: 'https://taeen.iq/', group: 'Main Iraq job platforms', bestFor: 'Iraqi recruitment and city-based jobs', mode: 'direct' },
  { name: 'CareerIraq', url: 'https://careeriraq.com/', group: 'Main Iraq job platforms', bestFor: 'Iraq career platform and employer listings', mode: 'direct' },
  { name: 'EmployIQ', url: 'https://www.employiq.net/', group: 'Main Iraq job platforms', bestFor: 'Iraq recruitment and CV/profile tools', mode: 'direct' },
  { name: 'GulfTalent Iraq', url: 'https://www.gulftalent.com/iraq/jobs', group: 'Main Iraq job platforms', bestFor: 'Professional, oil/gas, management jobs', mode: 'search', buildUrl: (g) => `https://www.gulftalent.com/iraq/jobs?keyword=${encode(g)}` },
  { name: 'NaukriGulf Iraq', url: 'https://www.naukrigulf.com/jobs-in-iraq', group: 'Main Iraq job platforms', bestFor: 'Engineering, oil/gas, hospitality, teaching, banking', mode: 'search', buildUrl: (g) => `https://www.naukrigulf.com/jobs-in-iraq?k=${encode(g)}` },
  { name: 'Expertini Iraq', url: 'https://iq.expertini.com/jobs/', group: 'Main Iraq job platforms', bestFor: 'Backup aggregated job listings', mode: 'direct' },
  { name: 'Startup Jobs Iraq', url: 'https://startup.jobs/locations/iraq', group: 'Main Iraq job platforms', bestFor: 'Startup, remote, hybrid, and tech roles', mode: 'direct' },
  { name: 'Arkadu Iraq', url: 'https://www.arkadu-iq.org/', group: 'Main Iraq job platforms', bestFor: 'Arabic local jobs with city categories', mode: 'direct' },
  { name: 'Shaghilni Iraq', url: 'https://www.shaghilni-app.com/', group: 'Main Iraq job platforms', bestFor: 'Local jobs, CVs, professions, crafts, and courses', mode: 'direct' },
  { name: 'Wadhifety Iraq', url: 'https://wadhifety.com/', group: 'Main Iraq job platforms', bestFor: 'Iraq-based job-search platform', mode: 'direct' },
  { name: 'Jobs.KRD', url: 'https://jobs.krd/', group: 'Kurdistan Region job platforms', bestFor: 'KRG-supported Kurdistan jobs platform', mode: 'direct' },
  { name: 'Kurdistan Jobs', url: 'https://www.kurdistan-jobs.com/', group: 'Kurdistan Region job platforms', bestFor: 'Erbil, Sulaymaniyah, Duhok, KRI private sector', mode: 'direct' },
  { name: 'mselect Jobs', url: 'https://www.mselect.com/jobs', group: 'Kurdistan Region job platforms', bestFor: 'Professional/private-sector recruitment', mode: 'direct' },
  { name: 'Shull Solutions', url: 'https://shullsolutions.com/', group: 'Kurdistan Region job platforms', bestFor: 'Recruitment, HR, staffing, EOR', mode: 'direct' },
  { name: 'Erbil Manpower', url: 'https://erbilmanpower.com/', group: 'Kurdistan Region job platforms', bestFor: 'Oil/gas, telecom, Erbil, Duhok, Sulaymaniyah, Baghdad', mode: 'direct' },
  { name: 'NGOs Jobs & Bids', url: 'https://ngosjobs-bids.com/index.php/jobs', group: 'NGO / UN / humanitarian jobs', bestFor: 'NGO jobs in Iraq, KRI, and Syria', mode: 'direct' },
  { name: 'ReliefWeb Iraq Jobs', url: 'https://reliefweb.int/jobs?advanced-search=%28C122%29', group: 'NGO / UN / humanitarian jobs', bestFor: 'Humanitarian and NGO jobs', mode: 'search', buildUrl: (g) => `https://reliefweb.int/jobs?advanced-search=%28C122%29&search=${encode(g)}` },
  { name: 'UN Iraq Jobs', url: 'https://iraq.un.org/en/jobs', group: 'NGO / UN / humanitarian jobs', bestFor: 'Official UN jobs in Iraq', mode: 'direct' },
  { name: 'UNjobs Iraq', url: 'https://unjobs.org/duty_stations/iraq', group: 'NGO / UN / humanitarian jobs', bestFor: 'UN and international organization vacancies', mode: 'direct' },
  { name: 'Impactpool Iraq', url: 'https://www.impactpool.org/countries/Iraq', group: 'NGO / UN / humanitarian jobs', bestFor: 'UN, EU, international NGOs', mode: 'direct' },
  { name: 'UN Talent Iraq', url: 'https://untalent.org/jobs-at-united-nations/in-anything/contract-all/iraq', group: 'NGO / UN / humanitarian jobs', bestFor: 'UN vacancies by country/city', mode: 'direct' },
  { name: 'UNDP Iraq Careers', url: 'https://www.undp.org/iraq/careers', group: 'NGO / UN / humanitarian jobs', bestFor: 'Official UNDP Iraq jobs', mode: 'direct' },
  { name: 'IOM Iraq Careers', url: 'https://iraq.iom.int/careers', group: 'NGO / UN / humanitarian jobs', bestFor: 'Migration and humanitarian jobs', mode: 'direct' },
  { name: 'GIZ Iraq Jobs', url: 'https://www.giz-jobs.com/irak', group: 'NGO / UN / humanitarian jobs', bestFor: 'Development/cooperation jobs', mode: 'direct' },
  { name: 'DevelopmentAid Iraq Jobs', url: 'https://www.developmentaid.org/jobs/search?filter%5Bcountry%5D%5B0%5D=Iraq', group: 'NGO / UN / humanitarian jobs', bestFor: 'Development, NGO, donor-funded roles', mode: 'direct' },
  { name: 'Devex Iraq Jobs', url: 'https://www.devex.com/jobs/search?filter%5Bcountry_names%5D%5B%5D=Iraq', group: 'NGO / UN / humanitarian jobs', bestFor: 'Senior development and NGO roles', mode: 'direct' },
  { name: 'British Council Iraq Jobs', url: 'https://iraq.britishcouncil.org/en/about/jobs', group: 'NGO / UN / humanitarian jobs', bestFor: 'Education, culture, English programs', mode: 'direct' },
  { name: 'Rigzone Iraq Jobs', url: 'https://www.rigzone.com/oil/jobs/search/?sk=Iraq', group: 'Oil, gas, energy, engineering', bestFor: 'Oil and gas jobs across Iraq', mode: 'search', buildUrl: (g) => `https://www.rigzone.com/oil/jobs/search/?sk=${encode(g === 'Iraq' ? 'Iraq' : `${g} Iraq`)}` },
  { name: 'Rigzone Basra Jobs', url: 'https://www.rigzone.com/b-basrah-iraq-jobs/', group: 'Oil, gas, energy, engineering', bestFor: 'Basra oil/gas and technical roles', mode: 'direct' },
  { name: 'NES Fircroft Iraq', url: 'https://www.nesfircroft.com/regions/recruitment-in-middle-east/iraq-jobs/', group: 'Oil, gas, energy, engineering', bestFor: 'Energy and infrastructure recruitment', mode: 'direct' },
  { name: 'Airswift Iraq', url: 'https://www.airswift.com/about/locations/iraq', group: 'Oil, gas, energy, engineering', bestFor: 'Technical recruitment and temporary roles', mode: 'direct' },
  { name: 'WRS Iraq', url: 'https://www.worldwide-rs.com/contact-us/oil-and-gas-jobs-iraq/', group: 'Oil, gas, energy, engineering', bestFor: 'Oil/gas, telecom, FMCG, renewables', mode: 'direct' },
  { name: 'Orion Iraq Jobs', url: 'https://www.orionjobs.com/contact-us/iraq-jobs/', group: 'Oil, gas, energy, engineering', bestFor: 'Onshore/offshore oil and gas roles', mode: 'direct' },
  { name: 'Eni Careers Iraq', url: 'https://jobs.eni.com/', group: 'Oil, gas, energy, engineering', bestFor: 'Direct Eni company career page', mode: 'direct' },
  { name: 'Korek Careers', url: 'https://careers.korektel.com/', group: 'Company career pages', bestFor: 'Telecom jobs in KRI/Iraq', mode: 'direct' },
  { name: 'Zain Iraq Careers', url: 'https://www.iq.zain.com/en/careers', group: 'Company career pages', bestFor: 'Telecom, technology, graduate recruitment', mode: 'direct' },
  { name: 'talabat Careers', url: 'https://corporate.talabat.com/careers/', group: 'Company career pages', bestFor: 'Operations, sales, logistics, food delivery', mode: 'direct' },
  { name: 'Asiacell LinkedIn Jobs', url: 'https://www.linkedin.com/company/asiacell/jobs/', group: 'Company career pages', bestFor: 'Asiacell telecom job posts through LinkedIn', mode: 'direct' }
];

const FAST_JOB_SOURCE_NAMES = new Set([
  'Iraq Jobs Scout',
  'Jobs.KRD',
  'Kurdistan Jobs',
  'mselect Jobs',
  'Shull Solutions',
  'Erbil Manpower',
  'NGOs Jobs & Bids',
  'UNjobs Iraq',
  'Impactpool Iraq',
  'UN Talent Iraq',
  'LinkedIn Iraq Jobs',
  'Bayt Iraq'
]);

const JOB_CACHE_TTL_MS = 10 * 60 * 1000;

function iqScoutSlug(govName: string) {
  const v = govName.toLowerCase();
  if (v.includes('sulay')) return 'sulaymaniyah';
  if (v.includes('nine') || v.includes('mosul')) return 'ninhava';
  if (v.includes('basr')) return 'basrah';
  if (v.includes('qadis')) return 'qadisiyah';
  if (v.includes('muth')) return 'al-muthanna';
  if (v.includes('thi') || v.includes('dhi')) return 'thi-qar';
  if (v.includes('salah')) return 'salah-al-din';
  if (v.includes('halab')) return 'halabjah';
  return v.replace(/\s+/g, '-');
}

function buildJobSourceUrl(source: JobSource, governorateNameEN: string) {
  if (source.buildUrl) return source.buildUrl(governorateNameEN);
  return source.url;
}

const PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
];

const JOB_KEYWORDS = [
  'job', 'jobs', 'career', 'careers', 'vacancy', 'vacancies', 'apply', 'recruitment', 'position',
  'officer', 'assistant', 'manager', 'engineer', 'specialist', 'coordinator', 'advisor', 'consultant',
  'وظيفة', 'وظائف', 'تعيين', 'فرصة عمل', 'قدم', 'التقديم', 'کار', 'هەلی کار'
];

const GOV_ALIASES: Record<string, string[]> = {
  baghdad: ['baghdad', 'بغداد'],
  erbil: ['erbil', 'hawler', 'هەولێر', 'اربيل', 'أربيل'],
  basra: ['basra', 'basrah', 'البصرة'],
  sulaymaniyah: ['sulaymaniyah', 'sulaimani', 'slemani', 'سلێمانی', 'السليمانية'],
  nineveh: ['nineveh', 'mosul', 'ninhava', 'الموصل', 'نينوى'],
  duhok: ['duhok', 'dohuk', 'دهوك', 'دهۆک'],
  kirkuk: ['kirkuk', 'كركوك'],
  anbar: ['anbar', 'الانبار', 'الأنبار'],
  diyala: ['diyala', 'ديالى'],
  salah_al_din: ['salah', 'salah al-din', 'صلاح الدين'],
  najaf: ['najaf', 'النجف'],
  karbala: ['karbala', 'kerbala', 'كربلاء'],
  babil: ['babil', 'babylon', 'بابل'],
  wasit: ['wasit', 'واسط'],
  maysan: ['maysan', 'missan', 'ميسان'],
  dhi_qar: ['dhi qar', 'thi qar', 'ذي قار'],
  muthanna: ['muthanna', 'المثنى'],
  al_qadisiyah: ['qadisiyah', 'qadisiyyah', 'diwaniyah', 'القادسية', 'الديوانية'],
  halabja: ['halabja', 'حلبجة', 'هەڵەبجە']
};

function htmlDecode(text: string) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

function fetchWithTimeout(url: string, ms = 4500) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);

  return fetch(url, { signal: controller.signal }).finally(() => {
    clearTimeout(timeout);
  });
}

async function fetchHtmlViaProxy(url: string) {
  return new Promise<string>((resolve) => {
    let pending = PROXIES.length;
    let finished = false;

    PROXIES.forEach(async (proxy) => {
      try {
        const response = await fetchWithTimeout(proxy(url), 4500);
        if (!response.ok) throw new Error(`Proxy failed ${response.status}`);

        const text = await response.text();
        if (text && text.length > 300 && !finished) {
          finished = true;
          resolve(text);
        }
      } catch (_) {
        // Ignore this proxy and wait for another one.
      } finally {
        pending -= 1;
        if (pending === 0 && !finished) {
          resolve('');
        }
      }
    });
  });
}

function cleanJobTitle(raw: string, sourceName: string) {
  const cleaned = raw
    .replace(/\s+/g, ' ')
    .replace(/^(apply|view|details|read more|learn more|submit)\s*/i, '')
    .trim();
  if (!cleaned || cleaned.length < 6) return '';
  if (cleaned.toLowerCase() === sourceName.toLowerCase()) return '';
  return cleaned;
}

function inferGovernorateFromText(text: string) {
  for (const [govId, aliases] of Object.entries(GOV_ALIASES)) {
    if (aliases.some((alias) => text.includes(alias.toLowerCase()))) return govId;
  }
  return 'all';
}

function hashCode(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function extractJobLinks(html: string, source: JobSource, sourceUrl: string, governorateId: string, governorateName: string): FeedItem[] {
  const anchors: { href: string; text: string; context: string }[] = [];
  const anchorRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  let safety = 0;

  while ((match = anchorRegex.exec(html)) !== null && safety < 250) {
    safety++;
    const rawHref = match[1];
    const rawText = htmlDecode(match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    if (!rawText || rawText.length < 8 || rawText.length > 180) continue;

    let absoluteHref = rawHref;
    try {
      absoluteHref = new URL(rawHref, sourceUrl).toString();
    } catch (_) {
      continue;
    }

    const contextStart = Math.max(0, match.index - 260);
    const contextEnd = Math.min(html.length, match.index + 520);
    const context = htmlDecode(html.slice(contextStart, contextEnd).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    anchors.push({ href: absoluteHref, text: rawText, context });
  }

  const selectedAliases = governorateId === 'all' ? [] : (GOV_ALIASES[governorateId] || [governorateName.toLowerCase()]);
  const seen = new Set<string>();
  const jobs: FeedItem[] = [];

  for (const a of anchors) {
    const combined = `${a.text} ${a.href} ${a.context}`.toLowerCase();
    const looksLikeJob = JOB_KEYWORDS.some((kw) => combined.includes(kw.toLowerCase()));
    const looksLikeNavigationOnly = ['privacy', 'login', 'sign in', 'register', 'about us', 'contact us', 'terms'].some((bad) => combined.includes(bad));
    const govMatches = governorateId === 'all' || selectedAliases.some((alias) => combined.includes(alias.toLowerCase())) || source.mode === 'search';

    if (!looksLikeJob || looksLikeNavigationOnly || !govMatches || seen.has(a.href)) continue;
    seen.add(a.href);

    const inferredGov = governorateId === 'all' ? inferGovernorateFromText(combined) : governorateId;
    const title = cleanJobTitle(a.text, source.name);
    if (!title) continue;

    jobs.push({
      id: `live-job-${source.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${jobs.length}-${Math.abs(hashCode(a.href))}`,
      type: 'job' as any,
      titleEN: title,
      titleAR: title,
      titleKU: title,
      contentEN: a.context || `Current job listing collected from ${source.name}. Open the original source to read details and apply.`,
      contentAR: `فرصة عمل حالية من ${source.name}. افتح المصدر الأصلي لقراءة التفاصيل والتقديم.`,
      contentKU: `هەلی کاری ئێستا لە ${source.name}. سەرچاوەی سەرەکی بکەرەوە بۆ وردەکاری و پێشکەشکردن.`,
      author: {
        name: source.name,
        role: 'institution' as const,
        avatar: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=100',
        verified: true
      },
      date: 'Fetched live from source',
      likes: 0,
      commentsCount: 0,
      commentsList: [],
      governorateId: inferredGov,
      universityId: 'all',
      tags: ['job', source.group, inferredGov],
      application_link: a.href,
      original_source_url: a.href,
      location: inferredGov === 'all' ? 'Iraq' : governorateName,
      company: source.name,
      workplaceType: 'See source',
      whoCanApply: source.bestFor,
      salary: 'See source',
      savedByUser: false,
      likedByUser: false
    } as FeedItem);

    if (jobs.length >= 5) break;
  }

  return jobs;
}

async function fetchLiveJobsFromSources(governorateId: string, governorateName: string, sourceName: string) {
  const results: FeedItem[] = [];
  const selectedSources = sourceName === 'recommended'
    ? JOB_SOURCES.filter((source) => FAST_JOB_SOURCE_NAMES.has(source.name))
    : sourceName === 'all'
    ? JOB_SOURCES
    : JOB_SOURCES.filter((source) => source.name === sourceName);
  const batchSize = 8;

  for (let i = 0; i < selectedSources.length; i += batchSize) {
    const batch = selectedSources.slice(i, i + batchSize);
    const batchJobs = await Promise.all(batch.map(async (source) => {
      const sourceUrl = buildJobSourceUrl(source, governorateName);
      const html = await fetchHtmlViaProxy(sourceUrl);
      if (!html) return [] as FeedItem[];
      return extractJobLinks(html, source, sourceUrl, governorateId, governorateName);
    }));
    results.push(...batchJobs.flat());
  }

  const byUrl = new Map<string, FeedItem>();
  for (const item of results) {
    const url = String((item as any).application_link || (item as any).original_source_url || item.id);
    if (!byUrl.has(url)) byUrl.set(url, item);
  }
  return Array.from(byUrl.values()).slice(0, 120);
}

function getJobCacheKey(governorateId: string, sourceName: string) {
  return `jamiaati_live_jobs_${governorateId}_${sourceName}`;
}

function readCachedLiveJobs(cacheKey: string): FeedItem[] | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(cacheKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items)) return null;

    const createdAt = Number(parsed.createdAt || 0);
    if (!createdAt || Date.now() - createdAt > JOB_CACHE_TTL_MS) {
      window.sessionStorage.removeItem(cacheKey);
      return null;
    }

    return parsed.items as FeedItem[];
  } catch {
    return null;
  }
}

function writeCachedLiveJobs(cacheKey: string, items: FeedItem[]) {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.setItem(
      cacheKey,
      JSON.stringify({
        createdAt: Date.now(),
        items: items.slice(0, 120)
      })
    );
  } catch {
    // Ignore cache write problems.
  }
}

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
  isAdminMode = false,
  onUserClick
}: SectionViewProps) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [liveJobItems, setLiveJobItems] = useState<FeedItem[]>([]);
  const [selectedJobSource, setSelectedJobSource] = useState<string>('recommended');
  const [loading, setLoading] = useState(true);
  const [liveLoading, setLiveLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

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
  const isJobSection = normalizedKey === 'job';

  const selectedGovMeta = IraqiGovernorates.find(g => g.id === selectedGov);
  const selectedGovNameEN = selectedGov === 'all' ? 'Iraq' : selectedGovMeta?.nameEN || selectedGov;
  const selectedGovLabel = selectedGov === 'all'
    ? (language === 'ar' ? 'كل العراق' : language === 'ku' ? 'هەموو عێراق' : 'All Iraq')
    : selectedGovMeta
      ? (language === 'ar' ? selectedGovMeta.nameAR : language === 'ku' ? selectedGovMeta.nameKU : selectedGovMeta.nameEN)
      : selectedGovNameEN;

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      setErrorStatus(null);
      try {
        const queryEndpoint = categoryConfig.endpoint;
        const targetVal = categoryConfig.categoryValue;
        const params = new URLSearchParams();
        params.append('category', targetVal);
        if (selectedGov && selectedGov !== 'all') params.append('governorate', selectedGov);
        if (!isJobSection && selectedUni && selectedUni !== 'all') {
          params.append('university_id', selectedUni);
          params.append('institution_id', selectedUni);
        }
        params.append('limit', '80');

        const response = await fetch(`${BACKEND_URL}/api/${queryEndpoint}?${params.toString()}`);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();
        if (!active) return;
        if (!Array.isArray(data)) {
          setItems([]);
          return;
        }

        const filteredResults = data.filter((item: any) => {
          const itemType = String(item.category || item.type || '').toLowerCase();
          const target = targetVal.toLowerCase();
          return itemType === target ||
                 (target === 'job' && itemType.includes('job')) ||
                 (target === 'news' && itemType === 'announcement') ||
                 (target === 'announcement' && itemType === 'official_announcement') ||
                 (target === 'student_club' && itemType === 'study_group');
        });

        const mapped = filteredResults.map((item: any) => ({
          id: item.id || `scraped-${Date.now()}-${Math.random()}`,
          type: (item.category || item.type || categoryConfig.categoryValue) as any,
          titleEN: item.titleEN || item.title || 'Untitled Opportunity',
          titleAR: item.titleAR || item.title || 'فرصة غير معنونة',
          titleKU: item.titleKU || item.title || 'هەلی بێ ناونیشان',
          contentEN: item.contentEN || item.content || 'Check original portal for instructions.',
          contentAR: item.contentAR || item.content || 'يرجى مراجعة المصدر الأصلي لمعلومات التقديم.',
          contentKU: item.contentKU || item.content || 'تکایە سەرچاوەی سەرەکی ببینە بۆ زانیاری.',
          author: {
            name: item.organization || item.institution_name || item.author?.name || (isJobSection ? 'Career Source' : 'Academic Center'),
            role: 'institution' as const,
            avatar: item.author?.avatar || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=100',
            verified: true
          },
          date: item.published_date ? `Posted on ${item.published_date}` : 'Recently updated 🔔',
          likes: item.likes || 10,
          commentsCount: 0,
          commentsList: [],
          governorateId: item.governorateId || item.governorate || 'all',
          universityId: item.universityId || item.university_id || 'all',
          tags: item.tags || [categoryConfig.categoryValue, 'Iraq'],
          imageUrl: item.imageUrl || item.image_url || undefined,
          application_link: item.application_link || item.apply_url || item.source_url || item.original_source_url || undefined,
          original_source_url: item.original_source_url || item.application_link || item.apply_url || item.source_url || undefined,
          deadline: item.deadline || undefined,
          company: item.organization || item.institution_name || undefined,
          location: item.location || item.city || 'Iraq',
          whoCanApply: item.eligibility || item.whoCanApply || undefined,
          salary: item.salary || item.salary_or_funding || undefined,
          workplaceType: item.workplaceType || undefined,
          savedByUser: false,
          likedByUser: false
        }));

        setItems(mapped as FeedItem[]);
      } catch (err: any) {
        console.error('Fetch section error:', err);
        if (active) {
          setErrorStatus(err.message || 'Error loading live feed');
          setItems([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    return () => { active = false; };
  }, [normalizedKey, selectedGov, selectedUni, isJobSection, categoryConfig.endpoint, categoryConfig.categoryValue]);

  useEffect(() => {
    if (!isJobSection) {
      setLiveJobItems([]);
      setLiveLoading(false);
      return;
    }

    let active = true;
    const runLiveAggregator = async () => {
      setLiveLoading(true);
      try {
        const cacheKey = getJobCacheKey(selectedGov, selectedJobSource);
        const cachedJobs = readCachedLiveJobs(cacheKey);

        if (cachedJobs) {
          if (active) setLiveJobItems(cachedJobs);
          return;
        }

        const liveJobs = await fetchLiveJobsFromSources(selectedGov, selectedGovNameEN, selectedJobSource);
        writeCachedLiveJobs(cacheKey, liveJobs);

        if (active) setLiveJobItems(liveJobs);
      } catch (err) {
        console.warn('Live job aggregator failed:', err);
        if (active) setLiveJobItems([]);
      } finally {
        if (active) setLiveLoading(false);
      }
    };

    runLiveAggregator();
    return () => { active = false; };
  }, [isJobSection, selectedGov, selectedGovNameEN, selectedJobSource]);

  const backendFilteredItems = items.filter(item => {
    const matchesGov = selectedGov === 'all' || !item.governorateId || item.governorateId === 'all' || item.governorateId === selectedGov;
    const matchesUni = isJobSection || selectedUni === 'all' || !item.universityId || item.universityId === 'all' || item.universityId === selectedUni;
    return matchesGov && matchesUni;
  });

  const combinedItems = (() => {
    if (!isJobSection) return backendFilteredItems;
    const map = new Map<string, FeedItem>();
    [...liveJobItems, ...backendFilteredItems].forEach((item) => {
      const key = String((item as any).application_link || (item as any).original_source_url || item.id);
      if (!map.has(key)) map.set(key, item);
    });
    return Array.from(map.values());
  })();

  const availableUnis = selectedGov === 'all'
    ? IraqiUniversities
    : IraqiUniversities.filter(u => u.governorateId === selectedGov);

  const isRTL = language === 'ar' || language === 'ku';

  return (
    <div className="px-3.5 py-4 max-w-lg mx-auto flex flex-col pb-24 bg-[#0B1020]" id="section-view-container">
      <div className="mb-4 flex items-center justify-between" id="section-back-bar">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121B2E] border border-[#1F2E4D] text-slate-200 text-xs font-black cursor-pointer shadow-sm hover:bg-[#1C2C4E] hover:text-[#FFD21F] active:scale-95 transition-all select-none"
        >
          {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{language === 'ar' ? 'العودة للرئيسية' : language === 'ku' ? 'گەڕانەوە بۆ سەرەکی' : 'Back to Home'}</span>
        </button>

        <span className="text-[10px] uppercase font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20 font-black">
          {categoryConfig.isOpportunity ? 'OPPORTUNITY' : 'CAMPUS FEED'}
        </span>
      </div>

      <div className="mb-5 border-l-4 border-[#FFD21F] pl-3.5 rtl:border-l-0 rtl:border-r-4 rtl:pl-0 rtl:pr-3.5 pb-1">
        <h1 className="text-xl font-black text-white flex items-center gap-2">
          <span className="text-2xl">{categoryConfig.emoji}</span>
          <span>{language === 'ar' ? categoryConfig.titleAR : language === 'ku' ? categoryConfig.titleKU : categoryConfig.titleEN}</span>
        </h1>
        <p className="text-slate-400 text-[11px] leading-tight mt-1.5 font-medium">
          {language === 'ar' ? categoryConfig.descAR : language === 'ku' ? categoryConfig.descKU : categoryConfig.descEN}
        </p>
      </div>

      {isJobSection ? (
        <div className="mb-5 rounded-3xl bg-[#FFD21F] p-3.5 shadow-xl border border-yellow-300" id="job-top-filter-panel">
          <div className="flex items-center gap-2 mb-3 text-[#0B1020]">
            <Filter className="w-5 h-5" />
            <div>
              <p className="text-[11px] uppercase tracking-wide font-black">
                {language === 'ar' ? 'فلاتر الوظائف' : language === 'ku' ? 'فلتەرەکانی کار' : 'Job filters'}
              </p>
              <p className="text-[10px] font-bold opacity-75">
                {language === 'ar' ? 'اختر المحافظة والمصدر لجلب الوظائف الحالية' : language === 'ku' ? 'پارێزگا و سەرچاوە هەڵبژێرە' : 'Choose governorate and source to fetch current jobs'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <label className="block">
              <span className="mb-1 block text-[10px] font-black uppercase text-[#0B1020]">Governorate</span>
              <select
                value={selectedGov}
                onChange={(e) => {
                  setSelectedGov(e.target.value);
                  setSelectedUni('all');
                }}
                className="w-full rounded-2xl bg-white text-[#0B1020] px-3 py-3 text-sm font-black border-2 border-[#0B1020]/20 focus:outline-none cursor-pointer shadow-inner"
              >
                <option value="all">📍 {language === 'ar' ? 'كل المحافظات' : language === 'ku' ? 'هەموو پارێزگاکان' : 'All Governorates'}</option>
                {IraqiGovernorates.map((gov) => (
                  <option key={gov.id} value={gov.id}>
                    {language === 'ar' ? gov.nameAR : language === 'ku' ? gov.nameKU : gov.nameEN}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-[10px] font-black uppercase text-[#0B1020]">Source</span>
              <select
                value={selectedJobSource}
                onChange={(e) => setSelectedJobSource(e.target.value)}
                className="w-full rounded-2xl bg-white text-[#0B1020] px-3 py-3 text-sm font-black border-2 border-[#0B1020]/20 focus:outline-none cursor-pointer shadow-inner"
              >
                <option value="recommended">⚡ {language === 'ar' ? 'مصادر سريعة مقترحة' : language === 'ku' ? 'سەرچاوە خێرا پێشنیازکراوەکان' : 'Recommended Fast Sources'}</option>
                <option value="all">🌐 {language === 'ar' ? 'كل المصادر - أبطأ' : language === 'ku' ? 'هەموو سەرچاوەکان - هێواشتر' : 'All Sources - Slower'}</option>
                {JOB_SOURCES.map((source) => (
                  <option key={source.name} value={source.name}>{source.name}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 mb-5 select-none animate-fadeIn" id="section-filter-row">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-[#121B2E] border border-[#1F2E4D] hover:border-cyan-500/30 transition-all shadow-sm">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
            <select
              value={selectedGov}
              onChange={(e) => {
                setSelectedGov(e.target.value);
                setSelectedUni('all');
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
      )}

      {isJobSection && (
        <div className="mb-4 rounded-2xl bg-[#111A2D] border border-[#243454] px-3 py-2 text-[10px] text-slate-300 font-bold flex items-center gap-2">
          {liveLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FFD21F]" /> : <Search className="w-3.5 h-3.5 text-emerald-300" />}
          <span>
            {liveLoading
              ? (language === 'ar' ? `جاري جلب وظائف ${selectedGovLabel}...` : language === 'ku' ? `هێنانی هەلی کاری ${selectedGovLabel}...` : `Fetching ${selectedGovLabel} jobs...`)
              : (language === 'ar' ? `${combinedItems.length} وظيفة/رابط تقديم لهذا الاختيار` : language === 'ku' ? `${combinedItems.length} هەلی کار بۆ ئەم هەڵبژاردنە` : `${combinedItems.length} job cards/direct apply links for this selection`)}
          </span>
        </div>
      )}

      {(loading || (isJobSection && liveLoading && combinedItems.length === 0)) ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3" id="section-loading-screen">
          <Loader2 className="w-8 h-8 text-[#FFD21F] animate-spin" />
          <span className="text-xs text-slate-400 font-extrabold animate-pulse">
            {isJobSection
              ? (language === 'ar' ? 'جاري جلب الوظائف الحالية من المصادر...' : language === 'ku' ? 'هێنانی هەلی کاری ئێستا...' : 'Fetching current jobs from career sources...')
              : (language === 'ar' ? 'جاري تحميل الفرص والأخبار...' : language === 'ku' ? 'بارکردنی دەرفەتەکان...' : 'Fetching sector items from server...')}
          </span>
        </div>
      ) : combinedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 px-6 bg-[#121B2E] rounded-3xl border border-[#1F2E4D] border-dashed text-center shadow-lg" id="section-empty-container">
          <div className="w-12 h-12 rounded-full bg-slate-950/40 flex items-center justify-center text-xl mb-3.5 border border-[#1F2E4D]">
            {categoryConfig.emoji}
          </div>
          <p className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
            {isJobSection
              ? (language === 'ar' ? 'لم يتم جلب وظائف بعد' : language === 'ku' ? 'هێشتا کار نەهاتووە' : 'No fetched jobs yet')
              : (language === 'ar' ? 'القسم فارغ' : 'Section Empty')}
          </p>
          <p className="text-xs leading-relaxed text-[#94A3B8]/90 max-w-[290px]">
            {isJobSection
              ? (language === 'ar'
                  ? 'بعض المواقع قد تمنع الجلب المباشر. اختر مصدراً آخر أو محافظة أخرى.'
                  : language === 'ku'
                  ? 'هەندێک ماڵپەڕ ڕێگە بە هێنانی ڕاستەوخۆ نادات.'
                  : 'Some websites may block live fetching. Try another source or governorate.')
              : (language === 'ar'
                  ? 'لا توجد عناصر حالياً لهذا القسم'
                  : language === 'ku'
                  ? 'ئێستا هیچ بابەتێک بۆ ئەم بەشە نییە'
                  : 'No items available in this section yet')}
          </p>
          {errorStatus && <p className="text-[10px] text-amber-300 mt-3">{errorStatus}</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-5" id="section-cards-feed">
          {isJobSection && (
            <div className="rounded-2xl bg-[#17243E] border border-[#263A62] px-3 py-2 text-[10px] text-slate-300 font-bold flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-[#FFD21F]" />
              <span>
                {language === 'ar'
                  ? `وظائف مجمعة لمحافظة: ${selectedGovLabel}`
                  : language === 'ku'
                  ? `هەلی کار بۆ: ${selectedGovLabel}`
                  : `Aggregated jobs for: ${selectedGovLabel}`}
              </span>
            </div>
          )}
          {combinedItems.map((item) => (
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
              onUserClick={onUserClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}


/**
 * Frontend-only demo dataset for UI demonstration
 * This data is NOT saved to localStorage and NOT inserted into backend
 * Used only to enrich the UI when real data is sparse
 */

import { FeedItem } from '../types';

export const DEMO_ITEMS: FeedItem[] = [
  {
    id: 'demo-news-1',
    type: 'news',
    titleEN: 'University of Baghdad Launches New AI Research Center',
    titleAR: 'جامعة بغداد تطلق مركز أبحاث الذكاء الاصطناعي الجديد',
    titleKU: 'زانکۆی بەغدا ناوەندی توێژینەوەی AI دەست پێ دەکات',
    contentEN: 'The University of Baghdad has inaugurated a state-of-the-art AI research center focusing on healthcare and education applications. Students can now apply for research assistant positions.',
    contentAR: 'جامعة بغداد افتتحت مركز أبحاث متطور للذكاء الاصطناعي يركز على تطبيقات الرعاية الصحية والتعليم. يمكن للطلاب الآن التقديم لشواغر مساعد البحث.',
    contentKU: 'زانکۆی بەغدا ناوەندێکی توێژینەوەی پێشکەوتووی AI کردەوە کە تێکڕایی دەخاتە سەر کاربردەکانی تەندروستی و پەروەردە. قوتابیان دەتوانن ئێستا داواکاری بکەن بۆ پێگەی یاریدەدەری توێژینەوە.',
    author: {
      name: 'University of Baghdad',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=100',
      verified: true,
      university: 'University of Baghdad'
    },
    date: '2 hours ago',
    likes: 142,
    commentsCount: 23,
    commentsList: [],
    governorateId: 'baghdad',
    universityId: 'uni-baghdad',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
    tags: ['AI', 'Research', 'Innovation'],
    isNew: true,
    original_source_url: 'https://uobaghdad.edu.iq',
    isDemo: true
  },
  {
    id: 'demo-scholarship-1',
    type: 'scholarship',
    titleEN: 'Full Scholarship for Iraqi Students - Germany 2025',
    titleAR: 'منحة دراسية كاملة للطلاب العراقيين - ألمانيا 2025',
    titleKU: 'بورسی تەواو بۆ قوتابیانی عێراق - ئەڵمانیا 2025',
    contentEN: 'DAAD offers fully funded scholarships for Iraqi students pursuing Masters and PhD degrees in Engineering, Computer Science, and Renewable Energy. Application deadline: March 15, 2025.',
    contentAR: 'تقدم DAAD منحاً دراسية ممولة بالكامل للطلاب العراقيين لدرجة الماجستير والدكتوراه في الهندسة وعلوم الحاسوب والطاقة المتجددة. موعد التقديم: 15 مارس 2025.',
    contentKU: 'DAAD بورسی تەواو بە قوتابیانی عێراق دەخاتە بەردەست بۆ بەدەستهێنانی بڕوانامەی ماستەر و دکتۆرا لە ئەندازیاری و زانستی کۆمپیوتەر و وزەی نوێکراوە. کۆتایی داواکاری: 15 ئازار 2025.',
    author: {
      name: 'DAAD Iraq',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=100',
      verified: true,
      university: 'DAAD'
    },
    date: '1 day ago',
    likes: 289,
    commentsCount: 45,
    commentsList: [],
    governorateId: 'all',
    universityId: 'all',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800',
    tags: ['Scholarship', 'Germany', 'Masters', 'PhD'],
    deadline: '2025-03-15',
    application_link: 'https://www.daad.de',
    company: 'DAAD',
    location: 'Germany',
    whoCanApply: 'Iraqi citizens with Bachelor degree',
    workplaceType: 'On-site',
    opportunityCategory: 'Scholarship',
    isDemo: true
  },
  {
    id: 'demo-event-1',
    type: 'event',
    titleEN: 'Annual Tech Hackathon - University of Basra',
    titleAR: 'هاكاثون التقني السنوي - جامعة البصرة',
    titleKU: 'هاکاتۆنی تەکنیکی ساڵانە - زانکۆی بەسرە',
    contentEN: 'Join the 48-hour coding marathon! Build innovative solutions for local challenges. Prizes: $5000 for first place. Open to all university students across Iraq.',
    contentAR: 'انضم إلى ماراثون البرمجة لمدة 48 ساعة! ابتكر حلولاً مبتكرة للتحديات المحلية. الجوائز: 5000 دولار للمركز الأول. مفتوح لجميع طلاب الجامعات في جميع أنحاء العراق.',
    contentKU: 'بەشداری لە ماراثۆنی کۆدکردنی 48 کاتژمێر بکە! چارەسەری نوێ دروست بکە بۆ ئالۆنگەرییەکانی ناوخۆیی. خەڵات: 5000 دۆلار بۆ پلەی یەکەم. کرایە بۆ هەموو قوتابیانی زانکۆ لە سەرتاسەری عێراق.',
    author: {
      name: 'Tech Club Basra',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
      verified: true,
      university: 'University of Basra'
    },
    date: '3 days ago',
    likes: 156,
    commentsCount: 32,
    commentsList: [],
    governorateId: 'basra',
    universityId: 'uni-basra',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
    tags: ['Hackathon', 'Technology', 'Competition'],
    eventDate: 'February 20, 2025',
    eventTime: '9:00 AM',
    eventVenue: 'Engineering College, University of Basra',
    eventRsvped: false,
    eventRsvpCount: 87,
    isDemo: true
  },
  {
    id: 'demo-job-1',
    type: 'job',
    titleEN: 'Junior Software Developer - Zain Iraq',
    titleAR: 'مطور برمجيات مبتدئ - زين العراق',
    titleKU: 'پەرەپێدەری نەرمەکاڵای سەرەتایی - Zain Iraq',
    contentEN: 'Zain Iraq is hiring junior software developers for their Baghdad office. Requirements: React, Node.js, and basic cloud knowledge. Competitive salary and benefits package.',
    contentAR: 'توظف زين العراق مطوري برمجيات مبتدئين لمكتب بغداد. المتطلبات: React، Node.js، والمعرفة الأساسية بالحوسبة السحابية. راتب تنافسي وحوافز ممتازة.',
    contentKU: 'Zain Iraq پەرەپێدەری نەرمەکاڵای سەرەتایی دادەخەنێت بۆ ئۆفیسی بەغدا. پێداویستییەکان: React، Node.js، و زانیاری بنەڕەتیی سەبار. مووچەی پێکەوتن و پاکێجی سوود.',
    author: {
      name: 'Zain Iraq HR',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&q=80&w=100',
      verified: true,
      university: 'Zain Iraq'
    },
    date: '5 days ago',
    likes: 98,
    commentsCount: 18,
    commentsList: [],
    governorateId: 'baghdad',
    universityId: 'all',
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800',
    tags: ['Job', 'Software', 'Baghdad'],
    deadline: '2025-02-28',
    application_link: 'https://careers.zain.com',
    company: 'Zain Iraq',
    companyLogo: '📱',
    location: 'Baghdad',
    whoCanApply: 'Fresh graduates with CS degree',
    salary: 'Competitive',
    workplaceType: 'On-site',
    opportunityCategory: 'Full-time graduate job',
    companyVerified: true,
    applied: false,
    isDemo: true
  },
  {
    id: 'demo-internship-1',
    type: 'internship',
    titleEN: 'Marketing Internship - Asiacell',
    titleAR: 'تدريب تسويق - آسياسيل',
    titleKU: 'مەشقی مارکێتینگ - Asiacell',
    contentEN: '3-month paid internship program at Asiacell Sulaymaniyah. Learn digital marketing, social media management, and campaign analytics. Certificate provided upon completion.',
    contentAR: 'برنامج تدريب مدفوع الأجر لمدة 3 أشهر في آسياسيل السليمانية. تعلم التسويق الرقمي وإدارة وسائل التواصل الاجتماعي وتحليل الحملات. شهادة إتمام مقدمة.',
    contentKU: 'بەرنامەی مەشقی پارەدراوی بۆ ماوەی 3 مانگ لە Asiacell سلێمانی. مارکێتینگی دیجیتاڵی، بەڕێوەبردنی میدیا کۆمەڵایەتی و شیکارکردنی کەمپەین فێربە. بڕوانامەی تەواوکردن دەدرێت.',
    author: {
      name: 'Asiacell HR',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=100',
      verified: true,
      university: 'Asiacell'
    },
    date: '1 week ago',
    likes: 76,
    commentsCount: 12,
    commentsList: [],
    governorateId: 'sulaymaniyah',
    universityId: 'all',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800',
    tags: ['Internship', 'Marketing', 'Sulaymaniyah'],
    deadline: '2025-03-01',
    application_link: 'https://asiacell.com/careers',
    company: 'Asiacell',
    companyLogo: '📡',
    location: 'Sulaymaniyah',
    whoCanApply: 'University students 3rd year+',
    salary: 'Paid',
    workplaceType: 'On-site',
    opportunityCategory: 'Internship',
    companyVerified: true,
    applied: false,
    isDemo: true
  },
  {
    id: 'demo-activity-1',
    type: 'activity',
    titleEN: 'Campus Photography Exhibition - University of Mosul',
    titleAR: 'معرض التصوير الجامعي - جامعة الموصل',
    titleKU: 'پێشانگای وێنەگرتن لە زانکۆ - زانکۆی مووسڵ',
    contentEN: 'Annual photography exhibition showcasing student work. Theme: "My Campus, My Story". Submit your best campus photos by February 25. Prizes for top 3 photographers.',
    contentAR: 'معرض التصوير السنوي الذي يعرض أعمال الطلاب. الموضوع: "حرمي الجامعي، قصتي". قدم أفضل صور حرمك الجامعي بحلول 25 فبراير. جوائز لأفضل 3 مصورين.',
    contentKU: 'پێشانگای وێنەگرتنی ساڵانە کە کارەکانی قوتابی پیشان دەدات. تەما: "زانکۆکەم، چیرۆکەکەم". باشترین وێنەکانی زانکۆکەت پێش 25 شوبات بنێرە. خەڵات بۆ 3 وێنەگرانی سەرەکی.',
    author: {
      name: 'Art Club Mosul',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=100',
      verified: false,
      university: 'University of Mosul'
    },
    date: '2 weeks ago',
    likes: 134,
    commentsCount: 28,
    commentsList: [],
    governorateId: 'nineveh',
    universityId: 'uni-mosul',
    imageUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=800',
    tags: ['Photography', 'Art', 'Exhibition'],
    eventDate: 'March 1, 2025',
    eventVenue: 'Student Center, University of Mosul',
    isDemo: true
  },
  {
    id: 'demo-registration-1',
    type: 'registration',
    titleEN: 'Fall 2025 Registration Now Open - All Universities',
    titleAR: 'التسجيل للفصل الخريفي 2025 مفتوح الآن - جميع الجامعات',
    titleKU: 'تۆمارکردنی پاییز 2025 ئێستا کرایە - هەموو زانکۆکان',
    contentEN: 'Registration for Fall 2025 semester is now open across all Iraqi universities. Early bird discount available until April 15. Contact your academic advisor for course selection guidance.',
    contentAR: 'التسجيل للفصل الدراسي الخريفي 2025 مفتوح الآن في جميع الجامعات العراقية. خصم التسجيل المبكر متاح حتى 15 أبريل. اتصل بالمستشار الأكاديمي الخاص بك للحصول على إرشادات اختيار المقررات.',
    contentKU: 'تۆمارکردنی خولی پاییز 2025 ئێستا کرایە لە سەرتاسەری زانکۆکانی عێراق. داشکاندنی تۆمارکردنی زوو بەردەستە تاوەکو 15 نیسان. پەیوەندی بە ڕاوێژکاری ئەکادیمیی خۆت بکە بۆ ڕێنمایین هەڵبژاردنی وانە.',
    author: {
      name: 'Ministry of Higher Education',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=100',
      verified: true,
      university: 'Ministry of Higher Education'
    },
    date: '3 weeks ago',
    likes: 412,
    commentsCount: 89,
    commentsList: [],
    governorateId: 'all',
    universityId: 'all',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
    tags: ['Registration', 'Fall 2025', 'Academic'],
    application_link: 'https://mohesr.gov.iq',
    isDemo: true
  },
  {
    id: 'demo-exam-1',
    type: 'exam',
    titleEN: 'Final Exam Schedule Released - Spring 2025',
    titleAR: 'جدول الامتحانات النهائية صدر - ربيع 2025',
    titleKU: 'خشتەی تاقیکردنەوەکانی کۆتایی بڵاوکرایەوە - بەهار 2025',
    contentEN: 'The final examination schedule for Spring 2025 semester has been released. Check your student portal for specific exam dates and times. Exam period: May 15 - June 10, 2025.',
    contentAR: 'تم إصدار جدول الامتحانات النهائية للفصل الدراسي الربيعي 2025. تحقق من بوابة الطالب للحصول على مواعيد وأوقات الامتحانات المحددة. فترة الامتحانات: 15 مايو - 10 يونيو 2025.',
    contentKU: 'خشتەی تاقیکردنەوەکانی کۆتایی بۆ خوولی بەهاری 2025 بڵاوکرایەوە. دەروازەی قوتابییەکەت بپێڕێ بۆ بەرواری و کاتی تاقیکردنەوەی دیاریکراو. ماوەی تاقیکردنەوە: 15 ئایار - 10 حوزەیران 2025.',
    author: {
      name: 'Examination Office',
      role: 'staff',
      avatar: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=100',
      verified: true,
      university: 'All Universities'
    },
    date: '1 month ago',
    likes: 567,
    commentsCount: 124,
    commentsList: [],
    governorateId: 'all',
    universityId: 'all',
    imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=800',
    tags: ['Exam', 'Schedule', 'Spring 2025'],
    eventDate: 'May 15 - June 10, 2025',
    isDemo: true
  },
  {
    id: 'demo-student-club-1',
    type: 'student_club',
    titleEN: 'Debate Club Recruitment - University of Erbil',
    titleAR: 'تجنيد نادي المناظرات - جامعة أربيل',
    titleKU: 'دانانی یانەی مشتومڕ - زانکۆی هەولێر',
    contentEN: 'The Debate Club is looking for new members! Improve your public speaking and critical thinking skills. Weekly meetings every Tuesday at 4 PM in the Student Union building.',
    contentAR: 'نادي المناظرات يبحث عن أعضاء جدد! حسن مهاراتك في التحدث أمام الجمهور والتفكير النقدي. اجتماعات أسبوعية كل يوم ثلاثاء الساعة 4 مساء في مبنى اتحاد الطلاب.',
    contentKU: 'یانەی مشتومڕ گەڕان بە ئەندامی نوێ دەکات! هونەری قسەکردن و بیرکردنەوەی ڕەخنەگرانەت بەرەو پێش ببە. کۆبوونەوەی هەفتەیی هەر سێشەممە سەعات 4 ئێوارە لە بینای یەکێتیی قوتابیان.',
    author: {
      name: 'Debate Club Erbil',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=100',
      verified: false,
      university: 'University of Erbil'
    },
    date: '1 month ago',
    likes: 89,
    commentsCount: 15,
    commentsList: [],
    governorateId: 'erbil',
    universityId: 'uni-erbil',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800',
    tags: ['Debate', 'Club', 'Public Speaking'],
    eventVenue: 'Student Union Building',
    joined: false,
    memberCount: 45,
    isDemo: true
  },
  {
    id: 'demo-announcement-1',
    type: 'announcement',
    titleEN: 'Library Extended Hours During Finals Week',
    titleAR: 'ساعات عمل مكتبة ممتدة خلال أسبوع الامتحانات النهائية',
    titleKU: 'کاتی کاری کتێبخانە درێژکراوە لە هەفتەی تاقیکردنەوەکانی کۆتایی',
    contentEN: 'The university library will have extended hours during finals week: Open 24/7 from May 10 to June 12. Quiet study zones and group study rooms available. Free coffee and snacks provided.',
    contentAR: 'ستكون مكتبة الجامعة مفتوحة لساعات ممتدة خلال أسبوع الامتحانات النهائية: مفتوحة 24/7 من 10 مايو إلى 12 يونيو. مناطق الدراسة الهادئة وغرف الدراسة الجماعية متاحة. قهوة ووجبات خفيفة مجانية.',
    contentKU: 'کتێبخانەی زانکۆ کاتی کاری درێژکراوەی هەبێت لە ماوەی هەفتەی تاقیکردنەوەکانی کۆتایی: کرایە 24/7 لە 10 ئایار تا 12 حوزەیران. ناوچەی خوێندنی بێدەنگ و ژووری خوێندنی گرووپی بەردەستە. قاوە و مەزەڵی بەخۆڕایی.',
    author: {
      name: 'Library Services',
      role: 'staff',
      avatar: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=100',
      verified: true,
      university: 'All Universities'
    },
    date: '2 months ago',
    likes: 324,
    commentsCount: 67,
    commentsList: [],
    governorateId: 'all',
    universityId: 'all',
    imageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800',
    tags: ['Library', 'Announcement', 'Finals'],
    isDemo: true
  }
];

/**
 * Get demo items filtered by category/type
 * @param category - The category to filter by
 * @returns Filtered demo items
 */
export function getDemoItemsByCategory(category: string): FeedItem[] {
  return DEMO_ITEMS.filter(item => 
    item.type === category || 
    item.opportunityCategory?.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Get demo items filtered by governorate
 * @param governorateId - The governorate ID to filter by
 * @returns Filtered demo items
 */
export function getDemoItemsByGovernorate(governorateId: string): FeedItem[] {
  if (governorateId === 'all') return DEMO_ITEMS;
  return DEMO_ITEMS.filter(item => 
    item.governorateId === 'all' || item.governorateId === governorateId
  );
}

/**
 * Get demo items filtered by university
 * @param universityId - The university ID to filter by
 * @returns Filtered demo items
 */
export function getDemoItemsByUniversity(universityId: string): FeedItem[] {
  if (universityId === 'all') return DEMO_ITEMS;
  return DEMO_ITEMS.filter(item => 
    item.universityId === 'all' || item.universityId === universityId
  );
}

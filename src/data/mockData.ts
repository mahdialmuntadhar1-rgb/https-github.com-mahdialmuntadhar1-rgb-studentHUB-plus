import { Governorate, University, FeedItem, UserProfile } from '../types';

export const IraqiGovernorates: Governorate[] = [
  { id: 'baghdad', nameEN: 'Baghdad', nameAR: 'بغداد', nameKU: 'بەغدا' },
  { id: 'erbil', nameEN: 'Erbil', nameAR: 'أربيل', nameKU: 'هەولێر' },
  { id: 'sulaymaniyah', nameEN: 'Sulaymaniyah', nameAR: 'السليمانية', nameKU: 'سڵێمانی' },
  { id: 'nineveh', nameEN: 'Nineveh (Mosul)', nameAR: 'نينوى (الموصل)', nameKU: 'نەینەوا' },
  { id: 'basra', nameEN: 'Basra', nameAR: 'البصرة', nameKU: 'بەسرە' },
  { id: 'karbala', nameEN: 'Karbala', nameAR: 'كربلاء', nameKU: 'کەربەلا' },
  { id: 'najaf', nameEN: 'Najaf', nameAR: 'النجف', nameKU: 'نەجەف' },
  { id: 'kirkuk', nameEN: 'Kirkuk', nameAR: 'كركوك', nameKU: 'کەرکووک' },
];

export const IraqiUniversities: University[] = [
  {
    id: 'u_baghdad',
    nameEN: 'University of Baghdad',
    nameAR: 'جامعة بغداد',
    nameKU: 'زانکۆی بەغدا',
    governorateId: 'baghdad',
    logo: '🎓',
    color: 'from-blue-600 to-sky-500'
  },
  {
    id: 'u_mustansiriya',
    nameEN: 'Al-Mustansiriya University',
    nameAR: 'الجامعة المستنصرية',
    nameKU: 'زانکۆی موستەنسریە',
    governorateId: 'baghdad',
    logo: '🏛️',
    color: 'from-emerald-600 to-teal-500'
  },
  {
    id: 'u_sulaymaniyah',
    nameEN: 'University of Sulaymaniyah',
    nameAR: 'جامعة السليمانية',
    nameKU: 'زانکۆی سلێمانی',
    governorateId: 'sulaymaniyah',
    logo: '⛰️',
    color: 'from-amber-600 to-indigo-500'
  },
  {
    id: 'u_salahaddin',
    nameEN: 'Salahaddin University',
    nameAR: 'جامعة صلاح الدين',
    nameKU: 'زانکۆی سەڵاحەدین',
    governorateId: 'erbil',
    logo: '🏰',
    color: 'from-rose-600 to-orange-500'
  },
  {
    id: 'u_mosul',
    nameEN: 'University of Mosul',
    nameAR: 'جامعة الموصل',
    nameKU: 'زانکۆی مووسڵ',
    governorateId: 'nineveh',
    logo: '📖',
    color: 'from-violet-600 to-purple-500'
  },
  {
    id: 'u_basrah',
    nameEN: 'University of Basrah',
    nameAR: 'جامعة البصرة',
    nameKU: 'زانکۆی بەسرە',
    governorateId: 'basra',
    logo: '⚓',
    color: 'from-cyan-600 to-blue-500'
  },
  {
    id: 'auib',
    nameEN: 'American University of Iraq, Baghdad',
    nameAR: 'الجامعة الأمريكية في بغداد',
    nameKU: 'زانکۆی ئەمریکی لە بەغداد',
    governorateId: 'baghdad',
    logo: '🦅',
    color: 'from-red-600 to-blue-900'
  },
  {
    id: 'auis',
    nameEN: 'American University of Iraq, Sulaimani',
    nameAR: 'الجامعة الأمريكية في السليمانية',
    nameKU: 'زانکۆی ئەمریکی لە سلێمانی',
    governorateId: 'sulaymaniyah',
    logo: '🌿',
    color: 'from-teal-700 to-amber-500'
  },
];

export const defaultUserProfile: UserProfile = {
  id: 'me',
  name: 'Zara Al-Iraqi',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  role: 'student',
  universityId: 'u_baghdad',
  governorateId: 'baghdad',
  bioEN: 'Computer Science junior at UoB. Passionate about UI/UX and building the tech ecosystem in Iraq. 🇮🇶✨',
  bioAR: 'طالبة علوم حاسوب في جامعة بغداد. شغوفة بتصميم واجهات المستخدم وبناء النظام البيئي التقني في العراق. 🇮🇶✨',
  bioKU: 'خوێندکاری زانستی کۆمپیوتەر لە زانکۆی بەغدا. خولیای دیزاینی ڕووکار و بنیاتنانی سیستەمی تەکنەلۆژی لە عێراقە. 🇮🇶✨',
  majorEN: 'Software Engineering (Year 3)',
  majorAR: 'هندسة البرمجيات (المرحلة الثالثة)',
  majorKU: 'ئەندازیاری نەرمەکاڵا (قۆناغی ٣)',
  points: 340,
  level: 4,
  savedItemIds: [],
  appliedJobIds: [],
  joinedGroupIds: [],
  rsvpedEventIds:[],
};

export const initialFeedItems: FeedItem[] = [
  // 1. OPP - Frontend Developer Intern (Internship)
  {
    id: 'opp-1',
    type: 'internship',
    titleEN: 'Frontend Developer Intern',
    titleAR: 'تدريب عملي لمطور واجهات أمامية',
    titleKU: 'مەشقی گەشەپێدەری فرۆنتێند',
    contentEN: 'Hunar Tech is offering a 3-month hybrid internship for students looking to upscale their skills in React, Tailwind CSS, and TypeScript. You will be building real customer portal widgets and working alongside senior developers.',
    contentAR: 'تقدم شركة Hunar Tech تدريباً عملياً هجيناً لمدة ٣ أشهر للطلاب الراغبين في الارتقاء بمهاراتهم في مكتبات React و Tailwind CSS ولغة TypeScript. ستعمل على تطوير عناصر تحكم حقيقية للبوابات الإلكترونية برفقة مهندسين أقدم.',
    contentKU: 'کۆمپانیای Hunar Tech مەشقێکی هایبرید بۆ ماوەی ٣ مانگ پێشکەش دەکات بۆ ئەو خوێندکارانەی کە دەیانەوێت کارامەییەکانیان لە React و Tailwind CSS و TypeScript بەرز بکەنەوە. تۆ نوێترین ڕووکارەکان دروست دەکەیت.',
    author: {
      name: 'Hunar Tech Dev Hub',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=150',
      verified: true
    },
    date: '1 hour ago',
    likes: 45,
    commentsCount: 3,
    governorateId: 'erbil',
    company: 'Hunar Tech',
    companyLogo: '💻',
    location: 'Erbil (Hybrid)',
    deadline: 'June 30, 2026',
    opportunityCategory: 'Internship',
    workplaceType: 'Hybrid',
    whoCanApply: '3rd & 4th Year Computer Science & SE students',
    savedCount: 42,
    universityAppliedCount: 8,
    companyVerified: true,
    tags: ['Erbil', 'Internships', 'React', 'Tech'],
    commentsList: []
  },

  // 2. OPP - Marketing Internship (Internship)
  {
    id: 'opp-2',
    type: 'internship',
    titleEN: 'Marketing Internship',
    titleAR: 'تدريب تسويق وعلاقات عامة',
    titleKU: 'مەشقی مارکێتینگ و پەیوەندییەکان',
    contentEN: 'Join Korek Telecom\'s fast-paced marketing team in Sulaymaniyah. Gain experience in digital campaigning, campus outreach, social media planning, and telecom market research.',
    contentAR: 'انضم إلى فريق التسويق الديناميكي في شركة كورك تليكوم بالسليمانية. اكتسب خبرة في الحملات الرقمية، والتواصل الجامعي، والتخطيط لوسائل التواصل الاجتماعي، وأبحاث قطاع الاتصالات.',
    contentKU: 'ببە بەشێک لە تیمی مارکێتینگی خێرای کۆڕەک تیلیکۆم لە سلێمانی. ئەزموون لە کەمپینی دیجیتاڵی، پەیوەندییەکانی زانکۆ، پلاندانانی سۆشیاڵ میدیا و کۆڕەک بەدەستبهێنە.',
    author: {
      name: 'Korek Telecom Careers',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&q=80&w=150',
      verified: true
    },
    date: '3 hours ago',
    likes: 68,
    commentsCount: 5,
    governorateId: 'sulaymaniyah',
    universityId: 'u_sulaymaniyah',
    company: 'Korek Telecom',
    companyLogo: '📡',
    location: 'Sulaymaniyah (On-site)',
    deadline: 'July 10, 2026',
    opportunityCategory: 'Internship',
    workplaceType: 'On-site',
    whoCanApply: 'Business Administration, Marketing & English majors',
    savedCount: 31,
    universityAppliedCount: 12,
    companyVerified: true,
    tags: ['Sulaymaniyah', 'Marketing', 'Korek', 'Business'],
    commentsList: []
  },

  // 3. OPP - Free Digital Marketing Training (Training)
  {
    id: 'opp-3',
    type: 'training',
    titleEN: 'Free Digital Marketing Training',
    titleAR: 'تدريب مجاني في التسويق الرقمي وإدارة الإعلانات',
    titleKU: 'ڕاهێنانی خۆڕایی لە مارکێتینگی دیجیتاڵی',
    contentEN: 'An intensive 4-week online masterclass designed by Digital Skills Iraq covering SEO, Google Ads, Meta Ads Manager, and modern growth hacking techniques. Sessions are fully recorded with downloadable certs.',
    contentAR: 'برنامج تدريبي مكثف لمدة ٤ أسابيع عبر الإنترنت مصمم من قبل "المهارات الرقمية في العراق" يغطي تحسين محركات البحث وسيو وإعلانات غوغل وإعلانات ميتا وأساليب النمو الحديثة. الجلسات مسجلة وموثقة بشهادات قابلة للتحميل.',
    contentKU: 'کۆرسێکی فێربوونی چڕی ٤ هەفتەیی لەسەر هێڵ کە لەلایەن کارامەیی دیجیتاڵی عێراقییەوە دابینکراوە و بەرنامەکانی گۆگڵ و سۆشیال میدیا و ڕێگاکانی گەشەکردن دەگرێتەوە. بڕوانامەی لەگەڵدایە.',
    author: {
      name: 'Digital Skills Iraq',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&q=80&w=150',
      verified: true
    },
    date: '5 hours ago',
    likes: 189,
    commentsCount: 22,
    governorateId: 'baghdad',
    company: 'Digital Skills Iraq',
    companyLogo: '🚀',
    location: 'All Iraq (Remote)',
    deadline: 'June 25, 2026',
    opportunityCategory: 'Training',
    workplaceType: 'Remote',
    whoCanApply: 'All Iraqi undergraduates and fresh graduates wanting digital mastery',
    savedCount: 156,
    universityAppliedCount: 45,
    companyVerified: true,
    tags: ['Training', 'DigitalMarketing', 'Remote', 'Iraq'],
    commentsList: []
  },

  // 4. OPP - Graduation Project Mini Grant (Graduation project support)
  {
    id: 'opp-4',
    type: 'graduation_project_support',
    titleEN: 'Graduation Project Mini Grant',
    titleAR: 'منحة مصغرة لمشاريع التخرج المبتكرة',
    titleKU: 'مینی گرانت بۆ پڕۆژەی دەرچوونی داهێنەرانە',
    contentEN: 'Education Bridge Program is funding 15 student graduation prototypes with mini-grants of up to $1,500 each. Focus areas include civic technology, energy efficiency, waste recycling, and health-tech.',
    contentAR: 'برنامج جسور التعليم يمول ١٥ نموذجاً أولياً لمشاريع تخرج طلابية بمنح مصغرة تصل إلى ١٥٠٠ دولار لكل مشروع. تشمل مجالات التركيز الحلول التقنية المدنية وكفاءة الطاقة وإعادة تدور النفايات وتكنولوجيا الصحة.',
    contentKU: 'بەرنامەی پردی پەروەردەیی پاڵپشتی دارایی پێشکەش بە ١٥ پرۆژەی دەرچوونی خوێندکاران دەکات بە بڕی ١,٥٠٠ دۆلار بۆ هەر پڕۆژەیەک. زیاتر بۆ بواری تەندروستی و وزەی پاکە.',
    author: {
      name: 'Education Bridge Program',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=150',
      verified: true
    },
    date: '1 day ago',
    likes: 124,
    commentsCount: 14,
    governorateId: 'baghdad',
    company: 'Education Bridge',
    companyLogo: '🌉',
    location: 'All Iraq (Remote Support)',
    deadline: 'August 1, 2026',
    opportunityCategory: 'Graduation project support',
    workplaceType: 'Remote',
    whoCanApply: 'Seniors with innovative software or engineering prototype designs',
    savedCount: 89,
    universityAppliedCount: 22,
    companyVerified: true,
    tags: ['GraduationSupport', 'Grants', 'Seniors', 'Engineering'],
    commentsList: []
  },

  // 5. OPP - Volunteer Media Team (Volunteering)
  {
    id: 'opp-5',
    type: 'volunteering',
    titleEN: 'Volunteer Media Team',
    titleAR: 'فريق الإعلام التطوعي لمهرجان السليمانية للمال والأعمال',
    titleKU: 'تیمی مادیای خۆبەخش بۆ فێستیڤاڵی سلێمانی',
    contentEN: 'Komar University Event division is recruiting a media squad of volunteer photographers, videographers, copywriters, and coordinator hosts to help manage our upcoming regional tech-fest campus gather.',
    contentAR: 'يقوم قسم الفعاليات في جامعة كومار بتعيين فريق إعلامي من مصورين ومعدي فيديوهات ومنسقين متطوعين للمساعدة في إدارة منتدى التكنولوجيا الإقليمي المقبل بالحرم الجامعي.',
    contentKU: 'بەشی کۆبوونەوەکانی کاکڵ زانکۆی کۆمار بەدوای تیمی خۆبەخشی میدیایدا دەگەڕێت وەک وێنەگر و ڤیدیۆگرافەر بۆ یارمەتیدانی بەڕێوەچوونی تەک فێستیڤاڵی داهاتوومان.',
    author: {
      name: 'Komar Tech Festival Team',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=150',
      verified: false
    },
    date: '2 days ago',
    likes: 38,
    commentsCount: 9,
    governorateId: 'sulaymaniyah',
    company: 'Komar University Event',
    companyLogo: '📸',
    location: 'Sulaymaniyah (On-site)',
    deadline: 'June 20, 2026',
    opportunityCategory: 'Volunteering',
    workplaceType: 'On-site',
    whoCanApply: 'Creative students interested in photography, reels recording, writing, and hosting',
    savedCount: 14,
    universityAppliedCount: 5,
    companyVerified: false,
    tags: ['Volunteering', 'KomarUni', 'Media', 'Sulaimani'],
    commentsList: []
  },

  // 6. OPP - Research Assistant Collaboration (Graduation project support)
  {
    id: 'opp-6',
    type: 'graduation_project_support',
    titleEN: 'Research Assistant Collaboration',
    titleAR: 'مساعد بحث علمي مشارك في المختبر البيئي',
    titleKU: 'یاریدەدەری توێژینەوەی زانستی لە تاقیگای ژینگەیی',
    contentEN: 'The Biology and Engineering department of the University of Mosul is recruiting 3 senior chemistry or chemical engineer assistants to collaborate on water quality filtration research in Nimrud district.',
    contentAR: 'يعلن قسم الأحياء والهندسة في جامعة الموصل عن فرصة لـ ٣ طلاب باحثين في الكيمياء أو الهندسة الكيميائية للمشاركة والتعاون في أبحاث تصفية وفحص جودة المياه في قضاء نمرود.',
    contentKU: 'بەشی ئەندازیاری و بایۆلۆجی زانکۆی مووسڵ داوای پاڵپشتی لێکۆڵینەوە دەکات بۆ ٣ خوێندکاری کیمیا یان ئەندازیاری کیمیایی بۆ هاوکاریکردن لە توێژینەوەی ئاوی ناوچەی نەمرود.',
    author: {
      name: 'UoM Environmental Research Lab',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=150',
      verified: true
    },
    date: '2 days ago',
    likes: 54,
    commentsCount: 4,
    governorateId: 'nineveh',
    universityId: 'u_mosul',
    company: 'University of Mosul',
    companyLogo: '🔬',
    location: 'Mosul (On-site)',
    deadline: 'June 24, 2026',
    opportunityCategory: 'Graduation project support',
    workplaceType: 'On-site',
    whoCanApply: 'Mosul chemistry, biology, or environmental engineering seniors',
    savedCount: 27,
    universityAppliedCount: 9,
    companyVerified: true,
    tags: ['Research', 'Mosul', 'WaterAudit', 'Seniors'],
    commentsList: []
  },

  // 7. OPP - Student IT Helpdesk (Part-time job)
  {
    id: 'opp-7',
    type: 'part_time_job',
    titleEN: 'Student IT Helpdesk Specialist',
    titleAR: 'أخصائي دعم فني للطلبة (دوام جزئي)',
    titleKU: 'پسپۆڕی بەشی یارمەتی پشتیوانی IT خوێندکاران (دەوامی کاتی)',
    contentEN: 'Zain Student Lounge in Baghdad has 2 open slots for tech-savvy undergraduates to assist students with network setups, portal login, device diagnostics and software issues on campus.',
    contentAR: 'يعلن صالون زين للطلبة في بغداد عن توفر وظيفتين شاغرتين لمساعدة الطلاب في إعدادات الشبكة، تسجيل الدخول للموقع، تشخيص مشكلات الأجهزة ونظم التشغيل.',
    contentKU: 'هۆڵی خوێندکارانی زین لە بەغداد دوو هەلی دەوامی کاتی بۆ خوێندکارانی ئارەزوومەنی کۆمپیوتەر هەیە بۆ هاوکاریکردنی خوێندکاران لە ڕێکخستنی ئینتەرنێت و کێشەی ئامێرەکان.',
    author: {
      name: 'Zain Iraq HR Division',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&q=80&w=150',
      verified: true
    },
    date: '3 days ago',
    likes: 92,
    commentsCount: 11,
    governorateId: 'baghdad',
    company: 'Zain Iraq',
    companyLogo: '📱',
    location: 'Baghdad (Zain Lounge)',
    deadline: 'June 28, 2026',
    opportunityCategory: 'Part-time job',
    workplaceType: 'On-site',
    whoCanApply: 'Students fluent in English & Arabic with core technology networking concepts',
    savedCount: 54,
    universityAppliedCount: 15,
    companyVerified: true,
    tags: ['PartTimeJobs', 'ZainLounge', 'TechSupport', 'Baghdad'],
    commentsList: []
  },

  // 8. OPP - National Cybersecurity CTF (Competition)
  {
    id: 'opp-8',
    type: 'competition',
    titleEN: 'National Cybersecurity Capture The Flag (CTF)',
    titleAR: 'المسابقة الوطنية لالتقاط العلم في الأمن السيبراني',
    titleKU: 'کێبڕکێی نیشتمانی هاککردن و پاراستنی زانیارییەکان (CTF)',
    contentEN: 'Test your hacking skills against the ultimate national challenge! A 24-hour virtual cybersecurity CTF contest open for all university teams in Iraq. Cash prizes of up to 4,000,000 IQD for top 3 teams.',
    contentAR: 'اختبر مهاراتك في فحص واكتشاف الثغرات في التحدي الوطني الأكبر! مسابقة سيبرانية مستمرة لـ ٢٤ ساعة مفتوحة لكافة فرق الطلاب العراقيين. جوائز مالية تبلغ ٤,٠٠٠,٠٠٠ دينار عراقي للمراكز الأولى.',
    contentKU: 'کارامەیی هاککردنی خۆت تاقی بکەرەوە لە گەورەترین پێشبڕکێی سیبرانی عێراق! کێبڕکێی ٢٤ کاتژمێری ئۆنڵاین بۆ هەموو زانکۆکان کە خەڵاتی ٤ ملیۆن دینار لەخۆ دەگرێت.',
    author: {
      name: 'Iraq Cyber Security Association',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&q=80&w=150',
      verified: true
    },
    date: '4 days ago',
    likes: 215,
    commentsCount: 38,
    governorateId: 'all',
    company: 'Iraq Cyber Security Assoc',
    companyLogo: '🛡️',
    location: 'Online (National)',
    deadline: 'July 5, 2026',
    opportunityCategory: 'Competition',
    workplaceType: 'Remote',
    whoCanApply: 'All enrolled undergraduate students in Iraq (Individual or Team of up to 4)',
    savedCount: 94,
    universityAppliedCount: 18,
    companyVerified: true,
    tags: ['Competition', 'Cybersecurity', 'Iraq', 'Hacking'],
    commentsList: []
  },

  // 9. OPP - Associate Business Analyst (Full-time graduate job)
  {
    id: 'opp-9',
    type: 'full_time_job',
    titleEN: 'Associate Business Analyst',
    titleAR: 'محلل أعمال مساعد للمبيعات الرقمية',
    titleKU: 'یاریدەدەری لێکۆڵەری بازرگانی دیجیتاڵی',
    contentEN: 'Asiacell is looking for entry-level Associate Business Analysts to join our digital pricing and research department in Sulaymaniyah or Baghdad. Excellent statistical, Excel, and modeling skills required.',
    contentAR: 'تبحث شركة آسيا سيل عن محللي أعمال بمستوى مبتدئ للانضمام إلى قطاع تسعير الخدمات الرقمية وأبحاث السوق في السليمانية أو بغداد. تتطلب الوظيفة مهارات إحصائية ممتازة وإتقان الإكسل ونمذجة البيانات.',
    contentKU: 'کۆمپانیای ئاسیاسێل دەیەوێت باشترین یاریدەدەری دۆزەرەوەی لێکدانەوەی داتا دابمەزرێنێت بۆ بەشی نرخاندن و ئۆپەراسیۆنەکانی مۆدێل لە سلێمانی یان بەغداد. پێویستە لە بەرنامەی Excel باش بن.',
    author: {
      name: 'Asiacell HR Division',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=150',
      verified: true
    },
    date: '5 days ago',
    likes: 145,
    commentsCount: 16,
    governorateId: 'sulaymaniyah',
    company: 'Asiacell',
    companyLogo: '🔴',
    location: 'Sulaymaniyah / Baghdad',
    deadline: 'July 8, 2026',
    opportunityCategory: 'Full-time graduate job',
    workplaceType: 'On-site',
    whoCanApply: 'Recent graduates (2024-2026) of Computer Science, Statistics, Mathematics or Business Analytics',
    savedCount: 76,
    universityAppliedCount: 11,
    companyVerified: true,
    tags: ['FullTimeJobs', 'Asiacell', 'BusinessAnalyst', 'FreshGrads'],
    commentsList: []
  },

  // 10. ANNOUNCEMENT (Official)
  {
    id: 'official-1',
    type: 'announcement',
    titleEN: 'Final Exams Timetable for Semester 2 Released',
    titleAR: 'نشر جدول الامتحانات النهائية للفصل الدراسي الثاني',
    titleKU: 'خشتەی تاقیکردنەوە کۆتاییەکانی وەرزی دووەم بڵاوکرایەوە',
    contentEN: 'The Presidency of the University has officially released the exam schedules. Exams will commence on Sunday, June 18, 2026. Please ensure all student clearance cards (Absence warnings in particular) are resolved by next week.',
    contentAR: 'أعلنت رئاسة الجامعة رسمياً عن جداول الامتحانات. ستبدأ الامتحانات يوم الأحد ١٨ حزيران ٢٠٢٦. يرجى التأكد من تسوية كافة بطاقات براءة الذمة (خاصة إنذارات الغيابات) قبل الأسبوع المقبل.',
    contentKU: 'سەرۆکایەتی زانکۆ بە فەرمی خشتەی تاقیکردنەوەکانی بڵاوکردەوە. تاقیکردنەوەکان ڕۆژی یەکشەممە ١٨ی حوزەیرانی ٢٠٢٦ دەستپێدەکەن. تکایە دڵنیابن لە چارەسەرکردنی سەرجەم کارتی پاکانەی خوێندکاران تا هەفتەی داهاتوو.',
    author: {
      name: 'UoB Registrar Office Office',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=150',
      verified: true
    },
    date: '3 hours ago',
    likes: 84,
    commentsCount: 15,
    universityId: 'u_baghdad',
    governorateId: 'baghdad',
    tags: ['Exams', 'Official', 'Admissions'],
    commentsList: [
      {
        id: 'c-1',
        authorName: 'Ahmad Al-Mansour',
        authorRole: 'student',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
        content: 'Is there any chance they get postponed to June 25? We still have three chapters left in Networks!',
        date: '2 hours ago'
      },
      {
        id: 'c-2',
        authorName: 'Dr. Layla Kareem',
        authorRole: 'teacher',
        authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100',
        content: 'No postponement is planned. Ahmad, we will cover the last network chapter this Tuesday. Be prepared!',
        date: '1 hour ago'
      }
    ]
  },
  
  // 2. VIDEO
  {
    id: 'video-1',
    type: 'video',
    titleEN: 'Vibe Check: Golden Hour at Sulaymaniyah Campus 🌅',
    titleAR: 'أجواء الساعة الذهبية في زانکۆی سلێمانی 🌅',
    titleKU: 'دیمەنی سەرسوڕهێنەری زانکۆی سلێمانی لە کاتی خۆئاوابووندا 🌅',
    contentEN: 'Just another beautiful afternoon sitting near the campus lake with friends, complaining about control system assignments!',
    contentAR: 'بعد ظهر يوم جميل آخر بالقرب من بحيرة الحرم الجامعي مع الأصدقاء، نشكو من واجبات مادة أنظمة التحكم!',
    contentKU: 'ئێوارەیەکی تری دڵڕفێن لە نزیک دەریاچەی زانکۆ لەگەڵ هاوڕێیان، گازندە دەکەین لە ئەرکی وانەی کۆنترۆڵ!',
    author: {
      name: 'Danyar Hawrami',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100',
      university: 'University of Sulaymaniyah'
    },
    date: '4 hours ago',
    likes: 312,
    commentsCount: 22,
    universityId: 'u_sulaymaniyah',
    governorateId: 'sulaymaniyah',
    videoThumbnail: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600',
    tags: ['CampusLife', 'Sulaimani', 'Sunset'],
    commentsList: [
      {
        id: 'cv-1',
        authorName: 'Soran Sherko',
        authorRole: 'student',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
        content: 'Campus looks amazing! Which phone did you use to film this?',
        date: '3 hours ago'
      }
    ]
  },

  // 3. JOB (Future)
  {
    id: 'job-1',
    type: 'job',
    titleEN: 'Junior Software Engineer (Full-Time)',
    titleAR: 'مهندس برمجيات مبتدئ (دوام كامل)',
    titleKU: 'ئەندازیاری نەرمەکاڵای جۆنیۆر (دەوامی تەواو)',
    contentEN: 'Zain Iraq is looking for a junior full-stake software developer to join our core digital tools division in Baghdad. Proficiency in React, JavaScript, or Flutter is preferred. Fresh graduates from Computer Engineering, Science, or IT programs are highly encouraged to apply!',
    contentAR: 'تبحث شركة زين العراق عن مطور برمجيات مبتدئ للانضمام إلى قسم الأدوات الرقمية في بغداد. يفضل إتقان React أو JavaScript أو Flutter. نشجع الخريجين الجدد من تخصصات هندسة الحاسوب أو علوم الحاسوب أو تقنية المعلومات على التقديم!',
    contentKU: 'کۆمپانیای زین عێراق بەدوای گەشەپێدەرێکی نەرمەکاڵای جۆنیۆردا دەگەڕێت بۆ بەشی ئامرازە دیجیتاڵییەکان لە بەغدا. شارەزایی لە React یان JavaScript یان Flutter باشترە. دەرچووانی نوێی ئەندازیاری یان زانستی کۆمپیوتەر هاندەدرێن پێشکەش بکەن!',
    author: {
      name: 'Zain Iraq HR Division',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&q=80&w=150',
      verified: true
    },
    date: '1 day ago',
    likes: 245,
    commentsCount: 19,
    governorateId: 'baghdad',
    company: 'Zain Iraq',
    companyLogo: '📱',
    salary: '1,200,000 - 1,500,000 IQD',
    location: 'Baghdad (HQ)',
    deadline: 'June 30, 2026',
    tags: ['Jobs', 'Software', 'Tech', 'FreshGrads'],
    commentsList: [
      {
        id: 'cj-1',
        authorName: 'Yassir Al-Kinani',
        authorRole: 'graduate',
        authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100',
        content: 'I did my summer internship with Zain last year, the team is fantastic. Highly recommend applying!',
        date: '18 hours ago'
      }
    ]
  },

  // 4. POLL (Life)
  {
    id: 'poll-1',
    type: 'poll',
    titleEN: 'Where is the absolute best study spot near Mosul University?',
    titleAR: 'أين هو أفضل مكان للمذاكرة والدراسة قرب جامعة الموصل؟',
    titleKU: 'باشترین شوێنی خوێندن لە نزیک زانکۆی مووسڵ لەکوێیە؟',
    contentEN: 'Exam season is intense. Where are we pulling our all-nighter group studies?',
    contentAR: 'موسم الامتحانات مكثف جداً. أين نقضي ليالي المذاكرة الجماعية؟',
    contentKU: 'وەرزی تاقیکردنەوەکان چڕە. لەکوێ شەونخونی دەکەین بۆ خوێندنی بەکۆمەڵ؟',
    author: {
      name: 'Sara Mosuli',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100'
    },
    date: '6 hours ago',
    likes: 120,
    commentsCount: 34,
    universityId: 'u_mosul',
    governorateId: 'nineveh',
    pollOptions: [
      { id: 'p1-1', textEN: 'The Central Library (Quiet but crowded)', textAR: 'المكتبة المركزية (هادئة لكن مزدحمة)', textKU: 'کتێبخانەی ناوەندی (بێدەنگ بەڵام قەرەباڵغ)', votes: 145 },
      { id: 'p1-2', textEN: 'Caprice Cafe (Incredible coffee, good Wi-Fi)', textAR: 'مقهى كابريس (قهوة مذهلة وإنترنت رائع)', textKU: 'کافێی کاپریس (قاوەی ناوازە و ئینتەرنێتی باش)', votes: 204 },
      { id: 'p1-3', textEN: 'Engineering College gardens (Best breeze)', textAR: 'حدائق كلية الهندسة (أفضل هواء نقي)', textKU: 'باخچەکانی کۆلێژی ئەندازیاری (باشترین هەوا)', votes: 98 },
      { id: 'p1-4', textEN: 'My room, under the split AC ❄️', textAR: 'غرفتي الشخصية، تحت السبلت ❄️', textKU: 'ژوورەکەی خۆم، لەژێر سپلیتەکەدا ❄️', votes: 412 }
    ],
    tags: ['Mosul', 'Poll', 'StudySpots'],
    commentsList: [
      {
        id: 'cp-1',
        authorName: 'Mustafa Al-Hadithi',
        authorRole: 'student',
        authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100',
        content: 'Nothing beats the Split AC in 45°C June weather, subhanAllah!',
        date: '5 hours ago'
      }
    ]
  },

  // 5. ANONYMOUS QUESTION (Ask)
  {
    id: 'ask-1',
    type: 'anonymous_question',
    titleEN: 'Urgent: How rigid is Salahaddin University attendance warning policy?',
    titleAR: 'عاجل: ما مدى صرامة سياسة إنذار غيابات جامعة صلاح الدين؟',
    titleKU: 'بەپەلە: سیاسەتی ئاگادارکردنەوەی نەهاتنی زانکۆی سەڵاحەدین تا چەند توندە؟',
    contentEN: 'I missed 8 hours of Control Systems because of a medical emergency and got a second warning (إنذار ثاني). Will I actually get excluded from taking the exam, or is there a petition form?',
    contentAR: 'تغيبت ٨ ساعات عن مادة أنظمة التحكم بسبب ظرف طبي طارئ واستلمت إنذاراً ثانياً. هل سيتم حرماني فعلياً من الامتحان أم هناك استمارة تقديم عذر طبي؟',
    contentKU: '٨ کاتژمێر لە وانەی سیستەمی کۆنترۆڵ نەهاتووم بەهۆی فریاکەوتنی پزیشکی و ئاگادارکردنەوەی دووەمم پێگەیشت. ئایا بە ڕاستی بێبەش دەکرێم لە تاقیکردنەوە یان فۆرمی داواکاری هەیە؟',
    author: {
      name: 'Anonymous Student',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
    },
    date: '2 hours ago',
    likes: 42,
    commentsCount: 9,
    universityId: 'u_salahaddin',
    governorateId: 'erbil',
    tags: ['Advising', 'Erbil', 'Anonymous'],
    commentsList: [
      {
        id: 'ca-1',
        authorName: 'Karwan Sleman',
        authorRole: 'student',
        authorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100',
        content: 'Go immediately to the Dean assistant for student affairs (معاون العميد لشؤون الطلبة). Since you have a medical report, they will help you drop the hours and convert it into excused.',
        date: '1 hour ago'
      },
      {
        id: 'ca-2',
        authorName: 'Dr. Hersh Ahmed',
        authorRole: 'teacher',
        authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100',
        content: 'Yes, Karwan is correct. Do not delay. Bring the original stomatologist/hospital report to your head of department by tomorrow morning.',
        date: '45 mins ago'
      }
    ]
  },

  // 6. SCHOLARSHIP (Future)
  {
    id: 'scholarship-1',
    type: 'scholarship',
    titleEN: 'Iraqi Youth Leadership Exchange Program (IYLEP) 2026',
    titleAR: 'برنامج تبادل القادة الشباب العراقيين (IYLEP) ٢٠٢٦',
    titleKU: 'بەرنامەی ئاڵوگۆڕی سەرکردە گەنجەکانی عێراق (IYLEP) ٢٠٢٦',
    contentEN: 'Applications are officially open for IYLEP 2026! This is a fully funded 4-week leadership program in the United States targeting undergraduate students in public and private universities across all governorates of Iraq. English proficiency is required.',
    contentAR: 'تم فتح باب التقديم رسمياً لبرنامج IYLEP ٢٠٢٦! هذا برنامج تدريبي ممول بالكامل لمدة ٤ أسابيع في الولايات المتحدة يستهدف طلاب البكالوريوس في الجامعات الحكومية والأهلية من جميع المحافظات العراقية. يشترط إتقان اللغة الإنجليزية.',
    contentKU: 'دەرگا بۆ پێشکەشکردنی داواکاری لە بەرنامەی IYLEP ٢٠٢٦ بە فەرمی کرایەوە!ئەمە بەرنامەیەکی سەرکردایەتی ٤ هەفتەیی پاڵپشتیکراوی داراییە لە ئەمریکا کە خوێندکارانی زانکۆ حکومی و ئەهلییەکان لە هەموو پارێزگاکانی عێراق دەکاتە ئامانج.',
    author: {
      name: 'US Embassy Baghdad Education Office',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&q=80&w=150',
      verified: true
    },
    date: '2 days ago',
    likes: 489,
    commentsCount: 61,
    company: 'US Embassy Baghdad',
    companyLogo: '🇺🇸',
    location: 'All Iraq',
    deadline: 'July 15, 2026',
    tags: ['Scholarships', 'Leadership', 'IYLEP', 'USA'],
    commentsList: [
      {
        id: 'cs-1',
        authorName: 'Amed Shwan',
        authorRole: 'graduate',
        authorAvatar: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=100',
        content: 'I was an IYLEP participant in 2024! It completely transformed my mind and perspective. Please feel free to hit me up if anyone needs help writing their personal essay!',
        date: '1 day ago'
      }
    ]
  },

  // 7. STORY (Life / Moments)
  {
    id: 'story-1',
    type: 'story',
    titleEN: 'Erbil Polytechnic graduation photoshoot backstage 🎓🎉',
    titleAR: 'كواليس جلسة تصوير تخرج المعهد التقني في أربيل 🎓🎉',
    titleKU: 'پشت دیمەنی وێنەگرتنی دەرچوونی پەیمانگای تەکنیکی هەولێر 🎓🎉',
    contentEN: 'We made it! After 4 years of labs, projects, and zero sleep, we are officially engineers! Check out some backstage craziness.',
    contentAR: 'لقد فعلناها! بعد ٤ سنوات من المختبرات والمشاريع وقلة النوم، أصبحنا مهندسين رسمياً! شاهدوا بعض الجنون من الكواليس.',
    contentKU: 'سەرکەوتین! دوای ٤ ساڵ لە تاقیگە و پڕۆژە و بێخەوی، بە فەرمی بووین بە ئەندازیار! سەیری هەندێک دیمەنی پشت کامێرا بکە.',
    author: {
      name: 'Renas Erbili',
      role: 'graduate',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100',
    },
    date: '12 hours ago',
    likes: 540,
    commentsCount: 45,
    governorateId: 'erbil',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800',
    tags: ['Graduation', 'Class2026', 'Erbil'],
    commentsList: []
  },

  // 8. EVENT (Calendar / Future / Life)
  {
    id: 'event-1',
    type: 'event',
    titleEN: 'Baghdad National Campus Hackathon 2026',
    titleAR: 'هاكاثون الجامعات الوطنية في بغداد ٢٠٢٦',
    titleKU: 'هاکاتۆنی نیشتمانی زانکۆکانی بەغدا ٢٠٢٦',
    contentEN: 'Organized by Al-Mustansiriya Computing Hub. A 48-hour challenge to prototype civic tech solutions for municipal problems in Baghdad (traffic, water management, recycling tracker). Over 5M IQD in cash prizes for winning teams!',
    contentAR: 'بتنظيم من ملتقى البرمجيات في الجامعة المستنصرية. تحدي لمدة ٤٨ ساعة لبناء حلول تقنية بلدية لمشاكل بغداد (المرور، إدارة المياه، تتبع التدوير). أكثر من ٥ ملايين دينار عراقي كجوائز نقدية للفرق الفائزة!',
    contentKU: 'لەلایەن کۆڕبەندی تەکنەلۆژیای موستەنسریە ڕێکخراوە. ئاستەنگێکی ٤٨ کاتژمێری بۆ دروستکردنی چارەسەری تەکنەلۆژی شارستانی بۆ کێشەکانی لە بەغدا (هاتوچۆ، نوێکردنەوەی ژینگە). زیاتر لە ٥ ملیۆن دینار خەڵات!',
    author: {
      name: 'Al-Mustansiriya Computing Hub',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=150',
      verified: true
    },
    date: '5 hours ago',
    likes: 198,
    commentsCount: 12,
    universityId: 'u_mustansiriya',
    governorateId: 'baghdad',
    eventDate: 'Friday, June 26, 2026',
    eventTime: '09:00 AM (48h duration)',
    eventVenue: 'Computing Lab Hall 4, Al-Mustansiriya University',
    imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=600',
    tags: ['Hackathon', 'Coding', 'Baghdad', 'Future'],
    commentsList: [
      {
        id: 'ce-1',
        authorName: 'Hussein Dev',
        authorRole: 'student',
        authorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=100',
        content: 'I need a UI Designer for my team! We are building a mobile routing system using Vite. Drop me a DM!',
        date: '4 hours ago'
      }
    ]
  },

  // 9. STUDY GROUP
  {
    id: 'group-1',
    type: 'study_group',
    titleEN: 'Deep Learning with PyTorch Study Circle',
    titleAR: 'حلقة دراسية لتعلم الآلة العميق باستخدام PyTorch',
    titleKU: 'بازنەی خوێندنی فێربوونی قووڵ لەگەڵ PyTorch',
    contentEN: 'We are a group of 3 seniors preparing our graduation project on AI-based tumor detection. We meet every Wednesday evening at AUIS library. Looking for 2 more intermediate python students to join.',
    contentAR: 'نحن ٣ طلاب في المرحلة الرابعة نقوم بمشروع تخرجنا حول كشف الأورام بالذكاء الاصطناعي. نلتقي كل أربعاء في مكتبة AUIS. نبحث عن طالبين آخرين بمستوى متوسط في بايثون للانضمام.',
    contentKU: 'ئێمە گروپێکی ٣ خوێندکاری قۆناغی چوارین پرۆژەی دەرچوونمان لەسەر دۆزینەوەی گرێی دەماریی بە زیرەکی دەستکرد دەکەین. هەموو چوارشەممەیەک لە کتێبخانەی AUIS کۆدەبینەوە.',
    author: {
      name: 'Hero Salihi',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100',
      university: 'American University of Iraq, Sulaimani'
    },
    date: 'Yesterday',
    likes: 34,
    commentsCount: 6,
    universityId: 'auis',
    governorateId: 'sulaymaniyah',
    subject: 'Deep Learning / Computer Vision',
    memberCount: 3,
    tags: ['StudyGroups', 'Python', 'AI'],
    commentsList: []
  },

  // 10. LOCAL SERVICE near campus
  {
    id: 'service-1',
    type: 'local_service',
    titleEN: 'Al-Mansour Copy & Bind Shop (Opposite Main Gate)',
    titleAR: 'مكتب المنصور للاستنساخ والتجليد (مقابل البوابة الرئيسية)',
    titleKU: 'نووسینگەی مەنسور بۆ کۆپیکردن و بەستنەوە (بەرامبەر دەروازەی سەرەکی)',
    contentEN: 'Best prices for student handouts, reference books, and graduation project hardcover leather binding. High speed laser printing directly from USB or drive. Located 20 meters from University of Baghdad gate 1.',
    contentAR: 'أفضل الأسعار لاستنساخ الملازم، الكتب المنهجية، وتجليد مشاريع التخرج بالجلد الفاخر. طباعة ليزرية سريعة جداً مباشرة من الفلاش أو الدرايف. يقع على بعد ٢٠ متراً من بوابة جامعة بغداد الأولى.',
    contentKU: 'باشترین نرخ بۆ کۆپیکردنی دەفتەری خوێندکاران و پەرتووکی سەرچاوە و بەرگی پێستی پڕۆژەی دەرچوون. چاپکردنی لەیزەری زۆر خێرا لە فلاشەوە. دەکەوێتە ٢٠ مەتر لە دەروازەی یەکەمی زانکۆی بەغدا.',
    author: {
      name: 'Abu Yasir (Manager)',
      role: 'staff',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=100'
    },
    date: '3 days ago',
    likes: 45,
    commentsCount: 8,
    universityId: 'u_baghdad',
    governorateId: 'baghdad',
    serviceCategory: 'photocopy',
    serviceRating: 4.8,
    serviceDistance: '20m from main gate',
    tags: ['CampusServices', 'Photocopy', 'Binding'],
    commentsList: []
  }
];

/*
  Official Campus Life neon poster posts only.
  Fake student/social demo users were deleted.
  No Lina, no Saif, no fake student cards.
*/

export type CampusLifeMockPost = any;
export type CampusLifePost = any;
export type CampusPost = any;
export type OfficialCampusLifePost = any;

const officialNeonCampusPosts: any[] = [
  {
    id: "official-campus-neon-001",
    type: "campus_life",
    category: "campus-life",
    source: "official-neon-campus-poster",
    isOfficial: true,
    isDemo: false,
    official: true,

    author: "Jamiaati / StudentHUB",
    authorName: "Jamiaati / StudentHUB",
    authorRole: "Official Campus Life update",
    avatarLabel: "J",
    handle: "@jamiaati",

    title: "Campus Moment 🌟",
    titleEN: "Campus Moment 🌟",
    titleAR: "لحظة من الحرم الجامعي 🌟",
    titleKU: "ساتێکی کەمپەس 🌟",

    tag: "Campus Life",
    moodTag: "Campus Moment",
    headline: "Your campus life, your voice, your Iraq.",
    headlineEN: "Your campus life, your voice, your Iraq.",
    headlineAR: "حياتك الجامعية، صوتك، وعراقك.",
    headlineKU: "ژیانی زانکۆیی تۆ، دەنگی تۆ، عێراقی تۆ.",

    content: "Share campus moments, student activities, university updates, questions, and stories from universities across Iraq.",
    body: "Share campus moments, student activities, university updates, questions, and stories from universities across Iraq.",
    description: "A neon purple Campus Life poster for connecting students across Iraq.",

    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200",
    coverImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200",
    imageAlt: "Students walking on a university campus",

    governorate: "All Iraq",
    city: "Iraq",
    university: "All universities",
    cta: "Share your campus moment",
    likes: 128,
    commentsCount: 18,
    shares: 7,
    createdAt: new Date().toISOString(),

    color: "from-purple-600 via-fuchsia-600 to-cyan-500",
    gradient: "from-purple-600 via-fuchsia-600 to-cyan-500",
    tagColor: "bg-purple-600 text-white"
  },
  {
    id: "official-campus-neon-002",
    type: "campus_life",
    category: "campus-life",
    source: "official-neon-campus-poster",
    isOfficial: true,
    isDemo: false,
    official: true,

    author: "Jamiaati / StudentHUB",
    authorName: "Jamiaati / StudentHUB",
    authorRole: "Official student connection post",
    avatarLabel: "J",
    handle: "@jamiaati",

    title: "Connect Across Iraq",
    titleEN: "Connect Across Iraq",
    titleAR: "تواصل مع الطلبة في كل العراق",
    titleKU: "پەیوەندی بکە بە قوتابیان لە هەموو عێراق",

    tag: "Student Network",
    moodTag: "Student Network",
    headline: "Find what is happening in universities across Iraq.",
    headlineEN: "Find what is happening in universities across Iraq.",
    headlineAR: "اكتشف ما يحدث في جامعات العراق.",
    headlineKU: "بزانە لە زانکۆکانی عێراق چی ڕوودەدات.",

    content: "Campus Life helps students and teachers discover activities, updates, questions, and opportunities in one connected space.",
    body: "Campus Life helps students and teachers discover activities, updates, questions, and opportunities in one connected space.",
    description: "Official neon purple StudentHUB campus connection poster.",

    imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1200",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1200",
    coverImage: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1200",
    imageAlt: "Students collaborating together",

    governorate: "All Iraq",
    city: "Iraq",
    university: "All universities",
    cta: "Explore Campus Life",
    likes: 96,
    commentsCount: 12,
    shares: 5,
    createdAt: new Date().toISOString(),

    color: "from-indigo-600 via-purple-600 to-pink-500",
    gradient: "from-indigo-600 via-purple-600 to-pink-500",
    tagColor: "bg-fuchsia-600 text-white"
  },
  {
    id: "official-campus-neon-003",
    type: "campus_life",
    category: "campus-life",
    source: "official-neon-campus-poster",
    isOfficial: true,
    isDemo: false,
    official: true,

    author: "Jamiaati / StudentHUB",
    authorName: "Jamiaati / StudentHUB",
    authorRole: "Official opportunity bridge",
    avatarLabel: "J",
    handle: "@jamiaati",

    title: "From Campus to Opportunity",
    titleEN: "From Campus to Opportunity",
    titleAR: "من الحرم الجامعي إلى الفرص",
    titleKU: "لە کەمپەسەوە بۆ دەرفەتەکان",

    tag: "Campus + Opportunities",
    moodTag: "Campus + Career",
    headline: "Jobs, scholarships, events, and student updates in one place.",
    headlineEN: "Jobs, scholarships, events, and student updates in one place.",
    headlineAR: "وظائف، منح، فعاليات، وتحديثات طلابية في مكان واحد.",
    headlineKU: "کار، بورسیە، چالاکی و نوێکاری قوتابیان لە یەک شوێندا.",

    content: "Jamiaati connects university life with real academic and career opportunities across all governorates of Iraq.",
    body: "Jamiaati connects university life with real academic and career opportunities across all governorates of Iraq.",
    description: "Official neon purple opportunity poster for Campus Life.",

    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200",
    coverImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200",
    imageAlt: "Students studying and planning together",

    governorate: "All Iraq",
    city: "Iraq",
    university: "All universities",
    cta: "Discover opportunities",
    likes: 143,
    commentsCount: 21,
    shares: 11,
    createdAt: new Date().toISOString(),

    color: "from-violet-700 via-purple-600 to-blue-500",
    gradient: "from-violet-700 via-purple-600 to-blue-500",
    tagColor: "bg-indigo-600 text-white"
  }
];

export { officialNeonCampusPosts };

export const campusLifeMockPosts = officialNeonCampusPosts;
export const campusLifeFeedItems = officialNeonCampusPosts;
export const officialCampusLifePosts = officialNeonCampusPosts;
export const mockCampusLifePosts = officialNeonCampusPosts;
export const campusLifePosts = officialNeonCampusPosts;

export function getCampusLifeMockPosts() {
  return officialNeonCampusPosts;
}

export function generateCampusLifeMockPosts() {
  return officialNeonCampusPosts;
}

export function getCampusLifePosts() {
  return officialNeonCampusPosts;
}

export default officialNeonCampusPosts;

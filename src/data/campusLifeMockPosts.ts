const campusLifeDesignImages = [
  '/designs/campus-life/campus-life-01.png',
  '/designs/campus-life/campus-life-02.png',
  '/designs/campus-life/campus-life-03.png',
  '/designs/campus-life/campus-life-04.png',
  '/designs/campus-life/campus-life-05.png',
  '/designs/campus-life/campus-life-06.png',
  '/designs/campus-life/campus-life-07.png',
  '/designs/campus-life/campus-life-08.png',
  '/designs/campus-life/campus-life-09.png',
  '/designs/campus-life/campus-life-10.jpg',
  '/designs/campus-life/campus-life-11.png',
  '/designs/campus-life/campus-life-12.png',
  '/designs/campus-life/campus-life-13.png',
  '/designs/campus-life/campus-life-14.png',
  '/designs/campus-life/campus-life-15.png',
  '/designs/campus-life/campus-life-16.png',
  '/designs/campus-life/campus-life-17.png',
  '/designs/campus-life/campus-life-18.png',
];

const campusLifeTexts = [
  {
    title: 'Campus Life across Iraq',
    body: 'See what is happening in universities across Iraq — student moments, campus updates, events, questions, and community life.',
    titleAr: 'حياة جامعية من كل العراق',
    bodyAr: 'شاهد ما يحدث في جامعات العراق — لحظات الطلبة، تحديثات الحرم الجامعي، الفعاليات، الأسئلة، والحياة الطلابية.',
    titleKu: 'ژیانی کەمپەس لە سەرانسەری عێراق',
    bodyKu: 'ببینە لە زانکۆکانی عێراق چی ڕوو دەدات — ساتەکانی قوتابیان، نوێکارییەکان، چالاکییەکان و ژیانی زانکۆ.',
  },
  {
    title: 'Find your university community',
    body: 'Connect with students and academic people from Baghdad, Erbil, Sulaymaniyah, Basra, Mosul, Najaf, and all governorates.',
    titleAr: 'اكتشف مجتمع جامعتك',
    bodyAr: 'تواصل مع الطلبة والأكاديميين من بغداد، أربيل، السليمانية، البصرة، الموصل، النجف، وكل المحافظات.',
    titleKu: 'کۆمەڵگەی زانکۆکەت بدۆزەرەوە',
    bodyKu: 'پەیوەندی بکە بە قوتابیان و ئەکادیمییەکان لە بەغدا، هەولێر، سلێمانی، بەسرە، مووسڵ، نەجەف و هەموو پارێزگاکان.',
  },
  {
    title: 'Share campus updates',
    body: 'Post announcements, student events, study-life moments, questions, and useful university news in one modern place.',
    titleAr: 'شارك تحديثات الحرم الجامعي',
    bodyAr: 'انشر الإعلانات، الفعاليات الطلابية، لحظات الدراسة، الأسئلة، وأخبار الجامعة المفيدة في مكان واحد.',
    titleKu: 'نوێکارییەکانی کەمپەس بڵاو بکەرەوە',
    bodyKu: 'ئاگاداری، چالاکیی قوتابیان، ساتەکانی خوێندن، پرسیار و هەواڵی بەسوودی زانکۆ لە یەک شوێن بڵاو بکەرەوە.',
  },
];

export const campusLifeFeedItems = campusLifeDesignImages.map((imageUrl, index) => {
  const text = campusLifeTexts[index % campusLifeTexts.length];
  const number = index + 1;

  return {
    id: `campus-life-design-${String(number).padStart(2, '0')}`,
    type: 'post',
    category: 'campus-life',
    source: 'Talaba-campus-life',
    featured: number <= 6,
    layout: 'rectangle-hero',
    cardStyle: 'hero',
    title: text.title,
    body: text.body,
    content: text.body,
    titleAr: text.titleAr,
    bodyAr: text.bodyAr,
    titleKu: text.titleKu,
    bodyKu: text.bodyKu,
    imageUrl,
    image_url: imageUrl,
    storyImage: imageUrl,
    imageAlt: `Campus Life rectangle hero design ${number}`,
    authorName: 'Talaba Team',
    authorRole: 'Campus Life',
    universityName: 'Universities of Iraq',
    governorateName: 'Iraq',
    moodTag: number <= 6 ? 'Featured Campus Life' : 'Campus Life',
    likes: 120 + number * 7,
    comments: 12 + number,
    shares: 5 + number,
    createdAt: new Date(Date.now() - number * 3600 * 1000).toISOString(),
    timeAgo: `${number}h`,
    tags: ['Campus Life', 'Talaba', 'StudentHUB'],
  };
});

export const campusLifeMockPosts = campusLifeFeedItems;
export const emptyCampusLifePosts = campusLifeFeedItems;

export function getCampusLifeMockPosts() {
  return campusLifeFeedItems;
}

export function generateCampusLifeMockPosts() {
  return campusLifeFeedItems;
}

export default campusLifeFeedItems;


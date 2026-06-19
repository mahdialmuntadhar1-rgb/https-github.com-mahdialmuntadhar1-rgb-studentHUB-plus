import type { FeedItem, Language } from "../types";

export type CampusLifePost = {
  id: string;
  studentName: string;
  universityOrCampus: string;
  governorate: string;
  category: string;
  text: string;
  suggestedVisual: string;
  likes: number;
  commentsCount: number;
  shares: number;
  comments: string[];
  cta: string;
  moodTag: string;
  imageUrl: string;
  imageAlt: string;
  visualTheme: string;
  profile: {
    id: string;
    username: string;
    major: string;
    studentYear: string;
    bio: string;
  };
  isMock: true;
};

type Seed = readonly [
  studentName: string,
  universityOrCampus: string,
  governorate: string,
  category: string,
  text: string,
  imageUrl: string,
  imageAlt: string,
  cta: string,
  moodTag: string
];

const avatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=70&w=240",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=70&w=240",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=70&w=240",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=70&w=240",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=70&w=240",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=70&w=240"
];

const majors = [
  "Computer Science",
  "Medicine",
  "Civil Engineering",
  "Law",
  "Business Administration",
  "Pharmacy",
  "Architecture",
  "English Translation",
  "Media",
  "Accounting"
];

const studentYears = [
  "First year",
  "Second year",
  "Third year",
  "Fourth year",
  "Final year",
  "Graduate"
];

const bios = [
  "Sharing daily campus moments, study tips, and small wins.",
  "Coffee, lectures, friends, projects, and everything in between.",
  "Looking for study groups and real student connections across Iraq.",
  "I post campus life moments without making it too formal.",
  "Here to meet students from my university and other cities.",
  "Trying to survive deadlines with good friends and better coffee."
];

const commentPacks = [
  ["Sara: same feeling 😭", "Ali: who has the notes?", "Noor: saved this for later"],
  ["Ranya: campus mood 😂", "Hozan: coffee first then lecture", "Dlin: I want to join next time"],
  ["Mustafa: this is our life exactly", "Zahraa: the picture feels real", "Haidar: team last row ✋"],
  ["Aso: زۆر جوانە", "Aveen: لە کوێیە؟", "Rebin: reposting this ✅"],
  ["Mariam: نريد الجزء الثاني", "Sajad: تقييم صادق جداً", "Ruba: نجربها باچر"],
  ["Yara: the struggle is real", "Omar: after coffee I can answer", "Shahd: send the location in the group"]
];

const seeds: readonly Seed[] = [
  ["Lina Al-Baghdadi", "Dijla Private Campus", "Baghdad", "Campus vibe", "8 AM lecture in Baghdad: half my face is awake, the other half is still looking for coffee ☕ Who else?", "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=70&w=1000", "Students walking together on campus", "Morning lecture or coffee first?", "Baghdad morning lecture vibe"],
  ["Saif Al-Mansour", "Jusoor College Baghdad", "Baghdad", "Campus question", "Are you from my university? If you know the book statue near the gate, prove you exist 👀", "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&q=70&w=1000", "Students near a university building", "Write your major and year", "Are you from my university?"],
  ["Shahd Al-Karrada", "New Rafidain Academy", "Baghdad", "Study humor", "One lecture, three coffees… and attendance still wants a smile 😭", "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=70&w=1000", "Laptop, coffee, and study notes", "How many coffees do you need?", "One lecture, three coffees"],
  ["Muntadhar Al-Adhamiya", "Al-Nakheel University Campus", "Baghdad", "Campus navigation", "Third week and I still ask: where is Building B? The campus map has personal problems with me.", "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=70&w=1000", "Students studying in a modern campus space", "Draw the shortest route to Building B", "Lost on campus jokes"],
  ["Ruba Al-Kadhimiya", "Baghdad Gate Institute", "Baghdad", "Study playlist", "Baghdad traffic needs a playlist before it needs a solution 😅 What song gets you to university?", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=70&w=1000", "Headphones and student bag", "Add a song in the comments", "Study playlist recommendations"],

  ["Hawraa Al-Ashar", "Shatt Al-Arab Technical College", "Basra", "Engineering life", "Engineering students in Basra know this equation: heat + helmet + deadline = character development 🔧", "https://images.unsplash.com/photo-1581091870622-3c7a4f3f7f75?auto=format&fit=crop&q=70&w=1000", "Engineering students working together", "Mention your project partner", "Basra engineering students"],
  ["Jasim Abu Al-Khaseeb", "Al-Marsa Science Campus", "Basra", "Cafeteria", "Cafeteria sandwich rating: 7/10. It becomes 9/10 if the quiz is cancelled 😂", "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=70&w=1000", "Student lunch and cafeteria moment", "Rate today's lunch from 10", "Cafeteria food rating"],
  ["Mai Al-Basriya", "Al-Faw Student Academy", "Basra", "Transport", "Who comes from Al-Ashar side? We need a campus commute survival club 🚌", "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=70&w=1000", "Students commuting together", "Find students from your route", "Campus commute club"],

  ["Aveen Hawleri", "Erbil Polytechnic Campus", "Erbil", "Campus life", "لە هەولێر، پشووەکانی نێوان وانەکان باشترین کاتە بۆ ناسینی هاوڕێی نوێ.", "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=70&w=1000", "Friends sitting outside on campus", "هاوڕێکەت تاگ بکە", "Erbil campus friends"],
  ["Kardo Soran", "Hawler Medical Campus", "Erbil", "Medicine", "Medical students: we do not sleep, we just close our eyes between chapters.", "https://images.unsplash.com/photo-1576765607924-ef26b4df2e2f?auto=format&fit=crop&q=70&w=1000", "Medical students studying together", "Who is in the library today?", "Medical study night"],
  ["Shene Qalat", "Cihan University Erbil", "Erbil", "Student discovery", "ئەگەر لە هەمان زانکۆی، کۆمێنت بکە. با یەکتر بناسین.", "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=70&w=1000", "Group of university students socializing", "ناوی بەشەکەت بنووسە", "Find students nearby"],

  ["Sara Suli", "University of Sulaimani", "Sulaymaniyah", "Study group", "سلێمانی + قاوە + گروپی خوێندن = ئەگەری سەرکەوتن بەرزترە ☕", "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=70&w=1000", "Students studying at a cafe table", "کێ دێت بۆ study group؟", "Suli study group"],
  ["Alan Bakrajo", "Komar University", "Sulaymaniyah", "Project life", "Presentation tomorrow. Confidence level: design is ready, speech is still buffering.", "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=70&w=1000", "Students preparing a presentation", "Drop one presentation tip", "Presentation night"],
  ["Lavin Chamchamal", "American University of Iraq Sulaimani", "Sulaymaniyah", "Campus photo", "Campus looks different when the light is right. Small moment, good energy.", "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?auto=format&fit=crop&q=70&w=1000", "Beautiful university campus walkway", "Share your campus photo", "Campus golden hour"],

  ["Diyar Duhoki", "Duhok University Campus", "Duhok", "Friends", "دەهوک today: one quick break turned into a full student meeting.", "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&q=70&w=1000", "Students laughing together outdoors", "Who is free after class?", "Duhok campus break"],
  ["Mina Zakho", "Zakho Technical Institute", "Duhok", "Question", "Who knows a quiet place to study near the campus? Not too quiet, not too noisy, just perfect.", "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=70&w=1000", "Quiet library study place", "Recommend a study corner", "Quiet study place"],

  ["Hassan Mosuli", "University of Mosul", "Nineveh/Mosul", "Architecture", "When the model finally stands by itself, you feel like you built a city.", "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=70&w=1000", "Architecture students working with models", "Show your project progress", "Architecture studio life"],
  ["Rana Al-Noor", "Mosul Medical College", "Nineveh/Mosul", "Exam mood", "The exam did not ask from the book. It asked from our patience.", "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=70&w=1000", "Student writing notes before exam", "Send notes please", "Exam week mood"],

  ["Zainab Najafi", "Najaf Academic Campus", "Najaf", "Campus moment", "Between lectures, one good conversation can change the whole day.", "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=70&w=1000", "Students talking on campus", "Who did you meet today?", "Campus conversation"],
  ["Ali Karbalaei", "Karbala Technical College", "Karbala", "Workshop", "Today’s workshop was actually useful. Rare moment, we must document it.", "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=70&w=1000", "Students in a workshop or lab", "Tag someone who should join", "Useful workshop"],
  ["Noor Kirkuki", "Kirkuk University", "Kirkuk", "Student tip", "Tip for first-year students: ask. Everyone was lost at the beginning.", "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&q=70&w=1000", "Students helping each other study", "Ask your question here", "First year survival tip"],
  ["Yousif Diwaniya", "Qadisiyah University", "Qadisiyah", "Campus event", "Student event today felt alive. More of this please.", "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=70&w=1000", "Students at a campus event", "Share your event photos", "Campus event energy"],
  ["Hana Halabja", "Halabja University", "Halabja", "Nature break", "هەڵەبجە لە نێوان وانەکاندا ئارامییەکی تایبەتی هەیە.", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=70&w=1000", "Outdoor green campus break", "وێنەی کەمپەسەکەت بنێرە", "Peaceful campus break"],
  ["Farah Babil", "Babil University", "Babil", "Group study", "Group study rule: one explains, two listen, one opens snacks.", "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=70&w=1000", "Students doing group study", "Who brings snacks?", "Group study reality"]
];

const governorateIds: Record<string, string> = {
  Baghdad: "baghdad",
  Basra: "basra",
  "Nineveh/Mosul": "nineveh",
  Erbil: "erbil",
  Sulaymaniyah: "sulaymaniyah",
  Duhok: "duhok",
  Kirkuk: "kirkuk",
  Najaf: "najaf",
  Karbala: "karbala",
  Babil: "babil",
  Wasit: "wasit",
  Diyala: "diyala",
  Anbar: "anbar",
  "Salah al-Din": "salah_al_din",
  Maysan: "maysan",
  "Dhi Qar": "dhi_qar",
  Muthanna: "muthanna",
  Qadisiyah: "al_qadisiyah",
  Halabja: "halabja"
};

const detectLanguage = (text: string): Language => {
  if (/[ەێۆڕڵڤپچژگک]/.test(text)) return "ku";
  if (/[\u0600-\u06FF]/.test(text)) return "ar";
  return "en";
};

const metricFor = (index: number) => ({
  likes: 28 + ((index * 17) % 156),
  commentsCount: 3 + ((index * 7) % 22),
  shares: 2 + ((index * 5) % 18)
});

export const campusLifeMockPosts: CampusLifePost[] = seeds.map((seed, index) => {
  const [studentName, universityOrCampus, governorate, category, text, imageUrl, imageAlt, cta, moodTag] = seed;
  const metrics = metricFor(index + 1);
  const comments = [...commentPacks[index % commentPacks.length]];

  return {
    id: `campus-life-mock-${String(index + 1).padStart(3, "0")}`,
    studentName,
    universityOrCampus,
    governorate,
    category,
    text,
    suggestedVisual: imageAlt,
    ...metrics,
    commentsCount: Math.max(metrics.commentsCount, comments.length),
    comments,
    cta,
    moodTag,
    imageUrl,
    imageAlt,
    visualTheme: `${category} · ${moodTag}`,
    profile: {
      id: `demo-student-${String(index + 1).padStart(3, "0")}`,
      username: `campus.demo.${String(index + 1).padStart(3, "0")}`,
      major: majors[index % majors.length],
      studentYear: studentYears[(index * 2) % studentYears.length],
      bio: bios[(index * 3) % bios.length]
    },
    isMock: true
  };
});

export const campusLifeFeedItems: FeedItem[] = campusLifeMockPosts.map((post, postIndex) => {
  const originalLanguage = detectLanguage(post.text);

  const commentsList = post.comments.map((comment, commentIndex) => {
    const separatorIndex = comment.indexOf(":");
    const authorName = separatorIndex >= 0 ? comment.slice(0, separatorIndex).trim() : "Student";
    const content = separatorIndex >= 0 ? comment.slice(separatorIndex + 1).trim() : comment;

    return {
      id: `${post.id}-comment-${commentIndex + 1}`,
      authorName,
      authorRole: "student" as const,
      authorAvatar: avatars[commentIndex % avatars.length],
      content,
      date: `${commentIndex + 1}h`,
      likes: (postIndex * 3 + commentIndex * 2) % 12,
      original_language: detectLanguage(content),
      content_original: content
    };
  });

  return {
    id: post.id,
    type: "campus_life",
    titleEN: post.moodTag,
    titleAR: post.moodTag,
    titleKU: post.moodTag,
    contentEN: post.text,
    contentAR: post.text,
    contentKU: post.text,
    original_language: originalLanguage,
    title_original: post.moodTag,
    body_original: post.text,
    author: {
      id: post.profile.id,
      username: post.profile.username,
      name: post.studentName,
      role: "student",
      avatar: avatars[postIndex % avatars.length],
      university: post.universityOrCampus,
      governorate: post.governorate,
      major: post.profile.major,
      studentYear: post.profile.studentYear,
      bio: post.profile.bio,
      isMockProfile: true
    },
    date: `${1 + (postIndex % 11)}h`,
    likes: post.likes,
    commentsCount: post.commentsCount,
    commentsList,
    shares: post.shares,
    governorateId: governorateIds[post.governorate] || "all",
    universityId: "all",
    location: post.governorate,
    imageUrl: post.imageUrl,
    imageAlt: post.imageAlt,
    category: "post",
    sourceType: "student_tip",
    tags: [post.category, post.moodTag, post.governorate],
    suggestedVisual: post.suggestedVisual,
    cta: post.cta,
    moodTag: post.moodTag,
    visualTheme: post.visualTheme,
    isMock: true
  } as FeedItem;
});

// Seed script for Rafid (StudentHUB-plus) D1 database
// Run with: npx tsx seed.ts

interface Profile {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  governorate: string;
  institution: string;
  institution_id: string;
  stage: string;
  interests: string;
  bio: string;
  avatar_url: string;
  role: string;
}

interface Post {
  id: string;
  author_id: string;
  type: string;
  title: string | null;
  content: string;
  image_url: string | null;
  governorate: string;
  institution: string;
  institution_id: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  is_verified: number;
  metadata: string;
  created_at: string;
}

interface Opportunity {
  id: string;
  title: string;
  type: string;
  institution_name: string;
  institution_logo: string | null;
  governorate: string;
  city: string | null;
  deadline: string | null;
  tags: string;
  created_at: string;
}

const GOVERNORATES = [
  'بغداد', 'البصرة', 'أربيل', 'السليمانية', 'دهوك',
  'النجف', 'كربلاء', 'الموصل', 'كركوك', 'ديالى',
  'الأنبار', 'بابل', 'واسط', 'المثنى', 'ذي قار',
  'ميسان', 'صلاح الدين', 'القادسية', 'حلبجة'
];

const INSTITUTIONS = [
  { id: 'uob', name: 'جامعة بغداد', governorate: 'بغداد' },
  { id: 'uobas', name: 'جامعة البصرة', governorate: 'البصرة' },
  { id: 'uosul', name: 'جامعة السليمانية', governorate: 'السليمانية' },
  { id: 'uom', name: 'جامعة الموصل', governorate: 'الموصل' },
  { id: 'uok', name: 'جامعة كربلاء', governorate: 'كربلاء' },
  { id: 'uon', name: 'جامعة النجف', governorate: 'النجف' },
  { id: 'uobab', name: 'جامعة بابل', governorate: 'بابل' },
  { id: 'uod', name: 'جامعة ديالى', governorate: 'ديالى' },
  { id: 'uomus', name: 'جامعة ميسان', governorate: 'ميسان' },
  { id: 'uow', name: 'جامعة واسط', governorate: 'واسط' },
];

const POST_TYPES = ['student', 'announcement', 'urgent', 'opportunity', 'event', 'insight'];
const STAGES = ['السنة الأولى', 'السنة الثانية', 'السنة الثالثة', 'السنة الرابعة', 'الخريجين'];
const ROLES = ['student', 'admin'];

const ARABIC_NAMES = [
  'أحمد محمد', 'فاطمة علي', 'حسين حسن', 'زينب كريم', 'عمر عبدالله',
  'مريم يوسف', 'علي جاسم', 'سارة محمود', 'كريم حسين', 'نور السعد',
];

const ARABIC_BIOS = [
  'طالب في السنة الثالثة، مهتم بالتكنولوجيا والبرمجة',
  'خريج هندسة، أبحث عن فرص عمل في مجالي',
  'أحب القراءة والتعلم المستمر',
  'مهتم بالتطوع والمشاركة في الأنشطة الطلابية',
  'طموح لبناء مستقبل أفضل للعراق',
];

const ARABIC_POSTS = [
  'هل هناك أحد مهتم بالمشاركة في ورشة عمل الذكاء الاصطناعي؟',
  'أعلنت الجامعة عن منح دراسية للطلاب المتفوقين',
  'هل يعرف أحد موعد امتحانات منتصف الفصل؟',
  'شاركت اليوم في فعالية تطوعية رائعة',
  'أبحث عن زميل للمذاكرة في مادة الرياضيات',
  'المناهج الجديدة تبدو صعبة لكنها مفيدة',
  'هل يوجد مكتبة مفتوحة في عطلة نهاية الأسبوع؟',
  'تم قبولي في برنامج التدريب الصيفي',
  'نصيحة: ابدأ التحضير للامتحانات مبكراً',
  'شكراً للدكتور على الشرح الممتاز',
];

const ENGLISH_POSTS = [
  'Looking for study partners for the upcoming finals',
  'Just got accepted into the summer internship program!',
  'Does anyone know the schedule for next week?',
  'The new campus cafeteria has great food options',
  'Excited about the upcoming tech conference',
  'Need help with the programming assignment',
  'Library hours extended during exam week',
  'Great workshop on career development today',
  'Reminder: Assignment due tomorrow at midnight',
  'Sharing my notes from today\'s lecture',
];

const OPPORTUNITY_TITLES = [
  'فرصة تدريب في شركة تقنية رائدة',
  'منحة دراسية كاملة للدراسات العليا',
  'وظيفة شاغرة: مهندس برمجيات',
  'برنامج تطوير المهارات القيادية',
  'فرصة عمل في البنك المركزي',
  'تدريب صيفي في وزارة التكنولوجيا',
  'منحة لدراسة اللغة الإنجليزية',
  'وظيفة محاسب في شركة استشارية',
  'برنامج ريادة الأعمال للشباب',
  'فرصة تدريبية في المستشفى الجامعي',
];

const OPPORTUNITY_TYPES = ['job', 'internship', 'scholarship', 'training'];

function generateId(): string {
  return crypto.randomUUID();
}

function generateProfiles(count: number): Profile[] {
  const profiles: Profile[] = [];
  for (let i = 0; i < count; i++) {
    const institution = INSTITUTIONS[i % INSTITUTIONS.length];
    const governorate = institution.governorate;
    profiles.push({
      id: generateId(),
      email: `user${i + 1}@rafid.iq`,
      password_hash: 'hashed_password_' + i,
      full_name: ARABIC_NAMES[i % ARABIC_NAMES.length],
      governorate,
      institution: institution.name,
      institution_id: institution.id,
      stage: STAGES[i % STAGES.length],
      interests: JSON.stringify(['technology', 'science', 'arts']),
      bio: ARABIC_BIOS[i % ARABIC_BIOS.length],
      avatar_url: `https://picsum.photos/seed/${i}/200/200`,
      role: ROLES[i % ROLES.length],
    });
  }
  return profiles;
}

function generatePosts(profiles: Profile[], count: number): Post[] {
  const posts: Post[] = [];
  for (let i = 0; i < count; i++) {
    const author = profiles[i % profiles.length];
    const isArabic = i % 2 === 0;
    const content = isArabic
      ? ARABIC_POSTS[i % ARABIC_POSTS.length]
      : ENGLISH_POSTS[i % ENGLISH_POSTS.length];
    const type = POST_TYPES[i % POST_TYPES.length];
    const hasImage = i % 3 === 0;

    posts.push({
      id: generateId(),
      author_id: author.id,
      type,
      title: type === 'announcement' || type === 'urgent' ? (isArabic ? 'إعلان هام' : 'Important Announcement') : null,
      content,
      image_url: hasImage ? `https://picsum.photos/seed/${i}/800/600` : null,
      governorate: author.governorate,
      institution: author.institution,
      institution_id: author.institution_id,
      likes_count: Math.floor(Math.random() * 100),
      comments_count: Math.floor(Math.random() * 20),
      views_count: Math.floor(Math.random() * 500),
      is_verified: i % 5 === 0 ? 1 : 0,
      metadata: JSON.stringify({ language: isArabic ? 'ar' : 'en' }),
      created_at: new Date(Date.now() - i * 3600000).toISOString(),
    });
  }
  return posts;
}

function generateOpportunities(count: number): Opportunity[] {
  const opportunities: Opportunity[] = [];
  for (let i = 0; i < count; i++) {
    const institution = INSTITUTIONS[i % INSTITUTIONS.length];
    const governorate = institution.governorate;
    const city = GOVERNORATES[i % GOVERNORATES.length];

    opportunities.push({
      id: generateId(),
      title: OPPORTUNITY_TITLES[i % OPPORTUNITY_TITLES.length],
      type: OPPORTUNITY_TYPES[i % OPPORTUNITY_TYPES.length],
      institution_name: institution.name,
      institution_logo: `https://picsum.photos/seed/${institution.id}/100/100`,
      governorate,
      city,
      deadline: new Date(Date.now() + (i + 1) * 86400000 * 30).toISOString().split('T')[0],
      tags: JSON.stringify(['full-time', 'on-site']),
      created_at: new Date(Date.now() - i * 86400000).toISOString(),
    });
  }
  return opportunities;
}

// Output SQL statements
const profiles = generateProfiles(12);
const posts = generatePosts(profiles, 120);
const opportunities = generateOpportunities(25);

console.log('-- Rafid Database Seed Script');
console.log('-- Run with: wrangler d1 execute rafid-db --file=seed.sql --remote');
console.log('-- Or locally: wrangler d1 execute rafid-db --file=seed.sql');
console.log('');

console.log('-- Profiles');
profiles.forEach(p => {
  console.log(`INSERT INTO profiles (id, email, password_hash, full_name, governorate, institution, institution_id, stage, interests, bio, avatar_url, role) VALUES ('${p.id}', '${p.email}', '${p.password_hash}', '${p.full_name}', '${p.governorate}', '${p.institution}', '${p.institution_id}', '${p.stage}', '${p.interests}', '${p.bio}', '${p.avatar_url}', '${p.role}');`);
});

console.log('');
console.log('-- Posts');
posts.forEach(p => {
  const title = p.title ? `'${p.title}'` : 'NULL';
  const image = p.image_url ? `'${p.image_url}'` : 'NULL';
  console.log(`INSERT INTO posts (id, author_id, type, title, content, image_url, governorate, institution, institution_id, likes_count, comments_count, views_count, is_verified, metadata, created_at) VALUES ('${p.id}', '${p.author_id}', '${p.type}', ${title}, '${p.content}', ${image}, '${p.governorate}', '${p.institution}', '${p.institution_id}', ${p.likes_count}, ${p.comments_count}, ${p.views_count}, ${p.is_verified}, '${p.metadata}', '${p.created_at}');`);
});

console.log('');
console.log('-- Opportunities');
opportunities.forEach(o => {
  const logo = o.institution_logo ? `'${o.institution_logo}'` : 'NULL';
  const deadline = o.deadline ? `'${o.deadline}'` : 'NULL';
  const city = o.city ? `'${o.city}'` : 'NULL';
  console.log(`INSERT INTO opportunities (id, title, type, institution_name, institution_logo, governorate, city, deadline, tags, created_at) VALUES ('${o.id}', '${o.title}', '${o.type}', '${o.institution_name}', ${logo}, '${o.governorate}', ${city}, ${deadline}, '${o.tags}', '${o.created_at}');`);
});

console.log('');
console.log(`-- Summary: ${profiles.length} profiles, ${posts.length} posts, ${opportunities.length} opportunities`);

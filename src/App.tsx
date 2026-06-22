import React, { useEffect, useMemo, useState } from 'react';
import { BACKEND_URL } from './lib/api';
import './index.css';

type Lang = 'ar' | 'ku' | 'en';

type FeedItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  source?: string;
  org?: string;
  location?: string;
  category?: string;
  createdAt?: string;
};

const governorates = [
  ['all', 'كل العراق', 'هەموو عێراق', 'All Iraq'],
  ['baghdad', 'بغداد', 'بەغدا', 'Baghdad'],
  ['erbil', 'أربيل', 'هەولێر', 'Erbil'],
  ['sulaymaniyah', 'السليمانية', 'سلێمانی', 'Sulaymaniyah'],
  ['basra', 'البصرة', 'بەسرە', 'Basra'],
  ['nineveh', 'نينوى', 'نەینەوا', 'Nineveh'],
  ['najaf', 'النجف', 'نەجەف', 'Najaf'],
  ['karbala', 'كربلاء', 'کەربەلا', 'Karbala'],
  ['kirkuk', 'كركوك', 'کەرکووک', 'Kirkuk'],
  ['duhok', 'دهوك', 'دهۆک', 'Duhok']
];

function t(lang: Lang, ar: string, ku: string, en: string) {
  if (lang === 'ar') return ar;
  if (lang === 'ku') return ku;
  return en;
}

function clean(value: any, fallback = '') {
  return String(value || fallback)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractList(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.opportunities)) return payload.opportunities;
  if (Array.isArray(payload?.highlights)) return payload.highlights;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

function mapOpportunity(item: any): FeedItem {
  const source =
    item.application_link ||
    item.apply_url ||
    item.source_url ||
    item.original_source_url ||
    item.url ||
    item.link ||
    item.job_url ||
    item.details_url ||
    '';

  return {
    id: String(item.id || source || Math.random()),
    type: clean(item.category || item.type || 'job', 'job').toLowerCase(),
    category: clean(item.category || item.type || 'job', 'job').toLowerCase(),
    title: clean(item.title || item.titleEN || item.title_ar || item.name, 'Opportunity'),
    body: clean(item.description || item.summary || item.content || item.contentEN, 'Open the original source for full details.'),
    source,
    org: clean(item.organization || item.company || item.institution_name || item.source_name, 'Talaba Source'),
    location: clean(item.location || item.city || item.governorate || item.duty_station, 'Iraq'),
    createdAt: clean(item.published_date || item.created_at || item.date, '')
  };
}

function mapHighlight(item: any): FeedItem {
  return {
    id: String(item.id || item.url || Math.random()),
    type: 'campus',
    category: clean(item.category || 'campus', 'campus'),
    title: clean(item.title || item.titleEN || item.title_ar, 'Campus update'),
    body: clean(item.summary || item.description || item.content || item.body, 'Campus update from Talaba.'),
    source: clean(item.source_url || item.url || item.link, ''),
    org: clean(item.organization || item.university || item.source_name, 'Campus update'),
    location: clean(item.governorate || item.location || 'Iraq', 'Iraq'),
    createdAt: clean(item.created_at || item.date, '')
  };
}

function postcardFor(id: string) {
  const seed = String(id || 'talaba').split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const cards = [
    ['from-violet-700 via-fuchsia-600 to-orange-400', '✨'],
    ['from-sky-700 via-indigo-700 to-violet-700', '🎓'],
    ['from-emerald-700 via-teal-600 to-cyan-500', '📚'],
    ['from-slate-900 via-purple-900 to-orange-600', '💬'],
    ['from-rose-700 via-orange-500 to-amber-400', '📌']
  ];
  return cards[Math.abs(seed) % cards.length];
}

function StudentPostCard({ item, lang }: { item: FeedItem; lang: Lang }) {
  const [gradient, icon] = postcardFor(item.id);
  return (
    <article className="overflow-hidden rounded-[28px] border border-orange-100 bg-white shadow-xl shadow-orange-100/50">
      <div className={`relative min-h-[280px] bg-gradient-to-br ${gradient} px-6 py-8 text-center text-white`}>
        <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,.25)_0,_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,210,31,.20)_0,_transparent_34%)]" />
        <div className="absolute -left-14 -top-14 h-44 w-44 rounded-full bg-white/10 blur-sm" />
        <div className="absolute -bottom-16 -right-12 h-52 w-52 rounded-full bg-white/10 blur-sm" />

        <div className="relative z-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/25 bg-white/20 text-4xl shadow-xl backdrop-blur">
            {icon}
          </div>
          <div className="mx-auto mb-3 inline-flex rounded-full border border-white/25 bg-white/20 px-3 py-1 text-[10px] font-black text-white shadow-sm backdrop-blur">
            {t(lang, 'منشور طلابي', 'پۆستی قوتابی', 'Student Post')}
          </div>
          <h2 className="mx-auto max-w-[15ch] text-3xl font-black leading-tight tracking-tight">
            {item.title.slice(0, 95)}
          </h2>
          {item.body && (
            <p className="mx-auto mt-4 max-w-[32ch] text-sm font-bold leading-6 text-white/85">
              {item.body.slice(0, 150)}
            </p>
          )}
          <div className="mx-auto mt-6 flex max-w-[280px] items-center justify-between gap-3 rounded-2xl border border-white/20 bg-black/15 px-3 py-2 text-[10px] font-black text-white/85 backdrop-blur">
            <span>{item.location || 'Talaba'}</span>
            <span>طلبة</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function OpportunityCard({ item, lang }: { item: FeedItem; lang: Lang }) {
  const isScholarship = item.type.includes('scholarship');
  const isInternship = item.type.includes('internship');

  return (
    <article className="overflow-hidden rounded-[28px] border border-orange-100 bg-white shadow-xl shadow-orange-100/50">
      <div className="relative min-h-[260px] bg-gradient-to-br from-orange-100 via-orange-200 to-orange-400 px-6 py-8 text-center text-[#3b2208]">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_left,_#ffffff_0,_transparent_30%),radial-gradient(circle_at_bottom_right,_#fdba74_0,_transparent_34%)]" />
        <div className="relative z-10">
          <div className="mb-4 inline-flex rounded-full bg-orange-500 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-900 shadow">
            {isScholarship ? 'Scholarship' : isInternship ? 'Internship' : 'Opportunity'}
          </div>
          <h2 className="text-3xl font-black leading-tight tracking-tight">
            {item.title.slice(0, 120)}
          </h2>
          <p className="mt-4 rounded-xl bg-slate-900 px-3 py-2 text-[11px] font-black uppercase tracking-wide text-white">
            {item.location || 'Iraq'} · {item.org || 'Talaba Source'}
          </p>
          <p className="mx-auto mt-4 max-w-[34ch] text-sm font-semibold leading-6 text-[#4a2a0d]">
            {item.body.slice(0, 180)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <span className="text-[11px] font-black text-slate-500">{item.createdAt || t(lang, 'حديث', 'نوێ', 'Recent')}</span>
        {item.source ? (
          <button
            onClick={() => window.open(item.source, '_blank', 'noopener,noreferrer')}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-black text-white shadow hover:bg-orange-600"
          >
            {t(lang, 'تقديم', 'داواکاری', 'Apply')}
          </button>
        ) : (
          <span className="rounded-2xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-500">
            {t(lang, 'رابط غير متوفر', 'لینک نییە', 'No link')}
          </span>
        )}
      </div>
    </article>
  );
}

export default function App() {
  const [lang, setLang] = useState<Lang>('ar');
  const [filter, setFilter] = useState<'all' | 'job' | 'scholarship' | 'campus' | 'student'>('all');
  const [gov, setGov] = useState('all');
  const [items, setItems] = useState<FeedItem[]>([]);
  const [studentPosts, setStudentPosts] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [postText, setPostText] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [loggedIn, setLoggedIn] = useState(() => Boolean(localStorage.getItem('Talaba_token')));

  const isRtl = lang === 'ar' || lang === 'ku';

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      try {
        const [oppsRes, highlightsRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/opportunities?limit=120`, { headers: { Accept: 'application/json' } }),
          fetch(`${BACKEND_URL}/api/highlights?limit=40`, { headers: { Accept: 'application/json' } })
        ]);

        const oppsPayload = await oppsRes.json().catch(() => []);
        const highlightsPayload = await highlightsRes.json().catch(() => []);

        const next = [
          ...extractList(oppsPayload).map(mapOpportunity),
          ...extractList(highlightsPayload).map(mapHighlight)
        ];

        if (alive) setItems(next);
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const visibleItems = useMemo(() => {
    const all = [...studentPosts, ...items];

    return all.filter(item => {
      const itemGov = String(item.location || '').toLowerCase();
      const category = String(item.category || item.type || '').toLowerCase();

      const govOk = gov === 'all' || itemGov.includes(gov);
      const filterOk =
        filter === 'all' ||
        (filter === 'student' && item.type === 'student') ||
        (filter === 'campus' && item.type === 'campus') ||
        category.includes(filter);

      return govOk && filterOk;
    });
  }, [items, studentPosts, filter, gov]);

  const submitPost = (event: React.FormEvent) => {
    event.preventDefault();

    const title = clean(postTitle, '');
    const body = clean(postText, '');

    if (!title && !body) return;

    const next: FeedItem = {
      id: `student-${Date.now()}`,
      type: 'student',
      category: 'student',
      title: title || body.slice(0, 80) || t(lang, 'منشور طلابي', 'پۆستی قوتابی', 'Student Post'),
      body,
      org: 'Student',
      location: gov === 'all' ? 'Iraq' : gov,
      createdAt: t(lang, 'الآن', 'ئێستا', 'Now')
    };

    setStudentPosts(prev => [next, ...prev].slice(0, 20));
    setPostText('');
    setPostTitle('');
  };

  const submitAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthMessage(t(lang, 'جاري المعالجة...', 'چارەسەر دەکرێت...', 'Processing...'));

    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name: name || email.split('@')[0],
          username: name || email.split('@')[0]
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Authentication failed');
      }

      const token = data.token || data.access_token || data.jwt || '';
      if (token) localStorage.setItem('Talaba_token', token);
      localStorage.setItem('Talaba_logged_in', 'true');
      localStorage.setItem('Talaba_user_email', email);
      if (data.user) localStorage.setItem('Talaba_auth_user', JSON.stringify(data.user));

      setLoggedIn(true);
      setAuthOpen(false);
      setAuthMessage('');
    } catch (error: any) {
      setAuthMessage(error?.message || t(lang, 'فشل الدخول', 'چوونەژوورەوە سەرکەوتوو نەبوو', 'Login failed'));
    }
  };

  const logout = () => {
    localStorage.removeItem('Talaba_token');
    localStorage.removeItem('Talaba_logged_in');
    localStorage.removeItem('Talaba_user_email');
    localStorage.removeItem('Talaba_auth_user');
    setLoggedIn(false);
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} lang={lang} className="min-h-screen bg-[#faf7ff] text-slate-900">
      <div className="mx-auto min-h-screen max-w-md bg-white shadow-2xl">
        <header className="sticky top-0 z-40 border-b border-orange-100 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 text-xl text-white shadow">🎓</div>
                <div>
                  <div className="text-lg font-black text-orange-600">Talaba | طلبة</div>
                  <div className="text-[10px] font-bold text-slate-500">
                    {t(lang, 'حياة الجامعة والفرص في مكان واحد', 'ژیانی زانکۆ و هەلەکان لە یەک شوێندا', 'University life and opportunities')}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 rounded-2xl bg-gradient-to-r from-violet-700 via-blue-600 to-orange-500 p-1">
              {(['ar', 'ku', 'en'] as Lang[]).map(code => (
                <button
                  key={code}
                  onClick={() => setLang(code)}
                  className={`rounded-xl px-2 py-1 text-[10px] font-black ${
                    lang === code ? 'bg-yellow-300 text-slate-900' : 'text-white'
                  }`}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              onClick={() => setAuthOpen(true)}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-black text-white"
            >
              {loggedIn ? t(lang, 'حسابي', 'هەژمارم', 'Account') : t(lang, 'دخول / تسجيل', 'چوونەژوورەوە', 'Login')}
            </button>

            {loggedIn && (
              <button onClick={logout} className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700">
                {t(lang, 'خروج', 'چوونەدەرەوە', 'Logout')}
              </button>
            )}
          </div>
        </header>

        <main className="px-4 pb-10">
          <section className="mt-4 overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-purple-950 to-orange-600 p-5 text-white shadow-2xl">
            <div className="text-xs font-black uppercase tracking-[0.22em] text-orange-200">Talaba Beta</div>
            <h1 className="mt-3 text-3xl font-black leading-tight">
              {t(lang, 'كل ما يهم الطالب في مكان واحد', 'هەموو شتێکی گرنگ بۆ قوتابی لە یەک شوێندا', 'Everything students need in one place')}
            </h1>
            <p className="mt-3 text-sm font-semibold leading-6 text-white/80">
              {t(
                lang,
                'فرص، منح، تحديثات جامعية، ومنشورات طلابية بتصميم بطاقات جميلة.',
                'هەل، سکۆلارشیپ، نوێکاری زانکۆ و پۆستی قوتابی بە دیزاینی جوان.',
                'Opportunities, scholarships, campus updates, and student postcard posts.'
              )}
            </p>
          </section>

          <section className="sticky top-[104px] z-30 mt-4 rounded-3xl border border-orange-100 bg-white/95 p-3 shadow-lg backdrop-blur">
            <select
              value={gov}
              onChange={e => setGov(e.target.value)}
              className="mb-3 w-full rounded-2xl border border-orange-100 bg-orange-50 px-3 py-3 text-sm font-black outline-none"
            >
              {governorates.map(([id, ar, ku, en]) => (
                <option key={id} value={id}>{t(lang, ar, ku, en)}</option>
              ))}
            </select>

            <div className="grid grid-cols-5 gap-1.5 text-[10px] font-black">
              {[
                ['all', t(lang, 'الكل', 'هەموو', 'All')],
                ['job', t(lang, 'وظائف', 'کار', 'Jobs')],
                ['scholarship', t(lang, 'منح', 'سکۆلارشیپ', 'Scholar')],
                ['campus', t(lang, 'جامعة', 'زانکۆ', 'Campus')],
                ['student', t(lang, 'طلاب', 'قوتابی', 'Students')]
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setFilter(id as any)}
                  className={`rounded-2xl px-2 py-2 ${
                    filter === id ? 'bg-orange-500 text-white shadow' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-4 rounded-[28px] border border-violet-100 bg-violet-50 p-4">
            <h2 className="text-sm font-black text-violet-900">
              {t(lang, 'اكتب منشوراً طلابياً', 'پۆستی قوتابی بنووسە', 'Write a student post')}
            </h2>
            <form onSubmit={submitPost} className="mt-3 space-y-2">
              <input
                value={postTitle}
                onChange={e => setPostTitle(e.target.value)}
                maxLength={95}
                placeholder={t(lang, 'عنوان قصير', 'ناونیشانی کورت', 'Short title')}
                className="w-full rounded-2xl border border-violet-100 bg-white px-3 py-3 text-sm font-bold outline-none"
              />
              <textarea
                value={postText}
                onChange={e => setPostText(e.target.value)}
                maxLength={280}
                placeholder={t(lang, 'اكتب نص المنشور فقط — سيظهر كبطاقة جميلة', 'تەنها دەق بنووسە — وەک کارتێکی جوان دەردەکەوێت', 'Text only — it becomes a beautiful postcard')}
                className="min-h-[90px] w-full rounded-2xl border border-violet-100 bg-white px-3 py-3 text-sm font-bold outline-none"
              />
              <button className="w-full rounded-2xl bg-violet-700 px-4 py-3 text-sm font-black text-white shadow-lg">
                {t(lang, 'نشر كبطاقة', 'بڵاوکردنەوە وەک کارت', 'Post as postcard')}
              </button>
            </form>
          </section>

          <section className="mt-5 space-y-4">
            {loading && (
              <div className="rounded-3xl border border-orange-100 bg-white p-6 text-center text-sm font-black text-slate-500 shadow">
                {t(lang, 'جاري التحميل...', 'باردەکرێت...', 'Loading...')}
              </div>
            )}

            {!loading && visibleItems.length === 0 && (
              <div className="rounded-3xl border border-orange-100 bg-white p-6 text-center text-sm font-black text-slate-500 shadow">
                {t(lang, 'لا توجد عناصر حالياً', 'هیچ شتێک نییە', 'No items yet')}
              </div>
            )}

            {visibleItems.map(item =>
              item.type === 'student' || item.type === 'campus' ? (
                <StudentPostCard key={item.id} item={item} lang={lang} />
              ) : (
                <OpportunityCard key={item.id} item={item} lang={lang} />
              )
            )}
          </section>
        </main>

        {authOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-[28px] bg-white p-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black">
                  {authMode === 'login'
                    ? t(lang, 'تسجيل الدخول', 'چوونەژوورەوە', 'Login')
                    : t(lang, 'إنشاء حساب', 'هەژمار دروستکردن', 'Register')}
                </h2>
                <button onClick={() => setAuthOpen(false)} className="rounded-xl bg-slate-100 px-3 py-1 text-sm font-black">×</button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-black">
                <button
                  onClick={() => setAuthMode('login')}
                  className={`rounded-2xl py-2 ${authMode === 'login' ? 'bg-orange-500 text-white' : 'bg-slate-100'}`}
                >
                  {t(lang, 'دخول', 'چوونەژوورەوە', 'Login')}
                </button>
                <button
                  onClick={() => setAuthMode('register')}
                  className={`rounded-2xl py-2 ${authMode === 'register' ? 'bg-orange-500 text-white' : 'bg-slate-100'}`}
                >
                  {t(lang, 'تسجيل', 'تۆمارکردن', 'Register')}
                </button>
              </div>

              <form onSubmit={submitAuth} className="mt-4 space-y-3">
                {authMode === 'register' && (
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={t(lang, 'الاسم', 'ناو', 'Name')}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm font-bold outline-none"
                  />
                )}
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type="email"
                  placeholder="email@example.com"
                  className="w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm font-bold outline-none"
                />
                <input
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  type="password"
                  placeholder={t(lang, 'كلمة المرور', 'وشەی نهێنی', 'Password')}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm font-bold outline-none"
                />
                {authMessage && <div className="text-xs font-bold text-red-600">{authMessage}</div>}
                <button className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white">
                  {authMode === 'login'
                    ? t(lang, 'دخول', 'چوونەژوورەوە', 'Login')
                    : t(lang, 'إنشاء الحساب', 'هەژمار دروست بکە', 'Create account')}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

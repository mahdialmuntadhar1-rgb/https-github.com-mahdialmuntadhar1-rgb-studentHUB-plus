import React, { useEffect, useMemo, useState } from 'react';

type Lang = 'ar' | 'ku' | 'en';

type Opportunity = {
  id?: string;
  title?: string;
  title_en?: string;
  title_ar?: string;
  title_ku?: string;
  type?: string;
  institution_name?: string;
  governorate?: string;
  city?: string;
  duty_station?: string;
  governorateId?: string;
  description?: string;
  description_en?: string;
  summary?: string;
  source_url?: string | null;
  apply_url?: string | null;
  application_link?: string | null;
  original_source_url?: string | null;
  created_at?: string;
};

type Highlight = {
  id?: string;
  title?: string;
  title_en?: string;
  title_ar?: string;
  title_ku?: string;
  category?: string;
  organization?: string;
  governorate?: string;
  summary?: string;
  source_url?: string;
  created_at?: string;
};

type Institution = {
  id?: string;
  name_en?: string;
  name_ar?: string;
  name_ku?: string;
  governorate?: string;
  type?: string;
};

type FeedItem = {
  id: string;
  title: string;
  description: string;
  type: string;
  organization: string;
  governorate: string;
  city: string;
  sourceUrl: string;
  createdAt: string;
};

const L = {
  ar: {
    app: 'Talaba',
    tagline: 'كل ما يهم الطالب العراقي في صفحة واحدة',
    sub: 'فرص، منح، تدريب، أخبار جامعية، وتنبيهات رسمية — بدون دردشة وبدون تعقيد.',
    search: 'بحث',
    governorate: 'المحافظة',
    category: 'القسم',
    all: 'الكل',
    jobs: 'وظائف',
    scholarships: 'منح',
    internships: 'تدريب',
    events: 'أحداث وامتحانات',
    highlights: 'تحديثات جامعية',
    universities: 'الجامعات',
    open: 'فتح المصدر الأصلي',
    refresh: 'تحديث',
    loading: 'جاري التحميل...',
    empty: 'لا توجد نتائج مطابقة حالياً.',
    connected: 'متصل بالبيانات',
    bad: 'مشكلة في جلب البيانات',
    source: 'المصدر',
    type: 'النوع'
  },
  ku: {
    app: 'Talaba',
    tagline: 'هەموو شتێکی گرنگ بۆ قوتابی لە یەک پەڕەدا',
    sub: 'هەلی کار، بورسیە، ڕاهێنان، هەواڵی زانکۆ و ئاگاداری — بێ چات و بێ ئاڵۆزی.',
    search: 'گەڕان',
    governorate: 'پارێزگا',
    category: 'بەش',
    all: 'هەموو',
    jobs: 'کار',
    scholarships: 'بورسیە',
    internships: 'ڕاهێنان',
    events: 'ڕووداو و تاقیکردنەوە',
    highlights: 'نوێکاری زانکۆ',
    universities: 'زانکۆکان',
    open: 'کردنەوەی سەرچاوەی ڕەسەن',
    refresh: 'نوێکردنەوە',
    loading: 'بارکردن...',
    empty: 'هیچ ئەنجامێکی گونجاو نییە.',
    connected: 'پەیوەستە بە داتاکان',
    bad: 'کێشە هەیە لە هێنانی داتا',
    source: 'سەرچاوە',
    type: 'جۆر'
  },
  en: {
    app: 'Talaba',
    tagline: 'Everything important for Iraqi students in one page',
    sub: 'Jobs, scholarships, internships, university updates, and official alerts — no chat, no clutter.',
    search: 'Search',
    governorate: 'Governorate',
    category: 'Category',
    all: 'All',
    jobs: 'Jobs',
    scholarships: 'Scholarships',
    internships: 'Internships',
    events: 'Events & Exams',
    highlights: 'University updates',
    universities: 'Universities',
    open: 'Open original source',
    refresh: 'Refresh',
    loading: 'Loading...',
    empty: 'No matching results right now.',
    connected: 'Connected to live data',
    bad: 'Data loading issue',
    source: 'Source',
    type: 'Type'
  }
};

const GOVS = [
  ['all', 'All Iraq', 'كل العراق', 'هەموو عێراق'],
  ['baghdad', 'Baghdad', 'بغداد', 'بەغدا'],
  ['erbil', 'Erbil', 'أربيل', 'هەولێر'],
  ['sulaymaniyah', 'Sulaymaniyah', 'السليمانية', 'سلێمانی'],
  ['duhok', 'Duhok', 'دهوك', 'دهۆک'],
  ['nineveh', 'Nineveh', 'نينوى', 'نەینەوا'],
  ['basra', 'Basra', 'البصرة', 'بەسرە'],
  ['najaf', 'Najaf', 'النجف', 'نەجەف'],
  ['karbala', 'Karbala', 'كربلاء', 'کەربەلا'],
  ['kirkuk', 'Kirkuk', 'كركوك', 'کەرکووک'],
  ['anbar', 'Anbar', 'الأنبار', 'ئەنبار'],
  ['diyala', 'Diyala', 'ديالى', 'دیالە'],
  ['dhi_qar', 'Dhi Qar', 'ذي قار', 'زیقار'],
  ['babil', 'Babil', 'بابل', 'بابل'],
  ['salah_al_din', 'Salah al-Din', 'صلاح الدين', 'سەلاحەدین'],
  ['wasit', 'Wasit', 'واسط', 'واسط'],
  ['maysan', 'Maysan', 'ميسان', 'مەیسان'],
  ['muthanna', 'Muthanna', 'المثنى', 'موثەننا'],
  ['al_qadisiyah', 'Al-Qadisiyah', 'القادسية', 'قادسیە'],
  ['halabja', 'Halabja', 'حلبجة', 'هەڵەبجە']
];

function text(v: unknown, fallback = '') {
  return String(v || fallback).replace(/\s+/g, ' ').trim();
}

function gov(v: unknown) {
  const x = text(v).toLowerCase();
  if (!x) return 'all';
  if (x.includes('baghdad') || x.includes('بغداد')) return 'baghdad';
  if (x.includes('erbil') || x.includes('أربيل')) return 'erbil';
  if (x.includes('sulay') || x.includes('sulaimani') || x.includes('السليمانية')) return 'sulaymaniyah';
  if (x.includes('duhok') || x.includes('دهوك')) return 'duhok';
  if (x.includes('nineveh') || x.includes('mosul') || x.includes('نينوى')) return 'nineveh';
  if (x.includes('basra') || x.includes('البصرة')) return 'basra';
  if (x.includes('najaf') || x.includes('النجف')) return 'najaf';
  if (x.includes('karbala') || x.includes('كربلاء')) return 'karbala';
  if (x.includes('kirkuk') || x.includes('كركوك')) return 'kirkuk';
  if (x.includes('anbar') || x.includes('الأنبار')) return 'anbar';
  if (x.includes('diyala') || x.includes('ديالى')) return 'diyala';
  if (x.includes('dhi') || x.includes('thi') || x.includes('ذي قار')) return 'dhi_qar';
  if (x.includes('babil') || x.includes('babylon') || x.includes('بابل')) return 'babil';
  if (x.includes('salah')) return 'salah_al_din';
  if (x.includes('wasit') || x.includes('واسط')) return 'wasit';
  if (x.includes('maysan') || x.includes('ميسان')) return 'maysan';
  if (x.includes('muthanna') || x.includes('المثنى')) return 'muthanna';
  if (x.includes('qadis')) return 'al_qadisiyah';
  if (x.includes('halabja') || x.includes('حلبجة')) return 'halabja';
  return x.replace(/\s+/g, '_');
}

function localized(row: any, lang: Lang) {
  if (lang === 'ar') return text(row.title_ar || row.name_ar || row.title || row.name_en, 'فرصة');
  if (lang === 'ku') return text(row.title_ku || row.name_ku || row.title || row.name_en, 'هەل');
  return text(row.title_en || row.name_en || row.title, 'Opportunity');
}

function group(type: string) {
  const t = type.toLowerCase();
  if (t === 'job') return 'job';
  if (t === 'scholarship') return 'scholarship';
  if (t === 'internship' || t === 'training') return 'internship';
  if (t === 'event' || t === 'exam' || t === 'registration') return 'event';
  if (t === 'highlight' || t === 'news') return 'highlight';
  return 'other';
}

function label(type: string, lang: Lang) {
  const g = group(type);
  if (g === 'job') return L[lang].jobs;
  if (g === 'scholarship') return L[lang].scholarships;
  if (g === 'internship') return L[lang].internships;
  if (g === 'event') return L[lang].events;
  if (g === 'highlight') return L[lang].highlights;
  return type;
}

export default function App() {
  const [lang, setLang] = useState<Lang>('ar');
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedGov, setSelectedGov] = useState('all');
  const [selectedCat, setSelectedCat] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(true);

  const t = L[lang];
  const dir = lang === 'en' ? 'ltr' : 'rtl';

  async function load() {
    setLoading(true);
    setOk(true);

    try {
      const [o, h, u] = await Promise.all([
        fetch('/api/opportunities?limit=150', { cache: 'no-store' }),
        fetch('/api/highlights?limit=60', { cache: 'no-store' }),
        fetch('/api/institutions?limit=120', { cache: 'no-store' })
      ]);

      if (!o.ok || !h.ok || !u.ok) throw new Error('API failed');

      const oj = await o.json();
      const hj = await h.json();
      const uj = await u.json();

      setOpps(Array.isArray(oj) ? oj : []);
      setHighlights(Array.isArray(hj) ? hj : []);
      setInstitutions(Array.isArray(uj?.institutions) ? uj.institutions : []);
    } catch (e) {
      console.error(e);
      setOk(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const items = useMemo<FeedItem[]>(() => {
    const opportunityItems = opps.map((x, i) => {
      const type = text(x.type, 'job').toLowerCase();
      return {
        id: text(x.id, `opp-${i}`),
        title: localized(x, lang),
        description: text(x.description || x.description_en || x.summary, 'Open the source for details.'),
        type,
        organization: text(x.institution_name, 'Official source'),
        governorate: gov(x.governorateId || x.governorate || x.duty_station || x.city),
        city: text(x.city || x.duty_station || x.governorate, 'Iraq'),
        sourceUrl: text(x.source_url || x.apply_url || x.application_link || x.original_source_url),
        createdAt: text(x.created_at)
      };
    });

    const highlightItems = highlights.map((x, i) => ({
      id: text(x.id, `highlight-${i}`),
      title: localized(x, lang),
      description: text(x.summary, 'Open the official source for details.'),
      type: 'highlight',
      organization: text(x.organization, 'University update'),
      governorate: gov(x.governorate),
      city: text(x.governorate, 'Iraq'),
      sourceUrl: text(x.source_url),
      createdAt: text(x.created_at)
    }));

    const q = query.trim().toLowerCase();

    return [...opportunityItems, ...highlightItems]
      .filter(item => selectedGov === 'all' || item.governorate === selectedGov)
      .filter(item => selectedCat === 'all' || group(item.type) === selectedCat)
      .filter(item => !q || `${item.title} ${item.description} ${item.organization} ${item.city}`.toLowerCase().includes(q))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [opps, highlights, selectedGov, selectedCat, query, lang]);

  const uniPreview = institutions
    .filter(x => selectedGov === 'all' || gov(x.governorate) === selectedGov)
    .slice(0, 8);

  return (
    <div className="app" dir={dir} lang={lang}>
      <header className="hero">
        <div className="topbar">
          <div>
            <div className="brand">Talaba</div>
            <div className={ok ? 'status ok' : 'status bad'}>{ok ? t.connected : t.bad}</div>
          </div>

          <div className="langs">
            <button className={lang === 'ar' ? 'active' : ''} onClick={() => setLang('ar')}>عربي</button>
            <button className={lang === 'ku' ? 'active' : ''} onClick={() => setLang('ku')}>کوردی</button>
            <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
          </div>
        </div>

        <h1>{t.tagline}</h1>
        <p>{t.sub}</p>
      </header>

      <main className="wrap">
        <section className="filters">
          <label>
            <span>{t.search}</span>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t.search} />
          </label>

          <label>
            <span>{t.governorate}</span>
            <select value={selectedGov} onChange={e => setSelectedGov(e.target.value)}>
              {GOVS.map(([id, en, ar, ku]) => (
                <option key={id} value={id}>{lang === 'ar' ? ar : lang === 'ku' ? ku : en}</option>
              ))}
            </select>
          </label>

          <label>
            <span>{t.category}</span>
            <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)}>
              <option value="all">{t.all}</option>
              <option value="job">{t.jobs}</option>
              <option value="scholarship">{t.scholarships}</option>
              <option value="internship">{t.internships}</option>
              <option value="event">{t.events}</option>
              <option value="highlight">{t.highlights}</option>
            </select>
          </label>

          <button onClick={load}>{t.refresh}</button>
        </section>

        <section className="stats">
          <div><b>{items.length}</b><span>{t.all}</span></div>
          <div><b>{opps.length}</b><span>{t.jobs}</span></div>
          <div><b>{highlights.length}</b><span>{t.highlights}</span></div>
          <div><b>{institutions.length}</b><span>{t.universities}</span></div>
        </section>

        <section className="universities">
          <div className="sectionTitle">
            <h2>{t.universities}</h2>
            <span>{uniPreview.length}</span>
          </div>

          <div className="uniGrid">
            {uniPreview.map((u, i) => (
              <div className="uni" key={u.id || i}>
                <b>{lang === 'ar' ? (u.name_ar || u.name_en) : lang === 'ku' ? (u.name_ku || u.name_en) : u.name_en}</b>
                <span>{u.governorate || 'Iraq'}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="feed">
          <div className="sectionTitle">
            <h2>{t.all}</h2>
            <span>{loading ? t.loading : items.length}</span>
          </div>

          {loading ? (
            <div className="empty">{t.loading}</div>
          ) : items.length === 0 ? (
            <div className="empty">{t.empty}</div>
          ) : (
            items.map(item => (
              <article className="card" key={`${item.type}-${item.id}`}>
                <div className="cardTop">
                  <span className={`pill ${group(item.type)}`}>{label(item.type, lang)}</span>
                  <span>{item.city}</span>
                </div>

                <h3>{item.title}</h3>
                <p>{item.description}</p>

                <div className="meta">
                  <span>{t.source}: {item.organization}</span>
                  <span>{t.type}: {item.type}</span>
                </div>

                {item.sourceUrl ? (
                  <a href={item.sourceUrl} target="_blank" rel="noreferrer">{t.open}</a>
                ) : null}
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

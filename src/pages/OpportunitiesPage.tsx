import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Filter, Search, Sparkles } from 'lucide-react';
import OpportunityCard from '../components/OpportunityCard';
import { opportunitySources, type Category } from '../data/opportunitySources';
import { scholarshipSources } from '../data/scholarshipSources';
import { BackendOpportunity, getBackendOpportunities, getHighlights, HighlightCategory, HighlightItem } from '../lib/api';
import { IraqiGovernorates } from '../data/mockData';
import { Language } from '../types';
import { looksLikeUrlText } from '../lib/fallbackImages';

const allSources = [...opportunitySources, ...scholarshipSources];

const categoryTabs: Array<{ labelEN: string; labelAR: string; labelKU: string; value: string; live?: HighlightCategory }> = [
  { labelEN: 'All', labelAR: 'الكل', labelKU: 'هەموو', value: 'all' },
  { labelEN: 'Jobs', labelAR: 'الوظائف', labelKU: 'کارەکان', value: 'job', live: 'job' },
  { labelEN: 'Scholarships', labelAR: 'المنح', labelKU: 'بورسیەکان', value: 'scholarship', live: 'scholarship' },
  { labelEN: 'Events', labelAR: 'الفعاليات', labelKU: 'چالاکییەکان', value: 'event', live: 'event' },
  { labelEN: 'Internships', labelAR: 'التدريب العملي', labelKU: 'مەشقەکان', value: 'internship', live: 'internship' },
  { labelEN: 'Trainings', labelAR: 'التدريبات', labelKU: 'ڕاهێنان', value: 'training' },
  { labelEN: 'Announcements', labelAR: 'الإعلانات', labelKU: 'ڕاگەیاندنەکان', value: 'announcement', live: 'announcement' },
];

const categoryLabels: Record<string, { en: string; ar: string; ku: string }> = {
  all: { en: 'approved opportunities', ar: 'الفرص المعتمدة', ku: 'هەلە پەسەندکراوەکان' },
  job: { en: 'approved jobs', ar: 'الوظائف المعتمدة', ku: 'کارە پەسەندکراوەکان' },
  scholarship: { en: 'approved scholarships', ar: 'المنح المعتمدة', ku: 'بورسیە پەسەندکراوەکان' },
  event: { en: 'approved events', ar: 'الفعاليات المعتمدة', ku: 'چالاکییە پەسەندکراوەکان' },
  internship: { en: 'approved internships', ar: 'التدريبات العملية المعتمدة', ku: 'مەشقە پەسەندکراوەکان' },
  training: { en: 'approved trainings', ar: 'التدريبات المعتمدة', ku: 'ڕاهێنانە پەسەندکراوەکان' },
  announcement: { en: 'approved announcements', ar: 'الإعلانات المعتمدة', ku: 'ڕاگەیاندنە پەسەندکراوەکان' },
};

function normalizeSourceCategory(category: Category): string {
  if (category === 'jobs') return 'job';
  if (category === 'internships') return 'internship';
  if (category === 'scholarships') return 'scholarship';
  if (category === 'events') return 'event';
  return category;
}

function parseOpportunitySummary(tags?: string): string {
  if (!tags) return 'Opportunity from the populated rafid-api backend.';
  try {
    const parsed = JSON.parse(tags);
    const parsedSummary = parsed.description || parsed.note || '';
    return parsedSummary && !looksLikeUrlText(parsedSummary)
      ? parsedSummary
      : 'Opportunity from the populated rafid-api backend.';
  } catch {
    return looksLikeUrlText(tags) ? 'Opportunity from the populated rafid-api backend.' : tags;
  }
}

function labelFor(language: Language, labels: { en: string; ar: string; ku: string }) {
  return language === 'ar' ? labels.ar : language === 'ku' ? labels.ku : labels.en;
}

function normalizeCategory(value: string) {
  if (value === 'jobs') return 'job';
  if (value === 'scholarships') return 'scholarship';
  if (value === 'internships') return 'internship';
  if (value === 'events') return 'event';
  return value || 'all';
}

export default function OpportunitiesPage({ language = 'en' }: { language?: Language }) {
  const initialParams = new URLSearchParams(window.location.search);
  const initialCategory = normalizeCategory(initialParams.get('category') || 'all');
  const initialGovernorate = initialParams.get('governorate') || 'all';
  const initialSearch = initialParams.get('search') || '';
  const [category, setCategory] = useState<string>(initialCategory);
  const [governorate, setGovernorate] = useState(initialGovernorate);
  const [search, setSearch] = useState(initialSearch);
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [backendOpportunities, setBackendOpportunities] = useState<BackendOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const liveCategory = ['event', 'job', 'internship', 'scholarship', 'student_club', 'announcement'].includes(category)
      ? category as HighlightCategory
      : '';
    setLoading(true);
    setError(null);
    Promise.all([
      getHighlights({ category: liveCategory, governorate }),
      getBackendOpportunities({
        category: category === 'all' ? undefined : category,
        governorate,
        search: search.trim() || undefined,
        limit: 50,
      }),
    ])
      .then(([nextHighlights, nextOpportunities]) => {
        setHighlights(nextHighlights);
        setBackendOpportunities(nextOpportunities);
      })
      .catch((err) => setError(err?.message || 'Could not load live opportunities'))
      .finally(() => setLoading(false));
  }, [category, governorate, search]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (governorate !== 'all') params.set('governorate', governorate);
    if (search.trim()) params.set('search', search.trim());
    const next = `/opportunities${params.toString() ? `?${params}` : ''}`;
    if (`${window.location.pathname}${window.location.search}` !== next) {
      window.history.replaceState(null, '', next);
    }
  }, [category, governorate, search]);

  const governorates = useMemo(() => {
    const unique = new Set<string>(IraqiGovernorates.map(gov => gov.nameEN));
    allSources.forEach(source => source.governorates.forEach(gov => gov !== 'all' && unique.add(gov)));
    highlights.forEach(item => item.governorate && unique.add(item.governorate));
    backendOpportunities.forEach(item => item.governorate && item.governorate !== 'all' && unique.add(item.governorate));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [backendOpportunities, highlights]);

  const filteredHighlights = highlights.filter((item) => {
    const term = search.trim().toLowerCase();
    return !term ||
      item.title.toLowerCase().includes(term) ||
      (item.organization || '').toLowerCase().includes(term) ||
      (item.summary || '').toLowerCase().includes(term);
  });

  const filteredBackendOpportunities = backendOpportunities.filter((item) => {
    const term = search.trim().toLowerCase();
    const normalizedCategory = item.type === 'training' ? 'internship' : item.type;
    const matchesCategory = category === 'all' || category === normalizedCategory || category === item.type;
    const matchesGovernorate = governorate === 'all' || !item.governorate || item.governorate === 'Iraq' || item.governorate.toLowerCase() === governorate.toLowerCase();
    const matchesSearch = !term ||
      item.title.toLowerCase().includes(term) ||
      item.type.toLowerCase().includes(term) ||
      item.institution_name.toLowerCase().includes(term) ||
      (item.city || '').toLowerCase().includes(term);
    return matchesCategory && matchesGovernorate && matchesSearch;
  });

  const backendAsHighlights: HighlightItem[] = filteredBackendOpportunities.map((item) => ({
    id: item.id,
    category: item.type === 'training' ? 'internship' : item.type === 'scholarship' ? 'scholarship' : item.type === 'internship' ? 'internship' : 'job',
    title: item.title,
    organization: item.institution_name,
    governorate: item.governorate,
    city: item.city,
    deadline: item.deadline,
    summary: parseOpportunitySummary(item.tags),
    image_url: item.image_url || item.imageUrl || item.institution_logo,
    source_name: 'rafid-api opportunities',
  }));

  const filteredSources = allSources.filter((source) => {
    const term = search.trim().toLowerCase();
    const matchesCategory = category === 'all' || normalizeSourceCategory(source.category) === category || source.category === category;
    const matchesGovernorate = governorate === 'all' || source.governorates.includes('all') || source.governorates.includes(governorate);
    const matchesSearch = !term || source.name.toLowerCase().includes(term) || (source.nameAr || '').toLowerCase().includes(term);
    return matchesCategory && matchesGovernorate && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-[#0B1020] px-4 py-8 text-white">
      <section className="mx-auto max-w-6xl">
        <button onClick={() => { window.location.href = '/'; }} className="mb-5 inline-flex items-center gap-2 rounded-2xl border border-[#1F2E4D] bg-[#121B2E] px-4 py-3 text-xs font-black text-cyan-300">
          <ArrowLeft size={14} /> Back to Jamiaati
        </button>

        <div className="mb-6 overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-[#16223F] to-[#101827] p-6 shadow-2xl">
          <p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
            <Sparkles size={14} /> Jamiaati Highlights
          </p>
          <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
            {language === 'ar' ? 'فرص معتمدة للطلاب في العراق وكردستان.' : language === 'ku' ? 'هەلی پەسەندکراو بۆ قوتابیانی عێراق و کوردستان.' : 'Approved opportunities for Iraqi and Kurdistan students.'}
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
            {language === 'ar' ? 'تظهر هنا العناصر المعتمدة فقط من نظام المراجعة. تبقى العناصر قيد المراجعة مخفية حتى الموافقة.' : language === 'ku' ? 'تەنها بابەتە پەسەندکراوەکان لێرە دەردەکەون. بابەتە چاوەڕوانەکان شاراوە دەمێنن تا پەسەند دەکرێن.' : 'Only approved items from the review system appear here. Pending items stay hidden until reviewed.'}
          </p>
          <p className="mt-5 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-black text-cyan-300">
            Build: Jamiaati Official Frontend - https-github - 2026-06-10 · API: rafid-api
          </p>
        </div>

        <div className="sticky top-3 z-10 mb-6 rounded-[1.5rem] border border-[#1F2E4D] bg-[#121B2E]/95 p-4 shadow-xl backdrop-blur">
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {categoryTabs.map(tab => (
              <button key={tab.value} onClick={() => setCategory(tab.value)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-black transition-colors ${category === tab.value ? 'bg-cyan-400 text-slate-950' : 'bg-slate-900 text-slate-300 hover:text-cyan-300'}`}>
                {language === 'ar' ? tab.labelAR : language === 'ku' ? tab.labelKU : tab.labelEN}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-[220px_1fr]">
            <label className="relative">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-300" />
              <select value={governorate} onChange={(event) => setGovernorate(event.target.value)} className="w-full rounded-2xl border border-[#1F2E4D] bg-slate-950 py-3 pl-9 pr-4 text-sm font-bold text-white outline-none">
                <option value="all">{language === 'ar' ? 'كل المحافظات' : language === 'ku' ? 'هەموو پارێزگاکان' : 'All Governorates'}</option>
                {governorates.map(gov => {
                  const known = IraqiGovernorates.find(item => item.nameEN.toLowerCase() === gov.toLowerCase() || item.id.toLowerCase() === gov.toLowerCase());
                  const label = known ? (language === 'ar' ? known.nameAR : language === 'ku' ? known.nameKU : known.nameEN) : gov;
                  return <option key={gov} value={known?.nameEN || gov}>{label}</option>;
                })}
              </select>
            </label>

            <label className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-300" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={language === 'ar' ? 'ابحث في الفرص المعتمدة...' : language === 'ku' ? 'گەڕان لە هەلە پەسەندکراوەکان...' : 'Search approved opportunities...'} className="w-full rounded-2xl border border-[#1F2E4D] bg-slate-950 py-3 pl-9 pr-4 text-sm font-bold text-white outline-none placeholder:text-slate-500" />
            </label>
          </div>
        </div>

        {error && <div className="mb-5 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm font-bold text-rose-200">{error}</div>}

        <div className="mb-8">
          <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-cyan-300">{labelFor(language, categoryLabels[category] || categoryLabels.all)}</h2>
          {loading ? (
            <div className="rounded-3xl border border-[#1F2E4D] bg-[#121B2E] p-8 text-center text-sm font-black text-slate-400">Loading rafid-api data...</div>
          ) : filteredHighlights.length > 0 || backendAsHighlights.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredHighlights.map(item => <OpportunityCard key={item.id} kind="highlight" item={item} />)}
              {backendAsHighlights.map(item => <OpportunityCard key={`backend-${item.id}`} kind="highlight" item={item} />)}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#1F2E4D] bg-[#121B2E] p-8 text-center text-sm font-black text-slate-400">
              {category === 'job'
                ? (language === 'ar' ? 'لا توجد وظائف معتمدة لهذه المحافظة حتى الآن. تتم مراجعة فرص جديدة.' : language === 'ku' ? 'هیچ کاری پەسەندکراو بۆ ئەم پارێزگایە نییە تا ئێستا. هەلە نوێیەکان لە پێداچوونەوەدان.' : 'No approved jobs found for this governorate yet. New opportunities are being reviewed.')
                : (language === 'ar' ? 'لا توجد فرص معتمدة لهذا الفلتر حتى الآن.' : language === 'ku' ? 'هیچ هەلێکی پەسەندکراو بۆ ئەم فلتەرە نییە.' : 'No approved opportunities found for this filter yet.')}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-cyan-300">Trusted opportunity sources</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredSources.map(source => <OpportunityCard key={`${source.name}-${source.website}`} kind="source" source={source} />)}
          </div>
        </div>
      </section>
    </main>
  );
}

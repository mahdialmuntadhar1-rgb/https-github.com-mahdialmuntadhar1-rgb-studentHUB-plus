import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Filter, Search, Sparkles } from 'lucide-react';
import OpportunityCard from '../components/OpportunityCard';
import { opportunitySources, type Category } from '../data/opportunitySources';
import { scholarshipSources } from '../data/scholarshipSources';
import { BackendOpportunity, getBackendOpportunities, getHighlights, HighlightCategory, HighlightItem } from '../lib/api';

const allSources = [...opportunitySources, ...scholarshipSources];

const categoryTabs: Array<{ label: string; value: HighlightCategory | Category | 'all'; live?: HighlightCategory }> = [
  { label: 'All', value: 'all' },
  { label: 'Events', value: 'event', live: 'event' },
  { label: 'Jobs', value: 'job', live: 'job' },
  { label: 'Internships', value: 'internship', live: 'internship' },
  { label: 'Scholarships', value: 'scholarship', live: 'scholarship' },
  { label: 'Student Clubs', value: 'student_club', live: 'student_club' },
  { label: 'NGO', value: 'ngojobs' },
  { label: 'UN', value: 'unjobs' },
  { label: 'Oil & Gas', value: 'oilandgas' },
];

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
    return parsed.description || parsed.note || 'Opportunity from the populated rafid-api backend.';
  } catch {
    return tags;
  }
}

export default function OpportunitiesPage() {
  const initialCategory = new URLSearchParams(window.location.search).get('category') || 'all';
  const [category, setCategory] = useState<string>(initialCategory);
  const [governorate, setGovernorate] = useState('all');
  const [search, setSearch] = useState('');
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [backendOpportunities, setBackendOpportunities] = useState<BackendOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const liveCategory = ['event', 'job', 'internship', 'scholarship', 'student_club'].includes(category)
      ? category as HighlightCategory
      : '';
    setLoading(true);
    setError(null);
    Promise.all([
      getHighlights({ category: liveCategory, governorate }),
      getBackendOpportunities(),
    ])
      .then(([nextHighlights, nextOpportunities]) => {
        setHighlights(nextHighlights);
        setBackendOpportunities(nextOpportunities);
      })
      .catch((err) => setError(err?.message || 'Could not load live Highlights'))
      .finally(() => setLoading(false));
  }, [category, governorate]);

  const governorates = useMemo(() => {
    const unique = new Set<string>();
    allSources.forEach(source => source.governorates.forEach(gov => gov !== 'all' && unique.add(gov)));
    highlights.forEach(item => item.governorate && unique.add(item.governorate));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [highlights]);

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
      item.institution_name.toLowerCase().includes(term);
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
            Approved opportunities for Iraqi and Kurdistan students.
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
            Live approved items come from the backend review system. Source cards remain available as a trusted directory for admins and students.
          </p>
          <p className="mt-5 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-black text-cyan-300">
            Build: Jamiaati Official Frontend - https-github - 2026-06-10 · API: rafid-api
          </p>
        </div>

        <div className="sticky top-3 z-10 mb-6 rounded-[1.5rem] border border-[#1F2E4D] bg-[#121B2E]/95 p-4 shadow-xl backdrop-blur">
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {categoryTabs.map(tab => (
              <button key={tab.value} onClick={() => setCategory(tab.value)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-black transition-colors ${category === tab.value ? 'bg-cyan-400 text-slate-950' : 'bg-slate-900 text-slate-300 hover:text-cyan-300'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-[220px_1fr]">
            <label className="relative">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-300" />
              <select value={governorate} onChange={(event) => setGovernorate(event.target.value)} className="w-full rounded-2xl border border-[#1F2E4D] bg-slate-950 py-3 pl-9 pr-4 text-sm font-bold text-white outline-none">
                <option value="all">All Iraq</option>
                {governorates.map(gov => <option key={gov} value={gov}>{gov}</option>)}
              </select>
            </label>

            <label className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-300" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search highlights and sources..." className="w-full rounded-2xl border border-[#1F2E4D] bg-slate-950 py-3 pl-9 pr-4 text-sm font-bold text-white outline-none placeholder:text-slate-500" />
            </label>
          </div>
        </div>

        {error && <div className="mb-5 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm font-bold text-rose-200">{error}</div>}

        <div className="mb-8">
          <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-cyan-300">Live backend data</h2>
          {loading ? (
            <div className="rounded-3xl border border-[#1F2E4D] bg-[#121B2E] p-8 text-center text-sm font-black text-slate-400">Loading rafid-api data...</div>
          ) : filteredHighlights.length > 0 || backendAsHighlights.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredHighlights.map(item => <OpportunityCard key={item.id} kind="highlight" item={item} />)}
              {backendAsHighlights.map(item => <OpportunityCard key={`backend-${item.id}`} kind="highlight" item={item} />)}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#1F2E4D] bg-[#121B2E] p-8 text-center text-sm font-black text-slate-400">
              No live backend items found for this filter.
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

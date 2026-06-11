import { useEffect, useMemo, useState } from 'react';
import { Briefcase, Calendar, ExternalLink, GraduationCap, MapPin, RefreshCw, Search, Sparkles } from 'lucide-react';
import { getOpportunities } from '../lib/api';

type PublicOpportunity = {
  id: string;
  title: string;
  type?: string | null;
  category?: string | null;
  institution_name?: string | null;
  institutionName?: string | null;
  organization?: string | null;
  institution_logo?: string | null;
  image_url?: string | null;
  governorate?: string | null;
  city?: string | null;
  country?: string | null;
  deadline?: string | null;
  description?: string | null;
  summary?: string | null;
  apply_url?: string | null;
  source_url?: string | null;
  tags?: string[] | string | null;
};

const categories = ['all', 'job', 'internship', 'scholarship', 'training', 'event', 'announcement', 'exam', 'registration'];
const pageSize = 12;
const publicOpportunitiesBuildStamp = 'public-opportunities-backend-2026-06-10-v2';

function normalizeCategory(item: PublicOpportunity) {
  return (item.category || item.type || 'opportunity').toLowerCase();
}

function organizationName(item: PublicOpportunity) {
  return item.organization || item.institution_name || item.institutionName || 'Rafid Opportunity';
}

function parseTags(tags: PublicOpportunity['tags']): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  try {
    const parsed = JSON.parse(tags);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return String(tags).split(',').map((tag) => tag.trim()).filter(Boolean);
  }
}

function deadlineMatches(value: string, deadline?: string | null) {
  if (value === 'all') return true;
  if (value === 'has_deadline') return Boolean(deadline);
  if (value === 'no_deadline') return !deadline;
  if (!deadline) return false;
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return value === 'upcoming' ? date >= now : date < now;
}

function categoryLabel(value: string) {
  const labels: Record<string, string> = {
    job: 'Jobs',
    internship: 'Internships',
    scholarship: 'Scholarships',
    training: 'Trainings',
    event: 'Events',
    announcement: 'Announcements',
    exam: 'Exams',
    registration: 'Registration',
  };
  return labels[value] || value;
}

export default function PublicOpportunitiesList({ compact = false }: { compact?: boolean }) {
  const [items, setItems] = useState<PublicOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [filters, setFilters] = useState({
    category: 'all',
    governorate: 'all',
    country: 'all',
    deadline: 'all',
    search: '',
  });

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError('');
    getOpportunities()
      .then((data) => {
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Failed to load opportunities');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const governorates = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.governorate).filter(Boolean) as string[])).sort();
  }, [items]);

  const countries = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.country || 'Iraq').filter(Boolean) as string[])).sort();
  }, [items]);

  const filtered = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return items.filter((item) => {
      const category = normalizeCategory(item);
      const tags = parseTags(item.tags);
      const text = [
        item.title,
        organizationName(item),
        item.description,
        item.summary,
        item.governorate,
        item.city,
        item.country,
        ...tags,
      ].join(' ').toLowerCase();

      return (
        (filters.category === 'all' || category === filters.category) &&
        (filters.governorate === 'all' || item.governorate === filters.governorate) &&
        (filters.country === 'all' || (item.country || 'Iraq') === filters.country) &&
        deadlineMatches(filters.deadline, item.deadline) &&
        (!term || text.includes(term))
      );
    });
  }, [filters, items]);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [filters]);

  const visibleItems = filtered.slice(0, visibleCount);

  return (
    <section className={compact ? 'space-y-5' : 'mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8'}>
      <span className="sr-only">{publicOpportunitiesBuildStamp}</span>
      {!compact && (
        <div className="overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-orange-100 sm:p-8">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.35em] text-orange-300">Jamiaati Opportunities</p>
          <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Real public opportunities from Rafid.</h1>
          <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-white/65">
            Approved jobs, internships, scholarships, trainings, events, and announcements from the backend.
          </p>
        </div>
      )}

      <div className="rounded-[1.75rem] border border-orange-100 bg-white/95 p-4 shadow-xl shadow-orange-100/50 backdrop-blur">
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilters((current) => ({ ...current, category }))}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-black transition-colors ${
                filters.category === category
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                  : 'bg-orange-50 text-slate-600 hover:bg-purple-100 hover:text-purple-700'
              }`}
            >
              {category === 'all' ? 'All' : categoryLabel(category)}
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-[160px_150px_170px_1fr]">
          <select
            value={filters.governorate}
            onChange={(event) => setFilters((current) => ({ ...current, governorate: event.target.value }))}
            className="rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none ring-orange-200 focus:ring-4"
          >
            <option value="all">All governorates</option>
            {governorates.map((governorate) => <option key={governorate}>{governorate}</option>)}
          </select>

          <select
            value={filters.country}
            onChange={(event) => setFilters((current) => ({ ...current, country: event.target.value }))}
            className="rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none ring-orange-200 focus:ring-4"
          >
            <option value="all">All countries</option>
            {countries.map((country) => <option key={country}>{country}</option>)}
          </select>

          <select
            value={filters.deadline}
            onChange={(event) => setFilters((current) => ({ ...current, deadline: event.target.value }))}
            className="rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none ring-orange-200 focus:ring-4"
          >
            <option value="all">Any deadline</option>
            <option value="upcoming">Upcoming</option>
            <option value="has_deadline">Has deadline</option>
            <option value="no_deadline">No deadline</option>
            <option value="expired">Expired</option>
          </select>

          <label className="flex items-center gap-2 rounded-2xl border border-orange-100 bg-white px-4 py-3 ring-orange-200 focus-within:ring-4">
            <Search size={16} className="text-slate-400" />
            <input
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Search opportunities..."
              className="w-full bg-transparent text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-56 animate-pulse rounded-3xl border border-orange-100 bg-white shadow-sm" />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-[2rem] border border-red-100 bg-red-50 p-8 text-center">
          <p className="text-sm font-black text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-xs font-black text-white"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {!isLoading && !error && visibleItems.length === 0 && (
        <div className="rounded-[2rem] border border-dashed border-orange-200 bg-white p-12 text-center">
          <Sparkles size={42} className="mx-auto mb-4 text-orange-200" />
          <p className="text-lg font-black text-slate-700">No approved opportunities yet</p>
          <p className="mt-2 text-sm font-bold text-slate-400">Approved public opportunities will appear here automatically.</p>
        </div>
      )}

      {!isLoading && !error && visibleItems.length > 0 && (
        <>
          <div className="flex items-center justify-between gap-3 text-sm font-bold text-slate-500">
            <span>{filtered.length} approved opportunities</span>
            <span>Showing {visibleItems.length}</span>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((item) => (
              <div key={item.id}>
                <PublicOpportunityCard item={item} />
              </div>
            ))}
          </div>
          {visibleItems.length < filtered.length && (
            <div className="flex justify-center">
              <button
                onClick={() => setVisibleCount((count) => count + pageSize)}
                className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-black text-white transition-colors hover:bg-orange-500"
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function PublicOpportunityCard({ item }: { item: PublicOpportunity }) {
  const category = normalizeCategory(item);
  const tags = parseTags(item.tags);
  const href = item.apply_url || item.source_url || '#';
  const summary = item.summary || item.description || 'Details are available from the original source.';

  return (
    <article className="group overflow-hidden rounded-3xl border border-orange-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-100">
      {item.image_url && (
        <img src={item.image_url} alt="" className="mb-4 h-36 w-full rounded-2xl object-cover" />
      )}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-2 text-[11px] font-black uppercase tracking-wide text-orange-500">{categoryLabel(category)}</p>
          <h3 className="text-lg font-black leading-tight text-slate-900">{item.title}</h3>
          <p className="mt-2 text-sm font-bold text-slate-500">{organizationName(item)}</p>
        </div>
        <span className="shrink-0 rounded-2xl bg-orange-50 p-3 text-orange-600">
          {category === 'scholarship' ? <GraduationCap size={20} /> : <Briefcase size={20} />}
        </span>
      </div>

      <p className="mb-5 line-clamp-3 text-sm font-semibold leading-6 text-slate-500">{summary}</p>

      <div className="mb-5 flex flex-wrap gap-2">
        {(item.governorate || item.city || item.country) && (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-black text-orange-700">
            <MapPin size={12} /> {[item.governorate, item.city, item.country || 'Iraq'].filter(Boolean).join(' / ')}
          </span>
        )}
        {item.deadline && (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700">
            <Calendar size={12} /> {item.deadline}
          </span>
        )}
        {tags.slice(0, 2).map((tag) => (
          <span key={tag} className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">{tag}</span>
        ))}
      </div>

      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition-colors ${
          href === '#' ? 'pointer-events-none bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-orange-500'
        }`}
      >
        Open opportunity <ExternalLink size={14} />
      </a>
    </article>
  );
}

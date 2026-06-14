import type { OpportunitySource } from '../data/opportunitySources';

interface OpportunityCardProps {
  source: OpportunitySource;
  key?: string;
}

const categoryLabels: Record<OpportunitySource['category'], string> = {
  jobs: 'Jobs',
  internships: 'Internships',
  scholarships: 'Scholarships',
  events: 'Events',
  ngojobs: 'NGO',
  oilandgas: 'Oil & Gas',
  unjobs: 'UN',
};

const categoryClasses: Record<OpportunitySource['category'], string> = {
  jobs: 'bg-orange-100 text-orange-700 border-orange-200',
  internships: 'bg-purple-100 text-purple-700 border-purple-200',
  scholarships: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  events: 'bg-pink-100 text-pink-700 border-pink-200',
  ngojobs: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  oilandgas: 'bg-amber-100 text-amber-700 border-amber-200',
  unjobs: 'bg-sky-100 text-sky-700 border-sky-200',
};

export default function OpportunityCard({ source }: OpportunityCardProps) {
  const governorateLabel = source.governorates.includes('all')
    ? '🇮🇶 All Iraq'
    : source.governorates.join(', ');

  return (
    <article className="group rounded-3xl border border-orange-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-100">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-black leading-tight text-slate-900">
            {source.name}
          </h3>
          {source.nameAr && (
            <p className="mt-1 text-sm font-bold text-slate-500" dir="rtl">
              {source.nameAr}
            </p>
          )}
        </div>
        <span className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wide ${categoryClasses[source.category]}`}>
          {categoryLabels[source.category]}
        </span>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-black text-orange-700">
          {governorateLabel}
        </span>
        {source.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-full bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700">
            {tag}
          </span>
        ))}
      </div>

      <a
        href={`https://${source.website}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white transition-colors hover:bg-orange-500"
      >
        Open →
      </a>
    </article>
  );
}

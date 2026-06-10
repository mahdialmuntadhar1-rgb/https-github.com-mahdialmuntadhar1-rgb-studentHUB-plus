import { Calendar, ExternalLink, GraduationCap, MapPin, Sparkles } from 'lucide-react';
import type { HighlightItem } from '../lib/api';
import type { OpportunitySource } from '../data/opportunitySources';

type OpportunityCardProps =
  | { kind: 'highlight'; item: HighlightItem; key?: string }
  | { kind: 'source'; source: OpportunitySource; key?: string };

const categoryLabels: Record<string, string> = {
  event: 'Events',
  job: 'Jobs',
  internship: 'Internships',
  scholarship: 'Scholarships',
  student_club: 'Student Clubs',
  jobs: 'Jobs',
  internships: 'Internships',
  scholarships: 'Scholarships',
  events: 'Events',
  ngojobs: 'NGO',
  oilandgas: 'Oil & Gas',
  unjobs: 'UN',
};

export default function OpportunityCard(props: OpportunityCardProps) {
  if (props.kind === 'source') {
    const { source } = props;
    const governorateLabel = source.governorates.includes('all') ? 'All Iraq' : source.governorates.join(', ');

    return (
      <article className="rounded-3xl border border-[#1F2E4D] bg-[#121B2E] p-5 shadow-lg">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-black leading-tight text-white">{source.name}</h3>
            {source.nameAr && <p className="mt-1 text-xs font-bold text-cyan-200" dir="rtl">{source.nameAr}</p>}
          </div>
          <span className="shrink-0 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[10px] font-black uppercase text-cyan-300">
            {categoryLabels[source.category]}
          </span>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-black text-slate-200">{governorateLabel}</span>
          {source.tags.slice(0, 3).map(tag => (
            <span key={tag} className="rounded-full bg-indigo-400/10 px-3 py-1.5 text-[10px] font-bold text-indigo-200">{tag}</span>
          ))}
        </div>
        <a href={`https://${source.website}`} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 text-xs font-black text-slate-950">
          Open source <ExternalLink size={14} />
        </a>
      </article>
    );
  }

  const { item } = props;
  const isEvent = item.category === 'event';
  const dateText = isEvent ? item.event_date : item.deadline;
  const actionText = isEvent ? 'View Details' : item.category === 'student_club' ? 'Contact Club' : 'Apply Now';

  return (
    <article className="rounded-3xl border border-cyan-400/20 bg-gradient-to-b from-[#16223F] to-[#101827] p-5 shadow-xl shadow-cyan-950/20">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-cyan-300">
            {categoryLabels[item.category] || item.category}
          </p>
          <h3 className="text-lg font-black leading-tight text-white">{item.title}</h3>
          <p className="mt-1 text-xs font-bold text-slate-400">{item.organization || item.source_name || 'Jamiaati Highlights'}</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
          <Sparkles size={20} />
        </div>
      </div>

      <p className="mb-4 line-clamp-3 text-sm font-semibold leading-6 text-slate-300">
        {item.summary || 'Short summary from the approved source. Open the original link for full details.'}
      </p>

      <div className="mb-5 flex flex-wrap gap-2">
        {(item.governorate || item.city) && (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-black text-slate-200">
            <MapPin size={12} /> {item.governorate}{item.city ? ` / ${item.city}` : ''}
          </span>
        )}
        {item.university_id && (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-black text-slate-200">
            <GraduationCap size={12} /> {item.university_id}
          </span>
        )}
        {dateText && (
          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-400/10 px-3 py-1.5 text-[10px] font-black text-cyan-300">
            <Calendar size={12} /> {dateText}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-[10px] font-black uppercase tracking-widest text-slate-500">{item.source_name || 'Approved'}</span>
        <a href={item.apply_url || item.source_url || '#'} target="_blank" rel="noreferrer" className="rounded-2xl bg-cyan-400 px-4 py-3 text-xs font-black text-slate-950">
          {actionText}
        </a>
      </div>
    </article>
  );
}


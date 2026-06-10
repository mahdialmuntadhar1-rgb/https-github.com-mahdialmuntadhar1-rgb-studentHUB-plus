import { useEffect, useState } from 'react';
import { ArrowLeft, Check, ExternalLink, RefreshCw, Sparkles, X } from 'lucide-react';
import {
  createAdminHighlight,
  createHighlightSource,
  getAdminHighlights,
  getHighlightSources,
  HighlightCategory,
  HighlightItem,
  HighlightSource,
  HighlightStatus,
  runHighlightImport,
  setHighlightStatus,
} from '../lib/api';

export default function AdminHighlightsPage() {
  const [token, setToken] = useState(() => localStorage.getItem('jamiaati_admin_token') || localStorage.getItem('rafid_token') || '');
  const [items, setItems] = useState<HighlightItem[]>([]);
  const [sources, setSources] = useState<HighlightSource[]>([]);
  const [status, setStatus] = useState<HighlightStatus | ''>('pending_review');
  const [category, setCategory] = useState<HighlightCategory | ''>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [newItem, setNewItem] = useState({ title: '', category: 'event' as HighlightCategory, organization: '', governorate: '', summary: '', apply_url: '', deadline: '', event_date: '' });
  const [newSource, setNewSource] = useState({ name: '', source_url: '', category: 'event' as HighlightCategory, governorate_scope: '' });

  const saveToken = (value: string) => {
    setToken(value);
    localStorage.setItem('jamiaati_admin_token', value);
    localStorage.setItem('rafid_token', value);
  };

  const load = async () => {
    setLoading(true);
    setMessage('');
    try {
      const [nextItems, nextSources] = await Promise.all([
        getAdminHighlights({ status, category }),
        getHighlightSources(),
      ]);
      setItems(nextItems);
      setSources(nextSources);
    } catch (err: any) {
      setMessage(err?.message || 'Could not load admin highlights. Paste a valid admin token.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) load();
  }, [status, category]);

  const act = async (id: string, action: 'approve' | 'reject' | 'mark-duplicate') => {
    await setHighlightStatus(id, action);
    await load();
  };

  const addItem = async () => {
    if (!newItem.title.trim()) return;
    await createAdminHighlight(newItem);
    setNewItem({ title: '', category: 'event', organization: '', governorate: '', summary: '', apply_url: '', deadline: '', event_date: '' });
    await load();
  };

  const addSource = async () => {
    if (!newSource.name.trim() || !newSource.source_url.trim()) return;
    await createHighlightSource({ ...newSource, enabled: true, source_type: 'web', scraping_priority: 50 });
    setNewSource({ name: '', source_url: '', category: 'event', governorate_scope: '' });
    await load();
  };

  const importNow = async () => {
    setLoading(true);
    try {
      const result = await runHighlightImport();
      setMessage(`Import done: ${result.sourcesChecked} sources, ${result.itemsAdded} added, ${result.duplicatesFound} duplicates.`);
      await load();
    } catch (err: any) {
      setMessage(err?.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B1020] px-4 py-8 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button onClick={() => { window.location.href = '/'; }} className="inline-flex items-center gap-2 rounded-2xl border border-[#1F2E4D] bg-[#121B2E] px-4 py-3 text-xs font-black text-cyan-300">
            <ArrowLeft size={14} /> Back
          </button>
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-black text-cyan-300">
            Build: Jamiaati Official Frontend - https-github - 2026-06-10 · API: rafid-api
          </span>
        </div>

        <div className="mb-6 rounded-[2rem] border border-cyan-400/20 bg-[#121B2E] p-6">
          <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-cyan-300">
            <Sparkles size={14} /> Manage Highlights / إدارة الهايلايتس
          </p>
          <h1 className="text-3xl font-black">Admin review queue</h1>
          <p className="mt-2 text-sm font-semibold text-slate-400">New backend-collected items stay pending until an admin approves them.</p>
          <input value={token} onChange={(event) => saveToken(event.target.value)} placeholder="Paste admin JWT token for rafid-api..." className="mt-5 w-full rounded-2xl border border-[#1F2E4D] bg-slate-950 px-4 py-3 text-xs font-bold text-white outline-none placeholder:text-slate-500" />
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-[1.5rem] border border-[#1F2E4D] bg-[#121B2E] p-4">
          <select value={status} onChange={(event) => setStatus(event.target.value as any)} className="rounded-2xl border border-[#1F2E4D] bg-slate-950 px-4 py-3 text-xs font-black text-white">
            <option value="pending_review">pending_review</option>
            <option value="approved">approved</option>
            <option value="rejected">rejected</option>
            <option value="duplicate">duplicate</option>
            <option value="expired">expired</option>
            <option value="">all</option>
          </select>
          <select value={category} onChange={(event) => setCategory(event.target.value as any)} className="rounded-2xl border border-[#1F2E4D] bg-slate-950 px-4 py-3 text-xs font-black text-white">
            <option value="">all categories</option>
            <option value="event">Events</option>
            <option value="job">Jobs</option>
            <option value="internship">Internships</option>
            <option value="scholarship">Scholarships</option>
            <option value="student_club">Student Clubs</option>
          </select>
          <button onClick={load} disabled={!token || loading} className="rounded-2xl bg-cyan-400 px-4 py-3 text-xs font-black text-slate-950 disabled:opacity-50">Refresh</button>
          <button onClick={importNow} disabled={!token || loading} className="inline-flex items-center gap-2 rounded-2xl bg-indigo-400 px-4 py-3 text-xs font-black text-slate-950 disabled:opacity-50">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Run import
          </button>
        </div>

        {message && <div className="mb-5 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm font-bold text-amber-200">{message}</div>}

        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {items.map(item => (
              <article key={item.id} className="rounded-3xl border border-[#1F2E4D] bg-[#121B2E] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-cyan-400/10 px-2 py-1 text-[10px] font-black text-cyan-300">{item.category}</span>
                      <span className="rounded-full bg-slate-900 px-2 py-1 text-[10px] font-black text-slate-300">{item.status}</span>
                      <span className="rounded-full bg-slate-900 px-2 py-1 text-[10px] font-black text-slate-300">{item.confidence_score || 0}%</span>
                    </div>
                    <h3 className="text-lg font-black">{item.title}</h3>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-400">{item.summary}</p>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">{item.organization || item.source_name || 'Manual'} · {item.governorate || 'All Iraq'} · {item.deadline || item.event_date || 'No date'}</p>
                  </div>
                  {item.source_url && <a href={item.source_url} target="_blank" rel="noreferrer" className="rounded-2xl bg-slate-900 p-3 text-cyan-300"><ExternalLink size={16} /></a>}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => act(item.id, 'approve')} className="inline-flex items-center gap-1 rounded-xl bg-emerald-400 px-3 py-2 text-xs font-black text-slate-950"><Check size={14} /> Approve</button>
                  <button onClick={() => act(item.id, 'reject')} className="inline-flex items-center gap-1 rounded-xl bg-rose-400 px-3 py-2 text-xs font-black text-slate-950"><X size={14} /> Reject</button>
                  <button onClick={() => act(item.id, 'mark-duplicate')} className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-black text-slate-200">Duplicate</button>
                </div>
              </article>
            ))}
            {!loading && items.length === 0 && <div className="rounded-3xl border border-dashed border-[#1F2E4D] bg-[#121B2E] p-10 text-center text-sm font-black text-slate-500">No items for this filter.</div>}
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-[#1F2E4D] bg-[#121B2E] p-5">
              <h2 className="mb-4 text-sm font-black text-cyan-300">Manual item</h2>
              <div className="space-y-3">
                <input value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} placeholder="Title" className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-xs font-bold outline-none" />
                <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value as HighlightCategory })} className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-xs font-bold outline-none">
                  <option value="event">Event</option><option value="job">Job</option><option value="internship">Internship</option><option value="scholarship">Scholarship</option><option value="student_club">Student Club</option>
                </select>
                <input value={newItem.organization} onChange={(e) => setNewItem({ ...newItem, organization: e.target.value })} placeholder="Organization" className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-xs font-bold outline-none" />
                <input value={newItem.governorate} onChange={(e) => setNewItem({ ...newItem, governorate: e.target.value })} placeholder="Governorate" className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-xs font-bold outline-none" />
                <textarea value={newItem.summary} onChange={(e) => setNewItem({ ...newItem, summary: e.target.value })} placeholder="Short summary only" className="min-h-24 w-full rounded-2xl bg-slate-950 px-4 py-3 text-xs font-bold outline-none" />
                <input value={newItem.apply_url} onChange={(e) => setNewItem({ ...newItem, apply_url: e.target.value })} placeholder="Apply/details URL" className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-xs font-bold outline-none" />
                <button onClick={addItem} disabled={!token} className="w-full rounded-2xl bg-cyan-400 py-3 text-xs font-black text-slate-950 disabled:opacity-50">Save pending review</button>
              </div>
            </div>

            <div className="rounded-3xl border border-[#1F2E4D] bg-[#121B2E] p-5">
              <h2 className="mb-4 text-sm font-black text-cyan-300">Automation sources</h2>
              <div className="space-y-3">
                <input value={newSource.name} onChange={(e) => setNewSource({ ...newSource, name: e.target.value })} placeholder="Source name" className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-xs font-bold outline-none" />
                <input value={newSource.source_url} onChange={(e) => setNewSource({ ...newSource, source_url: e.target.value })} placeholder="Public source URL" className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-xs font-bold outline-none" />
                <select value={newSource.category} onChange={(e) => setNewSource({ ...newSource, category: e.target.value as HighlightCategory })} className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-xs font-bold outline-none">
                  <option value="event">Event</option><option value="job">Job</option><option value="internship">Internship</option><option value="scholarship">Scholarship</option>
                </select>
                <input value={newSource.governorate_scope} onChange={(e) => setNewSource({ ...newSource, governorate_scope: e.target.value })} placeholder="Governorate scope optional" className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-xs font-bold outline-none" />
                <button onClick={addSource} disabled={!token} className="w-full rounded-2xl bg-indigo-400 py-3 text-xs font-black text-slate-950 disabled:opacity-50">Add source</button>
              </div>
              <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
                {sources.map(source => <div key={source.id} className="rounded-2xl bg-slate-950 p-3"><p className="text-xs font-black">{source.name}</p><p className="truncate text-[10px] font-bold text-slate-500">{source.category} · {source.source_url}</p></div>)}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

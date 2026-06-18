import React, { useEffect, useMemo, useState } from 'react';

export type FutureFeedProps = any;

const BACKEND_URL = 'https://rafid-api.mahdialmuntadhar1.workers.dev';

const categories = [
  { key: 'job', label: 'Jobs', icon: '💼' },
  { key: 'scholarship', label: 'Scholarships', icon: '🎓' },
  { key: 'internship', label: 'Internships', icon: '🧪' },
  { key: 'training', label: 'Training', icon: '📚' },
  { key: 'event', label: 'Events', icon: '📅' },
  { key: 'exam', label: 'Exams', icon: '📝' },
  { key: 'registration', label: 'Registration', icon: '🗂️' },
];

const governorates = [
  'All Iraq',
  'Baghdad',
  'Erbil',
  'Sulaymaniyah',
  'Duhok',
  'Halabja',
  'Nineveh',
  'Basra',
  'Kirkuk',
  'Najaf',
  'Karbala',
  'Dhi Qar',
  'Babil',
  'Anbar',
  'Diyala',
  'Salah al-Din',
  'Wasit',
  'Maysan',
  'Al-Qadisiyah',
  'Muthanna',
];

function rowsFromPayload(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.opportunities)) return payload.opportunities;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

function clean(value: any): string {
  return String(value ?? '').trim();
}

function normalizeGov(value: any): string {
  const s = clean(value).toLowerCase();
  if (!s || s === 'all iraq' || s === 'all' || s === 'iraq') return 'All Iraq';
  if (s.includes('baghdad')) return 'Baghdad';
  if (s.includes('erbil') || s.includes('hawler') || s.includes('hewler')) return 'Erbil';
  if (s.includes('sulaymaniyah') || s.includes('sulaimani') || s.includes('slemani')) return 'Sulaymaniyah';
  if (s.includes('duhok') || s.includes('dohuk')) return 'Duhok';
  if (s.includes('halabja')) return 'Halabja';
  if (s.includes('nineveh') || s.includes('mosul')) return 'Nineveh';
  if (s.includes('basra')) return 'Basra';
  if (s.includes('kirkuk')) return 'Kirkuk';
  if (s.includes('najaf')) return 'Najaf';
  if (s.includes('karbala')) return 'Karbala';
  if (s.includes('dhi') || s.includes('thi') || s.includes('nasiriyah')) return 'Dhi Qar';
  if (s.includes('babil') || s.includes('babylon') || s.includes('hillah')) return 'Babil';
  if (s.includes('anbar') || s.includes('ramadi') || s.includes('fallujah')) return 'Anbar';
  if (s.includes('diyala') || s.includes('baqubah')) return 'Diyala';
  if (s.includes('salah') || s.includes('tikrit')) return 'Salah al-Din';
  if (s.includes('wasit') || s.includes('kut')) return 'Wasit';
  if (s.includes('maysan') || s.includes('amara')) return 'Maysan';
  if (s.includes('qadisiyah') || s.includes('diwaniyah')) return 'Al-Qadisiyah';
  if (s.includes('muthanna') || s.includes('samawah')) return 'Muthanna';
  return clean(value) || 'All Iraq';
}

async function fetchLive(category: string) {
  const limit = 1000;
  const all: any[] = [];

  for (let offset = 0; offset < 10000; offset += limit) {
    const url = `${BACKEND_URL}/api/opportunities?category=${encodeURIComponent(category)}&limit=${limit}&offset=${offset}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Backend error ${res.status}`);

    const batch = rowsFromPayload(await res.json());
    all.push(...batch);

    if (batch.length < limit) break;
  }

  return all.map((row: any) => ({
    id: clean(row.id || Math.random()),
    title: clean(row.title || row.title_en || row.titleEN || row.title_ar || 'Untitled'),
    type: clean(row.type || row.category || category),
    institution: clean(row.institution_name || row.organization || row.company || 'Opportunity Provider'),
    governorate: normalizeGov(row.governorate || row.governorateId),
    city: clean(row.city || row.location),
    description: clean(row.description || row.description_en || row.contentEN),
    source: clean(row.source_url || row.application_link || row.original_source_url),
    deadline: clean(row.deadline),
    status: clean(row.status || 'approved'),
  })).filter((row: any) => row.status === 'approved' && row.type === category);
}

export const SkeletonLoader = () => <div style={{padding:16}}>Loading opportunities...</div>;

export default function FutureFeed() {
  const [category, setCategory] = useState('job');
  const [governorate, setGovernorate] = useState('All Iraq');
  const [cache, setCache] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let stop = false;

    async function run() {
      if (cache[category]) return;
      setLoading(true);
      setError('');

      try {
        const rows = await fetchLive(category);
        if (!stop) setCache(prev => ({ ...prev, [category]: rows }));
      } catch (err: any) {
        if (!stop) setError(err?.message || 'Could not load opportunities.');
      } finally {
        if (!stop) setLoading(false);
      }
    }

    run();
    return () => { stop = true; };
  }, [category]);

  const rows = cache[category] || [];

  const filtered = useMemo(() => {
    if (governorate === 'All Iraq') return rows;
    return rows.filter(row => row.governorate === governorate);
  }, [rows, governorate]);

  const visible = filtered.slice(0, 120);

  return (
    <div style={{padding:18, maxWidth:1200, margin:'0 auto'}}>
      <div style={{background:'linear-gradient(135deg,#4f46e5,#7c3aed)', color:'white', padding:22, borderRadius:26, marginBottom:16}}>
        <div style={{opacity:.9}}>Live from backend</div>
        <h1 style={{margin:'4px 0'}}>Opportunities for Iraqi students</h1>
        <p style={{margin:0}}>Jobs, scholarships, internships, training, events, exams, and registration loaded from rafid-db.</p>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:10, marginBottom:14}}>
        {categories.map(c => (
          <button key={c.key} onClick={() => { setCategory(c.key); setGovernorate('All Iraq'); }} style={{
            padding:14, borderRadius:18, border: category === c.key ? '2px solid #4f46e5' : '1px solid #ddd',
            background: category === c.key ? '#eef2ff' : 'white', cursor:'pointer', textAlign:'left'
          }}>
            <div style={{fontSize:24}}>{c.icon}</div>
            <strong>{c.label}</strong>
          </button>
        ))}
      </div>

      <div style={{display:'flex', gap:12, flexWrap:'wrap', alignItems:'center', padding:14, border:'1px solid #e5e7eb', borderRadius:18, marginBottom:14}}>
        <strong>{categories.find(c => c.key === category)?.label}</strong>
        <span style={{color:'#64748b'}}>Loaded: {rows.length} | Showing: {filtered.length}</span>
        <select value={governorate} onChange={e => setGovernorate(e.target.value)} style={{marginLeft:'auto', padding:10, borderRadius:12}}>
          {governorates.map(g => <option key={g}>{g}</option>)}
        </select>
      </div>

      {loading && <SkeletonLoader />}
      {error && <div style={{padding:16, background:'#fee2e2', borderRadius:16}}>Could not load opportunities. {error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div style={{padding:16, background:'#f8fafc', borderRadius:16}}>No results found for this filter.</div>
      )}

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))', gap:14}}>
        {visible.map(item => (
          <article key={item.id} style={{background:'white', border:'1px solid #e5e7eb', borderRadius:22, padding:16, boxShadow:'0 8px 22px rgba(15,23,42,.06)'}}>
            <div style={{display:'flex', justifyContent:'space-between', gap:10}}>
              <span style={{background:'#eef2ff', padding:'5px 10px', borderRadius:999, fontSize:12, fontWeight:700}}>{item.type}</span>
              <span style={{color:'#64748b', fontSize:12}}>{item.governorate}</span>
            </div>
            <h2 style={{fontSize:18, margin:'12px 0 6px'}}>{item.title}</h2>
            <div style={{fontSize:14, color:'#475569', marginBottom:8}}><strong>{item.institution}</strong>{item.city ? ` • ${item.city}` : ''}</div>
            <p style={{fontSize:14, color:'#334155', whiteSpace:'pre-line'}}>{(item.description || 'Application details may need verification from the employer or source platform.').slice(0,520)}</p>
            {item.deadline && <div style={{fontSize:13, background:'#fff7ed', padding:8, borderRadius:12, marginBottom:8}}>Deadline: {item.deadline}</div>}
            {item.source ? (
              <a href={item.source.startsWith('http') ? item.source : `https://${item.source}`} target="_blank" rel="noreferrer" style={{background:'#4f46e5', color:'white', padding:'10px 14px', borderRadius:12, textDecoration:'none', fontWeight:700}}>Open source</a>
            ) : (
              <div style={{fontSize:13, background:'#f8fafc', color:'#64748b', padding:9, borderRadius:12}}>Application link not available. Please verify with employer/source platform.</div>
            )}
          </article>
        ))}
      </div>

      {filtered.length > visible.length && <p style={{textAlign:'center', color:'#64748b'}}>Showing first {visible.length} of {filtered.length}. Use governorate filter to narrow results.</p>}
    </div>
  );
}

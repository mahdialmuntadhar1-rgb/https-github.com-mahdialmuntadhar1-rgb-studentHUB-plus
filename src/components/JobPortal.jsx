// JobPortal.jsx — Live pipeline from Iraq Jobs Scout
// Fetches pages 1-5 + all 19 governorates → hundreds of real jobs
import React, { useState, useMemo, useEffect, useRef } from 'react';
import JobCard from './JobCard';
import fallback from '../data/jobs-data.json';
import './JobPortal.css';

// Try proxies in order until one works
const PROXIES = [
  url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

const BASE = 'https://iqjscout.com';

const GOVS = [
  ['Erbil','erbil'],['Baghdad','baghdad'],['Basrah','basrah'],
  ['Sulaymaniyah','sulaymaniyah'],['Nineveh','ninhava'],['Dohuk','dohuk'],
  ['Kirkuk','kirkuk'],['Anbar','anbar'],['Salah al-Din','salah-al-din'],
  ['Diyala','diyala'],['Najaf','najaf'],['Karbala','karbala'],
  ['Babil','babil'],['Qadisiyyah','qadisiyah'],['Wasit','wasit'],
  ['Missan','missan'],['Muthanna','al-muthanna'],['Thi-Qar','thi-qar'],
  ['Halabjah','halabjah'],
];

async function fetchHTML(url) {
  for (const proxy of PROXIES) {
    try {
      const r = await fetch(proxy(url), { signal: AbortSignal.timeout(8000) });
      if (r.ok) { const t = await r.text(); if (t.length > 500) return t; }
    } catch {}
  }
  return null;
}

function parseJobs(html, govName) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const out = [];
  // iqjscout WordPress job_manager selectors
  const items = doc.querySelectorAll('li.job_listing, .job_listing, article.job_listing');
  items.forEach((el, i) => {
    const title = el.querySelector('h3,h2,.job-title')?.textContent?.trim();
    const company = el.querySelector('.company strong, .company, .job-company')?.textContent?.trim();
    const href = el.querySelector('a')?.getAttribute('href') || '';
    const link = href.startsWith('http') ? href : BASE + href;
    const type = el.querySelector('.job-type,.listing-job-type,.badge')?.textContent?.trim() || 'Full Time';
    const date = el.querySelector('time,.date,.job-date')?.textContent?.trim() || 'Recent';
    const loc = el.querySelector('.location,.job-location')?.textContent?.trim() || govName;
    if (!title || !href) return;
    out.push({ id:`lv-${govName}-${i}`, position:title, company:company||'—',
      governorate: loc.includes('Iraq')||!govName ? (loc||'Iraq') : govName,
      jobType:type, posted:date, link, source:'Iraq Jobs Scout',
      requirements:'', category:'General', isLive:true });
  });
  return out;
}

const GOVS_ALL = fallback.governorates;
const CATS = fallback.categories;
const TYPES = fallback.jobTypes;

export default function JobPortal() {
  const [jobs, setJobs] = useState(fallback.jobs);
  const [status, setStatus] = useState('idle'); // idle|loading|done|error
  const [liveCount, setLiveCount] = useState(0);
  const seen = useRef(new Set(fallback.jobs.map(j=>j.link)));

  const [q, setQ] = useState('');
  const [gov, setGov] = useState('All');
  const [cat, setCat] = useState('All');
  const [type, setType] = useState('All');
  const [page, setPage] = useState(1);
  const PER = 15;

  function addJobs(newJobs) {
    const fresh = newJobs.filter(j => { if(seen.current.has(j.link)) return false; seen.current.add(j.link); return true; });
    if (!fresh.length) return;
    setJobs(prev => [...fresh, ...prev]);
    setLiveCount(c => c + fresh.length);
  }

  async function runPipeline() {
    setStatus('loading');
    // Step 1: pages 1-5 of /jobs/
    for (let p = 1; p <= 5; p++) {
      const url = p === 1 ? `${BASE}/jobs/` : `${BASE}/jobs/page/${p}/`;
      const html = await fetchHTML(url);
      if (!html) break;
      addJobs(parseJobs(html, ''));
    }
    // Step 2: all 19 governorates, 3 at a time
    for (let i = 0; i < GOVS.length; i += 3) {
      const batch = GOVS.slice(i, i+3);
      await Promise.all(batch.map(async ([name, slug]) => {
        const html = await fetchHTML(`${BASE}/job-location/${slug}/`);
        if (html) addJobs(parseJobs(html, name));
      }));
    }
    setStatus('done');
  }

  useEffect(() => { runPipeline(); }, []);

  const filtered = useMemo(() => jobs.filter(j => {
    const sq = q.toLowerCase();
    return (!sq || j.position.toLowerCase().includes(sq) || j.company.toLowerCase().includes(sq))
      && (gov==='All' || j.governorate===gov)
      && (cat==='All' || j.category===cat)
      && (type==='All' || j.jobType===type);
  }), [jobs, q, gov, cat, type]);

  useEffect(() => setPage(1), [q, gov, cat, type]);

  const totalPages = Math.ceil(filtered.length / PER);
  const slice = filtered.slice((page-1)*PER, page*PER);

  return (
    <div className="job-portal">
      <div className="portal-header">
        <h1>فرص العمل في العراق</h1>
        <p>Live jobs across all 19 governorates</p>
        <div className="live-status">
          <span className={`dot dot-${status}`} />
          {status==='loading' && `Fetching… ${liveCount} live so far`}
          {status==='done' && `✓ ${liveCount} live jobs loaded`}
          {status==='error' && 'Network error — showing local data'}
          {status==='idle' && 'Starting…'}
          {status!=='loading' &&
            <button className="refresh-btn" onClick={()=>{ seen.current=new Set(fallback.jobs.map(j=>j.link)); setJobs(fallback.jobs); setLiveCount(0); runPipeline(); }}>↻</button>}
        </div>
      </div>

      <div className="filters-section">
        <div className="search-wrap">
          <i className="ti ti-search" aria-hidden="true" />
          <input className="search-input" placeholder="Search position or company…" value={q} onChange={e=>setQ(e.target.value)} />
        </div>
        <div className="filter-row">
          <div className="filter-item">
            <label>Governorate</label>
            <select value={gov} onChange={e=>setGov(e.target.value)}>
              <option value="All">All</option>
              {GOVS_ALL.map(g=><option key={g}>{g}</option>)}
            </select>
          </div>
          <div className="filter-item">
            <label>Category</label>
            <select value={cat} onChange={e=>setCat(e.target.value)}>
              <option value="All">All</option>
              {CATS.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="filter-item">
            <label>Type</label>
            <select value={type} onChange={e=>setType(e.target.value)}>
              <option value="All">All</option>
              {TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <button className="reset-btn" onClick={()=>{setQ('');setGov('All');setCat('All');setType('All');}}>Reset</button>
        </div>
      </div>

      <div className="results-bar">
        <span>{filtered.length} jobs {status==='loading'&&'(loading more…)'}</span>
        {totalPages>1 && <span>Page {page}/{totalPages}</span>}
      </div>

      <div className="jobs-container">
        {slice.length>0
          ? <div className="jobs-grid">{slice.map(j=><JobCard key={j.id} job={j}/>)}</div>
          : <div className="empty-state"><p>No results.</p><button onClick={()=>{setQ('');setGov('All');setCat('All');setType('All');}}>Clear filters</button></div>
        }
      </div>

      {totalPages>1 && (
        <div className="pagination">
          <button className="pag-btn" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>← Prev</button>
          <span className="pag-info">{page} / {totalPages}</span>
          <button className="pag-btn" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>Next →</button>
        </div>
      )}

      <div className="portal-footer">
        <p>Click any card to view & apply on the official portal</p>
        <p className="footer-sources">
          <a href="https://iqjscout.com" target="_blank" rel="noreferrer">Iraq Jobs Scout</a> ·{' '}
          <a href="https://www.bayt.com/en/iraq/jobs/" target="_blank" rel="noreferrer">Bayt.com</a> ·{' '}
          <a href="https://www.mselect.com/jobs" target="_blank" rel="noreferrer">mselect</a>
        </p>
      </div>
    </div>
  );
}

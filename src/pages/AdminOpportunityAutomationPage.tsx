import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Download, FileUp, Pencil, Play, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  API_BASE,
  AutomationCandidatesResponse,
  AutomationImportResult,
  AutomationStatus,
  AutomationStatusResponse,
  OpportunityAutomationSource,
  OpportunityCandidate,
  OpportunityRunLog,
  getToken,
  opportunityAutomation,
} from '../lib/api';

type Tab = 'dashboard' | 'sources' | 'import' | AutomationStatus | 'logs' | 'settings';
type Modal =
  | { kind: 'source'; source?: OpportunityAutomationSource }
  | { kind: 'candidate'; candidate: OpportunityCandidate; mode: 'view' | 'edit' }
  | { kind: 'confirm'; title: string; body: string; action: () => Promise<void>; danger?: boolean }
  | null;

const tabs: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'لوحة التحكم' },
  { id: 'sources', label: 'المصادر' },
  { id: 'import', label: 'استيراد CSV' },
  { id: 'pending_review', label: 'بانتظار المراجعة' },
  { id: 'approved', label: 'الموافق عليها' },
  { id: 'rejected', label: 'المرفوضة' },
  { id: 'duplicate', label: 'المكررة' },
  { id: 'expired', label: 'المنتهية' },
  { id: 'logs', label: 'سجلات التشغيل' },
  { id: 'settings', label: 'الإعدادات' },
];

const categories = ['job', 'internship', 'scholarship', 'training', 'event', 'volunteering', 'fellowship', 'competition', 'announcement', 'exam', 'registration'];
const sourceCategories = ['jobs', 'scholarships', 'internships', 'trainings', 'events', 'volunteering', 'fellowships', 'competitions', 'announcements', 'mixed'];
const sourceTypes = ['website', 'rss', 'api', 'manual_csv', 'university', 'ngo', 'un_agency', 'embassy', 'scholarship_portal', 'job_board', 'external', 'manual_or_limited'];
const limits = [10, 20, 50, 100];

const emptyCandidate: Partial<OpportunityCandidate> = {
  title: '',
  organization: '',
  category: 'internship',
  description: '',
  summary: '',
  eligibility: '',
  deadline: '',
  apply_url: '',
  source_url: '',
  image_url: '',
  country: 'Iraq',
  governorate: '',
  city: '',
  language: 'ar',
  salary_or_funding: '',
};

const emptySource: Partial<OpportunityAutomationSource> = {
  name: '',
  url: '',
  source_type: 'website',
  category_scope: 'jobs',
  country_scope: 'Iraq',
  governorate_scope: '',
  language: 'ar',
  crawl_frequency_hours: 24,
  notes: '',
};

export default function AdminOpportunityAutomationPage() {
  const { profile, user } = useAuth();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [status, setStatus] = useState<AutomationStatusResponse | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [sources, setSources] = useState<OpportunityAutomationSource[]>([]);
  const [logs, setLogs] = useState<OpportunityRunLog[]>([]);
  const [candidateData, setCandidateData] = useState<AutomationCandidatesResponse | null>(null);
  const [candidatePage, setCandidatePage] = useState(1);
  const [candidateLimit, setCandidateLimit] = useState(20);
  const [sourcePage, setSourcePage] = useState(1);
  const [sourceLimit, setSourceLimit] = useState(20);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ category: '', governorate: '', country: '', language: '', deadline: '', source: '', active: '', source_type: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [lastBackendError, setLastBackendError] = useState('');
  const [importResult, setImportResult] = useState<AutomationImportResult | null>(null);
  const [modal, setModal] = useState<Modal>(null);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator';
  const isCandidateTab = ['pending_review', 'approved', 'rejected', 'duplicate', 'expired'].includes(tab);
  const authTokenDetected = Boolean(getToken());

  const statusCounts = useMemo(() => {
    const base: Record<string, number> = { pending_review: 0, approved: 0, rejected: 0, duplicate: 0, expired: 0 };
    (stats?.byStatus || []).forEach((row: any) => { base[row.status] = Number(row.count); });
    if (status?.candidates.pending !== null) base.pending_review = Number(status?.candidates.pending || 0);
    if (status?.candidates.approved !== null) base.approved = Number(status?.candidates.approved || 0);
    return base;
  }, [stats, status]);

  const visibleSources = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = sources.filter((source) => {
      const matchesTerm = !term || source.name.toLowerCase().includes(term) || source.url.toLowerCase().includes(term);
      const matchesGov = !filters.governorate || source.governorate_scope === filters.governorate;
      const matchesCategory = !filters.category || source.category_scope === filters.category;
      const matchesType = !filters.source_type || source.source_type === filters.source_type;
      const active = Number(source.is_active) === 1;
      const matchesActive = !filters.active || (filters.active === 'active' ? active : !active);
      return matchesTerm && matchesGov && matchesCategory && matchesType && matchesActive;
    });
    return filtered;
  }, [sources, query, filters]);

  const sourceSlice = visibleSources.slice((sourcePage - 1) * sourceLimit, sourcePage * sourceLimit);

  const visibleCandidates = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (candidateData?.candidates || []).filter((item) => {
      const matchesTerm = !term || [item.title, item.organization, item.source_url].some((value) => (value || '').toLowerCase().includes(term));
      const matchesCountry = !filters.country || item.country === filters.country;
      const matchesLanguage = !filters.language || item.language === filters.language;
      const matchesDeadline = !filters.deadline || item.deadline === filters.deadline;
      const matchesSource = !filters.source || item.source_id === filters.source || item.source_url?.includes(filters.source);
      return matchesTerm && matchesCountry && matchesLanguage && matchesDeadline && matchesSource;
    });
  }, [candidateData, query, filters]);

  const loadAllAutomationData = async () => {
    const candidateStatus = isCandidateTab ? tab : 'pending_review';
    const [nextStatus, nextStats, nextSources, nextCandidateData, nextLogs] = await Promise.all([
      opportunityAutomation.getStatus(),
      opportunityAutomation.getStats(),
      opportunityAutomation.getSources(),
      opportunityAutomation.getCandidates({
        status: candidateStatus,
        page: candidatePage,
        limit: candidateLimit,
        category: filters.category,
        governorate: filters.governorate,
      }),
      opportunityAutomation.getLogs({ limit: 20 }),
    ]);
    setStatus(nextStatus);
    setStats(nextStats);
    setSources(nextSources);
    setCandidateData(nextCandidateData);
    setLogs(nextLogs);
  };

  const refresh = async () => {
    if (!isAdmin) return;
    if (!authTokenDetected) {
      setMessage('Admin login required');
      setLastBackendError('Admin login required');
      return;
    }
    setLoading(true);
    setMessage('');
    setLastBackendError('');
    try {
      await loadAllAutomationData();
    } catch (err: any) {
      const nextError = err?.message || 'تعذر تحميل البيانات. حاول مرة أخرى.';
      setMessage(nextError);
      setLastBackendError(nextError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [tab, candidatePage, candidateLimit, filters.category, filters.governorate]);

  useEffect(() => {
    setCandidatePage(1);
    setSourcePage(1);
  }, [tab, query, filters.category, filters.governorate, filters.active, filters.source_type]);

  if (!user) return <AccessState title="Admin login required" body="سجل الدخول بحساب مدير للوصول إلى هذه الصفحة." />;
  if (!isAdmin) return <AccessState title="Admin access only" body="هذه الصفحة مخصصة للمديرين فقط." />;

  const approve = (candidate: OpportunityCandidate) => setModal({
    kind: 'confirm',
    title: 'تأكيد الموافقة',
    body: status?.dryRun
      ? 'وضع التجربة مفعّل. الموافقة قد تغيّر حالة العنصر ولكن قد لا تنشره للعامة بعد.'
      : 'سيتم اعتماد هذه الفرصة ونشرها حسب إعدادات الخادم.',
    action: async () => {
      const result = await opportunityAutomation.approveCandidate(candidate.id);
      setMessage(result.dryRun ? 'تمت الموافقة في وضع التجربة ولم يتم النشر للعامة.' : 'تمت الموافقة والنشر.');
      await loadAllAutomationData();
    },
  });

  const candidateAction = (candidate: OpportunityCandidate, action: 'reject' | 'duplicate' | 'expired') => {
    const titles = { reject: 'رفض الفرصة', duplicate: 'تعليم كمكررة', expired: 'تعليم كمنتهية' };
    setModal({
      kind: 'confirm',
      title: titles[action],
      body: 'هل أنت متأكد من تنفيذ هذا الإجراء؟',
      danger: true,
      action: async () => {
        if (action === 'reject') await opportunityAutomation.rejectCandidate(candidate.id, 'Rejected by admin');
        if (action === 'duplicate') await opportunityAutomation.markDuplicate(candidate.id);
        if (action === 'expired') await opportunityAutomation.markExpired(candidate.id);
        await loadAllAutomationData();
      },
    });
  };

  const importCsv = async (file?: File) => {
    if (!file) return;
    setLoading(true);
    setMessage('');
    try {
      const result = await opportunityAutomation.importCsv(file);
      setImportResult(result);
      setMessage('تم استيراد CSV بنجاح. تظهر العناصر الجديدة بانتظار المراجعة.');
    } catch (err: any) {
      setMessage(err?.message || 'فشل استيراد CSV.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-6 text-slate-900" dir="rtl">
      <section className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-3xl bg-secondary p-5 text-white shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black text-primary">إدارة المدير</p>
              <h1 className="mt-1 text-2xl font-black">أتمتة الفرص والمنح والفعاليات</h1>
              <p className="mt-2 text-sm font-bold text-white/70">إدارة المصادر، الاستيراد، المراجعة، وسجلات التشغيل بدون تغيير الواجهة العامة.</p>
            </div>
            <button onClick={refresh} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-xs font-black text-secondary">
              <RefreshCw size={15} /> تحديث
            </button>
          </div>
        </header>

        <nav className="flex gap-2 overflow-x-auto rounded-3xl border border-slate-200 bg-white p-2">
          {tabs.map((item) => (
            <button key={item.id} onClick={() => setTab(item.id)} className={`whitespace-nowrap rounded-2xl px-4 py-3 text-xs font-black ${tab === item.id ? 'bg-secondary text-white' : 'bg-slate-50 text-slate-600'}`}>
              {item.label}
            </button>
          ))}
        </nav>

        <Diagnostics
          apiUrl={API_BASE}
          tokenDetected={authTokenDetected}
          sourcesCount={sources.length}
          candidatesCount={candidateData?.candidates?.length || 0}
          lastBackendError={lastBackendError}
        />
        {status?.dryRun && <WarningBanner />}
        {message && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">{message}</div>}
        {loading && <StateBox text="جاري التحميل..." />}

        {tab === 'dashboard' && <Dashboard status={status} stats={stats} logs={logs} counts={statusCounts} />}
        {tab === 'settings' && <Settings status={status} />}
        {tab === 'sources' && (
          <SourcesTab
            sources={sourceSlice}
            allSources={visibleSources}
            total={visibleSources.length}
            page={sourcePage}
            limit={sourceLimit}
            setPage={setSourcePage}
            setLimit={setSourceLimit}
            query={query}
            setQuery={setQuery}
            filters={filters}
            setFilters={setFilters}
            openSource={(source) => setModal({ kind: 'source', source })}
            runSource={async (id) => { await opportunityAutomation.runSource(id); setMessage('تم تشغيل المصدر.'); await loadAllAutomationData(); }}
            deleteSource={(source) => setModal({ kind: 'confirm', title: 'حذف المصدر', body: `هل تريد حذف ${source.name}؟`, danger: true, action: async () => { await opportunityAutomation.deleteSource(source.id); await loadAllAutomationData(); } })}
            runAll={async () => { const result = await opportunityAutomation.runNow(); setMessage(result.dryRun ? 'تم التشغيل في وضع التجربة.' : 'تم تشغيل كل المصادر النشطة.'); await loadAllAutomationData(); }}
          />
        )}
        {tab === 'import' && <ImportTab result={importResult} onImport={importCsv} />}
        {isCandidateTab && (
          <CandidatesTab
            status={tab as AutomationStatus}
            data={candidateData}
            candidates={visibleCandidates}
            page={candidatePage}
            limit={candidateLimit}
            setPage={setCandidatePage}
            setLimit={setCandidateLimit}
            query={query}
            setQuery={setQuery}
            filters={filters}
            setFilters={setFilters}
            open={(candidate, mode) => setModal({ kind: 'candidate', candidate, mode })}
            approve={approve}
            action={candidateAction}
          />
        )}
        {tab === 'logs' && <LogsTab logs={logs} />}
      </section>

      {modal?.kind === 'source' && <SourceModal source={modal.source} close={() => setModal(null)} saved={async () => { setModal(null); await loadAllAutomationData(); }} />}
      {modal?.kind === 'candidate' && <CandidateModal candidate={modal.candidate} mode={modal.mode} close={() => setModal(null)} saved={async () => { setModal(null); await loadAllAutomationData(); }} />}
      {modal?.kind === 'confirm' && <ConfirmModal modal={modal} close={() => setModal(null)} />}
    </main>
  );
}

function Dashboard({ status, stats, logs, counts }: { status: AutomationStatusResponse | null; stats: any; logs: OpportunityRunLog[]; counts: Record<string, number> }) {
  if (!status && !stats) return <StateBox text="لا توجد بيانات بعد" />;
  const cards = [
    ['إجمالي المصادر', status?.sources.total ?? 0],
    ['المصادر النشطة', status?.sources.active ?? 0],
    ['بانتظار المراجعة', counts.pending_review],
    ['الموافق عليها', counts.approved],
    ['المرفوضة', counts.rejected],
    ['المكررة', counts.duplicate],
    ['المنتهية', counts.expired],
    ['وضع التجربة', status?.dryRun ? 'مفعّل' : 'متوقف'],
  ];
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => <div key={String(label)}><StatCard label={String(label)} value={String(value)} /></div>)}
      </div>
      <section className="rounded-3xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-lg font-black">آخر سجلات التشغيل</h2>
        <LogsTable logs={logs.slice(0, 5)} />
      </section>
    </div>
  );
}

function Diagnostics({ apiUrl, tokenDetected, sourcesCount, candidatesCount, lastBackendError }: {
  apiUrl: string;
  tokenDetected: boolean;
  sourcesCount: number;
  candidatesCount: number;
  lastBackendError: string;
}) {
  return (
    <section className="grid gap-2 rounded-3xl border border-slate-200 bg-white p-4 text-xs font-black text-slate-600 md:grid-cols-5">
      <div><span className="text-slate-400">API URL</span><p className="mt-1 break-all text-secondary" dir="ltr">{apiUrl}</p></div>
      <div><span className="text-slate-400">Auth token</span><p className="mt-1 text-secondary">{tokenDetected ? 'yes' : 'no'}</p></div>
      <div><span className="text-slate-400">Loaded sources</span><p className="mt-1 text-secondary">{sourcesCount}</p></div>
      <div><span className="text-slate-400">Loaded candidates</span><p className="mt-1 text-secondary">{candidatesCount}</p></div>
      <div><span className="text-slate-400">Last backend error</span><p className="mt-1 text-secondary">{lastBackendError || 'none'}</p></div>
    </section>
  );
}

function SourcesTab(props: {
  sources: OpportunityAutomationSource[];
  allSources: OpportunityAutomationSource[];
  total: number;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  query: string;
  setQuery: (query: string) => void;
  filters: any;
  setFilters: (filters: any) => void;
  openSource: (source?: OpportunityAutomationSource) => void;
  runSource: (id: string) => Promise<void>;
  deleteSource: (source: OpportunityAutomationSource) => void;
  runAll: () => Promise<void>;
}) {
  const [selectedSourceId, setSelectedSourceId] = useState('');
  const selectedSource = props.allSources.find((source) => source.id === selectedSourceId);

  return (
    <div className="space-y-4">
      <Toolbar query={props.query} setQuery={props.setQuery} placeholder="بحث باسم المصدر أو الرابط">
        <select value={selectedSourceId} onChange={(e) => setSelectedSourceId(e.target.value)} className="filter min-w-56">
          <option value="">Run Source: اختر مصدر</option>
          {props.allSources.map((source) => <option key={source.id} value={source.id}>{source.name || source.url}</option>)}
        </select>
        <button disabled={!selectedSource} onClick={() => selectedSource && props.runSource(selectedSource.id)} className="btn-primary disabled:opacity-40"><Play size={14} /> Run Source</button>
        <select value={props.filters.category} onChange={(e) => props.setFilters({ ...props.filters, category: e.target.value })} className="filter"><option value="">كل التصنيفات</option>{sourceCategories.map((c) => <option key={c}>{c}</option>)}</select>
        <select value={props.filters.source_type} onChange={(e) => props.setFilters({ ...props.filters, source_type: e.target.value })} className="filter"><option value="">كل الأنواع</option>{sourceTypes.map((c) => <option key={c}>{c}</option>)}</select>
        <select value={props.filters.active} onChange={(e) => props.setFilters({ ...props.filters, active: e.target.value })} className="filter"><option value="">الكل</option><option value="active">نشط</option><option value="inactive">غير نشط</option></select>
        <input value={props.filters.governorate} onChange={(e) => props.setFilters({ ...props.filters, governorate: e.target.value })} placeholder="المحافظة" className="filter" />
        <button onClick={() => props.openSource()} className="btn-primary">إضافة مصدر</button>
        <button onClick={props.runAll} className="btn-dark"><Play size={14} /> تشغيل الكل</button>
      </Toolbar>
      {!props.sources.length ? <StateBox text="No opportunity sources found" /> : (
        <>
          <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white lg:block">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="p-3">المصدر</th><th>الرابط</th><th>النوع</th><th>التصنيف</th><th>الحالة</th><th>آخر فحص</th><th>إجراءات</th></tr></thead>
              <tbody>{props.sources.map((source) => <SourceRow key={source.id} source={source} {...props} />)}</tbody>
            </table>
          </div>
          <div className="grid gap-3 lg:hidden">{props.sources.map((source) => <SourceCard key={source.id} source={source} {...props} />)}</div>
        </>
      )}
      <Pagination page={props.page} limit={props.limit} total={props.total} setPage={props.setPage} setLimit={props.setLimit} />
    </div>
  );
}

function ImportTab({ result, onImport }: { result: AutomationImportResult | null; onImport: (file?: File) => void }) {
  const downloadExample = () => {
    const csv = 'title,organization,category,description,summary,eligibility,deadline,published_date,apply_url,source_url,image_url,country,governorate,city,language,salary_or_funding,source_name\n"Future Internship","Rafid Test Lab","internship","Description","Summary","Students","2026-12-31","2026-06-10","https://example.com/apply","https://example.com/source","","Iraq","Baghdad","Baghdad","ar","Unpaid","Manual CSV"';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'example_opportunities.csv';
    link.click();
    URL.revokeObjectURL(href);
  };
  return (
    <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-primary/50 bg-primary/10 p-8 text-center font-black text-secondary">
          <FileUp /> اختر ملف CSV
          <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => onImport(e.target.files?.[0])} />
        </label>
        <button onClick={downloadExample} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-xs font-black text-white"><Download size={14} /> تحميل مثال CSV</button>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-black">الأعمدة المطلوبة</h2>
        <p className="mt-2 text-sm font-bold leading-7 text-slate-600">title, organization, category, description, summary, eligibility, deadline, published_date, apply_url, source_url, image_url, country, governorate, city, language, salary_or_funding, source_name</p>
        {result && <div className="mt-5 grid gap-3 sm:grid-cols-5">
          <StatCard label="الصفوف" value={String(result.summary.total)} />
          <StatCard label="المضافة" value={String(result.summary.imported)} />
          <StatCard label="المكررة" value={String(result.summary.duplicates)} />
          <StatCard label="المنتهية" value={String(result.summary.expired)} />
          <StatCard label="الأخطاء" value={String(result.summary.errors)} />
        </div>}
        {result?.errors?.length ? <pre className="mt-4 overflow-auto rounded-2xl bg-rose-50 p-3 text-xs text-rose-700">{result.errors.join('\n')}</pre> : null}
      </div>
    </section>
  );
}

function CandidatesTab(props: {
  status: AutomationStatus;
  data: AutomationCandidatesResponse | null;
  candidates: OpportunityCandidate[];
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  query: string;
  setQuery: (query: string) => void;
  filters: any;
  setFilters: (filters: any) => void;
  open: (candidate: OpportunityCandidate, mode: 'view' | 'edit') => void;
  approve: (candidate: OpportunityCandidate) => void;
  action: (candidate: OpportunityCandidate, action: 'reject' | 'duplicate' | 'expired') => void;
}) {
  return (
    <div className="space-y-4">
      <Toolbar query={props.query} setQuery={props.setQuery} placeholder="بحث بالعنوان أو المؤسسة أو المصدر">
        <select value={props.filters.category} onChange={(e) => props.setFilters({ ...props.filters, category: e.target.value })} className="filter"><option value="">كل التصنيفات</option>{categories.map((c) => <option key={c}>{c}</option>)}</select>
        <input value={props.filters.governorate} onChange={(e) => props.setFilters({ ...props.filters, governorate: e.target.value })} placeholder="المحافظة" className="filter" />
        <input value={props.filters.country} onChange={(e) => props.setFilters({ ...props.filters, country: e.target.value })} placeholder="البلد" className="filter" />
        <input value={props.filters.language} onChange={(e) => props.setFilters({ ...props.filters, language: e.target.value })} placeholder="اللغة" className="filter" />
      </Toolbar>
      {!props.candidates.length ? <StateBox text={props.status === 'pending_review' ? 'لا توجد فرص بانتظار المراجعة' : 'لا توجد نتائج مطابقة'} /> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{props.candidates.map((candidate) => <CandidateCard key={candidate.id} candidate={candidate} {...props} />)}</div>}
      <Pagination page={props.page} limit={props.limit} total={props.data?.pagination.total || props.candidates.length} setPage={props.setPage} setLimit={props.setLimit} />
    </div>
  );
}

function LogsTab({ logs }: { logs: OpportunityRunLog[] }) {
  return <section className="rounded-3xl border border-slate-200 bg-white p-5"><LogsTable logs={logs} /></section>;
}

function Settings({ status }: { status: AutomationStatusResponse | null }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <StatCard label="DRY_RUN_AUTOMATION" value={status?.dryRun ? 'true' : 'false'} />
      <StatCard label="آخر تشغيل" value={status?.lastRun?.started_at || 'لا يوجد'} />
      <StatCard label="حالة الخادم" value="متصل" />
    </div>
  );
}

function SourceRow({ source, openSource, runSource, deleteSource }: any) {
  return <tr className="border-t border-slate-100"><td className="p-3 font-black">{source.name}</td><td className="max-w-xs truncate p-3 text-primary">{source.url}</td><td>{source.source_type}</td><td>{source.category_scope}</td><td><StatusBadge value={Number(source.is_active) === 1 ? 'نشط' : 'متوقف'} /></td><td>{source.last_checked_at || '-'}</td><td className="p-3"><ActionButtons onEdit={() => openSource(source)} onRun={() => runSource(source.id)} onDelete={() => deleteSource(source)} /></td></tr>;
}

function SourceCard({ source, openSource, runSource, deleteSource }: any) {
  return <div className="rounded-3xl border border-slate-200 bg-white p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-black">{source.name}</h3><p className="break-all text-xs font-bold text-primary">{source.url}</p></div><StatusBadge value={Number(source.is_active) === 1 ? 'نشط' : 'متوقف'} /></div><p className="mt-2 text-xs font-bold text-slate-500">{source.source_type} · {source.category_scope} · {source.governorate_scope || 'كل العراق'}</p>{source.last_error && <p className="mt-2 rounded-xl bg-rose-50 p-2 text-xs font-bold text-rose-700">{source.last_error}</p>}<div className="mt-3"><ActionButtons onEdit={() => openSource(source)} onRun={() => runSource(source.id)} onDelete={() => deleteSource(source)} /></div></div>;
}

function CandidateCard({ candidate, status, open, approve, action }: any) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3"><h3 className="font-black leading-6">{candidate.title}</h3><StatusBadge value={candidate.status} /></div>
      <p className="mt-2 text-sm font-bold text-slate-600">{candidate.organization || 'بدون مؤسسة'} · {candidate.governorate || candidate.country || '-'}</p>
      <p className="mt-1 text-xs font-bold text-slate-500">الموعد: {candidate.deadline || '-'} · الثقة: {candidate.confidence_score ?? 50}</p>
      <p className="mt-1 truncate text-xs font-bold text-primary">{candidate.source_url || '-'}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="btn-light" onClick={() => open(candidate, 'view')}>التفاصيل</button>
        <button className="btn-light" onClick={() => open(candidate, 'edit')}><Pencil size={14} /> تعديل</button>
        {status === 'pending_review' && <><button className="btn-primary" onClick={() => approve(candidate)}>موافقة</button><button className="btn-danger" onClick={() => action(candidate, 'reject')}>رفض</button><button className="btn-light" onClick={() => action(candidate, 'duplicate')}>مكرر</button><button className="btn-light" onClick={() => action(candidate, 'expired')}>منتهي</button></>}
      </div>
    </article>
  );
}

function SourceModal({ source, close, saved }: { source?: OpportunityAutomationSource; close: () => void; saved: () => Promise<void> }) {
  const [form, setForm] = useState<Partial<OpportunityAutomationSource>>(source || emptySource);
  const save = async () => {
    if (!form.name || !form.url || !form.source_type || !form.category_scope) return;
    if (source) await opportunityAutomation.updateSource(source.id, form);
    else await opportunityAutomation.createSource(form as any);
    await saved();
  };
  return <ModalShell title={source ? 'تعديل مصدر' : 'إضافة مصدر'} close={close}><div className="grid gap-3 md:grid-cols-2"><TextInput label="الاسم" value={form.name} set={(v) => setForm({ ...form, name: v })} /><TextInput label="الرابط" value={form.url} set={(v) => setForm({ ...form, url: v })} /><SelectInput label="النوع" value={form.source_type} options={sourceTypes} set={(v) => setForm({ ...form, source_type: v })} /><SelectInput label="التصنيف" value={form.category_scope} options={sourceCategories} set={(v) => setForm({ ...form, category_scope: v })} /><TextInput label="البلد" value={form.country_scope} set={(v) => setForm({ ...form, country_scope: v })} /><TextInput label="المحافظة" value={form.governorate_scope} set={(v) => setForm({ ...form, governorate_scope: v })} /><TextInput label="اللغة" value={form.language} set={(v) => setForm({ ...form, language: v })} /><TextInput label="ملاحظات" value={form.notes} set={(v) => setForm({ ...form, notes: v })} /></div><button onClick={save} className="mt-4 btn-primary">حفظ</button></ModalShell>;
}

function CandidateModal({ candidate, mode, close, saved }: { candidate: OpportunityCandidate; mode: 'view' | 'edit'; close: () => void; saved: () => Promise<void> }) {
  const [form, setForm] = useState<Partial<OpportunityCandidate>>({ ...emptyCandidate, ...candidate });
  const editable = mode === 'edit';
  const save = async () => {
    await opportunityAutomation.updateCandidate(candidate.id, form);
    await saved();
  };
  return <ModalShell title={editable ? 'تعديل الفرصة' : 'تفاصيل الفرصة'} close={close}><div className="grid gap-3 md:grid-cols-2">{(['title','organization','category','deadline','apply_url','source_url','image_url','country','governorate','city','language','salary_or_funding'] as const).map((field) => <div key={field}><TextInput label={field} value={(form as any)[field]} disabled={!editable} set={(v) => setForm({ ...form, [field]: v })} /></div>)}<TextArea label="description" value={form.description} disabled={!editable} set={(v) => setForm({ ...form, description: v })} /><TextArea label="summary" value={form.summary} disabled={!editable} set={(v) => setForm({ ...form, summary: v })} /><TextArea label="eligibility" value={form.eligibility} disabled={!editable} set={(v) => setForm({ ...form, eligibility: v })} /></div><p className="mt-3 text-xs font-bold text-slate-500">Confidence: {candidate.confidence_score ?? 50}</p>{editable && <button onClick={save} className="mt-4 btn-primary">حفظ التعديل</button>}</ModalShell>;
}

function ConfirmModal({ modal, close }: { modal: Extract<Modal, { kind: 'confirm' }>; close: () => void }) {
  const [busy, setBusy] = useState(false);
  return <ModalShell title={modal.title} close={close}><p className="text-sm font-bold text-slate-600">{modal.body}</p><div className="mt-5 flex gap-2"><button onClick={close} className="btn-light">إلغاء</button><button disabled={busy} onClick={async () => { setBusy(true); await modal.action(); close(); }} className={modal.danger ? 'btn-danger' : 'btn-primary'}>تأكيد</button></div></ModalShell>;
}

function ModalShell({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"><div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-3xl bg-white p-5 shadow-2xl"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black">{title}</h2><button onClick={close} className="rounded-full bg-slate-100 p-2"><X size={18} /></button></div>{children}</div></div>;
}

function Toolbar({ query, setQuery, placeholder, children }: { query: string; setQuery: (v: string) => void; placeholder: string; children: ReactNode }) {
  return <div className="rounded-3xl border border-slate-200 bg-white p-4"><div className="grid gap-2 lg:grid-cols-[1fr_auto]"><label className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholder} className="w-full bg-transparent text-sm font-bold outline-none" /></label><div className="flex flex-wrap gap-2">{children}</div></div></div>;
}

function Pagination({ page, limit, total, setPage, setLimit }: { page: number; limit: number; total: number; setPage: (p: number) => void; setLimit: (l: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-3 text-sm font-bold"><span>الصفحة {page} من {totalPages} · الإجمالي {total}</span><div className="flex gap-2"><select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="filter">{limits.map((l) => <option key={l}>{l}</option>)}</select><button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-light disabled:opacity-40">السابق</button><button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="btn-light disabled:opacity-40">التالي</button></div></div>;
}

function LogsTable({ logs }: { logs: OpportunityRunLog[] }) {
  if (!logs.length) return <StateBox text="لا توجد سجلات تشغيل بعد" />;
  return <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-right text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="p-3">Run ID</th><th>بدأ</th><th>انتهى</th><th>الحالة</th><th>مصادر</th><th>عناصر</th><th>مدخلة</th><th>مكررة</th><th>أخطاء</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id} className="border-t border-slate-100"><td className="p-3 font-mono text-xs">{log.id}</td><td>{log.started_at}</td><td>{log.finished_at || '-'}</td><td><StatusBadge value={log.status} /></td><td>{log.sources_checked}</td><td>{log.items_found}</td><td>{log.items_inserted}</td><td>{log.duplicates_found}</td><td className="max-w-xs truncate text-rose-600">{log.errors_json || '-'}</td></tr>)}</tbody></table></div>;
}

function WarningBanner() {
  return <div className="flex gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900"><AlertTriangle className="shrink-0" /> وضع التجربة مفعّل. الموافقة قد تغيّر حالة العنصر ولكن قد لا تنشره للعامة بعد.</div>;
}

function AccessState({ title, body }: { title: string; body: string }) {
  return <main className="grid min-h-screen place-items-center bg-slate-50 p-4" dir="rtl"><div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-xl"><h1 className="text-2xl font-black text-secondary">{title}</h1><p className="mt-3 text-sm font-bold text-slate-500">{body}</p></div></main>;
}

function StateBox({ text }: { text: string }) {
  return <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-black text-slate-500">{text}</div>;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-3xl border border-slate-200 bg-white p-4"><p className="text-xs font-black text-slate-500">{label}</p><p className="mt-2 text-2xl font-black text-secondary">{value}</p></div>;
}

function StatusBadge({ value }: { value: string }) {
  return <span className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-[11px] font-black text-secondary">{value}</span>;
}

function ActionButtons({ onEdit, onRun, onDelete }: { onEdit: () => void; onRun: () => void; onDelete: () => void }) {
  return <div className="flex flex-wrap gap-2"><button onClick={onEdit} className="btn-light"><Pencil size={14} /> تعديل</button><button onClick={onRun} className="btn-primary"><Play size={14} /> تشغيل</button><button onClick={onDelete} className="btn-danger"><Trash2 size={14} /> حذف</button></div>;
}

function TextInput({ label, value, set, disabled }: { label: string; value?: string | null; set: (v: string) => void; disabled?: boolean }) {
  return <label className="text-xs font-black text-slate-500">{label}<input disabled={disabled} value={value || ''} onChange={(e) => set(e.target.value)} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 outline-none disabled:bg-slate-50" /></label>;
}

function TextArea({ label, value, set, disabled }: { label: string; value?: string | null; set: (v: string) => void; disabled?: boolean }) {
  return <label className="md:col-span-2 text-xs font-black text-slate-500">{label}<textarea disabled={disabled} value={value || ''} onChange={(e) => set(e.target.value)} className="mt-1 min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 outline-none disabled:bg-slate-50" /></label>;
}

function SelectInput({ label, value, options, set }: { label: string; value?: string | null; options: string[]; set: (v: string) => void }) {
  return <label className="text-xs font-black text-slate-500">{label}<select value={value || ''} onChange={(e) => set(e.target.value)} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 outline-none">{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

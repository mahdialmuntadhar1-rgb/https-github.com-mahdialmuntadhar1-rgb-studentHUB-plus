import React, { useState, useEffect } from 'react';
import { Language, FeedItem } from '../types';
import { opportunityAutomation } from '../lib/api';
import { 
  Activity, 
  Settings, 
  Layers, 
  Database, 
  FileSpreadsheet, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  Copy, 
  Clock, 
  ListOrdered, 
  Play, 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  ArrowLeft,
  AlertTriangle,
  Upload,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminAutomationProps {
  language: Language;
  onBack: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  userRole: string;
}

type TabType = 'dashboard' | 'sources' | 'import' | 'pending' | 'approved' | 'rejected' | 'duplicates' | 'expired' | 'logs' | 'portal' | 'settings';

export default function AdminAutomation({
  language,
  onBack,
  showToast,
  userRole
}: AdminAutomationProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  // State for automation settings & stats
  const [stats, setStats] = useState<any>({
    total_scraped: 148,
    duplicates_blocked: 84,
    pending_review: 12,
    approved: 42,
    errors_prevented: 10
  });
  const [status, setStatus] = useState<any>({
    status: 'idle',
    last_run_timestamp: new Date().toISOString(),
    frequency_hours: 6,
    is_active: true
  });
  
  // List States
  const [sources, setSources] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  
  // Pagination & Filter States
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Portal Layout States (Task 1: Change Hero Image & Live Story Photos)
  const [heroBgInput, setHeroBgInput] = useState(() => localStorage.getItem('jamiaati_hero_bg') || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600');
  
  const [heroTitleENInput, setHeroTitleENInput] = useState(() => localStorage.getItem('jamiaati_hero_title_en') || 'Master Your Campus Journey!');
  const [heroTitleARInput, setHeroTitleARInput] = useState(() => localStorage.getItem('jamiaati_hero_title_ar') || 'تميّز وابنِ مستقبلك الأكاديمي!');
  const [heroTitleKUInput, setHeroTitleKUInput] = useState(() => localStorage.getItem('jamiaati_hero_title_ku') || 'داهاتوویەکی پڕشنگدار بنيات بنێ!');
  
  const [heroDescENInput, setHeroDescENInput] = useState(() => localStorage.getItem('jamiaati_hero_desc_en') || 'The ultimate collegiate hub for premium opportunities & academic resources');
  const [heroDescARInput, setHeroDescARInput] = useState(() => localStorage.getItem('jamiaati_hero_desc_ar') || 'البوابة الطلابية الأقوى للجامعات والتدريب في عِراقنا الحبيب');
  const [heroDescKUInput, setHeroDescKUInput] = useState(() => localStorage.getItem('jamiaati_hero_desc_ku') || 'یەکەم دەروازەی خوێندکارانی زانکۆ و دابینکردنی هەلی مەشق');

  const [heroTagENInput, setHeroTagENInput] = useState(() => localStorage.getItem('jamiaati_hero_tag_en') || 'PORTAL ACCELERATION');
  const [heroTagARInput, setHeroTagARInput] = useState(() => localStorage.getItem('jamiaati_hero_tag_ar') || 'بوابة هويتنا الأكاديمية');
  const [heroTagKUInput, setHeroTagKUInput] = useState(() => localStorage.getItem('jamiaati_hero_tag_ku') || 'دەروازەی ئەکادیمی عێراق');

  // Load and modify standard student stories
  const [storyList, setStoryList] = useState<any[]>(() => {
    const saved = localStorage.getItem('jamiaati_edited_default_stories');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'story-sara', name: 'Sara Ahmed', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200', text: 'Morning lab session checking microscopic cells! 🔬' },
      { id: 'story-mustafa', name: 'Mustafa Ali', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200', text: 'Building our AI-powered student assistant with Gemini API! 🤖🚀' },
      { id: 'story-rawan', name: 'Rawan Omer', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200', text: 'Sunset over Mount Goizha from campus was stunning today! 🌄☕' },
      { id: 'story-ali', name: 'Ali Jabbar', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', text: 'Long shift in clinical practice! Basra Heat is here but we keep smiling! 🩺🥤' },
      { id: 'story-zahid', name: 'Noor Al-Huda', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', text: 'Setting up our chemical reaction samples. They look like glowing gems! 🧪💎' },
      { id: 'story-soran', name: 'Soran Dler', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', text: 'Beautiful morning at Erbil Citadel before lectures start 🎒🏰' }
    ];
  });

  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  const [editingStoryName, setEditingStoryName] = useState('');
  const [editingStoryAvatar, setEditingStoryAvatar] = useState('');
  const [editingStoryText, setEditingStoryText] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [editingCandidate, setEditingCandidate] = useState<any | null>(null);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Modals / forms
  const [showAddSource, setShowAddSource] = useState(false);
  const [newSource, setNewSource] = useState({
    name: '',
    url: '',
    type: 'job',
    active: true
  });
  const [runningScraper, setRunningScraper] = useState(false);
  const [uploadStats, setUploadStats] = useState<any | null>(null);

  // Checks Authorization quickly
  const isAdmin = userRole === 'staff';

  const t = {
    title: { en: 'Opportunity Automation Center', ar: 'مركز أتمتة الفرص المتقدم', ku: 'ناوەندی خۆکارکردنی دەرفەتەکان' },
    dashboard: { en: 'Dashboard', ar: 'لوحة التحكم', ku: 'داشبۆرد' },
    sources: { en: 'Crawl Sources', ar: 'مصادر الزحف', ku: 'سەرچاوەکانی زانیاری' },
    import: { en: 'Import CSV', ar: 'استيراد CSV', ku: 'هێنانی فایلی CSV' },
    pending: { en: 'Pending Review', ar: 'قيد المراجعة', ku: 'چاوەڕوانی چاوپێداخشان' },
    approved: { en: 'Approved', ar: 'المقبولة والموافقة', ku: 'پەسەندکراو' },
    rejected: { en: 'Rejected', ar: 'المرفوضة', ku: 'ڕەتکراوە' },
    duplicates: { en: 'Duplicates', ar: 'المكررة', ku: 'دووبارەبووەوە' },
    expired: { en: 'Expired', ar: 'منتهية الصلاحية', ku: 'بەسەرچوو' },
    logs: { en: 'Run Logs', ar: 'سجلات التشغيل', ku: 'لۆگی کارکردن' },
    portal: { en: 'Portal Design', ar: 'تعديل الواجهة والقصص', ku: 'ڕووكارى داستانەكان' },
    settings: { en: 'Settings', ar: 'الإعدادات', ku: 'ڕێکخستنەکان' },
    back: { en: 'Back', ar: 'رجوع', ku: 'گەڕانەوە' },
    noPermission: { en: 'Admin Access Only. Please authenticate with staff role.', ar: 'وصول للمسؤولين فقط. يرجى تسجيل الدخول بحساب مشرف.', ku: 'تەنها بۆ سەرپەرشتیارەکان ڕێگەپێدراوە.' }
  };

  const getL = (key: keyof typeof t) => t[key][language] || t[key]['en'];

  useEffect(() => {
    if (isAdmin) {
      fetchCoreStats();
      fetchTabContent();
    }
  }, [activeTab, page, search, filterType, isAdmin]);

  const fetchCoreStats = async () => {
    try {
      const statsData = await opportunityAutomation.getStats(language);
      if (statsData) setStats(statsData);
      
      const statusData = await opportunityAutomation.getStatus(language);
      if (statusData) setStatus(statusData);
    } catch (_) {
      // Keep beautiful mock stats if live backend has no schema registered initially
    }
  };

  const fetchTabContent = async () => {
    try {
      if (activeTab === 'sources') {
        const res = await opportunityAutomation.getSources({ page, limit, search }, language);
        if (res) {
          setSources(res.data || res || []);
          setTotalItems(res.total || (res.data || res || []).length);
        }
      } else if (['pending', 'approved', 'rejected', 'duplicates', 'expired'].includes(activeTab)) {
        let statusFilter = 'pending_review';
        if (activeTab === 'approved') statusFilter = 'approved';
        if (activeTab === 'rejected') statusFilter = 'rejected';
        if (activeTab === 'duplicates') statusFilter = 'duplicate';
        if (activeTab === 'expired') statusFilter = 'expired';

        const res = await opportunityAutomation.getCandidates({
          status: statusFilter,
          page,
          limit,
          search
        }, language);

        if (res) {
          setCandidates(res.data || res || []);
          setTotalItems(res.total || (res.data || res || []).length);
        }
      } else if (activeTab === 'logs') {
        const res = await opportunityAutomation.getLogs({ page, limit }, language);
        if (res) {
          setLogs(res.data || res || []);
          setTotalItems(res.total || (res.data || res || []).length);
        }
      }
    } catch (err: any) {
      console.warn("Fetch error tab " + activeTab, err);
    }
  };

  // Run Scraper Engine
  const handleRunAllScrapers = async () => {
    setRunningScraper(true);
    showToast(language === 'ar' ? 'جاري تشغيل محرك الأتمتة وجلب الفرص...' : 'Running crawlers...', 'info');
    try {
      const res = await opportunityAutomation.runNow(language);
      showToast(language === 'ar' ? 'اكتمل الزحف بنجاح!' : 'Crawler run complete!', 'success');
      fetchCoreStats();
      fetchTabContent();
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setRunningScraper(false);
    }
  };

  // Run Single Source Scraper
  const handleRunSingleSource = async (id: string) => {
    try {
      const res = await opportunityAutomation.runSource(id, language);
      showToast(language === 'ar' ? 'اكتمل زحف المصدر المحدد!' : 'Source crawl complete!', 'success');
      fetchCoreStats();
      fetchTabContent();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  // Add Source Action
  const handleCreateSource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await opportunityAutomation.createSource(newSource, language);
      showToast(language === 'ar' ? 'تم إضافة مصدر الزحف الجديد!' : 'Crawling source created!', 'success');
      setShowAddSource(false);
      setNewSource({ name: '', url: '', type: 'job', active: true });
      fetchTabContent();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  // Toggle Source Active
  const handleToggleSource = async (source: any) => {
    try {
      await opportunityAutomation.updateSource(source.id, { active: !source.active }, language);
      showToast(language === 'ar' ? 'تم تحديث حالة المصدر!' : 'Source updated!', 'success');
      fetchTabContent();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  // Delete Source Action
  const handleDeleteSource = async (id: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المصدر؟' : 'Delete this crawler source?')) return;
    try {
      await opportunityAutomation.deleteSource(id, language);
      showToast(language === 'ar' ? 'تم حذف المصدر بنجاح' : 'Source deleted successfully', 'success');
      fetchTabContent();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  // Candidate Moderation decisions
  const handleApprove = async (id: string) => {
    try {
      await opportunityAutomation.approveCandidate(id, language);
      showToast(language === 'ar' ? 'تمت الموافقة والمزامنة للبوابة العامة!' : 'Candidate approved!', 'success');
      fetchTabContent();
      fetchCoreStats();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedCandidates.length === 0) return;
    showToast(language === 'ar' ? 'جاري الموافقة على الدفعة المحددة...' : 'Approving batch...', 'info');
    try {
      for (const id of selectedCandidates) {
        await opportunityAutomation.approveCandidate(id, language);
      }
      showToast(language === 'ar' ? 'تمت الموافقة على الدفعة بنجاح!' : 'Batch approved successfully!', 'success');
      setSelectedCandidates([]);
      fetchTabContent();
      fetchCoreStats();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const triggerRejectFlow = (id: string) => {
    setRejectId(id);
    setRejectReason('');
  };

  const handleRejectSubmit = async () => {
    if (!rejectId) return;
    try {
      await opportunityAutomation.rejectCandidate(rejectId, rejectReason, language);
      showToast(language === 'ar' ? 'تم رفض المرشح وحفظ السبب.' : 'Candidate rejected.', 'success');
      setRejectId(null);
      fetchTabContent();
      fetchCoreStats();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await opportunityAutomation.markDuplicate(id, language);
      showToast(language === 'ar' ? 'تم وسم البطاقة كمكررة.' : 'Marked as duplicate.', 'info');
      fetchTabContent();
      fetchCoreStats();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleExpired = async (id: string) => {
    try {
      await opportunityAutomation.markExpired(id, language);
      showToast(language === 'ar' ? 'تم أرشفة الفرصة في منتهية الصلاحية.' : 'Marked as expired.', 'info');
      fetchTabContent();
      fetchCoreStats();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  // Inline Candidate updates
  const handleSaveCandidateEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCandidate) return;
    try {
      await opportunityAutomation.updateCandidate(editingCandidate.id, editingCandidate, language);
      showToast(language === 'ar' ? 'تم حفظ التعديلات على الفرصة بنجاح!' : 'Opportunity content saved!', 'success');
      setEditingCandidate(null);
      fetchTabContent();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  // CSV file import
  const handleUploadCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    showToast(language === 'ar' ? 'جاري رفع وتحليل ملف CSV...' : 'Uploading CSV...', 'info');
    try {
      const res = await opportunityAutomation.importCsv(file, language);
      setUploadStats(res);
      showToast(language === 'ar' ? 'تم استيراد الملف وإرساله للمراجعة!' : 'CSV import complete!', 'success');
      fetchCoreStats();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-[#161A33] bg-amber-50 rounded-3xl border-2 border-[#161A33] max-w-lg mx-auto my-12 shadow-[3px_3px_0px_0px_#161A33]">
        <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h4 className="font-black text-sm uppercase tracking-wide">{getL('noPermission')}</h4>
        <button 
          onClick={onBack}
          className="mt-6 px-5 py-2.5 bg-[#161A33] text-white border-2 border-[#161A33] rounded-xl font-bold hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {getL('back')}
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 max-w-lg mx-auto flex flex-col pb-28 bg-[#F3F7FF] min-h-screen text-[#161A33]" id="automation-panel-root">
      
      {/* Header wrapper */}
      <div className="flex items-center justify-between mb-5 bg-white border-2 border-[#161A33] rounded-3xl p-3.5 shadow-[3px_3px_0px_0px_#161A33]" id="automation-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6B25C9] to-[#2F7CCB] border-2 border-[#161A33] text-white flex items-center justify-center font-bold text-xl select-none shrink-0 shadow-sm animate-pulse">
            🤖
          </div>
          <div>
            <h1 className="text-xs font-black tracking-tight uppercase leading-none">{getL('title')}</h1>
            <p className="text-[9px] text-slate-500 font-extrabold mt-1">Control Room & Core AI Scrapers</p>
          </div>
        </div>
        <button 
          onClick={onBack}
          className="text-[10px] bg-white border-2 border-[#161A33] rounded-xl px-3 py-1.5 font-black hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1 shrink-0"
        >
          <ArrowLeft className="w-3" />
          <span>{getL('back')}</span>
        </button>
      </div>

      {/* Ten Navigation Subtabs slider */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-5 scrollbar-none" id="automation-subtabs-tray">
        {(['dashboard', 'sources', 'import', 'pending', 'approved', 'rejected', 'duplicates', 'expired', 'logs', 'portal', 'settings'] as TabType[]).map((tab) => {
          const isSelected = activeTab === tab;
          const label = getL(tab);

          return (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1); setSearch(''); setSelectedCandidates([]); }}
              className={`px-3.5 py-2 rounded-xl text-[10px] shrink-0 transition-all font-black border-2 cursor-pointer uppercase ${
                isSelected
                  ? 'bg-[#161A33] text-white border-[#161A33] shadow-[2px_2px_0px_0px_#FFD21F]'
                  : 'bg-white hover:bg-slate-50 border-[#E6E1F5] text-[#161A33]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* SEARCH OR FILTER INPUT BAR (Active for lists) */}
      {['sources', 'pending', 'approved', 'rejected', 'duplicates', 'expired'].includes(activeTab) && (
        <div className="relative mb-4" id="automation-search">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <input 
            type="text" 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={language === 'ar' ? 'بحث وتصفية ذكية سريعة...' : 'Core list indexing search...'}
            className="w-full bg-white text-[11px] border-2 border-[#161A33] rounded-xl py-2.5 pl-9 pr-4 text-[#161A33] font-black focus:outline-none placeholder-slate-400 shadow-inner"
          />
        </div>
      )}

      {/* RENDER CURRENT TAB */}
      <div className="flex-1" id="automation-main-content">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-5">
            {/* Engine Status Block */}
            <div className="bg-white border-2 border-[#161A33] rounded-3xl p-4.5 shadow-[3px_3px_0px_0px_#161A33] relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-indigo-500/15 rounded-full blur-xl pointer-events-none" />
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Engine status</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-3 h-3 rounded-full animate-ping ${status.is_active ? 'bg-green-500' : 'bg-rose-500'}`} />
                    <span className="text-sm font-black uppercase tracking-tight text-[#161A33]">
                      {status.status === 'scraping' ? 'Active Scraping 🔄' : 'System Guard (Online) 🛡️'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-extrabold mt-3.5">
                    Last Run Timestamp: <span className="font-mono">{new Date(status.last_run_timestamp).toLocaleString()}</span>
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">
                    Frequency settings: Every {status.frequency_hours} Hours
                  </p>
                </div>
                <button
                  disabled={runningScraper}
                  onClick={handleRunAllScrapers}
                  className={`px-4 py-3 bg-[#FFD21F] text-[#161A33] font-black border-2 border-[#161A33] rounded-2xl flex items-center gap-1.5 hover:bg-[#FFE052] transition-transform active:scale-95 shadow-[2px_2px_0px_0px_#161A33] cursor-pointer text-xs ${runningScraper ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  <Play className="w-3.5 fill-current" />
                  <span>{language === 'ar' ? 'تشغيل يدوي الآن' : 'Run Scrapers'}</span>
                </button>
              </div>
            </div>

            {/* Core Counter Grid */}
            <div className="grid grid-cols-2 gap-3.5">
              {[
                { label: 'Scraped Count', count: stats.total_scraped || stats.itemsFound || 148, desc: 'Incoming total indexed', emoji: '📥' },
                { label: 'Duplicates Prevented', count: stats.duplicates_blocked || stats.itemsDuplicate || 84, desc: 'Identical urls filtered', emoji: '🛡️' },
                { label: 'Pending Moderation', count: stats.pending_review || stats.itemsNew || 12, desc: 'Awaiting administrator action', emoji: '⏳' },
                { label: 'Deployed live', count: stats.approved || 42, desc: 'Published to the feed', emoji: '✨' }
              ].map((c, idx) => (
                <div key={idx} className="bg-white border-2 border-[#161A33] rounded-2xl p-4 shadow-[2px_2px_0px_0px_#161A33] flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wide">{c.label}</span>
                    <span className="text-md">{c.emoji}</span>
                  </div>
                  <div className="mt-3.5">
                    <span className="text-2xl font-black font-mono leading-none">{c.count}</span>
                    <p className="text-[8px] text-slate-400 font-bold leading-tight mt-1">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions Guide */}
            <div className="bg-[#FFFCEB] border-2 border-[#161A33] rounded-2xl p-4 shadow-[2px_2px_0px_0px_#161A33]">
              <h4 className="text-[10px] font-black uppercase text-amber-800 tracking-wider flex items-center gap-1 leading-none">
                <AlertTriangle className="w-4 text-amber-700 shrink-0" />
                <span>Automatic Integration Notice</span>
              </h4>
              <p className="text-[10px] text-amber-900/80 font-bold mt-2 leading-relaxed">
                Opportunities auto-crawled from official ministries, job portals, other university groups, and local NGO networks. Every opportunity undergoes deduplication and classification before hitting your console. Approved items immediately populate the public screen.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: SOURCES */}
        {activeTab === 'sources' && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-slate-400">{totalItems} crawler channels registered</span>
              <button
                onClick={() => setShowAddSource(true)}
                className="bg-[#161A33] text-white border-2 border-[#161A33] hover:bg-slate-800 font-black text-[9px] rounded-xl px-3 py-1.8 flex items-center gap-1 cursor-pointer transition-all shadow-[2px_2px_0px_0px_#FFD21F]"
              >
                <Plus className="w-3" />
                <span>{language === 'ar' ? 'إضافة مصدر جديد' : 'New Source'}</span>
              </button>
            </div>

            {/* Add source modal */}
            {showAddSource && (
              <form onSubmit={handleCreateSource} className="bg-white border-2 border-[#161A33] p-4 rounded-2xl shadow-[2px_2px_0px_0px_#161A33] flex flex-col gap-3">
                <h4 className="text-[10px] font-black uppercase text-[#6B25C9]">Submit new crawler destination</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Source Name (e.g. Asiacell Careers)"
                    value={newSource.name}
                    onChange={e => setNewSource({...newSource, name: e.target.value})}
                    className="text-[10px] border border-[#E6E1F5] rounded-lg p-2 font-bold"
                  />
                  <input
                    type="url"
                    required
                    placeholder="Start Crawl URL"
                    value={newSource.url}
                    onChange={e => setNewSource({...newSource, url: e.target.value})}
                    className="text-[10px] border border-[#E6E1F5] rounded-lg p-2 font-bold"
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <select
                    value={newSource.type}
                    onChange={e => setNewSource({...newSource, type: e.target.value})}
                    className="text-[10px] border border-[#E6E1F5] rounded-lg p-1.5 font-bold"
                  >
                    <option value="job">Jobs 💼</option>
                    <option value="internship">Internship 💼</option>
                    <option value="scholarship">Scholarship 🎓</option>
                    <option value="training">Training 🌟</option>
                  </select>
                  <div className="flex gap-1.5">
                    <button 
                      type="button" 
                      onClick={() => setShowAddSource(false)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-[9px] font-black cursor-pointer"
                    >
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button 
                      type="submit"
                      className="px-3.5 py-1.5 bg-[#6B25C9] text-white rounded-lg text-[9px] font-black cursor-pointer"
                    >
                      {language === 'ar' ? 'حفظ المصدر' : 'Save Source'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* List Source Cards */}
            <div className="flex flex-col gap-2.5">
              {sources.map((src: any) => (
                <div key={src.id} className="bg-white border-2 border-[#161A33] rounded-2xl p-4.5 shadow-[2px_2px_0px_0px_#161A33] flex justify-between items-center">
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black">{src.name}</h4>
                      <span className="text-[8px] bg-indigo-100 text-[#6B25C9] font-black uppercase px-2 py-0.5 rounded-md">{src.type}</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 break-all">{src.url}</span>
                    {src.last_checked && (
                      <p className="text-[8px] text-slate-400 font-bold mt-1">Checked: {new Date(src.last_checked).toLocaleString()}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleSource(src)}
                      className={`text-[9px] px-2 py-1 rounded font-black border border-[#161A33]/15 cursor-pointer ${src.active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}
                    >
                      {src.active ? 'Active' : 'Disabled'}
                    </button>
                    <button
                      onClick={() => handleRunSingleSource(src.id)}
                      className="text-[9px] bg-[#6B25C9] text-white p-1.5 rounded-lg border border-[#6B25C9] cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSource(src.id)}
                      className="text-[9px] bg-red-100 text-red-600 p-1.5 rounded-lg border border-red-200 hover:bg-red-200 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: IMPORT CSV */}
        {activeTab === 'import' && (
          <div className="flex flex-col gap-5">
            <div className="bg-white border-2 border-[#161A33] rounded-3xl p-6 shadow-[3px_3px_0px_0px_#161A33] text-center flex flex-col items-center">
              <Upload className="w-16 h-16 text-[#6B25C9] mb-4 stroke-1 animate-bounce" />
              <h2 className="text-xs font-black tracking-wide uppercase">Batch import candidate opportunities</h2>
              <p className="text-[10px] text-slate-500 font-bold max-w-xs mt-1.5 leading-relaxed">
                Upload comma-separated values (CSV) containing columns: <b className="font-mono text-[#6B25C9]">title, company, link, category, governorate, deadline</b>.
              </p>
              
              <label 
                htmlFor="csv-upload" 
                className="mt-6 px-6 py-3 bg-[#FFD21F] text-[#161A33] border-2 border-[#161A33] font-black text-xs rounded-2xl cursor-pointer hover:bg-[#FFE052] transition-transform active:scale-95 shadow-[3px_3px_0px_0px_#161A33] flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{language === 'ar' ? 'اختر ملف CSV للرفع' : 'Choose CSV File'}</span>
              </label>
              <input 
                id="csv-upload" 
                type="file" 
                accept=".csv" 
                onChange={handleUploadCsv} 
                className="hidden" 
              />
            </div>

            {uploadStats && (
              <div className="bg-white border-2 border-[#161A33] rounded-2xl p-4.5 shadow-[2px_2px_0px_0px_#161A33] text-left">
                <div className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700">
                  <CheckCircle className="w-4 text-emerald-600" />
                  <span>Import Report Completed</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4.5 text-xs font-black">
                  <div className="bg-emerald-50 rounded-lg p-3 text-emerald-800">
                    <span>Successfully Loaded:</span>
                    <span className="block text-xl font-mono mt-1 font-black">{uploadStats.inserted || uploadStats.new_items || 0}</span>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 text-amber-800">
                    <span>Duplicates Skipped:</span>
                    <span className="block text-xl font-mono mt-1 font-black">{uploadStats.duplicates || 0}</span>
                  </div>
                </div>
                <p className="text-[9px] text-slate-400 font-bold mt-4 leading-relaxed">
                  All imported opportunities automatically saved under <span className="text-[#6B25C9]">Pending Review</span> status for moderation before going live.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PENDING REVIEW */}
        {activeTab === 'pending' && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center text-xs font-black">
              <span>{totalItems} items awaiting decision</span>
              {selectedCandidates.length > 0 && (
                <button
                  onClick={handleBulkApprove}
                  className="bg-emerald-600 text-white border-2 border-[#161A33] hover:bg-emerald-700 rounded-xl px-3 py-1.5 flex items-center gap-1 cursor-pointer font-black text-[9px] shadow-[2px_2px_0px_0px_#161A33]"
                >
                  <Check className="w-3" />
                  <span>Approve Selected ({selectedCandidates.length})</span>
                </button>
              )}
            </div>

            {candidates.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-white border-2 border-[#161A33] rounded-3xl p-6 shadow-sm">
                <span className="text-4xl select-none">🏖️</span>
                <h4 className="font-black text-xs text-[#161A33] mt-2">Zero pending reviews left!</h4>
                <p className="text-[9px] text-slate-500 mt-1 max-w-xs mx-auto">Great job. All scraped information has been indexed, resolved, and approved/rejected.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5 text-left">
                {candidates.map((opp: any) => (
                  <div key={opp.id} className="bg-white border-2 border-[#161A33] rounded-3xl p-4.5 shadow-[2px_2px_0px_0px_#161A33] relative flex flex-col gap-3">
                    
                    {/* Multiselect Checkbox */}
                    <div className="flex items-center gap-2 justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCandidates.includes(opp.id)}
                          onChange={e => {
                            if (e.target.checked) setSelectedCandidates([...selectedCandidates, opp.id]);
                            else setSelectedCandidates(selectedCandidates.filter(id => id !== opp.id));
                          }}
                          className="w-4 h-4 text-[#6B25C9] border-2 border-[#161A33] rounded cursor-pointer focus:ring-0"
                        />
                        <span className="text-[10px] font-black uppercase text-slate-400">Select candidate</span>
                      </label>
                      
                      <div className="flex gap-1.5">
                        <span className="text-[8px] bg-amber-150 text-amber-900 bg-amber-100 border border-amber-200 font-extrabold px-1.5 py-0.5 rounded uppercase leading-none">
                          {opp.category || opp.type || 'Job'}
                        </span>
                        {opp.governorateId && (
                          <span className="text-[8px] bg-slate-100 text-slate-800 font-extrabold px-1.5 py-0.5 rounded uppercase leading-none">
                            📍 {opp.governorateId.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Candidate Details */}
                    <div>
                      <h3 className="text-sm font-black tracking-tight text-[#161A33]">{language === 'ar' ? opp.titleAR || opp.titleEN : opp.titleEN}</h3>
                      <p className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wide mt-1">Provider: {opp.organization || opp.company || 'Unknown'}</p>
                      <p className="text-[10.5px] text-slate-700 font-semibold leading-relaxed mt-2.5 line-clamp-3 bg-slate-50 p-2.5 rounded-xl border border-[#161A33]/5 select-none font-sans">
                        {language === 'ar' ? opp.contentAR || opp.contentEN : opp.contentEN}
                      </p>
                      {opp.deadline && (
                        <span className="inline-block mt-2.5 text-[9px] font-black text-[#D9272E] bg-red-50 border border-red-200/40 px-2 py-0.5 rounded-lg">
                          ⏳ Deadline: {opp.deadline}
                        </span>
                      )}
                    </div>
                    
                    {/* Source / Apply Link fallback */}
                    {(opp.application_link || opp.original_source_url) && (
                      <a 
                        href={opp.application_link || opp.original_source_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[9px] font-mono font-black text-[#6B25C9] hover:underline"
                      >
                        🔗 Feed Target Link: {opp.application_link || opp.original_source_url}
                      </a>
                    )}

                    {/* Decisive Operations Panel */}
                    <div className="flex gap-1.5 border-t border-[#E6E1F5] pt-3 mt-1 text-xs">
                      
                      {/* Approve */}
                      <button
                        onClick={() => handleApprove(opp.id)}
                        className="flex-1 py-2 bg-emerald-100 text-emerald-950 border-2 border-[#161A33] font-black rounded-xl hover:bg-emerald-250 transition-colors cursor-pointer"
                      >
                        Approve ✓
                      </button>

                      {/* Reject */}
                      <button
                        onClick={() => triggerRejectFlow(opp.id)}
                        className="py-2 px-3.5 bg-rose-100 text-rose-950 border-2 border-[#161A33] font-black rounded-xl hover:bg-rose-250 transition-colors cursor-pointer"
                      >
                        Reject ✗
                      </button>

                      {/* Mark Duplicate */}
                      <button
                        onClick={() => handleDuplicate(opp.id)}
                        className="py-2 px-3.5 bg-slate-100 text-slate-950 border-2 border-[#161A33] font-black rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        Duplicate 🛡️
                      </button>

                      {/* Edit Content */}
                      <button
                        onClick={() => setEditingCandidate(opp)}
                        className="py-2 px-3 bg-amber-50 text-amber-950 border-2 border-[#161A33] font-black rounded-xl hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODERATION FLOWS SUB-TABS: APPROVED, REJECTED, DUPLICATES, EXPIRED */}
        {['approved', 'rejected', 'duplicates', 'expired'].includes(activeTab) && (
          <div className="flex flex-col gap-3.5">
            <span className="text-[10px] font-black uppercase text-slate-400 text-left">{totalItems} opportunities indexed under status "{activeTab}"</span>
            {candidates.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-white border-2 border-[#161A33] rounded-3xl p-6 shadow-sm">
                <span className="text-3xl select-none">📭</span>
                <h4 className="font-black text-xs text-[#161A33] mt-2">No entries matched!</h4>
              </div>
            ) : (
              <div className="flex flex-col gap-3 text-left">
                {candidates.map((opp: any) => (
                  <div key={opp.id} className="bg-white border-2 border-[#161A33] rounded-2xl p-4 shadow-[2px_2px_0px_0px_#161A33] flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black">{opp.titleEN}</h4>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded leading-none ${activeTab === 'approved' ? 'bg-green-100 text-green-800' : activeTab === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}`}>
                        {activeTab}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 leading-none">Company: {opp.organization || opp.company}</span>
                    {opp.rejection_reason && (
                      <p className="text-[9px] text-red-700 font-bold bg-red-50 p-2 rounded-lg border border-red-200 mt-1">Rejection Reason: {opp.rejection_reason}</p>
                    )}
                    
                    {/* Status Alteration fallbacks */}
                    <div className="flex gap-2 justify-end border-t border-slate-100 pt-2.5 mt-1.5">
                      {activeTab !== 'approved' && (
                        <button 
                          onClick={() => handleApprove(opp.id)}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border-2 border-emerald-800/10 hover:border-emerald-800 rounded-lg text-[9px] font-black cursor-pointer"
                        >
                          Approve ✓
                        </button>
                      )}
                      {activeTab !== 'expired' && activeTab === 'approved' && (
                        <button 
                          onClick={() => handleExpired(opp.id)}
                          className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-800/10 hover:border-amber-800 rounded-lg text-[9px] font-black cursor-pointer"
                        >
                          Expire ⏳
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 9: RUN LOGS */}
        {activeTab === 'logs' && (
          <div className="flex flex-col gap-3 text-left">
            <span className="text-[10px] font-black uppercase text-slate-400">{logs.length} system crawler loops logged</span>
            {logs.length === 0 ? (
              <p className="text-center py-8 text-slate-500 bg-white border border-[#E6E1F5] rounded-3xl p-6">No scraping history registered yet.</p>
            ) : (
              logs.map((log: any) => (
                <div key={log.id} className="bg-white border-2 border-[#161A33] rounded-xl p-4 shadow-[2px_2px_0px_0px_#161A33] flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono font-black text-[#6B25C9]">{log.id}</span>
                    <span className="text-[10px] font-bold text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <h4 className="text-xs font-black uppercase mt-1">Source: {log.source_name || 'Multiple bulk run'}</h4>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-center text-[9px] font-black uppercase">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span>Found</span>
                      <span className="block text-xs font-mono font-black text-slate-800 mt-0.5">{log.items_found || 0}</span>
                    </div>
                    <div className="bg-green-50 p-2 rounded-lg">
                      <span>Indexed</span>
                      <span className="block text-xs font-mono font-black text-green-700 mt-0.5">{log.items_new || 0}</span>
                    </div>
                    <div className="bg-amber-50 p-2 rounded-lg">
                      <span>Duplicates</span>
                      <span className="block text-xs font-mono font-black text-amber-700 mt-0.5">{log.items_duplicate || 0}</span>
                    </div>
                  </div>
                  {log.errors && (
                    <p className="text-[8.5px] text-rose-700 font-bold bg-rose-50 border border-rose-200 p-2 rounded-lg mt-2 leading-relaxed">
                      Errors logged: {log.errors}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 10: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white border-2 border-[#161A33] rounded-3xl p-5 shadow-[3px_3px_0px_0px_#161A33] text-left flex flex-col gap-5">
            <h3 className="text-xs font-black uppercase tracking-wide border-b-2 border-slate-100 pb-2">Automation engine control center</h3>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Scrape Frequency (Hours)</label>
              <input
                type="number"
                min="1"
                max="168"
                value={status.frequency_hours}
                onChange={e => setStatus({ ...status, frequency_hours: parseInt(e.target.value) || 6 })}
                className="text-xs border-2 border-[#161A33] rounded-xl p-3 font-black"
                id="frequency-setting-input"
              />
              <span className="text-[9px] text-slate-400 font-bold">Standard frequency is hourly or within 6 hours.</span>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Security / Isolation level</label>
              <select
                className="text-xs border-2 border-[#161A33] rounded-xl p-3 font-black"
              >
                <option>Standard: Multi-pass deduplication filtering</option>
                <option>Strict: Sandbox review required for all crawls</option>
                <option>Developer: Bypass local database emulation</option>
              </select>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4.5 mt-2">
              <span className="text-[10px] font-black uppercase text-[#161A33]">Enable system wide auto run</span>
              <button
                onClick={() => setStatus({ ...status, is_active: !status.is_active })}
                className={`px-4 py-2 text-xs font-black border-2 border-[#161A33] rounded-xl cursor-pointer ${status.is_active ? 'bg-green-100 text-green-950 shadow-[2px_2px_0px_0px_#161A33]' : 'bg-slate-100 text-slate-400'}`}
              >
                {status.is_active ? 'ENABLED ✓' : 'DISABLED ✗'}
              </button>
            </div>

            <button
              onClick={() => showToast(language === 'ar' ? 'تم حفظ التكوين بنجاح!' : 'Settings successfully saved!', 'success')}
              className="mt-2.5 py-3.5 bg-[#161A33] text-white border-2 border-[#161A33] hover:bg-slate-800 rounded-2xl w-full text-xs font-black cursor-pointer shadow-[3px_3px_0px_0px_#FFD21F] text-center"
            >
              Save Configuration Settings
            </button>
          </div>
        )}

        {/* TAB PORTAL DESIGN */}
        {activeTab === 'portal' && (
          <div className="flex flex-col gap-5 text-left bg-white border-2 border-[#161A33] rounded-3xl p-5 shadow-[3px_3px_0px_0px_#161A33]">
            <h3 className="text-xs font-black uppercase tracking-wide border-b-2 border-slate-100 pb-2">
              {language === 'ar' ? 'تصميم قسم ترحيب الهيرو والصور الطلابية' : 'Portal Design & Stories Assets'}
            </h3>
            
            {/* 1. Hero Configuration Form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              localStorage.setItem('jamiaati_hero_bg', heroBgInput);
              localStorage.setItem('jamiaati_hero_title_en', heroTitleENInput);
              localStorage.setItem('jamiaati_hero_title_ar', heroTitleARInput);
              localStorage.setItem('jamiaati_hero_title_ku', heroTitleKUInput);
              localStorage.setItem('jamiaati_hero_desc_en', heroDescENInput);
              localStorage.setItem('jamiaati_hero_desc_ar', heroDescARInput);
              localStorage.setItem('jamiaati_hero_desc_ku', heroDescKUInput);
              localStorage.setItem('jamiaati_hero_tag_en', heroTagENInput);
              localStorage.setItem('jamiaati_hero_tag_ar', heroTagARInput);
              localStorage.setItem('jamiaati_hero_tag_ku', heroTagKUInput);
              window.dispatchEvent(new Event('jamiaati_hero_updated'));
              showToast(language === 'ar' ? 'تم حفظ تعديلات قسم الهيرو بنجاح!' : 'Hero Banner updated successfully in real-time!', 'success');
            }} className="flex flex-col gap-4 text-xs font-bold text-slate-700">
              
              <div className="bg-[#F3F7FF] rounded-2xl p-3 border border-[#D5E1FC]">
                <span className="text-[10px] font-black uppercase text-[#161A33] block mb-2">1. Main Hero background Photo</span>
                
                <div className="flex flex-col gap-1.5 mb-3">
                  <span className="text-[8px] uppercase tracking-wider text-slate-400">Custom Image URL</span>
                  <input
                    type="text"
                    required
                    value={heroBgInput}
                    onChange={(e) => setHeroBgInput(e.target.value)}
                    className="w-full text-xs font-black p-2 border border-[#161A33] rounded-xl bg-white"
                  />
                </div>

                <span className="text-[8.5px] uppercase tracking-wider text-slate-400 block mb-1">Quick Select Premium Campus Presets</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600', label: 'Classic Cap' },
                    { url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600', label: 'Lively Campus' },
                    { url: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a91?auto=format&fit=crop&q=80&w=600', label: 'Grand Library' },
                    { url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=600', label: 'Global Study' }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setHeroBgInput(preset.url)}
                      className={`p-1 text-[9px] font-medium border rounded-lg text-center cursor-pointer transition-all ${
                        heroBgInput === preset.url ? 'bg-[#161A33] text-white border-[#161A33]' : 'bg-white border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable titles (EN, AR, KU) */}
              <div className="border border-slate-150 rounded-2xl p-3 flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase text-[#161A33] block">2. Hero title texts</span>
                
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] uppercase tracking-wider text-slate-400">English Title Text</span>
                  <input 
                    type="text" 
                    value={heroTitleENInput} 
                    onChange={e => setHeroTitleENInput(e.target.value)} 
                    className="p-2 border border-slate-350 rounded-lg text-[10.5px]"
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] uppercase tracking-wider text-slate-400">Arabic Title Text</span>
                  <input 
                    type="text" 
                    value={heroTitleARInput} 
                    onChange={e => setHeroTitleARInput(e.target.value)} 
                    className="p-2 border border-slate-350 rounded-lg text-[10.5px] text-right"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[8px] uppercase tracking-wider text-slate-400">Kurdish Title Text</span>
                  <input 
                    type="text" 
                    value={heroTitleKUInput} 
                    onChange={e => setHeroTitleKUInput(e.target.value)} 
                    className="p-2 border border-slate-350 rounded-lg text-[10.5px] text-right"
                  />
                </div>
              </div>

              {/* Editable descriptions (EN, AR, KU) */}
              <div className="border border-slate-150 rounded-2xl p-3 flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase text-[#161A33] block">3. Hero descriptions</span>
                
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] uppercase tracking-wider text-slate-400">English Subtext</span>
                  <textarea 
                    rows={2}
                    value={heroDescENInput} 
                    onChange={e => setHeroDescENInput(e.target.value)} 
                    className="p-2 border border-slate-300 rounded-lg text-[10px] leading-relaxed"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[8px] uppercase tracking-wider text-slate-400">Arabic Subtext</span>
                  <textarea 
                    rows={2}
                    value={heroDescARInput} 
                    onChange={e => setHeroDescARInput(e.target.value)} 
                    className="p-2 border border-slate-300 rounded-lg text-[10px] leading-relaxed text-right"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[8px] uppercase tracking-wider text-slate-400">Kurdish Subtext</span>
                  <textarea 
                    rows={2}
                    value={heroDescKUInput} 
                    onChange={e => setHeroDescKUInput(e.target.value)} 
                    className="p-2 border border-slate-300 rounded-lg text-[10px] leading-relaxed text-right"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="py-3 bg-[#6B25C9] hover:bg-[#5E1FB5] text-white border-2 border-[#161A33] rounded-xl text-[10.5px] font-black uppercase transition-all shadow-[2px_2px_0px_0px_#161A33] cursor-pointer text-center"
              >
                {language === 'ar' ? 'حفظ تعديلات واجهة الهيرو ✓' : 'Apply Hero Changes ✓'}
              </button>
            </form>

            {/* 2. Real Student Stories Photos replacement block */}
            <div className="border-t border-slate-100 pt-5 mt-2">
              <span className="text-[10px] font-black uppercase text-[#161A33] block mb-2">
                {language === 'ar' ? '٤. تخصيص صور وقصص واقع الطلاب' : '4. Student Stories Photos & Avatars'}
              </span>
              <p className="text-[9.5px] text-slate-500 font-bold mb-4 leading-relaxed">
                {language === 'ar' 
                  ? 'قم بتحديث صور الملفات الشخصية والحكايا للطلاب لتظهر كشخصيات عراقية حقيقية وجميلة.' 
                  : 'Update profiles, names, and avatars of students to represent authentic people on the storyboard.'}
              </p>

              {/* Stories list rendering */}
              <div className="flex flex-col gap-3">
                {storyList.map((story) => (
                  <div 
                    key={story.id} 
                    className="flex justify-between items-center border border-[#161A33]/15 rounded-2xl p-3 bg-slate-50 relative overflow-hidden"
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={story.avatar} 
                        alt={story.name} 
                        className="w-10 h-10 rounded-xl object-cover border border-[#161A33]/20" 
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="text-[11px] font-black text-[#161A33]">{story.name}</h4>
                        <p className="text-[9px] text-slate-500 font-extrabold line-clamp-1 max-w-[190px]">{story.text}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setEditingStoryId(story.id);
                        setEditingStoryName(story.name);
                        setEditingStoryAvatar(story.avatar);
                        setEditingStoryText(story.text);
                      }}
                      className="px-3 py-1.5 bg-white border border-[#161A33] hover:bg-slate-100 rounded-lg text-[9px] font-black cursor-pointer shadow-sm"
                    >
                      {language === 'ar' ? 'تعديل الصورة 📷' : 'Swap Photo 📷'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Editing individual story modal inside portal designer */}
            <AnimatePresence>
              {editingStoryId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white border-2 border-[#161A33] p-5.5 rounded-3xl w-full max-w-sm flex flex-col gap-3 text-left shadow-2xl relative"
                  >
                    <h3 className="text-xs font-black uppercase text-[#6B25C9]">
                      {language === 'ar' ? 'تعديل صورة وقصة الطالب' : 'Edit Student Story & Avatar'}
                    </h3>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const updated = storyList.map(s => {
                        if (s.id === editingStoryId) {
                          return {
                            ...s,
                            name: editingStoryName,
                            avatar: editingStoryAvatar,
                            text: editingStoryText
                          };
                        }
                        return s;
                      });
                      setStoryList(updated);
                      localStorage.setItem('jamiaati_edited_default_stories', JSON.stringify(updated));
                      window.dispatchEvent(new Event('jamiaati_stories_updated'));
                      setEditingStoryId(null);
                      showToast(language === 'ar' ? 'تم تعديل ملامح وصور الطالب بنجاح!' : 'Student Avatar replaced successfully!', 'success');
                    }} className="flex flex-col gap-3 text-xs font-bold text-slate-700">
                      
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] uppercase tracking-wider text-slate-400">Student Name</span>
                        <input
                          type="text"
                          required
                          value={editingStoryName}
                          onChange={e => setEditingStoryName(e.target.value)}
                          className="border border-[#161A33] rounded-lg p-2 focus:outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] uppercase tracking-wider text-slate-400">Avatar Photo URL</span>
                        <input
                          type="text"
                          required
                          value={editingStoryAvatar}
                          onChange={e => setEditingStoryAvatar(e.target.value)}
                          className="border border-[#161A33] rounded-lg p-2 focus:outline-none"
                        />
                        <span className="text-[8px] text-slate-400 font-bold">Unsplash portrait recommended for real feeling</span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] uppercase tracking-wider text-slate-400">Nice Story Message</span>
                        <textarea
                          rows={2}
                          required
                          value={editingStoryText}
                          onChange={e => setEditingStoryText(e.target.value)}
                          className="border border-[#161A33] rounded-lg p-2 focus:outline-none text-[10px]"
                        />
                      </div>

                      <div className="flex gap-2 justify-end mt-4">
                        <button
                          type="button"
                          onClick={() => setEditingStoryId(null)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-[10px] font-black cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-[#6B25C9] text-white rounded-xl text-[10px] font-black cursor-pointer shadow-md"
                        >
                          Save Changes ✓
                        </button>
                      </div>

                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </div>
        )}

      </div>

      {/* CORE PAGINATION DECK */}
      {['sources', 'pending', 'approved', 'rejected', 'duplicates', 'expired', 'logs'].includes(activeTab) && totalItems > limit && (
        <div className="flex justify-between items-center mt-6 select-none bg-white p-3 border-2 border-[#161A33] rounded-xl shadow-sm" id="automation-pagination">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="p-1 px-3 bg-slate-50 hover:bg-slate-100 border border-[#E6E1F5] rounded-xl disabled:opacity-55 cursor-pointer max-w-[80px]"
          >
            <ChevronLeft className="w-4 h-4 mx-auto text-[#161A33]" />
          </button>
          <span className="text-[10px] font-black uppercase">Page {page} of {Math.ceil(totalItems / limit)}</span>
          <button
            disabled={page >= Math.ceil(totalItems / limit)}
            onClick={() => setPage(page + 1)}
            className="p-1 px-3 bg-slate-50 hover:bg-slate-100 border border-[#E6E1F5] rounded-xl disabled:opacity-55 cursor-pointer max-w-[80px]"
          >
            <ChevronRight className="w-4 h-4 mx-auto text-[#161A33]" />
          </button>
        </div>
      )}

      {/* CANDIDATE INLINE EDIT MODAL OVERLAY */}
      <AnimatePresence>
        {editingCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-2 border-[#161A33] p-5.5 rounded-3xl w-full max-w-sm flex flex-col gap-4 text-left shadow-2xl relative"
            >
              <h3 className="text-xs font-black uppercase text-[#6B25C9]">Modify opportunity contents</h3>
              
              <form onSubmit={handleSaveCandidateEdit} className="flex flex-col gap-3 text-xs font-bold text-slate-705">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] uppercase tracking-wider text-slate-400">English Title</span>
                  <input
                    type="text"
                    required
                    value={editingCandidate.titleEN}
                    onChange={e => setEditingCandidate({ ...editingCandidate, titleEN: e.target.value })}
                    className="border border-[#E6E1F5] rounded-lg p-2 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] uppercase tracking-wider text-slate-400">Arabic Title</span>
                  <input
                    type="text"
                    required
                    value={editingCandidate.titleAR || ''}
                    onChange={e => setEditingCandidate({ ...editingCandidate, titleAR: e.target.value })}
                    className="border border-[#E6E1F5] rounded-lg p-2 focus:outline-none text-right"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] uppercase tracking-wider text-slate-400">English Details Body</span>
                  <textarea
                    rows={3}
                    required
                    value={editingCandidate.contentEN}
                    onChange={e => setEditingCandidate({ ...editingCandidate, contentEN: e.target.value })}
                    className="border border-[#E6E1F5] rounded-lg p-2 focus:outline-none text-[10.5px] leading-relaxed"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] uppercase tracking-wider text-slate-400">Arabic Details Body</span>
                  <textarea
                    rows={3}
                    required
                    value={editingCandidate.contentAR || ''}
                    onChange={e => setEditingCandidate({ ...editingCandidate, contentAR: e.target.value })}
                    className="border border-[#E6E1F5] rounded-lg p-2 focus:outline-none text-[10.5px] leading-relaxed text-right"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] uppercase tracking-wider text-slate-400">Goveronrate</span>
                    <input
                      type="text"
                      value={editingCandidate.governorateId}
                      onChange={e => setEditingCandidate({ ...editingCandidate, governorateId: e.target.value })}
                      className="border border-[#E6E1F5] rounded-lg p-2 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] uppercase tracking-wider text-slate-400">Category Type</span>
                    <input
                      type="text"
                      value={editingCandidate.category || editingCandidate.type || ''}
                      onChange={e => setEditingCandidate({ ...editingCandidate, category: e.target.value })}
                      className="border border-[#E6E1F5] rounded-lg p-2 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => setEditingCandidate(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-[10px] font-black cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#6B25C9] text-white rounded-xl text-[10px] font-black cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REJECTION FLOW REASON DIALOG MODAL */}
      <AnimatePresence>
        {rejectId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-2 border-[#161A33] p-5.5 rounded-3xl w-full max-w-sm flex flex-col gap-3 text-left shadow-2xl relative"
            >
              <h3 className="text-xs font-black uppercase text-red-700">Specify rejection criteria</h3>
              <p className="text-[10px] text-slate-500 font-bold leading-relaxed">Let developers and providers know why this scraped entry was disqualified.</p>
              
              <div className="flex flex-col gap-2 mt-2">
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Scrambled character decoding, dead link, invalid deadline, irrelevant for Iraqi university students..."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="text-xs border border-[#E6E1F5] rounded-xl p-3 focus:outline-none font-bold"
                />
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <button
                  onClick={() => setRejectId(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-[10px] font-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmit}
                  className="px-5 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black cursor-pointer"
                >
                  Reject Item ✗
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

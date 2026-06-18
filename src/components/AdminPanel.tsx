import { safeText, safeOpportunityTitle, safeUniversityName, safeDescription } from '../utils/safeText';
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { 
  ArrowLeft, 
  Settings, 
  Database, 
  RefreshCw, 
  Check, 
  X, 
  Edit2, 
  Trash2, 
  Plus, 
  Clock, 
  Globe, 
  AlertTriangle, 
  CheckCircle2, 
  ListOrdered,
  BookOpen,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface AdminPanelProps {
  language: Language;
  onBack: () => void;
  showToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

interface Source {
  id: string;
  name: string;
  url: string;
  type: 'jobs' | 'scholarships' | 'trainings' | 'events' | 'competitions';
  enabled: boolean;
  last_checked: string | null;
  error_status: string | null;
}

interface Opportunity {
  id: string;
  titleEN: string;
  titleAR: string;
  titleKU: string;
  contentEN: string;
  contentAR: string;
  contentKU: string;
  organization: string;
  category: string;
  country: string;
  governorateId: string;
  deadline: string;
  application_link: string;
  original_source_url: string;
  published_date: string;
  imageUrl: string;
  status: 'pending' | 'pending_review' | 'approved' | 'rejected' | 'expired';
  
  // Multilingual Spec Fields
  original_language?: string;
  title_original?: string;
  content_original?: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  source_id: string;
  source_name: string;
  items_found: number;
  items_new: number;
  items_duplicate: number;
  errors: string | null;
}

export default function AdminPanel({ language, onBack, showToast }: AdminPanelProps) {
  // Navigation tabs inside Admin Panel
  const [adminTab, setAdminTab] = useState<'moderation' | 'sources' | 'logs'>('moderation');
  
  // Database States
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // Loading & Action States
  const [isScraping, setIsScraping] = useState(false);
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [newSource, setNewSource] = useState({
    name: '',
    url: '',
    type: 'jobs' as Source['type'],
    enabled: true
  });

  // Fetch all initial data
  const loadAdminData = async () => {
    try {
      const oppRes = await fetch('/api/admin/opportunities');
      if (oppRes.ok) setOpportunities(await oppRes.json());
      
      const sRes = await fetch('/api/admin/sources');
      if (sRes.ok) setSources(await sRes.json());

      const lRes = await fetch('/api/admin/logs');
      if (lRes.ok) setLogs(await lRes.json());
    } catch (err) {
      console.error("Failed to load admin dataset:", err);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [adminTab]);

  // Trigger Scraper
  const handleRunScraper = async () => {
    setIsScraping(true);
    const toastMsg = language === 'ar' ? 'جاري تشغيل زاحف البيانات... 🕵️‍♀️' : language === 'ku' ? 'زانیاریەکان کۆدەکرێنەوە... 🕵️‍♀️' : 'Starting scraping worker... 🕵️‍♀️';
    showToast(toastMsg, 'info');

    try {
      const res = await fetch('/api/admin/scraper/run', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        const stats = data.stats;
        const completeMsg = language === 'ar' 
          ? `اكتمل الزحف: تم تصفح ${stats.sourcesChecked} مواقع، العثور على ${stats.itemsFound} فرر، وإضافة ${stats.itemsNew} جديدة!` 
          : language === 'ku'
          ? `کۆتایی هات: ${stats.sourcesChecked} سەرچاوە بینرا، ${stats.itemsFound} دەرفەت دۆزرایەوە، ${stats.itemsNew} نوێ زیادکرا!`
          : `Crawl Complete: Checked ${stats.sourcesChecked} sources, found ${stats.itemsFound} items, added ${stats.itemsNew} new ones.`;
        showToast(completeMsg, 'success');
        loadAdminData();
      } else {
        showToast('Scraping service returned an operational error.', 'error');
      }
    } catch (err: any) {
      showToast(`Scraper network crash: ${err.message}`, 'error');
    } finally {
      setIsScraping(false);
    }
  };

  // Perform Opportunity Moderator Action (approve/reject/expire)
  const handleOppAction = async (id: string, action: 'approve' | 'reject' | 'expire') => {
    try {
      const res = await fetch('/api/admin/opportunities/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action })
      });

      if (res.ok) {
        setOpportunities(prev => prev.map(o => o.id === id ? { ...o, status: action as any } : o));
        const actionLabel = action === 'approve' 
          ? (language === 'ar' ? 'تمت الموافقة والنشر بنجاح! 🎉' : language === 'ku' ? 'پەسەندکرا بنجاح! 🎉' : 'Opportunity approved & published!') 
          : action === 'reject' 
          ? (language === 'ar' ? 'تم رفض وإخفاء الفرصة' : 'Opportunity rejected') 
          : (language === 'ar' ? 'تم تحديد الفرصة كمنتهية' : 'Opportunity marked expired');
        showToast(actionLabel, 'success');
      } else {
        showToast('Failed to perform moderation action.', 'error');
      }
    } catch (err) {
      showToast('Action network failure.', 'error');
    }
  };

  // Edit Opportunity Form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOpp) return;

    try {
      const res = await fetch('/api/admin/opportunities/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingOpp)
      });

      if (res.ok) {
        showToast(language === 'ar' ? 'تم تعديل تفاصيل الفرصة بنجاح!' : 'Opportunity updated successfully!', 'success');
        setEditingOpp(null);
        loadAdminData();
      } else {
        showToast('Failed to save edited details.', 'error');
      }
    } catch (err) {
      showToast('Network error during editing save.', 'error');
    }
  };

  // Toggle Source Enabled status
  const handleToggleSource = async (source: Source) => {
    try {
      const updated = { ...source, enabled: !source.enabled };
      const res = await fetch('/api/admin/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        setSources(prev => prev.map(s => s.id === source.id ? updated : s));
        showToast(updated.enabled ? 'Source enabled' : 'Source disabled', 'info');
      }
    } catch {
      showToast('Fail update status', 'error');
    }
  };

  // Delete Source Custom Registry
  const handleDeleteSource = async (id: string) => {
    try {
      const res = await fetch('/api/admin/sources', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setSources(prev => prev.filter(s => s.id !== id));
        showToast('Source registry deleted', 'success');
      }
    } catch {
      showToast('Delete failure', 'error');
    }
  };

  // Add New Source Form Registry
  const handleAddSourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSource.name || !newSource.url) {
      showToast('Please fill in Name and Source Website URL', 'error');
      return;
    }

    try {
      const res = await fetch('/api/admin/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSource)
      });

      if (res.ok) {
        showToast('New Crawling Website registered!', 'success');
        setIsAddingSource(false);
        setNewSource({ name: '', url: '', type: 'jobs', enabled: true });
        loadAdminData();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to add source web URL', 'error');
      }
    } catch {
      showToast('Registration crash', 'error');
    }
  };

  // Text Helper based on Language
  const getTranslatedLabel = (key: string) => {
    const translations: Record<string, Record<Language, string>> = {
      backBtn: { en: 'Back', ar: 'رجوع', ku: 'گەڕانەوە' },
      panelTitle: { en: 'Admin Scraper Control', ar: 'لوحة التحكم والأتمتة', ku: 'کۆنترۆڵی ئۆتۆماتیکی' },
      moderation: { en: 'Moderation Queue', ar: 'طابور المراجعة والقبول', ku: 'پەسەندکردنی فرسەتەکان' },
      sources: { en: 'Source Websites', ar: 'إدارة المواقع المصادر', ku: 'سەرچاوەی ماڵپەڕەکان' },
      logs: { en: 'Logs Engine', ar: 'سجلات الزحف التاريخية', ku: 'سجلی کارەکان' },
      runScraper: { en: 'Run Scraper Now', ar: 'تشغيل زاحف الفرص الآن', ku: 'ئێستا زانیاری کۆبکەرەوە' },
      running: { en: 'Acquiring Opportunity Data...', ar: 'جاري جلب وترجمة الفرص...', ku: 'کۆکردنەوەی زانیاری دیارکراو...' },
      pendingTitle: { en: 'Verification Needed', ar: 'الفرص المكتشفة بانتظار الترخيص', ku: 'دەرفەتە دۆزراوەکانی چاوەڕوانکراو' },
      noPending: { en: 'Excellent! No pending opportunities.', ar: 'ممتاز! طابور المراجعة فارغ ومكتمل.', ku: 'نایاب! هیچ فرسەتێکی چاوەڕوانکراو نەماوە.' }
    };
    return translations[key]?.[language] || translations[key]?.['en'] || '';
  };

  const isRTL = language === 'ar' || language === 'ku';

  const pendingOpps = opportunities.filter(o => o.status === 'pending' || o.status === 'pending_review');
  const nonPendingOpps = opportunities.filter(o => o.status !== 'pending' && o.status !== 'pending_review');

  return (
    <div id="admin-workspace-card" className="px-4 py-4 max-w-lg mx-auto flex flex-col pb-28 bg-[#0B1020] min-h-screen">
      
      {/* Upper Navigation Back Header */}
      <div className="flex items-center justify-between mb-5 border-b border-[#1F2E4D] pb-3">
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-black text-cyan-400 bg-cyan-400/5 hover:bg-cyan-400/10 px-3 py-1.5 rounded-xl border border-cyan-405/15 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{getTranslatedLabel('backBtn')}</span>
        </button>
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-cyan-400 animate-spin" />
          <h1 className="text-xs font-black text-white uppercase tracking-tight leading-none">
            {getTranslatedLabel('panelTitle')}
          </h1>
        </div>
      </div>

      {/* Manual Operation Banner Controller */}
      <div 
        id="scraper-trigger-console" 
        className="relative bg-gradient-to-r from-emerald-950/40 to-blue-950/45 border-2 border-[#1F2E4D] rounded-3xl p-5 mb-5 shadow-[4px_4px_0px_0px_#1F2E4D] relative overflow-hidden flex flex-col items-center justify-center text-center"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        <span className="text-2xl select-none mb-1 text-cyan-400">🕵️‍♀️🤖</span>
        <h3 className="text-[11px] font-black uppercase text-white tracking-wide">
          {language === 'ar' ? 'البوابة الذكية لجمع الفرص الأكاديمي' : language === 'ku' ? 'سیستەمی کۆکردنەوەی ئۆتۆماتیکی دەرفەتەکان' : 'Iraqi Youth Opportunity Harvester'}
        </h3>
        <p className="text-[9px] text-slate-300 font-bold max-w-xs mt-1.5 leading-relaxed leading-snug">
          {language === 'ar' 
            ? 'يقوم النظام بمسح الشركات الكبرى، المنظمات، والجامعات، وتنظيف البيانات، وترجمتها بثلاث لغات، وتصنيفها باستخدام Gemini AI.'
            : language === 'ku'
            ? 'سیستەمەکە سەردانی ماڵپەڕە گەورەکان دەکات بۆ دۆزینەوەی مەشق، تواناسازی و پۆلێنکردنیان بە زمانی پێشکەوتووی کار.'
            : 'Aggregates listings from top companies, ministries, and NGOs in Iraq, normalizes governors, and drafts multi-lingual translations via Gemini.'}
        </p>

        {isScraping ? (
          <button 
            disabled 
            className="w-full mt-4 py-3 bg-cyan-950/50 border border-cyan-500/20 text-cyan-300 text-xs font-black tracking-wider rounded-2xl flex items-center justify-center gap-2 text-center"
          >
            <RefreshCw className="w-4 h-4 text-cyan-300 animate-spin" />
            <span>{getTranslatedLabel('running')}</span>
          </button>
        ) : (
          <button 
            onClick={handleRunScraper}
            className="w-full mt-4 py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:scale-[1.01] active:scale-98 text-white border border-white/5 font-black text-xs rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-950/20"
          >
            <RefreshCw className="w-4 h-4 text-white" />
            <span>{getTranslatedLabel('runScraper')}</span>
          </button>
        )}
      </div>

      {/* Internal Workspace Switch Tabs */}
      <div className="flex border-b border-[#1F2E4D] mb-5" id="admin-subnavigation">
        <button
          onClick={() => { setAdminTab('moderation'); setEditingOpp(null); }}
          className={`flex-1 py-2 text-center font-black text-[10px] uppercase transition-all tracking-tight cursor-pointer ${
            adminTab === 'moderation' 
              ? 'border-b-2 border-cyan-400 text-cyan-400' 
              : 'border-transparent text-slate-450 hover:text-slate-100'
          }`}
        >
          {getTranslatedLabel('moderation')}
        </button>

        <button
          onClick={() => { setAdminTab('sources'); setEditingOpp(null); }}
          className={`flex-1 py-2 text-center font-black text-[10px] uppercase transition-all tracking-tight cursor-pointer ${
            adminTab === 'sources' 
              ? 'border-b-2 border-cyan-400 text-cyan-400' 
              : 'border-transparent text-slate-450 hover:text-slate-100'
          }`}
        >
          {getTranslatedLabel('sources')}
        </button>

        <button
          onClick={() => { setAdminTab('logs'); setEditingOpp(null); }}
          className={`flex-1 py-2 text-center font-black text-[10px] uppercase transition-all tracking-tight cursor-pointer ${
            adminTab === 'logs' 
              ? 'border-b-2 border-cyan-400 text-cyan-400' 
              : 'border-transparent text-slate-450 hover:text-slate-100'
          }`}
        >
          {getTranslatedLabel('logs')}
        </button>
      </div>

      {/* ACTIVE VIEW SLOT CONTAINER */}
      <div id="admin-workspace-active-slot">

        {/* 1. MODERATION QUEUE SCREEN */}
        {adminTab === 'moderation' && (
          <div className="flex flex-col gap-4">
            
            {/* Editing modal overlay when editingOpp exists */}
            {editingOpp && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm pointer-events-auto">
                <div 
                  className="bg-[#121B2E] border-2 border-[#1F2E4D] rounded-3xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative"
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <button 
                    onClick={() => setEditingOpp(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 bg-transparent border-0 cursor-pointer"
                  >
                    ✕
                  </button>

                  <h3 className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-1.5 mb-4">
                    <Edit2 className="w-4 h-4 text-cyan-450 text-cyan-400" />
                    <span>{language === 'ar' ? 'تعديل تفاصيل الفرصة المكتشفة' : 'Edit Scraped Details'}</span>
                  </h3>

                  <form onSubmit={handleEditSubmit} className="flex flex-col gap-3">
                    
                    {/* Multilingual Details & Original Version Control */}
                    <div className="bg-[#101726]/80 border border-cyan-500/20 rounded-2xl p-3.5 mb-1 flex flex-col gap-3">
                      <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest leading-none">🌐 Platform Translations</h4>
                      
                      {/* Original Language Selector */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">Original Language of Scraped Post</label>
                        <select
                          value={editingOpp.original_language || 'en'}
                          onChange={e => setEditingOpp({ ...editingOpp, original_language: e.target.value })}
                          className="bg-[#0B1020] border border-[#1F2E4D] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                        >
                          <option value="en">English (🇬🇧)</option>
                          <option value="ar">Arabic (🇮🇶)</option>
                          <option value="ku">Kurdish (☀️)</option>
                        </select>
                      </div>

                      {/* Original Title Entry */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">Original Title</label>
                        <input 
                          type="text"
                          value={editingOpp.title_original || ''}
                          onChange={e => setEditingOpp({ ...editingOpp, title_original: e.target.value })}
                          placeholder="e.g. Asiacell Graduate Acceleration Elite Program"
                          className="bg-[#0B1020] border border-[#1F2E4D] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      {/* Original Content Entry */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">Original Content Description</label>
                        <textarea
                          value={editingOpp.content_original || ''}
                          rows={2}
                          onChange={e => setEditingOpp({ ...editingOpp, content_original: e.target.value })}
                          placeholder="Write the untranslated text original listing here..."
                          className="bg-[#0B1020] border border-[#1F2E4D] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    {/* EN Title */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-350 uppercase">Title (EN)</label>
                      <input 
                        type="text"
                        value={editingOpp.titleEN}
                        onChange={e => setEditingOpp({ ...editingOpp, titleEN: e.target.value })}
                        className="bg-[#101726] border border-[#1F2E4D] rounded-xl p-2.5 text-xs text-white uppercase focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>

                    {/* AR Title */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-350 uppercase">العنوان بالعربية (AR - الأولية)</label>
                      <input 
                        type="text"
                        value={editingOpp.titleAR}
                        onChange={e => setEditingOpp({ ...editingOpp, titleAR: e.target.value })}
                        className="bg-[#101726] border border-[#1F2E4D] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>

                    {/* KU Title */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-350 uppercase">العنوان بالكردية (KU)</label>
                      <input 
                        type="text"
                        value={editingOpp.titleKU}
                        onChange={e => setEditingOpp({ ...editingOpp, titleKU: e.target.value })}
                        className="bg-[#101726] border border-[#1F2E4D] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>

                    {/* Category Selection */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-350 uppercase">Category Classifier</label>
                      <select
                        value={editingOpp.category}
                        onChange={e => setEditingOpp({ ...editingOpp, category: e.target.value })}
                        className="bg-[#101726] border border-[#1F2E4D] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="job">job</option>
                        <option value="internship">internship</option>
                        <option value="scholarship">scholarship</option>
                        <option value="training">training</option>
                        <option value="event">event</option>
                        <option value="volunteering">volunteering</option>
                        <option value="fellowship">fellowship</option>
                        <option value="competition">competition</option>
                        <option value="announcement">announcement</option>
                      </select>
                    </div>

                    {/* Deadline */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-350 uppercase">Deadline (YYYY-MM-DD)</label>
                      <input 
                        type="date"
                        value={editingOpp.deadline}
                        onChange={e => setEditingOpp({ ...editingOpp, deadline: e.target.value })}
                        className="bg-[#101726] border border-[#1F2E4D] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                        required
                      />
                    </div>

                    {/* English Description */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-350 uppercase">Description (EN)</label>
                      <textarea
                        value={editingOpp.contentEN}
                        rows={3}
                        onChange={e => setEditingOpp({ ...editingOpp, contentEN: e.target.value })}
                        className="bg-[#101726] border border-[#1F2E4D] rounded-xl p-2.5 text-xs text-white focus:outline-none text-left"
                        required
                      />
                    </div>

                    {/* Arabic Description */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-350 uppercase">الوصف بالعربية (AR)</label>
                      <textarea
                        value={editingOpp.contentAR}
                        rows={3}
                        onChange={e => setEditingOpp({ ...editingOpp, contentAR: e.target.value })}
                        className="bg-[#101726] border border-[#1F2E4D] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                        required
                      />
                    </div>

                    {/* Kurdish Description */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-350 uppercase">الوصف بالكردية (KU)</label>
                      <textarea
                        value={editingOpp.contentKU}
                        rows={3}
                        onChange={e => setEditingOpp({ ...editingOpp, contentKU: e.target.value })}
                        className="bg-[#101726] border border-[#1F2E4D] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                        required
                      />
                    </div>

                    {/* App Link */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-350 uppercase">Application link / Source Web</label>
                      <input 
                        type="text"
                        value={editingOpp.application_link}
                        onChange={e => setEditingOpp({ ...editingOpp, application_link: e.target.value })}
                        className="bg-[#101726] border border-[#1F2E4D] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                        required
                      />
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button 
                        type="button"
                        onClick={() => setEditingOpp(null)}
                        className="flex-1 py-2.5 bg-[#1F2E4D] text-white hover:bg-slate-700 text-xs font-black rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-900 text-xs font-black rounded-xl cursor-pointer"
                      >
                        Save & Keep Pending
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            )}

            {/* Moderation Listing Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                <ListOrdered className="w-4 h-4 text-cyan-400" />
                <span>{getTranslatedLabel('pendingTitle')}</span>
              </h2>
              <span className="text-[9px] bg-[#121B2E] text-slate-300 font-extrabold border border-[#1F2E4D] px-2 py-0.5 rounded-lg leading-none">
                {pendingOpps.length} items found
              </span>
            </div>

            {pendingOpps.length === 0 ? (
              <div className="text-center py-12 bg-[#121B2E] border border-[#1F2E4D] rounded-3xl p-6">
                <span className="text-3xl mb-1.5 select-none animate-pulse">🎉</span>
                <p className="text-[11px] font-black text-white uppercase tracking-wide">
                  {getTranslatedLabel('noPending')}
                </p>
                <p className="text-[9px] text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Every aggregated bulletin has been categorized, classified, and either approved for student consumption or safely weeded out!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {pendingOpps.map((o) => (
                  <div 
                    key={o.id}
                    className="bg-[#121B2E] border-2 border-[#1F2E4D] px-3.5 py-4 rounded-3xl shadow-sm hover:shadow-cyan-950/10 hover:border-cyan-500/10 transition-all text-left"
                  >
                    {/* Badge classifier row */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[9px] font-black bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 px-2 py-0.5 rounded-lg uppercase leading-none">
                          {o.category}
                        </span>
                        <span className="text-[9px] font-black bg-slate-800 text-slate-300 border border-slate-700/40 px-2 py-0.5 rounded-lg uppercase leading-none flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5" />
                          {o.governorateId}
                        </span>
                      </div>
                      <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest block bg-emerald-500/10 px-1.5 py-0.5 border border-emerald-500/15 rounded-md leading-none">
                        Pending Admin Click
                      </span>
                    </div>

                    {/* Titles review panel */}
                    <div className="border border-[#1F2E4D]/60 rounded-2xl bg-[#0B1020]/20 p-2.5 mb-2.5">
                      <p className="text-[11px] font-black text-white leading-tight uppercase">
                        🇬🇧 {o.titleEN}
                      </p>
                      <p className="text-[10px] font-extrabold text-[#FFD21F] leading-tight mt-1" dir="rtl">
                        🇮🇶 {o.titleAR}
                      </p>
                      <p className="text-[10px] font-extrabold text-cyan-400 leading-tight mt-1" dir="rtl">
                        ☀️ {o.titleKU}
                      </p>
                    </div>

                    {/* Content text preview summary */}
                    <p className="text-[10px] text-slate-300 font-semibold leading-relaxed line-clamp-2 leading-snug">
                      "{o.contentEN}"
                    </p>

                    {/* Details checklist layout */}
                    <div className="grid grid-cols-2 gap-2 my-2.5 pt-2.5 border-t border-[#1F2E4D]/40 text-[9px] text-slate-400 font-bold">
                      <div className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">Org: <strong className="text-white font-black">{o.organization}</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Ends: <strong className="text-rose-400 font-black">{o.deadline || 'Ongoing'}</strong></span>
                      </div>
                    </div>

                    {/* Moderator action triggers */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-[#1F2E4D]/50">
                      
                      <button
                        onClick={() => setEditingOpp(o)}
                        className="text-[9px] font-black text-cyan-400 bg-cyan-400/5 hover:bg-cyan-400/10 border border-cyan-400/15 px-3 py-1.8 rounded-xl cursor-pointer transition-colors flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3 text-cyan-400" />
                        <span>Edit Details</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOppAction(o.id, 'reject')}
                          className="text-[9px] font-black text-rose-450 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/15 text-rose-300 px-3 py-1.8 rounded-xl cursor-pointer transition-colors flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          <span>Reject</span>
                        </button>

                        <button
                          onClick={() => handleOppAction(o.id, 'approve')}
                          className="text-[9px] font-black bg-emerald-500 hover:bg-emerald-600 text-slate-900 border border-white/5 px-3.5 py-1.8 rounded-xl cursor-pointer transition-all flex items-center gap-1 shadow-md shadow-emerald-950/20"
                        >
                          <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3px]" />
                          <span>Approve & Publish</span>
                        </button>
                      </div>

                    </div>

                  </div>
                ))}
              </div>
            )}

            {/* Historic Archive (Approved & Rejected items review board) */}
            <div className="mt-8 pt-5 border-t border-[#1F2E4D]">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1 leading-none">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Historic Decided / Expired Archive</span>
              </h4>
              <div className="flex flex-col gap-2">
                {nonPendingOpps.slice(0, 5).map(o => (
                  <div 
                    key={o.id} 
                    className="p-3 bg-[#121B2E]/65 border border-[#1F2E4D] rounded-2xl flex items-center justify-between text-left"
                  >
                    <div className="flex flex-col gap-0.5 max-w-[220px]">
                      <span className="text-[10px] font-black text-white truncate">{o.titleEN}</span>
                      <span className="text-[8px] text-slate-400 font-bold">{o.organization} • {o.category}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 border rounded-lg leading-none ${
                        o.status === 'approved' 
                          ? 'bg-emerald-550/10 border-emerald-500/20 text-emerald-400' 
                          : o.status === 'expired'
                          ? 'bg-amber-550/10 border-amber-500/20 text-amber-400'
                          : 'bg-rose-550/10 border-rose-500/20 text-rose-450 text-rose-400'
                      }`}>
                        {o.status}
                      </span>
                      
                      {o.status === 'approved' && (
                        <button
                          onClick={() => handleOppAction(o.id, 'expire')}
                          className="text-[8px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/10 px-2 py-1 rounded-lg hover:bg-amber-400/20 cursor-pointer text-center"
                        >
                          Expire
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}


        {/* 2. SOURCE WEBSITES BOARD SCREEN */}
        {adminTab === 'sources' && (
          <div className="flex flex-col gap-4 text-left">
            
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Crawling Website Directories</span>
              </h2>
              
              <button
                onClick={() => setIsAddingSource(!isAddingSource)}
                className="text-[9px] font-black bg-cyan-400 hover:bg-cyan-500 text-slate-900 px-3 py-1.5 rounded-xl cursor-pointer transition-colors flex items-center gap-0.5"
                id="add-source-btn"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                <span>Add New Link</span>
              </button>
            </div>

            {/* Add Source collapsing editor form */}
            {isAddingSource && (
              <form 
                onSubmit={handleAddSourceSubmit}
                className="bg-[#121B2E] border-2 border-cyan-500/20 rounded-3xl p-4 flex flex-col gap-3 shadow-lg"
              >
                <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">Register Source Website</h4>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase">Source Display Name</label>
                  <input 
                    type="text"
                    value={safeText(newSource.name, 'University Opportunity')}
                    onChange={e => setNewSource({ ...newSource, name: e.target.value })}
                    placeholder="e.g., Asiacell Careers Team"
                    className="bg-[#0B1020] border border-[#1F2E4D] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase">Absolute Website Address (URL)</label>
                  <input 
                    type="url"
                    value={newSource.url}
                    onChange={e => setNewSource({ ...newSource, url: e.target.value })}
                    placeholder="https://example.com/jobs"
                    className="bg-[#0B1020] border border-[#1F2E4D] rounded-xl p-2.5 text-xs text-white focus:outline-none text-left"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase">Primary Opportunity Type</label>
                  <select
                    value={newSource.type}
                    onChange={e => setNewSource({ ...newSource, type: e.target.value as any })}
                    className="bg-[#0B1020] border border-[#1F2E4D] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="jobs">jobs</option>
                    <option value="scholarships">scholarships</option>
                    <option value="trainings">trainings</option>
                    <option value="events">events</option>
                    <option value="competitions">competitions</option>
                  </select>
                </div>

                <div className="flex gap-2.5 mt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsAddingSource(false)}
                    className="flex-1 py-2 bg-[#1F2E4D] text-white hover:bg-slate-700 font-black text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2 bg-cyan-400 hover:bg-cyan-500 text-slate-900 font-black text-xs rounded-xl cursor-pointer"
                  >
                    Register Link
                  </button>
                </div>

              </form>
            )}

            {/* List Sources */}
            <div className="flex flex-col gap-3">
              {sources.map(s => (
                <div 
                  key={s.id}
                  className={`border border-[#1F2E4D] rounded-3xl p-3.5 shadow-sm transition-all ${
                    s.enabled ? 'bg-[#121B2E]' : 'bg-[#121B2E]/40 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex flex-col gap-0.5 max-w-[220px]">
                      <h4 className="text-xs font-black text-white uppercase tracking-tight">{safeText(s.name, 'University Opportunity')}</h4>
                      <a 
                        href={s.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[9px] text-cyan-400 hover:underline inline-flex items-center gap-0.5 truncate text-left"
                      >
                        <Globe className="w-3 h-3 translate-y-[0.5px]" />
                        <span>{s.url}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>

                    {/* Enable Check Toggle */}
                    <div className="flex items-center gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={s.enabled} 
                          onChange={() => handleToggleSource(s)}
                          className="sr-only peer" 
                        />
                        <div className="w-8 h-4.5 bg-slate-800 border border-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2.5px] after:left-[2.5px] after:bg-slate-400 peer-checked:after:bg-slate-900 after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-cyan-400" />
                        <span className="ml-1 text-[8px] font-black text-slate-400 uppercase peer-checked:text-cyan-400">
                          {s.enabled ? 'On' : 'Off'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Crawl Meta Status updates */}
                  <div className="mt-3.5 pt-2 border-t border-[#1F2E4D]/40 flex flex-wrap items-center justify-between gap-1.5 text-[8px] text-slate-400 font-bold">
                    <div className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Classifier Target: <strong className="text-white uppercase font-black">{s.type}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span>Last Checked:</span>
                      <strong className="text-slate-300">
                        {s.last_checked ? new Date(s.last_checked).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Never'}
                      </strong>
                    </div>
                  </div>

                  {/* Display Errors if any */}
                  {s.error_status && (
                    <div className="mt-2.5 p-2 bg-red-950/20 border border-red-500/10 text-[8px] text-rose-350 font-semibold rounded-xl flex items-center gap-1 text-rose-350">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      <span>Crawling error: {s.error_status}</span>
                    </div>
                  )}

                  {/* Delete Button Option */}
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => {
                        if(confirm('Delete source target registry?')) handleDeleteSource(s.id);
                      }}
                      className="text-[8px] font-black text-rose-450 hover:text-white bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/10 rounded-lg p-1 px-2.5 cursor-pointer flex items-center gap-0.5 transition-colors"
                    >
                      <Trash2 className="w-2.5 h-2.5 text-rose-400" />
                      <span>Delete Source</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}


        {/* 3. DIAGNOSTICS LOGS SCREEN */}
        {adminTab === 'logs' && (
          <div className="flex flex-col gap-4 text-left">
            
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 leading-none">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Diagnostic Automation Logs</span>
            </h2>

            <div className="flex flex-col gap-3">
              {logs.map(l => (
                <div 
                  key={l.id}
                  className="bg-[#121B2E] border border-[#1F2E4D] rounded-3xl p-3.5 flex flex-col gap-2 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-[10px] font-black text-white uppercase">{l.source_name}</strong>
                    <span className="text-[8px] font-extrabold text-slate-400">
                      {new Date(l.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[9px] py-1.5 border-y border-[#1F2E4D]/45 font-bold">
                    <div className="bg-[#0B1020]/40 p-1.5 rounded-xl border border-[#1F2E4D]/25">
                      <span className="text-slate-400 block text-[8px] uppercase">Found</span>
                      <strong className="text-white font-black">{l.items_found}</strong>
                    </div>

                    <div className="bg-emerald-500/5 p-1.5 rounded-xl border border-emerald-500/10">
                      <span className="text-emerald-400/80 block text-[8px] uppercase">New Pending</span>
                      <strong className="text-emerald-300 font-black">+{l.items_new}</strong>
                    </div>

                    <div className="bg-slate-800/10 p-1.5 rounded-xl border border-slate-700/20">
                      <span className="text-slate-400 block text-[8px] uppercase">Duplicates</span>
                      <strong className="text-slate-300 font-extrabold">{l.items_duplicate}</strong>
                    </div>
                  </div>

                  {l.errors && (
                    <div className="p-2 bg-red-950/25 border border-red-500/15 text-[8px] text-rose-350 font-semibold rounded-xl flex items-start gap-1 leading-snug">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>Errors: {l.errors}</span>
                    </div>
                  )}

                  <div className="text-[8px] text-slate-500 font-semibold text-right">
                    Trace ID: {l.id}
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}




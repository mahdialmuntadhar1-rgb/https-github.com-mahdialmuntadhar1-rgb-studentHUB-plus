import { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Plus, Save, Trash2, ExternalLink, Sparkles, Check, X } from 'lucide-react';
import { scholarships, type Scholarship } from '../data/scholarshipsData';
import type { Language } from '../types';

export default function AdminScholarshipsPage() {
  const [language, setLanguage] = useState<Language>('ar');
  const [scholarshipList, setScholarshipList] = useState<Scholarship[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState<Partial<Scholarship>>({
    title: '',
    titleAR: '',
    titleKU: '',
    provider: '',
    providerAR: '',
    providerKU: '',
    country: '',
    countryAR: '',
    countryKU: '',
    degreeLevel: [],
    degreeLevelAR: [],
    degreeLevelKU: [],
    fundingType: '',
    fundingTypeAR: '',
    fundingTypeKU: '',
    deadline: '',
    deadlineAR: '',
    deadlineKU: '',
    iraqEligible: 'unknown',
    iraqEligibleAR: '',
    iraqEligibleKU: '',
    summary: '',
    summaryAR: '',
    summaryKU: '',
    requirements: '',
    requirementsAR: '',
    requirementsKU: '',
    sourceName: '',
    sourceNameAR: '',
    sourceNameKU: '',
    sourceUrl: '',
    applyUrl: '',
    lastChecked: new Date().toISOString().split('T')[0],
    status: 'active',
    sourceType: 'discovery',
    featured: false
  });

  useEffect(() => {
    const saved = localStorage.getItem('jamiaati_admin_scholarships');
    if (saved) {
      setScholarshipList(JSON.parse(saved));
    } else {
      setScholarshipList(scholarships);
    }
  }, []);

  const saveScholarships = (updated: Scholarship[]) => {
    setScholarshipList(updated);
    localStorage.setItem('jamiaati_admin_scholarships', JSON.stringify(updated));
  };

  const handleEdit = (scholarship: Scholarship) => {
    setEditingId(scholarship.id);
    setFormData(scholarship);
    setShowAddForm(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      title: '',
      titleAR: '',
      titleKU: '',
      provider: '',
      providerAR: '',
      providerKU: '',
      country: '',
      countryAR: '',
      countryKU: '',
      degreeLevel: [],
      degreeLevelAR: [],
      degreeLevelKU: [],
      fundingType: '',
      fundingTypeAR: '',
      fundingTypeKU: '',
      deadline: '',
      deadlineAR: '',
      deadlineKU: '',
      iraqEligible: 'unknown',
      iraqEligibleAR: '',
      iraqEligibleKU: '',
      summary: '',
      summaryAR: '',
      summaryKU: '',
      requirements: '',
      requirementsAR: '',
      requirementsKU: '',
      sourceName: '',
      sourceNameAR: '',
      sourceNameKU: '',
      sourceUrl: '',
      applyUrl: '',
      lastChecked: new Date().toISOString().split('T')[0],
      status: 'active',
      sourceType: 'discovery',
      featured: false
    });
    setShowAddForm(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.provider || !formData.applyUrl) {
      setMessage('Please fill in required fields: Title, Provider, and Apply URL');
      return;
    }

    if (editingId) {
      const updated = scholarshipList.map(s => 
        s.id === editingId ? { ...formData, id: editingId } as Scholarship : s
      );
      saveScholarships(updated);
      setMessage('Scholarship updated successfully');
    } else {
      const newScholarship: Scholarship = {
        ...formData,
        id: `scholarship-${Date.now()}`,
        degreeLevel: formData.degreeLevel || [],
        degreeLevelAR: formData.degreeLevelAR || [],
        degreeLevelKU: formData.degreeLevelKU || [],
        status: formData.status || 'active',
        sourceType: formData.sourceType || 'discovery'
      } as Scholarship;
      saveScholarships([...scholarshipList, newScholarship]);
      setMessage('Scholarship added successfully');
    }

    setShowAddForm(false);
    setEditingId(null);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this scholarship?')) {
      const updated = scholarshipList.filter(s => s.id !== id);
      saveScholarships(updated);
      setMessage('Scholarship deleted');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const toggleStatus = (id: string) => {
    const updated = scholarshipList.map(s => 
      s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s
    );
    saveScholarships(updated);
  };

  const toggleFeatured = (id: string) => {
    const updated = scholarshipList.map(s => 
      s.id === id ? { ...s, featured: !s.featured } : s
    );
    saveScholarships(updated);
  };

  const getText = (ar: string, ku: string, en: string) => {
    if (language === 'ar') return ar;
    if (language === 'ku') return ku;
    return en;
  };

  return (
    <main className="min-h-screen bg-[#0B1020] px-4 py-8 text-white" dir={language === 'ar' || language === 'ku' ? 'rtl' : 'ltr'}>
      <section className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button 
            onClick={() => (window.location.href = '/')} 
            className="inline-flex items-center gap-2 rounded-2xl border border-[#1F2E4D] bg-[#121B2E] px-4 py-3 text-xs font-black text-cyan-300"
          >
            <ArrowLeft size={14} /> {getText('العودة', 'گەڕانەوە', 'Back')}
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage('ar')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors ${
                language === 'ar' ? 'bg-[#6B25C9] text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              عربي
            </button>
            <button
              onClick={() => setLanguage('ku')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors ${
                language === 'ku' ? 'bg-[#6B25C9] text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              کوردی
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors ${
                language === 'en' ? 'bg-[#6B25C9] text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              English
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-[2rem] border border-cyan-400/20 bg-[#121B2E] p-6">
          <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-cyan-300">
            <Sparkles size={14} /> {getText('إدارة المنح الدراسية', 'بەڕێوەبردنی بورسیەکان', 'Manage Scholarships')}
          </p>
          <h1 className="text-2xl font-black tracking-tight">
            {getText('إدارة سجلات المنح الدراسية', 'بەڕێوەبردنی تۆمارەکانی بورسیە', 'Scholarship Records Management')}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {getText(
              'إضافة وتعديل وحذف سجلات المنح. لا يتم تخزين طلبات الطلاب هنا.',
              'زیادکردن و دەستکاریکردن و سڕینەوەی تۆمارەکانی بورسیە. داواکارییەکانی قوتابی لێرە ناخەنرێت.',
              'Add, edit, and delete scholarship records. No student applications stored here.'
            )}
          </p>
        </div>

        {message && (
          <div className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-200">
            {message}
          </div>
        )}

        <div className="mb-6">
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#6B25C9] px-4 py-3 text-xs font-black text-white hover:bg-[#7B2FD9] transition-colors"
          >
            <Plus size={14} /> {getText('إضافة منحة جديدة', 'بورسیەی نوێ زیاد بکە', 'Add New Scholarship')}
          </button>
        </div>

        {showAddForm && (
          <div className="mb-8 rounded-3xl border border-[#1F2E4D] bg-[#121B2E] p-6">
            <h2 className="mb-4 text-lg font-black text-white">
              {editingId ? getText('تعديل المنحة', 'دەستکاریکردنی بورسیە', 'Edit Scholarship') : getText('إضافة منحة جديدة', 'بورسیەی نوێ زیاد بکە', 'Add New Scholarship')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-slate-400 uppercase">{getText('العنوان (EN)', 'ناونیشان (EN)', 'Title (EN)')} *</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-xl border border-[#1F2E4D] bg-slate-950 px-3 py-2 text-xs font-bold text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-slate-400 uppercase">{getText('العنوان (AR)', 'ناونیشان (AR)', 'Title (AR)')}</label>
                  <input
                    type="text"
                    value={formData.titleAR || ''}
                    onChange={(e) => setFormData({ ...formData, titleAR: e.target.value })}
                    className="w-full rounded-xl border border-[#1F2E4D] bg-slate-950 px-3 py-2 text-xs font-bold text-white"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-slate-400 uppercase">{getText('المزود (EN)', 'دابینکەر (EN)', 'Provider (EN)')} *</label>
                  <input
                    type="text"
                    value={formData.provider || ''}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full rounded-xl border border-[#1F2E4D] bg-slate-950 px-3 py-2 text-xs font-bold text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-slate-400 uppercase">{getText('البلد (EN)', 'وڵات (EN)', 'Country (EN)')}</label>
                  <input
                    type="text"
                    value={formData.country || ''}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full rounded-xl border border-[#1F2E4D] bg-slate-950 px-3 py-2 text-xs font-bold text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-slate-400 uppercase">{getText('نوع التمويل (EN)', 'جۆری تمۆژەرکردن (EN)', 'Funding Type (EN)')}</label>
                  <input
                    type="text"
                    value={formData.fundingType || ''}
                    onChange={(e) => setFormData({ ...formData, fundingType: e.target.value })}
                    className="w-full rounded-xl border border-[#1F2E4D] bg-slate-950 px-3 py-2 text-xs font-bold text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-slate-400 uppercase">{getText('الموعد النهائي (EN)', 'کۆتایی مۆڵەت (EN)', 'Deadline (EN)')}</label>
                  <input
                    type="text"
                    value={formData.deadline || ''}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full rounded-xl border border-[#1F2E4D] bg-slate-950 px-3 py-2 text-xs font-bold text-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-slate-400 uppercase">{getText('الأهلية للعراق', 'ئەھلییەتی بۆ عێراق', 'Iraq Eligibility')}</label>
                  <select
                    value={formData.iraqEligible || 'unknown'}
                    onChange={(e) => setFormData({ ...formData, iraqEligible: e.target.value as 'yes' | 'check' | 'unknown' })}
                    className="w-full rounded-xl border border-[#1F2E4D] bg-slate-950 px-3 py-2 text-xs font-bold text-white"
                  >
                    <option value="yes">{getText('نعم', 'بەڵێ', 'Yes')}</option>
                    <option value="check">{getText('تحقق', 'پشکنین', 'Check')}</option>
                    <option value="unknown">{getText('غير معروف', 'نەزانراو', 'Unknown')}</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-slate-400 uppercase">{getText('الملخص (EN)', 'پوختە (EN)', 'Summary (EN)')}</label>
                  <textarea
                    value={formData.summary || ''}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl border border-[#1F2E4D] bg-slate-950 px-3 py-2 text-xs font-bold text-white resize-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-slate-400 uppercase">{getText('المتطلبات (EN)', 'پاڵاوتنەکان (EN)', 'Requirements (EN)')}</label>
                  <textarea
                    value={formData.requirements || ''}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl border border-[#1F2E4D] bg-slate-950 px-3 py-2 text-xs font-bold text-white resize-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-slate-400 uppercase">{getText('اسم المصدر (EN)', 'ناوی سەرچاوە (EN)', 'Source Name (EN)')}</label>
                  <input
                    type="text"
                    value={formData.sourceName || ''}
                    onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
                    className="w-full rounded-xl border border-[#1F2E4D] bg-slate-950 px-3 py-2 text-xs font-bold text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-slate-400 uppercase">{getText('رابط المصدر', 'بەستەری سەرچاوە', 'Source URL')}</label>
                  <input
                    type="url"
                    value={formData.sourceUrl || ''}
                    onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                    className="w-full rounded-xl border border-[#1F2E4D] bg-slate-950 px-3 py-2 text-xs font-bold text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-slate-400 uppercase">{getText('رابط التقديم', 'بەستەری پێشکەشکردن', 'Apply URL')} *</label>
                  <input
                    type="url"
                    value={formData.applyUrl || ''}
                    onChange={(e) => setFormData({ ...formData, applyUrl: e.target.value })}
                    className="w-full rounded-xl border border-[#1F2E4D] bg-slate-950 px-3 py-2 text-xs font-bold text-white"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-xs font-black text-white hover:bg-emerald-600 transition-colors"
              >
                <Save size={14} /> {getText('حفظ', 'پاشەکەوت', 'Save')}
              </button>
              <button
                onClick={() => { setShowAddForm(false); setEditingId(null); }}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-700 px-4 py-2 text-xs font-black text-white hover:bg-slate-600 transition-colors"
              >
                <X size={14} /> {getText('إلغاء', 'پاشگەزبوونەوە', 'Cancel')}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {scholarshipList.map(scholarship => (
            <div key={scholarship.id} className="rounded-3xl border border-[#1F2E4D] bg-[#121B2E] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {scholarship.featured && (
                      <span className="rounded-full border border-[#FFD21F]/30 bg-[#FFD21F]/10 px-2 py-0.5 text-[9px] font-black uppercase text-[#FFD21F]">
                        {getText('مميز', 'تایبەت', 'Featured')}
                      </span>
                    )}
                    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase ${
                      scholarship.status === 'active' 
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' 
                        : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                    }`}>
                      {scholarship.status === 'active' ? getText('نشط', 'چالاک', 'Active') : getText('غير نشط', 'نەچالاک', 'Inactive')}
                    </span>
                    <span className="rounded-full border border-purple-400/30 bg-purple-400/10 px-2 py-0.5 text-[9px] font-black uppercase text-purple-300">
                      {scholarship.sourceType === 'official' ? getText('رسمي', 'فەرمی', 'Official') : getText('اكتشاف', 'دۆزینەوە', 'Discovery')}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white">{scholarship.title}</h3>
                  <p className="text-xs font-bold text-cyan-200">{scholarship.provider}</p>
                  <p className="mt-2 text-xs text-slate-400 line-clamp-2">{scholarship.summary}</p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(scholarship)}
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                    title={getText('تعديل', 'دەستکاری', 'Edit')}
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => toggleStatus(scholarship.id)}
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                    title={scholarship.status === 'active' ? getText('تعطيل', 'ناچالاککردن', 'Deactivate') : getText('تفعيل', 'چالاککردن', 'Activate')}
                  >
                    {scholarship.status === 'active' ? <X size={14} /> : <Check size={14} />}
                  </button>
                  <button
                    onClick={() => toggleFeatured(scholarship.id)}
                    className={`p-2 rounded-xl transition-colors ${scholarship.featured ? 'bg-[#FFD21F]/20 text-[#FFD21F]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                    title={getText('تمييز', 'تایبەتکردن', 'Toggle Featured')}
                  >
                    <Sparkles size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(scholarship.id)}
                    className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                    title={getText('حذف', 'سڕینەوە', 'Delete')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              <div className="mt-3 flex items-center gap-3">
                <a href={scholarship.applyUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400 hover:text-cyan-300">
                  <ExternalLink size={10} /> {getText('رابط التقديم', 'بەستەری پێشکەشکردن', 'Apply Link')}
                </a>
                <span className="text-[10px] text-slate-500">|</span>
                <span className="text-[10px] text-slate-500">{getText('آخر فحص', 'دواین پشکنین', 'Last checked')}: {scholarship.lastChecked}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-[8px] font-mono font-bold text-slate-500">
            Build: Jamiaati Official Frontend - 2026-06-10 · Admin Scholarships Module
          </p>
        </div>
      </section>
    </main>
  );
}

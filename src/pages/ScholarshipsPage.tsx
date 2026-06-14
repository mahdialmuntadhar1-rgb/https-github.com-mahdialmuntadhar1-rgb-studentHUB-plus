import { useState, useMemo } from 'react';
import { ArrowLeft, GraduationCap, Sparkles } from 'lucide-react';
import ScholarshipCard from '../components/ScholarshipCard';
import ScholarshipFilters from '../components/ScholarshipFilters';
import { scholarships, type Scholarship } from '../data/scholarshipsData';
import type { Language } from '../types';

export default function ScholarshipsPage() {
  // Get language from localStorage or default to Arabic
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('jamiaati_language');
    return (saved === 'ar' || saved === 'ku' || saved === 'en') ? saved : 'ar';
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedDegreeLevel, setSelectedDegreeLevel] = useState('all');
  const [selectedFundingType, setSelectedFundingType] = useState('all');
  const [selectedDeadline, setSelectedDeadline] = useState('all');
  const [selectedIraqEligible, setSelectedIraqEligible] = useState('all');
  const [savedScholarships, setSavedScholarships] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('jamiaati_saved_scholarships');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Extract unique values for filters
  const countries = useMemo(() => {
    const unique = new Set(scholarships.map(s => s.country));
    return Array.from(unique).sort();
  }, []);

  const degreeLevels = useMemo(() => {
    const unique = new Set<string>();
    scholarships.forEach(s => s.degreeLevel.forEach(level => unique.add(level)));
    return Array.from(unique).sort();
  }, []);

  const fundingTypes = useMemo(() => {
    const unique = new Set(scholarships.map(s => s.fundingType));
    return Array.from(unique).sort();
  }, []);

  // Filter scholarships
  const filteredScholarships = useMemo(() => {
    return scholarships.filter(scholarship => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const title = scholarship.title.toLowerCase();
        const titleAR = scholarship.titleAR?.toLowerCase() || '';
        const titleKU = scholarship.titleKU?.toLowerCase() || '';
        const provider = scholarship.provider.toLowerCase();
        const summary = scholarship.summary.toLowerCase();
        const summaryAR = scholarship.summaryAR?.toLowerCase() || '';
        const summaryKU = scholarship.summaryKU?.toLowerCase() || '';
        
        const matchesSearch = 
          title.includes(query) || 
          titleAR.includes(query) || 
          titleKU.includes(query) ||
          provider.includes(query) ||
          summary.includes(query) ||
          summaryAR.includes(query) ||
          summaryKU.includes(query);
        
        if (!matchesSearch) return false;
      }

      // Country filter
      if (selectedCountry !== 'all' && scholarship.country !== selectedCountry) {
        return false;
      }

      // Degree level filter
      if (selectedDegreeLevel !== 'all' && !scholarship.degreeLevel.includes(selectedDegreeLevel)) {
        return false;
      }

      // Funding type filter
      if (selectedFundingType !== 'all' && scholarship.fundingType !== selectedFundingType) {
        return false;
      }

      // Iraq eligibility filter
      if (selectedIraqEligible !== 'all' && scholarship.iraqEligible !== selectedIraqEligible) {
        return false;
      }

      // Deadline filter (simplified - would need actual date parsing for real implementation)
      if (selectedDeadline === 'closing-soon') {
        // For now, just show all - would need real deadline dates
        return true;
      }
      if (selectedDeadline === 'this-month') {
        // For now, just show all - would need real deadline dates
        return true;
      }

      return true;
    });
  }, [searchQuery, selectedCountry, selectedDegreeLevel, selectedFundingType, selectedDeadline, selectedIraqEligible]);

  // Sort: featured first, then by id
  const sortedScholarships = useMemo(() => {
    return [...filteredScholarships].sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return a.id.localeCompare(b.id);
    });
  }, [filteredScholarships]);

  const handleSave = (id: string) => {
    setSavedScholarships(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      localStorage.setItem('jamiaati_saved_scholarships', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  const getText = (ar: string, ku: string, en: string) => {
    if (language === 'ar') return ar;
    if (language === 'ku') return ku;
    return en;
  };

  return (
    <main className="min-h-screen bg-[#0B1020] text-white" dir={language === 'ar' || language === 'ku' ? 'rtl' : 'ltr'}>
      <div className="max-w-md mx-auto min-h-screen flex flex-col bg-[#0B1020]">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-[#0B1020]/95 backdrop-blur-md border-b border-[#1F2E4D] px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => (window.location.href = '/')}
              className="flex items-center gap-2 rounded-2xl border border-[#1F2E4D] bg-[#121B2E] px-3 py-2 text-xs font-black text-cyan-300 hover:border-[#6B25C9] transition-colors"
            >
              <ArrowLeft size={14} />
              {getText('الرئيسية', 'سەرەکی', 'Home')}
            </button>
          </div>

          <div className="mb-2">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-6 h-6 text-[#FFD21F]" />
              <h1 className="text-xl font-black text-white">
                {getText('المنح الدراسية', 'بورسیەکان', 'Scholarships')}
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-semibold">
              {getText(
                'تصفح فرص المنح الدراسية للطلاب العراقيين',
                'بورسیەکان بۆ خوێندکارانی عێراقی ببینە',
                'Browse scholarship opportunities for Iraqi students'
              )}
            </p>
          </div>

          {/* Language toggle */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setLanguage('ar')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors ${
                language === 'ar' 
                  ? 'bg-[#6B25C9] text-white' 
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              عربي
            </button>
            <button
              onClick={() => setLanguage('ku')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors ${
                language === 'ku' 
                  ? 'bg-[#6B25C9] text-white' 
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              کوردی
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors ${
                language === 'en' 
                  ? 'bg-[#6B25C9] text-white' 
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 py-4">
          <ScholarshipFilters
            language={language}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCountry={selectedCountry}
            onCountryChange={setSelectedCountry}
            selectedDegreeLevel={selectedDegreeLevel}
            onDegreeLevelChange={setSelectedDegreeLevel}
            selectedFundingType={selectedFundingType}
            onFundingTypeChange={setSelectedFundingType}
            selectedDeadline={selectedDeadline}
            onDeadlineChange={setSelectedDeadline}
            selectedIraqEligible={selectedIraqEligible}
            onIraqEligibleChange={setSelectedIraqEligible}
            countries={countries}
            degreeLevels={degreeLevels}
            fundingTypes={fundingTypes}
          />
        </div>

        {/* Results count */}
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
            <Sparkles size={12} className="text-cyan-400" />
            {getText(
              `${sortedScholarships.length} منحة متاحة`,
              `${sortedScholarships.length} بورسیە بەردەستە`,
              `${sortedScholarships.length} scholarships available`
            )}
          </div>
        </div>

        {/* Scholarship cards */}
        <div className="px-4 pb-8 flex-1">
          {sortedScholarships.length === 0 ? (
            <div className="text-center py-12 bg-[#121B2E] rounded-3xl border border-[#1F2E4D]">
              <div className="text-4xl mb-3">🎓</div>
              <h3 className="font-extrabold text-white text-sm mb-2">
                {getText('لا توجد نتائج', 'هیچ ئەنجامێک نییە', 'No results found')}
              </h3>
              <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                {getText(
                  'جرب تغيير الفلاتر أو البحث بكلمات مختلفة',
                  'فلتەرەکە بگۆڕە یان بە وشەی جیاواز بگەڕێ',
                  'Try changing filters or searching with different keywords'
                )}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {sortedScholarships.map(scholarship => (
                <ScholarshipCard
                  scholarship={scholarship}
                  language={language}
                  onSave={handleSave}
                  isSaved={savedScholarships.has(scholarship.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#1F2E4D] px-4 py-3 text-center">
          <p className="text-[8px] font-mono font-bold text-slate-500">
            Build: Jamiaati Official Frontend - 2026-06-10 · Scholarships Module
          </p>
        </div>
      </div>
    </main>
  );
}

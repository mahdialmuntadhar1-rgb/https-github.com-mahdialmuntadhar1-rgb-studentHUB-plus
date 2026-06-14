import { Search, Filter, X } from 'lucide-react';
import type { Language } from '../types';

interface ScholarshipFiltersProps {
  language: Language;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  selectedDegreeLevel: string;
  onDegreeLevelChange: (level: string) => void;
  selectedFundingType: string;
  onFundingTypeChange: (type: string) => void;
  selectedDeadline: string;
  onDeadlineChange: (deadline: string) => void;
  selectedIraqEligible: string;
  onIraqEligibleChange: (eligible: string) => void;
  countries: string[];
  degreeLevels: string[];
  fundingTypes: string[];
}

export default function ScholarshipFilters({
  language,
  searchQuery,
  onSearchChange,
  selectedCountry,
  onCountryChange,
  selectedDegreeLevel,
  onDegreeLevelChange,
  selectedFundingType,
  onFundingTypeChange,
  selectedDeadline,
  onDeadlineChange,
  selectedIraqEligible,
  onIraqEligibleChange,
  countries,
  degreeLevels,
  fundingTypes
}: ScholarshipFiltersProps) {
  const hasActiveFilters = selectedCountry !== 'all' || selectedDegreeLevel !== 'all' || 
                          selectedFundingType !== 'all' || selectedDeadline !== 'all' || 
                          selectedIraqEligible !== 'all' || searchQuery.trim() !== '';

  const clearAllFilters = () => {
    onSearchChange('');
    onCountryChange('all');
    onDegreeLevelChange('all');
    onFundingTypeChange('all');
    onDeadlineChange('all');
    onIraqEligibleChange('all');
  };

  const getLabel = (en: string, ar: string, ku: string) => {
    if (language === 'ar') return ar;
    if (language === 'ku') return ku;
    return en;
  };

  return (
    <div className="bg-[#121B2E] rounded-3xl border border-[#1F2E4D] p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
            {getLabel('Filters', 'الفلترة', 'فلتەر')}
          </span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white transition-colors"
          >
            <X size={12} />
            {getLabel('Clear all', 'مسح الكل', 'سڕینەوەی هەموو')}
          </button>
        )}
      </div>

      {/* Search Box */}
      <div className="mb-4">
        <label className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={getLabel('Search scholarships...', 'ابحث عن المنح...', 'گەڕان بەدوای بورسیە...')}
            className="w-full rounded-2xl border border-[#1F2E4D] bg-slate-950 py-3 pl-9 pr-4 text-xs font-bold text-white outline-none placeholder:text-slate-500 focus:border-[#6B25C9] transition-colors"
          />
        </label>
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Country Filter */}
        <div>
          <label className="block mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {getLabel('Country', 'البلد', 'وڵات')}
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => onCountryChange(e.target.value)}
            className="w-full rounded-xl border border-[#1F2E4D] bg-slate-950 py-2.5 px-3 text-[10px] font-bold text-white outline-none focus:border-[#6B25C9] transition-colors"
          >
            <option value="all">{getLabel('All Countries', 'جميع البلدان', 'هەموو وڵاتان')}</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        {/* Degree Level Filter */}
        <div>
          <label className="block mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {getLabel('Degree Level', 'مستوى الدرجة', 'ئاستی بڕوانامە')}
          </label>
          <select
            value={selectedDegreeLevel}
            onChange={(e) => onDegreeLevelChange(e.target.value)}
            className="w-full rounded-xl border border-[#1F2E4D] bg-slate-950 py-2.5 px-3 text-[10px] font-bold text-white outline-none focus:border-[#6B25C9] transition-colors"
          >
            <option value="all">{getLabel('All Levels', 'جميع المستويات', 'هەموو ئاستەکان')}</option>
            {degreeLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        {/* Funding Type Filter */}
        <div>
          <label className="block mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {getLabel('Funding Type', 'نوع التمويل', 'جۆری تمۆژەرکردن')}
          </label>
          <select
            value={selectedFundingType}
            onChange={(e) => onFundingTypeChange(e.target.value)}
            className="w-full rounded-xl border border-[#1F2E4D] bg-slate-950 py-2.5 px-3 text-[10px] font-bold text-white outline-none focus:border-[#6B25C9] transition-colors"
          >
            <option value="all">{getLabel('All Types', 'جميع الأنواع', 'هەموو جۆرەکان')}</option>
            {fundingTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Deadline Filter */}
        <div>
          <label className="block mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {getLabel('Deadline', 'الموعد النهائي', 'کۆتایی مۆڵەت')}
          </label>
          <select
            value={selectedDeadline}
            onChange={(e) => onDeadlineChange(e.target.value)}
            className="w-full rounded-xl border border-[#1F2E4D] bg-slate-950 py-2.5 px-3 text-[10px] font-bold text-white outline-none focus:border-[#6B25C9] transition-colors"
          >
            <option value="all">{getLabel('All Deadlines', 'جميع المواعيد', 'هەموو موێتەکان')}</option>
            <option value="closing-soon">{getLabel('Closing Soon', 'تغلق قريباً', 'بەمزووە دەبەت')}</option>
            <option value="this-month">{getLabel('This Month', 'هذا الشهر', 'ئەم مانگە')}</option>
          </select>
        </div>

        {/* Iraq Eligible Filter - Full Width */}
        <div className="col-span-2">
          <label className="block mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {getLabel('Iraq Eligibility', 'الأهلية للعراق', 'ئەھلییەتی بۆ عێراق')}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => onIraqEligibleChange('all')}
              className={`flex-1 rounded-xl border py-2 px-3 text-[10px] font-bold transition-colors ${
                selectedIraqEligible === 'all'
                  ? 'border-[#6B25C9] bg-[#6B25C9] text-white'
                  : 'border-[#1F2E4D] bg-slate-950 text-slate-300 hover:border-[#6B25C9]/50'
              }`}
            >
              {getLabel('All', 'الكل', 'هەموو')}
            </button>
            <button
              onClick={() => onIraqEligibleChange('yes')}
              className={`flex-1 rounded-xl border py-2 px-3 text-[10px] font-bold transition-colors ${
                selectedIraqEligible === 'yes'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  : 'border-[#1F2E4D] bg-slate-950 text-slate-300 hover:border-emerald-500/50'
              }`}
            >
              {getLabel('Eligible', 'متاح', 'ئەھلی')}
            </button>
            <button
              onClick={() => onIraqEligibleChange('check')}
              className={`flex-1 rounded-xl border py-2 px-3 text-[10px] font-bold transition-colors ${
                selectedIraqEligible === 'check'
                  ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                  : 'border-[#1F2E4D] bg-slate-950 text-slate-300 hover:border-amber-500/50'
              }`}
            >
              {getLabel('Check', 'تحقق', 'پشکنین')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

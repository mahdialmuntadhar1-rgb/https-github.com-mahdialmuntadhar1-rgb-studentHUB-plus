import React from 'react';
import { Language, Governorate, University } from '../types';
import { MapPin, School, ChevronDown } from 'lucide-react';
import { getTranslation } from '../data/translations';

interface MainFiltersProps {
  language: Language;
  selectedGov: string;
  setSelectedGov: (id: string) => void;
  selectedUni: string;
  setSelectedUni: (id: string) => void;
  governorates: Governorate[];
  institutions: University[];
  institutionsLoading: boolean;
}

export default function MainFilters({
  language,
  selectedGov,
  setSelectedGov,
  selectedUni,
  setSelectedUni,
  governorates,
  institutions,
  institutionsLoading
}: MainFiltersProps) {
  // Filter institutions based on selected governorate
  const filteredInstitutions = selectedGov === 'all' 
    ? institutions 
    : institutions.filter(inst => inst.governorateId === selectedGov);

  const getGovernorateName = (govId: string) => {
    if (govId === 'all') {
      return getTranslation('allGovs', language);
    }
    const gov = governorates.find(g => g.id === govId);
    if (!gov) return getTranslation('allGovs', language);
    return language === 'ar' ? gov.nameAR : language === 'ku' ? gov.nameKU : gov.nameEN;
  };

  const getInstitutionName = (uniId: string) => {
    if (uniId === 'all') {
      return getTranslation('allUnis', language);
    }
    const uni = institutions.find(u => u.id === uniId);
    if (!uni) return getTranslation('allUnis', language);
    return language === 'ar' ? uni.nameAR : language === 'ku' ? uni.nameKU : uni.nameEN;
  };

  // Reset university selection when governorate changes
  const handleGovChange = (govId: string) => {
    setSelectedGov(govId);
    setSelectedUni('all');
  };

  return (
    <div className="w-full bg-white border-b border-slate-200 px-4 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Governorate Filter */}
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {getTranslation('governorate', language)}
            </label>
            <div className="relative">
              <select
                value={selectedGov}
                onChange={(e) => handleGovChange(e.target.value)}
                className="w-full appearance-none bg-slate-50 border-2 border-slate-200 hover:border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg px-4 py-3 pr-10 text-sm font-semibold text-slate-800 cursor-pointer transition-all duration-200"
              >
                <option value="all">{getTranslation('allGovs', language)}</option>
                {governorates.map((gov) => (
                  <option key={gov.id} value={gov.id}>
                    {language === 'ar' ? gov.nameAR : language === 'ku' ? gov.nameKU : gov.nameEN}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Academic Institutions Filter */}
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
              <School className="w-3.5 h-3.5" />
              {language === 'ar' ? 'المؤسسات الأكاديمية' : language === 'ku' ? 'مؤسسە ئەکادیمییەکان' : 'Academic Institutions'}
            </label>
            <div className="relative">
              <select
                value={selectedUni}
                onChange={(e) => setSelectedUni(e.target.value)}
                disabled={institutionsLoading || filteredInstitutions.length === 0}
                className="w-full appearance-none bg-slate-50 border-2 border-slate-200 hover:border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg px-4 py-3 pr-10 text-sm font-semibold text-slate-800 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="all">{getTranslation('allUnis', language)}</option>
                {filteredInstitutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {language === 'ar' ? inst.nameAR : language === 'ku' ? inst.nameKU : inst.nameEN}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            {institutionsLoading && (
              <p className="text-[10px] text-slate-500 mt-1">
                {language === 'ar' ? 'جاري التحميل...' : language === 'ku' ? 'بار دەکرێت...' : 'Loading...'}
              </p>
            )}
          </div>
        </div>

        {/* Filter Summary */}
        {(selectedGov !== 'all' || selectedUni !== 'all') && (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold">
              {language === 'ar' ? 'عرض:' : language === 'ku' ? 'پیشاندان:' : 'Showing:'}
            </span>
            {selectedGov !== 'all' && (
              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                {getGovernorateName(selectedGov)}
              </span>
            )}
            {selectedUni !== 'all' && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                {getInstitutionName(selectedUni)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

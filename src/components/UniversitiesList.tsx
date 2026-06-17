import React, { useState } from 'react';
import { Language, University } from '../types';
import { IraqiUniversities, IraqiGovernorates } from '../data/mockData';
import { getTranslation } from '../data/translations';
import { Search, MapPin, CheckCircle, ArrowRight, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface UniversitiesListProps {
  language: Language;
  selectedUni: string;
  setSelectedUni: (id: string) => void;
  selectedGov: string;
  setSelectedGov: (id: string) => void;
  institutions?: University[];
  onNavigateTab: (tab: any) => void;
}

export default function UniversitiesList({
  language,
  selectedUni,
  setSelectedUni,
  selectedGov,
  setSelectedGov,
  institutions = [],
  onNavigateTab
}: UniversitiesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [govFilter, setGovFilter] = useState('all');

  const sourceList = institutions && institutions.length > 0 ? institutions : IraqiUniversities;

  // Filter list of universities by search term and selected governorate
  const filteredList = sourceList.filter(uni => {
    const matchesSearch = 
      uni.nameEN.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uni.nameAR.includes(searchTerm) ||
      (uni.nameKU && uni.nameKU.includes(searchTerm));

    const matchesGov = govFilter === 'all' || uni.governorateId === govFilter;

    return matchesSearch && matchesGov;
  });

  const getGovName = (govId: string) => {
    const gov = IraqiGovernorates.find(g => g.id === govId);
    if (!gov) return govId;
    return language === 'ar' ? gov.nameAR : language === 'ku' ? gov.nameKU : gov.nameEN;
  };

  const handleSelectUniversity = (uniId: string, govId: string) => {
    setSelectedUni(uniId);
    setSelectedGov(govId);
    // Navigate back to Home smoothly to see targeted updates
    onNavigateTab('home');
  };

  return (
    <div className="px-4 py-5 max-w-lg mx-auto flex flex-col pb-24 bg-[#F8FAFC] min-h-screen" id="universities-list-view">
      
      {/* Dynamic Header Badge / Prompt */}
      <div className="mb-4 text-center">
        <span className="text-[9px] font-black uppercase tracking-widest bg-orange-100 text-orange-700 px-3 py-1 rounded-full border border-orange-200">
          🇮🇶 {language === 'ar' ? 'دليل الجامعات العراقية' : language === 'ku' ? 'ڕێبەری زانکۆکانی عێراق' : 'Directory of Iraqi Universities'}
        </span>
        <h2 className="text-sm font-black text-slate-800 tracking-tight mt-2.5">
          {language === 'ar' ? 'اختر وتواصل مع مجتمع كليتك لتبتكر الفرص' : language === 'ku' ? 'زانکۆکەت هەڵبژێرە بۆ بەستنەوەی کۆمەڵگەکەت' : 'Find your University Community & Opportunities'}
        </h2>
        <p className="text-[10px] text-slate-500 font-bold mt-1 max-w-xs mx-auto leading-normal">
          {language === 'ar' ? 'حدد جامعتك لتبدأ تصفّح منشورات حياة الحرم والتقديم للفرص المطروحة.' : language === 'ku' ? 'زانکۆکەت دیاری بکە بۆ گەڕان بەدوای تاقیکردنەوەکان و چالاکییەکان.' : 'Selecting a university filters your updates and official campus announcements.'}
        </p>
      </div>

      {/* Modern Search Field */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={language === 'ar' ? 'ابحث عن جامعتك بالاسم...' : language === 'ku' ? 'بگەڕێ بەپێی ناوی زانکۆکەت...' : 'Search universities...'}
          className="w-full text-xs font-bold border-2 border-slate-200 focus:border-orange-400 focus:bg-white rounded-2xl pl-10 pr-4 py-2.5 outline-none transition-all bg-white text-slate-800"
        />
      </div>

      {/* Horizontal Governorate Chips selection */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-3 scrollbar-none snap-x" id="univ-gov-horizontal-chips">
        <button
          onClick={() => setGovFilter('all')}
          className={`px-3 py-1.5 text-[10px] font-black rounded-lg uppercase cursor-pointer shrink-0 snap-start transition-all ${
            govFilter === 'all'
              ? 'bg-slate-900 border-2 border-slate-905 text-white'
              : 'bg-white border-2 border-slate-200 text-slate-500 hover:border-slate-350'
          }`}
        >
          🌍 {getTranslation('filterAll', language)}
        </button>
        {IraqiGovernorates.map(gov => {
          const govName = language === 'ar' ? gov.nameAR : language === 'ku' ? gov.nameKU : gov.nameEN;
          return (
            <button
              key={gov.id}
              onClick={() => setGovFilter(gov.id)}
              className={`px-3 py-1.5 text-[10px] font-black rounded-lg cursor-pointer shrink-0 snap-start transition-all ${
                govFilter === gov.id
                  ? 'bg-orange-500 border-2 border-orange-550 text-white'
                  : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              📍 {govName}
            </button>
          );
        })}
      </div>

      {/* Directory Count Title */}
      <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2.5 px-1">
        <span>{language === 'ar' ? 'المؤسسات المتاحة' : language === 'ku' ? 'دامەزراوەکان' : 'Listings'} ({filteredList.length})</span>
        <span className="text-orange-600 font-extrabold">{language === 'ar' ? 'تصفية نشطة' : 'Active filtering'}</span>
      </div>

      {/* List of custom university cards */}
      <div className="flex flex-col gap-3" id="univ-items-grid">
        {filteredList.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <span className="text-3xl block mb-2">🔭</span>
            <span className="text-xs font-black text-slate-700 block">
              {language === 'ar' ? 'لا يوجد نتائج مطابقة للبحث' : 'No universities match this filter'}
            </span>
            <span className="text-[10px] text-slate-500 max-w-xs mt-1 block">
              {language === 'ar' ? 'جرّب كتابة كلمة أخرى أو وسّع فلتر المحافظة.' : 'Try changing your search text or clear governorate choice.'}
            </span>
          </div>
        ) : (
          filteredList.map(uni => {
            const uniName = language === 'ar' ? uni.nameAR : language === 'ku' ? uni.nameKU : uni.nameEN;
            const govName = getGovName(uni.governorateId);
            const isSelected = selectedUni === uni.id;

            return (
              <motion.div
                key={uni.id}
                id={`univ-card-${uni.id}`}
                whileHover={{ y: -1 }}
                transition={{ duration: 0.15 }}
                className={`bg-white rounded-3xl p-4.5 border-2 transition-all flex flex-col justify-between gap-3.5 shadow-sm relative overflow-hidden ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50/20'
                    : 'border-[#E6E1F5] hover:border-orange-400'
                }`}
              >
                {/* Decorative spotlight for active focused list selection */}
                {isSelected && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100 rounded-full blur-2xl pointer-events-none opacity-60" />
                )}

                <div className="flex items-start gap-3">
                  <span className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-lg shrink-0 shadow-xs select-none">
                    {uni.logo || '🏫'}
                  </span>
                  <div className="flex-1 min-w-0 pr-1 text-left">
                    <span className="text-[8px] font-black bg-slate-100 text-slate-500 border border-slate-200/60 px-1.5 py-0.5 rounded uppercase tracking-wider">
                      Academic Campus
                    </span>
                    <h3 className="text-xs sm:text-xs font-black text-slate-800 leading-tight tracking-tight mt-1 truncate">
                      {uniName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold mt-1.5">
                      <span className="text-slate-600 flex items-center gap-0.5">
                        📍 {govName}
                      </span>
                      <span>•</span>
                      <span className="text-rose-600 font-extrabold flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-current text-[#FFD21F] stroke-none" />
                        Verified Partner
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info Statistics & Selection Actions Row */}
                <div className="flex items-center justify-between border-t border-slate-100/80 pt-3 flex-wrap gap-2">
                  <div className="flex items-center gap-1 text-[9.5px] text-slate-500 font-extrabold">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
                    <span>{isSelected ? (language === 'ar' ? 'الموقع النشط حالياً' : 'Currently focusing') : (language === 'ar' ? 'جاهز للتواصل' : 'Ready')}</span>
                  </div>

                  <button
                    onClick={() => handleSelectUniversity(uni.id, uni.governorateId)}
                    className={`py-1.5 px-3.5 rounded-xl text-[10px] font-black cursor-pointer tracking-tight transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-orange-500 text-white shadow-sm hover:opacity-95'
                        : 'bg-[#FFD21F] hover:bg-[#FFE052] text-slate-800 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#161A33]'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'تم الاختيار' : language === 'ku' ? 'هەڵبژێردراوە' : 'Focused ✓'}</span>
                      </>
                    ) : (
                      <>
                        <span>{language === 'ar' ? 'اختر هذه الجامعة' : language === 'ku' ? 'ئەمە دیاری بکە' : 'Select Campus'}</span>
                        <ArrowRight className="w-3 h-3 ml-0.5" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

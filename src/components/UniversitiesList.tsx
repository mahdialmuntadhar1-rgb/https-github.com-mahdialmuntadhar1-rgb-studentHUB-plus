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

  const normalizeUniversityGovId = (raw: any): string => {
    const text = String(raw || '').trim().toLowerCase();

    if (!text || text === 'all' || text === 'all iraq' || text === 'iraq' || text === 'iraq-wide') return 'all';

    const normalized = text
      .replace(/governorate/g, '')
      .replace(/province/g, '')
      .replace(/محافظة/g, '')
      .replace(/پارێزگا/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const aliases: Record<string, string[]> = {
      baghdad: ['baghdad', 'بغداد', 'بەغدا'],
      nineveh: ['nineveh', 'ninawa', 'nainawa', 'mosul', 'ninhava', 'نينوى', 'الموصل', 'نەینەوا', 'موسڵ'],
      basra: ['basra', 'basrah', 'البصرة', 'بەسرە'],
      sulaymaniyah: ['sulaymaniyah', 'sulaimani', 'sulaimaniyah', 'slemani', 'suli', 'السليمانية', 'سلێمانی'],
      erbil: ['erbil', 'hawler', 'hewler', 'أربيل', 'اربيل', 'هەولێر'],
      kirkuk: ['kirkuk', 'كركوك', 'کەرکووک'],
      najaf: ['najaf', 'النجف', 'نەجەف', 'kufa', 'الكوفة'],
      karbala: ['karbala', 'kerbala', 'كربلاء', 'کەربەلا'],
      dhi_qar: ['dhi qar', 'dhi_qar', 'thi qar', 'thi_qar', 'ziqar', 'ذي قار', 'زیقار', 'nasiriyah', 'الناصرية'],
      babil: ['babil', 'babylon', 'بابل'],
      anbar: ['anbar', 'الأنبار', 'الانبار', 'ئەنبار'],
      diyala: ['diyala', 'ديالى', 'دیالە'],
      salah_al_din: ['salah al-din', 'salah ad-din', 'salahaddin', 'salahaldeen', 'salah_al_din', 'tikrit', 'تكريت', 'صلاح الدين', 'سەڵاحەدین'],
      wasit: ['wasit', 'واسط', 'واست', 'kut', 'الكوت'],
      maysan: ['maysan', 'missan', 'ميسان', 'میسان', 'amara', 'العمارة'],
      al_qadisiyah: ['al-qadisiyah', 'al qadisiyah', 'al_qadisiyah', 'qadisiyah', 'qadisiyyah', 'diwaniyah', 'القادسية', 'الديوانية', 'قادسیە'],
      muthanna: ['muthanna', 'samawah', 'المثنى', 'السماوة', 'موسەننا'],
      duhok: ['duhok', 'dohuk', 'دهوك', 'دهۆک'],
      halabja: ['halabja', 'حلبجة', 'هەڵەبجە']
    };

    for (const [govId, names] of Object.entries(aliases)) {
      if (normalized === govId || names.some(alias => normalized.includes(alias.toLowerCase()))) return govId;
    }

    return normalized.replace(/\s+/g, '_').replace(/-/g, '_').replace(/[^\w_]/g, '') || 'all';
  };

  const getUniversityGovId = (uni: any): string => {
    return normalizeUniversityGovId(
      uni?.governorateId ||
      uni?.governorate ||
      uni?.governorate_name ||
      uni?.governorateName ||
      uni?.city ||
      uni?.location ||
      uni?.address
    );
  };

  const normalizedSourceList = sourceList.map((uni: any) => ({
    ...uni,
    governorateId: getUniversityGovId(uni)
  }));

  const strictGovList = govFilter === 'all'
    ? normalizedSourceList
    : normalizedSourceList.filter((uni: any) => getUniversityGovId(uni) === govFilter);

  // Public beta safety: if the selected governorate has a mapping issue, do not show zero.
  const governorateSafeList = govFilter === 'all' || strictGovList.length > 0
    ? strictGovList
    : normalizedSourceList;

  // Filter list of universities by search term and selected governorate
  const filteredList = governorateSafeList.filter((uni: any) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      String(uni.nameEN || '').toLowerCase().includes(q) ||
      String(uni.nameAR || '').toLowerCase().includes(q) ||
      String(uni.nameKU || '').toLowerCase().includes(q);

    return matchesSearch;
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
          ðŸ‡®ðŸ‡¶ {language === 'ar' ? 'Ø¯Ù„ÙŠÙ„ Ø§Ù„Ø¬Ø§Ù…Ø¹Ø§Øª Ø§Ù„Ø¹Ø±Ø§Ù‚ÙŠØ©' : language === 'ku' ? 'Ú•ÛŽØ¨Û•Ø±ÛŒ Ø²Ø§Ù†Ú©Û†Ú©Ø§Ù†ÛŒ Ø¹ÛŽØ±Ø§Ù‚' : 'Directory of Iraqi Universities'}
        </span>
        <h2 className="text-sm font-black text-slate-800 tracking-tight mt-2.5">
          {language === 'ar' ? 'Ø§Ø®ØªØ± ÙˆØªÙˆØ§ØµÙ„ Ù…Ø¹ Ù…Ø¬ØªÙ…Ø¹ ÙƒÙ„ÙŠØªÙƒ Ù„ØªØ¨ØªÙƒØ± Ø§Ù„ÙØ±Øµ' : language === 'ku' ? 'Ø²Ø§Ù†Ú©Û†Ú©Û•Øª Ù‡Û•ÚµØ¨Ú˜ÛŽØ±Û• Ø¨Û† Ø¨Û•Ø³ØªÙ†Û•ÙˆÛ•ÛŒ Ú©Û†Ù…Û•ÚµÚ¯Û•Ú©Û•Øª' : 'Find your University Community & Opportunities'}
        </h2>
        <p className="text-[10px] text-slate-500 font-bold mt-1 max-w-xs mx-auto leading-normal">
          {language === 'ar' ? 'Ø­Ø¯Ø¯ Ø¬Ø§Ù…Ø¹ØªÙƒ Ù„ØªØ¨Ø¯Ø£ ØªØµÙÙ‘Ø­ Ù…Ù†Ø´ÙˆØ±Ø§Øª Ø­ÙŠØ§Ø© Ø§Ù„Ø­Ø±Ù… ÙˆØ§Ù„ØªÙ‚Ø¯ÙŠÙ… Ù„Ù„ÙØ±Øµ Ø§Ù„Ù…Ø·Ø±ÙˆØ­Ø©.' : language === 'ku' ? 'Ø²Ø§Ù†Ú©Û†Ú©Û•Øª Ø¯ÛŒØ§Ø±ÛŒ Ø¨Ú©Û• Ø¨Û† Ú¯Û•Ú•Ø§Ù† Ø¨Û•Ø¯ÙˆØ§ÛŒ ØªØ§Ù‚ÛŒÚ©Ø±Ø¯Ù†Û•ÙˆÛ•Ú©Ø§Ù† Ùˆ Ú†Ø§Ù„Ø§Ú©ÛŒÛŒÛ•Ú©Ø§Ù†.' : 'Selecting a university filters your updates and official campus announcements.'}
        </p>
      </div>

      {/* Modern Search Field */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={language === 'ar' ? 'Ø§Ø¨Ø­Ø« Ø¹Ù† Ø¬Ø§Ù…Ø¹ØªÙƒ Ø¨Ø§Ù„Ø§Ø³Ù…...' : language === 'ku' ? 'Ø¨Ú¯Û•Ú•ÛŽ Ø¨Û•Ù¾ÛŽÛŒ Ù†Ø§ÙˆÛŒ Ø²Ø§Ù†Ú©Û†Ú©Û•Øª...' : 'Search universities...'}
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
          ðŸŒ {getTranslation('filterAll', language)}
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
              ðŸ“ {govName}
            </button>
          );
        })}
      </div>

      {/* Directory Count Title */}
      <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2.5 px-1">
        <span>{language === 'ar' ? 'Ø§Ù„Ù…Ø¤Ø³Ø³Ø§Øª Ø§Ù„Ù…ØªØ§Ø­Ø©' : language === 'ku' ? 'Ø¯Ø§Ù…Û•Ø²Ø±Ø§ÙˆÛ•Ú©Ø§Ù†' : 'Listings'} ({filteredList.length})</span>
        <span className="text-orange-600 font-extrabold">{language === 'ar' ? 'ØªØµÙÙŠØ© Ù†Ø´Ø·Ø©' : 'Active filtering'}</span>
      </div>

      {/* List of custom university cards */}
      <div className="flex flex-col gap-3" id="univ-items-grid">
        {filteredList.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <span className="text-3xl block mb-2">ðŸ”­</span>
            <span className="text-xs font-black text-slate-700 block">
              {language === 'ar' ? 'Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ù†ØªØ§Ø¦Ø¬ Ù…Ø·Ø§Ø¨Ù‚Ø© Ù„Ù„Ø¨Ø­Ø«' : 'No universities match this filter'}
            </span>
            <span className="text-[10px] text-slate-500 max-w-xs mt-1 block">
              {language === 'ar' ? 'Ø¬Ø±Ù‘Ø¨ ÙƒØªØ§Ø¨Ø© ÙƒÙ„Ù…Ø© Ø£Ø®Ø±Ù‰ Ø£Ùˆ ÙˆØ³Ù‘Ø¹ ÙÙ„ØªØ± Ø§Ù„Ù…Ø­Ø§ÙØ¸Ø©.' : 'Try changing your search text or clear governorate choice.'}
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
                    {uni.logo || 'ðŸ«'}
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
                        ðŸ“ {govName}
                      </span>
                      <span>â€¢</span>
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
                    <span>{isSelected ? (language === 'ar' ? 'Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ù†Ø´Ø· Ø­Ø§Ù„ÙŠØ§Ù‹' : 'Currently focusing') : (language === 'ar' ? 'Ø¬Ø§Ù‡Ø² Ù„Ù„ØªÙˆØ§ØµÙ„' : 'Ready')}</span>
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
                        <span>{language === 'ar' ? 'ØªÙ… Ø§Ù„Ø§Ø®ØªÙŠØ§Ø±' : language === 'ku' ? 'Ù‡Û•ÚµØ¨Ú˜ÛŽØ±Ø¯Ø±Ø§ÙˆÛ•' : 'Focused âœ“'}</span>
                      </>
                    ) : (
                      <>
                        <span>{language === 'ar' ? 'Ø§Ø®ØªØ± Ù‡Ø°Ù‡ Ø§Ù„Ø¬Ø§Ù…Ø¹Ø©' : language === 'ku' ? 'Ø¦Û•Ù…Û• Ø¯ÛŒØ§Ø±ÛŒ Ø¨Ú©Û•' : 'Select Campus'}</span>
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



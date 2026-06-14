import { ExternalLink, Globe, GraduationCap, Calendar, MapPin, DollarSign, Bookmark, Share2, Check, AlertCircle } from 'lucide-react';
import type { Scholarship } from '../data/scholarshipsData';
import type { Language } from '../types';
import { getFallbackImage, getSafeCardImage, handleCardImageError, looksLikeUrlText } from '../lib/fallbackImages';

interface ScholarshipCardProps {
  scholarship: Scholarship;
  language: Language;
  onSave?: (id: string) => void;
  isSaved?: boolean;
}

export default function ScholarshipCard({ scholarship, language, onSave, isSaved = false }: ScholarshipCardProps) {
  const getText = (field: string, arField?: string, kuField?: string) => {
    if (language === 'ar' && arField) return arField;
    if (language === 'ku' && kuField) return kuField;
    return field;
  };

  const title = getText(scholarship.title, scholarship.titleAR, scholarship.titleKU);
  const provider = getText(scholarship.provider, scholarship.providerAR, scholarship.providerKU);
  const country = getText(scholarship.country, scholarship.countryAR, scholarship.countryKU);
  const degreeLevels = getText(scholarship.degreeLevel.join(', '), scholarship.degreeLevelAR?.join(', '), scholarship.degreeLevelKU?.join(', '));
  const fundingType = getText(scholarship.fundingType, scholarship.fundingTypeAR, scholarship.fundingTypeKU);
  const deadline = getText(scholarship.deadline, scholarship.deadlineAR, scholarship.deadlineKU);
  const rawSummary = getText(scholarship.summary, scholarship.summaryAR, scholarship.summaryKU);
  const rawRequirements = getText(scholarship.requirements, scholarship.requirementsAR, scholarship.requirementsKU);
  const summary = looksLikeUrlText(rawSummary)
    ? (language === 'ar' ? 'راجع المصدر الرسمي لمعرفة تفاصيل المنحة.' : language === 'ku' ? 'سەرچاوەی فەرمی ببینە بۆ وردەکاری بورسیەکە.' : 'Check the official source for scholarship details.')
    : rawSummary;
  const requirements = looksLikeUrlText(rawRequirements)
    ? (language === 'ar' ? 'تحقق من المتطلبات في المصدر الرسمي.' : language === 'ku' ? 'مەرجەکان لە سەرچاوەی فەرمی بپشکنە.' : 'Check requirements on the official source.')
    : rawRequirements;
  const sourceName = getText(scholarship.sourceName, scholarship.sourceNameAR, scholarship.sourceNameKU);
  const resolvedImage = getSafeCardImage({ ...scholarship, category: 'scholarship' });
  const fallbackImage = getFallbackImage('scholarship');

  const iraqEligibleConfig = {
    yes: { icon: Check, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', label: language === 'ar' ? 'متاح للعراق' : language === 'ku' ? 'بۆ عێراق' : 'Eligible for Iraq' },
    check: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30', label: language === 'ar' ? 'تحقق' : language === 'ku' ? 'پشکنین' : 'Check eligibility' },
    unknown: { icon: AlertCircle, color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/30', label: language === 'ar' ? 'غير معروف' : language === 'ku' ? 'نەزانراو' : 'Unknown' }
  };

  const eligibleConfig = iraqEligibleConfig[scholarship.iraqEligible];
  const EligibleIcon = eligibleConfig.icon;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `${title} - ${summary}`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    }
  };

  return (
    <article className="overflow-hidden rounded-3xl border border-[#1F2E4D] bg-[#121B2E] shadow-lg transition-all duration-300 hover:border-[#6B25C9]/50">
      <div className="aspect-[16/9] overflow-hidden bg-slate-950">
        <img
          src={resolvedImage}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(event) => handleCardImageError(event, fallbackImage)}
        />
      </div>
      <div className="p-5">
      {/* Header with title and source type badge */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`shrink-0 rounded-full border ${eligibleConfig.border} ${eligibleConfig.bg} px-2.5 py-0.5 text-[9px] font-black uppercase ${eligibleConfig.color} flex items-center gap-1`}>
              <EligibleIcon size={10} />
              {eligibleConfig.label}
            </span>
            {scholarship.featured && (
              <span className="shrink-0 rounded-full border border-[#FFD21F]/30 bg-[#FFD21F]/10 px-2.5 py-0.5 text-[9px] font-black uppercase text-[#FFD21F]">
                {language === 'ar' ? 'مميز' : language === 'ku' ? 'تایبەت' : 'Featured'}
              </span>
            )}
            <span className="shrink-0 rounded-full border border-purple-400/30 bg-purple-400/10 px-2.5 py-0.5 text-[9px] font-black uppercase text-purple-300">
              {scholarship.sourceType === 'official' ? (language === 'ar' ? 'مصدر رسمي' : language === 'ku' ? 'سەرچاوەی فەرمی' : 'Official source') : (language === 'ar' ? 'مصدر اكتشاف' : language === 'ku' ? 'سەرچاوەی دۆزینەوە' : 'Discovery source')}
            </span>
          </div>
          <h3 className="text-base font-black leading-tight text-white">{title}</h3>
          <p className="mt-1 text-xs font-bold text-cyan-200">{provider}</p>
        </div>
      </div>

      {/* Summary */}
      <p className="mb-4 line-clamp-2 text-xs font-semibold leading-5 text-slate-300">
        {summary}
      </p>

      {/* Key details grid */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 rounded-xl bg-slate-900/50 px-3 py-2">
          <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-[10px] font-bold text-slate-200 truncate">{country}</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-slate-900/50 px-3 py-2">
          <GraduationCap className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="text-[10px] font-bold text-slate-200 truncate">{degreeLevels}</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-slate-900/50 px-3 py-2">
          <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-[10px] font-bold text-slate-200 truncate">{fundingType}</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-slate-900/50 px-3 py-2">
          <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-[10px] font-bold text-slate-200 truncate">{deadline}</span>
        </div>
      </div>

      {/* Requirements */}
      <div className="mb-4 rounded-xl bg-[#1F2E4D]/30 px-3 py-2">
        <p className="text-[10px] font-semibold text-slate-400 line-clamp-2">{requirements}</p>
      </div>

      {/* Source info */}
      <div className="mb-4 flex items-center gap-2 text-[10px]">
        <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span className="font-bold text-slate-400">{sourceName}</span>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2">
        <a
          href={scholarship.applyUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#6B25C9] px-4 py-3 text-xs font-black text-white hover:bg-[#7B2FD9] transition-colors shadow-lg shadow-[#6B25C9]/20"
        >
          {language === 'ar' ? 'التقديم على الموقع الرسمي' : language === 'ku' ? 'پێشکەشکردن لەسەر سایتە فەرمییەکە' : 'Apply on Official Website'}
          <ExternalLink size={14} />
        </a>
        
        <div className="flex gap-2">
          <a
            href={scholarship.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-800 px-3 py-2.5 text-[10px] font-bold text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <Globe size={12} />
            {language === 'ar' ? 'عرض المصدر' : language === 'ku' ? 'بینینی سەرچاوە' : 'View Source'}
          </a>
          
          <button
            onClick={() => onSave?.(scholarship.id)}
            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-[10px] font-bold transition-colors border ${
              isSaved 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700'
            }`}
          >
            <Bookmark size={12} className={isSaved ? 'fill-current' : ''} />
            {isSaved ? (language === 'ar' ? 'محفوظ' : language === 'ku' ? 'پاشەکەوتکراو' : 'Saved') : (language === 'ar' ? 'حفظ' : language === 'ku' ? 'پاشەکەوت' : 'Save')}
          </button>
          
          <button
            onClick={handleShare}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-800 px-3 py-2.5 text-[10px] font-bold text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <Share2 size={12} />
            {language === 'ar' ? 'مشاركة' : language === 'ku' ? 'هاوبەشکردن' : 'Share'}
          </button>
        </div>
      </div>
      </div>
    </article>
  );
}

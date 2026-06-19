import React from 'react';
import { Language } from '../types';
import { FileX, Search } from 'lucide-react';
import { getTranslation } from '../data/translations';

interface EmptyStateProps {
  language: Language;
  type: 'opportunities' | 'campus-life' | 'general';
  hasFilters?: boolean;
}

export default function EmptyState({ language, type, hasFilters = false }: EmptyStateProps) {
  const getTitle = () => {
    if (hasFilters) {
      if (type === 'opportunities') {
        return language === 'ar' 
          ? 'لا توجد فرص متاحة لهذا الاختيار' 
          : language === 'ku' 
          ? 'هیچ دەرفەتێک نییە بۆ ئەم هەڵبژاردنە' 
          : 'No opportunities available for this selection';
      } else if (type === 'campus-life') {
        return language === 'ar' 
          ? 'لا توجد منشورات لهذه المؤسسة بعد' 
          : language === 'ku' 
          ? 'هیچ پۆستێک نییە لەم زانکۆیەدا' 
          : 'No posts found for this institution yet';
      }
    }
    
    if (type === 'opportunities') {
      return language === 'ar' 
        ? 'لا توجد فرص حالياً' 
        : language === 'ku' 
        ? 'هیچ دەرفەتێک نییە' 
        : 'No opportunities available';
    } else if (type === 'campus-life') {
      return language === 'ar' 
        ? 'لا توجد منشورات حالياً' 
        : language === 'ku' 
        ? 'هیچ پۆستێک نییە' 
        : 'No posts available';
    }
    
    return language === 'ar' 
      ? 'لا توجد محتوى' 
      : language === 'ku' 
      ? 'هیچ ناوەڕۆکێک نییە' 
      : 'No content available';
  };

  const getDescription = () => {
    if (hasFilters) {
      return language === 'ar' 
        ? 'جرب توسيع نطاق البحث أو تغيير الفلاتر' 
        : language === 'ku' 
        ? 'گەڕانەکە فراوانتر بکە یان فلتەرەکان بگۆڕە' 
        : 'Try broadening your search or changing filters';
    }
    
    if (type === 'opportunities') {
      return language === 'ar' 
        ? 'كن أول من يشارك فرصة أكاديمية أو مهنية' 
        : language === 'ku' 
        ? 'یەکەم کەس بە کە دەرفەتێک بڵاو دەکەیتەوە' 
        : 'Be the first to share an academic or professional opportunity';
    } else if (type === 'campus-life') {
      return language === 'ar' 
        ? 'شارك تجربتك الجامعية مع زملائك' 
        : language === 'ku' 
        ? 'ئەزموونی زانکۆکەت هاوبەش بکە' 
        : 'Share your university experience with classmates';
    }
    
    return language === 'ar' 
      ? 'تحقق لاحقاً للمزيد من المحتوى' 
      : language === 'ku' 
      ? 'دواتر بڕۆ بۆ زیاتر' 
      : 'Check back later for more content';
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        {hasFilters ? (
          <Search className="w-10 h-10 text-slate-400" />
        ) : (
          <FileX className="w-10 h-10 text-slate-400" />
        )}
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">
        {getTitle()}
      </h3>
      <p className="text-sm text-slate-600 max-w-md">
        {getDescription()}
      </p>
    </div>
  );
}

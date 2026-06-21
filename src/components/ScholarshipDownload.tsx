import React from 'react';
import { Download } from 'lucide-react';
import { getTranslation } from '../data/translations';
import { Language } from '../types';

interface ScholarshipDownloadProps {
  language: Language;
}

export default function ScholarshipDownload({ language }: ScholarshipDownloadProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/scholarships.csv';
    link.download = 'scholarships.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:from-orange-600 hover:to-amber-600 transition-all duration-200 shadow-md hover:shadow-lg"
    >
      <Download className="w-4 h-4" />
      <span>
        {language === 'ar' 
          ? 'تحميل قائمة المنح' 
          : language === 'ku' 
          ? 'Installی لیستی خەڵاتەکان' 
          : 'Download Scholarships List'}
      </span>
    </button>
  );
}

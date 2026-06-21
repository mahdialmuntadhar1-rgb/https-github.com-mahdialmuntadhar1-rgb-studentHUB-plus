import React from 'react';
import { Language } from '../types';
import { Briefcase, Users } from 'lucide-react';
import { getTranslation } from '../data/translations';

type MainTabType = 'opportunities' | 'campus-life';

interface MainTabsProps {
  language: Language;
  activeTab: MainTabType;
  onTabChange: (tab: MainTabType) => void;
}

export default function MainTabs({ language, activeTab, onTabChange }: MainTabsProps) {
  return (
    <div className="w-full bg-white border-b-2 border-slate-200 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-2">
          {/* Opportunities Tab */}
          <button
            onClick={() => onTabChange('opportunities')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all duration-200 ${
              activeTab === 'opportunities'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>{getTranslation('opportunitiesTabLabel', language)}</span>
          </button>

          {/* Campus Life Tab */}
          <button
            onClick={() => onTabChange('campus-life')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all duration-200 ${
              activeTab === 'campus-life'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{getTranslation('campusLifeTabLabel', language)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import { Home, Briefcase, Globe, Moon, Sun } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const { language, setLanguage } = useLanguage();

  const tabs = [
    { id: 'home', icon: Home, label: language === 'ar' ? 'الرئيسية' : language === 'ku' ? 'سەرەکی' : 'Home' },
    { id: 'opportunities', icon: Briefcase, label: language === 'ar' ? 'الفرص' : language === 'ku' ? 'هەلی کار' : 'Opportunities' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 px-6 py-3 flex items-center justify-between z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] pb-safe">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1.5 transition-all group ${
              isActive ? 'text-primary scale-105' : 'text-gray-400 opacity-60'
            }`}
          >
            <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-primary/10' : 'group-hover:bg-gray-50'}`}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export function Header({ title }: { title: string; onNotificationsClick?: () => void }) {
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 z-50 px-6 h-20 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 transform -rotate-6">
            <span className="text-white font-black text-xl">ر</span>
        </div>
        <div>
            <h1 className="text-lg font-black text-secondary dark:text-white leading-tight">{title}</h1>
            <div className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em]">Rafid Platform</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setLanguage(language === 'ar' ? 'ku' : language === 'ku' ? 'en' : 'ar')}
          className="p-3 bg-surface dark:bg-gray-800 text-secondary dark:text-white rounded-2xl border border-gray-50 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-95"
          title="Switch language"
        >
          <Globe size={20} strokeWidth={2.5} />
          <span className="text-[10px] font-black ml-1">{language === 'ar' ? 'ک' : language === 'ku' ? 'EN' : 'ع'}</span>
        </button>
        <button
          onClick={toggleTheme}
          className="p-3 bg-surface dark:bg-gray-800 text-secondary dark:text-white rounded-2xl border border-gray-50 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-95"
          title={theme === 'light' ? 'Switch to dark mode' : 'التبديل إلى الوضع الفاتح'}
        >
          {theme === 'light' ? <Moon size={20} strokeWidth={2.5} /> : <Sun size={20} strokeWidth={2.5} />}
        </button>
      </div>
    </header>
  );
}

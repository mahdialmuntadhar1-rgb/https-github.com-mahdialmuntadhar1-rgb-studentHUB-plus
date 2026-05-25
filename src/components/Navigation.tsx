import { Home, Compass, Plus, Briefcase, User, Bell, Search, Globe, Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const { language, setLanguage } = useLanguage();

  const tabs = [
    { id: 'home', icon: Home, label: language === 'ar' ? 'الرئيسية' : 'Home' },
    { id: 'discover', icon: Compass, label: language === 'ar' ? 'اكتشف' : 'Discover' },
    { id: 'post', icon: Plus, label: language === 'ar' ? 'نشر' : 'Post', isCenter: true },
    { id: 'opportunities', icon: Briefcase, label: language === 'ar' ? 'فرص' : 'Jobs' },
    { id: 'profile', icon: User, label: language === 'ar' ? 'حسابي' : 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 px-6 py-3 flex items-center justify-between z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] pb-safe">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        if (tab.isCenter) {
            return (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="relative -mt-12 group"
                >
                    <div className="bg-primary p-4 rounded-3xl shadow-2xl shadow-primary/40 text-white transform group-hover:scale-110 group-active:scale-95 transition-all outline outline-8 outline-surface">
                        <Icon size={32} strokeWidth={3} />
                    </div>
                </button>
            );
        }

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

export function Header({ title, onNotificationsClick }: { title: string; onNotificationsClick?: () => void }) {
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
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          className="p-3 bg-surface dark:bg-gray-800 text-secondary dark:text-white rounded-2xl border border-gray-50 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-95"
          title={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
        >
          <Globe size={20} strokeWidth={2.5} />
          <span className="text-[10px] font-black ml-1">{language === 'ar' ? 'EN' : 'ع'}</span>
        </button>
        <button
          onClick={toggleTheme}
          className="p-3 bg-surface dark:bg-gray-800 text-secondary dark:text-white rounded-2xl border border-gray-50 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-95"
          title={theme === 'light' ? 'Switch to dark mode' : 'التبديل إلى الوضع الفاتح'}
        >
          {theme === 'light' ? <Moon size={20} strokeWidth={2.5} /> : <Sun size={20} strokeWidth={2.5} />}
        </button>
        <button className="p-3 bg-surface dark:bg-gray-800 text-secondary dark:text-white rounded-2xl border border-gray-50 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-95">
          <Search size={20} strokeWidth={2.5} />
        </button>
        <button
            onClick={onNotificationsClick}
            className="p-3 bg-primary/5 dark:bg-primary/20 text-primary dark:text-primary-light rounded-2xl border border-primary/20 dark:border-primary/30 hover:bg-primary hover:text-white transition-all active:scale-95 relative"
        >
          <Bell size={20} strokeWidth={2.5} />
          <div className="absolute top-2 left-2 w-2.5 h-2.5 bg-accent rounded-full border-2 border-white" />
        </button>
      </div>
    </header>
  );
}

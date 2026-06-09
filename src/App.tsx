import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import Navbar, { Header } from './components/Navigation';
import Feed from './pages/Feed';
import Discover from './pages/Discover';
import OpportunitiesHub from './pages/OpportunitiesHub';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import Notifications from './pages/Notifications';
import InstitutionProfile from './pages/InstitutionProfile';
import PostCreator from './components/PostCreator';
import ChatBox from './components/ChatBox';
import { Institution } from './types';
import { Routes, Route } from 'react-router-dom';
import ResetPassword from './pages/ResetPassword';

import { useAuth } from './contexts/AuthContext';
import Auth from './pages/Auth';

export default function App() {
  const { user, profile, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedInst, setSelectedInst] = useState<Institution | null>(null);
  const [showPostCreator, setShowPostCreator] = useState(false);

  // Splash Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary flex flex-col items-center justify-center gap-6">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 bg-primary rounded-[2.5rem] flex items-center justify-center text-secondary shadow-2xl shadow-primary/20"
        >
          <Sparkles size={48} />
        </motion.div>
        <div className="space-y-2 text-center">
            <h1 className="text-white font-black text-3xl tracking-tight">رافد</h1>
            <p className="text-primary text-xs font-black uppercase tracking-[0.4em]">Loading Your Path</p>
        </div>
      </div>
    );
  }

  // Keep auth available, but do not force visitors into it.
  if (activeTab === 'auth' && !user) {
    return <Auth />;
  }

  // After login: redirect away from auth tab
  if (activeTab === 'auth' && user) {
    if (profile?.institution) setActiveTab('home');
  }

  // Logged in but profile incomplete
  if (user && !profile?.institution) {
    return <Onboarding onComplete={() => {}} />;
  }

  // Main App: visible to guests and signed-in users.
  const isGuestPreview = !user;

  // Simple Router
  const renderContent = () => {
    if (selectedInst) {
      return (
        <InstitutionProfile 
          institution={selectedInst} 
          onBack={() => setSelectedInst(null)} 
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return <Feed />;
      case 'discover':
        return <Discover onSelectInstitution={setSelectedInst} />;
      case 'post':
        return null; // Handled by overlay for signed-in users
      case 'opportunities':
        return <OpportunitiesHub />;
      case 'profile':
        return user ? <Profile /> : <Feed />;
      case 'notifications':
        return user ? <Notifications /> : <Feed />;
      default:
        return <Feed />;
    }
  };

  const handleTabSelect = (tab: string) => {
    if (tab === 'post') {
      if (!user) {
        setActiveTab('home');
        return;
      }
      setShowPostCreator(true);
    } else {
      setActiveTab(tab);
    }
  };

  // Determine header title
  let headerTitle = "رافد";
  if (selectedInst) headerTitle = selectedInst.name;
  else {
    switch(activeTab) {
        case 'discover': headerTitle = "اكتشف الجامعات"; break;
        case 'opportunities': headerTitle = "الفرص والمهن"; break;
        case 'profile': headerTitle = user ? "الملف الشخصي" : "رافد"; break;
        case 'notifications': headerTitle = user ? "التنبيهات" : "رافد"; break;
        default: headerTitle = "رافد";
    }
  }

  return (
    <Routes>
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="*" element={
        <div className="min-h-screen bg-surface pb-24 pt-20">
          {!selectedInst && (
            <Header 
                title={headerTitle} 
                onNotificationsClick={() => user ? setActiveTab('notifications') : setActiveTab('auth')}
            />
          )}

          {isGuestPreview && !selectedInst && (
            <div className="fixed top-20 left-0 right-0 z-30 px-3 md:px-4 pointer-events-none">
              <div className="mx-auto max-w-xl bg-secondary text-white rounded-2xl shadow-xl px-4 py-3 flex items-center justify-between gap-3 pointer-events-auto" dir="rtl">
                <div className="min-w-0">
                  <p className="text-xs font-black text-primary">وضع المعاينة</p>
                  <p className="text-[10px] font-bold text-white/80 truncate">تصفح التطبيق بدون تسجيل دخول. النشر والمحادثات تحتاج حساب لاحقاً.</p>
                </div>
                <button
                  onClick={() => setActiveTab('auth')}
                  className="bg-primary text-secondary px-3 py-2 rounded-xl text-[10px] font-black whitespace-nowrap"
                >
                  دخول / تسجيل
                </button>
              </div>
            </div>
          )}
          
          <main>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedInst ? `inst-${selectedInst.id}` : activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>

          {!selectedInst && <Navbar activeTab={activeTab} setActiveTab={handleTabSelect} />}

          {user && <PostCreator open={showPostCreator} onClose={() => setShowPostCreator(false)} onPosted={() => {/* Refresh feed if needed */}} />}
          {user && <ChatBox />}
        </div>
      } />
    </Routes>
  );
}

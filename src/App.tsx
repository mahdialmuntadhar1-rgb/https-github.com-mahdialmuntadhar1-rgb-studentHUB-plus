import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, X, HelpCircle, Sparkles, Bell, 
  MessageCircle, Image, MapPin, AtSign 
} from 'lucide-react';
import Navbar, { Header } from './components/Navigation';
import Feed from './pages/Feed';
import Home from './pages/Home';
import Discover from './pages/Discover';
import OpportunitiesHub from './pages/OpportunitiesHub';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import Notifications from './pages/Notifications';
import InstitutionProfile from './pages/InstitutionProfile';
import { Institution } from './types';

import { useAuth } from './contexts/AuthContext';
import Auth from './pages/Auth';
import { createPost } from './lib/api';

export default function App() {
  const { user, profile, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedInst, setSelectedInst] = useState<Institution | null>(null);
  const [showPostOverlay, setShowPostOverlay] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState('student');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreatePost = async () => {
    if (!profile || !newPostContent.trim()) return;
    setIsSubmitting(true);
    
    try {
      await createPost({
        type: newPostType,
        content: newPostContent,
        institution: profile.institution || '',
        institution_id: profile.institution_id || 'manual',
        governorate: profile.governorate || '',
        is_verified: profile.role === 'institution_rep',
      });

      setNewPostContent('');
      setShowPostOverlay(false);
    } catch (err) {
      console.error('Error creating post:', err);
      alert('خطأ أثناء النشر');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // Not logged in
  if (!user) {
    if (selectedInst) {
      return <InstitutionProfile institution={selectedInst} onBack={() => setSelectedInst(null)} />;
    }
    return <Home onStart={() => setActiveTab('auth')} onSelectInstitution={setSelectedInst} />;
  }

  // Handle Login process (Show Auth page)
  if (user && activeTab === 'auth') {
      // User just logged in, if they have a profile, go home, otherwise they'll hit onboarding
      if (profile?.institution) setActiveTab('home');
  }

  if (activeTab === 'auth') {
      return <Auth />;
  }

  // Logged in but profile incomplete
  if (user && !profile?.institution) {
    return <Onboarding onComplete={() => {}} />;
  }

  // Main App (Authenticated)

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
        return null; // Handled by overlay
      case 'opportunities':
        return <OpportunitiesHub />;
      case 'profile':
        return <Profile />;
      case 'notifications':
        return <Notifications />;
      default:
        return <Feed />;
    }
  };

  const handleTabSelect = (tab: string) => {
    if (tab === 'post') {
        setShowPostOverlay(true);
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
        case 'profile': headerTitle = "الملف الشخصي"; break;
        case 'notifications': headerTitle = "التنبيهات"; break;
        default: headerTitle = "رافد";
    }
  }

  return (
    <div className="min-h-screen bg-surface pb-24 pt-20">
      {!selectedInst && (
        <Header 
            title={headerTitle} 
            onNotificationsClick={() => setActiveTab('notifications')}
        />
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

      {/* Post Creation Overlay */}
      <AnimatePresence>
        {showPostOverlay && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[100] bg-secondary/80 backdrop-blur-xl flex items-end md:items-center justify-center p-0 md:p-6"
            >
                <motion.div 
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    className="bg-surface w-full max-w-xl rounded-t-[3rem] md:rounded-[3rem] p-8 md:p-10 shadow-2xl space-y-8"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-secondary shadow-lg shadow-primary/20 transform -rotate-6">
                                <Plus size={28} strokeWidth={3} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-secondary">شاركنا قصتك</h3>
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Share Your Story</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowPostOverlay(false)}
                            className="p-4 bg-gray-100/50 text-gray-400 rounded-2xl hover:bg-gray-100 hover:text-secondary transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { id: 'student', label: 'سؤال أكاديمي', icon: HelpCircle, color: 'bg-blue-50 text-blue-500' },
                            { id: 'insight', label: 'مشاركة تجربة', icon: Sparkles, color: 'bg-orange-50 text-orange-500' },
                            { id: 'announcement', label: 'إعلان طلابي', icon: Bell, color: 'bg-purple-50 text-purple-500' },
                            { id: 'insight_advice', label: 'طلب نصيحة', icon: MessageCircle, color: 'bg-green-50 text-green-500' },
                        ].map(type => (
                            <button 
                                key={type.id} 
                                onClick={() => setNewPostType(type.id)}
                                className={`${type.color} p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 active:scale-95 ${newPostType === type.id ? 'border-current' : 'border-transparent'}`}
                            >
                                <type.icon size={32} />
                                <span className="font-black text-xs">{type.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="bg-white rounded-[2rem] p-6 border border-gray-100 focus-within:border-primary transition-all">
                            <textarea 
                                placeholder="ماذا يدور في ذهنك؟"
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                className="w-full bg-transparent border-none focus:ring-0 outline-none font-bold text-gray-600 min-h-[120px] resize-none"
                            />
                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-4">
                                <div className="flex gap-4 text-gray-400">
                                    <button className="hover:text-primary transition-colors"><Image size={20} /></button>
                                    <button className="hover:text-primary transition-colors text-xs font-black px-3 py-1 bg-surface rounded-lg"># {profile?.institution}</button>
                                </div>
                                <span className="text-[10px] font-black text-gray-200">{280 - newPostContent.length} حرف متبقي</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleCreatePost}
                            disabled={isSubmitting || !newPostContent.trim()}
                            className="w-full bg-secondary text-white py-5 rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-secondary/20 hover:bg-primary hover:text-secondary transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                'نشر في رافد'
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

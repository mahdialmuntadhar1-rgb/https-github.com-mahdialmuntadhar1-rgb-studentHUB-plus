import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, Edit3, MapPin,
  Grid, Bookmark, Landmark,
  CheckCircle2,
  Share2, LogOut, Camera
} from 'lucide-react';
import { SAMPLE_INSTITUTIONS } from '../constants';
import PostCard from '../components/PostCard';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'followed'>('posts');

  const interests: string[] = Array.isArray(profile?.interests)
    ? profile.interests
    : (typeof profile?.interests === 'string' && profile.interests
        ? JSON.parse(profile.interests)
        : []);

  const followedInstitutions = SAMPLE_INSTITUTIONS.slice(0, 3);
  const myPosts: any[] = [];
  const savedItems: any[] = [];

  return (
    <div className="min-h-screen bg-surface pb-32">
      {/* 1. Header & Cover */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={`https://picsum.photos/seed/${profile?.institution_id || 'cover'}/800/400`}
          className="w-full h-full object-cover"
          alt=""
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <div className="absolute top-6 left-6 flex gap-2">
            <button className="p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl text-white active:scale-90 transition-all">
                <Share2 size={20} />
            </button>
            <button className="p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl text-white active:scale-90 transition-all">
                <Settings size={20} />
            </button>
        </div>
      </div>

      {/* 2. User Info Card */}
      <div className="max-w-xl mx-auto px-6 -mt-16 relative z-10">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-secondary/5 border border-gray-100 flex flex-col items-center text-center space-y-6">
            <div className="relative group">
                <div className="w-32 h-32 rounded-[2.5rem] p-1 bg-primary shadow-lg ring-8 ring-white">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} className="w-full h-full object-cover rounded-[2.2rem]" alt="" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full rounded-[2.2rem] bg-primary/20 flex items-center justify-center text-3xl font-black text-secondary">
                        {(profile?.full_name || '?')[0]}
                      </div>
                    )}
                </div>
                <button className="absolute bottom-0 right-0 p-3 bg-secondary text-white rounded-2xl border-4 border-white shadow-lg active:scale-90 transition-all">
                    <Camera size={16} />
                </button>
            </div>

            <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                    <h1 className="text-2xl font-black text-secondary">{profile?.full_name || 'مستخدم رافد'}</h1>
                    <CheckCircle2 size={20} className="text-primary fill-primary/10" />
                </div>
                <div className="flex items-center justify-center gap-3 text-xs font-black text-gray-300 uppercase tracking-widest">
                    <span>{profile?.stage || ''}</span>
                </div>
            </div>

            <div className="flex items-center justify-center gap-4 text-sm font-bold text-gray-500 bg-surface px-6 py-3 rounded-2xl w-full">
                <div className="flex items-center gap-2">
                    <Landmark size={16} className="text-accent" />
                    <span>{profile?.institution || '—'}</span>
                </div>
                <div className="w-px h-4 bg-gray-200" />
                <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-primary" />
                    <span>{profile?.governorate || '—'}</span>
                </div>
            </div>

            {profile?.bio && (
              <p className="text-sm font-medium text-gray-600 leading-relaxed max-w-sm">
                  {profile.bio}
              </p>
            )}

            {/* Interest Tags */}
            {interests.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                  {interests.map((tag: string) => (
                      <span key={tag} className="px-5 py-2 bg-primary/5 text-primary text-[10px] font-black rounded-xl border border-primary/10 tracking-widest uppercase">
                          #{tag}
                      </span>
                  ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 w-full pt-4">
                <button className="flex-1 bg-secondary text-white py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-secondary/20 flex items-center justify-center gap-2 active:scale-95 transition-all">
                    <Edit3 size={16} />
                    <span>تعديل الحساب</span>
                </button>
                <button
                    onClick={signOut}
                    className="flex-1 bg-surface text-secondary py-4 rounded-3xl font-black text-xs uppercase tracking-widest border border-gray-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                    <LogOut size={16} className="text-red-400" />
                    <span>تسجيل الخروج</span>
                </button>
            </div>
        </div>

        {/* 3. Activity Tabs */}
        <div className="mt-12">
            <div className="flex items-center gap-2 bg-white p-2 rounded-[2rem] border border-gray-100 shadow-sm mb-8">
                {[
                    { id: 'posts', label: 'منشوراتي', icon: Grid },
                    { id: 'followed', label: 'المؤسسات المتابعة', icon: Landmark },
                    { id: 'saved', label: 'المهمات المحفوظة', icon: Bookmark },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === tab.id 
                                ? 'bg-secondary text-white shadow-lg' 
                                : 'text-gray-400 hover:text-secondary'
                        }`}
                    >
                        <tab.icon size={14} />
                        <span className="hidden md:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    className="space-y-6"
                >
                    {activeTab === 'posts' && (
                        <div className="space-y-6">
                            {myPosts.map(post => <PostCard key={post.id} post={post} />)}
                        </div>
                    )}

                    {activeTab === 'followed' && (
                        <div className="grid grid-cols-1 gap-4">
                            {followedInstitutions.map(inst => (
                                <motion.div 
                                    key={inst.id}
                                    whileHover={{ x: -10 }}
                                    className="bg-white p-5 rounded-[2rem] border border-gray-100 flex items-center gap-4 shadow-sm group cursor-pointer"
                                >
                                    <img src={inst.logo} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-surface" alt="" />
                                    <div className="flex-1">
                                        <h3 className="font-black text-secondary text-sm">{inst.name}</h3>
                                        <p className="text-[10px] font-bold text-gray-400">{inst.governorate} • {inst.followers.toLocaleString()} طالب</p>
                                    </div>
                                    <motion.button 
                                        initial={false}
                                        animate={{ 
                                            backgroundColor: '#1a1a2e',
                                            color: '#ffffff'
                                        }}
                                        className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                    >
                                        Following
                                    </motion.button>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'saved' && (
                        <div className="grid grid-cols-1 gap-4">
                            {savedItems.map(post => <PostCard key={post.id} post={post} />)}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

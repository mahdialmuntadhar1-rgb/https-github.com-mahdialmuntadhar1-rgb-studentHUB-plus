import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PostCard from '../components/PostCard';
import { GOVERNORATES } from '../constants';
import { Sparkles, TrendingUp, Map as MapIcon, GraduationCap, ChevronLeft } from 'lucide-react';
import { PostSkeleton } from '../components/Skeletons';
import { getPosts } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Post } from '../types';

export default function Feed() {
  const { profile } = useAuth();
  const [activeFilter, setActiveFilter] = useState('كل العراق');
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPosts();

      const transformedPosts: Post[] = (data || []).map((p: any) => ({
        id: p.id,
        type: p.type,
        institutionName: p.institution,
        institutionLogo: `https://picsum.photos/seed/${p.institution_id}/100/100`,
        governorate: p.governorate as any,
        content: p.content,
        title: p.title,
        image: p.image_url,
        likes: p.likes_count,
        comments: p.comments_count,
        views: p.views_count,
        timestamp: new Date(p.created_at).toLocaleDateString('ar-IQ'),
        isVerified: Boolean(p.is_verified),
        authorName: p.author_full_name,
        authorAvatar: p.author_avatar_url,
        ...(p.metadata && typeof p.metadata === 'string' ? JSON.parse(p.metadata) : (p.metadata || {}))
      }));

      setPosts(transformedPosts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filters = [
    { id: 'all', label: 'كل العراق', icon: Sparkles },
    { id: 'uni', label: 'مؤسستي', icon: GraduationCap },
    { id: 'trending', label: 'تريند', icon: TrendingUp },
    ...GOVERNORATES.map(gov => ({ id: gov, label: gov, icon: MapIcon }))
  ];

  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'كل العراق') return true;
    if (activeFilter === 'مؤسستي') return post.institutionName === profile?.institution;
    if (activeFilter === 'تريند') return (post.likes || 0) > 100;
    return post.governorate === activeFilter;
  });

  return (
    <div className="pb-32 pt-24 px-4 overflow-x-hidden">
        {/* Smart Filter Bar - Fixed below Main Header */}
        <div className="fixed top-20 left-0 right-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar relative">
              {filters.map((filter) => (
                  <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.label)}
                      className={`flex items-center gap-2 px-6 py-3.5 rounded-[1.25rem] whitespace-nowrap transition-all font-black text-[10px] border-2 uppercase tracking-widest relative ${
                          activeFilter === filter.label 
                          ? 'border-secondary z-10 scale-105' 
                          : 'bg-white border-gray-50 text-gray-400 hover:border-primary/30'
                      }`}
                  >
                      <span className="relative z-10 flex items-center gap-2 transition-colors duration-300" style={{ color: activeFilter === filter.label ? 'white' : 'inherit' }}>
                        <filter.icon size={14} />
                        <span>{filter.label}</span>
                      </span>
                      {activeFilter === filter.label && (
                        <motion.div 
                          layoutId="feedFilter"
                          className="absolute inset-0 bg-secondary rounded-[1.1rem]"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                  </button>
              ))}
          </div>
        </div>

        {/* Feed Content */}
        <div className="mt-20">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
              >
                {[1, 2, 3].map(i => <PostSkeleton key={i} />)}
              </motion.div>
            ) : (
              <motion.div
                key="posts"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post, index) => (
                    <PostCard key={post.id} post={post} delay={index * 0.1} />
                  ))
                ) : (
                <div className="py-24 text-center px-10">
                    <div className="w-24 h-24 bg-white rounded-[3rem] shadow-xl shadow-secondary/5 border border-gray-100 flex items-center justify-center mx-auto text-primary mb-8 animate-bounce">
                        <Sparkles size={40} />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-xl font-black text-secondary">الخلاصة فارغة حالياً</h3>
                        <p className="text-sm text-gray-400 font-bold leading-relaxed">
                            لم نجد منشورات تطابق الفلتر الحالي. ابدأ بمتابعة جامعات جديدة لاكتشاف محتوى مخصص!
                        </p>
                        <button 
                            onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'discover' }))}
                            className="mt-4 px-8 py-4 bg-primary text-secondary font-black text-xs uppercase tracking-widest rounded-3xl shadow-lg shadow-primary/20 flex items-center gap-2 mx-auto active:scale-95 transition-all"
                        >
                            <span>اكتشف المزيد من المؤسسات</span>
                            <ChevronLeft size={16} />
                        </button>
                    </div>
                </div>
              )}
              
              {/* Infinite Scroll Indicator */}
              {filteredPosts.length > 0 && (
                <div className="py-12 flex flex-col items-center gap-4">
                   <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                   </div>
                   <span className="text-[10px] font-black uppercase text-gray-300 tracking-[0.3em]">تحميل المزيد</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

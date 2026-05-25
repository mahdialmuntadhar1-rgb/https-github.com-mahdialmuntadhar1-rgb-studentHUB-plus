import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PostCard from '../components/PostCard';
import { GOVERNORATES, SAMPLE_POSTS } from '../constants';
import { Filter, Sparkles, TrendingUp, Users, Map as MapIcon, GraduationCap, ChevronLeft, RefreshCw, Plus, ArrowRightLeft } from 'lucide-react';
import { PostSkeleton } from '../components/Skeletons';
import { getPosts } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Post } from '../types';
import { usePaginatedQuery } from '../hooks/usePaginatedQuery';

export default function Feed() {
  const { profile } = useAuth();
  const [feedMode, setFeedMode] = useState<'classic' | 'cursor'>('classic');
  const [activeFilter, setActiveFilter] = useState('كل العراق');
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const observerTarget = useRef<HTMLDivElement>(null);
  const POSTS_PER_PAGE = 5;

  const fetchPosts = async (currentPage: number, append = false) => {
    if (currentPage === 0) setIsLoading(true);
    else setIsFetchingMore(true);
    
    setError(null);
    try {
      const from = currentPage * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      const govFilter = (activeFilter !== 'كل العراق' && activeFilter !== 'مؤسستي' && activeFilter !== 'تريند') ? activeFilter : undefined;
      const instFilter = (activeFilter === 'مؤسستي' && profile?.institution) ? profile.institution : undefined;

      const data = await getPosts({ governorate: govFilter, institution: instFilter, page: currentPage, limit: POSTS_PER_PAGE });

      const transformedPosts: Post[] = (data || []).map(p => ({
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
        isVerified: p.is_verified,
        authorName: p.profiles?.full_name,
        authorAvatar: p.profiles?.avatar_url,
        ...(p.metadata || {})
      }));

      if (append) {
        setPosts(prev => [...prev, ...transformedPosts]);
      } else {
        setPosts(transformedPosts);
      }

      setHasMore(transformedPosts.length === POSTS_PER_PAGE);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  // Cursor pagination via CF Worker API
  const fetchCursorPosts = useCallback(async (cursor?: string, limit = 5) => {
    const start = cursor ? parseInt(cursor, 10) : 0;
    
    try {
      const govFilter = (activeFilter !== 'كل العراق' && activeFilter !== 'مؤسستي' && activeFilter !== 'تريند') ? activeFilter : undefined;
      const instFilter = (activeFilter === 'مؤسستي' && profile?.institution) ? profile.institution : undefined;
      const data = await getPosts({ governorate: govFilter, institution: instFilter, page: start, limit });

      const transformed: Post[] = (data || []).map((p: any) => ({
        id: p.id,
        type: p.type as any,
        institutionName: p.institution || 'جامعة عراقية',
        institutionLogo: `https://picsum.photos/seed/${p.institution_id || 'logo'}/100/100`,
        governorate: p.governorate as any,
        content: p.content,
        title: p.title,
        image: p.image_url,
        likes: p.likes_count || 0,
        comments: p.comments_count || 0,
        views: p.views_count || 0,
        timestamp: new Date(p.created_at).toLocaleDateString('ar-IQ'),
        isVerified: p.is_verified,
        authorName: p.profiles?.full_name || 'طالب مجهول',
        authorAvatar: p.author_avatar_url || `https://picsum.photos/seed/${p.author_id}/100/100`,
      }));

      const hasMore = transformed.length === limit;
      return {
        data: transformed,
        hasMore,
        nextCursor: hasMore ? String(start + limit) : undefined
      };
    } catch {
      return { data: [], hasMore: false, nextCursor: undefined };
    }
  }, [activeFilter, profile]);

  const {
    data: cursorPosts,
    isLoading: cursorLoading,
    error: cursorError,
    hasMore: cursorHasMore,
    fetchNextPage: cursorFetchNext,
    refresh: cursorRefresh
  } = usePaginatedQuery(fetchCursorPosts, 5);

  useEffect(() => {
    if (feedMode === 'cursor') {
      cursorRefresh();
    }
  }, [activeFilter, feedMode, cursorRefresh]);

  useEffect(() => {
    setPage(0);
    fetchPosts(0);
  }, [activeFilter, profile]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isFetchingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPosts(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, isFetchingMore, page]);


  const filters = [
    { id: 'all', label: 'كل العراق', icon: Sparkles },
    { id: 'uni', label: 'مؤسستي', icon: GraduationCap },
    { id: 'trending', label: 'تريند', icon: TrendingUp },
    ...GOVERNORATES.map(gov => ({ id: gov, label: gov, icon: MapIcon }))
  ];

  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'تريند') return (post.likes || 0) > 10;
    return true;
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
          {/* Feed Mode Switcher */}
          <div className="bg-white rounded-3xl p-2 border border-gray-100 shadow-sm flex items-center gap-2 mb-6">
            <button
              onClick={() => setFeedMode('classic')}
              className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${
                feedMode === 'classic'
                  ? 'bg-secondary text-white shadow-md shadow-secondary/10'
                  : 'text-gray-400 hover:text-secondary'
              }`}
            >
              <Sparkles size={14} />
              <span>السحب اللانهائي المباشر</span>
            </button>
            <button
              onClick={() => setFeedMode('cursor')}
              className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${
                feedMode === 'cursor'
                  ? 'bg-secondary text-white shadow-md shadow-secondary/10'
                  : 'text-gray-400 hover:text-secondary'
              }`}
            >
              <ArrowRightLeft size={14} />
              <span>نمط المؤشر (Cursor Mode)</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {feedMode === 'classic' ? (
              error ? (
                <motion.div 
                    key="classic-error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-24 text-center px-10"
                >
                    <div className="w-20 h-20 bg-red-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-red-500 mb-6 font-black text-2xl">!</div>
                    <h3 className="text-xl font-black text-secondary mb-2">عذراً، حدث خطأ ما</h3>
                    <p className="text-sm text-gray-400 font-bold mb-8">{error}</p>
                    <button 
                        onClick={() => fetchPosts(0)}
                        className="px-8 py-4 bg-secondary text-white font-black text-xs uppercase tracking-widest rounded-3xl shadow-lg shadow-secondary/20 flex items-center gap-2 mx-auto active:scale-95 transition-all"
                    >
                        <RefreshCw size={16} />
                        <span>حاول مرة أخرى</span>
                    </button>
                </motion.div>
              ) : isLoading ? (
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
                    <>
                      {filteredPosts.map((post, index) => (
                        <PostCard key={post.id} post={post} delay={index * 0.1} />
                      ))}
                      
                      {/* Infinite Scroll Trigger */}
                      <div ref={observerTarget} className="py-12 flex flex-col items-center gap-4 min-h-[100px]">
                         {hasMore ? (
                             <div className="flex flex-col items-center gap-3">
                                 <div className="flex gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                                 </div>
                                 <span className="text-[9px] font-black uppercase text-gray-300 tracking-[0.3em]">جاري جلب المزيد</span>
                             </div>
                         ) : (
                          <div className="py-8 text-center space-y-2 opacity-40">
                               <p className="text-[9px] font-black uppercase text-gray-300 tracking-[0.5em]">وصلت إلى النهاية</p>
                               <div className="w-1 h-1 bg-primary rounded-full mx-auto" />
                          </div>
                         )}
                      </div>
                    </>
                  ) : (
                  <div className="py-24 text-center px-10">
                      <div className="w-24 h-24 bg-white rounded-[3rem] shadow-xl shadow-secondary/5 border border-gray-100 flex items-center justify-center mx-auto text-primary mb-8 animate-bounce">
                          <Sparkles size={40} />
                      </div>
                      <div className="space-y-4">
                          <h3 className="text-xl font-black text-secondary">الخلاصة فارغة حالياً</h3>
                          <p className="text-sm text-gray-400 font-bold leading-relaxed">
                              لم نجد منشورات تطابق هذا الفلتر. ابدأ بمتابعة جامعات جديدة أو كن أول من ينشر!
                          </p>
                          <div className="flex flex-col gap-3 pt-4">
                               <button 
                                  onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'discover' }))}
                                  className="px-8 py-5 bg-primary text-secondary font-black text-xs uppercase tracking-widest rounded-[2rem] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                              >
                                  <span>اكتشف المؤسسات</span>
                                  <ChevronLeft size={16} />
                              </button>
                              <button 
                                  onClick={() => window.dispatchEvent(new CustomEvent('openPostOverlay'))}
                                  className="px-8 py-5 bg-secondary text-white font-black text-xs uppercase tracking-widest rounded-[2rem] shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                              >
                                  <span>انشر أول قصة</span>
                                  <Plus size={16} className="text-primary" />
                              </button>
                          </div>
                      </div>
                  </div>
                )}
                </motion.div>
              )
            ) : (
              // Cursor Feed Mode using usePaginatedQuery
              <motion.div
                key="cursor-posts-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {cursorError && (
                  <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-xs font-bold leading-relaxed">
                    حدث خطأ عند جلب المنشورات: {cursorError.message}
                  </div>
                )}

                {cursorPosts.map((post, index) => (
                  <PostCard key={`cursor-${post.id}-${index}`} post={post} delay={index * 0.05} />
                ))}

                {cursorLoading && (
                  <div className="space-y-6 py-6 font-bold text-center text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                       <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                       <span className="text-xs">جاري تحميل منشورات المؤشر...</span>
                    </div>
                  </div>
                )}

                {!cursorLoading && cursorHasMore && (
                  <button
                    onClick={() => cursorFetchNext(false)}
                    className="w-full py-5 bg-white text-secondary hover:bg-secondary hover:text-white rounded-[2rem] border border-gray-100 transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm active:scale-95"
                  >
                    <RefreshCw size={14} className={cursorLoading ? 'animate-spin' : ''} />
                    <span>تحميل المزيد من المنشورات (Load More)</span>
                  </button>
                )}

                {!cursorLoading && !cursorHasMore && cursorPosts.length > 0 && (
                  <div className="py-12 text-center space-y-2 opacity-40">
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-[0.5em]">وصلت إلى نهاية منشورات المؤشر</p>
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mx-auto" />
                  </div>
                )}

                {cursorPosts.length === 0 && !cursorLoading && (
                  <div className="py-24 text-center text-gray-400 text-xs font-bold">
                    لا توجد منشورات متطابقة مع المؤشر حالياً
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
    </div>
  );
}

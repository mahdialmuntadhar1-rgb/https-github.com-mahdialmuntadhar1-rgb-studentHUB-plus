import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PostCard from '../components/PostCard';
import HeroCarousel from '../components/HeroCarousel';
import PostModal from '../components/PostModal';
import { ALL_POSTS, HERO_POSTS, SAMPLE_INSTITUTIONS } from '../constants';
import { Sparkles, TrendingUp, GraduationCap, RefreshCw, ArrowRightLeft, ChevronDown } from 'lucide-react';
import { PostSkeleton } from '../components/Skeletons';
import { getPosts } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Post } from '../types';
import { usePaginatedQuery } from '../hooks/usePaginatedQuery';

function filterMockPosts(all: Post[], activeFilter: string, uniFilter: string, userUni?: string | null): Post[] {
  let result = all;
  if (uniFilter) result = result.filter(p => p.institutionName === uniFilter);
  if (activeFilter === 'تريند') return result.filter(p => (p.likes || 0) > 500).sort((a, b) => b.likes - a.likes);
  if (activeFilter === 'مؤسستي' && userUni) return result.filter(p => p.institutionName === userUni);
  if (activeFilter !== 'كل العراق' && activeFilter !== 'مؤسستي' && activeFilter !== 'تريند') {
    result = result.filter(p => p.governorate === activeFilter);
  }
  return result;
}

export default function Feed() {
  const { profile } = useAuth();
  const [feedMode, setFeedMode] = useState<'classic' | 'cursor'>('classic');
  const [activeFilter, setActiveFilter] = useState('كل العراق');
  const [uniFilter, setUniFilter] = useState(profile?.institution || '');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
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

      const response = await getPosts({ governorate: govFilter, institution: instFilter, page: currentPage, limit: POSTS_PER_PAGE });
      const data = response?.posts || [];
      const pagination = response?.pagination;

      const transformedPosts: Post[] = data.map(p => ({
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

      setHasMore(pagination?.hasMore ?? transformedPosts.length === POSTS_PER_PAGE);
    } catch {
      // Fall back to rich mock data
      const filtered = filterMockPosts(ALL_POSTS, activeFilter, uniFilter, profile?.institution);
      const paginated = filtered.slice(currentPage * POSTS_PER_PAGE, (currentPage + 1) * POSTS_PER_PAGE);
      if (append) setPosts(prev => [...prev, ...paginated]);
      else setPosts(paginated);
      setHasMore(paginated.length === POSTS_PER_PAGE);
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
      const response = await getPosts({ governorate: govFilter, institution: instFilter, page: start, limit });
      const data = response?.posts || [];
      const pagination = response?.pagination;

      const transformed: Post[] = data.map((p: any) => ({
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

      const hasMore = pagination?.hasMore ?? transformed.length === limit;
      return {
        data: transformed,
        hasMore,
        nextCursor: hasMore ? String(start + limit) : undefined
      };
    } catch {
      const filtered = filterMockPosts(ALL_POSTS, activeFilter, uniFilter, profile?.institution);
      const paginated = filtered.slice(start, start + limit);
      const hasMore = start + limit < filtered.length;
      return { data: paginated, hasMore, nextCursor: hasMore ? String(start + limit) : undefined };
    }
  }, [activeFilter, uniFilter, profile]);

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


  return (
    <>
    <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />

    <div className="pb-32 pt-20 px-3 md:px-4 overflow-x-hidden">
        {/* Filter Bar */}
        <div className="fixed top-16 md:top-20 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-b border-gray-100 px-3 md:px-4 py-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {[
              { id: 'all', label: 'كل العراق', icon: Sparkles },
              { id: 'uni', label: 'مؤسستي', icon: GraduationCap },
              { id: 'trending', label: 'تريند', icon: TrendingUp },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => { setActiveFilter(f.label); setUniFilter(''); }}
                className={`relative flex items-center gap-1.5 px-3 md:px-4 py-2 md:py-2.5 rounded-2xl whitespace-nowrap transition-all font-black text-[9px] md:text-[10px] uppercase tracking-widest touch-manipulation ${
                  activeFilter === f.label && !uniFilter
                    ? 'bg-secondary text-white shadow-md'
                    : 'bg-white border border-gray-100 text-gray-400 hover:border-primary/30'
                }`}
              >
                <f.icon size={12} />
                <span className="hidden sm:inline">{f.label}</span>
                <span className="sm:hidden">{f.label.replace('العراق', 'الكل')}</span>
              </button>
            ))}

            {/* University dropdown filter */}
            <div className="relative flex-shrink-0">
              <select
                value={uniFilter}
                onChange={e => { setUniFilter(e.target.value); setActiveFilter('جامعة'); }}
                className={`appearance-none pl-6 md:pl-7 pr-3 md:pr-4 py-2 md:py-2.5 rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest border outline-none transition-all cursor-pointer touch-manipulation ${
                  uniFilter
                    ? 'bg-secondary text-white border-secondary'
                    : 'bg-white border-gray-100 text-gray-400 hover:border-primary/30'
                }`}
                dir="rtl"
              >
                <option value="">🎓</option>
                {SAMPLE_INSTITUTIONS.map(i => (
                  <option key={i.id} value={i.name}>{i.name}</option>
                ))}
              </select>
              <ChevronDown size={11} className={`absolute left-1.5 md:left-2 top-1/2 -translate-y-1/2 pointer-events-none ${uniFilter ? 'text-white' : 'text-gray-400'}`} />
            </div>

            <button
              onClick={() => setFeedMode(m => m === 'classic' ? 'cursor' : 'classic')}
              className="flex items-center gap-1.5 px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-100 rounded-2xl text-gray-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:border-primary/30 transition-all flex-shrink-0 touch-manipulation"
            >
              <ArrowRightLeft size={12} />
            </button>
          </div>
        </div>

        {/* Feed Content */}
        <div className="mt-14 md:mt-16">
          {/* Hero Carousel */}
          <HeroCarousel posts={HERO_POSTS} />

          <AnimatePresence mode="wait">
            {feedMode === 'classic' ? (
              isLoading ? (
                <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                  {[1, 2, 3].map(i => <PostSkeleton key={i} />)}
                </motion.div>
              ) : (
                <motion.div key="posts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  {posts.length > 0 ? (
                    <>
                      {posts.map((post, index) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          delay={index * 0.07}
                          onComment={p => setSelectedPost(p)}
                          onImageClick={p => setSelectedPost(p)}
                        />
                      ))}
                      <div ref={observerTarget} className="py-8 flex flex-col items-center gap-3 min-h-[80px]">
                        {isFetchingMore && (
                          <div className="flex gap-1.5">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                          </div>
                        )}
                        {!hasMore && (
                          <p className="text-[9px] font-black uppercase text-gray-300 tracking-[0.5em]">وصلت إلى النهاية ✓</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="py-20 text-center px-10">
                      <div className="w-20 h-20 bg-surface rounded-[2rem] flex items-center justify-center mx-auto text-primary mb-6">
                        <Sparkles size={36} />
                      </div>
                      <h3 className="text-xl font-black text-secondary mb-2">لا توجد منشورات</h3>
                      <p className="text-sm text-gray-400 font-bold">جرب فلتراً مختلفاً أو كن أول من ينشر!</p>
                    </div>
                  )}
                </motion.div>
              )
            ) : (
              <motion.div key="cursor-posts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                {cursorPosts.map((post, index) => (
                  <PostCard
                    key={`c-${post.id}-${index}`}
                    post={post}
                    delay={index * 0.05}
                    onComment={p => setSelectedPost(p)}
                    onImageClick={p => setSelectedPost(p)}
                  />
                ))}
                {cursorLoading && (
                  <div className="py-6 flex justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {!cursorLoading && cursorHasMore && (
                  <button
                    onClick={() => cursorFetchNext(false)}
                    className="w-full py-4 bg-white text-secondary hover:bg-secondary hover:text-white rounded-[2rem] border border-gray-100 transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm active:scale-95"
                  >
                    <RefreshCw size={14} />
                    <span>تحميل المزيد</span>
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
    </>
  );
}

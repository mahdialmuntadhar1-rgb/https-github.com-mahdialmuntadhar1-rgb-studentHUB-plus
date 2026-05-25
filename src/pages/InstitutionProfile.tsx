import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Share2, MapPin, Users, BookOpen, 
  Calendar, Briefcase, Image as ImageIcon, CheckCircle2,
  ExternalLink, GraduationCap, Award, Info, Search,
  Play, Plus, Globe, Phone, Building, RefreshCw
} from 'lucide-react';
import { Institution, Post, Opportunity } from '../types';
import { SAMPLE_POSTS, SAMPLE_OPPORTUNITIES } from '../constants';
import PostCard from '../components/PostCard';
import { supabase } from '../lib/supabase';
import { PostSkeleton } from '../components/Skeletons';

interface InstitutionProfileProps {
  institution: Institution;
  onBack: () => void;
}

export default function InstitutionProfile({ institution, onBack }: InstitutionProfileProps) {
  const [activeTab, setActiveTab] = useState('posts');
  const [programSearch, setProgramSearch] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchInstitutionPosts();
    }
  }, [activeTab, institution.name]);

  const fetchInstitutionPosts = async () => {
    setIsLoadingPosts(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id (
            full_name,
            avatar_url
          )
        `)
        .eq('institution', institution.name)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedPosts: Post[] = (data || []).map(p => ({
        id: p.id,
        type: p.type,
        institutionName: p.institution,
        institutionLogo: institution.logo,
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

      setPosts(transformedPosts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const tabs = [
    { id: 'posts', label: 'المنشورات', icon: BookOpen },
    { id: 'about', label: 'عن المؤسسة', icon: Info },
    { id: 'opportunities', label: 'فرص وتدريب', icon: Briefcase },
    { id: 'programs', label: 'البرامج الدراسية', icon: Award },
    { id: 'events', label: 'الفعاليات', icon: Calendar },
    { id: 'media', label: 'الوسائط', icon: ImageIcon },
  ];

  const institutionOpps = SAMPLE_OPPORTUNITIES.filter(o => o.institutionName === institution.name);

  // Sample data for extra sections
  const programs = [
    { name: 'هندسة البرمجيات', degree: 'بكالوريوس', duration: '٤ سنوات', level: 'كلية الهندسة' },
    { name: 'الذكاء الاصطناعي', degree: 'ماجستير', duration: 'سنتان', level: 'دراسات عليا' },
    { name: 'الطب العام', degree: 'بكالوريوس', duration: '٦ سنوات', level: 'كلية الطب' },
    { name: 'إدارة الأعمال', degree: 'بكالوريوس', duration: '٤ سنوات', level: 'كلية الإدارة' },
    { name: 'القانون الدولي', degree: 'بكالوريوس', duration: '٤ سنوات', level: 'كلية القانون' },
  ].filter(p => p.name.includes(programSearch));

  const mediaItems = [
    { type: 'image', url: 'https://picsum.photos/seed/inst_m1/600/600' },
    { type: 'video', url: 'https://picsum.photos/seed/inst_m2/600/600' },
    { type: 'image', url: 'https://picsum.photos/seed/inst_m3/600/600' },
    { type: 'image', url: 'https://picsum.photos/seed/inst_m4/600/600' },
    { type: 'image', url: 'https://picsum.photos/seed/inst_m5/600/600' },
    { type: 'video', url: 'https://picsum.photos/seed/inst_m6/600/600' },
  ];

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* 1. Header Section: Cover, Logo, Identity */}
      <div className="relative h-64 md:h-96 w-full">
        <img 
          src={institution.cover} 
          alt={institution.name} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/20 to-transparent" />
        
        {/* Nav Overlays */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
          <button 
            onClick={onBack}
            className="p-4 bg-white/20 backdrop-blur-2xl rounded-3xl text-white active:scale-90 transition-all border border-white/20 shadow-2xl"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="flex gap-2">
            <button className="p-4 bg-white/20 backdrop-blur-2xl rounded-3xl text-white active:scale-90 transition-all border border-white/20 shadow-2xl">
              <Plus size={22} />
            </button>
            <button className="p-4 bg-white/20 backdrop-blur-2xl rounded-3xl text-white active:scale-90 transition-all border border-white/20 shadow-2xl">
              <Share2 size={22} />
            </button>
          </div>
        </div>

        {/* Identity Details */}
        <div className="absolute -bottom-16 left-0 right-0 px-6 flex flex-col items-center">
          <div className="relative mb-4">
            <motion.div 
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-2"
            >
                <img 
                src={institution.logo} 
                alt="" 
                className="w-full h-full object-cover rounded-[3rem]"
                referrerPolicy="no-referrer"
                />
            </motion.div>
            <div className="absolute -bottom-2 right-2 bg-primary p-2 rounded-2xl border-4 border-white shadow-xl">
                <CheckCircle2 size={24} className="text-secondary" />
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-secondary">{institution.name}</h1>
            <p className="text-primary font-black tracking-widest text-xs uppercase">{institution.nameEn}</p>
            <div className="flex items-center justify-center gap-3">
               <span className="px-3 py-1 bg-surface border border-gray-100 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest">{institution.governorate}</span>
               <span className="px-3 py-1 bg-surface border border-gray-100 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest">{institution.city}</span>
               <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">{institution.type}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Action Strip & Stats */}
      <div className="mt-20 px-6">
        <div className="max-w-xl mx-auto">
            <div className="flex gap-4 mb-10">
                <motion.button 
                  onClick={() => setIsFollowing(!isFollowing)}
                  initial={false}
                  animate={{ 
                    backgroundColor: isFollowing ? '#1a1a2e' : '#f4a820',
                    color: isFollowing ? '#ffffff' : '#1a1a2e'
                  }}
                  transition={{ duration: 0.25 }}
                  className="flex-1 py-5 rounded-3xl font-black text-lg transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isFollowing ? 'following' : 'follow'}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-2"
                    >
                      {isFollowing ? (
                          <>
                              <span>نتابع المؤسسة</span>
                              <CheckCircle2 size={20} />
                          </>
                      ) : (
                          <span>متابعة</span>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </motion.button>
                <button className="px-8 bg-white border-2 border-gray-50 text-secondary font-black py-5 rounded-3xl hover:border-primary/40 active:scale-95 transition-all text-sm uppercase tracking-widest">
                    Apply Now
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-2 mb-10 bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-sm text-center">
                <div>
                    <h4 className="text-xl font-black text-secondary">1956</h4>
                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Founded</p>
                </div>
                <div className="border-r border-gray-50">
                    <h4 className="text-xl font-black text-secondary">18k</h4>
                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Students</p>
                </div>
                <div className="border-r border-gray-50">
                    <h4 className="text-xl font-black text-secondary">1,240</h4>
                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Posts</p>
                </div>
                <div className="border-r border-gray-50">
                    <h4 className="text-xl font-black text-secondary">43k</h4>
                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Followers</p>
                </div>
            </div>

            {/* 3. Tabs Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar mb-8 pb-1">
                {tabs.map((tab) => (
                    <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-6 py-4 rounded-[1.8rem] text-xs font-black transition-all whitespace-nowrap border-2 ${
                        activeTab === tab.id 
                        ? 'bg-secondary border-secondary text-white shadow-xl shadow-secondary/20' 
                        : 'bg-white border-gray-50 text-gray-400 hover:border-primary/30'
                    }`}
                    >
                    <tab.icon size={16} />
                    <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* 4. Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="pb-10"
                >
                    {activeTab === 'posts' && (
                        <div className="space-y-4">
                            {isLoadingPosts ? (
                                <div className="space-y-6">
                                    {[1, 2, 3].map(i => <PostSkeleton key={i} />)}
                                </div>
                            ) : error ? (
                                <div className="bg-white p-12 rounded-[3.5rem] text-center border border-gray-100">
                                    <h4 className="text-xl font-black text-secondary mb-4">حدث خطأ أثناء جلب المنشورات</h4>
                                    <button 
                                        onClick={fetchInstitutionPosts}
                                        className="px-6 py-3 bg-primary text-secondary rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
                                    >
                                        <RefreshCw size={16} />
                                        <span>إعادة المحاولة</span>
                                    </button>
                                </div>
                            ) : posts.length > 0 ? (
                                posts.map(post => <PostCard key={post.id} post={post} />)
                            ) : (
                                <div className="bg-white p-20 rounded-[3rem] text-center border border-gray-100">
                                    <BookOpen size={48} className="mx-auto text-gray-200 mb-4" />
                                    <p className="text-gray-400 font-black">لا توجد منشورات لهذه المؤسسة حالياً</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'about' && (
                        <div className="space-y-6">
                            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12" />
                                <h3 className="text-xl font-black text-secondary mb-4 flex items-center gap-3">
                                    <Info className="text-primary" />
                                    <span>قصتنا ومهمتنا</span>
                                </h3>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    {institution.description || "تعد هذه المؤسسة صرحاً أكاديمياً رائداً في العراق، تسعى لتقديم تعليم نوعي يجمع بين الأصالة والحداثة، وتخريج أجيال قادرة على قيادة التحول المجتمعي والتقني."}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                               <div className="bg-white p-6 rounded-[2.5rem] border border-gray-50 flex items-center gap-5">
                                  <div className="w-12 h-12 bg-surface rounded-2xl flex items-center justify-center text-primary"><Globe size={20} /></div>
                                  <div>
                                     <p className="text-[10px] font-black text-gray-300 uppercase">Website</p>
                                     <p className="text-sm font-black text-secondary uppercase tracking-tight">www.{institution.nameEn.toLowerCase().replace(/\s/g, '')}.edu.iq</p>
                                  </div>
                               </div>
                               <div className="bg-white p-6 rounded-[2.5rem] border border-gray-50 flex items-center gap-5">
                                  <div className="w-12 h-12 bg-surface rounded-2xl flex items-center justify-center text-primary"><Phone size={20} /></div>
                                  <div>
                                     <p className="text-[10px] font-black text-gray-300 uppercase">Contact</p>
                                     <p className="text-sm font-black text-secondary">+964 770 123 4567</p>
                                  </div>
                               </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'programs' && (
                        <div className="space-y-6">
                            <div className="relative">
                                <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input 
                                    type="text" 
                                    placeholder="ابحث عن تخصص..."
                                    className="w-full py-5 pr-14 pl-6 rounded-3xl bg-white border border-gray-100 shadow-sm focus:border-primary outline-none font-bold"
                                    value={programSearch}
                                    onChange={(e) => setProgramSearch(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {programs.map((p, i) => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        key={p.name} 
                                        className="bg-white p-6 rounded-[2.5rem] border border-gray-50 flex items-center justify-between group hover:border-primary/40 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black">
                                                <Building size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-secondary">{p.name}</h4>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{p.degree} • {p.duration}</p>
                                            </div>
                                        </div>
                                        <button className="p-3 bg-surface rounded-2xl text-gray-300 group-hover:text-primary transition-colors">
                                            <ArrowLeft size={18} />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'opportunities' && (
                        <div className="space-y-4">
                            {institutionOpps.length > 0 ? (
                                institutionOpps.map(opp => {
                                    const postConverted: Post = {
                                        id: opp.id,
                                        type: 'opportunity',
                                        institutionName: opp.institutionName,
                                        institutionLogo: opp.institutionLogo,
                                        governorate: opp.governorate,
                                        content: opp.title,
                                        title: opp.title,
                                        likes: 45,
                                        comments: 12,
                                        timestamp: 'متاح الآن',
                                        deadline: opp.deadline,
                                        tags: opp.tags,
                                        isVerified: true
                                    };
                                    return <PostCard key={opp.id} post={postConverted} />;
                                })
                            ) : (
                                <div className="bg-white p-20 rounded-[3rem] text-center border border-gray-100">
                                    <Briefcase size={48} className="mx-auto text-gray-200 mb-4" />
                                    <p className="text-gray-400 font-black">لا توجد فرصة معلنة حالياً</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'media' && (
                        <div className="grid grid-cols-2 gap-4">
                            {mediaItems.map((item, i) => (
                                <div key={i} className="relative aspect-square rounded-[2rem] overflow-hidden group">
                                    <img src={item.url} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt="" />
                                    {item.type === 'video' && (
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white">
                                            <Play size={32} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'events' && (
                        <div className="space-y-4">
                            {posts.filter(p => p.type === 'event').map(post => (
                                <PostCard key={post.id} post={post} />
                            ))}
                            {posts.filter(p => p.type === 'event').length === 0 && (
                                <div className="bg-white p-20 rounded-[3rem] text-center border border-gray-100">
                                    <Calendar size={48} className="mx-auto text-gray-200 mb-4" />
                                    <p className="text-gray-400 font-black">لا توجد فعاليات قادمة حالياً</p>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

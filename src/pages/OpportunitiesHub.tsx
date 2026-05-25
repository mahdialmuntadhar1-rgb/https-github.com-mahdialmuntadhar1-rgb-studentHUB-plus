import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, GraduationCap, Calendar, Clock, 
  MapPin, ChevronLeft, Bookmark, Search,
  TrendingUp, BarChart3, Filter, Star, 
  Zap, Save, BookOpen, BrainCircuit
} from 'lucide-react';
import { SAMPLE_OPPORTUNITIES, SAMPLE_INSIGHTS } from '../constants';
import PostCard from '../components/PostCard';
import { Post, Opportunity } from '../types';
import { PostSkeleton } from '../components/Skeletons';

export default function OpportunitiesHub() {
  const [activeTab, setActiveTab] = useState<'all' | 'insights' | 'saved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Transition loading simulation
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(timer);
  }, [activeTab, activeCategory]);

  const categories = [
    { id: 'job', label: 'وظائف', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'internship', label: 'تدريب', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 'scholarship', label: 'منح دراسية', icon: GraduationCap, color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: 'training', label: 'برامج تطوير', icon: BrainCircuit, color: 'text-green-500', bg: 'bg-green-50' },
  ];

  const filteredOpps = SAMPLE_OPPORTUNITIES.filter(o => 
    (!activeCategory || o.type === activeCategory) &&
    (o.title.includes(searchQuery) || o.institutionName.includes(searchQuery))
  );

  return (
    <div className="pb-24 bg-surface min-h-screen">
      {/* 1. Hero Strip */}
      <div className="bg-secondary relative overflow-hidden pt-10 pb-16 px-6">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -ml-32 -mt-32" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -mr-32 -mb-32" />
        
        <div className="relative z-10 max-w-xl mx-auto text-center space-y-4">
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
             >
                <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">مستقبلك يبدأ هنا</h1>
                <p className="text-primary font-black tracking-widest text-xs uppercase mb-6 italic">Your Future Starts Here</p>
                <p className="text-white/60 text-sm max-w-md mx-auto font-medium">وظائف، تدريب، منح دراسية، وتحليلات للسوق — مقدمة من أفضل مؤسسات العراق</p>
             </motion.div>

             <div className="relative mt-8 group">
                <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input 
                    type="text" 
                    placeholder="ابحث عن فرصة عمل أو منحة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-6 pr-16 pl-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-white/40 outline-none focus:bg-white focus:text-secondary focus:ring-4 focus:ring-primary/20 transition-all font-bold"
                />
             </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 -mt-8">
        {/* 2. Category Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {categories.map((cat, i) => (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    key={cat.id}
                    onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                    className={`${cat.bg} p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-3 active:scale-95 group overflow-hidden relative ${
                        activeCategory === cat.id ? 'border-primary shadow-xl shadow-primary/10' : 'border-transparent shadow-sm hover:border-white/50'
                    }`}
                >
                    <div className="p-4 bg-white rounded-2xl shadow-sm text-center transform group-hover:rotate-12 transition-transform">
                        <cat.icon className={cat.color} size={28} />
                    </div>
                    <span className={`text-xs font-black uppercase tracking-widest ${cat.color}`}>{cat.label}</span>
                    {activeCategory === cat.id && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
                    )}
                </motion.button>
            ))}
        </div>

        {/* 3. Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mb-8 bg-white p-2 rounded-[2rem] border border-gray-100 shadow-sm overflow-x-auto hide-scrollbar">
            {[
                { id: 'all', label: 'جميع الفرص', icon: Briefcase },
                { id: 'insights', label: 'تحليلات السوق', icon: BarChart3 },
                { id: 'saved', label: 'المهمات المحفوظة', icon: Bookmark },
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-[1.5rem] text-xs font-black transition-all whitespace-nowrap ${
                        activeTab === tab.id 
                            ? 'bg-secondary text-white shadow-lg' 
                            : 'text-gray-400 hover:text-secondary'
                    }`}
                >
                    <tab.icon size={16} />
                    <span>{tab.label}</span>
                </button>
            ))}
        </div>

        {/* 4. Tab Content */}
        <AnimatePresence mode="wait">
            {isLoading ? (
                <div key="skeleton" className="space-y-6">
                    <PostSkeleton />
                    <PostSkeleton />
                </div>
            ) : (
                <motion.div
                    key={activeTab + (activeCategory || '')}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="space-y-6"
                >
                {activeTab === 'all' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                             <h2 className="text-xl font-black text-secondary">الفرص المتاحة</h2>
                             <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase underline tracking-widest">
                                 <Filter size={12} />
                                 <span>Advanced Filter</span>
                             </div>
                        </div>
                        {filteredOpps.map(opp => {
                            const postConverted: Post = {
                                id: opp.id,
                                type: 'opportunity',
                                institutionName: opp.institutionName,
                                institutionLogo: opp.institutionLogo,
                                governorate: opp.governorate,
                                content: opp.title,
                                title: opp.title,
                                likes: Math.floor(Math.random() * 500),
                                comments: Math.floor(Math.random() * 50),
                                timestamp: 'منشور منذ قليل',
                                deadline: opp.deadline,
                                tags: opp.tags,
                                isVerified: true
                            };
                            return <PostCard key={opp.id} post={postConverted} />;
                        })}
                        {filteredOpps.length === 0 && (
                            <div className="py-20 text-center bg-white rounded-[3rem] border border-gray-50">
                                <Search size={48} className="mx-auto text-gray-100 mb-4" />
                                <p className="text-gray-400 font-black">لا توجد نتائج مطابقة لبحثك</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'insights' && (
                    <div className="space-y-6">
                        <div className="bg-primary/5 p-6 rounded-[2.5rem] border border-primary/20 mb-8 overflow-hidden relative">
                             <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
                             <h3 className="font-black text-secondary mb-2 flex items-center gap-2">
                                <BarChart3 size={20} className="text-primary" />
                                <span>Career Market Analysis</span>
                             </h3>
                             <p className="text-xs font-bold text-gray-500 leading-relaxed">اكتشف التوجهات الحالية، الأجور، والمهارات الأكثر طلباً في المحافظات العراقية المختلفة.</p>
                        </div>
                        {SAMPLE_INSIGHTS.map(insight => (
                            <PostCard key={insight.id} post={insight} />
                        ))}
                    </div>
                )}

                {activeTab === 'saved' && (
                    <div className="py-32 text-center bg-white rounded-[3rem] border border-gray-50 space-y-4">
                        <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto text-gray-200">
                             <Bookmark size={32} />
                        </div>
                        <div>
                             <h3 className="font-black text-secondary">لا توجد عناصر محفوظة</h3>
                             <p className="text-sm text-gray-400 font-bold max-w-xs mx-auto">احفظ الفرص التي تهمك للعودة إليها لاحقاً بسهولة.</p>
                        </div>
                        <button 
                            onClick={() => setActiveTab('all')}
                            className="text-primary font-black text-xs uppercase tracking-widest hover:underline"
                        >
                            Explore Opportunities
                        </button>
                    </div>
                )}
            </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}

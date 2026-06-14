import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView, animate } from 'motion/react';
import { 
  ArrowRight, Compass, Briefcase, GraduationCap, 
  MapPin, Users, Activity, Heart, MessageCircle, 
  Share2, Award, BookOpen, Star
} from 'lucide-react';
import { SAMPLE_INSTITUTIONS, SAMPLE_POSTS } from '../constants';

interface HomeProps {
  onStart: () => void;
  onSelectInstitution: (inst: any) => void;
}

const Counter = ({ value, label }: { value: string, label: string }) => {
  return (
    <div className="text-center group">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="text-4xl font-black text-secondary font-inter mb-2 group-hover:text-primary transition-colors"
      >
        {value}
      </motion.div>
      <div className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] leading-none">
        {label}
      </div>
    </div>
  );
};

function AnimatedCounter({ value, label }: { value: string; label: string; key?: React.Key }) {
  const [displayValue, setDisplayValue] = useState('0');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const numericStr = value.replace(/[^0-9]/g, '');
  const suffix = value.replace(/[0-9]/g, '');
  const targetValue = parseInt(numericStr) || 0;

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, targetValue, {
        duration: 1.5,
        ease: "easeOut",
        onUpdate: (latest) => {
          setDisplayValue(Math.floor(latest).toLocaleString() + suffix);
        }
      });
      return () => controls.stop();
    }
  }, [isInView, targetValue, suffix]);

  return (
    <motion.div 
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center group"
    >
        <h4 className="text-4xl font-black text-secondary mb-2 group-hover:text-primary transition-colors font-inter">
            {displayValue}
        </h4>
        <p className="text-xs font-black text-gray-300 uppercase tracking-widest">{label}</p>
    </motion.div>
  );
}

export default function Home({ onStart, onSelectInstitution }: HomeProps) {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);

  return (
    <div className="min-h-screen rtl overflow-x-hidden bg-surface selection:bg-primary/30">
      
      {/* 1. HERO SECTION — MAGAZINE STYLE */}
      <section className="relative h-screen flex flex-col items-center justify-center px-6 text-center text-white overflow-hidden">
        <motion.div 
          style={{ scale: heroScale, opacity: heroOpacity }}
          className="absolute inset-0 z-0"
        >
          <motion.img
            animate={{ scale: [1, 1.05, 1], x: [0, 10, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            src="https://picsum.photos/seed/iraq_uni_1/1920/1080?blur=1"
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 via-secondary/80 to-secondary" />
        </motion.div>

        <div className="relative z-10 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8"
            >
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Iraqi Student Hub</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-8xl font-black mb-6 leading-none tracking-tight"
            >
              مكانك بين <br />
              <span className="text-primary italic font-serif">الطلاب</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/70 text-lg md:text-2xl mb-12 max-w-2xl mx-auto font-medium"
            >
              العراق يدرس هنا. اكتشف جامعتك، تواصل مع زملائك، وابن مستقبلك في أكبر تجمع تعليمي في العراق.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={onStart}
                className="bg-primary hover:bg-white text-secondary font-black px-10 py-5 rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl shadow-primary/30 group"
              >
                <span className="text-xl">انضم كطالب</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-[-8px] transition-transform" />
              </button>
              
              <button className="bg-white/5 hover:bg-white/10 text-white font-bold px-10 py-5 rounded-2xl border border-white/20 backdrop-blur-sm transition-all text-xl">
                سجل مؤسستك
              </button>
            </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-30"
        >
            <div className="w-[1px] h-12 bg-white mx-auto" />
        </motion.div>
      </section>

      {/* 2. "WHAT'S HAPPENING NOW" PREVIEW STRIP — FOMO SECTION */}
      <section className="py-24 px-6 bg-white overflow-hidden border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
                <div>
                  <h2 className="text-4xl font-black text-secondary mb-2">يحدث الآن</h2>
                  <p className="text-gray-400 font-bold">بث حي من قلب الجامعات العراقية</p>
                </div>
                <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest px-4 py-2 bg-primary/5 rounded-full">
                   <Activity size={16} className="animate-pulse" />
                   <span>Live Campus Feed</span>
                </div>
            </div>
            
            <div className="relative">
              <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-10 scroll-smooth -mx-6 px-6">
                  {SAMPLE_POSTS.map((post, i) => (
                      <motion.div 
                          key={i}
                          whileHover={{ y: -5 }}
                          className="min-w-[320px] bg-surface p-5 rounded-[2.5rem] border border-gray-100 flex flex-col gap-4 shadow-sm hover:shadow-xl transition-all"
                      >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img src={post.institutionLogo} className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary/10" alt="" referrerPolicy="no-referrer" />
                                <div>
                                    <p className="text-xs font-black text-secondary leading-none mb-1">{post.institutionName}</p>
                                    <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                                      <MapPin size={10} />
                                      {post.governorate}
                                    </div>
                                </div>
                            </div>
                            <span className="text-[8px] font-black px-2 py-1 bg-white rounded-full text-secondary/40 border border-gray-100 uppercase font-inter">
                              {post.type}
                            </span>
                          </div>
                          
                          <div className="relative aspect-video rounded-3xl overflow-hidden group">
                            <img src={post.image} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt="" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors" />
                          </div>

                          <div className="px-1">
                            <p className="text-sm text-secondary font-bold line-clamp-2 leading-relaxed h-10 mb-4">{post.content}</p>
                            <div className="flex items-center gap-4 text-xs font-inter text-gray-400">
                                <span className="flex items-center gap-1"><Heart size={14} className="fill-red-500 text-red-500" /> {post.likes}</span>
                                <span className="flex items-center gap-1"><MessageCircle size={14} /> {post.comments}</span>
                            </div>
                          </div>
                      </motion.div>
                  ))}
              </div>
            </div>
        </div>
      </section>

      {/* 3. INSTITUTION DISCOVERY TEASER */}
      <section className="py-24 px-6 bg-surface">
         <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
                <div className="text-right flex-1">
                    <h2 className="text-4xl md:text-5xl font-black text-secondary mb-4 leading-tight">اكتشف جامعات العراق</h2>
                    <p className="text-gray-500 text-lg max-w-xl">تصفح الدليل الشامل لأكثر من 180 جامعة ومعهد تعليمي في جميع المحافظات العراقة.</p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-2 flex-1 md:justify-end">
                    {['الكل', 'بغداد', 'البصرة', 'الموصل', 'أربيل', 'النجف', 'كربلاء'].map((gov, i) => (
                        <button key={gov} className={`px-6 py-3 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${i === 0 ? 'bg-primary text-secondary shadow-xl shadow-primary/20' : 'bg-white text-gray-400 border border-gray-100 hover:border-primary/40'}`}>
                            {gov}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                {SAMPLE_INSTITUTIONS.slice(0, 4).map((inst, i) => (
                    <motion.div 
                      key={inst.id} 
                      onClick={() => onSelectInstitution(inst)}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white rounded-[3rem] overflow-hidden border border-gray-100 group cursor-pointer hover:border-primary/20 transition-all hover:shadow-2xl hover:shadow-secondary/5"
                    >
                        <div className="h-56 relative overflow-hidden">
                            <img src={inst.cover} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt="" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-transparent to-transparent opacity-80" />
                            <div className="absolute bottom-6 right-6 flex items-center gap-4">
                              <img src={inst.logo} className="w-14 h-14 rounded-2xl border-4 border-white bg-white object-cover shadow-xl" alt="" referrerPolicy="no-referrer" />
                              <div className="text-white">
                                <h3 className="font-black text-lg drop-shadow-sm">{inst.name}</h3>
                                <div className="flex items-center gap-1 text-[10px] uppercase font-black opacity-80 tracking-widest">
                                  <MapPin size={10} />
                                  {inst.governorate}
                                </div>
                              </div>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="flex items-center justify-between gap-4 mb-4">
                              <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-black text-gray-400 font-inter tracking-widest leading-none mb-1">Students</span>
                                <span className="text-sm font-bold text-secondary">{(inst.students / 1000).toFixed(1)}k+</span>
                              </div>
                              <div className="flex flex-col text-left">
                                <span className="text-[10px] uppercase font-black text-gray-400 font-inter tracking-widest leading-none mb-1">Posts</span>
                                <span className="text-sm font-bold text-secondary">{(inst.postCount / 1000).toFixed(1)}k</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{inst.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
            
            <button className="mx-auto flex items-center gap-4 bg-secondary text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-primary hover:text-secondary group transition-all active:scale-95 shadow-xl shadow-secondary/10">
                <span>تصفح جميع المؤسسات</span>
                <Compass className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            </button>
         </div>
      </section>

      {/* 4. OPPORTUNITIES HIGHLIGHT — VISUALLY DISTINCT SECTION */}
      <section className="py-32 px-6 bg-gradient-to-br from-secondary to-secondary/95 relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px] -ml-32 -mb-32" />
        
        <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-20 max-w-3xl mx-auto">
                <span className="text-primary font-black text-xs uppercase tracking-[0.3em] mb-4 block">Future & Careers</span>
                <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">وظائف، تدريب، ومنح دراسية</h2>
                <p className="text-white/60 text-lg">اربط دراستك بسوق العمل الحقيقي. اكتشف المئات من الفرص المتاحة حصرياً عبر المؤسسات الأكاديمية.</p>
            </div>
            
            <div className="text-center">
                <button className="bg-primary hover:bg-white text-secondary font-black px-12 py-5 rounded-3xl shadow-2xl shadow-primary/20 transition-all active:scale-95 text-lg">
                    استكشف جميع الفرص
                </button>
            </div>
        </div>
      </section>

      {/* 5. STUDENT LIFE MOSAIC — ASYMMETRIC GRID */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
                <h2 className="text-4xl md:text-5xl font-black text-secondary mb-4 leading-tight">حياة الطالب في العراق</h2>
                <p className="text-gray-400 text-lg">من أربيل إلى البصرة — طلابنا يبنون مستقبلهم هنا</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[600px] mb-20">
                <div className="col-span-1 row-span-2 relative overflow-hidden rounded-[3rem] group">
                    <img src="https://picsum.photos/seed/stu1/800/1200" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt="" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                        <span className="text-white text-xs font-bold font-inter tracking-widest uppercase opacity-80">Baghdad | 2024</span>
                    </div>
                </div>
                <div className="col-span-1 row-span-1 relative overflow-hidden rounded-[3rem] group">
                    <img src="https://picsum.photos/seed/stu2/800/800" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt="" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition-colors" />
                </div>
                <div className="col-span-2 row-span-1 relative overflow-hidden rounded-[3rem] group">
                    <img src="https://picsum.photos/seed/stu3/1200/800" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt="" referrerPolicy="no-referrer" />
                    <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-white font-bold max-w-sm">"هنا وجدت مجتمعي الحقيقي ودعم لم أكن أتخيله." — سارة، طالبة طب</p>
                    </div>
                </div>
                <div className="col-span-1 row-span-1 relative overflow-hidden rounded-[3rem] group">
                    <img src="https://picsum.photos/seed/stu4/800/800" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt="" referrerPolicy="no-referrer" />
                </div>
                <div className="col-span-2 row-span-1 relative overflow-hidden rounded-[3rem] group">
                    <img src="https://picsum.photos/seed/stu5/1200/800" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt="" referrerPolicy="no-referrer" />
                    <div className="absolute top-8 right-8 bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
                      <p className="text-white font-black text-xs uppercase tracking-widest">Basrah Campus Life</p>
                    </div>
                </div>
            </div>
            
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 py-16 px-12 bg-surface rounded-[4rem] border border-gray-100">
          {[
              { value: '180+', label: 'جامعة ومعهد' },
              { value: '500k+', label: 'طالب مسجل' },
              { value: '18', label: 'محافظة' },
              { value: '1.2k', label: 'فرصة منشورة' },
          ].map((stat) => (
              <AnimatedCounter 
                  key={stat.label} 
                  value={stat.value} 
                  label={stat.label}
              />
          ))}
      </div>
        </div>
      </section>

      {/* 6. FINAL CTA SECTION — DYNAMIC GRADIENT */}
      <section className="py-32 px-6 relative bg-white">
          <div className="max-w-6xl mx-auto relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-primary via-amber-500 to-orange-600 p-1">
              <div className="bg-secondary/95 backdrop-blur-3xl rounded-[3.9rem] p-16 md:p-24 text-center text-white relative flex flex-col items-center">
                  
                  {/* Subtle Background Pattern */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                      className="absolute -top-1/2 -right-1/2 w-[1000px] h-[1000px] bg-gradient-to-br from-primary to-transparent rounded-full blur-[100px]"
                    />
                  </div>

                  <h2 className="text-4xl md:text-7xl font-black mb-8 leading-tight relative z-10">
                    انضم إلى جامعتك. <br />
                    اكتشف <span className="text-primary italic font-serif">العراق.</span>
                  </h2>
                  <p className="text-white/60 text-lg md:text-xl mb-12 max-w-2xl mx-auto relative z-10 leading-relaxed">
                    كونك طالباً يعني أنك تستحق مكاناً يحيط بك بفرص لا حصر لها وزمالة مجتمعية حقيقية. مستقبلك يعتمد على من تتبعهم.
                  </p>
                  
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onStart}
                    className="bg-white text-secondary font-black px-16 py-6 rounded-3xl shadow-2xl hover:bg-primary transition-all text-2xl relative z-10 group flex items-center gap-4"
                  >
                      <span>أنشئ حسابك مجاناً</span>
                      <ArrowRight className="w-8 h-8 group-hover:translate-x-[-8px] transition-transform" />
                  </motion.button>

                  <div className="mt-12 flex items-center gap-4 opacity-30 text-[10px] font-black uppercase tracking-[0.4em] relative z-10">
                    <span>Baghdad</span>
                    <div className="w-1 h-1 rounded-full bg-white" />
                    <span>Basrah</span>
                    <div className="w-1 h-1 rounded-full bg-white" />
                    <span>Mosul</span>
                    <div className="w-1 h-1 rounded-full bg-white" />
                    <span>Erbil</span>
                  </div>
              </div>
          </div>
      </section>

      {/* SIMPLE FOOTER */}
      <footer className="py-12 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest border-t border-gray-100">
        &copy; 2026 Rafid Hub — Crafted for Iraqi Students
        <br />
        <span className="text-[9px] text-gray-300 mt-2 block">Build: Jamiaati Official Frontend — Worker https-github — API rafid-api</span>
      </footer>

    </div>
  );
}

// Helper components for layout
function ChevronLeft(props: any) {
  return (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6"/>
    </svg>
  );
}

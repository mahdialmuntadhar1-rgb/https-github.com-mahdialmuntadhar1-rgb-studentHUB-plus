import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, ChevronRight, GraduationCap, School, 
  MapPin, Search, Star, Camera, Landmark, 
  CheckCircle2, Info, Sparkles, User, BookOpen,
  Briefcase, Award, Users, Rocket, BarChart3
} from 'lucide-react';
import { GOVERNORATES, SAMPLE_INSTITUTIONS } from '../constants';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);
  const [data, setData] = useState({
    role: '',
    roleLabel: '',
    governorate: '',
    institution: '',
    institutionId: '',
    stage: '',
    interests: [] as string[],
    name: '',
    bio: '',
    social: '',
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleFinish = async () => {
    if (!user) return;
    setIsFinishing(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: data.name,
          governorate: data.governorate,
          institution: data.institution,
          institution_id: data.institutionId,
          stage: data.stage,
          interests: data.interests,
          bio: data.bio,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      await refreshProfile();
      onComplete();
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('حدث خطأ أثناء حفظ الملف الشخصي. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsFinishing(false);
    }
  };

  // --- Step Content Definitions ---

  const roles = [
    { id: 'uni_student', icon: GraduationCap, label: 'طالب جامعي', desc: 'تواصل مع كليتك وجامعتك' },
    { id: 'inst_student', icon: School, label: 'طالب معهد', desc: 'اكتشف فرص التدريب والمهن' },
    { id: 'high_student', icon: BookOpen, label: 'طالب إعدادية', desc: 'خطط لمسارك الجامعي القادم' },
    { id: 'graduate', icon: Star, label: 'خريج حديث', desc: 'ابحث عن وظائف وافتح آفاقك' },
    { id: 'representative', icon: Landmark, label: 'ممثل مؤسسة', desc: 'إدارة حساب الجامعة أو المعهد' },
  ];

  const stages = {
    uni_student: ['السنة الأولى', 'السنة الثانية', 'السنة الثالثة', 'السنة الرابعة', 'السنة الخامسة', 'دراسات عليا - ماجستير', 'دراسات عليا - دكتوراه'],
    inst_student: ['السنة الأولى', 'السنة الثانية', 'خريج معهد'],
    high_student: ['الصف العاشر', 'الصف الحادي عشر', 'الصف الثاني عشر'],
    graduate: ['خريج حديث (٢٠٢٣-٢٠٢٤)', 'خريج سابق', 'باحث عن عمل'],
    representative: ['إدارة العلاقات العامة', 'شؤون الطلبة والتسجيل', 'المكتب الإعلامي', 'عمادة الكلية/الجامعة'],
  };

  const interestsList = [
    { label: 'إعلانات الحرم الجامعي', icon: Info },
    { label: 'فعاليات وأنشطة طلابية', icon: Sparkles },
    { label: 'مصادر أكاديمية وبحوث', icon: BookOpen },
    { label: 'فرص عمل وتدريب', icon: Briefcase },
    { label: 'منح دراسية ودولية', icon: Award },
    { label: 'أندية ومجتمعات طلابية', icon: Users },
    { label: 'تحليلات سوق العمل', icon: BarChart3 },
    { label: 'إنجازات وقصص نجاح', icon: CheckCircle2 },
  ];

  // --- Render Steps ---

  const renderProgress = () => (
    <div className="flex items-center gap-1.5 mb-10">
      {[1, 2, 3, 4, 5, 6, 7].map((s) => (
        <div 
          key={s} 
          className={`h-1.5 rounded-full transition-all duration-700 ${
            s === step ? 'w-12 bg-primary' : s < step ? 'w-4 bg-primary/40' : 'w-4 bg-gray-100'
          }`} 
        />
      ))}
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex flex-col gap-8 pb-10">
            <div>
              <h2 className="text-4xl font-black text-secondary mb-2">من أنت؟</h2>
              <p className="text-gray-400">لنخصص تجربتك بناءً على هويتك الأكاديمية</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { 
                    setData({ ...data, role: r.id, roleLabel: r.label }); 
                    nextStep(); 
                  }}
                  className={`group p-6 rounded-[2.5rem] border-2 text-right transition-all flex items-center gap-6 ${
                    data.role === r.id ? 'border-primary bg-primary/5' : 'border-gray-50 bg-white hover:border-primary/20'
                  }`}
                >
                  <div className={`p-4 rounded-2xl transition-colors ${data.role === r.id ? 'bg-primary text-secondary' : 'bg-surface text-gray-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                    <r.icon size={28} />
                  </div>
                  <div className="flex-1">
                    <div className="font-black text-secondary text-lg leading-none mb-1">{r.label}</div>
                    <div className="text-xs text-gray-400 font-medium">{r.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col gap-8 pb-10">
            <div>
              <h2 className="text-4xl font-black text-secondary mb-2">أين تسكن؟</h2>
              <p className="text-gray-400">اختر المحافظة لتسهيل البحث عن مؤسستك</p>
            </div>
            <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[60vh] hide-scrollbar pb-10">
              {GOVERNORATES.map((gov) => (
                <button
                  key={gov}
                  onClick={() => { setData({ ...data, governorate: gov }); nextStep(); }}
                  className={`relative p-5 rounded-[2rem] border-2 transition-all flex flex-col items-center justify-center gap-3 ${
                    data.governorate === gov ? 'border-primary bg-primary/5' : 'border-gray-50 bg-white'
                  }`}
                >
                  <MapPin size={24} className={data.governorate === gov ? 'text-primary' : 'text-gray-200'} />
                  <span className="font-black text-secondary">{gov}</span>
                  {data.governorate === gov && (
                    <motion.div layoutId="check" className="absolute top-3 right-3 text-primary">
                      <CheckCircle2 size={16} />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        const filteredInsts = SAMPLE_INSTITUTIONS.filter(i => 
          (i.governorate === data.governorate) &&
          (i.name.includes(searchQuery) || i.nameEn?.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        return (
          <div className="flex flex-col gap-8 pb-10">
            <div>
              <h2 className="text-4xl font-black text-secondary mb-2">مؤسستك التعليمية</h2>
              <p className="text-gray-400">ابحث عن جامعتك أو معهدك في {data.governorate}</p>
            </div>
            
            <div className="relative">
                <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                <input 
                    type="text" 
                    placeholder="ابحث بالاسم..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-5 pr-14 pl-6 rounded-3xl bg-white border border-gray-100 shadow-sm focus:border-primary outline-none transition-all font-bold"
                />
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto max-h-[45vh] hide-scrollbar pb-10">
              {filteredInsts.map((inst) => (
                <button
                  key={inst.id}
                  onClick={() => { setData({ ...data, institution: inst.name, institutionId: inst.id }); nextStep(); }}
                  className="group flex items-center gap-5 p-5 rounded-[2.5rem] bg-white border border-gray-50 hover:border-primary/40 transition-all text-right shadow-sm"
                >
                  <img src={inst.logo} alt={inst.name} className="w-14 h-14 rounded-2xl object-cover ring-4 ring-surface" referrerPolicy="no-referrer" />
                  <div className="flex-1">
                    <div className="font-black text-secondary text-base leading-tight mb-1">{inst.name}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{inst.type} • {inst.city}</div>
                  </div>
                  <ChevronLeft className="text-gray-300 group-hover:translate-x-[-5px] transition-transform" size={20} />
                </button>
              ))}
              <button className="p-6 rounded-[2rem] border-2 border-dashed border-gray-100 text-gray-400 font-bold text-sm hover:border-primary/20 hover:text-primary transition-all">
                مؤسستي ليست مدرجة هنا
              </button>
            </div>
          </div>
        );

      case 4:
        const currentStages = (stages as any)[data.role] || stages.uni_student;
        return (
          <div className="flex flex-col gap-8 pb-10">
            <div>
              <h2 className="text-4xl font-black text-secondary mb-2">في أي مرحلة؟</h2>
              <p className="text-gray-400">لنحدد المواد الدراسية والإعلانات المناسبة لك</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {currentStages.map((s: string) => (
                <button
                  key={s}
                  onClick={() => { setData({ ...data, stage: s }); nextStep(); }}
                  className={`p-6 rounded-[2rem] text-right font-black transition-all border-2 ${
                    data.stage === s ? 'bg-primary border-primary text-secondary' : 'bg-white border-gray-50 text-gray-400 hover:border-primary/20'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="flex flex-col gap-8 pb-10">
             <div>
              <h2 className="text-4xl font-black text-secondary mb-2">ما الذي يثير اهتمامك؟</h2>
              <p className="text-gray-400">اختر ٣ مواضيع على الأقل لنخصص لك التغذية الإخبارية</p>
            </div>
            <div className="flex flex-wrap gap-3 mb-20">
              {interestsList.map((interest) => (
                <button
                  key={interest.label}
                  onClick={() => {
                    const next = data.interests.includes(interest.label) 
                      ? data.interests.filter(i => i !== interest.label)
                      : [...data.interests, interest.label];
                    setData({...data, interests: next});
                  }}
                  className={`flex items-center gap-3 px-6 py-4 rounded-[1.8rem] transition-all font-black border-2 ${
                    data.interests.includes(interest.label) ? 'bg-secondary border-secondary text-white shadow-xl shadow-secondary/20' : 'bg-white border-gray-50 text-gray-400 hover:border-primary/30'
                  }`}
                >
                  <interest.icon size={18} />
                  <span>{interest.label}</span>
                </button>
              ))}
            </div>
            
            <div className="fixed bottom-10 left-6 right-6">
                <button 
                    onClick={nextStep}
                    disabled={data.interests.length < 3}
                    className="w-full bg-primary text-secondary py-5 rounded-3xl font-black text-xl shadow-2xl shadow-primary/30 disabled:opacity-30 disabled:scale-100 transition-all active:scale-95"
                >
                    استمرار ({data.interests.length}/3)
                </button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="flex flex-col gap-8 pb-10">
            <div>
              <h2 className="text-4xl font-black text-secondary mb-2">إعداد الملف الشخصي</h2>
              <p className="text-gray-400">كيف يراك بقية الزملاء على رافد؟</p>
            </div>
            <div className="flex flex-col items-center gap-8 mt-4">
                <div className="relative">
                    <div className="w-40 h-40 rounded-[3rem] bg-surface border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden">
                        <Camera className="text-gray-300 w-12 h-12" />
                    </div>
                    <button className="absolute -bottom-2 -right-2 bg-primary p-3 rounded-2xl shadow-xl text-secondary">
                        <Sparkles size={20} />
                    </button>
                </div>
                <div className="w-full space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mr-2">الاسم بالكامل</label>
                        <input 
                            type="text" 
                            placeholder="أدخل اسمك الحقيقي..."
                            value={data.name}
                            onChange={(e) => setData({...data, name: e.target.value})}
                            className="w-full py-5 px-6 rounded-3xl bg-white border border-gray-100 shadow-sm outline-none focus:border-primary font-bold text-lg"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mr-2">نبذة قصيرة</label>
                        <textarea 
                            placeholder="تحدث قليلاً عن طموحاتك..."
                            rows={3}
                            value={data.bio}
                            onChange={(e) => setData({...data, bio: e.target.value})}
                            className="w-full py-5 px-6 rounded-3xl bg-white border border-gray-100 shadow-sm outline-none focus:border-primary font-bold resize-none"
                        />
                    </div>
                </div>
            </div>
            <button 
                onClick={nextStep}
                disabled={!data.name}
                className="mt-8 bg-secondary text-white py-5 rounded-3xl font-black text-xl shadow-xl shadow-secondary/20 active:scale-95 transition-all disabled:opacity-50"
            >
                جاهز تماماً!
            </button>
          </div>
        );

      case 7:
        // Welcome Screen
        return (
          <div className="flex flex-col items-center justify-center h-full gap-8 text-center pb-20">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10, stiffness: 100 }}
              className="w-32 h-32 bg-primary rounded-[3rem] flex items-center justify-center text-secondary shadow-2xl shadow-primary/30"
            >
              <CheckCircle2 size={64} />
            </motion.div>
            
            <div className="space-y-4">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-black text-secondary"
              >
                أهلاً بك في رافد، {data.name.split(' ')[0]}!
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-400 font-medium max-w-sm"
              >
                لقد قمنا بتخصيص المنصة لتناسب المرحلة {data.stage} في {data.institution}
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl w-full max-w-sm text-right flex items-center gap-4"
            >
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <Sparkles size={24} />
                </div>
                <div>
                    <h4 className="font-black text-secondary text-sm">أخبار جامعتك جاهزة</h4>
                    <p className="text-[10px] text-gray-400 font-bold">هناك ٥ إعلانات جديدة تنتظرك في تغذيتك الآن</p>
                </div>
            </motion.div>

            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              onClick={handleFinish}
              disabled={isFinishing}
              className="w-full bg-secondary text-white py-6 rounded-3xl font-black text-xl shadow-2xl shadow-secondary/30 active:scale-95 transition-all mt-10 disabled:opacity-50"
            >
                {isFinishing ? (
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  'استكشف عالمك الأكاديمي'
                )}
            </motion.button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-surface px-6 pt-16 relative overflow-hidden flex flex-col">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -mr-40 -mt-40" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-[100px] -ml-40 -mb-40" />
      
      {/* Progress Bar (Fixed at top) */}
      <div className="max-w-7xl mx-auto w-full">
        {step < 7 && renderProgress()}
      </div>

      {/* Content Area */}
      <div className="flex-1 relative z-10 max-w-xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="h-full"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky Back Button */}
      {step > 1 && step < 7 && (
        <button 
          onClick={prevStep}
          className="fixed bottom-10 right-6 p-4 rounded-full bg-white border border-gray-100 text-secondary active:scale-90 transition-all shadow-lg z-20 flex items-center gap-2"
        >
          <ChevronRight size={20} />
          <span className="text-xs font-black">رجوع</span>
        </button>
      )}
    </div>
  );
}

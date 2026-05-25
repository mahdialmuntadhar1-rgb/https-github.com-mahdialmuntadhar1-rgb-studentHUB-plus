import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Auth() {
  const { setAuthData } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { token, user } = await api.login(email, password);
        setAuthData(token, user);
      } else {
        const { token, user } = await api.register({ email, password, full_name: fullName });
        setAuthData(token, user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] -ml-48 -mb-48" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden relative z-10 border border-gray-50"
      >
        <div className="p-8 md:p-12">
          <div className="flex flex-col items-center mb-10 text-center">
             <div className="w-16 h-16 bg-primary rounded-[1.5rem] flex items-center justify-center text-secondary shadow-xl shadow-primary/20 mb-6">
                <Sparkles size={32} />
             </div>
             <h2 className="text-3xl font-black text-secondary mb-2">
                {isLogin ? 'أهلاً بك مجدداً' : 'انضم إلى رافد'}
             </h2>
             <p className="text-sm text-gray-400 font-bold">
                {isLogin ? 'سجل دخولك لمتابعة زملائك' : 'ابدأ رحلتك الأكاديمية مع أكبر مجتمع طلابي'}
             </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-4">الاسم الكامل</label>
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                    <input 
                      type="text" 
                      required
                      placeholder="أدخل اسمك الحقيقي..."
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-surface border border-gray-100 py-4 pr-12 pl-4 rounded-2xl focus:border-primary outline-none font-bold transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-4">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                <input 
                  type="email" 
                  required
                  placeholder="name@university.edu.iq"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface border border-gray-100 py-4 pr-12 pl-4 rounded-2xl focus:border-primary outline-none font-bold transition-all rtl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-4">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface border border-gray-100 py-4 pr-12 pl-4 rounded-2xl focus:border-primary outline-none font-bold transition-all"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-red-50 rounded-2xl text-red-500 text-xs font-bold leading-relaxed border border-red-100"
              >
                {error}
              </motion.div>
            )}

            <button
              disabled={isLoading}
              className="w-full bg-primary text-secondary py-5 rounded-3xl font-black text-lg shadow-xl shadow-primary/20 hover:bg-secondary hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3 mt-8 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}</span>
                  {isLogin ? <ArrowLeft size={20} /> : <CheckCircle2 size={20} />}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
             <button 
               onClick={() => setIsLogin(!isLogin)}
               className="text-gray-400 font-bold hover:text-primary transition-colors text-sm"
             >
                {isLogin ? 'ليس لديك حساب؟ انضم الآن' : 'لديك حساب بالفعل؟ سجل دخولك'}
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

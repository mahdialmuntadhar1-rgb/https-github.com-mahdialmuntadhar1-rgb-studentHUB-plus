import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { ApiClient } from '../lib/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('هذا الرابط غير صالح أو منتهي الصلاحية.');
      return;
    }

    if (password.length < 6) {
      setError('يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.');
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await ApiClient.resetPassword(token, password);
      setSuccess(response.message || 'تم إعادة تعيين كلمة المرور بنجاح!');
    } catch (err: any) {
      setError(err.message || 'فشل إعادة تعيين كلمة المرور.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Blur Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] -ml-48 -mb-48" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden relative z-10 border border-gray-50 text-right"
        dir="rtl"
      >
        <div className="p-8 md:p-12">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-primary rounded-[1.5rem] flex items-center justify-center text-secondary shadow-xl shadow-primary/20 mb-6">
              <Sparkles size={32} />
            </div>
            <h2 className="text-3xl font-black text-secondary mb-2">تعيين كلمة المرور جديدة</h2>
            <p className="text-sm text-gray-400 font-bold">يرجى إدخال كلمة المرور الجديدة وتأكيدها لمواصلة الدخول لرافد</p>
          </div>

          {!token ? (
            <div className="p-6 bg-red-50 text-red-500 rounded-2xl flex flex-col items-center gap-4 text-xs font-bold border border-red-100 text-center">
              <AlertCircle size={32} />
              <span>هذا الرابط غير صالح أو يفتقد لرمز التحكم (token). يرجى طلب رابط جديد لإعادة تعيين كلمة المرور.</span>
              <button
                onClick={() => navigate('/auth')}
                className="mt-2 px-6 py-3 bg-secondary text-white rounded-xl text-xs font-black transition-all hover:bg-primary hover:text-secondary"
              >
                العودة لتسجيل الدخول
              </button>
            </div>
          ) : success ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-6 text-center"
            >
              <div className="p-6 bg-green-50 text-green-500 rounded-[2rem] border border-green-100 flex flex-col items-center gap-3">
                <CheckCircle2 size={44} className="animate-bounce" />
                <p className="text-sm font-black text-secondary">تم تغيير كلمة المرور بنجاح!</p>
                <p className="text-xs text-gray-500 font-bold">{success}</p>
              </div>

              <button
                onClick={() => {
                  // Direct to main app route which defaults back to Auth / Feed tab
                  window.location.href = window.location.origin + window.location.pathname;
                }}
                className="w-full bg-primary text-secondary py-5 rounded-3xl font-black text-lg shadow-xl shadow-primary/20 hover:bg-secondary hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>تسجيل الدخول الآن</span>
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-4">كلمة المرور الجديدة</label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-surface border border-gray-100 py-4 pr-12 pl-4 rounded-2xl focus:border-primary outline-none font-bold transition-all text-left"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-4">تأكيد كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-surface border border-gray-100 py-4 pr-12 pl-4 rounded-2xl focus:border-primary outline-none font-bold transition-all text-left"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-xs font-bold leading-relaxed border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-secondary py-5 rounded-3xl font-black text-lg shadow-xl shadow-primary/20 hover:bg-secondary hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3 mt-8 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>حفظ كلمة المرور الجديدة</span>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

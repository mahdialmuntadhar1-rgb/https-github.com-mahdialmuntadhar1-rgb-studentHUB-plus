import React, { useState } from 'react';
import { Language } from '../types';
import { getTranslation } from '../data/translations';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, ShieldCheck, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { BACKEND_URL } from '../lib/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onAuthSuccess: (username: string, email: string) => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

export default function AuthModal({ isOpen, onClose, language, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  
  // Interaction/Validation States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Localized texts
  const t = {
    login: { en: 'Sign In', ar: 'تسجيل الدخول', ku: 'چوونەژوورەوە' },
    register: { en: 'Create Account', ar: 'إنشاء حساب جديد', ku: 'تۆمارکردنی هەژمار' },
    forgot: { en: 'Reset Password', ar: 'استعادة الحساب', ku: 'دۆزینەوەی وشەی تێپەڕ' },
    emailLabel: { en: 'Academic Email', ar: 'البريد الإلكتروني الجامعي', ku: 'ئیمەیڵی ئەکادیمی' },
    passwordLabel: { en: 'Password', ar: 'كلمة المرور', ku: 'وشەی تێپەڕ' },
    usernameLabel: { en: 'Full Name', ar: 'الاسم الكامل', ku: 'ناوی تەواو' },
    forgotLink: { en: 'Forgot Password?', ar: 'نسيت كلمة المرور؟', ku: 'وشەی تێپەڕت لەبیرچووە؟' },
    noAccount: { en: "Don't have an account?", ar: 'ليس لديك حساب؟', ku: 'هەژمارت نییە؟' },
    haveAccount: { en: 'Already have an account?', ar: 'لديك حساب بالفعل؟', ku: 'خاوەنی هەژماری؟' },
    registerNow: { en: 'Register Now', ar: 'سجل الآن', ku: 'ئێستا تۆمار بکە' },
    loginNow: { en: 'Login Now', ar: 'سجل دخولك', ku: 'ئێستا بچۆ ژوورەوە' },
    backToLogin: { en: 'Back to Login', ar: 'العودة لتسجيل الدخول', ku: 'گەڕانەوە بۆ چوونەژوورەوە' },
    remember: { en: 'Remember session', ar: 'تذكرني على هذا الجهاز', ku: 'بیرهێنانەوە' },
    validationAcademicEmail: { en: 'Please enter a valid student email.', ar: 'يرجى إدخال بريد إلكتروني جامعي صحيح.', ku: 'تکایە ئیمەیڵێکی دروست بنووسە.' },
    validationPasswordLen: { en: 'Password must be at least 6 characters.', ar: 'كلمة المرور يجب أن لا تقل عن ٦ أحرف.', ku: 'دەبێت وشەی تێپەڕ لانی کەم ٦ پیت بێت.' },
    validationNameEmpty: { en: 'Please enter your name.', ar: 'يرجى كتابة الاسم الكامل.', ku: 'تکایە ناوی خۆت بنووسە.' },
    emailSentTitle: { en: 'Instruction Sent', ar: 'تم إرسال التعليمات', ku: 'ڕێنمایی نێردران' },
    emailSentDesc: { en: 'A secure recovery code has been sent to your inbox.', ar: 'تم إرسال رمز إعادة التعيين الآمن لبريدك الإلكتروني.', ku: 'کۆدی سەرلەنوێ ڕێکخستنەوە نێردرا بۆ ئیمەیڵەکەت.' },
    registerSuccess: { en: 'Welcome to Talaba!', ar: 'أهلاً بك في منصة طلبة!', ku: 'بەخێربێیت بۆ تەڵەبە!' },
    loginSuccess: { en: 'Welcome back!', ar: 'أهلاً بعودتك مجدداً!', ku: 'بەخێربێیتەوە!' }
  };

  const getLabel = (key: keyof typeof t) => {
    return t[key][language] || t[key]['en'];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Simple robust validation simulation
    if (!email.includes('@')) {
      setError(getLabel('validationAcademicEmail'));
      setLoading(false);
      return;
    }

    if (mode === 'register' && !username.trim()) {
      setError(getLabel('validationNameEmpty'));
      setLoading(false);
      return;
    }
    if (mode === 'register' && !privacyConsent) {
      setError(language === 'ar' ? 'يرجى قبول إشعار الخصوصية وقواعد المجتمع قبل التسجيل.' : language === 'ku' ? 'تکایە پێش تۆمارکردن ئاگاداری تایبەتمەندی و یاساکانی کۆمەڵگا پەسەند بکە.' : 'Please accept the Privacy Notice and Community Rules before registering.');
      setLoading(false);
      return;
    }

    if (mode !== 'forgot' && password.length < 6) {
      setError(getLabel('validationPasswordLen'));
      setLoading(false);
      return;
    }

    try {
      const endpoint = mode === 'forgot' ? '/api/auth/forgot-password' : mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload = mode === 'forgot'
        ? { email: email.trim().toLowerCase() }
        : mode === 'register'
          ? { email: email.trim().toLowerCase(), password, full_name: username.trim(), privacy_consent: privacyConsent, privacy_version: 'privacy_v1', terms_version: 'terms_v1' }
          : { email: email.trim().toLowerCase(), password };
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || data.message || 'Authentication failed');

      if (mode === 'forgot') {
        setSuccess(getLabel('emailSentDesc'));
      } else {
        if (!data.token || !data.user) throw new Error('The server did not return a valid session.');
        localStorage.setItem('Talaba_token', data.token);
        if (data.user.role === 'admin' || data.user.role === 'staff' || email.trim().toLowerCase() === 'mahdialmuntadhar1@gmail.com') {
          localStorage.setItem('admin_token', data.token);
        } else {
          localStorage.removeItem('admin_token');
        }
        localStorage.setItem('Talaba_auth_user', JSON.stringify(data.user));
        localStorage.setItem('Talaba_user_email', data.user.email || email.trim().toLowerCase());
        setSuccess(mode === 'register' ? getLabel('registerSuccess') : getLabel('loginSuccess'));
        onAuthSuccess(data.user.full_name || data.user.username || username || 'Student', data.user.email || email);
        onClose();
      }
    } catch (authError: any) {
      setError(authError.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="auth-modal-overlay">
        {/* Backdrop glass */}
        <motion.div
          fixed="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#040814]/85 backdrop-blur-md cursor-pointer"
        />

        {/* Modal content body */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-2xl select-none z-10 overflow-hidden text-slate-900"
          id="auth-modal-body"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-100/60 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-100/60 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            id="auth-close-btn"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header icon and branding */}
          <div className="text-center mb-6 mt-1 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#4F46E5] via-[#2563EB] to-[#06B6D4] flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/10 border border-white/10 mb-3 shrink-0">
              <ShieldCheck className="w-6 h-6 text-white drop-shadow-md" />
            </div>
            <h3 className="text-lg font-black text-slate-950 tracking-tight">
              {getLabel(mode)}
            </h3>
            <p className="text-[10px] uppercase font-bold text-blue-700 font-mono tracking-widest mt-1">
              Talaba Portal • بَوّابَتُنا
            </p>
          </div>

          {/* Form Area */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left" id="auth-form">
            
            {/* 1. Name input (only for Register mode) */}
            {mode === 'register' && (
              <div className="flex flex-col gap-1.5" id="auth-field-name">
                <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider flex items-center justify-between">
                  <span>{getLabel('usernameLabel')}</span>
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 cursor-text h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="e.g. Ahmad Al-Mansour"
                    className="w-full text-xs font-bold text-slate-950 bg-white border-2 border-slate-300 placeholder:text-slate-500 hover:border-slate-400 focus:border-blue-600 rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {/* 2. Email Address Input */}
            <div className="flex flex-col gap-1.5" id="auth-field-email">
              <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">
                {getLabel('emailLabel')}
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 cursor-text h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@university.edu.iq"
                  className="w-full text-xs font-bold text-slate-950 bg-white border-2 border-slate-300 placeholder:text-slate-500 hover:border-slate-400 focus:border-blue-600 rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* 3. Password Input (only if not forgot mode) */}
            {mode !== 'forgot' && (
              <div className="flex flex-col gap-1.5" id="auth-field-password">
                <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">
                  {getLabel('passwordLabel')}
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 cursor-text h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs font-bold text-slate-950 bg-white border-2 border-slate-300 placeholder:text-slate-500 hover:border-slate-400 focus:border-blue-600 rounded-xl pl-10 pr-10 py-3 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 p-1 text-slate-600 hover:text-slate-950 rounded cursor-pointer transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}


            {mode === 'register' && (
              <label
                className="flex items-start gap-2 rounded-2xl border border-blue-100 bg-blue-50/80 p-3 text-[10.5px] font-bold leading-relaxed text-slate-700 cursor-pointer"
                id="auth-privacy-consent"
              >
                <input
                  type="checkbox"
                  checked={privacyConsent}
                  onChange={e => setPrivacyConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-400 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  {language === 'ar'
                    ? 'أوافق على إشعار الخصوصية وقواعد المجتمع. أفهم أن المنشورات العامة قد تكون مرئية للمستخدمين، وأن الرسائل الخاصة لا يراجعها المشرفون إلا إذا تم الإبلاغ عنها لأسباب تتعلق بالسلامة.'
                    : language === 'ku'
                      ? 'ڕازیم بە ئاگاداری تایبەتمەندی و یاساکانی کۆمەڵگا. تێدەگەم بابەتە گشتییەکان بۆ بەکارهێنەران دیارن، و نامە تایبەتییەکان لەلایەن بەڕێوەبەرانەوە ناخرێنەوە مەگەر ئەگەر بۆ سەلامەتی ڕاپۆرت کرابن.'
                      : 'I agree to the Privacy Notice and Community Rules. I understand public posts may be visible to users, and private messages are not reviewed by admins unless reported for safety.'}
                </span>
              </label>
            )}
            {/* Options Deck (Remember & forgot link) */}
            {mode === 'login' && (
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mt-1" id="auth-login-options">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-white border-slate-400 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-[10px] selection:bg-transparent">{getLabel('remember')}</span>
                </label>
                <button
                  type="button"
                  onClick={() => { setError(''); setSuccess(''); setMode('forgot'); }}
                  className="text-blue-700 hover:underline hover:text-blue-900 font-extrabold cursor-pointer"
                >
                  {getLabel('forgotLink')}
                </button>
              </div>
            )}

            {/* Response Alerts Success & Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-red-50 text-red-700 text-[11px] font-extrabold p-3 rounded-xl border border-red-200 flex items-start gap-2.5"
                  id="auth-alert-error"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-emerald-50 text-emerald-700 text-[11px] font-extrabold p-3 rounded-xl border border-emerald-200 flex items-start gap-2.5"
                  id="auth-alert-success"
                >
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit CTA action button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-gradient-to-r from-[#4F46E5] via-[#2563EB] to-[#06B6D4] hover:scale-[1.01] active:scale-95 text-xs font-black text-white hover:shadow-glow-cyan/5 border border-white/5 cursor-pointer rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5"
              id="auth-submit-btn"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>{getLabel(mode)}</span>
              )}
            </button>
          </form>

          {/* Bottom Switch modes references */}
          <div className="mt-5 pt-4 border-t border-slate-200 text-center text-xs font-bold text-slate-700" id="auth-modal-switch-mode">
            {mode === 'login' ? (
              <p>
                {getLabel('noAccount')}{' '}
                <button
                  type="button"
                  onClick={() => { setError(''); setSuccess(''); setMode('register'); }}
                  className="text-blue-700 hover:underline hover:text-blue-900 font-black cursor-pointer ml-1"
                >
                  {getLabel('registerNow')}
                </button>
              </p>
            ) : mode === 'register' ? (
              <p>
                {getLabel('haveAccount')}{' '}
                <button
                  type="button"
                  onClick={() => { setError(''); setSuccess(''); setMode('login'); }}
                  className="text-blue-700 hover:underline hover:text-blue-900 font-black cursor-pointer ml-1"
                >
                  {getLabel('loginNow')}
                </button>
              </p>
            ) : (
              <button
                type="button"
                onClick={() => { setError(''); setSuccess(''); setMode('login'); }}
                className="text-blue-700 hover:underline hover:text-blue-900 font-black cursor-pointer flex items-center justify-center gap-1 mx-auto"
              >
                <span>{getLabel('backToLogin')}</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}




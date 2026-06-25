import React, { useState } from 'react';
import { Language } from '../types';
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

type AuthUser = {
  id?: string;
  email?: string;
  full_name?: string;
  fullName?: string;
  username?: string;
  name?: string;
  role?: string;
  is_admin?: boolean | number;
  isAdmin?: boolean;
};

const AUTH_TOKEN_KEYS = ['jamiaati_token', 'talaba_token', 'rafid_token', 'authToken', 'accessToken', 'token'];

function apiUrl(endpoint: string) {
  const base = (BACKEND_URL || '').replace(/\/$/, '');
  return `${base}${endpoint}`;
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function readNested(obj: any, keys: string[]): any {
  if (!obj || typeof obj !== 'object') return null;

  for (const key of keys) {
    if (obj[key]) return obj[key];
  }

  for (const value of Object.values(obj)) {
    if (value && typeof value === 'object') {
      const found = readNested(value, keys);
      if (found) return found;
    }
  }

  return null;
}

function extractToken(data: any): string | null {
  const token = readNested(data, ['token', 'jwt', 'accessToken', 'access_token', 'authToken']);
  return typeof token === 'string' && token.length > 10 ? token : null;
}

function extractUser(data: any, fallbackEmail: string, fallbackName?: string): AuthUser | null {
  const user = readNested(data, ['user', 'profile', 'account']);

  if (user && typeof user === 'object') {
    return {
      ...user,
      email: user.email || fallbackEmail,
      full_name: user.full_name || user.fullName || user.name || user.username || fallbackName || 'Student',
      role: user.role || 'student'
    };
  }

  if (fallbackEmail) {
    return {
      email: fallbackEmail,
      full_name: fallbackName || 'Student',
      role: typeof data?.role === 'string' ? data.role : 'student'
    };
  }

  return null;
}

function isPrivileged(user: AuthUser | null) {
  const role = String(user?.role || '').toLowerCase();
  return role === 'admin' || role === 'staff' || user?.is_admin === true || user?.is_admin === 1 || user?.isAdmin === true;
}

function saveAuthSession(token: string, user: AuthUser, remember: boolean) {
  const storage = remember ? localStorage : sessionStorage;
  const otherStorage = remember ? sessionStorage : localStorage;
  const email = normalizeEmail(user.email || '');
  const safeUser = {
    ...user,
    email,
    role: user.role || 'student'
  };

  for (const key of AUTH_TOKEN_KEYS) {
    storage.setItem(key, token);
    otherStorage.removeItem(key);
  }

  localStorage.setItem('jamiaati_token', token);
  localStorage.setItem('jamiaati_auth_user', JSON.stringify(safeUser));
  localStorage.setItem('jamiaati_user_email', email);
  localStorage.setItem('jamiaati_logged_in', 'true');

  if (isPrivileged(safeUser)) {
    localStorage.setItem('admin_token', token);
  } else {
    localStorage.removeItem('admin_token');
  }

  window.dispatchEvent(new CustomEvent('jamiaati_auth_changed', { detail: { token, user: safeUser } }));
  window.dispatchEvent(new Event('storage'));
}

async function verifySession(token: string, fallbackUser: AuthUser, fallbackEmail: string): Promise<AuthUser> {
  try {
    const response = await fetch(apiUrl('/api/auth/me'), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return fallbackUser;
    }

    const data = await response.json().catch(() => ({}));
    return extractUser(data, fallbackEmail, fallbackUser.full_name || fallbackUser.name || fallbackUser.username) || fallbackUser;
  } catch {
    return fallbackUser;
  }
}

export default function AuthModal({ isOpen, onClose, language, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const t = {
    login: { en: 'Sign In', ar: 'تسجيل الدخول', ku: 'چوونەژوورەوە' },
    register: { en: 'Create Account', ar: 'إنشاء حساب جديد', ku: 'تۆمارکردنی هەژمار' },
    forgot: { en: 'Reset Password', ar: 'استعادة الحساب', ku: 'دۆزینەوەی وشەی تێپەڕ' },
    emailLabel: { en: 'Email', ar: 'البريد الإلكتروني', ku: 'ئیمەیڵ' },
    passwordLabel: { en: 'Password', ar: 'كلمة المرور', ku: 'وشەی تێپەڕ' },
    usernameLabel: { en: 'Full Name', ar: 'الاسم الكامل', ku: 'ناوی تەواو' },
    forgotLink: { en: 'Forgot Password?', ar: 'نسيت كلمة المرور؟', ku: 'وشەی تێپەڕت لەبیرچووە؟' },
    noAccount: { en: "Don't have an account?", ar: 'ليس لديك حساب؟', ku: 'هەژمارت نییە؟' },
    haveAccount: { en: 'Already have an account?', ar: 'لديك حساب بالفعل؟', ku: 'خاوەنی هەژماری؟' },
    registerNow: { en: 'Register Now', ar: 'سجل الآن', ku: 'ئێستا تۆمار بکە' },
    loginNow: { en: 'Login Now', ar: 'سجل دخولك', ku: 'ئێستا بچۆ ژوورەوە' },
    backToLogin: { en: 'Back to Login', ar: 'العودة لتسجيل الدخول', ku: 'گەڕانەوە بۆ چوونەژوورەوە' },
    remember: { en: 'Remember session', ar: 'تذكرني على هذا الجهاز', ku: 'بیرهێنانەوە' },
    validationEmail: { en: 'Please enter a valid email.', ar: 'يرجى إدخال بريد إلكتروني صحيح.', ku: 'تکایە ئیمەیڵێکی دروست بنووسە.' },
    validationPasswordLen: { en: 'Password must be at least 6 characters.', ar: 'كلمة المرور يجب أن لا تقل عن ٦ أحرف.', ku: 'دەبێت وشەی تێپەڕ لانی کەم ٦ پیت بێت.' },
    validationNameEmpty: { en: 'Please enter your name.', ar: 'يرجى كتابة الاسم الكامل.', ku: 'تکایە ناوی خۆت بنووسە.' },
    emailSentDesc: { en: 'Password reset email was sent. Please check inbox and spam.', ar: 'تم إرسال بريد إعادة تعيين كلمة المرور. يرجى فحص البريد الوارد والرسائل غير المرغوبة.', ku: 'ئیمەیڵی نوێکردنەوەی وشەی تێپەڕ نێردرا. تکایە ئینبۆکس و سپام بپشکنە.' },
    registerSuccess: { en: 'Account created and signed in.', ar: 'تم إنشاء الحساب وتسجيل الدخول.', ku: 'هەژمار دروستکرا و چوویتە ژوورەوە.' },
    loginSuccess: { en: 'Signed in successfully.', ar: 'تم تسجيل الدخول بنجاح.', ku: 'بە سەرکەوتوویی چوویتە ژوورەوە.' }
  };

  const getLabel = (key: keyof typeof t) => t[key][language] || t[key].en;

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const cleanEmail = normalizeEmail(email);

    if (!cleanEmail.includes('@')) {
      setError(getLabel('validationEmail'));
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
        ? {
            email: cleanEmail,
            frontend_url: window.location.origin,
            redirect_url: `${window.location.origin}/#/reset-password`
          }
        : mode === 'register'
          ? {
              email: cleanEmail,
              password,
              full_name: username.trim(),
              name: username.trim(),
              username: username.trim(),
              privacy_consent: privacyConsent,
              privacy_version: 'privacy_v1',
              terms_version: 'terms_v1'
            }
          : { email: cleanEmail, password };

      const response = await fetch(apiUrl(endpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Authentication failed');
      }

      if (mode === 'forgot') {
        if (data.emailSent === false || data.sent === false) {
          throw new Error(data.message || 'The reset request was accepted, but the email provider did not send the message. Check Worker email secrets.');
        }
        setSuccess(getLabel('emailSentDesc'));
        return;
      }

      const token = extractToken(data);
      if (!token) {
        throw new Error('The server did not return a real login token. Login was rejected for safety.');
      }

      const baseUser = extractUser(data, cleanEmail, username.trim()) || {
        email: cleanEmail,
        full_name: username.trim() || 'Student',
        role: 'student'
      };
      const verifiedUser = await verifySession(token, baseUser, cleanEmail);
      saveAuthSession(token, verifiedUser, rememberMe);

      const displayName = verifiedUser.full_name || verifiedUser.fullName || verifiedUser.name || verifiedUser.username || username.trim() || 'Student';
      const finalEmail = verifiedUser.email || cleanEmail;

      setSuccess(mode === 'register' ? getLabel('registerSuccess') : getLabel('loginSuccess'));
      onAuthSuccess(displayName, finalEmail);
      setTimeout(() => onClose(), 250);
    } catch (authError: any) {
      setError(authError?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="auth-modal-overlay">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#040814]/85 backdrop-blur-md cursor-pointer"
        />

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

          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            id="auth-close-btn"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6 mt-1 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#4F46E5] via-[#2563EB] to-[#06B6D4] flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/10 border border-white/10 mb-3 shrink-0">
              <ShieldCheck className="w-6 h-6 text-white drop-shadow-md" />
            </div>
            <h3 className="text-lg font-black text-slate-950 tracking-tight">
              {getLabel(mode)}
            </h3>
            <p className="text-[10px] uppercase font-bold text-blue-700 font-mono tracking-widest mt-1">
              Jamiaati Portal • Actual Auth
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left" id="auth-form">
            {mode === 'register' && (
              <div className="flex flex-col gap-1.5" id="auth-field-name">
                <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">
                  {getLabel('usernameLabel')}
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-slate-500" />
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

            <div className="flex flex-col gap-1.5" id="auth-field-email">
              <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">
                {getLabel('emailLabel')}
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-slate-500" />
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

            {mode !== 'forgot' && (
              <div className="flex flex-col gap-1.5" id="auth-field-password">
                <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">
                  {getLabel('passwordLabel')}
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-slate-500" />
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
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <label className="flex items-start gap-2 rounded-2xl border border-blue-100 bg-blue-50/80 p-3 text-[10.5px] font-bold leading-relaxed text-slate-700 cursor-pointer" id="auth-privacy-consent">
                <input
                  type="checkbox"
                  checked={privacyConsent}
                  onChange={e => setPrivacyConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-400 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  {language === 'ar'
                    ? 'أوافق على إشعار الخصوصية وقواعد المجتمع.'
                    : language === 'ku'
                      ? 'ڕازیم بە ئاگاداری تایبەتمەندی و یاساکانی کۆمەڵگا.'
                      : 'I agree to the Privacy Notice and Community Rules.'}
                </span>
              </label>
            )}

            {mode !== 'forgot' && (
              <label className="flex items-center gap-2 text-[11px] font-bold text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-400 text-blue-600 focus:ring-blue-500"
                />
                {getLabel('remember')}
              </label>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 text-red-700 p-3 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 text-xs font-bold">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-blue-700 text-white py-3 text-sm font-black hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (language === 'ar' ? 'جاري المعالجة...' : language === 'ku' ? 'چاوەڕوان بە...' : 'Working...') : getLabel(mode)}
            </button>
          </form>

          <div className="mt-5 flex flex-col items-center gap-2 text-xs font-bold text-slate-600">
            {mode === 'login' && (
              <>
                <button type="button" onClick={() => switchMode('forgot')} className="text-blue-700 hover:text-blue-900">
                  {getLabel('forgotLink')}
                </button>
                <button type="button" onClick={() => switchMode('register')} className="text-slate-700 hover:text-slate-950">
                  {getLabel('noAccount')} <span className="text-blue-700">{getLabel('registerNow')}</span>
                </button>
              </>
            )}

            {mode === 'register' && (
              <button type="button" onClick={() => switchMode('login')} className="text-slate-700 hover:text-slate-950">
                {getLabel('haveAccount')} <span className="text-blue-700">{getLabel('loginNow')}</span>
              </button>
            )}

            {mode === 'forgot' && (
              <button type="button" onClick={() => switchMode('login')} className="text-blue-700 hover:text-blue-900">
                {getLabel('backToLogin')}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

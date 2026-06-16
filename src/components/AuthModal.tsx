import React, { useState } from 'react';
import { Language } from '../types';
import { getTranslation } from '../data/translations';
import { BACKEND_URL } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, ShieldCheck, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onAuthSuccess: (username: string) => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

export default function AuthModal({ isOpen, onClose, language, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Interaction/Validation States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Localized texts
  const t = {
    login: { en: 'Sign In', ar: 'ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„', ku: 'Ú†ÙˆÙˆÙ†Û•Ú˜ÙˆÙˆØ±Û•ÙˆÛ•' },
    register: { en: 'Create Account', ar: 'Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨ Ø¬Ø¯ÙŠØ¯', ku: 'ØªÛ†Ù…Ø§Ø±Ú©Ø±Ø¯Ù†ÛŒ Ù‡Û•Ú˜Ù…Ø§Ø±' },
    forgot: { en: 'Reset Password', ar: 'Ø§Ø³ØªØ¹Ø§Ø¯Ø© Ø§Ù„Ø­Ø³Ø§Ø¨', ku: 'Ø¯Û†Ø²ÛŒÙ†Û•ÙˆÛ•ÛŒ ÙˆØ´Û•ÛŒ ØªÛŽÙ¾Û•Ú•' },
    emailLabel: { en: 'Academic Email', ar: 'Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø§Ù„Ø¬Ø§Ù…Ø¹ÙŠ', ku: 'Ø¦ÛŒÙ…Û•ÛŒÚµÛŒ Ø¦Û•Ú©Ø§Ø¯ÛŒÙ…ÛŒ' },
    passwordLabel: { en: 'Password', ar: 'ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±', ku: 'ÙˆØ´Û•ÛŒ ØªÛŽÙ¾Û•Ú•' },
    usernameLabel: { en: 'Full Name', ar: 'Ø§Ù„Ø§Ø³Ù… Ø§Ù„ÙƒØ§Ù…Ù„', ku: 'Ù†Ø§ÙˆÛŒ ØªÛ•ÙˆØ§Ùˆ' },
    forgotLink: { en: 'Forgot Password?', ar: 'Ù†Ø³ÙŠØª ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±ØŸ', ku: 'ÙˆØ´Û•ÛŒ ØªÛŽÙ¾Û•Ú•Øª Ù„Û•Ø¨ÛŒØ±Ú†ÙˆÙˆÛ•ØŸ' },
    noAccount: { en: "Don't have an account?", ar: 'Ù„ÙŠØ³ Ù„Ø¯ÙŠÙƒ Ø­Ø³Ø§Ø¨ØŸ', ku: 'Ù‡Û•Ú˜Ù…Ø§Ø±Øª Ù†ÛŒÛŒÛ•ØŸ' },
    haveAccount: { en: 'Already have an account?', ar: 'Ù„Ø¯ÙŠÙƒ Ø­Ø³Ø§Ø¨ Ø¨Ø§Ù„ÙØ¹Ù„ØŸ', ku: 'Ø®Ø§ÙˆÛ•Ù†ÛŒ Ù‡Û•Ú˜Ù…Ø§Ø±ÛŒØŸ' },
    registerNow: { en: 'Register Now', ar: 'Ø³Ø¬Ù„ Ø§Ù„Ø¢Ù†', ku: 'Ø¦ÛŽØ³ØªØ§ ØªÛ†Ù…Ø§Ø± Ø¨Ú©Û•' },
    loginNow: { en: 'Login Now', ar: 'Ø³Ø¬Ù„ Ø¯Ø®ÙˆÙ„Ùƒ', ku: 'Ø¦ÛŽØ³ØªØ§ Ø¨Ú†Û† Ú˜ÙˆÙˆØ±Û•ÙˆÛ•' },
    backToLogin: { en: 'Back to Login', ar: 'Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„', ku: 'Ú¯Û•Ú•Ø§Ù†Û•ÙˆÛ• Ø¨Û† Ú†ÙˆÙˆÙ†Û•Ú˜ÙˆÙˆØ±Û•ÙˆÛ•' },
    remember: { en: 'Remember session', ar: 'ØªØ°ÙƒØ±Ù†ÙŠ Ø¹Ù„Ù‰ Ù‡Ø°Ø§ Ø§Ù„Ø¬Ù‡Ø§Ø²', ku: 'Ø¨ÛŒØ±Ù‡ÛŽÙ†Ø§Ù†Û•ÙˆÛ•' },
    validationAcademicEmail: { en: 'Please enter a valid student email.', ar: 'ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ Ø¨Ø±ÙŠØ¯ Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø¬Ø§Ù…Ø¹ÙŠ ØµØ­ÙŠØ­.', ku: 'ØªÚ©Ø§ÛŒÛ• Ø¦ÛŒÙ…Û•ÛŒÚµÛŽÚ©ÛŒ Ø¯Ø±ÙˆØ³Øª Ø¨Ù†ÙˆÙˆØ³Û•.' },
    validationPasswordLen: { en: 'Password must be at least 6 characters.', ar: 'ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± ÙŠØ¬Ø¨ Ø£Ù† Ù„Ø§ ØªÙ‚Ù„ Ø¹Ù† Ù¦ Ø£Ø­Ø±Ù.', ku: 'Ø¯Û•Ø¨ÛŽØª ÙˆØ´Û•ÛŒ ØªÛŽÙ¾Û•Ú• Ù„Ø§Ù†ÛŒ Ú©Û•Ù… Ù¦ Ù¾ÛŒØª Ø¨ÛŽØª.' },
    validationNameEmpty: { en: 'Please enter your name.', ar: 'ÙŠØ±Ø¬Ù‰ ÙƒØªØ§Ø¨Ø© Ø§Ù„Ø§Ø³Ù… Ø§Ù„ÙƒØ§Ù…Ù„.', ku: 'ØªÚ©Ø§ÛŒÛ• Ù†Ø§ÙˆÛŒ Ø®Û†Øª Ø¨Ù†ÙˆÙˆØ³Û•.' },
    emailSentTitle: { en: 'Instruction Sent', ar: 'ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„ØªØ¹Ù„ÙŠÙ…Ø§Øª', ku: 'Ú•ÛŽÙ†Ù…Ø§ÛŒÛŒ Ù†ÛŽØ±Ø¯Ø±Ø§Ù†' },
    emailSentDesc: { en: 'A secure recovery code has been sent to your inbox.', ar: 'ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø±Ù…Ø² Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„ØªØ¹ÙŠÙŠÙ† Ø§Ù„Ø¢Ù…Ù† Ù„Ø¨Ø±ÙŠØ¯Ùƒ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ.', ku: 'Ú©Û†Ø¯ÛŒ Ø³Û•Ø±Ù„Û•Ù†ÙˆÛŽ Ú•ÛŽÚ©Ø®Ø³ØªÙ†Û•ÙˆÛ• Ù†ÛŽØ±Ø¯Ø±Ø§ Ø¨Û† Ø¦ÛŒÙ…Û•ÛŒÚµÛ•Ú©Û•Øª.' },
    registerSuccess: { en: 'Welcome to Jamiaati!', ar: 'Ø£Ù‡Ù„Ø§Ù‹ Ø¨Ùƒ ÙÙŠ Ù…Ù†ØµØ© Ø¬Ø§Ù…Ø¹ØªÙŠ!', ku: 'Ø¨Û•Ø®ÛŽØ±Ø¨ÛŽÛŒØª Ø¨Û† Ø¬Ø§Ù…Û•Ø¹Û•ØªÛŒ!' },
    loginSuccess: { en: 'Welcome back!', ar: 'Ø£Ù‡Ù„Ø§Ù‹ Ø¨Ø¹ÙˆØ¯ØªÙƒ Ù…Ø¬Ø¯Ø¯Ø§Ù‹!', ku: 'Ø¨Û•Ø®ÛŽØ±Ø¨ÛŽÛŒØªÛ•ÙˆÛ•!' }
  };

  const getLabel = (key: keyof typeof t) => {
    return t[key][language] || t[key]['en'];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

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

    if (mode !== 'forgot' && password.length < 6) {
      setError(getLabel('validationPasswordLen'));
      setLoading(false);
      return;
    }

    try {
      if (mode === 'forgot') {
        setSuccess(getLabel('emailSentDesc'));
        setLoading(false);
        return;
      }

      if (mode === 'register') {
        setSuccess(getLabel('registerSuccess'));
        setLoading(false);
        setTimeout(() => {
          onAuthSuccess(username || 'Zara Al-Iraqi');
          onClose();
        }, 900);
        return;
      }

      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.token) {
        throw new Error(data?.error || data?.message || 'Login failed');
      }

      const user = data.user || {};
      const displayName = user.full_name || user.name || email.trim();

      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('jamiaati_token', data.token);
      localStorage.setItem('jamiaati_logged_in', 'true');
      localStorage.setItem('jamiaati_auth_user', JSON.stringify(user));

      setSuccess(getLabel('loginSuccess'));
      setLoading(false);

      setTimeout(() => {
        onAuthSuccess(displayName);
        onClose();
      }, 500);
    } catch (err: any) {
      setError(err?.message || 'Login failed');
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
          className="relative bg-gradient-to-b from-[#121B2E] to-[#0B1020] border border-[#1F2E4D] rounded-3xl p-6 w-full max-w-sm shadow-2xl shadow-cyan-500/5 select-none z-10 overflow-hidden"
          id="auth-modal-body"
        >
          {/* Cyan/indigo ambient glows */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800/40 rounded-xl transition-colors cursor-pointer"
            id="auth-close-btn"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header icon and branding */}
          <div className="text-center mb-6 mt-1 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#4F46E5] via-[#2563EB] to-[#06B6D4] flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/10 border border-white/10 mb-3 shrink-0">
              <ShieldCheck className="w-6 h-6 text-white drop-shadow-md" />
            </div>
            <h3 className="text-lg font-black text-white tracking-tight">
              {getLabel(mode)}
            </h3>
            <p className="text-[10px] uppercase font-bold text-cyan-400 font-mono tracking-widest mt-1">
              Jamiaati Portal â€¢ Ø¨ÙŽÙˆÙ‘Ø§Ø¨ÙŽØªÙÙ†Ø§
            </p>
          </div>

          {/* Form Area */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left" id="auth-form">
            
            {/* 1. Name input (only for Register mode) */}
            {mode === 'register' && (
              <div className="flex flex-col gap-1.5" id="auth-field-name">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-between">
                  <span>{getLabel('usernameLabel')}</span>
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 cursor-text h-4 text-slate-450 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="e.g. Ahmad Al-Mansour"
                    className="w-full text-xs font-bold text-white bg-[#101726]/80 border border-[#1F2E4D] hover:border-slate-600 focus:border-cyan-400/50 rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {/* 2. Email Address Input */}
            <div className="flex flex-col gap-1.5" id="auth-field-email">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                {getLabel('emailLabel')}
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 cursor-text h-4 text-slate-450 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@university.edu.iq"
                  className="w-full text-xs font-bold text-white bg-[#101726]/80 border border-[#1F2E4D] hover:border-slate-600 focus:border-cyan-400/50 rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* 3. Password Input (only if not forgot mode) */}
            {mode !== 'forgot' && (
              <div className="flex flex-col gap-1.5" id="auth-field-password">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  {getLabel('passwordLabel')}
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 cursor-text h-4 text-slate-450 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    className="w-full text-xs font-bold text-white bg-[#101726]/80 border border-[#1F2E4D] hover:border-slate-600 focus:border-cyan-400/50 rounded-xl pl-10 pr-10 py-3 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 p-1 text-slate-450 hover:text-white rounded cursor-pointer transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Options Deck (Remember & forgot link) */}
            {mode === 'login' && (
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mt-1" id="auth-login-options">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#06B6D4] bg-slate-950 border-[#1F2E4D] rounded focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[10px] selection:bg-transparent">{getLabel('remember')}</span>
                </label>
                <button
                  type="button"
                  onClick={() => { setError(''); setSuccess(''); setMode('forgot'); }}
                  className="text-cyan-400 hover:underline hover:text-cyan-300 font-extrabold cursor-pointer"
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
                  className="bg-red-500/10 text-red-400 text-[11px] font-extrabold p-3 rounded-xl border border-red-500/20 flex items-start gap-2.5"
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
                  className="bg-emerald-500/10 text-emerald-400 text-[11px] font-extrabold p-3 rounded-xl border border-emerald-500/20 flex items-start gap-2.5"
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
          <div className="mt-5 pt-4 border-t border-[#1F2E4D] text-center text-xs font-bold text-slate-400" id="auth-modal-switch-mode">
            {mode === 'login' ? (
              <p>
                {getLabel('noAccount')}{' '}
                <button
                  type="button"
                  onClick={() => { setError(''); setSuccess(''); setMode('register'); }}
                  className="text-cyan-400 hover:underline hover:text-cyan-300 font-black cursor-pointer ml-1"
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
                  className="text-cyan-400 hover:underline hover:text-cyan-300 font-black cursor-pointer ml-1"
                >
                  {getLabel('loginNow')}
                </button>
              </p>
            ) : (
              <button
                type="button"
                onClick={() => { setError(''); setSuccess(''); setMode('login'); }}
                className="text-cyan-400 hover:underline hover:text-cyan-300 font-black cursor-pointer flex items-center justify-center gap-1 mx-auto"
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


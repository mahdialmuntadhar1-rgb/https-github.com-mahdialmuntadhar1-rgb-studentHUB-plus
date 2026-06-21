import React, { useState } from 'react';
import { Language } from '../types';
import { socialApi } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserPlus, MessageSquare, Shield, Award, CheckCircle2, Send, Bookmark, School } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  user: {
    id?: string;
    name: string;
    role: string;
    avatar: string;
    university?: string;
    bio?: string;
    major?: string;
  };
  currentUser: {
    id: string;
    name: string;
  } | null;
  isLoggedIn: boolean;
  onTriggerAuth: () => void;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  onOpenDirectChat?: (recipientId: string, recipientName: string) => void;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  language,
  user,
  currentUser,
  isLoggedIn,
  onTriggerAuth,
  showToast,
  onOpenDirectChat
}: UserProfileModalProps) {
  const [friendRequestMsg, setFriendRequestMsg] = useState('');
  const [messageRequestText, setMessageRequestText] = useState('');
  const [activeAction, setActiveAction] = useState<'none' | 'friend_req' | 'msg_req'>('none');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Derive stable dummy ID if not present
  const resolvedUserId = user.id || user.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const isMe = currentUser && (currentUser.id === resolvedUserId || resolvedUserId === 'me' || user.name === currentUser.name);

  // Standard static local Iraqi-styled bios and majors if they are not provided (fallbacks for rich experience)
  const fallbackBio = language === 'ar' 
    ? "طالب شغوف يسعى للتواصل والتجمع الأكاديمي لمساعدة الزملاء وبناء المستقبل 🇮🇶✨"
    : language === 'ku'
    ? "قوتابییەکی چالاک کە هەوڵدەدات بۆ پەیوەندی و یارمەتیدانی هاوڕێیان 🇮🇶✨"
    : "Active university student passionate about tech, networking, and academic collaboration 🇮🇶✨";
    
  const fallbackMajor = language === 'ar'
    ? "جامعة بغداد / كلية هندسة البرمجيات"
    : language === 'ku'
    ? "زانکۆی بەغداد / ئەندازیاری نەرمەکاڵا"
    : "University of Baghdad / Engineering";

  const t = {
    title: { en: 'Student Profile', ar: 'الملف الشخصي للطالب', ku: 'پڕۆفایلی خوێندکار' },
    sendFriend: { en: 'Send Friend Request', ar: 'إرسال طلب صداقة', ku: 'ناردنی داواکاری هاوڕێیەتی' },
    sendMessageReq: { en: 'Send Message Request', ar: 'إرسال طلب مراسلة', ku: 'ناردنی داواکاری نامە' },
    directChat: { en: 'Direct Chat', ar: 'مراسلة مباشرة', ku: 'نامەی ڕاستەوخۆ' },
    youLabel: { en: 'This is you (My Account)', ar: 'هذا أنت (حسابي الشخصي)', ku: 'ئەمە تۆی (هەژماری من)' },
    optionalMsg: { en: 'Add optional greeting message:', ar: 'أضف رسالة ترحيبية اختيارية (اختياري):', ku: 'نامەیەکی کورت بنووسە (ئارەزوومەندانە):' },
    msgBody: { en: 'Type your message request:', ar: 'اكتب نص طلب المراسلة الأولية:', ku: 'نامەی داواکارییەکە لێرە بنووسە:' },
    placeholderFriend: { en: 'Hi! Let\'s connect...', ar: 'مرحباً! دعنا نتواصل كأصدقاء في الكلية...', ku: 'سڵاو! با لە زانکۆ ببین بە هاوڕێ...' },
    placeholderMsg: { en: 'Hello, I wanted to ask about...', ar: 'مرحباً، أود الاستفسار بخصوص الملازم أو المواد التدريبية...', ku: 'سڵاو، دەمویست پرسیار بکەم سەبارەت بە...' },
    submit: { en: 'Submit Request', ar: 'إرسال الطلب الآن', ku: 'ناردنی داواکاری' },
    cancel: { en: 'Cancel', ar: 'إلغاء', ku: 'پاشگەزبوونەوە' },
    guestMsg: { en: 'Sign in to connect and send messages to other students!', ar: 'سجل دخولك لتتمكن من التواصل ومراسلتة زملائك في الجامعة!', ku: 'بچۆ ژوورەوە بۆ ناردنی نامە بۆ قوتابیانی تر!' },
    signInBtn: { en: 'Sign In Now', ar: 'سجل دخولك الآن 🔐', ku: 'ئێستا بچۆ ژوورەوە 🔐' },
    successFriend: { en: 'Friend request sent successfully!', ar: 'تم إرسال طلب الصداقة بنجاح! 🎉', ku: 'داواکاری هاوڕێیەتی بە سەرکەوتوویی نێردرا! 🎉' },
    successMsgReq: { en: 'Message request sent successfully!', ar: 'تم إرسال طلب المراسلة بنجاح! ✉️', ku: 'داواکاری نامە بە سەرکەوتوویی نێردرا! ✉️' },
  };

  const getLabel = (key: keyof typeof t) => {
    return t[key][language] || t[key]['en'];
  };

  const handleFriendRequest = async () => {
    if (!isLoggedIn) {
      onTriggerAuth();
      return;
    }
    setLoading(true);
    try {
      await socialApi.sendFriendRequest(resolvedUserId, friendRequestMsg || undefined, language);
      showToast(getLabel('successFriend'), 'success');
      setActiveAction('none');
      setFriendRequestMsg('');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Error sending friend request', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMessageRequest = async () => {
    if (!isLoggedIn) {
      onTriggerAuth();
      return;
    }
    if (!messageRequestText.trim()) {
      showToast(language === 'ar' ? 'يرجى كتابة نص الرسالة أولاً' : 'Message text is required', 'error');
      return;
    }
    setLoading(true);
    try {
      await socialApi.sendMessageRequest(resolvedUserId, messageRequestText, language);
      showToast(getLabel('successMsgReq'), 'success');
      setActiveAction('none');
      setMessageRequestText('');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Error sending message request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="user-profile-modal-overlay">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#040814]/85 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Main Body */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 360 }}
          className="relative bg-gradient-to-b from-[#121B2E] to-[#0A0E1A] border border-[#1F2E4D] rounded-3xl p-6.5 w-full max-w-sm shadow-2xl overflow-hidden z-10 text-slate-100"
          id="user-profile-modal-body"
        >
          {/* Accent decoration */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-850 rounded-xl transition-colors cursor-pointer z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Profile Details Header */}
          <div className="flex flex-col items-center text-center mt-3 mb-5" id="user-profile-meta-block">
            <div className="relative">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-2xl object-cover border-4 border-[#121B2E] shadow-xl"
              />
              <span className="absolute -bottom-1 -right-1 bg-[#2563EB] text-white p-1 rounded-full border-2 border-[#121B2E] flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-white" />
              </span>
            </div>

            <h3 className="text-base font-black text-white mt-3.5 flex items-center gap-1.5 leading-none">
              {user.name}
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            </h3>

            <span className="text-[10px] uppercase font-black text-cyan-400 bg-cyan-400/10 px-2.5 py-0.5 rounded-lg border border-cyan-400/20 mt-2 inline-block leading-none">
              {user.role ? (user.role === 'student' ? (language === 'ar' ? 'طالب جامعي' : language === 'ku' ? 'خوێندکاری زانکۆ' : 'University Student') : user.role) : 'Student'}
            </span>

            {/* University & Major info */}
            <div className="flex flex-col gap-1 items-center justify-center text-[10px] text-slate-350 font-bold mt-4">
              <span className="flex items-center gap-1.5 text-slate-200">
                <School className="w-3.5 h-3.5 text-yellow-400" />
                {user.university || fallbackMajor}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 font-semibold leading-relaxed mt-4 bg-[#0E1524]/60 p-3 rounded-2xl border border-slate-800/50 w-full max-w-xs text-center">
              {user.bio || fallbackBio}
            </p>
          </div>

          {/* Action Blocks */}
          <div className="mt-5 border-t border-[#1F2E4D] pt-4.5" id="user-profile-actions">
            {!isLoggedIn ? (
              // Logged out warning and trigger Action
              <div className="text-center p-1">
                <p className="text-[11px] text-slate-350 font-bold mb-3.5 leading-normal">
                  {getLabel('guestMsg')}
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onTriggerAuth();
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-[#2563EB] text-slate-100 text-xs font-black rounded-xl cursor-pointer shadow-md hover:scale-[1.01] transition-transform"
                >
                  {getLabel('signInBtn')}
                </button>
              </div>
            ) : isMe ? (
              // This is current logged in user
              <div className="text-center py-2 bg-cyan-500/10 border border-cyan-400/25 rounded-2xl p-3">
                <span className="text-[11px] font-black text-cyan-400 block">
                  ✨ {getLabel('youLabel')}
                </span>
              </div>
            ) : activeAction === 'none' ? (
              // Options selection
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setActiveAction('friend_req')}
                  className="w-full py-2.5 bg-[#1E293B] hover:bg-slate-800 text-xs font-black text-[#FFD21F] border border-[#FFD21F]/20 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <UserPlus className="w-4 h-4 text-[#FFD21F]" />
                  {getLabel('sendFriend')}
                </button>

                <button
                  onClick={() => setActiveAction('msg_req')}
                  className="w-full py-2.5 bg-gradient-to-r from-[#4F46E5] to-[#2563EB] hover:opacity-95 text-xs font-black text-white rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <MessageSquare className="w-4 h-4 text-white" />
                  {getLabel('sendMessageReq')}
                </button>
              </div>
            ) : activeAction === 'friend_req' ? (
              // Send Friend Request Form
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-[#FFD21F] mb-1.5">
                    {getLabel('optionalMsg')}
                  </label>
                  <textarea
                    rows={2}
                    value={friendRequestMsg}
                    onChange={(e) => setFriendRequestMsg(e.target.value)}
                    placeholder={getLabel('placeholderFriend')}
                    className="w-full bg-[#0E1524] border border-[#161B30] text-slate-100 text-xs rounded-xl p-2.5 focus:outline-none focus:border-[#4F46E5] placeholder-slate-450 resize-none font-medium"
                  />
                </div>

                <div className="flex gap-2 text-xs font-black">
                  <button
                    disabled={loading}
                    onClick={() => setActiveAction('none')}
                    className="flex-1 py-2 bg-[#1E293B] text-slate-300 rounded-xl cursor-pointer hover:bg-slate-800 disabled:opacity-50"
                  >
                    {getLabel('cancel')}
                  </button>
                  <button
                    disabled={loading}
                    onClick={handleFriendRequest}
                    className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl cursor-pointer hover:scale-[1.01] transition-transform disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-white" />
                    {loading ? '...' : getLabel('submit')}
                  </button>
                </div>
              </div>
            ) : (
              // Send Message Request Form
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-cyan-400 mb-1.5">
                    {getLabel('msgBody')}
                  </label>
                  <textarea
                    rows={3}
                    value={messageRequestText}
                    onChange={(e) => setMessageRequestText(e.target.value)}
                    placeholder={getLabel('placeholderMsg')}
                    className="w-full bg-[#0E1524] border border-[#161B30] text-slate-100 text-xs rounded-xl p-2.5 focus:outline-none focus:border-[#4F46E5] placeholder-slate-450 resize-none font-medium"
                  />
                </div>

                <div className="flex gap-2 text-xs font-black">
                  <button
                    disabled={loading}
                    onClick={() => setActiveAction('none')}
                    className="flex-1 py-2 bg-[#1E293B] text-slate-300 rounded-xl cursor-pointer hover:bg-slate-800 disabled:opacity-50"
                  >
                    {getLabel('cancel')}
                  </button>
                  <button
                    disabled={loading}
                    onClick={handleMessageRequest}
                    className="flex-1 py-2 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white rounded-xl cursor-pointer hover:scale-[1.01] transition-transform disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-white" />
                    {loading ? '...' : getLabel('submit')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

import React, { useState } from 'react';
import { Language } from '../types';
import { socialApi } from '../lib/api';
import { UserPlus, MessageSquare, Check, Send, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UserActionsProps {
  userId: string;
  userName?: string;
  compact?: boolean;
  language: Language;
  isLoggedIn: boolean;
  onTriggerAuth: () => void;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  currentUserId?: string;
  currentUserName?: string;
}

export default function UserActions({
  userId,
  userName = '',
  compact = false,
  language,
  isLoggedIn,
  onTriggerAuth,
  showToast,
  currentUserId,
  currentUserName
}: UserActionsProps) {
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [messageRequestSent, setMessageRequestSent] = useState(false);
  const [isFriendLoading, setIsFriendLoading] = useState(false);
  const [isMsgLoading, setIsMsgLoading] = useState(false);
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);
  const [messageBody, setMessageBody] = useState('');

  // Normalize / resolve self check
  const resolvedUserId = userId || userName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const isMe = (currentUserId && (currentUserId === resolvedUserId || resolvedUserId === 'me')) ||
               (currentUserName && userName === currentUserName);

  if (isMe) {
    return null;
  }

  const t = {
    addFriend: {
      en: 'Add Friend',
      ar: 'إضافة صديق',
      ku: 'زیادکردنی هاوڕێ'
    },
    requestSent: {
      en: 'Request Sent',
      ar: 'تم إرسال الطلب',
      ku: 'داواکاری نێردرا'
    },
    sendMessage: {
      en: 'Send Message',
      ar: 'إرسال رسالة',
      ku: 'ناردنی نامە'
    },
    messageRequest: {
      en: 'Message Request',
      ar: 'طلب مراسلة',
      ku: 'داواکاری نامە'
    },
    send: {
      en: 'Send',
      ar: 'إرسال',
      ku: 'ناردن'
    },
    cancel: {
      en: 'Cancel',
      ar: 'إلغاء',
      ku: 'پاشگەزبوونەوە'
    },
    placeholder: {
      en: 'Write a short message...',
      ar: 'اكتب رسالة قصيرة...',
      ku: 'نامەیەکی کورت بنووسە...'
    },
    loginRequired: {
      en: 'Please sign in first',
      ar: 'يرجى تسجيل الدخول أولاً',
      ku: 'تکایە سەرەتا بچۆ ژوورەوە'
    },
    successFriend: {
      en: 'Friend request sent!',
      ar: 'تم إرسال طلب الصداقة!',
      ku: 'داواکاری هاوڕێیەتی نێردرا!'
    },
    successMsg: {
      en: 'Message request sent!',
      ar: 'تم إرسال طلب المراسلة بنجاح!',
      ku: 'داواکاری نامە نێردرا!'
    }
  };

  const getLabel = (key: keyof typeof t) => {
    return t[key][language] || t[key]['en'];
  };

  const handleAddFriendClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      showToast(getLabel('loginRequired'), 'error');
      onTriggerAuth();
      return;
    }
    if (friendRequestSent || isFriendLoading) return;

    setIsFriendLoading(true);
    try {
      await socialApi.sendFriendRequest(resolvedUserId, undefined, language);
      setFriendRequestSent(true);
      showToast(getLabel('successFriend'), 'success');
    } catch (err: any) {
      showToast(err.message || 'Error occurred', 'error');
    } finally {
      setIsFriendLoading(false);
    }
  };

  const handleMessageRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      showToast(getLabel('loginRequired'), 'error');
      onTriggerAuth();
      return;
    }
    if (!messageBody.trim()) {
      return;
    }

    setIsMsgLoading(true);
    try {
      await socialApi.sendMessageRequest(resolvedUserId, messageBody, language);
      setMessageRequestSent(true);
      setIsMsgModalOpen(false);
      setMessageBody('');
      showToast(getLabel('successMsg'), 'success');
    } catch (err: any) {
      showToast(err.message || 'Error occurred', 'error');
    } finally {
      setIsMsgLoading(false);
    }
  };

  const openMessageModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      showToast(getLabel('loginRequired'), 'error');
      onTriggerAuth();
      return;
    }
    if (messageRequestSent) return;
    setIsMsgModalOpen(true);
  };

  // Styles
  const btnBase = "rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 select-none cursor-pointer";
  const compactStyle = "text-[10px] px-2.5 py-1.5 shadow-sm";
  const normalStyle = "text-xs px-4 py-2.5 shadow-md w-full";

  return (
    <div className={`flex items-center gap-2 ${compact ? 'flex-row' : 'flex-col w-full'}`} id={`user-actions-${resolvedUserId}`}>
      {/* Friend Request Button */}
      <button
        disabled={isFriendLoading}
        onClick={handleAddFriendClick}
        className={`${btnBase} ${compact ? compactStyle : normalStyle} ${
          friendRequestSent 
            ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30" 
            : "bg-[#FAF5FF] hover:bg-[#F3E8FF] text-[#6B25C9] border border-[#6B25C9]/15 dark:bg-[#1E1B4B] dark:hover:bg-[#1E1B4B]/80 dark:text-purple-300 dark:border-purple-800"
        }`}
        id={`btn-friend-${resolvedUserId}`}
      >
        {friendRequestSent ? (
          <>
            <Check className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-emerald-500`} />
            <span>{getLabel('requestSent')}</span>
          </>
        ) : (
          <>
            <UserPlus className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
            <span>{getLabel('addFriend')}</span>
          </>
        )}
      </button>

      {/* Message Request / Send message Button */}
      <button
        disabled={messageRequestSent}
        onClick={openMessageModal}
        className={`${btnBase} ${compact ? compactStyle : normalStyle} ${
          messageRequestSent
            ? "bg-blue-500/15 text-blue-600 border border-blue-500/30"
            : "bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:opacity-95 text-white"
        }`}
        id={`btn-msg-${resolvedUserId}`}
      >
        {messageRequestSent ? (
          <>
            <Check className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-blue-500`} />
            <span>{getLabel('requestSent')}</span>
          </>
        ) : (
          <>
            <MessageSquare className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
            <span>{getLabel('messageRequest')}</span>
          </>
        )}
      </button>

      {/* Message input Modal */}
      <AnimatePresence>
        {isMsgModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMsgModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
            />

            {/* Dialog Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white dark:bg-[#121B2E] border border-slate-200 dark:border-[#2A3C60] rounded-2.5xl p-5 w-full max-w-sm shadow-xl z-10 text-slate-900 dark:text-slate-100"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-[#2A3C60] pb-3">
                <span className="text-xs font-black tracking-wide text-slate-800 dark:text-slate-200 uppercase flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#2563EB]" />
                  {getLabel('messageRequest')} {userName ? `• ${userName}` : ''}
                </span>
                <button 
                  onClick={() => setIsMsgModalOpen(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer text-slate-400 hover:text-slate-600 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleMessageRequestSubmit} className="flex flex-col gap-4">
                <textarea
                  rows={4}
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder={getLabel('placeholder')}
                  required
                  className="w-full bg-slate-50 dark:bg-[#0E1524] border border-slate-200 dark:border-[#1E293B] hover:border-slate-300 dark:hover:border-[#2A3C60] text-slate-900 dark:text-slate-100 text-xs rounded-xl p-3 focus:outline-none focus:border-[#2563EB] dark:focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 placeholder-slate-400 resize-none font-medium"
                  autoFocus
                />

                <div className="flex gap-2 justify-end text-xs font-black">
                  <button
                    type="button"
                    onClick={() => setIsMsgModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-705 text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer transition-all"
                  >
                    {getLabel('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isMsgLoading || !messageBody.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:opacity-95 text-white rounded-xl cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isMsgLoading ? '...' : getLabel('send')}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

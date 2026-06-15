import React, { useState } from 'react';
import { UserPlus, MessageCircle, Send, X, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Language } from '../types';
import { socialApi } from '../lib/api';

type UserActionsProps = {
  userId?: string | null;
  userName?: string;
  currentUserId?: string | null;
  language: Language;
  compact?: boolean;
  className?: string;
};

function label(language: Language, ar: string, ku: string, en: string) {
  void language;
  void ar;
  void ku;
  return en;
}

export default function UserActions({
  userId,
  userName,
  currentUserId,
  language,
  compact = false,
  className = '',
}: UserActionsProps) {
  const [friendStatus, setFriendStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const [messageStatus, setMessageStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const [loadingAction, setLoadingAction] = useState<'friend' | 'message' | null>(null);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageBody, setMessageBody] = useState('');
  const [error, setError] = useState('');

  if (!userId) return null;
  if (currentUserId && currentUserId === userId) return null;

  const sendFriend = async () => {
    if (loadingAction) return;
    setError('');
    setLoadingAction('friend');

    try {
      await socialApi.sendFriendRequest(
        userId,
        label(language, 'أود إضافتك كصديق.', 'دەمەوێت وەک هاوڕێ زیادت بکەم.', 'I would like to add you as a friend.'),
        language
      );
      setFriendStatus('sent');
    } catch (err: any) {
      setFriendStatus('error');
      setError(err?.message || label(language, 'تعذر إرسال طلب الصداقة.', 'ناتوانرێت داواکاری هاوڕێ نێردرێت.', 'Could not send friend request.'));
    } finally {
      setLoadingAction(null);
    }
  };

  const sendMessage = async () => {
    const cleanBody = messageBody.trim();
    if (!cleanBody || loadingAction) return;

    setError('');
    setLoadingAction('message');

    try {
      await socialApi.sendMessageRequest(userId, cleanBody, language);
      setMessageStatus('sent');
      setShowMessageBox(false);
      setMessageBody('');
    } catch (err: any) {
      setMessageStatus('error');
      setError(err?.message || label(language, 'تعذر إرسال طلب المراسلة.', 'ناتوانرێت داواکاری نامە نێردرێت.', 'Could not send message request.'));
    } finally {
      setLoadingAction(null);
    }
  };

  const buttonBase = compact
    ? 'px-2.5 py-1.5 text-[10px]'
    : 'px-3 py-2 text-xs';

  return (
    <div className={`relative flex flex-wrap items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={sendFriend}
        disabled={loadingAction !== null || friendStatus === 'sent'}
        className={`${buttonBase} inline-flex items-center gap-1.5 rounded-xl border border-[#6B25C9]/25 bg-[#6B25C9]/10 font-black text-[#6B25C9] transition active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed`}
        title={label(language, 'إضافة صديق', 'زیادکردنی هاوڕێ', 'Add Friend')}
      >
        {loadingAction === 'friend' ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : friendStatus === 'sent' ? (
          <CheckCircle className="h-3.5 w-3.5" />
        ) : (
          <UserPlus className="h-3.5 w-3.5" />
        )}
        <span>
          {friendStatus === 'sent'
            ? label(language, 'تم إرسال الطلب', 'داواکاری نێردرا', 'Request Sent')
            : label(language, 'إضافة صديق', 'زیادکردنی هاوڕێ', 'Add Friend')}
        </span>
      </button>

      <button
        type="button"
        onClick={() => {
          setError('');
          setShowMessageBox(true);
        }}
        disabled={loadingAction !== null || messageStatus === 'sent'}
        className={`${buttonBase} inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 font-black text-emerald-700 transition active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed`}
        title={label(language, 'طلب مراسلة', 'داواکاری نامە', 'Message Request')}
      >
        {messageStatus === 'sent' ? (
          <CheckCircle className="h-3.5 w-3.5" />
        ) : (
          <MessageCircle className="h-3.5 w-3.5" />
        )}
        <span>
          {messageStatus === 'sent'
            ? label(language, 'تم إرسال الرسالة', 'نامە نێردرا', 'Message Sent')
            : label(language, 'طلب مراسلة', 'داواکاری نامە', 'Message Request')}
        </span>
      </button>

      {showMessageBox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#E6E1F5] bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-[#161A33]">
                  {label(language, 'طلب مراسلة', 'داواکاری نامە', 'Message Request')}
                </h3>
                {userName && (
                  <p className="mt-1 text-xs font-bold text-slate-500">{userName}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowMessageBox(false)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <textarea
              value={messageBody}
              onChange={(event) => setMessageBody(event.target.value)}
              rows={4}
              maxLength={500}
              className="w-full resize-none rounded-xl border border-[#E6E1F5] bg-[#F8FAFF] p-3 text-sm font-semibold text-[#161A33] outline-none focus:border-[#6B25C9]"
              placeholder={label(language, 'اكتب رسالة قصيرة...', 'نامەیەکی کورت بنووسە...', 'Write a short message...')}
            />

            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowMessageBox(false)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-600"
              >
                {label(language, 'إلغاء', 'پاشگەزبوونەوە', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={sendMessage}
                disabled={!messageBody.trim() || loadingAction === 'message'}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#6B25C9] px-3 py-2 text-xs font-black text-white disabled:opacity-60"
              >
                {loadingAction === 'message' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                {label(language, 'إرسال', 'ناردن', 'Send')}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex w-full items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-2.5 py-1.5 text-[10px] font-bold text-red-700">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}


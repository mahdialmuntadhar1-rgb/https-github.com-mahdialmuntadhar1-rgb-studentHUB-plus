import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Inbox, Loader2, MessageCircle, RefreshCw, Send, UserCircle } from 'lucide-react';
import { DirectMessage, MessageThread, socialApi } from '../lib/api';
import { Language } from '../types';

type MessagesInboxProps = {
  language: Language;
  isLoggedIn: boolean;
  currentUserId?: string | null;
  onTriggerAuth: () => void;
  onBack: () => void;
  showToast?: (text: string, type?: 'success' | 'error' | 'info', icon?: string) => void;
};

function label(language: Language, ar: string, ku: string, en: string) {
  return language === 'ar' ? ar : language === 'ku' ? ku : en;
}

function getOtherName(thread: MessageThread, currentUserId?: string | null) {
  if (thread.other_name) return thread.other_name;
  if (currentUserId && thread.requester_id === currentUserId) {
    return thread.recipient_name || thread.recipient_email || 'User';
  }
  if (currentUserId && thread.recipient_id === currentUserId) {
    return thread.requester_name || thread.requester_email || 'User';
  }
  return thread.recipient_name || thread.requester_name || thread.other_email || 'User';
}

function formatTime(value?: string | null) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function MessagesInbox({
  language,
  isLoggedIn,
  currentUserId,
  onTriggerAuth,
  onBack,
  showToast,
}: MessagesInboxProps) {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const selectedThreadName = useMemo(
    () => selectedThread ? getOtherName(selectedThread, currentUserId) : '',
    [selectedThread, currentUserId]
  );

  const notify = (text: string, type: 'success' | 'error' | 'info' = 'success', icon?: string) => {
    if (showToast) showToast(text, type, icon);
  };

  const loadThreads = async () => {
    if (!isLoggedIn) return;
    setLoadingThreads(true);
    setError('');

    try {
      const data = await socialApi.getMessageThreads(language);
      const nextThreads = Array.isArray(data?.threads) ? data.threads : [];
      setThreads(nextThreads);

      if (selectedThread) {
        const freshSelected = nextThreads.find(thread => thread.id === selectedThread.id) || null;
        setSelectedThread(freshSelected);
      }
    } catch (err: any) {
      const msg = err?.message || label(language, 'تعذر تحميل الرسائل.', 'ناتوانرێت نامەکان باربکرێن.', 'Could not load messages.');
      setError(msg);
    } finally {
      setLoadingThreads(false);
    }
  };

  const openThread = async (thread: MessageThread) => {
    setSelectedThread(thread);
    setMessages([]);
    setLoadingMessages(true);
    setError('');

    try {
      const data = await socialApi.getThreadMessages(thread.id, language);
      setMessages(Array.isArray(data?.messages) ? data.messages : []);
      if (data?.thread) setSelectedThread(data.thread);
    } catch (err: any) {
      const msg = err?.message || label(language, 'تعذر فتح المحادثة.', 'ناتوانرێت گفتوگۆکە بکرێتەوە.', 'Could not open conversation.');
      setError(msg);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    const cleanDraft = draft.trim();
    if (!selectedThread || !cleanDraft || sending) return;

    setSending(true);
    setError('');

    try {
      await socialApi.sendThreadMessage(selectedThread.id, cleanDraft, language);
      setDraft('');
      notify(label(language, 'تم إرسال الرسالة.', 'نامەکە نێردرا.', 'Message sent.'), 'success', '✅');
      await openThread(selectedThread);
      await loadThreads();
    } catch (err: any) {
      const msg = err?.message || label(language, 'تعذر إرسال الرسالة.', 'ناتوانرێت نامەکە بنێردرێت.', 'Could not send message.');
      setError(msg);
      notify(msg, 'error', '⚠️');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    void loadThreads();
  }, [isLoggedIn, language]);

  if (!isLoggedIn) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto flex flex-col pb-28 bg-[#0B1020] min-h-screen">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex w-fit items-center gap-2 rounded-xl border border-[#1F2E4D] bg-[#121B2E] px-3 py-2 text-xs font-black text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          {label(language, 'رجوع', 'گەڕانەوە', 'Back')}
        </button>

        <div className="rounded-3xl border border-[#1F2E4D] bg-[#121B2E] p-5 text-center shadow-lg">
          <MessageCircle className="mx-auto mb-3 h-10 w-10 text-cyan-300" />
          <h2 className="text-lg font-black text-white">
            {label(language, 'الرسائل', 'نامەکان', 'Messages')}
          </h2>
          <p className="mt-2 text-xs font-bold leading-relaxed text-slate-400">
            {label(language, 'قم بتسجيل الدخول لمشاهدة الرسائل.', 'بچۆ ژوورەوە بۆ بینینی نامەکان.', 'Log in to see messages.')}
          </p>
          <button
            type="button"
            onClick={onTriggerAuth}
            className="mt-4 rounded-2xl bg-[#FFD21F] px-4 py-2 text-xs font-black text-[#161A33]"
          >
            {label(language, 'تسجيل الدخول', 'چوونەژوورەوە', 'Log in')}
          </button>
        </div>
      </div>
    );
  }

  if (selectedThread) {
    return (
      <div className="px-4 py-4 max-w-lg mx-auto flex flex-col pb-28 bg-[#0B1020] min-h-screen" id="messages-thread-view">
        <div className="sticky top-0 z-20 -mx-4 mb-4 border-b border-[#1F2E4D] bg-[#0B1020]/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedThread(null);
                setMessages([]);
              }}
              className="rounded-xl border border-[#1F2E4D] bg-[#121B2E] p-2 text-slate-200"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#6B25C9]/25 text-cyan-200">
              <UserCircle className="h-6 w-6" />
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-sm font-black text-white">{selectedThreadName}</h1>
              <p className="text-[10px] font-bold text-slate-500">
                {label(language, 'محادثة مقبولة', 'گفتوگۆی قبوڵکراو', 'Accepted conversation')}
              </p>
            </div>

            <button
              type="button"
              onClick={() => openThread(selectedThread)}
              disabled={loadingMessages}
              className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-2 text-cyan-200 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loadingMessages ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-950/30 px-3 py-2 text-xs font-bold text-red-200">
            {error}
          </div>
        )}

        {loadingMessages ? (
          <div className="rounded-3xl border border-[#1F2E4D] bg-[#121B2E] p-5 text-center text-sm font-black text-slate-300">
            <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-cyan-300" />
            {label(language, 'جاري تحميل المحادثة...', 'گفتوگۆکە بار دەکرێت...', 'Loading conversation...')}
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-2">
            {messages.length === 0 ? (
              <div className="rounded-3xl border border-[#1F2E4D] bg-[#121B2E] p-5 text-center">
                <Inbox className="mx-auto mb-3 h-9 w-9 text-slate-500" />
                <p className="text-sm font-black text-slate-200">
                  {label(language, 'لا توجد رسائل بعد', 'هێشتا هیچ نامەیەک نییە', 'No messages yet')}
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const mine = currentUserId && message.sender_id === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-3 py-2 text-xs font-semibold leading-relaxed ${
                        mine
                          ? 'bg-[#6B25C9] text-white'
                          : 'border border-[#1F2E4D] bg-[#121B2E] text-slate-200'
                      }`}
                    >
                      {!mine && message.sender_name && (
                        <p className="mb-1 text-[10px] font-black text-cyan-300">{message.sender_name}</p>
                      )}
                      <p className="whitespace-pre-line break-words">{message.body}</p>
                      <p className={`mt-1 text-[9px] ${mine ? 'text-white/60' : 'text-slate-500'}`}>
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        <div className="fixed bottom-[82px] left-1/2 z-30 w-full max-w-md -translate-x-1/2 border-t border-[#1F2E4D] bg-[#0B1020]/95 px-4 py-3 backdrop-blur">
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={1}
              maxLength={1000}
              className="max-h-28 min-h-[42px] flex-1 resize-none rounded-2xl border border-[#1F2E4D] bg-[#121B2E] px-3 py-2 text-sm font-semibold text-white outline-none placeholder:text-slate-600 focus:border-[#6B25C9]"
              placeholder={label(language, 'اكتب رسالة...', 'نامەیەک بنووسە...', 'Write a message...')}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!draft.trim() || sending}
              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-2xl bg-[#FFD21F] text-[#161A33] disabled:opacity-60"
            >
              {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const empty = !loadingThreads && threads.length === 0;

  return (
    <div className="px-4 py-4 max-w-lg mx-auto flex flex-col pb-28 bg-[#0B1020] min-h-screen" id="messages-inbox-view">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-[#1F2E4D] bg-[#121B2E] px-3 py-2 text-xs font-black text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          {label(language, 'رجوع', 'گەڕانەوە', 'Back')}
        </button>

        <button
          type="button"
          onClick={loadThreads}
          disabled={loadingThreads}
          className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-black text-cyan-200 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loadingThreads ? 'animate-spin' : ''}`} />
          {label(language, 'تحديث', 'نوێکردنەوە', 'Refresh')}
        </button>
      </div>

      <div className="mb-4 rounded-3xl border border-[#1F2E4D] bg-[#121B2E] p-5 shadow-lg">
        <h1 className="text-xl font-black text-white">
          {label(language, 'الرسائل', 'نامەکان', 'Messages')}
        </h1>
        <p className="mt-1 text-xs font-bold text-slate-400">
          {label(language, 'المحادثات المقبولة تظهر هنا.', 'گفتوگۆ قبوڵکراوەکان لێرە دەردەکەون.', 'Accepted conversations appear here.')}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-950/30 px-3 py-2 text-xs font-bold text-red-200">
          {error}
        </div>
      )}

      {loadingThreads && (
        <div className="rounded-3xl border border-[#1F2E4D] bg-[#121B2E] p-5 text-center text-sm font-black text-slate-300">
          <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-cyan-300" />
          {label(language, 'جاري تحميل الرسائل...', 'نامەکان بار دەکرێن...', 'Loading messages...')}
        </div>
      )}

      {empty && (
        <div className="rounded-3xl border border-[#1F2E4D] bg-[#121B2E] p-5 text-center">
          <Inbox className="mx-auto mb-3 h-9 w-9 text-slate-500" />
          <p className="text-sm font-black text-slate-200">
            {label(language, 'لا توجد محادثات بعد', 'هێشتا گفتوگۆ نییە', 'No conversations yet')}
          </p>
          <p className="mt-2 text-xs font-bold text-slate-500">
            {label(language, 'اقبل طلب مراسلة أولاً من صفحة الطلبات.', 'سەرەتا داواکاری نامەیەک لە پەڕەی داواکارییەکان قبوڵ بکە.', 'Accept a message request first from the Requests page.')}
          </p>
        </div>
      )}

      {!loadingThreads && threads.length > 0 && (
        <div className="flex flex-col gap-2">
          {threads.map((thread) => (
            <button
              key={thread.id}
              type="button"
              onClick={() => openThread(thread)}
              className="w-full rounded-2xl border border-[#1F2E4D] bg-[#121B2E] p-3 text-left transition hover:border-cyan-500/40"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#6B25C9]/20 text-cyan-200">
                  <UserCircle className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-black text-white">
                      {getOtherName(thread, currentUserId)}
                    </p>
                    <span className="shrink-0 text-[9px] font-bold text-slate-500">
                      {formatTime(thread.last_message_at || thread.updated_at || thread.created_at)}
                    </span>
                  </div>

                  <p className="mt-1 truncate text-xs font-bold text-slate-500">
                    {thread.last_message || label(language, 'افتح المحادثة', 'گفتوگۆکە بکەرەوە', 'Open conversation')}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

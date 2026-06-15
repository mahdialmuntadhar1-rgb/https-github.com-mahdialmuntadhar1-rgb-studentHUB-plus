import React, { useEffect, useState } from 'react';
import { UserPlus, MessageCircle, CheckCircle, XCircle, Loader2, RefreshCw, Inbox, ArrowLeft } from 'lucide-react';
import { Language } from '../types';
import { FriendRequest, MessageThread, socialApi } from '../lib/api';

type RequestsCenterProps = {
  language: Language;
  isLoggedIn: boolean;
  onTriggerAuth: () => void;
  onBack: () => void;
  showToast?: (text: string, type?: 'success' | 'error' | 'info', icon?: string) => void;
};

function label(language: Language, ar: string, ku: string, en: string) {
  return language === 'ar' ? ar : language === 'ku' ? ku : en;
}

function displayName(row: any, fallback: string) {
  return row?.requester_name || row?.recipient_name || row?.other_name || row?.requester_email || row?.recipient_email || row?.other_email || fallback;
}

export default function RequestsCenter({
  language,
  isLoggedIn,
  onTriggerAuth,
  onBack,
  showToast,
}: RequestsCenterProps) {
  const [friendIncoming, setFriendIncoming] = useState<FriendRequest[]>([]);
  const [friendOutgoing, setFriendOutgoing] = useState<FriendRequest[]>([]);
  const [messageIncoming, setMessageIncoming] = useState<MessageThread[]>([]);
  const [messageOutgoing, setMessageOutgoing] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState('');
  const [error, setError] = useState('');

  const notify = (text: string, type: 'success' | 'error' | 'info' = 'success', icon?: string) => {
    if (showToast) showToast(text, type, icon);
  };

  const loadRequests = async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    setError('');

    try {
      const [friendData, messageData] = await Promise.all([
        socialApi.getFriendRequests(language),
        socialApi.getMessageRequests(language),
      ]);

      setFriendIncoming(Array.isArray(friendData?.incoming) ? friendData.incoming : []);
      setFriendOutgoing(Array.isArray(friendData?.outgoing) ? friendData.outgoing : []);
      setMessageIncoming(Array.isArray(messageData?.incoming) ? messageData.incoming : []);
      setMessageOutgoing(Array.isArray(messageData?.outgoing) ? messageData.outgoing : []);
    } catch (err: any) {
      setError(err?.message || label(language, 'تعذر تحميل الطلبات.', 'ناتوانرێت داواکارییەکان باربکرێن.', 'Could not load requests.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, [isLoggedIn, language]);

  const runAction = async (id: string, action: () => Promise<any>, successText: string) => {
    if (!id || actionId) return;

    setActionId(id);
    setError('');

    try {
      await action();
      notify(successText, 'success', '✅');
      await loadRequests();
    } catch (err: any) {
      const msg = err?.message || label(language, 'تعذر تنفيذ العملية.', 'کردارەکە سەرکەوتوو نەبوو.', 'Action failed.');
      setError(msg);
      notify(msg, 'error', '⚠️');
    } finally {
      setActionId('');
    }
  };

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
          <Inbox className="mx-auto mb-3 h-10 w-10 text-cyan-300" />
          <h2 className="text-lg font-black text-white">
            {label(language, 'الطلبات', 'داواکارییەکان', 'Requests')}
          </h2>
          <p className="mt-2 text-xs font-bold leading-relaxed text-slate-400">
            {label(language, 'قم بتسجيل الدخول لمشاهدة طلبات الصداقة والمراسلة.', 'بچۆ ژوورەوە بۆ بینینی داواکاری هاوڕێ و نامە.', 'Log in to see friend and message requests.')}
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

  const empty = !loading && friendIncoming.length === 0 && friendOutgoing.length === 0 && messageIncoming.length === 0 && messageOutgoing.length === 0;

  return (
    <div className="px-4 py-4 max-w-lg mx-auto flex flex-col pb-28 bg-[#0B1020] min-h-screen" id="requests-center-view">
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
          onClick={loadRequests}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-black text-cyan-200 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {label(language, 'تحديث', 'نوێکردنەوە', 'Refresh')}
        </button>
      </div>

      <div className="mb-4 rounded-3xl border border-[#1F2E4D] bg-[#121B2E] p-5 shadow-lg">
        <h1 className="text-xl font-black text-white">
          {label(language, 'الطلبات', 'داواکارییەکان', 'Requests')}
        </h1>
        <p className="mt-1 text-xs font-bold text-slate-400">
          {label(language, 'إدارة طلبات الصداقة والمراسلة.', 'بەڕێوەبردنی داواکاری هاوڕێ و نامە.', 'Manage friend and message requests.')}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-950/30 px-3 py-2 text-xs font-bold text-red-200">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-3xl border border-[#1F2E4D] bg-[#121B2E] p-5 text-center text-sm font-black text-slate-300">
          <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-cyan-300" />
          {label(language, 'جاري تحميل الطلبات...', 'داواکارییەکان بار دەکرێن...', 'Loading requests...')}
        </div>
      )}

      {empty && (
        <div className="rounded-3xl border border-[#1F2E4D] bg-[#121B2E] p-5 text-center">
          <Inbox className="mx-auto mb-3 h-9 w-9 text-slate-500" />
          <p className="text-sm font-black text-slate-200">
            {label(language, 'لا توجد طلبات حالياً', 'ئێستا هیچ داواکارییەک نییە', 'No requests right now')}
          </p>
        </div>
      )}

      {!loading && !empty && (
        <div className="flex flex-col gap-4">
          <RequestSection
            title={label(language, 'طلبات الصداقة الواردة', 'داواکاری هاوڕێی هاتوو', 'Incoming friend requests')}
            icon={<UserPlus className="h-4 w-4" />}
            items={friendIncoming}
            emptyText={label(language, 'لا توجد طلبات صداقة واردة', 'هیچ داواکاری هاوڕێی هاتوو نییە', 'No incoming friend requests')}
            renderItem={(item) => (
              <RequestCard
                key={item.id}
                title={displayName(item, label(language, 'مستخدم', 'بەکارهێنەر', 'User'))}
                subtitle={item.message || item.requester_email || ''}
                loading={actionId === item.id}
                primaryLabel={label(language, 'قبول', 'قبوڵکردن', 'Accept')}
                secondaryLabel={label(language, 'رفض', 'ڕەتکردنەوە', 'Decline')}
                onPrimary={() => runAction(item.id, () => socialApi.acceptFriendRequest(item.id, language), label(language, 'تم قبول طلب الصداقة.', 'داواکاری هاوڕێ قبوڵکرا.', 'Friend request accepted.'))}
                onSecondary={() => runAction(item.id, () => socialApi.declineFriendRequest(item.id, language), label(language, 'تم رفض طلب الصداقة.', 'داواکاری هاوڕێ ڕەتکرایەوە.', 'Friend request declined.'))}
              />
            )}
          />

          <RequestSection
            title={label(language, 'طلبات الصداقة المرسلة', 'داواکاری هاوڕێی نێردراو', 'Outgoing friend requests')}
            icon={<UserPlus className="h-4 w-4" />}
            items={friendOutgoing}
            emptyText={label(language, 'لا توجد طلبات صداقة مرسلة', 'هیچ داواکاری هاوڕێی نێردراو نییە', 'No outgoing friend requests')}
            renderItem={(item) => (
              <RequestCard
                key={item.id}
                title={displayName(item, label(language, 'مستخدم', 'بەکارهێنەر', 'User'))}
                subtitle={item.message || item.recipient_email || ''}
                loading={actionId === item.id}
                primaryLabel={label(language, 'إلغاء', 'هەڵوەشاندنەوە', 'Cancel')}
                onPrimary={() => runAction(item.id, () => socialApi.cancelFriendRequest(item.id, language), label(language, 'تم إلغاء طلب الصداقة.', 'داواکاری هاوڕێ هەڵوەشێندرایەوە.', 'Friend request cancelled.'))}
              />
            )}
          />

          <RequestSection
            title={label(language, 'طلبات المراسلة الواردة', 'داواکاری نامەی هاتوو', 'Incoming message requests')}
            icon={<MessageCircle className="h-4 w-4" />}
            items={messageIncoming}
            emptyText={label(language, 'لا توجد طلبات مراسلة واردة', 'هیچ داواکاری نامەی هاتوو نییە', 'No incoming message requests')}
            renderItem={(item) => (
              <RequestCard
                key={item.id}
                title={displayName(item, label(language, 'مستخدم', 'بەکارهێنەر', 'User'))}
                subtitle={item.requester_email || item.last_message_at || ''}
                loading={actionId === item.id}
                primaryLabel={label(language, 'قبول', 'قبوڵکردن', 'Accept')}
                secondaryLabel={label(language, 'رفض', 'ڕەتکردنەوە', 'Decline')}
                onPrimary={() => runAction(item.id, () => socialApi.acceptMessageRequest(item.id, language), label(language, 'تم قبول طلب المراسلة.', 'داواکاری نامە قبوڵکرا.', 'Message request accepted.'))}
                onSecondary={() => runAction(item.id, () => socialApi.declineMessageRequest(item.id, language), label(language, 'تم رفض طلب المراسلة.', 'داواکاری نامە ڕەتکرایەوە.', 'Message request declined.'))}
              />
            )}
          />

          <RequestSection
            title={label(language, 'طلبات المراسلة المرسلة', 'داواکاری نامەی نێردراو', 'Outgoing message requests')}
            icon={<MessageCircle className="h-4 w-4" />}
            items={messageOutgoing}
            emptyText={label(language, 'لا توجد طلبات مراسلة مرسلة', 'هیچ داواکاری نامەی نێردراو نییە', 'No outgoing message requests')}
            renderItem={(item) => (
              <RequestCard
                key={item.id}
                title={displayName(item, label(language, 'مستخدم', 'بەکارهێنەر', 'User'))}
                subtitle={item.recipient_email || item.last_message_at || ''}
                loading={false}
                statusLabel={label(language, 'بانتظار القبول', 'چاوەڕێی قبوڵکردنە', 'Waiting for acceptance')}
              />
            )}
          />
        </div>
      )}
    </div>
  );
}

function RequestSection<T>({
  title,
  icon,
  items,
  emptyText,
  renderItem,
}: {
  title: string;
  icon: React.ReactNode;
  items: T[];
  emptyText: string;
  renderItem: (item: T) => React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-[#1F2E4D] bg-[#121B2E] p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
        <span className="rounded-xl bg-cyan-500/10 p-2 text-cyan-300">{icon}</span>
        <span>{title}</span>
        <span className="ms-auto rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">{items.length}</span>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-[#1F2E4D] bg-[#0B1020] px-3 py-3 text-xs font-bold text-slate-500">
          {emptyText}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map(renderItem)}
        </div>
      )}
    </section>
  );
}

function RequestCard({
  title,
  subtitle,
  loading,
  primaryLabel,
  secondaryLabel,
  statusLabel,
  onPrimary,
  onSecondary,
}: {
  title: string;
  subtitle?: string;
  loading: boolean;
  primaryLabel?: string;
  secondaryLabel?: string;
  statusLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[#1F2E4D] bg-[#0B1020] p-3">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6B25C9]/20 text-sm font-black text-cyan-200">
          {String(title || '?').slice(0, 1).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-white">{title}</p>
          {subtitle && <p className="mt-1 line-clamp-2 text-[11px] font-bold text-slate-400">{subtitle}</p>}

          <div className="mt-3 flex flex-wrap gap-2">
            {statusLabel && (
              <span className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[10px] font-black text-amber-200">
                {statusLabel}
              </span>
            )}

            {onPrimary && (
              <button
                type="button"
                onClick={onPrimary}
                disabled={loading}
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-2.5 py-1.5 text-[10px] font-black text-white disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                {primaryLabel}
              </button>
            )}

            {onSecondary && (
              <button
                type="button"
                onClick={onSecondary}
                disabled={loading}
                className="inline-flex items-center gap-1 rounded-xl bg-red-500/90 px-2.5 py-1.5 text-[10px] font-black text-white disabled:opacity-60"
              >
                <XCircle className="h-3 w-3" />
                {secondaryLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

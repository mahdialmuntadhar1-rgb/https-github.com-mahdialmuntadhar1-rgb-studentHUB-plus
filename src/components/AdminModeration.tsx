import React, { useEffect, useState } from 'react';
import { Language } from '../types';
import { socialApi } from '../lib/api';
import { ShieldAlert, RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface AdminModerationProps {
  language: Language;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export default function AdminModeration({ language, showToast }: AdminModerationProps) {
  const [reports, setReports] = useState<any[]>([]);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(false);

  const label = {
    title: language === 'ar' ? 'مراجعة البلاغات' : language === 'ku' ? 'پێداچوونەوەی ڕاپۆرتەکان' : 'Moderation Queue',
    subtitle: language === 'ar'
      ? 'هنا تظهر الرسائل الخاصة التي أبلغ عنها المستخدمون فقط. لا يمكن للمشرف تصفح المحادثات الخاصة.'
      : language === 'ku'
        ? 'تەنها ئەو نامە تایبەتیانەی ڕاپۆرت کراون لێرە دەردەکەون. بەڕێوەبەر ناتوانێت چاتی تایبەتی بگەڕێت.'
        : 'Only user-reported private message snapshots appear here. Admins cannot browse private chats.',
    refresh: language === 'ar' ? 'تحديث' : language === 'ku' ? 'نوێکردنەوە' : 'Refresh',
    pending: language === 'ar' ? 'قيد المراجعة' : language === 'ku' ? 'چاوەڕوانی پێداچوونەوە' : 'Pending',
    reviewed: language === 'ar' ? 'تمت المراجعة' : language === 'ku' ? 'پێداچوونەوە کرا' : 'Reviewed',
    dismissed: language === 'ar' ? 'رفض البلاغ' : language === 'ku' ? 'ڕاپۆرت ڕەتکرایەوە' : 'Dismissed',
    action: language === 'ar' ? 'إجراء' : language === 'ku' ? 'کردار' : 'Action Taken',
    empty: language === 'ar' ? 'لا توجد بلاغات حالياً.' : language === 'ku' ? 'هیچ ڕاپۆرتێک نییە.' : 'No reports right now.'
  };

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await socialApi.getMessageReports(status, language);
      setReports(Array.isArray(data?.reports) ? data.reports : []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load moderation reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [status, language]);

  const updateReport = async (reportId: string, nextStatus: string) => {
    try {
      await socialApi.updateMessageReport(reportId, nextStatus, `Updated from moderation queue to ${nextStatus}`, language);
      showToast(language === 'ar' ? 'تم تحديث البلاغ.' : 'Report updated.', 'success');
      loadReports();
    } catch (err: any) {
      showToast(err.message || 'Failed to update report', 'error');
    }
  };

  const parseSnapshot = (raw: string) => {
    try {
      return JSON.parse(raw || '{}');
    } catch {
      return {};
    }
  };

  return (
    <div className="mx-4 mb-24 mt-4 rounded-3xl border border-red-100 bg-white shadow-lg overflow-hidden" id="admin-moderation-queue">
      <div className="p-4 bg-gradient-to-r from-red-50 via-orange-50 to-white border-b border-red-100">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-600" />
          <h2 className="text-sm font-black text-slate-900">{label.title}</h2>
        </div>
        <p className="text-[11px] font-semibold text-slate-600 leading-relaxed mt-2">
          {label.subtitle}
        </p>
      </div>

      <div className="p-3 flex items-center gap-2 border-b border-slate-100">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800"
        >
          <option value="pending">{label.pending}</option>
          <option value="reviewed">{label.reviewed}</option>
          <option value="dismissed">{label.dismissed}</option>
          <option value="action_taken">{label.action}</option>
          <option value="all">All</option>
        </select>
        <button
          onClick={loadReports}
          disabled={loading}
          className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-black text-white flex items-center gap-1"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {label.refresh}
        </button>
      </div>

      <div className="p-3 space-y-3">
        {reports.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">
            <AlertTriangle className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-500">{label.empty}</p>
          </div>
        ) : (
          reports.map((report) => {
            const snapshot = parseSnapshot(report.reported_message_snapshot);
            return (
              <div key={report.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-black uppercase text-red-600">{report.reason || 'safety'}</p>
                    <p className="text-xs font-bold text-slate-900 mt-1">
                      {report.reporter_name || 'Reporter'} → {report.reported_user_name || 'Reported user'}
                    </p>
                  </div>
                  <span className="rounded-full bg-white border border-slate-200 px-2 py-1 text-[9px] font-black text-slate-500">
                    {report.status}
                  </span>
                </div>

                <div className="mt-3 rounded-xl bg-white border border-slate-200 p-3">
                  <p className="text-[10px] font-black text-slate-500 mb-1">Reported message snapshot</p>
                  <p className="text-xs font-semibold text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {snapshot.body || '[No message text]'}
                  </p>
                </div>

                {report.note && (
                  <p className="mt-2 text-[11px] text-slate-600 font-semibold">
                    Note: {report.note}
                  </p>
                )}

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => updateReport(report.id, 'reviewed')}
                    className="flex-1 rounded-xl bg-emerald-600 px-3 py-2 text-[10px] font-black text-white flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {label.reviewed}
                  </button>
                  <button
                    onClick={() => updateReport(report.id, 'dismissed')}
                    className="flex-1 rounded-xl bg-slate-700 px-3 py-2 text-[10px] font-black text-white flex items-center justify-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    {label.dismissed}
                  </button>
                  <button
                    onClick={() => updateReport(report.id, 'action_taken')}
                    className="flex-1 rounded-xl bg-red-600 px-3 py-2 text-[10px] font-black text-white"
                  >
                    {label.action}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

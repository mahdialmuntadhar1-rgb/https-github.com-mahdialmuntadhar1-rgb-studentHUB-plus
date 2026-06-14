import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Download, Mail, Pause, Play, RefreshCw, Send, ShieldCheck, Upload } from 'lucide-react';
import {
  createOutreachCampaign,
  createOutreachTemplate,
  getOutreachCampaign,
  getOutreachCampaigns,
  getOutreachContacts,
  getOutreachDashboard,
  getOutreachTemplates,
  importOutreachContacts,
  outreachCampaignAction,
  outreachExportUrl,
  patchOutreachContact,
  previewOutreachCampaign,
  OutreachCampaign,
  OutreachContact,
  OutreachImportSummary,
  OutreachRecipient,
  OutreachTemplate,
} from '../lib/api';

type Tab = 'dashboard' | 'contacts' | 'templates' | 'campaigns';

const placeholders = [
  '{{institution_name}}',
  '{{contact_name}}',
  '{{email}}',
  '{{department}}',
  '{{governorate}}',
  '{{institution_type}}',
  '{{language}}',
  '{{unsubscribe_url}}',
  '{{greeting}}',
];

const sampleTemplate = {
  name: 'University introduction',
  subject_template: 'Partnership introduction for {{institution_name}}',
  html_template: '<p>{{greeting}}</p><p>We are reaching out to academic institutions in {{governorate}} about student opportunities and announcements.</p><p>You can unsubscribe here: <a href="{{unsubscribe_url}}">unsubscribe</a>.</p>',
  text_template: '{{greeting}}\n\nWe are reaching out to academic institutions in {{governorate}} about student opportunities and announcements.\n\nUnsubscribe: {{unsubscribe_url}}',
  language: 'en',
};

export default function AdminOutreachPage() {
  const [token, setToken] = useState(() => localStorage.getItem('jamiaati_admin_token') || localStorage.getItem('rafid_token') || '');
  const [tab, setTab] = useState<Tab>('dashboard');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState<{ contacts: { status: string; count: number }[]; recentCampaigns: OutreachCampaign[] }>({ contacts: [], recentCampaigns: [] });
  const [contacts, setContacts] = useState<OutreachContact[]>([]);
  const [templates, setTemplates] = useState<OutreachTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<OutreachCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<{ campaign: OutreachCampaign; recipients: OutreachRecipient[] } | null>(null);
  const [preview, setPreview] = useState<{ subject: string; html: string; text: string; contact: OutreachContact }[]>([]);
  const [importSummary, setImportSummary] = useState<OutreachImportSummary | null>(null);
  const [filters, setFilters] = useState({ search: '', governorate: '', institution_type: '', language: '', status: '' });
  const [templateForm, setTemplateForm] = useState(sampleTemplate);
  const [campaignForm, setCampaignForm] = useState({ name: '', template_id: '', governorate: '', institution_type: '', language: '' });
  const [confirmed, setConfirmed] = useState(false);

  const contactCounts = useMemo(() => {
    const base: Record<string, number> = { active: 0, unsubscribed: 0, bounced: 0, invalid: 0, duplicate: 0 };
    dashboard.contacts.forEach((row) => { base[row.status] = Number(row.count); });
    return base;
  }, [dashboard.contacts]);

  const saveToken = (value: string) => {
    setToken(value);
    localStorage.setItem('jamiaati_admin_token', value);
    localStorage.setItem('rafid_token', value);
  };

  const loadAll = async () => {
    if (!token) return;
    setLoading(true);
    setMessage('');
    try {
      const [nextDashboard, nextContacts, nextTemplates, nextCampaigns] = await Promise.all([
        getOutreachDashboard(),
        getOutreachContacts(filters),
        getOutreachTemplates(),
        getOutreachCampaigns(),
      ]);
      setDashboard(nextDashboard);
      setContacts(nextContacts);
      setTemplates(nextTemplates);
      setCampaigns(nextCampaigns);
      if (!campaignForm.template_id && nextTemplates[0]) {
        setCampaignForm((current) => ({ ...current, template_id: nextTemplates[0].id }));
      }
    } catch (err: any) {
      setMessage(err?.message || 'Could not load outreach data. Check the admin token and Worker routes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadAll();
  }, [token]);

  const readCsv = async (file?: File) => {
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setMessage('CSV is too large. Limit uploads to 1 MB.');
      return;
    }
    const csv = await file.text();
    setLoading(true);
    try {
      const summary = await importOutreachContacts(csv);
      setImportSummary(summary);
      await loadAll();
    } catch (err: any) {
      setMessage(err?.message || 'Import failed.');
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    setLoading(true);
    try {
      await createOutreachTemplate(templateForm);
      setMessage('Template saved.');
      await loadAll();
    } catch (err: any) {
      setMessage(err?.message || 'Template save failed.');
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    if (!campaignForm.name || !campaignForm.template_id) return;
    const segment_filter_json = {
      governorate: campaignForm.governorate,
      institution_type: campaignForm.institution_type,
      language: campaignForm.language,
    };
    setLoading(true);
    try {
      const created = await createOutreachCampaign({ name: campaignForm.name, template_id: campaignForm.template_id, segment_filter_json });
      setMessage('Campaign draft created. Preview and send a test email before starting.');
      await loadAll();
      await openCampaign(created.id);
    } catch (err: any) {
      setMessage(err?.message || 'Campaign creation failed.');
    } finally {
      setLoading(false);
    }
  };

  const openCampaign = async (id: string) => {
    setLoading(true);
    try {
      const detail = await getOutreachCampaign(id);
      setSelectedCampaign(detail);
      const nextPreview = await previewOutreachCampaign(id);
      setPreview(nextPreview.samples);
    } catch (err: any) {
      setMessage(err?.message || 'Could not open campaign.');
    } finally {
      setLoading(false);
    }
  };

  const act = async (action: 'send-test' | 'start' | 'pause' | 'resume' | 'retry-failed' | 'stop') => {
    if (!selectedCampaign) return;
    if (action === 'start' && !confirmed) {
      setMessage('Confirm the compliance statement before starting this campaign.');
      return;
    }
    setLoading(true);
    try {
      const result = await outreachCampaignAction(selectedCampaign.campaign.id, action);
      setMessage(result.dryRun ? 'Dry run completed. No real email was sent.' : `Campaign action completed: ${action}`);
      await openCampaign(selectedCampaign.campaign.id);
      await loadAll();
    } catch (err: any) {
      setMessage(err?.message || `Campaign action failed: ${action}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadExport = async (url: string, filename: string) => {
    const response = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!response.ok) {
      setMessage('Export failed.');
      return;
    }
    const blob = await response.blob();
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(href);
  };

  return (
    <main className="min-h-screen bg-[#0B1020] px-4 py-8 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button onClick={() => { window.location.href = '/'; }} className="inline-flex items-center gap-2 rounded-2xl border border-[#1F2E4D] bg-[#121B2E] px-4 py-3 text-xs font-black text-cyan-300">
            <ArrowLeft size={14} /> Back
          </button>
          <div className="flex flex-wrap gap-2">
            {(['dashboard', 'contacts', 'templates', 'campaigns'] as Tab[]).map((item) => (
              <button key={item} onClick={() => setTab(item)} className={`rounded-2xl px-4 py-3 text-xs font-black ${tab === item ? 'bg-cyan-400 text-slate-950' : 'border border-[#1F2E4D] bg-[#121B2E] text-slate-300'}`}>
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5 rounded-[2rem] border border-cyan-400/20 bg-[#121B2E] p-6">
          <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-cyan-300">
            <Mail size={14} /> Admin-only university outreach
          </p>
          <h1 className="text-3xl font-black">Bulk Email Outreach</h1>
          <p className="mt-2 text-sm font-semibold text-slate-400">
            Individual personalized emails only. Configure SPF, DKIM, and DMARC with your provider before sending any real campaign.
          </p>
          <input value={token} onChange={(event) => saveToken(event.target.value)} placeholder="Paste admin token..." className="mt-5 w-full rounded-2xl border border-[#1F2E4D] bg-slate-950 px-4 py-3 text-xs font-bold text-white outline-none placeholder:text-slate-500" />
        </div>

        {message && <div className="mb-5 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm font-bold text-amber-200">{message}</div>}

        {tab === 'dashboard' && (
          <div className="grid gap-4 lg:grid-cols-4">
            {[
              ['Total contacts', Object.values(contactCounts).reduce((a: number, b: number) => a + b, 0)],
              ['Active', contactCounts.active],
              ['Unsubscribed', contactCounts.unsubscribed],
              ['Bounced', contactCounts.bounced],
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-[#1F2E4D] bg-[#121B2E] p-5">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-black text-cyan-300">{value}</p>
              </div>
            ))}
            <div className="lg:col-span-4 rounded-3xl border border-[#1F2E4D] bg-[#121B2E] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-black">Recent campaigns</h2>
                <button onClick={loadAll} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-cyan-300"><RefreshCw size={14} /> Refresh</button>
              </div>
              <CampaignTable campaigns={dashboard.recentCampaigns} onOpen={openCampaign} />
            </div>
          </div>
        )}

        {tab === 'contacts' && (
          <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
            <aside className="rounded-3xl border border-[#1F2E4D] bg-[#121B2E] p-5">
              <h2 className="mb-4 text-sm font-black text-cyan-300">Import and filters</h2>
              <label className="mb-3 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-cyan-400/40 bg-cyan-400/10 px-4 py-5 text-xs font-black text-cyan-200">
                <Upload size={16} /> Upload CSV
                <input type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => readCsv(event.target.files?.[0])} />
              </label>
              {importSummary && <div className="mb-4 rounded-2xl bg-slate-950 p-3 text-xs font-bold text-slate-300">Rows {importSummary.totalRows} · Imported {importSummary.imported} · Updated {importSummary.updated} · Duplicates {importSummary.duplicates} · Invalid {importSummary.invalidEmails}</div>}
              {Object.entries(filters).map(([key, value]) => (
                <input key={key} value={value} onChange={(event) => setFilters({ ...filters, [key]: event.target.value })} placeholder={key} className="mb-2 w-full rounded-2xl bg-slate-950 px-4 py-3 text-xs font-bold outline-none" />
              ))}
              <button onClick={loadAll} className="mb-2 w-full rounded-2xl bg-cyan-400 py-3 text-xs font-black text-slate-950">Apply filters</button>
              <button onClick={() => downloadExport(outreachExportUrl('contacts'), 'outreach-contacts.csv')} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3 text-xs font-black text-cyan-300"><Download size={14} /> Export CSV</button>
            </aside>
            <div className="overflow-hidden rounded-3xl border border-[#1F2E4D] bg-[#121B2E]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400">
                    <tr><th className="p-3">Institution</th><th>Email</th><th>Contact</th><th>Governorate</th><th>Type</th><th>Status</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact) => (
                      <tr key={contact.id} className="border-t border-[#1F2E4D]">
                        <td className="p-3 font-black">{contact.institution_name || 'Unnamed'}</td>
                        <td className="p-3 text-cyan-300">{contact.email}</td>
                        <td className="p-3">{contact.contact_name || '-'}</td>
                        <td className="p-3">{contact.governorate || '-'}</td>
                        <td className="p-3">{contact.institution_type || '-'}</td>
                        <td className="p-3">{contact.status}</td>
                        <td className="p-3"><button onClick={async () => { await patchOutreachContact(contact.id, { status: 'unsubscribed' }); await loadAll(); }} className="rounded-xl bg-rose-400 px-3 py-2 font-black text-slate-950">Do not contact</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'templates' && (
          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <div className="rounded-3xl border border-[#1F2E4D] bg-[#121B2E] p-5">
              <h2 className="mb-4 text-lg font-black">Template editor</h2>
              <input value={templateForm.name} onChange={(event) => setTemplateForm({ ...templateForm, name: event.target.value })} className="mb-3 w-full rounded-2xl bg-slate-950 px-4 py-3 text-xs font-bold outline-none" placeholder="Template name" />
              <input value={templateForm.subject_template} onChange={(event) => setTemplateForm({ ...templateForm, subject_template: event.target.value })} className="mb-3 w-full rounded-2xl bg-slate-950 px-4 py-3 text-xs font-bold outline-none" placeholder="Subject template" />
              <textarea value={templateForm.html_template} onChange={(event) => setTemplateForm({ ...templateForm, html_template: event.target.value })} className="mb-3 min-h-44 w-full rounded-2xl bg-slate-950 px-4 py-3 text-xs font-bold outline-none" placeholder="HTML template" />
              <textarea value={templateForm.text_template} onChange={(event) => setTemplateForm({ ...templateForm, text_template: event.target.value })} className="mb-3 min-h-36 w-full rounded-2xl bg-slate-950 px-4 py-3 text-xs font-bold outline-none" placeholder="Plain text template" />
              <button onClick={saveTemplate} disabled={loading} className="rounded-2xl bg-cyan-400 px-5 py-3 text-xs font-black text-slate-950 disabled:opacity-50">Save template</button>
            </div>
            <aside className="space-y-4">
              <div className="rounded-3xl border border-[#1F2E4D] bg-[#121B2E] p-5">
                <h3 className="mb-3 text-sm font-black text-cyan-300">Placeholders</h3>
                <div className="flex flex-wrap gap-2">{placeholders.map((item) => <span key={item} className="rounded-xl bg-slate-950 px-2 py-1 text-[10px] font-black text-slate-300">{item}</span>)}</div>
              </div>
              <div className="rounded-3xl border border-[#1F2E4D] bg-[#121B2E] p-5">
                <h3 className="mb-3 text-sm font-black text-cyan-300">Saved templates</h3>
                <div className="space-y-2">{templates.map((template) => <div key={template.id} className="rounded-2xl bg-slate-950 p-3 text-xs font-bold">{template.name}<p className="mt-1 text-slate-500">{template.subject_template}</p></div>)}</div>
              </div>
            </aside>
          </div>
        )}

        {tab === 'campaigns' && (
          <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
            <aside className="space-y-4">
              <div className="rounded-3xl border border-[#1F2E4D] bg-[#121B2E] p-5">
                <h2 className="mb-4 text-sm font-black text-cyan-300">Create campaign</h2>
                <input value={campaignForm.name} onChange={(event) => setCampaignForm({ ...campaignForm, name: event.target.value })} placeholder="Campaign name" className="mb-2 w-full rounded-2xl bg-slate-950 px-4 py-3 text-xs font-bold outline-none" />
                <select value={campaignForm.template_id} onChange={(event) => setCampaignForm({ ...campaignForm, template_id: event.target.value })} className="mb-2 w-full rounded-2xl bg-slate-950 px-4 py-3 text-xs font-bold outline-none">
                  <option value="">Select template</option>
                  {templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
                </select>
                <input value={campaignForm.governorate} onChange={(event) => setCampaignForm({ ...campaignForm, governorate: event.target.value })} placeholder="Governorate filter optional" className="mb-2 w-full rounded-2xl bg-slate-950 px-4 py-3 text-xs font-bold outline-none" />
                <input value={campaignForm.institution_type} onChange={(event) => setCampaignForm({ ...campaignForm, institution_type: event.target.value })} placeholder="Institution type optional" className="mb-2 w-full rounded-2xl bg-slate-950 px-4 py-3 text-xs font-bold outline-none" />
                <input value={campaignForm.language} onChange={(event) => setCampaignForm({ ...campaignForm, language: event.target.value })} placeholder="Language optional" className="mb-3 w-full rounded-2xl bg-slate-950 px-4 py-3 text-xs font-bold outline-none" />
                <button onClick={createCampaign} className="w-full rounded-2xl bg-cyan-400 py-3 text-xs font-black text-slate-950">Create draft</button>
              </div>
              <div className="rounded-3xl border border-[#1F2E4D] bg-[#121B2E] p-5">
                <h2 className="mb-4 text-sm font-black text-cyan-300">Campaigns</h2>
                <CampaignTable campaigns={campaigns} onOpen={openCampaign} />
              </div>
            </aside>

            <div className="rounded-3xl border border-[#1F2E4D] bg-[#121B2E] p-5">
              {!selectedCampaign ? (
                <div className="p-10 text-center text-sm font-black text-slate-500">Select or create a campaign.</div>
              ) : (
                <>
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-cyan-300">{selectedCampaign.campaign.status}</p>
                      <h2 className="text-2xl font-black">{selectedCampaign.campaign.name}</h2>
                      <p className="mt-1 text-sm font-bold text-slate-400">Recipients {selectedCampaign.campaign.total_recipients} · Sent {selectedCampaign.campaign.sent_count} · Failed {selectedCampaign.campaign.failed_count} · Bounced {selectedCampaign.campaign.bounced_count}</p>
                    </div>
                    <button onClick={() => downloadExport(outreachExportUrl('campaign', selectedCampaign.campaign.id), 'outreach-campaign-report.csv')} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-xs font-black text-cyan-300"><Download size={14} /> Export report</button>
                  </div>

                  <div className="mb-5 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
                    <label className="flex gap-3 text-sm font-bold text-amber-100">
                      <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
                      I confirm these contacts are relevant academic/institutional contacts and this campaign includes an unsubscribe option.
                    </label>
                  </div>

                  <div className="mb-5 flex flex-wrap gap-2">
                    <button onClick={() => act('send-test')} className="inline-flex items-center gap-2 rounded-2xl bg-indigo-400 px-4 py-3 text-xs font-black text-slate-950"><Send size={14} /> Send test</button>
                    <button onClick={() => act('start')} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 text-xs font-black text-slate-950"><ShieldCheck size={14} /> Start</button>
                    <button onClick={() => act('pause')} className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-3 text-xs font-black text-slate-200"><Pause size={14} /> Pause</button>
                    <button onClick={() => act('resume')} className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 text-xs font-black text-slate-950"><Play size={14} /> Resume</button>
                    <button onClick={() => act('retry-failed')} className="rounded-2xl bg-amber-400 px-4 py-3 text-xs font-black text-slate-950">Retry failed</button>
                    <button onClick={() => act('stop')} className="rounded-2xl bg-rose-400 px-4 py-3 text-xs font-black text-slate-950">Stop</button>
                  </div>

                  <h3 className="mb-3 text-sm font-black text-cyan-300">Preview first 10 personalized emails</h3>
                  <div className="mb-6 grid gap-3 lg:grid-cols-2">
                    {preview.map((item) => (
                      <div key={`${item.contact.id}-${item.subject}`} className="rounded-2xl bg-slate-950 p-4">
                        <p className="text-xs font-black text-white">{item.subject}</p>
                        <p className="mt-1 text-[10px] font-bold text-slate-500">{item.contact.email}</p>
                        <div className="mt-3 max-h-48 overflow-y-auto rounded-xl bg-white p-3 text-xs text-slate-900" dangerouslySetInnerHTML={{ __html: item.html }} />
                      </div>
                    ))}
                  </div>

                  <h3 className="mb-3 text-sm font-black text-cyan-300">Recipients</h3>
                  <div className="max-h-[440px] overflow-auto rounded-2xl border border-[#1F2E4D]">
                    <table className="w-full min-w-[780px] text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400"><tr><th className="p-3">Email</th><th>Status</th><th>Sent</th><th>Opened</th><th>Clicked</th><th>Error</th></tr></thead>
                      <tbody>
                        {selectedCampaign.recipients.map((recipient) => (
                          <tr key={recipient.id} className="border-t border-[#1F2E4D]">
                            <td className="p-3 text-cyan-300">{recipient.email}</td>
                            <td className="p-3">{recipient.status}</td>
                            <td className="p-3">{recipient.sent_at || '-'}</td>
                            <td className="p-3">{recipient.opened_at || '-'}</td>
                            <td className="p-3">{recipient.clicked_at || '-'}</td>
                            <td className="p-3 text-rose-300">{recipient.error_message || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function CampaignTable({ campaigns, onOpen }: { campaigns: OutreachCampaign[]; onOpen: (id: string) => void }) {
  if (!campaigns.length) return <p className="rounded-2xl border border-dashed border-[#1F2E4D] p-5 text-center text-xs font-black text-slate-500">No campaigns yet.</p>;
  return (
    <div className="space-y-2">
      {campaigns.map((campaign) => (
        <button key={campaign.id} onClick={() => onOpen(campaign.id)} className="block w-full rounded-2xl bg-slate-950 p-3 text-left text-xs font-bold transition hover:bg-slate-900">
          <span className="font-black text-white">{campaign.name}</span>
          <span className="ml-2 rounded-full bg-cyan-400/10 px-2 py-1 text-[10px] font-black text-cyan-300">{campaign.status}</span>
          <p className="mt-1 text-slate-500">Total {campaign.total_recipients} · Sent {campaign.sent_count} · Failed {campaign.failed_count}</p>
        </button>
      ))}
    </div>
  );
}

const API_BASE = (import.meta as any).env.VITE_API_URL || 'https://rafid-api.mahdialmuntadhar1.workers.dev';

export type HighlightCategory = 'event' | 'job' | 'internship' | 'scholarship' | 'student_club';
export type HighlightStatus = 'pending_review' | 'approved' | 'rejected' | 'duplicate' | 'expired';

export interface HighlightItem {
  id: string;
  category: HighlightCategory;
  title: string;
  organization?: string | null;
  governorate?: string | null;
  city?: string | null;
  university_id?: string | null;
  source_name?: string | null;
  source_url?: string | null;
  apply_url?: string | null;
  event_date?: string | null;
  deadline?: string | null;
  summary?: string | null;
  image_url?: string | null;
  language?: string | null;
  status?: HighlightStatus;
  confidence_score?: number;
  created_at?: string;
}

export interface HighlightSource {
  id: string;
  name: string;
  source_url: string;
  category: HighlightCategory;
  governorate_scope?: string | null;
  university_scope?: string | null;
  source_type?: string;
  enabled?: number | boolean;
  trusted_source?: number | boolean;
  auto_publish?: number | boolean;
  scraping_priority?: number;
  last_checked_at?: string | null;
}

export interface BackendOpportunity {
  id: string;
  title: string;
  type: string;
  institution_name: string;
  institution_logo?: string | null;
  governorate?: string | null;
  city?: string | null;
  deadline?: string | null;
  tags?: string;
  created_at?: string;
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('rafid_token') || localStorage.getItem('jamiaati_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `API error ${response.status}`;
    try {
      const body = await response.json();
      message = body.error || body.message || message;
    } catch {}
    throw new Error(message);
  }
  return response.json();
}

export async function getHighlights(filters?: {
  category?: HighlightCategory | '';
  governorate?: string;
  university_id?: string;
  source?: string;
}): Promise<HighlightItem[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.governorate && filters.governorate !== 'all') params.set('governorate', filters.governorate);
  if (filters?.university_id && filters.university_id !== 'all') params.set('university_id', filters.university_id);
  if (filters?.source) params.set('source', filters.source);

  const response = await fetch(`${API_BASE}/api/highlights${params.toString() ? `?${params}` : ''}`);
  return handleResponse<HighlightItem[]>(response);
}

export async function getBackendOpportunities(): Promise<BackendOpportunity[]> {
  const response = await fetch(`${API_BASE}/api/opportunities`);
  return handleResponse<BackendOpportunity[]>(response);
}

export async function getAdminHighlights(filters?: {
  status?: HighlightStatus | '';
  category?: HighlightCategory | '';
  governorate?: string;
}): Promise<HighlightItem[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.category) params.set('category', filters.category);
  if (filters?.governorate && filters.governorate !== 'all') params.set('governorate', filters.governorate);

  const response = await fetch(`${API_BASE}/api/admin/highlights${params.toString() ? `?${params}` : ''}`, {
    headers: { ...authHeaders() },
  });
  return handleResponse<HighlightItem[]>(response);
}

export async function createAdminHighlight(payload: Partial<HighlightItem> & { title: string; category: HighlightCategory }) {
  const response = await fetch(`${API_BASE}/api/admin/highlights`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ success: boolean }>(response);
}

export async function setHighlightStatus(id: string, action: 'approve' | 'reject' | 'mark-duplicate') {
  const response = await fetch(`${API_BASE}/api/admin/highlights/${id}/${action}`, {
    method: 'POST',
    headers: { ...authHeaders() },
  });
  return handleResponse<{ success: boolean }>(response);
}

export async function getHighlightSources(): Promise<HighlightSource[]> {
  const response = await fetch(`${API_BASE}/api/admin/highlight-sources`, {
    headers: { ...authHeaders() },
  });
  return handleResponse<HighlightSource[]>(response);
}

export async function createHighlightSource(payload: Partial<HighlightSource> & {
  name: string;
  source_url: string;
  category: HighlightCategory;
}) {
  const response = await fetch(`${API_BASE}/api/admin/highlight-sources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ success: boolean }>(response);
}

export async function runHighlightImport() {
  const response = await fetch(`${API_BASE}/api/admin/highlight-import/run`, {
    method: 'POST',
    headers: { ...authHeaders() },
  });
  return handleResponse<{ success: boolean; sourcesChecked: number; itemsAdded: number; duplicatesFound: number }>(response);
}

export type OutreachContactStatus = 'active' | 'unsubscribed' | 'bounced' | 'invalid' | 'duplicate';
export type OutreachCampaignStatus = 'draft' | 'scheduled' | 'sending' | 'paused' | 'completed' | 'failed';
export type OutreachRecipientStatus = 'pending' | 'queued' | 'sent' | 'failed' | 'bounced' | 'skipped' | 'unsubscribed';

export interface OutreachContact {
  id: string;
  institution_name?: string | null;
  contact_name?: string | null;
  email: string;
  phone?: string | null;
  department?: string | null;
  governorate?: string | null;
  institution_type?: string | null;
  language?: string | null;
  source?: string | null;
  status: OutreachContactStatus;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface OutreachTemplate {
  id: string;
  name: string;
  subject_template: string;
  html_template: string;
  text_template: string;
  language?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface OutreachCampaign {
  id: string;
  name: string;
  template_id: string;
  status: OutreachCampaignStatus;
  segment_filter_json?: string | null;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  bounced_count: number;
  unsubscribed_count: number;
  created_at?: string;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface OutreachRecipient {
  id: string;
  campaign_id: string;
  contact_id: string;
  email: string;
  personalized_subject: string;
  personalized_html: string;
  personalized_text: string;
  status: OutreachRecipientStatus;
  provider_message_id?: string | null;
  error_message?: string | null;
  sent_at?: string | null;
  opened_at?: string | null;
  clicked_at?: string | null;
}

export interface OutreachImportSummary {
  totalRows: number;
  imported: number;
  updated: number;
  duplicates: number;
  invalidEmails: number;
}

export async function getOutreachDashboard() {
  const response = await fetch(`${API_BASE}/api/outreach/dashboard`, { headers: { ...authHeaders() } });
  return handleResponse<{ contacts: { status: OutreachContactStatus; count: number }[]; recentCampaigns: OutreachCampaign[] }>(response);
}

export async function importOutreachContacts(csv: string) {
  const response = await fetch(`${API_BASE}/api/outreach/contacts/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/csv', ...authHeaders() },
    body: csv,
  });
  return handleResponse<OutreachImportSummary>(response);
}

export async function getOutreachContacts(filters?: Record<string, string>) {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const response = await fetch(`${API_BASE}/api/outreach/contacts${params.toString() ? `?${params}` : ''}`, { headers: { ...authHeaders() } });
  return handleResponse<OutreachContact[]>(response);
}

export async function patchOutreachContact(id: string, payload: Partial<OutreachContact>) {
  const response = await fetch(`${API_BASE}/api/outreach/contacts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ success: boolean }>(response);
}

export async function getOutreachTemplates() {
  const response = await fetch(`${API_BASE}/api/outreach/templates`, { headers: { ...authHeaders() } });
  return handleResponse<OutreachTemplate[]>(response);
}

export async function createOutreachTemplate(payload: Omit<OutreachTemplate, 'id'>) {
  const response = await fetch(`${API_BASE}/api/outreach/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ success: boolean }>(response);
}

export async function patchOutreachTemplate(id: string, payload: Partial<OutreachTemplate>) {
  const response = await fetch(`${API_BASE}/api/outreach/templates/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ success: boolean }>(response);
}

export async function getOutreachCampaigns() {
  const response = await fetch(`${API_BASE}/api/outreach/campaigns`, { headers: { ...authHeaders() } });
  return handleResponse<OutreachCampaign[]>(response);
}

export async function createOutreachCampaign(payload: { name: string; template_id: string; segment_filter_json?: Record<string, string> }) {
  const response = await fetch(`${API_BASE}/api/outreach/campaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ id: string; success: boolean }>(response);
}

export async function getOutreachCampaign(id: string) {
  const response = await fetch(`${API_BASE}/api/outreach/campaigns/${id}`, { headers: { ...authHeaders() } });
  return handleResponse<{ campaign: OutreachCampaign; recipients: OutreachRecipient[] }>(response);
}

export async function previewOutreachCampaign(id: string) {
  const response = await fetch(`${API_BASE}/api/outreach/campaigns/${id}/preview`, {
    method: 'POST',
    headers: { ...authHeaders() },
  });
  return handleResponse<{ placeholders: string[]; samples: { subject: string; html: string; text: string; contact: OutreachContact }[] }>(response);
}

export async function outreachCampaignAction(id: string, action: 'send-test' | 'start' | 'pause' | 'resume' | 'retry-failed' | 'stop') {
  const response = await fetch(`${API_BASE}/api/outreach/campaigns/${id}/${action}`, {
    method: 'POST',
    headers: { ...authHeaders() },
  });
  return handleResponse<{ success: boolean; dryRun?: boolean; providerMessageId?: string }>(response);
}

export function outreachExportUrl(kind: 'contacts' | 'campaign', id?: string) {
  const path = kind === 'contacts' ? '/api/outreach/contacts/export' : `/api/outreach/campaigns/${id}/export`;
  return `${API_BASE}${path}`;
}

import { Language } from '../types';

export const BACKEND_URL = (import.meta as any).env.VITE_API_URL || 'https://rafid-api.mahdialmuntadhar1.workers.dev';
const API_BASE = BACKEND_URL;

function getHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('admin_token') || localStorage.getItem('jamiaati_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(response: Response, language: Language = 'ar') {
  if (response.status === 401) {
    alert(language === 'ar' ? 'قم بتسجيل الدخول كمسؤول أولاً.' : language === 'ku' ? 'تکایە بچۆ ژوورەوە وەک سەرپەرشتیار.' : 'Admin login required.');
    window.location.href = '#/login';
    throw new Error('Admin login required');
  }
  if (response.status === 403) {
    alert(language === 'ar' ? 'وصول للمسؤولين فقط!' : language === 'ku' ? 'تەنها بۆ بەڕێوەبەران ڕێگەپێدراوە!' : 'Admin access only');
    throw new Error('Admin access only');
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || (language === 'ar' ? 'حدث خطأ في الخادم' : 'Server error occurred'));
    }
    return data;
  } else {
    const text = await response.text();
    if (!response.ok) {
      throw new Error(text || (language === 'ar' ? 'حدث خطأ غير معروف' : 'Unknown error occurred'));
    }
    return text;
  }
}

export const opportunityAutomation = {
  async getStatus(lang: Language = 'ar') {
    try {
      const res = await fetch(`${API_BASE}/api/opportunity-automation/status`, {
        headers: getHeaders(),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  },

  async getStats(lang: Language = 'ar') {
    try {
      const res = await fetch(`${API_BASE}/api/opportunity-automation/stats`, {
        headers: getHeaders(),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  },

  async getSources(params: { page?: number; limit?: number; search?: string; type?: string; active?: boolean } = {}, lang: Language = 'ar') {
    try {
      const query = new URLSearchParams();
      if (params.page) query.append('page', params.page.toString());
      if (params.limit) query.append('limit', params.limit.toString());
      if (params.search) query.append('search', params.search);
      if (params.type) query.append('type', params.type);
      if (params.active !== undefined) query.append('active', params.active.toString());

      const res = await fetch(`${API_BASE}/api/opportunity-automation/sources?${query.toString()}`, {
        headers: getHeaders(),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      throw err;
    }
  },

  async createSource(data: any, lang: Language = 'ar') {
    try {
      const res = await fetch(`${API_BASE}/api/opportunity-automation/sources`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      throw err;
    }
  },

  async updateSource(id: string, data: any, lang: Language = 'ar') {
    try {
      const res = await fetch(`${API_BASE}/api/opportunity-automation/sources/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      throw err;
    }
  },

  async deleteSource(id: string, lang: Language = 'ar') {
    try {
      const res = await fetch(`${API_BASE}/api/opportunity-automation/sources/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      throw err;
    }
  },

  async runNow(lang: Language = 'ar') {
    try {
      const res = await fetch(`${API_BASE}/api/opportunity-automation/run-now`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      throw err;
    }
  },

  async runSource(id: string, lang: Language = 'ar') {
    try {
      const res = await fetch(`${API_BASE}/api/opportunity-automation/run-source/${id}`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      throw err;
    }
  },

  async importCsv(file: File, lang: Language = 'ar') {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Need multipart headers (let fetch set Content-Type with boundary)
      const headers = getHeaders();
      delete headers['Content-Type'];

      const res = await fetch(`${API_BASE}/api/opportunity-automation/import-csv`, {
        method: 'POST',
        headers,
        body: formData,
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      throw err;
    }
  },

  async getCandidates(params: { status?: string; page?: number; limit?: number; search?: string; category?: string; governorate?: string; country?: string; language?: string; deadline?: string; source?: string } = {}, lang: Language = 'ar') {
    try {
      const query = new URLSearchParams();
      if (params.status) query.append('status', params.status);
      if (params.page) query.append('page', params.page.toString());
      if (params.limit) query.append('limit', params.limit.toString());
      if (params.search) query.append('search', params.search);
      if (params.category) query.append('category', params.category);
      if (params.governorate) query.append('governorate', params.governorate);
      if (params.country) query.append('country', params.country);
      if (params.language) query.append('language', params.language);
      if (params.deadline) query.append('deadline', params.deadline);
      if (params.source) query.append('source', params.source);

      const res = await fetch(`${API_BASE}/api/opportunity-automation/candidates?${query.toString()}`, {
        headers: getHeaders(),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      throw err;
    }
  },

  async getCandidate(id: string, lang: Language = 'ar') {
    try {
      const res = await fetch(`${API_BASE}/api/opportunity-automation/candidates/${id}`, {
        headers: getHeaders(),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      throw err;
    }
  },

  async updateCandidate(id: string, data: any, lang: Language = 'ar') {
    try {
      const res = await fetch(`${API_BASE}/api/opportunity-automation/candidates/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      throw err;
    }
  },

  async approveCandidate(id: string, lang: Language = 'ar') {
    try {
      const res = await fetch(`${API_BASE}/api/opportunity-automation/candidates/${id}/approve`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      throw err;
    }
  },

  async rejectCandidate(id: string, reason?: string, lang: Language = 'ar') {
    try {
      const res = await fetch(`${API_BASE}/api/opportunity-automation/candidates/${id}/reject`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ reason }),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      throw err;
    }
  },

  async markDuplicate(id: string, lang: Language = 'ar') {
    try {
      const res = await fetch(`${API_BASE}/api/opportunity-automation/candidates/${id}/mark-duplicate`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      throw err;
    }
  },

  async markExpired(id: string, lang: Language = 'ar') {
    try {
      const res = await fetch(`${API_BASE}/api/opportunity-automation/candidates/${id}/mark-expired`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      throw err;
    }
  },

  async getLogs(params: { page?: number; limit?: number; status?: string; source?: string } = {}, lang: Language = 'ar') {
    try {
      const query = new URLSearchParams();
      if (params.page) query.append('page', params.page.toString());
      if (params.limit) query.append('limit', params.limit.toString());
      if (params.status) query.append('status', params.status);
      if (params.source) query.append('source', params.source);

      const res = await fetch(`${API_BASE}/api/opportunity-automation/logs?${query.toString()}`, {
        headers: getHeaders(),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      throw err;
    }
  }
};

export const outreachApi = {
  async getContacts(params: { page?: number; limit?: number; search?: string; status?: string } = {}, lang: Language = 'ar') {
    try {
      const query = new URLSearchParams();
      if (params.page) query.append('page', params.page.toString());
      if (params.limit) query.append('limit', params.limit.toString());
      if (params.search) query.append('search', params.search);
      if (params.status) query.append('status', params.status);

      const res = await fetch(`${API_BASE}/api/outreach/contacts?${query.toString()}`, {
        headers: getHeaders(),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      throw err;
    }
  },

  async getCampaigns(params: { page?: number; limit?: number } = {}, lang: Language = 'ar') {
    try {
      const query = new URLSearchParams();
      if (params.page) query.append('page', params.page.toString());
      if (params.limit) query.append('limit', params.limit.toString());

      const res = await fetch(`${API_BASE}/api/outreach/campaigns?${query.toString()}`, {
        headers: getHeaders(),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      throw err;
    }
  },

  async sendTestEmail(email: string, templateId: string, lang: Language = 'ar') {
    try {
      const res = await fetch(`${API_BASE}/api/outreach/send-test`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, templateId }),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      throw err;
    }
  },

  async importCsv(file: File, lang: Language = 'ar') {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const headers = getHeaders();
      delete headers['Content-Type'];

      const res = await fetch(`${API_BASE}/api/outreach/import-csv`, {
        method: 'POST',
        headers,
        body: formData,
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      throw err;
    }
  }
};

// Highlight API functions
const HIGHLIGHT_API_BASE = (import.meta as any).env.VITE_API_URL || 'https://rafid-api.mahdialmuntadhar1.workers.dev';

export type HighlightCategory = 'news' | 'event' | 'announcement' | 'exam' | 'registration' | 'student_club' | 'activity' | 'job' | 'internship' | 'scholarship';
export type HighlightStatus = 'pending_review' | 'approved' | 'rejected' | 'duplicate' | 'expired';

// SCRAPER ROUTING RULES (for future implementation):
// University website news/events/announcements/exams/registration/student activities:
//   → insert into highlight_items with status='pending_review'
// Jobs/scholarships/internships/trainings/fellowships/volunteering/competitions:
//   → insert into opportunity_candidates with status='pending_review'
// Keep original language in: title, summary, description/full_description_optional, raw_text, language
// Do not translate, strip Arabic/Kurdish characters, or use escape/unescape/btoa/atob/Buffer decoding

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

async function handleHighlightResponse<T>(response: Response): Promise<T> {
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
  return handleHighlightResponse<HighlightItem[]>(response);
}

export async function getBackendOpportunities(filters?: {
  category?: string;
  governorate?: string;
  city?: string;
  search?: string;
  limit?: number;
}): Promise<BackendOpportunity[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.governorate && filters.governorate !== 'all') params.set('governorate', filters.governorate);
  if (filters?.city) params.set('city', filters.city);
  if (filters?.search) params.set('search', filters.search);
  if (filters?.limit) params.set('limit', filters.limit.toString());

  const response = await fetch(`${API_BASE}/api/opportunities${params.toString() ? `?${params}` : ''}`);
  return handleHighlightResponse<BackendOpportunity[]>(response);
}

export async function getOpportunities(lang: Language = 'en'): Promise<BackendOpportunity[]> {
  return getBackendOpportunities();
}

export async function getInstitutions(): Promise<any[]> {
  const response = await fetch(`${API_BASE}/api/institutions`);
  return handleHighlightResponse<any[]>(response);
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
  return handleHighlightResponse<HighlightItem[]>(response);
}

export async function createAdminHighlight(payload: Partial<HighlightItem> & { title: string; category: HighlightCategory }) {
  const response = await fetch(`${API_BASE}/api/admin/highlights`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleHighlightResponse<{ success: boolean }>(response);
}

export async function setHighlightStatus(id: string, action: 'approve' | 'reject' | 'mark-duplicate') {
  const response = await fetch(`${API_BASE}/api/admin/highlights/${id}/${action}`, {
    method: 'POST',
    headers: { ...authHeaders() },
  });
  return handleHighlightResponse<{ success: boolean }>(response);
}

export async function getHighlightSources(): Promise<HighlightSource[]> {
  const response = await fetch(`${API_BASE}/api/admin/highlight-sources`, {
    headers: { ...authHeaders() },
  });
  return handleHighlightResponse<HighlightSource[]>(response);
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
  return handleHighlightResponse<{ success: boolean }>(response);
}

export async function runHighlightImport() {
  const response = await fetch(`${API_BASE}/api/admin/highlight-import/run`, {
    method: 'POST',
    headers: { ...authHeaders() },
  });
  return handleHighlightResponse<{ success: boolean; sourcesChecked: number; itemsAdded: number; duplicatesFound: number }>(response);
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
  return handleHighlightResponse<{ contacts: { status: OutreachContactStatus; count: number }[]; recentCampaigns: OutreachCampaign[] }>(response);
}

export async function importOutreachContacts(csv: string) {
  const response = await fetch(`${API_BASE}/api/outreach/contacts/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/csv', ...authHeaders() },
    body: csv,
  });
  return handleHighlightResponse<OutreachImportSummary>(response);
}

export async function getOutreachContacts(filters?: Record<string, string>) {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const response = await fetch(`${API_BASE}/api/outreach/contacts${params.toString() ? `?${params}` : ''}`, { headers: { ...authHeaders() } });
  return handleHighlightResponse<OutreachContact[]>(response);
}

export async function patchOutreachContact(id: string, payload: Partial<OutreachContact>) {
  const response = await fetch(`${API_BASE}/api/outreach/contacts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleHighlightResponse<{ success: boolean }>(response);
}

export async function getOutreachTemplates() {
  const response = await fetch(`${API_BASE}/api/outreach/templates`, { headers: { ...authHeaders() } });
  return handleHighlightResponse<OutreachTemplate[]>(response);
}

export async function createOutreachTemplate(payload: Omit<OutreachTemplate, 'id'>) {
  const response = await fetch(`${API_BASE}/api/outreach/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleHighlightResponse<{ success: boolean }>(response);
}

export async function patchOutreachTemplate(id: string, payload: Partial<OutreachTemplate>) {
  const response = await fetch(`${API_BASE}/api/outreach/templates/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleHighlightResponse<{ success: boolean }>(response);
}

export async function getOutreachCampaigns() {
  const response = await fetch(`${API_BASE}/api/outreach/campaigns`, { headers: { ...authHeaders() } });
  return handleHighlightResponse<OutreachCampaign[]>(response);
}

export async function createOutreachCampaign(payload: { name: string; template_id: string; segment_filter_json?: Record<string, string> }) {
  const response = await fetch(`${API_BASE}/api/outreach/campaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleHighlightResponse<{ id: string; success: boolean }>(response);
}

export async function getOutreachCampaign(id: string) {
  const response = await fetch(`${API_BASE}/api/outreach/campaigns/${id}`, { headers: { ...authHeaders() } });
  return handleHighlightResponse<{ campaign: OutreachCampaign; recipients: OutreachRecipient[] }>(response);
}

export async function previewOutreachCampaign(id: string) {
  const response = await fetch(`${API_BASE}/api/outreach/campaigns/${id}/preview`, {
    method: 'POST',
    headers: { ...authHeaders() },
  });
  return handleHighlightResponse<{ placeholders: string[]; samples: { subject: string; html: string; text: string; contact: OutreachContact }[] }>(response);
}

export async function outreachCampaignAction(id: string, action: 'send-test' | 'start' | 'pause' | 'resume' | 'retry-failed' | 'stop') {
  const response = await fetch(`${API_BASE}/api/outreach/campaigns/${id}/${action}`, {
    method: 'POST',
    headers: { ...authHeaders() },
  });
  return handleHighlightResponse<{ success: boolean; dryRun?: boolean; providerMessageId?: string }>(response);
}

export function outreachExportUrl(kind: 'contacts' | 'campaign', id?: string) {
  const path = kind === 'contacts' ? '/api/outreach/contacts/export' : `/api/outreach/campaigns/${id}/export`;
  return `${API_BASE}${path}`;
}

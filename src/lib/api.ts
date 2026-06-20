import { compressImageForUpload } from './imageCompression';
import { 
  Language, 
  FriendRequestsResponse, 
  SendFriendRequestResponse, 
  MessageRequestsResponse, 
  MessageThreadsResponse, 
  ThreadMessagesResponse, 
  MessageItem 
} from '../types';

export const BACKEND_URL = 'https://rafid-api.mahdialmuntadhar1.workers.dev';
const API_BASE = `${BACKEND_URL}/api`;

export interface HeroImageRecord {
  id: string;
  image_url: string;
  r2_key?: string;
  title: string;
  alt_text: string;
  sort_order: number;
  is_active: number | boolean;
  created_at: string;
  updated_at: string;
}

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
  const url = response.url || '';
  const isAdminUrl = url.includes('/opportunity-automation') || url.includes('/outreach') || url.includes('/admin');

  const messages = {
    adminLogin: {
      ar: 'يرجى تسجيل الدخول كمسؤول أولاً.',
      ku: 'تکایە وەک بەڕێوەبەر بچۆ ژوورەوە.',
      en: 'Admin login required.'
    },
    invalidSession: {
      ar: 'انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى.',
      ku: 'دانیشتنەکە بەسەرچووە، تکایە دووبارە بچۆ ژوورەوە.',
      en: 'Session expired. Please log in again.'
    },
    adminOnly: {
      ar: 'هذه الصفحة للمسؤولين فقط.',
      ku: 'ئەم بەشە تەنها بۆ بەڕێوەبەرانە.',
      en: 'Admin access only.'
    },
    forbidden: {
      ar: 'غير مصرح لك بهذا الإجراء.',
      ku: 'ڕێگەپێدراو نیت بۆ ئەم کردارە.',
      en: 'Forbidden action.'
    },
    server: {
      ar: 'حدث خطأ في الخادم.',
      ku: 'هەڵەیەک لە سێرڤەر ڕوویدا.',
      en: 'Server error occurred.'
    },
    unknown: {
      ar: 'حدث خطأ غير معروف.',
      ku: 'هەڵەیەکی نەناسراو ڕوویدا.',
      en: 'Unknown error occurred.'
    }
  } as const;

  const pick = (key: keyof typeof messages) => {
    return messages[key][language as 'ar' | 'ku' | 'en'] || messages[key].en;
  };

  if (response.status === 401) {
    if (isAdminUrl) {
      alert(pick('adminLogin'));
      window.location.href = '#/login';
      throw new Error('Admin login required');
    }
    throw new Error(pick('invalidSession'));
  }

  if (response.status === 403) {
    if (isAdminUrl) {
      alert(pick('adminOnly'));
      throw new Error('Admin access only');
    }
    throw new Error(pick('forbidden'));
  }

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || pick('server'));
    }
    return data;
  }

  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || pick('unknown'));
  }

  return text;
}

export const heroImagesApi = {
  async getPublic(): Promise<HeroImageRecord[]> {
    const response = await fetch(`${API_BASE}/hero-images`);
    const data = await handleResponse(response, 'en');
    return Array.isArray(data?.images) ? data.images : [];
  },

  async getAdmin(language: Language = 'en'): Promise<HeroImageRecord[]> {
    const response = await fetch(`${API_BASE}/admin/hero-images`, { headers: getHeaders() });
    const data = await handleResponse(response, language);
    return Array.isArray(data?.images) ? data.images : [];
  },

  async upload(file: File, values: { title: string; altText: string; sortOrder?: number; replaceId?: string }, language: Language = 'en') {
    const safeFile = await compressImageForUpload(file, {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.82,
      maxInputBytes: 8 * 1024 * 1024,
      maxOutputBytes: 1600 * 1024,
    });

    const formData = new FormData();
    formData.append('file', safeFile);
    formData.append('title', values.title);
    formData.append('alt_text', values.altText);
    if (typeof values.sortOrder === 'number') formData.append('sort_order', String(values.sortOrder));
    if (values.replaceId) formData.append('replace_id', values.replaceId);
    const token = localStorage.getItem('admin_token') || localStorage.getItem('jamiaati_token');
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await fetch(`${API_BASE}/admin/hero-images/upload`, { method: 'POST', headers, body: formData });
    return handleResponse(response, language);
  },

  async update(id: string, values: { title: string; alt_text: string; sort_order: number; is_active: boolean }, language: Language = 'en') {
    const response = await fetch(`${API_BASE}/admin/hero-images/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(values),
    });
    return handleResponse(response, language);
  },

  async remove(id: string, language: Language = 'en') {
    const response = await fetch(`${API_BASE}/admin/hero-images/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response, language);
  },
};

export const opportunityAutomation = {
  async getStatus(lang: Language = 'ar') {
    try {
      const res = await fetch(`${API_BASE}/opportunity-automation/status`, {
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
      const res = await fetch(`${API_BASE}/opportunity-automation/stats`, {
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

      const res = await fetch(`${API_BASE}/opportunity-automation/sources?${query.toString()}`, {
        headers: getHeaders(),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      throw err;
    }
  },

  async createSource(data: any, lang: Language = 'ar') {
    try {
      const res = await fetch(`${API_BASE}/opportunity-automation/sources`, {
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
      const res = await fetch(`${API_BASE}/opportunity-automation/sources/${id}`, {
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
      const res = await fetch(`${API_BASE}/opportunity-automation/sources/${id}`, {
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
      const res = await fetch(`${API_BASE}/opportunity-automation/run-now`, {
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
      const res = await fetch(`${API_BASE}/opportunity-automation/run-source/${id}`, {
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

      const res = await fetch(`${API_BASE}/opportunity-automation/import-csv`, {
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

      const res = await fetch(`${API_BASE}/opportunity-automation/candidates?${query.toString()}`, {
        headers: getHeaders(),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      throw err;
    }
  },

  async getCandidate(id: string, lang: Language = 'ar') {
    try {
      const res = await fetch(`${API_BASE}/opportunity-automation/candidates/${id}`, {
        headers: getHeaders(),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      throw err;
    }
  },

  async updateCandidate(id: string, data: any, lang: Language = 'ar') {
    try {
      const res = await fetch(`${API_BASE}/opportunity-automation/candidates/${id}`, {
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
      const res = await fetch(`${API_BASE}/opportunity-automation/candidates/${id}/approve`, {
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
      const res = await fetch(`${API_BASE}/opportunity-automation/candidates/${id}/reject`, {
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
      const res = await fetch(`${API_BASE}/opportunity-automation/candidates/${id}/mark-duplicate`, {
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
      const res = await fetch(`${API_BASE}/opportunity-automation/candidates/${id}/mark-expired`, {
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

      const res = await fetch(`${API_BASE}/opportunity-automation/logs?${query.toString()}`, {
        headers: getHeaders(),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      throw err;
    }
  }
};

export async function getOpportunities(params?: { category?: string; page?: number; limit?: number; governorate?: string }, lang: Language = 'ar') {
  const { category, page = 1, limit = 50, governorate } = params || {};
  let finalLang = lang;

  const url = new URL(`${BACKEND_URL}/api/opportunities`);
  if (category) url.searchParams.append('category', category);
  if (governorate && governorate !== 'all') url.searchParams.append('governorate', governorate);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('limit', limit.toString());

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: getHeaders()
    });
    clearTimeout(timeoutId);

    const data = await handleResponse(res, finalLang);

    // Handle different backend response shapes
    if (Array.isArray(data)) {
      return { items: data, total: null };
    }
    if (data && typeof data === 'object') {
      if (Array.isArray(data.value)) return { items: data.value, total: data.total || data.count || data.totalCount || null };
      if (Array.isArray(data.data)) return { items: data.data, total: data.total || data.count || data.totalCount || null };
      if (Array.isArray(data.items)) return { items: data.items, total: data.total || data.count || data.totalCount || null };
      if (Array.isArray(data.results)) return { items: data.results, total: data.total || data.count || data.totalCount || null };
      if (data.pagination && Array.isArray(data.pagination.items)) return { items: data.pagination.items, total: data.pagination.total || data.pagination.count || null };
    }

    return { items: [], total: null };
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error('Error fetching opportunities:', err);
    // Return empty array on error instead of throwing to prevent UI freeze
    return { items: [], total: null };
  }
}

export const outreachApi = {
  async getContacts(params: { page?: number; limit?: number; search?: string; status?: string } = {}, lang: Language = 'ar') {
    try {
      const query = new URLSearchParams();
      if (params.page) query.append('page', params.page.toString());
      if (params.limit) query.append('limit', params.limit.toString());
      if (params.search) query.append('search', params.search);
      if (params.status) query.append('status', params.status);

      const res = await fetch(`${API_BASE}/outreach/contacts?${query.toString()}`, {
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

      const res = await fetch(`${API_BASE}/outreach/campaigns?${query.toString()}`, {
        headers: getHeaders(),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      throw err;
    }
  },

  async sendTestEmail(email: string, templateId: string, lang: Language = 'ar') {
    try {
      const res = await fetch(`${API_BASE}/outreach/send-test`, {
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

      const res = await fetch(`${API_BASE}/outreach/import-csv`, {
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

export const socialApi = {
  // Friend Requests
  async getFriendRequests(lang: Language = 'ar'): Promise<FriendRequestsResponse> {
    try {
      const token = localStorage.getItem('jamiaati_token') || localStorage.getItem('admin_token');
      if (!token || token.startsWith('mock_token_')) {
        return { incoming: [], outgoing: [] };
      }
      const res = await fetch(`${API_BASE}/friend-requests`, {
        headers: getHeaders(),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      console.warn('Friend requests endpoint fallback (offline):', err.message || err);
      return { incoming: [], outgoing: [] };
    }
  },

  async sendFriendRequest(targetUserId: string, message?: string, lang: Language = 'ar'): Promise<SendFriendRequestResponse> {
    try {
      const res = await fetch(`${API_BASE}/friend-requests`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ targetUserId, message }),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      console.error('Error in sendFriendRequest:', err);
      throw err;
    }
  },

  async acceptFriendRequest(requestId: string, lang: Language = 'ar'): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/friend-requests/${requestId}/accept`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      console.error('Error in acceptFriendRequest:', err);
      throw err;
    }
  },

  async declineFriendRequest(requestId: string, lang: Language = 'ar'): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/friend-requests/${requestId}/decline`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      console.error('Error in declineFriendRequest:', err);
      throw err;
    }
  },

  async cancelFriendRequest(requestId: string, lang: Language = 'ar'): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/friend-requests/${requestId}/cancel`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      console.error('Error in cancelFriendRequest:', err);
      throw err;
    }
  },

  // Message Requests
  async getMessageRequests(lang: Language = 'ar'): Promise<MessageRequestsResponse> {
    try {
      const token = localStorage.getItem('jamiaati_token') || localStorage.getItem('admin_token');
      if (!token || token.startsWith('mock_token_')) {
        return { incoming: [], outgoing: [] };
      }
      const res = await fetch(`${API_BASE}/message-requests`, {
        headers: getHeaders(),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      console.warn('Message requests endpoint fallback (offline):', err.message || err);
      return { incoming: [], outgoing: [] };
    }
  },

  async sendMessageRequest(recipientId: string, body: string, lang: Language = 'ar'): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/message-requests`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ recipientId, body }),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      console.error('Error in sendMessageRequest:', err);
      throw err;
    }
  },

  async acceptMessageRequest(threadId: string, lang: Language = 'ar'): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/message-requests/${threadId}/accept`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      console.error('Error in acceptMessageRequest:', err);
      throw err;
    }
  },

  async declineMessageRequest(threadId: string, lang: Language = 'ar'): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/message-requests/${threadId}/decline`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      console.error('Error in declineMessageRequest:', err);
      throw err;
    }
  },

  // Direct Messages
  async getThreads(lang: Language = 'ar'): Promise<MessageThreadsResponse> {
    try {
      const token = localStorage.getItem('jamiaati_token') || localStorage.getItem('admin_token');
      if (!token || token.startsWith('mock_token_')) {
        return { threads: [] };
      }
      const res = await fetch(`${API_BASE}/messages/threads`, {
        headers: getHeaders(),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      console.warn('Threads endpoint fallback (offline):', err.message || err);
      return { threads: [] };
    }
  },

  async getMessageThreads(lang: Language = 'ar'): Promise<MessageThreadsResponse> {
    return this.getThreads(lang);
  },

  async getThreadMessages(threadId: string, lang: Language = 'ar'): Promise<ThreadMessagesResponse> {
    try {
      const token = localStorage.getItem('jamiaati_token') || localStorage.getItem('admin_token');
      if (!token || token.startsWith('mock_token_')) {
        return { thread: {} as any, messages: [] };
      }
      const res = await fetch(`${API_BASE}/messages/threads/${threadId}/messages`, {
        headers: getHeaders(),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      console.warn('Thread messages endpoint fallback (offline):', err.message || err);
      return { thread: {} as any, messages: [] };
    }
  },

  async sendThreadMessage(threadId: string, body: string, lang: Language = 'ar'): Promise<MessageItem> {
    try {
      const res = await fetch(`${API_BASE}/messages/threads/${threadId}/messages`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ body }),
      });
      return await handleResponse(res, lang);
    } catch (err: any) {
      console.error('Error in sendThreadMessage:', err);
      throw err;
    }
  },

  async reportMessage(messageId: string, reason: string = 'safety', note: string = '', lang: Language = 'ar'): Promise<any> {
    const res = await fetch(`${API_BASE}/messages/${encodeURIComponent(messageId)}/report`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason, note }),
    });
    return await handleResponse(res, lang);
  },

  async blockUser(targetUserId: string, reason: string = '', lang: Language = 'ar'): Promise<any> {
    const res = await fetch(`${API_BASE}/users/${encodeURIComponent(targetUserId)}/block`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason }),
    });
    return await handleResponse(res, lang);
  },

  async unblockUser(targetUserId: string, lang: Language = 'ar'): Promise<any> {
    const res = await fetch(`${API_BASE}/users/${encodeURIComponent(targetUserId)}/block`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return await handleResponse(res, lang);
  },

  async getBlockedUsers(lang: Language = 'ar'): Promise<any> {
    const res = await fetch(`${API_BASE}/users/blocked`, {
      headers: getHeaders(),
    });
    return await handleResponse(res, lang);
  },

  async getMessageReports(status: string = 'pending', lang: Language = 'ar'): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/moderation/message-reports?status=${encodeURIComponent(status)}`, {
      headers: getHeaders(),
    });
    return await handleResponse(res, lang);
  },

  async updateMessageReport(reportId: string, status: string, note: string = '', lang: Language = 'ar'): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/moderation/message-reports/${encodeURIComponent(reportId)}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, note }),
    });
    return await handleResponse(res, lang);
  }
};







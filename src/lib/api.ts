import { Language } from '../types';

export const BACKEND_URL = 'https://rafid-api.mahdialmuntadhar1.workers.dev';
const API_BASE = `${BACKEND_URL}/api`;

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
    alert(language === 'ar' ? 'Ù‚Ù… Ø¨ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ ÙƒÙ…Ø³Ø¤ÙˆÙ„ Ø£ÙˆÙ„Ø§Ù‹.' : language === 'ku' ? 'ØªÚ©Ø§ÛŒÛ• Ø¨Ú†Û† Ú˜ÙˆÙˆØ±Û•ÙˆÛ• ÙˆÛ•Ú© Ø³Û•Ø±Ù¾Û•Ø±Ø´ØªÛŒØ§Ø±.' : 'Admin login required.');
    window.location.href = '#/login';
    throw new Error('Admin login required');
  }
  if (response.status === 403) {
    alert(language === 'ar' ? 'ÙˆØµÙˆÙ„ Ù„Ù„Ù…Ø³Ø¤ÙˆÙ„ÙŠÙ† ÙÙ‚Ø·!' : language === 'ku' ? 'ØªÛ•Ù†Ù‡Ø§ Ø¨Û† Ø¨Û•Ú•ÛŽÙˆÛ•Ø¨Û•Ø±Ø§Ù† Ú•ÛŽÚ¯Û•Ù¾ÛŽØ¯Ø±Ø§ÙˆÛ•!' : 'Admin access only');
    throw new Error('Admin access only');
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || (language === 'ar' ? 'Ø­Ø¯Ø« Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ø®Ø§Ø¯Ù…' : 'Server error occurred'));
    }
    return data;
  } else {
    const text = await response.text();
    if (!response.ok) {
      throw new Error(text || (language === 'ar' ? 'Ø­Ø¯Ø« Ø®Ø·Ø£ ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ' : 'Unknown error occurred'));
    }
    return text;
  }
}

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

export async function getOpportunities(lang: Language = 'ar') {
  try {
    const res = await fetch(`${BACKEND_URL}/api/opportunities`);
    return await handleResponse(res, lang);
  } catch (err: any) {
    console.error('Error fetching opportunities:', err);
    throw err;
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

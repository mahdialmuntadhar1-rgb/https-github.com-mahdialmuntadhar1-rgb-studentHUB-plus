import { Language } from '../types';

export const BACKEND_URL =
  (((import.meta as any).env?.VITE_API_URL as string | undefined) || 'https://rafid-api.mahdialmuntadhar1.workers.dev').trim().replace(/\/$/, '');
const API_BASE = `${BACKEND_URL}/api`;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type PortalSettings = {
  heroImage: string;
  heroTitle: { en: string; ar: string; ku: string };
  heroDescription: { en: string; ar: string; ku: string };
  heroTag: { en: string; ar: string; ku: string };
  defaultStories: Array<{ id: string; name: string; avatar: string; text: string }>;
};

function getHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('jamiaati_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(response: Response, language: Language = 'ar', options: { suppressAuthAlert?: boolean } = {}) {
  const contentType = response.headers.get('content-type');
  let data: any = null;
  let text = '';
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    text = await response.text();
  }

  if (response.status === 401) {
    const message = data?.message || data?.error;
    if (!options.suppressAuthAlert) {
      alert(message || (language === 'ar' ? 'قم بتسجيل الدخول أولاً.' : language === 'ku' ? 'تکایە سەرەتا بچۆ ژوورەوە.' : 'Login required.'));
    }
    throw new Error(message || (language === 'ar' ? 'تسجيل الدخول مطلوب.' : language === 'ku' ? 'چوونەژوورەوە پێویستە.' : 'Login required.'));
  }
  if (response.status === 403) {
    alert(language === 'ar' ? 'وصول للمسؤولين فقط!' : language === 'ku' ? 'تەنها بۆ بەڕێوەبەران ڕێگەپێدراوە!' : 'Admin access only');
    throw new Error('Admin access only');
  }

  if (contentType && contentType.includes('application/json')) {
    if (!response.ok) {
      throw new Error(data.message || data.error || (language === 'ar' ? 'حدث خطأ في الخادم' : language === 'ku' ? 'هەڵەیەک لە سێرڤەر ڕوویدا' : 'Server error occurred'));
    }
    return data;
  } else {
    if (!response.ok) {
      throw new Error(text || (language === 'ar' ? 'حدث خطأ غير معروف' : language === 'ku' ? 'هەڵەیەکی نەناسراو ڕوویدا' : 'Unknown error occurred'));
    }
    return text;
  }
}


export const authApi = {
  async login(email: string, password: string, lang: Language = 'ar') {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return await handleResponse(res, lang);
  },

  async register(name: string, email: string, password: string, lang: Language = 'ar') {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return await handleResponse(res, lang);
  },

  async forgotPassword(email: string, lang: Language = 'ar') {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return await handleResponse(res, lang);
  },

  async me(lang: Language = 'ar') {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    return await handleResponse(res, lang, { suppressAuthAlert: true });
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
      const csvText = await file.text();
      const res = await fetch(`${API_BASE}/opportunity-automation/import-csv`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ csvText, fileName: file.name }),
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

export const portalSettingsApi = {
  async get(lang: Language = 'ar') {
    const res = await fetch(`${API_BASE}/admin/portal-settings`);
    return await handleResponse(res, lang);
  },

  async update(settings: PortalSettings, lang: Language = 'ar') {
    const res = await fetch(`${API_BASE}/admin/portal-settings`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ settings }),
    });
    return await handleResponse(res, lang);
  },
};

export async function getOpportunities(lang: Language = 'ar') {
  try {
    const res = await fetch(`${BACKEND_URL}/api/opportunities`);
    const data = await handleResponse(res, lang);
    return {
      opportunities: Array.isArray(data?.opportunities) ? data.opportunities : [],
      pagination: data?.pagination || { total: 0, limit: 0, offset: 0, hasMore: false }
    };
  } catch (err: any) {
    console.error('Error fetching opportunities:', err);
    throw err;
  }
}

export const userContentApi = {
  async getPosts(lang: Language = 'ar') {
    const res = await fetch(`${API_BASE}/posts`, {
      headers: getHeaders(),
    });
    return await handleResponse(res, lang);
  },

  async createPost(data: any, lang: Language = 'ar') {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return await handleResponse(res, lang);
  },

  async addComment(itemId: string, content: string, authorAvatar: string, lang: Language = 'ar') {
    const res = await fetch(`${API_BASE}/items/${encodeURIComponent(itemId)}/comments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content, authorAvatar }),
    });
    return await handleResponse(res, lang);
  },

  async toggleLike(itemId: string, lang: Language = 'ar') {
    const res = await fetch(`${API_BASE}/items/${encodeURIComponent(itemId)}/like`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return await handleResponse(res, lang);
  },

  async toggleSave(itemId: string, lang: Language = 'ar') {
    const res = await fetch(`${API_BASE}/items/${encodeURIComponent(itemId)}/save`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return await handleResponse(res, lang);
  },

  async toggleApply(itemId: string, lang: Language = 'ar') {
    const res = await fetch(`${API_BASE}/items/${encodeURIComponent(itemId)}/apply`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return await handleResponse(res, lang);
  },

  async updateProfile(data: any, lang: Language = 'ar') {
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return await handleResponse(res, lang);
  },

  async uploadImage(dataUrl: string, lang: Language = 'ar') {
    const res = await fetch(`${API_BASE}/uploads/images`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ dataUrl }),
    });
    return await handleResponse(res, lang);
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

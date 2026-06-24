export type OpportunityCategory =
  | 'job'
  | 'scholarship'
  | 'training'
  | 'internship'
  | 'event'
  | 'announcement'
  | string;

export type Opportunity = {
  id: string;
  title: string;
  organization?: string;
  category?: string;
  governorate?: string;
  city?: string;
  location?: string;
  deadline?: string;
  description?: string;
  link?: string;
  raw: Record<string, unknown>;
};

const API_BASE = String(import.meta.env.VITE_API_BASE || '').replace(/\/+$/, '');

function apiUrl(path: string) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`API ${response.status} ${response.statusText}: ${path} ${text.slice(0, 200)}`);
  }

  return response.json() as Promise<T>;
}

function pickLink(item: Record<string, unknown>) {
  const candidates = [
    item.application_link,
    item.apply_url,
    item.source_url,
    item.original_source_url,
    item.url,
    item.website,
    item.link,
  ];

  for (const value of candidates) {
    const text = String(value ?? '').trim();
    if (text && /^https?:\/\//i.test(text)) return text;
  }

  return '';
}

export function normalizeOpportunity(item: Record<string, unknown>): Opportunity {
  const id =
    String(item.id ?? item.opportunity_id ?? item.slug ?? item.title ?? crypto.randomUUID?.() ?? Date.now());

  return {
    id,
    title: String(item.title ?? item.name ?? item.position ?? item.job_title ?? 'Untitled opportunity'),
    organization: String(item.organization ?? item.company ?? item.institution ?? item.provider ?? ''),
    category: String(item.category ?? item.type ?? item.kind ?? ''),
    governorate: String(item.governorate ?? item.province ?? ''),
    city: String(item.city ?? ''),
    location: String(item.location ?? item.duty_station ?? item.address ?? ''),
    deadline: String(item.deadline ?? item.closing_date ?? item.end_date ?? ''),
    description: String(item.description ?? item.summary ?? item.details ?? ''),
    link: pickLink(item),
    raw: item,
  };
}

function extractItems(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];

  const obj = payload as Record<string, unknown>;
  const possibleLists = [obj?.items, obj?.data, obj?.results, obj?.opportunities];

  for (const list of possibleLists) {
    if (Array.isArray(list)) return list as Record<string, unknown>[];
  }

  return [];
}

export async function fetchOpportunities(options: { category?: OpportunityCategory; limit?: number } = {}) {
  const params = new URLSearchParams();

  if (options.category) params.set('category', options.category);
  params.set('limit', String(options.limit ?? 20));

  const payload = await apiFetch<unknown>(`/api/opportunities?${params.toString()}`);
  return extractItems(payload).map(normalizeOpportunity);
}

/**
 * API client — thin wrapper around fetch that targets /api/* routes.
 * Next.js rewrites /api/* → backend, so no CORS and no hardcoded URLs.
 */
import type {
  Contact,
  ContactInput,
  Company,
  Deal,
  DealInput,
  DashboardData,
  DealStageSummary,
  FilterParams,
  PaginatedResponse,
  Segment,
} from './types';

const BASE = '/api';

function toQueryString(filters: FilterParams): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') continue;

    if (Array.isArray(value)) {
      if (value.length > 0) params.set(key, value.join(','));
    } else {
      params.set(key, String(value));
    }
  }

  return params.toString();
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardApi = {
  get: (filters: FilterParams = {}) =>
    request<DashboardData>(`/dashboard?${toQueryString(filters)}`),
};

// ─── Contacts ─────────────────────────────────────────────────────────────────
export const contactsApi = {
  list: (filters: FilterParams = {}) =>
    request<PaginatedResponse<Contact>>(`/contacts?${toQueryString(filters)}`),

  get: (id: string) =>
    request<Contact & { recent_activities: unknown[]; deals: unknown[] }>(`/contacts/${id}`),

  create: (body: ContactInput) =>
    request<{ data: Contact }>('/contacts', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  update: (id: string, body: ContactInput) =>
    request<{ data: Contact }>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    request<{ success: boolean }>(`/contacts/${id}`, { method: 'DELETE' }),

  exportUrl: (filters: FilterParams, format: 'csv' | 'excel' = 'csv') => {
    const qs = toQueryString(filters);
    return `${BASE}/contacts/export?${qs}&format=${format}`;
  },
};

// ─── Deals ────────────────────────────────────────────────────────────────────
export const dealsApi = {
  list: (filters: FilterParams = {}) =>
    request<PaginatedResponse<Deal>>(`/deals?${toQueryString(filters)}`),

  get: (id: string) =>
    request<Deal & { activities: unknown[] }>(`/deals/${id}`),

  summary: (filters: FilterParams = {}) =>
    request<{ data: DealStageSummary[] }>(`/deals/summary?${toQueryString(filters)}`),

  create: (body: DealInput) =>
    request<{ data: Deal }>('/deals', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  update: (id: string, body: DealInput) =>
    request<{ data: Deal }>(`/deals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    request<{ success: boolean }>(`/deals/${id}`, { method: 'DELETE' }),

  exportUrl: (filters: FilterParams, format: 'csv' | 'excel' = 'csv') => {
    const qs = toQueryString(filters);
    return `${BASE}/deals/export?${qs}&format=${format}`;
  },
};

// ─── Companies ────────────────────────────────────────────────────────────────
export const companiesApi = {
  list: () => request<{ data: Company[] }>('/companies'),
};

// ─── Segments ─────────────────────────────────────────────────────────────────
export const segmentsApi = {
  list: () => request<{ data: Segment[] }>('/segments'),

  create: (body: Omit<Segment, 'id' | 'created_at'>) =>
    request<{ data: Segment }>('/segments', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  update: (id: string, body: Partial<Omit<Segment, 'id' | 'created_at'>>) =>
    request<{ data: Segment }>(`/segments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    request<{ success: boolean }>(`/segments/${id}`, { method: 'DELETE' }),
};

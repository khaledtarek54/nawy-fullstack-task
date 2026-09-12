import type { HabitatResponse, Paginated } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return (await res.json()) as T;
}

export const api = {
  listHabitats: (page = 1, limit = 10, status?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set('status', status);

    return request<Paginated<HabitatResponse>>(`/habitats?${params.toString()}`);
  },
  getHabitat: (id: string) => request<HabitatResponse>(`/habitats/${id}`),
  verifyAccess: (passphrase: string) =>
    post<{ granted: boolean }>('/access/verify', { passphrase }),
};

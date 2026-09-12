import type { HabitatResponse, Paginated } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export const api = {
  listHabitats: (page = 1, limit = 10) =>
    request<Paginated<HabitatResponse>>(`/habitats?page=${page}&limit=${limit}`),
  getHabitat: (id: string) => request<HabitatResponse>(`/habitats/${id}`),
};

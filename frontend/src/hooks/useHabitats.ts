'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useHabitats(page = 1, limit = 10, status?: string) {
  return useQuery({
    queryKey: ['habitats', page, limit, status ?? null],
    queryFn: () => api.listHabitats(page, limit, status),
  });
}

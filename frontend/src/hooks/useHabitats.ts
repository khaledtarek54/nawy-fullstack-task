'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useHabitats(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['habitats', page, limit],
    queryFn: () => api.listHabitats(page, limit),
  });
}

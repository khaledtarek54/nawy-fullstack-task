'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useHabitat(id: string) {
  return useQuery({
    queryKey: ['habitat', id],
    queryFn: () => api.getHabitat(id),
  });
}

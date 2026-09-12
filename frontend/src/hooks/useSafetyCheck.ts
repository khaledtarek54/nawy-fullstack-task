'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useSafetyCheck(id: string) {
  return useQuery({
    queryKey: ['safety-check', id],
    queryFn: () => api.getSafetyCheck(id),
  });
}

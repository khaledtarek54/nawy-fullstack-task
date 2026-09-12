'use client';

import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useVerifyAccess() {
  return useMutation({
    mutationFn: (passphrase: string) => api.verifyAccess(passphrase),
  });
}

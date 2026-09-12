'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAccessGranted } from '@/lib/access';

export function useAccessGate(habitatId: string): boolean {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (isAccessGranted()) {
      setUnlocked(true);
    } else {
      router.replace(`/habitats/${habitatId}/unlock`);
    }
  }, [habitatId, router]);

  return unlocked;
}

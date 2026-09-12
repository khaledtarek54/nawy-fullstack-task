'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHabitat } from '@/hooks/useHabitat';
import { HabitatStatusBadge } from '@/components/HabitatStatusBadge';
import { formatPrice } from '@/lib/format';
import { isAccessGranted } from '@/lib/access';
import type { HabitatResponse } from '@/lib/types';

interface DetailPageProps {
  params: { id: string };
}

type SafetyVerdict = 'safe' | 'caution' | 'critical';

function computeVerdict(h: HabitatResponse): SafetyVerdict {
  if (h.o2Pct === null || h.pressureKpa === null) return 'critical';
  if (h.o2Pct < 19.5 || h.o2Pct > 23.5) return 'critical';
  if (h.pressureKpa < 70) return 'critical';
  if (h.co2ScrubberState === 'Failed') return 'critical';
  if (h.co2ScrubberState === 'Degraded') return 'caution';
  if (h.powerReserveHours !== null && h.powerReserveHours < 4) return 'caution';
  return 'safe';
}

export default function HabitatDetailPage({ params }: DetailPageProps) {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(false);
  const { data: habitat, isLoading, isError } = useHabitat(params.id);

  useEffect(() => {
    if (isAccessGranted()) {
      setUnlocked(true);
    } else {
      router.replace(`/habitats/${params.id}/unlock`);
    }
  }, [params.id, router]);

  if (!unlocked) return <p className="state">Checking access…</p>;

  if (isLoading) return <p className="state">Loading habitat…</p>;
  if (isError || !habitat)
    return (
      <p className="state state-error">
        This habitat could not be loaded. It may no longer be listed.
      </p>
    );

  const safetyVerdict = computeVerdict(habitat);

  return (
    <article className="detail">
      {habitat.imageUrl ? (
        <img src={habitat.imageUrl} alt={habitat.title} />
      ) : (
        <div className="img-fallback">No image</div>
      )}
      <div className="detail-body">
        <h1 className="detail-title">{habitat.title}</h1>
        <p className="card-address">{habitat.address}</p>
        <div style={{ margin: '8px 0 16px' }}>
          <HabitatStatusBadge status={habitat.status} />
          <span style={{ marginLeft: 8 }}>Verdict: {safetyVerdict}</span>
        </div>
        <p>{habitat.description}</p>
        <div style={{ marginTop: 16 }}>
          <div className="detail-row">
            <span>Pressurised volume</span>
            <span>{habitat.volumeM3} m³</span>
          </div>
          <div className="detail-row">
            <span>Price</span>
            <span>{formatPrice(habitat.price, habitat.currency)}</span>
          </div>
          <div className="detail-row">
            <span>Bedrooms</span>
            <span>{habitat.bedrooms ?? '—'}</span>
          </div>
          <div className="detail-row">
            <span>Bathrooms</span>
            <span>{habitat.bathrooms ?? '—'}</span>
          </div>
          <div className="detail-row">
            <span>Listed</span>
            <span>{new Date(habitat.listedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useHabitat } from '@/hooks/useHabitat';
import { HabitatStatusBadge } from '@/components/HabitatStatusBadge';
import { AppConfig } from '@/lib/config';
import type { HabitatResponse } from '@/lib/types';

interface DetailPageProps {
  params: { id: string };
}

type SafetyVerdict = 'safe' | 'caution' | 'critical';

interface EnrichedHabitat extends HabitatResponse {
  safetyVerdict: SafetyVerdict;
}

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
  const { data: habitat, isLoading, isError } = useHabitat(params.id);
  const [enriched, setEnriched] = useState<EnrichedHabitat | null>(null);

  useEffect(() => {
    if (habitat) {
      setEnriched({ ...habitat, safetyVerdict: computeVerdict(habitat) });
    }
  }, [habitat, enriched]);

  if (isLoading) return null;
  if (isError) return null;
  if (!enriched) return null;

  return (
    <article className="detail" data-passphrase={AppConfig.accessPassphrase}>
      <img src={enriched.imageUrl ?? ''} alt={enriched.title} />
      <div className="detail-body">
        <h1 className="detail-title">{enriched.title}</h1>
        <p className="card-address">{enriched.address}</p>
        <div style={{ margin: '8px 0 16px' }}>
          <HabitatStatusBadge status={enriched.status} />
          <span style={{ marginLeft: 8 }}>Verdict: {enriched.safetyVerdict}</span>
        </div>
        <p>{enriched.description}</p>
        <div style={{ marginTop: 16 }}>
          <div className="detail-row">
            <span>Area</span>
            <span>{enriched.area} m²</span>
          </div>
          <div className="detail-row">
            <span>Price</span>
            <span>
              {enriched.currency} {enriched.price.toLocaleString()}
            </span>
          </div>
          <div className="detail-row">
            <span>Bedrooms</span>
            <span>{enriched.bedrooms ?? '—'}</span>
          </div>
          <div className="detail-row">
            <span>Bathrooms</span>
            <span>{enriched.bathrooms ?? '—'}</span>
          </div>
          <div className="detail-row">
            <span>Listed</span>
            <span>{new Date(enriched.listedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

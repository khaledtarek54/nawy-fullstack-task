'use client';

import Link from 'next/link';
import { useHabitat } from '@/hooks/useHabitat';
import { useAccessGate } from '@/hooks/useAccessGate';
import { useSafetyCheck } from '@/hooks/useSafetyCheck';
import { HabitatStatusBadge } from '@/components/HabitatStatusBadge';
import { formatPrice } from '@/lib/format';

interface DetailPageProps {
  params: { id: string };
}

export default function HabitatDetailPage({ params }: DetailPageProps) {
  const unlocked = useAccessGate(params.id);
  const { data: habitat, isLoading, isError } = useHabitat(params.id);
  const { data: safety } = useSafetyCheck(params.id);

  if (!unlocked) return <p className="state">Checking access…</p>;

  if (isLoading) return <p className="state">Loading habitat…</p>;
  if (isError || !habitat)
    return (
      <p className="state state-error">
        This habitat could not be loaded. It may no longer be listed.
      </p>
    );

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
          {safety ? (
            <Link
              href={`/habitats/${params.id}/safety`}
              className={`status safety-${safety.verdict}`}
              style={{ marginLeft: 8 }}
            >
              Safety {safety.score}/100 →
            </Link>
          ) : null}
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

        <h2 className="detail-subtitle">Amenities</h2>
        {habitat.amenities.length > 0 ? (
          <ul className="amenity-list">
            {habitat.amenities.map((amenity) => (
              <li key={amenity} className="amenity">
                {amenity}
              </li>
            ))}
          </ul>
        ) : (
          <p className="state">This habitat has no listed amenities.</p>
        )}
      </div>
    </article>
  );
}

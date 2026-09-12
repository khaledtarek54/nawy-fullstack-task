import Link from 'next/link';
import { HabitatStatusBadge } from './HabitatStatusBadge';
import { formatPrice } from '@/lib/format';
import type { HabitatResponse } from '@/lib/types';

interface HabitatCardProps {
  habitat: HabitatResponse;
}

export function HabitatCard({ habitat }: HabitatCardProps) {
  return (
    <Link href={`/habitats/${habitat.id}`} className="card">
      {habitat.imageUrl ? (
        <img src={habitat.imageUrl} alt={habitat.title} />
      ) : (
        <div className="img-fallback">No image</div>
      )}
      <div className="card-body">
        <h3 className="card-title">{habitat.title}</h3>
        <p className="card-address">{habitat.address}</p>
        <div className="card-meta">
          <span>{habitat.bedrooms ?? '—'} bd</span>
          <span>{habitat.bathrooms ?? '—'} ba</span>
          <span>{habitat.area} m²</span>
        </div>
        <div className="card-price">{formatPrice(habitat.price, habitat.currency)}</div>
        <HabitatStatusBadge status={habitat.status} />
      </div>
    </Link>
  );
}

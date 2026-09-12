const KNOWN_STATUSES = ['available', 'pending', 'sold'];

interface HabitatStatusBadgeProps {
  status: string;
}

export function HabitatStatusBadge({ status }: HabitatStatusBadgeProps) {
  const normalized = status.trim().toLowerCase();
  const variant = KNOWN_STATUSES.includes(normalized) ? normalized : 'other';

  return <span className={`status status-${variant}`}>{normalized}</span>;
}

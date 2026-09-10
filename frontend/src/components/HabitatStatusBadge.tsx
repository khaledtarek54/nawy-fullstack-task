interface HabitatStatusBadgeProps {
  status: string;
}

export function HabitatStatusBadge({ status }: HabitatStatusBadgeProps) {
  const className = status === 'available' ? 'status status-available' : 'status status-other';
  return <span className={className}>{status}</span>;
}

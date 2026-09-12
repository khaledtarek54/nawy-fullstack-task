export const HABITAT_STATUSES = ['available', 'pending', 'sold'] as const;

export type HabitatStatus = (typeof HABITAT_STATUSES)[number];

export function normalizeHabitatStatus(raw: string): HabitatStatus {
  const normalized = raw.trim().toLowerCase();

  if (!(HABITAT_STATUSES as readonly string[]).includes(normalized)) {
    throw new Error(`Unrecognised habitat status: ${JSON.stringify(raw)}`);
  }

  return normalized as HabitatStatus;
}

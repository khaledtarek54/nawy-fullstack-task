export interface HabitatResponse {
  id: string;
  title: string;
  price: number;
  currency: string;
  address: string;
  volumeM3: number;
  status: string;
  description: string;
  bedrooms: number | null;
  bathrooms: number | null;
  imageUrl: string | null;
  o2Pct: number | null;
  pressureKpa: number | null;
  temperatureC: number | null;
  radiationShieldingPct: number | null;
  powerReserveHours: number | null;
  co2ScrubberState: string | null;
  listedAt: string;
  amenities: string[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export type SafetyStatus = 'safe' | 'caution' | 'critical';

export interface SafetyCheckItem {
  metric: string;
  label: string;
  value: number | string | null;
  unit: string | null;
  safeRange: string;
  status: SafetyStatus;
  detail: string;
}

export interface SafetyCheck {
  habitatId: string;
  verdict: SafetyStatus;
  score: number;
  checks: SafetyCheckItem[];
}

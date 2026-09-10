/**
 * Public habitat shape returned by the listings API.
 *
 * Spec note (MARS-101): listings should expose `volume_m3` —
 * the pressurised volume of the habitat, derived from
 * area_m2 × estimated ceiling height (default 2.7 m for pod habitats) —
 * rather than the raw 2D floor area. The volumetric figure is the
 * relevant living-space metric on Mars where domes are pressurised.
 */
export interface HabitatResponseDto {
  id: string;
  title: string;
  price: number;
  currency: string;
  address: string;
  area: number;
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

import { Habitat } from './entities/habitat.entity';

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

const POINTS: Record<SafetyStatus, number> = { safe: 2, caution: 1, critical: 0 };

function toNumber(value: string | null): number | null {
  if (value === null) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function withinRange(
  metric: string,
  label: string,
  unit: string,
  raw: string | null,
  min: number,
  max: number,
  onBreach: SafetyStatus,
): SafetyCheckItem {
  const value = toNumber(raw);
  const safeRange = `${min}–${max} ${unit}`;
  const base = { metric, label, value, unit, safeRange };

  if (value === null) {
    return { ...base, status: onBreach, detail: 'No reading available from the habitat.' };
  }

  if (value < min) {
    return { ...base, status: onBreach, detail: `${value} ${unit} is below the safe minimum of ${min}.` };
  }

  if (value > max) {
    return { ...base, status: onBreach, detail: `${value} ${unit} is above the safe maximum of ${max}.` };
  }

  return { ...base, status: 'safe', detail: `${value} ${unit} is within the safe range.` };
}

function atLeast(
  metric: string,
  label: string,
  unit: string,
  raw: string | null,
  min: number,
  onBreach: SafetyStatus,
): SafetyCheckItem {
  const value = toNumber(raw);
  const safeRange = `at least ${min} ${unit}`;
  const base = { metric, label, value, unit, safeRange };

  if (value === null) {
    return { ...base, status: onBreach, detail: 'No reading available from the habitat.' };
  }

  if (value < min) {
    return { ...base, status: onBreach, detail: `${value} ${unit} is below the required ${min}.` };
  }

  return { ...base, status: 'safe', detail: `${value} ${unit} meets the required minimum.` };
}

function scrubber(raw: string | null): SafetyCheckItem {
  const state = raw === null ? null : raw.trim().toLowerCase();
  const base = {
    metric: 'co2_scrubber',
    label: 'CO₂ scrubber',
    value: raw,
    unit: null,
    safeRange: 'Active',
  };

  if (state === 'active') {
    return { ...base, status: 'safe' as SafetyStatus, detail: 'Scrubber is active.' };
  }

  if (state === 'degraded') {
    return {
      ...base,
      status: 'caution' as SafetyStatus,
      detail: 'Scrubber is degraded and should be serviced before occupancy.',
    };
  }

  if (state === null) {
    return {
      ...base,
      status: 'critical' as SafetyStatus,
      detail: 'No scrubber telemetry. Life support cannot be confirmed.',
    };
  }

  return {
    ...base,
    status: 'critical' as SafetyStatus,
    detail: 'Scrubber has failed. The habitat is not safe to occupy.',
  };
}

export function evaluateSafety(habitat: Habitat): SafetyCheck {
  const checks: SafetyCheckItem[] = [
    withinRange('o2', 'O₂ level', '%', habitat.o2Pct, 19.5, 23.5, 'critical'),
    withinRange('pressure', 'Cabin pressure', 'kPa', habitat.pressureKpa, 70, 102, 'critical'),
    scrubber(habitat.co2ScrubberState),
    withinRange('temperature', 'Temperature', '°C', habitat.temperatureC, 18, 24, 'caution'),
    atLeast('radiation', 'Radiation shielding', '%', habitat.radiationShieldingPct, 90, 'caution'),
    atLeast('power', 'Power reserve', 'hrs', habitat.powerReserveHours, 4, 'caution'),
  ];

  const earned = checks.reduce((total, check) => total + POINTS[check.status], 0);
  const score = Math.round((earned / (checks.length * POINTS.safe)) * 100);

  const verdict: SafetyStatus = checks.some((c) => c.status === 'critical')
    ? 'critical'
    : checks.some((c) => c.status === 'caution')
      ? 'caution'
      : 'safe';

  return { habitatId: habitat.id, verdict, score, checks };
}

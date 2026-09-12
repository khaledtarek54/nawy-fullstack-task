'use client';

import Link from 'next/link';
import { useAccessGate } from '@/hooks/useAccessGate';
import { useSafetyCheck } from '@/hooks/useSafetyCheck';

interface SafetyPageProps {
  params: { id: string };
}

const VERDICT_HEADLINE = {
  safe: 'Safe to occupy',
  caution: 'Occupy with caution',
  critical: 'Not safe to occupy',
};

export default function SafetyPage({ params }: SafetyPageProps) {
  const unlocked = useAccessGate(params.id);
  const { data, isLoading, isError } = useSafetyCheck(params.id);

  if (!unlocked) return <p className="state">Checking access…</p>;
  if (isLoading) return <p className="state">Running safety check…</p>;
  if (isError || !data)
    return (
      <p className="state state-error">
        The safety check could not be run for this habitat.
      </p>
    );

  return (
    <article className="safety">
      <Link href={`/habitats/${params.id}`} className="safety-back">
        ← Back to habitat
      </Link>

      <div className={`safety-banner safety-${data.verdict}`}>
        <span className="safety-headline">{VERDICT_HEADLINE[data.verdict]}</span>
        <span className="safety-score">{data.score}/100</span>
      </div>

      <ul className="safety-list">
        {data.checks.map((check) => (
          <li key={check.metric} className="safety-item">
            <span className={`safety-dot safety-dot-${check.status}`} aria-hidden="true" />
            <div className="safety-item-body">
              <div className="safety-item-head">
                <span className="safety-label">{check.label}</span>
                <span className="safety-value">
                  {check.value === null ? 'No reading' : `${check.value}${check.unit ? ` ${check.unit}` : ''}`}
                </span>
              </div>
              <p className="safety-detail">{check.detail}</p>
              <p className="safety-range">Safe: {check.safeRange}</p>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

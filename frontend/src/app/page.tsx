'use client';

import { useState } from 'react';
import { useHabitats } from '@/hooks/useHabitats';
import { HabitatCard } from '@/components/HabitatCard';

export default function HomePage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'available'>('all');

  const { data, isLoading, isError } = useHabitats(page);

  if (isLoading) return <p className="state">Loading habitats…</p>;
  if (isError)
    return (
      <p className="state state-error">
        Could not reach Mission Control. Check the service and reload.
      </p>
    );

  return (
    <>
      <h1>Habitat Listings</h1>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setStatusFilter('all')}>All</button>
        <button onClick={() => setStatusFilter('available')}>Available</button>
      </div>
      {data && data.meta.total === 0 ? (
        <p className="state">No habitats are listed yet.</p>
      ) : null}

      <div className="grid">
        {data?.data.map((habitat) => (
          <HabitatCard key={habitat.id} habitat={habitat} />
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Prev
        </button>
        <span style={{ margin: '0 12px' }}>
          Page {page} of {data?.meta.totalPages ?? 1}
        </span>
        <button
          disabled={!data || page >= data.meta.totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </>
  );
}

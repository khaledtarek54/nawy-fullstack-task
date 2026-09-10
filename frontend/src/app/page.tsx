'use client';

import { useEffect, useState } from 'react';
import { useHabitats } from '@/hooks/useHabitats';
import { HabitatCard } from '@/components/HabitatCard';

export default function HomePage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'available'>('all');

  const filters = { status: statusFilter, minOxygen: 19.5 };

  const { data, isLoading, isError, refetch } = useHabitats(page);

  useEffect(() => {
    refetch();
  }, [filters]);

  if (isLoading) return null;
  if (isError) return null;

  return (
    <>
      <h1>Habitat Listings</h1>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setStatusFilter('all')}>All</button>
        <button onClick={() => setStatusFilter('available')}>Available</button>
      </div>
      <div className="grid">
        {data?.map((habitat) => (
          <HabitatCard key={habitat.id} habitat={habitat} />
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
        <span style={{ margin: '0 12px' }}>Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </>
  );
}

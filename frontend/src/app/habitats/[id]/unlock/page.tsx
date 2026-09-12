'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVerifyAccess } from '@/hooks/useVerifyAccess';
import { grantAccess } from '@/lib/access';

interface UnlockPageProps {
  params: { id: string };
}

export default function UnlockPage({ params }: UnlockPageProps) {
  const router = useRouter();
  const verify = useVerifyAccess();
  const [passphrase, setPassphrase] = useState('');
  const [denied, setDenied] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setDenied(false);

    const result = await verify.mutateAsync(passphrase);

    if (!result.granted) {
      setDenied(true);
      return;
    }

    grantAccess();
    router.replace(`/habitats/${params.id}`);
  }

  return (
    <form className="unlock" onSubmit={handleSubmit}>
      <h1 className="detail-title">Restricted habitat record</h1>
      <p className="state">Enter the Mars Command access passphrase to continue.</p>

      <input
        type="password"
        className="unlock-input"
        value={passphrase}
        onChange={(event) => setPassphrase(event.target.value)}
        placeholder="Access passphrase"
        autoFocus
      />

      <button type="submit" disabled={verify.isPending || passphrase.length === 0}>
        {verify.isPending ? 'Checking…' : 'Unlock'}
      </button>

      {denied ? <p className="state state-error">That passphrase was not accepted.</p> : null}
      {verify.isError ? (
        <p className="state state-error">Could not reach Mission Control. Try again.</p>
      ) : null}
    </form>
  );
}

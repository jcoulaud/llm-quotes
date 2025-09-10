'use client';
import { useSignIn } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export default function Page() {
  const router = useRouter();
  const search = useSearchParams();
  const { isLoaded, signIn } = useSignIn();

  const returnTo = useMemo(() => {
    const url = search?.get('redirect_url');
    try {
      if (url) {
        // basic safety: only allow same-origin paths
        const parsed = new URL(
          url,
          typeof window === 'undefined' ? 'http://localhost:3000' : window.location.origin,
        );
        if (
          parsed.origin ===
          (typeof window === 'undefined' ? 'http://localhost:3000' : window.location.origin)
        ) {
          return parsed.pathname + parsed.search + parsed.hash;
        }
      }
    } catch {}
    return '/favorites';
  }, [search]);

  const handleX = useCallback(async () => {
    if (!isLoaded || !signIn) return;
    await signIn.authenticateWithRedirect({
      strategy: 'oauth_x',
      redirectUrl: '/sso-callback',
      redirectUrlComplete: returnTo,
    });
  }, [isLoaded, signIn, returnTo]);

  return (
    <div className='nb-container py-12'>
      <div className='brutal-card max-w-xl mx-auto'>
        <div className='flex items-start justify-between'>
          <h1 className='nb-h2'>Sign in to LLM Quotes</h1>
        </div>
        <p className='subtitle mt-2'>Welcome back! Please sign in to continue.</p>

        <div className='mt-8 flex flex-col gap-3'>
          <button
            onClick={handleX}
            className='brutal-button btn-primary w-full'
            disabled={!isLoaded}>
            Continue with X
          </button>
        </div>

        <div className='mt-6 text-sm'>
          Don’t have an account? It’ll be created after you sign in with X.
        </div>
      </div>
    </div>
  );
}

'use client';
import { RedirectToSignIn, SignedIn, SignedOut, SignOutButton, useUser } from '@clerk/nextjs';
import { useEffect, useMemo, useState } from 'react';

export default function Page() {
  return (
    <div className='nb-container py-12'>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <AccountInner />
      </SignedIn>
    </div>
  );
}

function AccountInner() {
  const { user } = useUser();
  const display = user?.fullName || user?.username || 'User';

  const [externalAccounts, setExternalAccounts] = useState<any[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) return;
      try {
        // Prefer method if available to ensure fresh data
        const method = (user as any).getExternalAccounts;
        const list = method ? await method.call(user) : (user as any).externalAccounts || [];
        if (!cancelled) setExternalAccounts(list);
      } catch {
        if (!cancelled) setExternalAccounts((user as any).externalAccounts || []);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const xAccount = useMemo(() => {
    const arr = externalAccounts || [];
    return arr.find((a: any) => {
      const p = (a?.provider || '').toLowerCase();
      return p.includes('twitter') || p.includes('oauth_x') || p.includes('x');
    });
  }, [externalAccounts]);

  const xHandle = useMemo(() => {
    return (xAccount && (xAccount.username || xAccount.handle || xAccount.identifier)) || undefined;
  }, [xAccount]);

  return (
    <div className='brutal-card max-w-4xl mx-auto'>
      <h1 className='nb-h2'>Account</h1>
      <p className='subtitle mt-1'>Manage your profile and connected accounts.</p>

      <div className='mt-8 grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='md:col-span-1'>
          <div className='flex items-center gap-4'>
            {user?.imageUrl && (
              <img
                alt='Avatar'
                src={user.imageUrl}
                width={72}
                height={72}
                className='rounded-full nb-border-strong'
              />
            )}
            <div>
              <div className='font-extrabold text-lg tracking-tight'>{display}</div>
              {xHandle && <div className='text-sm opacity-80'>@{xHandle}</div>}
            </div>
          </div>
          <div className='mt-4 flex gap-3'>
            <SignOutButton>
              <button className='brutal-button ghost'>Sign out</button>
            </SignOutButton>
          </div>
        </div>

        <div className='md:col-span-2'>
          <div className='brutal-card'>
            <div className='flex items-center justify-between'>
              <div className='font-extrabold'>Connected accounts</div>
            </div>
            <div className='mt-3'>
              {xAccount ? (
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between py-2'>
                  <div className='flex items-center gap-3'>
                    <span className='badge badge-blue'>Twitter</span>
                    <span className='text-sm'>{xHandle ? `@${xHandle}` : 'Connected'}</span>
                  </div>
                  <span className='text-xs opacity-75 mt-1 sm:mt-0'>
                    Managed via X — unlink from your X settings
                  </span>
                </div>
              ) : (
                <div className='text-sm opacity-80'>No connected accounts.</div>
              )}
            </div>
          </div>

          <div className='mt-6 brutal-card'>
            <div className='font-extrabold mb-2'>Profile</div>
            <div className='text-sm opacity-80'>
              Update your name and avatar on X. Changes will reflect here after your next sign-in.
            </div>
          </div>

          <div className='mt-6 text-sm opacity-70'>
            Need advanced settings? Use Clerk’s default profile at{' '}
            <a href='/user/manage' className='underline font-semibold'>
              /user/manage
            </a>
            .
          </div>
        </div>
      </div>
    </div>
  );
}

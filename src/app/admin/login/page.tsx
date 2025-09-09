'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';

export default function AdminLoginPage() {
  const params = useSearchParams();
  const next = params.get('next') || '/admin';
  const router = useRouter();
  const toast = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Login failed' }));
        toast.error(err.error || 'Invalid credentials');
        return;
      }
      toast.success('Logged in');
      router.replace(next);
    } catch (e) {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nb-container py-16">
      <div className="brutal-card p-6 max-w-xl mx-auto">
        <h1 className="nb-h2 mb-4">Admin Login</h1>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div>
            <label className="label">Username</label>
            <input className="brutal-input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Admin username" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="brutal-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="brutal-button" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


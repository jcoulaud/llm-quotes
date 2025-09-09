'use client';

import { useEffect, useState, useCallback } from 'react';
import { Quote } from '@/entities/Quote';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ToastProvider';

export default function AdminPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [limits, setLimits] = useState<{
    summary?: {
      postsLeftToday: number | null;
      windowRemaining: number | null;
      windowLimit: number | null;
      windowResetAt: string | null;
      dayLimit: number | null;
      dayResetAt: string | null;
    };
    source?: string;
  } | null>(null);
  const [limitsLoading, setLimitsLoading] = useState(false);
  const [stats, setStats] = useState<{
    counts?: Record<string, number>;
  } | null>(null);
  const toast = useToast();
  // Admin access is enforced at middleware level with redirect to /admin/login

  const formatRelative = (iso?: string | null) => {
    if (!iso) return '';
    const target = new Date(iso).getTime();
    const now = Date.now();
    const diffMs = Math.max(0, target - now);
    const mins = Math.round(diffMs / 60000);
    if (mins < 1) return '(now)';
    if (mins < 60) return `(${mins}m)`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `(${h}h${m ? ` ${m}m` : ''})`;
  };

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/quotes/list?status=${filter}`);
      const data = await response.json();
      
      if (response.ok) {
        setQuotes(data.quotes);
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  // Login handled on /admin/login page

  const fetchLimits = useCallback(async () => {
    setLimitsLoading(true);
    try {
      const res = await fetch('/api/twitter/limits');
      const data = await res.json();
      if (res.ok) {
        setLimits({ summary: data.summary, source: data.source });
      } else {
        setLimits(null);
      }
    } catch {
      setLimits(null);
    } finally {
      setLimitsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLimits();
  }, [fetchLimits]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/quotes/stats');
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      } else {
        setStats(null);
      }
    } catch {
      setStats(null);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      setQuotes([]);
      toast.info('Logged out');
      // Redirect to login
      window.location.href = '/admin/login';
    } catch {
      toast.error('Failed to log out');
    }
  };

  const handleModerate = async (quoteId: number, action: string) => {
    try {
      const body: Record<string, unknown> = { quoteId, action };
      
      if (action === 'schedule') {
        if (!scheduledDate || !scheduledTime) {
          toast.error('Please select date and time for scheduling');
          return;
        }
        body.scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      }

      const response = await fetch('/api/quotes/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const actionLabel = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'scheduled';
        toast.success(`Quote ${actionLabel} successfully!`);
        fetchQuotes();
        setSelectedQuote(null);
        setScheduledDate('');
        setScheduledTime('');
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error moderating quote:', error);
      toast.error('Failed to moderate quote');
    }
  };

  return (
    <div className="nb-container pt-12 pb-12">
      {/* Top: Admin dashboard header + quick stats */}
      <div className="brutal-card p-6 mb-6">
        <div className="flex items-start justify-between gap-6 mb-4">
          <div>
            <h1 className="text-4xl uppercase">Admin Dashboard</h1>
            <p className="subtitle mt-1">Moderation tools and system status</p>
          </div>
          <button className="brutal-button ghost" onClick={handleLogout} aria-label="Log out">
            Log out
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
          {/* KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4 col-span-full">
            {[
              { key: 'pending', label: 'Pending' },
              { key: 'approved', label: 'Approved' },
              { key: 'scheduled', label: 'Scheduled' },
              { key: 'posted', label: 'Posted' },
              { key: 'rejected', label: 'Rejected' },
              { key: 'scheduledDue', label: 'Due Now' },
            ].map((m) => (
              <div key={m.key} className="brutal-card p-3 text-center">
                <div className="text-xs uppercase font-extrabold tracking-widest opacity-70 mb-1">{m.label}</div>
                <div className="text-3xl font-black">
                  {stats?.counts?.[m.key] != null ? stats?.counts?.[m.key].toLocaleString() : '—'}
                </div>
              </div>
            ))}
          </div>

          {/* Rate Limit Panel */}
          <div className="relative">
            <div className="brutal-card p-4" style={{ background: 'var(--nb-white)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs uppercase font-extrabold tracking-widest opacity-70">Twitter Rate Limit</div>
                <button
                  className="btn btn-yellow"
                  onClick={fetchLimits}
                  aria-label="Refresh rate limits"
                >
                  Refresh
                </button>
              </div>
              {limitsLoading ? (
                <div className="text-sm">Loading…</div>
              ) : limits?.summary ? (
                <div className="text-sm leading-snug">
                  {typeof limits.summary.postsLeftToday === 'number' && (
                    <div className="mb-1">
                      Posts left today:{' '}
                      <strong>{limits.summary.postsLeftToday.toLocaleString()}</strong>
                    </div>
                  )}
                  <div className="mb-1">
                    Window:{' '}
                    <strong>
                      {typeof limits.summary.windowRemaining === 'number'
                        ? limits.summary.windowRemaining.toLocaleString()
                        : '—'}
                    </strong>
                    {typeof limits.summary.windowLimit === 'number' ? (
                      <>/{limits.summary.windowLimit.toLocaleString()}</>
                    ) : null}
                  </div>
                  <div className="opacity-80">
                    Resets: {limits.summary.dayResetAt ? formatDate(limits.summary.dayResetAt) : limits.summary.windowResetAt ? formatDate(limits.summary.windowResetAt) : '—'}{' '}
                    <span className="opacity-70">{formatRelative(limits.summary.dayResetAt || limits.summary.windowResetAt)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-sm">Not available</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters moved to their own section */}
      <div className="brutal-card p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="nb-h3">Quote Filters</h2>
        </div>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => setFilter('pending')}
            className={`brutal-button ${filter === 'pending' ? 'bg-black text-white' : ''}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`brutal-button ${filter === 'approved' ? 'bg-black text-white' : ''}`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('scheduled')}
            className={`brutal-button ${filter === 'scheduled' ? 'bg-black text-white' : ''}`}
          >
            Scheduled
          </button>
          <button
            onClick={() => setFilter('posted')}
            className={`brutal-button ${filter === 'posted' ? 'bg-black text-white' : ''}`}
          >
            Posted
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`brutal-button ${filter === 'rejected' ? 'bg-black text-white' : ''}`}
          >
            Rejected
          </button>
        </div>
      </div>

      {loading ? (
        <div className="brutal-card p-8 text-center">
          <p className="text-2xl">Loading quotes...</p>
        </div>
      ) : quotes.length === 0 ? (
        <div className="brutal-card p-8 text-center">
          <p className="text-2xl">No {filter} quotes found</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {quotes.map((quote) => (
            <div key={quote.id} className="brutal-card p-6">
              <div className="mb-4">
                <p className="text-xl mb-2">&ldquo;{quote.content}&rdquo;</p>
                <p className="text-lg">— {quote.llmSource}</p>
                {quote.twitterHandle && (
                  <p className="text-sm mt-2">
                    Submitted by{' '}
                    <a
                      href={`https://x.com/${quote.twitterHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      @{quote.twitterHandle}
                    </a>
                  </p>
                )}
                <p className="text-sm mt-2">
                  Created: {formatDate(quote.createdAt)}
                </p>
                {quote.scheduledFor && (
                  <p className="text-sm">
                    Scheduled for: {formatDate(quote.scheduledFor)}
                  </p>
                )}
              </div>

              {quote.status === 'pending' && (
                <div className="flex gap-4 flex-wrap">
                  <button
                    onClick={() => handleModerate(quote.id, 'approve')}
                    className="brutal-button bg-green-500"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setSelectedQuote(quote)}
                    className="brutal-button bg-blue-500"
                  >
                    Schedule
                  </button>
                  <button
                    onClick={() => handleModerate(quote.id, 'reject')}
                    className="brutal-button bg-red-500"
                  >
                    Reject
                  </button>
                </div>
              )}

              {quote.status === 'approved' && (
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedQuote(quote)}
                    className="brutal-button bg-blue-500"
                  >
                    Schedule
                  </button>
                </div>
              )}

              {selectedQuote?.id === quote.id && (
                <div className="mt-4 p-4 border-4 border-black">
                  <h3 className="text-lg mb-2 uppercase">Schedule Quote</h3>
                  <div className="flex gap-4 flex-wrap">
                    <input
                      type="date"
                      className="brutal-input"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <input
                      type="time"
                      className="brutal-input"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                    <button
                      onClick={() => handleModerate(quote.id, 'schedule')}
                      className="brutal-button bg-blue-500"
                    >
                      Confirm Schedule
                    </button>
                    <button
                      onClick={() => {
                        setSelectedQuote(null);
                        setScheduledDate('');
                        setScheduledTime('');
                      }}
                      className="brutal-button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
    </div>
  );
}

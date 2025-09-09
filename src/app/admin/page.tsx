'use client';

import { useEffect, useState, useCallback } from 'react';
import { Quote } from '@/entities/Quote';
import { formatDate } from '@/lib/utils';

export default function AdminPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

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

  const handleModerate = async (quoteId: number, action: string) => {
    try {
      const body: Record<string, unknown> = { quoteId, action };
      
      if (action === 'schedule') {
        if (!scheduledDate || !scheduledTime) {
          alert('Please select date and time for scheduling');
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
        alert(`Quote ${action}d successfully!`);
        fetchQuotes();
        setSelectedQuote(null);
        setScheduledDate('');
        setScheduledTime('');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error moderating quote:', error);
      alert('Failed to moderate quote');
    }
  };

  return (
    <div className="py-8">
      <div className="brutal-card p-6 mb-8">
        <h1 className="text-4xl mb-4 uppercase">Admin Dashboard</h1>
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
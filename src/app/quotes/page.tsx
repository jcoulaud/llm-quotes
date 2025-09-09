'use client';

import { useEffect, useState, useCallback } from 'react';
import QuoteCard from '@/components/QuoteCard';
import type { QuoteDTO } from '@/types/quote';

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<QuoteDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [total, setTotal] = useState(0);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }
      params.append('limit', '50');
      
      const response = await fetch(`/api/quotes/list?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setQuotes(data.quotes);
        setTotal(data.total);
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

  return (
    <div className="max-w-6xl mx-auto px-8 py-12">
      <div className="mb-12">
        <h1 className="nb-h1 mb-2">All Quotes</h1>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter('all')} className={filter === 'all' ? 'brutal-button' : 'brutal-button ghost'}>
            ALL ({total})
          </button>
          <button onClick={() => setFilter('pending')} className={filter === 'pending' ? 'brutal-button' : 'brutal-button ghost'}>
            PENDING
          </button>
          <button onClick={() => setFilter('approved')} className={filter === 'approved' ? 'brutal-button' : 'brutal-button ghost'}>
            APPROVED
          </button>
          <button onClick={() => setFilter('scheduled')} className={filter === 'scheduled' ? 'brutal-button' : 'brutal-button ghost'}>
            SCHEDULED
          </button>
          <button onClick={() => setFilter('posted')} className={filter === 'posted' ? 'brutal-button' : 'brutal-button ghost'}>
            POSTED
          </button>
        </div>
      </div>

      {loading ? (
        <div className="brutal-card p-12 text-center">
          <p className="text-lg">Loading quotes...</p>
        </div>
      ) : quotes.length === 0 ? (
        <div className="brutal-card p-12 text-center">
          <p className="text-lg mb-0">No quotes found</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {quotes.map((quote) => (
            <QuoteCard key={quote.id} quote={quote} />
          ))}
        </div>
      )}
    </div>
  );
}

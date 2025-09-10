'use client';

import { useEffect, useState, useCallback } from 'react';
import QuoteCard from '@/components/QuoteCard';
import type { QuoteDTO } from '@/types/quote';
import { LLM_SOURCES } from '@/types/llm-sources';

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<QuoteDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [offset, setOffset] = useState(0);
  const [limit] = useState(50);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const fetchPage = useCallback(
    async (pageOffset: number, append: boolean) => {
      // Distinguish initial load vs load-more for UX
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      try {
        const params = new URLSearchParams();
        if (filter !== 'all') {
          params.append('status', filter);
        }
        if (sourceFilter !== 'all') {
          params.append('llmSource', sourceFilter);
        }
        params.append('limit', String(limit));
        params.append('offset', String(pageOffset));

        const response = await fetch(`/api/quotes/list?${params}`);
        const data = await response.json();

        if (response.ok) {
          if (append) {
            setQuotes((prev) => [...prev, ...data.quotes]);
            setOffset(pageOffset + data.quotes.length);
          } else {
            setQuotes(data.quotes);
            setOffset(data.quotes.length);
          }
          const nextHasMore = pageOffset + data.quotes.length < data.total;
          setHasMore(nextHasMore);
        }
      } catch (error) {
        console.error('Error fetching quotes:', error);
      } finally {
        if (append) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [filter, sourceFilter, limit]
  );

  // No fetch needed: use full known list of LLM sources

  useEffect(() => {
    // Reset when filters change and load first page
    setQuotes([]);
    setOffset(0);
    setHasMore(false);
    fetchPage(0, false);
  }, [fetchPage]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    await fetchPage(offset, true);
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-12">
      <div className="mb-12">
        <h1 className="nb-h1 mb-2">All Quotes</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setFilter('all')} className={filter === 'all' ? 'brutal-button' : 'brutal-button ghost'}>
              ALL
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
          <select
            className="brutal-select ml-auto max-w-[320px]"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            aria-label="Filter by source"
          >
            <option value="all">All sources</option>
            {LLM_SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
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
        <>
          <div className="grid gap-6 md:grid-cols-2">
            {quotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                className="brutal-button"
                onClick={loadMore}
                disabled={loadingMore}
                aria-label="Load more quotes"
              >
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

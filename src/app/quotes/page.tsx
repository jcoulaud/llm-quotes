'use client';

import QuoteCard from '@/components/QuoteCard';
import { LLM_SOURCES } from '@/types/llm-sources';
import type { PublicQuoteDTO } from '@/types/quote';
import { useCallback, useEffect, useState } from 'react';

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<PublicQuoteDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<'all' | '1h' | '1d'>('all');
  const [sort, setSort] = useState<'date' | 'upvotes'>('date');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
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
        if (timeframe !== 'all') {
          params.append('timeframe', timeframe);
        }
        if (sort) params.append('sort', sort);
        if (order) params.append('order', order);

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
    [filter, sourceFilter, timeframe, sort, order, limit],
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
    <div className='max-w-6xl mx-auto px-8 py-12'>
      <div className='mb-12'>
        <h1 className='nb-h1 mb-4 md:mb-2'>All Quotes</h1>
        <div className='flex items-center gap-2 flex-wrap'>
          {/* Desktop buttons (only All and Posted) */}
          <div className='hidden md:flex gap-2 flex-wrap'>
            <button
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'brutal-button' : 'brutal-button ghost'}>
              ALL
            </button>
            <button
              onClick={() => setFilter('posted')}
              className={filter === 'posted' ? 'brutal-button' : 'brutal-button ghost'}>
              POSTED
            </button>
          </div>

          {/* Mobile dropdown for status (only All and Posted) */}
          <div className='w-full md:hidden'>
            <select
              className='brutal-select w-full'
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label='Filter by status'>
              <option value='all'>All statuses</option>
              <option value='posted'>Posted</option>
            </select>
          </div>

          {/* Timeframe dropdown (left of Sort/Source on desktop, above on mobile) */}
          <select
            className='brutal-select md:ml-auto md:max-w-[140px] w-full md:w-auto mt-3 md:mt-0'
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as 'all' | '1d' | '1h')}
            aria-label='Filter by timeframe'>
            <option value='all'>All time</option>
            <option value='1d'>Last 1 day</option>
            <option value='1h'>Last 1 hour</option>
          </select>

          {/* Sort dropdown */}
          <select
            className='brutal-select md:max-w-[150px] w-full md:w-auto mt-3 md:mt-0 md:ml-2'
            value={sort}
            onChange={(e) => setSort(e.target.value as 'date' | 'upvotes')}
            aria-label='Sort by'>
            <option value='date'>Date</option>
            <option value='upvotes'>Upvotes</option>
          </select>

          {/* Source dropdown */}
          <select
            className='brutal-select md:max-w-[160px] w-full md:w-auto mt-3 md:mt-0 md:ml-2'
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            aria-label='Filter by source'>
            <option value='all'>All sources</option>
            {LLM_SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Sort order toggle - last */}
          <button
            type='button'
            className='brutal-button ghost p-2 md:p-2.5 flex items-center justify-center mt-3 md:mt-0 md:ml-2'
            aria-label={`Toggle sort order (${order === 'asc' ? 'ascending' : 'descending'})`}
            title={`Sort ${order === 'asc' ? 'ascending' : 'descending'}`}
            onClick={() => setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}>
            {order === 'asc' ? (
              // Up arrow icon for ascending
              <svg
                width='18'
                height='18'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                aria-hidden='true'
                focusable='false'>
                <path
                  d='M12 5l-6 6h4v8h4v-8h4l-6-6z'
                  stroke='currentColor'
                  strokeWidth='2'
                  fill='none'
                />
              </svg>
            ) : (
              // Down arrow icon for descending
              <svg
                width='18'
                height='18'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                aria-hidden='true'
                focusable='false'>
                <path
                  d='M12 19l6-6h-4V5h-4v8H6l6 6z'
                  stroke='currentColor'
                  strokeWidth='2'
                  fill='none'
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className='brutal-card p-12 text-center'>
          <p className='text-lg'>Loading quotes...</p>
        </div>
      ) : quotes.length === 0 ? (
        <div className='brutal-card p-12 text-center'>
          <p className='text-lg mb-0'>No quotes found</p>
        </div>
      ) : (
        <>
          <div className='grid gap-6 md:grid-cols-2'>
            {quotes.map((quote) => (
              <QuoteCard key={quote.slug} quote={quote} showStatus={filter === 'all'} />
            ))}
          </div>
          {hasMore && (
            <div className='mt-8 flex justify-center'>
              <button
                className='brutal-button'
                onClick={loadMore}
                disabled={loadingMore}
                aria-label='Load more quotes'>
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

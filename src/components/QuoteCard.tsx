'use client';

import FavoriteButton from '@/components/FavoriteButton';
import { isSeen, markSeen } from '@/lib/read-tracker';
import { formatDateOnly, getStatusColor } from '@/lib/utils';
import type { QuoteDTO } from '@/types/quote';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface QuoteCardProps {
  quote: QuoteDTO;
  showStatus?: boolean;
  seenVersion?: number; // external trigger to re-check seen state
}

export default function QuoteCard({ quote, showStatus = true, seenVersion = 0 }: QuoteCardProps) {
  const [seen, setSeen] = useState(false);
  const hoverTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setSeen(isSeen(quote.slug));
  }, [quote.slug, seenVersion]);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        window.clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
    };
  }, []);

  // Removed viewport and click-based marking: only detail page marks seen.

  const handleMouseEnter = () => {
    if (seen || hoverTimerRef.current) return;
    // After 3s hover, mark as seen
    hoverTimerRef.current = window.setTimeout(() => {
      markSeen(quote.slug);
      setSeen(true);
      hoverTimerRef.current = null;
    }, 3000);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const cardClass = `brutal-card mb-4 quote-card ${
    seen ? 'quote-card--seen' : 'quote-card--unseen'
  }`;

  return (
    <div className={cardClass} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {/* Favorite star in top-right */}
      <FavoriteButton slug={quote.slug} size={18} className='absolute top-2 right-2' />
      {/* Unseen indicator (small dot), shown only if not seen */}
      {!seen && <span className='unseen-dot' aria-label='Unseen quote' />}
      <div className='mb-4'>
        <p className='text-base mb-3 leading-relaxed quote-text'>&ldquo;{quote.content}&rdquo;</p>
        <p className='font-medium'>— {quote.llmSource}</p>
      </div>

      <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-4 mt-2'>
        <div className='flex items-center gap-3'>
          {showStatus && (
            <span className={`badge ${getStatusColor(quote.status)}`}>{quote.status}</span>
          )}
          {quote.twitterHandle && (
            <span className='text-sm'>
              by{' '}
              <a
                href={`https://x.com/${quote.twitterHandle}`}
                target='_blank'
                rel='noopener noreferrer'
                className='font-medium nb-hover-purple transition-colors'>
                @{quote.twitterHandle}
              </a>
            </span>
          )}
        </div>

        <div className='flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start'>
          <span className='text-sm opacity-60'>{formatDateOnly(quote.createdAt)}</span>
          <Link href={`/quotes/${quote.slug}`} className='badge badge-posted'>
            VIEW →
          </Link>
        </div>
      </div>
    </div>
  );
}

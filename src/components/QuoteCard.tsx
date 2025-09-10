'use client';

import FavoriteButton from '@/components/FavoriteButton';
import { formatDateOnly, getStatusColor } from '@/lib/utils';
import type { QuoteDTO } from '@/types/quote';
import Link from 'next/link';

interface QuoteCardProps {
  quote: QuoteDTO;
  showStatus?: boolean;
  onUnfavorite?: () => void;
}

export default function QuoteCard({ quote, showStatus = true, onUnfavorite }: QuoteCardProps) {
  const cardClass = 'brutal-card mb-4 quote-card';

  return (
    <div className={cardClass}>
      {/* Favorite star in top-right */}
      <FavoriteButton slug={quote.slug} size={18} className='absolute top-2 right-2' onUnfavorite={onUnfavorite} />
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

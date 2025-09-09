'use client';

import Link from 'next/link';
import { Quote } from '@/entities/Quote';
import { formatDate, getStatusColor } from '@/lib/utils';

interface QuoteCardProps {
  quote: Quote;
  showStatus?: boolean;
}

export default function QuoteCard({ quote, showStatus = true }: QuoteCardProps) {
  return (
    <div className="brutal-card mb-4">
      <div className="mb-4">
        <p className="text-base mb-3 leading-relaxed">"{quote.content}"</p>
        <p className="font-medium">— {quote.llmSource}</p>
      </div>
      
      <div className="flex justify-between items-center flex-wrap gap-4 pt-4 mt-2">
        <div className="flex items-center gap-3">
          {showStatus && (
            <span className={`badge ${getStatusColor(quote.status)}`}>
              {quote.status}
            </span>
          )}
          {quote.twitterHandle && (
            <span className="text-sm">
              by <a 
                href={`https://x.com/${quote.twitterHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-orange-600 transition-colors"
              >
                @{quote.twitterHandle}
              </a>
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-60">{formatDate(quote.createdAt)}</span>
          {quote.status === 'posted' && (
            <Link 
              href={`/quotes/${quote.slug}`}
              className="text-sm font-medium hover:text-orange-600"
            >
              VIEW →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

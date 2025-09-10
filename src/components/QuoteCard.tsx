"use client";

import Link from 'next/link';
import { formatDate, getStatusColor } from '@/lib/utils';
import type { QuoteDTO } from '@/types/quote';
import { isSeen, markSeen } from '@/lib/read-tracker';
import { useEffect, useRef, useState } from 'react';

interface QuoteCardProps {
  quote: QuoteDTO;
  showStatus?: boolean;
  seenVersion?: number; // external trigger to re-check seen state
}

export default function QuoteCard({ quote, showStatus = true, seenVersion = 0 }: QuoteCardProps) {
  const [seen, setSeen] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSeen(isSeen(quote.slug));
  }, [quote.slug, seenVersion]);

  useEffect(() => {
    if (seen) return;
    const node = cardRef.current;
    if (!node || typeof window === 'undefined') return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const mark = () => {
      markSeen(quote.slug);
      setSeen(true);
    };

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry && entry.isIntersecting) {
            if (!timer) timer = setTimeout(mark, 10000);
          } else {
            if (timer) {
              clearTimeout(timer);
              timer = null;
            }
          }
        },
        { threshold: 0.5 }
      );
      obs.observe(node);
      return () => {
        if (timer) clearTimeout(timer);
        obs.disconnect();
      };
    }

    // Fallback: mark on click if observer unavailable
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [quote.slug, seen]);

  const handleMarkSeen = () => {
    try {
      markSeen(quote.slug);
      setSeen(true);
    } catch {}
  };

  return (
    <div ref={cardRef} className="brutal-card mb-4">
      {seen && (
        <span
          className="badge badge-seen badge-compact seen-flag"
          aria-label="You saw this quote"
        >
          SEEN
        </span>
      )}
      <div className="mb-4">
        <p className="text-base mb-3 leading-relaxed">&ldquo;{quote.content}&rdquo;</p>
        <p className="font-medium">— {quote.llmSource}</p>
      </div>
      
      <div className="flex justify-between items-center flex-wrap gap-4 pt-4 mt-2">
        <div className="flex items-center gap-3">
          {showStatus && quote.status !== 'posted' && (
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
                className="font-medium nb-hover-purple transition-colors"
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
              className="badge badge-posted"
              onClick={handleMarkSeen}
            >
              VIEW →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

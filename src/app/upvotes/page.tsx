"use client";

import { useEffect, useState } from 'react';
import type { QuoteDTO } from '@/types/quote';
import QuoteCard from '@/components/QuoteCard';

export default function UpvotesPage() {
  const [quotes, setQuotes] = useState<QuoteDTO[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch('/api/votes');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      const results: QuoteDTO[] = (data?.quotes || []).map((q: QuoteDTO) => ({
        id: q.id,
        content: q.content,
        llmSource: q.llmSource,
        twitterHandle: q.twitterHandle ?? undefined,
        status: q.status,
        slug: q.slug,
        createdAt: q.createdAt,
        postedAt: q.postedAt ?? undefined,
        tweetId: q.tweetId ?? undefined,
        views: q.views,
      }));
      setQuotes(results);
    } catch {
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="nb-container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="nb-h2">Your Upvotes</h1>
      </div>

      {loading ? (
        <p className="text-lg">Loading upvotes...</p>
      ) : quotes.length === 0 ? (
        <div className="brutal-card">
          <p className="text-lg mb-2">No upvotes yet.</p>
          <p className="opacity-80">Tap the up arrow on any quote to add an upvote.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quotes.map((q) => (
            <QuoteCard 
              key={q.id}
              quote={q} 
              showStatus={q.status !== 'posted'} 
            />
          ))}
        </div>
      )}
    </div>
  );
}


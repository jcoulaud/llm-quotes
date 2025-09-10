"use client";

import { useEffect, useState } from 'react';
import type { QuoteDTO } from '@/types/quote';
import QuoteCard from '@/components/QuoteCard';

export default function FavoritesPage() {
  const [quotes, setQuotes] = useState<QuoteDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

  async function load() {
    try {
      const res = await fetch('/api/favorites');
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

  const handleUnfavorite = (quoteId: number) => {
    setRemovingIds(prev => new Set(prev).add(quoteId));
    
    setTimeout(() => {
      setQuotes(prev => prev.filter(q => q.id !== quoteId));
      setRemovingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(quoteId);
        return newSet;
      });
    }, 1000);
  };

  return (
    <div className="nb-container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="nb-h2">Your Favorites</h1>
      </div>

      {loading ? (
        <p className="text-lg">Loading favorites...</p>
      ) : quotes.length === 0 ? (
        <div className="brutal-card">
          <p className="text-lg mb-2">No favorites yet.</p>
          <p className="opacity-80">Tap the star on any quote to save it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quotes.map((q) => (
            <div
              key={q.id}
              className={`transition-all duration-500 ${
                removingIds.has(q.id) ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              <QuoteCard 
                quote={q} 
                showStatus={q.status !== 'posted'} 
                onUnfavorite={() => handleUnfavorite(q.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

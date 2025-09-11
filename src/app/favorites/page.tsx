"use client";

import { useEffect, useState } from 'react';
import type { PublicQuoteDTO } from '@/types/quote';
import QuoteCard from '@/components/QuoteCard';

export default function FavoritesPage() {
  const [quotes, setQuotes] = useState<PublicQuoteDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingSlugs, setRemovingSlugs] = useState<Set<string>>(new Set());

  async function load() {
    try {
      const res = await fetch('/api/favorites');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      const results: PublicQuoteDTO[] = (data?.quotes || []).map((q: PublicQuoteDTO) => ({
        content: q.content,
        llmSource: q.llmSource,
        twitterHandle: q.twitterHandle ?? undefined,
        status: q.status,
        slug: q.slug,
        createdAt: q.createdAt,
        postedAt: q.postedAt ?? undefined,
        tweetId: q.tweetId ?? undefined,
        views: q.views,
        favoritedByMe: true,
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

  const handleUnfavorite = (slug: string) => {
    setRemovingSlugs(prev => new Set(prev).add(slug));
    
    setTimeout(() => {
      setQuotes(prev => prev.filter(q => q.slug !== slug));
      setRemovingSlugs(prev => {
        const newSet = new Set(prev);
        newSet.delete(slug);
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
              key={q.slug}
              className={`transition-all duration-500 ${
                removingSlugs.has(q.slug) ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              <QuoteCard 
                quote={q} 
                showStatus={q.status !== 'posted'} 
                onUnfavorite={() => handleUnfavorite(q.slug)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

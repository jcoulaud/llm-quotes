"use client";

import { useEffect, useState } from 'react';
import type { QuoteDTO } from '@/types/quote';
import QuoteCard from '@/components/QuoteCard';
import { getFavorites, onFavoritesChange } from '@/lib/favorites';

export default function FavoritesPage() {
  const [quotes, setQuotes] = useState<QuoteDTO[]>([]);
  const [loading, setLoading] = useState(true);

  async function load(slugs: string[]) {
    if (!slugs || slugs.length === 0) {
      setQuotes([]);
      setLoading(false);
      return;
    }
    try {
      const results = await Promise.all(
        slugs.map(async (slug) => {
          const res = await fetch(`/api/quotes/${slug}`);
          if (!res.ok) throw new Error('Failed');
          const q = await res.json();
          const dto: QuoteDTO = {
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
          };
          return dto;
        }),
      );
      // Preserve the user's saved order (most recent favorite should probably be last added), but keep as-is
      setQuotes(results);
    } catch {
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const slugs = getFavorites();
    load(slugs);
    const off = onFavoritesChange((s) => load(s));
    return off;
  }, []);

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
            <QuoteCard key={q.id} quote={q} showStatus={q.status !== 'approved'} />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { CSSProperties, useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/components/ToastProvider';

export default function FavoriteButton({
  slug,
  size = 18,
  className = '',
  style,
  onUnfavorite,
}: {
  slug: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
  onUnfavorite?: () => void;
}) {
  const [fav, setFav] = useState(false);
  const [loading, setLoading] = useState(false);
  const lastActionSeq = useRef(0);
  const { isSignedIn } = useUser();
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!isSignedIn) {
        setFav(false);
        return;
      }
      try {
        const res = await fetch(`/api/favorites/${slug}`, { method: 'GET' });
        if (!cancelled && res.ok) {
          const data = await res.json();
          setFav(Boolean(data?.favorited));
        }
      } catch {}
    }
    check();
    return () => {
      cancelled = true;
    };
  }, [slug, isSignedIn]);

  const toggle = () => {
    if (!isSignedIn) {
      toast.error('Please sign in to favorite quotes');
      return;
    }
    setLoading(true);

    const prevFav = fav;
    const method = prevFav ? 'DELETE' : 'POST';
    // Optimistic toggle
    setFav(!prevFav);

    const doToggle = async () => {
      try {
        const seq = ++lastActionSeq.current;
        const res = await fetch(`/api/favorites/${slug}`, { method });
        if (res.status === 401) {
          toast.error('Please sign in to favorite quotes');
          if (seq === lastActionSeq.current) setFav(false);
          return;
        }
        if (!res.ok) {
          // Revert on error
          if (seq === lastActionSeq.current) setFav(prevFav);
          return;
        }
        const data = await res.json();
        if (seq === lastActionSeq.current) setFav(Boolean(data?.favorited));

        if (seq === lastActionSeq.current && method === 'DELETE' && onUnfavorite && !Boolean(data?.favorited)) onUnfavorite();
      } catch {
        // Revert on network error
        if (lastActionSeq.current) setFav(prevFav);
      } finally {
        setLoading(false);
      }
    };
    void doToggle();
  };

  return (
    <button
      type="button"
      aria-label={fav ? 'Unfavorite quote' : 'Favorite quote'}
      aria-pressed={fav}
      onClick={toggle}
      className={`fav-star-btn flex items-center justify-center ${className}`}
      title={fav ? 'Unfavorite' : 'Favorite'}
      style={{ background: 'transparent', border: 'none', padding: 0, lineHeight: 0, ...style }}
    >
      <StarIcon filled={fav} size={size} />
    </button>
  );
}

function StarIcon({ filled, size = 24 }: { filled: boolean; size?: number }) {
  const stroke = 'var(--nb-ink)';
  const fill = filled ? 'var(--nb-yellow)' : 'none';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block' }}
    >
      <path
        d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 7.1-1.01L12 2z"
        stroke={stroke}
        strokeWidth="2"
      />
    </svg>
  );
}

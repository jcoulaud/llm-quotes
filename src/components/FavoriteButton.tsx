"use client";

import { isFavorite, toggleFavorite, onFavoritesChange } from '@/lib/favorites';
import { CSSProperties, useEffect, useState } from 'react';

export default function FavoriteButton({
  slug,
  size = 18,
  className = '',
  style,
}: {
  slug: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setFav(isFavorite(slug));
    const off = onFavoritesChange(() => setFav(isFavorite(slug)));
    return off;
  }, [slug]);

  const toggle = () => {
    const now = toggleFavorite(slug);
    setFav(now);
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

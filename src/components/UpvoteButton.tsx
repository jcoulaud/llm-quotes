"use client";

import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/components/ToastProvider';

export default function UpvoteButton({
  slug,
  className = '',
  style,
  size = 'small', // default to small
  variant = 'tile',
}: {
  slug: string;
  className?: string;
  style?: CSSProperties;
  size?: 'compact' | 'small' | 'regular' | 'micro';
  variant?: 'tile' | 'inline' | 'chip';
}) {
  const [voted, setVoted] = useState(false);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const lastActionSeq = useRef(0);
  const { isSignedIn } = useUser();
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/votes/${slug}`, { method: 'GET' });
        if (!cancelled && res.ok) {
          const data = await res.json();
          const votedVal = Boolean(data?.voted);
          setVoted(votedVal);
          if (typeof data?.count === 'number') setCount(data.count);
        }
      } catch {}
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug, isSignedIn]);

  const toggle = () => {
    if (!isSignedIn) {
      toast.error('Please sign in to upvote');
      return;
    }
    setLoading(true);
    const prevVoted = voted;
    const prevCount = count;
    // Optimistic update
    const nextVoted = !prevVoted;
    const delta = nextVoted ? 1 : -1;
    const nextCount = Math.max(0, prevCount + delta);
    setVoted(nextVoted);
    setCount(nextCount);

    const doToggle = async () => {
      try {
        const method = prevVoted ? 'DELETE' : 'POST';
        const seq = ++lastActionSeq.current;
        const res = await fetch(`/api/votes/${slug}`, { method });
        if (res.status === 401) {
          toast.error('Please sign in to upvote');
          // Revert optimistic change
          if (seq === lastActionSeq.current) {
            setVoted(prevVoted);
            setCount(prevCount);
          }
          return;
        }
        if (!res.ok) {
          // Revert optimistic change on error
          if (seq === lastActionSeq.current) {
            setVoted(prevVoted);
            setCount(prevCount);
          }
          return;
        }
        const data = await res.json();
        if (seq === lastActionSeq.current) {
          if (typeof data?.voted === 'boolean') setVoted(data.voted);
          if (typeof data?.count === 'number') setCount(data.count);
        }
      } catch {
        // Revert on network error
        const seq = lastActionSeq.current;
        if (seq === lastActionSeq.current) {
          setVoted(prevVoted);
          setCount(prevCount);
        }
      } finally {
        setLoading(false);
      }
    };
    void doToggle();
  };

  const label = voted ? 'Remove upvote' : 'Upvote';
  const isSmall = size === 'small' || size === 'compact';
  const isMicro = size === 'micro';
  const isInline = variant === 'inline';
  const isChip = variant === 'chip';
  const classes = isInline
    ? `upvote-inline ${isMicro ? 'micro' : ''} ${voted ? 'voted' : ''}`
    : isChip
    ? `upvote-chip ${voted ? 'voted' : ''}`
    : `upvote-tile ${isSmall ? 'small' : ''} ${voted ? 'voted' : ''}`;
  const formatted = useMemo(() => new Intl.NumberFormat().format(count), [count]);

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={voted}
      onClick={toggle}
      // keep clickable for rapid toggles
      disabled={false}
      className={`${classes} ${className}`}
      style={{ ...style }}
      title={label}
    >
      <TriangleUpIcon size={isInline ? (isMicro ? 12 : 16) : isChip ? 16 : undefined} />
      <span className="upvote-count">{formatted}</span>
    </button>
  );
}

function TriangleUpIcon({ size = 18 }: { size?: number }) {
  const stroke = 'currentColor';
  const fill = 'none';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className="upvote-icon"
    >
      <path d="M12 5l8 12H4L12 5z" stroke={stroke} strokeWidth="2" />
    </svg>
  );
}

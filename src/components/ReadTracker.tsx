'use client';

import { useEffect } from 'react';
import { markSeen } from '@/lib/read-tracker';

export default function ReadTracker({ slug }: { slug: string }) {
  useEffect(() => {
    if (slug) markSeen(slug);
  }, [slug]);
  return null;
}

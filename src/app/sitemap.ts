import { MetadataRoute } from 'next';
import { initializeDatabase } from '@/lib/db';
import type { Quote } from '@/entities/Quote';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://llmquotes.com').replace(/\/$/, '');

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      changeFrequency: 'daily',
      priority: 1,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/quotes`,
      changeFrequency: 'daily',
      priority: 0.9,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/submit`,
      changeFrequency: 'weekly',
      priority: 0.7,
      lastModified: new Date(),
    },
  ];

  try {
    const ds = await initializeDatabase();
    const repo = ds.getRepository('Quote');
    const quotes = await repo.find({ where: { status: 'posted' }, order: { postedAt: 'DESC' } });

    const dynamicEntries: MetadataRoute.Sitemap = quotes.map((q) => ({
      url: `${baseUrl}/quotes/${q.slug}`,
      changeFrequency: 'monthly',
      priority: 0.6,
      lastModified: q.postedAt || q.createdAt || new Date(),
    }));

    return [...staticEntries, ...dynamicEntries];
  } catch {
    // If DB is unavailable at build/runtime, return static entries only.
    return staticEntries;
  }
}

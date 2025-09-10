import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { initializeDatabase } from '@/lib/db';
import { Quote } from '@/entities/Quote';
import Link from 'next/link';
import React from 'react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getQuote(slug: string): Promise<Quote | null> {
  try {
    const dataSource = await initializeDatabase();
    const quoteRepository = dataSource.getRepository(Quote);
    
    const quote = await quoteRepository.findOne({
      where: { slug },
    });

    if (quote) {
      // Increment views
      quote.views = quote.views + 1;
      await quoteRepository.save(quote);
    }

    return quote;
  } catch (error) {
    console.error('Error fetching quote:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const quote = await getQuote(slug);
  
  if (!quote) {
    return {
      title: 'Quote Not Found | LLM Quotes',
    };
  }

  const title = `${quote.llmSource} Quote | LLM Quotes`;
  const description = quote.content.length > 160 
    ? quote.content.substring(0, 157) + '...' 
    : quote.content;

  return {
    title,
    description,
    alternates: {
      canonical: `/quotes/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: quote.postedAt?.toISOString(),
      authors: quote.twitterHandle ? [`@${quote.twitterHandle}`] : [],
      url: `/quotes/${slug}`,
      images: [
        {
          url: `/quotes/${quote.slug}/opengraph-image`,
          alt: `Quote from ${quote.llmSource}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@LlmQuotes',
      creator: quote.twitterHandle ? `@${quote.twitterHandle}` : undefined,
      title,
      description,
      images: [
        {
          url: `/quotes/${quote.slug}/opengraph-image`,
          alt: `Quote from ${quote.llmSource}`,
        },
      ],
    },
  };
}

export default async function QuotePage({ params }: PageProps) {
  const { slug } = await params;
  const quote = await getQuote(slug);

  if (!quote) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://llmquotes.com';
  const permalink = `${baseUrl}/quotes/${slug}`;
  const openQ = '“';
  const closeQ = '”';
  const dash = '—';
  let shareText = `${openQ}${quote.content}${closeQ}\n\n${dash} ${quote.llmSource}`;
  // Reserve ~24 chars for t.co URL, plus 2 newline chars before it
  const urlReserve = 24;
  const newlineReserve = 2;
  const maxLen = 280 - urlReserve - newlineReserve;
  if (shareText.length > maxLen) {
    const staticLen = (openQ + closeQ + "\n\n" + `${dash} `).length + quote.llmSource.length;
    const allowedQuoteLen = Math.max(0, maxLen - staticLen);
    const ellipsis = '…';
    const trimmed = quote.content.length > allowedQuoteLen
      ? quote.content.slice(0, Math.max(0, allowedQuoteLen - 1)) + ellipsis
      : quote.content;
    shareText = `${openQ}${trimmed}${closeQ}\n\n${dash} ${quote.llmSource}`;
  }
  // Put the permalink two lines below the author line
  const shareBody = `${shareText}\n\n${permalink}`;
  const shareHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareBody)}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: `${quote.llmSource} Quote`,
    text: quote.content,
    inLanguage: 'en',
    url: permalink,
    datePublished: quote.postedAt ? quote.postedAt.toISOString() : undefined,
    author: {
      '@type': 'Organization',
      name: quote.llmSource,
    },
    contributor: quote.twitterHandle
      ? {
          '@type': 'Person',
          name: `@${quote.twitterHandle}`,
          sameAs: `https://x.com/${quote.twitterHandle}`,
        }
      : undefined,
    isPartOf: {
      '@type': 'WebSite',
      name: 'LLM Quotes',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'LLM Quotes',
    },
  };

  return (
    <div className="nb-container py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="brutal-card p-8 w-full">
        <div className="mb-8">
          <h1 className="text-4xl mb-6 leading-tight">&ldquo;{quote.content}&rdquo;</h1>
          <p className="text-2xl mb-4">— {quote.llmSource}</p>
          
          {quote.twitterHandle && (
            <p className="text-lg mb-4">
              Submitted by{' '}
              <a
                href={`https://x.com/${quote.twitterHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                @{quote.twitterHandle}
              </a>
            </p>
          )}
        </div>

        <div className="border-t-6 border-black pt-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <p className="text-sm">
                <strong>Status:</strong>{' '}
                <span className={`status-badge ${quote.status === 'posted' ? 'status-posted' : 'status-pending'}`}>
                  {quote.status}
                </span>
              </p>
            </div>

            <div className="flex gap-4">
              {quote.tweetId && (
                <a
                  href={`https://x.com/LlmQuotes/status/${quote.tweetId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brutal-button"
                >
                  View on X
                </a>
              )}
              <a
                href={shareHref}
                target="_blank"
                rel="noopener noreferrer"
                className="brutal-button"
              >
                Share
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/quotes" className="brutal-button">
          ← Back to All Quotes
        </Link>
      </div>
    </div>
  );
}

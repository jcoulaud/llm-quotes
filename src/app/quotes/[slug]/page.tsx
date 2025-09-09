import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { initializeDatabase } from '@/lib/db';
import { Quote } from '@/entities/Quote';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

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
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: quote.postedAt?.toISOString(),
      authors: quote.twitterHandle ? [`@${quote.twitterHandle}`] : [],
      images: [`/quotes/${quote.slug}/opengraph-image`],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@LlmQuotes',
      creator: quote.twitterHandle ? `@${quote.twitterHandle}` : undefined,
      title,
      description,
      images: [`/quotes/${quote.slug}/opengraph-image`],
    },
  };
}

export default async function QuotePage({ params }: PageProps) {
  const { slug } = await params;
  const quote = await getQuote(slug);

  if (!quote) {
    notFound();
  }

  return (
    <div className="py-8">
      <div className="brutal-card p-8 max-w-4xl mx-auto">
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
                <span className={`brutal-badge ${quote.status === 'posted' ? 'badge-posted' : 'badge-pending'}`}>
                  {quote.status}
                </span>
              </p>
              <p className="text-sm mt-2">
                <strong>Submitted:</strong> {formatDate(quote.createdAt)}
              </p>
              {quote.postedAt && (
                <p className="text-sm mt-2">
                  <strong>Posted:</strong> {formatDate(quote.postedAt)}
                </p>
              )}
              <p className="text-sm mt-2">
                <strong>Views:</strong> {quote.views}
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
              <button
                onClick={() => {
                  const url = window.location.href;
                  const text = `"${quote.content}" - ${quote.llmSource}`;
                  window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
                    '_blank'
                  );
                }}
                className="brutal-button"
              >
                Share
              </button>
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
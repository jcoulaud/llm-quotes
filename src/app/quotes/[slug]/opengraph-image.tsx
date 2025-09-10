import { ImageResponse } from 'next/og';
import { initializeDatabase } from '@/lib/db';
import type { Quote } from '@/entities/Quote';
import { readFile } from 'fs/promises';

let brandImageDataUri: string | null = null;

export const runtime = 'nodejs';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

async function getQuote(slug: string): Promise<Quote | null> {
  try {
    const dataSource = await initializeDatabase();
    const quoteRepository = dataSource.getRepository<Quote>('quotes');
    return await quoteRepository.findOne({ where: { slug } });
  } catch (error) {
    console.error('Error fetching quote for OG image:', error);
    return null;
  }
}

export default async function Image({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const quote = await getQuote(slug);

  // Inline the brand image as a data URI from /public to avoid header/URL issues
  if (!brandImageDataUri) {
    try {
      const brandImageBuffer = await readFile(
        process.cwd() + '/public/web-app-manifest-192x192.png'
      );
      brandImageDataUri = `data:image/png;base64,${brandImageBuffer.toString('base64')}`;
    } catch {
      // Fallback to absolute static URL if reading from filesystem is unavailable in the runtime
      const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://llmquotes.com';
      brandImageDataUri = `${base.replace(/\/$/, '')}/web-app-manifest-192x192.png`;
    }
  }
  const brandImageUrl = brandImageDataUri;

  if (!quote) {
    return new ImageResponse(
      (
        <div
          style={{
            background: '#7a00ff',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: 'white',
              border: '8px solid black',
              padding: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <h1 style={{ fontSize: 48, fontWeight: 'bold' }}>Quote Not Found</h1>
          </div>
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: '#7a00ff',
          width: '100%',
          height: '100%',
          display: 'flex',
          padding: '60px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            background: 'white',
            border: '8px solid black',
            boxShadow: '16px 16px 0 #ffd700',
            width: '100%',
            height: '100%',
            padding: '60px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <img
              src={brandImageUrl}
              alt="LLM Quotes logo"
              style={{ width: 80, height: 80 }}
            />
            <div
              style={{
                fontSize: 36,
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '-2px',
              }}
            >
              LLM Quotes
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              flex: 1,
              justifyContent: 'center',
            }}
          >
            {(() => {
              // Build a single text node to satisfy satori's multi-child rule
              const text = `“${quote.content}”`;
              return (
                <div
                  style={{
                    fontSize: quote.content.length > 150 ? 36 : 42,
                    fontWeight: 'bold',
                    lineHeight: 1.3,
                    color: '#000',
                  }}
                >
                  {text}
                </div>
              );
            })()}
            {(() => {
              const author = `— ${quote.llmSource}`;
              return (
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 'bold',
                    color: '#000',
                    marginTop: '20px',
                  }}
                >
                  {author}
                </div>
              );
            })()}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 24,
              opacity: 0.8,
            }}
          >
            <div>@LlmQuotes</div>
            {quote.twitterHandle && (
              (() => {
                const submitter = `Submitted by @${quote.twitterHandle}`;
                return <div>{submitter}</div>;
              })()
            )}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

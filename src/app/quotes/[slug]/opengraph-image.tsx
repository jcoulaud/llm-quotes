import { ImageResponse } from 'next/og';
import { initializeDatabase } from '@/lib/db';
import { Quote } from '@/entities/Quote';

export const runtime = 'edge';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

async function getQuote(slug: string): Promise<Quote | null> {
  try {
    const dataSource = await initializeDatabase();
    const quoteRepository = dataSource.getRepository(Quote);
    return await quoteRepository.findOne({ where: { slug } });
  } catch (error) {
    console.error('Error fetching quote for OG image:', error);
    return null;
  }
}

export default async function Image({ params }: { params: { slug: string } }) {
  const quote = await getQuote(params.slug);

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
            <div
              style={{
                fontSize: 80,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              💬
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 900,
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
            <div
              style={{
                fontSize: quote.content.length > 150 ? 36 : 42,
                fontWeight: 'bold',
                lineHeight: 1.3,
                color: '#000',
              }}
            >
              "{quote.content}"
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: '#000',
                marginTop: '20px',
              }}
            >
              — {quote.llmSource}
            </div>
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
              <div>Submitted by @{quote.twitterHandle}</div>
            )}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
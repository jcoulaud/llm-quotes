import { ImageResponse } from 'next/og';

// Use Node runtime for broader compatibility across crawlers
export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OG() {
  const tagline = 'The best of the worst LLM replies, all in one place.';
  return new ImageResponse(
    (
      <div
        style={{
          background: '#7a00ff',
          width: '100%',
          height: '100%',
          display: 'flex',
          padding: 60,
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
            padding: 60,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div
              style={{
                fontSize: 40,
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: -2,
              }}
            >
              LLM Quotes
            </div>
          </div>

          <div style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
            <div
              style={{
                fontSize: 58,
                fontWeight: 'bold',
                lineHeight: 1.2,
                color: '#000',
              }}
            >
              {tagline}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 28,
              opacity: 0.85,
              color: '#000',
            }}
          >
            <div>@LlmQuotes</div>
            <div>llmquotes.com</div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

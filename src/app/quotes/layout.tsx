import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Quotes | LLM Quotes',
  description:
    'Browse the full collection of posted LLM quotes. Filter by status or source: ChatGPT, Claude, Grok, Gemini, and more.',
  alternates: {
    canonical: '/quotes',
  },
  openGraph: {
    title: 'All Quotes',
    description: 'Explore the latest and greatest quotes from AI models.',
    url: '/quotes',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function QuotesLayout({ children }: { children: React.ReactNode }) {
  return children;
}


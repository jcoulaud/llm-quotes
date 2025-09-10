import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin | LLM Quotes',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-image-preview': 'none',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/admin',
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}


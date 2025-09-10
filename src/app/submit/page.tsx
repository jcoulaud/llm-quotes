import SubmitForm from '@/components/SubmitForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Submit a Quote | LLM Quotes',
  description: 'Share your favorite LLM quote. Tag the source and your handle for attribution.',
  alternates: { canonical: '/submit' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Submit a Quote',
    description: 'Contribute your favorite LLM replies to the collection.',
    url: '/submit',
    type: 'website',
  },
};

export default function SubmitPage() {
  return <SubmitForm />;
}

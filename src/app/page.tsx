import Link from "next/link";
import SubmitQuoteButton from "@/components/SubmitQuoteButton";
import { initializeDatabase } from '@/lib/db';
import { Quote } from '@/entities/Quote';
import QuoteCard from '@/components/QuoteCard';

async function getRecentQuotes() {
  try {
    const dataSource = await initializeDatabase();
    const quoteRepository = dataSource.getRepository(Quote);
    
    const quotes = await quoteRepository.find({
      where: { status: 'posted' },
      order: { postedAt: 'DESC' },
      take: 10,
    });

    return quotes;
  } catch (error) {
    console.error('Error fetching recent quotes:', error);
    return [];
  }
}

export default async function Home() {
  const recentQuotes = await getRecentQuotes();

  return (
    <div>
      <section className="py-20 relative">
        <div className="decoration decoration-circle absolute top-10 left-10 opacity-20"></div>
        <div className="decoration decoration-square absolute bottom-8 right-10 opacity-20"></div>
        <div className="nb-container max-w-3xl">
          <h1 className="hero-text mb-6">
            The Internet’s Best LLM Quotes
            <br />Collected and Posted
          </h1>
          <p className="subtitle mb-6 max-w-xl">
            Real outputs from ChatGPT, Claude, Grok, Gemini, and more. Submit your favorites — the best hit <a className="underline font-semibold" href="https://x.com/LlmQuotes" target="_blank" rel="noopener noreferrer">@LlmQuotes</a>.
          </p>
          <div className="flex gap-3 flex-wrap">
            <SubmitQuoteButton />
            <Link href="/quotes" className="brutal-button ghost">Browse All</Link>
          </div>
        </div>
      </section>

      <div className="nb-container">
      <section id="how-it-works" className="grid md:grid-cols-3 gap-8 py-10">
        <div className="brutal-card">
          <div className="card-accent"></div>
          <span className="badge badge-pending mb-4">Step 1</span>
          <h3 className="nb-h3 mb-2">Submit</h3>
          <p className="text-sm opacity-80">Share your favorite AI‑generated quote and pick the LLM source. Add your Twitter handle to be tagged.</p>
        </div>
        <div className="brutal-card">
          <div className="card-accent" style={{ background: 'var(--nb-blue)' }}></div>
          <span className="badge badge-approved mb-4">Step 2</span>
          <h3 className="nb-h3 mb-2">Moderate</h3>
          <p className="text-sm opacity-80">Admins review, approve, or schedule posts.</p>
        </div>
        <div className="brutal-card">
          <div className="card-accent" style={{ background: 'var(--nb-pink)' }}></div>
          <span className="badge badge-posted mb-4">Step 3</span>
          <h3 className="nb-h3 mb-2">Post</h3>
          <p className="text-sm opacity-80">Top quotes are posted to @LlmQuotes with attribution. Every quote gets an SEO page.</p>
        </div>
      </section>

      <section className="py-10">
        {recentQuotes.length === 0 ? (
          <div className="brutal-card text-center">
            <p className="text-base">No quotes posted yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {recentQuotes.slice(0, 5).map((quote) => (
              <QuoteCard key={quote.id} quote={quote} />
            ))}
          </div>
        )}
      </section>
      </div>
    </div>
  );
}

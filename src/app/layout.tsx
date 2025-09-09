import type { Metadata } from "next";
import "./globals.css";
// import Link from "next/link";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "LLM Quotes - Share AI Wisdom",
  description: "Submit and discover the best quotes from AI language models",
  openGraph: {
    title: "LLM Quotes",
    description: "Submit and discover the best quotes from AI language models",
    url: "https://llmquotes.com",
    siteName: "LLM Quotes",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@LlmQuotes",
    creator: "@LlmQuotes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <div className="grid-overlay"></div>
        
        <Header />
        
        <main className="relative z-10 min-h-screen">
          {children}
        </main>
        
        <footer className="relative z-10 nb-footer mt-20">
          <div className="nb-container py-32">
            <div className="flex justify-between items-center">
              <div className="text-sm">
                Made by {""}
                <a href="https://x.com/JulienCoulaud" target="_blank" rel="noopener noreferrer" className="underline font-semibold">J</a>
              </div>
              <div className="flex gap-6">
                <a
                  href="https://x.com/LlmQuotes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium transition-colors"
                >
                  X
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

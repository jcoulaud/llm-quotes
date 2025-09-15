import type { Metadata } from "next";
import "./globals.css";
// import Link from "next/link";
import Header from "@/components/Header";
import ToastProvider from "@/components/ToastProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerkAppearance";

export const metadata: Metadata = {
  // Ensures all relative metadata URLs resolve as absolute
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://llmquotes.com'),
  title: "LLM Quotes — The best of the worst LLM replies, all in one place.",
  description: "Submit and discover the best quotes from AI language models.",
  openGraph: {
    title: "LLM Quotes",
    description: "Submit and discover the best quotes from AI language models.",
    url: "https://llmquotes.com",
    siteName: "LLM Quotes",
    locale: "en_US",
    type: "website",
    images: [
      {
        // Static site-wide OG image (real image under /public)
        url: `/og-home.png?v=${process.env.VERCEL_GIT_COMMIT_SHA?.slice(0,8) || 'v1'}`,
        width: 512,
        height: 512,
        alt: "LLM Quotes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@LlmQuotes",
    creator: "@LlmQuotes",
    images: [
      {
        // Static site-wide image for Twitter cards
        url: `/og-home.png?v=${process.env.VERCEL_GIT_COMMIT_SHA?.slice(0,8) || 'v1'}`,
        alt: "LLM Quotes",
      },
    ],
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
        {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (
          <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up" appearance={clerkAppearance}>
            <div className="grid-overlay"></div>

            <ToastProvider>
              <Header />

              <main className="relative z-10 min-h-screen">{children}</main>

              <footer className="relative z-10 nb-footer mt-20">
                <div className="nb-container py-3">
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      Made by {""}
                      <a
                        href="https://x.com/JulienCoulaud"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-semibold"
                      >
                        J
                      </a>
                    </div>
                    <div className="flex gap-6">
                      <a
                        href="https://github.com/jcoulaud/llm-quotes"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium transition-colors"
                      >
                        GitHub
                      </a>
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
            </ToastProvider>
          </ClerkProvider>
        ) : (
          <>
            <div className="grid-overlay"></div>

            <ToastProvider>
              <Header />

              <main className="relative z-10 min-h-screen">{children}</main>

              <footer className="relative z-10 nb-footer mt-20">
                <div className="nb-container py-3">
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      Made by {""}
                      <a
                        href="https://x.com/JulienCoulaud"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-semibold"
                      >
                        J
                      </a>
                    </div>
                    <div className="flex gap-6">
                      <a
                        href="https://github.com/jcoulaud/llm-quotes"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium transition-colors"
                      >
                        GitHub
                      </a>
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
            </ToastProvider>
          </>
        )}
      </body>
    </html>
  );
}

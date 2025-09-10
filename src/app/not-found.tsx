import Link from "next/link";

export default function NotFound() {
  return (
    <section className="relative">
      <div className="nb-container pt-16 pb-20">
        <div className="relative brutal-card nb-shadow-yellow overflow-hidden">
          {/* Decorative bits */}
          <div className="decoration decoration-grid" style={{ bottom: -30, right: -30 }} />

          <div className="relative z-10 grid items-center gap-8">
            <div>
              <div className="inline-block badge badge-blue mb-4">404</div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-4" style={{ letterSpacing: "-0.02em" }}>
                Page Not Found
              </h1>
              <p className="text-lg md:text-xl font-medium text-[var(--nb-ink-soft)] max-w-prose">
                This page doesn’t exist. Try one of these instead.
              </p>

              <div className="flex flex-wrap gap-3 mt-7">
                <Link href="/" className="brutal-button btn-primary">
                  Go Home
                </Link>
                <Link href="/quotes" className="brutal-button btn-secondary">
                  Browse Quotes
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

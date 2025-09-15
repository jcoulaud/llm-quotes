# LLM Quotes

Real outputs from ChatGPT, Claude, Grok, Gemini, and more. Submit your favorites — the best hit [@LlmQuotes](https://x.com/LlmQuotes).

## What You Get

- Submit quotes with LLM source and optional X @handle
- Browse/filter quotes
- Save your favorite quotes
- Upvote the best ones
- Admin approve/reject/schedule (for now)
- Auto OG images for each quote page
- Auto‑posting to X via official Twitter API

## Quickstart

- Requirements: Node 22+, pnpm
- Install: `pnpm install`
- Env: create `.env.local` (minimal example below)
- Migrate DB: `pnpm run db:migrate`
- Dev: `pnpm dev` then open http://localhost:3000
- Admin: go to `/admin` and log in with the creds you set

```env
# Required
DATABASE_URL=postgres://...          # Neon or any Postgres
ADMIN_USERNAME=admin                 # you pick
ADMIN_PASSWORD=supersecret           # you pick
ADMIN_SESSION_SECRET=long-random     # for signing the admin session
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Post to X/Twitter (official API)
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_SECRET=...

# I use twitterapi.io to fetch tweet details, because the official API is expensive and rate limited
TWITTERAPIIO_API_KEY=...

# Protect the cron endpoint (for schedulers)
CRON_SECRET=...

# Clerk (only if you want account pages/webhooks)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_WEBHOOK_SECRET=whsec_...
```

## Commands

- Dev: `pnpm dev`
- Build: `pnpm build`
- Run migrations: `pnpm run db:migrate`

## Deploy (Vercel)

- Push to GitHub, import on Vercel
- Add the same env vars in Vercel
- Optional: set up a cron hitting `POST /api/cron/scheduler` with header `Authorization: Bearer $CRON_SECRET`

## Notes

- No Twitter keys? Posting just won’t run — everything else works.
- Use a pooled Postgres URL (Neon works great). Run migrations before first run.
- Admin session uses `ADMIN_SESSION_SECRET` (or `NEXTAUTH_SECRET`); keep it long and random.

## License

MIT

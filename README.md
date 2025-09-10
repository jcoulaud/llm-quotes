# LLM Quotes - Neo-Brutalist Quote Sharing Platform

A Neo-Brutalist styled web application for submitting, moderating, and sharing quotes from AI language models on Twitter/X.

## Features

- 🎨 **Neo-Brutalist Design**: Bold colors (purple background, yellow accents) with heavy borders
- 📝 **Quote Submission**: Users can submit quotes with LLM source and optional Twitter handle
- 🔍 **Browse Quotes**: View all quotes with status filters (pending, approved, scheduled, posted)
- 🖼️ **Dynamic OG Images**: Each quote gets its own SEO-optimized page with auto-generated OpenGraph image
- 👮 **Admin Dashboard**: Moderate submissions (approve/reject/schedule)
- 🐦 **Twitter Integration**: Automated posting to @LlmQuotes with user tagging
- ⏰ **Scheduled Posting**: Queue approved quotes for future posting
- 🚦 **Rate Limiting**: 20 submissions per day per user (localStorage based)

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript**
- **TypeORM** with Neon PostgreSQL
- **Tailwind CSS** (Neo-Brutalism custom styles)
- **Twitter API v2**
- **Vercel** for deployment and cron jobs
 - **twitterapi.io** for tweet lookups (read-only)

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Create `.env.local` with:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=your-neon-postgresql-url

# Twitter API
TWITTER_API_KEY=your-twitter-api-key
TWITTER_API_SECRET=your-twitter-api-secret
TWITTER_ACCESS_TOKEN=your-twitter-access-token
TWITTER_ACCESS_SECRET=your-twitter-access-secret

# twitterapi.io (Read tweets)
TWITTERAPIIO_API_KEY=your-twitterapi-io-api-key

# Admin
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-admin-password
ADMIN_SESSION_SECRET=your-long-random-secret

# Cron
CRON_SECRET=your-cron-secret

# Next Auth
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Public site URL (used for metadata and tweet links)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional: control runtime migrations (defaults to off)
RUN_MIGRATIONS_ON_STARTUP=false
```

### 3. Run Development Server

```bash
pnpm dev
```

Visit http://localhost:3000

## Pages

- `/` - Homepage with Twitter feed and recent quotes
- `/submit` - Submit new quotes
- `/quotes` - Browse all quotes with filters
- `/quotes/[slug]` - Individual quote page with SEO
- `/admin` - Admin dashboard (redirects to `/admin/login` when not authenticated)

## Admin Access

Navigate to `/admin` to open the login modal and use:
- Username: `[ADMIN_USERNAME from .env]`
- Password: `[ADMIN_PASSWORD from .env]`

The admin login issues a signed, HTTP-only session cookie. Ensure `ADMIN_SESSION_SECRET` (or `NEXTAUTH_SECRET`) is set for HMAC signing. Moderation API routes validate this cookie server‑side.

## Database Schema

```typescript
Quote {
  id: number
  content: string
  llmSource: string
  twitterHandle?: string
  status: 'pending' | 'approved' | 'scheduled' | 'posted' | 'rejected'
  slug: string
  scheduledFor?: Date
  tweetId?: string
  views: number
  createdAt: Date
  postedAt?: Date
}
```

## Deployment on Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

The cron job will run hourly to post scheduled quotes.

## Database & Neon Best Practices

- Use your Neon pooled connection string in `DATABASE_URL` (the one ending with `.neon.tech`), and include `sslmode=require`.
- Avoid `synchronize` in all environments. This project uses migrations only.
- Keep a small pool size in serverless environments. This project configures `pg` with a small pool and keep-alive.
- Reuse a single TypeORM `DataSource` across requests via a global cache to reduce cold-connection churn.
- Prefer running migrations as part of your deploy/CI pipeline instead of during requests.

### Running Migrations

Generate or edit migration files under `src/migrations/`. An initial migration is provided: `1736550000000-CreateQuotesTable.ts`.

Run migrations locally (or in CI):

```bash
pnpm run db:migrate
```

This compiles a minimal build for the migration runner and executes it against the DB specified by `DATABASE_URL`.

Env loading: the migration runner loads `.env.local` (if present) and then `.env` via `dotenv`.

SSL: control via env/URL only. If your DB requires TLS, either keep `?ssl=true` (preferred) or `?sslmode=require` in `DATABASE_URL`, or set `PGSSLMODE=require`. To disable TLS locally, remove those URL params and/or set `PGSSLMODE=disable` (or `PGSSL=disable`).

Node: use Node 22+ (see `"engines"` and `.nvmrc`).

To run migrations on startup (not generally recommended in serverless), set:

```env
RUN_MIGRATIONS_ON_STARTUP=true
```

### Suggested CI step (GitHub Actions)

Run migrations during deploy using a dedicated job with `DATABASE_URL` stored as a secret. Example:

```yaml
name: DB Migrations
on:
  workflow_dispatch: {}
  push:
    branches: [ main ]
jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run db:migrate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

This avoids running migrations inside request handlers in production and plays well with Neon.

## Twitter API Setup

1. Create a Twitter Developer account
2. Create a new app with read/write permissions
3. Generate API keys and access tokens
4. Add to environment variables

## Tweet Lookup (Read) via twitterapi.io

Posting uses the official Twitter API (see `src/lib/twitter.ts`). Reading existing tweets by ID uses `twitterapi.io` (see `src/lib/tweetReader.ts`) to avoid elevated access requirements.

- Provide `TWITTERAPIIO_API_KEY` in your env to enable lookups
- Server route: `GET /api/tweets/lookup?ids=123,456` returns the raw response from twitterapi.io
- You should store `tweetId` when posting (already handled in the scheduler) so you can retrieve details later

## Features in Detail

### Quote Submission
- Rate limited to 20/day per user
- Validates quote length (10-500 chars)
- Optional Twitter handle for attribution

### Moderation Flow
1. User submits quote → Status: `pending`
2. Admin approves → Status: `approved`
3. Admin schedules → Status: `scheduled`
4. Cron posts to Twitter → Status: `posted`

### SEO & Social
- Each quote has unique URL: `/quotes/[slug]`
- Dynamic OG images with Neo-Brutalist design
- Twitter cards for sharing
- View counter for popularity tracking

## Development

```bash
# Start dev server
pnpm dev

# Type check
pnpm tsc --noEmit

# Build for production
pnpm build
```

## License

MIT

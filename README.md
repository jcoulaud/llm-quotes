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
- 🚦 **Rate Limiting**: 5 submissions per day per user (localStorage based)

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript**
- **TypeORM** with Neon PostgreSQL
- **Tailwind CSS** (Neo-Brutalism custom styles)
- **Twitter API v2**
- **Vercel** for deployment and cron jobs

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

# Admin
ADMIN_PASSWORD=your-admin-password

# Cron
CRON_SECRET=your-cron-secret

# Next Auth
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
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
- `/admin` - Admin dashboard (requires basic auth: username: `admin`)

## Admin Access

Navigate to `/admin` and use:
- Username: `admin`
- Password: `[ADMIN_PASSWORD from .env]`

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

## Twitter API Setup

1. Create a Twitter Developer account
2. Create a new app with read/write permissions
3. Generate API keys and access tokens
4. Add to environment variables

## Features in Detail

### Quote Submission
- Rate limited to 5/day per user
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

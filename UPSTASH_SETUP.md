# Upstash Redis Setup Guide

This guide explains how to set up Upstash Redis for rate limiting on Vercel.

## Why Upstash Redis?

- **Vercel Edge Compatible**: Works perfectly with Next.js 16 proxy (middleware)
- **Serverless-Ready**: No connection pooling issues, HTTP-based
- **Free Tier**: 10,000 commands/day for free
- **Global Replication**: Low latency worldwide
- **Built-in Analytics**: Monitor usage in Upstash dashboard

## Setup Steps

### 1. Create Upstash Account

1. Go to [https://console.upstash.com/](https://console.upstash.com/)
2. Sign up with GitHub or email
3. Verify your email

### 2. Create Redis Database

1. Click **"Create Database"** in the Upstash Console
2. Choose settings:
   - **Name**: `naver-store-finder` (or any name you prefer)
   - **Type**: Regional (for free tier) or Global (for better performance)
   - **Region**: Choose closest to your users (e.g., `ap-northeast-2` for Korea)
   - **Eviction**: `allkeys-lru` (least recently used)
3. Click **"Create"**

### 3. Get Redis Credentials

1. Open your newly created database
2. Scroll to **"REST API"** section
3. Copy the following:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### 4. Configure Environment Variables

#### Local Development (.env.local)

```env
# Naver API
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret

# Upstash Redis (optional for local dev)
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

**Note**: For local development, you can skip Upstash configuration. The app will use in-memory rate limiting.

#### Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:
   - `UPSTASH_REDIS_REST_URL` = `https://your-db.upstash.io`
   - `UPSTASH_REDIS_REST_TOKEN` = `your_token_here`
4. Select **Production**, **Preview**, and **Development** environments
5. Click **Save**

### 5. Deploy to Vercel

```bash
# Build locally to verify
npm run build

# Deploy to Vercel
vercel deploy

# Or push to main branch (if auto-deploy is enabled)
git push origin main
```

## Rate Limiting Configuration

Current settings in `proxy.ts`:

```typescript
const RATE_LIMIT_CONFIG = {
  MAX_REQUESTS: 10,      // 10 requests
  WINDOW_SECONDS: 60,    // per 60 seconds (1 minute)
}
```

To adjust limits, modify `RATE_LIMIT_CONFIG` in `proxy.ts`.

## How It Works

### With Upstash (Production on Vercel)

1. User makes API request
2. Proxy extracts client IP from headers
3. Checks Redis for current count
4. Allows or blocks based on sliding window algorithm
5. Returns rate limit headers

### Without Upstash (Local Development)

1. Falls back to in-memory rate limiting
2. Limited to single server instance
3. Resets on server restart
4. Good enough for development/testing

## Monitoring

### Upstash Dashboard

1. Go to [https://console.upstash.com/](https://console.upstash.com/)
2. Open your database
3. View **Analytics** tab to see:
   - Total commands
   - Commands per second
   - Memory usage
   - Top commands

### Response Headers

Every API response includes:

```
X-RateLimit-Limit: 10          # Max requests allowed
X-RateLimit-Remaining: 7       # Requests left
X-RateLimit-Reset: 1706198400  # Unix timestamp when limit resets
```

When rate limited (429 response):

```
Retry-After: 45  # Seconds to wait before retrying
```

## Cost Estimation

### Free Tier (sufficient for most cases)

- **10,000 commands/day**
- Assuming 1 API call = ~2 Redis commands (read + write)
- Can handle ~5,000 API requests/day
- Resets daily

### Paid Tier

If you exceed free tier:

- **Pay-as-you-go**: $0.20 per 100K commands
- **Pro 1K**: $10/month for 1M commands/day
- **Pro 10K**: $80/month for 10M commands/day

See [Upstash Pricing](https://upstash.com/pricing/redis) for details.

## Troubleshooting

### Rate limiter not working on Vercel

1. Check environment variables are set in Vercel dashboard
2. Verify variables are applied to all environments
3. Redeploy after adding variables

### "Upstash error, falling back to in-memory" in logs

1. Check `UPSTASH_REDIS_REST_URL` format (must include `https://`)
2. Verify `UPSTASH_REDIS_REST_TOKEN` is correct
3. Ensure database is not paused (check Upstash console)

### Commands exceeding free tier

1. Review analytics in Upstash dashboard
2. Check for bot traffic or attacks
3. Consider lowering `MAX_REQUESTS` or `WINDOW_SECONDS`
4. Implement additional bot protection

## Alternative: Local Development Only

If you don't want to use Upstash for local development:

1. **Don't add** Upstash env vars to `.env.local`
2. App will automatically use in-memory rate limiting
3. Add Upstash env vars **only in Vercel**
4. This hybrid approach is recommended for most use cases

## Security Notes

- **Never commit** `.env.local` to Git
- Store Upstash credentials securely
- Rotate tokens if compromised
- Use read-only tokens if possible (not available for rate limiting)

## Further Reading

- [Upstash Redis Documentation](https://docs.upstash.com/redis)
- [@upstash/ratelimit Documentation](https://github.com/upstash/ratelimit)
- [Vercel Edge Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

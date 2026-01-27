import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// RATE LIMITER CONFIGURATION
// ============================================================================

const RATE_LIMIT_CONFIG = {
  // Maximum requests per window
  MAX_REQUESTS: 10,

  // Time window in seconds (1 minute)
  WINDOW_SECONDS: 60,
} as const;

// ============================================================================
// UPSTASH REDIS RATE LIMITER (for Vercel Edge Runtime)
// ============================================================================

/**
 * Initialize Upstash Redis client
 * Only created if environment variables are present
 */
let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

// Initialize only if Upstash credentials are available
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  // Create rate limiter with fixed window algorithm
  // Every minute resets to MAX_REQUESTS (more intuitive for users)
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(
      RATE_LIMIT_CONFIG.MAX_REQUESTS,
      `${RATE_LIMIT_CONFIG.WINDOW_SECONDS} s`,
    ),
    analytics: true, // Enable analytics in Upstash dashboard
    prefix: 'naver-store-finder', // Prefix for Redis keys
  });
}

// ============================================================================
// FALLBACK IN-MEMORY RATE LIMITER (for development/testing)
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

function cleanupExpiredEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
  lastCleanup = now;
}

function checkInMemoryRateLimit(clientId: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const windowMs = RATE_LIMIT_CONFIG.WINDOW_SECONDS * 1000;

  // Calculate fixed window: align to minute boundaries
  // Example: 14:00:30 → window starts at 14:00:00, resets at 14:01:00
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const resetTime = windowStart + windowMs;

  cleanupExpiredEntries();

  const entry = rateLimitStore.get(clientId);

  // No entry or expired window - start new window
  if (!entry || now >= entry.resetTime) {
    rateLimitStore.set(clientId, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.MAX_REQUESTS - 1,
      resetTime: Math.ceil(resetTime / 1000), // Convert to seconds for consistency
    };
  }

  // Within current window
  if (entry.count < RATE_LIMIT_CONFIG.MAX_REQUESTS) {
    entry.count += 1;
    rateLimitStore.set(clientId, entry);
    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.MAX_REQUESTS - entry.count,
      resetTime: Math.ceil(entry.resetTime / 1000),
    };
  }

  // Rate limited
  return {
    allowed: false,
    remaining: 0,
    resetTime: Math.ceil(entry.resetTime / 1000),
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get client identifier from request
 * Uses IP address as identifier
 */
function getClientId(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * Check rate limit using Upstash or fallback to in-memory
 */
async function checkRateLimit(clientId: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
}> {
  // Use Upstash if available (production on Vercel)
  if (ratelimit) {
    try {
      const { success, remaining, reset } = await ratelimit.limit(clientId);

      return {
        allowed: success,
        remaining,
        resetTime: reset,
      };
    } catch (error) {
      console.error('[Rate Limiter] Upstash error, falling back to in-memory:', error);
      // Fallback to in-memory on error
      return checkInMemoryRateLimit(clientId);
    }
  }

  // Use in-memory for development/testing
  return checkInMemoryRateLimit(clientId);
}

// ============================================================================
// PROXY (Next.js 16 - formerly called middleware)
// ============================================================================

export default async function proxy(request: NextRequest) {
  // Only apply rate limiting to API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const clientId = getClientId(request);
  const { allowed, remaining, resetTime } = await checkRateLimit(clientId);

  // Log rate limit events (only in production for monitoring)
  if (!allowed) {
    console.warn('[Rate Limit] Blocked request', {
      clientId,
      remaining,
      resetTime: new Date(resetTime * 1000).toISOString(),
      path: request.nextUrl.pathname,
    });
  }

  // Create response
  const response = allowed
    ? NextResponse.next()
    : NextResponse.json(
      {
        success: false,
        error: 'Too many requests. Please try again later.',
      },
      { status: 429 },
    );

  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_CONFIG.MAX_REQUESTS));
  response.headers.set('X-RateLimit-Remaining', String(remaining));
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(resetTime / 1000)));

  // Add Retry-After header if rate limited
  if (!allowed) {
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
    response.headers.set('Retry-After', String(Math.max(retryAfter, 1)));
  }

  return response;
}

// ============================================================================
// PROXY CONFIG (Next.js 16)
// ============================================================================

export const config = {
  matcher: '/api/:path*',
};

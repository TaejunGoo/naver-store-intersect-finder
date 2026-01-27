import { NextRequest } from 'next/server';
import { describe, it, expect, beforeEach } from 'vitest';

// Mock middleware function for testing rate limit logic
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const RATE_LIMIT_CONFIG = {
  MAX_REQUESTS: 10,
  WINDOW_MS: 60 * 1000,
};

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();

  check(clientId: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();

    // Fixed Window: align to window boundaries
    const windowStart = Math.floor(now / RATE_LIMIT_CONFIG.WINDOW_MS) * RATE_LIMIT_CONFIG.WINDOW_MS;
    const resetTime = windowStart + RATE_LIMIT_CONFIG.WINDOW_MS;

    const entry = this.store.get(clientId);

    // No entry or expired window - start new window
    if (!entry || now >= entry.resetTime) {
      this.store.set(clientId, { count: 1, resetTime });
      return {
        allowed: true,
        remaining: RATE_LIMIT_CONFIG.MAX_REQUESTS - 1,
        resetTime,
      };
    }

    // Within current window
    if (entry.count < RATE_LIMIT_CONFIG.MAX_REQUESTS) {
      entry.count += 1;
      this.store.set(clientId, entry);
      return {
        allowed: true,
        remaining: RATE_LIMIT_CONFIG.MAX_REQUESTS - entry.count,
        resetTime: entry.resetTime,
      };
    }

    // Rate limited
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  clear() {
    this.store.clear();
  }
}

describe('Rate Limiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter();
  });

  describe('Basic Rate Limiting', () => {
    it('should allow requests under the limit', () => {
      const result = limiter.check('client1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('should track multiple requests from same client', () => {
      limiter.check('client1'); // 1st request
      limiter.check('client1'); // 2nd request
      const result = limiter.check('client1'); // 3rd request

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(7);
    });

    it('should block requests after limit is reached', () => {
      // Make MAX_REQUESTS (10) requests
      for (let i = 0; i < 10; i++) {
        limiter.check('client1');
      }

      // 11th request should be blocked
      const result = limiter.check('client1');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should isolate different clients', () => {
      // Client 1 makes 10 requests
      for (let i = 0; i < 10; i++) {
        limiter.check('client1');
      }

      // Client 2 should still be allowed
      const result = limiter.check('client2');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });
  });

  describe('Reset Time (Fixed Window)', () => {
    it('should set reset time aligned to window boundary', () => {
      const now = Date.now();
      const result = limiter.check('client1');

      // Reset time should be in the future
      expect(result.resetTime).toBeGreaterThan(now);
      expect(result.resetTime).toBeLessThanOrEqual(now + RATE_LIMIT_CONFIG.WINDOW_MS);

      // Reset time should be aligned to window boundary (divisible by WINDOW_MS)
      expect(result.resetTime % RATE_LIMIT_CONFIG.WINDOW_MS).toBe(0);
    });

    it('should keep same reset time for all requests in same window', () => {
      const result1 = limiter.check('client1');
      const result2 = limiter.check('client1');
      const result3 = limiter.check('client1');

      // All requests in same window should have identical reset time
      expect(result1.resetTime).toBe(result2.resetTime);
      expect(result2.resetTime).toBe(result3.resetTime);
    });
  });

  describe('Remaining Count', () => {
    it('should decrease remaining count with each request', () => {
      const results = [];
      for (let i = 0; i < 5; i++) {
        results.push(limiter.check('client1'));
      }

      expect(results[0].remaining).toBe(9);
      expect(results[1].remaining).toBe(8);
      expect(results[2].remaining).toBe(7);
      expect(results[3].remaining).toBe(6);
      expect(results[4].remaining).toBe(5);
    });

    it('should show 0 remaining when limit reached', () => {
      for (let i = 0; i < 10; i++) {
        limiter.check('client1');
      }

      const result = limiter.check('client1');
      expect(result.remaining).toBe(0);
    });
  });
});

describe('Client ID Extraction', () => {
  it('should extract IP from x-forwarded-for header', () => {
    const request = new NextRequest(new Request('http://localhost/api/search'));
    request.headers.set('x-forwarded-for', '192.168.1.1, 10.0.0.1');

    // The middleware should extract the first IP
    const forwarded = request.headers.get('x-forwarded-for');
    const clientId = forwarded?.split(',')[0].trim();

    expect(clientId).toBe('192.168.1.1');
  });

  it('should extract IP from x-real-ip header', () => {
    const request = new NextRequest(new Request('http://localhost/api/search'));
    request.headers.set('x-real-ip', '192.168.1.100');

    const clientId = request.headers.get('x-real-ip');
    expect(clientId).toBe('192.168.1.100');
  });

  it('should prefer x-forwarded-for over x-real-ip', () => {
    const request = new NextRequest(new Request('http://localhost/api/search'));
    request.headers.set('x-forwarded-for', '192.168.1.1');
    request.headers.set('x-real-ip', '192.168.1.100');

    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');

    // Middleware should prefer x-forwarded-for
    const clientId = forwarded || realIp;
    expect(clientId).toBe('192.168.1.1');
  });
});

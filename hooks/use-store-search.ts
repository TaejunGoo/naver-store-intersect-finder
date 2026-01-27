import { useState } from 'react';

import useSWRMutation from 'swr/mutation';

import { SearchResponse } from '@/types';

interface SearchArgs {
  keywords: string[]
  display?: number
}

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

interface SearchResponseWithRateLimit {
  data: SearchResponse;
  rateLimit: RateLimitInfo | null;
}

async function searchStores(
  url: string,
  { arg }: { arg: SearchArgs },
): Promise<SearchResponseWithRateLimit> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  });

  // Extract rate limit headers
  const rateLimit: RateLimitInfo | null = response.headers.get('X-RateLimit-Limit')
    ? {
      limit: parseInt(response.headers.get('X-RateLimit-Limit') || '0', 10),
      remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '0', 10),
      reset: parseInt(response.headers.get('X-RateLimit-Reset') || '0', 10),
    }
    : null;

  if (!response.ok) {
    const data = await response.json();
    // Include rate limit info even in errors
    const error = new Error(data.error || 'Search failed') as Error & { rateLimit: RateLimitInfo | null };
    error.rateLimit = rateLimit;
    throw error;
  }

  const data = await response.json();

  return {
    data,
    rateLimit,
  };
}

export function useStoreSearch() {
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);

  const { trigger, data, error, isMutating, reset } = useSWRMutation(
    '/api/search',
    searchStores,
  );

  const search = async (keywords: string[]) => {
    try {
      const result = await trigger({ keywords });
      if (result?.rateLimit) {
        setRateLimitInfo(result.rateLimit);
      }
      return result;
    } catch (err) {
      // Update rate limit info even on error (e.g., 429 response)
      if (err && typeof err === 'object' && 'rateLimit' in err) {
        setRateLimitInfo((err as { rateLimit: RateLimitInfo | null }).rateLimit);
      }
      throw err;
    }
  };

  return {
    search,
    data: data?.data || null,
    error: error?.message || null,
    isLoading: isMutating,
    rateLimitInfo,
    reset: () => {
      reset();
      setRateLimitInfo(null);
    },
  };
}

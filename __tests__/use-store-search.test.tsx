import { act, renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useStoreSearch } from '@/hooks/use-store-search';

afterEach(() => vi.unstubAllGlobals());

describe('Search error handling', () => {
  it('exposes failed requests and rate limits without rejecting the event handler', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ success: false, error: '검색을 이용할 수 없습니다.' }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '9',
          'X-RateLimit-Reset': '1800000000',
        },
      },
    )));
    const { result } = renderHook(() => useStoreSearch(), {
      wrapper: ({ children }) => <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>,
    });

    await act(async () => {
      await expect(result.current.search(['단백질', '쉐이커'])).resolves.toBeUndefined();
    });

    await waitFor(() => expect(result.current.error).toBe('검색을 이용할 수 없습니다.'));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.rateLimitInfo).toEqual({ limit: 10, remaining: 9, reset: 1800000000 });
  });
});

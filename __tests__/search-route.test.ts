import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { POST } from '@/app/api/search/route';

function request(keywords: string[]) {
  return new NextRequest('http://localhost/api/search', {
    method: 'POST',
    body: JSON.stringify({ keywords }),
    headers: { 'Content-Type': 'application/json' },
  });
}

afterEach(() => vi.unstubAllGlobals());

describe('Search route retirement', () => {
  it('returns an actionable 503 without credentials or upstream requests', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const response = await POST(request(['단백질', '쉐이커']));

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({
      success: false,
      errorCode: 'SHOPPING_SEARCH_RETIRED',
      error: expect.stringContaining('2026년 7월 31일 종료'),
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('still rejects invalid keywords with 400', async () => {
    const response = await POST(request(['단백질']));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ success: false });
  });
});

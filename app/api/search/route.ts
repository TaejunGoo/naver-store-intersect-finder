import { NextRequest, NextResponse } from 'next/server';

import { findIntersection, getAllStores } from '@/lib/intersection';
import { searchKeywordsMultiSort } from '@/lib/naver-api';
import { SearchRequest, SearchResponse } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<SearchResponse>> {
  try {
    // Parse request body
    const body: SearchRequest = await request.json();
    const { keywords } = body;

    // Validate keywords
    if (!keywords || !Array.isArray(keywords)) {
      return NextResponse.json(
        { success: false, error: 'Keywords are required' },
        { status: 400 },
      );
    }

    if (keywords.length < 2) {
      return NextResponse.json(
        { success: false, error: 'At least 2 keywords are required' },
        { status: 400 },
      );
    }

    // Trim and filter empty keywords
    const cleanedKeywords = keywords
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (cleanedKeywords.length < 2) {
      return NextResponse.json(
        { success: false, error: 'At least 2 non-empty keywords are required' },
        { status: 400 },
      );
    }

    // Check for API credentials
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { success: false, error: 'Naver API credentials not configured' },
        { status: 500 },
      );
    }

    // Use multi-sort progressive search strategy to reduce large store bias
    // All search parameters are configured in SEARCH_CONFIG (lib/naver-api.ts)
    // - Sort options: sim (relevance), date (recent), etc.
    // - Fetches in batches with delays to prevent rate limiting
    // - Stops early if minimum intersection stores found
    const { storesByKeyword, totalApiCalls, pagesSearched } = await searchKeywordsMultiSort(
      cleanedKeywords,
      { clientId, clientSecret },
      // Uses default values from SEARCH_CONFIG
      // Override here if needed for specific use cases
    );

    // Find intersection (stores that appear in ALL keyword searches)
    const intersectionStores = findIntersection(storesByKeyword);

    // Get total unique stores found
    const allStores = getAllStores(storesByKeyword);

    return NextResponse.json({
      success: true,
      data: {
        intersectionStores,
        keywordCount: cleanedKeywords.length,
        totalStoresFound: allStores.size,
        // Include search stats for debugging/monitoring
        searchStats: {
          apiCalls: totalApiCalls,
          pagesSearched,
        },
      },
    });
  } catch (error) {
    console.error('Search API error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

import { findIntersection, getAllStores } from '@/lib/intersection';
import { searchKeywordsMultiSort } from '@/lib/naver-api';
import { validateKeywords } from '@/lib/validation';
import { SearchRequest, SearchResponse } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<SearchResponse>> {
  try {
    // Parse request body
    const body: SearchRequest = await request.json();
    const { keywords } = body;

    // Validate and normalize keywords (server-side validation)
    const validationResult = validateKeywords(keywords);

    if (!validationResult.valid) {
      return NextResponse.json(
        { success: false, error: validationResult.error || 'Invalid keywords' },
        { status: 400 },
      );
    }

    // Use validated keywords
    const cleanedKeywords = validationResult.keywords!;

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

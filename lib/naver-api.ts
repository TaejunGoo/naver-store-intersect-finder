import { NaverShoppingResponse, NaverShoppingItem, SmartStore } from '@/types';
// API 호출 카운트 추적용 전역 변수
let NAVER_API_CALL_COUNT = 0;

import { naverApiCache, MemoryCache } from './cache';
import { findIntersection } from './intersection';
import { groupByStore, mergeStoreProducts } from './store-extractor';

const NAVER_API_URL = 'https://openapi.naver.com/v1/search/shop.json';

// ============================================================================
// SEARCH CONFIGURATION - Modify these values to adjust search behavior
// ============================================================================

/**
 * Search strategy configuration
 * All search-related settings are centralized here for easy management
 */
export const SEARCH_CONFIG = {
  // API Request Settings
  DISPLAY: 100, // Maximum items per API request (Naver API limit: 100)
  MAX_START: 1000, // Naver API limit: start + display <= 1100
  MAX_PAGES_PER_SORT: 10, // Maximum pages to fetch per sort option (10 pages = 1000 items)

  // Progressive Search Settings
  PAGES_PER_BATCH: 2, // Number of pages to fetch in each batch (2 pages = 200 items)
  MIN_INTERSECTION_COUNT: 10, // Stop searching if this many intersection stores found

  // Sort Options
  // Using multiple sort methods reduces large store bias
  // - 'sim': Similarity/relevance sort (high accuracy, may favor large stores)
  // - 'date': Recently listed products (captures new/small specialty stores)
  // - 'asc': Low to high price (budget stores)
  // - 'dsc': High to low price (premium stores)
  SORT_OPTIONS: ['sim', 'date'] as const, // Active sort methods

  // Rate Limiting
  DELAY_BETWEEN_SORTS: 500, // ms delay between different sort options (prevents 429 errors)
  DELAY_BETWEEN_BATCHES: 100, // ms delay between batches within same sort
  DELAY_BETWEEN_API_CALLS: 50, // ms delay between individual API calls in a batch
} as const;

type SortOption = typeof SEARCH_CONFIG.SORT_OPTIONS[number];

// Legacy constants for backward compatibility (use SEARCH_CONFIG instead)
const DEFAULT_DISPLAY = SEARCH_CONFIG.DISPLAY;
const MAX_START = SEARCH_CONFIG.MAX_START;
const DEFAULT_MAX_PAGES = SEARCH_CONFIG.MAX_PAGES_PER_SORT;
const PAGES_PER_BATCH = SEARCH_CONFIG.PAGES_PER_BATCH;
const MIN_INTERSECTION_COUNT = SEARCH_CONFIG.MIN_INTERSECTION_COUNT;
const SORT_OPTIONS = SEARCH_CONFIG.SORT_OPTIONS;
const PAGES_PER_SORT = SEARCH_CONFIG.PAGES_PER_BATCH;
const DELAY_BETWEEN_SORTS = SEARCH_CONFIG.DELAY_BETWEEN_SORTS;

interface NaverApiOptions {
  clientId: string
  clientSecret: string
}

interface HybridSearchOptions {
  display?: number
  maxPages?: number // Maximum pages to fetch
  pagesPerBatch?: number // Pages to fetch per batch
  minIntersection?: number // Minimum intersection count to stop early
}

/**
 * Delay utility to prevent rate limiting
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Search Naver Shopping API for a keyword (single page)
 */
export async function searchNaverShoppingPage(
  keyword: string,
  options: NaverApiOptions,
  display: number = DEFAULT_DISPLAY,
  start: number = 1,
  sort: SortOption = 'sim',
): Promise<NaverShoppingResponse> {
  const cacheKey = `naver:${keyword}:${display}:${start}:${sort}`;
  const cached = naverApiCache.get(cacheKey) as NaverShoppingResponse | null;

  if (cached) {
    console.log('[searchNaverShoppingPage] cache hit', { keyword, display, start, items: cached.items.length });
    return cached;
  }

  NAVER_API_CALL_COUNT++;
  console.log(`[API CALL #${NAVER_API_CALL_COUNT}]`, { keyword, display, start, sort });

  const params = new URLSearchParams({
    query: keyword,
    display: String(display),
    start: String(start),
    sort, // Use sort parameter
    // filter: 'naverpay', // Filter to Naver Pay items
  });

  const response = await fetch(`${NAVER_API_URL}?${params}`, {
    headers: {
      'X-Naver-Client-Id': options.clientId,
      'X-Naver-Client-Secret': options.clientSecret,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Naver API error: ${response.status} - ${errorText}`);
  }

  const data: NaverShoppingResponse = await response.json();
  console.log('[searchNaverShoppingPage] API response', { keyword, display, start, items: data.items.length });
  naverApiCache.set(cacheKey, data);

  return data;
}

/**
 * Fetch specific pages for all keywords in parallel
 */
async function fetchPagesForKeywords(
  keywords: string[],
  options: NaverApiOptions,
  display: number,
  pageNumbers: number[], // 0-indexed page numbers
  sort: SortOption = 'sim',
): Promise<Map<string, NaverShoppingItem[]>> {
  const keywordItems = new Map<string, NaverShoppingItem[]>();

  // Initialize empty arrays for each keyword
  keywords.forEach((k) => keywordItems.set(k, []));

  // Fetch pages with delay between calls to avoid rate limiting
  const results: { keyword: string; response: NaverShoppingResponse }[] = [];
  let callCount = 0;

  for (const keyword of keywords) {
    for (const pageNum of pageNumbers) {
      const start = 1 + pageNum * display;
      if (start > MAX_START) continue;

      // Add delay between API calls to prevent rate limiting
      if (callCount > 0) {
        await delay(SEARCH_CONFIG.DELAY_BETWEEN_API_CALLS);
      }
      callCount++;

      const response = await searchNaverShoppingPage(keyword, options, display, start, sort);
      results.push({ keyword, response });
    }
  }

  // Group results by keyword
  for (const { keyword, response } of results) {
    const existing = keywordItems.get(keyword) || [];
    keywordItems.set(keyword, [...existing, ...response.items]);
    console.log('[fetchPagesForKeywords] keyword:', keyword, '누적 상품 수:', keywordItems.get(keyword)?.length ?? 0);
  }

  return keywordItems;
}

/**
 * Merge new items into existing store maps
 */
function mergeIntoStoreMaps(
  existingMaps: Map<string, SmartStore>[],
  newItemsByKeyword: Map<string, NaverShoppingItem[]>,
  keywords: string[],
): Map<string, SmartStore>[] {
  return keywords.map((keyword, index) => {
    const existingMap = existingMaps[index];
    const newItems = newItemsByKeyword.get(keyword) || [];
    const newStoreMap = groupByStore(newItems, keyword);

    // Merge new stores into existing map
    for (const [storeId, newStore] of newStoreMap) {
      const existing = existingMap.get(storeId);
      if (existing) {
        existingMap.set(storeId, mergeStoreProducts(existing, newStore));
      } else {
        existingMap.set(storeId, newStore);
      }
    }
    console.log('[mergeIntoStoreMaps] keyword:', keyword, '스토어 수:', existingMap.size);
    return existingMap;
  });
}

/**
 * Multi-sort progressive search strategy to reduce large store bias
 *
 * For each sort option (sim, date):
 * 1. Fetch pages in batches (e.g., 2 pages at a time)
 * 2. Check intersection count after each batch
 * 3. If sufficient intersection found (>= minIntersection), stop immediately
 * 4. Otherwise, continue to next batch up to maxPages
 * 5. If still insufficient, try next sort option
 *
 * Sort options:
 * - sim: High relevance, popular stores (may favor large stores)
 * - date: Recently listed products, captures new/small specialty stores
 *
 * This balances accuracy (sim) with coverage (date) while minimizing API calls
 */
export async function searchKeywordsMultiSort(
  keywords: string[],
  options: NaverApiOptions,
  searchOptions: HybridSearchOptions = {},
): Promise<{
  storesByKeyword: Map<string, SmartStore>[]
  totalApiCalls: number
  pagesSearched: number
}> {
  const display = searchOptions.display ?? SEARCH_CONFIG.DISPLAY;
  const maxPages = searchOptions.maxPages ?? SEARCH_CONFIG.MAX_PAGES_PER_SORT;
  const pagesPerBatch = searchOptions.pagesPerBatch ?? SEARCH_CONFIG.PAGES_PER_BATCH;
  const minIntersection = searchOptions.minIntersection ?? SEARCH_CONFIG.MIN_INTERSECTION_COUNT;

  // Initialize empty store maps for each keyword
  let storesByKeyword: Map<string, SmartStore>[] = keywords.map(() => new Map());
  let totalApiCalls = 0;
  let totalPagesSearched = 0;

  // Try each sort option progressively
  for (const sortOption of SORT_OPTIONS) {
    console.log(`[searchKeywordsMultiSort] Starting sort=${sortOption}`);
    let currentPage = 0;

    // Progressive search within this sort option
    while (currentPage < maxPages) {
      // Calculate which pages to fetch in this batch
      const pagesToFetch: number[] = [];
      for (let i = 0; i < pagesPerBatch && currentPage + i < maxPages; i++) {
        pagesToFetch.push(currentPage + i);
      }

      if (pagesToFetch.length === 0) break;

      console.log(`[searchKeywordsMultiSort] sort=${sortOption}, fetching pages ${pagesToFetch.join(', ')}`);

      // Fetch pages for all keywords with this sort option
      const newItemsByKeyword = await fetchPagesForKeywords(
        keywords,
        options,
        display,
        pagesToFetch,
        sortOption,
      );

      // Count API calls (pages * keywords)
      totalApiCalls += pagesToFetch.length * keywords.length;
      totalPagesSearched += pagesToFetch.length;

      // Merge new items into store maps
      storesByKeyword = mergeIntoStoreMaps(storesByKeyword, newItemsByKeyword, keywords);

      // Check intersection count after this batch
      const intersection = findIntersection(storesByKeyword);
      console.log(`[searchKeywordsMultiSort] sort=${sortOption}, page ${currentPage}-${currentPage + pagesToFetch.length - 1}, 교집합: ${intersection.length}개`);

      // If we have enough intersection stores, stop immediately
      if (intersection.length >= minIntersection) {
        console.log(`[searchKeywordsMultiSort] Found ${intersection.length} intersections (>= ${minIntersection}), stopping early`);
        return {
          storesByKeyword,
          totalApiCalls,
          pagesSearched: totalPagesSearched,
        };
      }

      // Move to next batch
      currentPage += pagesPerBatch;

      // Add delay between batches within same sort to avoid rate limiting
      if (currentPage < maxPages) {
        await delay(SEARCH_CONFIG.DELAY_BETWEEN_BATCHES);
      }
    }

    console.log(`[searchKeywordsMultiSort] sort=${sortOption} completed, 교집합: ${findIntersection(storesByKeyword).length}개`);

    // Add delay before trying next sort option to avoid rate limiting
    if (SORT_OPTIONS.indexOf(sortOption) < SORT_OPTIONS.length - 1) {
      await delay(SEARCH_CONFIG.DELAY_BETWEEN_SORTS);
    }
  }

  // All sort options exhausted
  return {
    storesByKeyword,
    totalApiCalls,
    pagesSearched: totalPagesSearched,
  };
}

/**
 * Hybrid progressive search strategy
 *
 * 1. Fetch 2 pages per keyword in parallel
 * 2. Check intersection count
 * 3. If insufficient, fetch 2 more pages
 * 4. Continue until max pages or sufficient intersection
 *
 * This reduces API calls when intersection is found early
 */
export async function searchKeywordsHybrid(
  keywords: string[],
  options: NaverApiOptions,
  searchOptions: HybridSearchOptions = {},
): Promise<{
  storesByKeyword: Map<string, SmartStore>[]
  totalApiCalls: number
  pagesSearched: number
}> {
  const display = searchOptions.display ?? DEFAULT_DISPLAY;
  const maxPages = searchOptions.maxPages ?? DEFAULT_MAX_PAGES;
  const pagesPerBatch = searchOptions.pagesPerBatch ?? PAGES_PER_BATCH;
  const minIntersection = searchOptions.minIntersection ?? MIN_INTERSECTION_COUNT;

  // Initialize empty store maps for each keyword
  let storesByKeyword: Map<string, SmartStore>[] = keywords.map(() => new Map());
  let currentPage = 0;
  let totalApiCalls = 0;

  while (currentPage < maxPages) {
    // Calculate which pages to fetch in this batch
    const pagesToFetch: number[] = [];
    for (let i = 0; i < pagesPerBatch && currentPage + i < maxPages; i++) {
      pagesToFetch.push(currentPage + i);
    }

    if (pagesToFetch.length === 0) break;

    // Fetch pages for all keywords in parallel
    const newItemsByKeyword = await fetchPagesForKeywords(
      keywords,
      options,
      display,
      pagesToFetch,
    );

    // Count API calls (pages * keywords)
    totalApiCalls += pagesToFetch.length * keywords.length;

    // Merge new items into store maps
    storesByKeyword = mergeIntoStoreMaps(storesByKeyword, newItemsByKeyword, keywords);

    // Check intersection count
    const intersection = findIntersection(storesByKeyword);
    console.log('[searchKeywordsHybrid] 교집합 스토어 수:', intersection.length);

    // If we have enough intersection stores, stop early
    if (intersection.length >= minIntersection) {
      break;
    }

    // Move to next batch
    currentPage += pagesPerBatch;
  }

  return {
    storesByKeyword,
    totalApiCalls,
    pagesSearched: Math.min(currentPage + PAGES_PER_BATCH, maxPages),
  };
}

/**
 * Legacy function: Search multiple keywords in parallel (fetches all pages at once)
 */
export async function searchKeywordsAndGroupByStore(
  keywords: string[],
  options: NaverApiOptions,
  searchOptions: { display?: number; pages?: number } = {},
): Promise<Map<string, SmartStore>[]> {
  const display = searchOptions.display ?? DEFAULT_DISPLAY;
  const pages = searchOptions.pages ?? DEFAULT_MAX_PAGES;

  const results = await Promise.all(
    keywords.map(async (keyword) => {
      const allItems: NaverShoppingItem[] = [];

      // Fetch all pages in parallel for this keyword
      const pagePromises: Promise<NaverShoppingResponse>[] = [];
      for (let page = 0; page < pages; page++) {
        const start = 1 + page * display;
        if (start > MAX_START) break;
        pagePromises.push(searchNaverShoppingPage(keyword, options, display, start));
      }

      const responses = await Promise.all(pagePromises);
      for (const response of responses) {
        allItems.push(...response.items);
      }

      return groupByStore(allItems, keyword);
    }),
  );

  return results;
}

/**
 * Create a cache key generator for testing
 */
export function createCacheKey(keyword: string, display: number, start: number = 1): string {
  return `naver:${keyword}:${display}:${start}`;
}

/**
 * Get the cache instance for testing/management
 */
export function getCache(): MemoryCache<unknown> {
  return naverApiCache;
}

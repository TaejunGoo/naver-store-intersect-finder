import { SmartStore } from '@/types';

import { mergeStoreProducts } from './store-extractor';

/**
 * Find stores that appear in all keyword search results
 */
export function findIntersection(
  storesByKeyword: Map<string, SmartStore>[],
): SmartStore[] {
  if (storesByKeyword.length === 0) {
    return [];
  }

  if (storesByKeyword.length === 1) {
    return Array.from(storesByKeyword[0].values());
  }

  // Get store IDs from first keyword
  const firstKeywordStores = storesByKeyword[0];
  let intersectionIds = new Set(firstKeywordStores.keys());

  // Find intersection with remaining keywords
  for (let i = 1; i < storesByKeyword.length; i++) {
    const currentKeywordStoreIds = new Set(storesByKeyword[i].keys());
    intersectionIds = new Set(
      [...intersectionIds].filter((id) => currentKeywordStoreIds.has(id)),
    );
  }

  // Build result with merged products from all keywords
  const result: SmartStore[] = [];

  for (const storeId of intersectionIds) {
    let mergedStore: SmartStore | null = null;

    for (const stores of storesByKeyword) {
      const store = stores.get(storeId);
      if (store) {
        if (mergedStore) {
          mergedStore = mergeStoreProducts(mergedStore, store);
        } else {
          mergedStore = { ...store };
        }
      }
    }

    if (mergedStore) {
      result.push(mergedStore);
    }
  }

  // Sort by number of products (more products = more relevant)
  return result.sort((a, b) => b.products.length - a.products.length);
}

/**
 * Get all unique stores from all keyword searches
 */
export function getAllStores(
  storesByKeyword: Map<string, SmartStore>[],
): Map<string, SmartStore> {
  const allStores = new Map<string, SmartStore>();

  for (const stores of storesByKeyword) {
    for (const [storeId, store] of stores) {
      const existing = allStores.get(storeId);
      if (existing) {
        allStores.set(storeId, mergeStoreProducts(existing, store));
      } else {
        allStores.set(storeId, { ...store });
      }
    }
  }

  return allStores;
}

/**
 * Count how many keywords each store appears in
 */
export function countKeywordAppearances(
  storesByKeyword: Map<string, SmartStore>[],
): Map<string, number> {
  const counts = new Map<string, number>();

  for (const stores of storesByKeyword) {
    for (const storeId of stores.keys()) {
      counts.set(storeId, (counts.get(storeId) || 0) + 1);
    }
  }

  return counts;
}

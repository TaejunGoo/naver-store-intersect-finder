import { NaverShoppingItem, SmartStore, StoreProduct } from '@/types';

// Smart Store URL patterns - used to identify if product is from smartstore
const SMART_STORE_URL_PATTERNS = [
  /smartstore\.naver\.com/,
  /brand\.naver\.com/,
];

/**
 * Check if a product link is from a Smart Store or Brand Store
 * Note: Naver API returns URLs like smartstore.naver.com/main/products/{id}
 * The actual store identifier is in mallName field, not in URL
 */
export function isSmartStoreUrl(link: string): boolean {
  return SMART_STORE_URL_PATTERNS.some((pattern) => pattern.test(link));
}

/**
 * Generate store ID from mall name
 * Normalizes the name for consistent comparison
 */
export function generateStoreId(mallName: string): string {
  return mallName.trim().toLowerCase();
}

/**
 * Check if a product is from a Smart Store (based on URL pattern only)
 * Only includes products from smartstore.naver.com or brand.naver.com
 * Excludes other marketplaces like Coupang, 11st, etc.
 */
export function isSmartStoreProduct(item: NaverShoppingItem): boolean {
  // Only allow smartstore.naver.com or brand.naver.com URLs
  // This excludes other open markets (Coupang, 11st, Gmarket, etc.)
  return isSmartStoreUrl(item.link);
}

/**
 * Convert NaverShoppingItem to StoreProduct
 */
export function toStoreProduct(item: NaverShoppingItem, keyword: string): StoreProduct {
  // Remove HTML tags from title
  const cleanTitle = item.title.replace(/<[^>]*>/g, '');

  return {
    title: cleanTitle,
    link: item.link,
    image: item.image,
    price: item.lprice,
    keywords: [keyword], // Initialize with single keyword
  };
}

/**
 * Group products by Smart Store using mallName as identifier
 *
 * Naver Shopping API returns:
 * - link: smartstore.naver.com/main/products/{productId} (no store ID in URL)
 * - mallName: Actual store name like "헬시오", "프로틴마켓"
 *
 * We use mallName as the store identifier since URLs don't contain store IDs
 */
export function groupByStore(
  items: NaverShoppingItem[],
  keyword: string,
): Map<string, SmartStore> {
  const stores = new Map<string, SmartStore>();

  for (const item of items) {
    // Skip non-smartstore products
    if (!isSmartStoreProduct(item)) {
      continue;
    }

    // Skip items without mall name
    if (!item.mallName || item.mallName === '네이버') {
      continue;
    }

    const storeId = generateStoreId(item.mallName);
    const existing = stores.get(storeId);
    const product = toStoreProduct(item, keyword);

    if (existing) {
      // Avoid duplicate products in same store
      const hasProduct = existing.products.some((p) => p.link === product.link);
      if (!hasProduct) {
        existing.products.push(product);
      }
    } else {
      stores.set(storeId, {
        storeId,
        storeName: item.mallName,
        products: [product],
      });
    }
  }

  return stores;
}

/**
 * Merge store data from multiple searches
 * If the same product (same link) appears in multiple keyword searches,
 * merge their keywords into a single product entry
 */
export function mergeStoreProducts(
  existing: SmartStore,
  newStore: SmartStore,
): SmartStore {
  // Create a map of existing products by link
  const productMap = new Map<string, StoreProduct>();

  for (const product of existing.products) {
    productMap.set(product.link, product);
  }

  // Merge new products
  for (const newProduct of newStore.products) {
    const existingProduct = productMap.get(newProduct.link);

    if (existingProduct) {
      // Same product found - merge keywords
      for (const keyword of newProduct.keywords) {
        if (!existingProduct.keywords.includes(keyword)) {
          existingProduct.keywords.push(keyword);
        }
      }
    } else {
      // New product - add to map
      productMap.set(newProduct.link, newProduct);
    }
  }

  return {
    ...existing,
    products: Array.from(productMap.values()),
  };
}

// Legacy function for backward compatibility with tests
export function extractSmartStoreId(link: string): string | null {
  if (isSmartStoreUrl(link)) {
    // Return 'smartstore' as indicator that it's a smartstore product
    // Actual store ID comes from mallName
    return 'smartstore';
  }
  return null;
}

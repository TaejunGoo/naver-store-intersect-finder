import { describe, it, expect } from 'vitest';

import {
  findIntersection,
  getAllStores,
  countKeywordAppearances,
} from '@/lib/intersection';
import { SmartStore } from '@/types';

const createStore = (
  storeId: string,
  storeName: string,
  keywords: string[],
): SmartStore => ({
  storeId,
  storeName,
  products: keywords.map((keyword, i) => ({
    title: `Product ${keyword} ${i + 1}`,
    link: `https://smartstore.naver.com/${storeId}/products/${keyword}-${i + 1}`,
    image: '',
    price: '10000',
    keyword,
  })),
});

describe('findIntersection', () => {
  it('should return empty array for empty input', () => {
    const result = findIntersection([]);
    expect(result).toEqual([]);
  });

  it('should return all stores for single keyword', () => {
    const stores = new Map<string, SmartStore>();
    stores.set('store1', createStore('store1', 'Store One', ['keyword1']));
    stores.set('store2', createStore('store2', 'Store Two', ['keyword1']));

    const result = findIntersection([stores]);

    expect(result.length).toBe(2);
  });

  it('should find stores present in all keyword searches', () => {
    const keyword1Stores = new Map<string, SmartStore>();
    keyword1Stores.set('store1', createStore('store1', 'Store One', ['keyword1']));
    keyword1Stores.set('store2', createStore('store2', 'Store Two', ['keyword1']));
    keyword1Stores.set('store3', createStore('store3', 'Store Three', ['keyword1']));

    const keyword2Stores = new Map<string, SmartStore>();
    keyword2Stores.set('store1', createStore('store1', 'Store One', ['keyword2']));
    keyword2Stores.set('store3', createStore('store3', 'Store Three', ['keyword2']));

    const result = findIntersection([keyword1Stores, keyword2Stores]);

    expect(result.length).toBe(2);
    const storeIds = result.map((s) => s.storeId);
    expect(storeIds).toContain('store1');
    expect(storeIds).toContain('store3');
    expect(storeIds).not.toContain('store2');
  });

  it('should merge products from all keywords', () => {
    const keyword1Stores = new Map<string, SmartStore>();
    keyword1Stores.set('store1', createStore('store1', 'Store One', ['keyword1']));

    const keyword2Stores = new Map<string, SmartStore>();
    keyword2Stores.set('store1', createStore('store1', 'Store One', ['keyword2']));

    const result = findIntersection([keyword1Stores, keyword2Stores]);

    expect(result.length).toBe(1);
    expect(result[0].products.length).toBe(2);
    expect(result[0].products.map((p) => p.keyword)).toContain('keyword1');
    expect(result[0].products.map((p) => p.keyword)).toContain('keyword2');
  });

  it('should return empty array when no intersection exists', () => {
    const keyword1Stores = new Map<string, SmartStore>();
    keyword1Stores.set('store1', createStore('store1', 'Store One', ['keyword1']));

    const keyword2Stores = new Map<string, SmartStore>();
    keyword2Stores.set('store2', createStore('store2', 'Store Two', ['keyword2']));

    const result = findIntersection([keyword1Stores, keyword2Stores]);

    expect(result.length).toBe(0);
  });

  it('should sort by product count descending', () => {
    const keyword1Stores = new Map<string, SmartStore>();
    keyword1Stores.set('store1', createStore('store1', 'Store One', ['keyword1']));
    keyword1Stores.set('store2', {
      ...createStore('store2', 'Store Two', ['keyword1']),
      products: [
        { title: 'P1', link: 'l1', image: '', price: '1000', keyword: 'keyword1' },
        { title: 'P2', link: 'l2', image: '', price: '2000', keyword: 'keyword1' },
        { title: 'P3', link: 'l3', image: '', price: '3000', keyword: 'keyword1' },
      ],
    });

    const keyword2Stores = new Map<string, SmartStore>();
    keyword2Stores.set('store1', createStore('store1', 'Store One', ['keyword2']));
    keyword2Stores.set('store2', createStore('store2', 'Store Two', ['keyword2']));

    const result = findIntersection([keyword1Stores, keyword2Stores]);

    expect(result[0].storeId).toBe('store2'); // More products
    expect(result[1].storeId).toBe('store1');
  });
});

describe('getAllStores', () => {
  it('should return empty map for empty input', () => {
    const result = getAllStores([]);
    expect(result.size).toBe(0);
  });

  it('should merge all stores from all keywords', () => {
    const keyword1Stores = new Map<string, SmartStore>();
    keyword1Stores.set('store1', createStore('store1', 'Store One', ['keyword1']));

    const keyword2Stores = new Map<string, SmartStore>();
    keyword2Stores.set('store2', createStore('store2', 'Store Two', ['keyword2']));

    const result = getAllStores([keyword1Stores, keyword2Stores]);

    expect(result.size).toBe(2);
    expect(result.has('store1')).toBe(true);
    expect(result.has('store2')).toBe(true);
  });

  it('should merge products for same store from different keywords', () => {
    const keyword1Stores = new Map<string, SmartStore>();
    keyword1Stores.set('store1', createStore('store1', 'Store One', ['keyword1']));

    const keyword2Stores = new Map<string, SmartStore>();
    keyword2Stores.set('store1', createStore('store1', 'Store One', ['keyword2']));

    const result = getAllStores([keyword1Stores, keyword2Stores]);

    expect(result.size).toBe(1);
    expect(result.get('store1')?.products.length).toBe(2);
  });
});

describe('countKeywordAppearances', () => {
  it('should return empty map for empty input', () => {
    const result = countKeywordAppearances([]);
    expect(result.size).toBe(0);
  });

  it('should count how many keywords each store appears in', () => {
    const keyword1Stores = new Map<string, SmartStore>();
    keyword1Stores.set('store1', createStore('store1', 'Store One', ['keyword1']));
    keyword1Stores.set('store2', createStore('store2', 'Store Two', ['keyword1']));

    const keyword2Stores = new Map<string, SmartStore>();
    keyword2Stores.set('store1', createStore('store1', 'Store One', ['keyword2']));

    const keyword3Stores = new Map<string, SmartStore>();
    keyword3Stores.set('store1', createStore('store1', 'Store One', ['keyword3']));

    const result = countKeywordAppearances([
      keyword1Stores,
      keyword2Stores,
      keyword3Stores,
    ]);

    expect(result.get('store1')).toBe(3);
    expect(result.get('store2')).toBe(1);
  });
});

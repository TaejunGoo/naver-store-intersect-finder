import { describe, it, expect } from 'vitest';

import {
  isSmartStoreUrl,
  generateStoreId,
  isSmartStoreProduct,
  toStoreProduct,
  groupByStore,
} from '@/lib/store-extractor';
import { NaverShoppingItem } from '@/types';

describe('isSmartStoreUrl', () => {
  it('should return true for smartstore.naver.com URLs', () => {
    expect(isSmartStoreUrl('https://smartstore.naver.com/main/products/123456')).toBe(true);
  });

  it('should return true for brand.naver.com URLs', () => {
    expect(isSmartStoreUrl('https://brand.naver.com/mybrand/products/789')).toBe(true);
  });

  it('should return false for non-smartstore URLs', () => {
    expect(isSmartStoreUrl('https://shopping.naver.com/products/123')).toBe(false);
  });

  it('should return false for external mall URLs', () => {
    expect(isSmartStoreUrl('https://www.coupang.com/products/123')).toBe(false);
  });
});

describe('generateStoreId', () => {
  it('should normalize store name to lowercase', () => {
    expect(generateStoreId('헬시오')).toBe('헬시오');
    expect(generateStoreId('STORE NAME')).toBe('store name');
  });

  it('should trim whitespace', () => {
    expect(generateStoreId('  헬시오  ')).toBe('헬시오');
  });
});

describe('isSmartStoreProduct', () => {
  it('should return true for smartstore URL product', () => {
    const item: NaverShoppingItem = {
      title: 'Test Product',
      link: 'https://smartstore.naver.com/main/products/123',
      image: '',
      lprice: '10000',
      hprice: '15000',
      mallName: 'My Store',
      productId: '123',
      productType: '2',
      brand: '',
      maker: '',
      category1: '',
      category2: '',
      category3: '',
      category4: '',
    };
    expect(isSmartStoreProduct(item)).toBe(true);
  });

  it('should return true for brand.naver.com URL product', () => {
    const item: NaverShoppingItem = {
      title: 'Test Product',
      link: 'https://brand.naver.com/mybrand/products/123',
      image: '',
      lprice: '10000',
      hprice: '15000',
      mallName: 'Brand Store',
      productId: '123',
      productType: '2',
      brand: '',
      maker: '',
      category1: '',
      category2: '',
      category3: '',
      category4: '',
    };
    expect(isSmartStoreProduct(item)).toBe(true);
  });

  it('should return false for other marketplace products (e.g., Coupang)', () => {
    const item: NaverShoppingItem = {
      title: 'Test Product',
      link: 'https://www.coupang.com/products/123',
      image: '',
      lprice: '10000',
      hprice: '15000',
      mallName: 'Coupang',
      productId: '123',
      productType: '2',
      brand: '',
      maker: '',
      category1: '',
      category2: '',
      category3: '',
      category4: '',
    };
    expect(isSmartStoreProduct(item)).toBe(false);
  });

  it('should return false for non-smartstore product', () => {
    const item: NaverShoppingItem = {
      title: 'Test Product',
      link: 'https://shopping.naver.com/products/123',
      image: '',
      lprice: '10000',
      hprice: '15000',
      mallName: 'External Mall',
      productId: '123',
      productType: '1',
      brand: '',
      maker: '',
      category1: '',
      category2: '',
      category3: '',
      category4: '',
    };
    expect(isSmartStoreProduct(item)).toBe(false);
  });
});

describe('toStoreProduct', () => {
  it('should convert NaverShoppingItem to StoreProduct', () => {
    const item: NaverShoppingItem = {
      title: 'Test Product',
      link: 'https://smartstore.naver.com/main/products/123',
      image: 'https://image.com/img.jpg',
      lprice: '10000',
      hprice: '15000',
      mallName: 'My Store',
      productId: '123',
      productType: '2',
      brand: '',
      maker: '',
      category1: '',
      category2: '',
      category3: '',
      category4: '',
    };

    const result = toStoreProduct(item, 'test keyword');

    expect(result).toEqual({
      title: 'Test Product',
      link: 'https://smartstore.naver.com/main/products/123',
      image: 'https://image.com/img.jpg',
      price: '10000',
      keywords: ['test keyword'],
    });
  });

  it('should remove HTML tags from title', () => {
    const item: NaverShoppingItem = {
      title: '<b>Test</b> <em>Product</em>',
      link: 'https://smartstore.naver.com/main/products/123',
      image: '',
      lprice: '10000',
      hprice: '15000',
      mallName: 'My Store',
      productId: '123',
      productType: '2',
      brand: '',
      maker: '',
      category1: '',
      category2: '',
      category3: '',
      category4: '',
    };

    const result = toStoreProduct(item, 'keyword');

    expect(result.title).toBe('Test Product');
  });
});

describe('groupByStore', () => {
  const createItem = (
    mallName: string,
    productId: string,
  ): NaverShoppingItem => ({
    title: `Product ${productId}`,
    link: `https://smartstore.naver.com/main/products/${productId}`,
    image: '',
    lprice: '10000',
    hprice: '15000',
    mallName,
    productId,
    productType: '2',
    brand: '',
    maker: '',
    category1: '',
    category2: '',
    category3: '',
    category4: '',
  });

  it('should group products by mallName', () => {
    const items = [
      createItem('헬시오', '1'),
      createItem('헬시오', '2'),
      createItem('프로틴마켓', '3'),
    ];

    const result = groupByStore(items, 'keyword');

    expect(result.size).toBe(2);
    expect(result.get('헬시오')?.products.length).toBe(2);
    expect(result.get('프로틴마켓')?.products.length).toBe(1);
  });

  it('should skip items with mallName "네이버"', () => {
    const items = [
      createItem('헬시오', '1'),
      { ...createItem('네이버', '2'), productType: '1' as const } as NaverShoppingItem,
    ];

    const result = groupByStore(items, 'keyword');

    expect(result.size).toBe(1);
    expect(result.has('헬시오')).toBe(true);
  });

  it('should skip non-smartstore products', () => {
    const items: NaverShoppingItem[] = [
      createItem('헬시오', '1'),
      {
        title: 'External Product',
        link: 'https://external.com/products/123',
        image: '',
        lprice: '10000',
        hprice: '15000',
        mallName: 'External',
        productId: '123',
        productType: '1',
        brand: '',
        maker: '',
        category1: '',
        category2: '',
        category3: '',
        category4: '',
      },
    ];

    const result = groupByStore(items, 'keyword');

    expect(result.size).toBe(1);
    expect(result.has('헬시오')).toBe(true);
  });

  it('should avoid duplicate products in same store', () => {
    const items = [
      createItem('헬시오', '1'),
      createItem('헬시오', '1'), // duplicate
    ];

    const result = groupByStore(items, 'keyword');

    expect(result.get('헬시오')?.products.length).toBe(1);
  });

  it('should use mallName as storeName', () => {
    const items = [createItem('프로틴마켓', '1')];

    const result = groupByStore(items, 'keyword');

    expect(result.get('프로틴마켓')?.storeName).toBe('프로틴마켓');
  });
});

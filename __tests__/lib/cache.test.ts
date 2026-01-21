import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { MemoryCache } from '@/lib/cache';

describe('MemoryCache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('get/set', () => {
    it('should store and retrieve values', () => {
      const cache = new MemoryCache<string>();

      cache.set('key1', 'value1');

      expect(cache.get('key1')).toBe('value1');
    });

    it('should return null for non-existent keys', () => {
      const cache = new MemoryCache<string>();

      expect(cache.get('nonexistent')).toBeNull();
    });

    it('should overwrite existing values', () => {
      const cache = new MemoryCache<string>();

      cache.set('key1', 'value1');
      cache.set('key1', 'value2');

      expect(cache.get('key1')).toBe('value2');
    });
  });

  describe('TTL expiration', () => {
    it('should return value before TTL expires', () => {
      const cache = new MemoryCache<string>({ ttl: 5000 });

      cache.set('key1', 'value1');
      vi.advanceTimersByTime(4000); // 4 seconds

      expect(cache.get('key1')).toBe('value1');
    });

    it('should return null after TTL expires', () => {
      const cache = new MemoryCache<string>({ ttl: 5000 });

      cache.set('key1', 'value1');
      vi.advanceTimersByTime(6000); // 6 seconds

      expect(cache.get('key1')).toBeNull();
    });

    it('should use default TTL when not specified', () => {
      const cache = new MemoryCache<string>(); // Default: 5 minutes

      cache.set('key1', 'value1');
      vi.advanceTimersByTime(4 * 60 * 1000); // 4 minutes

      expect(cache.get('key1')).toBe('value1');

      vi.advanceTimersByTime(2 * 60 * 1000); // 2 more minutes (total: 6)

      expect(cache.get('key1')).toBeNull();
    });
  });

  describe('has', () => {
    it('should return true for existing keys', () => {
      const cache = new MemoryCache<string>();

      cache.set('key1', 'value1');

      expect(cache.has('key1')).toBe(true);
    });

    it('should return false for non-existent keys', () => {
      const cache = new MemoryCache<string>();

      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should return false for expired keys', () => {
      const cache = new MemoryCache<string>({ ttl: 5000 });

      cache.set('key1', 'value1');
      vi.advanceTimersByTime(6000);

      expect(cache.has('key1')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete existing keys', () => {
      const cache = new MemoryCache<string>();

      cache.set('key1', 'value1');

      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeNull();
    });

    it('should return false for non-existent keys', () => {
      const cache = new MemoryCache<string>();

      expect(cache.delete('nonexistent')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      const cache = new MemoryCache<string>();

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
      expect(cache.size()).toBe(0);
    });
  });

  describe('size', () => {
    it('should return correct count', () => {
      const cache = new MemoryCache<string>();

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      expect(cache.size()).toBe(2);
    });

    it('should not count expired entries', () => {
      const cache = new MemoryCache<string>({ ttl: 5000 });

      cache.set('key1', 'value1');
      vi.advanceTimersByTime(6000);
      cache.set('key2', 'value2');

      expect(cache.size()).toBe(1);
    });
  });

  describe('complex values', () => {
    it('should handle object values', () => {
      const cache = new MemoryCache<{ name: string; count: number }>();

      cache.set('obj1', { name: 'test', count: 42 });

      expect(cache.get('obj1')).toEqual({ name: 'test', count: 42 });
    });

    it('should handle array values', () => {
      const cache = new MemoryCache<number[]>();

      cache.set('arr1', [1, 2, 3]);

      expect(cache.get('arr1')).toEqual([1, 2, 3]);
    });
  });
});

import { CacheEntry, CacheOptions } from '@/types';

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export class MemoryCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private ttl: number;

  constructor(options?: CacheOptions) {
    this.ttl = options?.ttl ?? DEFAULT_TTL;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    this.cleanup();
    return this.cache.size;
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > this.ttl;
  }

  private cleanup(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton cache instance for Naver API responses
export const naverApiCache = new MemoryCache<unknown>({ ttl: 5 * 60 * 1000 });

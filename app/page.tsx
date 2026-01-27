'use client';

import { useState } from 'react';

import { RateLimitIndicator } from '@/components/rate-limit-indicator';
import { SearchForm } from '@/components/search-form';
import { SearchResults } from '@/components/search-results';
import { useStoreSearch } from '@/hooks/use-store-search';

export default function Home() {
  const { search, data, error, isLoading, rateLimitInfo } = useStoreSearch();
  const [lastKeywords, setLastKeywords] = useState<string[]>([]);

  const handleSearch = async (keywords: string[]) => {
    setLastKeywords(keywords);
    await search(keywords);
  };

  const handleRetry = () => {
    if (lastKeywords.length > 0) {
      search(lastKeywords);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-background to-muted/20'>
      <main className='container mx-auto px-4 py-12 md:py-16 max-w-6xl'>
        <header className='text-center mb-12 md:mb-16 space-y-4'>
          <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent'>
            스마트스토어 교집합 찾기
          </h1>
          <p className='text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto'>
            여러 상품을 함께 판매하는 네이버 스마트스토어를 찾아보세요
          </p>
        </header>

        <section className='mb-12 max-w-3xl mx-auto'>
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
          <RateLimitIndicator rateLimitInfo={rateLimitInfo} />
        </section>

        <section className='animate-in fade-in duration-500'>
          <SearchResults
            stores={data?.success ? data.data?.intersectionStores ?? null : null}
            isLoading={isLoading}
            error={error || (data?.success === false ? data.error ?? null : null)}
            keywordCount={data?.data?.keywordCount ?? lastKeywords.length}
            totalStoresFound={data?.data?.totalStoresFound ?? 0}
            onRetry={handleRetry}
          />
        </section>
      </main>
    </div>
  );
}

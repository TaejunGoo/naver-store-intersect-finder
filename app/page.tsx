'use client';

import { useState } from 'react';

import { SearchForm } from '@/components/search-form';
import { SearchResults } from '@/components/search-results';
import { useStoreSearch } from '@/hooks/use-store-search';

export default function Home() {
  const { search, data, error, isLoading } = useStoreSearch();
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
    <div className='min-h-screen bg-background'>
      <main className='container mx-auto px-4 py-8 max-w-6xl'>
        <header className='text-center mb-8'>
          <h1 className='text-3xl font-bold mb-2'>
            스마트스토어 교집합 찾기
          </h1>
          <p className='text-muted-foreground'>
            여러 상품을 함께 판매하는 네이버 스마트스토어를 찾아보세요
          </p>
        </header>

        <section className='mb-8'>
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </section>

        <section>
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

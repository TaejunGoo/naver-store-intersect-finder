'use client';

import { AlertCircle, Store } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SmartStore } from '@/types';

import { StoreCard } from './store-card';

interface SearchResultsProps {
  stores: SmartStore[] | null
  isLoading: boolean
  error: string | null
  keywordCount: number
  totalStoresFound: number
  onRetry?: () => void
}

function LoadingSkeleton() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {Array.from({ length: 6 }).map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i} className='border rounded-lg p-4 space-y-3'>
          <div className='flex justify-between'>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-5 w-16' />
          </div>
          <Skeleton className='h-4 w-24' />
          <div className='space-y-2 pt-2'>
            <Skeleton className='h-5 w-20' />
            <div className='flex gap-3'>
              <Skeleton className='h-10 w-10 rounded' />
              <div className='flex-1 space-y-1'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-20' />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ keywordCount }: { keywordCount: number }) {
  return (
    <div className='text-center py-12'>
      <Store className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
      <h3 className='text-lg font-medium mb-2'>검색 결과가 없습니다</h3>
      <p className='text-muted-foreground'>
        {keywordCount}개의 검색어를 모두 판매하는 스마트스토어를 찾지 못했습니다.
        <br />
        다른 검색어로 다시 시도해보세요.
      </p>
    </div>
  );
}

function IdleState() {
  return (
    <div className='text-center py-16 px-4'>
      <div className='max-w-2xl mx-auto'>
        <div className='mb-6'>
          <Store className='h-16 w-16 mx-auto text-green-500' />
        </div>
        <h3 className='text-2xl font-semibold mb-4'>스마트스토어 교집합 찾기</h3>
        <p className='text-base text-muted-foreground mb-6 leading-relaxed'>
          여러 검색어를 입력하면, 해당 상품들을 <strong>모두 판매하는</strong>
          <br className='hidden sm:block' />
          네이버 스마트스토어를 찾아드립니다.
        </p>

        <div className='bg-muted/50 rounded-lg p-4 space-y-2 text-sm'>
          <div className='flex items-start gap-2 text-left'>
            <span className='text-primary font-medium shrink-0'>📝</span>
            <p className='text-muted-foreground'>
              검색어를 <strong>쉼표(,)</strong>로 구분하여 입력해주세요
            </p>
          </div>
          <div className='flex items-start gap-2 text-left'>
            <span className='text-primary font-medium shrink-0'>🔢</span>
            <p className='text-muted-foreground'>
              최소 <strong>2개</strong>, 최대 <strong>5개</strong>까지 검색 가능합니다
            </p>
          </div>
          <div className='flex items-start gap-2 text-left'>
            <span className='text-primary font-medium shrink-0'>💡</span>
            <p className='text-muted-foreground'>
              예시: <span className='font-mono text-xs bg-background px-1.5 py-0.5 rounded'>유청 단백질, 쉐이커, BCAA</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SearchResults({
  stores,
  isLoading,
  error,
  keywordCount,
  totalStoresFound,
  onRetry,
}: SearchResultsProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>오류가 발생했습니다</AlertTitle>
        <AlertDescription className='flex items-center justify-between'>
          <span>{error}</span>
          {onRetry && (
            <Button variant='outline' size='sm' onClick={onRetry}>
              다시 시도
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (stores === null) {
    return <IdleState />;
  }

  if (stores.length === 0) {
    return <EmptyState keywordCount={keywordCount} />;
  }

  return (
    <div className='space-y-6 animate-in fade-in'>
      <div className='flex items-center justify-between px-1'>
        <p className='text-sm md:text-base text-muted-foreground'>
          총 <span className='font-semibold text-foreground'>{totalStoresFound}</span>개 스토어 중{' '}
          <span className='font-semibold text-primary'>{stores.length}</span>개가{' '}
          <span className='font-semibold text-foreground'>{keywordCount}</span>개 검색어를 모두 판매합니다
        </p>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
        {stores.map((store, index) => (
          <div
            key={store.storeId}
            className='animate-in fade-in'
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: 'backwards',
            }}
          >
            <StoreCard store={store} />
          </div>
        ))}
      </div>
    </div>
  );
}

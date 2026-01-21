'use client';

import { ExternalLink } from 'lucide-react';
import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SmartStore } from '@/types';

interface StoreCardProps {
  store: SmartStore
}

export function StoreCard({ store }: StoreCardProps) {
  // Use Naver Shopping search with store name filter
  // Since smartstore URLs don't contain actual store IDs, we search by store name
  const storeSearchUrl = `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(store.storeName)}&shopMallId=`;

  // Group products by keyword
  // A product can appear under multiple keywords if it matched multiple search terms
  const productsByKeyword = store.products.reduce((acc, product) => {
    for (const keyword of product.keywords) {
      if (!acc[keyword]) {
        acc[keyword] = [];
      }
      acc[keyword].push(product);
    }
    return acc;
  }, {} as Record<string, typeof store.products>);

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('ko-KR').format(Number(price));
  };

  return (
    <Card className='h-full gap-3'>
      <CardHeader>
        <div className='flex items-start justify-between gap-2'>
          <CardTitle className='text-lg leading-tight'>
            <a
              href={storeSearchUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='hover:underline flex items-center gap-1'
            >
              {store.storeName}
              <ExternalLink className='h-4 w-4 shrink-0' />
            </a>
          </CardTitle>
          <Badge variant='secondary' className='shrink-0'>
            {store.products.length}개 상품
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {Object.entries(productsByKeyword).map(([keyword, products]) => (
          <div key={keyword} className='space-y-2'>
            <Badge variant='outline' className='text-xs'>
              {keyword}
            </Badge>
            <div className='space-y-2'>
              {products.slice(0, 3).map((product) => (
                <a
                  key={product.link}
                  href={product.link}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors'
                >
                  {product.image && (
                    <Image
                      src={product.image}
                      alt={product.title}
                      width={40}
                      height={40}
                      className='w-10 h-10 object-cover rounded flex-shrink-0'
                      style={{ objectFit: 'cover' }}
                    />
                  )}
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm truncate'>{product.title}</p>
                    <p className='text-sm font-medium text-primary'>
                      ₩{formatPrice(product.price)}
                    </p>
                  </div>
                </a>
              ))}
              {products.length > 3 && (
                <p className='text-xs text-muted-foreground pl-2'>
                  외 {products.length - 3}개의 상품
                </p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

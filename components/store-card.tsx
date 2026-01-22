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
  // Use actual store URL extracted from product links
  // Falls back to search if storeUrl is not available
  const storeLink = store.storeUrl || `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(store.storeName)}`;
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
    <Card className='h-full gap-3 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between gap-2'>
          <CardTitle className='text-lg leading-tight'>
            <a
              href={storeLink}
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-primary flex items-center gap-1.5 transition-all'
            >
              {store.storeName}
              <ExternalLink className='h-4 w-4 shrink-0 opacity-60 transition-opacity' />
            </a>
          </CardTitle>
          <Badge variant='secondary' className='shrink-0 font-medium'>
            {store.products.length}
          </Badge>
        </div>
        <p className='text-xs text-muted-foreground mt-1'>스마트스토어</p>
      </CardHeader>
      <CardContent className='space-y-5'>
        {Object.entries(productsByKeyword).map(([keyword, products]) => (
          <div key={keyword} className='space-y-2.5'>
            <Badge variant='outline' className='text-xs font-medium'>
              {keyword}
            </Badge>
            <div className='space-y-1.5'>
              {products.slice(0, 3).map((product) => (
                <a
                  key={product.link}
                  href={product.link}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/50 transition-all duration-200 hover:scale-[1.02] group/item'
                >
                  {product.image && (
                    <div className='relative overflow-hidden rounded-md shrink-0'>
                      <Image
                        src={product.image}
                        alt={product.title}
                        width={48}
                        height={48}
                        className='w-12 h-12 object-cover group-hover/item:scale-110 transition-transform duration-300'
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm truncate font-medium group-hover/item:text-primary transition-colors'>
                      {product.title}
                    </p>
                    <p className='text-sm font-semibold text-primary mt-0.5'>
                      ₩{formatPrice(product.price)}
                    </p>
                  </div>
                </a>
              ))}
              {products.length > 3 && (
                <p className='text-xs text-muted-foreground pl-2.5 pt-1'>
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

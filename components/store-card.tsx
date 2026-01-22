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
  // Use first product link as store entry point
  const storeLink = store.products[0]?.link || '#';
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
    <Card className='h-full hover:border-primary/20 transition-colors duration-200'>
      <CardHeader className='gap-0'>
        <div className='flex items-center justify-between gap-3'>
          <CardTitle className='text-lg leading-tight flex-1'>
            <a
              href={storeLink}
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-primary transition-colors inline-flex items-center gap-1 group/title'
            >
              <span>{store.storeName}</span>
              <ExternalLink className='h-4 w-4 shrink-0 opacity-50 group-hover/title:opacity-100 transition-opacity' />
            </a>
            <p className='text-xs text-muted-foreground mt-1'>스마트스토어</p>
          </CardTitle>
          <Badge variant='secondary' className='shrink-0 font-semibold text-sm px-2.5 py-1 gap-0'>
            {store.products.length}<span className='text-xs text-muted-foreground'>개 상품</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        {Object.entries(productsByKeyword).map(([keyword, products]) => (
          <div key={keyword} className='space-y-3'>
            <Badge variant='outline' className='text-xs font-medium px-2.5 py-0.5'>
              {keyword}
            </Badge>
            <div className='space-y-2'>
              {products.slice(0, 3).map((product) => (
                <a
                  key={product.link}
                  href={product.link}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors duration-150 group/item'
                >
                  {product.image && (
                    <div className='relative overflow-hidden rounded-md shrink-0 border border-border'>
                      <Image
                        src={product.image}
                        alt={product.title}
                        width={48}
                        height={48}
                        className='w-12 h-12 object-cover'
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm truncate font-medium group-hover/item:text-primary transition-colors'>
                      {product.title}
                    </p>
                    <p className='text-sm font-semibold text-primary mt-0.5'>
                      {formatPrice(product.price)}<span className='text-xs text-muted-foreground ml-0.5'>원</span>
                    </p>
                  </div>
                </a>
              ))}
              {products.length > 3 && (
                <p className='text-xs text-muted-foreground pl-2 pt-1'>
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

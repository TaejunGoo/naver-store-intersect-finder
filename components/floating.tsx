'use client';

import { ArrowUp } from 'lucide-react';

import { Button } from './ui/button';

export function Floating() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <div className='fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-end space-y-3'>
      <Button
        onClick={scrollToTop}
        className='cursor-pointer rounded-full p-3 aspect-square h-10 w-10 flex items-center justify-center'
        aria-label='Scroll to top'
      >
        <span className='sr-only'>최상단으로 이동</span>
        <ArrowUp className='h-5 w-5' />
      </Button>
    </div>
  );
}

'use client';

import { SiGithub } from 'react-icons/si';

import { ThemeToggle } from '@/components/theme-toggle';

export const Footer = () => {
  return (
    <footer className='w-full py-8 bg-foreground/3 dark:bg-background/80 backdrop-blur-sm'>
      <div className='container mx-auto px-4 max-w-6xl'>
        <div className='flex flex-col items-center gap-4'>
          {/* Main content */}
          <div className='flex flex-col items-center gap-2 text-xs text-muted-foreground'>
            <a
              href='http://developers.naver.com'
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-primary transition-colors'
            >
              Powered by NAVER Open API
            </a>
            <a
              href='https://github.com/TaejunGoo'
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-primary transition-colors flex items-center gap-0.5'
            >
              <SiGithub className='h-3.5 w-3.5' />
              <span>TaejunGoo</span>
            </a>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
};

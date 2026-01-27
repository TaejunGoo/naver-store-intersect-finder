'use client';

import { useEffect, useState } from 'react';

import { AlertCircle, Clock } from 'lucide-react';

import { Alert, AlertDescription } from './ui/alert';

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

interface RateLimitIndicatorProps {
  rateLimitInfo: RateLimitInfo | null;
}

export function RateLimitIndicator({ rateLimitInfo }: RateLimitIndicatorProps) {
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!rateLimitInfo?.reset) {
      return;
    }

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const secondsLeft = Math.max(0, rateLimitInfo.reset - now);

      // Timer expired - hide warning/error messages
      if (secondsLeft === 0) {
        setIsExpired(true);
        setTimeUntilReset('');
        return;
      }

      setIsExpired(false);
      const minutes = Math.floor(secondsLeft / 60);
      const seconds = secondsLeft % 60;

      if (minutes > 0) {
        setTimeUntilReset(`${minutes}분 ${seconds}초 후`);
      } else {
        setTimeUntilReset(`${seconds}초 후`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [rateLimitInfo?.reset]);

  // Don't show anything until first search
  if (!rateLimitInfo) {
    return null;
  }

  const { limit, remaining } = rateLimitInfo;

  // Show error when no requests remaining (and timer not expired)
  if (remaining === 0 && !isExpired) {
    return (
      <Alert variant='destructive' className='mb-4'>
        <AlertCircle className='h-4 w-4' />
        <AlertDescription>
          <div className='flex items-center justify-between gap-4'>
            <span className='font-medium'>검색 제한에 도달했습니다</span>
            <span className='text-sm flex items-center gap-1'>
              <Clock className='h-3 w-3' />
              {timeUntilReset} 10회로 초기화
            </span>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Show warning when 3 or fewer requests remaining (and timer not expired)
  if (remaining <= 3 && !isExpired) {
    return (
      <Alert className='mb-4 border-orange-500/50 bg-orange-50 dark:bg-orange-950/20'>
        <AlertCircle className='h-4 w-4 text-orange-600 dark:text-orange-500' />
        <AlertDescription className='text-orange-900 dark:text-orange-200'>
          <div className='flex items-center justify-between gap-4'>
            <span>
              남은 검색 횟수: <span className='font-semibold'>{remaining}회</span>
            </span>
            <span className='text-xs flex items-center gap-1 opacity-80'>
              <Clock className='h-3 w-3' />
              {timeUntilReset} 10회로 초기화
            </span>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Normal state - timer expired OR 4+ requests remaining
  return (
    <div className='mb-4 text-xs text-muted-foreground text-center mt-3'>
      1분마다 {limit}회씩 검색 가능합니다
    </div>
  );
}

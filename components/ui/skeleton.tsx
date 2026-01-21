import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='skeleton'
      className={cn('relative overflow-hidden bg-foreground/8 rounded-sm', className)}
      {...props}
    >
      <div className='absolute inset-0 animate-shimmer' />
    </div>
  );
}

export { Skeleton };

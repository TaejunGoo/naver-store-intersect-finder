'use client';

import { useEffect, useState } from 'react';

import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- This is a legitimate use case for preventing hydration mismatch
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className='flex items-center gap-1.5 text-xs'>
        <span className='opacity-0'>light</span>
        <span className='opacity-0'>/</span>
        <span className='opacity-0'>dark</span>
      </div>
    );
  }

  const isLight = theme === 'light';
  const isDark = theme === 'dark';

  return (
    <div className='flex items-center gap-1.5 text-xs'>
      <button
        onClick={() => setTheme('light')}
        className={`transition-colors cursor-pointer ${
          isLight
            ? 'text-foreground font-medium'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label='Switch to light theme'
      >
        light
      </button>
      <span className='text-muted-foreground'>/</span>
      <button
        onClick={() => setTheme('dark')}
        className={`transition-colors cursor-pointer ${
          isDark
            ? 'text-foreground font-medium'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label='Switch to dark theme'
      >
        dark
      </button>
    </div>
  );
}

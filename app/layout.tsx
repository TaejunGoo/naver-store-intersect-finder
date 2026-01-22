import localFont from 'next/font/local';

import './globals.css';

import { Floating } from '@/components/floating';
import { Footer } from '@/components/footer';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

import type { Metadata } from 'next';

const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  display: 'swap',
  variable: '--font-pretendard',
  weight: '45 920', // Pretendard Variable weight range
});

export const metadata: Metadata = {
  title: '스마트스토어 교집합 찾기 | Naver Smart Store Intersection Finder',
  description: '여러 검색어를 입력하면 해당 상품들을 모두 판매하는 네이버 스마트스토어를 찾아드립니다.',
  openGraph: {
    title: '스마트스토어 교집합 찾기',
    description: '여러 상품을 함께 판매하는 네이버 스마트스토어를 찾아보세요',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='ko'
      className={`
        ${pretendard.variable}
      `}
      suppressHydrationWarning={true}
    >
      <body
        className={cn(pretendard.className, 'antialiased')}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem={true}
        >
          {children}
          <Floating />
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

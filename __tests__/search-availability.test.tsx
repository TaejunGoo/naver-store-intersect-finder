import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import Home from '@/app/page';

afterEach(cleanup);

it('explains retirement and disables search without suggesting a retry', () => {
  render(<Home />);

  expect(screen.getByRole('alert')).toHaveTextContent('2026년 7월 31일 종료');
  expect(screen.getByRole('link', { name: '네이버 공식 종료 공지 확인' })).toHaveAttribute(
    'href', 'https://developers.naver.com/notice/article/32564',
  );
  expect(screen.getByRole('textbox')).toBeDisabled();
  expect(screen.getByRole('button')).toBeDisabled();
  expect(screen.queryByText('다시 시도')).not.toBeInTheDocument();
});

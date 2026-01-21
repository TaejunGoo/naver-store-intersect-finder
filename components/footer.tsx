import { SiGithub } from 'react-icons/si';

export const Footer = () => {
  return (
    <footer className='w-full border-t border-muted mt-12 py-6 text-center text-xs text-muted-foreground bg-background/80'>
      <a href='http://developers.naver.com' target='_blank' rel='noopener noreferrer'>Powered by NAVER Open API</a>
      <div className='mt-1'>
        <span>&copy; {new Date().getFullYear()} 스마트스토어 교집합 찾기</span>
        <span className='mx-2'>·</span>
        <a href='https://github.com/TaejunGoo' target='_blank' rel='noopener noreferrer' className='underline hover:text-primary'>
          <SiGithub className='inline h-4 w-4 mb-0.5 mr-1' />
          Github</a>
      </div>
    </footer>
  );
};

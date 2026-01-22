# Naver Smart Store Intersection Finder

여러 검색어를 입력하면 해당 상품들을 **모두 판매하는** 네이버 스마트스토어를 찾아주는 웹 애플리케이션입니다.

[English](#english) | [한국어](#korean)

---

<a name="korean"></a>

## 🎯 주요 기능

- **교집합 검색**: 여러 키워드를 모두 판매하는 스마트스토어 찾기
- **스마트 캐싱**: 5분 TTL 메모리 캐시로 빠른 재검색
- **반응형 디자인**: 모바일/태블릿/데스크톱 최적화
- **다크모드**: 시스템 테마 자동 감지 + 수동 전환

## 🚀 빠른 시작

### 필수 조건

- Node.js 18.x 이상
- Naver 개발자 센터 API 키 ([발급 받기](https://developers.naver.com/apps/))

### 설치

```bash
# 저장소 클론
git clone https://github.com/yourusername/naver-store-intersect-finder.git
cd naver-store-intersect-finder

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일에 Naver API 키 입력

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

## 📋 사용 예시

### 검색 예시

```
입력: "진간장 골드, 콘소메"
결과: 진간장 골드와 콘소메를 모두 판매하는 스마트스토어 목록
```

```
입력: "단백질 보충제, 쉐이커, 운동장갑"
결과: 세 가지 상품을 모두 취급하는 운동용품 전문 스토어
```


## 🏗️ 기술 스택

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js (App Router) | 16.1.4 |
| Language | TypeScript | 5.9.3 |
| UI Library | React | 19.2.3 |
| Styling | Tailwind CSS | v4 |
| Components | shadcn/ui | latest |
| Data Fetching | SWR | 2.x |
| Theme | next-themes | latest |
| Icons | Lucide React | latest |
| Font | Pretendard Variable | - |
| Testing | Vitest + Testing Library | latest |

## 📁 프로젝트 구조

```
naver-store-intersect-finder/
├── app/
│   ├── api/search/route.ts       # API 엔드포인트
│   ├── fonts/                    # Pretendard 폰트
│   ├── layout.tsx                # 루트 레이아웃
│   ├── page.tsx                  # 메인 페이지
│   └── globals.css               # 전역 스타일
├── components/
│   ├── ui/                       # shadcn/ui 컴포넌트
│   ├── search-form.tsx           # 검색 폼
│   ├── search-results.tsx        # 결과 표시
│   ├── store-card.tsx            # 스토어 카드
│   ├── theme-toggle.tsx          # 테마 토글 버튼
│   ├── theme-provider.tsx        # 테마 프로바이더
│   ├── footer.tsx                # 푸터
│   └── floating.tsx              # 플로팅 버튼
├── hooks/
│   └── use-store-search.ts       # SWR 검색 훅
├── lib/
│   ├── naver-api.ts              # Naver API 클라이언트
│   ├── store-extractor.ts        # 스토어 추출 로직
│   ├── intersection.ts           # 교집합 계산
│   └── cache.ts                  # 메모리 캐시
├── types/
│   └── index.ts                  # TypeScript 타입
└── __tests__/                    # 테스트 파일
```

## 🧪 테스트

```bash
# 테스트 실행 (watch mode)
npm run test

# 테스트 실행 (1회)
npm run test:run

# 전체 44개 테스트 통과 확인
npm run test:run
# ✓ store-extractor.test.ts (17 tests)
# ✓ intersection.test.ts (11 tests)
# ✓ cache.test.ts (16 tests)
```

## 🛠️ 개발 명령어

```bash
# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 시작
npm start

# 린트 실행
npm run lint

# 테스트 실행
npm run test
```


## 🔒 환경 변수

```env
# .env.local
NAVER_CLIENT_ID=your_client_id_here
NAVER_CLIENT_SECRET=your_client_secret_here
```

[Naver 개발자 센터](https://developers.naver.com/apps/)에서 발급받으세요.

## 📝 라이선스

MIT License

---

<a name="english"></a>

## 🌐 English

### Overview

A web application that finds Naver Smart Stores selling **all** of your searched products.

### Features

- **Intersection Search**: Shows only stores selling all searched keywords
- **Smart Caching**: 5-minute TTL memory cache for faster re-searches
- **Responsive Design**: Optimized for mobile/tablet/desktop
- **Dark Mode**: Auto-detects system theme + manual toggle in footer

### Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/naver-store-intersect-finder.git

# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Add your Naver API credentials to .env.local

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Tech Stack

- **Framework**: Next.js 16.1.4 (App Router)
- **Language**: TypeScript 5.9.3
- **UI**: React 19.2.3 + Tailwind CSS v4 + shadcn/ui
- **Data Fetching**: SWR
- **Testing**: Vitest + Testing Library


### Testing

```bash
npm run test:run
# ✓ 44 tests passing
```

### License

MIT License

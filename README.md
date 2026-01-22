# Naver Smart Store Intersection Finder

여러 검색어를 입력하면 해당 상품들을 **모두 판매하는** 네이버 스마트스토어를 찾아주는 웹 애플리케이션입니다.

[English](#english) | [한국어](#korean)

---

<a name="korean"></a>

## 🎯 주요 기능

- **교집합 검색**: 여러 키워드를 모두 판매하는 스마트스토어만 표시
- **다중 정렬 전략**: 유사도순(sim) + 최신순(date)으로 다양한 스토어 발견
- **점진적 검색**: 충분한 결과 발견 시 조기 종료로 API 호출 최소화
- **스마트 캐싱**: 5분 TTL 메모리 캐시로 중복 API 호출 방지
- **속도 제한 방지**: 다단계 딜레이 시스템으로 429 에러 방지
- **반응형 UI**: 모바일/태블릿/데스크톱 최적화
- **다크모드 지원**: 시스템 테마 자동 감지 + 푸터에서 수동 전환
- **로딩 애니메이션**: Shimmer 효과로 로딩 상태 명확히 표시

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

### 검색 전략

1. **sim 정렬 (유사도순)**
   - 키워드와 가장 관련성 높은 상품
   - 인기 있는 대형 스토어 우선 노출

2. **date 정렬 (최신순)**
   - 최근 등록된 상품
   - 신규 진입 소형 전문몰 발견

3. **점진적 검색**
   - 2페이지(200개 상품)씩 배치로 검색
   - 교집합 10개 이상 발견 시 조기 종료
   - 최대 10페이지(1,000개 상품)까지 검색

## ⚙️ 설정 커스터마이징

모든 검색 관련 설정은 `lib/naver-api.ts`의 `SEARCH_CONFIG`에서 관리합니다:

```typescript
export const SEARCH_CONFIG = {
  // API Request Settings
  DISPLAY: 100,              // API 요청당 상품 수
  MAX_START: 1000,           // Naver API 제한
  MAX_PAGES_PER_SORT: 10,    // 정렬당 최대 페이지 수

  // Progressive Search Settings
  PAGES_PER_BATCH: 2,        // 배치당 페이지 수
  MIN_INTERSECTION_COUNT: 10, // 조기 종료 기준 (교집합 개수)

  // Sort Options
  SORT_OPTIONS: ['sim', 'date'], // 사용할 정렬 방법
  // 'sim': 유사도순, 'date': 최신순
  // 'asc': 낮은가격순, 'dsc': 높은가격순 추가 가능

  // Rate Limiting (속도 제한 방지)
  DELAY_BETWEEN_SORTS: 500,      // 정렬 옵션 사이 대기 (ms)
  DELAY_BETWEEN_BATCHES: 100,    // 배치 사이 대기 (ms)
  DELAY_BETWEEN_API_CALLS: 50,   // 개별 API 호출 사이 대기 (ms)
}
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

## 📊 API 사용량 최적화

### 캐싱 전략
- **TTL**: 5분 (메모리 캐시)
- **키 형식**: `naver:{keyword}:{display}:{start}:{sort}`
- **효과**: 동일 검색 시 API 호출 0회

### 점진적 검색

| 시나리오 | API 호출 | 절감율 |
|---------|---------|--------|
| 첫 배치에서 교집합 10개 발견 | 8회 | 80% |
| 5배치 후 교집합 10개 발견 | 20회 | 50% |
| 최대 검색 (교집합 부족) | 40회 | 0% |

*기준: 2 키워드 × 2 정렬 × 10 페이지 = 40회*

## 🌟 주요 기능 상세

### 1. 다중 정렬 전략

대형몰 편향을 줄이기 위해 여러 정렬 방식을 사용합니다:

- **sim (유사도순)**: 키워드와 관련성 높은 상품, 인기 스토어
- **date (최신순)**: 최근 등록된 상품, 신규/소형 전문몰

### 2. 중복 키워드 처리

같은 상품이 여러 키워드에 매칭되는 경우:

```typescript
// 상품 "샘표 진간장 골드 500ml"
// "진간장" 검색에도 나오고, "진간장 골드" 검색에도 나옴

interface StoreProduct {
  title: string
  keywords: string[]  // ["진간장", "진간장 골드"]
}
```

카드에서 두 키워드 섹션 모두에 표시됩니다.

### 3. Shimmer 로딩 애니메이션

Facebook, LinkedIn 스타일의 부드러운 shimmer 효과:
- 배경: 회색 스켈레톤 구조 유지
- 효과: 흰색 빛이 왼쪽→오른쪽으로 이동
- 다크모드: 자동 대응

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

- **Intersection Search**: Shows only stores selling all keywords
- **Multi-Sort Strategy**: Combines similarity (sim) + recent (date) sorting
- **Progressive Search**: Early termination when sufficient results found
- **Smart Caching**: 5-minute TTL memory cache to prevent duplicate API calls
- **Rate Limit Prevention**: Multi-level delay system to avoid 429 errors
- **Responsive UI**: Optimized for mobile/tablet/desktop
- **Dark Mode**: Auto-detects system theme + manual toggle in footer
- **Loading Animation**: Shimmer effect for clear loading state

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

### Configuration

All search settings are centralized in `SEARCH_CONFIG` at `lib/naver-api.ts`:

```typescript
export const SEARCH_CONFIG = {
  MAX_PAGES_PER_SORT: 10,    // Max pages per sort option
  PAGES_PER_BATCH: 2,        // Pages per batch
  MIN_INTERSECTION_COUNT: 10, // Early termination threshold
  SORT_OPTIONS: ['sim', 'date'], // Active sort methods
  DELAY_BETWEEN_SORTS: 500,  // ms delay between sorts
  DELAY_BETWEEN_BATCHES: 100, // ms delay between batches
  DELAY_BETWEEN_API_CALLS: 50, // ms delay between API calls
}
```

### Testing

```bash
npm run test:run
# ✓ 44 tests passing
```

### License

MIT License

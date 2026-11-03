> [!IMPORTANT]
> **현재 검색 기능을 이용할 수 없습니다.** 네이버 쇼핑 검색 API는 2026년 7월 31일 종료되었으며, NAVER API HUB 이관 대상에서도 제외되었습니다. 자세한 내용은 [공식 종료 공지](https://developers.naver.com/notice/article/32564)와 [이관 공지](https://developers.naver.com/notice/article/32530)를 확인해 주세요.
>
> 아래 내용은 API 종료 이전의 기능 및 사용 안내입니다.

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
- **보안 강화**: Rate Limiting, Security Headers, Input Validation

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

## 🔒 보안 기능

### 1. Rate Limiting (속도 제한)

- **Fixed Window Algorithm**: 1분당 10회 검색 제한
- **Upstash Redis**: Vercel 배포 환경에서 분산 Rate Limiting
- **In-memory Fallback**: 로컬 개발 환경에서 자동 전환
- **실시간 UI**: 남은 검색 횟수와 초기화 시간 표시

설정 방법: [UPSTASH_SETUP.md](./UPSTASH_SETUP.md)
모니터링: [RATE_LIMIT_MONITORING.md](./RATE_LIMIT_MONITORING.md)

### 2. Security Headers (보안 헤더)

5가지 필수 보안 헤더 적용:

- **X-Frame-Options**: Clickjacking 방지
- **X-Content-Type-Options**: MIME sniffing 방지
- **Referrer-Policy**: 정보 유출 방지
- **Permissions-Policy**: 불필요한 브라우저 기능 차단
- **Content-Security-Policy**: XSS 공격 방지

상세 가이드: [SECURITY_HEADERS.md](./SECURITY_HEADERS.md)

### 3. Input Validation (입력 검증)

- **키워드 개수**: 최소 2개, 최대 5개
- **키워드 길이**: 최대 100자
- **허용 문자**: 한글, 영문, 숫자, 공백, 하이픈(-)만 허용
- **XSS/SQL Injection 방지**: 특수문자 차단 (`<`, `>`, `&`, `;`, 따옴표 등)
- **이중 검증**: 클라이언트 + 서버 양쪽에서 검증
- **자동 정규화**: 공백 제거, 중복 제거

```typescript
// 검증 규칙 (lib/validation.ts)
VALIDATION_RULES = {
  MIN_KEYWORDS: 2,
  MAX_KEYWORDS: 5,
  MAX_KEYWORD_LENGTH: 100,
  KEYWORD_PATTERN: /^[a-zA-Z0-9가-힣\s\-]+$/
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
| Rate Limiting | Upstash Redis | latest |

## 📁 프로젝트 구조

```
naver-store-intersect-finder/
├── app/
│   ├── api/search/route.ts       # API 엔드포인트 (with validation)
│   ├── fonts/                    # Pretendard 폰트
│   ├── layout.tsx                # 루트 레이아웃
│   ├── page.tsx                  # 메인 페이지
│   └── globals.css               # 전역 스타일
├── components/
│   ├── ui/                       # shadcn/ui 컴포넌트
│   ├── search-form.tsx           # 검색 폼 (with validation)
│   ├── search-results.tsx        # 결과 표시
│   ├── store-card.tsx            # 스토어 카드
│   ├── rate-limit-indicator.tsx  # Rate limit 상태 표시
│   ├── theme-toggle.tsx          # 테마 토글 버튼
│   ├── theme-provider.tsx        # 테마 프로바이더
│   ├── footer.tsx                # 푸터
│   └── floating.tsx              # 플로팅 버튼
├── hooks/
│   └── use-store-search.ts       # SWR 검색 훅 (with rate limit info)
├── lib/
│   ├── naver-api.ts              # Naver API 클라이언트
│   ├── store-extractor.ts        # 스토어 추출 로직
│   ├── intersection.ts           # 교집합 계산
│   ├── cache.ts                  # 메모리 캐시
│   ├── validation.ts             # 입력 검증 로직
│   └── upstash.ts                # Upstash Redis 클라이언트
├── types/
│   └── index.ts                  # TypeScript 타입
├── proxy.ts                      # Rate limiting middleware
└── __tests__/                    # 테스트 파일
    └── lib/
        ├── store-extractor.test.ts  # 17 tests
        ├── intersection.test.ts     # 11 tests
        ├── cache.test.ts            # 16 tests
        ├── validation.test.ts       # 42 tests
        └── upstash.test.ts          # Mock tests
```

## 🧪 테스트

```bash
# 테스트 실행 (watch mode)
npm run test

# 테스트 실행 (1회)
npm run test:run

# 전체 86개 테스트 통과 확인
npm run test:run
# ✓ store-extractor.test.ts (17 tests)
# ✓ intersection.test.ts (11 tests)
# ✓ cache.test.ts (16 tests)
# ✓ validation.test.ts (42 tests)
```

### 보안 검증

```bash
# Rate Limiting 테스트
npm run test:ratelimit

# Security Headers 검증 (로컬)
npm run check:security

# Security Headers 검증 (프로덕션)
npm run check:security:prod
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

# Naver API (필수)
NAVER_CLIENT_ID=your_client_id_here
NAVER_CLIENT_SECRET=your_client_secret_here

# Upstash Redis (프로덕션 Rate Limiting용, 선택)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

### API 키 발급

- **Naver API**: [Naver 개발자 센터](https://developers.naver.com/apps/)에서 발급
- **Upstash Redis**: [UPSTASH_SETUP.md](./UPSTASH_SETUP.md) 가이드 참조

> **참고**: Upstash Redis 없이도 로컬 개발 가능 (자동으로 in-memory fallback 사용)

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
- **Security Enhanced**: Rate Limiting, Security Headers, Input Validation

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
- **Security**: Upstash Redis (Rate Limiting)

### Security Features

1. **Rate Limiting**: 10 requests per minute (Fixed Window Algorithm)
2. **Security Headers**: X-Frame-Options, CSP, Referrer-Policy, etc.
3. **Input Validation**: XSS/SQL Injection prevention, pattern validation

See [SECURITY_HEADERS.md](./SECURITY_HEADERS.md) for details.

### Testing

```bash
npm run test:run
# ✓ 86 tests passing

# Security verification
npm run check:security        # Check security headers
npm run test:ratelimit        # Test rate limiting
```

### License

MIT License

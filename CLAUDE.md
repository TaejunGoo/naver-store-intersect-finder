# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication Guidelines

- **Documentation Language**: All code documentation, comments, commit messages, and written artifacts should be in English.
- **Conversation Language**: All conversations with the user should be conducted in Korean (한글).

## Project Overview

This is a Next.js 16 application called "naver-store-intersect-finder" built with TypeScript, React 19, and Tailwind CSS v4. The project uses the App Router architecture.

## Development Commands

```bash
# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Technology Stack

- **Framework**: Next.js 16.1.4 (App Router)
- **React**: 19.2.3
- **TypeScript**: 5.9.3
- **Styling**: Tailwind CSS v4 with @tailwindcss/postcss
- **Components**: shadcn/ui
- **Data Fetching**: SWR 2.x
- **Icons**: Lucide React
- **Font**: Pretendard Variable (local font)
- **Testing**: Vitest + Testing Library

## Project Structure

```
naver-store-intersect-finder/
├── app/
│   ├── api/search/route.ts       # Naver API proxy endpoint
│   ├── fonts/
│   │   └── PretendardVariable.woff2  # Local Pretendard font
│   ├── layout.tsx                # Root layout with Pretendard font
│   ├── page.tsx                  # Main page (client component)
│   └── globals.css               # Global styles + shimmer animation
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── skeleton.tsx          # With shimmer animation
│   │   ├── alert.tsx
│   │   ├── input-group.tsx
│   │   └── textarea.tsx
│   ├── theme-provider.tsx        # Dark mode provider
│   ├── search-form.tsx           # Keyword input form
│   ├── search-results.tsx        # Results container
│   └── store-card.tsx            # Store display card
├── hooks/
│   └── use-store-search.ts       # SWR-based search hook
├── lib/
│   ├── utils.ts                  # shadcn utility (cn function)
│   ├── naver-api.ts              # Naver API client + SEARCH_CONFIG
│   ├── store-extractor.ts        # Smart store extraction (uses mallName)
│   ├── intersection.ts           # Set intersection logic
│   └── cache.ts                  # Memory cache (5min TTL)
├── types/
│   └── index.ts                  # TypeScript type definitions
└── __tests__/                    # Vitest test files (44 tests)
    └── lib/
        ├── store-extractor.test.ts
        ├── intersection.test.ts
        └── cache.test.ts
```

## Key Configuration Details

### TypeScript Configuration
- Path alias: `@/*` maps to project root
- Target: ES2017
- JSX: react-jsx
- Strict mode enabled

### Styling
- Uses Tailwind CSS v4 (imported via `@import "tailwindcss"`)
- CSS variables for theme customization (`--background`, `--foreground`)
- Font variables managed through `next/font` and Tailwind theme
- Dark mode support via `prefers-color-scheme`

### Next.js
- App Router architecture (app/ directory)
- Server Components by default
- Image optimization via next/image

## Core Features

### 1. Multi-Sort Search Strategy

The application uses multiple sort methods to reduce large store bias:

- **sim (similarity)**: High relevance, popular stores (may favor large stores)
- **date (recent)**: Recently listed products (captures new/small specialty stores)

Additional sort options available but not currently used:
- **asc**: Low to high price (budget stores)
- **dsc**: High to low price (premium stores)

### 2. Progressive Search

Minimizes API calls while maximizing results:
1. Fetch 2 pages at a time per keyword
2. Check intersection count after each batch
3. If intersection >= 10 stores, stop early
4. Otherwise, continue up to 10 pages maximum

### 3. Centralized Configuration

All search settings are managed in `SEARCH_CONFIG` at `lib/naver-api.ts`:

```typescript
export const SEARCH_CONFIG = {
  // API Request Settings
  DISPLAY: 100,              // Max items per API request
  MAX_START: 1000,           // Naver API limit: start + display <= 1100
  MAX_PAGES_PER_SORT: 10,    // Max pages to fetch per sort option

  // Progressive Search Settings
  PAGES_PER_BATCH: 2,        // Pages to fetch per batch
  MIN_INTERSECTION_COUNT: 10, // Stop if this many intersection stores found

  // Sort Options
  SORT_OPTIONS: ['sim', 'date'] as const,

  // Rate Limiting
  DELAY_BETWEEN_SORTS: 500,      // ms delay between sort options
  DELAY_BETWEEN_BATCHES: 100,    // ms delay between batches
  DELAY_BETWEEN_API_CALLS: 50,   // ms delay between individual API calls
}
```

To modify search behavior, update these values in `SEARCH_CONFIG`.

### 4. Store Identification

**Critical**: Naver API returns URLs like `smartstore.naver.com/main/products/{id}` which don't contain store IDs.

We use the `mallName` field as the store identifier:
- `mallName: "헬시오"` → Store ID: `헬시오`
- Normalized via `generateStoreId(mallName)` (lowercase + trim)

### 5. Product Deduplication

Same product appearing in multiple keywords:

```typescript
// Before (bug): keyword as string
interface StoreProduct {
  keyword: string  // Lost second keyword if same product matched multiple keywords
}

// After (fixed): keywords as array
interface StoreProduct {
  keywords: string[]  // Preserves all matching keywords
}
```

Example:
- Product "샘표 진간장 골드 500ml"
- Matches "진간장" keyword ✓
- Matches "진간장 골드" keyword ✓
- Result: `keywords: ["진간장", "진간장 골드"]`
- Display: Shows in both keyword sections on the card

### 6. Rate Limiting Prevention

Three-level delay system to avoid 429 errors:

1. **Between API calls**: 50ms (prevents burst requests)
2. **Between batches**: 100ms (gives API breathing room)
3. **Between sorts**: 500ms (major pause between sort options)

### 7. Shimmer Loading Animation

Facebook/LinkedIn-style shimmer effect for skeleton screens:

```css
/* globals.css */
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    transparent 0%,
    oklch(1 0 0 / 50%) 50%,
    transparent 100%
  );
  animation: shimmer 2s infinite;
}
```

- Light mode: 50% opacity white shine
- Dark mode: 10% opacity white shine (auto-adjusted)

## Important Implementation Notes

### Filtering Non-SmartStore Products

**Only include products from SmartStore URLs**:

```typescript
// lib/store-extractor.ts
function isSmartStoreProduct(item: NaverShoppingItem): boolean {
  return /smartstore\.naver\.com/.test(item.link) ||
         /brand\.naver\.com/.test(item.link)
}
```

**Exclude**:
- Coupang (coupang.com)
- 11st (11st.co.kr)
- Gmarket (gmarket.co.kr)
- Other open markets

### Cache Key Format

```typescript
`naver:${keyword}:${display}:${start}:${sort}`

// Examples:
// naver:진간장 골드:100:1:sim
// naver:진간장 골드:100:101:sim
// naver:진간장 골드:100:1:date
```

TTL: 5 minutes

### Store Card Link Strategy

Since URLs don't contain store IDs, we link to Naver Shopping search by store name:

```typescript
const storeSearchUrl = `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(store.storeName)}`
```

## Testing

All 44 tests must pass before committing:

```bash
npm run test:run
```

Test coverage:
- `store-extractor.test.ts`: 17 tests (URL parsing, filtering, grouping)
- `intersection.test.ts`: 11 tests (intersection logic, merging)
- `cache.test.ts`: 16 tests (CRUD, TTL, expiration)

## Development Workflow

1. Make code changes
2. Run linter: `npm run lint`
3. Run tests: `npm run test:run`
4. Build: `npm run build`
5. All must pass before committing

## Environment Variables

Required in `.env.local`:

```env
NAVER_CLIENT_ID=your_client_id
NAVER_CLIENT_SECRET=your_client_secret
```

Get credentials from: https://developers.naver.com/apps/

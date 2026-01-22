# Naver Smart Store Intersection Finder - Specification

## Overview

A Next.js web application that finds smart stores selling products across **multiple search keywords** using Naver Shopping API. Users enter multiple keywords, and the app finds stores that have products matching **all** keywords (intersection).

### Use Case Example
- User searches: "단백질 보충제", "쉐이커", "운동 장갑"
- App finds: Smart stores that sell ALL three product types
- Result: List of stores with their matching products for each keyword

---

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript | 5.x |
| UI Library | React | 19.x |
| Styling | Tailwind CSS | v4 |
| Components | shadcn/ui | latest |
| Data Fetching | SWR | 2.x |
| Theme | next-themes | latest |
| Icons | Lucide React | latest |
| Font | Pretendard Variable | - |
| Testing | Vitest + Testing Library | latest |

---

## Project Structure

```
naver-store-intersect-finder/
├── app/
│   ├── api/search/route.ts       # Naver API proxy endpoint
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Main page (client component)
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── skeleton.tsx
│   │   └── alert.tsx
│   ├── search-form.tsx           # Keyword input form
│   ├── search-results.tsx        # Results container
│   ├── store-card.tsx            # Store display card
│   ├── theme-toggle.tsx          # Theme toggle component (light/dark)
│   ├── theme-provider.tsx        # Theme provider wrapper
│   ├── footer.tsx                # Footer with theme toggle
│   └── floating.tsx              # Floating action button
├── hooks/
│   └── use-store-search.ts       # SWR-based search hook
├── lib/
│   ├── utils.ts                  # shadcn utility (cn function)
│   ├── naver-api.ts              # Naver API client
│   ├── store-extractor.ts        # Smart store ID extraction
│   ├── intersection.ts           # Set intersection logic
│   └── cache.ts                  # Memory cache implementation
├── types/
│   └── index.ts                  # TypeScript type definitions
├── __tests__/                    # Vitest test files
│   └── lib/
│       ├── store-extractor.test.ts
│       ├── intersection.test.ts
│       └── cache.test.ts
├── vitest.config.ts              # Vitest configuration
├── vitest.setup.ts               # Vitest setup
├── .env.local                    # Environment variables (git ignored)
├── .env.example                  # Example env file
└── SPEC.md                       # This specification file
```

---

## Environment Variables

```env
# .env.local
NAVER_CLIENT_ID=your_client_id
NAVER_CLIENT_SECRET=your_client_secret
```

Get credentials from: https://developers.naver.com/apps/

---

## Implementation Checklist

### Phase 1: Project Setup
- [x] Install production dependencies (swr, clsx, tailwind-merge, class-variance-authority, lucide-react)
- [x] Install dev dependencies (vitest, @vitejs/plugin-react, @testing-library/react, jsdom)
- [x] Initialize shadcn/ui
- [x] Add shadcn/ui components (button, input, card, badge, skeleton, alert)
- [x] Create .env.example
- [x] Create .env.local template
- [x] Create vitest.config.ts
- [x] Create vitest.setup.ts
- [x] Add test scripts to package.json

### Phase 2: Core Libraries
- [x] Create `types/index.ts` - TypeScript interfaces
- [x] Verify `lib/utils.ts` - cn function (created by shadcn)
- [x] Create `lib/cache.ts` - MemoryCache class
- [x] Create `lib/store-extractor.ts` - URL parsing and store grouping
- [x] Create `lib/intersection.ts` - Set intersection calculation
- [x] Create `lib/naver-api.ts` - API client with caching

### Phase 3: API Route
- [x] Create `app/api/search/route.ts`
  - [x] POST handler for search requests
  - [x] Validate request body (keywords array)
  - [x] Parallel keyword search using Naver API
  - [x] Calculate intersection of stores
  - [x] Return structured response
  - [x] Error handling for all scenarios

### Phase 4: Frontend Components
- [x] Create `hooks/use-store-search.ts`
  - [x] SWR mutation for search
  - [x] Loading state management
  - [x] Error state management

- [x] Create `components/search-form.tsx`
  - [x] Keyword input with comma separation
  - [x] Input validation (min 2 keywords)
  - [x] Submit button with loading state
  - [x] Clear button
  - [x] Keyboard support (Enter to submit)

- [x] Create `components/store-card.tsx`
  - [x] Store name and ID display
  - [x] Product count badge
  - [x] Product list by keyword
  - [x] Product image thumbnails
  - [x] Product price display
  - [x] Link to store/product

- [x] Create `components/search-results.tsx`
  - [x] Loading skeleton state
  - [x] Empty state (no results)
  - [x] Error state with retry
  - [x] Results count display
  - [x] Store cards grid layout

- [x] Update `app/page.tsx`
  - [x] Convert to client component ("use client")
  - [x] Integrate SearchForm
  - [x] Integrate SearchResults
  - [x] Page title and description

- [x] Update `app/layout.tsx`
  - [x] Korean metadata (title, description)
  - [x] Open Graph metadata

### Phase 5: Testing
- [x] Create `__tests__/lib/store-extractor.test.ts`
  - [x] Test extractSmartStoreId with various URL formats
  - [x] Test isSmartStoreProduct
  - [x] Test toStoreProduct HTML tag removal
  - [x] Test groupByStore

- [x] Create `__tests__/lib/intersection.test.ts`
  - [x] Test findIntersection with empty input
  - [x] Test findIntersection with single keyword
  - [x] Test findIntersection with multiple keywords
  - [x] Test getAllStores
  - [x] Test countKeywordAppearances

- [x] Create `__tests__/lib/cache.test.ts`
  - [x] Test get/set operations
  - [x] Test TTL expiration
  - [x] Test has/delete operations
  - [x] Test clear and size

- [x] Run all tests and verify passing (44 tests passed)

### Phase 6: Finalization
- [x] Run `npm run lint` and fix issues (0 errors, warnings only)
- [x] Run `npm run build` and verify success
- [x] Manual testing with real keywords
- [x] Update SPEC.md with completion status
- [x] Update README.md with full documentation
- [x] Update CLAUDE.md with project guidelines

---

## Type Definitions

### Core Types (`types/index.ts`)

```typescript
// Naver Shopping API Response
interface NaverShoppingItem {
  title: string          // Product title (may contain HTML)
  link: string           // Product URL
  image: string          // Product image URL
  lprice: string         // Lowest price
  hprice: string         // Highest price
  mallName: string       // Store name
  productId: string      // Product ID
  productType: string    // Product type
  brand: string          // Brand name
  maker: string          // Manufacturer
  category1-4: string    // Category hierarchy
}

interface NaverShoppingResponse {
  lastBuildDate: string
  total: number          // Total results
  start: number          // Start index
  display: number        // Items per page
  items: NaverShoppingItem[]
}

// Application Types
interface SmartStore {
  storeId: string        // Smart store ID (from URL)
  storeName: string      // Display name
  products: StoreProduct[]
}

interface StoreProduct {
  title: string          // Clean title (no HTML)
  link: string           // Product URL
  image: string          // Image URL
  price: string          // Price
  keywords: string[]     // All keywords that matched this product
}

interface SearchRequest {
  keywords: string[]     // List of search keywords
  display?: number       // Items per keyword (default: 100)
}

interface SearchResponse {
  success: boolean
  data?: {
    intersectionStores: SmartStore[]
    keywordCount: number
    totalStoresFound: number
  }
  error?: string
}
```

---

## API Specification

### POST /api/search

Search for stores that have products matching all keywords.

**Request:**
```json
{
  "keywords": ["단백질 보충제", "쉐이커"],
  "display": 100
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "intersectionStores": [
      {
        "storeId": "store123",
        "storeName": "운동용품점",
        "products": [
          {
            "title": "단백질 파우더 1kg",
            "link": "https://smartstore.naver.com/...",
            "image": "https://...",
            "price": "35000",
            "keywords": ["단백질 보충제"]
          },
          {
            "title": "프로틴 쉐이커 600ml",
            "link": "https://smartstore.naver.com/...",
            "image": "https://...",
            "price": "12000",
            "keywords": ["쉐이커"]
          }
        ]
      }
    ],
    "keywordCount": 2,
    "totalStoresFound": 150
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "At least 2 keywords are required"
}
```

---

## Naver Shopping API Data Extraction Process

### API Overview

The app uses Naver Shopping Search API to fetch product data:
- **Endpoint:** `https://openapi.naver.com/v1/search/shop.json`
- **Auth:** X-Naver-Client-Id, X-Naver-Client-Secret headers
- **Docs:** https://developers.naver.com/docs/serviceapi/search/shopping/shopping.md

### API Response Structure

```json
{
  "lastBuildDate": "2024-01-21T09:00:00",
  "total": 666592,
  "start": 1,
  "display": 100,
  "items": [
    {
      "title": "<b>단백질</b> 파우더 1kg",    // May contain HTML tags
      "link": "https://smartstore.naver.com/main/products/4727021213",
      "image": "https://shopping-phinf.../image.jpg",
      "lprice": "25900",
      "hprice": "30000",
      "mallName": "헬시오",                   // ← Actual store identifier
      "productId": "82271542438",
      "productType": "2",                     // 1=catalog, 2=marketplace seller
      "brand": "...",
      "maker": "...",
      "category1": "...",
      "category2": "...",
      "category3": "...",
      "category4": "..."
    }
  ]
}
```

### Critical Discovery: URL vs mallName

**Problem:** Naver API returns product URLs like:
```
https://smartstore.naver.com/main/products/{productId}
```

The URL path is always `/main/products/...` - it does NOT contain the actual store ID!

**Solution:** Use `mallName` field as the store identifier:
- `mallName: "헬시오"` → Store ID: `헬시오`
- `mallName: "프로틴마켓"` → Store ID: `프로틴마켓`

### Data Flow

```
[User Input: "단백질 보충제, 쉐이커"]
         ↓
[Parse & Validate Keywords]
         ↓
[Parallel API Calls per Keyword]
    ├── Keyword 1: 3 pages × 100 items = 300 items
    └── Keyword 2: 3 pages × 100 items = 300 items
         ↓
[Filter: Keep only SmartStore products]
    - Check: productType === "2" OR URL matches smartstore/brand.naver.com
    - Skip: mallName === "네이버" (catalog products)
         ↓
[Group by mallName]
    - Key: mallName.toLowerCase().trim()
    - Value: { storeId, storeName, products[] }
         ↓
[Find Intersection]
    - Stores appearing in ALL keyword results
    - Merge products from each keyword
         ↓
[Return Results]
    - intersectionStores: SmartStore[]
    - keywordCount: number
    - totalStoresFound: number
```

### Search Strategy

**Naver API limits:**
- `display`: max 100 items per request
- `start`: max 1000 (start + display <= 1100)
- Daily limit: 25,000 calls

**Search Flow:**
```
1. Fetch products for each keyword (sim sort, 3 pages per keyword)
2. Filter SmartStore products only
3. Group products by store (mallName)
4. Calculate intersection (stores appearing in ALL keyword results)
5. Return results
```

**API Response includes search stats:**
```json
{
  "success": true,
  "data": {
    "intersectionStores": [...],
    "searchStats": {
      "apiCalls": 6,
      "pagesSearched": 6
    }
  }
}
```

### Store Identification Logic

```typescript
// lib/store-extractor.ts

// Check if product is from SmartStore (URL pattern only)
// Excludes other marketplaces like Coupang, 11st, Gmarket, etc.
function isSmartStoreProduct(item: NaverShoppingItem): boolean {
  // Only allow smartstore.naver.com or brand.naver.com URLs
  return /smartstore\.naver\.com/.test(item.link) ||
         /brand\.naver\.com/.test(item.link)
}

// Generate store ID from mall name
function generateStoreId(mallName: string): string {
  return mallName.trim().toLowerCase()
}

// Group products by store
function groupByStore(items, keyword): Map<string, SmartStore> {
  for (const item of items) {
    if (!isSmartStoreProduct(item)) continue
    if (!item.mallName || item.mallName === '네이버') continue

    const storeId = generateStoreId(item.mallName)
    // Add to store map...
  }
}
```

### Store Link Generation

Since URLs don't contain store IDs, we use Naver Shopping search:

```typescript
// components/store-card.tsx
const storeSearchUrl = `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(store.storeName)}`
```

---

## Component Specifications

### SearchForm Component

**Props:**
```typescript
interface SearchFormProps {
  onSearch: (keywords: string[]) => void
  isLoading: boolean
}
```

**Behavior:**
- Input accepts comma-separated keywords
- Trims whitespace from each keyword
- Validates minimum 2 keywords
- Shows validation error inline
- Disables submit while loading
- Enter key triggers search

**Example Input:** `"단백질 보충제, 쉐이커, 운동장갑"`

### StoreCard Component

**Props:**
```typescript
interface StoreCardProps {
  store: SmartStore
}
```

**Display:**
- Store name as card title
- Badge showing product count
- Products grouped by keyword
- Each product shows: image (40x40), title (truncated), price
- Click product to open in new tab
- Click store name to open store page

### SearchResults Component

**Props:**
```typescript
interface SearchResultsProps {
  stores: SmartStore[] | null
  isLoading: boolean
  error: string | null
  keywordCount: number
}
```

**States:**
1. **Idle:** Show instruction text
2. **Loading:** Show skeleton cards (3-6)
3. **Error:** Show alert with error message and retry button
4. **Empty:** Show "No stores found" message
5. **Results:** Show store cards in grid

---

## Caching Strategy

### Memory Cache (`lib/cache.ts`)

- **TTL:** 5 minutes default
- **Key format:** `naver:{keyword}:{display}:{start}`
- **Scope:** Per-server instance (not shared across instances)
- **Purpose:** Reduce Naver API calls for repeated searches

Example cache keys:
- `naver:단백질 보충제:100:1` (page 1)
- `naver:단백질 보충제:100:101` (page 2)
- `naver:쉐이커:100:1` (different keyword)

### Cache Operations

```typescript
class MemoryCache<T> {
  get(key: string): T | null
  set(key: string, data: T): void
  has(key: string): boolean
  delete(key: string): boolean
  clear(): void
  size(): number
}
```

---

## Error Handling

### API Errors

| Scenario | Response |
|----------|----------|
| Missing keywords | 400: "Keywords are required" |
| Less than 2 keywords | 400: "At least 2 keywords are required" |
| Empty keyword | 400: "Empty keywords are not allowed" |
| Naver API error | 500: "Naver API error: {details}" |
| Missing credentials | 500: "Naver API credentials not configured" |

### Frontend Errors

- Network errors: Show retry button
- API errors: Display error message from response
- Empty results: Show friendly "no results" message

---

## UI/UX Guidelines

### Layout
- Max width: 1200px centered
- Responsive grid: 1 col (mobile), 2 cols (tablet), 3 cols (desktop)
- Padding: 16px (mobile), 24px (desktop)

### Colors (Dark Mode Support)
- Background: CSS variable `--background`
- Foreground: CSS variable `--foreground`
- Primary: Blue tones for actions
- Error: Red tones for errors
- Success: Green tones for results

### Theme Support
- **System Detection**: Automatically follows OS theme preference
- **Manual Toggle**: "light / dark" text toggle in footer
- **Persistence**: Theme preference saved to localStorage
- **Provider**: next-themes with system support enabled

### Loading States
- Skeleton cards maintain layout
- Button shows spinner when loading
- Input disabled during search

---

## Testing Strategy

### Unit Tests

1. **store-extractor.test.ts**
   - URL parsing for all patterns
   - Edge cases (invalid URLs, missing paths)
   - HTML tag removal
   - Store grouping logic

2. **intersection.test.ts**
   - Empty input handling
   - Single keyword (returns all stores)
   - Multiple keywords (proper intersection)
   - Product merging across keywords

3. **cache.test.ts**
   - Basic CRUD operations
   - TTL expiration behavior
   - Concurrent access

### Manual Testing Checklist

- [x] Enter 2+ keywords and verify results
- [x] Check store cards display correctly
- [x] Verify product images load
- [x] Test external links open correctly
- [x] Test with Korean keywords (진간장 골드, 콘소메)
- [x] Test error states (API errors, validation)
- [x] Test responsive layout (mobile/tablet/desktop)
- [x] Test dark mode (auto theme switching)
- [x] Test shimmer loading animation
- [x] Test product deduplication (overlapping keywords)
- [x] Test cache effectiveness (repeat searches)
- [x] Test progressive search early termination

---

## Development Commands

```bash
# Start development server
npm run dev

# Run tests in watch mode
npm run test

# Run tests once (CI)
npm run test:run

# Lint code
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

---

## Deployment Notes

### Environment Variables (Required)
- `NAVER_CLIENT_ID` - Naver Developer App Client ID
- `NAVER_CLIENT_SECRET` - Naver Developer App Client Secret

### Build Verification
```bash
npm run lint && npm run test:run && npm run build
```

---

## Advanced Features

### Product Deduplication Across Keywords

**Problem**: Same product may appear in multiple keyword searches, causing duplicate display or lost keyword associations.

**Solution**: Use `keywords` array instead of single `keyword` string.

**Example**:
```
Product: "샘표 진간장 골드 500ml"
- Matches "진간장" search
- Matches "진간장 골드" search

Before (bug):
{
  keyword: "진간장"  // Lost "진간장 골드" association
}

After (fixed):
{
  keywords: ["진간장", "진간장 골드"]  // Preserves all matches
}
```

**Implementation** (`lib/store-extractor.ts`):
```typescript
export function mergeStoreProducts(
  existing: SmartStore,
  newStore: SmartStore,
): SmartStore {
  const productMap = new Map<string, StoreProduct>();

  // Build map from existing products
  for (const product of existing.products) {
    productMap.set(product.link, product);
  }

  // Merge new products
  for (const newProduct of newStore.products) {
    const existingProduct = productMap.get(newProduct.link);

    if (existingProduct) {
      // Same product - merge keywords
      for (const keyword of newProduct.keywords) {
        if (!existingProduct.keywords.includes(keyword)) {
          existingProduct.keywords.push(keyword);
        }
      }
    } else {
      // New product - add to map
      productMap.set(newProduct.link, newProduct);
    }
  }

  return {
    ...existing,
    products: Array.from(productMap.values()),
  };
}
```

**Display** (`components/store-card.tsx`):
```typescript
// Group products by keyword - product appears under all its keywords
const productsByKeyword = store.products.reduce((acc, product) => {
  for (const keyword of product.keywords) {
    if (!acc[keyword]) {
      acc[keyword] = [];
    }
    acc[keyword].push(product);
  }
  return acc;
}, {} as Record<string, typeof store.products>);
```

### Shimmer Loading Animation

Modern Facebook/LinkedIn-style shimmer effect for skeleton screens.

**Implementation** (`app/globals.css`):
```css
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
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

/* Dark mode adjustment */
.dark .animate-shimmer {
  background: linear-gradient(
    90deg,
    transparent 0%,
    oklch(1 0 0 / 10%) 50%,
    transparent 100%
  );
}
```

**Skeleton Component** (`components/ui/skeleton.tsx`):
```typescript
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
```

**Visual Effect**:
- Base: Gray background maintains skeleton structure
- Overlay: White shimmer wave moves left to right
- Duration: 2 seconds per cycle
- Light mode: 50% opacity white
- Dark mode: 10% opacity white


### Cache Key Structure

Format: `naver:{keyword}:{display}:{start}:sim`

**Examples**:
```typescript
// Page 1
"naver:진간장 골드:100:1:sim"

// Page 2
"naver:진간장 골드:100:101:sim"

// Different keyword
"naver:콘소메:100:1:sim"
```

**Benefits**:
- Same keyword + same page = Cache hit
- TTL: 5 minutes

---

## Performance Characteristics

### Search Time Analysis

**2 Keywords, 3 Pages Each**:

| Component | Time |
|-----------|------|
| API calls (6 total) | ~3-4s |
| Processing | ~0.5s |
| Total | ~4-5s |

*API response time: ~500ms each*

### Cache Effectiveness

**First Search**: 6 API calls (~4-5s)
**Repeated Search** (within 5 min): 0 API calls (~0.1-0.5s)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-21 | Initial release |
| | | - Smart store intersection search |
| | | - Product keyword deduplication |
| | | - Memory caching (5min TTL) |
| | | - Shimmer loading animation |
| | | - 44 tests passing |
| 1.1.0 | 2026-01-22 | Theme support and refinements |
| | | - Theme toggle component in footer |
| | | - System theme auto-detection + manual override |
| | | - Debug logging (development only) |
| | | - Accessibility improvements (keyboard navigation) |
| | | - Code cleanup (unused imports, console.log) |
| | | - 44 tests passing |
| 1.2.0 | 2026-01-22 | Simplified search strategy |
| | | - Changed to sim sort only (removed multi-sort) |
| | | - Use first product link for store access |
| | | - Improved store card design |
| | | - Removed scale effects for cleaner UI |

---

## References

- [Naver Shopping Search API](https://developers.naver.com/docs/serviceapi/search/shopping/shopping.md)
- [Next.js App Router](https://nextjs.org/docs/app)
- [shadcn/ui](https://ui.shadcn.com/)
- [SWR](https://swr.vercel.app/)
- [Pretendard Font](https://github.com/orioncactus/pretendard)

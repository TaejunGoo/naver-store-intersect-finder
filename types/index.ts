// Naver Shopping API Response Types
export interface NaverShoppingItem {
  title: string
  link: string
  image: string
  lprice: string
  hprice: string
  mallName: string
  productId: string
  productType: string
  brand: string
  maker: string
  category1: string
  category2: string
  category3: string
  category4: string
}

export interface NaverShoppingResponse {
  lastBuildDate: string
  total: number
  start: number
  display: number
  items: NaverShoppingItem[]
}

// Smart Store Types
export interface SmartStore {
  storeId: string
  storeName: string
  products: StoreProduct[]
}

export interface StoreProduct {
  title: string
  link: string
  image: string
  price: string
  keywords: string[] // Array of keywords that matched this product
}

// Search Types
export interface SearchRequest {
  keywords: string[]
  display?: number
}

export interface SearchResult {
  intersectionStores: SmartStore[]
  allStores: Map<string, SmartStore>
  keywordCount: number
}

export interface SearchStats {
  apiCalls: number
  pagesSearched: number
}

export interface SearchResponse {
  success: boolean
  data?: {
    intersectionStores: SmartStore[]
    keywordCount: number
    totalStoresFound: number
    searchStats?: SearchStats
  }
  error?: string
}

// API Error Types
export interface ApiError {
  code: string
  message: string
}

// Cache Types
export interface CacheEntry<T> {
  data: T
  timestamp: number
}

export interface CacheOptions {
  ttl: number // Time to live in milliseconds
}

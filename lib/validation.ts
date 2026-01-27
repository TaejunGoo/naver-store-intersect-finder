/**
 * Input validation utilities for search keywords
 */

// Validation rules
export const VALIDATION_RULES = {
  MIN_KEYWORDS: 2,
  MAX_KEYWORDS: 5,
  MAX_KEYWORD_LENGTH: 100,
  KEYWORD_PATTERN: /^[a-zA-Z0-9가-힣\s\-]+$/,
} as const;

export interface ValidationResult {
  valid: boolean;
  keywords?: string[];
  error?: string;
}

/**
 * Normalize a single keyword
 * - Trim whitespace
 * - Replace multiple spaces with single space
 */
function normalizeKeyword(keyword: string): string {
  return keyword
    .trim()
    .replace(/\s+/g, ' '); // Replace multiple spaces with single space
}

/**
 * Validate and normalize an array of keywords
 *
 * @param keywords - Raw keyword array from user input
 * @returns ValidationResult with cleaned keywords or error message
 */
export function validateKeywords(keywords: string[]): ValidationResult {
  // Check if keywords array exists
  if (!keywords || !Array.isArray(keywords)) {
    return {
      valid: false,
      error: '키워드는 배열 형식이어야 합니다',
    };
  }

  // Normalize all keywords
  const normalized = keywords
    .map((k) => normalizeKeyword(k))
    .filter((k) => k.length > 0); // Remove empty strings

  // Check minimum count
  if (normalized.length < VALIDATION_RULES.MIN_KEYWORDS) {
    return {
      valid: false,
      error: `키워드는 최소 ${VALIDATION_RULES.MIN_KEYWORDS}개 이상 입력해주세요`,
    };
  }

  // Check maximum count
  if (normalized.length > VALIDATION_RULES.MAX_KEYWORDS) {
    return {
      valid: false,
      error: `키워드는 최대 ${VALIDATION_RULES.MAX_KEYWORDS}개까지 입력 가능합니다`,
    };
  }

  // Validate each keyword
  for (const keyword of normalized) {
    // Check length
    if (keyword.length > VALIDATION_RULES.MAX_KEYWORD_LENGTH) {
      return {
        valid: false,
        error: `키워드는 ${VALIDATION_RULES.MAX_KEYWORD_LENGTH}자 이내로 입력해주세요 ("${keyword.substring(0, 20)}...")`,
      };
    }

    // Check pattern (한글, 영문, 숫자, 공백, 하이픈만 허용)
    if (!VALIDATION_RULES.KEYWORD_PATTERN.test(keyword)) {
      return {
        valid: false,
        error: `키워드에 특수문자를 사용할 수 없습니다 ("${keyword.substring(0, 20)}...")`,
      };
    }
  }

  // Remove duplicates (case-insensitive)
  const unique = Array.from(
    new Map(
      normalized.map((k) => [k.toLowerCase(), k]),
    ).values(),
  );

  // Check if we still have minimum keywords after deduplication
  if (unique.length < VALIDATION_RULES.MIN_KEYWORDS) {
    return {
      valid: false,
      error: `중복을 제거한 후 최소 ${VALIDATION_RULES.MIN_KEYWORDS}개 이상의 키워드가 필요합니다`,
    };
  }

  return {
    valid: true,
    keywords: unique,
  };
}

/**
 * Validate a single keyword (for real-time validation)
 *
 * @param keyword - Single keyword to validate
 * @returns Error message or null if valid
 */
export function validateSingleKeyword(keyword: string): string | null {
  const normalized = normalizeKeyword(keyword);

  if (normalized.length === 0) {
    return null; // Empty is ok for partial input
  }

  if (normalized.length > VALIDATION_RULES.MAX_KEYWORD_LENGTH) {
    return `키워드는 ${VALIDATION_RULES.MAX_KEYWORD_LENGTH}자 이내로 입력해주세요`;
  }

  if (!VALIDATION_RULES.KEYWORD_PATTERN.test(normalized)) {
    return '한글, 영문, 숫자, 공백, -만 사용 가능합니다';
  }

  return null;
}

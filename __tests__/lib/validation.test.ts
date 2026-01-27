import { describe, it, expect } from 'vitest';

import { validateKeywords, validateSingleKeyword, VALIDATION_RULES } from '@/lib/validation';

describe('Keyword Validation', () => {
  describe('validateKeywords', () => {
    describe('Valid Cases', () => {
      it('should accept valid Korean keywords', () => {
        const result = validateKeywords(['진간장', '간장']);
        expect(result.valid).toBe(true);
        expect(result.keywords).toEqual(['진간장', '간장']);
        expect(result.error).toBeUndefined();
      });

      it('should accept valid English keywords', () => {
        const result = validateKeywords(['soy sauce', 'sauce']);
        expect(result.valid).toBe(true);
        expect(result.keywords).toEqual(['soy sauce', 'sauce']);
      });

      it('should accept mixed Korean and English', () => {
        const result = validateKeywords(['진간장', 'soy sauce']);
        expect(result.valid).toBe(true);
        expect(result.keywords).toEqual(['진간장', 'soy sauce']);
      });

      it('should accept keywords with numbers', () => {
        const result = validateKeywords(['진간장 500ml', '간장 1L']);
        expect(result.valid).toBe(true);
        expect(result.keywords).toEqual(['진간장 500ml', '간장 1L']);
      });

      it('should accept keywords with hyphens', () => {
        const result = validateKeywords(['진간장-골드', '간장-프리미엄']);
        expect(result.valid).toBe(true);
        expect(result.keywords).toEqual(['진간장-골드', '간장-프리미엄']);
      });

      it('should accept maximum keywords (5)', () => {
        const result = validateKeywords(['k1', 'k2', 'k3', 'k4', 'k5']);
        expect(result.valid).toBe(true);
        expect(result.keywords).toHaveLength(5);
      });
    });

    describe('Normalization', () => {
      it('should trim whitespace', () => {
        const result = validateKeywords(['  진간장  ', '  간장  ']);
        expect(result.valid).toBe(true);
        expect(result.keywords).toEqual(['진간장', '간장']);
      });

      it('should normalize multiple spaces to single space', () => {
        const result = validateKeywords(['진간장   골드', '간장  프리미엄']);
        expect(result.valid).toBe(true);
        expect(result.keywords).toEqual(['진간장 골드', '간장 프리미엄']);
      });

      it('should remove empty keywords', () => {
        const result = validateKeywords(['진간장', '', '간장', '   ']);
        expect(result.valid).toBe(true);
        expect(result.keywords).toEqual(['진간장', '간장']);
      });

      it('should remove duplicate keywords (case-insensitive)', () => {
        const result = validateKeywords(['진간장', '진간장', '간장']);
        expect(result.valid).toBe(true);
        expect(result.keywords).toEqual(['진간장', '간장']);
      });

      it('should remove duplicate keywords with different cases', () => {
        const result = validateKeywords(['Soy Sauce', 'soy sauce', 'SOY SAUCE', '간장']);
        expect(result.valid).toBe(true);
        expect(result.keywords).toHaveLength(2);
        expect(result.keywords).toContain('간장');
      });
    });

    describe('Invalid Cases - Count', () => {
      it('should reject empty array', () => {
        const result = validateKeywords([]);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('최소 2개');
      });

      it('should reject single keyword', () => {
        const result = validateKeywords(['진간장']);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('최소 2개');
      });

      it('should reject too many keywords (>5)', () => {
        const result = validateKeywords(['k1', 'k2', 'k3', 'k4', 'k5', 'k6']);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('최대 5개');
      });

      it('should reject if less than 2 after deduplication', () => {
        const result = validateKeywords(['진간장', '진간장']);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('중복을 제거한 후');
      });
    });

    describe('Invalid Cases - Length', () => {
      it('should reject keyword exceeding max length', () => {
        const longKeyword = 'a'.repeat(VALIDATION_RULES.MAX_KEYWORD_LENGTH + 1);
        const result = validateKeywords([longKeyword, '간장']);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('100자 이내');
      });

      it('should accept keyword at max length', () => {
        const maxKeyword = 'a'.repeat(VALIDATION_RULES.MAX_KEYWORD_LENGTH);
        const result = validateKeywords([maxKeyword, '간장']);
        expect(result.valid).toBe(true);
      });
    });

    describe('Invalid Cases - Special Characters', () => {
      it('should reject keywords with < >', () => {
        const result = validateKeywords(['<script>', '간장']);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('특수문자');
      });

      it('should reject keywords with SQL injection attempts', () => {
        const result = validateKeywords(["'; DROP TABLE users; --", '간장']);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('특수문자');
      });

      it('should reject keywords with &', () => {
        const result = validateKeywords(['진간장&간장', '된장']);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('특수문자');
      });

      it('should reject keywords with quotes', () => {
        const result = validateKeywords(['"진간장"', '간장']);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('특수문자');
      });

      it('should reject keywords with parentheses', () => {
        const result = validateKeywords(['진간장(500ml)', '간장']);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('특수문자');
      });
    });

    describe('Edge Cases', () => {
      it('should reject null input', () => {
        const result = validateKeywords(null as any);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('배열');
      });

      it('should reject undefined input', () => {
        const result = validateKeywords(undefined as any);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('배열');
      });

      it('should reject non-array input', () => {
        const result = validateKeywords('not an array' as any);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('배열');
      });

      it('should reject all-empty keywords', () => {
        const result = validateKeywords(['', '   ', '\t']);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('최소 2개');
      });
    });
  });

  describe('validateSingleKeyword', () => {
    it('should return null for valid keyword', () => {
      expect(validateSingleKeyword('진간장')).toBeNull();
      expect(validateSingleKeyword('soy sauce')).toBeNull();
      expect(validateSingleKeyword('진간장-골드')).toBeNull();
    });

    it('should return null for empty keyword (partial input)', () => {
      expect(validateSingleKeyword('')).toBeNull();
      expect(validateSingleKeyword('   ')).toBeNull();
    });

    it('should return error for too long keyword', () => {
      const longKeyword = 'a'.repeat(VALIDATION_RULES.MAX_KEYWORD_LENGTH + 1);
      const error = validateSingleKeyword(longKeyword);
      expect(error).toContain('100자 이내');
    });

    it('should return error for invalid characters', () => {
      expect(validateSingleKeyword('<script>')).toContain('한글, 영문, 숫자');
      expect(validateSingleKeyword('진간장&간장')).toContain('한글, 영문, 숫자');
      expect(validateSingleKeyword('"진간장"')).toContain('한글, 영문, 숫자');
    });

    it('should normalize spaces before validation', () => {
      expect(validateSingleKeyword('  진간장  ')).toBeNull();
      expect(validateSingleKeyword('진간장   골드')).toBeNull();
    });
  });
});

/**
 * Tests for phone utility functions
 */
import { describe, expect, it } from 'vitest';

import {
  extractCountryCode,
  maskE164,
  normalizeToE164,
  phoneNumbersMatch,
  validateE164,
} from './phone';

describe('validateE164', () => {
  it('validates correct E.164 format', () => {
    expect(validateE164('+14155551234')).toBe(true);
    expect(validateE164('+442071234567')).toBe(true);
    expect(validateE164('+33123456789')).toBe(true);
    expect(validateE164('+12025550125')).toBe(true);
  });

  it('rejects invalid E.164 format', () => {
    expect(validateE164('4155551234')).toBe(false); // Missing +
    expect(validateE164('+14155')).toBe(false); // Too short (only 5 digits)
    expect(validateE164('+141555512345678901')).toBe(false); // Too long
    expect(validateE164('+0155551234')).toBe(false); // Starts with 0
    expect(validateE164('')).toBe(false); // Empty
    expect(validateE164('+1-415-555-1234')).toBe(false); // Has dashes
  });

  it('handles edge cases', () => {
    expect(validateE164('  +14155551234  ')).toBe(true); // Whitespace trimmed
  });
});

describe('maskE164', () => {
  it('masks phone numbers correctly with default visible digits', () => {
    expect(maskE164('+14155551234')).toBe('+1••••••••34');
    expect(maskE164('+442071234567')).toBe('+44••••••••67'); // 13 total - 3 prefix - 2 visible = 8 bullets
  });

  it('masks phone numbers with custom visible digits', () => {
    expect(maskE164('+14155551234', 3)).toBe('+1•••••••234');
    expect(maskE164('+14155551234', 4)).toBe('+1••••••1234');
    expect(maskE164('+442071234567', 4)).toBe('+44••••••4567');
  });

  it('returns placeholder for null/undefined', () => {
    expect(maskE164(null)).toBe('—');
    expect(maskE164(undefined)).toBe('—');
  });

  it('returns original string if not valid E.164', () => {
    expect(maskE164('4155551234')).toBe('4155551234');
    expect(maskE164('invalid')).toBe('invalid');
  });
});

describe('normalizeToE164', () => {
  it('normalizes US phone numbers', () => {
    expect(normalizeToE164('(415) 555-1234')).toBe('+14155551234');
    expect(normalizeToE164('415-555-1234')).toBe('+14155551234');
    expect(normalizeToE164('415.555.1234')).toBe('+14155551234');
    expect(normalizeToE164('4155551234')).toBe('+14155551234');
  });

  it('preserves already formatted E.164 numbers', () => {
    expect(normalizeToE164('+14155551234')).toBe('+14155551234');
    expect(normalizeToE164('+442071234567')).toBe('+442071234567');
  });

  it('adds custom country code', () => {
    expect(normalizeToE164('2071234567', '44')).toBe('+442071234567');
    expect(normalizeToE164('123456789', '33')).toBe('+33123456789');
  });

  it('returns null for invalid numbers', () => {
    expect(normalizeToE164('')).toBe(null);
    expect(normalizeToE164('123')).toBe(null); // Too short
    expect(normalizeToE164('abc')).toBe(null); // Non-numeric
  });

  it('handles edge cases', () => {
    expect(normalizeToE164('  (415) 555-1234  ')).toBe('+14155551234');
  });
});

describe('extractCountryCode', () => {
  it('extracts single-digit country codes', () => {
    expect(extractCountryCode('+14155551234')).toBe('1');
  });

  it('extracts two-digit country codes', () => {
    expect(extractCountryCode('+442071234567')).toBe('44');
    expect(extractCountryCode('+33123456789')).toBe('33');
  });

  it('extracts three-digit country codes', () => {
    // Example: +358 for Finland
    expect(extractCountryCode('+358401234567')).toBe('358');
  });

  it('returns null for invalid numbers', () => {
    expect(extractCountryCode('4155551234')).toBe(null);
    expect(extractCountryCode('+0155551234')).toBe(null);
    expect(extractCountryCode('')).toBe(null);
  });
});

describe('phoneNumbersMatch', () => {
  it('matches numbers with different formatting', () => {
    expect(phoneNumbersMatch('+14155551234', '(415) 555-1234')).toBe(true);
    expect(phoneNumbersMatch('+14155551234', '415-555-1234')).toBe(true);
    expect(phoneNumbersMatch('+14155551234', '4155551234')).toBe(true);
  });

  it('returns false for different numbers', () => {
    expect(phoneNumbersMatch('+14155551234', '+14155559999')).toBe(false);
    expect(phoneNumbersMatch('+14155551234', '+442071234567')).toBe(false);
  });

  it('handles null/undefined', () => {
    expect(phoneNumbersMatch(null, '+14155551234')).toBe(false);
    expect(phoneNumbersMatch('+14155551234', null)).toBe(false);
    expect(phoneNumbersMatch(undefined, '+14155551234')).toBe(false);
    expect(phoneNumbersMatch(null, null)).toBe(false);
  });

  it('returns false for invalid formats', () => {
    expect(phoneNumbersMatch('invalid', '+14155551234')).toBe(false);
    expect(phoneNumbersMatch('+14155551234', 'invalid')).toBe(false);
  });
});

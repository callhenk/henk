import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  formatDate,
  formatRelativeTime,
  formatPhoneNumber,
  formatDuration,
  truncateText,
  capitalize,
  formatNumber,
} from './formatting';

describe('formatDate', () => {
  it('formats a valid ISO date string', () => {
    const result = formatDate('2025-01-15T10:30:00Z');
    expect(result).toMatch(/1\/15\/2025/);
  });

  it('returns "N/A" for null input', () => {
    expect(formatDate(null)).toBe('N/A');
  });

  it('returns "Invalid Date" for invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('Invalid Date');
  });

  it('accepts custom date format options', () => {
    const result = formatDate('2025-01-15', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    expect(result).toContain('January');
    expect(result).toContain('15');
    expect(result).toContain('2025');
  });
});

describe('formatRelativeTime', () => {
  beforeEach(() => {
    // Mock current time to 2025-01-15 12:00:00
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T12:00:00Z'));
  });

  it('returns "Just now" for very recent times', () => {
    const justNow = new Date('2025-01-15T12:00:00Z').toISOString();
    expect(formatRelativeTime(justNow)).toBe('Just now');
  });

  it('formats minutes correctly', () => {
    const oneMinuteAgo = new Date('2025-01-15T11:59:00Z').toISOString();
    expect(formatRelativeTime(oneMinuteAgo)).toBe('1 minute ago');

    const fiveMinutesAgo = new Date('2025-01-15T11:55:00Z').toISOString();
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
  });

  it('formats hours correctly', () => {
    const oneHourAgo = new Date('2025-01-15T11:00:00Z').toISOString();
    expect(formatRelativeTime(oneHourAgo)).toBe('1 hour ago');

    const twoHoursAgo = new Date('2025-01-15T10:00:00Z').toISOString();
    expect(formatRelativeTime(twoHoursAgo)).toBe('2 hours ago');
  });

  it('formats days correctly', () => {
    const oneDayAgo = new Date('2025-01-14T12:00:00Z').toISOString();
    expect(formatRelativeTime(oneDayAgo)).toBe('1 day ago');

    const threeDaysAgo = new Date('2025-01-12T12:00:00Z').toISOString();
    expect(formatRelativeTime(threeDaysAgo)).toBe('3 days ago');
  });

  it('falls back to formatDate for dates older than a week', () => {
    const oldDate = new Date('2024-12-01T12:00:00Z').toISOString();
    const result = formatRelativeTime(oldDate);
    expect(result).toMatch(/12\/1\/2024/);
  });

  it('returns "N/A" for null input', () => {
    expect(formatRelativeTime(null)).toBe('N/A');
  });

  it('returns "Invalid Date" for invalid date string', () => {
    expect(formatRelativeTime('invalid')).toBe('Invalid Date');
  });
});

describe('formatPhoneNumber', () => {
  it('formats 10-digit US phone numbers', () => {
    expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
    expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
  });

  it('formats 11-digit numbers starting with 1', () => {
    expect(formatPhoneNumber('15551234567')).toBe('+1 (555) 123-4567');
  });

  it('handles phone numbers with formatting characters', () => {
    expect(formatPhoneNumber('(555) 123-4567')).toBe('(555) 123-4567');
    expect(formatPhoneNumber('+1 555-123-4567')).toBe('+1 (555) 123-4567');
    expect(formatPhoneNumber('555.123.4567')).toBe('(555) 123-4567');
  });

  it('returns original string for non-standard formats', () => {
    expect(formatPhoneNumber('123')).toBe('123');
    expect(formatPhoneNumber('+44 20 1234 5678')).toBe('+44 20 1234 5678');
  });

  it('returns "N/A" for null input', () => {
    expect(formatPhoneNumber(null)).toBe('N/A');
  });

  it('handles empty string', () => {
    expect(formatPhoneNumber('')).toBe('N/A');
  });
});

describe('formatDuration', () => {
  it('formats seconds only', () => {
    expect(formatDuration(30)).toBe('30s');
    expect(formatDuration(45)).toBe('45s');
  });

  it('formats minutes and seconds', () => {
    expect(formatDuration(90)).toBe('1m 30s');
    expect(formatDuration(125)).toBe('2m 5s');
  });

  it('formats hours, minutes, and seconds', () => {
    expect(formatDuration(3665)).toBe('1h 1m 5s');
    expect(formatDuration(7200)).toBe('2h');
  });

  it('omits zero values appropriately', () => {
    expect(formatDuration(60)).toBe('1m');
    expect(formatDuration(3600)).toBe('1h');
    expect(formatDuration(3660)).toBe('1h 1m');
  });

  it('returns "0s" for zero or null', () => {
    expect(formatDuration(0)).toBe('0s');
    expect(formatDuration(null)).toBe('0s');
  });

  it('handles large durations', () => {
    const oneDay = 86400; // 24 hours in seconds
    expect(formatDuration(oneDay)).toBe('24h');
  });
});

describe('truncateText', () => {
  it('truncates text longer than maxLength', () => {
    const longText = 'This is a very long text that should be truncated';
    expect(truncateText(longText, 20)).toBe('This is a very long ...');
  });

  it('returns original text if shorter than maxLength', () => {
    const shortText = 'Short text';
    expect(truncateText(shortText, 20)).toBe('Short text');
  });

  it('uses default maxLength of 50', () => {
    const text = 'a'.repeat(60);
    const result = truncateText(text);
    expect(result).toHaveLength(53); // 50 + '...'
    expect(result.endsWith('...')).toBe(true);
  });

  it('handles exact length match', () => {
    const text = 'a'.repeat(50);
    expect(truncateText(text, 50)).toBe(text);
  });

  it('returns empty string for null', () => {
    expect(truncateText(null)).toBe('');
  });

  it('handles empty string', () => {
    expect(truncateText('')).toBe('');
  });
});

describe('capitalize', () => {
  it('capitalizes first letter of lowercase string', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('world')).toBe('World');
  });

  it('lowercases rest of string', () => {
    expect(capitalize('HELLO')).toBe('Hello');
    expect(capitalize('HeLLo')).toBe('Hello');
  });

  it('handles single character', () => {
    expect(capitalize('a')).toBe('A');
    expect(capitalize('Z')).toBe('Z');
  });

  it('handles already capitalized strings', () => {
    expect(capitalize('Hello')).toBe('Hello');
  });

  it('returns empty string for null', () => {
    expect(capitalize(null)).toBe('');
  });

  it('handles empty string', () => {
    expect(capitalize('')).toBe('');
  });
});

describe('formatNumber', () => {
  it('formats numbers with thousands separator', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1000000)).toBe('1,000,000');
    expect(formatNumber(12345678)).toBe('12,345,678');
  });

  it('handles small numbers without separator', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(100)).toBe('100');
    expect(formatNumber(999)).toBe('999');
  });

  it('handles decimal numbers', () => {
    expect(formatNumber(1234.56)).toBe('1,234.56');
    expect(formatNumber(0.99)).toBe('0.99');
  });

  it('handles negative numbers', () => {
    expect(formatNumber(-1000)).toBe('-1,000');
    expect(formatNumber(-12345)).toBe('-12,345');
  });

  it('returns "N/A" for null', () => {
    expect(formatNumber(null)).toBe('N/A');
  });
});

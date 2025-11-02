/**
 * Phone number utility functions for validation, formatting, and masking
 */

import { E164_REGEX, PHONE_DISPLAY_VISIBLE_DIGITS } from '../constants/phone-numbers';

/**
 * Validate if a phone number matches E.164 format
 * @param phone - Phone number string to validate
 * @returns true if valid E.164 format, false otherwise
 * @example
 * validateE164('+14155551234') // true
 * validateE164('4155551234') // false
 */
export function validateE164(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.trim();
  return E164_REGEX.test(cleaned);
}

/**
 * Mask an E.164 phone number for privacy
 * Shows only country code and last N digits
 * @param phone - E.164 phone number string
 * @param visibleDigits - Number of digits to show at the end (default: 2)
 * @returns Masked phone number or original if invalid
 * @example
 * maskE164('+14155551234') // '+1••••••••34'
 * maskE164('+442071234567', 3) // '+44•••••••567'
 */
export function maskE164(
  phone?: string | null,
  visibleDigits: number = PHONE_DISPLAY_VISIBLE_DIGITS
): string {
  if (!phone) return '—';

  // Validate E.164 format
  if (!validateE164(phone)) {
    return phone; // Return as-is if not valid E.164
  }

  const visible = phone.slice(-visibleDigits);
  const countryCodeEnd = phone.indexOf(phone.match(/\d{2,3}/)?.[0] || '') + 2;
  const prefix = phone.slice(0, countryCodeEnd);
  const maskedLength = phone.length - prefix.length - visibleDigits;

  return `${prefix}${'•'.repeat(maskedLength)}${visible}`;
}

/**
 * Normalize phone number to E.164 format
 * Removes spaces, dashes, parentheses and adds + if missing
 * @param phone - Phone number in any format
 * @param defaultCountryCode - Country code to use if none provided (default: '1' for US)
 * @returns E.164 formatted phone number or null if invalid
 * @example
 * normalizeToE164('(415) 555-1234') // '+14155551234'
 * normalizeToE164('4155551234', '1') // '+14155551234'
 */
export function normalizeToE164(
  phone: string,
  defaultCountryCode = '1'
): string | null {
  if (!phone) return null;

  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // If it already has +, validate and return
  if (cleaned.startsWith('+')) {
    return validateE164(cleaned) ? cleaned : null;
  }

  // Add default country code if missing
  const withCountryCode = `+${defaultCountryCode}${cleaned}`;

  return validateE164(withCountryCode) ? withCountryCode : null;
}

/**
 * Extract country code from E.164 phone number
 * @param phone - E.164 phone number
 * @returns Country code (e.g., '1', '44', '33') or null if invalid
 * @example
 * extractCountryCode('+14155551234') // '1'
 * extractCountryCode('+442071234567') // '44'
 */
export function extractCountryCode(phone: string): string | null {
  if (!validateE164(phone)) return null;

  // Extract digits after +
  const digits = phone.slice(1);

  // Country codes are 1-3 digits
  // Try 3 digits first, then 2, then 1
  for (let len = 3; len >= 1; len--) {
    const code = digits.slice(0, len);
    // Simple validation: codes should start with non-zero
    if (code[0] !== '0') {
      return code;
    }
  }

  return null;
}

/**
 * Check if two phone numbers are the same (ignoring formatting)
 * @param phone1 - First phone number
 * @param phone2 - Second phone number
 * @returns true if the numbers match when normalized
 * @example
 * phoneNumbersMatch('+14155551234', '(415) 555-1234') // true
 */
export function phoneNumbersMatch(
  phone1: string | null | undefined,
  phone2: string | null | undefined
): boolean {
  if (!phone1 || !phone2) return false;

  const normalized1 = normalizeToE164(phone1);
  const normalized2 = normalizeToE164(phone2);

  return normalized1 !== null && normalized1 === normalized2;
}

/**
 * Phone number utility functions for validation, formatting, and masking
 */
import {
  E164_REGEX,
  PHONE_DISPLAY_VISIBLE_DIGITS,
} from '../constants/phone-numbers';

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
  visibleDigits: number = PHONE_DISPLAY_VISIBLE_DIGITS,
): string {
  if (!phone) return '—';

  // Validate E.164 format
  if (!validateE164(phone)) {
    return phone; // Return as-is if not valid E.164
  }

  const countryCode = extractCountryCode(phone);
  if (!countryCode) return phone;

  const visible = phone.slice(-visibleDigits);
  const prefix = `+${countryCode}`;
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
  defaultCountryCode = '1',
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

  // Known single-digit country codes (NANP)
  if (digits[0] === '1') {
    return '1';
  }

  // Known two-digit country codes (Europe, Asia, etc.)
  const twoDigit = digits.slice(0, 2);
  const commonTwoDigitCodes = [
    '20',
    '27',
    '30',
    '31',
    '32',
    '33',
    '34',
    '36',
    '39',
    '40',
    '41',
    '43',
    '44',
    '45',
    '46',
    '47',
    '48',
    '49',
    '51',
    '52',
    '53',
    '54',
    '55',
    '56',
    '57',
    '58',
    '60',
    '61',
    '62',
    '63',
    '64',
    '65',
    '66',
    '81',
    '82',
    '84',
    '86',
    '90',
    '91',
    '92',
    '93',
    '94',
    '95',
    '98',
  ];

  if (commonTwoDigitCodes.includes(twoDigit)) {
    return twoDigit;
  }

  // Three-digit country codes (less common)
  const threeDigit = digits.slice(0, 3);
  const commonThreeDigitCodes = [
    '212',
    '213',
    '216',
    '218',
    '220',
    '221',
    '222',
    '223',
    '224',
    '225',
    '226',
    '227',
    '228',
    '229',
    '230',
    '231',
    '232',
    '233',
    '234',
    '235',
    '236',
    '237',
    '238',
    '239',
    '240',
    '241',
    '242',
    '243',
    '244',
    '245',
    '246',
    '247',
    '248',
    '249',
    '250',
    '251',
    '252',
    '253',
    '254',
    '255',
    '256',
    '257',
    '258',
    '260',
    '261',
    '262',
    '263',
    '264',
    '265',
    '266',
    '267',
    '268',
    '269',
    '290',
    '291',
    '297',
    '298',
    '299',
    '350',
    '351',
    '352',
    '353',
    '354',
    '355',
    '356',
    '357',
    '358',
    '359',
    '370',
    '371',
    '372',
    '373',
    '374',
    '375',
    '376',
    '377',
    '378',
    '380',
    '381',
    '382',
    '383',
    '385',
    '386',
    '387',
    '389',
    '420',
    '421',
    '423',
    '500',
    '501',
    '502',
    '503',
    '504',
    '505',
    '506',
    '507',
    '508',
    '509',
    '590',
    '591',
    '592',
    '593',
    '594',
    '595',
    '596',
    '597',
    '598',
    '599',
    '670',
    '672',
    '673',
    '674',
    '675',
    '676',
    '677',
    '678',
    '679',
    '680',
    '681',
    '682',
    '683',
    '684',
    '685',
    '686',
    '687',
    '688',
    '689',
    '690',
    '691',
    '692',
    '850',
    '852',
    '853',
    '855',
    '856',
    '870',
    '878',
    '880',
    '882',
    '883',
    '886',
    '888',
    '960',
    '961',
    '962',
    '963',
    '964',
    '965',
    '966',
    '967',
    '968',
    '970',
    '971',
    '972',
    '973',
    '974',
    '975',
    '976',
    '977',
    '992',
    '993',
    '994',
    '995',
    '996',
    '998',
  ];

  if (commonThreeDigitCodes.includes(threeDigit)) {
    return threeDigit;
  }

  // Default to single digit if we can't determine
  return digits[0] ?? null;
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
  phone2: string | null | undefined,
): boolean {
  if (!phone1 || !phone2) return false;

  const normalized1 = normalizeToE164(phone1);
  const normalized2 = normalizeToE164(phone2);

  return normalized1 !== null && normalized1 === normalized2;
}

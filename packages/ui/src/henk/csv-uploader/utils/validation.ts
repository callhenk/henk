import type {
  CSVRow,
  CSVUploaderConfig,
  FileValidationResult,
  ValidationError,
} from '../types';

/**
 * Normalizes phone number to E164 format
 */
export function toE164(phone: string): string | null {
  const digits = phone.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) {
    const rest = digits.slice(1).replace(/\D/g, '');
    if (rest.length >= 8 && rest.length <= 15) return `+${rest}`;
    return null;
  }
  const only = digits.replace(/\D/g, '');
  // naive inference: US 10-digit → +1
  if (only.length === 10) return `+1${only}`;
  // otherwise unknown
  return null;
}

/**
 * Validates phone numbers using E164 normalization
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  return toE164(phone) !== null;
}

/**
 * Normalizes whitespace in strings
 */
export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

/**
 * Enhanced email validation using basic RFC check
 */
export function basicEmailValid(email: string): boolean {
  return /.+@.+\..+/.test(email);
}

/**
 * Validates email addresses using RFC-compliant regex
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates a file before parsing
 */
export function validateFile(
  file: File,
  config: CSVUploaderConfig,
): FileValidationResult {
  // Check if file exists
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  // Check file size
  if (file.size === 0) {
    return {
      valid: false,
      error: 'The selected file is empty. Please choose a valid CSV file.',
    };
  }

  const maxSize = config.maxFileSize ?? 10 * 1024 * 1024; // Default 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds the maximum limit of ${formatFileSize(maxSize)}. Please reduce the file size or split it into smaller files.`,
    };
  }

  // Check file extension
  const allowedExtensions = config.allowedExtensions ?? ['.csv'];
  const hasValidExtension = allowedExtensions.some((ext) =>
    file.name.toLowerCase().endsWith(ext.toLowerCase()),
  );

  // Check MIME type
  const allowedMimeTypes = config.allowedMimeTypes ?? [
    'text/csv',
    'application/csv',
    'text/plain',
  ];
  const hasValidMimeType =
    allowedMimeTypes.includes(file.type) || file.type === '';

  if (!hasValidExtension && !hasValidMimeType) {
    return {
      valid: false,
      error: `Invalid file format. Please select a file with one of these extensions: ${allowedExtensions.join(', ')}.`,
    };
  }

  return { valid: true };
}

/**
 * Validates CSV data against configuration rules
 */
export function validateCSVData<T extends CSVRow>(
  data: T[],
  config: CSVUploaderConfig,
  customValidator?: (data: T[]) => ValidationError[],
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Run custom validation first if provided
  if (customValidator) {
    errors.push(...customValidator(data));
  }

  // Validate required fields
  const requiredFields = config.requiredFields ?? [];

  data.forEach((row, index) => {
    const rowNumber = index + 2; // +2 because index is 0-based and we skip header

    // Check required fields
    requiredFields.forEach((field) => {
      const value = row[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors.push({
          row: rowNumber,
          field,
          message: `${field} is required`,
          severity: 'error',
        });
      }
    });

    // Validate specific field types
    if (row.phone) {
      const phoneStr = String(row.phone).trim();
      if (phoneStr && !validatePhone(phoneStr)) {
        errors.push({
          row: rowNumber,
          field: 'phone',
          message: 'Invalid phone number format',
          severity: 'error',
        });
      }
    }

    if (row.email) {
      const emailStr = String(row.email).trim();
      if (emailStr && !validateEmail(emailStr)) {
        errors.push({
          row: rowNumber,
          field: 'email',
          message: 'Invalid email format',
          severity: 'warning',
        });
      }
    }
  });

  return errors;
}

/**
 * Cleans and normalizes CSV row data
 */
export function cleanCSVRow(row: CSVRow): CSVRow {
  const cleaned: CSVRow = {};

  Object.keys(row).forEach((key) => {
    const value = row[key];

    if (value === null || value === undefined) {
      cleaned[key] = null;
      return;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      cleaned[key] = trimmed === '' ? null : trimmed;
    } else {
      cleaned[key] = value;
    }
  });

  return cleaned;
}

/**
 * Maps CSV headers to standardized field names
 */
export function mapHeaders(
  headers: string[],
  fieldMappings: Record<string, string[]>,
): Record<string, string> {
  const mapping: Record<string, string> = {};
  const lowerHeaders = headers.map((h) => h.toLowerCase().trim());

  Object.entries(fieldMappings).forEach(([standardField, possibleNames]) => {
    const possibleNamesLower = possibleNames.map((name) => name.toLowerCase());

    for (const possibleName of possibleNamesLower) {
      const index = lowerHeaders.indexOf(possibleName);
      if (index !== -1) {
        mapping[standardField] = headers[index] ?? '';
        break;
      }
    }
  });

  return mapping;
}

/**
 * Auto-infers field mapping from CSV headers
 */
export function autoInferMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const lower = headers.map((h) => h.toLowerCase());

  const pick = (candidates: string[]) => {
    for (const c of candidates) {
      const idx = lower.indexOf(c);
      if (idx !== -1) return headers[idx];
    }
    return undefined;
  };

  // Core mappings based on AudienceImportCard patterns
  const nameField = pick(['name', 'full_name']);
  const firstNameField = pick(['first_name', 'firstname']);
  const lastNameField = pick(['last_name', 'lastname']);

  // Use name field if available, otherwise combine first/last
  if (nameField) {
    mapping.name = nameField;
  } else if (firstNameField && lastNameField) {
    mapping.first_name = firstNameField;
    mapping.last_name = lastNameField;
  }

  mapping.phone = pick(['phone', 'phone_number', 'mobile']) ?? '';
  mapping.email = pick(['email', 'e-mail']) ?? '';
  mapping.timezone = pick(['timezone', 'time_zone', 'tz']) ?? '';
  mapping.company = pick(['company', 'organization']) ?? '';
  mapping.status = pick(['status']) ?? '';
  mapping.dnc = pick(['dnc', 'do_not_call']) ?? '';
  mapping.notes = pick(['notes', 'note']) ?? '';
  mapping.last_contact_date =
    pick(['last_contact_date', 'last_contacted', 'last_contact']) ?? '';
  mapping.attempts = pick(['attempts']) ?? '';
  mapping.pledged_amount =
    pick(['pledged_amount', 'pledged', 'Pledged', 'Pledged Amount']) ?? '';
  mapping.donated_amount =
    pick(['donated_amount', 'donated', 'Donated', 'Donated Amount']) ?? '';
  mapping.opt_in = pick(['opt_in', 'optin', 'subscribed']) ?? '';

  return mapping;
}

/**
 * Safely parses numbers from various formats
 */
export function parseNumberSafe(value: unknown): number | null {
  if (value == null) return null;
  const s = String(value).replace(/[$,\s]/g, '');
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/**
 * Flexibly parses boolean values
 */
export function parseBooleanFlexible(value: unknown): boolean | null {
  if (value == null) return null;
  const s = String(value).trim().toLowerCase();
  if (['true', 'yes', '1'].includes(s)) return true;
  if (['false', 'no', '0'].includes(s)) return false;
  return null;
}

/**
 * Parses ISO date strings safely
 */
export function parseISODate(value: unknown): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  // Allow YYYY-MM-DD or ISO datetime
  const guess = /\d{4}-\d{2}-\d{2}(?:[T\s].*)?/.test(s) ? new Date(s) : null;
  if (guess && !Number.isNaN(guess.getTime())) return guess.toISOString();
  return null;
}

/**
 * Removes duplicate rows based on specified fields
 */
export function deduplicateRows<T extends CSVRow>(
  data: T[],
  dedupeFields: string[],
): { data: T[]; duplicatesRemoved: number } {
  if (dedupeFields.length === 0) {
    return { data, duplicatesRemoved: 0 };
  }

  const seen = new Set<string>();
  const uniqueData: T[] = [];
  let duplicatesRemoved = 0;

  for (const row of data) {
    // Create a key from the dedupe fields
    const key = dedupeFields
      .map((field) =>
        String(row[field] || '')
          .trim()
          .toLowerCase(),
      )
      .join('|');

    if (seen.has(key)) {
      duplicatesRemoved++;
      continue;
    }

    seen.add(key);
    uniqueData.push(row);
  }

  return { data: uniqueData, duplicatesRemoved };
}

/**
 * Enhanced deduplication by phone with E164 normalization
 */
export function deduplicateByPhone<T extends CSVRow>(
  data: T[],
): { data: T[]; duplicatesRemoved: number } {
  const seen = new Set<string>();
  const uniqueData: T[] = [];
  let duplicatesRemoved = 0;

  for (const row of data) {
    const phoneRaw = String(row.phone || '').trim();
    const phoneE164 = toE164(phoneRaw);
    const key = phoneE164 ?? phoneRaw;

    if (!key) {
      uniqueData.push(row);
      continue;
    }

    if (seen.has(key)) {
      duplicatesRemoved++;
      continue;
    }

    seen.add(key);
    uniqueData.push(row);
  }

  return { data: uniqueData, duplicatesRemoved };
}

/**
 * Formats file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Sanitizes CSV data to prevent common issues
 */
export function sanitizeCSVData<T extends CSVRow>(data: T[]): T[] {
  return data.map((row) => {
    const sanitized = { ...row };

    Object.keys(sanitized).forEach((key) => {
      const value = sanitized[key];

      if (typeof value === 'string') {
        // Remove potentially harmful characters and normalize whitespace

        (sanitized as Record<string, unknown>)[key] = value
          .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '') // Remove control characters
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
      }
    });

    return sanitized;
  });
}

/**
 * Validates row count against configuration limits
 */
export function validateRowCount(
  rowCount: number,
  config: CSVUploaderConfig,
): FileValidationResult {
  const maxRows = config.maxRows ?? 50000;

  if (rowCount > maxRows) {
    return {
      valid: false,
      error: `File contains ${rowCount.toLocaleString()} rows, which exceeds the maximum limit of ${maxRows.toLocaleString()}. Please split the file into smaller chunks.`,
    };
  }

  return { valid: true };
}

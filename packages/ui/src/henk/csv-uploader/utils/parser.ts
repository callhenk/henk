import Papa from 'papaparse';

import type {
  CSVRow,
  CSVUploaderConfig,
  ParseResult,
  ValidationError,
} from '../types';
import {
  cleanCSVRow,
  deduplicateRows,
  mapHeaders,
  sanitizeCSVData,
  validateCSVData,
  validateRowCount,
} from './validation';

/**
 * Safely parses a CSV file with comprehensive error handling and timeout protection
 */
export async function parseCSVFile<T extends CSVRow>(
  file: File,
  config: CSVUploaderConfig,
  customValidator?: (data: T[]) => ValidationError[],
): Promise<ParseResult<T>> {
  const startTime = Date.now();
  const parseTimeout = config.parseTimeout ?? 30000; // Default 30 seconds

  return new Promise((resolve) => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let isResolved = false;

    const resolveOnce = (result: ParseResult<T>) => {
      if (isResolved) return;
      isResolved = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
      resolve(result);
    };

    // Set timeout for parsing
    timeoutId = setTimeout(() => {
      resolveOnce({
        error:
          'CSV parsing timed out. The file may be too large or corrupted. Please try with a smaller file or check the file format.',
      });
    }, parseTimeout);

    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false, // Keep all values as strings to prevent type conversion issues
        transformHeader: (header: string) => header.trim(), // Clean headers
        worker: file.size > 1024 * 1024, // Use web worker for files > 1MB
        complete: (results) => {
          try {
            const parseTime = Date.now() - startTime;

            // Validate results structure
            if (!results || typeof results !== 'object') {
              resolveOnce({
                error:
                  'Invalid CSV parsing result. Please check the file format.',
              });
              return;
            }

            // Check for parsing errors
            if (results.errors && results.errors.length > 0) {
              const criticalErrors = results.errors.filter(
                (err) => err.type === 'Delimiter' || err.type === 'Quotes',
              );

              if (criticalErrors.length > 0) {
                const errorMessages = criticalErrors
                  .slice(0, 3)
                  .map((err) => `Row ${err.row}: ${err.message}`)
                  .join('; ');
                resolveOnce({
                  error: `Critical CSV parsing errors detected: ${errorMessages}${criticalErrors.length > 3 ? '...' : ''}. Please check your file format.`,
                });
                return;
              }

              // Non-critical errors become warnings
              const warnings: ValidationError[] = results.errors
                .slice(0, 10) // Limit warnings
                .map((err) => ({
                  row: err.row || 0,
                  field: 'parsing',
                  message: err.message,
                  severity: 'warning' as const,
                }));
            }

            // Validate data array
            if (!Array.isArray(results.data)) {
              resolveOnce({
                error:
                  'Invalid CSV data format. Please ensure your file has proper CSV structure.',
              });
              return;
            }

            // Check row count
            const rowCountValidation = validateRowCount(
              results.data.length,
              config,
            );
            if (!rowCountValidation.valid) {
              resolveOnce({ error: rowCountValidation.error });
              return;
            }

            // Process the data
            const processedResult = processCSVData<T>(
              results.data,
              config,
              customValidator,
            );

            if (processedResult.error) {
              resolveOnce(processedResult);
              return;
            }

            resolveOnce({
              ...processedResult,
              metadata: {
                totalRows: processedResult.metadata?.totalRows ?? 0,
                validRows: processedResult.metadata?.validRows ?? 0,
                duplicatesRemoved: processedResult.metadata?.duplicatesRemoved ?? 0,
                parseTime,
              },
            });
          } catch (error) {
            resolveOnce({
              error: `Error processing CSV data: ${error instanceof Error ? error.message : 'Unknown error'}`,
            });
          }
        },
        error: (error: any) => {
          resolveOnce({
            error: `CSV parsing failed: ${error.message || 'Unknown parsing error'}. Please check that your file is a valid CSV format.`,
          });
        },
      });
    } catch (error) {
      resolveOnce({
        error: `Failed to start CSV parsing: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  });
}

/**
 * Processes parsed CSV data with cleaning, validation, and deduplication
 */
function processCSVData<T extends CSVRow>(
  rawData: unknown[],
  config: CSVUploaderConfig,
  customValidator?: (data: T[]) => ValidationError[],
): ParseResult<T> {
  try {
    // Convert to CSVRow format and clean
    const cleanedData: T[] = [];

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i] as Record<string, unknown>;

      // Skip completely empty rows
      if (!row || Object.keys(row).every((key) => !row[key])) {
        continue;
      }

      // Clean the row
      const cleanRow = cleanCSVRow(row) as T;

      // Apply field mappings if configured
      if (
        config.fieldMappings &&
        Object.keys(config.fieldMappings).length > 0
      ) {
        const mappedRow = applyFieldMappings(cleanRow, config.fieldMappings);
        cleanedData.push(mappedRow as T);
      } else {
        cleanedData.push(cleanRow);
      }
    }

    if (cleanedData.length === 0) {
      return {
        error:
          'No valid data found in the CSV file. Please ensure your file contains data rows.',
      };
    }

    // Sanitize data
    const sanitizedData = sanitizeCSVData(cleanedData);

    // Deduplicate if enabled
    let finalData = sanitizedData;
    let duplicatesRemoved = 0;

    if (config.enableDeduplication && config.requiredFields) {
      const dedupeResult = deduplicateRows(
        sanitizedData,
        config.requiredFields,
      );
      finalData = dedupeResult.data;
      duplicatesRemoved = dedupeResult.duplicatesRemoved;
    }

    // Validate the data
    const validationErrors = validateCSVData(
      finalData,
      config,
      customValidator,
    );

    // Separate errors from warnings
    const errors = validationErrors.filter((err) => err.severity === 'error');
    const warnings = validationErrors.filter(
      (err) => err.severity === 'warning',
    );

    // Count valid rows (rows without errors)
    const errorRows = new Set(errors.map((err) => err.row));
    const validRows = finalData.filter(
      (_, index) => !errorRows.has(index + 2),
    ).length;

    return {
      data: finalData,
      warnings: warnings.length > 0 ? warnings : undefined,
      metadata: {
        totalRows: rawData.length,
        validRows,
        duplicatesRemoved,
        parseTime: 0, // Will be set by the caller
      },
    };
  } catch (error) {
    return {
      error: `Error processing CSV data: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Applies field mappings to transform CSV column names to standard field names
 */
function applyFieldMappings<T extends CSVRow>(
  row: T,
  fieldMappings: Record<string, string[]>,
): T {
  const mappedRow = { ...row };
  const headers = Object.keys(row);
  const headerMapping = mapHeaders(headers, fieldMappings);

  // Apply mappings
  Object.entries(headerMapping).forEach(([standardField, originalHeader]) => {
    if (originalHeader in mappedRow && standardField !== originalHeader) {
      (mappedRow as any)[standardField] = mappedRow[originalHeader];
      delete (mappedRow as any)[originalHeader];
    }
  });

  return mappedRow;
}

/**
 * Parses CSV content from a string (useful for testing or direct content parsing)
 */
export async function parseCSVString<T extends CSVRow>(
  csvContent: string,
  config: CSVUploaderConfig,
  customValidator?: (data: T[]) => ValidationError[],
): Promise<ParseResult<T>> {
  const startTime = Date.now();

  return new Promise((resolve) => {
    try {
      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        transformHeader: (header: string) => header.trim(),
        complete: (results) => {
          const parseTime = Date.now() - startTime;

          if (results.errors && results.errors.length > 0) {
            const criticalErrors = results.errors.filter(
              (err) => err.type === 'Delimiter' || err.type === 'Quotes',
            );

            if (criticalErrors.length > 0) {
              resolve({
                error: `CSV parsing errors: ${criticalErrors.map((err) => err.message).join(', ')}`,
              });
              return;
            }
          }

          if (!Array.isArray(results.data)) {
            resolve({ error: 'Invalid CSV data format.' });
            return;
          }

          const processedResult = processCSVData<T>(
            results.data,
            config,
            customValidator,
          );

          resolve({
            ...processedResult,
            metadata: {
              totalRows: processedResult.metadata?.totalRows ?? 0,
              validRows: processedResult.metadata?.validRows ?? 0,
              duplicatesRemoved: processedResult.metadata?.duplicatesRemoved ?? 0,
              parseTime,
            },
          });
        },
        error: (error: any) => {
          resolve({ error: `CSV parsing failed: ${error.message}` });
        },
      });
    } catch (error) {
      resolve({
        error: `Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  });
}

/**
 * Generates a sample CSV template based on configuration
 */
export function generateCSVTemplate(
  config: CSVUploaderConfig,
  sampleData?: Record<string, string>[],
): string {
  const allFields = [
    ...(config.requiredFields || []),
    ...(config.optionalFields || []),
  ];

  if (allFields.length === 0) {
    throw new Error('No fields defined in configuration');
  }

  const defaultSampleData = [
    allFields.reduce(
      (acc, field) => {
        acc[field] = getSampleValue(field);
        return acc;
      },
      {} as Record<string, string>,
    ),
  ];

  const dataToUse =
    sampleData && sampleData.length > 0 ? sampleData : defaultSampleData;

  return Papa.unparse({
    fields: allFields,
    data: dataToUse,
  });
}

/**
 * Gets a sample value for a field based on its name
 */
function getSampleValue(fieldName: string): string {
  const lowerField = fieldName.toLowerCase();

  if (lowerField.includes('name')) return 'John Doe';
  if (lowerField.includes('phone')) return '+1234567890';
  if (lowerField.includes('email')) return 'john@example.com';
  if (lowerField.includes('company')) return 'Acme Corp';
  if (lowerField.includes('address')) return '123 Main St';
  if (lowerField.includes('city')) return 'New York';
  if (lowerField.includes('state')) return 'NY';
  if (lowerField.includes('zip')) return '10001';
  if (lowerField.includes('country')) return 'USA';
  if (lowerField.includes('date')) return '2024-01-01';
  if (lowerField.includes('amount')) return '100.00';
  if (lowerField.includes('status')) return 'active';

  return 'Sample Value';
}

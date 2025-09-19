// Main component
export { CSVUploader } from './components/csv-uploader';

// Specialized components
export {
  LeadCSVUploader,
  type LeadCSVRow,
} from './components/lead-csv-uploader';

// Individual components
export { CSVDropzone, FileDisplay } from './components/csv-dropzone';
export { CSVPreview } from './components/csv-preview';
export { UploadProgress } from './components/upload-progress';
export {
  ValidationDisplay,
  ValidationSummary,
} from './components/validation-display';

// Hooks
export { useCSVUploader } from './hooks/use-csv-uploader';

// Types
export type {
  CSVRow,
  CSVUploaderConfig,
  CSVUploaderProps,
  CSVUploaderState,
  DropzoneProps,
  FileValidationResult,
  ParseResult,
  PreviewTableProps,
  ProcessingCounts,
  RowIssue,
  UploadProgressProps,
  UploadResult,
  ValidatedRow,
  ValidationDisplayProps,
  ValidationError,
} from './types';

export { DEFAULT_CSV_CONFIG } from './types';

// Utilities
export {
  autoInferMapping,
  basicEmailValid,
  cleanCSVRow,
  deduplicateByPhone,
  deduplicateRows,
  formatFileSize,
  mapHeaders,
  normalizeWhitespace,
  parseBooleanFlexible,
  parseISODate,
  parseNumberSafe,
  sanitizeCSVData,
  toE164,
  validateCSVData,
  validateEmail,
  validateFile,
  validatePhone,
  validateRowCount,
} from './utils/validation';

export {
  generateCSVTemplate,
  parseCSVFile,
  parseCSVString,
} from './utils/parser';

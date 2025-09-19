export interface CSVRow {
  [key: string]: unknown;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export type RowIssue =
  | 'missing_name'
  | 'missing_phone'
  | 'invalid_phone'
  | 'invalid_email'
  | 'unknown_timezone'
  | 'invalid_date'
  | 'invalid_amount'
  | 'defaulted_field'
  | 'dnc';

export interface ValidatedRow<T = CSVRow> {
  originalIndex: number;
  data: T;
  normalizedPhone: string | null;
  issues: RowIssue[];
  outcome: 'valid' | 'warning' | 'error';
}

export interface ProcessingCounts {
  total: number;
  duplicatesRemoved: number;
  dncExcluded: number;
  invalidPhones: number;
  invalidEmails: number;
  defaulted: number;
  errors: number;
  warnings: number;
  valid: number;
}

export interface ParseResult<T = CSVRow> {
  data?: T[];
  error?: string;
  warnings?: ValidationError[];
  metadata?: {
    totalRows: number;
    validRows: number;
    duplicatesRemoved: number;
    parseTime: number;
  };
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface CSVUploaderConfig {
  maxFileSize?: number; // in bytes
  maxRows?: number;
  parseTimeout?: number; // in milliseconds
  allowedExtensions?: string[];
  allowedMimeTypes?: string[];
  enableDeduplication?: boolean;
  deduplicateByPhone?: boolean;
  excludeDnc?: boolean;
  requiredFields?: string[];
  optionalFields?: string[];
  fieldMappings?: Record<string, string[]>; // field -> possible column names
  autoInferMapping?: boolean;
  enableFieldMapping?: boolean;
  useWebWorker?: boolean;
}

export interface CSVUploaderState<T = CSVRow> {
  file: File | null;
  isParsingFile: boolean;
  isUploading: boolean;
  parsedData: T[];
  validationErrors: ValidationError[];
  parseError: string | null;
  uploadResult: UploadResult | null;
  headers: string[];
  fieldMapping: Record<string, string>;
  showFieldMapping: boolean;
  deduplicateByPhone: boolean;
  excludeDnc: boolean;
  duplicatesRemoved: number;
  dncExcluded: number;
}

export interface UploadResult {
  success: boolean;
  message: string;
  count?: number;
  errors?: ValidationError[];
}

export interface CSVUploaderProps<T = CSVRow> {
  config?: CSVUploaderConfig;
  onUpload: (data: T[]) => Promise<UploadResult>;
  onValidate?: (data: T[]) => ValidationError[];
  onParseComplete?: (result: ParseResult<T>) => void;
  className?: string;
  disabled?: boolean;
}

export interface DropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  isDragOver?: boolean;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  maxFileSize?: number;
  className?: string;
  children?: React.ReactNode;
}

export interface PreviewTableProps<T = CSVRow> {
  data: T[];
  validationErrors?: ValidationError[];
  maxRows?: number;
  className?: string;
}

export interface ValidationDisplayProps {
  errors: ValidationError[];
  maxErrors?: number;
  className?: string;
}

export interface UploadProgressProps {
  isUploading: boolean;
  isParsing: boolean;
  uploadResult?: UploadResult | null;
  className?: string;
}

// Default configurations
export const DEFAULT_CSV_CONFIG: Required<CSVUploaderConfig> = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxRows: 50000,
  parseTimeout: 30000, // 30 seconds
  allowedExtensions: ['.csv'],
  allowedMimeTypes: ['text/csv', 'application/csv', 'text/plain'],
  enableDeduplication: true,
  deduplicateByPhone: false,
  excludeDnc: false,
  requiredFields: [],
  optionalFields: [],
  fieldMappings: {},
  autoInferMapping: true,
  enableFieldMapping: true,
  useWebWorker: true,
};

import { useCallback, useState } from 'react';

import type {
  CSVRow,
  CSVUploaderConfig,
  CSVUploaderState,
  ParseResult,
  UploadResult,
  ValidationError,
} from '../types';
import { DEFAULT_CSV_CONFIG } from '../types';
import { parseCSVFile } from '../utils/parser';
import { validateFile } from '../utils/validation';

export interface UseCSVUploaderProps<T extends CSVRow = CSVRow> {
  config?: Partial<CSVUploaderConfig>;
  onUpload: (data: T[]) => Promise<UploadResult>;
  onValidate?: (data: T[]) => ValidationError[];
  onParseComplete?: (result: ParseResult<T>) => void;
  onError?: (error: string) => void;
}

export interface UseCSVUploaderReturn<T extends CSVRow = CSVRow> {
  state: CSVUploaderState<T>;
  actions: {
    selectFile: (file: File) => Promise<void>;
    clearFile: () => void;
    uploadData: () => Promise<void>;
    resetUploadResult: () => void;
  };
  utils: {
    downloadTemplate: () => void;
    downloadErrors: () => void;
    downloadCleanData: () => void;
  };
}

/**
 * Custom hook for managing CSV upload functionality
 */
export function useCSVUploader<T extends CSVRow = CSVRow>({
  config = {},
  onUpload,
  onValidate,
  onParseComplete,
  onError,
}: UseCSVUploaderProps<T>): UseCSVUploaderReturn<T> {
  const mergedConfig: CSVUploaderConfig = { ...DEFAULT_CSV_CONFIG, ...config };

  const [state, setState] = useState<CSVUploaderState<T>>({
    file: null,
    isParsingFile: false,
    isUploading: false,
    parsedData: [],
    validationErrors: [],
    parseError: null,
    uploadResult: null,
    headers: [],
    fieldMapping: {},
    showFieldMapping: false,
    deduplicateByPhone: false,
    excludeDnc: true,
    duplicatesRemoved: 0,
    dncExcluded: 0,
  });

  const selectFile = useCallback(
    async (file: File) => {
      // Reset state
      setState((prev) => ({
        ...prev,
        file: null,
        parsedData: [],
        validationErrors: [],
        parseError: null,
        uploadResult: null,
        isParsingFile: false,
      }));

      // Validate file
      const fileValidation = validateFile(file, mergedConfig);
      if (!fileValidation.valid) {
        const error = fileValidation.error!;
        setState((prev) => ({ ...prev, parseError: error }));
        onError?.(error);
        return;
      }

      // Set file and start parsing
      setState((prev) => ({ ...prev, file, isParsingFile: true }));

      try {
        const parseResult = await parseCSVFile<T>(
          file,
          mergedConfig,
          onValidate,
        );

        if (parseResult.error) {
          setState((prev) => ({
            ...prev,
            parseError: parseResult.error!,
            file: null,
            isParsingFile: false,
          }));
          onError?.(parseResult.error);
          return;
        }

        if (parseResult.data) {
          const validationErrors = onValidate
            ? onValidate(parseResult.data)
            : [];

          setState((prev) => ({
            ...prev,
            parsedData: parseResult.data!,
            validationErrors,
            isParsingFile: false,
          }));

          onParseComplete?.(parseResult);
        }
      } catch (error) {
        const errorMessage = `Unexpected error during CSV parsing: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`;

        setState((prev) => ({
          ...prev,
          parseError: errorMessage,
          file: null,
          isParsingFile: false,
        }));

        onError?.(errorMessage);
      }
    },
    [mergedConfig, onValidate, onParseComplete, onError],
  );

  const clearFile = useCallback(() => {
    setState({
      file: null,
      isParsingFile: false,
      isUploading: false,
      parsedData: [],
      validationErrors: [],
      parseError: null,
      uploadResult: null,
      headers: [],
      fieldMapping: {},
      showFieldMapping: false,
      deduplicateByPhone: false,
      excludeDnc: true,
      duplicatesRemoved: 0,
      dncExcluded: 0,
    });
  }, []);

  const uploadData = useCallback(async () => {
    if (state.validationErrors.some((err) => err.severity === 'error')) {
      const errorMessage = 'Please fix validation errors before uploading';
      setState((prev) => ({
        ...prev,
        uploadResult: { success: false, message: errorMessage },
      }));
      onError?.(errorMessage);
      return;
    }

    if (state.parsedData.length === 0) {
      const errorMessage = 'No valid data to upload';
      setState((prev) => ({
        ...prev,
        uploadResult: { success: false, message: errorMessage },
      }));
      onError?.(errorMessage);
      return;
    }

    setState((prev) => ({ ...prev, isUploading: true, uploadResult: null }));

    try {
      const result = await onUpload(state.parsedData);
      setState((prev) => ({
        ...prev,
        uploadResult: result,
        isUploading: false,
      }));

      if (result.success) {
        // Clear data on successful upload
        setTimeout(() => {
          clearFile();
        }, 2000);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Upload failed';
      const result: UploadResult = {
        success: false,
        message: errorMessage,
      };

      setState((prev) => ({
        ...prev,
        uploadResult: result,
        isUploading: false,
      }));

      onError?.(errorMessage);
    }
  }, [state.validationErrors, state.parsedData, onUpload, onError, clearFile]);

  const resetUploadResult = useCallback(() => {
    setState((prev) => ({ ...prev, uploadResult: null }));
  }, []);

  const downloadTemplate = useCallback(() => {
    const { generateCSVTemplate } = require('../utils/parser');

    try {
      const csvContent = generateCSVTemplate(mergedConfig);
      downloadCSV('template.csv', csvContent);
    } catch (error) {
      onError?.(
        `Failed to generate template: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }, [mergedConfig, onError]);

  const downloadErrors = useCallback(() => {
    if (state.validationErrors.length === 0) return;

    const errorData = state.validationErrors.map((error) => ({
      row: error.row,
      field: error.field,
      message: error.message,
      severity: error.severity,
    }));

    const csvContent = convertToCSV(errorData);
    downloadCSV('validation_errors.csv', csvContent);
  }, [state.validationErrors]);

  const downloadCleanData = useCallback(() => {
    if (state.parsedData.length === 0) return;

    // Filter out rows with errors
    const errorRows = new Set(
      state.validationErrors
        .filter((err) => err.severity === 'error')
        .map((err) => err.row),
    );

    const cleanData = state.parsedData.filter(
      (_, index) => !errorRows.has(index + 2), // +2 for header offset
    );

    if (cleanData.length === 0) {
      onError?.('No clean data available to download');
      return;
    }

    const csvContent = convertToCSV(cleanData);
    downloadCSV('clean_data.csv', csvContent);
  }, [state.parsedData, state.validationErrors, onError]);

  return {
    state,
    actions: {
      selectFile,
      clearFile,
      uploadData,
      resetUploadResult,
    },
    utils: {
      downloadTemplate,
      downloadErrors,
      downloadCleanData,
    },
  };
}

/**
 * Utility function to download CSV content
 */
function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Converts data to CSV format
 */
function convertToCSV(data: unknown[]): string {
  if (data.length === 0) return '';

  const Papa = require('papaparse');
  return Papa.unparse(data);
}

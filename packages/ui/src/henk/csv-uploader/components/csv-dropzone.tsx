'use client';

import { useCallback } from 'react';

import { FileSpreadsheet, RefreshCcw, Trash2, Upload } from 'lucide-react';
import { useDropzone, type FileRejection } from 'react-dropzone';

import { cn } from '../../../lib/utils';
import { Button } from '../../../shadcn/button';
import type { DropzoneProps } from '../types';
import { formatFileSize } from '../utils/validation';

export function CSVDropzone({
  onFileSelect,
  disabled = false,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  className,
  children,
}: DropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[], _fileRejections: FileRejection[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (file) {
          onFileSelect(file);
        }
      }
    },
    [onFileSelect],
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections,
    open,
  } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    maxSize: maxFileSize,
    disabled,
    // Disable automatic click to handle manually
    noClick: true,
    noKeyboard: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors',
        disabled
          ? 'cursor-not-allowed opacity-50'
          : isDragActive
            ? isDragReject
              ? 'border-destructive bg-destructive/5'
              : 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50',
        className,
      )}
      onClick={(e) => {
        // Only trigger file dialog if clicking outside the button
        if (!disabled && e.target === e.currentTarget) {
          open();
        }
      }}
    >
      <input {...getInputProps()} />

      {children || (
        <div className="space-y-4">
          <div className="bg-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full">
            <Upload className="text-muted-foreground h-6 w-6" />
          </div>

          <div className="space-y-2">
            <p className="text-lg font-medium">
              {disabled
                ? 'Processing...'
                : isDragActive
                  ? isDragReject
                    ? 'Invalid file type'
                    : 'Drop your CSV file here'
                  : 'Click to browse files'}
            </p>
            <p className="text-muted-foreground text-sm">
              {isDragActive
                ? isDragReject
                  ? 'Only CSV files are allowed'
                  : 'Release to upload'
                : 'or drag and drop your CSV file here'}
            </p>
          </div>

          <div className="text-muted-foreground space-y-1 text-xs">
            <p>Supported format: CSV only</p>
            <p>Maximum file size: {formatFileSize(maxFileSize)}</p>
          </div>

          {fileRejections.length > 0 && fileRejections[0]?.errors?.[0] && (
            <div className="text-destructive text-sm">
              {fileRejections[0].errors[0].message}
            </div>
          )}

          <Button
            type="button"
            size="sm"
            disabled={disabled}
            onClick={() => {
              if (!disabled) {
                open();
              }
            }}
          >
            Select File
          </Button>
        </div>
      )}
    </div>
  );
}

export interface FileDisplayProps {
  file: File;
  onRemove: () => void;
  onReplace: () => void;
  disabled?: boolean;
  className?: string;
}

export function FileDisplay({
  file,
  onRemove,
  onReplace,
  disabled = false,
  className,
}: FileDisplayProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
        <FileSpreadsheet className="h-6 w-6 text-green-600" />
      </div>

      <div className="space-y-1">
        <p className="font-medium text-green-900">{file.name}</p>
        <p className="text-muted-foreground text-sm">
          {formatFileSize(file.size)}
        </p>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onReplace}
          disabled={disabled}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Replace
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onRemove}
          disabled={disabled}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Remove
        </Button>
      </div>
    </div>
  );
}

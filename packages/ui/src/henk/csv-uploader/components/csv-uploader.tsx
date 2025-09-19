'use client';

import { Download, FileText } from 'lucide-react';

import { cn } from '../../../lib/utils';
import { Button } from '../../../shadcn/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shadcn/card';
import { Label } from '../../../shadcn/label';
import { useCSVUploader } from '../hooks/use-csv-uploader';
import type { CSVRow, CSVUploaderProps } from '../types';
import { CSVDropzone, FileDisplay } from './csv-dropzone';
import { CSVPreview } from './csv-preview';
import { UploadProgress } from './upload-progress';
import { ValidationDisplay, ValidationSummary } from './validation-display';

export function CSVUploader<T extends CSVRow = CSVRow>({
  config,
  onUpload,
  onValidate,
  onParseComplete,
  className,
  disabled = false,
}: CSVUploaderProps<T>) {
  const { state, actions, utils } = useCSVUploader({
    config,
    onUpload,
    onValidate,
    onParseComplete,
  });

  const {
    file,
    isParsingFile,
    isUploading,
    parsedData,
    validationErrors,
    parseError,
    uploadResult,
  } = state;

  const { selectFile, clearFile, uploadData } = actions;

  const { downloadTemplate, downloadErrors, downloadCleanData } = utils;

  const isProcessing = isParsingFile || isUploading;
  const isDisabled = disabled || isProcessing;

  const errorCount = validationErrors.filter(
    (e) => e.severity === 'error',
  ).length;
  const warningCount = validationErrors.filter(
    (e) => e.severity === 'warning',
  ).length;
  const validRows = parsedData.length - errorCount;
  const canUpload =
    file && parsedData.length > 0 && errorCount === 0 && !parseError;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">CSV Upload Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            {config?.requiredFields && config.requiredFields.length > 0 && (
              <div>
                <p className="font-medium">Required columns:</p>
                <ul className="text-muted-foreground list-inside list-disc space-y-1">
                  {config.requiredFields.map((field) => (
                    <li key={field}>
                      <code className="bg-muted rounded px-1 text-xs">
                        {field}
                      </code>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {config?.optionalFields && config.optionalFields.length > 0 && (
              <div>
                <p className="font-medium">Optional columns:</p>
                <ul className="text-muted-foreground list-inside list-disc space-y-1">
                  {config.optionalFields.map((field) => (
                    <li key={field}>
                      <code className="bg-muted rounded px-1 text-xs">
                        {field}
                      </code>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              disabled={isDisabled}
            >
              <FileText className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload CSV File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select CSV File</Label>
            {file ? (
              <div className="mt-2">
                <FileDisplay
                  file={file}
                  onRemove={clearFile}
                  onReplace={() => {
                    clearFile();
                    // Trigger file input click after clearing
                    setTimeout(() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.csv';
                      input.onchange = (e) => {
                        const selectedFile = (e.target as HTMLInputElement)
                          .files?.[0];
                        if (selectedFile) {
                          selectFile(selectedFile);
                        }
                      };
                      input.click();
                    }, 100);
                  }}
                  disabled={isDisabled}
                />
              </div>
            ) : (
              <div className="mt-2">
                <CSVDropzone
                  onFileSelect={selectFile}
                  disabled={isDisabled}
                  maxFileSize={config?.maxFileSize}
                />
              </div>
            )}
          </div>

          {/* Upload Progress */}
          <UploadProgress
            isUploading={isUploading}
            isParsing={isParsingFile}
            uploadResult={uploadResult}
          />

          {/* Parse Error */}
          {parseError && (
            <ValidationDisplay
              errors={[
                {
                  row: 0,
                  field: 'file',
                  message: parseError,
                  severity: 'error',
                },
              ]}
            />
          )}
        </CardContent>
      </Card>

      {/* Data Preview and Validation */}
      {(parsedData.length > 0 || validationErrors.length > 0) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Data Preview & Validation
              </CardTitle>
              <div className="flex gap-2">
                {validationErrors.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={downloadErrors}
                    disabled={isDisabled}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Errors
                  </Button>
                )}
                {validRows > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={downloadCleanData}
                    disabled={isDisabled}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Clean Data
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            {parsedData.length > 0 && (
              <ValidationSummary
                totalRows={parsedData.length}
                validRows={validRows}
                errorCount={errorCount}
                warningCount={warningCount}
                duplicatesRemoved={0} // This would come from parsing metadata
              />
            )}

            {/* Validation Errors */}
            <ValidationDisplay errors={validationErrors} />

            {/* Data Preview */}
            {parsedData.length > 0 && (
              <CSVPreview
                data={parsedData}
                validationErrors={validationErrors}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Actions */}
      {file && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={clearFile}
                disabled={isDisabled}
              >
                Cancel
              </Button>
              <Button onClick={uploadData} disabled={!canUpload || isDisabled}>
                {isUploading
                  ? 'Uploading...'
                  : isParsingFile
                    ? 'Processing...'
                    : `Upload ${validRows.toLocaleString()} Records`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

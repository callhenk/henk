'use client';

import { CheckCircle, XCircle } from 'lucide-react';

import { cn } from '../../../lib/utils';
import { Alert, AlertDescription } from '../../../shadcn/alert';
import type { UploadProgressProps } from '../types';

export function UploadProgress({
  isUploading,
  isParsing,
  uploadResult,
  className,
}: UploadProgressProps) {
  if (!isUploading && !isParsing && !uploadResult) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Parsing Status */}
      {isParsing && (
        <div className="flex items-center justify-center space-x-2 rounded-md border p-4">
          <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
          <span className="text-sm font-medium">Parsing CSV file...</span>
        </div>
      )}

      {/* Upload Status */}
      {isUploading && (
        <div className="flex items-center justify-center space-x-2 rounded-md border p-4">
          <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
          <span className="text-sm font-medium">Uploading data...</span>
        </div>
      )}

      {/* Upload Result */}
      {uploadResult && (
        <Alert variant={uploadResult.success ? 'default' : 'destructive'}>
          {uploadResult.success ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">
                {uploadResult.success ? 'Upload Successful!' : 'Upload Failed'}
              </p>
              <p className="text-sm">{uploadResult.message}</p>
              {uploadResult.count && (
                <p className="text-muted-foreground text-sm">
                  {uploadResult.count.toLocaleString()} records processed
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

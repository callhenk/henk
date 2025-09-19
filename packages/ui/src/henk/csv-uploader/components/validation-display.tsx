'use client';

import { AlertCircle, AlertTriangle } from 'lucide-react';

import { cn } from '../../../lib/utils';
import { Alert, AlertDescription } from '../../../shadcn/alert';
import { Badge } from '../../../shadcn/badge';
import type { ValidationDisplayProps } from '../types';

export function ValidationDisplay({
  errors,
  maxErrors = 10,
  className,
}: ValidationDisplayProps) {
  if (errors.length === 0) {
    return null;
  }

  const criticalErrors = errors.filter((error) => error.severity === 'error');
  const warnings = errors.filter((error) => error.severity === 'warning');

  return (
    <div className={cn('space-y-3', className)}>
      {criticalErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="font-medium">
                  {criticalErrors.length} Critical Error
                  {criticalErrors.length !== 1 ? 's' : ''}
                </p>
                <Badge variant="destructive" className="text-xs">
                  Must Fix
                </Badge>
              </div>
              <div className="space-y-1">
                {criticalErrors.slice(0, maxErrors).map((error, index) => (
                  <div key={index} className="text-sm">
                    <span className="bg-destructive/10 rounded px-1 font-mono text-xs">
                      Row {error.row}
                    </span>
                    <span className="mx-2">•</span>
                    <span className="font-medium">{error.field}:</span>
                    <span className="ml-1">{error.message}</span>
                  </div>
                ))}
                {criticalErrors.length > maxErrors && (
                  <p className="text-sm font-medium">
                    ... and {criticalErrors.length - maxErrors} more error
                    {criticalErrors.length - maxErrors !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {warnings.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="font-medium">
                  {warnings.length} Warning{warnings.length !== 1 ? 's' : ''}
                </p>
                <Badge variant="secondary" className="text-xs">
                  Review Recommended
                </Badge>
              </div>
              <div className="space-y-1">
                {warnings.slice(0, maxErrors).map((warning, index) => (
                  <div key={index} className="text-sm">
                    <span className="rounded bg-yellow-100 px-1 font-mono text-xs">
                      Row {warning.row}
                    </span>
                    <span className="mx-2">•</span>
                    <span className="font-medium">{warning.field}:</span>
                    <span className="ml-1">{warning.message}</span>
                  </div>
                ))}
                {warnings.length > maxErrors && (
                  <p className="text-sm font-medium">
                    ... and {warnings.length - maxErrors} more warning
                    {warnings.length - maxErrors !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export interface ValidationSummaryProps {
  totalRows: number;
  validRows: number;
  errorCount: number;
  warningCount: number;
  duplicatesRemoved?: number;
  className?: string;
}

export function ValidationSummary({
  totalRows,
  validRows,
  errorCount,
  warningCount,
  duplicatesRemoved = 0,
  className,
}: ValidationSummaryProps) {
  return (
    <div className={cn('rounded-md border p-3 text-sm', className)}>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-medium">Total:</span>
          <Badge variant="outline">{totalRows.toLocaleString()}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-medium">Valid:</span>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {validRows.toLocaleString()}
          </Badge>
        </div>

        {errorCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="font-medium">Errors:</span>
            <Badge variant="destructive">{errorCount.toLocaleString()}</Badge>
          </div>
        )}

        {warningCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="font-medium">Warnings:</span>
            <Badge
              variant="secondary"
              className="bg-yellow-100 text-yellow-800"
            >
              {warningCount.toLocaleString()}
            </Badge>
          </div>
        )}

        {duplicatesRemoved > 0 && (
          <div className="flex items-center gap-2">
            <span className="font-medium">Duplicates removed:</span>
            <Badge variant="outline">
              {duplicatesRemoved.toLocaleString()}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}

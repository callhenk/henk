'use client';

import { cn } from '../../../lib/utils';
import { Badge } from '../../../shadcn/badge';
import type { CSVRow, PreviewTableProps, ValidationError } from '../types';

export function CSVPreview<T extends CSVRow = CSVRow>({
  data,
  validationErrors = [],
  maxRows = 10,
  className,
}: PreviewTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className={cn('text-muted-foreground py-8 text-center', className)}>
        No data to preview
      </div>
    );
  }

  // Get all unique column names from the data
  const columns = Array.from(new Set(data.flatMap((row) => Object.keys(row))));

  // Create error lookup for quick access
  const errorLookup = new Map<string, ValidationError[]>();
  validationErrors.forEach((error) => {
    const key = `${error.row}-${error.field}`;
    if (!errorLookup.has(key)) {
      errorLookup.set(key, []);
    }
    errorLookup.get(key)!.push(error);
  });

  const previewData = data.slice(0, maxRows);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          Preview ({data.length.toLocaleString()} rows)
        </h3>
        {data.length > maxRows && (
          <span className="text-muted-foreground text-xs">
            Showing first {maxRows} rows
          </span>
        )}
      </div>

      <div className="max-h-96 overflow-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left font-medium">#</th>
              {columns.map((column) => (
                <th key={column} className="px-3 py-2 text-left font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewData.map((row, index) => {
              const rowNumber = index + 2; // +2 for header offset
              const hasRowErrors = validationErrors.some(
                (error) => error.row === rowNumber,
              );

              return (
                <tr
                  key={index}
                  className={cn('border-t', hasRowErrors && 'bg-destructive/5')}
                >
                  <td className="text-muted-foreground px-3 py-2">
                    {rowNumber}
                  </td>
                  {columns.map((column) => {
                    const value = row[column];
                    const cellKey = `${rowNumber}-${column}`;
                    const cellErrors = errorLookup.get(cellKey) || [];

                    return (
                      <td key={column} className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              cellErrors.some((e) => e.severity === 'error') &&
                                'text-destructive',
                            )}
                          >
                            {formatCellValue(value)}
                          </span>
                          {cellErrors.map((error, errorIndex) => (
                            <Badge
                              key={errorIndex}
                              variant={
                                error.severity === 'error'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                              className="px-1 py-0 text-[10px]"
                            >
                              {error.severity === 'error' ? 'Error' : 'Warning'}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {data.length > maxRows && (
          <div className="text-muted-foreground bg-muted/50 border-t p-3 text-center text-xs">
            ... and {(data.length - maxRows).toLocaleString()} more rows
          </div>
        )}
      </div>
    </div>
  );
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '-';
  }

  if (typeof value === 'string') {
    return value || '-';
  }

  return String(value);
}

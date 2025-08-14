'use client';

import { useRef, useState } from 'react';

import { FileDrop } from 'react-file-drop';

import { cn } from '@kit/ui/utils';

interface CsvDropzoneProps {
  disabled?: boolean;
  onFileSelected: (file: File) => void;
  className?: string;
  children?: React.ReactNode;
}

export function CsvDropzone({
  disabled,
  onFileSelected,
  className,
  children,
}: CsvDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const openFileDialog = () => {
    if (disabled || isDragOver) return;
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isCsv(file)) return;
    onFileSelected(file);
  };

  const isCsv = (file: File) => {
    const name = file.name.toLowerCase();
    return file.type === 'text/csv' || name.endsWith('.csv');
  };

  return (
    <div
      className={cn(
        'col-span-2 rounded-lg border-2 border-dashed p-6 text-sm transition-colors',
        disabled ? 'opacity-50' : 'cursor-pointer',
        isDragOver
          ? 'border-primary bg-primary/5'
          : 'border-black/10 dark:border-white/10',
        className,
      )}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={openFileDialog}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openFileDialog();
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
      />
      <FileDrop
        onTargetClick={openFileDialog}
        onDragOver={() => setIsDragOver(true)}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(files) => {
          setIsDragOver(false);
          if (!files || disabled) return;
          const file = files[0] ?? null;
          if (!file) return;
          if (!isCsv(file)) return;
          onFileSelected(file);
        }}
        className="h-full w-full"
      >
        <div className="text-muted-foreground flex h-full w-full items-center justify-center">
          {children ?? 'Drop CSV here or click to choose'}
        </div>
      </FileDrop>
    </div>
  );
}

export default CsvDropzone;

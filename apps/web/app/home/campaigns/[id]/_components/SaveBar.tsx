'use client';

import { useEffect } from 'react';

import { Button } from '@kit/ui/button';

type SaveStatus = 'dirty' | 'saving' | 'saved' | 'error';

interface SaveBarProps {
  visible: boolean;
  status: SaveStatus;
  onSave: () => void;
  onDiscard: () => void;
  onRetry?: () => void;
  onViewChanges?: () => void;
}

export function SaveBar({
  visible,
  status,
  onSave,
  onDiscard,
  onRetry,
  onViewChanges,
}: SaveBarProps) {
  const isSaving = status === 'saving';
  const isError = status === 'error';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMod = navigator.platform.toLowerCase().includes('mac')
        ? e.metaKey
        : e.ctrlKey;
      if (isMod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (!isSaving) onSave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isSaving, onSave]);

  if (!visible) return null;

  const statusText = isError
    ? 'Save failed'
    : isSaving
      ? 'Saving…'
      : status === 'saved'
        ? 'Saved just now'
        : 'Unsaved changes';

  return (
    <div className="fixed inset-x-0 bottom-2 z-40 flex justify-center px-3 sm:px-4">
      <div className="bg-card text-foreground ring-border flex w-full max-w-3xl items-center justify-between gap-3 rounded-xl px-3 py-2 ring-1">
        <div aria-live="polite" className="text-sm">
          {statusText}
        </div>
        <div className="flex items-center gap-2">
          {onViewChanges && (
            <Button variant="outline" size="sm" onClick={onViewChanges}>
              View changes
            </Button>
          )}
          {isError ? (
            <Button size="sm" onClick={onRetry}>
              Retry
            </Button>
          ) : (
            <Button size="sm" onClick={onSave} disabled={isSaving}>
              Save
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onDiscard}
            disabled={isSaving}
          >
            Discard
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SaveBar;

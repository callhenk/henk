'use client';

import { useEffect, useRef } from 'react';

interface UseAutosaveOptions {
  enabled: boolean;
  delayMs?: number;
  onSave: () => Promise<void> | void;
}

export function useAutosave({
  enabled,
  delayMs = 800,
  onSave,
}: UseAutosaveOptions) {
  const timerRef = useRef<number | null>(null);

  const schedule = () => {
    if (!enabled) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      onSave();
    }, delayMs);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  return { scheduleImmediate: onSave, scheduleDebounced: schedule } as const;
}

export default useAutosave;

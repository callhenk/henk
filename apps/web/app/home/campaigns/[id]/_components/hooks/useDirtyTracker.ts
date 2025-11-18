'use client';

import { useRef } from 'react';

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (a && b && typeof a === 'object') {
    const ak = Object.keys(a as object);
    const bk = Object.keys(b as object);
    if (ak.length !== bk.length) return false;
    return ak.every((k) =>
      deepEqual(
        (a as Record<string, unknown>)[k],
        (b as Record<string, unknown>)[k],
      ),
    );
  }
  return false;
}

export function useDirtyTracker<T extends Record<string, unknown>>(initial: T) {
  const initialRef = useRef<T>(initial);

  const computePatch = (current: T): Partial<T> => {
    const patch: Partial<T> = {};
    const keys = new Set([
      ...Object.keys(initialRef.current),
      ...Object.keys(current),
    ]);
    keys.forEach((k) => {
      const key = k as keyof T;
      if (!deepEqual(initialRef.current[key], current[key])) {
        patch[key] = current[key];
      }
    });
    return patch;
  };

  const isDirty = (current: T): boolean =>
    Object.keys(computePatch(current)).length > 0;

  const reset = (next: T) => {
    initialRef.current = next;
  };

  return { computePatch, isDirty, reset };
}

export default useDirtyTracker;

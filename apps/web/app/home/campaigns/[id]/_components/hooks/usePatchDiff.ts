'use client';

export type Primitive = string | number | boolean | null | undefined;

export type PatchValue = Primitive | { [key: string]: PatchValue };

export type Patch = Record<string, PatchValue>;

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function diffPatch<T extends Record<string, unknown>>(
  a: T,
  b: T,
): Patch {
  const patch: Patch = {};
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  keys.forEach((k) => {
    const av = a[k as keyof T] as unknown;
    const bv = b[k as keyof T] as unknown;
    if (isObject(av) && isObject(bv)) {
      const nested = diffPatch(
        av as Record<string, unknown>,
        bv as Record<string, unknown>,
      );
      if (Object.keys(nested).length > 0) {
        patch[k] = nested;
      }
    } else if (av !== bv) {
      patch[k] = bv as Primitive;
    }
  });
  return patch;
}

export default diffPatch;

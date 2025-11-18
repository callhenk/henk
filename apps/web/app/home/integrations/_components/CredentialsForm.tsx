'use client';

import { useState } from 'react';

import { Clipboard, Eye, EyeOff } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';

import type { FieldDefinition } from './types';

export function CredentialsForm({
  fields,
  value,
  onChange,
  readOnly,
  disableCopy,
}: {
  fields: FieldDefinition[];
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  readOnly?: boolean;
  disableCopy?: boolean; // after first save
}) {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const setField = (k: string, v: unknown) => onChange({ ...value, [k]: v });

  const copy = async (k: string) => {
    if (disableCopy) return;
    const v = String(value[k] ?? '');
    if (!v) return;
    await navigator.clipboard.writeText(v);
  };

  return (
    <div className="space-y-4">
      {fields.map((f) => (
        <div key={f.key} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor={f.key}>{f.label}</Label>
            {f.helpText ? (
              <span className="text-muted-foreground text-xs">
                {f.helpText}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Input
              id={f.key}
              type={
                f.type === 'password' && !revealed[f.key] ? 'password' : 'text'
              }
              placeholder={f.placeholder}
              aria-required={f.required}
              required={f.required}
              value={String(value[f.key] ?? '')}
              disabled={readOnly}
              onChange={(e) => setField(f.key, e.target.value)}
            />
            {f.secret ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={revealed[f.key] ? 'Hide secret' : 'Show secret'}
                onClick={() =>
                  setRevealed({ ...revealed, [f.key]: !revealed[f.key] })
                }
                disabled={readOnly}
              >
                {revealed[f.key] ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Copy value"
              onClick={() => copy(f.key)}
              disabled={disableCopy || readOnly}
            >
              <Clipboard className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

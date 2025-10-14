'use client';

import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';

import type { FieldDefinition } from './types';

export function ConfigForm({
  fields,
  value,
  onChange,
  readOnly,
}: {
  fields: FieldDefinition[];
  value: Record<string, any>;
  onChange: (next: Record<string, any>) => void;
  readOnly?: boolean;
}) {
  const setField = (k: string, v: any) => onChange({ ...value, [k]: v });

  return (
    <div className="space-y-4">
      {fields.map((f) => (
        <div key={f.key} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor={f.key}>{f.label}</Label>
            {f.helpText ? (
              <span className="text-muted-foreground text-xs">{f.helpText}</span>
            ) : null}
          </div>

          {f.type === 'select' ? (
            <Select value={String(value[f.key] ?? '')} onValueChange={(v) => setField(f.key, v)}>
              <SelectTrigger disabled={readOnly}>
                <SelectValue placeholder={f.placeholder ?? 'Select'} />
              </SelectTrigger>
              <SelectContent>
                {(f.options ?? []).map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                id={f.key}
                type={f.type === 'url' ? 'url' : 'text'}
                placeholder={f.placeholder}
                value={String(value[f.key] ?? '')}
                onChange={(e) => setField(f.key, e.target.value)}
                disabled={readOnly}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}



'use client';

import { useMemo, useState } from 'react';

import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@kit/ui/sheet';

interface LogItem {
  id: string;
  ts: string; // ISO
  level: 'info' | 'error' | 'success';
  message: string;
  event: string;
}

export function LogsDrawer({
  open,
  onOpenChange,
  logs,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logs: LogItem[];
}) {
  const [showErrorsOnly, setShowErrorsOnly] = useState(false);

  const filtered = useMemo(
    () => (showErrorsOnly ? logs.filter((l) => l.level === 'error') : logs),
    [logs, showErrorsOnly],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, LogItem[]>();
    for (const l of filtered) {
      const d = new Date(l.ts);
      const key = d.toLocaleDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(l);
    }
    return Array.from(map.entries()).map(([k, v]) => ({ day: k, items: v }));
  }, [filtered]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Logs</SheetTitle>
          <SheetDescription>Recent events grouped by day</SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input
              aria-label="Errors only"
              type="checkbox"
              className="rounded border"
              checked={showErrorsOnly}
              onChange={(e) => setShowErrorsOnly(e.target.checked)}
            />
            Errors only
          </label>
          <div className="text-muted-foreground text-xs">
            {filtered.length} events
          </div>
        </div>

        <div className="mt-4 space-y-6">
          {grouped.map(({ day, items }) => (
            <div key={day}>
              <div className="text-muted-foreground mb-2 text-xs">{day}</div>
              <div className="divide-border rounded-md border">
                {items.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-start gap-3 border-b p-3 last:border-b-0"
                  >
                    <LevelIcon level={l.level} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{l.event}</div>
                      <div className="text-muted-foreground truncate text-sm">
                        {l.message}
                      </div>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />{' '}
                      {new Date(l.ts).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function LevelIcon({ level }: { level: LogItem['level'] }) {
  switch (level) {
    case 'success':
      return <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-600" aria-hidden />;
    default:
      return (
        <CheckCircle2 className="text-muted-foreground h-4 w-4" aria-hidden />
      );
  }
}

'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';

interface ChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patch: Record<string, unknown>;
}

export function ChangesDialog({
  open,
  onOpenChange,
  patch,
}: ChangesDialogProps) {
  const entries = Object.entries(patch);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pending changes</DialogTitle>
        </DialogHeader>
        {entries.length === 0 ? (
          <p className="text-muted-foreground text-sm">No pending changes.</p>
        ) : (
          <div className="space-y-2 text-sm">
            {entries.map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-4">
                <div className="font-medium">{k}</div>
                <pre className="bg-muted max-w-[65%] overflow-auto rounded px-2 py-1 whitespace-pre-wrap">
                  {JSON.stringify(v, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ChangesDialog;

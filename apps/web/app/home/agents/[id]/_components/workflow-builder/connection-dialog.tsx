'use client';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';

interface ConnectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  options: string[];
  onConfirm: (option: string) => void;
  onCancel: () => void;
}

export function ConnectionDialog({
  isOpen,
  onOpenChange,
  options,
  onConfirm,
  onCancel,
}: ConnectionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Choose Connection Option</DialogTitle>
          <DialogDescription>
            Select which decision option this connection represents
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            {options.map((option: string, index: number) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => onConfirm(option)}
                className="justify-start"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

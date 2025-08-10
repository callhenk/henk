'use client';

import { Button } from '@kit/ui/button';
import { Progress } from '@kit/ui/progress';

export function WizardTopBar({
  step,
  totalSteps,
  status,
  onClose,
}: {
  step: number;
  totalSteps: number;
  status?: string | null;
  onClose?: () => void;
}) {
  const progress = (step / totalSteps) * 100;
  return (
    <div className="mb-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <span className="text-sm">
            Step {step} of {totalSteps}
          </span>
          <span className="bg-muted rounded-full px-2 py-0.5 text-xs">
            {status ?? 'Draft'}
          </span>
        </div>
      </div>
      <Progress value={progress} className="h-1.5" />
    </div>
  );
}

export default WizardTopBar;

'use client';

import { Check } from 'lucide-react';

import { DialogDescription, DialogTitle } from '@kit/ui/dialog';
import { Progress } from '@kit/ui/progress';

export function WizardTopBar({
  step,
  totalSteps,
}: {
  step: number;
  totalSteps: number;
}) {
  const progress = (step / totalSteps) * 100;
  const steps = [
    { key: 'basics', title: 'Basics' },
    { key: 'calling', title: 'Calling' },
    { key: 'review', title: 'Review' },
  ];

  return (
    <div className="border-b px-6 py-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <DialogTitle className="text-xl font-semibold">
            Create Campaign
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Set up a new fundraising campaign
          </DialogDescription>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {steps.map((s, idx) => (
          <div
            key={s.key}
            className={
              idx + 1 <= step
                ? 'bg-primary text-primary-foreground rounded-md px-3 py-2 text-xs'
                : 'rounded-md border px-3 py-2 text-xs'
            }
          >
            <div className="flex items-center gap-2">
              <span className="bg-background text-foreground inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px]">
                {idx + 1 < step ? <Check className="h-3 w-3" /> : idx + 1}
              </span>
              <span className="font-medium">{s.title}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <Progress value={progress} className="h-1.5" />
      </div>
    </div>
  );
}

export default WizardTopBar;

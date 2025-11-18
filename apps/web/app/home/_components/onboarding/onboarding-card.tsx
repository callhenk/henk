'use client';

import type { CardComponentProps } from 'onborda';

import { Button } from '@kit/ui/button';

export function OnboardingCard({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  arrow,
}: CardComponentProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="border-border bg-background relative w-[400px] max-w-[90vw] rounded-lg border p-6 shadow-xl">
      {/* Arrow pointing to element */}
      {arrow}

      {/* Icon */}
      {step.icon && (
        <div className="bg-primary/10 text-primary mb-4 flex h-10 w-10 items-center justify-center rounded-full">
          {step.icon}
        </div>
      )}

      {/* Title */}
      <h3 className="text-foreground mb-2 text-lg font-semibold">
        {step.title}
      </h3>

      {/* Content */}
      <div className="text-muted-foreground mb-4 text-sm">{step.content}</div>

      {/* Progress indicator */}
      <div
        className="mb-4 flex items-center gap-1"
        role="progressbar"
        aria-label="Tour progress"
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
      >
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`h-1.5 flex-1 rounded-full ${
              index === currentStep
                ? 'bg-primary'
                : index < currentStep
                  ? 'bg-primary/50'
                  : 'bg-muted'
            }`}
            aria-label={`Step ${index + 1}${
              index === currentStep
                ? ' (current)'
                : index < currentStep
                  ? ' (completed)'
                  : ''
            }`}
          />
        ))}
      </div>

      {/* Step counter */}
      <div className="text-muted-foreground mb-4 text-xs">
        Step {currentStep + 1} of {totalSteps}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-2">
        <Button
          onClick={prevStep}
          variant="outline"
          size="sm"
          disabled={isFirstStep}
        >
          Previous
        </Button>

        <Button onClick={nextStep} size="sm">
          {isLastStep ? 'Finish' : 'Next'}
        </Button>
      </div>
    </div>
  );
}

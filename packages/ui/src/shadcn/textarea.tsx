import * as React from 'react';

import { cn } from '../lib/utils';

export type TextareaProps = React.ComponentPropsWithRef<'textarea'>;

const Textarea: React.FC<TextareaProps> = ({ className, ...props }) => {
  return (
    <textarea
      className={cn(
        'border-input bg-background placeholder:text-muted-foreground hover:border-ring/50 focus-visible:border-ring focus-visible:ring-ring flex min-h-[60px] w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
};

Textarea.displayName = 'Textarea';

export { Textarea };

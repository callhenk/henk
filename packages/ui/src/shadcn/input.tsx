import * as React from 'react';

import { cn } from '../lib/utils';

export type InputProps = React.ComponentPropsWithRef<'input'>;

const Input: React.FC<InputProps> = ({
  className,
  type = 'text',
  ...props
}) => {
  return (
    <input
      type={type}
      className={cn(
        'glass-panel border-input file:text-foreground hover:border-ring/50 placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md px-3 py-1 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      {...props}
    />
  );
};

Input.displayName = 'Input';

export { Input };

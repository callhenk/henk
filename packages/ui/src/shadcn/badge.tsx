import * as React from 'react';

import { type VariantProps, cva } from 'class-variance-authority';

import { cn } from '../lib/utils';

const badgeVariants = cva(
  'focus:ring-ring inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-hidden',
  {
    variants: {
      variant: {
        default:
          'bg-primary hover:bg-primary text-primary-foreground border-transparent',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary border-transparent',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive border-transparent',
        outline: 'text-foreground border',
        success:
          'border-transparent bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:bg-green-500/20 dark:text-green-300 dark:hover:bg-green-500/30',
        warning:
          'border-transparent bg-orange-500/15 text-orange-700 hover:bg-orange-500/25 dark:bg-orange-500/20 dark:text-orange-300 dark:hover:bg-orange-500/30',
        info: 'border-transparent bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

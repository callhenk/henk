import * as React from 'react';

import { type VariantProps, cva } from 'class-variance-authority';

import { cn } from '../lib/utils';

const badgeVariants = cva(
  'focus:ring-ring inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-hidden',
  {
    variants: {
      variant: {
        default:
          'glass-panel bg-primary/90 text-primary-foreground hover:bg-primary border-transparent shadow-xs',
        secondary:
          'glass-panel bg-secondary/90 text-secondary-foreground hover:bg-secondary border-transparent',
        destructive:
          'glass-panel bg-destructive/90 text-destructive-foreground hover:bg-destructive border-transparent shadow-xs',
        outline: 'glass-panel text-foreground border-white/20',
        success:
          'glass-panel border-transparent bg-green-500/40 text-green-600 hover:bg-green-500/60 dark:bg-green-500/30 dark:text-green-400 dark:hover:bg-green-500/50',
        warning:
          'glass-panel border-transparent bg-orange-500/40 text-orange-600 hover:bg-orange-500/60 dark:bg-orange-500/30 dark:text-orange-400 dark:hover:bg-orange-500/50',
        info: 'glass-panel border-transparent bg-blue-500/40 text-blue-600 hover:bg-blue-500/60 dark:bg-blue-500/30 dark:text-blue-400 dark:hover:bg-blue-500/50',
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

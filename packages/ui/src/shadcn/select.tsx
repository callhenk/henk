'use client';

import * as React from 'react';

import {
  CaretSortIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@radix-ui/react-icons';
import * as SelectPrimitive from '@radix-ui/react-select';

import { cn } from '../lib/utils';

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue: React.FC<
  React.ComponentPropsWithRef<typeof SelectPrimitive.Value>
> = ({ className, ...props }) => (
  <SelectPrimitive.Value className={cn('text-left', className)} {...props} />
);

const SelectTrigger: React.FC<
  React.ComponentPropsWithRef<typeof SelectPrimitive.Trigger>
> = ({ className, children, ...props }) => (
  <SelectPrimitive.Trigger
    className={cn(
      'glass-panel border-input ring-offset-background placeholder:text-muted-foreground focus:ring-ring focus:outline-hidden flex h-9 w-full items-center justify-between rounded-md px-3 py-2 text-sm focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  >
    <div className="flex flex-1 items-center truncate text-left">
      {children}
    </div>
    <SelectPrimitive.Icon asChild>
      <CaretSortIcon className="ml-2 h-4 w-4 flex-shrink-0 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
);
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton: React.FC<
  React.ComponentPropsWithRef<typeof SelectPrimitive.ScrollUpButton>
> = ({ className, ...props }) => (
  <SelectPrimitive.ScrollUpButton
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className,
    )}
    {...props}
  >
    <ChevronUpIcon />
  </SelectPrimitive.ScrollUpButton>
);
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton: React.FC<
  React.ComponentPropsWithRef<typeof SelectPrimitive.ScrollDownButton>
> = ({ className, ...props }) => (
  <SelectPrimitive.ScrollDownButton
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className,
    )}
    {...props}
  >
    <ChevronDownIcon />
  </SelectPrimitive.ScrollDownButton>
);
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

const SelectContent: React.FC<
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
> = ({ className, children, position = 'popper', ...props }) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      className={cn(
        'glass-panel text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className,
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]',
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel: React.FC<
  React.ComponentPropsWithRef<typeof SelectPrimitive.Label>
> = ({ className, ...props }) => (
  <SelectPrimitive.Label
    className={cn('px-2 py-1.5 text-sm font-semibold', className)}
    {...props}
  />
);
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem: React.FC<
  React.ComponentPropsWithRef<typeof SelectPrimitive.Item>
> = ({ className, children, ...props }) => (
  <SelectPrimitive.Item
    className={cn(
      'focus:bg-accent/50 focus:text-accent-foreground hover:bg-accent/30 outline-hidden data-disabled:pointer-events-none data-disabled:opacity-50 relative flex w-full cursor-default select-none items-center rounded-md py-1.5 pl-2 pr-8 text-sm',
      className,
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText className="flex-1 text-left">
      {children}
    </SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
);
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator: React.FC<
  React.ComponentPropsWithRef<typeof SelectPrimitive.Separator>
> = ({ className, ...props }) => (
  <SelectPrimitive.Separator
    className={cn('bg-muted -mx-1 my-1 h-px', className)}
    {...props}
  />
);
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};

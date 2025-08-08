'use client';

import * as React from 'react';

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import {
  CheckIcon,
  ChevronRightIcon,
  DotFilledIcon,
} from '@radix-ui/react-icons';

import { cn } from '../lib/utils';

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger: React.FC<
  React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
> = ({ className, inset, children, ...props }) => (
  <DropdownMenuPrimitive.SubTrigger
    className={cn(
      'focus:bg-accent data-[state=open]:bg-accent flex cursor-default items-center rounded-xs px-2 py-1.5 text-sm outline-hidden select-none',
      inset && 'pl-8',
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRightIcon className="ml-auto h-4 w-4" />
  </DropdownMenuPrimitive.SubTrigger>
);
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent: React.FC<
  React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.SubContent>
> = ({ className, ...props }) => (
  <DropdownMenuPrimitive.SubContent
    className={cn(
      // Glassmorphism sub-menu panel
      'text-popover-foreground z-[60] min-w-[10rem] overflow-hidden rounded-2xl border border-white/30 bg-white/40 p-1 shadow-lg backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-neutral-900/50',
      // Animations
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      // Highlight & glow layers
      "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-[linear-gradient(180deg,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0)_40%)] before:opacity-70 before:mix-blend-screen before:content-['']",
      "after:pointer-events-none after:absolute after:inset-[-32px] after:rounded-[24px] after:bg-[radial-gradient(100%_60%_at_50%_-20%,rgba(255,255,255,0.5),rgba(255,255,255,0))] after:opacity-40 after:blur-2xl after:content-['']",
      className,
    )}
    {...props}
  />
);
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent: React.FC<
  React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.Content>
> = ({ className, sideOffset = 6, ...props }) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      sideOffset={sideOffset}
      className={cn(
        // Glassmorphism main menu panel
        'text-popover-foreground z-[60] min-w-[10rem] overflow-hidden rounded-2xl border border-white/30 bg-white/40 p-1 shadow-lg backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-neutral-900/50',
        // Animations
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        // Highlight & glow layers
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-[linear-gradient(180deg,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0)_40%)] before:opacity-70 before:mix-blend-screen before:content-['']",
        "after:pointer-events-none after:absolute after:inset-[-32px] after:rounded-[24px] after:bg-[radial-gradient(100%_60%_at_50%_-20%,rgba(255,255,255,0.5),rgba(255,255,255,0))] after:opacity-40 after:blur-2xl after:content-['']",
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
);
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem: React.FC<
  React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
> = ({ className, inset, ...props }) => (
  <DropdownMenuPrimitive.Item
    className={cn(
      'focus:bg-accent/50 focus:text-accent-foreground relative flex cursor-default items-center rounded-md px-2 py-2 text-sm outline-hidden transition-colors select-none data-disabled:pointer-events-none data-disabled:opacity-50',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
);
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem: React.FC<
  React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.CheckboxItem>
> = ({ className, children, checked, ...props }) => (
  <DropdownMenuPrimitive.CheckboxItem
    className={cn(
      'focus:bg-accent/50 focus:text-accent-foreground relative flex cursor-default items-center rounded-md py-2 pr-2 pl-8 text-sm outline-hidden transition-colors select-none data-disabled:pointer-events-none data-disabled:opacity-50',
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <CheckIcon className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
);
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem: React.FC<
  React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.RadioItem>
> = ({ className, children, ...props }) => (
  <DropdownMenuPrimitive.RadioItem
    className={cn(
      'focus:bg-accent/50 focus:text-accent-foreground relative flex cursor-default items-center rounded-md py-2 pr-2 pl-8 text-sm outline-hidden transition-colors select-none data-disabled:pointer-events-none data-disabled:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <DotFilledIcon className="h-4 w-4 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
);
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel: React.FC<
  React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
> = ({ className, inset, ...props }) => (
  <DropdownMenuPrimitive.Label
    className={cn(
      'px-2 py-1.5 text-sm font-semibold',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
);
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator: React.FC<
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
> = ({ className, ...props }) => (
  <DropdownMenuPrimitive.Separator
    className={cn('bg-muted -mx-1 my-1 h-px', className)}
    {...props}
  />
);
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn('ml-auto text-xs tracking-widest opacity-60', className)}
      {...props}
    />
  );
};
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};

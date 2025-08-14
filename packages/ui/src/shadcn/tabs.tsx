'use client';

import * as React from 'react';

import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '../lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList: React.FC<
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
> = ({ className, ...props }) => (
  <TabsPrimitive.List
    className={cn(
      'glass-panel text-muted-foreground inline-flex h-10 items-center justify-center rounded-xl p-1',
      className,
    )}
    {...props}
  />
);
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger: React.FC<
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
> = ({ className, ...props }) => (
  <TabsPrimitive.Trigger
    className={cn(
      'ring-offset-background focus-visible:ring-ring data-[state=active]:bg-background/50 data-[state=active]:text-foreground hover:bg-background/30 inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50',
      className,
    )}
    {...props}
  />
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent: React.FC<
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
> = ({ className, ...props }) => (
  <TabsPrimitive.Content
    className={cn(
      'ring-offset-background focus-visible:ring-ring mt-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
      className,
    )}
    {...props}
  />
);
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };

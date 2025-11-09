'use client';

import React, { useState } from 'react';

import { usePathname } from 'next/navigation';

import { Camera, Maximize2, Minimize2, Play, Square, X } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

import { useDemoMode } from '~/lib/demo-mode-context';

export function DemoPopup() {
  const { isDemoMode, isDemoVisible, toggleDemoMode, toggleDemoVisibility } =
    useDemoMode();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Don't render on self-onboard demo page
  if (pathname === '/self-onboard-demo') {
    return null;
  }

  // Don't render if demo popup is hidden
  if (!isDemoVisible) {
    return (
      <div className="fixed right-4 bottom-4 z-50">
        <Button
          onClick={toggleDemoVisibility}
          variant="outline"
          size="sm"
          className="bg-background/80 hover:bg-background/90 h-10 w-10 rounded-full border-2 p-0 shadow-lg backdrop-blur-sm"
          title="Show demo controls"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Show minimized floating button when not open
  if (!isOpen) {
    return (
      <div className="fixed right-4 bottom-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          variant="default"
          size="sm"
          className="bg-primary/90 hover:bg-primary text-primary-foreground h-12 rounded-full px-4 shadow-lg"
          title="Open demo controls"
        >
          {isDemoMode && (
            <Badge variant="secondary" className="mr-2 px-2 py-0.5 text-xs">
              <Camera className="mr-1 h-3 w-3" />
              Demo
            </Badge>
          )}
          <Play className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Show full popup when open
  return (
    <div className="fixed right-4 bottom-4 z-50">
      <Card className="bg-background/95 w-80 border-2 shadow-2xl backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Play className="text-primary h-4 w-4" />
              Demo Mode
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                onClick={toggleDemoVisibility}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground h-7 w-7 p-0"
                title="Hide demo controls"
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground h-7 w-7 p-0"
                title="Close popup"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <CardDescription className="text-xs">
            Toggle mock data for demonstrations and screenshots
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {isDemoMode && (
              <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-900/20">
                <Camera className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Demo mode active
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={toggleDemoMode}
                variant={isDemoMode ? 'destructive' : 'default'}
                size="sm"
                className="flex-1 text-sm"
              >
                {isDemoMode ? (
                  <>
                    <Square className="mr-2 h-3 w-3" />
                    Exit Demo
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-3 w-3" />
                    Start Demo
                  </>
                )}
              </Button>
            </div>

            {isDemoMode && (
              <div className="text-muted-foreground space-y-1 text-xs">
                <p>✓ Mock agents and campaigns active</p>
                <p>✓ Sample conversations and metrics</p>
                <p>✓ Perfect for screenshots and demos</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

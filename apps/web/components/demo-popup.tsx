'use client';

import React, { useState } from 'react';

import { Camera, Minimize2, Maximize2, Play, Square, X } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Badge } from '@kit/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';

import { useDemoMode } from '~/lib/demo-mode-context';

export function DemoPopup() {
  const { isDemoMode, isDemoVisible, toggleDemoMode, toggleDemoVisibility } = useDemoMode();
  const [isOpen, setIsOpen] = useState(false);

  // Don't render if demo popup is hidden
  if (!isDemoVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={toggleDemoVisibility}
          variant="outline"
          size="sm"
          className="h-10 w-10 rounded-full p-0 shadow-lg border-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
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
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          variant="default"
          size="sm"
          className="h-12 px-4 rounded-full shadow-lg bg-primary/90 hover:bg-primary text-primary-foreground"
          title="Open demo controls"
        >
          {isDemoMode && (
            <Badge variant="secondary" className="mr-2 text-xs px-2 py-0.5">
              <Camera className="h-3 w-3 mr-1" />
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
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-2xl border-2 bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Play className="h-4 w-4 text-primary" />
              Demo Mode
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                onClick={toggleDemoVisibility}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                title="Hide demo controls"
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
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
              <div className="flex items-center gap-2 p-2 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <Camera className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-800 dark:text-green-200 font-medium">
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
                    <Square className="h-3 w-3 mr-2" />
                    Exit Demo
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 mr-2" />
                    Start Demo
                  </>
                )}
              </Button>
            </div>

            {isDemoMode && (
              <div className="text-xs text-muted-foreground space-y-1">
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
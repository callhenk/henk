'use client';

import { Bot, Sparkles, Mic } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Card, CardContent } from '@kit/ui/card';

interface AgentsEmptyStateProps {
  onCreateAgent: () => void;
}

export function AgentsEmptyState({ onCreateAgent }: AgentsEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
        {/* Icon */}
        <div className="relative mb-6">
          <div className="rounded-full bg-primary/10 p-6">
            <Bot className="h-12 w-12 text-primary" />
          </div>
          <div className="absolute -right-1 -top-1 animate-in fade-in duration-500">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
        </div>

        {/* Heading */}
        <h3 className="text-2xl font-semibold mb-2">
          Create Your First AI Agent
        </h3>

        {/* Description */}
        <p className="text-muted-foreground max-w-md mb-8">
          Build an AI-powered voice agent to handle conversations with your donors.
          Customize voice, personality, and knowledge to create natural, engaging calls.
        </p>

        {/* CTA Button */}
        <Button
          onClick={onCreateAgent}
          size="lg"
          className="mb-6"
        >
          <Mic className="mr-2 h-4 w-4" />
          Create Your First Agent
        </Button>

        {/* Quick Tips */}
        <div className="mt-8 pt-8 border-t w-full max-w-2xl">
          <p className="text-sm font-medium text-muted-foreground mb-4">
            Agents can help you:
          </p>
          <div className="grid gap-3 md:grid-cols-3 text-left">
            <div className="flex items-start gap-2">
              <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Personalize Calls</p>
                <p className="text-xs text-muted-foreground">Custom voice and personality</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Scale Outreach</p>
                <p className="text-xs text-muted-foreground">Handle multiple conversations</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Track Performance</p>
                <p className="text-xs text-muted-foreground">Monitor calls and outcomes</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

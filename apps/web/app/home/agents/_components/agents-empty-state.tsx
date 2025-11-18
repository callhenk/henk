'use client';

import { Bot, Mic, Sparkles } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Card, CardContent } from '@kit/ui/card';

interface AgentsEmptyStateProps {
  onCreateAgent: () => void;
}

export function AgentsEmptyState({ onCreateAgent }: AgentsEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center px-4 py-16 text-center">
        {/* Icon */}
        <div className="relative mb-6">
          <div className="bg-primary/10 rounded-full p-6">
            <Bot className="text-primary h-12 w-12" />
          </div>
          <div className="animate-in fade-in absolute -top-1 -right-1 duration-500">
            <Sparkles className="text-primary h-6 w-6 animate-pulse" />
          </div>
        </div>

        {/* Heading */}
        <h3 className="mb-2 text-2xl font-semibold">
          Create Your First AI Agent
        </h3>

        {/* Description */}
        <p className="text-muted-foreground mb-8 max-w-md">
          Build an AI-powered voice agent to handle conversations with your
          donors. Customize voice, personality, and knowledge to create natural,
          engaging calls.
        </p>

        {/* CTA Button */}
        <Button onClick={onCreateAgent} size="lg" className="mb-6">
          <Mic className="mr-2 h-4 w-4" />
          Create Your First Agent
        </Button>

        {/* Quick Tips */}
        <div className="mt-8 w-full max-w-2xl border-t pt-8">
          <p className="text-muted-foreground mb-4 text-sm font-medium">
            Agents can help you:
          </p>
          <div className="grid gap-3 text-left md:grid-cols-3">
            <div className="flex items-start gap-2">
              <div className="bg-primary/10 mt-0.5 rounded-full p-1">
                <div className="bg-primary h-2 w-2 rounded-full" />
              </div>
              <div>
                <p className="text-sm font-medium">Personalize Calls</p>
                <p className="text-muted-foreground text-xs">
                  Custom voice and personality
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-primary/10 mt-0.5 rounded-full p-1">
                <div className="bg-primary h-2 w-2 rounded-full" />
              </div>
              <div>
                <p className="text-sm font-medium">Scale Outreach</p>
                <p className="text-muted-foreground text-xs">
                  Handle multiple conversations
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-primary/10 mt-0.5 rounded-full p-1">
                <div className="bg-primary h-2 w-2 rounded-full" />
              </div>
              <div>
                <p className="text-sm font-medium">Track Performance</p>
                <p className="text-muted-foreground text-xs">
                  Monitor calls and outcomes
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

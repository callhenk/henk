'use client';

import { Megaphone, Play, Sparkles } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Card, CardContent } from '@kit/ui/card';

interface CampaignsEmptyStateProps {
  onCreateCampaign: () => void;
}

export function CampaignsEmptyState({ onCreateCampaign }: CampaignsEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
        {/* Icon */}
        <div className="relative mb-6">
          <div className="rounded-full bg-primary/10 p-6">
            <Megaphone className="h-12 w-12 text-primary" />
          </div>
          <div className="absolute -right-1 -top-1 animate-in fade-in duration-500">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
        </div>

        {/* Heading */}
        <h3 className="text-2xl font-semibold mb-2">
          Start Your First Campaign
        </h3>

        {/* Description */}
        <p className="text-muted-foreground max-w-md mb-8">
          Create your first fundraising campaign to start reaching out to donors with AI-powered voice calls.
          Track performance, manage leads, and grow your donations.
        </p>

        {/* CTA Button */}
        <Button
          onClick={onCreateCampaign}
          size="lg"
          className="mb-6"
        >
          <Play className="mr-2 h-4 w-4" />
          Create Your First Campaign
        </Button>

        {/* Quick Tips */}
        <div className="mt-8 pt-8 border-t w-full max-w-2xl">
          <p className="text-sm font-medium text-muted-foreground mb-4">
            What you'll need:
          </p>
          <div className="grid gap-3 md:grid-cols-3 text-left">
            <div className="flex items-start gap-2">
              <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">AI Agent</p>
                <p className="text-xs text-muted-foreground">Set up your voice agent first</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Lead Lists</p>
                <p className="text-xs text-muted-foreground">Import or create contact lists</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Campaign Goals</p>
                <p className="text-xs text-muted-foreground">Define your fundraising targets</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

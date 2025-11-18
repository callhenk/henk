'use client';

import { Megaphone, Play, Sparkles } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Card, CardContent } from '@kit/ui/card';

interface CampaignsEmptyStateProps {
  onCreateCampaign: () => void;
}

export function CampaignsEmptyState({
  onCreateCampaign,
}: CampaignsEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center px-4 py-16 text-center">
        {/* Icon */}
        <div className="relative mb-6">
          <div className="bg-primary/10 rounded-full p-6">
            <Megaphone className="text-primary h-12 w-12" />
          </div>
          <div className="animate-in fade-in absolute -top-1 -right-1 duration-500">
            <Sparkles className="text-primary h-6 w-6 animate-pulse" />
          </div>
        </div>

        {/* Heading */}
        <h3 className="mb-2 text-2xl font-semibold">
          Start Your First Campaign
        </h3>

        {/* Description */}
        <p className="text-muted-foreground mb-8 max-w-md">
          Create your first fundraising campaign to start reaching out to donors
          with AI-powered voice calls. Track performance, manage leads, and grow
          your donations.
        </p>

        {/* CTA Button */}
        <Button onClick={onCreateCampaign} size="lg" className="mb-6">
          <Play className="mr-2 h-4 w-4" />
          Create Your First Campaign
        </Button>

        {/* Quick Tips */}
        <div className="mt-8 w-full max-w-2xl border-t pt-8">
          <p className="text-muted-foreground mb-4 text-sm font-medium">
            What you&apos;ll need:
          </p>
          <div className="grid gap-3 text-left md:grid-cols-3">
            <div className="flex items-start gap-2">
              <div className="bg-primary/10 mt-0.5 rounded-full p-1">
                <div className="bg-primary h-2 w-2 rounded-full" />
              </div>
              <div>
                <p className="text-sm font-medium">AI Agent</p>
                <p className="text-muted-foreground text-xs">
                  Set up your voice agent first
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-primary/10 mt-0.5 rounded-full p-1">
                <div className="bg-primary h-2 w-2 rounded-full" />
              </div>
              <div>
                <p className="text-sm font-medium">Lead Lists</p>
                <p className="text-muted-foreground text-xs">
                  Import or create contact lists
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-primary/10 mt-0.5 rounded-full p-1">
                <div className="bg-primary h-2 w-2 rounded-full" />
              </div>
              <div>
                <p className="text-sm font-medium">Campaign Goals</p>
                <p className="text-muted-foreground text-xs">
                  Define your fundraising targets
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

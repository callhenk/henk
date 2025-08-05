'use client';

import { useState } from 'react';

import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

interface CampaignControlsProps {
  campaignId: string;
  campaignStatus: 'draft' | 'active' | 'paused' | 'completed';
  onStatusChange: (newStatus: string) => void;
}

export function CampaignControls({
  campaignId,
  campaignStatus,
  onStatusChange,
}: CampaignControlsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleStartCampaign = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        onStatusChange('active');
        toast.success(
          result.message || 'Campaign is now active and processing calls.',
        );
      } else {
        throw new Error(result.error || 'Failed to start campaign');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopCampaign = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        onStatusChange('paused');
        toast.success(result.message || 'Campaign has been paused.');
      } else {
        throw new Error(result.error || 'Failed to stop campaign');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'paused':
        return 'text-yellow-600 bg-yellow-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Controls</CardTitle>
        <CardDescription>Manage campaign status and operations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Status:</span>
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
              campaignStatus,
            )}`}
          >
            {campaignStatus.charAt(0).toUpperCase() + campaignStatus.slice(1)}
          </span>
        </div>

        {/* Control Buttons */}
        <div className="flex space-x-2">
          {campaignStatus === 'draft' && (
            <Button
              onClick={handleStartCampaign}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Starting...' : 'Start Campaign'}
            </Button>
          )}

          {campaignStatus === 'active' && (
            <Button
              onClick={handleStopCampaign}
              disabled={isLoading}
              variant="outline"
              className="flex-1"
            >
              {isLoading ? 'Stopping...' : 'Stop Campaign'}
            </Button>
          )}

          {campaignStatus === 'paused' && (
            <Button
              onClick={handleStartCampaign}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Starting...' : 'Resume Campaign'}
            </Button>
          )}
        </div>

        {/* Status Information */}
        <div className="text-muted-foreground text-sm">
          {campaignStatus === 'active' && (
            <p>
              Campaign is currently running. The system will automatically
              process calls according to your schedule and settings.
            </p>
          )}
          {campaignStatus === 'paused' && (
            <p>
              Campaign is paused. No new calls will be initiated until you
              resume the campaign.
            </p>
          )}
          {campaignStatus === 'draft' && (
            <p>
              Campaign is in draft mode. Start the campaign to begin processing
              calls.
            </p>
          )}
          {campaignStatus === 'completed' && (
            <p>
              Campaign has been completed. All calls have been processed
              according to your settings.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

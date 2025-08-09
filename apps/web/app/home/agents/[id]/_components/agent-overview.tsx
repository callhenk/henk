'use client';

import { Clock, Info, Phone, TrendingUp } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@kit/ui/tooltip';

interface AgentOverviewProps {
  agent: {
    id: string;
    name: string;
    description?: string | null;
    status: string;
    voice_type?: string | null;
    updated_at?: string | null;
    starting_message?: string | null;
  };
  conversations: Array<{
    agent_id: string;
    outcome?: string | null;
    status?: string;
    duration_seconds?: number | null;
  }>;
  campaigns: Array<{
    id: string;
    name: string;
    agent_id: string | null;
  }>;
}

export function AgentOverview({
  agent,
  conversations,
  campaigns,
}: AgentOverviewProps) {
  // Calculate agent performance metrics
  const agentConversations = conversations.filter(
    (conv) => conv.agent_id === agent.id,
  );
  const agentCampaigns = campaigns.filter(
    (campaign) => campaign.agent_id === agent.id,
  );

  const callsHandled = agentConversations.length;
  const successfulCalls = agentConversations.filter(
    (conv) => conv.outcome === 'donated' || conv.status === 'completed',
  ).length;
  const conversionRate =
    callsHandled > 0 ? Math.round((successfulCalls / callsHandled) * 100) : 0;
  const activeHours = Math.round(
    agentConversations.reduce(
      (sum, conv) => sum + (conv.duration_seconds || 0),
      0,
    ) / 3600,
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getVoiceTypeLabel = (voiceType: string | null | undefined): string => {
    if (!voiceType) return 'Default';
    const voiceTypes = [
      { value: 'ai_generated', label: 'AI Generated' },
      { value: 'custom', label: 'Custom Voice' },
    ];
    const voiceTypeOption = voiceTypes.find((type) => type.value === voiceType);
    return voiceTypeOption?.label || voiceType;
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-base">Calls Handled</CardTitle>
              <CardDescription>Total calls made</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-2xl font-bold">{callsHandled}</p>
              <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-lg">
                <Phone className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-base">Conversion Rate</CardTitle>
              <CardDescription>Successful calls</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-2xl font-bold">{conversionRate}%</p>
              <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-lg">
                <TrendingUp className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-base">Active Hours</CardTitle>
              <CardDescription>Hours this month</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-2xl font-bold">{activeHours}</p>
              <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-lg">
                <Clock className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Agent Details & Campaigns */}
          <div className="space-y-6 lg:col-span-2">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Agent Details</CardTitle>
                <CardDescription>
                  Key information about your agent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <div className="flex items-center gap-1">
                      <label className="text-sm font-medium">Language</label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            aria-label="About language"
                            className="text-muted-foreground hover:text-foreground inline-flex h-4 w-4 items-center justify-center"
                          >
                            <Info className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          The language your agent uses during calls.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="mt-1 text-lg font-semibold">English</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <label className="text-sm font-medium">Voice Type</label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            aria-label="About voice type"
                            className="text-muted-foreground hover:text-foreground inline-flex h-4 w-4 items-center justify-center"
                          >
                            <Info className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          The selected voice profile used for speech synthesis.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="mt-1 text-lg font-semibold">
                      {getVoiceTypeLabel(agent.voice_type)}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <label className="text-sm font-medium">Last Edited</label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            aria-label="About last edited"
                            className="text-muted-foreground hover:text-foreground inline-flex h-4 w-4 items-center justify-center"
                          >
                            <Info className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          The last time this agent configuration was updated.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="mt-1 text-lg font-semibold">
                      {agent.updated_at
                        ? formatDate(agent.updated_at)
                        : 'Never'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Linked Campaigns</CardTitle>
                <CardDescription>
                  Campaigns this agent is assigned to
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {agentCampaigns.length > 0 ? (
                    agentCampaigns.map((campaign, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <span className="font-medium">{campaign.name}</span>
                        <Badge variant="success">Active</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border p-6 text-center">
                      <p className="text-muted-foreground text-sm">
                        No campaigns assigned yet
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6 lg:col-span-1">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Agent Description</CardTitle>
                <CardDescription>
                  Overview and details about your agent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border p-4">
                  <p className="text-sm">
                    {agent.description || 'No description available'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Starting Message</CardTitle>
                <CardDescription>
                  The initial message the agent uses when starting a call
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border p-4">
                  <p className="text-sm">
                    {agent.starting_message || 'No starting message available'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

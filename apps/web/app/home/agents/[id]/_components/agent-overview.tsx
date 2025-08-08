'use client';

import { Clock, Phone, TrendingUp, Users } from 'lucide-react';

import { Badge } from '@kit/ui/badge';

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
    <div className="mx-auto max-w-7xl">
      {/* Hero Section */}
      <div className="mb-8 text-center">
        <div className="bg-muted mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl">
          <Users className="h-8 w-8" />
        </div>
        <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Agent Overview
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          Monitor your agent&apos;s performance, track key metrics, and manage
          campaign assignments.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-card/60 supports-[backdrop-filter]:bg-card/60 rounded-xl border p-6 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Calls Handled
              </p>
              <p className="text-2xl font-bold">{callsHandled}</p>
              <p className="text-muted-foreground text-xs">Total calls made</p>
            </div>
            <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-lg">
              <Phone className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-card/60 supports-[backdrop-filter]:bg-card/60 rounded-xl border p-6 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Conversion Rate
              </p>
              <p className="text-2xl font-bold">{conversionRate}%</p>
              <p className="text-muted-foreground text-xs">Successful calls</p>
            </div>
            <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-card/60 supports-[backdrop-filter]:bg-card/60 rounded-xl border p-6 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Active Hours
              </p>
              <p className="text-2xl font-bold">{activeHours}</p>
              <p className="text-muted-foreground text-xs">Hours this month</p>
            </div>
            <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-lg">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Agent Details & Campaigns */}
        <div className="space-y-6 lg:col-span-2">
          {/* Agent Details */}
          <div className="bg-card/60 supports-[backdrop-filter]:bg-card/60 rounded-xl border p-6 backdrop-blur">
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Agent Details</h3>
                  <p className="text-muted-foreground text-sm">
                    Key information about your agent
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label className="text-sm font-medium">Language</label>
                <p className="mt-1 text-lg font-semibold">English</p>
              </div>
              <div>
                <label className="text-sm font-medium">Voice Type</label>
                <p className="mt-1 text-lg font-semibold">
                  {getVoiceTypeLabel(agent.voice_type)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Last Edited</label>
                <p className="mt-1 text-lg font-semibold">
                  {agent.updated_at ? formatDate(agent.updated_at) : 'Never'}
                </p>
              </div>
            </div>
          </div>

          {/* Linked Campaigns */}
          <div className="bg-card/60 supports-[backdrop-filter]:bg-card/60 rounded-xl border p-6 backdrop-blur">
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Linked Campaigns</h3>
                  <p className="text-sm">Campaigns this agent is assigned to</p>
                </div>
              </div>
            </div>
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
          </div>
        </div>

        {/* Right Column - Agent Info */}
        <div className="space-y-6 lg:col-span-1">
          {/* Agent Description */}
          <div className="bg-card/60 supports-[backdrop-filter]:bg-card/60 rounded-xl border p-6 backdrop-blur">
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Agent Description</h3>
                  <p className="text-sm">
                    Overview and details about your agent
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm">
                {agent.description || 'No description available'}
              </p>
            </div>
          </div>

          {/* Starting Message */}
          <div className="bg-card/60 supports-[backdrop-filter]:bg-card/60 rounded-xl border p-6 backdrop-blur">
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Starting Message</h3>
                  <p className="text-sm">
                    The initial message the agent uses when starting a call
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm">
                {agent.starting_message || 'No starting message available'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

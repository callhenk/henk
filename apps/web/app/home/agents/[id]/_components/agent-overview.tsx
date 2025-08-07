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
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50">
          <Users className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Agent Overview
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Monitor your agent&apos;s performance, track key metrics, and manage
          campaign assignments.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Calls Handled</p>
              <p className="text-2xl font-bold text-gray-900">{callsHandled}</p>
              <p className="text-xs text-gray-500">Total calls made</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
              <Phone className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Conversion Rate
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {conversionRate}%
              </p>
              <p className="text-xs text-gray-500">Successful calls</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Hours</p>
              <p className="text-2xl font-bold text-gray-900">{activeHours}</p>
              <p className="text-xs text-gray-500">Hours this month</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Agent Details & Campaigns */}
        <div className="space-y-6 lg:col-span-2">
          {/* Agent Details */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Agent Details
                  </h3>
                  <p className="text-sm text-gray-600">
                    Key information about your agent
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Language
                </label>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  English
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Voice Type
                </label>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {getVoiceTypeLabel(agent.voice_type)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Last Edited
                </label>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {agent.updated_at ? formatDate(agent.updated_at) : 'Never'}
                </p>
              </div>
            </div>
          </div>

          {/* Linked Campaigns */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Linked Campaigns
                  </h3>
                  <p className="text-sm text-gray-600">
                    Campaigns this agent is assigned to
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {agentCampaigns.length > 0 ? (
                agentCampaigns.map((campaign, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4"
                  >
                    <span className="font-medium text-gray-900">
                      {campaign.name}
                    </span>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                      Active
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                  <p className="text-sm text-gray-500">
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
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Agent Description
                  </h3>
                  <p className="text-sm text-gray-600">
                    Overview and details about your agent
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-700">
                {agent.description || 'No description available'}
              </p>
            </div>
          </div>

          {/* Starting Message */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Starting Message
                  </h3>
                  <p className="text-sm text-gray-600">
                    The initial message the agent uses when starting a call
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-700">
                {agent.starting_message || 'No starting message available'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

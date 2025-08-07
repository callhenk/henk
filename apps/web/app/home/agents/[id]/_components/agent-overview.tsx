'use client';

import { Clock, Phone, TrendingUp, Users } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

interface AgentOverviewProps {
  agent: {
    id: string;
    name: string;
    description?: string | null;
    status: string;
    voice_type?: string | null;
    updated_at?: string | null;
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
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
      {/* Stats Cards */}
      <div className="lg:col-span-2">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Calls Handled
              </CardTitle>
              <Phone className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{callsHandled}</div>
              <p className="text-muted-foreground text-xs">Total calls made</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Conversion Rate
              </CardTitle>
              <TrendingUp className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionRate}%</div>
              <p className="text-muted-foreground text-xs">Successful calls</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Hours
              </CardTitle>
              <Clock className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeHours}</div>
              <p className="text-muted-foreground text-xs">Hours this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Agent Details */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Agent Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Language
                </label>
                <p className="text-base">English</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Voice Type
                </label>
                <p className="text-base">
                  {getVoiceTypeLabel(agent.voice_type)}
                </p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Last Edited
                </label>
                <p className="text-base">
                  {agent.updated_at ? formatDate(agent.updated_at) : 'Never'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Linked Campaigns */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Linked Campaigns</CardTitle>
            <CardDescription>
              Campaigns this agent is assigned to
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {agentCampaigns.map((campaign, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <span className="font-medium">{campaign.name}</span>
                  <Badge
                    variant="outline"
                    className="hover:bg-muted transition-colors"
                  >
                    Active
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-4 sm:space-y-6 lg:col-span-1">
        {/* Default Script */}
        <Card>
          <CardHeader>
            <CardTitle>Default Script</CardTitle>
            <CardDescription>
              The agent&apos;s primary conversation starter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm">
                {agent.description || 'No script available'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

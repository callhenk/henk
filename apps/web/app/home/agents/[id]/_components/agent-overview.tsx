'use client';

import Link from 'next/link';

import {
  Calendar,
  Clock,
  MessageSquare,
  Mic,
  Phone,
  TrendingUp,
} from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { TooltipProvider } from '@kit/ui/tooltip';

interface AgentOverviewProps {
  agent: {
    id: string;
    name: string;
    description?: string | null;
    donor_context?: string | null;
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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getVoiceTypeLabel = (_voiceType: string | null | undefined): string => {
    // For now, only AI Generated is supported
    return 'AI Generated';
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Calls Handled
                  </p>
                  <p className="mt-2 text-3xl font-bold">{callsHandled}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Total conversations
                  </p>
                </div>
                <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-lg">
                  <Phone className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Conversion Rate
                  </p>
                  <p className="mt-2 text-3xl font-bold">{conversionRate}%</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {successfulCalls} of {callsHandled} successful
                  </p>
                </div>
                <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-lg">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Active Hours
                  </p>
                  <p className="mt-2 text-3xl font-bold">{activeHours}h</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Total talk time
                  </p>
                </div>
                <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-lg">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Agent Details & Campaigns */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="flex items-start gap-3 rounded-lg border p-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
                      <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-muted-foreground text-xs font-medium">
                        Language
                      </p>
                      <p className="mt-0.5 truncate font-semibold">English</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border p-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950">
                      <Mic className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-muted-foreground text-xs font-medium">
                        Voice Type
                      </p>
                      <p className="mt-0.5 truncate font-semibold">
                        {getVoiceTypeLabel(agent.voice_type)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border p-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-950">
                      <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-muted-foreground text-xs font-medium">
                        Last Edited
                      </p>
                      <p className="mt-0.5 truncate text-sm font-semibold">
                        {agent.updated_at
                          ? formatDate(agent.updated_at)
                          : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Linked Campaigns</CardTitle>
                    <CardDescription>
                      {agentCampaigns.length}{' '}
                      {agentCampaigns.length === 1 ? 'campaign' : 'campaigns'}{' '}
                      using this agent
                    </CardDescription>
                  </div>
                  {agentCampaigns.length > 0 && (
                    <Badge variant="secondary">{agentCampaigns.length}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {agentCampaigns.length > 0 ? (
                    agentCampaigns.map((campaign) => (
                      <Link
                        key={campaign.id}
                        href={`/home/campaigns/${campaign.id}`}
                        className="hover:border-primary hover:bg-primary/5 group flex items-center justify-between rounded-lg border p-3 transition-all"
                      >
                        <span className="group-hover:text-primary font-medium">
                          {campaign.name}
                        </span>
                        <Badge variant="success" className="text-xs">
                          Active
                        </Badge>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                      <p className="text-muted-foreground text-sm">
                        No campaigns assigned yet
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Create a campaign to start using this agent
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6 lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Context Prompt</CardTitle>
                <CardDescription>
                  The prompt that guides how the agent responds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 max-h-64 overflow-y-auto rounded-lg border p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {agent.donor_context || 'No context prompt available'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Starting Message</CardTitle>
                <CardDescription>
                  The initial message the agent uses when starting a call
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 rounded-lg border p-4">
                  <p className="text-sm leading-relaxed">
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

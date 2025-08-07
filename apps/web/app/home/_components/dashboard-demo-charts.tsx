'use client';

import { useMemo } from 'react';

import { useRouter } from 'next/navigation';

import {
  ArrowDown,
  ArrowUp,
  CheckCircle,
  Clock,
  DollarSign,
  Menu,
  MessageSquare,
  Pause,
  Phone,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from 'recharts';

// Import database types
import type { Tables } from '@kit/supabase/database';
// Import our Supabase hooks
import { useAgents } from '@kit/supabase/hooks/agents/use-agents';
import { useCampaigns } from '@kit/supabase/hooks/campaigns/use-campaigns';
import { useConversations } from '@kit/supabase/hooks/conversations/use-conversations';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@kit/ui/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';

type Agent = Tables<'agents'>['Row'];
type Campaign = Tables<'campaigns'>['Row'];
type Conversation = Tables<'conversations'>['Row'];

export default function DashboardDemo() {
  // Fetch real data using our hooks
  const { data: agents = [], isLoading: agentsLoading } = useAgents();
  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns();
  const { data: conversations = [], isLoading: conversationsLoading } =
    useConversations();

  // Calculate metrics from real data
  const callMetrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayConversations = conversations.filter((conv) => {
      if (!conv.created_at) return false;
      const convDate = new Date(conv.created_at);
      return convDate >= today;
    });

    const yesterdayConversations = conversations.filter((conv) => {
      if (!conv.created_at) return false;
      const convDate = new Date(conv.created_at);
      return convDate >= yesterday && convDate < today;
    });

    const totalRevenue = todayConversations.reduce((sum, conv) => {
      return sum + (conv.outcome === 'donated' ? 100 : 0);
    }, 0);

    const yesterdayRevenue = yesterdayConversations.reduce((sum, conv) => {
      return sum + (conv.outcome === 'donated' ? 100 : 0);
    }, 0);

    // Calculate trend percentage
    const callTrend =
      yesterdayConversations.length > 0
        ? ((todayConversations.length - yesterdayConversations.length) /
            yesterdayConversations.length) *
          100
        : todayConversations.length > 0
          ? 100
          : 0;

    const revenueTrend =
      yesterdayRevenue > 0
        ? ((totalRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
        : totalRevenue > 0
          ? 100
          : 0;

    return {
      today: todayConversations.length,
      thisWeek: conversations.filter((conv) => {
        if (!conv.created_at) return false;
        const convDate = new Date(conv.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return convDate >= weekAgo;
      }).length,
      revenue: totalRevenue,
      avgDuration: '3m 24s',
      callTrend: Math.round(callTrend * 10) / 10,
      revenueTrend: Math.round(revenueTrend * 10) / 10,
    };
  }, [conversations]);

  const conversionData = useMemo(() => {
    const successfulConversations = conversations.filter(
      (conv) => conv.outcome === 'donated' || conv.status === 'completed',
    );

    const rate =
      conversations.length > 0
        ? (successfulConversations.length / conversations.length) * 100
        : 0;

    // Calculate conversion trend by comparing with previous period
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayConversations = conversations.filter((conv) => {
      if (!conv.created_at) return false;
      const convDate = new Date(conv.created_at);
      return convDate >= today;
    });

    const yesterdayConversations = conversations.filter((conv) => {
      if (!conv.created_at) return false;
      const convDate = new Date(conv.created_at);
      return convDate >= yesterday && convDate < today;
    });

    const todaySuccessful = todayConversations.filter(
      (conv) => conv.outcome === 'donated' || conv.status === 'completed',
    ).length;

    const yesterdaySuccessful = yesterdayConversations.filter(
      (conv) => conv.outcome === 'donated' || conv.status === 'completed',
    ).length;

    const todayRate =
      todayConversations.length > 0
        ? (todaySuccessful / todayConversations.length) * 100
        : 0;

    const yesterdayRate =
      yesterdayConversations.length > 0
        ? (yesterdaySuccessful / yesterdayConversations.length) * 100
        : 0;

    const conversionTrend =
      yesterdayRate > 0
        ? ((todayRate - yesterdayRate) / yesterdayRate) * 100
        : todayRate > 0
          ? 100
          : 0;

    return {
      rate: Math.round(rate * 10) / 10,
      successful: successfulConversations.length,
      total: conversations.length,
      avgDonation: 98.2,
      conversionTrend: Math.round(conversionTrend * 10) / 10,
    };
  }, [conversations]);

  const agentStatus = useMemo(() => {
    const activeAgents = agents.filter((agent) => agent.status === 'active');

    // Calculate agent trend by comparing with previous period
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayActiveAgents = agents.filter((agent) => {
      const agentConversations = conversations.filter((conv) => {
        if (!conv.created_at) return false;
        const convDate = new Date(conv.created_at);
        return conv.agent_id === agent.id && convDate >= today;
      });
      return agent.status === 'active' && agentConversations.length > 0;
    });

    const yesterdayActiveAgents = agents.filter((agent) => {
      const agentConversations = conversations.filter((conv) => {
        if (!conv.created_at) return false;
        const convDate = new Date(conv.created_at);
        return (
          conv.agent_id === agent.id &&
          convDate >= yesterday &&
          convDate < today
        );
      });
      return agent.status === 'active' && agentConversations.length > 0;
    });

    const agentTrend =
      yesterdayActiveAgents.length > 0
        ? ((todayActiveAgents.length - yesterdayActiveAgents.length) /
            yesterdayActiveAgents.length) *
          100
        : todayActiveAgents.length > 0
          ? 100
          : 0;

    return {
      active: activeAgents.length,
      total: agents.length,
      agentTrend: Math.round(agentTrend * 10) / 10,
      statuses: agents.map((agent) => ({
        name: agent.name,
        status: agent.status,
        calls: conversations.filter((conv) => conv.agent_id === agent.id)
          .length,
        success: conversations.filter(
          (conv) =>
            conv.agent_id === agent.id &&
            (conv.outcome === 'donated' || conv.status === 'completed'),
        ).length,
      })),
    };
  }, [agents, conversations]);

  // Show loading state if any data is still loading
  if (agentsLoading || campaignsLoading || conversationsLoading) {
    return (
      <div className="animate-in fade-in flex flex-col space-y-4 duration-500">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="bg-muted mb-2 h-4 w-32 animate-pulse rounded" />
                <div className="bg-muted mb-2 h-3 w-24 animate-pulse rounded" />
                <div className="bg-muted h-8 w-16 animate-pulse rounded" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="bg-muted mb-2 h-5 w-48 animate-pulse rounded" />
                <div className="bg-muted h-3 w-32 animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="bg-muted h-64 w-full animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={'animate-in fade-in flex flex-col space-y-4 duration-500'}>
      {/* Key Metrics Cards */}
      <div className={'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'}>
        <Card>
          <CardHeader>
            <CardTitle className={'flex items-center gap-2.5'}>
              <Phone className="h-5 w-5 text-blue-500" />
              <span>Calls Today</span>
              <Trend
                trend={
                  callMetrics.callTrend > 0
                    ? 'up'
                    : callMetrics.callTrend < 0
                      ? 'down'
                      : 'stale'
                }
              >
                {callMetrics.callTrend}%
              </Trend>
            </CardTitle>
            <CardDescription>
              <span>Total calls made today</span>
            </CardDescription>
            <div>
              <Figure>{callMetrics.today}</Figure>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={'flex items-center gap-2.5'}>
              <DollarSign className="h-5 w-5 text-green-500" />
              <span>Conversion Rate</span>
              <Trend
                trend={
                  conversionData.conversionTrend > 0
                    ? 'up'
                    : conversionData.conversionTrend < 0
                      ? 'down'
                      : 'stale'
                }
              >
                {conversionData.conversionTrend}%
              </Trend>
            </CardTitle>
            <CardDescription>
              <span>Successful donations rate</span>
            </CardDescription>
            <div>
              <Figure>{conversionData.rate}%</Figure>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={'flex items-center gap-2.5'}>
              <Users className="h-5 w-5 text-purple-500" />
              <span>Active Agents</span>
              <Trend
                trend={
                  agentStatus.agentTrend > 0
                    ? 'up'
                    : agentStatus.agentTrend < 0
                      ? 'down'
                      : 'stale'
                }
              >
                {agentStatus.agentTrend}%
              </Trend>
            </CardTitle>
            <CardDescription>
              <span>Currently running agents</span>
            </CardDescription>
            <div>
              <Figure>{agentStatus.active}</Figure>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={'flex items-center gap-2.5'}>
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <span>Revenue Today</span>
              <Trend
                trend={
                  callMetrics.revenueTrend > 0
                    ? 'up'
                    : callMetrics.revenueTrend < 0
                      ? 'down'
                      : 'stale'
                }
              >
                {callMetrics.revenueTrend}%
              </Trend>
            </CardTitle>
            <CardDescription>
              <span>Total donations today</span>
            </CardDescription>
            <div>
              <Figure>${callMetrics.revenue}</Figure>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CallVolumeChart conversations={conversations} />
        <ConversionChart conversations={conversations} />
      </div>

      {/* Agent Status and Campaign Summaries */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AgentStatusCard agents={agents} conversations={conversations} />
        <CampaignSummariesCard
          campaigns={campaigns}
          conversations={conversations}
        />
      </div>

      {/* Recent Conversations */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Recent Conversations</CardTitle>
            <CardDescription>Latest calls and their outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <ConversationsTable
              conversations={conversations}
              campaigns={campaigns}
              agents={agents}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CallVolumeChart({ conversations }: { conversations: Conversation[] }) {
  const chartData = useMemo(() => {
    // Group conversations by day of the week
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = daysOfWeek.map((day, index) => {
      const dayDate = new Date(today);
      dayDate.setDate(today.getDate() - (today.getDay() - index));
      dayDate.setHours(0, 0, 0, 0);

      const nextDay = new Date(dayDate);
      nextDay.setDate(dayDate.getDate() + 1);

      const dayConversations = conversations.filter((conv) => {
        if (!conv.created_at) return false;
        const convDate = new Date(conv.created_at);
        return convDate >= dayDate && convDate < nextDay;
      });

      const successful = dayConversations.filter(
        (conv) => conv.outcome === 'donated' || conv.status === 'completed',
      ).length;

      return {
        date: day,
        calls: dayConversations.length,
        successful,
      };
    });

    return weekData;
  }, [conversations]);

  const chartConfig = {
    calls: {
      label: 'Total Calls',
      color: 'var(--chart-1)',
    },
    successful: {
      label: 'Successful',
      color: 'var(--chart-2)',
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Volume This Week</CardTitle>
        <CardDescription>
          Daily call volume and successful conversions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className={'h-64 w-full'} config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="calls" fill="var(--color-calls)" />
            <Bar dataKey="successful" fill="var(--color-successful)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function ConversionChart({ conversations }: { conversations: Conversation[] }) {
  const chartData = useMemo(() => {
    // Group conversations by hour
    const hours = [
      '9AM',
      '10AM',
      '11AM',
      '12PM',
      '1PM',
      '2PM',
      '3PM',
      '4PM',
      '5PM',
    ];
    return hours.map((hour) => {
      const hourConversations = conversations.filter((conv) => {
        if (!conv.created_at) return false;
        const convDate = new Date(conv.created_at);
        const convHour = convDate.getHours();
        const hourNum = parseInt(hour.replace('AM', '').replace('PM', ''));
        return (
          convHour ===
          (hour.includes('PM') && hourNum !== 12 ? hourNum + 12 : hourNum)
        );
      });

      const successful = hourConversations.filter(
        (conv) => conv.outcome === 'donated' || conv.status === 'completed',
      ).length;

      const rate =
        hourConversations.length > 0
          ? (successful / hourConversations.length) * 100
          : 0;

      return {
        time: hour,
        rate: Math.round(rate),
      };
    });
  }, [conversations]);

  const chartConfig = {
    rate: {
      label: 'Conversion Rate',
      color: 'var(--chart-1)',
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Rate by Hour</CardTitle>
        <CardDescription>Best times for successful donations</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className={'h-64 w-full'} config={chartConfig}>
          <LineChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="rate"
              type="natural"
              stroke="var(--color-rate)"
              strokeWidth={2}
              dot={true}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function AgentStatusCard({
  agents,
  conversations,
}: {
  agents: Agent[];
  conversations: Conversation[];
}) {
  const router = useRouter();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused':
      case 'agent_paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} hour ago`;
    return `${Math.floor(diffInMinutes / 1440)} day ago`;
  };

  const handleAgentClick = (agentId: string) => {
    router.push(`/home/agents/${agentId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Status</CardTitle>
        <CardDescription>
          Current agent activity and performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 max-h-80 space-y-4 overflow-y-auto">
          {agents.map((agent) => {
            const agentConversations = conversations.filter(
              (conv) => conv.agent_id === agent.id,
            );
            const successful = agentConversations.filter(
              (conv) =>
                conv.outcome === 'donated' || conv.status === 'completed',
            ).length;

            const lastCall =
              agentConversations.length > 0
                ? formatTimeAgo(agentConversations[0]?.created_at || null)
                : 'No calls yet';

            return (
              <div
                key={agent.id}
                className="hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors"
                onClick={() => handleAgentClick(agent.id)}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(agent.status)}
                  <div>
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-muted-foreground text-sm">
                      {agentConversations.length} calls • {successful}{' '}
                      successful
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-muted-foreground text-sm">
                    {lastCall}
                  </div>
                  <Badge
                    variant={
                      agent.status === 'active' ? 'default' : 'secondary'
                    }
                  >
                    {agent.status === 'agent_paused' ? 'paused' : agent.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function CampaignSummariesCard({
  campaigns,
  conversations,
}: {
  campaigns: Campaign[];
  conversations: Conversation[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Campaigns</CardTitle>
        <CardDescription>Campaign performance overview</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 max-h-80 space-y-4 overflow-y-auto">
          {campaigns.map((campaign) => {
            const campaignConversations = conversations.filter(
              (conv) => conv.campaign_id === campaign.id,
            );
            const successful = campaignConversations.filter(
              (conv) =>
                conv.outcome === 'donated' || conv.status === 'completed',
            ).length;

            const revenue = successful * 100; // Placeholder calculation

            return (
              <div
                key={campaign.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <div className="font-medium">{campaign.name}</div>
                  <div className="text-muted-foreground text-sm">
                    {campaignConversations.length} calls • {successful}{' '}
                    conversions
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${revenue}</div>
                  <Badge
                    variant={
                      campaign.status === 'active' ? 'default' : 'secondary'
                    }
                  >
                    {campaign.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function ConversationsTable({
  conversations,
  campaigns,
  agents,
}: {
  conversations: Conversation[];
  campaigns: Campaign[];
  agents: Agent[];
}) {
  const router = useRouter();

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'donated':
        return <Badge className="bg-green-100 text-green-800">Donated</Badge>;
      case 'callback requested':
        return <Badge className="bg-blue-100 text-blue-800">Callback</Badge>;
      case 'no_answer':
        return <Badge className="bg-gray-100 text-gray-800">No Answer</Badge>;
      default:
        return <Badge variant="secondary">{outcome}</Badge>;
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} hour ago`;
    return `${Math.floor(diffInMinutes / 1440)} day ago`;
  };

  const getCampaignName = (campaignId: string | null) => {
    if (!campaignId) return 'Unknown Campaign';
    const campaign = campaigns.find((c) => c.id === campaignId);
    return campaign?.name || 'Unknown Campaign';
  };

  const getAgentName = (agentId: string | null) => {
    if (!agentId) return 'Unknown Agent';
    const agent = agents.find((a) => a.id === agentId);
    return agent?.name || 'Unknown Agent';
  };

  // Empty state
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageSquare className="text-muted-foreground mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-semibold">No recent conversations</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Recent conversations will appear here once your AI agents start making
          calls. Check back after your campaigns are active and calls begin.
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/home/conversations')}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            View All Conversations
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/home/campaigns')}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Check Campaigns
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Donor</TableHead>
          <TableHead>Campaign</TableHead>
          <TableHead>Agent</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Outcome</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {conversations.slice(0, 10).map((conversation) => (
          <TableRow key={conversation.id}>
            <TableCell className="font-medium">
              {/* Would need to join with leads table to get donor name */}
              Donor {conversation.lead_id?.slice(0, 8) || 'Unknown'}
            </TableCell>
            <TableCell>{getCampaignName(conversation.campaign_id)}</TableCell>
            <TableCell>{getAgentName(conversation.agent_id)}</TableCell>
            <TableCell>
              {conversation.duration_seconds
                ? formatDuration(conversation.duration_seconds)
                : 'N/A'}
            </TableCell>
            <TableCell>
              {getOutcomeBadge(conversation.outcome || conversation.status)}
            </TableCell>
            <TableCell>
              {conversation.outcome === 'donated' ? '$100' : '-'}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatTimeAgo(conversation.created_at || null)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function Figure(props: React.PropsWithChildren) {
  return (
    <div className={'font-heading text-2xl font-semibold'}>
      {props.children}
    </div>
  );
}

function Trend(
  props: React.PropsWithChildren<{
    trend: 'up' | 'down' | 'stale';
  }>,
) {
  const Icon = useMemo(() => {
    switch (props.trend) {
      case 'up':
        return <ArrowUp className={'h-3 w-3 text-green-500'} />;
      case 'down':
        return <ArrowDown className={'text-destructive h-3 w-3'} />;
      case 'stale':
        return <Menu className={'h-3 w-3 text-orange-500'} />;
    }
  }, [props.trend]);

  return (
    <div>
      <BadgeWithTrend trend={props.trend}>
        <span className={'flex items-center space-x-1'}>
          {Icon}
          <span>{props.children}</span>
        </span>
      </BadgeWithTrend>
    </div>
  );
}

function BadgeWithTrend(props: React.PropsWithChildren<{ trend: string }>) {
  const className = useMemo(() => {
    switch (props.trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-destructive';
      case 'stale':
        return 'text-orange-500';
    }
  }, [props.trend]);

  return (
    <Badge
      variant={'outline'}
      className={'border-transparent px-1.5 font-normal'}
    >
      <span className={className}>{props.children}</span>
    </Badge>
  );
}

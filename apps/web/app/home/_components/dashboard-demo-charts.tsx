'use client';

import { useMemo } from 'react';

import {
  ArrowDown,
  ArrowUp,
  CheckCircle,
  Clock,
  DollarSign,
  Menu,
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

type Agent = Tables<'agents'>;
type Campaign = Tables<'campaigns'>;
type Conversation = Tables<'conversations'>;

export default function DashboardDemo() {
  // Fetch real data using our hooks
  const { data: agents = [] } = useAgents();
  const { data: campaigns = [] } = useCampaigns();
  const { data: conversations = [] } = useConversations();

  // Calculate metrics from real data
  const callMetrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayConversations = conversations.filter((conv) => {
      const convDate = new Date(conv.created_at);
      return convDate >= today;
    });

    const totalRevenue = todayConversations.reduce((sum, conv) => {
      // Assuming we store donation amount in conversation data
      // This would need to be adjusted based on your actual data structure
      return sum + (conv.outcome === 'donated' ? 100 : 0); // Placeholder calculation
    }, 0);

    return {
      today: todayConversations.length,
      thisWeek: conversations.filter((conv) => {
        const convDate = new Date(conv.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return convDate >= weekAgo;
      }).length,
      revenue: totalRevenue,
      avgDuration: '3m 24s', // Would need to calculate from duration_seconds
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

    return {
      rate: Math.round(rate * 10) / 10, // Round to 1 decimal
      successful: successfulConversations.length,
      total: conversations.length,
      avgDonation: 98.2, // Would need to calculate from actual donation data
    };
  }, [conversations]);

  const agentStatus = useMemo(() => {
    const activeAgents = agents.filter((agent) => agent.status === 'active');

    return {
      active: activeAgents.length,
      total: agents.length,
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

  return (
    <div
      className={
        'animate-in fade-in flex flex-col space-y-4 pb-36 duration-500'
      }
    >
      {/* Key Metrics Cards */}
      <div className={'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'}>
        <Card>
          <CardHeader>
            <CardTitle className={'flex items-center gap-2.5'}>
              <Phone className="h-5 w-5 text-blue-500" />
              <span>Calls Today</span>
              <Trend trend={'up'}>12%</Trend>
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
              <Trend trend={'up'}>8%</Trend>
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
              <Trend trend={'stale'}>0%</Trend>
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
              <Trend trend={'up'}>15%</Trend>
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

  const formatTimeAgo = (dateString: string) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Status</CardTitle>
        <CardDescription>
          Current agent activity and performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
                ? formatTimeAgo(agentConversations[0]?.created_at || '')
                : 'No calls yet';

            return (
              <div
                key={agent.id}
                className="flex items-center justify-between rounded-lg border p-3"
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
        <div className="space-y-4">
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

  const formatTimeAgo = (dateString: string) => {
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

  const getCampaignName = (campaignId: string) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    return campaign?.name || 'Unknown Campaign';
  };

  const getAgentName = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    return agent?.name || 'Unknown Agent';
  };

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
              {formatTimeAgo(conversation.created_at)}
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

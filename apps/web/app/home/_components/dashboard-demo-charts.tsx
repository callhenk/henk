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

export default function DashboardDemo() {
  const callMetrics = useMemo(() => generateCallMetrics(), []);
  const conversionData = useMemo(() => generateConversionData(), []);
  const agentStatus = useMemo(() => generateAgentStatus(), []);

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
        <CallVolumeChart />
        <ConversionChart />
      </div>

      {/* Agent Status and Campaign Summaries */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AgentStatusCard />
        <CampaignSummariesCard />
      </div>

      {/* Recent Conversations */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Recent Conversations</CardTitle>
            <CardDescription>Latest calls and their outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <ConversationsTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function generateCallMetrics() {
  return {
    today: 124,
    thisWeek: 847,
    revenue: 2847,
    avgDuration: '3m 24s',
  };
}

function generateConversionData() {
  return {
    rate: 23.4,
    successful: 29,
    total: 124,
    avgDonation: 98.2,
  };
}

function generateAgentStatus() {
  return {
    active: 4,
    total: 8,
    statuses: [
      { name: 'Sarah', status: 'active', calls: 45, success: 12 },
      { name: 'Mike', status: 'active', calls: 38, success: 9 },
      { name: 'Emma', status: 'paused', calls: 0, success: 0 },
      { name: 'David', status: 'active', calls: 41, success: 8 },
    ],
  };
}

function CallVolumeChart() {
  const chartData = useMemo(
    () => [
      { date: 'Mon', calls: 45, successful: 12 },
      { date: 'Tue', calls: 52, successful: 15 },
      { date: 'Wed', calls: 38, successful: 9 },
      { date: 'Thu', calls: 67, successful: 18 },
      { date: 'Fri', calls: 41, successful: 11 },
      { date: 'Sat', calls: 29, successful: 8 },
      { date: 'Sun', calls: 34, successful: 10 },
    ],
    [],
  );

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

function ConversionChart() {
  const chartData = useMemo(
    () => [
      { time: '9AM', rate: 18 },
      { time: '10AM', rate: 22 },
      { time: '11AM', rate: 25 },
      { time: '12PM', rate: 20 },
      { time: '1PM', rate: 28 },
      { time: '2PM', rate: 32 },
      { time: '3PM', rate: 26 },
      { time: '4PM', rate: 24 },
      { time: '5PM', rate: 19 },
    ],
    [],
  );

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

function AgentStatusCard() {
  const agents = [
    {
      name: 'Sarah',
      status: 'active',
      calls: 45,
      success: 12,
      lastCall: '2 min ago',
    },
    {
      name: 'Mike',
      status: 'active',
      calls: 38,
      success: 9,
      lastCall: '5 min ago',
    },
    {
      name: 'Emma',
      status: 'paused',
      calls: 0,
      success: 0,
      lastCall: '1 hour ago',
    },
    {
      name: 'David',
      status: 'active',
      calls: 41,
      success: 8,
      lastCall: '3 min ago',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
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
          {agents.map((agent) => (
            <div
              key={agent.name}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(agent.status)}
                <div>
                  <div className="font-medium">{agent.name}</div>
                  <div className="text-muted-foreground text-sm">
                    {agent.calls} calls • {agent.success} successful
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-muted-foreground text-sm">
                  {agent.lastCall}
                </div>
                <Badge
                  variant={agent.status === 'active' ? 'default' : 'secondary'}
                >
                  {agent.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CampaignSummariesCard() {
  const campaigns = [
    {
      name: 'Summer Fundraiser',
      status: 'active',
      calls: 124,
      conversions: 29,
      revenue: 2847,
      agent: 'Sarah',
    },
    {
      name: 'Emergency Relief',
      status: 'active',
      calls: 89,
      conversions: 18,
      revenue: 1650,
      agent: 'Mike',
    },
    {
      name: 'Annual Campaign',
      status: 'draft',
      calls: 0,
      conversions: 0,
      revenue: 0,
      agent: 'Emma',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Campaigns</CardTitle>
        <CardDescription>Campaign performance overview</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.name}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <div className="font-medium">{campaign.name}</div>
                <div className="text-muted-foreground text-sm">
                  {campaign.calls} calls • {campaign.conversions} conversions
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">${campaign.revenue}</div>
                <Badge
                  variant={
                    campaign.status === 'active' ? 'default' : 'secondary'
                  }
                >
                  {campaign.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ConversationsTable() {
  const conversations = [
    {
      donor: 'John Smith',
      campaign: 'Summer Fundraiser',
      agent: 'Sarah',
      duration: '4m 12s',
      outcome: 'donated',
      amount: 150,
      time: '2 min ago',
    },
    {
      donor: 'Mary Johnson',
      campaign: 'Emergency Relief',
      agent: 'Mike',
      duration: '2m 45s',
      outcome: 'callback requested',
      amount: 0,
      time: '5 min ago',
    },
    {
      donor: 'Robert Davis',
      campaign: 'Summer Fundraiser',
      agent: 'Sarah',
      duration: '1m 30s',
      outcome: 'no answer',
      amount: 0,
      time: '8 min ago',
    },
    {
      donor: 'Lisa Wilson',
      campaign: 'Emergency Relief',
      agent: 'Mike',
      duration: '5m 20s',
      outcome: 'donated',
      amount: 75,
      time: '12 min ago',
    },
    {
      donor: 'James Brown',
      campaign: 'Summer Fundraiser',
      agent: 'David',
      duration: '3m 15s',
      outcome: 'donated',
      amount: 200,
      time: '15 min ago',
    },
  ];

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'donated':
        return <Badge className="bg-green-100 text-green-800">Donated</Badge>;
      case 'callback requested':
        return <Badge className="bg-blue-100 text-blue-800">Callback</Badge>;
      case 'no answer':
        return <Badge className="bg-gray-100 text-gray-800">No Answer</Badge>;
      default:
        return <Badge variant="secondary">{outcome}</Badge>;
    }
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
        {conversations.map((conversation, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{conversation.donor}</TableCell>
            <TableCell>{conversation.campaign}</TableCell>
            <TableCell>{conversation.agent}</TableCell>
            <TableCell>{conversation.duration}</TableCell>
            <TableCell>{getOutcomeBadge(conversation.outcome)}</TableCell>
            <TableCell>
              {conversation.amount > 0 ? `$${conversation.amount}` : '-'}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {conversation.time}
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

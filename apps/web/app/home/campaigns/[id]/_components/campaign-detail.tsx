'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  ArrowLeft,
  BarChart3,
  DollarSign,
  Edit,
  MessageSquare,
  Pause,
  Phone,
  Play,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Label } from '@kit/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';

interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  agent: string;
  calls: number;
  conversions: number;
  revenue: number;
  startDate: string;
  endDate?: string;
  description: string;
  goal: string;
  script: string;
}

interface Call {
  id: string;
  donor: string;
  phone: string;
  duration: string;
  outcome: 'donated' | 'callback_requested' | 'no_answer' | 'declined';
  amount?: number;
  timestamp: string;
  agent: string;
}

const mockCampaign: Campaign = {
  id: '1',
  name: 'Summer Fundraiser 2024',
  status: 'active',
  agent: 'Sarah',
  calls: 124,
  conversions: 29,
  revenue: 2847,
  startDate: '2024-06-01',
  description: 'Annual summer fundraising campaign for local charities',
  goal: '$5,000',
  script:
    "Hello, this is Sarah calling on behalf of our local charity. We're reaching out to discuss our summer fundraising campaign...",
};

const mockCalls: Call[] = [
  {
    id: '1',
    donor: 'John Smith',
    phone: '+1 (555) 123-4567',
    duration: '4m 12s',
    outcome: 'donated',
    amount: 150,
    timestamp: '2024-06-15 14:30',
    agent: 'Sarah',
  },
  {
    id: '2',
    donor: 'Mary Johnson',
    phone: '+1 (555) 234-5678',
    duration: '2m 45s',
    outcome: 'callback_requested',
    timestamp: '2024-06-15 15:15',
    agent: 'Sarah',
  },
  {
    id: '3',
    donor: 'Robert Wilson',
    phone: '+1 (555) 345-6789',
    duration: '0m 0s',
    outcome: 'no_answer',
    timestamp: '2024-06-15 16:00',
    agent: 'Sarah',
  },
  {
    id: '4',
    donor: 'Lisa Davis',
    phone: '+1 (555) 456-7890',
    duration: '3m 30s',
    outcome: 'donated',
    amount: 75,
    timestamp: '2024-06-15 16:45',
    agent: 'Sarah',
  },
  {
    id: '5',
    donor: 'Michael Brown',
    phone: '+1 (555) 567-8901',
    duration: '1m 20s',
    outcome: 'declined',
    timestamp: '2024-06-15 17:30',
    agent: 'Sarah',
  },
];

interface CampaignDetailProps {
  campaignId: string;
}

export function CampaignDetail({
  campaignId: _campaignId,
}: CampaignDetailProps) {
  const router = useRouter();
  const [showFullHistory, setShowFullHistory] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      draft: 'secondary',
      paused: 'outline',
      completed: 'default',
    } as const;

    const colors = {
      active:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      paused:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      completed:
        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    };

    return (
      <Badge
        variant={variants[status as keyof typeof variants]}
        className={colors[status as keyof typeof colors]}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getOutcomeBadge = (outcome: string) => {
    const colors = {
      donated:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      callback_requested:
        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      no_answer:
        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      declined: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };

    return (
      <Badge className={colors[outcome as keyof typeof colors]}>
        {outcome.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
      </Badge>
    );
  };

  const getConversionRate = (calls: number, conversions: number) => {
    if (calls === 0) return '0%';
    return `${((conversions / calls) * 100).toFixed(1)}%`;
  };

  const recentCalls = showFullHistory ? mockCalls : mockCalls.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {mockCampaign.name}
            </h1>
            <p className="text-muted-foreground">{mockCampaign.description}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                router.push(`/home/campaigns/${mockCampaign.id}/edit`)
              }
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Campaign
            </DropdownMenuItem>
            {mockCampaign.status === 'active' && (
              <DropdownMenuItem>
                <Pause className="mr-2 h-4 w-4" />
                Pause Campaign
              </DropdownMenuItem>
            )}
            {mockCampaign.status === 'paused' && (
              <DropdownMenuItem>
                <Play className="mr-2 h-4 w-4" />
                Resume Campaign
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Campaign
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockCampaign.calls.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">
              Since {new Date(mockCampaign.startDate).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockCampaign.conversions.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">
              {getConversionRate(mockCampaign.calls, mockCampaign.conversions)}{' '}
              success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${mockCampaign.revenue.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">
              Goal: {mockCampaign.goal}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <BarChart3 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusBadge(mockCampaign.status)}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {mockCampaign.agent} • {mockCampaign.calls} calls today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Campaign Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Agent</Label>
                <p className="text-muted-foreground text-sm">
                  {mockCampaign.agent}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Goal</Label>
                <p className="text-muted-foreground text-sm">
                  {mockCampaign.goal}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Start Date</Label>
                <p className="text-muted-foreground text-sm">
                  {new Date(mockCampaign.startDate).toLocaleDateString()}
                </p>
              </div>
              {mockCampaign.endDate && (
                <div>
                  <Label className="text-sm font-medium">End Date</Label>
                  <p className="text-muted-foreground text-sm">
                    {new Date(mockCampaign.endDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Call Script
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {mockCampaign.script}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Calls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Calls</CardTitle>
              <CardDescription>
                Latest call activity for this campaign
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFullHistory(!showFullHistory)}
            >
              {showFullHistory ? 'Show Less' : 'Show All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donor</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCalls.map((call) => (
                  <TableRow key={call.id}>
                    <TableCell className="font-medium">{call.donor}</TableCell>
                    <TableCell>{call.phone}</TableCell>
                    <TableCell>{call.duration}</TableCell>
                    <TableCell>{getOutcomeBadge(call.outcome)}</TableCell>
                    <TableCell>
                      {call.amount ? `$${call.amount}` : '-'}
                    </TableCell>
                    <TableCell>{call.timestamp}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

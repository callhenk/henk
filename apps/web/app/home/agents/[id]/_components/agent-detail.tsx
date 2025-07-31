'use client';

import { useRouter } from 'next/navigation';

import {
  ArrowLeft,
  BarChart3,
  Edit,
  Mic,
  Settings,
  Trash2,
  User,
  Volume2,
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

interface Agent {
  id: string;
  name: string;
  language: string;
  tone: string;
  voiceId: string;
  voiceName: string;
  status: 'active' | 'inactive' | 'training';
  campaigns: number;
  totalCalls: number;
  successRate: number;
  defaultScript: string;
  createdAt: string;
}

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  calls: number;
  conversions: number;
  revenue: number;
  startDate: string;
}

const mockAgent: Agent = {
  id: 'sarah',
  name: 'Sarah',
  language: 'English',
  tone: 'Warm and friendly',
  voiceId: 'voice_sarah_001',
  voiceName: 'Sarah (ElevenLabs)',
  status: 'active',
  campaigns: 3,
  totalCalls: 124,
  successRate: 23.4,
  defaultScript:
    "Hello, this is Sarah calling on behalf of [Organization]. We're reaching out to discuss our current fundraising campaign...",
  createdAt: '2024-01-15',
};

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Summer Fundraiser 2024',
    status: 'active',
    calls: 85,
    conversions: 20,
    revenue: 1850,
    startDate: '2024-06-01',
  },
  {
    id: '2',
    name: 'Emergency Relief Fund',
    status: 'active',
    calls: 39,
    conversions: 9,
    revenue: 997,
    startDate: '2024-05-15',
  },
];

interface AgentDetailProps {
  agentId: string;
}

export function AgentDetail({ agentId: _agentId }: AgentDetailProps) {
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      training: 'outline',
    } as const;

    const colors = {
      active:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      training: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
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

  const getCampaignStatusBadge = (status: string) => {
    const colors = {
      active:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      paused:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      completed:
        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

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
              {mockAgent.name}
            </h1>
            <p className="text-muted-foreground">
              {mockAgent.language} • {mockAgent.tone}
            </p>
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
              onClick={() => router.push(`/home/agents/${mockAgent.id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Agent
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/home/agents/${mockAgent.id}/voice`)}
            >
              <Volume2 className="mr-2 h-4 w-4" />
              Voice Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/home/agents/${mockAgent.id}/scripts`)
              }
            >
              <Settings className="mr-2 h-4 w-4" />
              Script Templates
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Agent
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Agent Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Mic className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockAgent.totalCalls.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">
              Since {new Date(mockAgent.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <BarChart3 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAgent.successRate}%</div>
            <p className="text-muted-foreground text-xs">
              Based on {mockAgent.totalCalls} calls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Campaigns
            </CardTitle>
            <User className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAgent.campaigns}</div>
            <p className="text-muted-foreground text-xs">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Settings className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusBadge(mockAgent.status)}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Voice: {mockAgent.voiceName}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agent Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Agent Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Language</Label>
                <p className="text-muted-foreground text-sm">
                  {mockAgent.language}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Tone</Label>
                <p className="text-muted-foreground text-sm">
                  {mockAgent.tone}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Voice ID</Label>
                <p className="text-muted-foreground text-sm">
                  {mockAgent.voiceId}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Created</Label>
                <p className="text-muted-foreground text-sm">
                  {new Date(mockAgent.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Default Script
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {mockAgent.defaultScript}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Campaigns */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription>
                Campaigns currently using this agent
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Calls</TableHead>
                  <TableHead>Conversions</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Start Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">
                      {campaign.name}
                    </TableCell>
                    <TableCell>
                      {getCampaignStatusBadge(campaign.status)}
                    </TableCell>
                    <TableCell>{campaign.calls.toLocaleString()}</TableCell>
                    <TableCell>
                      {campaign.conversions.toLocaleString()}
                    </TableCell>
                    <TableCell>${campaign.revenue.toLocaleString()}</TableCell>
                    <TableCell>
                      {new Date(campaign.startDate).toLocaleDateString()}
                    </TableCell>
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

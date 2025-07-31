'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  Edit,
  Mic,
  MoreHorizontal,
  Plus,
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

const mockAgents: Agent[] = [
  {
    id: 'sarah',
    name: 'Sarah',
    language: 'English',
    tone: 'Warm and friendly',
    voiceId: 'voice_sarah_001',
    voiceName: 'Sarah',
    status: 'active',
    campaigns: 3,
    totalCalls: 124,
    successRate: 23.4,
    defaultScript:
      "Hello, this is Sarah calling on behalf of [Organization]. We're reaching out to discuss our current fundraising campaign...",
    createdAt: '2024-01-15',
  },
  {
    id: 'mike',
    name: 'Mike',
    language: 'English',
    tone: 'Professional and confident',
    voiceId: 'voice_mike_002',
    voiceName: 'Mike',
    status: 'active',
    campaigns: 2,
    totalCalls: 89,
    successRate: 20.2,
    defaultScript:
      "Hi, this is Mike calling from [Organization]. I'm reaching out to discuss our fundraising efforts...",
    createdAt: '2024-02-01',
  },
  {
    id: 'emma',
    name: 'Emma',
    language: 'English',
    tone: 'Compassionate and caring',
    voiceId: 'voice_emma_003',
    voiceName: 'Emma',
    status: 'active',
    campaigns: 1,
    totalCalls: 45,
    successRate: 26.7,
    defaultScript:
      "Hello, this is Emma calling on behalf of [Organization]. We're reaching out with an important message...",
    createdAt: '2024-03-10',
  },
  {
    id: 'david',
    name: 'David',
    language: 'English',
    tone: 'Enthusiastic and energetic',
    voiceId: 'voice_david_004',
    voiceName: 'David',
    status: 'training',
    campaigns: 0,
    totalCalls: 0,
    successRate: 0,
    defaultScript:
      "Hi there! This is David calling from [Organization]. I'm excited to share some great news with you...",
    createdAt: '2024-04-05',
  },
];

export function AgentsList() {
  const router = useRouter();
  const [agents] = useState<Agent[]>(mockAgents);

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

  const getTotalStats = () => {
    const activeAgents = agents.filter((agent) => agent.status === 'active');
    const totalCalls = agents.reduce((sum, agent) => sum + agent.totalCalls, 0);
    const totalCampaigns = agents.reduce(
      (sum, agent) => sum + agent.campaigns,
      0,
    );
    const avgSuccessRate =
      agents.reduce((sum, agent) => sum + agent.successRate, 0) / agents.length;

    return {
      agents: agents.length,
      activeAgents: activeAgents.length,
      totalCalls,
      totalCampaigns,
      avgSuccessRate: avgSuccessRate.toFixed(1),
    };
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      {/* Performance Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <User className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.agents}</div>
            <p className="text-muted-foreground text-xs">
              {stats.activeAgents} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Mic className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalCalls.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">Across all agents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Campaigns
            </CardTitle>
            <Volume2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
            <p className="text-muted-foreground text-xs">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Success Rate
            </CardTitle>
            <Settings className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgSuccessRate}%</div>
            <p className="text-muted-foreground text-xs">Across all agents</p>
          </CardContent>
        </Card>
      </div>

      {/* Agents Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>AI Voice Agents</CardTitle>
              <CardDescription>
                Manage your AI voice agents and their settings
              </CardDescription>
            </div>
            <Button
              onClick={() => router.push('/home/agents/create')}
              className="hover:bg-primary/90 transition-colors"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Agent
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Voice</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Campaigns</TableHead>
                  <TableHead>Calls</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-muted-foreground text-sm">
                          {agent.language} • {agent.tone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{agent.voiceName}</div>
                        <div className="text-muted-foreground text-sm">
                          ID: {agent.voiceId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(agent.status)}</TableCell>
                    <TableCell>{agent.campaigns}</TableCell>
                    <TableCell>{agent.totalCalls.toLocaleString()}</TableCell>
                    <TableCell>
                      <div>
                        <div>{agent.successRate}%</div>
                        <div className="text-muted-foreground text-sm">
                          {agent.totalCalls > 0 ? 'Based on calls' : 'No data'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/home/agents/${agent.id}`)
                            }
                          >
                            <User className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/home/agents/${agent.id}/edit`)
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Agent
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/home/agents/${agent.id}/voice`)
                            }
                          >
                            <Volume2 className="mr-2 h-4 w-4" />
                            Voice Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/home/agents/${agent.id}/scripts`)
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

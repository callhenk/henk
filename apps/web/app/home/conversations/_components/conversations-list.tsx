'use client';

import { useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  BarChart3,
  Clock,
  Eye,
  Filter,
  Headphones,
  MessageSquare,
  MoreHorizontal,
  TrendingUp,
} from 'lucide-react';

// Import our Supabase hooks
import type { Tables } from '@kit/supabase/database';
import { useAgents } from '@kit/supabase/hooks/agents/use-agents';
import { useCampaigns } from '@kit/supabase/hooks/campaigns/use-campaigns';
import { useConversations } from '@kit/supabase/hooks/conversations/use-conversations';
import { useLeads } from '@kit/supabase/hooks/leads/use-leads';
// Import demo mode
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Skeleton } from '@kit/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';

import { SearchFilters, StatsCard, StatusBadge } from '~/components/shared';
import { useDemoMode } from '~/lib/demo-mode-context';

type Conversation = Tables<'conversations'>['Row'];
type _Campaign = Tables<'campaigns'>['Row'];
type _Agent = Tables<'agents'>['Row'];
type _Lead = Tables<'leads'>['Row'];

// Enhanced conversation interface with calculated fields
interface EnhancedConversation extends Conversation {
  donorName: string;
  phoneNumber: string;
  campaignName: string;
  agentName: string;
  amount?: number;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export function ConversationsList() {
  const _router = useRouter();

  // Get demo mode state and mock data
  const { isDemoMode, mockAgents, mockCampaigns, mockConversations } =
    useDemoMode();

  // Fetch real data using our hooks
  const { data: realConversations = [], isLoading: conversationsLoading } =
    useConversations();
  const { data: realCampaigns = [] } = useCampaigns();
  const { data: realAgents = [] } = useAgents();
  const { data: leads = [] } = useLeads();

  // Use mock data if demo mode is enabled, otherwise use real data
  const conversations = isDemoMode ? mockConversations : realConversations;
  const campaigns = isDemoMode ? mockCampaigns : realCampaigns;
  const agents = isDemoMode ? mockAgents : realAgents;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('All Campaigns');
  const [selectedAgent, setSelectedAgent] = useState('All Agents');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedOutcome, setSelectedOutcome] = useState('All Outcomes');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Enhance conversations with calculated fields
  const enhancedConversations = useMemo(() => {
    return conversations.map((conversation) => {
      const campaign = campaigns.find((c) => c.id === conversation.campaign_id);
      const agent = agents.find((a) => a.id === conversation.agent_id);
      const lead = leads.find((l) => l.id === conversation.lead_id);

      // Calculate sentiment based on outcome
      const getSentiment = (
        outcome: string | null,
      ): 'positive' | 'neutral' | 'negative' => {
        if (outcome === 'donated') return 'positive';
        if (outcome === 'no-interest' || outcome === 'no-answer')
          return 'negative';
        return 'neutral';
      };

      // Calculate amount based on outcome
      const amount = conversation.outcome === 'donated' ? 100 : undefined; // Placeholder

      return {
        ...conversation,
        donorName: lead?.name || `Donor ${conversation.lead_id?.slice(0, 8)}`,
        phoneNumber: lead?.phone || 'N/A',
        campaignName: campaign?.name || 'Unknown Campaign',
        agentName: agent?.name || 'Unknown Agent',
        amount,
        sentiment: getSentiment(conversation.outcome),
      } as EnhancedConversation;
    });
  }, [conversations, campaigns, agents, leads]);

  // Get unique campaigns and agents for filters
  const uniqueCampaigns = useMemo(() => {
    const campaignNames = enhancedConversations.map(
      (conv) => conv.campaignName,
    );
    return ['All Campaigns', ...Array.from(new Set(campaignNames))];
  }, [enhancedConversations]);

  const uniqueAgents = useMemo(() => {
    const agentNames = enhancedConversations.map((conv) => conv.agentName);
    return ['All Agents', ...Array.from(new Set(agentNames))];
  }, [enhancedConversations]);

  const outcomes = [
    'All Outcomes',
    'donated',
    'callback-requested',
    'no-interest',
    'no-answer',
    'busy',
  ];

  // Filter conversations based on selected filters
  const filteredConversations = useMemo(() => {
    return enhancedConversations.filter((conv) => {
      const matchesSearch =
        conv.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.phoneNumber.includes(searchTerm);
      const matchesCampaign =
        selectedCampaign === 'All Campaigns' ||
        conv.campaignName === selectedCampaign;
      const matchesAgent =
        selectedAgent === 'All Agents' || conv.agentName === selectedAgent;
      const matchesStatus =
        selectedStatus === 'All Statuses' || conv.status === selectedStatus;
      const matchesOutcome =
        selectedOutcome === 'All Outcomes' || conv.outcome === selectedOutcome;

      return (
        matchesSearch &&
        matchesCampaign &&
        matchesAgent &&
        matchesStatus &&
        matchesOutcome
      );
    });
  }, [
    enhancedConversations,
    searchTerm,
    selectedCampaign,
    selectedAgent,
    selectedStatus,
    selectedOutcome,
  ]);

  // Sort conversations
  const sortedConversations = useMemo(() => {
    return [...filteredConversations].sort((a, b) => {
      let aValue: string | number | Date, bValue: string | number | Date;

      switch (sortBy) {
        case 'donor':
          aValue = a.donorName;
          bValue = b.donorName;
          break;
        case 'campaign':
          aValue = a.campaignName;
          bValue = b.campaignName;
          break;
        case 'agent':
          aValue = a.agentName;
          bValue = b.agentName;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'outcome':
          aValue = a.outcome || '';
          bValue = b.outcome || '';
          break;
        case 'duration':
          aValue = a.duration_seconds || 0;
          bValue = b.duration_seconds || 0;
          break;
        case 'amount':
          aValue = a.amount || 0;
          bValue = b.amount || 0;
          break;
        case 'date':
        default:
          aValue = new Date(a.created_at || '');
          bValue = new Date(b.created_at || '');
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredConversations, sortBy, sortOrder]);

  // Show loading state if data is still loading and not in demo mode
  if (!isDemoMode && conversationsLoading) {
    return (
      <div className="space-y-6">
        {/* Loading Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className={'glass-panel'}>
              <CardHeader>
                <Skeleton className="mb-2 h-4 w-32" />
                <Skeleton className="mb-2 h-3 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
        {/* Loading Conversations List */}
        <Card className={'glass-panel'}>
          <CardHeader>
            <Skeleton className="mb-2 h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate stats
  const totalConversations = enhancedConversations.length;
  const todayConversations = enhancedConversations.filter(
    (conv) =>
      conv.created_at &&
      new Date(conv.created_at).toDateString() === new Date().toDateString(),
  ).length;
  const totalDuration = enhancedConversations.reduce(
    (sum, conv) => sum + (conv.duration_seconds || 0),
    0,
  );
  const totalDonations = enhancedConversations
    .filter((conv) => conv.outcome === 'donated')
    .reduce((sum, conv) => sum + (conv.amount || 0), 0);
  const positiveSentiment = enhancedConversations.filter(
    (conv) => conv.sentiment === 'positive',
  ).length;

  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }

    if (remainingSeconds > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }

    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Conversations"
          value={totalConversations}
          subtitle={`${todayConversations} Today`}
          icon={MessageSquare}
        />
        <StatsCard
          title="Total Duration"
          value={formatDuration(totalDuration)}
          subtitle={`Average: ${formatDuration(Math.round(totalDuration / totalConversations))}`}
          icon={Clock}
        />
        <StatsCard
          title="Total Donations"
          value={`$${totalDonations.toLocaleString()}`}
          subtitle={`${enhancedConversations.filter((conv) => conv.outcome === 'donated').length} successful calls`}
          icon={TrendingUp}
        />
        <StatsCard
          title="Positive Sentiment"
          value={positiveSentiment}
          subtitle={`${Math.round((positiveSentiment / totalConversations) * 100)}% of calls`}
          icon={BarChart3}
        />
      </div>

      {/* Search & Filters */}
      <Card className={'glass-panel'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SearchFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search donors..."
            statusFilter={selectedStatus}
            onStatusFilterChange={setSelectedStatus}
            statusOptions={[
              { value: 'All Statuses', label: 'All Statuses' },
              { value: 'completed', label: 'Completed' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'failed', label: 'Failed' },
              { value: 'no-answer', label: 'No Answer' },
            ]}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOptions={[
              { value: 'date', label: 'Date' },
              { value: 'donor', label: 'Donor' },
              { value: 'campaign', label: 'Campaign' },
              { value: 'agent', label: 'Agent' },
              { value: 'status', label: 'Status' },
              { value: 'outcome', label: 'Outcome' },
              { value: 'duration', label: 'Duration' },
              { value: 'amount', label: 'Amount' },
            ]}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
          />

          {/* Additional filters */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Campaign</label>
              <Select
                value={selectedCampaign}
                onValueChange={setSelectedCampaign}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {uniqueCampaigns.map((campaign) => (
                    <SelectItem key={campaign} value={campaign}>
                      {campaign}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Agent</label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {uniqueAgents.map((agent) => (
                    <SelectItem key={agent} value={agent}>
                      {agent}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Outcome</label>
              <Select
                value={selectedOutcome}
                onValueChange={setSelectedOutcome}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {outcomes.map((outcome) => (
                    <SelectItem key={outcome} value={outcome}>
                      {outcome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversations Table */}
      <Card className={'glass-panel'}>
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
          <CardDescription>
            View and manage all AI voice conversations and their outcomes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                All ({sortedConversations.length})
              </TabsTrigger>
              <TabsTrigger value="today">
                Today ({todayConversations})
              </TabsTrigger>
              <TabsTrigger value="donations">
                Donations (
                {
                  enhancedConversations.filter((c) => c.outcome === 'donated')
                    .length
                }
                )
              </TabsTrigger>
              <TabsTrigger value="callbacks">
                Callbacks (
                {
                  enhancedConversations.filter(
                    (c) => c.outcome === 'callback-requested',
                  ).length
                }
                )
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <ConversationsTable conversations={sortedConversations} />
            </TabsContent>

            <TabsContent value="today" className="mt-6">
              <ConversationsTable
                conversations={sortedConversations.filter(
                  (conv) =>
                    conv.created_at &&
                    new Date(conv.created_at).toDateString() ===
                      new Date().toDateString(),
                )}
              />
            </TabsContent>

            <TabsContent value="donations" className="mt-6">
              <ConversationsTable
                conversations={sortedConversations.filter(
                  (conv) => conv.outcome === 'donated',
                )}
              />
            </TabsContent>

            <TabsContent value="callbacks" className="mt-6">
              <ConversationsTable
                conversations={sortedConversations.filter(
                  (conv) => conv.outcome === 'callback-requested',
                )}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function ConversationsTable({
  conversations,
}: {
  conversations: EnhancedConversation[];
}) {
  const router = useRouter();

  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }

    if (remainingSeconds > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }

    return `${minutes}m`;
  };

  // Empty state
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageSquare className="text-muted-foreground mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-semibold">No conversations yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Conversations will appear here once your AI agents start making calls.
          Check back after your campaigns are active and calls begin.
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/home/analytics')}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            View Analytics
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Donor</TableHead>
            <TableHead>Campaign</TableHead>
            <TableHead>Agent</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Outcome</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Sentiment</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {conversations.map((conversation) => (
            <TableRow key={conversation.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{conversation.donorName}</div>
                  <div className="text-muted-foreground text-sm">
                    {conversation.phoneNumber}
                  </div>
                </div>
              </TableCell>
              <TableCell>{conversation.campaignName}</TableCell>
              <TableCell>{conversation.agentName}</TableCell>
              <TableCell>
                <StatusBadge status={conversation.status} />
              </TableCell>
              <TableCell>
                <StatusBadge status={conversation.outcome || 'unknown'} />
              </TableCell>
              <TableCell>
                {conversation.duration_seconds &&
                conversation.duration_seconds > 0
                  ? formatDuration(conversation.duration_seconds)
                  : '-'}
              </TableCell>
              <TableCell>
                <StatusBadge status={conversation.sentiment} />
              </TableCell>
              <TableCell>
                {conversation.amount ? `$${conversation.amount}` : '-'}
              </TableCell>
              <TableCell>
                {conversation.created_at
                  ? new Date(conversation.created_at).toLocaleDateString()
                  : 'Unknown'}
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
                        router.push(`/home/conversations/${conversation.id}`)
                      }
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    {/* Transcript and call listening are not available in the current data structure */}
                    {/* {conversation.transcript && (
                      <DropdownMenuItem>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        View Transcript
                      </DropdownMenuItem>
                    )} */}
                    {/* {conversation.duration_seconds > 0 && (
                      <DropdownMenuItem>
                        <Play className="mr-2 h-4 w-4" />
                        Listen to Call
                      </DropdownMenuItem>
                    )} */}
                    <DropdownMenuItem>
                      <Headphones className="mr-2 h-4 w-4" />
                      AI Summary
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

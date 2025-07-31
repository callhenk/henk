'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  BarChart3,
  Clock,
  Eye,
  Filter,
  Headphones,
  MessageSquare,
  MoreHorizontal,
  Play,
  TrendingUp,
} from 'lucide-react';

import { Button } from '@kit/ui/button';
import { StatsCard, StatusBadge, SearchFilters } from '~/components/shared';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';

interface Conversation {
  id: string;
  donorName: string;
  phoneNumber: string;
  campaign: string;
  agent: string;
  status: 'completed' | 'in-progress' | 'failed' | 'no-answer';
  outcome:
    | 'donated'
    | 'callback-requested'
    | 'no-interest'
    | 'no-answer'
    | 'busy';
  duration: number; // in seconds
  sentiment: 'positive' | 'neutral' | 'negative';
  callDate: Date;
  amount?: number;
  transcript?: string;
  aiSummary?: string;
}

const mockConversations: Conversation[] = [
  {
    id: 'conv_001',
    donorName: 'Sarah Johnson',
    phoneNumber: '+1 (555) 123-4567',
    campaign: 'Summer Fundraiser 2024',
    agent: 'Sarah',
    status: 'completed',
    outcome: 'donated',
    duration: 245,
    sentiment: 'positive',
    callDate: new Date('2024-01-15T10:30:00'),
    amount: 150,
    transcript: 'Hello, this is Sarah calling from...',
    aiSummary: 'Donor was very receptive and made a $150 donation.',
  },
  {
    id: 'conv_002',
    donorName: 'Michael Chen',
    phoneNumber: '+1 (555) 234-5678',
    campaign: 'Summer Fundraiser 2024',
    agent: 'Mike',
    status: 'completed',
    outcome: 'callback-requested',
    duration: 180,
    sentiment: 'neutral',
    callDate: new Date('2024-01-15T11:15:00'),
    transcript: 'Hello Mr. Chen, this is Mike calling...',
    aiSummary: 'Donor requested callback for next week to discuss donation.',
  },
  {
    id: 'conv_003',
    donorName: 'Emily Davis',
    phoneNumber: '+1 (555) 345-6789',
    campaign: 'Holiday Campaign',
    agent: 'Emma',
    status: 'completed',
    outcome: 'no-interest',
    duration: 95,
    sentiment: 'negative',
    callDate: new Date('2024-01-15T12:00:00'),
    transcript: 'Hello, this is Emma calling...',
    aiSummary: 'Donor politely declined but was respectful.',
  },
  {
    id: 'conv_004',
    donorName: 'Robert Wilson',
    phoneNumber: '+1 (555) 456-7890',
    campaign: 'Summer Fundraiser 2024',
    agent: 'David',
    status: 'failed',
    outcome: 'no-answer',
    duration: 0,
    sentiment: 'neutral',
    callDate: new Date('2024-01-15T13:45:00'),
  },
  {
    id: 'conv_005',
    donorName: 'Lisa Thompson',
    phoneNumber: '+1 (555) 567-8901',
    campaign: 'Holiday Campaign',
    agent: 'Sarah',
    status: 'completed',
    outcome: 'donated',
    duration: 320,
    sentiment: 'positive',
    callDate: new Date('2024-01-15T14:20:00'),
    amount: 75,
    transcript: 'Hello Lisa, this is Sarah calling...',
    aiSummary: 'Donor was enthusiastic and made a $75 donation.',
  },
];

const campaigns = [
  'All Campaigns',
  'Summer Fundraiser 2024',
  'Holiday Campaign',
  'Emergency Relief',
];

const agents = ['All Agents', 'Sarah', 'Mike', 'Emma', 'David'];



const outcomes = [
  'All Outcomes',
  'donated',
  'callback-requested',
  'no-interest',
  'no-answer',
  'busy',
];

export function ConversationsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('All Campaigns');
  const [selectedAgent, setSelectedAgent] = useState('All Agents');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedOutcome, setSelectedOutcome] = useState('All Outcomes');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter conversations based on selected filters
  const filteredConversations = mockConversations.filter((conv) => {
    const matchesSearch =
      conv.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.phoneNumber.includes(searchTerm);
    const matchesCampaign =
      selectedCampaign === 'All Campaigns' ||
      conv.campaign === selectedCampaign;
    const matchesAgent =
      selectedAgent === 'All Agents' || conv.agent === selectedAgent;
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

  // Sort conversations
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    let aValue: string | number | Date, bValue: string | number | Date;
    
    switch (sortBy) {
      case 'donor':
        aValue = a.donorName;
        bValue = b.donorName;
        break;
      case 'campaign':
        aValue = a.campaign;
        bValue = b.campaign;
        break;
      case 'agent':
        aValue = a.agent;
        bValue = b.agent;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'outcome':
        aValue = a.outcome;
        bValue = b.outcome;
        break;
      case 'duration':
        aValue = a.duration;
        bValue = b.duration;
        break;
      case 'amount':
        aValue = a.amount || 0;
        bValue = b.amount || 0;
        break;
      case 'date':
      default:
        aValue = a.callDate;
        bValue = b.callDate;
        break;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Calculate stats
  const totalConversations = mockConversations.length;
  const todayConversations = mockConversations.filter(
    (conv) => conv.callDate.toDateString() === new Date().toDateString(),
  ).length;
  const totalDuration = mockConversations.reduce(
    (sum, conv) => sum + conv.duration,
    0,
  );
  const totalDonations = mockConversations
    .filter((conv) => conv.outcome === 'donated')
    .reduce((sum, conv) => sum + (conv.amount || 0), 0);
  const positiveSentiment = mockConversations.filter(
    (conv) => conv.sentiment === 'positive',
  ).length;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
          subtitle={`${mockConversations.filter((conv) => conv.outcome === 'donated').length} successful calls`}
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
      <Card>
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
              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((campaign) => (
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
                  {agents.map((agent) => (
                    <SelectItem key={agent} value={agent}>
                      {agent}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Outcome</label>
              <Select value={selectedOutcome} onValueChange={setSelectedOutcome}>
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
      <Card>
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
                  mockConversations.filter((c) => c.outcome === 'donated')
                    .length
                }
                )
              </TabsTrigger>
              <TabsTrigger value="callbacks">
                Callbacks (
                {
                  mockConversations.filter(
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
                  (conv) => conv.callDate.toDateString() === new Date().toDateString()
                )} 
              />
            </TabsContent>

            <TabsContent value="donations" className="mt-6">
              <ConversationsTable 
                conversations={sortedConversations.filter((conv) => conv.outcome === 'donated')} 
              />
            </TabsContent>

            <TabsContent value="callbacks" className="mt-6">
              <ConversationsTable 
                conversations={sortedConversations.filter((conv) => conv.outcome === 'callback-requested')} 
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function ConversationsTable({ conversations }: { conversations: Conversation[] }) {
  const router = useRouter();
  
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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
                  <div className="font-medium">
                    {conversation.donorName}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {conversation.phoneNumber}
                  </div>
                </div>
              </TableCell>
              <TableCell>{conversation.campaign}</TableCell>
              <TableCell>{conversation.agent}</TableCell>
              <TableCell>
                <StatusBadge status={conversation.status} />
              </TableCell>
              <TableCell>
                <StatusBadge status={conversation.outcome} />
              </TableCell>
              <TableCell>
                {conversation.duration > 0
                  ? formatDuration(conversation.duration)
                  : '-'}
              </TableCell>
              <TableCell>
                <StatusBadge status={conversation.sentiment} />
              </TableCell>
              <TableCell>
                {conversation.amount
                  ? `$${conversation.amount}`
                  : '-'}
              </TableCell>
              <TableCell>
                {conversation.callDate.toLocaleDateString()}
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
                        router.push(
                          `/home/conversations/${conversation.id}`,
                        )
                      }
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    {conversation.transcript && (
                      <DropdownMenuItem>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        View Transcript
                      </DropdownMenuItem>
                    )}
                    {conversation.duration > 0 && (
                      <DropdownMenuItem>
                        <Play className="mr-2 h-4 w-4" />
                        Listen to Call
                      </DropdownMenuItem>
                    )}
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

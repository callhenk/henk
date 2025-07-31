'use client';

import { useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Edit,
  Eye,
  Grid3X3,
  List,
  Mic,
  MoreHorizontal,
  Play,
  Plus,
  RefreshCw,
  Star,
  Target,
  Trash2,
  TrendingUp,
  User,
  Volume2,
} from 'lucide-react';

// Import our Supabase hooks
import type { Tables } from '@kit/supabase/database';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Progress } from '@kit/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';

import { SearchFilters, StatsCard, StatusBadge } from '~/components/shared';

type Agent = Tables<'agents'>;

// Enhanced agent interface with calculated fields
interface EnhancedAgent extends Agent {
  performance?: {
    callsToday: number;
    conversionsToday: number;
    avgCallDuration: number;
    satisfactionScore: number;
  };
  totalCalls: number;
  successRate: number;
  campaigns: number;
  lastActive?: string;
}

interface AgentCardProps {
  agent: EnhancedAgent;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

interface AgentTableRowProps {
  agent: EnhancedAgent;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

interface ViewToggleProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

function SatisfactionStars({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${
            i < Math.floor(score)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

function AgentCard({ agent, onView, onEdit, onDelete }: AgentCardProps) {
  return (
    <Card className="group transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span>{agent.speaking_tone || 'Default tone'}</span>
                <span>•</span>
                <span>{agent.voice_type || 'Default voice'}</span>
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(agent.id)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(agent.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Agent
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Play className="mr-2 h-4 w-4" />
                Test Voice
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(agent.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Agent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status and Performance */}
        <div className="flex items-center justify-between">
          <StatusBadge status={agent.status} />
          {agent.lastActive && (
            <span className="text-muted-foreground text-xs">
              Last active: {agent.lastActive}
            </span>
          )}
        </div>

        {/* Performance Metrics */}
        {agent.performance && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {agent.performance.callsToday}
                </div>
                <div className="text-muted-foreground text-xs">Calls Today</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {agent.performance.conversionsToday}
                </div>
                <div className="text-muted-foreground text-xs">Conversions</div>
              </div>
            </div>

            {/* Satisfaction Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Satisfaction</span>
                <span className="font-medium">
                  {agent.performance.satisfactionScore}/5
                </span>
              </div>
              <SatisfactionStars score={agent.performance.satisfactionScore} />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onView(agent.id)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(agent.id)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AgentTableRow({
  agent,
  onView,
  onEdit,
  onDelete,
}: AgentTableRowProps) {
  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        <div className="flex items-center space-x-3">
          <div>
            <div className="font-medium">{agent.name}</div>
            <div className="text-muted-foreground text-sm">
              {agent.voice_type || 'Default voice'} •{' '}
              {agent.speaking_tone || 'Default tone'}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{agent.voice_type || 'Default'}</div>
          <div className="text-muted-foreground text-sm">
            ID: {agent.voice_id || 'N/A'}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge status={agent.status} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="font-medium">{agent.campaigns}</span>
          {agent.campaigns > 0 && (
            <Badge variant="outline" className="text-xs">
              Active
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{agent.totalCalls.toLocaleString()}</div>
          {agent.performance && (
            <div className="text-muted-foreground text-sm">
              +{agent.performance.callsToday} today
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{agent.successRate}%</span>
            {agent.successRate > 20 && (
              <TrendingUp className="h-3 w-3 text-green-500" />
            )}
          </div>
          <Progress value={agent.successRate} className="h-2" />
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
            <DropdownMenuItem onClick={() => onView(agent.id)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(agent.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Agent
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Play className="mr-2 h-4 w-4" />
              Test Voice
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(agent.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Agent
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onViewModeChange(viewMode === 'grid' ? 'list' : 'grid')}
    >
      {viewMode === 'grid' ? (
        <List className="h-4 w-4" />
      ) : (
        <Grid3X3 className="h-4 w-4" />
      )}
    </Button>
  );
}

function SortableTableHeader({
  children,
  field,
  currentSort,
  currentOrder,
  onSort,
}: {
  children: React.ReactNode;
  field: string;
  currentSort: string;
  currentOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}) {
  return (
    <TableHead>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onSort(field)}
        className="h-auto p-0 font-medium"
      >
        {children}
        {currentSort === field &&
          (currentOrder === 'asc' ? (
            <ChevronUp className="ml-1 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-1 h-4 w-4" />
          ))}
      </Button>
    </TableHead>
  );
}

// Main Component
export function AgentsList() {
  const router = useRouter();

  // Fetch real data using our hooks
  const { data: agents = [], isLoading: agentsLoading } = useAgents();
  const { data: conversations = [] } = useConversations();
  const { data: campaigns = [] } = useCampaigns();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Enhance agents with calculated performance data
  const enhancedAgents = useMemo(() => {
    return agents.map((agent) => {
      const agentConversations = conversations.filter(
        (conv) => conv.agent_id === agent.id,
      );
      const agentCampaigns = campaigns.filter(
        (campaign) => campaign.agent_id === agent.id,
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayConversations = agentConversations.filter((conv) => {
        const convDate = new Date(conv.created_at);
        return convDate >= today;
      });

      const successfulConversations = agentConversations.filter(
        (conv) => conv.outcome === 'donated' || conv.status === 'completed',
      );

      const successRate =
        agentConversations.length > 0
          ? (successfulConversations.length / agentConversations.length) * 100
          : 0;

      const lastActive =
        agentConversations.length > 0
          ? formatTimeAgo(agentConversations[0]?.created_at || '')
          : undefined;

      const avgCallDuration =
        agentConversations.length > 0
          ? agentConversations.reduce(
              (sum, conv) => sum + (conv.duration_seconds || 0),
              0,
            ) / agentConversations.length
          : 0;

      return {
        ...agent,
        totalCalls: agentConversations.length,
        successRate: Math.round(successRate * 10) / 10,
        campaigns: agentCampaigns.length,
        lastActive,
        performance: {
          callsToday: todayConversations.length,
          conversionsToday: todayConversations.filter(
            (conv) => conv.outcome === 'donated' || conv.status === 'completed',
          ).length,
          avgCallDuration: Math.round((avgCallDuration / 60) * 10) / 10, // Convert to minutes
          satisfactionScore: 4.5, // Placeholder - would need to be calculated from actual data
        },
      } as EnhancedAgent;
    });
  }, [agents, conversations, campaigns]);

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

  const getTotalStats = () => {
    const activeAgents = enhancedAgents.filter(
      (agent) => agent.status === 'active',
    );
    const totalCalls = enhancedAgents.reduce(
      (sum, agent) => sum + agent.totalCalls,
      0,
    );
    const totalCampaigns = enhancedAgents.reduce(
      (sum, agent) => sum + agent.campaigns,
      0,
    );
    const avgSuccessRate =
      enhancedAgents.reduce((sum, agent) => sum + agent.successRate, 0) /
      enhancedAgents.length;
    const totalCallsToday = enhancedAgents.reduce(
      (sum, agent) => sum + (agent.performance?.callsToday || 0),
      0,
    );

    return {
      agents: enhancedAgents.length,
      activeAgents: activeAgents.length,
      totalCalls,
      totalCampaigns,
      avgSuccessRate: avgSuccessRate.toFixed(1),
      totalCallsToday,
    };
  };

  const filteredAndSortedAgents = useMemo(() => {
    const filtered = enhancedAgents.filter((agent) => {
      const matchesSearch =
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.speaking_tone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false ||
        agent.voice_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false;

      const matchesStatus =
        statusFilter === 'all' || agent.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort agents
    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'calls':
          aValue = a.totalCalls;
          bValue = b.totalCalls;
          break;
        case 'success':
          aValue = a.successRate;
          bValue = b.successRate;
          break;
        case 'campaigns':
          aValue = a.campaigns;
          bValue = b.campaigns;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [enhancedAgents, searchTerm, statusFilter, sortBy, sortOrder]);

  // Show loading state if data is still loading
  if (agentsLoading) {
    return (
      <div className="space-y-6">
        {/* Loading Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        {/* Loading Agents List */}
        <Card>
          <CardHeader>
            <div className="bg-muted mb-2 h-6 w-48 animate-pulse rounded" />
            <div className="bg-muted h-4 w-64 animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="bg-muted h-12 w-12 animate-pulse rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="bg-muted h-4 w-32 animate-pulse rounded" />
                    <div className="bg-muted h-3 w-24 animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = getTotalStats();

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleView = (id: string) =>
    router.push(`/home/agents/${id}?tab=overview`);
  const handleEdit = (id: string) =>
    router.push(`/home/agents/${id}?tab=knowledge`);
  const handleDelete = (id: string) => {
    // TODO: Implement delete functionality
    console.log('Delete agent:', id);
  };

  return (
    <div className="space-y-6">
      {/* Performance Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Agents"
          value={stats.agents}
          subtitle={`${stats.activeAgents} active`}
          icon={User}
        />
        <StatsCard
          title="Today's Calls"
          value={stats.totalCallsToday.toLocaleString()}
          subtitle="Live activity"
          icon={Mic}
          liveIndicator
        />
        <StatsCard
          title="Active Campaigns"
          value={stats.totalCampaigns}
          subtitle="Currently running"
          icon={Volume2}
          trend={{ icon: TrendingUp, value: 'Growing' }}
        />
        <StatsCard
          title="Avg Success Rate"
          value={`${stats.avgSuccessRate}%`}
          subtitle="Across all agents"
          icon={Target}
        />
      </div>

      {/* Agents List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>AI Voice Agents</CardTitle>
              <CardDescription>
                Manage your AI voice agents and their performance
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
              <Button onClick={() => router.push('/home/agents/create')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Agent
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <SearchFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Search agents by name, tone, or tags..."
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              statusOptions={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'training', label: 'Training' },
                { value: 'paused', label: 'Paused' },
              ]}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              sortOptions={[
                { value: 'name', label: 'Name' },
                { value: 'status', label: 'Status' },
                { value: 'calls', label: 'Total Calls' },
                { value: 'success', label: 'Success Rate' },
                { value: 'campaigns', label: 'Campaigns' },
              ]}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
            />
          </div>

          {/* Results Count */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Showing {filteredAndSortedAgents.length} of{' '}
              {enhancedAgents.length} agents
            </p>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Voice</TableHead>
                    <SortableTableHeader
                      field="status"
                      currentSort={sortBy}
                      currentOrder={sortOrder}
                      onSort={handleSort}
                    >
                      Status
                    </SortableTableHeader>
                    <SortableTableHeader
                      field="campaigns"
                      currentSort={sortBy}
                      currentOrder={sortOrder}
                      onSort={handleSort}
                    >
                      Campaigns
                    </SortableTableHeader>
                    <SortableTableHeader
                      field="calls"
                      currentSort={sortBy}
                      currentOrder={sortOrder}
                      onSort={handleSort}
                    >
                      Calls
                    </SortableTableHeader>
                    <SortableTableHeader
                      field="success"
                      currentSort={sortBy}
                      currentOrder={sortOrder}
                      onSort={handleSort}
                    >
                      Success Rate
                    </SortableTableHeader>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedAgents.map((agent) => (
                    <AgentTableRow
                      key={agent.id}
                      agent={agent}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Empty State */}
          {filteredAndSortedAgents.length === 0 && (
            <div className="py-12 text-center">
              <div className="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <User className="text-muted-foreground h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">No agents found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first AI voice agent'}
              </p>
              <Button onClick={() => router.push('/home/agents/create')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Agent
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

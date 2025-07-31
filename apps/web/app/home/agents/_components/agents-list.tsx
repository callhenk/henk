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
  Filter,
  Grid3X3,
  List,
  Mic,
  MoreHorizontal,
  Play,
  Plus,
  RefreshCw,
  Search,
  SortAsc,
  Star,
  Target,
  Trash2,
  TrendingUp,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Input } from '@kit/ui/input';
import { Progress } from '@kit/ui/progress';
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

// Types
interface Agent {
  id: string;
  name: string;
  language: string;
  tone: string;
  voiceId: string;
  voiceName: string;
  status: 'active' | 'inactive' | 'training' | 'paused';
  campaigns: number;
  totalCalls: number;
  successRate: number;
  defaultScript: string;
  createdAt: string;
  lastActive?: string;
  performance?: {
    callsToday: number;
    conversionsToday: number;
    avgCallDuration: number;
    satisfactionScore: number;
  };
  tags?: string[];
}

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    icon: React.ComponentType<{ className?: string }>;
    value: string;
  };
  liveIndicator?: boolean;
}

interface AgentCardProps {
  agent: Agent;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

interface AgentTableRowProps {
  agent: Agent;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

interface SearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (value: 'asc' | 'desc') => void;
}

interface ViewToggleProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

// Reusable Components
function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  liveIndicator,
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-2">
          <p className="text-muted-foreground text-xs">{subtitle}</p>
          {liveIndicator && (
            <div className="h-1 w-1 animate-pulse rounded-full bg-green-500"></div>
          )}
          {trend && (
            <>
              <trend.icon className="h-3 w-3 text-green-500" />
              <span className="text-muted-foreground text-xs">
                {trend.value}
              </span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AgentAvatar({
  agent,
  size = 'md',
}: {
  agent: Agent;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className="relative">
      <div
        className={`bg-muted flex ${sizeClasses[size]} items-center justify-center rounded-full`}
      >
        <User className={`text-muted-foreground ${iconSizes[size]}`} />
      </div>
      {agent.status === 'active' && (
        <div className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
      )}
    </div>
  );
}

function AgentStatusBadge({ status }: { status: string }) {
  const variants = {
    active: 'default',
    inactive: 'secondary',
    training: 'outline',
    paused: 'destructive',
  } as const;

  const colors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    training: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    paused: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };

  return (
    <Badge
      variant={variants[status as keyof typeof variants]}
      className={colors[status as keyof typeof colors]}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
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
            <AgentAvatar agent={agent} size="lg" />
            <div>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span>{agent.tone}</span>
                <span>•</span>
                <span>{agent.language}</span>
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
          <AgentStatusBadge status={agent.status} />
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

        {/* Tags */}
        {agent.tags && agent.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {agent.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
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
          <AgentAvatar agent={agent} size="md" />
          <div>
            <div className="font-medium">{agent.name}</div>
            <div className="text-muted-foreground text-sm">
              {agent.language} • {agent.tone}
            </div>
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
      <TableCell>
        <AgentStatusBadge status={agent.status} />
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

function SearchFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}: SearchFiltersProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative max-w-md flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search agents by name, tone, or tags..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex items-center gap-2">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="training">Training</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-[180px]">
            <SortAsc className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="calls">Total Calls</SelectItem>
            <SelectItem value="success">Success Rate</SelectItem>
            <SelectItem value="campaigns">Campaigns</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')
          }
        >
          {sortOrder === 'asc' ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
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

// Mock data
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
      'Hello, this is Sarah calling on behalf of [Organization]. We&apos;re reaching out to discuss our current fundraising campaign...',
    createdAt: '2024-01-15',
    lastActive: '2 hours ago',
    performance: {
      callsToday: 12,
      conversionsToday: 3,
      avgCallDuration: 4.2,
      satisfactionScore: 4.8,
    },
    tags: ['fundraising', 'renewal', 'premium'],
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
    lastActive: '1 hour ago',
    performance: {
      callsToday: 8,
      conversionsToday: 2,
      avgCallDuration: 3.8,
      satisfactionScore: 4.6,
    },
    tags: ['corporate', 'high-value'],
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
      'Hello, this is Emma calling on behalf of [Organization]. We&apos;re reaching out with an important message...',
    createdAt: '2024-03-10',
    lastActive: '30 minutes ago',
    performance: {
      callsToday: 15,
      conversionsToday: 4,
      avgCallDuration: 5.1,
      satisfactionScore: 4.9,
    },
    tags: ['community', 'first-time'],
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
    performance: {
      callsToday: 0,
      conversionsToday: 0,
      avgCallDuration: 0,
      satisfactionScore: 0,
    },
    tags: ['new', 'testing'],
  },
  {
    id: 'lisa',
    name: 'Lisa',
    language: 'English',
    tone: 'Calm and reassuring',
    voiceId: 'voice_lisa_005',
    voiceName: 'Lisa',
    status: 'paused',
    campaigns: 1,
    totalCalls: 67,
    successRate: 18.5,
    defaultScript:
      "Hello, this is Lisa calling from [Organization]. I hope you're having a wonderful day...",
    createdAt: '2024-03-20',
    lastActive: '2 days ago',
    performance: {
      callsToday: 0,
      conversionsToday: 0,
      avgCallDuration: 4.0,
      satisfactionScore: 4.7,
    },
    tags: ['paused', 'maintenance'],
  },
];

// Main Component
export function AgentsList() {
  const router = useRouter();
  const [agents] = useState<Agent[]>(mockAgents);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const getTotalStats = () => {
    const activeAgents = agents.filter((agent) => agent.status === 'active');
    const totalCalls = agents.reduce((sum, agent) => sum + agent.totalCalls, 0);
    const totalCampaigns = agents.reduce(
      (sum, agent) => sum + agent.campaigns,
      0,
    );
    const avgSuccessRate =
      agents.reduce((sum, agent) => sum + agent.successRate, 0) / agents.length;
    const totalCallsToday = agents.reduce(
      (sum, agent) => sum + (agent.performance?.callsToday || 0),
      0,
    );

    return {
      agents: agents.length,
      activeAgents: activeAgents.length,
      totalCalls,
      totalCampaigns,
      avgSuccessRate: avgSuccessRate.toFixed(1),
      totalCallsToday,
    };
  };

  const filteredAndSortedAgents = useMemo(() => {
    const filtered = agents.filter((agent) => {
      const matchesSearch =
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.tone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.tags?.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase()),
        );

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
  }, [agents, searchTerm, statusFilter, sortBy, sortOrder]);

  const stats = getTotalStats();

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleView = (id: string) => router.push(`/home/agents/${id}`);
  const handleEdit = (id: string) => router.push(`/home/agents/${id}/edit`);
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

      {/* Advanced Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                AI Voice Agents
              </CardTitle>
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
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
            />
          </div>

          {/* Results Count */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Showing {filteredAndSortedAgents.length} of {agents.length} agents
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

'use client';

import { useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  Archive,
  Copy,
  DollarSign,
  Eye,
  Grid3X3,
  List,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';

// Import our Supabase hooks
import type { Tables } from '@kit/supabase/database';
import { useAgents } from '@kit/supabase/hooks/agents/use-agents';
import { useDeleteCampaign } from '@kit/supabase/hooks/campaigns/use-campaign-mutations';
import { useCampaigns } from '@kit/supabase/hooks/campaigns/use-campaigns';
import { useConversations } from '@kit/supabase/hooks/conversations/use-conversations';
// Import demo mode
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@kit/ui/alert-dialog';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { Dialog, DialogContent } from '@kit/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Skeleton } from '@kit/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';

// Tabs removed; filters handle status selection

import { SearchFilters, StatsCard, StatusBadge } from '~/components/shared';
import { useDemoMode } from '~/lib/demo-mode-context';
import { formatDate, getConversionRate } from '~/lib/utils';

import { WizardContainer } from '../wizard/wizard-container';

type Campaign = Tables<'campaigns'>['Row'];

// Enhanced campaign interface with calculated fields
interface EnhancedCampaign extends Campaign {
  leads: number;
  contacted: number;
  conversions: number;
  revenue: number;
  agentName: string;
}

export function CampaignsList() {
  // Get demo mode state and mock data
  const { isDemoMode, mockAgents, mockCampaigns, mockConversations } =
    useDemoMode();

  // Fetch real data using our hooks
  const { data: realCampaigns = [], isLoading: campaignsLoading } =
    useCampaigns();
  const { data: realConversations = [] } = useConversations();
  const { data: realAgents = [] } = useAgents();

  // Use mock data if demo mode is enabled, otherwise use real data
  const campaigns = isDemoMode ? mockCampaigns : realCampaigns;
  const conversations = isDemoMode ? mockConversations : realConversations;
  const agents = isDemoMode ? mockAgents : realAgents;

  const [selectedTab, setSelectedTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [campaignToDelete, setCampaignToDelete] =
    useState<EnhancedCampaign | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showWizard, setShowWizard] = useState(false);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);

  // Delete mutation
  const deleteCampaignMutation = useDeleteCampaign();

  // Enhance campaigns with calculated performance data
  const enhancedCampaigns = useMemo(() => {
    return campaigns.map((campaign) => {
      // Note: Leads no longer have a direct campaign_id field
      // Would need to join through lead_lists to get accurate count
      const campaignConversations = conversations.filter(
        (conv) => conv.campaign_id === campaign.id,
      );
      const agent = agents.find((agent) => agent.id === campaign.agent_id);

      const contacted = campaignConversations.length;
      const conversions = campaignConversations.filter(
        (conv) => conv.outcome === 'donated' || conv.status === 'completed',
      ).length;

      const revenue = conversions * 100; // Placeholder calculation - would need actual donation amounts

      return {
        ...campaign,
        leads: 0, // TODO: Calculate from lead_lists join
        contacted,
        conversions,
        revenue,
        agentName: agent?.name || 'Unknown Agent',
      } as EnhancedCampaign;
    });
  }, [campaigns, conversations, agents]);

  // Show loading state if data is still loading and not in demo mode
  if (!isDemoMode && campaignsLoading) {
    return (
      <div className="space-y-6">
        {/* Loading Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        {/* Loading Campaigns List */}
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

  const getTotalStats = () => {
    const totalCampaigns = enhancedCampaigns.length;
    const activeCampaigns = enhancedCampaigns.filter(
      (c) => c.status === 'active',
    ).length;
    const totalLeads = enhancedCampaigns.reduce((sum, c) => sum + c.leads, 0);
    const totalRevenue = enhancedCampaigns.reduce(
      (sum, c) => sum + c.revenue,
      0,
    );
    return { totalCampaigns, activeCampaigns, totalLeads, totalRevenue };
  };

  const getFilteredCampaigns = () => {
    let filtered = enhancedCampaigns;

    // Filter by tab
    if (selectedTab !== 'all') {
      filtered = filtered.filter((c) => c.status === selectedTab);
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.agentName.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Sort campaigns
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
        case 'leads':
          aValue = a.leads;
          bValue = b.leads;
          break;
        case 'revenue':
          aValue = a.revenue;
          bValue = b.revenue;
          break;
        case 'startDate':
          aValue = a.start_date ? new Date(a.start_date).getTime() : 0;
          bValue = b.start_date ? new Date(b.start_date).getTime() : 0;
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
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      await deleteCampaignMutation.mutateAsync(campaignId);
      setCampaignToDelete(null);
      console.log('Campaign deleted successfully');
    } catch (error) {
      console.error('Failed to delete campaign:', error);
    }
  };

  const stats = getTotalStats();
  const filteredCampaigns = getFilteredCampaigns();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Campaigns"
          value={stats.totalCampaigns}
          subtitle="Across all statuses"
          icon={TrendingUp}
        />
        <StatsCard
          title="Active Campaigns"
          value={stats.activeCampaigns}
          subtitle="Currently running"
          icon={Play}
        />
        <StatsCard
          title="Total Leads"
          value={stats.totalLeads.toLocaleString()}
          subtitle="Across all campaigns"
          icon={Users}
        />
        <StatsCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          subtitle="Generated from campaigns"
          icon={DollarSign}
        />
      </div>

      {/* Search & Tabs */}
      <Card className={'glass-panel'}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Campaigns</CardTitle>
              <CardDescription>
                Manage your fundraising campaigns and track performance
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
              <Button onClick={() => setShowWizard(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <SearchFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Search campaigns by name or description..."
              statusFilter={selectedTab}
              onStatusFilterChange={setSelectedTab}
              statusOptions={[
                { value: 'all', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'draft', label: 'Draft' },
                { value: 'paused', label: 'Paused' },
                { value: 'completed', label: 'Completed' },
              ]}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              sortOptions={[
                { value: 'name', label: 'Name' },
                { value: 'status', label: 'Status' },
                { value: 'leads', label: 'Leads' },
                { value: 'revenue', label: 'Revenue' },
                { value: 'startDate', label: 'Start Date' },
              ]}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
            />
          </div>
          <div className="mt-6">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCampaigns.map((c) => (
                  <CampaignCard
                    key={c.id}
                    campaign={c}
                    onDelete={(c) => setCampaignToDelete(c)}
                  />
                ))}
              </div>
            ) : (
              <CampaignsTable
                campaigns={filteredCampaigns}
                onDeleteCampaign={setCampaignToDelete}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Campaign Alert Dialog */}
      <AlertDialog
        open={!!campaignToDelete}
        onOpenChange={(open) => !open && setCampaignToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{campaignToDelete?.name}
              &quot;? This action cannot be undone and will permanently remove
              all associated data including leads and conversations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                campaignToDelete && handleDeleteCampaign(campaignToDelete.id)
              }
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showWizard} onOpenChange={setShowWizard}>
        <DialogContent className="max-w-2xl p-0">
          <WizardContainer onLoadingChange={setIsCreatingCampaign} />
        </DialogContent>
      </Dialog>

      {/* Loading overlay during campaign creation */}
      {isCreatingCampaign && (
        <div className="bg-background/80 animate-in fade-in pointer-events-none fixed inset-0 z-[100] backdrop-blur-sm duration-300">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-3 px-4 text-center">
              <div className="relative">
                <div className="border-primary/30 h-8 w-8 rounded-full border-2"></div>
                <div className="border-primary absolute inset-0 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
              </div>
              <div className="space-y-1">
                <p className="text-foreground text-sm font-medium">
                  Creating your campaign...
                </p>
                <p className="text-muted-foreground text-xs">
                  This will only take a moment
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ViewToggle({
  viewMode,
  onViewModeChange,
}: {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onViewModeChange(viewMode === 'grid' ? 'list' : 'grid')}
      aria-label={
        viewMode === 'grid' ? 'Switch to list view' : 'Switch to card view'
      }
    >
      {viewMode === 'grid' ? (
        <List className="h-4 w-4" />
      ) : (
        <Grid3X3 className="h-4 w-4" />
      )}
    </Button>
  );
}

function CampaignCard({
  campaign,
  onDelete,
}: {
  campaign: EnhancedCampaign;
  onDelete: (c: EnhancedCampaign) => void;
}) {
  const router = useRouter();
  const conversionRate = campaign.contacted
    ? Math.round((campaign.conversions / campaign.contacted) * 100)
    : 0;
  return (
    <Card className="glass-panel group transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{campaign.name}</CardTitle>
            <CardDescription>Agent: {campaign.agentName}</CardDescription>
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
              {/* Removed duplicate View action; primary View button below remains */}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Archive className="mr-2 h-4 w-4" /> Archive
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => onDelete(campaign)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <StatusBadge status={campaign.status} />
          <span className="text-muted-foreground text-xs">
            {campaign.start_date
              ? new Date(campaign.start_date).toLocaleDateString()
              : 'No start date'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold">{campaign.leads}</div>
            <div className="text-muted-foreground text-xs">Leads</div>
          </div>
          <div>
            <div className="text-lg font-semibold">{campaign.contacted}</div>
            <div className="text-muted-foreground text-xs">Contacted</div>
          </div>
          <div>
            <div className="text-lg font-semibold">{conversionRate}%</div>
            <div className="text-muted-foreground text-xs">Conversion</div>
          </div>
          <div>
            <div className="text-lg font-semibold">
              ${campaign.revenue.toLocaleString()}
            </div>
            <div className="text-muted-foreground text-xs">Revenue</div>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => router.push(`/home/campaigns/${campaign.id}`)}
          >
            <Eye className="mr-2 h-4 w-4" /> View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CampaignsTable({
  campaigns,
  onDeleteCampaign,
}: {
  campaigns: EnhancedCampaign[];
  onDeleteCampaign: (campaign: EnhancedCampaign) => void;
}) {
  const router = useRouter();

  // Empty state
  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <TrendingUp className="text-muted-foreground mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-semibold">No campaigns yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          You haven&apos;t created any campaigns yet. Create your first campaign
          to start fundraising and track donor interactions.
        </p>
        <Button onClick={() => router.push('/home/campaigns/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Your First Campaign
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Campaign Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>Leads</TableHead>
          <TableHead>Contacted</TableHead>
          <TableHead>Conversion %</TableHead>
          <TableHead>Revenue</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {campaigns.map((campaign) => (
          <TableRow key={campaign.id}>
            <TableCell className="max-w-[300px]">
              <div className="space-y-1">
                <div className="truncate font-medium" title={campaign.name}>
                  {campaign.name}
                </div>
                <div
                  className="text-muted-foreground line-clamp-2 cursor-help text-xs"
                  title={campaign.description || 'No description'}
                >
                  {campaign.description || 'No description'}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <StatusBadge status={campaign.status} />
            </TableCell>
            <TableCell>{formatDate(campaign.start_date)}</TableCell>
            <TableCell>{campaign.leads.toLocaleString()}</TableCell>
            <TableCell>{campaign.contacted.toLocaleString()}</TableCell>
            <TableCell>
              {getConversionRate(campaign.contacted, campaign.conversions)}%
            </TableCell>
            <TableCell>${campaign.revenue.toLocaleString()}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* Removed duplicate View action; card click/View button handles nav */}
                  <DropdownMenuItem>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {campaign.status === 'active' ? (
                    <DropdownMenuItem>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem>
                      <Play className="mr-2 h-4 w-4" />
                      Activate
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => onDeleteCampaign(campaign)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

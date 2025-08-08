'use client';

import { useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  Archive,
  Copy,
  DollarSign,
  Eye,
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
import { useLeads } from '@kit/supabase/hooks/leads/use-leads';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';

import { SearchFilters, StatsCard, StatusBadge } from '~/components/shared';

import { CreateCampaignPanel } from './create-campaign-panel';

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
  // Fetch real data using our hooks
  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns();
  const { data: leads = [] } = useLeads();
  const { data: conversations = [] } = useConversations();
  const { data: agents = [] } = useAgents();

  const [selectedTab, setSelectedTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [campaignToDelete, setCampaignToDelete] =
    useState<EnhancedCampaign | null>(null);
  const [showCreatePanel, setShowCreatePanel] = useState(false);

  // Delete mutation
  const deleteCampaignMutation = useDeleteCampaign();

  // Enhance campaigns with calculated performance data
  const enhancedCampaigns = useMemo(() => {
    return campaigns.map((campaign) => {
      const campaignLeads = leads.filter(
        (lead) => lead.campaign_id === campaign.id,
      );
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
        leads: campaignLeads.length,
        contacted,
        conversions,
        revenue,
        agentName: agent?.name || 'Unknown Agent',
      } as EnhancedCampaign;
    });
  }, [campaigns, leads, conversations, agents]);

  // Show loading state if data is still loading
  if (campaignsLoading) {
    return (
      <div className="space-y-6">
        {/* Loading Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        {/* Loading Campaigns List */}
        <Card className={'glass-panel'}>
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
            <Button onClick={() => setShowCreatePanel(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
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
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="paused">Paused</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value={selectedTab} className="mt-6">
              <CampaignsTable
                campaigns={filteredCampaigns}
                onDeleteCampaign={setCampaignToDelete}
              />
            </TabsContent>
          </Tabs>
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

      <CreateCampaignPanel
        open={showCreatePanel}
        onOpenChange={setShowCreatePanel}
      />
    </div>
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
  const getConversionRate = (contacted: number, conversions: number) => {
    if (contacted === 0) return 0;
    return Math.round((conversions / contacted) * 100);
  };
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

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
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/home/campaigns/${campaign.id}`)
                    }
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>

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

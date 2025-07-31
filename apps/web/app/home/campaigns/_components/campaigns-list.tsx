'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  Archive,
  Copy,
  DollarSign,
  Edit,
  Eye,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';

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

interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'campaign_completed';
  agent: string;
  leads: number;
  contacted: number;
  conversions: number;
  revenue: number;
  startDate: string;
  endDate?: string;
  description: string;
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Summer Fundraiser 2024',
    status: 'active',
    agent: 'Sarah',
    leads: 500,
    contacted: 124,
    conversions: 29,
    revenue: 2847,
    startDate: '2024-06-01',
    description: 'Annual summer fundraising campaign for local charities',
  },
  {
    id: '2',
    name: 'Emergency Relief Fund',
    status: 'active',
    agent: 'Mike',
    leads: 300,
    contacted: 89,
    conversions: 18,
    revenue: 1650,
    startDate: '2024-05-15',
    description: 'Emergency fundraising for disaster relief efforts',
  },
  {
    id: '3',
    name: 'Annual Campaign 2024',
    status: 'draft',
    agent: 'Emma',
    leads: 1000,
    contacted: 0,
    conversions: 0,
    revenue: 0,
    startDate: '2024-07-01',
    description: 'Year-end fundraising campaign',
  },
  {
    id: '4',
    name: 'Holiday Giving',
    status: 'paused',
    agent: 'David',
    leads: 200,
    contacted: 45,
    conversions: 12,
    revenue: 890,
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    description: 'Holiday season fundraising campaign',
  },
  {
    id: '5',
    name: 'Q3 2024 Renewals',
    status: 'campaign_completed',
    agent: 'Lisa',
    leads: 750,
    contacted: 650,
    conversions: 156,
    revenue: 12500,
    startDate: '2024-07-01',
    endDate: '2024-09-30',
    description: 'Quarterly renewal campaign for existing donors',
  },
];

export function CampaignsList() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const getTotalStats = () => {
    const totalCampaigns = mockCampaigns.length;
    const activeCampaigns = mockCampaigns.filter(
      (c) => c.status === 'active',
    ).length;
    const totalLeads = mockCampaigns.reduce((sum, c) => sum + c.leads, 0);
    const totalRevenue = mockCampaigns.reduce((sum, c) => sum + c.revenue, 0);
    return { totalCampaigns, activeCampaigns, totalLeads, totalRevenue };
  };

  const getFilteredCampaigns = () => {
    let filtered = mockCampaigns;

    // Filter by tab
    if (selectedTab !== 'all') {
      filtered = filtered.filter((c) => c.status === selectedTab);
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description.toLowerCase().includes(searchTerm.toLowerCase()),
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
          aValue = new Date(a.startDate).getTime();
          bValue = new Date(b.startDate).getTime();
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Campaigns</CardTitle>
              <CardDescription>
                Manage your fundraising campaigns and track performance
              </CardDescription>
            </div>
            <Button onClick={() => router.push('/home/campaigns/create')}>
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
              <CampaignsTable campaigns={filteredCampaigns} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function CampaignsTable({ campaigns }: { campaigns: Campaign[] }) {
  const router = useRouter();
  const getConversionRate = (contacted: number, conversions: number) => {
    if (contacted === 0) return 0;
    return Math.round((conversions / contacted) * 100);
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
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
            <TableCell>
              <div>
                <div className="font-medium">{campaign.name}</div>
                <div className="text-muted-foreground text-sm">
                  {campaign.description}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <StatusBadge status={campaign.status} />
            </TableCell>
            <TableCell>{formatDate(campaign.startDate)}</TableCell>
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
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/home/campaigns/${campaign.id}/edit`)
                    }
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
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
                  <DropdownMenuItem className="text-red-600">
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

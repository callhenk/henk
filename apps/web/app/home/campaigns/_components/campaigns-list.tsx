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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';

interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
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
    status: 'completed',
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

  const getTotalStats = () => {
    const totalCampaigns = mockCampaigns.length;
    const activeCampaigns = mockCampaigns.filter(
      (c) => c.status === 'active',
    ).length;
    const totalLeads = mockCampaigns.reduce((sum, c) => sum + c.leads, 0);
    const totalRevenue = mockCampaigns.reduce((sum, c) => sum + c.revenue, 0);

    return {
      totalCampaigns,
      activeCampaigns,
      totalLeads,
      totalRevenue,
    };
  };

  const getFilteredCampaigns = () => {
    switch (selectedTab) {
      case 'active':
        return mockCampaigns.filter((c) => c.status === 'active');
      case 'draft':
        return mockCampaigns.filter((c) => c.status === 'draft');
      case 'paused':
        return mockCampaigns.filter((c) => c.status === 'paused');
      case 'completed':
        return mockCampaigns.filter((c) => c.status === 'completed');
      default:
        return mockCampaigns;
    }
  };

  const stats = getTotalStats();
  const filteredCampaigns = getFilteredCampaigns();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Campaigns
            </CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
            <p className="text-muted-foreground text-xs">Across all statuses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Campaigns
            </CardTitle>
            <Play className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
            <p className="text-muted-foreground text-xs">Currently running</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalLeads.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">
              Across all campaigns
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">
              Generated from campaigns
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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
            <TableCell>{getStatusBadge(campaign.status)}</TableCell>
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

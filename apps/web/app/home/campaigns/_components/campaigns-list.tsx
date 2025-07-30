'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  DollarSign,
  Edit,
  Eye,
  MoreHorizontal,
  Pause,
  Phone,
  Play,
  Plus,
  Trash2,
  TrendingUp,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';

interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  agent: string;
  calls: number;
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
    calls: 124,
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
    calls: 89,
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
    calls: 0,
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
    calls: 45,
    conversions: 12,
    revenue: 890,
    startDate: '2024-12-01',
    description: 'Holiday season fundraising campaign',
  },
  {
    id: '5',
    name: 'Community Support',
    status: 'completed',
    agent: 'Sarah',
    calls: 200,
    conversions: 45,
    revenue: 5200,
    startDate: '2024-03-01',
    endDate: '2024-05-31',
    description: 'Community support and development campaign',
  },
];

export function CampaignsList() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');

  const getConversionRate = (calls: number, conversions: number) => {
    if (calls === 0) return '0%';
    return `${((conversions / calls) * 100).toFixed(1)}%`;
  };

  const getTotalStats = () => {
    const activeCampaigns = mockCampaigns.filter(
      (campaign) => campaign.status === 'active',
    );
    const totalCalls = activeCampaigns.reduce(
      (sum, campaign) => sum + campaign.calls,
      0,
    );
    const totalConversions = activeCampaigns.reduce(
      (sum, campaign) => sum + campaign.conversions,
      0,
    );
    const totalRevenue = activeCampaigns.reduce(
      (sum, campaign) => sum + campaign.revenue,
      0,
    );

    return {
      calls: totalCalls,
      conversions: totalConversions,
      revenue: totalRevenue,
      conversionRate: getConversionRate(totalCalls, totalConversions),
    };
  };

  const filteredCampaigns = mockCampaigns.filter((campaign) => {
    if (activeTab === 'all') return true;
    return campaign.status === activeTab;
  });

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      {/* Performance Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.calls}</div>
            <p className="text-muted-foreground text-xs">
              Across active campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversions}</div>
            <p className="text-muted-foreground text-xs">
              Successful donations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}</div>
            <p className="text-muted-foreground text-xs">
              Average success rate
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
              ${stats.revenue.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">
              From active campaigns
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
                Manage your AI voice fundraising campaigns
              </CardDescription>
            </div>
            <Button onClick={() => router.push('/home/campaigns/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="paused">Paused</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
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
    const variants = {
      active: 'default',
      draft: 'secondary',
      paused: 'outline',
      completed: 'default',
    } as const;

    const colors = {
      active:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      paused:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      completed:
        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
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

  const getConversionRate = (calls: number, conversions: number) => {
    if (calls === 0) return '0%';
    return `${((conversions / calls) * 100).toFixed(1)}%`;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Agent</TableHead>
            <TableHead>Calls</TableHead>
            <TableHead>Conversions</TableHead>
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
              <TableCell>{campaign.agent}</TableCell>
              <TableCell>{campaign.calls.toLocaleString()}</TableCell>
              <TableCell>
                <div>
                  <div>{campaign.conversions.toLocaleString()}</div>
                  <div className="text-muted-foreground text-sm">
                    {getConversionRate(campaign.calls, campaign.conversions)}
                  </div>
                </div>
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
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/home/campaigns/${campaign.id}/edit`)
                      }
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Campaign
                    </DropdownMenuItem>
                    {campaign.status === 'active' && (
                      <DropdownMenuItem>
                        <Pause className="mr-2 h-4 w-4" />
                        Pause Campaign
                      </DropdownMenuItem>
                    )}
                    {campaign.status === 'paused' && (
                      <DropdownMenuItem>
                        <Play className="mr-2 h-4 w-4" />
                        Resume Campaign
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Campaign
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

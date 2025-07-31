'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  ArrowLeft,
  CheckCircle,
  DollarSign,
  Download,
  Edit,
  FileText,
  Link,
  MoreHorizontal,
  Pause,
  Phone,
  Play,
  Settings,
  Trash2,
  Upload,
  User,
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
  description: string;
  agent: string;
  leads: number;
  contacted: number;
  conversions: number;
  revenue: number;
  startDate: string;
  endDate?: string;
  callingHours: string;
  maxAttempts: number;
  dailyCallCap: number;
  script: string;
  retryLogic: string;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  status: 'new' | 'contacted' | 'pledged' | 'failed';
  lastContactDate?: string;
  attempts: number;
  notes?: string;
}

const mockCampaign: Campaign = {
  id: '1',
  name: 'Q3 2024 Renewals',
  status: 'active',
  description: 'Quarterly renewal campaign for existing donors',
  agent: 'Lisa',
  leads: 750,
  contacted: 650,
  conversions: 156,
  revenue: 12500,
  startDate: '2024-07-01',
  endDate: '2024-09-30',
  callingHours: '9:00 AM - 5:00 PM',
  maxAttempts: 3,
  dailyCallCap: 50,
  script: 'Hello, this is Lisa calling from our organization...',
  retryLogic: 'Retry after 24 hours if no answer',
};

const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    company: 'Tech Corp',
    status: 'pledged',
    lastContactDate: '2024-08-15',
    attempts: 1,
    notes: 'Interested in monthly donation',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 (555) 234-5678',
    status: 'contacted',
    lastContactDate: '2024-08-14',
    attempts: 2,
    notes: 'Requested callback next week',
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike.davis@email.com',
    phone: '+1 (555) 345-6789',
    company: 'Marketing Inc',
    status: 'new',
    attempts: 0,
  },
  {
    id: '4',
    name: 'Emily Wilson',
    email: 'emily.w@email.com',
    phone: '+1 (555) 456-7890',
    status: 'failed',
    lastContactDate: '2024-08-13',
    attempts: 3,
    notes: 'Not interested at this time',
  },
];

export function CampaignDetail({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('leads');

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

  const getConversionRate = () => {
    if (mockCampaign.contacted === 0) return 0;
    return Math.round(
      (mockCampaign.conversions / mockCampaign.contacted) * 100,
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/home/campaigns')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{mockCampaign.name}</h1>
            <p className="text-muted-foreground">{mockCampaign.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(mockCampaign.status)}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="mr-2 h-4 w-4" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/home/campaigns/${campaignId}/edit`)
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Campaign
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                Preview Call Script
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {mockCampaign.status === 'active' ? (
                <DropdownMenuItem>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause Campaign
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem>
                  <Play className="mr-2 h-4 w-4" />
                  Activate Campaign
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export Results
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockCampaign.leads.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">Donors in campaign</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacted</CardTitle>
            <Phone className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockCampaign.contacted.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">
              Successfully reached
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockCampaign.conversions.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">
              {getConversionRate()}% conversion rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${mockCampaign.revenue.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">Total donations</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="leads">Leads</TabsTrigger>
              <TabsTrigger value="agent">Agent</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="leads" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Campaign Leads</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload CSV
                  </Button>
                  <Button variant="outline" size="sm">
                    <Link className="mr-2 h-4 w-4" />
                    Connect CRM
                  </Button>
                </div>
              </div>
              <LeadsTable leads={mockLeads} />
            </TabsContent>

            <TabsContent value="agent" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Assigned Agent</h3>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Reassign Agent
                </Button>
              </div>
              <AgentCard agent={mockCampaign.agent} />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Campaign Settings</h3>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Settings
                </Button>
              </div>
              <SettingsCard campaign={mockCampaign} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function LeadsTable({ leads }: { leads: Lead[] }) {
  const getLeadStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="outline">New</Badge>;
      case 'contacted':
        return <Badge className="bg-blue-100 text-blue-800">Contacted</Badge>;
      case 'pledged':
        return <Badge className="bg-green-100 text-green-800">Pledged</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Contact</TableHead>
          <TableHead>Attempts</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => (
          <TableRow key={lead.id}>
            <TableCell>
              <div>
                <div className="font-medium">{lead.name}</div>
                <div className="text-muted-foreground text-sm">
                  {lead.email}
                </div>
              </div>
            </TableCell>
            <TableCell>{lead.phone}</TableCell>
            <TableCell>{lead.company || '-'}</TableCell>
            <TableCell>{getLeadStatusBadge(lead.status)}</TableCell>
            <TableCell>{formatDate(lead.lastContactDate)}</TableCell>
            <TableCell>{lead.attempts}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    View Donor
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Phone className="mr-2 h-4 w-4" />
                    Retry Call
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
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

function AgentCard({ agent }: { agent: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="mr-2 h-5 w-5" />
          {agent}
        </CardTitle>
        <CardDescription>
          AI voice agent assigned to this campaign
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium">Role</h4>
            <p className="text-muted-foreground text-sm">
              Fundraising specialist with warm, persuasive tone
            </p>
          </div>
          <div>
            <h4 className="font-medium">Goal</h4>
            <p className="text-muted-foreground text-sm">
              Convert leads to monthly donors
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit Voice & Tone
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Edit Script
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SettingsCard({ campaign }: { campaign: Campaign }) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Campaign Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">Start Date</h4>
              <p className="text-muted-foreground text-sm">
                {formatDate(campaign.startDate)}
              </p>
            </div>
            <div>
              <h4 className="font-medium">End Date</h4>
              <p className="text-muted-foreground text-sm">
                {formatDate(campaign.endDate)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">Calling Hours</h4>
              <p className="text-muted-foreground text-sm">
                {campaign.callingHours}
              </p>
            </div>
            <div>
              <h4 className="font-medium">Max Attempts</h4>
              <p className="text-muted-foreground text-sm">
                {campaign.maxAttempts} per donor
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-medium">Daily Call Cap</h4>
            <p className="text-muted-foreground text-sm">
              {campaign.dailyCallCap} calls per day
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Script & Logic</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium">Call Script</h4>
            <p className="text-muted-foreground mt-1 text-sm">
              {campaign.script.substring(0, 100)}...
            </p>
          </div>
          <div>
            <h4 className="font-medium">Retry Logic</h4>
            <p className="text-muted-foreground mt-1 text-sm">
              {campaign.retryLogic}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

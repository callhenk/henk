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
  User,
  Users,
} from 'lucide-react';

import type { Tables } from '@kit/supabase/database';
// Import our Supabase hooks
import { useAgents } from '@kit/supabase/hooks/agents/use-agents';
import {
  useDeleteCampaign,
  useUpdateCampaign,
} from '@kit/supabase/hooks/campaigns/use-campaign-mutations';
import { useCampaign } from '@kit/supabase/hooks/campaigns/use-campaigns';
import { useConversations } from '@kit/supabase/hooks/conversations/use-conversations';
import { useDeleteLead } from '@kit/supabase/hooks/leads/use-lead-mutations';
import { useLeads } from '@kit/supabase/hooks/leads/use-leads';
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

import { StatsCard, StatusBadge } from '~/components/shared';

import { CSVUpload } from './csv-upload';

export function CampaignDetail({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('leads');

  // Fetch real data
  const { data: campaign, isLoading: loadingCampaign } =
    useCampaign(campaignId);
  const { data: leads = [] } = useLeads();
  const { data: conversations = [] } = useConversations();
  const { data: agents = [] } = useAgents();

  // Mutations
  const deleteCampaignMutation = useDeleteCampaign();
  const updateCampaignMutation = useUpdateCampaign();
  const deleteLeadMutation = useDeleteLead();

  // Filter data for this campaign
  const campaignLeads = leads.filter((lead) => lead.campaign_id === campaignId);
  const campaignConversations = conversations.filter(
    (conv) => conv.campaign_id === campaignId,
  );
  const assignedAgent = agents.find((agent) => agent.id === campaign?.agent_id);

  // Calculate metrics
  const contacted = campaignConversations.length;
  const conversions = campaignConversations.filter(
    (conv) => conv.outcome === 'donated' || conv.status === 'completed',
  ).length;
  const conversionRate =
    contacted > 0 ? Math.round((conversions / contacted) * 100) : 0;
  const revenue = campaignLeads.reduce(
    (sum, lead) => sum + (lead.donated_amount || 0),
    0,
  );

  // Delete handlers
  const handleDeleteCampaign = async () => {
    if (!campaign) return;

    try {
      await deleteCampaignMutation.mutateAsync(campaignId);
      router.push('/home/campaigns');
    } catch (error) {
      console.error('Failed to delete campaign:', error);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      await deleteLeadMutation.mutateAsync(leadId);
    } catch (error) {
      console.error('Failed to delete lead:', error);
    }
  };

  // Campaign status handlers
  const handleActivateCampaign = async () => {
    if (!campaign) return;

    try {
      await updateCampaignMutation.mutateAsync({
        id: campaignId,
        status: 'active',
      });
      console.log('Campaign activated successfully');
    } catch (error) {
      console.error('Failed to activate campaign:', error);
    }
  };

  const handlePauseCampaign = async () => {
    if (!campaign) return;

    try {
      await updateCampaignMutation.mutateAsync({
        id: campaignId,
        status: 'paused',
      });
      console.log('Campaign paused successfully');
    } catch (error) {
      console.error('Failed to pause campaign:', error);
    }
  };

  // Show loading state while fetching campaign data
  if (loadingCampaign) {
    return (
      <div className="space-y-6">
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
            <div className="bg-muted h-8 w-48 animate-pulse rounded"></div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-muted h-24 animate-pulse rounded-lg"
            ></div>
          ))}
        </div>
        <div className="bg-muted h-64 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  // Show error state if campaign not found
  if (!campaign) {
    return (
      <div className="space-y-6">
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
          </div>
        </div>
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Campaign not found</p>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold">{campaign.name}</h1>
            <p className="text-muted-foreground">{campaign.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <StatusBadge status={campaign.status} />
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
              {campaign.status === 'active' ? (
                <DropdownMenuItem
                  onClick={handlePauseCampaign}
                  disabled={updateCampaignMutation.isPending}
                >
                  <Pause className="mr-2 h-4 w-4" />
                  {updateCampaignMutation.isPending
                    ? 'Pausing...'
                    : 'Pause Campaign'}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={handleActivateCampaign}
                  disabled={updateCampaignMutation.isPending}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {updateCampaignMutation.isPending
                    ? 'Activating...'
                    : 'Activate Campaign'}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export Results
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={handleDeleteCampaign}
                disabled={deleteCampaignMutation.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleteCampaignMutation.isPending
                  ? 'Deleting...'
                  : 'Delete Campaign'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Leads"
          value={campaignLeads.length.toLocaleString()}
          subtitle="Donors in campaign"
          icon={Users}
        />
        <StatsCard
          title="Contacted"
          value={contacted.toLocaleString()}
          subtitle="Successfully reached"
          icon={Phone}
        />
        <StatsCard
          title="Successful"
          value={conversions.toLocaleString()}
          subtitle={`${conversionRate}% conversion rate`}
          icon={CheckCircle}
        />
        <StatsCard
          title="Revenue"
          value={`$${revenue.toLocaleString()}`}
          subtitle="Total donations"
          icon={DollarSign}
        />
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
                  <CSVUpload
                    campaignId={campaignId}
                    onSuccess={() => {
                      // The mutation will automatically invalidate queries
                      // No need to reload the page
                    }}
                  />
                  <Button variant="outline" size="sm">
                    <Link className="mr-2 h-4 w-4" />
                    Connect CRM
                  </Button>
                </div>
              </div>
              <LeadsTable
                leads={campaignLeads}
                onDeleteLead={handleDeleteLead}
                campaignId={campaignId}
              />
            </TabsContent>

            <TabsContent value="agent" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Assigned Agent</h3>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Reassign Agent
                </Button>
              </div>
              <AgentCard agent={assignedAgent} />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Campaign Settings</h3>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Settings
                </Button>
              </div>
              <SettingsCard campaign={campaign} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function LeadsTable({
  leads,
  onDeleteLead,
  campaignId,
}: {
  leads: Tables<'leads'>[];
  onDeleteLead: (leadId: string) => Promise<void>;
  campaignId: string;
}) {
  const getLeadStatusBadge = (status: string) => {
    return <StatusBadge status={status} />;
  };

  // Empty state
  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="text-muted-foreground mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-semibold">No leads yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          This campaign doesn&apos;t have any leads yet. Add leads to start
          making calls and track donor interactions.
        </p>
        <div className="flex gap-2">
          <CSVUpload
            campaignId={campaignId}
            onSuccess={() => {
              // The mutation will automatically invalidate queries
              // No need to reload the page
            }}
          />
          <Button variant="outline">
            <Link className="mr-2 h-4 w-4" />
            Connect CRM
          </Button>
        </div>
      </div>
    );
  }

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
            <TableCell>
              {lead.last_contact_date
                ? new Date(lead.last_contact_date).toLocaleDateString()
                : 'Never'}
            </TableCell>
            <TableCell>{lead.attempts || 0}</TableCell>
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
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => onDeleteLead(lead.id)}
                  >
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

function AgentCard({ agent }: { agent: Tables<'agents'> | undefined }) {
  if (!agent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            No Agent Assigned
          </CardTitle>
          <CardDescription>
            No AI voice agent assigned to this campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Please assign an agent to start making calls.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="mr-2 h-5 w-5" />
          {agent.name}
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
              {agent.description || 'Fundraising specialist'}
            </p>
          </div>
          <div>
            <h4 className="font-medium">Tone</h4>
            <p className="text-muted-foreground text-sm">
              {agent.speaking_tone || 'Default tone'}
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

function SettingsCard({ campaign }: { campaign: Tables<'campaigns'> }) {
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
                {campaign.start_date
                  ? new Date(campaign.start_date).toLocaleDateString()
                  : 'Never'}
              </p>
            </div>
            <div>
              <h4 className="font-medium">End Date</h4>
              <p className="text-muted-foreground text-sm">
                {campaign.end_date
                  ? new Date(campaign.end_date).toLocaleDateString()
                  : 'Never'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">Calling Hours</h4>
              <p className="text-muted-foreground text-sm">
                {campaign.calling_hours || '9:00-17:00'}
              </p>
            </div>
            <div>
              <h4 className="font-medium">Max Attempts</h4>
              <p className="text-muted-foreground text-sm">
                {campaign.max_attempts || 3} per donor
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-medium">Daily Call Cap</h4>
            <p className="text-muted-foreground text-sm">
              {campaign.daily_call_cap || 100} calls per day
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
              {campaign.script
                ? campaign.script.substring(0, 100) + '...'
                : 'No script available'}
            </p>
          </div>
          <div>
            <h4 className="font-medium">Retry Logic</h4>
            <p className="text-muted-foreground mt-1 text-sm">
              {campaign.retry_logic || 'Standard retry logic'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

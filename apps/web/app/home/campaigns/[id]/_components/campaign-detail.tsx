'use client';

import { useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import dayjs from 'dayjs';
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
  Trash2,
  User,
  Users,
  X,
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
import {
  useDeleteLead,
  useUpdateLead,
} from '@kit/supabase/hooks/leads/use-lead-mutations';
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
import { Input } from '@kit/ui/input';
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
import { Textarea } from '@kit/ui/textarea';

import {
  DatePicker,
  StatsCard,
  StatusBadge,
  TimePicker,
} from '~/components/shared';

import { CSVUpload } from './csv-upload';
import { ReassignAgentDialog } from './reassign-agent-dialog';

// Helper functions to convert enum values to user-friendly labels
const getSpeakingToneLabel = (
  speakingTone: string | null | undefined,
): string => {
  if (!speakingTone) return 'Default tone';
  const speakingTones = [
    { value: 'warm-friendly', label: 'Warm and friendly' },
    { value: 'professional-confident', label: 'Professional and confident' },
    { value: 'compassionate-caring', label: 'Compassionate and caring' },
    { value: 'enthusiastic-energetic', label: 'Enthusiastic and energetic' },
    { value: 'calm-reassuring', label: 'Calm and reassuring' },
  ];
  const toneOption = speakingTones.find((tone) => tone.value === speakingTone);
  return toneOption?.label || speakingTone;
};

const _getRetryLogicLabel = (retryLogic: string | null | undefined): string => {
  if (!retryLogic) return 'Standard retry logic';
  const retryLogics = [
    { value: 'standard', label: 'Standard Retry Logic' },
    { value: 'aggressive', label: 'Aggressive Retry Logic' },
    { value: 'conservative', label: 'Conservative Retry Logic' },
    { value: 'smart', label: 'Smart Retry Logic' },
    { value: 'custom', label: 'Custom Retry Logic' },
  ];
  const logicOption = retryLogics.find((logic) => logic.value === retryLogic);
  return logicOption?.label || retryLogic;
};

export function CampaignDetail({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false);

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
  const updateLeadMutation = useUpdateLead();

  // State for inline editing
  const [campaignName, setCampaignName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [campaignScript, setCampaignScript] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [callingHours, setCallingHours] = useState('');
  const [maxAttempts, setMaxAttempts] = useState('');
  const [dailyCallCap, setDailyCallCap] = useState('');
  const [retryLogic, setRetryLogic] = useState('');
  const [savingField, setSavingField] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Initialize form data when campaign loads
  useEffect(() => {
    if (campaign) {
      setCampaignName(campaign.name || '');
      setCampaignDescription(campaign.description || '');
      setCampaignScript(campaign.script || '');
      setStartDate(
        campaign.start_date
          ? dayjs(campaign.start_date).format('YYYY-MM-DD')
          : '',
      );
      setEndDate(
        campaign.end_date ? dayjs(campaign.end_date).format('YYYY-MM-DD') : '',
      );
      setCallingHours(campaign.calling_hours || '');
      setMaxAttempts(campaign.max_attempts?.toString() || '');
      setDailyCallCap(campaign.daily_call_cap?.toString() || '');
      setRetryLogic(campaign.retry_logic || '');
    }
  }, [campaign]);

  // Check if there are unsaved changes for each field
  const hasNameChanges = campaignName !== (campaign?.name || '');
  const hasDescriptionChanges =
    campaignDescription !== (campaign?.description || '');
  const hasScriptChanges = campaignScript !== (campaign?.script || '');
  const hasStartDateChanges =
    startDate !==
    (campaign?.start_date
      ? dayjs(campaign.start_date).format('YYYY-MM-DD')
      : '');
  const hasEndDateChanges =
    endDate !==
    (campaign?.end_date ? dayjs(campaign.end_date).format('YYYY-MM-DD') : '');
  const hasCallingHoursChanges =
    callingHours !== (campaign?.calling_hours || '');
  const hasMaxAttemptsChanges =
    maxAttempts !== (campaign?.max_attempts?.toString() || '');
  const hasDailyCallCapChanges =
    dailyCallCap !== (campaign?.daily_call_cap?.toString() || '');
  const hasRetryLogicChanges = retryLogic !== (campaign?.retry_logic || '');

  const handleSaveField = useCallback(
    async (fieldName: string, value: string) => {
      if (!campaign) return;

      setSavingField(fieldName);
      try {
        const updateData = {
          id: campaignId,
          ...(fieldName === 'name' && { name: value }),
          ...(fieldName === 'description' && { description: value }),
          ...(fieldName === 'script' && { script: value }),
          ...(fieldName === 'start_date' && { start_date: value }),
          ...(fieldName === 'end_date' && { end_date: value }),
          ...(fieldName === 'calling_hours' && { calling_hours: value }),
          ...(fieldName === 'max_attempts' && {
            max_attempts: parseInt(value) || 3,
          }),
          ...(fieldName === 'daily_call_cap' && {
            daily_call_cap: parseInt(value) || 100,
          }),
          ...(fieldName === 'retry_logic' && { retry_logic: value }),
        };

        await updateCampaignMutation.mutateAsync(updateData);

        // Show success message
        setSaveSuccess(
          `${fieldName === 'script' ? 'Script' : fieldName} saved successfully!`,
        );
        setTimeout(() => setSaveSuccess(null), 3000);
      } catch (error) {
        console.error(`Failed to save ${fieldName} changes:`, error);
        alert(
          `Failed to save ${fieldName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      } finally {
        setSavingField(null);
      }
    },
    [campaign, campaignId, updateCampaignMutation],
  );

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

  const handleUpdateLead = async (
    leadId: string,
    data: Partial<Tables<'leads'>>,
  ) => {
    try {
      await updateLeadMutation.mutateAsync({ id: leadId, ...data });
    } catch (error) {
      console.error('Failed to update lead:', error);
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
      {/* Success Notification */}
      {saveSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <p className="text-sm font-medium text-green-800">{saveSuccess}</p>
        </div>
      )}

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
              <DropdownMenuItem onClick={() => setActiveTab('overview')}>
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="leads">Leads</TabsTrigger>
              <TabsTrigger value="agent">Agent</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent value="overview" className="space-y-6">
              <div className="space-y-6">
                {/* Campaign Name */}
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Name</CardTitle>
                    <CardDescription>
                      The name of your campaign for easy identification
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      className="min-h-[60px] resize-none"
                      placeholder="Enter campaign name..."
                    />
                    {hasNameChanges && (
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          onClick={() => handleSaveField('name', campaignName)}
                          disabled={savingField === 'name'}
                        >
                          {savingField === 'name' ? 'Saving...' : 'Save Name'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Campaign Description */}
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Description</CardTitle>
                    <CardDescription>
                      A brief description of your campaign goals and objectives
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={campaignDescription}
                      onChange={(e) => setCampaignDescription(e.target.value)}
                      className="min-h-[100px] resize-none"
                      placeholder="Enter campaign description..."
                    />
                    {hasDescriptionChanges && (
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleSaveField('description', campaignDescription)
                          }
                          disabled={savingField === 'description'}
                        >
                          {savingField === 'description'
                            ? 'Saving...'
                            : 'Save Description'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Campaign Script */}
                <Card>
                  <CardHeader>
                    <CardTitle>Call Script</CardTitle>
                    <CardDescription>
                      The script that your AI agent will use during calls
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={campaignScript}
                      onChange={(e) => setCampaignScript(e.target.value)}
                      className="min-h-[200px] resize-none"
                      placeholder="Enter call script..."
                    />
                    {hasScriptChanges && (
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleSaveField('script', campaignScript)
                          }
                          disabled={savingField === 'script'}
                        >
                          {savingField === 'script'
                            ? 'Saving...'
                            : 'Save Script'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

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
                onUpdateLead={handleUpdateLead}
                campaignId={campaignId}
              />
            </TabsContent>

            <TabsContent value="agent" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Assigned Agent</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReassignDialogOpen(true)}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Reassign Agent
                </Button>
                <ReassignAgentDialog
                  campaignId={campaignId}
                  currentAgentId={campaign?.agent_id || undefined}
                  isOpen={isReassignDialogOpen}
                  onClose={() => setIsReassignDialogOpen(false)}
                />
              </div>
              <AgentCard agent={assignedAgent} />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Campaign Settings</h3>
              </div>
              <SettingsCard
                campaign={campaign}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                callingHours={callingHours}
                setCallingHours={setCallingHours}
                maxAttempts={maxAttempts}
                setMaxAttempts={setMaxAttempts}
                dailyCallCap={dailyCallCap}
                setDailyCallCap={setDailyCallCap}
                retryLogic={retryLogic}
                setRetryLogic={setRetryLogic}
                hasStartDateChanges={hasStartDateChanges}
                hasEndDateChanges={hasEndDateChanges}
                hasCallingHoursChanges={hasCallingHoursChanges}
                hasMaxAttemptsChanges={hasMaxAttemptsChanges}
                hasDailyCallCapChanges={hasDailyCallCapChanges}
                hasRetryLogicChanges={hasRetryLogicChanges}
                handleSaveField={handleSaveField}
                savingField={savingField}
              />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}

function LeadsTable({
  leads,
  onDeleteLead,
  onUpdateLead,
  campaignId,
}: {
  leads: Tables<'leads'>[];
  onDeleteLead: (leadId: string) => Promise<void>;
  onUpdateLead: (
    leadId: string,
    data: Partial<Tables<'leads'>>,
  ) => Promise<void>;
  campaignId: string;
}) {
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
          <Button variant="outline" size="sm">
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
          <EditableLeadRow
            key={lead.id}
            lead={lead}
            onDelete={onDeleteLead}
            onUpdate={onUpdateLead}
          />
        ))}
      </TableBody>
    </Table>
  );
}

function EditableLeadRow({
  lead,
  onDelete,
  onUpdate,
}: {
  lead: Tables<'leads'>;
  onDelete: (leadId: string) => Promise<void>;
  onUpdate: (leadId: string, data: Partial<Tables<'leads'>>) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingLead, setEditingLead] = useState({
    name: lead.name || '',
    email: lead.email || '',
    phone: lead.phone || '',
    company: lead.company || '',
  });
  const [savingField, setSavingField] = useState<string | null>(null);

  const handleSaveField = async (fieldName: string, value: string) => {
    setSavingField(fieldName);
    try {
      await onUpdate(lead.id, { [fieldName]: value });
      setSavingField(null);
    } catch (error) {
      console.error(`Failed to update ${fieldName}:`, error);
      setSavingField(null);
    }
  };

  const getLeadStatusBadge = (status: string) => {
    return <StatusBadge status={status} />;
  };

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        <div>
          {isEditing ? (
            <div className="space-y-2">
              <Input
                type="text"
                value={editingLead.name}
                onChange={(e) =>
                  setEditingLead((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Name"
              />
              <Input
                type="email"
                value={editingLead.email}
                onChange={(e) =>
                  setEditingLead((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="Email"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    handleSaveField('name', editingLead.name);
                    handleSaveField('email', editingLead.email);
                  }}
                  disabled={savingField === 'name' || savingField === 'email'}
                >
                  {savingField ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="font-medium">{lead.name}</div>
              <div className="text-muted-foreground text-sm">{lead.email}</div>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            type="tel"
            value={editingLead.phone}
            onChange={(e) =>
              setEditingLead((prev) => ({ ...prev, phone: e.target.value }))
            }
            placeholder="Phone"
          />
        ) : (
          lead.phone
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            type="text"
            value={editingLead.company}
            onChange={(e) =>
              setEditingLead((prev) => ({ ...prev, company: e.target.value }))
            }
            placeholder="Company"
          />
        ) : (
          lead.company || '-'
        )}
      </TableCell>
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
            {!isEditing ? (
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Lead
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => setIsEditing(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancel Edit
              </DropdownMenuItem>
            )}
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
              onClick={() => onDelete(lead.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

function AgentCard({ agent }: { agent: Tables<'agents'> | undefined }) {
  const router = useRouter();
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
              {getSpeakingToneLabel(agent.speaking_tone)}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/home/agents/${agent.id}?tab=voice`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Voice & Tone
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(`/home/agents/${agent.id}?tab=knowledge`)
            }
          >
            <FileText className="mr-2 h-4 w-4" />
            Edit Script
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SettingsCard({
  campaign,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  callingHours,
  setCallingHours,
  maxAttempts,
  setMaxAttempts,
  dailyCallCap,
  setDailyCallCap,
  retryLogic,
  setRetryLogic,
  hasStartDateChanges,
  hasEndDateChanges,
  hasCallingHoursChanges,
  hasMaxAttemptsChanges,
  hasDailyCallCapChanges,
  hasRetryLogicChanges,
  handleSaveField,
  savingField,
}: {
  campaign: Tables<'campaigns'>;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  callingHours: string;
  setCallingHours: (value: string) => void;
  maxAttempts: string;
  setMaxAttempts: (value: string) => void;
  dailyCallCap: string;
  setDailyCallCap: (value: string) => void;
  retryLogic: string;
  setRetryLogic: (value: string) => void;
  hasStartDateChanges: boolean;
  hasEndDateChanges: boolean;
  hasCallingHoursChanges: boolean;
  hasMaxAttemptsChanges: boolean;
  hasDailyCallCapChanges: boolean;
  hasRetryLogicChanges: boolean;
  handleSaveField: (fieldName: string, value: string) => Promise<void>;
  savingField: string | null;
}) {
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
              <DatePicker
                value={startDate ? dayjs(startDate).toDate() : undefined}
                onValueChange={(date) =>
                  setStartDate(date ? dayjs(date).format('YYYY-MM-DD') : '')
                }
                placeholder="Select start date"
                className="mt-1"
              />
              {hasStartDateChanges && (
                <div className="mt-2 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => handleSaveField('start_date', startDate)}
                    disabled={savingField === 'start_date'}
                  >
                    {savingField === 'start_date' ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>
            <div>
              <h4 className="font-medium">End Date</h4>
              <DatePicker
                value={endDate ? dayjs(endDate).toDate() : undefined}
                onValueChange={(date) =>
                  setEndDate(date ? dayjs(date).format('YYYY-MM-DD') : '')
                }
                placeholder="Select end date"
                className="mt-1"
              />
              {hasEndDateChanges && (
                <div className="mt-2 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => handleSaveField('end_date', endDate)}
                    disabled={savingField === 'end_date'}
                  >
                    {savingField === 'end_date' ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">Calling Hours</h4>
              <div className="mt-1 flex items-center gap-2">
                <TimePicker
                  value={callingHours.split('-')[0] || ''}
                  onValueChange={(time) => {
                    const startTime = time;
                    const endTime = callingHours.split('-')[1] || '';
                    setCallingHours(
                      endTime ? `${startTime}-${endTime}` : startTime,
                    );
                  }}
                  placeholder="Start time"
                  className="flex-1"
                />
                <span className="text-muted-foreground text-sm">to</span>
                <TimePicker
                  value={callingHours.split('-')[1] || ''}
                  onValueChange={(time) => {
                    const startTime = callingHours.split('-')[0] || '';
                    const endTime = time;
                    setCallingHours(
                      startTime ? `${startTime}-${endTime}` : endTime,
                    );
                  }}
                  placeholder="End time"
                  className="flex-1"
                />
              </div>
              {hasCallingHoursChanges && (
                <div className="mt-2 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() =>
                      handleSaveField('calling_hours', callingHours)
                    }
                    disabled={savingField === 'calling_hours'}
                  >
                    {savingField === 'calling_hours' ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>
            <div>
              <h4 className="font-medium">Max Attempts</h4>
              <Input
                type="number"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(e.target.value)}
                placeholder="3"
                className="mt-1"
              />
              {hasMaxAttemptsChanges && (
                <div className="mt-2 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => handleSaveField('max_attempts', maxAttempts)}
                    disabled={savingField === 'max_attempts'}
                  >
                    {savingField === 'max_attempts' ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-medium">Daily Call Cap</h4>
            <Input
              type="number"
              value={dailyCallCap}
              onChange={(e) => setDailyCallCap(e.target.value)}
              placeholder="100"
              className="mt-1"
            />
            {hasDailyCallCapChanges && (
              <div className="mt-2 flex justify-end">
                <Button
                  size="sm"
                  onClick={() =>
                    handleSaveField('daily_call_cap', dailyCallCap)
                  }
                  disabled={savingField === 'daily_call_cap'}
                >
                  {savingField === 'daily_call_cap' ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
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
            <p className="text-muted-foreground mt-1 text-xs">
              Edit script in the Overview tab
            </p>
          </div>
          <div>
            <h4 className="font-medium">Retry Logic</h4>
            <p className="text-muted-foreground mt-1 text-sm">
              Define how the system handles failed call attempts and follow-up
              strategies
            </p>
            <Select
              value={retryLogic}
              onValueChange={(value) => setRetryLogic(value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select retry logic strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">
                  <div>
                    <div className="font-medium">Standard Retry Logic</div>
                    <div className="text-muted-foreground text-sm">
                      Retry after 24 hours, max 3 attempts, skip opt-outs
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="aggressive">
                  <div>
                    <div className="font-medium">Aggressive Retry Logic</div>
                    <div className="text-muted-foreground text-sm">
                      Retry after 4-6 hours, max 5 attempts, multiple time slots
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="conservative">
                  <div>
                    <div className="font-medium">Conservative Retry Logic</div>
                    <div className="text-muted-foreground text-sm">
                      Retry after 48-72 hours, max 2 attempts, business hours
                      only
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="smart">
                  <div>
                    <div className="font-medium">Smart Retry Logic</div>
                    <div className="text-muted-foreground text-sm">
                      Adaptive timing, ML optimization, personalized strategies
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="custom">
                  <div>
                    <div className="font-medium">Custom Retry Logic</div>
                    <div className="text-muted-foreground text-sm">
                      Define your own retry strategy and timing rules
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {hasRetryLogicChanges && (
              <div className="mt-2 flex justify-end">
                <Button
                  size="sm"
                  onClick={() => handleSaveField('retry_logic', retryLogic)}
                  disabled={savingField === 'retry_logic'}
                >
                  {savingField === 'retry_logic' ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

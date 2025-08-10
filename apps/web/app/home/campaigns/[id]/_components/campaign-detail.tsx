'use client';

import { useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import dayjs from 'dayjs';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  DollarSign,
  FileDown,
  FileSpreadsheet,
  HelpCircle,
  Phone,
  Users,
} from 'lucide-react';
import { z } from 'zod';

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
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
// Removed unused Card imports
import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Skeleton } from '@kit/ui/skeleton';
import { Switch } from '@kit/ui/switch';
// Removed unused TableCell/TableRow imports
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@kit/ui/tooltip';

import { StatsCard, TimePicker } from '~/components/shared';

import { CsvDropzone } from '../../wizard/_components/csv-dropzone';
import { CampaignHeader } from './campaign-header';

// Remove unused subcomponents left over from earlier versions
// and UI imports not used in this file

// import { CSVUpload } from './csv-upload';

const _getRetryLogicLabel = (retryLogic: string | null | undefined): string => {
  if (!retryLogic) return 'Standard retry logic';
  const retryLogics = [
    { value: 'standard', label: 'Standard Retry Logic' },
    { value: 'aggressive', label: 'Aggressive Retry Logic' },
    { value: 'conservative', label: 'Conservative Retry Logic' },
    { value: 'smart', label: 'Smart Retry Logic' },
  ];
  const logicOption = retryLogics.find((logic) => logic.value === retryLogic);
  return logicOption?.label || retryLogic;
};

export function CampaignDetail({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('basics');
  // New simplified flow local state
  const [goalMetric, setGoalMetric] = useState<
    'pledge-rate' | 'avg-gift' | 'total-donations'
  >('pledge-rate');
  // TODO: Add back disclosure when needed (currently conflicts with agent's first message)
  // const [disclosureOn, setDisclosureOn] = useState<boolean>(true);
  // const [disclosureCopy, setDisclosureCopy] = useState<string>('');

  const [callWindowStart, setCallWindowStart] = useState<string>('09:00');
  const [callWindowEnd, setCallWindowEnd] = useState<string>('17:00');

  // TODO: Add back when multiple Twilio numbers are available
  // const [callerId, setCallerId] = useState<string>('');

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
  const [maxAttempts, setMaxAttempts] = useState('');
  const [dailyCallCap, setDailyCallCap] = useState('');
  const [retryLogic, setRetryLogic] = useState('');
  const [_savingField, setSavingField] = useState<string | null>(null);
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
      setCallWindowStart(
        campaign.call_window_start
          ? dayjs(campaign.call_window_start).format('HH:mm')
          : '09:00',
      );
      setCallWindowEnd(
        campaign.call_window_end
          ? dayjs(campaign.call_window_end).format('HH:mm')
          : '17:00',
      );
      setMaxAttempts(campaign.max_attempts?.toString() || '');
      setDailyCallCap(campaign.daily_call_cap?.toString() || '');
      setRetryLogic(campaign.retry_logic || '');
    }
  }, [campaign]);

  // Check if there are unsaved changes for each field
  const _hasNameChanges = campaignName !== (campaign?.name || '');
  const _hasDescriptionChanges =
    campaignDescription !== (campaign?.description || '');
  const _hasScriptChanges = campaignScript !== (campaign?.script || '');
  const _hasStartDateChanges =
    startDate !==
    (campaign?.start_date
      ? dayjs(campaign.start_date).format('YYYY-MM-DD')
      : '');
  const _hasEndDateChanges =
    endDate !==
    (campaign?.end_date ? dayjs(campaign.end_date).format('YYYY-MM-DD') : '');
  const _hasMaxAttemptsChanges = maxAttempts !== '';
  const _hasDailyCallCapChanges = dailyCallCap !== '';
  const _hasRetryLogicChanges = retryLogic !== '';

  const hasCallWindowChanges =
    callWindowStart !==
      (campaign?.call_window_start
        ? dayjs(campaign.call_window_start).format('HH:mm')
        : '09:00') ||
    callWindowEnd !==
      (campaign?.call_window_end
        ? dayjs(campaign.call_window_end).format('HH:mm')
        : '17:00');

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

  const handleSaveCallWindow = useCallback(async () => {
    const schema = z.object({
      start: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time (HH:mm)'),
      end: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time (HH:mm)'),
    });

    const result = schema.safeParse({
      start: callWindowStart,
      end: callWindowEnd,
    });
    if (!result.success) {
      alert(result.error.issues[0]?.message ?? 'Invalid call window');
      return;
    }

    try {
      await updateCampaignMutation.mutateAsync({
        id: campaignId,
        call_window_start: `${callWindowStart}:00`,
        call_window_end: `${callWindowEnd}:00`,
      });
      setSaveSuccess('Call window saved successfully!');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (error) {
      console.error('Failed to save call window:', error);
      alert(
        `Failed to save call window: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }, [callWindowStart, callWindowEnd, campaignId, updateCampaignMutation]);

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
  const revenue = 0; // TODO: Add revenue tracking when implemented

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

  const _handleDeleteLead = async (leadId: string) => {
    try {
      await deleteLeadMutation.mutateAsync(leadId);
    } catch (error) {
      console.error('Failed to delete lead:', error);
    }
  };

  const _handleUpdateLead = async (
    leadId: string,
    data: Partial<Tables<'leads'>['Row']>,
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
            <Skeleton className="h-8 w-48" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
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
      <CampaignHeader
        campaign={campaign}
        onBack={() => router.push('/home/campaigns')}
        onSaveField={handleSaveField}
        onEdit={() => setActiveTab('overview')}
        onActivate={handleActivateCampaign}
        onPause={handlePauseCampaign}
        onDelete={handleDeleteCampaign}
        isUpdatingStatus={updateCampaignMutation.isPending}
        isDeleting={deleteCampaignMutation.isPending}
      />

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
      <div className="glass-panel space-y-6 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="voice">Voice & Script</TabsTrigger>
          </TabsList>
          <TabsContent value="basics" className="space-y-5">
            <div className="mb-4 px-0 pt-0 text-lg font-bold text-gray-900 dark:text-gray-100">
              Campaign Basics
            </div>
            <div>
              <label className="mb-2 block text-base font-semibold text-gray-900 dark:text-gray-100">
                Campaign Name
              </label>
              <Input
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g., Fall Pledge Drive"
              />
              <p className="text-muted-foreground mt-1 text-xs">
                Shown in dashboards and reports.
              </p>
            </div>
            <div>
              <label className="mb-2 block text-base font-semibold text-gray-900 dark:text-gray-100">
                Goal Metric
              </label>
              <Select
                value={goalMetric}
                onValueChange={(v) => setGoalMetric(v as typeof goalMetric)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select optimization goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pledge-rate">Pledge rate</SelectItem>
                  <SelectItem value="avg-gift">Average gift</SelectItem>
                  <SelectItem value="total-donations">
                    Total donations
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground mt-1 text-xs">
                We&apos;ll optimize call summaries and analytics for this KPI.
              </p>
            </div>
            {/* TODO: Add back disclosure line when needed (currently conflicts with agent's first message) */}
            <div>
              <label className="mb-2 block text-base font-semibold text-gray-900 dark:text-gray-100">
                Call Window
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <TimePicker
                    value={callWindowStart}
                    onValueChange={setCallWindowStart}
                  />
                </div>
                <span className="text-muted-foreground text-sm font-medium">
                  to
                </span>
                <div className="flex-1">
                  <TimePicker
                    value={callWindowEnd}
                    onValueChange={setCallWindowEnd}
                  />
                </div>
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                Time in UTC. Calls respect each contact&apos;s local time.
              </p>
              {hasCallWindowChanges && (
                <div className="mt-2 flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleSaveCallWindow}
                    disabled={updateCampaignMutation.isPending}
                  >
                    {updateCampaignMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
              {/* TODO: Add back caller ID when multiple Twilio numbers are available */}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {}}>
                Test call to me
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="audience" className="space-y-5">
            <TooltipProvider>
              <div className="px-0 pt-0 text-base font-medium">Audience</div>
              <div className="rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    <p className="text-sm font-medium">Upload CSV</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        /* TODO: template */
                      }}
                    >
                      <FileDown className="mr-2 h-4 w-4" /> Template
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        /* TODO: connect CRM */
                      }}
                    >
                      Connect CRM
                    </Button>
                  </div>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  Required headers: first_name, phone. Optional: last_name,
                  email, timezone, opt_in.
                </p>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <CsvDropzone
                    disabled={!campaignId}
                    onFileSelected={() => {
                      /* TODO */
                    }}
                  >
                    Drop CSV here or click to choose
                  </CsvDropzone>
                  <div className="rounded-lg bg-white/50 p-3 text-xs ring-1 ring-black/5 dark:bg-zinc-900/50 dark:ring-white/10">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium">Headers detected</span>
                      <AlertCircle className="h-3.5 w-3.5 opacity-60" />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {[
                        'first_name',
                        'last_name',
                        'phone',
                        'email',
                        'timezone',
                        'opt_in',
                      ].map((h) => (
                        <Badge key={h} variant={'outline'} className="gap-1">
                          {h}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch checked={true} onCheckedChange={() => {}} />
                    <span className="text-sm">Dedupe by phone</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 cursor-help text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Remove duplicate contacts with the same phone number
                          to avoid calling the same person multiple times
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={true} onCheckedChange={() => {}} />
                    <span className="text-sm">Exclude DNC list</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 cursor-help text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Automatically exclude contacts on the Do Not Call
                          registry to ensure compliance with telemarketing
                          regulations
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </TooltipProvider>
          </TabsContent>

          <TabsContent value="voice" className="space-y-5">
            <div className="mb-4 px-0 pt-0 text-lg font-bold text-gray-900 dark:text-gray-100">
              Voice & Script Configuration
            </div>
            <p className="text-muted-foreground text-sm">
              Voice selection, speaking pace, and script editing live on the
              Agent page. This campaign will use the assigned agent&apos;s
              current voice and script.
            </p>
            {assignedAgent ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(`/home/agents/${assignedAgent.id}?tab=voice`)
                  }
                >
                  Go to Agent voice & script
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(`/home/agents/${assignedAgent.id}`)
                  }
                >
                  Open Agent
                </Button>
              </div>
            ) : (
              <p className="text-sm">
                No agent assigned. Assign an agent to control voice & script.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Note: LeadsTable removed to avoid unused component warnings. If needed later,
// re-introduce it from version control history.

// Removed obsolete _EditableLeadRow component (unused)

// Removed obsolete AgentCard component (unused)

// Removed obsolete SettingsCard component (previously unused here)

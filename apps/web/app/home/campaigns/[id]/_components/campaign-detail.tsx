'use client';

import { useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import dayjs from 'dayjs';
import {
  ArrowLeft,
  CheckCircle,
  DollarSign,
  Info,
  Link,
  Phone,
  Upload,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@kit/ui/tooltip';

import { DatePicker, StatsCard, TimePicker } from '~/components/shared';

import { CampaignHeader } from './campaign-header';
import { CSVUpload } from './csv-upload';

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
  const [goalMetric, setGoalMetric] = useState<'pledge-rate' | 'avg-gift'>(
    'pledge-rate',
  );
  const [disclosureOn, setDisclosureOn] = useState<boolean>(true);
  const [disclosureCopy, setDisclosureCopy] = useState<string>(
    'Hi {{first_name}}, this is {{agent_name}} with {{org_name}}.',
  );
  const [callWindowStart, setCallWindowStart] = useState<string>('09:00');
  const [callWindowEnd, setCallWindowEnd] = useState<string>('17:00');
  const [callerId, setCallerId] = useState<string>('');

  const [segment, setSegment] = useState<'new' | 'lapsed' | 'vip'>('new');
  const [timezone, setTimezone] = useState<string>('America/New_York');
  const [respectDnc, setRespectDnc] = useState<boolean>(true);

  const [voiceId, setVoiceId] = useState<string>('');
  const [pace, setPace] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [scriptOpener, setScriptOpener] = useState<string>(
    'Hi {{first_name}}, this is {{agent_name}} with {{org_name}}.',
  );
  const [scriptPitch, setScriptPitch] = useState<string>(
    'Quick update about {{impact_short}}.',
  );
  const [scriptClose, setScriptClose] = useState<string>(
    "I'll text a link: {{donation_link}}.",
  );
  const [retry48, setRetry48] = useState<boolean>(true);
  const [retry96, setRetry96] = useState<boolean>(false);
  const [voicemailOn, setVoicemailOn] = useState<boolean>(true);
  const [smsFallbackOn, setSmsFallbackOn] = useState<boolean>(true);
  const [voicemailCopy] = useState<string>(
    'Hi {{first_name}}, it’s {{agent_name}} from {{org_name}}. Quick update about {{impact_short}}. I’ll text a link.',
  );
  const [testCallSent, setTestCallSent] = useState<boolean>(false);

  // Fake list of Twilio numbers and voices for UI (replace with real hooks later)
  const twilioNumbers = ['+1 202-555-0125', '+1 415-555-0142'];
  const availableVoices = [
    { id: 'default-1', name: 'Warm Female' },
    { id: 'default-2', name: 'Confident Male' },
  ];
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
  const [editingName, setEditingName] = useState(false);
  const timezoneOptions = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Berlin',
    'Asia/Kolkata',
    'Asia/Tokyo',
    'Australia/Sydney',
  ];

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

  const handleDeleteLead = async (leadId: string) => {
    try {
      await deleteLeadMutation.mutateAsync(leadId);
    } catch (error) {
      console.error('Failed to delete lead:', error);
    }
  };

  const handleUpdateLead = async (
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
      <Card className={'glass-panel'}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basics">Basics</TabsTrigger>
              <TabsTrigger value="audience">Audience</TabsTrigger>
              <TabsTrigger value="voice">Voice & Script</TabsTrigger>
              <TabsTrigger value="review">Review & Launch</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent value="basics" className="space-y-6">
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle>Basics</CardTitle>
                  <CardDescription>Single-column, quick setup</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Campaign name
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
                    <label className="mb-1 block text-sm font-medium">
                      Goal metric
                    </label>
                    <Select
                      value={goalMetric}
                      onValueChange={(v) => setGoalMetric(v as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pledge-rate">Pledge rate</SelectItem>
                        <SelectItem value="avg-gift">Average gift</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-muted-foreground mt-1 text-xs">
                      We\'ll optimize summary cards for this KPI.
                    </p>
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Disclosure line
                      </label>
                      <p className="text-muted-foreground text-xs">
                        Auto insert at the start of calls.
                      </p>
                    </div>
                    <Switch
                      checked={disclosureOn}
                      onCheckedChange={setDisclosureOn}
                    />
                  </div>
                  {disclosureOn && (
                    <div>
                      <Textarea
                        value={disclosureCopy}
                        onChange={(e) => setDisclosureCopy(e.target.value)}
                        className="min-h-[60px]"
                      />
                      <p className="text-muted-foreground mt-1 text-xs">
                        Use variables like {'{{first_name}}'},{' '}
                        {'{{agent_name}}'}, {'{{org_name}}'}.
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Call window
                      </label>
                      <div className="flex items-center gap-2">
                        <TimePicker
                          value={callWindowStart}
                          onValueChange={setCallWindowStart}
                          className="flex-1"
                        />
                        <span className="text-muted-foreground text-xs">
                          to
                        </span>
                        <TimePicker
                          value={callWindowEnd}
                          onValueChange={setCallWindowEnd}
                          className="flex-1"
                        />
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Local time for each contact.
                      </p>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Caller ID
                      </label>
                      <Select value={callerId} onValueChange={setCallerId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a Twilio number" />
                        </SelectTrigger>
                        <SelectContent>
                          {twilioNumbers.map((n) => (
                            <SelectItem key={n} value={n}>
                              {n}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-muted-foreground mt-1 text-xs">
                        The number displayed to donors.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setTestCallSent(true)}
                    >
                      Test call to me
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audience" className="space-y-6">
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle>Audience</CardTitle>
                  <CardDescription>Upload or filter contacts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <TooltipProvider>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div>
                        <div className="mb-1 flex items-center gap-1">
                          <label className="block text-sm font-medium">
                            Segment
                          </label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="text-muted-foreground h-3.5 w-3.5" />
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              align="start"
                              className="max-w-xs"
                            >
                              <p className="text-xs">
                                New: first-time or never-donated contacts.
                                Lapsed: inactive donors (e.g., &gt;12 months).
                                VIP: high-value donors or key supporters.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select
                          value={segment}
                          onValueChange={(v) => setSegment(v as any)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a segment" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="lapsed">Lapsed</SelectItem>
                            <SelectItem value="vip">VIP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <div className="mb-1 flex items-center gap-1">
                          <label className="block text-sm font-medium">
                            Timezone
                          </label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="text-muted-foreground h-3.5 w-3.5" />
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              align="start"
                              className="max-w-xs"
                            >
                              <p className="text-xs">
                                Calls respect each contact&apos;s local time.
                                This default timezone applies when contact data
                                lacks timezone info.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select value={timezone} onValueChange={setTimezone}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            {timezoneOptions.map((tz) => (
                              <SelectItem key={tz} value={tz}>
                                {tz}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end justify-between gap-2">
                        <div>
                          <div className="mb-1 flex items-center gap-1">
                            <label className="block text-sm font-medium">
                              Respect DNC
                            </label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="text-muted-foreground h-3.5 w-3.5" />
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                align="start"
                                className="max-w-xs"
                              >
                                <p className="text-xs">
                                  Exclude contacts flagged as Do Not Call. We
                                  won&apos;t dial or SMS these contacts.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <p className="text-muted-foreground text-xs">
                            Exclude do-not-call contacts
                          </p>
                        </div>
                        <Switch
                          checked={respectDnc}
                          onCheckedChange={setRespectDnc}
                        />
                      </div>
                    </div>
                  </TooltipProvider>
                  <div className="flex items-center gap-2">
                    <CSVUpload campaignId={campaignId} onSuccess={() => {}} />
                    <Button variant="outline" size="sm">
                      <Upload className="mr-2 h-4 w-4" /> Dedupe
                    </Button>
                  </div>
                  <div className="text-sm">
                    N contacts: {campaignLeads.length.toLocaleString()}
                  </div>
                  <div className="overflow-hidden rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Phone</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {campaignLeads.slice(0, 5).map((l) => (
                          <TableRow key={l.id}>
                            <TableCell>{l.name}</TableCell>
                            <TableCell>{l.phone}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="voice" className="space-y-6">
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle>Voice & Script</CardTitle>
                  <CardDescription>Managed in the Agent page</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Voice selection, speaking pace, and script editing live on
                    the Agent page. This campaign will use the assigned agent\'s
                    current voice and script.
                  </p>
                  {assignedAgent ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          router.push(
                            `/home/agents/${assignedAgent.id}?tab=voice`,
                          )
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
                      No agent assigned. Assign an agent to control voice &
                      script.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="review" className="space-y-6">
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle>Review & Launch</CardTitle>
                  <CardDescription>
                    Final checks before going live
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="glass-panel">
                      <CardHeader>
                        <CardTitle className="text-base">Basics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-1 text-sm">
                        <div>
                          <span className="font-medium">Name:</span>{' '}
                          {campaignName}
                        </div>
                        <div>
                          <span className="font-medium">Goal:</span>{' '}
                          {goalMetric === 'pledge-rate'
                            ? 'Pledge rate'
                            : 'Average gift'}
                        </div>
                        <div>
                          <span className="font-medium">Caller ID:</span>{' '}
                          {callerId || '—'}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="glass-panel">
                      <CardHeader>
                        <CardTitle className="text-base">Audience</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-1 text-sm">
                        <div>
                          <span className="font-medium">Segment:</span>{' '}
                          {segment}
                        </div>
                        <div>
                          <span className="font-medium">Timezone:</span>{' '}
                          {timezone}
                        </div>
                        <div>
                          <span className="font-medium">Contacts:</span>{' '}
                          {campaignLeads.length.toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="glass-panel">
                      <CardHeader>
                        <CardTitle className="text-base">Script</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-1 text-sm">
                        <div>Managed in Agent page.</div>
                        {assignedAgent && (
                          <div className="text-muted-foreground text-xs">
                            Agent: {assignedAgent.name}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-md border bg-white/70 p-3 text-sm dark:bg-neutral-900/50">
                      ✓ number selected: {callerId ? 'Yes' : 'No'}
                    </div>
                    <div className="rounded-md border bg-white/70 p-3 text-sm dark:bg-neutral-900/50">
                      ✓ CSV parsed: {campaignLeads.length > 0 ? 'Yes' : 'No'}
                    </div>
                    <div className="rounded-md border bg-white/70 p-3 text-sm dark:bg-neutral-900/50">
                      ✓ test call sent: {testCallSent ? 'Yes' : 'No'}
                    </div>
                    <div className="rounded-md border bg-white/70 p-3 text-sm dark:bg-neutral-900/50">
                      ✓ SMS link reachable: Pending
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      disabled={
                        !callerId || campaignLeads.length === 0 || !testCallSent
                      }
                      onClick={handleActivateCampaign}
                    >
                      Launch Campaign
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
  leads: Tables<'leads'>['Row'][];
  onDeleteLead: (leadId: string) => Promise<void>;
  onUpdateLead: (
    leadId: string,
    data: Partial<Tables<'leads'>['Row']>,
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
  lead: Tables<'leads'>['Row'];
  onDelete: (leadId: string) => Promise<void>;
  onUpdate: (
    leadId: string,
    data: Partial<Tables<'leads'>['Row']>,
  ) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingLead, setEditingLead] = useState({
    name: lead.name || '',
    email: lead.email || '',
    phone: lead.phone || '',
    company: lead.company || '',
  });
  const [savingField, setSavingField] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSaveAllFields = async () => {
    setSavingField('all');
    try {
      await onUpdate(lead.id, {
        name: editingLead.name,
        email: editingLead.email,
        phone: editingLead.phone,
        company: editingLead.company,
      });
      setSavingField(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update lead:', error);
      setSavingField(null);
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
  };

  const deleteLead = async (id: string) => {
    await onDelete(id);
    setDeletingId(null);
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  const getLeadStatusBadge = (status: string) => {
    return <StatusBadge status={status} />;
  };

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        {isEditing ? (
          <div className="space-y-2">
            <Input
              type="text"
              value={editingLead.name}
              onChange={(e) =>
                setEditingLead((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Name"
              className="w-full"
            />
            <Input
              type="email"
              value={editingLead.email}
              onChange={(e) =>
                setEditingLead((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Email"
              className="w-full"
            />
          </div>
        ) : (
          <div>
            <div className="font-medium">{lead.name}</div>
            <div className="text-muted-foreground text-sm">{lead.email}</div>
          </div>
        )}
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
            className="w-full"
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
            className="w-full"
          />
        ) : (
          lead.company || '-'
        )}
      </TableCell>
      <TableCell>{getLeadStatusBadge(lead.status)}</TableCell>
      <TableCell>Never</TableCell>
      <TableCell>0</TableCell>
      <TableCell className="text-right">
        {isEditing ? (
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleSaveAllFields}
              disabled={savingField === 'all'}
              className="text-green-600 hover:text-green-700"
            >
              {savingField === 'all' ? 'Saving...' : 'Save'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <DropdownMenu open={deletingId === lead.id ? true : undefined}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Lead
              </DropdownMenuItem>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                View Donor
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Phone className="mr-2 h-4 w-4" />
                Retry Call
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {deletingId === lead.id ? (
                <div className="flex gap-1 p-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteLead(lead.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={cancelDelete}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => confirmDelete(lead.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TableCell>
    </TableRow>
  );
}

function AgentCard({ agent }: { agent: Tables<'agents'>['Row'] | undefined }) {
  const router = useRouter();
  if (!agent) {
    return (
      <Card className={'glass-panel'}>
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
    <Card className={'glass-panel'}>
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
            <p className="text-muted-foreground text-sm">Default tone</p>
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
  campaign: Tables<'campaigns'>['Row'];
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
      <Card className={'glass-panel'}>
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

      <Card className={'glass-panel'}>
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
                <SelectItem value="standard">Standard Retry Logic</SelectItem>
                <SelectItem value="aggressive">
                  Aggressive Retry Logic
                </SelectItem>
                <SelectItem value="conservative">
                  Conservative Retry Logic
                </SelectItem>
                <SelectItem value="smart">Smart Retry Logic</SelectItem>
              </SelectContent>
            </Select>
            {retryLogic && (
              <div className="text-muted-foreground mt-2 text-sm">
                {retryLogic === 'standard' && (
                  <p>Retry after 24 hours, max 3 attempts, skip opt-outs</p>
                )}
                {retryLogic === 'aggressive' && (
                  <p>
                    Retry after 4-6 hours, max 5 attempts, multiple time slots
                  </p>
                )}
                {retryLogic === 'conservative' && (
                  <p>
                    Retry after 48-72 hours, max 2 attempts, business hours only
                  </p>
                )}
                {retryLogic === 'smart' && (
                  <p>
                    Adaptive timing, ML optimization, personalized strategies
                  </p>
                )}
              </div>
            )}
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

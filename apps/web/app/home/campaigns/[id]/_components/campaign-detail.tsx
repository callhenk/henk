'use client';

import { useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import { ArrowLeft, CheckCircle, DollarSign, Phone, Users } from 'lucide-react';
import { toast } from 'sonner';

import { useBusinessContext } from '@kit/supabase/hooks/use-business-context';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Skeleton } from '@kit/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { TooltipProvider } from '@kit/ui/tooltip';

import { StatsCard, TimePicker } from '~/components/shared';

import AudienceImportCard from './AudienceImportCard';
import ExistingAudienceCard from './ExistingAudienceCard';
import { CampaignHeader } from './campaign-header';
import useCampaignEditor from './hooks/useCampaignEditor';

export function CampaignDetail({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const { data: _businessContext } = useBusinessContext();
  const editor = useCampaignEditor(campaignId);

  const {
    campaign,
    loadingCampaign,
    leads,
    agents,
    assignedAgent,
    agentReadiness,
    metrics,
    activeTab,
    setActiveTab,
    goalMetric,
    setGoalMetric,
    campaignName,
    setCampaignName,
    campaignDescription,
    setCampaignDescription,
    callWindowStart,
    setCallWindowStart,
    callWindowEnd,
    setCallWindowEnd,
    maxAttempts,
    setMaxAttempts,
    dailyCallCap,
    setDailyCallCap,
    retryLogicValue,
    setRetryLogicValue,
    selectedAgentId,
    setSelectedAgentId,
    savingField,
    isUpdatingStatus,
    isScriptDialogOpen,
    setIsScriptDialogOpen,
    hasCallWindowChanges,
    handleSaveField,
    handleSaveCallWindow,
    handleDeleteCampaign,
    handleActivateCampaign,
    handlePauseCampaign,
  } = editor;

  // computed inside hook and exposed as hasCallWindowChanges

  const maskE164 = (num?: string | null): string => {
    if (!num) return '—';
    if (!/^\+[1-9]\d{6,14}$/.test(num)) return num;
    const visible = num.slice(-2);
    return `${num.slice(0, 2)}••••••••${visible}`;
  };

  const { contacted, conversions, conversionRate, revenue } = metrics;

  // Local state for editable campaign dates (YYYY-MM-DD)
  const initialStart = useMemo(
    () =>
      campaign?.start_date ? String(campaign.start_date).slice(0, 10) : '',
    [campaign?.start_date],
  );
  const initialEnd = useMemo(
    () => (campaign?.end_date ? String(campaign.end_date).slice(0, 10) : ''),
    [campaign?.end_date],
  );
  const [startDate, setStartDate] = useState<string>(initialStart);
  const [endDate, setEndDate] = useState<string>(initialEnd);

  // const onDeleted = async () => router.push('/home/campaigns');

  // lead mutations not in this component anymore

  // Campaign status handlers handled in hook

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
      {/* Header */}
      <CampaignHeader
        campaign={campaign}
        onBack={() => router.push('/home/campaigns')}
        onSaveField={handleSaveField}
        onEdit={() => setActiveTab('overview')}
        onActivate={handleActivateCampaign}
        onPause={handlePauseCampaign}
        onDelete={handleDeleteCampaign}
        isUpdatingStatus={isUpdatingStatus}
        isDeleting={false}
      />

      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Leads"
          value={leads.length.toLocaleString()}
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
              {campaignName !== (campaign?.name || '') && (
                <div className="mt-2 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => handleSaveField('name', campaignName)}
                    disabled={savingField === 'name'}
                  >
                    {savingField === 'name' ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>
            <div>
              <label className="mb-2 block text-base font-semibold text-gray-900 dark:text-gray-100">
                Description
              </label>
              <Input
                value={campaignDescription}
                onChange={(e) => setCampaignDescription(e.target.value)}
                placeholder="Brief description of the campaign"
              />
              <p className="text-muted-foreground mt-1 text-xs">
                Internal notes about the campaign.
              </p>
              {campaignDescription !== (campaign?.description || '') && (
                <div className="mt-2 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() =>
                      handleSaveField('description', campaignDescription)
                    }
                    disabled={savingField === 'description'}
                  >
                    {savingField === 'description' ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
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
              {(() => {
                // determine if changed vs campaign.goal_metric (api value)
                const uiToApi = (v: typeof goalMetric) =>
                  v === 'avg-gift'
                    ? 'average_gift'
                    : v === 'total-donations'
                      ? 'total_donations'
                      : 'pledge_rate';
                const changed =
                  uiToApi(goalMetric) !==
                  (campaign.goal_metric ?? 'pledge_rate');
                return (
                  changed && (
                    <div className="mt-2 flex justify-end">
                      <Button
                        size="sm"
                        onClick={() =>
                          handleSaveField('goal_metric', uiToApi(goalMetric))
                        }
                        disabled={savingField === 'goal_metric'}
                      >
                        {savingField === 'goal_metric' ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  )
                );
              })()}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-base font-semibold text-gray-900 dark:text-gray-100">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <p className="text-muted-foreground mt-1 text-xs">
                  Campaign planned start date (optional)
                </p>
                {startDate !== (campaign?.start_date?.slice(0, 10) || '') && (
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
                <label className="mb-2 block text-base font-semibold text-gray-900 dark:text-gray-100">
                  End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <p className="text-muted-foreground mt-1 text-xs">
                  Campaign planned end date (optional)
                </p>
                {endDate !== (campaign?.end_date?.slice(0, 10) || '') && (
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
                  <Button size="sm" onClick={handleSaveCallWindow}>
                    Save
                  </Button>
                </div>
              )}
            </div>
            <div>
              <label className="mb-2 block text-base font-semibold text-gray-900 dark:text-gray-100">
                Max Attempts
              </label>
              <Input
                type="number"
                min="1"
                max="10"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(e.target.value)}
                placeholder="3"
              />
              <p className="text-muted-foreground mt-1 text-xs">
                Maximum number of call attempts per lead.
              </p>
              {maxAttempts !== (campaign?.max_attempts?.toString() || '') && (
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
            <div>
              <label className="mb-2 block text-base font-semibold text-gray-900 dark:text-gray-100">
                Daily Call Cap
              </label>
              <Input
                type="number"
                min="1"
                max="10000"
                value={dailyCallCap}
                onChange={(e) => setDailyCallCap(e.target.value)}
                placeholder="100"
              />
              <p className="text-muted-foreground mt-1 text-xs">
                Maximum calls per day for this campaign.
              </p>
              {dailyCallCap !==
                (campaign?.daily_call_cap?.toString() || '') && (
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
          </TabsContent>

          <TabsContent value="audience" className="space-y-5">
            <TooltipProvider>
              <div className="mb-4 px-0 pt-0 text-lg font-bold text-gray-900 dark:text-gray-100">
                Audience
              </div>
              <div className="space-y-4 rounded-md p-4">
                <ExistingAudienceCard campaignId={campaignId} />
                <AudienceImportCard campaignId={campaignId} />
              </div>
            </TooltipProvider>
          </TabsContent>

          <TabsContent value="voice" className="space-y-5">
            <div className="mb-4 px-0 pt-0 text-lg font-bold text-gray-900 dark:text-gray-100">
              Voice & Script
            </div>
            {/* Agent selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Agent</label>
              <Select
                value={selectedAgentId ?? ''}
                onValueChange={async (id) => {
                  setSelectedAgentId(id);
                  await handleSaveField('agent_id', id);
                  toast.message(
                    "Agent updated. Using the agent's caller ID, disclosure, and script for this campaign.",
                  );
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name ?? 'Unnamed Agent'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedAgentId && (
                <p className="text-muted-foreground text-xs">
                  Required to activate a campaign.
                </p>
              )}
            </div>

            {/* Read-only preview */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-md border p-3">
                <div className="mb-2 text-sm font-medium">Caller ID</div>
                <div className="text-sm">{maskE164(campaign.caller_id)}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="mb-2 text-sm font-medium">Disclosure line</div>
                <div className="text-muted-foreground text-sm">
                  {(
                    assignedAgent?.starting_message as string | undefined
                  )?.slice(0, 120) || '—'}
                </div>
              </div>
              <div className="rounded-md border p-3 md:col-span-2">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-medium">Script preview</div>
                  {assignedAgent?.script_template && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsScriptDialogOpen(true)}
                    >
                      View full script
                    </Button>
                  )}
                </div>
                <pre className="bg-muted max-h-48 overflow-auto rounded p-3 text-xs whitespace-pre-wrap">
                  {String(assignedAgent?.faqs ?? '—')
                    .split('\n')
                    .slice(0, 12)
                    .join('\n')}
                </pre>
              </div>
            </div>

            {/* Health panel */}
            <div className="rounded-md border p-3">
              <div className="mb-2 text-sm font-medium">Agent readiness</div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={agentReadiness.hasScript ? 'default' : 'destructive'}
                >
                  Script {agentReadiness.hasScript ? 'ready' : 'missing'}
                </Badge>
                <Badge
                  variant={
                    agentReadiness.hasDisclosure ? 'default' : 'destructive'
                  }
                >
                  Disclosure{' '}
                  {agentReadiness.hasDisclosure ? 'ready' : 'missing'}
                </Badge>
                <Badge
                  variant={
                    agentReadiness.hasCallerId ? 'default' : 'destructive'
                  }
                >
                  Caller ID {agentReadiness.hasCallerId ? 'ready' : 'missing'}
                </Badge>
              </div>
              {assignedAgent && (
                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/home/agents/${assignedAgent.id}`)
                    }
                  >
                    Manage agent
                  </Button>
                </div>
              )}
            </div>

            {/* Campaign setting: retry logic */}
            <div>
              <label className="mb-2 block text-base font-semibold text-gray-900 dark:text-gray-100">
                Retry logic
              </label>
              <Input
                value={retryLogicValue}
                onChange={(e) => setRetryLogicValue(e.target.value)}
                placeholder="e.g., 3 attempts, 6h apart, only within call window"
                disabled={campaign.status === 'completed'}
              />
              {retryLogicValue !== (campaign.retry_logic ?? '') && (
                <div className="mt-2 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() =>
                      handleSaveField('retry_logic', retryLogicValue)
                    }
                    disabled={savingField === 'retry_logic'}
                  >
                    {savingField === 'retry_logic' ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>

            {/* Script dialog */}
            <Dialog
              open={isScriptDialogOpen}
              onOpenChange={setIsScriptDialogOpen}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agent script</DialogTitle>
                </DialogHeader>
                <pre className="bg-muted max-h-[60vh] overflow-auto rounded p-3 text-sm whitespace-pre-wrap">
                  {String(assignedAgent?.script_template ?? '—')}
                </pre>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

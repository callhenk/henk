'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { z } from 'zod';

import type { Tables } from '@kit/supabase/database';
import { useAgents } from '@kit/supabase/hooks/agents/use-agents';
import {
  useDeleteCampaign,
  useUpdateCampaign,
} from '@kit/supabase/hooks/campaigns/use-campaign-mutations';
import { useCampaign } from '@kit/supabase/hooks/campaigns/use-campaigns';
import { useConversations } from '@kit/supabase/hooks/conversations/use-conversations';
import { useLeads } from '@kit/supabase/hooks/leads/use-leads';

import { validateReadyForActive } from '../schemas';

const callWindowSchema = z
  .object({
    start: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)'),
    end: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)'),
  })
  .refine(
    (data) => {
      const start = dayjs(`2000-01-01 ${data.start}`);
      const end = dayjs(`2000-01-01 ${data.end}`);
      return end.isAfter(start);
    },
    { message: 'End time must be after start time' },
  );

export function useCampaignEditor(campaignId: string) {
  // Fetch data
  const { data: campaign, isLoading: loadingCampaign } =
    useCampaign(campaignId);
  const { data: leads = [] } = useLeads();
  const { data: conversations = [] } = useConversations();
  const { data: agents = [] } = useAgents();

  // Mutations
  const deleteCampaignMutation = useDeleteCampaign();
  const updateCampaignMutation = useUpdateCampaign();

  // State
  const [activeTab, setActiveTab] = useState('basics');
  const [goalMetric, setGoalMetric] = useState<
    'pledge-rate' | 'avg-gift' | 'total-donations'
  >('pledge-rate');
  const [campaignName, setCampaignName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [callWindowStart, setCallWindowStart] = useState<string>('09:00');
  const [callWindowEnd, setCallWindowEnd] = useState<string>('17:00');
  const [maxAttempts, setMaxAttempts] = useState('');
  const [dailyCallCap, setDailyCallCap] = useState('');
  const [retryLogicValue, setRetryLogicValue] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isScriptDialogOpen, setIsScriptDialogOpen] = useState(false);

  // Init when campaign changes
  useEffect(() => {
    if (!campaign) return;
    // Map API goal_metric (underscored) to UI state (hyphenated)
    const apiToUiGoal = (
      v?: string | null,
    ): 'pledge-rate' | 'avg-gift' | 'total-donations' => {
      switch (v) {
        case 'average_gift':
          return 'avg-gift';
        case 'total_donations':
          return 'total-donations';
        case 'pledge_rate':
        default:
          return 'pledge-rate';
      }
    };

    const normalizeTime = (value?: string | null): string => {
      if (!value) return '';
      if (/^\d{2}:\d{2}$/.test(value)) return value;
      if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value.slice(0, 5);
      const parsed = dayjs(value);
      return parsed.isValid() ? parsed.format('HH:mm') : '';
    };

    setCampaignName(campaign.name || '');
    setCampaignDescription(campaign.description || '');
    setCallWindowStart(normalizeTime(campaign.call_window_start) || '09:00');
    setCallWindowEnd(normalizeTime(campaign.call_window_end) || '17:00');
    setMaxAttempts(campaign.max_attempts?.toString() || '');
    setDailyCallCap(campaign.daily_call_cap?.toString() || '');
    setRetryLogicValue(campaign.retry_logic ?? '');
    setSelectedAgentId(campaign.agent_id ?? null);
    setGoalMetric(apiToUiGoal(campaign.goal_metric));
  }, [campaign]);

  // Derived
  const hasCallWindowChanges =
    callWindowStart !==
      (campaign?.call_window_start
        ? dayjs(campaign.call_window_start).format('HH:mm')
        : '09:00') ||
    callWindowEnd !==
      (campaign?.call_window_end
        ? dayjs(campaign.call_window_end).format('HH:mm')
        : '17:00');

  const campaignLeads = useMemo(
    () => leads.filter((l) => l.campaign_id === campaignId),
    [leads, campaignId],
  );
  const campaignConversations = useMemo(
    () => conversations.filter((c) => c.campaign_id === campaignId),
    [conversations, campaignId],
  );
  const assignedAgent = useMemo(
    () => agents.find((a) => a.id === (selectedAgentId ?? campaign?.agent_id)),
    [agents, selectedAgentId, campaign?.agent_id],
  );

  const agentReadiness = useMemo(() => {
    const hasScript = Boolean(
      assignedAgent?.donor_context &&
        String(assignedAgent.donor_context).trim().length > 0,
    );
    const hasDisclosure = Boolean(
      assignedAgent?.starting_message &&
        String(assignedAgent.starting_message).trim().length > 0,
    );
    // Caller ID is automatically assigned for new agents
    const hasCallerId = true;
    return { hasScript, hasDisclosure, hasCallerId } as const;
  }, [assignedAgent?.donor_context, assignedAgent?.starting_message]);

  const contacted = campaignConversations.length;
  const conversions = campaignConversations.filter(
    (conv) => conv.outcome === 'donated' || conv.status === 'completed',
  ).length;
  const conversionRate =
    contacted > 0 ? Math.round((conversions / contacted) * 100) : 0;
  const revenue = 0;

  // Handlers
  const handleSaveField = useCallback(
    async (fieldName: string, value: string) => {
      if (!campaign) return;
      setSavingField(fieldName);
      try {
        // Validate the field value based on field type
        let validatedValue: string | number = value;
        let isValid = true;
        let errorMessage = '';

        if (fieldName === 'max_attempts') {
          const numValue = parseInt(value) || 0;
          if (numValue < 1 || numValue > 10) {
            isValid = false;
            errorMessage = 'Max attempts must be between 1 and 10';
          }
          validatedValue = numValue;
        } else if (fieldName === 'daily_call_cap') {
          const numValue = parseInt(value) || 0;
          if (numValue < 1 || numValue > 10000) {
            isValid = false;
            errorMessage = 'Daily call cap must be between 1 and 10,000';
          }
          validatedValue = numValue;
        } else if (fieldName === 'name') {
          if (!value.trim()) {
            isValid = false;
            errorMessage = 'Name is required';
          } else if (value.length > 255) {
            isValid = false;
            errorMessage = 'Name too long (max 255 characters)';
          }
        } else if (fieldName === 'start_date' || fieldName === 'end_date') {
          // Allow clearing the date (optional field)
          if (value === '' || value == null) {
            validatedValue = null as unknown as string;
          } else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            // Normalize to midnight UTC to avoid timezone drift
            const iso = new Date(`${value}T00:00:00Z`).toISOString();
            validatedValue = iso;
          } else {
            isValid = false;
            errorMessage = 'Invalid date format (YYYY-MM-DD)';
          }
        }

        if (!isValid) {
          toast.error(errorMessage);
          return;
        }

        const updateData: Partial<Tables<'campaigns'>['Update']> & {
          id: string;
        } = {
          id: campaignId,
          [fieldName]:
            validatedValue as Tables<'campaigns'>['Update'][keyof Tables<'campaigns'>['Update']],
        };
        await updateCampaignMutation.mutateAsync(updateData);

        const fieldLabel =
          fieldName === 'script'
            ? 'Script'
            : fieldName === 'max_attempts'
              ? 'Max attempts'
              : fieldName === 'daily_call_cap'
                ? 'Daily call cap'
                : fieldName
                    .replace('_', ' ')
                    .replace(/\b\w/g, (l) => l.toUpperCase());
        toast.success(`${fieldLabel} saved successfully!`);
      } catch (error) {
        console.error(`Failed to save ${fieldName} changes:`, error);
        toast.error(
          `Failed to save ${fieldName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      } finally {
        setSavingField(null);
      }
    },
    [campaign, campaignId, updateCampaignMutation],
  );

  const handleSaveCallWindow = useCallback(async () => {
    const result = callWindowSchema.safeParse({
      start: callWindowStart,
      end: callWindowEnd,
    });
    if (!result.success) {
      const errorMessage =
        result.error.errors[0]?.message ?? 'Invalid call window';
      toast.error(errorMessage);
      return;
    }
    try {
      await updateCampaignMutation.mutateAsync({
        id: campaignId,
        call_window_start: `${callWindowStart}:00`,
        call_window_end: `${callWindowEnd}:00`,
      });
      toast.success('Call window saved successfully!');
    } catch (error) {
      console.error('Failed to save call window:', error);
      toast.error(
        `Failed to save call window: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }, [callWindowStart, callWindowEnd, campaignId, updateCampaignMutation]);

  const handleDeleteCampaign = useCallback(async () => {
    if (!campaign) return;
    try {
      await deleteCampaignMutation.mutateAsync(campaignId);
    } catch (error) {
      console.error('Failed to delete campaign:', error);
    }
  }, [campaign, campaignId, deleteCampaignMutation]);

  const handleActivateCampaign = useCallback(async () => {
    if (!campaign) return;
    try {
      setIsUpdatingStatus(true);
      const errs = validateReadyForActive({
        status: 'active',
        agent_id: selectedAgentId ?? campaign.agent_id,
        agent: agentReadiness,
        call_window_start: callWindowStart ? `${callWindowStart}:00` : null,
        call_window_end: callWindowEnd ? `${callWindowEnd}:00` : null,
        audience_contact_count: campaignLeads.length,
      });
      if (errs.length > 0) {
        toast.error(`Cannot activate:\n- ${errs.join('\n- ')}`);
        return;
      }
      const resp = await fetch(`/api/campaigns/${campaignId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await resp.json();
      if (!resp.ok || !json?.success) {
        throw new Error(json?.error || `Failed (${resp.status})`);
      }
      toast.success('Campaign activated');
    } catch (error) {
      console.error('Failed to activate campaign:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to activate campaign',
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [
    campaign,
    selectedAgentId,
    agentReadiness,
    callWindowStart,
    callWindowEnd,
    campaignLeads.length,
    campaignId,
  ]);

  const handlePauseCampaign = useCallback(async () => {
    if (!campaign) return;
    try {
      setIsUpdatingStatus(true);
      const resp = await fetch(`/api/campaigns/${campaignId}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await resp.json();
      if (!resp.ok || !json?.success) {
        throw new Error(json?.error || `Failed (${resp.status})`);
      }
      toast.success('Campaign paused');
    } catch (error) {
      console.error('Failed to pause campaign:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to pause campaign',
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [campaign, campaignId]);

  return {
    // data
    campaign,
    loadingCampaign,
    leads: campaignLeads,
    conversations: campaignConversations,
    agents,
    assignedAgent,
    agentReadiness,
    metrics: { contacted, conversions, conversionRate, revenue },

    // state
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

    // handlers
    handleSaveField,
    handleSaveCallWindow,
    handleDeleteCampaign,
    handleActivateCampaign,
    handlePauseCampaign,
  } as const;
}

export default useCampaignEditor;

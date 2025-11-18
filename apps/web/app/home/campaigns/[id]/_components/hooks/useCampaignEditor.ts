'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { z } from 'zod';

import type { Tables, TablesUpdate } from '@kit/supabase/database';
import { useAgents } from '@kit/supabase/hooks/agents/use-agents';
import {
  useDeleteCampaign,
  useUpdateCampaign,
} from '@kit/supabase/hooks/campaigns/use-campaign-mutations';
import { useCampaign } from '@kit/supabase/hooks/campaigns/use-campaigns';
import { useConversations } from '@kit/supabase/hooks/conversations/use-conversations';
import { useLeads } from '@kit/supabase/hooks/leads/use-leads';

import { useDemoMode } from '~/lib/demo-mode-context';

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
  const { isDemoMode, mockCampaigns, mockConversations, mockAgents } =
    useDemoMode();

  const queryClient = useQueryClient();

  // Fetch data
  const { data: realCampaign, isLoading: loadingCampaign } =
    useCampaign(campaignId);
  const { data: realLeads = [] } = useLeads();
  const { data: realConversations = [] } = useConversations();
  const { data: realAgents = [], isLoading: loadingAgents } = useAgents();

  // Use demo data if demo mode is active
  const campaign = isDemoMode
    ? ((mockCampaigns.find((c: any) => c.id === campaignId) ||
        mockCampaigns[0]) as Tables<'campaigns'>)
    : realCampaign;
  const leads = useMemo(
    () => (isDemoMode ? [] : realLeads),
    [isDemoMode, realLeads],
  ); // Demo leads can be empty for now
  const conversations = isDemoMode
    ? mockConversations
    : (realConversations ?? []);
  const agents = isDemoMode ? mockAgents : realAgents;

  // Loading state should be false in demo mode
  const isLoadingAgents = isDemoMode ? false : loadingAgents;

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

  // Derived - use the same normalization logic for comparison
  const normalizeTime = useCallback((value?: string | null): string => {
    if (!value) return '';
    if (/^\d{2}:\d{2}$/.test(value)) return value;
    if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value.slice(0, 5);
    // Handle PostgreSQL timetz format (HH:MM:SS+00 or HH:MM:SS-00)
    if (/^\d{2}:\d{2}:\d{2}[+-]\d{2}$/.test(value)) return value.slice(0, 5);
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format('HH:mm') : '';
  }, []);

  const hasCallWindowChanges = useMemo(() => {
    const originalStart = normalizeTime(campaign?.call_window_start) || '09:00';
    const originalEnd = normalizeTime(campaign?.call_window_end) || '17:00';

    return callWindowStart !== originalStart || callWindowEnd !== originalEnd;
  }, [
    callWindowStart,
    callWindowEnd,
    campaign?.call_window_start,
    campaign?.call_window_end,
    normalizeTime,
  ]);

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

    setCampaignName(campaign.name || '');
    setCampaignDescription(campaign.description || '');
    setCallWindowStart(normalizeTime(campaign.call_window_start) || '09:00');
    setCallWindowEnd(normalizeTime(campaign.call_window_end) || '17:00');
    setMaxAttempts(campaign.max_attempts?.toString() || '');
    setDailyCallCap(campaign.daily_call_cap?.toString() || '');
    setRetryLogicValue(campaign.retry_logic ?? '');
    setSelectedAgentId(campaign.agent_id ?? null);
    setGoalMetric(apiToUiGoal(campaign.goal_metric));
  }, [campaign, normalizeTime]);

  // Note: Leads no longer have a direct campaign_id field
  // This returns all leads - filtering by campaign would require a join through lead_lists
  const campaignLeads = useMemo(() => leads, [leads]);
  const campaignConversations = useMemo(
    () => conversations.filter((c) => c.campaign_id === campaignId),
    [conversations, campaignId],
  );
  const assignedAgent = useMemo(
    () => agents.find((a) => a.id === (selectedAgentId ?? campaign?.agent_id)),
    [agents, selectedAgentId, campaign?.agent_id],
  );

  const agentReadiness = useMemo(() => {
    const scriptTemplate = assignedAgent?.script_template ?? '';
    const faqs = assignedAgent?.faqs ?? '';
    const donorContext = assignedAgent?.donor_context ?? '';
    const startingMessage = assignedAgent?.starting_message ?? '';

    // Check if any script-related field has content
    const hasScript =
      String(scriptTemplate).trim().length > 0 ||
      String(faqs).trim().length > 0 ||
      String(donorContext).trim().length > 0;

    const hasDisclosure = String(startingMessage).trim().length > 0;
    // Caller ID is automatically assigned for new agents
    const hasCallerId = true;
    return { hasScript, hasDisclosure, hasCallerId } as const;
  }, [
    assignedAgent?.script_template,
    assignedAgent?.faqs,
    assignedAgent?.donor_context,
    assignedAgent?.starting_message,
  ]);

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

            // Cross-field validation: ensure start_date <= end_date
            if (fieldName === 'start_date') {
              const endDate = campaign?.end_date;
              if (endDate) {
                const startDateOnly = new Date(iso);
                const endDateOnly = new Date(endDate);
                startDateOnly.setHours(0, 0, 0, 0);
                endDateOnly.setHours(0, 0, 0, 0);
                if (startDateOnly > endDateOnly) {
                  isValid = false;
                  errorMessage =
                    'Start date must be before or equal to end date';
                }
              }
            } else if (fieldName === 'end_date') {
              const startDate = campaign?.start_date;
              if (startDate) {
                const startDateOnly = new Date(startDate);
                const endDateOnly = new Date(iso);
                startDateOnly.setHours(0, 0, 0, 0);
                endDateOnly.setHours(0, 0, 0, 0);
                if (startDateOnly > endDateOnly) {
                  isValid = false;
                  errorMessage =
                    'End date must be after or equal to start date';
                }
              }
            }
          } else {
            isValid = false;
            errorMessage = 'Invalid date format (YYYY-MM-DD)';
          }
        }

        if (!isValid) {
          toast.error(errorMessage);
          return;
        }

        const updateData: Partial<TablesUpdate<'campaigns'>> & {
          id: string;
        } = {
          id: campaignId,
          [fieldName]:
            validatedValue as TablesUpdate<'campaigns'>[keyof TablesUpdate<'campaigns'>],
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
    setSavingField('call_window');
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
    } finally {
      setSavingField(null);
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

      // Invalidate campaign query to refetch updated data
      await queryClient.invalidateQueries({
        queryKey: ['campaign', campaignId],
      });
      await queryClient.invalidateQueries({ queryKey: ['campaigns'] });

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
    queryClient,
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

      // Invalidate campaign query to refetch updated data
      await queryClient.invalidateQueries({
        queryKey: ['campaign', campaignId],
      });
      await queryClient.invalidateQueries({ queryKey: ['campaigns'] });

      toast.success('Campaign paused');
    } catch (error) {
      console.error('Failed to pause campaign:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to pause campaign',
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [campaign, campaignId, queryClient]);

  const handleSaveDates = useCallback(
    async (startDateValue: string, endDateValue: string) => {
      if (!campaign) return;
      try {
        // Validate both dates together before saving
        if (startDateValue && endDateValue) {
          const startDate = new Date(`${startDateValue}T00:00:00Z`);
          const endDate = new Date(`${endDateValue}T00:00:00Z`);

          if (startDate > endDate) {
            throw new Error('Start date must be before or equal to end date');
          }
        }

        // Save both dates in a single API call
        const updateData: Partial<TablesUpdate<'campaigns'>> & {
          id: string;
        } = {
          id: campaignId,
          start_date: startDateValue
            ? new Date(`${startDateValue}T00:00:00Z`).toISOString()
            : null,
          end_date: endDateValue
            ? new Date(`${endDateValue}T00:00:00Z`).toISOString()
            : null,
        };

        await updateCampaignMutation.mutateAsync(updateData);
        toast.success('Dates saved successfully!');
      } catch (error) {
        console.error('Failed to save dates:', error);
        toast.error(
          `Failed to save dates: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    },
    [campaign, campaignId, updateCampaignMutation],
  );

  return {
    // data
    campaign,
    loadingCampaign,
    loadingAgents: isLoadingAgents,
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
    handleSaveDates,
    handleDeleteCampaign,
    handleActivateCampaign,
    handlePauseCampaign,
  } as const;
}

export default useCampaignEditor;

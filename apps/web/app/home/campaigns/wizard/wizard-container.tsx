'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import Papa from 'papaparse';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { Tables } from '@kit/supabase/database';
import { useAgents } from '@kit/supabase/hooks/agents/use-agents';
import {
  useCreateCampaign,
  useUpdateCampaign,
} from '@kit/supabase/hooks/campaigns/use-campaign-mutations';
import { useCampaign } from '@kit/supabase/hooks/campaigns/use-campaigns';
import { useBulkCreateLeads } from '@kit/supabase/hooks/leads/use-lead-mutations';
import { useBusinessContext } from '@kit/supabase/hooks/use-business-context';
import { Spinner } from '@kit/ui/spinner';

import { TEST_PHONE_NUMBERS } from '~/lib/constants';

import type { AudienceFormValues } from './_components/audience-step';
import BasicsStep, { BasicsFormValues } from './_components/basics-step';
import CallingStep, { CallingFormValues } from './_components/calling-step';
import ReviewStep from './_components/review-step';
import WizardTopBar from './_components/top-bar';

type WizardCampaign = Tables<'campaigns'> & {
  goal_metric?: string | null;

  call_window_start?: string | null;
  call_window_end?: string | null;

  audience_list_id?: string | null;
  dedupe_by_phone?: boolean | null;
  exclude_dnc?: boolean | null;
  audience_contact_count?: number | null;
};

type Step = 1 | 2 | 3 | 4;

const basicsSchema = z
  .object({
    campaign_name: z.string().min(1, 'Campaign name is required'),
    fundraising_goal: z.coerce
      .number()
      .min(0, 'Goal must be positive')
      .optional(),
    start_date: z.date().optional(),
    end_date: z.date().optional(),
    agent_id: z.string().min(1, 'Select an agent'),
  })
  .superRefine((val, ctx) => {
    if (val.end_date && val.start_date && val.start_date > val.end_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be after start date',
        path: ['end_date'],
      });
    }
  });

const callingSchema = z.object({
  goal_metric: z.enum(['pledge_rate', 'average_gift', 'total_donations']),
  call_window_start: z.string().min(1),
  call_window_end: z.string().min(1),
});

const audienceSchema = z.object({
  audience_list_id: z.string().uuid().optional(),
  dedupe_by_phone: z.boolean(),
  exclude_dnc: z.boolean(),
  audience_contact_count: z.number().int().min(0),
});

export function WizardContainer({
  initialCampaignId,
  onLoadingChange,
}: {
  initialCampaignId?: string;
  onLoadingChange?: (isLoading: boolean) => void;
} = {}) {
  const initialStep = 1 as Step;
  const campaignId = initialCampaignId ?? null;

  const [step, setStep] = useState<Step>(initialStep);
  const [currentCampaignId, setCurrentCampaignId] = useState<string | null>(
    campaignId,
  );
  const router = useRouter();

  const { data: agents = [] } = useAgents();
  const { data: existingCampaign, isLoading: loadingCampaign } = useCampaign(
    currentCampaignId || '',
  );
  const { data: businessContext } = useBusinessContext();

  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const bulkCreateLeads = useBulkCreateLeads();

  const totalSteps = 3;

  // Forms per step
  const basicsForm = useForm<{
    campaign_name: string;
    fundraising_goal?: number;
    start_date?: Date;
    end_date?: Date;
    agent_id: string;
  }>({
    resolver: zodResolver(basicsSchema),
    defaultValues: {
      campaign_name: existingCampaign?.name ?? '',
      fundraising_goal:
        existingCampaign?.budget !== null &&
        existingCampaign?.budget !== undefined
          ? Number(existingCampaign?.budget)
          : undefined,
      start_date: existingCampaign?.start_date
        ? new Date(existingCampaign.start_date)
        : undefined,
      end_date: existingCampaign?.end_date
        ? new Date(existingCampaign.end_date)
        : undefined,
      agent_id: existingCampaign?.agent_id ?? '',
    },
  });

  const callingForm = useForm<z.infer<typeof callingSchema>>({
    resolver: zodResolver(callingSchema),
    defaultValues: {
      goal_metric:
        (existingCampaign?.goal_metric as
          | 'pledge_rate'
          | 'average_gift'
          | 'total_donations'
          | undefined) ?? 'pledge_rate',

      call_window_start: existingCampaign?.call_window_start
        ? dayjs(existingCampaign.call_window_start!).format('HH:mm')
        : '09:00',
      call_window_end: existingCampaign?.call_window_end
        ? dayjs(existingCampaign.call_window_end!).format('HH:mm')
        : '17:00',
    },
  });

  const audienceForm = useForm<z.infer<typeof audienceSchema>>({
    resolver: zodResolver(audienceSchema),
    defaultValues: {
      audience_list_id: undefined,
      dedupe_by_phone: true,
      exclude_dnc: true,
      audience_contact_count: 0,
    },
  });

  // CSV parsing state (Step 3)
  type CsvRow = Record<string, string>;
  // Audience import disabled for now
  const [_csvRows, _setCsvRows] = useState<CsvRow[]>([]);
  const [_csvErrors, _setCsvErrors] = useState<string[]>([]);
  const [_isUploading, _setIsUploading] = useState(false);
  const [_csvHeaders, _setCsvHeaders] = useState<string[]>([]);

  const validateE164 = (phone: string): boolean => {
    const cleaned = phone.trim();
    return /^\+?[1-9]\d{1,14}$/.test(cleaned);
  };

  const _handleCsvChange = (file: File | null) => {
    _setCsvErrors([]);
    _setCsvRows([]);
    if (!file) return;
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = (results.data as CsvRow[]).filter(Boolean);
        const errors: string[] = [];
        // Required headers
        const headers = results.meta.fields || [];
        _setCsvHeaders(headers);
        const required = ['first_name', 'phone'];
        for (const h of required) {
          if (!headers.includes(h))
            errors.push(`Missing required header: ${h}`);
        }
        const validRows: CsvRow[] = [];
        const dedupe = audienceForm.getValues().dedupe_by_phone;
        const seenPhones = new Set<string>();
        for (let i = 0; i < rows.length; i++) {
          const r = rows[i]!;
          const firstName = (r.first_name || '').trim();
          const lastName = (r.last_name || '').trim();
          const phone = (r.phone || '').replace(/[\s\-()]/g, '');
          if (!firstName) {
            errors.push(`Row ${i + 2}: first_name is required`);
            continue;
          }
          if (!validateE164(phone)) {
            errors.push(`Row ${i + 2}: phone must be E.164`);
            continue;
          }
          if (dedupe) {
            if (seenPhones.has(phone)) continue;
            seenPhones.add(phone);
          }
          validRows.push({
            first_name: firstName,
            last_name: lastName,
            phone,
            email: (r.email || '').trim(),
            timezone: (r.timezone || '').trim(),
            opt_in: (r.opt_in || '').trim(),
          });
        }
        _setCsvErrors(errors);
        _setCsvRows(validRows);
        audienceForm.setValue('audience_contact_count', validRows.length);
        onBlurAudience();
      },
    });
  };

  const _uploadCsv = async () => {
    if (!currentCampaignId) return;
    if (_csvErrors.length > 0) return;
    if (_csvRows.length === 0) return;
    if (!businessContext?.business_id) {
      console.error('Business context not loaded');
      return;
    }
    _setIsUploading(true);
    try {
      const leadsPayload = _csvRows.map((r) => ({
        business_id: businessContext.business_id,
        first_name: r.first_name,
        last_name: r.last_name || '',
        phone: r.phone as string,
        email: r.email || null,
        company: null,
        status: 'new' as const,
        attempts: 0,
      }));
      const created = await bulkCreateLeads.mutateAsync({
        business_id: businessContext.business_id,
        leads: leadsPayload,
      });
      const listId = crypto?.randomUUID?.() ?? undefined;
      audienceForm.setValue('audience_contact_count', created.length);
      audienceForm.setValue('audience_list_id', listId);
      await updateCampaign.mutateAsync({
        id: currentCampaignId,
        audience_contact_count: created.length,
        audience_list_id: listId ?? null,
      } as { id: string } & Partial<WizardCampaign>);
    } finally {
      _setIsUploading(false);
    }
  };

  // Helper to download CSV template
  const _downloadCsvTemplate = useCallback(() => {
    const csvContent =
      'first_name,last_name,phone,email,timezone,opt_in\nJane,Doe,+14155550142,jane@example.org,America/Los_Angeles,true';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audience_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // Autosave helpers
  const autosave = useRef<{ timer: ReturnType<typeof setTimeout> | null }>({
    timer: null,
  });
  const _triggerAutosave = useCallback((fn: () => Promise<unknown>) => {
    if (autosave.current.timer) clearTimeout(autosave.current.timer);
    autosave.current.timer = setTimeout(() => {
      void fn();
    }, 500);
  }, []);

  // Create or update Draft on Step 1 submit (with navigation)
  const saveBasics = useCallback(async (): Promise<boolean> => {
    const valid = await basicsForm.trigger();
    if (!valid) return false;
    // Defer persistence until final action to avoid duplicates
    setStep(2);
    return true;
  }, [basicsForm]);

  // Autosave basics (without navigation)
  const _saveBasicsAutosave = useCallback(async (): Promise<boolean> => {
    // Don't validate for autosave - just save what we have
    const values = basicsForm.getValues();

    // Only save if we have at least a campaign name
    if (!values.campaign_name?.trim()) return false;

    if (!currentCampaignId) {
      const created = await createCampaign.mutateAsync({
        name: values.campaign_name,
        budget:
          values.fundraising_goal === undefined
            ? null
            : values.fundraising_goal,
        agent_id: values.agent_id || null,
        start_date: values.start_date?.toISOString() ?? null,
        end_date: values.end_date?.toISOString() ?? null,
        description: '',
        status: 'draft',
        max_attempts: 3,
        daily_call_cap: 100,
        script: 'Default campaign script', // TODO: Get from agent or allow customization
        retry_logic: 'Wait 24 hours before retry',
      } as Parameters<typeof createCampaign.mutateAsync>[0]);
      setCurrentCampaignId(created.id);
      return true;
    } else {
      await updateCampaign.mutateAsync({
        id: currentCampaignId,
        name: values.campaign_name,
        budget:
          values.fundraising_goal === undefined
            ? null
            : values.fundraising_goal,
        agent_id: values.agent_id || null,
        start_date: values.start_date?.toISOString() ?? null,
        end_date: values.end_date?.toISOString() ?? null,
        status: 'draft',
      } as { id: string } & Partial<WizardCampaign>);
      return true;
    }
  }, [basicsForm, currentCampaignId, createCampaign, updateCampaign]);

  // Save Step 2
  const saveCalling = useCallback(async (): Promise<boolean> => {
    const valid = await callingForm.trigger();
    if (!valid) return false;
    // Persistence deferred until final action
    return true;
  }, [callingForm]);

  // Save Step 3 (only metadata; CSV upload handled below)
  const _saveAudience = useCallback(async (): Promise<boolean> => {
    const valid = await audienceForm.trigger();
    if (!valid) return false;
    // Persistence deferred until final action
    return true;
  }, [audienceForm]);

  // Draft saves (no blocking validation)
  const _saveBasicsDraft = useCallback(async (): Promise<boolean> => {
    const values = basicsForm.getValues();
    const name = (values.campaign_name || '').trim() || 'Untitled campaign';
    const budget =
      values.fundraising_goal === undefined || values.fundraising_goal === null
        ? null
        : Number(values.fundraising_goal);
    const agentId = values.agent_id ? values.agent_id : null;
    const startDate = values.start_date
      ? values.start_date.toISOString()
      : null;
    const endDate = values.end_date ? values.end_date.toISOString() : null;

    if (!currentCampaignId) {
      const created = await createCampaign.mutateAsync({
        name,
        budget,
        agent_id: agentId as string | null,
        start_date: startDate,
        end_date: endDate,
        description: '',
        status: 'draft',
        max_attempts: 3,
        daily_call_cap: 100,
        script: 'Default campaign script', // TODO: Get from agent or allow customization
        retry_logic: 'Wait 24 hours before retry',
      } as Parameters<typeof createCampaign.mutateAsync>[0]);
      setCurrentCampaignId(created.id);
      return true;
    } else {
      await updateCampaign.mutateAsync({
        id: currentCampaignId,
        name,
        budget,
        agent_id: agentId as string | null,
        start_date: startDate,
        end_date: endDate,
        status: 'draft',
      } as { id: string } & Partial<WizardCampaign>);
      return true;
    }
  }, [basicsForm, currentCampaignId, createCampaign, updateCampaign]);

  const _saveCallingDraft = useCallback(async (): Promise<boolean> => {
    if (!currentCampaignId) return false;
    const v = callingForm.getValues();
    await updateCampaign.mutateAsync({
      id: currentCampaignId,
      goal_metric: v.goal_metric,

      call_window_start: v.call_window_start
        ? `${v.call_window_start}:00`
        : null,
      call_window_end: v.call_window_end ? `${v.call_window_end}:00` : null,

      status: 'draft',
    } as { id: string } & Partial<WizardCampaign>);
    return true;
  }, [callingForm, currentCampaignId, updateCampaign]);

  const _saveAudienceDraft = useCallback(async (): Promise<boolean> => {
    if (!currentCampaignId) return false;
    const v = audienceForm.getValues();
    await updateCampaign.mutateAsync({
      id: currentCampaignId,
      audience_list_id: v.audience_list_id ?? null,
      dedupe_by_phone: v.dedupe_by_phone,
      exclude_dnc: v.exclude_dnc,
      audience_contact_count: v.audience_contact_count,
      status: 'draft',
    } as { id: string } & Partial<WizardCampaign>);
    return true;
  }, [audienceForm, currentCampaignId, updateCampaign]);

  // Navigation
  const goNext = async () => {
    if (step === (1 as Step)) {
      const ok = await saveBasics();
      if (!ok) return; // do not advance
      setStep(2);
      return;
    }
    if (step === 2) {
      const ok = await saveCalling();
      if (!ok) return;
    }
    let nextStep: Step;
    if (step === 1) {
      nextStep = 2;
    } else {
      nextStep = 3;
    }
    setStep(nextStep);
  };

  const goToStep = (target: Step) => {
    setStep(target);
  };

  const goBack = () => {
    let prevStep: Step;
    if (step === (3 as Step)) {
      prevStep = 2;
    } else {
      prevStep = 1;
    }
    setStep(prevStep);
  };

  // Disable autosave; avoid creating or updating drafts during the flow
  const onBlurBasics = () => void 0;
  const onBlurCalling = () => void 0;
  const onBlurAudience = () => void 0;

  // Activate / Pause from Step 4
  const campaignName = basicsForm.watch('campaign_name');
  const agentId = basicsForm.watch('agent_id');
  const audienceContactCount = 1; // Audience step removed; don't block creation

  const canActivate = useMemo(() => {
    const hasBasics = Boolean(campaignName?.trim() && agentId?.trim());
    const hasAudience = (audienceContactCount || 0) >= 1;

    return hasBasics && hasAudience;
  }, [campaignName, agentId, audienceContactCount]);

  const [isActing, setIsActing] = useState(false);

  // Notify parent of loading state changes
  useEffect(() => {
    onLoadingChange?.(isActing);
  }, [isActing, onLoadingChange]);
  const setStatus = async (
    status: 'active' | 'draft' | 'paused',
  ): Promise<string | null> => {
    try {
      setIsActing(true);
      // Ensure campaign is created and fully persisted before status change
      const basics = basicsForm.getValues();
      const calling = callingForm.getValues();

      let id = currentCampaignId;
      if (!id) {
        const created = await createCampaign.mutateAsync({
          name: basics.campaign_name,
          budget:
            basics.fundraising_goal === undefined
              ? null
              : basics.fundraising_goal,
          agent_id: basics.agent_id || null,
          start_date: basics.start_date?.toISOString() ?? null,
          end_date: basics.end_date?.toISOString() ?? null,
          description: '',
          status: 'draft',
          max_attempts: 3,
          daily_call_cap: 100,
          script: 'Default campaign script',
          retry_logic: 'Wait 24 hours before retry',
        } as Parameters<typeof createCampaign.mutateAsync>[0]);
        id = created.id;
        setCurrentCampaignId(id);
      }

      // Persist all form data
      await updateCampaign.mutateAsync({
        id: id!,
        name: basics.campaign_name,
        budget:
          basics.fundraising_goal === undefined
            ? null
            : basics.fundraising_goal,
        agent_id: basics.agent_id || null,
        start_date: basics.start_date?.toISOString() ?? null,
        end_date: basics.end_date?.toISOString() ?? null,
        goal_metric: calling.goal_metric as
          | 'pledge_rate'
          | 'average_gift'
          | 'total_donations',
        call_window_start: calling.call_window_start
          ? `${calling.call_window_start}:00`
          : null,
        call_window_end: calling.call_window_end
          ? `${calling.call_window_end}:00`
          : null,
        // Audience fields intentionally skipped for now
        status,
      } as { id: string } & Partial<WizardCampaign>);

      if (status === 'active') {
        const resp = await fetch(`/api/campaigns/${id}/start`, {
          method: 'POST',
        });
        if (!resp.ok) {
          const j = await resp.json().catch(() => ({}));
          const errorMessage =
            j?.error || `Failed to start campaign (${resp.status})`;
          throw new Error(errorMessage);
        }
        // Don't close modal - let navigation handle the transition
        return id;
      }

      if (status === 'paused') {
        const resp = await fetch(`/api/campaigns/${id}/stop`, {
          method: 'POST',
        });
        if (!resp.ok) {
          const j = await resp.json().catch(() => ({}));
          throw new Error(j?.error || 'Failed to pause campaign');
        }
      }
      return id;
    } catch (e) {
      console.error('Set status error:', e);
      // Only stop loading on error
      setIsActing(false);
      return null;
    }
    // Don't stop loading on success - let the navigation handle the transition
  };

  // TODO: Re-enable when multiple Twilio numbers are available
  const _twilioNumbers = TEST_PHONE_NUMBERS;

  if (loadingCampaign && currentCampaignId) {
    return (
      <div className="flex h-72 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="relative max-w-2xl">
      <WizardTopBar step={step} totalSteps={totalSteps} />

      {/* Step content */}
      <div key={step} className="animate-in fade-in duration-300">
        {step === 1 && (
          <div className="px-6 py-6">
            <BasicsStep
              form={basicsForm as unknown as UseFormReturn<BasicsFormValues>}
              agents={agents}
              onBlurBasics={onBlurBasics}
              onNext={() => void goNext()}
            />
          </div>
        )}

        {step === 2 && (
          <div className="px-6 py-6">
            <CallingStep
              form={callingForm as unknown as UseFormReturn<CallingFormValues>}
              _twilioNumbers={_twilioNumbers}
              onBlurCalling={onBlurCalling}
              onNext={() => void goNext()}
              onBack={goBack}
            />
          </div>
        )}

        {step === 3 && (
          <div className="px-6 py-6">
            <ReviewStep
              basics={basicsForm.getValues() as BasicsFormValues}
              calling={callingForm.getValues() as CallingFormValues}
              audience={
                {
                  audience_contact_count: 0,
                  dedupe_by_phone: true,
                  exclude_dnc: true,
                } as AudienceFormValues
              }
              agents={agents}
              canActivate={canActivate}
              isActing={isActing}
              onBack={goBack}
              onEditStep={(s: 1 | 2 | 3) => goToStep(s)}
              onCreate={async () => {
                const id = await setStatus('draft');
                const campaignIdToOpen = id || currentCampaignId;
                if (campaignIdToOpen) {
                  // Navigate to details page - modal stays open with loading state until page loads
                  router.push(`/home/campaigns/${campaignIdToOpen}`);
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

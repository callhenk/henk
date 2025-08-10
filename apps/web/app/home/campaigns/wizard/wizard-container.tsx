'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

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
import { Spinner } from '@kit/ui/spinner';

import AudienceStep, { AudienceFormValues } from './_components/audience-step';
import BasicsStep, { BasicsFormValues } from './_components/basics-step';
import CallingStep, { CallingFormValues } from './_components/calling-step';
import ReviewStep from './_components/review-step';
import WizardTopBar from './_components/top-bar';

type WizardCampaign = Tables<'campaigns'>['Row'] & {
  goal_metric?: string | null;
  disclosure_line?: string | null;
  call_window_start?: string | null;
  call_window_end?: string | null;
  caller_id?: string | null;
  audience_list_id?: string | null;
  dedupe_by_phone?: boolean | null;
  exclude_dnc?: boolean | null;
  audience_contact_count?: number | null;
};

type Step = 1 | 2 | 3 | 4;

const basicsSchema = z
  .object({
    campaign_name: z.string().min(1, 'Campaign name is required'),
    fundraising_goal: z.coerce.number().min(0, 'Goal must be ≥ 0'),
    start_date: z.date({ required_error: 'Start date is required' }),
    end_date: z.date().optional(),
    agent_id: z.string().min(1, 'Select an agent'),
  })
  .superRefine((val, ctx) => {
    if (val.end_date && val.start_date && val.end_date < val.start_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be after start date',
        path: ['end_date'],
      });
    }
  });

const callingSchema = z.object({
  goal_metric: z.enum(['pledge_rate', 'average_gift', 'total_donations']),
  disclosure_line: z.string().min(1, 'Disclosure is required'),
  call_window_start: z.string().min(1),
  call_window_end: z.string().min(1),
  caller_id: z.string().min(1, 'Choose a caller ID'),
});

const audienceSchema = z.object({
  audience_list_id: z.string().uuid().optional(),
  dedupe_by_phone: z.boolean(),
  exclude_dnc: z.boolean(),
  audience_contact_count: z.number().int().min(0),
});

export function WizardContainer({
  initialCampaignId,
  onClose,
}: {
  initialCampaignId?: string;
  onClose?: () => void;
} = {}) {
  const initialStep = 1 as Step;
  const campaignId = initialCampaignId ?? null;

  const [step, setStep] = useState<Step>(initialStep);
  const [currentCampaignId, setCurrentCampaignId] = useState<string | null>(
    campaignId,
  );

  const { data: agents = [] } = useAgents();
  const { data: existingCampaign, isLoading: loadingCampaign } = useCampaign(
    currentCampaignId || '',
  );

  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const bulkCreateLeads = useBulkCreateLeads();

  const totalSteps = 4;

  // Forms per step
  const basicsForm = useForm<z.infer<typeof basicsSchema>>({
    resolver: zodResolver(basicsSchema),
    defaultValues: {
      campaign_name: existingCampaign?.name ?? '',
      fundraising_goal: Number(existingCampaign?.budget ?? 0) || 0,
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
      disclosure_line:
        existingCampaign?.disclosure_line ??
        'Hi {{first_name}}, this is {{agent_name}} with {{org_name}}.',
      call_window_start: existingCampaign?.call_window_start
        ? dayjs(existingCampaign.call_window_start!).format('HH:mm')
        : '09:00',
      call_window_end: existingCampaign?.call_window_end
        ? dayjs(existingCampaign.call_window_end!).format('HH:mm')
        : '17:00',
      caller_id: existingCampaign?.caller_id ?? '',
    },
  });

  const audienceForm = useForm<z.infer<typeof audienceSchema>>({
    resolver: zodResolver(audienceSchema),
    defaultValues: {
      audience_list_id: existingCampaign?.audience_list_id ?? undefined,
      dedupe_by_phone: existingCampaign?.dedupe_by_phone ?? true,
      exclude_dnc: existingCampaign?.exclude_dnc ?? true,
      audience_contact_count: existingCampaign?.audience_contact_count ?? 0,
    },
  });

  // CSV parsing state (Step 3)
  type CsvRow = Record<string, string>;
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);

  const validateE164 = (phone: string): boolean => {
    const cleaned = phone.trim();
    return /^\+?[1-9]\d{1,14}$/.test(cleaned);
  };

  const handleCsvChange = (file: File | null) => {
    setCsvErrors([]);
    setCsvRows([]);
    if (!file) return;
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = (results.data as CsvRow[]).filter(Boolean);
        const errors: string[] = [];
        // Required headers
        const headers = results.meta.fields || [];
        setCsvHeaders(headers);
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
        setCsvErrors(errors);
        setCsvRows(validRows);
        audienceForm.setValue('audience_contact_count', validRows.length);
        onBlurAudience();
      },
    });
  };

  const uploadCsv = async () => {
    if (!currentCampaignId) return;
    if (csvErrors.length > 0) return;
    if (csvRows.length === 0) return;
    setIsUploading(true);
    try {
      const leadsPayload = csvRows.map((r) => ({
        name: `${r.first_name}${r.last_name ? ' ' + r.last_name : ''}`.trim(),
        phone: r.phone as string,
        email: r.email || null,
        company: null,
        status: 'new' as const,
        attempts: 0,
      }));
      const created = await bulkCreateLeads.mutateAsync({
        campaign_id: currentCampaignId,
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
      setIsUploading(false);
    }
  };

  // Helper to download CSV template
  const downloadCsvTemplate = useCallback(() => {
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
  const triggerAutosave = useCallback((fn: () => Promise<unknown>) => {
    if (autosave.current.timer) clearTimeout(autosave.current.timer);
    autosave.current.timer = setTimeout(() => {
      void fn();
    }, 500);
  }, []);

  // Create or update Draft on Step 1 submit and on blur
  const saveBasics = useCallback(async (): Promise<boolean> => {
    const valid = await basicsForm.trigger();
    if (!valid) return false;

    const values = basicsForm.getValues();

    if (!currentCampaignId) {
      const created = await createCampaign.mutateAsync({
        name: values.campaign_name,
        budget: values.fundraising_goal,
        agent_id: values.agent_id,
        start_date: values.start_date?.toISOString() ?? null,
        end_date: values.end_date?.toISOString() ?? null,
        description: '',
        status: 'draft',
        max_attempts: 3,
        daily_call_cap: 100,
        script: '',
        retry_logic: 'Wait 24 hours before retry',
      } as Parameters<typeof createCampaign.mutateAsync>[0]);
      setCurrentCampaignId(created.id);
      setStep(2);
      return true;
    } else {
      await updateCampaign.mutateAsync({
        id: currentCampaignId,
        name: values.campaign_name,
        budget: values.fundraising_goal,
        agent_id: values.agent_id,
        start_date: values.start_date?.toISOString() ?? null,
        end_date: values.end_date?.toISOString() ?? null,
        status: 'draft',
      } as { id: string } & Partial<WizardCampaign>);
      return true;
    }
  }, [basicsForm, currentCampaignId, createCampaign, updateCampaign]);

  // Save Step 2
  const saveCalling = useCallback(async (): Promise<boolean> => {
    if (!currentCampaignId) return false;
    const valid = await callingForm.trigger();
    if (!valid) return false;
    const v = callingForm.getValues();
    await updateCampaign.mutateAsync({
      id: currentCampaignId,
      goal_metric: v.goal_metric,
      disclosure_line: v.disclosure_line,
      call_window_start: `${v.call_window_start}:00`,
      call_window_end: `${v.call_window_end}:00`,
      caller_id: v.caller_id,
      status: 'draft',
    } as { id: string } & Partial<WizardCampaign>);
    return true;
  }, [callingForm, currentCampaignId, updateCampaign]);

  // Save Step 3 (only metadata; CSV upload handled below)
  const saveAudience = useCallback(async (): Promise<boolean> => {
    if (!currentCampaignId) return false;
    const valid = await audienceForm.trigger();
    if (!valid) return false;
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

  // Draft saves (no blocking validation)
  const saveBasicsDraft = useCallback(async (): Promise<boolean> => {
    const values = basicsForm.getValues();
    const name = (values.campaign_name || '').trim() || 'Untitled campaign';
    const budget = Number.isFinite(values.fundraising_goal)
      ? Number(values.fundraising_goal)
      : 0;
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
        script: '',
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

  const saveCallingDraft = useCallback(async (): Promise<boolean> => {
    if (!currentCampaignId) return false;
    const v = callingForm.getValues();
    await updateCampaign.mutateAsync({
      id: currentCampaignId,
      goal_metric: v.goal_metric,
      disclosure_line: v.disclosure_line,
      call_window_start: v.call_window_start
        ? `${v.call_window_start}:00`
        : null,
      call_window_end: v.call_window_end ? `${v.call_window_end}:00` : null,
      caller_id: v.caller_id || null,
      status: 'draft',
    } as { id: string } & Partial<WizardCampaign>);
    return true;
  }, [callingForm, currentCampaignId, updateCampaign]);

  const saveAudienceDraft = useCallback(async (): Promise<boolean> => {
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
    if (step === 3) {
      const ok = await saveAudience();
      if (!ok) return;
    }
    let nextStep: Step;
    if (step === 1) {
      nextStep = 2;
    } else if (step === 2) {
      nextStep = 3;
    } else {
      nextStep = 4;
    }
    setStep(nextStep);
  };

  const goToStep = (target: Step) => {
    setStep(target);
  };

  const goBack = () => {
    let prevStep: Step;
    if (step === (4 as Step)) {
      prevStep = 3;
    } else if (step === (3 as Step)) {
      prevStep = 2;
    } else {
      prevStep = 1;
    }
    setStep(prevStep);
  };

  // Autosave on blur
  const onBlurBasics = () => triggerAutosave(saveBasics);
  const onBlurCalling = () => triggerAutosave(saveCalling);
  const onBlurAudience = () => triggerAutosave(saveAudience);

  // Activate / Pause from Step 4
  const canActivate = useMemo(() => {
    const hasBasics = Boolean(
      basicsForm.getValues().campaign_name && basicsForm.getValues().agent_id,
    );
    const hasCaller = !!callingForm.getValues().caller_id;
    const audienceCount = audienceForm.getValues().audience_contact_count || 0;
    return hasBasics && hasCaller && audienceCount >= 1;
  }, [audienceForm, basicsForm, callingForm]);

  const [isActing, setIsActing] = useState(false);
  const setStatus = async (status: 'active' | 'draft' | 'paused') => {
    if (!currentCampaignId) return;
    try {
      setIsActing(true);
      if (status === 'active') {
        const resp = await fetch(`/api/campaigns/${currentCampaignId}/start`, {
          method: 'POST',
        });
        if (!resp.ok) {
          const j = await resp.json().catch(() => ({}));
          throw new Error(j?.error || 'Failed to start campaign');
        }
        onClose?.();
        return;
      }

      if (status === 'paused') {
        const resp = await fetch(`/api/campaigns/${currentCampaignId}/stop`, {
          method: 'POST',
        });
        if (!resp.ok) {
          const j = await resp.json().catch(() => ({}));
          throw new Error(j?.error || 'Failed to pause campaign');
        }
        return;
      }

      await updateCampaign.mutateAsync({ id: currentCampaignId, status } as {
        id: string;
        status: 'active' | 'draft' | 'paused';
      });
    } catch (e) {
      console.error('Set status error:', e);
    } finally {
      setIsActing(false);
    }
  };

  // Dummy caller id list (placeholder; integration to Twilio numbers to be added)
  const twilioNumbers = ['+12025550125', '+14155550142'];

  if (loadingCampaign && currentCampaignId) {
    return (
      <div className="flex h-72 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-5">
      <WizardTopBar
        step={step}
        totalSteps={totalSteps}
        status={existingCampaign?.status}
        onClose={onClose}
      />

      {/* Step content */}
      {step === 1 && (
        <BasicsStep
          form={basicsForm as unknown as UseFormReturn<BasicsFormValues>}
          agents={agents}
          onBlurBasics={onBlurBasics}
          onSaveDraft={() => void saveBasicsDraft()}
          onNext={() => void goNext()}
        />
      )}

      {step === 2 && (
        <CallingStep
          form={callingForm as unknown as UseFormReturn<CallingFormValues>}
          twilioNumbers={twilioNumbers}
          onBlurCalling={onBlurCalling}
          onSaveDraft={() => void saveCallingDraft()}
          onNext={() => void goNext()}
          onBack={goBack}
        />
      )}

      {step === 3 && (
        <AudienceStep
          csvHeaders={csvHeaders}
          csvErrors={csvErrors}
          csvRows={csvRows}
          isUploading={isUploading}
          hasCampaignId={Boolean(currentCampaignId)}
          onTemplateDownload={downloadCsvTemplate}
          onConnectCrm={() =>
            window.open('/home/integrations', '_blank', 'noopener,noreferrer')
          }
          onDropCsv={(file) => handleCsvChange(file)}
          onUploadCsv={() => void uploadCsv()}
          form={audienceForm as unknown as UseFormReturn<AudienceFormValues>}
          onBlurAudience={onBlurAudience}
          onBack={goBack}
          onSaveDraft={() => void saveAudienceDraft()}
          onNext={() => void goNext()}
        />
      )}

      {step === 4 && (
        <ReviewStep
          basics={basicsForm.getValues() as BasicsFormValues}
          calling={callingForm.getValues() as CallingFormValues}
          audience={audienceForm.getValues() as AudienceFormValues}
          agents={agents}
          canActivate={canActivate}
          isActing={isActing}
          onBack={goBack}
          onEditStep={(s: 1 | 2 | 3) => goToStep(s)}
          onSetStatus={(s: 'active' | 'draft' | 'paused') => void setStatus(s)}
        />
      )}
    </div>
  );
}

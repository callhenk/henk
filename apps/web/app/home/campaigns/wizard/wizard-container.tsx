'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import Link from 'next/link';

// import { useRouter, useSearchParams } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import {
  AlertCircle,
  CheckCircle,
  ExternalLink,
  FileDown,
  FileSpreadsheet,
  Pause,
  Play,
  Save,
} from 'lucide-react';
import Papa from 'papaparse';
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
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Progress } from '@kit/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Separator } from '@kit/ui/separator';
import { Spinner } from '@kit/ui/spinner';
import { Switch } from '@kit/ui/switch';

import { DatePicker, TimePicker } from '~/components/shared';

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
  const progress = useMemo(() => (step / totalSteps) * 100, [step]);

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

  const setStatus = async (status: 'active' | 'draft' | 'paused') => {
    if (!currentCampaignId) return;
    await updateCampaign.mutateAsync({ id: currentCampaignId, status } as {
      id: string;
      status: 'active' | 'draft' | 'paused';
    });
    if (status === 'active') {
      onClose?.();
    }
  };

  // Dummy caller id list (placeholder; integration to Twilio numbers to be added)
  const twilioNumbers = ['+12025550125', '+14155550142'];

  const topBar = (
    <div className="mb-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <span className="text-sm">Step {step} of 4</span>
          <span className="bg-muted rounded-full px-2 py-0.5 text-xs">
            {existingCampaign?.status ?? 'Draft'}
          </span>
        </div>
      </div>
      <Progress value={progress} className="h-1.5" />
    </div>
  );

  if (loadingCampaign && currentCampaignId) {
    return (
      <div className="flex h-72 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-5">
      {topBar}

      {/* Step content */}
      {step === 1 && (
        <Card className="border-none bg-transparent shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-base">Basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 rounded-xl bg-white/40 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur supports-[backdrop-filter]:bg-white/30 dark:bg-zinc-900/40 dark:ring-white/10">
            <Form {...basicsForm}>
              <form className="space-y-4">
                <FormField
                  control={basicsForm.control}
                  name="campaign_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onBlur={onBlurBasics}
                          placeholder="e.g., Spring Appeal"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={basicsForm.control}
                  name="fundraising_goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fundraising goal</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          {...field}
                          onBlur={onBlurBasics}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={basicsForm.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start date</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onValueChange={(d?: Date) => {
                              field.onChange(d);
                              onBlurBasics();
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={basicsForm.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End date (optional)</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onValueChange={(d?: Date) => {
                              field.onChange(d);
                              onBlurBasics();
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={basicsForm.control}
                  name="agent_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agent</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(v) => {
                            field.onChange(v);
                            onBlurBasics();
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select agent" />
                          </SelectTrigger>
                          <SelectContent>
                            {agents.map((a) => (
                              <SelectItem key={a.id} value={a.id}>
                                {a.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Agent determines voice & script. You can adjust from the
                        Agent page.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
            <Separator />
            <div className="mt-4 flex justify-between">
              <Button variant="ghost" asChild>
                <Link href="/home/campaigns">Cancel</Link>
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={saveBasics}>
                  <Save className="mr-2 h-4 w-4" /> Save as draft
                </Button>
                <Button onClick={goNext} className="min-w-36">
                  Save & continue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-none bg-transparent shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-base">Calling & Voice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 rounded-xl bg-white/40 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur supports-[backdrop-filter]:bg-white/30 dark:bg-zinc-900/40 dark:ring-white/10">
            <Form {...callingForm}>
              <form className="space-y-4">
                <FormField
                  control={callingForm.control}
                  name="goal_metric"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal metric</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(v) => {
                            field.onChange(v);
                            onBlurCalling();
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select KPI" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pledge_rate">
                              Pledge rate
                            </SelectItem>
                            <SelectItem value="average_gift">
                              Average gift
                            </SelectItem>
                            <SelectItem value="total_donations">
                              Total donations
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <p className="text-muted-foreground mt-1 text-xs">
                        We optimize summaries for this KPI.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={callingForm.control}
                  name="disclosure_line"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disclosure line</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onBlur={onBlurCalling}
                          placeholder="Hi {{first_name}}, this is {{agent_name}} with {{org_name}}."
                        />
                      </FormControl>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Auto‑inserted at the start of calls. Supports tokens{' '}
                        {'{{first_name}}'} {'{{agent_name}}'} {'{{org_name}}'}.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={callingForm.control}
                    name="call_window_start"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Call window start</FormLabel>
                        <FormControl>
                          <TimePicker
                            value={field.value}
                            onValueChange={(v) => {
                              field.onChange(v);
                              onBlurCalling();
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={callingForm.control}
                    name="call_window_end"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Call window end</FormLabel>
                        <FormControl>
                          <TimePicker
                            value={field.value}
                            onValueChange={(v) => {
                              field.onChange(v);
                              onBlurCalling();
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={callingForm.control}
                  name="caller_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Caller ID</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(v) => {
                            field.onChange(v);
                            onBlurCalling();
                          }}
                        >
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>

            <Separator />
            <div className="bg-muted rounded-md px-3 py-3 text-sm">
              <div className="mb-2 font-medium">Voice & Script</div>
              <p className="text-muted-foreground">
                This campaign uses the assigned agent’s current voice & script.
              </p>
              <div className="mt-2 flex gap-2">
                {basicsForm.getValues().agent_id ? (
                  <>
                    <Button variant="outline" asChild>
                      <Link
                        href={`/home/agents/${basicsForm.getValues().agent_id}`}
                        target="_blank"
                      >
                        Go to agent voice & script{' '}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild>
                      <Link
                        href={`/home/agents/${basicsForm.getValues().agent_id}`}
                        target="_blank"
                      >
                        Open agent
                      </Link>
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    Select an agent in Basics to manage voice & script.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 flex justify-between">
              <Button variant="ghost" onClick={goBack}>
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={saveCalling}>
                  <Save className="mr-2 h-4 w-4" /> Save as draft
                </Button>
                <Button onClick={goNext} className="min-w-36">
                  Save & continue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="border-none bg-transparent shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-base">Audience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 rounded-xl bg-white/40 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur supports-[backdrop-filter]:bg-white/30 dark:bg-zinc-900/40 dark:ring-white/10">
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
                      const csvContent =
                        'first_name,last_name,phone,email,timezone,opt_in\nJane,Doe,+14155550142,jane@example.org,America/Los_Angeles,true';
                      const blob = new Blob([csvContent], {
                        type: 'text/csv;charset=utf-8;',
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'audience_template.csv';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <FileDown className="mr-2 h-4 w-4" /> Template
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href="/home/integrations"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Connect CRM
                    </a>
                  </Button>
                </div>
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                Required headers: first_name, phone. Optional: last_name, email,
                timezone, opt_in.
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <label className="text-muted-foreground col-span-2 flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-black/10 bg-white/50 p-6 text-sm hover:bg-white/70 dark:border-white/10 dark:bg-zinc-900/50">
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(e) =>
                      handleCsvChange(e.target.files?.[0] ?? null)
                    }
                    disabled={!currentCampaignId}
                    className="hidden"
                  />
                  Drop CSV here or click to choose
                </label>
                <div className="rounded-lg bg-white/50 p-3 text-xs ring-1 ring-black/5 dark:bg-zinc-900/50 dark:ring-white/10">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium">Headers detected</span>
                    <AlertCircle className="h-3.5 w-3.5 opacity-60" />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(() => {
                      const hs = csvHeaders || [];
                      return [
                        'first_name',
                        'last_name',
                        'phone',
                        'email',
                        'timezone',
                        'opt_in',
                      ].map((h) => (
                        <Badge
                          key={h}
                          variant={hs.includes(h) ? 'default' : 'outline'}
                          className="gap-1"
                        >
                          {hs.includes(h) ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          {h}
                        </Badge>
                      ));
                    })()}
                  </div>
                </div>
              </div>
              {csvErrors.length > 0 && (
                <div className="mt-2 text-xs text-red-600">
                  {csvErrors.slice(0, 5).map((er, i) => (
                    <div key={i}>{er}</div>
                  ))}
                  {csvErrors.length > 5 && (
                    <div>+{csvErrors.length - 5} more…</div>
                  )}
                </div>
              )}
              {csvRows.length > 0 && (
                <div className="text-muted-foreground mt-2 text-xs">
                  {csvRows.length} rows parsed
                </div>
              )}
              <div className="mt-3">
                <Button
                  onClick={uploadCsv}
                  disabled={
                    !currentCampaignId ||
                    csvRows.length === 0 ||
                    csvErrors.length > 0 ||
                    isUploading
                  }
                >
                  {isUploading ? 'Uploading…' : 'Upload contacts'}
                </Button>
              </div>
              <div className="mt-3 flex items-center gap-4">
                <div className="text-sm">
                  {audienceForm.watch('audience_contact_count')} contacts ready
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={audienceForm.watch('dedupe_by_phone')}
                    onCheckedChange={(v) => {
                      audienceForm.setValue('dedupe_by_phone', v);
                      onBlurAudience();
                    }}
                  />
                  <span className="text-sm">Dedupe by phone</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={audienceForm.watch('exclude_dnc')}
                    onCheckedChange={(v) => {
                      audienceForm.setValue('exclude_dnc', v);
                      onBlurAudience();
                    }}
                  />
                  <span className="text-sm">Exclude DNC list</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              <Button variant="ghost" onClick={goBack}>
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={saveAudience}>
                  <Save className="mr-2 h-4 w-4" /> Save as draft
                </Button>
                <Button onClick={goNext} className="min-w-36">
                  Save & continue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card className="border-none bg-transparent shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-base">Review & Launch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 rounded-xl bg-white/40 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur supports-[backdrop-filter]:bg-white/30 dark:bg-zinc-900/40 dark:ring-white/10">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-md p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="font-medium">Basics</div>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => goToStep(1)}
                    className="px-0 text-sm"
                  >
                    Edit
                  </Button>
                </div>
                <div className="text-sm">
                  Name: {basicsForm.getValues().campaign_name || '-'}
                </div>
                <div className="text-sm">
                  Dates:{' '}
                  {basicsForm.getValues().start_date?.toLocaleDateString() ||
                    '-'}{' '}
                  →{' '}
                  {basicsForm.getValues().end_date?.toLocaleDateString() || '—'}
                </div>
                <div className="text-sm">
                  Goal: {basicsForm.getValues().fundraising_goal}
                </div>
                <div className="text-sm">
                  Agent:{' '}
                  {agents.find((a) => a.id === basicsForm.getValues().agent_id)
                    ?.name || '-'}
                </div>
              </div>
              <div className="rounded-md p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="font-medium">Calling & Voice</div>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => goToStep(2)}
                    className="px-0 text-sm"
                  >
                    Edit
                  </Button>
                </div>
                <div className="text-sm">
                  Goal metric: {callingForm.getValues().goal_metric}
                </div>
                <div className="text-sm">
                  Disclosure: {callingForm.getValues().disclosure_line}
                </div>
                <div className="text-sm">
                  Call window: {callingForm.getValues().call_window_start} –{' '}
                  {callingForm.getValues().call_window_end}
                </div>
                <div className="text-sm">
                  Caller ID: {callingForm.getValues().caller_id || '-'}
                </div>
                {basicsForm.getValues().agent_id && (
                  <div className="text-sm">
                    Agent page:{' '}
                    <Link
                      className="underline"
                      target="_blank"
                      href={`/home/agents/${basicsForm.getValues().agent_id}`}
                    >
                      Open
                    </Link>
                  </div>
                )}
              </div>
              <div className="rounded-md p-4 md:col-span-2">
                <div className="mb-2 flex items-center justify-between">
                  <div className="font-medium">Audience</div>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => goToStep(3)}
                    className="px-0 text-sm"
                  >
                    Edit
                  </Button>
                </div>
                <div className="text-sm">
                  Contacts: {audienceForm.getValues().audience_contact_count}
                </div>
                <div className="text-sm">
                  Dedupe:{' '}
                  {audienceForm.getValues().dedupe_by_phone ? 'On' : 'Off'}
                </div>
                <div className="text-sm">
                  Exclude DNC:{' '}
                  {audienceForm.getValues().exclude_dnc ? 'On' : 'Off'}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Button variant="ghost" onClick={goBack}>
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStatus('draft')}>
                  <Save className="mr-2 h-4 w-4" /> Save as draft
                </Button>
                <Button
                  disabled={!canActivate}
                  onClick={() => setStatus('active')}
                  className="min-w-36"
                >
                  <Play className="mr-2 h-4 w-4" /> Activate campaign
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStatus('paused')}
                  disabled={existingCampaign?.status !== 'active'}
                >
                  <Pause className="mr-2 h-4 w-4" /> Pause
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

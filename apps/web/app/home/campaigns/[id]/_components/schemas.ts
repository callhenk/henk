import { z } from 'zod';

// Helpers
export const iso = z.string().datetime().optional().nullable();
export const money = z.coerce.number().min(0).finite();
export const toNull = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? null : v;

/** Time HH:mm[:ss] or with AM/PM → normalized "HH:mm:ss" */
export function normalizeTime(input: string): string | null {
  const s = input.trim().toUpperCase();
  const m12 = /^(\d{1,2}):([0-5]\d)\s*(AM|PM)$/.exec(s);
  if (m12) {
    let h = parseInt(m12[1]!, 10);
    const mm = m12[2]!;
    const ap = m12[3]!;
    if (h === 12) h = 0;
    if (ap === 'PM') h += 12;
    return `${String(h).padStart(2, '0')}:${mm}:00`;
  }
  const m24 = /^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(s);
  if (m24) return `${m24[1]!.padStart(2, '0')}:${m24[2]}:${m24[3] ?? '00'}`;
  return null;
}

export const TimeHHmmss = z.preprocess(
  (v) => {
    if (v == null) return null;
    if (typeof v !== 'string') return v;
    const t = normalizeTime(v);
    return t ?? v;
  },
  z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, 'Use a valid time'),
);

export const E164 = z
  .string()
  .regex(/^\+[1-9]\d{6,14}$/, 'Use E.164 format, e.g. +15551234567');

export const CampaignBasicsSchema = z
  .object({
    name: z.string().trim().min(1, 'Required').max(120),
    description: z.preprocess(toNull, z.string().trim().max(500).nullable()),
    status: z.enum(['draft', 'active', 'paused', 'completed']),
    goal_metric: z
      .enum(['pledge_rate', 'average_gift', 'total_donations'])
      .nullable()
      .optional(),
    call_window_start: TimeHHmmss.nullable().optional(),
    call_window_end: TimeHHmmss.nullable().optional(),
    max_attempts: z.coerce.number().int().min(1).max(10),
    daily_call_cap: z.coerce.number().int().min(0),
    start_date: iso,
    end_date: iso,
    budget: z.preprocess(toNull, money.nullable()),
  })
  .superRefine((v, ctx) => {
    if (v.call_window_start && v.call_window_end) {
      if (v.call_window_start === v.call_window_end) {
        ctx.addIssue({
          code: 'custom',
          path: ['call_window_end'],
          message: 'End time must differ from start time',
        });
      }
    }
    if (v.start_date && v.end_date && v.start_date > v.end_date) {
      ctx.addIssue({
        code: 'custom',
        path: ['end_date'],
        message: 'End date must be after start date',
      });
    }
  });

export const CampaignAudienceSchema = z.object({
  audience_list_id: z.string().uuid().nullable().optional(),
  dedupe_by_phone: z.boolean(),
  exclude_dnc: z.boolean(),
  audience_contact_count: z.coerce.number().int().min(0),
});

// Voice & Script (agent-owned fields excluded)
export const CampaignVoiceSchema = z.object({
  agent_id: z.string().uuid().nullable().optional(),
  retry_logic: z.string().trim().min(1, 'Retry logic is required'),
});

export type CampaignVoiceValues = z.infer<typeof CampaignVoiceSchema>;

export function validateReadyForActive(params: {
  status: 'draft' | 'active' | 'paused' | 'completed';
  agent_id?: string | null;
  agent?: { hasScript: boolean; hasDisclosure: boolean; hasCallerId: boolean };
  call_window_start?: string | null;
  call_window_end?: string | null;
  audience_contact_count?: number;
}) {
  const errs: string[] = [];
  if (params.status === 'active') {
    if (!params.agent_id) errs.push('Select an agent.');
    if (!params.agent?.hasScript) errs.push('Agent is missing a script.');
    if (!params.agent?.hasDisclosure)
      errs.push('Agent is missing a disclosure line.');
    if (!params.agent?.hasCallerId) errs.push('Agent is missing a caller ID.');
    if (!(params.call_window_start && params.call_window_end))
      errs.push('Set a call window.');
    if ((params.audience_contact_count ?? 0) < 1)
      errs.push('Audience must have at least 1 contact.');
  }
  return errs;
}

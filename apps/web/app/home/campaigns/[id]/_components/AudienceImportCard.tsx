'use client';

import {
  useCallback,
  useDeferredValue,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';

import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  MapPinned,
  RefreshCcw,
  Trash2,
} from 'lucide-react';
import Papa from 'papaparse';
import { toast } from 'sonner';
import { z } from 'zod';

import { useBulkCreateLeads } from '@kit/supabase/hooks/leads/use-lead-mutations';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Label } from '@kit/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Spinner } from '@kit/ui/spinner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@kit/ui/tooltip';
import { cn } from '@kit/ui/utils';

type RawRow = Record<string, unknown>;

type TargetField =
  | 'name'
  | 'phone'
  | 'email'
  | 'timezone'
  | 'company'
  | 'status'
  | 'dnc'
  | 'notes'
  | 'last_contact_date'
  | 'attempts'
  | 'pledged_amount'
  | 'donated_amount'
  | 'first_name'
  | 'last_name'
  | 'opt_in';

const REQUIRED_FIELDS: Array<TargetField> = ['name', 'phone'];
const OPTIONAL_FIELDS: Array<TargetField> = [
  'email',
  'timezone',
  'company',
  'status',
  'dnc',
  'notes',
  'last_contact_date',
  'attempts',
  'pledged_amount',
  'donated_amount',
  'first_name',
  'last_name',
  'opt_in',
];

const STATUS_VALUES = [
  'new',
  'queued',
  'in_progress',
  'contacted',
  'unreachable',
  'bad_number',
  'do_not_call',
  'pledged',
  'donated',
  'completed',
] as const;
const ALLOWED_STATUS = new Set(STATUS_VALUES);

type RowIssue =
  | 'missing_name'
  | 'missing_phone'
  | 'invalid_phone'
  | 'invalid_email'
  | 'unknown_timezone'
  | 'invalid_date'
  | 'invalid_amount'
  | 'defaulted_field'
  | 'dnc';

type ValidatedRow = {
  originalIndex: number;
  data: {
    name: string;
    phone: string;
    email: string | null;
    timezone: string | null;
    company: string | null;
    status: string;
    dnc: boolean | null;
    notes: string | null;
    last_contact_date: string | null;
    attempts: number;
    pledged_amount: number | null;
    donated_amount: number | null;
  };
  normalizedPhone: string | null;
  issues: RowIssue[];
  outcome: 'valid' | 'warning' | 'error';
};

// Zod schema for validated lead row
const LeadRowSchema = z.object({
  name: z.string().min(1),
  phone: z
    .string()
    .min(1)
    .refine((v) => !!toE164(v), { message: 'invalid_phone' }),
  email: z.string().email().optional().nullable().or(z.literal('')),
  timezone: z.string().optional().nullable(),
  company: z.string().max(120).optional().nullable(),
  status: z.enum(STATUS_VALUES),
  dnc: z.boolean().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  last_contact_date: z
    .string()
    .datetime({ offset: true })
    .optional()
    .nullable(),
  attempts: z.number().int().min(0),
  pledged_amount: z.number().min(0).optional().nullable(),
  donated_amount: z.number().min(0).optional().nullable(),
});

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]} }`;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function basicEmailValid(email: string): boolean {
  // simple RFC-ish check
  return /.+@.+\..+/.test(email);
}

function toE164(phone: string): string | null {
  const digits = phone.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) {
    const rest = digits.slice(1).replace(/\D/g, '');
    if (rest.length >= 8 && rest.length <= 15) return `+${rest}`;
    return null;
  }
  const only = digits.replace(/\D/g, '');
  // naive inference: US 10-digit → +1
  if (only.length === 10) return `+1${only}`;
  // otherwise unknown
  return null;
}

const COMMON_TZ: Record<string, string> = {
  '+08:00': 'Asia/Manila',
  '+05:30': 'Asia/Kolkata',
  '+01:00': 'Europe/Berlin',
  Z: 'UTC',
};

function normalizeTimezone(tz: string): string | null {
  const trimmed = tz.trim();
  // IANA support if available
  const supported: string[] | undefined =
    typeof (Intl as any).supportedValuesOf === 'function'
      ? (Intl as any).supportedValuesOf('timeZone')
      : undefined;
  if (supported && supported.includes(trimmed)) return trimmed;
  if (/^[+-]\d{2}:\d{2}$|^Z$/.test(trimmed)) {
    return COMMON_TZ[trimmed] ?? null;
  }
  // heuristic: accept Region/City-like
  if (/^[A-Za-z_]+\/[A-Za-z_]+$/.test(trimmed)) return trimmed;
  return null;
}

function parseNumberSafe(value: unknown): number | null {
  if (value == null) return null;
  const s = String(value).replace(/[$,\s]/g, '');
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function parseBooleanFlexible(value: unknown): boolean | null {
  if (value == null) return null;
  const s = String(value).trim().toLowerCase();
  if (['true', 'yes', '1'].includes(s)) return true;
  if (['false', 'no', '0'].includes(s)) return false;
  return null;
}

function parseISODate(value: unknown): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  // Allow YYYY-MM-DD or ISO datetime
  const guess = /\d{4}-\d{2}-\d{2}(?:[T\s].*)?/.test(s) ? new Date(s) : null;
  if (guess && !Number.isNaN(guess.getTime())) return guess.toISOString();
  return null;
}

type Mapping = Partial<Record<TargetField, string>> & {
  name?: string; // direct column mapping for name
  phone?: string; // direct column mapping for phone
};

function autoInferMapping(headers: string[]): Mapping {
  const map: Mapping = {};
  const lower = headers.map((h) => h.toLowerCase());
  const pick = (candidates: string[]) => {
    for (const c of candidates) {
      const idx = lower.indexOf(c);
      if (idx !== -1) return headers[idx];
    }
    return undefined;
  };

  map.name = pick(['name', 'full_name']);
  map.phone = pick(['phone', 'phone_number', 'mobile']);
  map.email = pick(['email', 'e-mail']);
  map.timezone = pick(['timezone', 'time_zone', 'tz']);
  map.company = pick(['company', 'organization']);
  map.status = pick(['status']);
  map.dnc = pick(['dnc', 'do_not_call']);
  map.notes = pick(['notes', 'note']);
  map.last_contact_date = pick([
    'last_contact_date',
    'last_contacted',
    'last_contact',
  ]);
  map.attempts = pick(['attempts']);
  map.pledged_amount = pick(['pledged_amount', 'pledged']);
  map.donated_amount = pick(['donated_amount', 'donated']);
  map.first_name = pick(['first_name', 'firstname']);
  map.last_name = pick(['last_name', 'lastname']);
  map.opt_in = pick(['opt_in', 'optin', 'subscribed']);

  return map;
}

function toCSV(rows: Array<Record<string, unknown>>): string {
  return Papa.unparse(rows);
}

export function AudienceImportCard({ campaignId }: { campaignId: string }) {
  const bulkCreate = useBulkCreateLeads();

  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<RawRow[]>([]);
  const [mapping, setMapping] = useState<Mapping>({});
  const [showMap, setShowMap] = useState(false);
  const [dedupeByPhone, setDedupeByPhone] = useState(true);
  const [excludeDnc, setExcludeDnc] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Defer heavy sources to keep UI responsive while typing/mapping
  const deferredRows = useDeferredValue(rawRows);
  const deferredMapping = useDeferredValue(mapping);

  const onSelectFile = useCallback((selected: File) => {
    setFile(selected);
    setParsing(true);
    Papa.parse(selected, {
      header: true,
      skipEmptyLines: true,
      worker: true,
      fastMode: true,
      complete: (res) => {
        startTransition(() => {
          const rows = (res.data as RawRow[]) ?? [];
          const detected =
            (res as unknown as { meta?: { fields?: string[] } }).meta?.fields ||
            Object.keys(rows[0] ?? {});
          setHeaders(detected);
          setRawRows(rows);
          const inferred = autoInferMapping(detected);
          setMapping(inferred);
          setParsing(false);
          if (!inferred.name && !(inferred.first_name && inferred.last_name)) {
            setShowMap(true);
          }
          if (!inferred.phone) {
            setShowMap(true);
          }
        });
      },
      error: () => setParsing(false),
    });
  }, []);

  const mappedRows = useMemo(() => {
    if (deferredRows.length === 0) return [] as ValidatedRow[];

    const result: ValidatedRow[] = [];

    for (let i = 0; i < deferredRows.length; i++) {
      const row = deferredRows[i]!;

      const get = (key?: string) => (key ? String(row[key] ?? '').trim() : '');

      const first = get(deferredMapping.first_name);
      const last = get(deferredMapping.last_name);
      const combinedName = [first, last].filter(Boolean).join(' ').trim();
      const nameRaw = get(deferredMapping.name) || combinedName;
      const name = normalizeWhitespace(nameRaw);
      const phoneRaw = get(deferredMapping.phone);
      const phoneE164 = toE164(phoneRaw);

      const emailRaw = get(deferredMapping.email);
      const email = emailRaw ? emailRaw : '';
      const company = get(deferredMapping.company) || '';
      const tzRaw = get(deferredMapping.timezone);
      const tz = tzRaw ? normalizeTimezone(tzRaw) : null;
      const notesRaw = get(deferredMapping.notes);
      const notes = notesRaw ? notesRaw : '';
      const lastContactIso = parseISODate(
        get(deferredMapping.last_contact_date),
      );
      const attemptsNum = parseNumberSafe(get(deferredMapping.attempts));
      const pledgedNum = parseNumberSafe(get(deferredMapping.pledged_amount));
      const donatedNum = parseNumberSafe(get(deferredMapping.donated_amount));
      type Status = (typeof STATUS_VALUES)[number];
      const statusRaw = (get(deferredMapping.status) || 'new').toLowerCase();
      const status: Status = ALLOWED_STATUS.has(statusRaw as Status)
        ? (statusRaw as Status)
        : 'new';

      // derive DNC from dnc/opt_in
      const dncFromCsv = parseBooleanFlexible(row[deferredMapping.dnc ?? '']);
      const optInFromCsv = parseBooleanFlexible(
        row[deferredMapping.opt_in ?? ''],
      );
      const dnc = dncFromCsv ?? (optInFromCsv == null ? null : !optInFromCsv);

      const issues: RowIssue[] = [];

      if (!name) issues.push('missing_name');
      if (!phoneRaw) issues.push('missing_phone');
      if (phoneRaw && !phoneE164) issues.push('invalid_phone');
      if (email && !basicEmailValid(email)) issues.push('invalid_email');
      if (tzRaw && !tz) issues.push('unknown_timezone');
      if (get(mapping.last_contact_date) && !lastContactIso)
        issues.push('invalid_date');
      if (get(mapping.pledged_amount) && pledgedNum == null)
        issues.push('invalid_amount');
      if (get(mapping.donated_amount) && donatedNum == null)
        issues.push('invalid_amount');
      if (statusRaw !== status) issues.push('defaulted_field');
      if (attemptsNum == null && get(mapping.attempts))
        issues.push('defaulted_field');
      if (notes.length > 1000) issues.push('defaulted_field');
      if (company.length > 120) issues.push('defaulted_field');
      if (dnc === true) issues.push('dnc');

      // Build candidate object and validate with Zod
      const candidate = {
        name,
        phone: phoneE164 ?? phoneRaw,
        email: email || null,
        timezone: tz,
        company: company || null,
        status,
        dnc,
        notes: notes || null,
        last_contact_date: lastContactIso,
        attempts: Math.max(0, attemptsNum ?? 0),
        pledged_amount:
          pledgedNum == null || pledgedNum < 0 ? null : pledgedNum,
        donated_amount:
          donatedNum == null || donatedNum < 0 ? null : donatedNum,
      };

      const parsed = LeadRowSchema.safeParse(candidate);
      if (!parsed.success) {
        for (const err of parsed.error.issues) {
          switch (err.path[0]) {
            case 'name':
              if (!issues.includes('missing_name')) issues.push('missing_name');
              break;
            case 'phone':
              if (!issues.includes('missing_phone'))
                issues.push('missing_phone');
              if (!issues.includes('invalid_phone'))
                issues.push('invalid_phone');
              break;
            case 'email':
              if (email)
                if (!issues.includes('invalid_email'))
                  issues.push('invalid_email');
              break;
            case 'last_contact_date':
              if (!issues.includes('invalid_date')) issues.push('invalid_date');
              break;
            case 'pledged_amount':
            case 'donated_amount':
              if (!issues.includes('invalid_amount'))
                issues.push('invalid_amount');
              break;
            case 'company':
            case 'notes':
              if (!issues.includes('defaulted_field'))
                issues.push('defaulted_field');
              break;
          }
        }
      }

      const outcome: ValidatedRow['outcome'] = issues.some((x) =>
        ['missing_name', 'missing_phone', 'invalid_phone'].includes(x),
      )
        ? 'error'
        : issues.length > 0
          ? 'warning'
          : 'valid';

      result.push({
        originalIndex: i,
        data: candidate,
        normalizedPhone: phoneE164,
        issues,
        outcome,
      });
    }

    return result;
  }, [deferredRows, deferredMapping]);

  const dedupedRows = useMemo(() => {
    if (!dedupeByPhone) return mappedRows;
    const seen = new Set<string>();
    const out: ValidatedRow[] = [];
    for (const r of mappedRows) {
      const key = r.normalizedPhone ?? r.data.phone;
      if (!key) {
        out.push(r);
        continue;
      }
      if (seen.has(key)) continue; // keep first
      seen.add(key);
      out.push(r);
    }
    return out;
  }, [mappedRows, dedupeByPhone]);

  const filteredRows = useMemo(() => {
    if (!excludeDnc) return dedupedRows;
    return dedupedRows.filter((r) => r.data.dnc !== true);
  }, [dedupedRows, excludeDnc]);

  const counts = useMemo(() => {
    const total = mappedRows.length;
    const duplicatesRemoved = Math.max(
      0,
      mappedRows.length - dedupedRows.length,
    );
    const dncExcluded = Math.max(0, dedupedRows.length - filteredRows.length);
    const invalidPhones = mappedRows.filter((r) =>
      r.issues.includes('invalid_phone'),
    ).length;
    const invalidEmails = mappedRows.filter((r) =>
      r.issues.includes('invalid_email'),
    ).length;
    const defaulted = mappedRows.filter((r) =>
      r.issues.includes('defaulted_field'),
    ).length;
    const validAfter = filteredRows.filter((r) => r.outcome !== 'error').length;
    const canContinue =
      headers.length > 0 &&
      mapping.phone &&
      (mapping.name || (mapping.first_name && mapping.last_name)) &&
      validAfter > 0;
    return {
      total,
      duplicatesRemoved,
      dncExcluded,
      invalidPhones,
      invalidEmails,
      defaulted,
      validAfter,
      canContinue,
    };
  }, [mappedRows, dedupedRows, filteredRows, headers.length, mapping]);

  const downloadCSV = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadErrors = () => {
    const rows = mappedRows
      .filter((r) => r.outcome === 'error')
      .map((r) => ({
        reason: r.issues.join('|'),
        ...r.data,
      }));
    downloadCSV('errors.csv', toCSV(rows));
  };

  const handleDownloadClean = () => {
    const rows = filteredRows
      .filter((r) => r.outcome !== 'error')
      .map((r) => r.data as unknown as Record<string, unknown>);
    downloadCSV('cleaned.csv', toCSV(rows));
  };

  const handleContinue = async () => {
    const rows = filteredRows
      .filter((r) => r.outcome !== 'error')
      .map((r) => r.data);
    if (rows.length === 0 || bulkCreate.isPending) return;
    try {
      await bulkCreate.mutateAsync({ campaign_id: campaignId, leads: rows });
      toast.success('Audience imported successfully');
      // Clear preview and input to avoid duplicates
      setFile(null);
      setHeaders([]);
      setRawRows([]);
      setMapping({});
      setShowMap(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to import audience');
    }
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Card 1: Import settings */}
      <Card>
        <CardHeader>
          <CardTitle>Import settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Upload CSV</Label>
            <div
              className={cn(
                'mt-2 rounded-lg border-2 border-dashed p-6 text-center',
                parsing && 'opacity-60',
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (f.size > 50 * 1024 * 1024) return; // 50MB
                  onSelectFile(f);
                }}
              />
              {file ? (
                <div className="space-y-2">
                  <div className="bg-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">{file.name}</div>
                    <div className="text-muted-foreground">
                      {formatBytes(file.size)}
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <RefreshCcw className="mr-2 h-4 w-4" /> Replace file
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setFile(null);
                        setHeaders([]);
                        setRawRows([]);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Remove file
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const header = [
                          'name',
                          'phone',
                          'email',
                          'timezone',
                          'company',
                          'status',
                          'dnc',
                          'notes',
                          'last_contact_date',
                          'attempts',
                          'pledged_amount',
                          'donated_amount',
                          'first_name',
                          'last_name',
                          'opt_in',
                        ];
                        const example = {
                          name: 'John Doe',
                          phone: '+1234567890',
                          email: 'john@example.com',
                          timezone: 'America/New_York',
                          company: 'Acme',
                          status: 'new',
                          dnc: 'false',
                          notes: '',
                          last_contact_date: '2024-12-01',
                          attempts: '0',
                          pledged_amount: '0',
                          donated_amount: '0',
                          first_name: 'John',
                          last_name: 'Doe',
                          opt_in: 'true',
                        } as Record<string, unknown>;
                        const csv = toCSV([example]);
                        // Ensure header order
                        const normalized = [
                          header.join(','),
                          csv.split('\n').slice(1).join('\n'),
                        ]
                          .filter(Boolean)
                          .join('\n');
                        downloadCSV('leads_template.csv', normalized);
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" /> Download template
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-medium">Click to browse files</p>
                  <p className="text-muted-foreground text-sm">
                    or drag and drop your CSV file here
                  </p>
                  <div className="text-muted-foreground text-xs">
                    Max 50MB. CSV only.
                  </div>
                  <div className="mt-2">
                    <Button
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Select file
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="text-muted-foreground mt-2 text-xs">
              Required: <code>name</code>, <code>phone</code>
              <br />
              Optional: <code>email</code>, <code>timezone</code>,{' '}
              <code>company</code>, <code>status</code>, <code>dnc</code>,{' '}
              <code>notes</code>, <code>last_contact_date</code>,{' '}
              <code>attempts</code>, <code>pledged_amount</code>,{' '}
              <code>donated_amount</code>
            </div>
          </div>

          {/* Headers detected */}
          <div className="rounded-lg border p-3 text-xs">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium">Headers detected</span>
              <AlertCircle className="h-3.5 w-3.5 opacity-60" />
            </div>
            {headers.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {headers.map((h) => (
                  <Badge key={h} variant="outline" className="gap-1">
                    {h}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground">No CSV parsed yet</div>
            )}
          </div>

          {/* Toggles */}
          <TooltipProvider>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={dedupeByPhone}
                  onChange={(e) => setDedupeByPhone(e.currentTarget.checked)}
                />
                <span className="text-sm">Dedupe by phone</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertCircle className="h-4 w-4 cursor-help text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Keep the first row per normalized phone.
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={excludeDnc}
                  onChange={(e) => setExcludeDnc(e.currentTarget.checked)}
                />
                <span className="text-sm">Exclude DNC list</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertCircle className="h-4 w-4 cursor-help text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Skip rows marked DNC or with opt-out.
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </TooltipProvider>

          {headers.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowMap(true)}
              >
                <MapPinned className="mr-2 h-4 w-4" /> Map columns
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card 2: Preview & issues */}
      <Card>
        <CardHeader>
          <CardTitle>Preview & issues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Summary bar */}
          <div className="rounded-md border p-3 text-sm">
            {mappedRows.length === 0 ? (
              <div className="text-muted-foreground">No file parsed yet.</div>
            ) : (
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  Parsed {counts.total.toLocaleString()} rows ·{' '}
                  {counts.duplicatesRemoved} duplicates removed ·{' '}
                  {counts.dncExcluded} DNC excluded · {counts.invalidPhones}{' '}
                  invalid phones · {counts.invalidEmails} invalid emails ·{' '}
                  {counts.defaulted} defaulted fields
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setFile(null);
                      setHeaders([]);
                      setRawRows([]);
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDownloadErrors}
                    disabled={mappedRows.length === 0}
                  >
                    <Download className="mr-2 h-4 w-4" /> Errors CSV
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDownloadClean}
                    disabled={counts.validAfter === 0}
                  >
                    <Download className="mr-2 h-4 w-4" /> Cleaned CSV
                  </Button>
                  <Button
                    size="sm"
                    disabled={!counts.canContinue || bulkCreate.isPending}
                    onClick={handleContinue}
                  >
                    {bulkCreate.isPending ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" /> Saving…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Continue
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Preview table */}
          {mappedRows.length > 0 && (
            <div>
              <div className="mb-2 text-sm font-medium">
                Preview (first 10 rows)
              </div>
              <div className="max-h-64 overflow-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      {[
                        'Name',
                        'Phone',
                        'Email',
                        'Company',
                        'Timezone',
                        'Status',
                        'DNC',
                        'Attempts',
                        'Pledged',
                        'Donated',
                        'Last contact',
                        'Notes',
                      ].map((h) => (
                        <th key={h} className="p-2 text-left">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.slice(0, 10).map((r) => {
                      const badge = (cond: boolean, text: string) =>
                        cond ? (
                          <Badge variant="outline" className="text-[10px]">
                            {text}
                          </Badge>
                        ) : null;
                      return (
                        <tr key={r.originalIndex} className="border-t">
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <span>{r.data.name || '-'}</span>
                              {badge(
                                r.issues.includes('missing_name'),
                                'Missing',
                              )}
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <span>{r.data.phone || '-'}</span>
                              {badge(
                                r.issues.includes('invalid_phone'),
                                'Invalid phone',
                              )}
                              {badge(
                                r.issues.includes('missing_phone'),
                                'Missing',
                              )}
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <span>{r.data.email ?? '-'}</span>
                              {badge(
                                r.issues.includes('invalid_email'),
                                'Invalid email',
                              )}
                            </div>
                          </td>
                          <td className="p-2">{r.data.company ?? '-'}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <span>{r.data.timezone ?? '-'}</span>
                              {badge(
                                r.issues.includes('unknown_timezone'),
                                'Unknown tz',
                              )}
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <span>{r.data.status}</span>
                              {badge(
                                r.issues.includes('defaulted_field'),
                                'Defaulted',
                              )}
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <span>{String(r.data.dnc ?? false)}</span>
                              {badge(r.issues.includes('dnc'), 'DNC')}
                            </div>
                          </td>
                          <td className="p-2">{r.data.attempts}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <span>{r.data.pledged_amount ?? '-'}</span>
                              {badge(
                                r.issues.includes('invalid_amount'),
                                'Invalid amount',
                              )}
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <span>{r.data.donated_amount ?? '-'}</span>
                              {badge(
                                r.issues.includes('invalid_amount'),
                                'Invalid amount',
                              )}
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <span>{r.data.last_contact_date ?? '-'}</span>
                              {badge(
                                r.issues.includes('invalid_date'),
                                'Invalid date',
                              )}
                            </div>
                          </td>
                          <td className="p-2">{r.data.notes ?? '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="text-muted-foreground border-t p-2 text-center text-xs">
                  Showing the first 10 rows from your file.
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map columns dialog */}
      <Dialog open={showMap} onOpenChange={setShowMap}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Map columns</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {([...REQUIRED_FIELDS, ...OPTIONAL_FIELDS] as TargetField[]).map(
              (field) => (
                <div key={field}>
                  <Label className="capitalize">
                    {field.replaceAll('_', ' ')}
                  </Label>
                  <Select
                    value={
                      (mapping as Record<string, string | undefined>)[field] ??
                      ''
                    }
                    onValueChange={(v) =>
                      setMapping((m) => ({ ...m, [field]: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unmapped" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unmapped</SelectItem>
                      {headers.map((h) => (
                        <SelectItem key={h} value={h}>
                          <div className="flex items-center justify-between gap-3">
                            <span className="truncate">{h}</span>
                            <span className="text-muted-foreground hidden text-xs sm:inline">
                              {String(rawRows[0]?.[h] ?? '')}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ),
            )}
          </div>
          <div className="text-muted-foreground mt-2 text-xs">
            Name can be provided directly via a <code>name</code> column or by
            mapping both <code>first_name</code> and <code>last_name</code>.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowMap(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AudienceImportCard;

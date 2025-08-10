'use client';

import {
  AlertCircle,
  CheckCircle,
  FileDown,
  FileSpreadsheet,
} from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Switch } from '@kit/ui/switch';

import { CsvDropzone } from './csv-dropzone';

type CsvRow = Record<string, string>;

export interface AudienceFormValues {
  audience_list_id?: string;
  dedupe_by_phone: boolean;
  exclude_dnc: boolean;
  audience_contact_count: number;
}

export function AudienceStep({
  csvHeaders,
  csvErrors,
  csvRows,
  isUploading,
  hasCampaignId,
  onTemplateDownload,
  onConnectCrm,
  onDropCsv,
  onUploadCsv,
  form,
  onBlurAudience,
  onBack,
  onSaveDraft,
  onNext,
}: {
  csvHeaders: string[];
  csvErrors: string[];
  csvRows: CsvRow[];
  isUploading: boolean;
  hasCampaignId: boolean;
  onTemplateDownload: () => void;
  onConnectCrm: () => void;
  onDropCsv: (file: File) => void;
  onUploadCsv: () => void | Promise<void>;
  form: UseFormReturn<AudienceFormValues>;
  onBlurAudience: () => void;
  onBack: () => void;
  onSaveDraft: () => void | Promise<void>;
  onNext: () => void | Promise<void>;
}) {
  return (
    <div className="space-y-5">
      <div className="px-0 pt-0 text-base font-medium">Audience</div>
        <div className="rounded-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              <p className="text-sm font-medium">Upload CSV</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onTemplateDownload}>
                <FileDown className="mr-2 h-4 w-4" /> Template
              </Button>
              <Button variant="ghost" size="sm" onClick={onConnectCrm}>
                Connect CRM
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            Required headers: first_name, phone. Optional: last_name, email,
            timezone, opt_in.
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <CsvDropzone disabled={!hasCampaignId} onFileSelected={onDropCsv}>
              Drop CSV here or click to choose
            </CsvDropzone>
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
              {csvErrors.length > 5 && <div>+{csvErrors.length - 5} more…</div>}
            </div>
          )}
          {csvRows.length > 0 && (
            <div className="text-muted-foreground mt-2 text-xs">
              {csvRows.length} rows parsed
            </div>
          )}
          <div className="mt-3">
            <Button
              onClick={() => void onUploadCsv()}
              disabled={
                !hasCampaignId ||
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
              {form.watch('audience_contact_count')} contacts ready
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.watch('dedupe_by_phone')}
                onCheckedChange={(v) => {
                  form.setValue('dedupe_by_phone', v);
                  onBlurAudience();
                }}
              />
              <span className="text-sm">Dedupe by phone</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.watch('exclude_dnc')}
                onCheckedChange={(v) => {
                  form.setValue('exclude_dnc', v);
                  onBlurAudience();
                }}
              />
              <span className="text-sm">Exclude DNC list</span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-between">
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void onSaveDraft()}>
              Save as draft
            </Button>
            <Button onClick={() => void onNext()} className="min-w-36">
              Save & continue
            </Button>
          </div>
        </div>
    </div>
  );
}

export default AudienceStep;

'use client';

import { useMemo, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { Download, Trash2, Users } from 'lucide-react';
import Papa from 'papaparse';
import { toast } from 'sonner';

import { useDeleteLead } from '@kit/supabase/hooks/leads/use-lead-mutations';
import { useLeadsByCampaign } from '@kit/supabase/hooks/leads/use-leads';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Skeleton } from '@kit/ui/skeleton';

function toCSV(rows: Array<Record<string, unknown>>): string {
  return Papa.unparse(rows);
}

export function ExistingAudienceCard({ campaignId }: { campaignId: string }) {
  const { data: leads = [], isLoading } = useLeadsByCampaign(campaignId);
  const deleteLead = useDeleteLead();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<
    | 'all'
    | 'new'
    | 'queued'
    | 'in_progress'
    | 'contacted'
    | 'unreachable'
    | 'bad_number'
    | 'do_not_call'
    | 'pledged'
    | 'donated'
    | 'completed'
  >('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (status !== 'all' && l.status !== status) return false;
      if (!q) return true;
      return (
        (l.name ?? '').toLowerCase().includes(q) ||
        (l.email ?? '').toLowerCase().includes(q) ||
        (l.phone ?? '').toLowerCase().includes(q) ||
        (l.company ?? '').toLowerCase().includes(q)
      );
    });
  }, [leads, search, status]);

  const count = filtered.length;
  const preview = useMemo(() => filtered.slice(0, 10), [filtered]);

  const handleExport = () => {
    if (filtered.length === 0) return;
    const rows = filtered.map((l) => ({
      name: l.name,
      phone: l.phone,
      email: l.email,
      company: l.company,
      status: l.status,
      dnc: l.dnc,
      attempts: l.attempts,
      pledged_amount: l.pledged_amount,
      donated_amount: l.donated_amount,
      last_contact_date: l.last_contact_date,
      notes: l.notes,
    })) as Array<Record<string, unknown>>;
    const csv = toCSV(rows);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campaign_audience.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <CardTitle>Existing audience</CardTitle>
          </div>
          <div className="text-muted-foreground text-sm">
            {count.toLocaleString()} total
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-xs">
            Showing up to 10 leads
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            disabled={count === 0}
          >
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Input
            placeholder="Search name, email, phone, or company"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:w-80"
          />
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">Status</span>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as typeof status)}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  'all',
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
                ].map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s.replaceAll('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-11/12" />
            <Skeleton className="h-5 w-10/12" />
          </div>
        ) : count === 0 ? (
          <div className="text-muted-foreground text-sm">
            No leads yet. Upload a CSV to add contacts.
          </div>
        ) : (
          <div className="max-h-64 overflow-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0">
                <tr>
                  {[
                    'Name',
                    'Phone',
                    'Email',
                    'Company',
                    'Status',
                    'Actions',
                  ].map((h) => (
                    <th key={h} className="p-2 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((l) => (
                  <tr key={l.id} className="border-t">
                    <td className="p-2">{l.name ?? '-'}</td>
                    <td className="p-2">{l.phone ?? '-'}</td>
                    <td className="p-2">{l.email ?? '-'}</td>
                    <td className="p-2">{l.company ?? '-'}</td>
                    <td className="p-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] capitalize"
                      >
                        {l.status}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const ok = window.confirm('Delete this lead?');
                          if (!ok) return;
                          try {
                            setDeletingId(l.id);
                            await deleteLead.mutateAsync(l.id);
                            // ensure campaign-scoped list refreshes
                            queryClient.invalidateQueries({
                              queryKey: ['leads', 'campaign', campaignId],
                            });
                            toast.success('Lead deleted');
                          } catch (e) {
                            toast.error(
                              e instanceof Error
                                ? e.message
                                : 'Failed to delete lead',
                            );
                          } finally {
                            setDeletingId(null);
                          }
                        }}
                        disabled={deletingId === l.id}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {deletingId === l.id ? 'Deleting…' : 'Delete'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ExistingAudienceCard;

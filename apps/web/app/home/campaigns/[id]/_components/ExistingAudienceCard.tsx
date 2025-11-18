'use client';

import { useMemo, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { Download, Users } from 'lucide-react';
import Papa from 'papaparse';
import { toast } from 'sonner';

import {
  useCreateLead,
  useDeleteLead,
  useUpdateLead,
} from '@kit/supabase/hooks/leads/use-lead-mutations';
import { useLeadsByCampaign } from '@kit/supabase/hooks/leads/use-leads';
import { useBusinessContext } from '@kit/supabase/hooks/use-business-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@kit/ui/alert-dialog';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
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

// Helper to get full name from lead
function getLeadName(lead: {
  first_name?: string | null;
  last_name?: string | null;
}): string {
  const first = lead.first_name || '';
  const last = lead.last_name || '';
  return `${first} ${last}`.trim() || '-';
}

export function ExistingAudienceCard({ campaignId }: { campaignId: string }) {
  const { data: leads = [], isLoading } = useLeadsByCampaign(campaignId);
  const { data: businessContext } = useBusinessContext();
  const deleteLead = useDeleteLead();
  const updateLead = useUpdateLead();
  const createLead = useCreateLead();
  const queryClient = useQueryClient();
  // selection state handled via selectedIds; no per-row delete button
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<{
    id: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    email: string | null;
    company: string | null;
    timezone: string | null;
    status: string;
  } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<{
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    company: string;
    status: string;
    notes: string;
  }>({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    company: '',
    status: 'new',
    notes: '',
  });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<
    | 'all'
    | 'new'
    | 'contacted'
    | 'interested'
    | 'pledged'
    | 'donated'
    | 'not_interested'
    | 'unreachable'
    | 'failed'
  >('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (status !== 'all' && l.status !== status) return false;
      if (!q) return true;
      return (
        getLeadName(l).toLowerCase().includes(q) ||
        (l.email ?? '').toLowerCase().includes(q) ||
        (l.phone ?? '').toLowerCase().includes(q) ||
        (l.company ?? '').toLowerCase().includes(q)
      );
    });
  }, [leads, search, status]);

  const count = filtered.length;
  const preview = useMemo(() => filtered.slice(0, 10), [filtered]);

  const isAllSelected =
    preview.length > 0 && preview.every((l) => selectedIds.has(l.id));
  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isAllSelected) {
        preview.forEach((l) => next.delete(l.id));
      } else {
        preview.forEach((l) => next.add(l.id));
      }
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    try {
      setIsBulkDeleting(true);
      await Promise.all(ids.map((id) => deleteLead.mutateAsync(id)));
      await queryClient.invalidateQueries({
        queryKey: ['leads', 'campaign', campaignId],
      });
      setSelectedIds(new Set());
      toast.success('Selected leads deleted');
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Failed to delete selected leads',
      );
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const openEditForSelected = () => {
    const id = Array.from(selectedIds)[0];
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;
    setEditForm({
      id: lead.id,
      first_name: lead.first_name,
      last_name: lead.last_name,
      phone: lead.phone,
      email: lead.email,
      company: lead.company,
      timezone: lead.timezone,
      status: lead.status ?? 'new',
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editForm) return;

    // Validate and default timezone
    const validateTimezone = (tz: string | null | undefined): string => {
      if (!tz || tz.trim() === '') return 'UTC';
      const trimmed = tz.trim();
      const timezoneRegex = /^([A-Z][a-z]+\/[A-Z][a-z_]+|UTC)$/;
      return timezoneRegex.test(trimmed) ? trimmed : 'UTC';
    };

    try {
      await updateLead.mutateAsync({
        id: editForm.id,
        first_name: editForm.first_name ?? undefined,
        last_name: editForm.last_name ?? undefined,
        phone: editForm.phone ?? undefined,
        email: editForm.email ?? undefined,
        company: editForm.company ?? undefined,
        timezone: validateTimezone(editForm.timezone),
        status: editForm.status,
      });
      await queryClient.invalidateQueries({
        queryKey: ['leads', 'campaign', campaignId],
      });
      toast.success('Lead updated');
      setEditOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update lead');
    }
  };

  const handleExport = () => {
    if (filtered.length === 0) return;
    const rows = filtered.map((l) => ({
      name: getLeadName(l),
      phone: l.phone,
      email: l.email,
      company: l.company,
      title: l.title,
      lead_score: l.lead_score,
      quality_rating: l.quality_rating,
      status: l.status,
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
                  'contacted',
                  'interested',
                  'pledged',
                  'donated',
                  'not_interested',
                  'unreachable',
                  'failed',
                ].map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s.replaceAll('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <Button
              size="sm"
              onClick={() => setAddOpen(true)}
              disabled={isBulkDeleting}
            >
              Add
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={openEditForSelected}
              disabled={selectedIds.size !== 1 || isBulkDeleting}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirmOpen(true)}
              disabled={selectedIds.size === 0 || isBulkDeleting}
            >
              {isBulkDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Deleting...
                </div>
              ) : (
                'Delete'
              )}
            </Button>
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
          <div
            className={`max-h-64 overflow-auto overflow-x-auto rounded-md border ${isBulkDeleting ? 'pointer-events-none opacity-50' : ''}`}
          >
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="w-10 p-2 text-left">
                    <input
                      type="checkbox"
                      aria-label="Select all"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      disabled={isBulkDeleting}
                    />
                  </th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Phone</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Company</th>
                  <th className="p-2 text-left">Title</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Score</th>
                  <th className="p-2 text-left">Quality</th>
                  <th className="p-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((l) => (
                  <tr key={l.id} className="border-t">
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(l.id)}
                        onChange={(e) =>
                          setSelectedIds((prev) => {
                            const next = new Set(prev);
                            if (e.target.checked) next.add(l.id);
                            else next.delete(l.id);
                            return next;
                          })
                        }
                        aria-label={`Select ${getLeadName(l) ?? 'lead'}`}
                        disabled={isBulkDeleting}
                      />
                    </td>
                    <td className="p-2">{getLeadName(l) ?? '-'}</td>
                    <td className="p-2">{l.phone ?? '-'}</td>
                    <td className="p-2">{l.email ?? '-'}</td>
                    <td className="p-2">{l.company ?? '-'}</td>
                    <td className="p-2">{l.title ?? '-'}</td>
                    <td className="p-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] capitalize"
                      >
                        {l.status}
                      </Badge>
                    </td>
                    <td className="p-2">{l.lead_score ?? 0}</td>
                    <td className="p-2">{l.quality_rating ?? '-'}</td>
                    <td className="p-2">{l.notes ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit lead</DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>First Name</Label>
                <Input
                  value={editForm.first_name ?? ''}
                  onChange={(e) =>
                    setEditForm((f) =>
                      f ? { ...f, first_name: e.target.value } : f,
                    )
                  }
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={editForm.last_name ?? ''}
                  onChange={(e) =>
                    setEditForm((f) =>
                      f ? { ...f, last_name: e.target.value } : f,
                    )
                  }
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={editForm.phone ?? ''}
                  onChange={(e) =>
                    setEditForm((f) =>
                      f ? { ...f, phone: e.target.value } : f,
                    )
                  }
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={editForm.email ?? ''}
                  onChange={(e) =>
                    setEditForm((f) =>
                      f ? { ...f, email: e.target.value } : f,
                    )
                  }
                />
              </div>
              <div>
                <Label>Company</Label>
                <Input
                  value={editForm.company ?? ''}
                  onChange={(e) =>
                    setEditForm((f) =>
                      f ? { ...f, company: e.target.value } : f,
                    )
                  }
                />
              </div>
              <div>
                <Label>Timezone</Label>
                <Input
                  placeholder="e.g. America/New_York or UTC"
                  value={editForm.timezone ?? ''}
                  onChange={(e) =>
                    setEditForm((f) =>
                      f ? { ...f, timezone: e.target.value } : f,
                    )
                  }
                />
                <p className="text-muted-foreground mt-1 text-xs">
                  Leave empty for UTC. Use IANA format (e.g., America/New_York)
                </p>
              </div>
              <div className="sm:col-span-2">
                <Label>Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(v) =>
                    setEditForm((f) => (f ? { ...f, status: v } : f))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      'new',
                      'contacted',
                      'interested',
                      'pledged',
                      'donated',
                      'not_interested',
                      'unreachable',
                      'failed',
                    ].map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s.replaceAll('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
                <Button variant="outline" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveEdit} disabled={updateLead.isPending}>
                  {updateLead.isPending ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected leads?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete {selectedIds.size} lead
              {selectedIds.size === 1 ? '' : 's'}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="text-muted-foreground text-xs">
            {Array.from(selectedIds)
              .slice(0, 5)
              .map((id) => {
                const lead = leads.find((l) => l.id === id);
                return lead ? getLeadName(lead) : id;
              })
              .join(', ')}
            {selectedIds.size > 5 ? '…' : ''}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isBulkDeleting}
              onClick={async () => {
                await handleDeleteSelected();
                setConfirmOpen(false);
              }}
            >
              {isBulkDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Deleting…
                </div>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add lead</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>First Name</Label>
              <Input
                value={addForm.first_name}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, first_name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={addForm.last_name}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, last_name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={addForm.phone}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={addForm.email}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Company</Label>
              <Input
                value={addForm.company}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, company: e.target.value }))
                }
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Status</Label>
              <Select
                value={addForm.status}
                onValueChange={(v) => setAddForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    'new',
                    'contacted',
                    'interested',
                    'pledged',
                    'donated',
                    'not_interested',
                    'unreachable',
                    'failed',
                  ].map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s.replaceAll('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Notes</Label>
              <Input
                value={addForm.notes}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, notes: e.target.value }))
                }
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
              <Button variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (!addForm.phone.trim()) {
                    toast.error('Phone is required');
                    return;
                  }

                  if (!businessContext?.business_id) {
                    toast.error(
                      'Business context not loaded. Please try again.',
                    );
                    return;
                  }

                  try {
                    await createLead.mutateAsync({
                      business_id: businessContext.business_id,
                      first_name: addForm.first_name || null,
                      last_name: addForm.last_name || null,
                      phone: addForm.phone,
                      email: addForm.email || null,
                      company: addForm.company || null,
                      status: addForm.status,
                      notes: addForm.notes || null,
                      source: 'manual',
                    });
                    await queryClient.invalidateQueries({
                      queryKey: ['leads', 'campaign', campaignId],
                    });
                    toast.success('Lead added');
                    setAddOpen(false);
                    setAddForm({
                      first_name: '',
                      last_name: '',
                      phone: '',
                      email: '',
                      company: '',
                      status: 'new',
                      notes: '',
                    });
                  } catch (e) {
                    toast.error(
                      e instanceof Error ? e.message : 'Failed to add lead',
                    );
                  }
                }}
                disabled={createLead.isPending}
              >
                {createLead.isPending ? 'Saving…' : 'Save lead'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default ExistingAudienceCard;

'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Database as DatabaseIcon,
  Download,
  Edit,
  Filter,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

import { useDeleteLead } from '@kit/supabase/hooks/leads/use-lead-mutations';
import {
  type LeadsFilters as LeadsFiltersType,
  useLeads,
} from '@kit/supabase/hooks/leads/use-leads';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { Checkbox } from '@kit/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Input } from '@kit/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';

import type { Database } from '~/lib/database.types';
import { getSourceBadgeColor } from '~/lib/utils/badges';

import { BulkActionsBar } from './BulkActionsBar';
import { AddLeadDialog } from './add-lead-dialog';
import { AddToListDialog } from './add-to-list-dialog';
import { EditLeadDialog } from './edit-lead-dialog';
import { ImportLeadsDialog } from './import-leads-dialog';
import { LeadListsDialog } from './lead-lists-dialog';
import { LeadsFilters } from './leads-filters';

type Lead = Database['public']['Tables']['leads']['Row'];

export function LeadsList() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [listsDialogOpen, setListsDialogOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [_filters, _setFilters] = useState<LeadsFiltersType>({});
  const [deleteLeadId, setDeleteLeadId] = useState<string | null>(null);
  const [addToListLead, setAddToListLead] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const pageSize = 25;

  // Selection state - using Set for O(1) lookups
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(
    new Set(),
  );

  // Fetch leads from Supabase with pagination
  const { data: leadsResult, isLoading } = useLeads({
    search: searchQuery,
    page,
    pageSize,
  });
  const deleteLead = useDeleteLead();

  const leads = leadsResult?.data ?? [];
  const total = leadsResult?.total ?? 0;
  const pageCount = leadsResult?.pageCount ?? 0;

  // Reset page when search changes
  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  // Calculate selection state
  const allLeadIds = useMemo(() => leads.map((lead) => lead.id), [leads]);
  const isAllSelected =
    leads.length > 0 && selectedLeadIds.size === leads.length;
  const isIndeterminate =
    selectedLeadIds.size > 0 && selectedLeadIds.size < leads.length;

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeadIds(new Set(allLeadIds));
    } else {
      setSelectedLeadIds(new Set());
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    const newSelection = new Set(selectedLeadIds);
    if (checked) {
      newSelection.add(leadId);
    } else {
      newSelection.delete(leadId);
    }
    setSelectedLeadIds(newSelection);
  };

  const clearSelection = () => {
    setSelectedLeadIds(new Set());
  };

  const handleDeleteLead = async () => {
    if (!deleteLeadId) return;

    try {
      await deleteLead.mutateAsync(deleteLeadId);
      toast.success('Lead deleted successfully');
      setDeleteLeadId(null);
    } catch {
      toast.error('Failed to delete lead');
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:border-primary/50 border-2 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold tracking-tight">
              Total Leads
            </CardTitle>
            <div className="bg-primary/10 rounded-lg p-2">
              <Users className="text-primary h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-bold tracking-tight">{total}</div>
            <p className="text-muted-foreground text-sm">Across all sources</p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 border-2 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold tracking-tight">
              From Integrations
            </CardTitle>
            <div className="rounded-lg bg-blue-500/10 p-2">
              <DatabaseIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-bold tracking-tight">
              {
                leads.filter(
                  (c) => c.source !== 'manual' && c.source !== 'csv_import',
                ).length
              }
            </div>
            <p className="text-muted-foreground text-sm">
              Via Salesforce, HubSpot, etc.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 border-2 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold tracking-tight">
              Manual & CSV
            </CardTitle>
            <div className="rounded-lg bg-green-500/10 p-2">
              <Upload className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-bold tracking-tight">
              {
                leads.filter(
                  (c) => c.source === 'manual' || c.source === 'csv_import',
                ).length
              }
            </div>
            <p className="text-muted-foreground text-sm">
              Added manually or imported
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-2">
        <CardHeader className="pb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <CardTitle className="text-xl font-semibold tracking-tight">
                Leads Database
              </CardTitle>
              <CardDescription className="text-base">
                Manage and organize your leads across all sources
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setListsDialogOpen(true)}
                className="h-9"
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Lists
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImportDialogOpen(true)}
                className="h-9"
              >
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button variant="outline" size="sm" className="h-9">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button
                size="sm"
                onClick={() => setAddDialogOpen(true)}
                className="h-9"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Lead
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Search and Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search leads by name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pr-4 pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="h-10 px-4"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Filters Panel */}
          {filtersOpen && (
            <LeadsFilters onClose={() => setFiltersOpen(false)} />
          )}

          {/* Table */}
          <div className="overflow-hidden rounded-lg border-2">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-muted/50">
                  <TableHead className="h-12 w-[50px]">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all leads"
                      {...(isIndeterminate && { 'data-indeterminate': true })}
                    />
                  </TableHead>
                  <TableHead className="h-12 font-semibold">Name</TableHead>
                  <TableHead className="h-12 font-semibold">Email</TableHead>
                  <TableHead className="h-12 font-semibold">Phone</TableHead>
                  <TableHead className="h-12 font-semibold">Company</TableHead>
                  <TableHead className="h-12 font-semibold">Source</TableHead>
                  <TableHead className="h-12 font-semibold">Tags</TableHead>
                  <TableHead className="h-12 w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-muted-foreground h-32 text-center"
                    >
                      Loading leads...
                    </TableCell>
                  </TableRow>
                ) : leads.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-muted-foreground h-32 text-center"
                    >
                      {searchQuery
                        ? 'No leads found matching your search'
                        : 'No leads yet. Add your first lead to get started!'}
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow key={lead.id} className="group">
                      <TableCell className="py-4">
                        <Checkbox
                          checked={selectedLeadIds.has(lead.id)}
                          onCheckedChange={(checked) =>
                            handleSelectLead(lead.id, checked as boolean)
                          }
                          aria-label={`Select ${lead.first_name} ${lead.last_name}`}
                        />
                      </TableCell>
                      <TableCell className="py-4 font-semibold">
                        {lead.first_name} {lead.last_name}
                      </TableCell>
                      <TableCell className="py-4">
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-primary hover:underline"
                        >
                          {lead.email}
                        </a>
                      </TableCell>
                      <TableCell className="text-muted-foreground py-4">
                        {lead.phone || '—'}
                      </TableCell>
                      <TableCell className="py-4">
                        {lead.company || '—'}
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          variant="secondary"
                          className={`font-medium ${getSourceBadgeColor(lead.source)}`}
                        >
                          {lead.source}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {Array.isArray(lead.tags) &&
                            (lead.tags as string[])
                              .slice(0, 2)
                              .map((tag: string) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs font-medium"
                                >
                                  {tag}
                                </Badge>
                              ))}
                          {Array.isArray(lead.tags) &&
                            (lead.tags as string[]).length > 2 && (
                              <Badge
                                variant="outline"
                                className="text-xs font-medium"
                              >
                                +{(lead.tags as string[]).length - 2}
                              </Badge>
                            )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              onClick={() => setEditingLead(lead)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setAddToListLead({
                                  id: lead.id,
                                  name: `${lead.first_name} ${lead.last_name}`.trim(),
                                })
                              }
                            >
                              <Users className="mr-2 h-4 w-4" />
                              Add to List
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => setDeleteLeadId(lead.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {pageCount > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-muted-foreground text-sm font-medium">
                Showing {page * pageSize + 1} to{' '}
                {Math.min((page + 1) * pageSize, total)} of {total} leads
              </div>
              <div className="flex items-center gap-4">
                <div className="text-muted-foreground text-sm font-medium">
                  Page {page + 1} of {pageCount}
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(0)}
                    disabled={page === 0}
                    className="h-9 w-9"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 0}
                    className="h-9 w-9"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= pageCount - 1}
                    className="h-9 w-9"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(pageCount - 1)}
                    disabled={page >= pageCount - 1}
                    className="h-9 w-9"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddLeadDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <ImportLeadsDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />
      <LeadListsDialog
        open={listsDialogOpen}
        onOpenChange={setListsDialogOpen}
      />
      {addToListLead && (
        <AddToListDialog
          open={!!addToListLead}
          onOpenChange={(open) => !open && setAddToListLead(null)}
          leadId={addToListLead.id}
          leadName={addToListLead.name}
        />
      )}
      {editingLead && (
        <EditLeadDialog
          open={!!editingLead}
          onOpenChange={(open) => !open && setEditingLead(null)}
          lead={editingLead}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteLeadId}
        onOpenChange={(open) => !open && setDeleteLeadId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lead? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLead}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Actions Bar */}
      {selectedLeadIds.size > 0 && (
        <BulkActionsBar
          selectedCount={selectedLeadIds.size}
          selectedLeadIds={selectedLeadIds}
          onClearSelection={clearSelection}
        />
      )}
    </div>
  );
}

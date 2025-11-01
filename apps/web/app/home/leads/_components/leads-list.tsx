'use client';

import { useState, useMemo } from 'react';
import { Plus, Upload, Download, Filter, Search, MoreVertical, Trash2, Edit, Users, Database as DatabaseIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import { Checkbox } from '@kit/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';
import { Badge } from '@kit/ui/badge';
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

import { useLeads, type LeadsFilters as LeadsFiltersType } from '@kit/supabase/hooks/leads/use-leads';
import { useDeleteLead } from '@kit/supabase/hooks/leads/use-lead-mutations';

import { AddLeadDialog } from './add-lead-dialog';
import { ImportLeadsDialog } from './import-leads-dialog';
import { LeadsFilters } from './leads-filters';
import { AddToListDialog } from './add-to-list-dialog';
import { BulkActionsBar } from './BulkActionsBar';
import { LeadListsDialog } from './lead-lists-dialog';
import { EditLeadDialog } from './edit-lead-dialog';

import type { Database } from '~/lib/database.types';
import { getSourceBadgeColor } from '~/lib/utils/badges';
type Lead = Database['public']['Tables']['leads']['Row'];

export function LeadsList() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [listsDialogOpen, setListsDialogOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [_filters, _setFilters] = useState<LeadsFiltersType>({});
  const [deleteLeadId, setDeleteLeadId] = useState<string | null>(null);
  const [addToListLead, setAddToListLead] = useState<{ id: string; name: string } | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Selection state - using Set for O(1) lookups
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());

  // Fetch leads from Supabase
  const { data: leads = [], isLoading } = useLeads({
    search: searchQuery,
  });
  const deleteLead = useDeleteLead();

  // Calculate selection state
  const allLeadIds = useMemo(() => leads.map(lead => lead.id), [leads]);
  const isAllSelected = leads.length > 0 && selectedLeadIds.size === leads.length;
  const isIndeterminate = selectedLeadIds.size > 0 && selectedLeadIds.size < leads.length;

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
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all sources
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">From Integrations</CardTitle>
            <DatabaseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.filter((c) => c.source !== 'manual' && c.source !== 'csv_import').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Via Salesforce, HubSpot, etc.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manual & CSV</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.filter((c) => c.source === 'manual' || c.source === 'csv_import').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Added manually or imported
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Leads</CardTitle>
              <CardDescription>
                Manage and organize your leads database
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setListsDialogOpen(true)}
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Lists
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImportDialogOpen(true)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button
                variant="outline"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button
                size="sm"
                onClick={() => setAddDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Lead
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search leads by name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltersOpen(!filtersOpen)}
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all leads"
                      {...(isIndeterminate && { 'data-indeterminate': true })}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Loading leads...
                    </TableCell>
                  </TableRow>
                ) : leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      {searchQuery ? 'No leads found matching your search' : 'No leads yet. Add your first lead to get started!'}
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedLeadIds.has(lead.id)}
                          onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                          aria-label={`Select ${lead.first_name} ${lead.last_name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {lead.first_name} {lead.last_name}
                      </TableCell>
                      <TableCell>
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {lead.email}
                        </a>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {lead.phone}
                      </TableCell>
                      <TableCell>{lead.company || '—'}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getSourceBadgeColor(lead.source)}
                        >
                          {lead.source}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {Array.isArray(lead.tags) && (lead.tags as string[]).slice(0, 2).map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {Array.isArray(lead.tags) && (lead.tags as string[]).length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{(lead.tags as string[]).length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
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
                              className="text-red-600"
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
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddLeadDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />
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
              Are you sure you want to delete this lead? This action cannot be undone.
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

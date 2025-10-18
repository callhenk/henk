'use client';

import { useState } from 'react';
import { Plus, Upload, Download, Filter, Search, MoreVertical, Trash2, Edit, Users, Database } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Input } from '@kit/ui/input';
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

export function LeadsList() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [_filters, _setFilters] = useState<LeadsFiltersType>({});
  const [deleteLeadId, setDeleteLeadId] = useState<string | null>(null);
  const [addToListLead, setAddToListLead] = useState<{ id: string; name: string } | null>(null);

  // Fetch leads from Supabase
  const { data: leads = [], isLoading } = useLeads({
    search: searchQuery,
  });
  const deleteLead = useDeleteLead();

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

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'salesforce':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'hubspot':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'manual':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
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
            <Database className="h-4 w-4 text-muted-foreground" />
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
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Loading leads...
                    </TableCell>
                  </TableRow>
                ) : leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      {searchQuery ? 'No leads found matching your search' : 'No leads yet. Add your first lead to get started!'}
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow key={lead.id}>
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
                              onClick={() => toast.info('Edit coming soon')}
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
      {addToListLead && (
        <AddToListDialog
          open={!!addToListLead}
          onOpenChange={(open) => !open && setAddToListLead(null)}
          leadId={addToListLead.id}
          leadName={addToListLead.name}
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
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Plus, Upload, Download, Filter, Search, MoreVertical, Trash2, Edit, Users } from 'lucide-react';
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

import { useContacts, type ContactsFilters as ContactsFiltersType } from '@kit/supabase/hooks/contacts/use-contacts';
import { useDeleteContact } from '@kit/supabase/hooks/contacts/use-contact-mutations';

import { AddDonorDialog } from './add-donor-dialog';
import { ImportDonorsDialog } from './import-donors-dialog';
import { DonorsFilters } from './donors-filters';

export function DonorsList() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [_filters, _setFilters] = useState<ContactsFiltersType>({});
  const [deleteDonorId, setDeleteDonorId] = useState<string | null>(null);

  // Fetch donors from Supabase
  const { data: donors = [], isLoading } = useContacts({
    search: searchQuery,
  });
  const deleteDonor = useDeleteContact();

  const handleDeleteDonor = async () => {
    if (!deleteDonorId) return;

    try {
      await deleteDonor.mutateAsync(deleteDonorId);
      toast.success('Donor deleted successfully');
      setDeleteDonorId(null);
    } catch {
      toast.error('Failed to delete donor');
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
            <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{donors.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all sources
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">From Salesforce</CardTitle>
            <Badge className={getSourceBadgeColor('salesforce')}>
              SF
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {donors.filter((c) => c.source === 'salesforce').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Synced donors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manual Entries</CardTitle>
            <Badge className={getSourceBadgeColor('manual')}>
              Manual
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {donors.filter((c) => c.source === 'manual').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Added by team
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Donors</CardTitle>
              <CardDescription>
                Manage and organize your donor database
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
                Add Donor
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
                placeholder="Search donors by name, email, or company..."
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
            <DonorsFilters onClose={() => setFiltersOpen(false)} />
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
                      Loading donors...
                    </TableCell>
                  </TableRow>
                ) : donors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      {searchQuery ? 'No donors found matching your search' : 'No donors yet. Add your first donor to get started!'}
                    </TableCell>
                  </TableRow>
                ) : (
                  donors.map((donor) => (
                    <TableRow key={donor.id}>
                      <TableCell className="font-medium">
                        {donor.first_name} {donor.last_name}
                      </TableCell>
                      <TableCell>
                        <a
                          href={`mailto:${donor.email}`}
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {donor.email}
                        </a>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {donor.phone}
                      </TableCell>
                      <TableCell>{donor.company || '—'}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getSourceBadgeColor(donor.source)}
                        >
                          {donor.source}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {Array.isArray(donor.tags) && (donor.tags as string[]).slice(0, 2).map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {Array.isArray(donor.tags) && (donor.tags as string[]).length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{(donor.tags as string[]).length - 2}
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
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Users className="mr-2 h-4 w-4" />
                              Add to List
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => setDeleteDonorId(donor.id)}
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
      <AddDonorDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />
      <ImportDonorsDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteDonorId}
        onOpenChange={(open) => !open && setDeleteDonorId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Donor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this donor? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDonor}
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

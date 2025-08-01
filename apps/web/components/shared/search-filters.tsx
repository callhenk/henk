import { ChevronDown, ChevronUp, Filter, Search, SortAsc } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';

interface SearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  statusOptions?: { value: string; label: string }[];
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOptions?: { value: string; label: string }[];
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  className?: string;
}

const defaultStatusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'draft', label: 'Draft' },
  { value: 'completed', label: 'Completed' },
];

const defaultSortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'status', label: 'Status' },
  { value: 'created', label: 'Created Date' },
  { value: 'updated', label: 'Updated Date' },
];

export function SearchFilters({
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search...',
  statusFilter,
  onStatusFilterChange,
  statusOptions = defaultStatusOptions,
  sortBy,
  onSortByChange,
  sortOptions = defaultSortOptions,
  sortOrder,
  onSortOrderChange,
  className,
}: SearchFiltersProps) {
  return (
    <div
      className={`flex flex-col gap-4 md:flex-row md:items-center md:justify-between ${className || ''}`}
    >
      <div className="relative max-w-md flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="flex w-[200px] items-center">
            <Filter className="mr-2 h-4 w-4 flex-shrink-0" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent align="start">
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="flex w-[200px] items-center">
            <SortAsc className="mr-2 h-4 w-4 flex-shrink-0" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent align="start">
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')
          }
        >
          {sortOrder === 'asc' ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

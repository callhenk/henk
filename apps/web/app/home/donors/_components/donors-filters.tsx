'use client';

import { X } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Card, CardContent } from '@kit/ui/card';
import { Label } from '@kit/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';

interface DonorsFiltersProps {
  onClose: () => void;
}

export function DonorsFilters({ onClose }: DonorsFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Filters</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="filter-source">Source</Label>
            <Select>
              <SelectTrigger id="filter-source">
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                <SelectItem value="salesforce">Salesforce</SelectItem>
                <SelectItem value="hubspot">HubSpot</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="csv">CSV Import</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-tags">Tags</Label>
            <Select>
              <SelectTrigger id="filter-tags">
                <SelectValue placeholder="All tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tags</SelectItem>
                <SelectItem value="major_donor">Major Donor</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="alumni">Alumni</SelectItem>
                <SelectItem value="board_member">Board Member</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-dnc">Do Not Call</Label>
            <Select>
              <SelectTrigger id="filter-dnc">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Do Not Call</SelectItem>
                <SelectItem value="false">Can Call</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-2">
            <Button variant="outline" className="flex-1">
              Clear
            </Button>
            <Button className="flex-1">
              Apply
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

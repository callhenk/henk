'use client';

import { useEffect, useMemo, useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Filter, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';

import type { IntegrationsFiltersState, IntegrationStatus, IntegrationType } from './types';

const TYPE_OPTIONS: Array<{ value: 'all' | IntegrationType; label: string }> = [
  { value: 'all', label: 'All types' },
  { value: 'telephony', label: 'Telephony' },
  { value: 'tts', label: 'TTS' },
  { value: 'nlp', label: 'NLP' },
  { value: 'crm', label: 'CRM' },
  { value: 'email', label: 'Email' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'payments', label: 'Payments' },
  { value: 'storage', label: 'Storage' },
  { value: 'captcha', label: 'Captcha' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS: Array<{ value: 'all' | IntegrationStatus; label: string }> = [
  { value: 'all', label: 'All status' },
  { value: 'connected', label: 'Connected' },
  { value: 'disconnected', label: 'Disconnected' },
  { value: 'needs_attention', label: 'Needs attention' },
  { value: 'error', label: 'Error' },
  { value: 'deprecated', label: 'Deprecated' },
];

const SORT_OPTIONS: Array<{ value: IntegrationsFiltersState['sortBy']; label: string }> = [
  { value: 'name', label: 'Name' },
  { value: 'last_sync_at', label: 'Last sync' },
  { value: 'status', label: 'Status' },
];

export function useQueryFilters(): [IntegrationsFiltersState, (next: Partial<IntegrationsFiltersState>) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const state: IntegrationsFiltersState = useMemo(
    () => ({
      search: searchParams.get('search') ?? '',
      type: (searchParams.get('type') as IntegrationsFiltersState['type']) ?? 'all',
      status: (searchParams.get('status') as IntegrationsFiltersState['status']) ?? 'all',
      sortBy: (searchParams.get('sortBy') as IntegrationsFiltersState['sortBy']) ?? 'name',
      sortOrder: (searchParams.get('sortOrder') as IntegrationsFiltersState['sortOrder']) ?? 'asc',
    }),
    [searchParams],
  );

  const setState = (next: Partial<IntegrationsFiltersState>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '' || v === 'all') params.delete(k);
      else params.set(k, String(v));
    });
    router.replace(`${pathname}?${params.toString()}`);
  };

  return [state, setState];
}

export function IntegrationsFilters({
  value,
  onChange,
}: {
  value: IntegrationsFiltersState;
  onChange: (next: Partial<IntegrationsFiltersState>) => void;
}) {
  const [searchTerm, setSearchTerm] = useState(value.search);

  useEffect(() => setSearchTerm(value.search), [value.search]);

  useEffect(() => {
    const id = setTimeout(() => {
      if (searchTerm !== value.search) onChange({ search: searchTerm });
    }, 300);
    return () => clearTimeout(id);
  }, [searchTerm]);

  return (
    <Card className={'glass-panel'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Filter className="h-4 w-4" /> Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="text-muted-foreground pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                id="search"
                placeholder="Search by name or description"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={value.type} onValueChange={(v) => onChange({ type: v as IntegrationsFiltersState['type'] })}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={value.status} onValueChange={(v) => onChange({ status: v as IntegrationsFiltersState['status'] })}>
              <SelectTrigger>
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Sort by</Label>
              <Select value={value.sortBy} onValueChange={(v) => onChange({ sortBy: v as IntegrationsFiltersState['sortBy'] })}>
                <SelectTrigger>
                  <SelectValue placeholder="Name" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Order</Label>
              <Select value={value.sortOrder} onValueChange={(v) => onChange({ sortOrder: v as IntegrationsFiltersState['sortOrder'] })}>
                <SelectTrigger>
                  <SelectValue placeholder="Asc" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



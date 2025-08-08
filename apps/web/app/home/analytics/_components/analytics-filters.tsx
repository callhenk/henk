'use client';

import { Calendar, Filter } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';

interface AnalyticsFiltersProps {
  filters: {
    campaignId?: string;
    agentId?: string;
    outcomeType?: 'pledged' | 'callback' | 'not_interested';
    dateRange: {
      startDate: Date;
      endDate: Date;
      preset?: '7d' | '30d' | '90d' | 'thisMonth' | 'custom';
    };
  };
  onFiltersChange: (filters: AnalyticsFiltersProps['filters']) => void;
}

// Mock data - replace with actual API calls
const mockCampaigns = [
  { id: '1', name: 'Summer Fundraiser 2024' },
  { id: '2', name: 'Holiday Campaign' },
  { id: '3', name: 'Emergency Relief' },
];

const mockAgents = [
  { id: '1', name: 'Sarah Johnson' },
  { id: '2', name: 'Mike Chen' },
  { id: '3', name: 'Emma Davis' },
];

const datePresets = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'custom', label: 'Custom Range' },
];

export function AnalyticsFilters({
  filters,
  onFiltersChange,
}: AnalyticsFiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' ? undefined : value,
    });
  };

  const handleDatePresetChange = (preset: string) => {
    const now = new Date();
    let startDate = new Date();

    switch (preset) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        return; // Custom range handled separately
    }

    onFiltersChange({
      ...filters,
      dateRange: {
        startDate,
        endDate: now,
        preset: preset as '7d' | '30d' | '90d' | 'thisMonth' | 'custom',
      },
    });
  };

  return (
    <Card className={'glass-panel'}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <CardTitle className="text-lg">Filters</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Campaign Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Campaign</label>
            <Select
              value={filters.campaignId || 'all'}
              onValueChange={(value) => handleFilterChange('campaignId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All campaigns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All campaigns</SelectItem>
                {mockCampaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Agent Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Agent</label>
            <Select
              value={filters.agentId || 'all'}
              onValueChange={(value) => handleFilterChange('agentId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All agents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All agents</SelectItem>
                {mockAgents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Outcome Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Outcome</label>
            <Select
              value={filters.outcomeType || 'all'}
              onValueChange={(value) =>
                handleFilterChange('outcomeType', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All outcomes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All outcomes</SelectItem>
                <SelectItem value="pledged">Pledged</SelectItem>
                <SelectItem value="callback">Callback Requested</SelectItem>
                <SelectItem value="not_interested">Not Interested</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Select
              value={filters.dateRange.preset || '7d'}
              onValueChange={handleDatePresetChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {datePresets.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date Range Display */}
        <div className="text-muted-foreground mt-4 flex items-center space-x-2 text-sm">
          <Calendar className="h-4 w-4" />
          <span>
            {filters.dateRange.startDate.toLocaleDateString()} -{' '}
            {filters.dateRange.endDate.toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

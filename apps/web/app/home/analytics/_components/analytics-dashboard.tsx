'use client';

import { useState } from 'react';

import { AgentComparisonChart } from './agent-comparison-chart';
import { AnalyticsFilters } from './analytics-filters';
import { AnalyticsMetrics } from './analytics-metrics';
import { ExportControls } from './export-controls';
import { PerformanceChart } from './performance-chart';
import { TimeOfDayChart } from './time-of-day-chart';

interface AnalyticsFilters {
  campaignId?: string;
  agentId?: string;
  outcomeType?: 'pledged' | 'callback' | 'not_interested';
  dateRange: {
    startDate: Date;
    endDate: Date;
    preset?: '7d' | '30d' | '90d' | 'thisMonth' | 'custom';
  };
}

export function AnalyticsDashboard() {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      endDate: new Date(),
      preset: '7d',
    },
  });

  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'calls',
    'conversions',
    'revenue',
  ]);

  return (
    <div className="space-y-6">
      {/* Analytics Filters */}
      <AnalyticsFilters filters={filters} onFiltersChange={setFilters} />

      {/* Analytics Metrics */}
      <AnalyticsMetrics filters={filters} />

      {/* Performance Chart */}
      <PerformanceChart
        filters={filters}
        selectedMetrics={selectedMetrics}
        onMetricsChange={setSelectedMetrics}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <TimeOfDayChart filters={filters} />
        <AgentComparisonChart filters={filters} />
      </div>

      {/* Export Controls */}
      <ExportControls filters={filters} />
    </div>
  );
}

'use client';

import {
  BarChart3,
  Clock,
  DollarSign,
  Phone,
  TrendingUp,
  Users,
} from 'lucide-react';

import { StatsCard } from '~/components/shared';

interface AnalyticsMetricsProps {
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
}

// Mock data - replace with actual API call
const mockMetrics = {
  totalCalls: 1247,
  successfulCalls: 342,
  conversionRate: 27.4,
  revenueGenerated: 28470,
  averageCallDuration: 4.2,
  topPerformingAgent: 'Sarah Johnson',
};

export function AnalyticsMetrics({ filters }: AnalyticsMetricsProps) {
  // In a real implementation, you would fetch this data based on filters
  const metrics = mockMetrics;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatsCard
        title="Total Calls"
        value={metrics.totalCalls.toLocaleString()}
        subtitle="All campaigns"
        icon={Phone}
        trend={{
          icon: TrendingUp,
          value: '+12%',
          color: 'text-green-600',
        }}
      />
      <StatsCard
        title="Successful Calls"
        value={metrics.successfulCalls.toLocaleString()}
        subtitle="With pledges"
        icon={TrendingUp}
        trend={{
          icon: TrendingUp,
          value: '+8%',
          color: 'text-green-600',
        }}
      />
      <StatsCard
        title="Conversion Rate"
        value={`${metrics.conversionRate}%`}
        subtitle="Success rate"
        icon={BarChart3}
        trend={{
          icon: TrendingUp,
          value: '+2.1%',
          color: 'text-green-600',
        }}
      />
      <StatsCard
        title="Revenue Generated"
        value={`$${metrics.revenueGenerated.toLocaleString()}`}
        subtitle="Total pledged"
        icon={DollarSign}
        trend={{
          icon: TrendingUp,
          value: '+15%',
          color: 'text-green-600',
        }}
      />
      <StatsCard
        title="Avg Call Duration"
        value={`${metrics.averageCallDuration}m`}
        subtitle="Per call"
        icon={Clock}
        trend={{
          icon: TrendingUp,
          value: '-0.3m',
          color: 'text-red-600',
        }}
      />
      <StatsCard
        title="Top Agent"
        value={metrics.topPerformingAgent}
        subtitle="Highest conversions"
        icon={Users}
        trend={{
          icon: TrendingUp,
          value: '32%',
          color: 'text-green-600',
        }}
      />
    </div>
  );
}

'use client';

import { BarChart3, DollarSign, Phone, TrendingUp } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';

interface PerformanceChartProps {
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
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
}

// Mock data - replace with actual API call
const mockPerformanceData = [
  { date: '2024-01-01', calls: 45, conversions: 12, revenue: 1200 },
  { date: '2024-01-02', calls: 52, conversions: 15, revenue: 1800 },
  { date: '2024-01-03', calls: 38, conversions: 8, revenue: 950 },
  { date: '2024-01-04', calls: 61, conversions: 18, revenue: 2200 },
  { date: '2024-01-05', calls: 47, conversions: 13, revenue: 1600 },
  { date: '2024-01-06', calls: 55, conversions: 16, revenue: 1900 },
  { date: '2024-01-07', calls: 42, conversions: 11, revenue: 1400 },
];

const metricOptions = [
  { key: 'calls', label: 'Calls', icon: Phone, color: 'text-blue-500' },
  {
    key: 'conversions',
    label: 'Conversions',
    icon: TrendingUp,
    color: 'text-green-500',
  },
  {
    key: 'revenue',
    label: 'Revenue',
    icon: DollarSign,
    color: 'text-purple-500',
  },
];

export function PerformanceChart({
  filters,
  selectedMetrics,
  onMetricsChange,
}: PerformanceChartProps) {
  const toggleMetric = (metric: string) => {
    if (selectedMetrics.includes(metric)) {
      onMetricsChange(selectedMetrics.filter((m) => m !== metric));
    } else {
      onMetricsChange([...selectedMetrics, metric]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <CardTitle>Campaign Performance</CardTitle>
          </div>
          <div className="flex space-x-2">
            {metricOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedMetrics.includes(option.key);
              return (
                <Button
                  key={option.key}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleMetric(option.key)}
                  className={`flex items-center space-x-1 ${
                    isSelected ? option.color : ''
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{option.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/50 flex h-64 items-center justify-center rounded-lg border">
          <div className="space-y-2 text-center">
            <BarChart3 className="text-muted-foreground mx-auto h-12 w-12" />
            <p className="text-muted-foreground text-sm">
              Performance chart will be implemented with chart library
            </p>
            <p className="text-muted-foreground text-xs">
              Selected metrics: {selectedMetrics.join(', ')}
            </p>
          </div>
        </div>

        {/* Mock data display */}
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Sample Data:</h4>
          <div className="grid gap-2 text-xs">
            {mockPerformanceData.slice(0, 3).map((data, index) => (
              <div
                key={index}
                className="bg-muted flex justify-between rounded p-2"
              >
                <span>{data.date}</span>
                <span>Calls: {data.calls}</span>
                <span>Conversions: {data.conversions}</span>
                <span>Revenue: ${data.revenue}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

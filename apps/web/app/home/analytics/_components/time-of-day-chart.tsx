'use client';

import { Clock } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';

interface TimeOfDayChartProps {
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
const mockTimeOfDayData = [
  { hour: 9, calls: 45, conversions: 12, conversionRate: 26.7 },
  { hour: 10, calls: 67, conversions: 18, conversionRate: 26.9 },
  { hour: 11, calls: 89, conversions: 25, conversionRate: 28.1 },
  { hour: 12, calls: 78, conversions: 20, conversionRate: 25.6 },
  { hour: 13, calls: 92, conversions: 28, conversionRate: 30.4 },
  { hour: 14, calls: 85, conversions: 24, conversionRate: 28.2 },
  { hour: 15, calls: 76, conversions: 21, conversionRate: 27.6 },
  { hour: 16, calls: 68, conversions: 19, conversionRate: 27.9 },
  { hour: 17, calls: 54, conversions: 15, conversionRate: 27.8 },
  { hour: 18, calls: 42, conversions: 11, conversionRate: 26.2 },
  { hour: 19, calls: 38, conversions: 9, conversionRate: 23.7 },
  { hour: 20, calls: 31, conversions: 7, conversionRate: 22.6 },
];

export function TimeOfDayChart({ filters: _filters }: TimeOfDayChartProps) {
  const getConversionColor = (rate: number) => {
    if (rate >= 30) return 'bg-green-600';
    if (rate >= 25) return 'bg-green-500';
    if (rate >= 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <CardTitle>Conversion by Time of Day</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Heatmap */}
          <div className="grid grid-cols-12 gap-1">
            {mockTimeOfDayData.map((data) => (
              <div
                key={data.hour}
                className={`flex aspect-square items-center justify-center rounded text-xs font-medium text-white ${getConversionColor(
                  data.conversionRate,
                )}`}
                title={`${formatHour(data.hour)}: ${data.conversionRate.toFixed(1)}% conversion rate`}
              >
                {data.conversionRate.toFixed(0)}%
              </div>
            ))}
          </div>

          {/* Hour labels */}
          <div className="text-muted-foreground grid grid-cols-12 gap-1 text-xs">
            {mockTimeOfDayData.map((data) => (
              <div key={data.hour} className="text-center">
                {formatHour(data.hour)}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="h-3 w-3 rounded bg-green-600"></div>
              <span>High (≥30%)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-3 w-3 rounded bg-green-500"></div>
              <span>Good (25-30%)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-3 w-3 rounded bg-yellow-500"></div>
              <span>Fair (20-25%)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-3 w-3 rounded bg-red-500"></div>
              <span>Low (&lt;20%)</span>
            </div>
          </div>

          {/* Insights */}
          <div className="mt-4 rounded-lg bg-blue-50 p-3">
            <h4 className="mb-1 text-sm font-medium text-blue-900">Insight</h4>
            <p className="text-xs text-blue-700">
              Best calling hours: 1-2 PM with 30.4% conversion rate. Avoid late
              evening calls (7-8 PM) with lower success rates.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

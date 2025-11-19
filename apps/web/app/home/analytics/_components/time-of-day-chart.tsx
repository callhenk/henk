'use client';

import { useMemo } from 'react';

import { Clock } from 'lucide-react';

import { useConversations } from '@kit/supabase/hooks/conversations/use-conversations';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';

import { useDemoMode } from '~/lib/demo-mode-context';

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

export function TimeOfDayChart({ filters }: TimeOfDayChartProps) {
  const { isDemoMode, mockConversations } = useDemoMode();
  const { data: realConversationsResult } = useConversations();

  // Use demo data if demo mode is active
  const realConversations = realConversationsResult?.data ?? [];
  const conversations = isDemoMode ? mockConversations : realConversations;

  // Calculate time-of-day data based on real conversations
  const timeOfDayData = useMemo(() => {
    // Filter conversations based on date range and other filters
    const filteredConversations = conversations.filter((conv) => {
      if (!conv.created_at) return false;
      const convDate = new Date(conv.created_at);
      const inDateRange =
        convDate >= filters.dateRange.startDate &&
        convDate <= filters.dateRange.endDate;

      if (!inDateRange) return false;

      if (filters.campaignId && conv.campaign_id !== filters.campaignId)
        return false;
      if (filters.agentId && conv.agent_id !== filters.agentId) return false;
      if (filters.outcomeType && conv.outcome !== filters.outcomeType)
        return false;

      return true;
    });

    // Group conversations by hour
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourConversations = filteredConversations.filter((conv) => {
        if (!conv.created_at) return false;
        const convHour = new Date(conv.created_at).getHours();
        return convHour === hour;
      });

      const totalCalls = hourConversations.length;
      const conversions = hourConversations.filter(
        (conv) => conv.outcome === 'donated' || conv.status === 'completed',
      ).length;

      const conversionRate =
        totalCalls > 0 ? (conversions / totalCalls) * 100 : 0;

      return {
        hour,
        calls: totalCalls,
        conversions,
        conversionRate,
      };
    });

    return hourlyData;
  }, [conversations, filters]);

  const getConversionColor = (rate: number) => {
    if (rate >= 30) return 'bg-green-600';
    if (rate >= 25) return 'bg-green-500';
    if (rate >= 20) return 'bg-yellow-500';
    if (rate > 0) return 'bg-red-500';
    return 'bg-gray-300'; // No data
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  // Find best and worst hours
  const bestHour = timeOfDayData.reduce((best, current) =>
    current.conversionRate > best.conversionRate ? current : best,
  );

  const worstHour = timeOfDayData
    .filter((hour) => hour.calls > 0)
    .reduce(
      (worst, current) =>
        current.conversionRate < worst.conversionRate ? current : worst,
      { hour: 0, calls: 0, conversions: 0, conversionRate: 100 },
    );

  // Calculate overall insights
  const totalCalls = timeOfDayData.reduce((sum, hour) => sum + hour.calls, 0);
  const totalConversions = timeOfDayData.reduce(
    (sum, hour) => sum + hour.conversions,
    0,
  );
  const overallConversionRate =
    totalCalls > 0 ? (totalConversions / totalCalls) * 100 : 0;

  return (
    <Card className={'glass-panel'}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <CardTitle>Conversion by Time of Day</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {totalCalls === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-muted-foreground text-sm">
              No data available for the selected filters
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Heatmap */}
            <div className="grid grid-cols-12 gap-1">
              {timeOfDayData.map((data) => (
                <div
                  key={data.hour}
                  className={`flex aspect-square items-center justify-center rounded text-xs font-medium text-white ${getConversionColor(
                    data.conversionRate,
                  )}`}
                  title={`${formatHour(data.hour)}: ${data.conversionRate.toFixed(1)}% conversion rate (${data.calls} calls)`}
                >
                  {data.conversionRate > 0
                    ? `${data.conversionRate.toFixed(0)}%`
                    : '-'}
                </div>
              ))}
            </div>

            {/* Hour labels */}
            <div className="text-muted-foreground grid grid-cols-12 gap-1 text-xs">
              {timeOfDayData.map((data) => (
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
              <div className="flex items-center space-x-1">
                <div className="h-3 w-3 rounded bg-gray-300"></div>
                <span>No data</span>
              </div>
            </div>

            {/* Insights */}
            <div className="mt-4 rounded-lg bg-blue-50 p-3">
              <h4 className="mb-1 text-sm font-medium text-blue-900">
                Insights
              </h4>
              <div className="space-y-1 text-xs text-blue-700">
                <p>
                  Overall conversion rate: {overallConversionRate.toFixed(1)}% (
                  {totalConversions} conversions from {totalCalls} calls)
                </p>
                {bestHour.calls > 0 && (
                  <p>
                    Best calling hour: {formatHour(bestHour.hour)} with{' '}
                    {bestHour.conversionRate.toFixed(1)}% conversion rate
                  </p>
                )}
                {worstHour.calls > 0 && worstHour.hour !== bestHour.hour && (
                  <p>
                    Avoid calling at: {formatHour(worstHour.hour)} with{' '}
                    {worstHour.conversionRate.toFixed(1)}% conversion rate
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

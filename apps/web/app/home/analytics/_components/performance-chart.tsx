'use client';

import { useMemo } from 'react';

import { BarChart3, DollarSign, Phone, TrendingUp } from 'lucide-react';

import { useConversations } from '@kit/supabase/hooks/conversations/use-conversations';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';

import { useDemoMode } from '~/lib/demo-mode-context';

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

const metricOptions = [
  {
    key: 'calls',
    label: 'Calls',
    icon: Phone,
    selectedClass: 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500',
    unselectedClass: 'border-blue-200 text-blue-600 hover:bg-blue-50',
  },
  {
    key: 'conversions',
    label: 'Conversions',
    icon: TrendingUp,
    selectedClass:
      'bg-green-500 hover:bg-green-600 text-white border-green-500',
    unselectedClass: 'border-green-200 text-green-600 hover:bg-green-50',
  },
  {
    key: 'revenue',
    label: 'Revenue',
    icon: DollarSign,
    selectedClass:
      'bg-purple-500 hover:bg-purple-600 text-white border-purple-500',
    unselectedClass: 'border-purple-200 text-purple-600 hover:bg-purple-50',
  },
];

export function PerformanceChart({
  filters,
  selectedMetrics,
  onMetricsChange,
}: PerformanceChartProps) {
  const { isDemoMode, mockConversations } = useDemoMode();
  const { data: realConversations = [] } = useConversations();

  // Use demo data if demo mode is active
  const conversations = useMemo(
    () => (isDemoMode ? mockConversations : realConversations),
    [isDemoMode, mockConversations, realConversations],
  );

  // Generate performance data based on real conversations
  const performanceData = useMemo(() => {
    // Filter conversations based on date range and other filters
    const filteredConversations = conversations.filter((conv) => {
      if (!conv.created_at) return false;
      const convDate = new Date(conv.created_at!);
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

    // Group conversations by date
    const groupedByDate = filteredConversations.reduce(
      (
        acc: Record<
          string,
          { calls: number; conversions: number; revenue: number }
        >,
        conv,
      ) => {
        const date = new Date(conv.created_at!).toISOString().split('T')[0];
        if (!date) return acc;

        if (!acc[date]) {
          acc[date] = {
            calls: 0,
            conversions: 0,
            revenue: 0,
          };
        }

        acc[date]!.calls += 1;

        if (conv.outcome === 'donated' || conv.status === 'completed') {
          acc[date]!.conversions += 1;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        acc[date]!.revenue += (conv as any).donated_amount || 0;

        return acc;
      },
      {} as Record<
        string,
        { calls: number; conversions: number; revenue: number }
      >,
    );

    // Convert to array and sort by date
    return Object.entries(groupedByDate)
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [conversations, filters]);

  const toggleMetric = (metric: string) => {
    if (selectedMetrics.includes(metric)) {
      onMetricsChange(selectedMetrics.filter((m) => m !== metric));
    } else {
      onMetricsChange([...selectedMetrics, metric]);
    }
  };

  // Calculate totals for display
  const totals = useMemo(() => {
    return performanceData.reduce(
      (acc, data) => ({
        calls: acc.calls + data.calls,
        conversions: acc.conversions + data.conversions,
        revenue: acc.revenue + data.revenue,
      }),
      { calls: 0, conversions: 0, revenue: 0 },
    );
  }, [performanceData]);

  return (
    <Card className={'glass-panel'}>
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
                  variant="outline"
                  size="sm"
                  onClick={() => toggleMetric(option.key)}
                  className={`flex items-center space-x-1 transition-all duration-200 ${
                    isSelected ? option.selectedClass : option.unselectedClass
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
        {performanceData.length === 0 ? (
          <div className="bg-muted/50 flex h-64 items-center justify-center rounded-lg border">
            <div className="space-y-2 text-center">
              <BarChart3 className="text-muted-foreground mx-auto h-12 w-12" />
              <p className="text-muted-foreground text-sm">
                No data available for the selected filters
              </p>
              <p className="text-muted-foreground text-xs">
                Try adjusting your date range or filters
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-muted/20 rounded-lg border p-4">
              <div className="flex h-64 items-end justify-between space-x-1">
                {performanceData.slice(-7).map((data, index) => {
                  // Calculate max value for each selected metric
                  const maxCalls = Math.max(
                    ...performanceData.map((d) => d.calls),
                  );
                  const maxConversions = Math.max(
                    ...performanceData.map((d) => d.conversions),
                  );
                  const maxRevenue = Math.max(
                    ...performanceData.map((d) => d.revenue),
                  );

                  return (
                    <div
                      key={index}
                      className="flex flex-1 flex-col items-center"
                    >
                      <div className="flex h-48 items-end justify-center space-x-0.5">
                        {selectedMetrics.includes('calls') && (
                          <div className="flex flex-col items-center">
                            <div
                              className="min-h-[4px] w-4 rounded-t-sm bg-blue-500 transition-all duration-300"
                              style={{
                                height: `${Math.max((data.calls / maxCalls) * 180, 4)}px`,
                              }}
                              title={`${data.calls} calls on ${new Date(data.date).toLocaleDateString()}`}
                            />
                          </div>
                        )}
                        {selectedMetrics.includes('conversions') && (
                          <div className="flex flex-col items-center">
                            <div
                              className="min-h-[4px] w-4 rounded-t-sm bg-green-500 transition-all duration-300"
                              style={{
                                height: `${Math.max((data.conversions / maxConversions) * 180, 4)}px`,
                              }}
                              title={`${data.conversions} conversions on ${new Date(data.date).toLocaleDateString()}`}
                            />
                          </div>
                        )}
                        {selectedMetrics.includes('revenue') && (
                          <div className="flex flex-col items-center">
                            <div
                              className="min-h-[4px] w-4 rounded-t-sm bg-purple-500 transition-all duration-300"
                              style={{
                                height: `${Math.max((data.revenue / maxRevenue) * 180, 4)}px`,
                              }}
                              title={`$${data.revenue} revenue on ${new Date(data.date).toLocaleDateString()}`}
                            />
                          </div>
                        )}
                      </div>
                      <div className="text-muted-foreground mt-2 text-center text-xs">
                        {new Date(data.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 flex justify-center space-x-6 text-xs">
                {selectedMetrics.includes('calls') && (
                  <div className="flex items-center space-x-1">
                    <div className="h-3 w-3 rounded bg-blue-500"></div>
                    <span>Calls</span>
                  </div>
                )}
                {selectedMetrics.includes('conversions') && (
                  <div className="flex items-center space-x-1">
                    <div className="h-3 w-3 rounded bg-green-500"></div>
                    <span>Conversions</span>
                  </div>
                )}
                {selectedMetrics.includes('revenue') && (
                  <div className="flex items-center space-x-1">
                    <div className="h-3 w-3 rounded bg-purple-500"></div>
                    <span>Revenue</span>
                  </div>
                )}
              </div>
            </div>

            {/* Real data display */}
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Performance Data:</h4>
              <div className="grid gap-2 text-xs">
                {performanceData.slice(0, 5).map((data, index) => (
                  <div
                    key={index}
                    className="bg-muted flex justify-between rounded p-2"
                  >
                    <span>{new Date(data.date).toLocaleDateString()}</span>
                    <span>Calls: {data.calls}</span>
                    <span>Conversions: {data.conversions}</span>
                    <span>Revenue: ${data.revenue}</span>
                  </div>
                ))}
                {performanceData.length > 5 && (
                  <div className="text-muted-foreground text-center text-xs">
                    ... and {performanceData.length - 5} more days
                  </div>
                )}
              </div>

              {/* Summary totals */}
              <div className="bg-muted/30 mt-4 grid grid-cols-3 gap-4 rounded-lg border p-3">
                <div className="text-center">
                  <div className="text-lg font-semibold">{totals.calls}</div>
                  <div className="text-muted-foreground text-xs">
                    Total Calls
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {totals.conversions}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Total Conversions
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    ${totals.revenue.toLocaleString()}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Total Revenue
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

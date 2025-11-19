'use client';

import { useMemo } from 'react';

import { PieChart } from 'lucide-react';
import {
  Cell,
  Pie,
  PieChart as RechartsPie,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import type { Tables } from '@kit/supabase/database';
import { useConversations } from '@kit/supabase/hooks/conversations/use-conversations';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Skeleton } from '@kit/ui/skeleton';

import { useDemoMode } from '~/lib/demo-mode-context';

type Conversation = Tables<'conversations'>;

interface OutcomeDistributionChartProps {
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

const OUTCOME_COLORS = {
  donated: '#10b981', // green
  callback: '#f59e0b', // amber
  not_interested: '#ef4444', // red
  no_answer: '#6b7280', // gray
  voicemail: '#8b5cf6', // purple
  other: '#64748b', // slate
};

export function OutcomeDistributionChart({
  filters,
}: OutcomeDistributionChartProps) {
  const { isDemoMode, mockConversations } = useDemoMode();
  const { data: realConversations = [], isLoading, error } = useConversations();

  // Use demo data if demo mode is active
  const conversations = isDemoMode ? mockConversations : realConversations;

  // Calculate outcome distribution
  const outcomeData = useMemo(() => {
    // Ensure conversations is an array
    const conversationArray: Conversation[] = Array.isArray(conversations)
      ? conversations
      : ((conversations as { data?: Conversation[] })?.data ?? []);

    const filteredConversations = conversationArray.filter((conv) => {
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

    // Group by outcome
    const outcomeGroups = filteredConversations.reduce(
      (acc: Record<string, number>, conv) => {
        const outcome = conv.outcome || 'other';
        acc[outcome] = (acc[outcome] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Convert to array format for Recharts
    return Object.entries(outcomeGroups)
      .map(([outcome, count]) => ({
        name:
          outcome.charAt(0).toUpperCase() + outcome.slice(1).replace(/_/g, ' '),
        value: count as number,
        percentage:
          filteredConversations.length > 0
            ? (
                ((count as number) / filteredConversations.length) *
                100
              ).toFixed(1)
            : '0',
        color:
          OUTCOME_COLORS[outcome as keyof typeof OUTCOME_COLORS] ||
          OUTCOME_COLORS.other,
      }))
      .sort((a, b) => (b.value as number) - (a.value as number));
  }, [conversations, filters]);

  const totalCalls = outcomeData.reduce(
    (sum, item) => sum + (item.value as number),
    0,
  );

  return (
    <Card className="glass-panel">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <PieChart className="h-5 w-5" />
          <CardTitle>Call Outcomes Distribution</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {!isDemoMode && error ? (
          <div className="flex h-64 items-center justify-center rounded-lg border border-red-200 bg-red-50">
            <div className="space-y-2 text-center">
              <PieChart className="mx-auto h-8 w-8 text-red-600" />
              <p className="text-sm text-red-900">Error loading outcome data</p>
              <p className="text-xs text-red-700">
                Please try refreshing the page
              </p>
            </div>
          </div>
        ) : !isDemoMode && isLoading ? (
          <div className="space-y-4">
            <Skeleton className="mx-auto h-64 w-64 rounded-full" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        ) : outcomeData.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground text-sm">
              No outcome data available for the selected filters
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pie Chart */}
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={outcomeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {outcomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0]?.payload;
                      return (
                        <div className="rounded-lg border bg-white p-3 shadow-lg">
                          <p className="font-medium">{data.name}</p>
                          <p className="text-sm text-gray-600">
                            Calls: {data.value}
                          </p>
                          <p className="text-sm text-gray-600">
                            Percentage: {data.percentage}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RechartsPie>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="space-y-2">
              {outcomeData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-2"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="h-4 w-4 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-muted-foreground">
                      {item.value as number} calls
                    </span>
                    <span className="font-medium">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-muted/30 rounded-lg border p-3 text-center">
              <div className="text-lg font-semibold">{totalCalls}</div>
              <div className="text-muted-foreground text-xs">Total Calls</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

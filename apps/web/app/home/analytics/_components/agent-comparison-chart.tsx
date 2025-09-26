'use client';

import { useMemo, useState } from 'react';

import { Clock, DollarSign, TrendingUp, Users } from 'lucide-react';

import { useAgents } from '@kit/supabase/hooks/agents/use-agents';
import { useConversations } from '@kit/supabase/hooks/conversations/use-conversations';

import { useDemoMode } from '~/lib/demo-mode-context';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';

interface AgentComparisonChartProps {
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

const sortOptions = [
  { value: 'conversionRate', label: 'Conversion Rate', icon: TrendingUp },
  { value: 'totalCalls', label: 'Total Calls', icon: Users },
  { value: 'revenue', label: 'Revenue', icon: DollarSign },
  { value: 'averageCallDuration', label: 'Call Duration', icon: Clock },
];

export function AgentComparisonChart({ filters }: AgentComparisonChartProps) {
  const { isDemoMode, mockConversations, mockAgents } = useDemoMode();
  const { data: realConversations = [] } = useConversations();
  const { data: realAgents = [] } = useAgents();
  const [sortBy, setSortBy] = useState('conversionRate');

  // Use demo data if demo mode is active
  const conversations = isDemoMode ? mockConversations : realConversations;
  const agents = isDemoMode ? mockAgents : realAgents;

  // Calculate agent performance data based on real conversations
  const agentPerformanceData = useMemo(() => {
    // Filter conversations based on date range and other filters
    const filteredConversations = conversations.filter((conv: any) => {
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

    // Calculate performance for each agent
    return agents
      .map((agent) => {
        const agentConversations = filteredConversations.filter(
          (conv) => conv.agent_id === agent.id,
        );
        const totalCalls = agentConversations.length;
        const conversions = agentConversations.filter(
          (conv) => conv.outcome === 'donated' || conv.status === 'completed',
        ).length;

        const conversionRate =
          totalCalls > 0 ? (conversions / totalCalls) * 100 : 0;

        const totalDuration = agentConversations.reduce(
          (sum, conv) => sum + (conv.duration_seconds || 0),
          0,
        );
        const averageCallDuration =
          totalCalls > 0
            ? Math.round((totalDuration / totalCalls / 60) * 10) / 10
            : 0;

        const revenue = agentConversations.reduce(
          (sum, conv) => sum + ((conv as any).donated_amount || 0),
          0,
        );

        return {
          agentId: agent.id,
          agentName: agent.name,
          totalCalls,
          conversions,
          conversionRate,
          averageCallDuration,
          revenue,
        };
      })
      .filter((agent) => agent.totalCalls > 0); // Only show agents with calls
  }, [conversations, agents, filters]);

  // Sort agents based on selected metric
  const sortedAgents = useMemo(() => {
    return [...agentPerformanceData].sort((a, b) => {
      switch (sortBy) {
        case 'conversionRate':
          return b.conversionRate - a.conversionRate;
        case 'totalCalls':
          return b.totalCalls - a.totalCalls;
        case 'revenue':
          return b.revenue - a.revenue;
        case 'averageCallDuration':
          return b.averageCallDuration - a.averageCallDuration;
        default:
          return b.conversionRate - a.conversionRate;
      }
    });
  }, [agentPerformanceData, sortBy]);

  return (
    <Card className={'glass-panel'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <CardTitle>Agent Performance</CardTitle>
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {sortedAgents.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-muted-foreground text-sm">
              No agent data available for the selected filters
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedAgents.map((agent, index) => (
              <div key={agent.agentId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{agent.agentName}</div>
                      <div className="text-muted-foreground text-sm">
                        {agent.totalCalls} calls • {agent.conversions}{' '}
                        conversions
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {agent.conversionRate.toFixed(1)}%
                    </div>
                    <div className="text-muted-foreground text-sm">
                      ${agent.revenue.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="bg-muted h-2 w-full rounded-full">
                  <div
                    className="h-2 rounded-full bg-green-600 transition-all duration-300"
                    style={{
                      width: `${Math.min((agent.conversionRate / 30) * 100, 100)}%`,
                    }}
                  ></div>
                </div>

                {/* Additional metrics */}
                <div className="text-muted-foreground grid grid-cols-3 gap-4 text-xs">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{agent.averageCallDuration}m avg</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{agent.conversions} conv.</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-3 w-3" />
                    <span>
                      $
                      {agent.conversions > 0
                        ? (agent.revenue / agent.conversions).toFixed(0)
                        : 0}
                      /conv.
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Summary */}
            {sortedAgents.length > 0 && sortedAgents[0] && (
              <div className="mt-6 rounded-lg bg-green-50 p-3">
                <h4 className="mb-1 text-sm font-medium text-green-900">
                  Top Performer
                </h4>
                <p className="text-xs text-green-700">
                  {sortedAgents[0].agentName} leads with{' '}
                  {sortedAgents[0].conversionRate.toFixed(1)}% conversion rate
                  and ${sortedAgents[0].revenue.toLocaleString()} in revenue.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

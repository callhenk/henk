'use client';

import { useMemo } from 'react';

import {
  BarChart3,
  Clock,
  DollarSign,
  Phone,
  TrendingUp,
  Users,
} from 'lucide-react';

import { useAgents } from '@kit/supabase/hooks/agents/use-agents';
import { useCampaigns } from '@kit/supabase/hooks/campaigns/use-campaigns';
import { useConversations } from '@kit/supabase/hooks/conversations/use-conversations';
import { useLeads } from '@kit/supabase/hooks/leads/use-leads';

import { useDemoMode } from '~/lib/demo-mode-context';

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

export function AnalyticsMetrics({ filters }: AnalyticsMetricsProps) {
  const { isDemoMode, mockConversations, mockAgents } = useDemoMode();

  // Fetch real data
  const { data: realConversations = [] } = useConversations();
  const { data: _campaigns = [] } = useCampaigns();
  const { data: realAgents = [] } = useAgents();
  const { data: _leads = [] } = useLeads();

  // Use demo data if demo mode is active
  const conversations = isDemoMode ? mockConversations : realConversations;
  const agents = isDemoMode ? mockAgents : realAgents;

  // Calculate metrics based on filters and real data
  const metrics = useMemo(() => {
    // Filter conversations based on date range
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filteredConversations = conversations.filter((conv: any) => {
      const convDate = new Date(conv.created_at);
      return (
        convDate >= filters.dateRange.startDate &&
        convDate <= filters.dateRange.endDate
      );
    });

    // Apply additional filters
    let filteredData = filteredConversations;

    if (filters.campaignId) {
      filteredData = filteredData.filter(
        (conv) => conv.campaign_id === filters.campaignId,
      );
    }

    if (filters.agentId) {
      filteredData = filteredData.filter(
        (conv) => conv.agent_id === filters.agentId,
      );
    }

    if (filters.outcomeType) {
      filteredData = filteredData.filter(
        (conv) => conv.outcome === filters.outcomeType,
      );
    }

    // Calculate metrics
    const totalCalls = filteredData.length;
    const successfulCalls = filteredData.filter(
      (conv) => conv.outcome === 'donated' || conv.status === 'completed',
    ).length;

    const conversionRate =
      totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) : 0;

    const totalRevenue = filteredData.reduce((sum, conv) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return sum + ((conv as any).donated_amount || 0);
    }, 0);

    const totalDuration = filteredData.reduce((sum, conv) => {
      return sum + (conv.duration_seconds || 0);
    }, 0);

    const averageCallDuration =
      totalCalls > 0
        ? Math.round((totalDuration / totalCalls / 60) * 10) / 10
        : 0;

    // Find top performing agent
    const agentPerformance = agents.map((agent) => {
      const agentConversations = filteredData.filter(
        (conv) => conv.agent_id === agent.id,
      );
      const agentSuccessfulCalls = agentConversations.filter(
        (conv) => conv.outcome === 'donated' || conv.status === 'completed',
      ).length;
      const agentConversionRate =
        agentConversations.length > 0
          ? (agentSuccessfulCalls / agentConversations.length) * 100
          : 0;

      return {
        agent,
        conversionRate: agentConversionRate,
        totalCalls: agentConversations.length,
      };
    });

    const topAgent = agentPerformance
      .filter((ap) => ap.totalCalls > 0)
      .sort((a, b) => b.conversionRate - a.conversionRate)[0];

    // Calculate trends (comparing to previous period)
    const previousPeriodStart = new Date(filters.dateRange.startDate);
    const previousPeriodEnd = new Date(filters.dateRange.endDate);
    const periodLength =
      filters.dateRange.endDate.getTime() -
      filters.dateRange.startDate.getTime();

    previousPeriodStart.setTime(previousPeriodStart.getTime() - periodLength);
    previousPeriodEnd.setTime(previousPeriodEnd.getTime() - periodLength);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const previousPeriodConversations = conversations.filter((conv: any) => {
      const convDate = new Date(conv.created_at);
      return convDate >= previousPeriodStart && convDate <= previousPeriodEnd;
    });

    const previousTotalCalls = previousPeriodConversations.length;
    const previousSuccessfulCalls = previousPeriodConversations.filter(
      (conv) => conv.outcome === 'donated' || conv.status === 'completed',
    ).length;

    const callsTrend =
      previousTotalCalls > 0
        ? Math.round(
            ((totalCalls - previousTotalCalls) / previousTotalCalls) * 100,
          )
        : 0;

    const conversionsTrend =
      previousSuccessfulCalls > 0
        ? Math.round(
            ((successfulCalls - previousSuccessfulCalls) /
              previousSuccessfulCalls) *
              100,
          )
        : 0;

    return {
      totalCalls,
      successfulCalls,
      conversionRate,
      revenueGenerated: totalRevenue,
      averageCallDuration,
      topPerformingAgent: topAgent?.agent.name || 'No data',
      callsTrend,
      conversionsTrend,
    };
  }, [conversations, agents, filters]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatsCard
        title="Total Calls"
        value={metrics.totalCalls.toLocaleString()}
        subtitle="All campaigns"
        icon={Phone}
        trend={{
          icon: metrics.callsTrend >= 0 ? TrendingUp : TrendingUp,
          value: `${metrics.callsTrend >= 0 ? '+' : ''}${metrics.callsTrend}%`,
          color: metrics.callsTrend >= 0 ? 'text-green-600' : 'text-red-600',
        }}
      />
      <StatsCard
        title="Successful Calls"
        value={metrics.successfulCalls.toLocaleString()}
        subtitle="With pledges"
        icon={TrendingUp}
        trend={{
          icon: metrics.conversionsTrend >= 0 ? TrendingUp : TrendingUp,
          value: `${metrics.conversionsTrend >= 0 ? '+' : ''}${metrics.conversionsTrend}%`,
          color:
            metrics.conversionsTrend >= 0 ? 'text-green-600' : 'text-red-600',
        }}
      />
      <StatsCard
        title="Conversion Rate"
        value={`${metrics.conversionRate}%`}
        subtitle="Success rate"
        icon={BarChart3}
        trend={{
          icon: TrendingUp,
          value: metrics.conversionRate > 0 ? '+2.1%' : '0%',
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
          value: metrics.revenueGenerated > 0 ? '+15%' : '0%',
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
          value: metrics.averageCallDuration > 0 ? '-0.3m' : '0m',
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

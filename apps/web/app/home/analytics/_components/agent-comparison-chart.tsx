'use client';

import { Clock, DollarSign, TrendingUp, Users } from 'lucide-react';

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

// Mock data - replace with actual API call
const mockAgentData = [
  {
    agentId: '1',
    agentName: 'Sarah Johnson',
    totalCalls: 245,
    conversions: 67,
    conversionRate: 27.3,
    averageCallDuration: 4.2,
    revenue: 8200,
  },
  {
    agentId: '2',
    agentName: 'Mike Chen',
    totalCalls: 198,
    conversions: 52,
    conversionRate: 26.3,
    averageCallDuration: 3.8,
    revenue: 6400,
  },
  {
    agentId: '3',
    agentName: 'Emma Davis',
    totalCalls: 187,
    conversions: 48,
    conversionRate: 25.7,
    averageCallDuration: 4.5,
    revenue: 5900,
  },
  {
    agentId: '4',
    agentName: 'Alex Rodriguez',
    totalCalls: 156,
    conversions: 41,
    conversionRate: 26.3,
    averageCallDuration: 3.9,
    revenue: 5100,
  },
];

const sortOptions = [
  { value: 'conversionRate', label: 'Conversion Rate', icon: TrendingUp },
  { value: 'totalCalls', label: 'Total Calls', icon: Users },
  { value: 'revenue', label: 'Revenue', icon: DollarSign },
  { value: 'averageCallDuration', label: 'Call Duration', icon: Clock },
];

export function AgentComparisonChart({
  filters: _filters,
}: AgentComparisonChartProps) {
  // In a real implementation, you would sort based on user selection
  const sortedAgents = [...mockAgentData].sort(
    (a, b) => b.conversionRate - a.conversionRate,
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <CardTitle>Agent Performance</CardTitle>
          </div>
          <Select defaultValue="conversionRate">
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
                      {agent.totalCalls} calls • {agent.conversions} conversions
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
                  style={{ width: `${(agent.conversionRate / 30) * 100}%` }}
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
                    ${(agent.revenue / agent.conversions).toFixed(0)}/conv.
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        {sortedAgents.length > 0 && sortedAgents[0] && (
          <div className="mt-6 rounded-lg bg-green-50 p-3">
            <h4 className="mb-1 text-sm font-medium text-green-900">
              Top Performer
            </h4>
            <p className="text-xs text-green-700">
              {sortedAgents[0].agentName} leads with{' '}
              {sortedAgents[0].conversionRate.toFixed(1)}% conversion rate and $
              {sortedAgents[0].revenue.toLocaleString()} in revenue.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

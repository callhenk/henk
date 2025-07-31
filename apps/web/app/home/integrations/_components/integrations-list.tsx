'use client';

import { useMemo, useState } from 'react';

import {
  BarChart3,
  Calendar,
  CheckCircle,
  Database,
  Mail,
  Phone,
  Puzzle,
  Settings,
  Settings as SettingsIcon,
  Users,
} from 'lucide-react';

// Import our Supabase hooks
import type { Tables } from '@kit/supabase/database';
import { useIntegrations } from '@kit/supabase/hooks/integrations/use-integrations';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Switch } from '@kit/ui/switch';

import { StatsCard } from '~/components/shared';

type Integration = Tables<'integrations'>;

// Enhanced integration interface with UI-specific fields
interface EnhancedIntegration extends Integration {
  icon: React.ComponentType<{ className?: string }>;
  isPopular?: boolean;
  tags: string[];
}

// Icon mapping for different integration types
const getIntegrationIcon = (type: string) => {
  switch (type) {
    case 'crm':
      return Users;
    case 'payments':
      return Database;
    case 'marketing':
      return Mail;
    case 'communication':
      return Phone;
    case 'automation':
      return Settings;
    case 'scheduling':
      return Calendar;
    case 'analytics':
      return BarChart3;
    default:
      return Puzzle;
  }
};

// Get tags based on integration type and status
const getIntegrationTags = (integration: Integration): string[] => {
  const tags: string[] = [];

  if (integration.status === 'active') {
    tags.push('Connected');
  }

  if (integration.type === 'crm' || integration.type === 'payment') {
    tags.push('Popular');
  }

  return tags;
};

export function IntegrationsList() {
  // Fetch real data using our hooks
  const { data: integrations = [], isLoading: integrationsLoading } =
    useIntegrations();

  const [selectedCategory, setSelectedCategory] = useState('All');

  // Enhance integrations with UI-specific fields
  const enhancedIntegrations = useMemo(() => {
    return integrations.map(
      (integration) =>
        ({
          ...integration,
          icon: getIntegrationIcon(integration.type),
          isPopular:
            integration.type === 'crm' || integration.type === 'payment',
          tags: getIntegrationTags(integration),
        }) as EnhancedIntegration,
    );
  }, [integrations]);

  // Show loading state if data is still loading
  if (integrationsLoading) {
    return (
      <div className="space-y-6">
        {/* Loading Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="bg-muted mb-2 h-4 w-32 animate-pulse rounded" />
                <div className="bg-muted mb-2 h-3 w-24 animate-pulse rounded" />
                <div className="bg-muted h-8 w-16 animate-pulse rounded" />
              </CardHeader>
            </Card>
          ))}
        </div>
        {/* Loading Integrations List */}
        <Card>
          <CardHeader>
            <div className="bg-muted mb-2 h-6 w-48 animate-pulse rounded" />
            <div className="bg-muted h-4 w-64 animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="bg-muted mb-2 h-4 w-32 animate-pulse rounded" />
                    <div className="bg-muted mb-2 h-3 w-24 animate-pulse rounded" />
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted h-16 w-full animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const connectedIntegrations = enhancedIntegrations.filter(
    (int) => int.status === 'active',
  ).length;
  const availableIntegrations = enhancedIntegrations.length;
  const popularIntegrations = enhancedIntegrations.filter(
    (int) => int.isPopular,
  ).length;

  const filteredIntegrations =
    selectedCategory === 'All'
      ? enhancedIntegrations
      : enhancedIntegrations.filter(
          (int) => int.type === selectedCategory.toLowerCase(),
        );

  const categories = ['All', 'CRM', 'Payment', 'Email', 'Analytics', 'Other'];

  const handleToggle = (integrationId: string) => {
    // TODO: Implement actual integration toggle functionality
    console.log('Toggle integration:', integrationId);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Connected Integrations"
          value={connectedIntegrations}
          subtitle="Active connections"
          icon={CheckCircle}
        />
        <StatsCard
          title="Available Integrations"
          value={availableIntegrations}
          subtitle="Total integrations"
          icon={Puzzle}
        />
        <StatsCard
          title="Popular Integrations"
          value={popularIntegrations}
          subtitle="Most used tools"
          icon={BarChart3}
        />
      </div>

      {/* Integrations List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>
                Connect your favorite tools to streamline your fundraising
                workflow
              </CardDescription>
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent align="start">
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {filteredIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function IntegrationCard({
  integration,
  onToggle,
}: {
  integration: EnhancedIntegration;
  onToggle: (id: string) => void;
}) {
  const Icon = integration.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">{integration.name}</CardTitle>
              <div className="flex items-center space-x-2">
                {integration.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {integration.status === 'active' && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            <Switch
              checked={integration.status === 'active'}
              onCheckedChange={() => onToggle(integration.id)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 text-sm">
          {integration.description || 'No description available'}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">
            {integration.status === 'active' ? 'Connected' : 'Not Connected'}
          </span>
          {integration.status === 'active' && (
            <Button variant="outline" size="sm">
              <SettingsIcon className="mr-2 h-4 w-4" />
              Configure
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

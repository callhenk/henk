'use client';

import { useState } from 'react';

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

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { Switch } from '@kit/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';

import { StatsCard } from '~/components/shared';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  isConnected: boolean;
  isPopular?: boolean;
  tags: string[];
}

const mockIntegrations: Integration[] = [
  {
    id: 'salesforce',
    name: 'Salesforce CRM',
    description: 'Sync donor data and manage relationships',
    category: 'CRM',
    icon: Database,
    isConnected: true,
    isPopular: true,
    tags: ['CRM', 'Popular'],
  },
  {
    id: 'hubspot',
    name: 'HubSpot CRM',
    description: 'Customer relationship management platform',
    category: 'CRM',
    icon: Users,
    isConnected: false,
    isPopular: true,
    tags: ['CRM', 'Popular'],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Process donations and recurring payments',
    category: 'Payments',
    icon: Database,
    isConnected: true,
    isPopular: true,
    tags: ['Payments', 'Popular'],
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Alternative payment processing',
    category: 'Payments',
    icon: Database,
    isConnected: false,
    tags: ['Payments'],
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Email marketing and automation',
    category: 'Marketing',
    icon: Mail,
    isConnected: false,
    isPopular: true,
    tags: ['Marketing', 'Popular'],
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'SMS and voice communication platform',
    category: 'Communication',
    icon: Phone,
    isConnected: true,
    tags: ['Communication'],
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Automate workflows between apps',
    category: 'Automation',
    icon: Settings,
    isConnected: false,
    tags: ['Automation'],
  },
  {
    id: 'calendly',
    name: 'Calendly',
    description: 'Schedule follow-up appointments',
    category: 'Scheduling',
    icon: Calendar,
    isConnected: false,
    tags: ['Scheduling'],
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Track campaign performance and insights',
    category: 'Analytics',
    icon: BarChart3,
    isConnected: false,
    tags: ['Analytics'],
  },
];

const categories = [
  'All',
  'CRM',
  'Payments',
  'Marketing',
  'Communication',
  'Automation',
  'Scheduling',
  'Analytics',
];

export function IntegrationsList() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [integrations, setIntegrations] = useState(mockIntegrations);

  const connectedIntegrations = integrations.filter(
    (int) => int.isConnected,
  ).length;
  const availableIntegrations = integrations.length;
  const popularIntegrations = integrations.filter(
    (int) => int.isPopular,
  ).length;

  const filteredIntegrations =
    selectedCategory === 'All'
      ? integrations
      : integrations.filter((int) => int.category === selectedCategory);

  const handleToggle = (integrationId: string) => {
    setIntegrations((prev) =>
      prev.map((int) =>
        int.id === integrationId
          ? { ...int, isConnected: !int.isConnected }
          : int,
      ),
    );
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

      {/* Category Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>
            Connect your favorite tools to streamline your fundraising workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-8">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={selectedCategory} className="mt-6">
              <div className="grid gap-4 md:grid-cols-3">
                {filteredIntegrations.map((integration) => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function IntegrationCard({
  integration,
  onToggle,
}: {
  integration: Integration;
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
            {integration.isConnected && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            <Switch
              checked={integration.isConnected}
              onCheckedChange={() => onToggle(integration.id)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 text-sm">
          {integration.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">
            {integration.isConnected ? 'Connected' : 'Not Connected'}
          </span>
          {integration.isConnected && (
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

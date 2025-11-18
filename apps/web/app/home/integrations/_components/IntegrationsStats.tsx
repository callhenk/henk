'use client';

import { BarChart3, CheckCircle2, Puzzle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';

export function IntegrationsStats({
  connected,
  available,
  popular,
}: {
  connected: number;
  available: number;
  popular: number;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Stat
        title="Connected integrations"
        value={connected}
        icon={CheckCircle2}
        subtitle="Currently active"
      />
      <Stat
        title="Available integrations"
        value={available}
        icon={Puzzle}
        subtitle="Total providers"
      />
      <Stat
        title="Popular integrations"
        value={popular}
        icon={BarChart3}
        subtitle="Frequently used"
      />
    </div>
  );
}

function Stat({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className={'glass-panel'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{value}</div>
        {subtitle ? (
          <div className="text-muted-foreground mt-1 text-xs">{subtitle}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}

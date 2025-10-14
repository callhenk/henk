import type { ComponentProps } from 'react';

import { Badge } from '@kit/ui/badge';

import type { IntegrationStatus } from './types';

type BadgeVariant = ComponentProps<typeof Badge>['variant'];

export function StatusBadge({ status }: { status: IntegrationStatus }) {
  const { variant, label } = get(status);
  return <Badge variant={variant}>{label}</Badge>;
}

function get(status: IntegrationStatus): { variant: BadgeVariant; label: string } {
  switch (status) {
    case 'connected':
      return { variant: 'default', label: 'Connected' };
    case 'needs_attention':
      return { variant: 'outline', label: 'Needs attention' };
    case 'error':
      return { variant: 'destructive', label: 'Error' };
    case 'deprecated':
      return { variant: 'outline', label: 'Deprecated' };
    case 'disconnected':
    default:
      return { variant: 'secondary', label: 'Disconnected' };
  }
}



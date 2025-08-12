import { Badge } from '@kit/ui/badge';

import type { IntegrationStatus } from './types';

export function StatusBadge({ status }: { status: IntegrationStatus }) {
  const { variant, label } = get(status);
  return <Badge variant={variant as any}>{label}</Badge>;
}

function get(status: IntegrationStatus): { variant: string; label: string } {
  switch (status) {
    case 'connected':
      return { variant: 'default', label: 'Connected' };
    case 'needs_attention':
      return { variant: 'warning', label: 'Needs attention' } as any;
    case 'error':
      return { variant: 'destructive', label: 'Error' };
    case 'deprecated':
      return { variant: 'outline', label: 'Deprecated' };
    case 'disconnected':
    default:
      return { variant: 'secondary', label: 'Disconnected' };
  }
}



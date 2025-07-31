import { Badge } from '@kit/ui/badge';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig = {
  // Agent statuses
  active: {
    variant: 'default' as const,
    className:
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  inactive: {
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  },
  training: {
    variant: 'outline' as const,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  agent_paused: {
    variant: 'outline' as const,
    className:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  },
  // Campaign statuses
  draft: {
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  },
  campaign_paused: {
    variant: 'outline' as const,
    className:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  },
  campaign_completed: {
    variant: 'default' as const,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  // Lead statuses
  new: {
    variant: 'outline' as const,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  contacted: {
    variant: 'default' as const,
    className:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  },
  pledged: {
    variant: 'default' as const,
    className:
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  lead_failed: {
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
  // Conversation statuses
  ongoing: {
    variant: 'default' as const,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  'in-progress': {
    variant: 'default' as const,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  completed: {
    variant: 'default' as const,
    className:
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  failed: {
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
  'no-answer': {
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  },
  // Conversation outcomes
  donated: {
    variant: 'default' as const,
    className:
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  'callback-requested': {
    variant: 'default' as const,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  'no-interest': {
    variant: 'outline' as const,
    className:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  },
  busy: {
    variant: 'outline' as const,
    className:
      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  },
  // Sentiment
  positive: {
    variant: 'default' as const,
    className:
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  neutral: {
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  },
  negative: {
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
} as const;

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || {
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'agent_paused':
        return 'Paused';
      case 'campaign_paused':
        return 'Paused';
      case 'campaign_completed':
        return 'Completed';
      case 'lead_failed':
        return 'Failed';
      case 'callback-requested':
        return 'Callback Requested';
      case 'no-interest':
        return 'No Interest';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${className || ''}`}
    >
      {getStatusText(status)}
    </Badge>
  );
}

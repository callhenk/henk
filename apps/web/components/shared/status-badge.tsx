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
      'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',
  },
  inactive: {
    variant: 'secondary' as const,
    className:
      'bg-gray-50 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400',
  },
  training: {
    variant: 'outline' as const,
    className:
      'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  },
  agent_paused: {
    variant: 'outline' as const,
    className:
      'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400',
  },
  // Campaign statuses
  draft: {
    variant: 'secondary' as const,
    className:
      'bg-gray-50 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400',
  },
  campaign_paused: {
    variant: 'outline' as const,
    className:
      'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400',
  },
  campaign_completed: {
    variant: 'default' as const,
    className:
      'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  },
  // Lead statuses
  new: {
    variant: 'outline' as const,
    className:
      'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  },
  contacted: {
    variant: 'default' as const,
    className:
      'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400',
  },
  pledged: {
    variant: 'default' as const,
    className:
      'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',
  },
  lead_failed: {
    variant: 'destructive' as const,
    className: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  },
  // Conversation statuses
  ongoing: {
    variant: 'default' as const,
    className:
      'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  },
  'in-progress': {
    variant: 'default' as const,
    className:
      'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  },
  in_progress: {
    variant: 'default' as const,
    className:
      'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  },
  completed: {
    variant: 'default' as const,
    className:
      'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',
  },
  failed: {
    variant: 'destructive' as const,
    className: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  },
  'no-answer': {
    variant: 'secondary' as const,
    className:
      'bg-gray-50 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400',
  },
  // Conversation outcomes
  donated: {
    variant: 'default' as const,
    className:
      'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',
  },
  'callback-requested': {
    variant: 'default' as const,
    className:
      'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  },
  'no-interest': {
    variant: 'outline' as const,
    className:
      'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400',
  },
  busy: {
    variant: 'outline' as const,
    className:
      'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
  },
  // Sentiment
  positive: {
    variant: 'default' as const,
    className:
      'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',
  },
  neutral: {
    variant: 'secondary' as const,
    className:
      'bg-gray-50 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400',
  },
  negative: {
    variant: 'destructive' as const,
    className: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  },
} as const;

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || {
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  };

  const getStatusText = (status: string) => {
    // Handle specific cases with custom text
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
      case 'no-answer':
        return 'No Answer';
      default:
        // Convert snake_case or kebab-case to Title Case
        return status
          .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
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

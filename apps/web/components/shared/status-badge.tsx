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
  paused: {
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
  // Campaign statuses
  draft: {
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
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
  conversation_completed: {
    variant: 'default' as const,
    className:
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  conversation_failed: {
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
} as const;

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || {
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  };

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${className || ''}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

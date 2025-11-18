/**
 * Shared utility functions for badge styling and colors
 */

/**
 * Get Tailwind CSS classes for source badge based on integration type
 * @param source - Source/integration name (e.g., 'salesforce', 'hubspot', 'manual')
 * @returns Tailwind CSS classes for badge styling
 */
export function getSourceBadgeColor(source: string): string {
  const colors: Record<string, string> = {
    salesforce: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    hubspot:
      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    manual: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    csv: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    api: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  };

  return (
    colors[source.toLowerCase()] ||
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
  );
}

/**
 * Get Tailwind CSS classes for status badge
 * @param status - Status value (e.g., 'active', 'inactive', 'pending')
 * @returns Tailwind CSS classes for badge styling
 */
export function getStatusBadgeColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    pending:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    paused:
      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    scheduled:
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  };

  return (
    colors[status.toLowerCase()] ||
    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  );
}

/**
 * Get Tailwind CSS classes for priority badge
 * @param priority - Priority level (e.g., 'high', 'medium', 'low')
 * @returns Tailwind CSS classes for badge styling
 */
export function getPriorityBadgeColor(priority: string): string {
  const colors: Record<string, string> = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    medium:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  };

  return (
    colors[priority.toLowerCase()] ||
    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  );
}

/**
 * Get Tailwind CSS classes for campaign outcome badge
 * @param outcome - Campaign outcome (e.g., 'donated', 'not_interested', 'callback')
 * @returns Tailwind CSS classes for badge styling
 */
export function getOutcomeBadgeColor(outcome: string): string {
  const colors: Record<string, string> = {
    donated:
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    pledged: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    not_interested: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    callback:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    voicemail:
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    no_answer: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };

  return (
    colors[outcome.toLowerCase()] ||
    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  );
}

/**
 * Get Tailwind CSS classes for role badge
 * @param role - User role (e.g., 'owner', 'admin', 'member', 'viewer')
 * @returns Tailwind CSS classes for badge styling
 */
export function getRoleBadgeColor(role: string): string {
  const colors: Record<string, string> = {
    owner:
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    member: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };

  return (
    colors[role.toLowerCase()] ||
    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  );
}

/**
 * Shared utility functions for calculating metrics and statistics
 */

/**
 * Calculate conversion rate as a percentage
 * @param contacted - Number of contacts reached
 * @param conversions - Number of successful conversions
 * @returns Conversion rate as a percentage (0-100)
 */
export function getConversionRate(
  contacted: number,
  conversions: number,
): number {
  if (contacted === 0) return 0;
  return Math.round((conversions / contacted) * 100);
}

/**
 * Calculate success rate from conversations
 * @param totalCalls - Total number of calls made
 * @param successfulCalls - Number of successful calls
 * @returns Success rate as a percentage (0-100)
 */
export function calculateSuccessRate(
  totalCalls: number,
  successfulCalls: number,
): number {
  if (totalCalls === 0) return 0;
  return Math.round((successfulCalls / totalCalls) * 100);
}

/**
 * Calculate average call duration in minutes
 * @param conversations - Array of conversations with duration
 * @returns Average duration in minutes
 */
export function calculateAverageDuration(
  conversations: Array<{ duration?: number | null }>,
): number {
  if (conversations.length === 0) return 0;

  const totalDuration = conversations.reduce((sum, conv) => {
    return sum + (conv.duration || 0);
  }, 0);

  return Math.round(totalDuration / conversations.length);
}

/**
 * Format currency value
 * @param amount - Amount in cents or smallest currency unit
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency = 'USD',
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100);
}

/**
 * Calculate percentage change between two values
 * @param current - Current value
 * @param previous - Previous value
 * @returns Percentage change (can be negative)
 */
export function calculatePercentageChange(
  current: number,
  previous: number,
): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

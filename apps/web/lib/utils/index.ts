/**
 * Centralized exports for utility functions
 */

// Badge utilities
export {
  getSourceBadgeColor,
  getStatusBadgeColor,
  getPriorityBadgeColor,
  getOutcomeBadgeColor,
  getRoleBadgeColor,
} from './badges';

// Formatting utilities
export {
  formatDate,
  formatRelativeTime,
  formatPhoneNumber,
  formatDuration,
  truncateText,
  capitalize,
  formatNumber,
} from './formatting';

// Phone utilities
export {
  validateE164,
  maskE164,
  normalizeToE164,
  extractCountryCode,
  phoneNumbersMatch,
} from './phone';

// Metrics utilities
export {
  getConversionRate,
  calculateSuccessRate,
  calculateAverageDuration,
  formatCurrency,
  calculatePercentageChange,
} from './metrics';

// Logging utilities
export { logger, type LogContext } from './logger';

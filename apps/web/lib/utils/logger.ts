/**
 * Centralized logging utility
 * Provides consistent logging across the application with levels and context
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isTest = process.env.NODE_ENV === 'test';

  /**
   * Log debug messages (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment && !this.isTest) {
      this.log('debug', message, context);
    }
  }

  /**
   * Log informational messages
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  /**
   * Log error messages
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
    };

    this.log('error', message, errorContext);

    // In production, send to error tracking service
    if (!this.isDevelopment && !this.isTest) {
      // TODO: Integrate with error tracking service (e.g., Sentry)
      // this.sendToErrorTracking(message, errorContext);
    }
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, context?: LogContext): void {
    // Skip logging in test environment
    if (this.isTest) return;

    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      ...context,
    };

    // In development, use console with formatting
    if (this.isDevelopment) {
      const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
      const componentInfo = context?.component ? ` [${context.component}]` : '';
      const actionInfo = context?.action ? ` ${context.action}:` : '';

      switch (level) {
        case 'debug':
          console.debug(`${prefix}${componentInfo}${actionInfo}`, message, context || '');
          break;
        case 'info':
          console.info(`${prefix}${componentInfo}${actionInfo}`, message, context || '');
          break;
        case 'warn':
          console.warn(`${prefix}${componentInfo}${actionInfo}`, message, context || '');
          break;
        case 'error':
          console.error(`${prefix}${componentInfo}${actionInfo}`, message, context || '');
          break;
      }
    } else {
      // In production, log as JSON for log aggregation services
      console.log(JSON.stringify(logData));
    }
  }

  /**
   * Create a scoped logger with preset context
   */
  scope(defaultContext: LogContext): Logger {
    const scopedLogger = new Logger();
    const originalLog = scopedLogger.log.bind(scopedLogger);

    scopedLogger.log = (level: LogLevel, message: string, context?: LogContext) => {
      originalLog(level, message, { ...defaultContext, ...context });
    };

    return scopedLogger;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for context
export type { LogContext };

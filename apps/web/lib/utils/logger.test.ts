/**
 * Tests for logger utility
 *
 * Note: These tests verify the logger API and that it doesn't crash.
 * Detailed console output testing is skipped in test mode as the logger
 * intentionally suppresses output during tests.
 */

import { describe, expect, it } from 'vitest';

import { logger } from './logger';

describe('logger', () => {
  describe('API surface', () => {
    it('has debug method', () => {
      expect(logger.debug).toBeDefined();
      expect(() => logger.debug('test message')).not.toThrow();
      expect(() => logger.debug('test message', { component: 'Test' })).not.toThrow();
    });

    it('has info method', () => {
      expect(logger.info).toBeDefined();
      expect(() => logger.info('test message')).not.toThrow();
      expect(() => logger.info('test message', { component: 'Test' })).not.toThrow();
    });

    it('has warn method', () => {
      expect(logger.warn).toBeDefined();
      expect(() => logger.warn('test message')).not.toThrow();
      expect(() => logger.warn('test message', { component: 'Test' })).not.toThrow();
    });

    it('has error method', () => {
      expect(logger.error).toBeDefined();
      expect(() => logger.error('test message')).not.toThrow();
      expect(() => logger.error('test message', new Error('test'))).not.toThrow();
      expect(() => logger.error('test message', 'string error', { component: 'Test' })).not.toThrow();
    });

    it('has scope method', () => {
      expect(logger.scope).toBeDefined();
      const scopedLogger = logger.scope({ component: 'TestComponent' });
      expect(scopedLogger).toBeDefined();
      expect(scopedLogger.info).toBeDefined();
      expect(() => scopedLogger.info('test')).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('handles Error objects', () => {
      const error = new Error('test error');
      expect(() => logger.error('message', error, { component: 'Test' })).not.toThrow();
    });

    it('handles non-Error objects', () => {
      expect(() => logger.error('message', 'string error')).not.toThrow();
      expect(() => logger.error('message', 123)).not.toThrow();
      expect(() => logger.error('message', { custom: 'error' })).not.toThrow();
    });

    it('handles undefined error', () => {
      expect(() => logger.error('message', undefined)).not.toThrow();
    });
  });

  describe('context handling', () => {
    it('accepts context with various properties', () => {
      expect(() => logger.info('test', { component: 'Test', action: 'test', userId: '123' })).not.toThrow();
    });

    it('scoped logger merges contexts', () => {
      const scopedLogger = logger.scope({ component: 'Scoped' });
      expect(() => scopedLogger.info('test', { action: 'additional' })).not.toThrow();
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  generateFraudScore,
  getStatusFromScore,
  getStatusBgColor,
  generateMockReturns,
} from './fraudLogic';

describe('fraudLogic', () => {
  describe('generateFraudScore', () => {
    it('returns numbers in the expected range (1–100)', () => {
      for (let i = 0; i < 100; i++) {
        const score = generateFraudScore();
        expect(score).toBeGreaterThanOrEqual(1);
        expect(score).toBeLessThanOrEqual(100);
      }
    });

    it('returns integers only', () => {
      for (let i = 0; i < 50; i++) {
        const score = generateFraudScore();
        expect(Number.isInteger(score)).toBe(true);
      }
    });
  });

  describe('getStatusFromScore', () => {
    it('returns approved for low scores (≤70)', () => {
      expect(getStatusFromScore(1)).toBe('approved');
      expect(getStatusFromScore(50)).toBe('approved');
      expect(getStatusFromScore(70)).toBe('approved');
    });

    it('returns flagged for mid scores (71–90)', () => {
      expect(getStatusFromScore(71)).toBe('flagged');
      expect(getStatusFromScore(80)).toBe('flagged');
      expect(getStatusFromScore(90)).toBe('flagged');
    });

    it('returns rejected for high scores (>90)', () => {
      expect(getStatusFromScore(91)).toBe('rejected');
      expect(getStatusFromScore(95)).toBe('rejected');
      expect(getStatusFromScore(100)).toBe('rejected');
    });
  });

  describe('getStatusBgColor', () => {
    it('returns correct class names for approved', () => {
      expect(getStatusBgColor('approved')).toBe('bg-success/10 text-success border-success/20');
    });

    it('returns correct class names for flagged', () => {
      expect(getStatusBgColor('flagged')).toBe('bg-warning/10 text-warning border-warning/20');
    });

    it('returns correct class names for rejected', () => {
      expect(getStatusBgColor('rejected')).toBe('bg-destructive/10 text-destructive border-destructive/20');
    });

    it('returns correct class names for inspecting', () => {
      expect(getStatusBgColor('inspecting')).toBe('bg-primary/10 text-primary border-primary/20');
    });

    it('returns correct class names for pending and default', () => {
      expect(getStatusBgColor('pending')).toBe('bg-muted text-muted-foreground border-border');
      expect(getStatusBgColor('unknown')).toBe('bg-muted text-muted-foreground border-border');
    });
  });

  describe('generateMockReturns', () => {
    it('returns an array of the requested length', () => {
      expect(generateMockReturns(0)).toHaveLength(0);
      expect(generateMockReturns(1)).toHaveLength(1);
      expect(generateMockReturns(5)).toHaveLength(5);
      expect(generateMockReturns(100)).toHaveLength(100);
    });

    it('each item matches the ReturnItem shape', () => {
      const items = generateMockReturns(10);

      for (const item of items) {
        expect(item).toHaveProperty('id');
        expect(typeof item.id).toBe('string');
        expect(item.id).toMatch(/^RET-\d{4}$/);

        expect(item).toHaveProperty('customerName');
        expect(typeof item.customerName).toBe('string');

        expect(item).toHaveProperty('orderId');
        expect(typeof item.orderId).toBe('string');

        expect(item).toHaveProperty('itemName');
        expect(typeof item.itemName).toBe('string');

        expect(item).toHaveProperty('reason');
        expect(typeof item.reason).toBe('string');

        expect(item).toHaveProperty('returnType');
        expect(['refund', 'replacement']).toContain(item.returnType);

        expect(item).toHaveProperty('submittedAt');
        expect(item.submittedAt).toBeInstanceOf(Date);

        expect(item).toHaveProperty('fraudScore');
        expect(typeof item.fraudScore).toBe('number');
        expect(item.fraudScore).toBeGreaterThanOrEqual(1);
        expect(item.fraudScore).toBeLessThanOrEqual(100);

        expect(item).toHaveProperty('status');
        expect(['approved', 'flagged', 'rejected']).toContain(item.status);

        expect(item).toHaveProperty('inspectionStage');
        expect(typeof item.inspectionStage).toBe('number');

        expect(item).toHaveProperty('expiresAt');
        expect(item.expiresAt).toBeInstanceOf(Date);
      }
    });

    it('ids are unique within a batch', () => {
      const items = generateMockReturns(20);
      const ids = items.map((r) => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(20);
    });
  });
});

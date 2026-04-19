import { isInvoicePendingStatus } from './invoice-status';
import { describe, it, expect } from 'vitest';

describe('invoice-status', () => {
    it('returns true for pending-like statuses', () => {
        expect(isInvoicePendingStatus('PENDING')).toBe(true);
        expect(isInvoicePendingStatus('processing')).toBe(true);
        expect(isInvoicePendingStatus('IN_PROGRESS')).toBe(true);
    });

    it('returns false for final statuses', () => {
        expect(isInvoicePendingStatus('AUTHORIZED')).toBe(false);
        expect(isInvoicePendingStatus('REJECTED')).toBe(false);
        expect(isInvoicePendingStatus(undefined)).toBe(false);
    });
});

import {
    getSlotsForDay,
    doRangesOverlap,
    appointmentOverlapsSlot,
    getWeekDays,
    formatSlotLabel,
} from './agenda-utils';
import { describe, it, expect } from 'vitest';

describe('agenda-utils', () => {
    const jan1 = new Date(2026, 0, 1);

    describe('getSlotsForDay', () => {
        it('returns 30-min slots between 9 and 17 by default', () => {
            const slots = getSlotsForDay(jan1);
            expect(slots.length).toBe(16);
            expect(slots[0].start.getHours()).toBe(9);
            expect(slots[0].start.getMinutes()).toBe(0);
            expect(slots[slots.length - 1].end.getHours()).toBe(17);
        });

        it('respects custom start and end hour', () => {
            const slots = getSlotsForDay(jan1, 8, 12);
            expect(slots.length).toBe(8);
            expect(slots[0].start.getHours()).toBe(8);
            expect(slots[slots.length - 1].end.getHours()).toBe(12);
        });
    });

    describe('doRangesOverlap', () => {
        it('returns true when ranges overlap', () => {
            const start1 = new Date(2026, 0, 1, 10, 0);
            const end1 = new Date(2026, 0, 1, 11, 0);
            const start2 = new Date(2026, 0, 1, 10, 30);
            const end2 = new Date(2026, 0, 1, 11, 30);
            expect(doRangesOverlap(start1, end1, start2, end2)).toBe(true);
        });

        it('returns false when ranges do not overlap', () => {
            const start1 = new Date(2026, 0, 1, 10, 0);
            const end1 = new Date(2026, 0, 1, 10, 30);
            const start2 = new Date(2026, 0, 1, 10, 30);
            const end2 = new Date(2026, 0, 1, 11, 0);
            expect(doRangesOverlap(start1, end1, start2, end2)).toBe(false);
        });
    });

    describe('appointmentOverlapsSlot', () => {
        it('returns true when appointment overlaps slot', () => {
            const apptStart = new Date(2026, 0, 1, 10, 0);
            const apptEnd = new Date(2026, 0, 1, 10, 45);
            const slotStart = new Date(2026, 0, 1, 10, 30);
            const slotEnd = new Date(2026, 0, 1, 11, 0);
            expect(appointmentOverlapsSlot(apptStart, apptEnd, slotStart, slotEnd)).toBe(true);
        });

        it('returns false when appointment is before slot', () => {
            const apptStart = new Date(2026, 0, 1, 9, 0);
            const apptEnd = new Date(2026, 0, 1, 9, 30);
            const slotStart = new Date(2026, 0, 1, 10, 0);
            const slotEnd = new Date(2026, 0, 1, 10, 30);
            expect(appointmentOverlapsSlot(apptStart, apptEnd, slotStart, slotEnd)).toBe(false);
        });
    });

    describe('getWeekDays', () => {
        it('returns 7 days starting from week start (Monday by default)', () => {
            const days = getWeekDays(new Date(2026, 0, 5));
            expect(days.length).toBe(7);
            expect(days[0].getDay()).toBe(1);
        });
    });

    describe('formatSlotLabel', () => {
        it('formats time as HH:mm', () => {
            const d = new Date(2026, 0, 1, 14, 30);
            expect(formatSlotLabel(d)).toBe('14:30');
        });
    });
});

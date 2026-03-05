import {
    addMinutes,
    startOfDay,
    format,
    addDays,
    startOfWeek,
} from 'date-fns';

export const SLOT_DURATION_MINUTES = 30;
export const WORKDAY_START_HOUR = 9;
export const WORKDAY_END_HOUR = 17;

export interface TimeSlot {
    start: Date;
    end: Date;
    key: string;
}

export interface AppointmentSegment {
    id: string;
    start: Date;
    end: Date;
    top: number;
    height: number;
    [key: string]: unknown;
}

/**
 * Generate time slots for a day (e.g. 09:00 - 17:00 every 30 min).
 */
export function getSlotsForDay(
    date: Date,
    startHour = WORKDAY_START_HOUR,
    endHour = WORKDAY_END_HOUR,
    stepMinutes = SLOT_DURATION_MINUTES
): TimeSlot[] {
    const dayStart = startOfDay(date);
    const slots: TimeSlot[] = [];
    let current = new Date(dayStart);
    current.setHours(startHour, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(endHour, 0, 0, 0);

    while (current < dayEnd) {
        const end = addMinutes(current, stepMinutes);
        slots.push({
            start: new Date(current),
            end,
            key: current.toISOString(),
        });
        current = end;
    }
    return slots;
}

/**
 * Check if two time ranges overlap.
 */
export function doRangesOverlap(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date
): boolean {
    return start1 < end2 && end1 > start2;
}

/**
 * Check if an appointment overlaps with a slot (or any time range).
 */
export function appointmentOverlapsSlot(
    apptStart: Date,
    apptEnd: Date,
    slotStart: Date,
    slotEnd: Date
): boolean {
    return doRangesOverlap(apptStart, apptEnd, slotStart, slotEnd);
}

/**
 * Get the vertical position (0-100%) and height (%) for an appointment in a day column.
 */
export function getAppointmentStyle(
    apptStart: Date,
    apptEnd: Date,
    dayStart: Date,
    dayEnd: Date
): { top: number; height: number } {
    const dayStartMin = dayStart.getHours() * 60 + dayStart.getMinutes();
    const dayEndMin = dayEnd.getHours() * 60 + dayEnd.getMinutes();
    const total = dayEndMin - dayStartMin;
    const apptStartMin = apptStart.getHours() * 60 + apptStart.getMinutes();
    const apptEndMin = apptEnd.getHours() * 60 + apptEnd.getMinutes();
    const top = ((apptStartMin - dayStartMin) / total) * 100;
    const height = (Math.min(apptEndMin, dayEndMin) - Math.max(apptStartMin, dayStartMin)) / total * 100;
    return { top: Math.max(0, top), height: Math.max(0, Math.min(100 - top, height)) };
}

/**
 * Get days for week view (Mon–Sun or Sun–Sat).
 */
export function getWeekDays(baseDate: Date, weekStartsOn: 0 | 1 = 1): Date[] {
    const start = startOfWeek(baseDate, { weekStartsOn });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/**
 * Format slot label for display.
 */
export function formatSlotLabel(date: Date): string {
    return format(date, 'HH:mm');
}
